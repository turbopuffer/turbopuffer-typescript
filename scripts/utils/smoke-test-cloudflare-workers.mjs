import { unstable_startWorker } from 'wrangler';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import assert from 'node:assert';

const root = dirname(fileURLToPath(import.meta.url));

const worker = await unstable_startWorker({
  entrypoint: join(root, 'smoke-test-cloudflare-workers.worker.mjs'),
  build: {
    // Prevent Wrangler from picking up the root tsconfig.json, which makes the
    // test not test what it should, because it uses the tsconfig `paths` to
    // resolve imports, rather than dist/package.json.
    tsconfig: join(root, 'smoke-test.tsconfig.json'),
  },
});

const res = await (await worker.fetch('http://example.com')).json();
assert(res.status === '🐡');

await worker.dispose();

console.log('Cloudflare Workers smoke test passed');
