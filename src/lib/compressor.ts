import { EncodedContent } from '../internal/request-options';
import { importDynamic } from '../internal/shims';
import { isRuntimeFullyNodeCompatible } from './runtime';

export type Compressor = (content: EncodedContent) => Promise<EncodedContent>;

// Chosen based on limited testing. May need tuning.
const MIN_GZIP_SIZE = 1024;

export const makeGzipCompressor = async () => {
  let gzip: (data: string) => Promise<Uint8Array>;

  if (isRuntimeFullyNodeCompatible) {
    // Use `importDynamic` to hide this import from Vite, as it's not available
    // in edge environments like Cloudflare Workers.
    gzip = (await importDynamic('../lib/gzip-node')).default;
  } else {
    // `gzip-pako` is compatible with edge environments so we can use
    // a normal import.
    gzip = (await import('./gzip-pako')).default;
  }

  const compressor: Compressor = async ({ body, bodyHeaders }) => {
    if (typeof body === 'string' && body.length > MIN_GZIP_SIZE) {
      return {
        body: await gzip(body),
        bodyHeaders: {
          ...bodyHeaders,
          'content-encoding': 'gzip',
        },
      };
    }
    return { body, bodyHeaders };
  };

  return compressor;
};
