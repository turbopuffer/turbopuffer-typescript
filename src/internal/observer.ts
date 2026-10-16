/**
 * Hooks for observing the requests a client makes, such as to record their timings.
 *
 * An observer is called synchronously at fixed points of each request, so it must be cheap. Anything
 * it throws is logged and ignored, so it can never break a request.
 */

import type { Turbopuffer } from '../client';
import { APIConnectionError, APIConnectionTimeoutError, APIError, APIUserAbortError } from '../core/error';
import type { Fetch } from './builtin-types';
import { isAbortError } from './errors';
import type { FinalRequestOptions } from './request-options';
import type { FinalizedRequestInit } from './types';
import { loggerFor } from './utils/log';

export type ErrorKind =
  | 'pool_timeout'
  | 'connect_timeout'
  | 'connect_error'
  | 'write_timeout'
  | 'read_timeout'
  | 'read_error'
  | 'timeout'
  | 'canceled'
  | 'other';

/**
 * Timestamps from `performance.now()` marking the progress of one attempt.
 *
 * A mark stays unset when its phase didn't happen or couldn't be observed, e.g. `connectStart` on a
 * reused connection. Connection phases are only traced through undici's diagnostics channels, such as on
 * Node, and only when the client uses its own fetch. Phases may overlap.
 */
export interface Timings {
  /** The attempt began, before the request was built. */
  attemptStart?: number | undefined;
  serializeStart?: number | undefined;
  serializeEnd?: number | undefined;
  /** The request was built and handed to fetch. */
  requestReady?: number | undefined;
  /** Opening a new connection: DNS, TCP and TLS. */
  connectStart?: number | undefined;
  connectEnd?: number | undefined;
  /** Writing the request headers and body. */
  sendStart?: number | undefined;
  sendEnd?: number | undefined;
  responseHeaders?: number | undefined;
  bodyEnd?: number | undefined;
  /** Parsing the response body. Only on the final attempt. */
  deserializeStart?: number | undefined;
  deserializeEnd?: number | undefined;
  /** Whether the attempt used an existing connection, unset when unknown. */
  reused?: boolean | undefined;
  /** Marks added by custom code, such as fetch implementations that compress request bodies. */
  extra: Record<string, number>;
}

/** Describes a request as it starts. */
export interface RequestInfo {
  method: string;
  /** The path the request was made with, e.g. `/v1/things/abc`, without query params from request params. */
  url: string;
}

/** A request as it's handed to fetch. */
export interface ObservedRequest {
  url: string;
  init: FinalizedRequestInit;
}

/** The outcome of one attempt of a request. */
export interface AttemptResult {
  /** 0-based. */
  attempt: number;
  request: ObservedRequest;
  response: Response | undefined;
  error: unknown;
  errorKind: ErrorKind | undefined;
  /** False when the attempt certainly never reached the server, true when a response arrived, and unset when unknown. */
  reachedServer: boolean | undefined;
  timings: Timings;
}

/** The final outcome of a request. */
export interface RequestResult {
  /** The number of retries made, which is also the final attempt's index. */
  retries: number;
  response: Response | undefined;
  /** For an error response it's the API error, which has no `errorKind`. */
  error: unknown;
  errorKind: ErrorKind | undefined;
  /** The parsed response body, or undefined if it wasn't parsed. */
  parsed: unknown;
  /** The final attempt's. */
  timings: Timings;
}

/** Observes one request across its attempts. */
export interface RequestScope {
  /** Called before each attempt is sent. May change the request's headers. */
  attemptBegin?(attempt: number, request: ObservedRequest): void;

  /** Called after each attempt, before its response body is read. */
  attemptEnd?(result: AttemptResult): void;

  /**
   * Called at most once, after the response is parsed or when the request fails for good. Responses whose
   * body the caller reads itself, such as from `asResponse()`, don't finish.
   */
  finish?(result: RequestResult): void;
}

/** Observes a client's requests. Shared by concurrent requests, so per request state belongs on the scope. */
export interface RequestObserver {
  /** Called once per request, before its first attempt. Returns a scope to observe it, or nothing. */
  start(info: RequestInfo): RequestScope | null | undefined;
}

/**
 * Marks `fetch` as the client's own, so the connections of requests made through it may be traced.
 * A fetch the user supplies isn't traced, since its requests can't be attributed reliably.
 */
