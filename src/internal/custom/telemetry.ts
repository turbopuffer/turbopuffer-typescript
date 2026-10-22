/**
 * Client telemetry reported to turbopuffer on subsequent requests.
 *
 * When enabled, the client buffers a small timing record for each request and attaches buffered records
 * to a later request in the `X-turbopuffer-Client-Telemetry` header. The server controls how many requests
 * are recorded by advertising a sample rate in the `X-turbopuffer-Client-Telemetry-Sample-Rate` response
 * header.
 *
 * Each recorded request is sent with an `X-Request-Id` that its record repeats, so the server can show the
 * client's timings in the same trace as its own.
 */

import { type Turbopuffer } from '../../client';
import {
  type AttemptResult,
  type ObservedRequest,
  type RequestInfo,
  type RequestObserver,
  type RequestResult,
  type RequestScope,
} from '../observer';
import { readEnv } from '../utils/env';
import { loggerFor } from '../utils/log';
import { computeDurations, mergeIntoPerformance, type Durations } from './performance';

export const TELEMETRY_ENV_VAR = 'TURBOPUFFER_TELEMETRY';
export const TELEMETRY_HEADER = 'X-turbopuffer-Client-Telemetry';
export const SAMPLE_RATE_HEADER = 'X-turbopuffer-Client-Telemetry-Sample-Rate';
/** Sorted by ASCII value, so that encoded IDs sort like their bytes. */
export const REQUEST_ID_ALPHABET = '234567abcdefghijklmnopqrstuvwxyz';
/**
 * The bytes in a request ID before it's encoded. The first `REQUEST_ID_RANDOM_BYTES` are random, and the
 * rest hold the time it was generated.
 */
export const REQUEST_ID_BYTES = 18;
/** The request header that carries the IDs of recorded requests. */
export const REQUEST_ID_HEADER = 'X-Request-Id';
/** The prefix of generated request IDs. */
export const REQUEST_ID_PREFIX = 'tpreq_';
/** The random bytes at the start of a request ID. */
export const REQUEST_ID_RANDOM_BYTES = 12;

const TELEMETRY_VERSION = 1;

// Keeps the header well under the 8 KB per-line limit of common proxies.
export const MAX_RECORDS_PER_HEADER = 16;
export const MAX_BUFFERED_RECORDS = 1000;

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['', '0', 'false', 'no', 'off']);

const NAMESPACE_RE = /^(\/v\d+\/namespaces\/)[^/?]+/;
const OPERATION_RE = /(\/operations\/)[^/?]+/;

/** Indirection so tests can control sampling. */
export const sampling = { random: Math.random };

/** Resolves whether telemetry is enabled, preferring an explicit value over the environment. */
export function resolveEnabled(value: boolean | undefined, client: Turbopuffer): boolean {
  if (value !== undefined) {
    return value;
  }

  const raw = readEnv(TELEMETRY_ENV_VAR) ?? '';
  const env = raw.toLowerCase();
  if (TRUE_VALUES.has(env)) {
    return true;
  }
  if (!FALSE_VALUES.has(env)) {
    loggerFor(client).warn(`Ignoring invalid ${TELEMETRY_ENV_VAR}=${JSON.stringify(raw)}, expected 1 or 0`);
  }
  return false;
}

/** Returns the method and path of a request with identifiers like the namespace replaced. */
export function routeTemplate(method: string, url: string): string {
  let path = url;
  if (path.includes('://')) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname + parsed.search;
    } catch {
      // Not a URL after all, so it's templated as is.
    }
  }
  path = path.replace(NAMESPACE_RE, '$1{ns}').replace(OPERATION_RE, '$1{token}');
  return `${method.toUpperCase()} ${path}`;
}

export type TelemetryRecord = { [key: string]: string | number | boolean };

type BufferedRecord = { recordedAt: number; record: TelemetryRecord };

/** Records taken from a buffer, encoded as a header value. */
export class TelemetryBatch {
  readonly header: string;

  constructor(
    readonly records: BufferedRecord[],
    readonly dropped: number,
  ) {
    const now = performance.now();
    const envelope: { version: number; records: TelemetryRecord[]; dropped?: number } = {
      version: TELEMETRY_VERSION,
      records: records.map(({ recordedAt, record }) => ({ ...record, age_ms: Math.round(now - recordedAt) })),
    };
    if (dropped) {
      envelope.dropped = dropped;
    }
    this.header = JSON.stringify(envelope);
  }
}

/** Buffers per-request telemetry records until a later request can carry them. */
export class TelemetryBuffer {
  private records: BufferedRecord[] = [];
  private dropped = 0;
  // Used until the server advertises a rate.
  private _sampleRate = 1;

  get sampleRate(): number {
    return this._sampleRate;
  }

  /** Adopts the sample rate advertised by the server, ignoring invalid values. */
  observeResponse(headers: Headers): void {
    const value = headers.get(SAMPLE_RATE_HEADER);
    if (value === null || value.trim() === '') {
      return;
    }
    const rate = Number(value);
    // Also rejects NaN, since every comparison with NaN is false.
    if (rate >= 0 && rate <= 1) {
      this._sampleRate = rate;
    }
  }

