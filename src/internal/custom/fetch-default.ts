import { Fetch } from '../builtin-types';
import { HttpClientOptions } from './http-client';

const fetchSmuggling: Fetch = async (url, options) => {
  const response = await fetch(url, options);

  // Smuggle the performance clock into the response object.
  Object.defineProperty(response, 'clock', {
    value: (options as any).clock,
    enumerable: true,
  });

  return response;
};

export const makeFetch = (_clientOptions: HttpClientOptions) => {
  if (typeof fetch === 'undefined') {
    throw new Error(
      '`fetch` is not defined as a global; Either pass `fetch` to the client, `new Turbopuffer({ fetch })` or polyfill the global, `globalThis.fetch = fetch`',
    );
  }

  // NOTE: not possible to respect client options in this implementation of
  // fetch. Just ignore them.
  //
  // TODO(benesch): would it be better to throw an error?

  return fetchSmuggling;
};
