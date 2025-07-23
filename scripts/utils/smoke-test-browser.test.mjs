import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { test, expect } from '@playwright/test';

const root = dirname(fileURLToPath(import.meta.url));

const buildResult = await build({
  bundle: true,
  entryPoints: [join(root, 'smoke-test-browser.eval.mjs')],
  format: 'iife',
  // Prevent esbuild from picking up the root tsconfig.json, which makes the
  // test not test what it should, because it uses the tsconfig `paths` to
  // resolve imports, rather than dist/package.json.
  tsconfig: join(root, 'smoke-test.tsconfig.json'),
  write: false,
});
const bundle = buildResult.outputFiles[0].text;

test('smoke test', async ({ page }) => {
  // Run the test from the API root itself to avoid triggering CORS.
  //
  // Note this test is a bit silly right now, because in a real browser-based
  // use case you'd HAVE to make cross-origin requests, and the API servers
  // just aren't configured to allow that right now. But given that the client
  // itself supports running in the browser, seemed worthwhile to lock that
  // behavior in, in case we one day want to set up CORS to allow this.
  await page.goto('https://gcp-us-central1.turbopuffer.com');

  const res = await page.evaluate((bundle) => {
    eval(bundle);
    return window.makeTpufRequest();
  }, bundle);

  expect(res.status).toBe('🐡');
});
