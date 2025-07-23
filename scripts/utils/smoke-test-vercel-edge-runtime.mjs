import { EdgeRuntime } from 'edge-runtime';
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import assert from 'node:assert';

const root = dirname(fileURLToPath(import.meta.url));

const buildResult = await build({
  bundle: true,
  entryPoints: [join(root, 'smoke-test-vercel-edge-runtime.function.mjs')],
  format: 'esm',
  // Prevent esbuild from picking up the root tsconfig.json, which makes the
  // test not test what it should, because it uses the tsconfig `paths` to
  // resolve imports, rather than dist/package.json.
  tsconfig: join(root, 'smoke-test.tsconfig.json'),
  write: false,
});
const bundle = buildResult.outputFiles[0].text;

const runtime = new EdgeRuntime();
const res = await runtime.evaluate(bundle);
assert(res.status === '🐡');

console.log('Vercel Edge Runtime smoke test passed');
