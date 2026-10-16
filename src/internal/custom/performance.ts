import { type Timings } from '../observer';

export type Phase =
  | 'total'
  | 'serialize'
  | 'compress'
  | 'pool'
  | 'connect'
  | 'send'
  | 'wait'
  | 'response'
  | 'body_read'
  | 'deserialize';

/** Durations of an attempt's client-side phases in milliseconds. */
export type Durations = Partial<Record<Phase, number>>;

/** Returns the duration of each client-side phase of an attempt ending at `end`, leaving out unobserved ones. */
export function computeDurations(timings: Timings, end: number): Durations {
  const durations: Durations = {};
  if (timings.attemptBegin === undefined) {
    return durations;
  }
  durations.total = end - timings.attemptBegin;

  if (timings.serializeBegin !== undefined && timings.serializeEnd !== undefined) {
    durations.serialize = timings.serializeEnd - timings.serializeBegin;
  }

  // Set when building the request, which may compress its body.
  const compressBegin = timings.extra['compress_begin'];
  const compressEnd = timings.extra['compress_end'];
  if (compressBegin !== undefined && compressEnd !== undefined) {
    durations.compress = compressEnd - compressBegin;
  }

  // Waiting for a free connection, until connecting a new one or sending on a reused one. The body is
  // compressed before the request is handed to fetch, so the wait starts at whichever came last.
  const poolBegin =
    compressEnd === undefined ? timings.requestReady
    : timings.requestReady === undefined ? compressEnd
    : Math.max(compressEnd, timings.requestReady);
  const connectionReady = timings.connectBegin ?? timings.sendBegin;
  if (poolBegin !== undefined && connectionReady !== undefined) {
    durations.pool = Math.max(connectionReady - poolBegin, 0);
  }

  if (timings.connectBegin !== undefined && timings.connectEnd !== undefined) {
    durations.connect = timings.connectEnd - timings.connectBegin;
  }

  if (timings.sendBegin !== undefined && timings.sendEnd !== undefined) {
    durations.send = timings.sendEnd - timings.sendBegin;
  }

  // Covers the network round trip and the server. A body can finish sending after the headers arrive.
  if (timings.sendEnd !== undefined && timings.responseHeaders !== undefined) {
    durations.wait = Math.max(timings.responseHeaders - timings.sendEnd, 0);
  }

  if (timings.responseHeaders !== undefined) {
    durations.response = timings.responseHeaders - timings.attemptBegin;
  }

  if (timings.bodyEnd !== undefined && timings.responseHeaders !== undefined) {
    durations.body_read = timings.bodyEnd - timings.responseHeaders;
  }

  if (timings.deserializeBegin !== undefined && timings.deserializeEnd !== undefined) {
    durations.deserialize = timings.deserializeEnd - timings.deserializeBegin;
  }

  return durations;
}

/** Fills in the client performance fields of a parsed response from its durations. */
export function mergeIntoPerformance(parsed: unknown, durations: Durations, timings: Timings): void {
  // HACK: we assume any response with a `performance` property wants client
  // performance metrics merged into that object.
  const out = (parsed as { performance?: unknown } | null | undefined)?.performance as
    | Partial<ClientPerformance>
    | undefined;
  if (typeof out !== 'object' || out === null || durations.total === undefined) {
    return;
  }

  out.client_total_ms = durations.total;
  out.client_deserialize_ms = durations.deserialize ?? 0;

  if (durations.compress !== undefined) {
    out.client_compress_ms = durations.compress;
  }

  if (durations.response !== undefined) {
    out.client_response_ms = durations.response;
  }

  if (durations.body_read !== undefined) {
    out.client_body_read_ms = durations.body_read;
  }

  // Set by our Node fetch, which decompresses response bodies itself.
  const decompressBegin = timings.extra['decompress_begin'];
  const decompressEnd = timings.extra['decompress_end'];
  if (decompressBegin !== undefined && decompressEnd !== undefined) {
    out.client_decompress_ms = decompressEnd - decompressBegin;
  }
}

export interface ClientPerformance {
  /** Total request time in milliseconds, measured on the client.
   *
   * Note this only includes the time spent during the last retry.
   */
  client_total_ms: number;
  /** Number of milliseconds spent compressing the request on the client. */
  client_compress_ms?: number;
  /** Number of milliseconds between the start of the request and receiving the
   * last response header from the server.
   */
  client_response_ms?: number;
  /** Number of milliseconds between receiving the last response header from
   * the server and receiving the end of the response body from the server.
   */
  client_body_read_ms?: number;
  /** Number of milliseconds spent decompressing the response on the client.
   *
   * WARNING: This parameter is only set when using the default fetch
   * implementation in Node and Deno.
   */
  client_decompress_ms?: number;
  /** Number of milliseconds spent deserializing the response on the
   * client. */
  client_deserialize_ms?: number;
}
