import http from 'node:http';
import net from 'node:net';
import type { AddressInfo } from 'node:net';
import * as undici from 'undici';
import Turbopuffer, { APIConnectionTimeoutError } from '@turbopuffer/turbopuffer';
import { useEnvProxy } from '@turbopuffer/turbopuffer/internal/custom/fetch-node';

const PROXY_ENV_VARS = [
  'NODE_USE_ENV_PROXY',
  'NODE_OPTIONS',
  'http_proxy',
  'HTTP_PROXY',
  'https_proxy',
  'HTTPS_PROXY',
  'no_proxy',
  'NO_PROXY',
];

const env = process.env;

beforeEach(() => {
  process.env = { ...env };
  for (const name of PROXY_ENV_VARS) {
    delete process.env[name];
  }
  jest.replaceProperty(process, 'execArgv', []);
});

afterEach(() => {
  process.env = env;
  jest.restoreAllMocks();
});

describe('useEnvProxy', () => {
  test.each([
    { name: 'nothing', vars: {}, execArgv: [], expected: false },
    { name: 'NODE_USE_ENV_PROXY=1', vars: { NODE_USE_ENV_PROXY: '1' }, execArgv: [], expected: true },
    { name: 'NODE_USE_ENV_PROXY=true', vars: { NODE_USE_ENV_PROXY: 'true' }, execArgv: [], expected: false },
    { name: 'the flag', vars: {}, execArgv: ['--use-env-proxy'], expected: true },
    {
      name: 'the flag in NODE_OPTIONS',
      vars: { NODE_OPTIONS: '--use-env-proxy' },
      execArgv: [],
      expected: true,
    },
    {
      name: 'the negated flag over NODE_USE_ENV_PROXY',
      vars: { NODE_USE_ENV_PROXY: '1' },
      execArgv: ['--no-use-env-proxy'],
      expected: false,
    },
    {
      name: 'a flag over NODE_OPTIONS',
      vars: { NODE_OPTIONS: '--use-env-proxy' },
      execArgv: ['--no-use-env-proxy'],
      expected: false,
    },
  ])('is $expected for $name', ({ vars, execArgv, expected }) => {
    Object.assign(process.env, vars);
    jest.replaceProperty(process, 'execArgv', execArgv);
    expect(useEnvProxy()).toBe(expected);
  });
});

describe('proxies', () => {
  let target: http.Server;
  let targetURL: string;
  let proxy: http.Server;
  let proxyURL: string;
  // Hosts the proxy was asked to tunnel to.
  let tunnels: string[];
  const sockets = new Set<net.Socket>();

  const listen = async (server: net.Server): Promise<string> => {
    server.on('connection', (socket: net.Socket) => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    return `127.0.0.1:${(server.address() as AddressInfo).port}`;
  };

  beforeAll(async () => {
    target = http.createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ a: 1 }));
      });
    });
    targetURL = `http://${await listen(target)}`;

    proxy = http.createServer((_req, res) => res.writeHead(405).end());
    proxy.on('connect', (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
      tunnels.push(req.url!);
      const [host, port] = req.url!.split(':');
      const upstream = net.connect(Number(port), host!, () => {
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        upstream.write(head);
        upstream.pipe(socket).pipe(upstream);
      });
      sockets.add(upstream);
      upstream.on('close', () => sockets.delete(upstream));
      upstream.on('error', () => socket.destroy());
      socket.on('error', () => upstream.destroy());
    });
    proxyURL = `http://${await listen(proxy)}`;
  });

  beforeEach(() => {
    tunnels = [];
  });

  afterAll(async () => {
    for (const socket of sockets) {
      socket.destroy();
    }
    await Promise.all([target, proxy].map((server) => new Promise((resolve) => server.close(resolve))));
  });

  const request = (options: ConstructorParameters<typeof Turbopuffer>[0] = {}) =>
    new Turbopuffer({ baseURL: targetURL, apiKey: 'tpuf_A1...', maxRetries: 0, ...options }).request({
      path: '/foo',
      method: 'get',
    });

  test('are ignored unless Node is asked to use them', async () => {
    process.env['HTTP_PROXY'] = proxyURL;
    expect(await request()).toEqual({ a: 1 });
    expect(tunnels).toEqual([]);
  });

  test('from the environment are used when Node is asked to use them', async () => {
    process.env['NODE_USE_ENV_PROXY'] = '1';
    process.env['HTTP_PROXY'] = proxyURL;
    expect(await request()).toEqual({ a: 1 });
    expect(tunnels).toEqual([new URL(targetURL).host]);
  });

  test('from the environment are skipped for NO_PROXY hosts', async () => {
    process.env['NODE_USE_ENV_PROXY'] = '1';
    process.env['HTTP_PROXY'] = proxyURL;
    process.env['NO_PROXY'] = '127.0.0.1';
    expect(await request()).toEqual({ a: 1 });
    expect(tunnels).toEqual([]);
  });

  test('are used from a dispatcher in fetchOptions', async () => {
    const dispatcher = new undici.ProxyAgent(proxyURL);
    try {
      expect(await request({ fetchOptions: { dispatcher } as any })).toEqual({ a: 1 });
      expect(tunnels).toEqual([new URL(targetURL).host]);
    } finally {
      await dispatcher.close();
    }
  });

  test('keep the connect timeout for connections through them', async () => {
    // Accepts connections but never finishes a TLS handshake.
    const blackhole = net.createServer();
    const host = await listen(blackhole);
    try {
      process.env['NODE_USE_ENV_PROXY'] = '1';
      process.env['HTTPS_PROXY'] = proxyURL;
      const start = performance.now();
      await expect(request({ baseURL: `https://${host}`, connectTimeout: 100 })).rejects.toThrow(
        APIConnectionTimeoutError,
      );
      expect(tunnels).toEqual([host]);
      // undici rounds short timeouts up to about a second, and would otherwise wait 10s.
      expect(performance.now() - start).toBeLessThan(5000);
    } finally {
      for (const socket of sockets) {
        socket.destroy();
      }
      await new Promise((resolve) => blackhole.close(resolve));
    }
  }, 15_000);
});
