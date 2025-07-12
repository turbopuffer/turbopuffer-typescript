import assert from 'assert';
import turbopuffer from '@turbopuffer/turbopuffer'; // eslint-disable-line no-restricted-imports

async function main() {
  const tpuf = new turbopuffer.Turbopuffer({
    apiKey: 'ignored-for-root-endpoint',
    region: 'gcp-us-central1',
  });

  // Do an actual request to the API to test the dynamic imports of
  // undici and gzip.
  const res = await tpuf.get('/');
  assert(res.status === '🐡');

  console.log('ESM smoke test passed');
}

main();
