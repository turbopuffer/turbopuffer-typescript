import type { Dispatcher } from "undici";
import { fetch, Agent } from "undici";
import { version } from "../package.json";
import { gunzip, gzip } from "node:zlib";
import { promisify } from "node:util";

const gunzipAsync = promisify(gunzip);
const gzipAsync = promisify(gzip);

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
  decompress_time: number;
  compress_time: number;
  deserialize_time: number;
}

export type RequestResponse<T> = Promise<{
  body?: T;
  headers: Record<string, string>;
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
  warmConnections: number,
  compression: boolean,
) =>
  new DefaultHTTPClient(
    baseUrl,
    apiKey,
    connectTimeout,
    idleTimeout,
    warmConnections,
    compression,
  );

class DefaultHTTPClient implements HTTPClient {
  private agent: Agent;
  private baseUrl: string;
  private origin: URL;
  private apiKey: string;
  readonly userAgent = `tpuf-typescript/${version}`;
  private compression: boolean;

  constructor(
    baseUrl: string,
    apiKey: string,
    connectTimeout: number,
    idleTimeout: number,
    warmConnections: number,
    compression: boolean,
  ) {
    this.baseUrl = baseUrl;
    this.origin = new URL(baseUrl);
    this.origin.pathname = "";
    this.apiKey = apiKey;
    this.compression = compression;

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
    path = url.pathname;
    if (query) {
      path += "?" + url.search;
    }

    const headers: Record<string, string> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${this.apiKey}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
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
      requestBody = await gzipAsync(JSON.stringify(body));
      requestCompressionDuration = performance.now() - beforeRequestCompression;
    } else if (body) {
      requestBody = JSON.stringify(body);
    }

    const maxAttempts = retryable ? 3 : 1;
    let response!: Dispatcher.ResponseData;
    let error: TurbopufferError | null = null;
    let request_start!: number;
    let response_start!: number;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      error = null;
      request_start = performance.now();
      try {
        response = await this.agent.request({
          origin: this.origin,
          path,
          method: method as Dispatcher.HttpMethod,
          headers,
          body: requestBody,
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

      if (!error && response.statusCode >= 400) {
        let message: string | undefined = undefined;
        const { body_text } = await consumeResponseText(response);
        if (response.headers["content-type"] === "application/json") {
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
          message ?? `http error ${response.statusCode}`,
          {
            status: response.statusCode,
          },
        );
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
        headers: convertHeadersType(response.headers),
        request_timing: make_request_timing(request_start, response_start),
      };
    }

    const { body_text, body_read_end, decompress_end } =
      await consumeResponseText(response);

    const json = JSON.parse(body_text);
    const deserialize_end = performance.now();

    if (json.status && json.status === "error") {
      throw new TurbopufferError(json.error || (json as string), {
        status: response.statusCode,
      });
    }

    return {
      body: json as T,
      headers: convertHeadersType(response.headers),
      request_timing: make_request_timing(
        request_start,
        response_start,
        body_read_end,
        decompress_end,
        deserialize_end,
        requestCompressionDuration,
      ),
    };
  }
}

/** An error class for errors returned by the turbopuffer API. */
export class TurbopufferError extends Error {
  status?: number;
  constructor(
    public error: string,
    { status, cause }: { status?: number; cause?: Error },
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
  body_read_end?: number,
  decompress_end?: number,
  deserialize_end?: number,
  requestCompressionDuration?: number,
): RequestTiming {
  return {
    response_time: response_start - request_start,
    body_read_time: body_read_end ? body_read_end - response_start : 0,
    compress_time: requestCompressionDuration ? requestCompressionDuration : 0,
    decompress_time:
      decompress_end && body_read_end ? decompress_end - body_read_end : 0,
    deserialize_time:
      deserialize_end && decompress_end ? deserialize_end - decompress_end : 0,
  };
}

function convertHeadersType(
  headers: Record<string, string | string[] | undefined>,
): Record<string, string> {
  for (const key in headers) {
    const v = headers[key];
    if (v === undefined) {
      delete headers[key];
    } else if (Array.isArray(v)) {
      headers[key] = v[0];
    }
  }
  return headers as Record<string, string>;
}

async function consumeResponseText(response: Dispatcher.ResponseData): Promise<{
  body_text: string;
  body_read_end: number;
  decompress_end: number;
}> {
  if (response.headers["content-encoding"] == "gzip") {
    const body_buffer = await response.body.arrayBuffer();
    const body_read_end = performance.now();

    const gunzip_buffer = await gunzipAsync(body_buffer);
    const body_text = gunzip_buffer.toString(); // is there a better way?
    const decompress_end = performance.now();
    return { body_text, body_read_end, decompress_end };
  } else {
    const body_text = await response.body.text();
    const body_read_end = performance.now();
    return { body_text, body_read_end, decompress_end: body_read_end };
  }
}
