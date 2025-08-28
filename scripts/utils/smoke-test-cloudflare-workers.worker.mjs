import turbopuffer from '@turbopuffer/turbopuffer'; // eslint-disable-line no-restricted-imports

export default {
  async fetch() {
    const tpuf = new turbopuffer.Turbopuffer({
      apiKey: 'ignored-for-root-endpoint',
      region: 'aws-us-east-1', // switch back to gcp-us-central1 once content-type is fixed
    });

    // Do an actual request to the API to test the dynamic imports of
    // undici and gzip.
    return await tpuf.get('/').asResponse();
  },
};
