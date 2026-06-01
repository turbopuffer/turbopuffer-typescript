/**
 * Transparent polling for tpuf APIs that accept `prefer: respond-async`.
 *
 * Every API request is stamped with `prefer: respond-async`. If the server
 * applies the preference (i.e. responds with `202 Accepted` +
 * `preference-applied: respond-async`) the SDK polls the operation URL
 * until it finishes and returns the final result as if the call had been
 * synchronous.
 */

import { type Turbopuffer } from '../../client';
import * as Errors from '../../core/error';
import { buildHeaders } from '../headers';
import { type RequestClock } from './performance';
import { type FinalRequestOptions } from '../request-options';
import { sleep } from '../utils/sleep';

const HEADER_PREFER = 'prefer';
const HEADER_PREFERENCE_APPLIED = 'preference-applied';
const HEADER_LOCATION = 'location';
const RESPOND_ASYNC = 'respond-async';

/** tunables; mutable so tests can override */
export const config = {
  pollIntervalMs: 1000,
  pollRequestTimeoutMs: 60_000,
};

export function prepareOptions(options: FinalRequestOptions): void {
  const normalized = buildHeaders([options.headers]);

  // Don't overwrite an existing `prefer` header. This allows the caller to disable async mode.
  if (normalized.values.has(HEADER_PREFER) || normalized.nulls.has(HEADER_PREFER)) {
    return;
  }

  normalized.values.set(HEADER_PREFER, RESPOND_ASYNC);
  options.headers = normalized;
}

export async function maybePoll(
  client: Turbopuffer,
  response: Response,
  requestURL: string,
  options: FinalRequestOptions,
  clock: RequestClock,
): Promise<Response> {
  if (!respondAsyncApplied(response)) return response;

  const location = extractLocation(response, requestURL);
  const timeout = new Timeout(options.timeout ?? client.timeout);

  while (true) {
    if (timeout.remainingMs() === 0) {
      throw new Errors.APIConnectionTimeoutError();
    }

    const poll = await client.get<PollBody>(location, {
      headers: { [HEADER_PREFER]: null },
      timeout: timeout.pollTimeoutMs(),
      signal: options.signal,
    });

    const resp = resolvePollResponse(poll, clock);
    if (resp) return resp;

    await sleep(timeout.sleepDurationMs());
  }
}

function extractLocation(response: Response, origURL: string): string {
  const rawLocation = response.headers.get(HEADER_LOCATION);
  if (!rawLocation) {
    throw new Errors.TurbopufferError("server returned async response without a 'Location' header");
  }

  // Resolve the Location against the original request URL.
  let resolved: URL;
  try {
    resolved = new URL(rawLocation, origURL);
  } catch {
    throw new Errors.TurbopufferError(`malformed 'Location' header: ${rawLocation}`);
  }

  // Reject a Location pointing at a different origin, to prevent API key exfiltration.
  const requestOrigin = new URL(origURL).origin;
  if (resolved.origin !== requestOrigin) {
    throw new Errors.TurbopufferError(`'Location' origin does not match request origin: ${rawLocation}`);
  }

  return resolved.toString();
}

function resolvePollResponse(body: PollBody, clock: RequestClock): Response | null {
  if (body.status === 'running') return null;

  if (body.result && 'success' in body.result) {
    const resp = new Response(JSON.stringify(body.result.success), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    // Carry the original request's clock so client perf metrics propagate correctly.
    Object.defineProperty(resp, 'clock', { value: clock, enumerable: true });
    return resp;
  }

  if (body.result?.error) {
    const err = body.result.error;
    throw Errors.APIError.generate(err.status_code, err.detail as object, undefined, new Headers());
  }

  throw new Errors.TurbopufferError('malformed poll response');
}

function respondAsyncApplied(response: Response): boolean {
  if (response.status !== 202) return false;
  const applied = response.headers.get(HEADER_PREFERENCE_APPLIED) ?? '';
  return applied.trim().toLowerCase() === RESPOND_ASYNC;
}

type PollBody = {
  status: 'running' | 'finished';
  result?: {
    success?: unknown;
    error?: {
      status_code: number;
      detail?: unknown;
    };
  };
};

const nowMs = () => Math.floor(performance.now());

class Timeout {
  private readonly deadline: number;

  constructor(timeoutMs: number | undefined) {
    this.deadline = timeoutMs === undefined ? Infinity : nowMs() + timeoutMs;
  }

  remainingMs(): number {
    return Math.max(this.deadline - nowMs(), 0);
  }

  pollTimeoutMs(): number {
    return Math.min(this.remainingMs(), config.pollRequestTimeoutMs);
  }

  sleepDurationMs(): number {
    return Math.min(this.remainingMs(), config.pollIntervalMs);
  }
}
