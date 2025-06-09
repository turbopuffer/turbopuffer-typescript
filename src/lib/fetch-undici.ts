import { Agent } from 'undici';
import { HttpClientOptions } from './http-client';
import { promisify } from 'node:util';
import { gunzip as gunzipNode } from 'node:zlib';
import { RequestClock } from './performance';

const gunzip = promisify(gunzipNode);

export const makeFetchUndici = (clientOptions: HttpClientOptions) => {
  const agent = new Agent({
    keepAliveTimeout: clientOptions.connectionIdleTimeout,
    keepAliveMaxTimeout: 24 * 60 * 60 * 1000, // maximum configurable idle timeout with server hint
    connect: {
      timeout: clientOptions.connectTimeout,
    },
  });

  const fetchUndici: typeof fetch = async (url, options = {}) => {
    // Validate limited subset of `fetch` that we support.
    if (typeof url === 'string') {
      url = new URL(url);
    } else if (!(url instanceof URL)) {
      throw new Error('url must be a string or URL in this implementation of fetch');
    }

    // Extract the smuggled clock from the request options.
    let clock: RequestClock = (options as any).clock;

    // Make request using undici's low-level request API, which is much faster
    // than the high-level fetch API. (*This* shim doesn't need to be standards
    // compliant, which is why we can outperform the built-in fetch shim.)
    const { statusCode, headers, body } = await agent.request({
      origin: url.origin,
      path: url.search ? `${url.pathname}${url.search}` : url.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body as any,
      signal: options.signal,
    });
    clock.responseHeadersEnd = performance.now();

    let bodyBuffer = await body.arrayBuffer();
    clock.bodyReadEnd = performance.now();
    clock.decompressEnd = clock.bodyReadEnd; // ovewritten later if we actually decompress

    // Convert from `undici` to `fetch` response format.
    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(headers)) {
      if (key === 'content-encoding' && value === 'gzip') {
        bodyBuffer = await gunzip(bodyBuffer);
        clock.decompressEnd = performance.now();
      } else if (typeof value === 'string') {
        responseHeaders.append(key, value);
      } else if (Array.isArray(value)) {
        for (const val of value) {
          responseHeaders.append(key, val);
        }
      }
    }

    const response = new Response(bodyBuffer, {
      status: statusCode,
      headers: responseHeaders,
    });

    // Smuggle the performance clock into the response object.
    Object.defineProperty(response, 'clock', {
      value: clock,
      enumerable: true,
    });

    return response;
  };

  return fetchUndici;
};
