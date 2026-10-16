import http from 'node:http';
import type { AddressInfo } from 'node:net';
import Turbopuffer, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
  NotFoundError,
} from '@turbopuffer/turbopuffer';
import * as RespondAsync from '@turbopuffer/turbopuffer/internal/custom/respond-async';
import { computeDurations } from '@turbopuffer/turbopuffer/internal/custom/performance';
import {
  MAX_BUFFERED_RECORDS,
  MAX_RECORDS_PER_HEADER,
  SAMPLE_RATE_HEADER,
  TELEMETRY_ENV_VAR,
  TELEMETRY_HEADER,
  TelemetryBuffer,
  TurbopufferObserver,
  resolveEnabled,
  routeTemplate,
  sampling,
} from '@turbopuffer/turbopuffer/internal/custom/telemetry';
import type { RequestInfo, RequestResult, Timings } from '@turbopuffer/turbopuffer/internal/observer';

const BASE_URL = 'http://localhost:5000';
const QUERY_PATH = '/v2/namespaces/my-ns/query';
const QUERY_ROUTE = 'POST /v2/namespaces/{ns}/query';

type Record_ = { [key: string]: any };

const queryBody = () => ({
  rows: [],
  performance: {
    approx_namespace_size: 1,
    cache_hit_ratio: 1.0,
    cache_temperature: 'hot',
    exhaustive_search_count: 0,
    query_execution_ms: 5,
    server_total_ms: 7,
  },
});

type Reply = (signal: AbortSignal | null | undefined) => Response | Promise<Response>;

const json =
  (body: unknown, status = 200, headers: Record<string, string> = {}): Reply =>
  () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json', ...headers },
    });

const connectError: Reply = () => {
  throw Object.assign(new TypeError('fetch failed'), {
    cause: Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5000'), { code: 'ECONNREFUSED' }),
  });
};

/** Answers requests with `replies` in order, repeating the last one, and remembers what was sent. */
function mockFetch(...replies: Reply[]) {
  const sent: { url: string; telemetry: string | null }[] = [];
  const fetch = async (url: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    sent.push({ url: String(url), telemetry: (init.headers as Headers).get(TELEMETRY_HEADER) });
    const reply = replies.length > 1 ? replies.shift()! : replies[0]!;
    return reply(init.signal);
  };
  return { fetch, sent };
}

const hangUntilAborted = (signal: AbortSignal | null | undefined) =>
  new Promise<Response>((resolve, reject) => {
    signal?.addEventListener('abort', () =>
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
    );
  });

function parseHeader(value: string | null): { records: Record_[]; dropped?: number } | null {
  if (value === null) return null;
  const payload = JSON.parse(value);
  expect(payload.version).toBe(1);
  return payload;
}

const sentRecords = (value: string | null): Record_[] | null => parseHeader(value)?.records ?? null;

function takePayload(buffer: TelemetryBuffer) {
  const batch = buffer.take();
  expect(batch).toBeDefined();
  return parseHeader(batch!.header)!;
}

function addRecord(buffer: TelemetryBuffer, status = 200) {
  buffer.record({ method: 'post', url: QUERY_PATH, status, retries: 0, durations: { total: 5 } });
}

const bufferOf = (client: Turbopuffer): TelemetryBuffer | undefined =>
  ((client as any)._observer as TurbopufferObserver).telemetry;

// Clients with the same API key and base URL share a buffer, so each test gets its own key.
let keys = 0;
const newClient = (options: ConstructorParameters<typeof Turbopuffer>[0] = {}) =>
  new Turbopuffer({ baseURL: BASE_URL, apiKey: `tpuf_test_${keys++}`, telemetry: true, ...options });

const env = process.env;

beforeEach(() => {
  process.env = { ...env };
  delete process.env[TELEMETRY_ENV_VAR];
  RespondAsync.config.pollIntervalMs = 0;
  // Retries otherwise wait a quarter of a second.
  jest.spyOn(Turbopuffer.prototype as any, 'calculateDefaultRetryTimeoutMillis').mockReturnValue(0);
});

afterEach(() => {
  process.env = env;
  RespondAsync.config.pollIntervalMs = 1000;
  sampling.random = Math.random;
  jest.restoreAllMocks();
});

