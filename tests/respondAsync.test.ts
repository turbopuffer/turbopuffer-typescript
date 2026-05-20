import Turbopuffer, {
  APIConnectionTimeoutError,
  APIUserAbortError,
  InternalServerError,
  NotFoundError,
} from '@turbopuffer/turbopuffer';
import * as RespondAsync from '@turbopuffer/turbopuffer/internal/custom/respond-async';

const BASE_URL = 'http://localhost:5000';
const POLL_URL = `${BASE_URL}/v1/namespaces/test/operations/op-abc`;

const WRITE_OK_BODY = {
  billing: {
    billable_logical_bytes_written: 0,
    billable_logical_bytes_returned: 0,
  },
  message: 'OK',
  rows_affected: 1,
  status: 'OK',
};

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function asyncAppliedResponse(location: string) {
  return new Response(null, {
    status: 202,
    headers: { 'preference-applied': 'respond-async', location },
  });
}

beforeEach(() => {
  RespondAsync.config.pollIntervalMs = 0;
});

afterEach(() => {
  RespondAsync.config.pollIntervalMs = 1000;
});

test('prefer header is sent on requests', async () => {
  let capturedHeaders: Headers | undefined;
  const testFetch = async (url: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    capturedHeaders = init.headers as Headers;
    return jsonResponse(200, WRITE_OK_BODY);
  };

  const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', fetch: testFetch });
  await client.namespace('test').write({ upsert_columns: { id: [1], vector: [[0.1]] } });

  expect(capturedHeaders?.get('prefer')).toEqual('respond-async');
});

test('sync response passes through', async () => {
  let calls = 0;
  const testFetch = async (): Promise<Response> => {
    calls++;
    return jsonResponse(200, WRITE_OK_BODY);
  };

  const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', fetch: testFetch });
  const resp = await client.namespace('test').write({ upsert_columns: { id: [1], vector: [[0.1]] } });

  expect(calls).toEqual(1);
  expect(resp.status).toEqual('OK');
  expect(resp.rows_affected).toEqual(1);
});

test('unrelated 202 passes through', async () => {
  let calls = 0;
  const testFetch = async (): Promise<Response> => {
    calls++;
    return jsonResponse(202, WRITE_OK_BODY);
  };

  const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', fetch: testFetch });
  const resp = await client.namespace('test').write({ upsert_columns: { id: [1], vector: [[0.1]] } });

  expect(calls).toEqual(1);
  expect(resp.status).toEqual('OK');
});

test('async response is polled to success', async () => {
  const fetches: { url: string; headers: Headers }[] = [];
  const responses: Response[] = [
    asyncAppliedResponse(POLL_URL),
    jsonResponse(200, { status: 'running' }),
    jsonResponse(200, { status: 'running' }),
    jsonResponse(200, { status: 'finished', result: { success: WRITE_OK_BODY } }),
  ];

  const testFetch = async (url: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    fetches.push({ url: String(url), headers: init.headers as Headers });
    return responses.shift()!;
  };

  const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', fetch: testFetch });
  const resp = await client.namespace('test').write({ upsert_columns: { id: [1], vector: [[0.1]] } });

  expect(fetches).toHaveLength(4);
  expect(resp.status).toEqual('OK');
  expect(resp.rows_affected).toEqual(1);
  for (let i = 1; i < fetches.length; i++) {
    // Auth propagates to polls.
    expect(fetches[i]?.headers.get('authorization')).toEqual('Bearer tpuf_A1...');
    // Prefer is not sent on poll requests.
    expect(fetches[i]?.headers.has('prefer')).toBe(false);
    expect(String(fetches[i]?.url)).toEqual(POLL_URL);
  }
});

test('poll error result throws matching status error', async () => {
  const responses: Response[] = [
    asyncAppliedResponse(POLL_URL),
    jsonResponse(200, {
      status: 'finished',
      result: { error: { status_code: 404, detail: { message: 'namespace not found' } } },
    }),
  ];
  const testFetch = async (): Promise<Response> => responses.shift()!;

  const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', fetch: testFetch });
  await expect(
    client.namespace('test').write({ upsert_columns: { id: [1], vector: [[0.1]] } }),
  ).rejects.toThrow(NotFoundError);
});

test('transient poll error is retried', async () => {
  const responses: Response[] = [
    asyncAppliedResponse(POLL_URL),
    new Response(null, { status: 503, headers: { 'retry-after-ms': '0' } }),
    new Response(null, { status: 503, headers: { 'retry-after-ms': '0' } }),
    jsonResponse(200, { status: 'finished', result: { success: WRITE_OK_BODY } }),
  ];
  let calls = 0;
  const testFetch = async (): Promise<Response> => {
    calls++;
    return responses.shift()!;
  };

  const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', fetch: testFetch });
  const resp = await client.namespace('test').write({ upsert_columns: { id: [1], vector: [[0.1]] } });

  expect(calls).toEqual(4);
  expect(resp.status).toEqual('OK');
});

test('poll timeout throws APIConnectionTimeoutError', async () => {
  const testFetch = async (url: string | URL | Request): Promise<Response> => {
    if (String(url) === POLL_URL) return jsonResponse(200, { status: 'running' });
    return asyncAppliedResponse(POLL_URL);
  };

  const client = new Turbopuffer({
    baseURL: BASE_URL,
    apiKey: 'tpuf_A1...',
    fetch: testFetch,
    timeout: 50,
  });

  await expect(
    client.namespace('test').write({ upsert_columns: { id: [1], vector: [[0.1]] } }),
  ).rejects.toThrow(APIConnectionTimeoutError);
});

test('persistent poll error throws', async () => {
  let polls = 0;
  const testFetch = async (url: string | URL | Request): Promise<Response> => {
    if (String(url) === POLL_URL) {
      polls++;
      return new Response(null, { status: 503 });
    }
    return asyncAppliedResponse(POLL_URL);
  };

  const client = new Turbopuffer({
    baseURL: BASE_URL,
    apiKey: 'tpuf_A1...',
    fetch: testFetch,
    maxRetries: 0,
  });

  await expect(
    client.namespace('test').write({ upsert_columns: { id: [1], vector: [[0.1]] } }),
  ).rejects.toThrow(InternalServerError);
  expect(polls).toEqual(1);
});

test('abort during polling throws', async () => {
  const controller = new AbortController();
  let polls = 0;
  const testFetch = async (url: string | URL | Request): Promise<Response> => {
    if (String(url) === POLL_URL) {
      polls++;
      if (polls === 2) controller.abort();
      return jsonResponse(200, { status: 'running' });
    }
    return asyncAppliedResponse(POLL_URL);
  };

  const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', fetch: testFetch });

  await expect(
    client
      .namespace('test')
      .write({ upsert_columns: { id: [1], vector: [[0.1]] } }, { signal: controller.signal }),
  ).rejects.toThrow(APIUserAbortError);
});