export function traceableFetch(fetch: Fetch): Fetch {
  traceableFetches.add(fetch);
  return fetch;
}

/**
 * Returns the timings of the attempt whose fetch is being called. Custom fetch implementations can call
 * it synchronously, before awaiting anything, to add marks.
 */
export function dispatchTimings(): Timings | undefined {
  return dispatching?.timings;
}

/** Drives one request's scope through its attempts. Does nothing when there's no scope. */
export class RequestObservation {
  private attempt = 0;
  private request: ObservedRequest | undefined;
  private response: Response | undefined;
  private trace: AttemptTrace | undefined;
  private inFlight = false;
  private finished = false;
  private attemptTimings: Timings = { extra: {} };

  private constructor(
    private readonly client?: Turbopuffer,
    private readonly scope?: RequestScope,
    private readonly signal?: AbortSignal | null | undefined,
  ) {}

  /** An observation of a request that isn't observed. */
  static readonly none: RequestObservation = new RequestObservation();

  /** Starts observing a request, returning an observation that does nothing when it isn't observed. */
  static start(
    client: Turbopuffer,
    observer: RequestObserver | undefined,
    options: FinalRequestOptions,
  ): RequestObservation {
    if (!observer) return RequestObservation.none;
    const scope = call(client, () => observer.start({ method: options.method, url: options.path }));
    return scope ? new RequestObservation(client, scope, options.signal) : RequestObservation.none;
  }

  /** The current attempt's timings, or undefined when the request isn't observed. */
  get timings(): Timings | undefined {
    return this.scope ? this.attemptTimings : undefined;
  }

  startAttempt(attempt: number): void {
    if (!this.scope) return;
    this.attempt = attempt;
    this.request = undefined;
    this.response = undefined;
    this.trace = undefined;
    this.attemptTimings = { attemptStart: performance.now(), extra: {} };
  }

  beforeSend(url: string, init: FinalizedRequestInit): void {
    const scope = this.scope;
    if (!scope) return;
    this.attemptTimings.requestReady = performance.now();
    const request = { url, init };
    this.request = request;
    this.inFlight = true;
    call(this.client!, () => scope.attemptBegin?.(this.attempt, request));
  }

  /**
   * Calls `send`, which must call `fetch` synchronously. Requests that undici creates while `send` runs
   * are traced when `fetch` is the client's own.
   */
  dispatch<T>(fetch: Fetch, send: () => T): T {
    if (!this.scope || !this.request) return send();
    const trace = new AttemptTrace(
      this.attemptTimings,
      String(this.request.init.method ?? 'get').toUpperCase(),
      this.request.url,
      traceableFetches.has(fetch) && subscribe(),
    );
    this.trace = trace;
    const previous = dispatching;
    dispatching = trace;
    try {
      return send();
    } finally {
      dispatching = previous;
    }
  }

  onResponse(response: Response): void {
    if (!this.scope || !this.inFlight) return;
    this.attemptTimings.responseHeaders ??= performance.now();
    this.response = response;
    this.attemptEnd(response, undefined, undefined, true);
  }

  /** Called when an attempt fails and will be retried. */
  onError(cause: unknown): void {
    if (!this.scope || !this.inFlight) return;
    this.afterError(cause);
  }

  /** Ends the request with `error`, caused by `cause` when the current attempt failed. Returns `error`. */
  fail<E>(error: E, cause: unknown = error): E {
    if (!this.scope || this.finished) return error;
    let kind: ErrorKind | undefined =
      this.inFlight ? this.afterError(cause) : errorKind(cause, this.canceled());
    // An error response is described by the response itself.
    if (error instanceof APIError && typeof error.status === 'number') kind = undefined;
    this.end(this.response, error, kind, undefined);
    return error;
  }

  /** Marks the response body as read, unless custom code that read it already did. */
  bodyRead(): void {
    if (!this.scope) return;
    this.attemptTimings.bodyEnd ??= performance.now();
  }

  /** Marks the response body as read and parsing as started. */
  startParse(): void {
    if (!this.scope || this.finished) return;
    this.bodyRead();
    this.attemptTimings.deserializeStart = performance.now();
  }

