export interface RequestClock {
  requestStart: number;
  compressStart?: number;
  compressEnd?: number;
  responseHeadersEnd?: number;
  bodyReadEnd?: number;
  decompressEnd?: number;
  deserializeStart?: number;
}

export function mergeClockIntoResponse(response: any, clock: RequestClock) {
  // HACK: we assume any response with a `performance` property wants client
  // performance metrics merged into that object.
  if (response.performance === undefined || clock === undefined) {
    return;
  }
  const out: ClientPerformance = response.performance;

  const end = performance.now();
  out.client_total_ms = end - clock.requestStart;

  if (clock.compressStart !== undefined && clock.compressEnd !== undefined) {
    out.client_compress_ms = clock.compressEnd - clock.compressStart;
  }

  if (clock.responseHeadersEnd !== undefined && clock.requestStart !== undefined) {
    out.client_response_ms = clock.responseHeadersEnd - clock.requestStart;
  }

  if (clock.bodyReadEnd !== undefined && clock.responseHeadersEnd !== undefined) {
    out.client_body_read_ms = clock.bodyReadEnd - clock.responseHeadersEnd;
  }

  if (clock.decompressEnd !== undefined && clock.bodyReadEnd !== undefined) {
    out.client_decompress_ms = clock.decompressEnd - clock.bodyReadEnd;
  }

  if (clock.deserializeStart !== undefined) {
    out.client_deserialize_ms = end - clock.deserializeStart;
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
   *
   * WARNING: This parameter is only set when using the default fetch
   * implementation in Node and Deno.
   */
  client_response_ms?: number;
  /** Number of milliseconds between receiving the last response header from
   * the server and receiving the end of the response body from the server.
   *
   * WARNING: This parameter is only set when using the default fetch
   * implementation in Node and Deno.
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
