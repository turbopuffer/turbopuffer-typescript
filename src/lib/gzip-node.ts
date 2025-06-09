import { gzip as gzipNode } from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(gzipNode);

export default async function (data: string): Promise<Uint8Array> {
  return await gzip(data);
}
