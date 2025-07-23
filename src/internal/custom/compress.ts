import gzip from '#gzip';
import { buildHeaders } from '../headers';
import { EncodedContent } from '../request-options';

// Chosen based on limited testing. May need tuning.
const MIN_GZIP_SIZE = 1024;

export const compress = async ({ body, bodyHeaders }: EncodedContent) => {
  if (typeof body === 'string' && body.length > MIN_GZIP_SIZE) {
    return {
      body: await gzip(body),
      bodyHeaders: buildHeaders([bodyHeaders, { 'content-encoding': 'gzip' }]),
    };
  }
  return { body, bodyHeaders };
};
