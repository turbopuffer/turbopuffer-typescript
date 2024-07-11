import type { Response } from "undici";
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

export interface RequestTiming {
  response_time: number;
  body_read_time: number;
}

export type RequestResponse<T> = Promise<{
  body?: T;
  headers: Headers;
  request_timing: RequestTiming;
}>;

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
  connectTimeout: number,
  idleTimeout: number,
  warmConnections: number
) =>
  new DefaultHTTPClient(
    baseUrl,
    apiKey,
    connectTimeout,
    idleTimeout,
    warmConnections
  );

class DefaultHTTPClient implements HTTPClient {
  private agent: Agent;
  private baseUrl: string;
  private apiKey: string;
  readonly userAgent = `tpuf-typescript/${version}`;

  constructor(
    baseUrl: string,
    apiKey: string,
    connectTimeout: number,
    idleTimeout: number,
    warmConnections: number
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    this.agent = new Agent({
      keepAliveTimeout: idleTimeout, // how long a socket can be idle for before it is closed
      keepAliveMaxTimeout: 24 * 60 * 60 * 1000, // maximum configurable timeout with server hint
      connect: {
        timeout: connectTimeout,
      },
    });

    for (let i = 0; i < warmConnections; i++) {
      // send a small request to put some connections in the pool
      void fetch(this.baseUrl, {
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
      "Accept-Encoding": "gzip",
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": this.userAgent,
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }

    let requestBody: Uint8Array | string | null = null;
    if (body && compress) {
      headers["Content-Encoding"] = "gzip";
      requestBody = pako.gzip(JSON.stringify(body));
    } else if (body) {
      requestBody = JSON.stringify(body);
    }

    const maxAttempts = retryable ? 3 : 1;
    let response!: Response;
    let error: TurbopufferError | null = null;
    let request_start!: number;
    let response_start!: number;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      error = null;
      request_start = performance.now();
      try {
        response = await fetch(url.toString(), {
          method,
          headers,
          body: requestBody,
          dispatcher: this.agent,
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.cause instanceof Error) {
            // wrap generic undici "fetch failed" error with the underlying cause
            error = new TurbopufferError(`fetch failed: ${e.cause.message}`, {
              cause: e,
            });
          } else {
            // wrap other errors directly
            error = new TurbopufferError(`fetch failed: ${e.message}`, {
              cause: e,
            });
          }
        } else {
          // not an Error? shouldn't happen but good to be thorough
          throw e;
        }
      }
      response_start = performance.now();

      if (!error && response.status >= 400) {
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
        statusCodeShouldRetry(error.status) &&
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

    if (method === "HEAD" || !response.body) {
      return {
        headers: response.headers,
        request_timing: make_request_timing(request_start, response_start),
      };
    }

    const json = (await response.json()) as any;
    if (json.status && json.status === "error") {
      throw new TurbopufferError(json.error || (json as string), {
        status: response.status,
      });
    }

    const response_end = performance.now();

    return {
      body: json as T,
      headers: response.headers,
      request_timing: make_request_timing(
        request_start,
        response_start,
        response_end
      ),
    };
  }
}

/** An error class for errors returned by the turbopuffer API. */
export class TurbopufferError extends Error {
  status?: number;
  constructor(
    public error: string,
    { status, cause }: { status?: number; cause?: Error }
  ) {
    super(error, { cause: cause });
    this.status = status;
  }
}

/** A helper function to determine if a status code should be retried. */
function statusCodeShouldRetry(statusCode?: number): boolean {
  return !statusCode || statusCode >= 500;
}

/** A helper function to delay for a given number of milliseconds. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function make_request_timing(
  request_start: number,
  response_start: number,
  response_end?: number
): RequestTiming {
  return {
    response_time: response_start - request_start,
    body_read_time: response_end ? response_end - response_start : 0,
  };
}