describe('resolveEnabled', () => {
  const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', telemetry: false });

  test('is disabled by default', () => {
    expect(resolveEnabled(undefined, client)).toBe(false);
    expect(bufferOf(new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...' }))).toBeUndefined();
  });

  test.each([
    ['1', true],
    ['true', true],
    [' ON ', true],
    ['yes', true],
    ['0', false],
    ['false', false],
    ['', false],
  ])('reads %j from the environment', (value, expected) => {
    process.env[TELEMETRY_ENV_VAR] = value;
    expect(resolveEnabled(undefined, client)).toBe(expected);
  });

  test('enables clients from the environment', () => {
    process.env[TELEMETRY_ENV_VAR] = '1';
    expect(bufferOf(new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...' }))).toBeDefined();
  });

  test('warns about an invalid environment variable and disables', () => {
    const warn = jest.fn();
    const logger = { debug: jest.fn(), info: jest.fn(), warn, error: jest.fn() };
    process.env[TELEMETRY_ENV_VAR] = 'sometimes';
    const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', logger });
    expect(bufferOf(client)).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(TELEMETRY_ENV_VAR));
  });

  test('prefers an explicit value over the environment', () => {
    process.env[TELEMETRY_ENV_VAR] = '1';
    expect(resolveEnabled(false, client)).toBe(false);
    process.env[TELEMETRY_ENV_VAR] = '0';
    expect(resolveEnabled(true, client)).toBe(true);
  });
});

describe('routeTemplate', () => {
  test.each([
    ['post', '/v2/namespaces/my-ns/query', QUERY_ROUTE],
    [
      'post',
      '/v2/namespaces/my-ns/query?stainless_overload=multiQuery',
      'POST /v2/namespaces/{ns}/query?stainless_overload=multiQuery',
    ],
    ['post', '/v2/namespaces/my%2Fns', 'POST /v2/namespaces/{ns}'],
    ['get', '/v1/namespaces', 'GET /v1/namespaces'],
    [
      'get',
      '/v1/namespaces/my-ns/operations/abc123?stainless_overload=pollCopyFrom',
      'GET /v1/namespaces/{ns}/operations/{token}?stainless_overload=pollCopyFrom',
    ],
    [
      'get',
      'https://gcp-us-central1.turbopuffer.com/v1/namespaces/my-ns/metadata',
      'GET /v1/namespaces/{ns}/metadata',
    ],
  ])('templates %s %s', (method, url, expected) => {
    expect(routeTemplate(method, url)).toBe(expected);
  });
});

describe('TelemetryBuffer', () => {
  test('records durations as integer microseconds', () => {
    const buffer = new TelemetryBuffer();
    buffer.record({
      method: 'post',
      url: QUERY_PATH,
      status: 200,
      retries: 2,
      durations: { total: 1.234567, compress: 0, deserialize: 0.000999 },
      serverTotalMs: 7,
    });

    const [record] = takePayload(buffer).records;
    expect(record!['total_us']).toBe(1234);
    expect(record!['deserialize_us']).toBe(0);
    expect(record!['server_total_us']).toBe(7000);
    expect(record!['retries']).toBe(2);
    // A zero compress duration means the body wasn't compressed.
    expect(record).not.toHaveProperty('compress_us');
  });

  test('drops the oldest records when full', () => {
    const buffer = new TelemetryBuffer();
    for (let status = 0; status < MAX_BUFFERED_RECORDS + 5; status++) {
      addRecord(buffer, status);
    }

    const first = takePayload(buffer);
    expect(first.dropped).toBe(5);
    expect(first.records).toHaveLength(MAX_RECORDS_PER_HEADER);
    expect(first.records[0]!['status']).toBe(5);

    const second = takePayload(buffer);
    expect(second).not.toHaveProperty('dropped');
    expect(second.records[0]!['status']).toBe(5 + MAX_RECORDS_PER_HEADER);
  });

  test('restores records to the front in order', () => {
    const buffer = new TelemetryBuffer();
    for (let status = 0; status < 3; status++) {
      addRecord(buffer, status);
    }
    const batch = buffer.take()!;

    addRecord(buffer, 99);
    buffer.restore(batch);

    expect(takePayload(buffer).records.map((record) => record['status'])).toEqual([0, 1, 2, 99]);
  });

  test('restoring into a full buffer drops the restored records', () => {
    const buffer = new TelemetryBuffer();
    addRecord(buffer);
    const batch = buffer.take()!;
    for (let i = 0; i < MAX_BUFFERED_RECORDS; i++) {
      addRecord(buffer);
    }

    buffer.restore(batch);

    expect(takePayload(buffer).dropped).toBe(1);
  });

  test.each(['abc', '1.5', '-0.1', 'nan', ''])('ignores the invalid sample rate %j', (value) => {
    const buffer = new TelemetryBuffer();
    buffer.observeResponse(new Headers({ [SAMPLE_RATE_HEADER]: '0.5' }));
    buffer.observeResponse(new Headers({ [SAMPLE_RATE_HEADER]: value }));
    expect(buffer.sampleRate).toBe(0.5);
  });
});

describe('client copies', () => {
  test('share a buffer for the same API key and base URL', () => {
    const client = newClient();
    const buffer = bufferOf(client);
    expect(buffer).toBeDefined();

    expect(bufferOf(client.withOptions({ timeout: 5000 }))).toBe(buffer);
    expect(bufferOf((client.namespace('my-ns') as any)._client)).toBe(buffer);

    expect(bufferOf(client.withOptions({ apiKey: 'tpuf_other' }))).not.toBe(buffer);
    expect(bufferOf(client.withOptions({ apiKey: 'tpuf_other' }))).toBeDefined();
    expect(bufferOf(client.withOptions({ baseURL: 'http://127.0.0.1:4011' }))).not.toBe(buffer);
    expect(bufferOf(client.withOptions({ telemetry: false }))).toBeUndefined();
  });

  test('keep the resolved setting instead of reading the environment again', () => {
    process.env[TELEMETRY_ENV_VAR] = '1';
    const client = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_env' });
    const buffer = bufferOf(client);
    expect(buffer).toBeDefined();

    process.env[TELEMETRY_ENV_VAR] = '0';
    expect(bufferOf(client.withOptions({}))).toBe(buffer);
  });

  test('independent clients share a buffer for the same API key and base URL', () => {
    const options = { baseURL: BASE_URL, apiKey: 'tpuf_shared', telemetry: true };
    expect(bufferOf(new Turbopuffer(options))).toBe(bufferOf(new Turbopuffer(options)));
    expect(bufferOf(new Turbopuffer({ ...options, apiKey: 'tpuf_other' }))).not.toBe(
      bufferOf(new Turbopuffer(options)),
    );
  });
});

describe('requests', () => {
  test('records ride on the next request', async () => {
    const { fetch, sent } = mockFetch(json(queryBody()));
    const ns = newClient({ fetch }).namespace('my-ns');

    const result = await ns.query({ top_k: 1 });
    expect(sent[0]!.telemetry).toBeNull();
    // The public performance fields are still filled in.
    expect(result.performance.client_total_ms).toBeGreaterThan(0);

    await ns.query({ top_k: 1 });
    const [record, ...rest] = sentRecords(sent[1]!.telemetry)!;
    expect(rest).toEqual([]);
    expect(record!['route']).toBe(QUERY_ROUTE);
    expect(record!['status']).toBe(200);
    expect(record!['server_total_us']).toBe(7000);
    for (const key of ['total_us', 'serialize_us', 'deserialize_us', 'body_read_us']) {
      expect(Number.isInteger(record![key]) && record![key] >= 0).toBe(true);
    }
    expect(record!['total_us']).toBeGreaterThanOrEqual(record!['serialize_us'] + record!['deserialize_us']);
    expect(record!['age_ms']).toBeGreaterThanOrEqual(0);
    // A custom fetch isn't traced.
    for (const key of [
      'compress_us',
      'response_us',
      'retries',
      'error',
      'sample_rate',
      'reused',
      'pool_us',
    ]) {
      expect(record).not.toHaveProperty(key);
    }
  });

  test('a request that fails before it is sent keeps buffered records', async () => {
    const { fetch, sent } = mockFetch(json(queryBody()));
    const ns = newClient({ fetch }).namespace('my-ns');

    await ns.query({ top_k: 1 });
    // Building the request fails, so it's never sent.
    const unserializable = { top_k: 1, rank_by: 1n } as unknown as Parameters<typeof ns.query>[0];
    await expect(ns.query(unserializable)).rejects.toThrow();
    await ns.query({ top_k: 1 });

    expect(sent).toHaveLength(2);
    expect(sentRecords(sent[1]!.telemetry)!.map((record) => record['route'])).toEqual([QUERY_ROUTE]);
  });

  test('disabled clients send nothing', async () => {
    const { fetch, sent } = mockFetch(json(queryBody()));
    const ns = new Turbopuffer({ baseURL: BASE_URL, apiKey: 'tpuf_A1...', fetch }).namespace('my-ns');

    await ns.query({ top_k: 1 });
    await ns.query({ top_k: 1 });

    expect(sent.map((request) => request.telemetry)).toEqual([null, null]);
  });

  test('compression is recorded', async () => {
    const { fetch, sent } = mockFetch(json(queryBody()));
    const ns = newClient({ fetch, compression: true }).namespace('my-ns');

    await ns.query({ top_k: 1, rank_by: ['vector', 'ANN', Array(512).fill(0.1)] });
    await ns.query({ top_k: 1 });

    expect(sentRecords(sent[1]!.telemetry)![0]).toHaveProperty('compress_us');
  });

  test('a server sample rate of zero stops recording', async () => {
    const { fetch, sent } = mockFetch(json(queryBody(), 200, { [SAMPLE_RATE_HEADER]: '0' }));
    const client = newClient({ fetch });
    const ns = client.namespace('my-ns');

    for (let i = 0; i < 3; i++) {
      await ns.query({ top_k: 1 });
    }

    expect(sent.map((request) => request.telemetry)).toEqual([null, null, null]);
    expect(bufferOf(client)!.sampleRate).toBe(0);
  });

  test('the server sample rate is applied', async () => {
    const { fetch, sent } = mockFetch(json(queryBody(), 200, { [SAMPLE_RATE_HEADER]: '0.25' }));
    const ns = newClient({ fetch }).namespace('my-ns');

    sampling.random = () => 0.2;
    await ns.query({ top_k: 1 });
    sampling.random = () => 0.3;
    await ns.query({ top_k: 1 });
    await ns.query({ top_k: 1 });

    expect(sentRecords(sent[1]!.telemetry)![0]!['sample_rate']).toBe(0.25);
    expect(sent[2]!.telemetry).toBeNull();
  });

  test('a batch is sent again after a connect error', async () => {
    const { fetch, sent } = mockFetch(json(queryBody()), connectError, json(queryBody()));
    const ns = newClient({ fetch }).namespace('my-ns');

    await ns.query({ top_k: 1 });
    await ns.query({ top_k: 1 });

    expect(sent[1]!.telemetry).not.toBeNull();
    expect(sent[2]!.telemetry).toEqual(sent[1]!.telemetry);
  });

  test('a batch is not sent again after a server error', async () => {
    const { fetch, sent } = mockFetch(json(queryBody()), json({}, 503), json(queryBody()), json(queryBody()));
    const ns = newClient({ fetch }).namespace('my-ns');

    await ns.query({ top_k: 1 });
    await ns.query({ top_k: 1 });
    await ns.query({ top_k: 1 });

    expect(sent[1]!.telemetry).not.toBeNull();
    expect(sent[2]!.telemetry).toBeNull();
    // The retried query reports how many retries it took.
    expect(sentRecords(sent[3]!.telemetry)![0]!['retries']).toBe(1);
  });

  test('canceled requests are recorded', async () => {
    const controller = new AbortController();
    const { fetch, sent } = mockFetch((signal) => {
      const response = hangUntilAborted(signal);
      controller.abort();
      return response;
    }, json(queryBody()));
    const ns = newClient({ fetch }).namespace('my-ns');

    await expect(ns.query({ top_k: 1 }, { signal: controller.signal })).rejects.toThrow(APIUserAbortError);
    await ns.query({ top_k: 1 });

    const [record] = sentRecords(sent[1]!.telemetry)!;
    expect([record!['status'], record!['error']]).toEqual([0, 'canceled']);
    expect(record!['total_us']).toBeGreaterThan(0);
  });

  test('failures are recorded', async () => {
    const { fetch, sent } = mockFetch(
      hangUntilAborted,
      connectError,
      json({ error: 'bad request' }, 400),
      json(queryBody()),
    );
    const ns = newClient({ fetch, maxRetries: 0, timeout: 10 }).namespace('my-ns');

    await expect(ns.query({ top_k: 1 })).rejects.toThrow(APIConnectionTimeoutError);
    await expect(ns.query({ top_k: 1 })).rejects.toThrow(APIConnectionError);
    await expect(ns.query({ top_k: 1 })).rejects.toThrow(APIError);
    await ns.query({ top_k: 1 });

    const summary = (value: string | null) =>
      sentRecords(value)!.map((record) => [record['status'], record['error']]);
    expect(sent[0]!.telemetry).toBeNull();
    expect(summary(sent[1]!.telemetry)).toEqual([[0, 'timeout']]);
    // The connect error never reached the server, so its batch is sent again with the new record.
    expect(summary(sent[2]!.telemetry)).toEqual([
      [0, 'timeout'],
      [0, 'connect'],
    ]);
    expect(summary(sent[3]!.telemetry)).toEqual([[400, undefined]]);
  });

  test('query params are not recorded', async () => {
    const { fetch } = mockFetch(json({ namespaces: [] }));
    const client = newClient({ fetch });

    await client.namespaces({ prefix: 'secret-prefix' });

    const [record] = takePayload(bufferOf(client)!).records;
    expect(record!['route']).toBe('GET /v1/namespaces');
  });

  test('parsing twice records once', async () => {
    const { fetch } = mockFetch(json(queryBody()));
    const client = newClient({ fetch });

    const promise = client.namespace('my-ns').query({ top_k: 1 });
    await promise;
    await promise.withResponse();

    expect(takePayload(bufferOf(client)!).records).toHaveLength(1);
  });
});

describe('respond-async', () => {
  const WRITE_PATH = '/v2/namespaces/my-ns';
  const POLL_PATH = '/v1/namespaces/my-ns/operations/op-abc';

  const accepted: Reply = () =>
    new Response(null, {
      status: 202,
      headers: { 'preference-applied': 'respond-async', location: `${BASE_URL}${POLL_PATH}` },
    });

  const write = (client: Turbopuffer) =>
    client.namespace('my-ns').write({ upsert_columns: { id: [1], vector: [[0.1]] } });

  // The records sent on later requests, followed by those still buffered.
  const records = (sent: { telemetry: string | null }[], client: Turbopuffer) => [
    ...sent.flatMap((request) => sentRecords(request.telemetry) ?? []),
    ...takePayload(bufferOf(client)!).records,
  ];

  test('polls and the request are recorded', async () => {
    const { fetch, sent } = mockFetch(
      accepted,
      json({ status: 'running' }),
      json({ status: 'finished', result: { success: { status: 'OK' } } }),
    );
    const client = newClient({ fetch });

    await write(client);

    const all = records(sent, client);
    const request = all.pop()!;
    expect(all.map((record) => [record['route'], record['status']])).toEqual([
      ['GET /v1/namespaces/{ns}/operations/{token}', 200],
      ['GET /v1/namespaces/{ns}/operations/{token}', 200],
    ]);
    // The request reports the final outcome, and its total spans the polling.
    expect([request['route'], request['status']]).toEqual(['POST /v2/namespaces/{ns}', 200]);
    expect(request).not.toHaveProperty('error');
    expect(request['total_us']).toBeGreaterThanOrEqual(all[0]!['total_us'] + all[1]!['total_us']);
    expect(sent.map((request) => request.url)).toEqual([
      `${BASE_URL}${WRITE_PATH}`,
      `${BASE_URL}${POLL_PATH}`,
      `${BASE_URL}${POLL_PATH}`,
    ]);
  });

  test('the request keeps the timings of the accepted exchange', async () => {
    const { fetch } = mockFetch(
      accepted,
      json({ status: 'running' }),
      json({ status: 'finished', result: { success: { status: 'OK' } } }),
    );
    const ns = newClient({ fetch }).namespace('my-ns');
    const finished: { info: RequestInfo; result: RequestResult }[] = [];
    (ns as any)._client._observer = {
      start: (info: RequestInfo) => ({ finish: (result: RequestResult) => finished.push({ info, result }) }),
    };

    const response = await ns.write({ upsert_columns: { id: [1], vector: [[0.1]] } });

    expect(finished.map(({ info }) => info.method)).toEqual(['get', 'get', 'post']);
    const polls = finished.slice(0, 2).map(({ result }) => result);
    const request = finished[2]!.result;
    expect(request.response!.status).toBe(200);
    expect(request.parsed).toBe(response);
    expect(request.retries).toBe(0);
    // The accepted response's body was read before polling began.
    expect(request.timings.bodyEnd).toBeLessThanOrEqual(polls[0]!.timings.attemptStart!);
    expect(request.timings.deserializeEnd).toBeGreaterThanOrEqual(polls[1]!.timings.deserializeEnd!);
  });

  test('a failed operation is recorded', async () => {
    const { fetch, sent } = mockFetch(
      accepted,
      json({ status: 'finished', result: { error: { status_code: 404, detail: { error: 'gone' } } } }),
    );
    const client = newClient({ fetch });

    await expect(write(client)).rejects.toThrow(NotFoundError);

    const [, request] = records(sent, client);
    expect([request!['route'], request!['status']]).toEqual(['POST /v2/namespaces/{ns}', 404]);
    expect(request).not.toHaveProperty('error');
  });

  test('a polling timeout is recorded', async () => {
    RespondAsync.config.pollIntervalMs = 10;
    const { fetch, sent } = mockFetch(accepted, json({ status: 'running' }));
    const client = newClient({ fetch });

    await expect(write(client.withOptions({ timeout: 50 }))).rejects.toThrow(APIConnectionTimeoutError);

    const request = records(sent, client).pop()!;
    expect([request['route'], request['status'], request['error']]).toEqual([
      'POST /v2/namespaces/{ns}',
      202,
      'timeout',
    ]);
  });
});

describe('connection phases', () => {
  let server: http.Server;
  let baseURL: string;

  beforeAll(async () => {
    // A real server, since mocked fetches never open connections to trace.
    server = http.createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(queryBody()));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test('durations', () => {
    const timings = (marks: Partial<Timings>): Timings => ({ extra: {}, ...marks });
    const newConnection = timings({
      attemptStart: 0,
      requestReady: 50,
      connectStart: 150,
      connectEnd: 400,
      sendStart: 410,
      sendEnd: 500,
      responseHeaders: 900,
      extra: { compress_start: 60, compress_end: 100 },
    });
    expect(computeDurations(newConnection, 1000)).toMatchObject({
      compress: 40,
      pool: 50,
      connect: 250,
      send: 90,
      wait: 400,
    });

    const reusedConnection = timings({
      attemptStart: 0,
      requestReady: 100,
      sendStart: 130,
      sendEnd: 160,
      responseHeaders: 300,
    });
    expect(computeDurations(reusedConnection, 400)).not.toHaveProperty('connect');
    expect(computeDurations(reusedConnection, 400).pool).toBe(30);

    // A body can finish sending after the response headers arrive.
    reusedConnection.sendEnd = 350;
    expect(computeDurations(reusedConnection, 400).wait).toBe(0);

    // Bodies are compressed before the request is handed to fetch, so the wait starts once it is.
    const compressedFirst = timings({
      attemptStart: 0,
      requestReady: 50,
      sendStart: 70,
      extra: { compress_start: 10, compress_end: 20 },
    });
    expect(computeDurations(compressedFirst, 100).pool).toBe(20);

    // Untraced requests, e.g. through a custom fetch.
    expect(computeDurations(timings({ attemptStart: 0 }), 400)).toEqual({ total: 400 });
  });

  test('the client traces connections', async () => {
    const client = newClient({ baseURL });
    const ns = client.namespace('my-ns');

    await ns.query({ top_k: 1 });
    const [first] = takePayload(bufferOf(client)!).records;
    // undici frees the connection shortly after the body is read.
    await new Promise((resolve) => setTimeout(resolve, 10));
    await ns.query({ top_k: 1 });
    const [second] = takePayload(bufferOf(client)!).records;

    expect(first!['reused']).toBe(false);
    expect(first).toHaveProperty('connect_us');
    expect(second!['reused']).toBe(true);
    expect(second).not.toHaveProperty('connect_us');
    for (const record of [first!, second!]) {
      for (const key of ['pool_us', 'send_us', 'wait_us', 'body_read_us']) {
        expect(Number.isInteger(record[key]) && record[key] >= 0).toBe(true);
      }
      expect(record['wait_us'] + record['body_read_us']).toBeLessThanOrEqual(record['total_us']);
    }
  });

  test('performance is filled in without telemetry', async () => {
    const client = new Turbopuffer({ baseURL, apiKey: 'tpuf_A1...' });
    expect(bufferOf(client)).toBeUndefined();

    const { performance } = await client.namespace('my-ns').query({ top_k: 1 });

    expect(performance.client_total_ms).toBeGreaterThan(0);
    expect(performance.client_response_ms).toBeGreaterThan(0);
    expect(performance.client_response_ms).toBeLessThanOrEqual(performance.client_total_ms);
    expect(performance.client_body_read_ms).toBeGreaterThanOrEqual(0);
    expect(performance.client_deserialize_ms).toBeGreaterThan(0);
    expect(performance.client_compress_ms).toBe(0);
    expect(performance.client_decompress_ms).toBe(0);
  });
});