  /** Decides whether to record a request that's starting, returning the sample rate it's recorded at. */
  sample(): number | undefined {
    const rate = this._sampleRate;
    if (rate <= 0 || (rate < 1 && sampling.random() >= rate)) {
      return undefined;
    }
    return rate;
  }

  /** Buffers the record of a request sampled at `sampleRate`. `durations` are in milliseconds. */
  record({
    method,
    url,
    status,
    retries,
    durations,
    serverTotalMs,
    error,
    reused,
    requestId,
    sampleRate,
  }: {
    method: string;
    url: string;
    status: number;
    retries: number;
    durations: Durations;
    serverTotalMs?: number | undefined;
    error?: string | undefined;
    reused?: boolean | undefined;
    /** The `X-Request-Id` the request was sent with, when the client generated it. */
    requestId?: string | undefined;
    /** The rate `sample` returned as the request started. */
    sampleRate: number;
  }): void {
    const record: TelemetryRecord = { route: routeTemplate(method, url), status };
    if (error !== undefined) {
      record['error'] = error;
    }
    if (retries) {
      record['retries'] = retries;
    }
    if (requestId !== undefined) {
      record['request_id'] = requestId;
    }
    if (sampleRate < 1) {
      record['sample_rate'] = sampleRate;
    }
    for (const [name, duration] of Object.entries(durations)) {
      // Covered by the connection phases, so it's only kept for the public performance fields.
      if (name === 'response') {
        continue;
      }
      // A zero compress duration means the body wasn't compressed.
      if (name === 'compress' && duration === 0) {
        continue;
      }
      // The server rejects the whole header if any duration is negative.
      record[`${name}_us`] = Math.max(Math.floor(duration * 1000), 0);
    }
    if (serverTotalMs !== undefined) {
      record['server_total_us'] = Math.round(serverTotalMs * 1000);
    }
    if (reused !== undefined) {
      record['reused'] = reused;
    }

    if (this.records.length >= MAX_BUFFERED_RECORDS) {
      this.records.shift();
      this.dropped++;
    }
    this.records.push({ recordedAt: performance.now(), record });
  }

  /** Removes up to `MAX_RECORDS_PER_HEADER` of the oldest records. */
  take(): TelemetryBatch | undefined {
    if (this.records.length === 0) {
      return undefined;
    }
    const records = this.records.splice(0, MAX_RECORDS_PER_HEADER);
    const dropped = this.dropped;
    this.dropped = 0;
    return new TelemetryBatch(records, dropped);
  }

  /** Returns a batch that never reached the server to the front of the buffer. */
  restore(batch: TelemetryBatch): void {
    this.dropped += batch.dropped;
    for (let i = batch.records.length - 1; i >= 0; i--) {
      // The batch holds the oldest records, so they're the ones to drop when full.
      if (this.records.length >= MAX_BUFFERED_RECORDS) {
        this.dropped++;
        continue;
      }
      this.records.unshift(batch.records[i]!);
    }
  }
}

type Ref<T> = { deref(): T | undefined };

// Weak so that buffers go away with the last client using them. WeakRef is missing from older runtimes.
const WeakRefImpl: (new <T extends object>(value: T) => Ref<T>) | undefined = (globalThis as any).WeakRef;
const sharedBuffers = new Map<string, Ref<TelemetryBuffer>>();
const releasedBuffers =
  (globalThis as any).FinalizationRegistry ?
    new (globalThis as any).FinalizationRegistry((key: string) => {
      if (sharedBuffers.get(key)?.deref() === undefined) {
        sharedBuffers.delete(key);
      }
    })
  : undefined;

/**
 * Returns the buffer shared by clients with the same API key and base URL, or undefined if telemetry is
 * disabled.
 *
 * Sharing lets records ride on any client's requests, including copies, but never to another org or region.
 */
export function telemetryBuffer(
  enabled: boolean | undefined,
  apiKey: string,
  baseURL: string,
  client: Turbopuffer,
): TelemetryBuffer | undefined {
  if (!resolveEnabled(enabled, client)) {
    return undefined;
  }
  const key = JSON.stringify([apiKey, baseURL]);
  let buffer = sharedBuffers.get(key)?.deref();
  if (buffer === undefined) {
    buffer = new TelemetryBuffer();
    sharedBuffers.set(key, WeakRefImpl ? new WeakRefImpl(buffer) : { deref: () => buffer });
    releasedBuffers?.register(buffer, key);
  }
  return buffer;
}

/** Encodes `bytes` in base32 with `REQUEST_ID_ALPHABET`, in RFC 4648's bit order without padding. */
export function encodeBase32(bytes: Uint8Array): string {
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += REQUEST_ID_ALPHABET.charAt((buffer >> bits) & 31);
    }
    buffer &= (1 << bits) - 1;
  }
  if (bits > 0) {
    out += REQUEST_ID_ALPHABET.charAt((buffer << (5 - bits)) & 31);
  }
  return out;
}