  /** Ends the request with an error from reading or parsing the body of `response`. */
  parseFailed(response: Response, error: unknown): void {
    if (!this.scope || this.finished) return;
    const parsing = this.attemptTimings.deserializeStart !== undefined;
    this.end(response, error, parsing ? 'other' : errorKind(error, this.canceled(), 'read'), undefined);
  }

  /**
   * Passes on the final response when custom code replaces it, such as by polling for the result of an
   * accepted request.
   */
  replaceResponse(response: Response): void {
    if (!this.scope) return;
    this.response = response;
  }

  /** Ends the request once its response was parsed. */
  finish(response: Response, parsed: unknown): void {
    if (!this.scope || this.finished) return;
    this.end(response, undefined, undefined, parsed);
  }

  private canceled(): boolean {
    return !!this.signal?.aborted;
  }

  private afterError(cause: unknown): ErrorKind {
    const phase = this.trace?.phase();
    const kind = errorKind(cause, this.canceled(), phase);
    const neverSent =
      phase === 'pool' || phase === 'connect' || kind === 'connect_error' || kind === 'connect_timeout';
    this.attemptEnd(undefined, cause, kind, neverSent ? false : undefined);
    return kind;
  }

  private attemptEnd(
    response: Response | undefined,
    error: unknown,
    errorKind: ErrorKind | undefined,
    reachedServer: boolean | undefined,
  ): void {
    this.inFlight = false;
    const scope = this.scope!;
    const result: AttemptResult = {
      attempt: this.attempt,
      request: this.request!,
      response,
      error,
      errorKind,
      reachedServer,
      timings: this.attemptTimings,
    };
    call(this.client!, () => scope.attemptEnd?.(result));
  }

  private end(
    response: Response | undefined,
    error: unknown,
    errorKind: ErrorKind | undefined,
    parsed: unknown,
  ): void {
    this.finished = true;
    const timings = this.attemptTimings;
    if (timings.deserializeStart !== undefined) {
      timings.deserializeEnd = performance.now();
    }
    const scope = this.scope!;
    const result: RequestResult = { retries: this.attempt, response, error, errorKind, parsed, timings };
    call(this.client!, () => scope.finish?.(result));
  }
}

function call<T>(client: Turbopuffer, fn: () => T): T | undefined {
  try {
    return fn();
  } catch (err) {
    loggerFor(client).warn('Request observer threw an error', err);
    return undefined;
  }
}

type Phase = 'pool' | 'connect' | 'write' | 'read';

// Error codes from Node and undici that say what failed.
const connectErrorCodes = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EADDRNOTAVAIL',
]);
const readTimeoutCodes = new Set(['UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT']);
const resetCodes = new Set(['ECONNRESET', 'EPIPE', 'UND_ERR_SOCKET']);

/**
 * Classifies why a request failed. The client's own connection errors are classified by their cause,
 * and aborts that the caller didn't ask for are the client's timeouts. `phase` is how far the attempt
 * got, when that's known.
 */
export function errorKind(err: unknown, canceled: boolean, phase?: Phase | undefined): ErrorKind {
  if (canceled || err instanceof APIUserAbortError) return 'canceled';
  const cause = (err as { cause?: unknown } | null)?.cause;
  if (err instanceof APIConnectionError && !(err instanceof APIConnectionTimeoutError) && cause) {
    err = cause;
  }

  const code = errorCode(err);
  if (code === 'UND_ERR_CONNECT_TIMEOUT') return 'connect_timeout';
  if (code !== undefined && readTimeoutCodes.has(code)) return 'read_timeout';
  if (code !== undefined && connectErrorCodes.has(code)) return 'connect_error';
  if (code !== undefined && resetCodes.has(code)) {
    return phase === 'pool' || phase === 'connect' ? 'connect_error' : 'read_error';
  }

  const timeout =
    err instanceof APIConnectionTimeoutError ||
    isAbortError(err) ||
    code === 'ETIMEDOUT' ||
    /timed? ?out/i.test(String(err) + String((err as { cause?: unknown } | null)?.cause ?? ''));
  if (timeout) return phase ? `${phase}_timeout` : 'timeout';
  if (phase === 'pool' || phase === 'connect') return 'connect_error';
  if (phase === 'read') return 'read_error';
  return 'other';
}

function errorCode(err: unknown): string | undefined {
  for (let depth = 0; depth < 4 && typeof err === 'object' && err !== null; depth++) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === 'string') return code;
    err = (err as { cause?: unknown }).cause;
  }
  return undefined;
}

