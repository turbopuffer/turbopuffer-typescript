import type { BodyInit, Response } from "undici";
import { fetch, Agent } from "undici";
import pako from "pako";
import { version } from "../package.json";

export interface RequestParams {
  method: string;
  path: string;
  query?: Record<string, string | undefined>;
  body?: unknown;
  compress?: boolean;
  retryable?: boolean;
}
export type RequestResponse<T> = Promise<{ body?: T; headers: Headers }>;

export interface HTTPClient {
  doRequest<T>(_: RequestParams): RequestResponse<T>;
}

/**
 * This a helper function that returns a class for making fetch requests
 * against the API.
 *
 * @param baseUrl The base URL of the API endpoint.
 * @param apiKey The API key to use for authentication.
 *
 * @returns An HTTPClient to make requests against the API.
 */
export const createHTTPClient = (
  baseUrl: string,
  apiKey: string,
  idleTimeout: number,
  warmConnections: number,
) => new DefaultHTTPClient(baseUrl, apiKey, idleTimeout, warmConnections);

class DefaultHTTPClient implements HTTPClient {
  private agent: Agent;
  private baseUrl: string;
  private apiKey: string;
  readonly userAgent = `tpuf-typescript/${version}`;

  constructor(
    baseUrl: string,
    apiKey: string,
    idleTimeout: number,
    warmConnections: number,
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    this.agent = new Agent({
      keepAliveTimeout: idleTimeout, // how long a socket can be idle for before it is closed
      keepAliveMaxTimeout: 24 * 60 * 60 * 1000, // maximum configurable timeout with server hint
    });

    for (var i = 0; i < warmConnections; i++) {
      // send a small request to put some connections in the pool
      fetch(this.baseUrl, {
        method: "HEAD",
        headers: { "User-Agent": this.userAgent },
        dispatcher: this.agent,
      });
    }
  }

  async doRequest<T>({
    method,
    path,
    query,
    body,
    compress,
    retryable,
  }: RequestParams): RequestResponse<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value) {
          url.searchParams.append(key, value);
        }
      });
    }

    const headers: Record<string, string> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Accept-Encoding": "gzip",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${this.apiKey}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "User-Agent": this.userAgent,
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }

    let requestBody: BodyInit | null = null;
    if (body && compress) {
      headers["Content-Encoding"] = "gzip";
      requestBody = pako.gzip(JSON.stringify(body));
    } else if (body) {
      requestBody = JSON.stringify(body);
    }

    const maxAttempts = retryable ? 3 : 1;
    let response!: Response;
    let error: TurbopufferError | null = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      response = await fetch(url.toString(), {
        method,
        headers,
        body: requestBody,
        dispatcher: this.agent,
      });
      if (response.status >= 400) {
        let message: string | undefined = undefined;
        if (response.headers.get("Content-Type") === "application/json") {
          try {
            const body = (await response.json()) as any;
            if (body && body.status === "error") {
              message = body.error;
            } else {
              message = JSON.stringify(body);
            }
          } catch (_: unknown) {
            /* empty */
          }
        } else {
          try {
            const body = await response.text();
            if (body) {
              message = body;
            }
          } catch (_: unknown) {
            /* empty */
          }
        }
        error = new TurbopufferError(message ?? response.statusText, {
          status: response.status,
        });
      }
      if (
        error &&
        statusCodeShouldRetry(response.status) &&
        attempt + 1 != maxAttempts
      ) {
        await delay(150 * (attempt + 1)); // 150ms, 300ms, 450ms
        continue;
      }
      break;
    }
    if (error) {
      throw error;
    }

    if (!response.body) {
      return {
        headers: response.headers,
      };
    }

    const json = (await response.json()) as any;
    if (json.status && json.status === "error") {
      throw new TurbopufferError(json.error || (json as string), {
        status: response.status,
      });
    }

    return {
      body: json as T,
      headers: response.headers,
    };
  }
}

/** An error class for errors returned by the turbopuffer API. */
export class TurbopufferError extends Error {
  status?: number;
  constructor(
    public error: string,
    { status }: { status?: number },
  ) {
    super(error);
    this.status = status;
  }
}

/** A helper function to determine if a status code should be retried. */
function statusCodeShouldRetry(statusCode: number): boolean {
  return statusCode >= 500;
}

/** A helper function to delay for a given number of milliseconds. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
