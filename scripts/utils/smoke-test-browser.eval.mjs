import turbopuffer from '@turbopuffer/turbopuffer'; // eslint-disable-line no-restricted-imports

window.makeTpufRequest = async () => {
  const tpuf = new turbopuffer.Turbopuffer({
    apiKey: '',
    region: 'gcp-us-central1',
  });

  // Do an actual request to the API to test the dynamic imports of
  // undici and gzip.
  return await tpuf.get('/');
};