/**
 * Follows an attempt through undici's diagnostics channels.
 *
 * Diagnostics events carry undici's request, but not which fetch call made it. undici creates the request
 * synchronously when fetch is called, so a request created while an attempt is dispatching belongs to it.
 * Later events for that request are matched by identity. Connection events don't name a request, so a
 * connection is matched to an attempt by the socket its request is sent on. undici sends the first
 * request on a new socket over the connection that was opened for it, so that request didn't reuse a
 * connection, and every later one did.
 */
class AttemptTrace {
  /** When undici created the attempt's request. */
  created: number | undefined;
  /** When undici began a connection while dispatching the attempt's request. */
  connectStart: number | undefined;

  constructor(
    readonly timings: Timings,
    readonly method: string,
    readonly url: string,
    readonly traced: boolean,
  ) {}

  phase(): Phase | undefined {
    if (this.created === undefined) return undefined;
    if (this.timings.sendStart === undefined) return this.connectStart !== undefined ? 'connect' : 'pool';
    if (this.timings.sendEnd === undefined) return 'write';
    return 'read';
  }
}

type UndiciRequest = { method?: unknown; path?: unknown };
type DiagnosticsChannel = { subscribe(name: string, onMessage: (message: any) => void): void };

let dispatching: AttemptTrace | undefined;
let subscribed: boolean | undefined;
const traceableFetches = new WeakSet<Fetch>();
const traces = new WeakMap<object, AttemptTrace>();
const connectedAt = new WeakMap<object, number>();
// Sockets that haven't sent a request yet.
const freshSockets = new WeakSet<object>();

/** Subscribes to undici's diagnostics channels once, returning whether they're available. */
function subscribe(): boolean {
  if (subscribed !== undefined) return subscribed;
  subscribed = false;
  let dc: DiagnosticsChannel | undefined;
  try {
    // Loaded at runtime so that bundlers and runtimes without it never see an import.
    const process = (globalThis as any).process;
    if (typeof process?.getBuiltinModule === 'function') {
      dc = process.getBuiltinModule('node:diagnostics_channel');
    }
  } catch {
    // Not Node.
  }
  if (typeof dc?.subscribe !== 'function') return subscribed;

  dc.subscribe('undici:request:create', ({ request }: { request: UndiciRequest }) => {
    const trace = dispatching;
    if (!trace?.traced || trace.created !== undefined) return;
    // Guards against a request undici creates for something else, such as a proxy tunnel.
    if (String(request.method).toUpperCase() !== trace.method || !trace.url.endsWith(String(request.path))) {
      return;
    }
    trace.created = performance.now();
    traces.set(request, trace);
  });
  dc.subscribe('undici:client:beforeConnect', () => {
    const trace = dispatching;
    if (trace?.created !== undefined) trace.connectStart ??= performance.now();
  });
  dc.subscribe('undici:client:connected', ({ socket }: { socket: object }) => {
    connectedAt.set(socket, performance.now());
    freshSockets.add(socket);
  });
  dc.subscribe(
    'undici:client:sendHeaders',
    ({ request, socket }: { request: UndiciRequest; socket: object }) => {
      const fresh = freshSockets.delete(socket);
      const trace = traces.get(request);
      if (!trace) return;
      const timings = trace.timings;
      timings.sendStart = performance.now();
      timings.reused = !fresh;
      if (fresh) {
        // undici connects while dispatching unless the request has a streamed body, which it waits a tick for.
        timings.connectStart = trace.connectStart ?? trace.created;
        timings.connectEnd = connectedAt.get(socket);
      }
    },
  );
  dc.subscribe('undici:request:bodySent', ({ request }: { request: UndiciRequest }) => {
    const trace = traces.get(request);
    if (trace) trace.timings.sendEnd = performance.now();
  });
  dc.subscribe('undici:request:headers', ({ request }: { request: UndiciRequest }) => {
    const trace = traces.get(request);
    if (trace) trace.timings.responseHeaders = performance.now();
  });
  dc.subscribe('undici:request:trailers', ({ request }: { request: UndiciRequest }) => {
    const trace = traces.get(request);
    if (trace) trace.timings.bodyEnd ??= performance.now();
  });
  subscribed = true;
  return subscribed;
}
