const assert = require('assert');
const turbopuffer = require('@turbopuffer/turbopuffer');

async function main() {
  const tpuf = new turbopuffer.Turbopuffer({
    apiKey: 'ignored-for-root-endpoint',
    region: 'gcp-us-central1',
  });

  // Do an actual request to the API to test the dynamic imports of
  // undici and gzip.
  const res = await tpuf.get('/');
  assert(res.status === '🐡');

  console.log('CJS smoke test passed');
}

main();
