import { gzip } from "pako";
import { version } from "../../package.json";
import type { RequestParams, RequestResponse, HTTPClient } from "../types";
import {
  TurbopufferError,
  statusCodeShouldRetry,
  delay,
  make_request_timing,
} from "../helpers";

function convertHeadersType(headers: Headers): Record<string, string> {
  const normalizedHeaders: Record<string, string> = {};
  for (const [key, value] of headers.entries()) {
    if (value === undefined) {
      continue;
    } else if (Array.isArray(value)) {
      normalizedHeaders[key] = value[0] as string;
    } else {
      normalizedHeaders[key] = value;
    }
  }
  return normalizedHeaders;
}

export default class DefaultHTTPClient implements HTTPClient {
  private baseUrl: string;
  private origin: URL;
  private apiKey: string;
  readonly userAgent = `tpuf-typescript/${version}/default`;
  private compression: boolean;

  constructor(
    baseUrl: string,
    apiKey: string,
    warmConnections: number,
    compression: boolean,
  ) {
    this.baseUrl = baseUrl;
    this.origin = new URL(baseUrl);
    this.origin.pathname = "";
    this.apiKey = apiKey;
    this.compression = compression;

    for (let i = 0; i < warmConnections; i++) {
      // send a small request to put some connections in the pool
      void fetch(this.baseUrl, {
        method: "HEAD",
        headers: { "User-Agent": this.userAgent },
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
    path = url.pathname;
    if (query) {
      path += "?" + url.search;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": this.userAgent,
    };

    if (this.compression) {
      headers["Accept-Encoding"] = "gzip";
    }

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    let requestCompressionDuration;
    let requestBody: Uint8Array | string | null = null;
    if (body && compress && this.compression) {
      headers["Content-Encoding"] = "gzip";
      const beforeRequestCompression = performance.now();
      requestBody = gzip(JSON.stringify(body));
      requestCompressionDuration = performance.now() - beforeRequestCompression;
    } else if (body) {
      requestBody = JSON.stringify(body);
    }

    const maxAttempts = retryable ? 3 : 1;
    let response!: Response;
    let error: TurbopufferError | Error | null = null;
    let request_start!: number;
    let response_start!: number;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      error = null;
      request_start = performance.now();
      try {
        response = await fetch(new URL(path, this.origin), {
          method,
          headers,
          body: requestBody,
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          error = e;
        } else {
          // not an Error? shouldn't happen but good to be thorough
          throw e;
        }
      }
      response_start = performance.now();

      if (!error && response.status >= 400) {
        let message: string | undefined = undefined;
        const body_text = await response.text();
        if (response.headers.get("content-type") === "application/json") {
          try {
            const body = JSON.parse(body_text);
            if (body && body.status === "error") {
              message = body.error;
            } else {
              message = body_text;
            }
          } catch (_: unknown) {
            /* empty */
          }
        } else {
          message = body_text;
        }
        error = new TurbopufferError(
          message ?? `http error ${response.status}`,
          {
            status: response.status,
          },
        );
      }
      if (
        error instanceof TurbopufferError &&
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
        headers: convertHeadersType(response.headers),
        request_timing: make_request_timing({ request_start, response_start }),
      };
    }

    const body_text = await response.text();

    const json = JSON.parse(body_text);
    const deserialize_end = performance.now();

    if (json.status && json.status === "error") {
      throw new TurbopufferError(json.error || (json as string), {
        status: response.status,
      });
    }

    return {
      body: json as T,
      headers: convertHeadersType(response.headers),
      request_timing: make_request_timing({
        request_start,
        response_start,
        deserialize_end,
        requestCompressionDuration,
      }),
    };
  }
}
