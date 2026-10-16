import { Fetch } from '../builtin-types';
import { HttpClientOptions } from './http-client';

const fetchDefault: Fetch = (url, options) => fetch(url, options);

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

  return fetchDefault;
};
