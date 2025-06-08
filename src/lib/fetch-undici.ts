import { request } from 'undici';

export const fetchUndici: typeof fetch = async (url, options = {}) => {
  // Validate limited subset of `fetch` that we support.
  if (typeof url !== 'string') {
    throw new Error('url must be a string in this implementation of fetch');
  }

  // Make request using undici's low-level request API, which is much faster
  // than the high-level fetch API. (*This* shim doesn't need to be standards
  // compliant, which is why we can outperform the built-in fetch shim.)
  const { statusCode, headers, body } = await request(url, {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body as any,
    signal: options.signal,
  });
  const bodyBuffer = await body.arrayBuffer();

  // Convert from `undici` to `fetch` response format.
  const responseHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      responseHeaders.append(key, value);
    } else if (Array.isArray(value)) {
      for (const val of value) {
        responseHeaders.append(key, val);
      }
    }
  }
  return new Response(bodyBuffer, {
    status: statusCode,
    headers: responseHeaders,
  });
};
