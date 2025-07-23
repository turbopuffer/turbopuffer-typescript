import { gzip } from 'pako';

export default async function (data: string): Promise<Uint8Array> {
  return gzip(data);
}
