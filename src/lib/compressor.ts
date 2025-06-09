import { EncodedContent } from '../internal/request-options';
import { isRuntimeFullyNodeCompatible } from './runtime';

export type Compressor = (content: EncodedContent) => Promise<EncodedContent>;

// Chosen based on limited testing. May need tuning.
const MIN_GZIP_SIZE = 1024;

export const makeGzipCompressor = async () => {
  let gzip: (data: string) => Promise<Uint8Array>;

  if (isRuntimeFullyNodeCompatible) {
    gzip = (await import('./gzip-node')).default;
  } else {
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