/**
 * Generates the ID of a request that will be recorded, or undefined without a secure source of random
 * bytes. Its format is private to turbopuffer, which only links IDs in the format it expects: 12 random
 * bytes, then `now`, the 48-bit Unix time in milliseconds, XORed with the first 6 random bytes, in base32
 * after a prefix.
 */
export function newRequestId(
  now: number,
  random: Uint8Array | undefined = randomBytes(REQUEST_ID_RANDOM_BYTES),
): string | undefined {
  if (random === undefined) {
    return undefined;
  }
  const bytes = new Uint8Array(REQUEST_ID_BYTES);
  bytes.set(random);
  // The low bytes of the time, most significant first. Bitwise operators would truncate it to 32 bits.
  let millis = Math.max(Math.floor(now), 0);
  for (let i = REQUEST_ID_BYTES - 1; i >= REQUEST_ID_RANDOM_BYTES; i--) {
    bytes[i] = millis % 256 ^ random[i - REQUEST_ID_RANDOM_BYTES]!;
    millis = Math.floor(millis / 256);
  }
  return REQUEST_ID_PREFIX + encodeBase32(bytes);
}

/**
 * Random bytes from Web Crypto, which every supported runtime has. Without it there are none, so that
 * requests go without IDs rather than getting guessable ones.
 */
function randomBytes(length: number): Uint8Array | undefined {
  try {
    return (globalThis as any).crypto.getRandomValues(new Uint8Array(length));
  } catch {
    return undefined;
  }
}

/** Fills in client performance fields on responses, and records telemetry when enabled. */
export class TurbopufferObserver implements RequestObserver {
  constructor(readonly telemetry: TelemetryBuffer | undefined) {}

  start(info: RequestInfo): RequestScope {
    return new TurbopufferScope(this.telemetry, info);
  }
}

class TurbopufferScope implements RequestScope {
  // Kept for later attempts until one of them may have reached the server.
  private batch: TelemetryBatch | undefined;
  // Sent with every attempt, so retries share the request's trace.
  private requestId: string | undefined;
  // The rate the request is recorded at, or undefined if it isn't recorded.
  private readonly sampleRate: number | undefined;

  constructor(
    private readonly buffer: TelemetryBuffer | undefined,
    private readonly info: RequestInfo,
  ) {
    // Sampled up front, so that only requests whose records the server will get are sent with request IDs.
    this.sampleRate = buffer?.sample();
    if (this.sampleRate !== undefined) {
      this.requestId = newRequestId(Date.now());
    }
  }

  attemptBegin(attempt: number, request: ObservedRequest): void {
    // Taken only once a request is about to be sent, so one that fails before then can't lose it.
    if (attempt === 0) {
      this.batch = this.buffer?.take();
      // An ID set by the caller is theirs to use, so the request keeps it and isn't linked.
      if (request.init.headers.has(REQUEST_ID_HEADER)) {
        this.requestId = undefined;
      }
    }
    if (this.batch !== undefined) {
      request.init.headers.set(TELEMETRY_HEADER, this.batch.header);
    }
    if (this.requestId !== undefined) {
      request.init.headers.set(REQUEST_ID_HEADER, this.requestId);
    }
  }

  attemptEnd(result: AttemptResult): void {
    if (result.reachedServer !== false) {
      this.batch = undefined;
    }
    if (this.buffer !== undefined && result.response !== undefined) {
      this.buffer.observeResponse(result.response.headers);
    }
  }

  finish(result: RequestResult): void {
    const timings = result.timings;
    const durations = computeDurations(timings, timings.deserializeEnd ?? performance.now());
    mergeIntoPerformance(result.parsed, durations, timings);

    if (this.buffer === undefined) {
      return;
    }
    // A batch that never reached the server goes back for a later request.
    if (this.batch !== undefined) {
      this.buffer.restore(this.batch);
      this.batch = undefined;
    }
    // A rate of zero asks clients to stop recording, even requests that were already sampled.
    const sampleRate = this.sampleRate;
    if (sampleRate === undefined || this.buffer.sampleRate <= 0) {
      return;
    }

    let error: string | undefined;
    if (result.errorKind === 'canceled' || result.errorKind === 'other') {
      error = result.errorKind;
    } else if (result.errorKind !== undefined) {
      error = result.errorKind.endsWith('timeout') ? 'timeout' : 'connect';
    }
    const serverTotalMs = (
      result.parsed as { performance?: { server_total_ms?: unknown } } | null | undefined
    )?.performance?.server_total_ms;
    this.buffer.record({
      method: this.info.method,
      url: this.info.url,
      status: result.response?.status ?? 0,
      retries: result.retries,
      durations,
      serverTotalMs: typeof serverTotalMs === 'number' ? serverTotalMs : undefined,
      error,
      reused: timings.reused,
      requestId: this.requestId,
      sampleRate,
    });
  }
}
