// A namespace import, because a named import of something missing from an
// older undici fails to load under ESM.
import * as undici from 'undici';
import { HttpClientOptions } from './http-client';
import { promisify } from 'node:util';
import { gunzip as gunzipNode } from 'node:zlib';
import { dispatchTimings } from '../observer';
import { UndiciHeaders } from 'undici/types/dispatcher';

const gunzip = promisify(gunzipNode);

/**
 * Whether Node was asked to send requests through the proxies in `HTTP_PROXY`,
 * `HTTPS_PROXY`, and `NO_PROXY`, which it then does for its own `fetch`. As in
 * Node, flags override `NODE_USE_ENV_PROXY`, and later flags override earlier
 * ones.
 *
 * See https://nodejs.org/api/http.html#built-in-proxy-support
 */
export const useEnvProxy = (): boolean => {
  let enabled = process.env['NODE_USE_ENV_PROXY'] === '1';
  // Flags in NODE_OPTIONS are missing from execArgv and come before it.
  const flags = [...(process.env['NODE_OPTIONS'] ?? '').split(/\s+/), ...process.execArgv];
  for (const flag of flags) {
    if (flag === '--use-env-proxy') {
      enabled = true;
    } else if (flag === '--no-use-env-proxy') {
      enabled = false;
    }
  }
  return enabled;
};

export const makeFetch = (clientOptions: HttpClientOptions) => {
  const agentOptions = {
    keepAliveTimeout: clientOptions.connectionIdleTimeout,
    keepAliveMaxTimeout: 24 * 60 * 60 * 1000, // maximum configurable idle timeout with server hint
    connect: {
      timeout: clientOptions.connectTimeout,
    },
  };

  // Proxies replace `connect` with their own, so the connect timeout is also
  // given for connections to the proxy and through it. undici before 6.14.0,
  // which some users manage to link against (see the note on headers below),
  // lacks EnvHttpProxyAgent and keeps connecting directly.
  const agent: undici.Dispatcher =
    useEnvProxy() && undici.EnvHttpProxyAgent ?
      new undici.EnvHttpProxyAgent({
        ...agentOptions,
        proxyTls: { timeout: clientOptions.connectTimeout },
        requestTls: { timeout: clientOptions.connectTimeout },
      })
    : new undici.Agent(agentOptions);

  const fetchUndici: typeof fetch = async (url, options = {}) => {
    // Validate limited subset of `fetch` that we support.
    if (typeof url === 'string') {
      url = new URL(url);
    } else if (!(url instanceof URL)) {
      throw new Error('url must be a string or URL in this implementation of fetch');
    }

    // Only available synchronously, before the first await.
    const timings = dispatchTimings();

    // Convert from `fetch` to `undici` request format.
    let requestHeaders: UndiciHeaders;
    if (options.headers === undefined) {
      requestHeaders = {};
    } else if (options.headers instanceof Headers) {
      // Versions of `undici` before 6.7.0 [0] didn't support `Headers` objects
      // directly, so convert to a plain object, which both Undici 6 and 7
      // support.
      //
      // Our package.json does constrain to Undici 7+, but we have at least one
      // user in the wild who was managing to link against Undici 6. It's much
      // easier to solve it this way than to fix npm/Yarn dependency resolution
      // issues.
      //
      // [0]: https://github.com/nodejs/undici/commit/c2f006894c53609032ccbf82a98e1b0221da4d66
      requestHeaders = Object.fromEntries(options.headers);
    } else {
      requestHeaders = options.headers;
    }

    // Like Node's fetch, use a dispatcher given in `fetchOptions`, such as an
    // undici ProxyAgent. It replaces the client's own along with its timeouts.
    const dispatcher = (options as { dispatcher?: undici.Dispatcher }).dispatcher ?? agent;

    // Make request using undici's low-level request API, which is much faster
    // than the high-level fetch API. (*This* shim doesn't need to be standards
    // compliant, which is why we can outperform the built-in fetch shim.)
    const { statusCode, headers, body } = await dispatcher.request({
      origin: url.origin,
      path: url.search ? `${url.pathname}${url.search}` : url.pathname,
      method: options.method || 'GET',
      headers: requestHeaders,
      body: options.body as any,
      signal: options.signal,
    });
    // undici's diagnostics mark these more precisely when they're available.
    if (timings) timings.responseHeaders ??= performance.now();

    let bodyBuffer = await body.arrayBuffer();
    const bodyEnd = performance.now();
    let decompressEnd = bodyEnd; // overwritten later if we actually decompress

    // Convert from `undici` to `fetch` response format.
    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(headers)) {
      if (key === 'content-encoding' && value === 'gzip') {
        bodyBuffer = await gunzip(bodyBuffer);
        decompressEnd = performance.now();
      } else if (typeof value === 'string') {
        responseHeaders.append(key, value);
      } else if (Array.isArray(value)) {
        for (const val of value) {
          responseHeaders.append(key, val);
        }
      }
    }

    if (timings) {
      timings.bodyEnd ??= bodyEnd;
      timings.extra['decompress_begin'] = bodyEnd;
      timings.extra['decompress_end'] = decompressEnd;
    }

    return new Response(bodyBuffer, {
      status: statusCode,
      headers: responseHeaders,
    });
  };

  return fetchUndici;
};
