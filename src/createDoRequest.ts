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

/**
 * This a curried helper function that returns a function for making fetch
 * requests against the API.
 *
 * @param baseUrl The base URL of the API endpoint.
 * @param apiKey The API key to use for authentication.
 *
 * @returns A function to make requests against the API.
 */
export const createDoRequest =
  <T>(baseUrl: string, apiKey: string) =>
  async ({
    method,
    path,
    query,
    body,
    compress,
    retryable,
  }: RequestParams): RequestResponse<T> => {
    const url = new URL(`${baseUrl}${path}`);
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
      Authorization: `Bearer ${apiKey}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "User-Agent": `tpuf-typescript/${version}`,
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
      });
      if (response.status >= 400) {
        let message: string | undefined = undefined;
        if (response.headers.get("Content-Type") === "application/json") {
          try {
            const body = await response.json();
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

    const json = await response.json();
    if (json.status && json.status === "error") {
      throw new TurbopufferError(json.error || (json as string), {
        status: response.status,
      });
    }

    return {
      body: json as T,
      headers: response.headers,
    };
  };

/** An error class for errors returned by the turbopuffer API. */
export class TurbopufferError extends Error {
  status?: number;
  constructor(
    public error: string,
    { status }: { status?: number }
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
