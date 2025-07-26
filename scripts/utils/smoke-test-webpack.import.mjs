import turbopuffer from '@turbopuffer/turbopuffer'; // eslint-disable-line no-restricted-imports

export async function makeTpufRequest() {
  const tpuf = new turbopuffer.Turbopuffer({
    apiKey: 'ignored-for-root-endpoint',
    region: 'gcp-us-central1',
  });

  // Do an actual request to the API to test the dynamic imports of
  // undici and gzip.
  return await tpuf.get('/');
}
