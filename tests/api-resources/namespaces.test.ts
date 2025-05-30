// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Turbopuffer from '@turbopuffer/turbopuffer';

const client = new Turbopuffer({
  apiKey: 'tpuf_A1...',
  region: 'gcp-us-central1',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource namespaces', () => {
  // skipped: tests are disabled for the time being
  test.skip('deleteAll: only required params', async () => {
    const responsePromise = client.namespace('namespace').deleteAll();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('deleteAll: required and optional params', async () => {
    const response = await client.namespace('namespace').deleteAll();
  });

  // skipped: tests are disabled for the time being
  test.skip('hintCacheWarm: only required params', async () => {
    const responsePromise = client.namespace('namespace').hintCacheWarm();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('hintCacheWarm: required and optional params', async () => {
    const response = await client.namespace('namespace').hintCacheWarm();
  });

  // skipped: tests are disabled for the time being
  test.skip('query: only required params', async () => {
    const responsePromise = client.namespace('namespace').query({});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('query: required and optional params', async () => {
    const response = await client.namespace('namespace').query({
      namespace: 'namespace',
      consistency: { level: 'strong' },
      distance_metric: 'cosine_distance',
      include_attributes: true,
      rank_by: ['id', 'asc'],
      top_k: 0,
      vector_encoding: 'float',
    });
  });

  // skipped: tests are disabled for the time being
  test.skip('recall: only required params', async () => {
    const responsePromise = client.namespace('namespace').recall();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('recall: required and optional params', async () => {
    const response = await client.namespace('namespace').recall({
      namespace: 'namespace',
      filters: {},
      num: 0,
      queries: [0],
      top_k: 0,
    });
  });

  // skipped: tests are disabled for the time being
  test.skip('schema: only required params', async () => {
    const responsePromise = client.namespace('namespace').schema();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('schema: required and optional params', async () => {
    const response = await client.namespace('namespace').schema();
  });

  // skipped: tests are disabled for the time being
  test.skip('updateSchema: only required params', async () => {
    const responsePromise = client.namespace('namespace').updateSchema();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('updateSchema: required and optional params', async () => {
    const response = await client.namespace('namespace').updateSchema({
      namespace: 'namespace',
      schema: { foo: 'string' },
    });
  });

  // skipped: tests are disabled for the time being
  test.skip('write: only required params', async () => {
    const responsePromise = client.namespace('namespace').write();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('write: required and optional params', async () => {
    const response = await client.namespace('namespace').write({
      namespace: 'namespace',
      copy_from_namespace: 'copy_from_namespace',
      delete_by_filter: {},
      deletes: ['182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e'],
      distance_metric: 'cosine_distance',
      encryption: { cmek: { key_name: 'key_name' } },
      patch_columns: { id: ['182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e'], vector: [[0]] },
      patch_rows: [{ id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', vector: [0] }],
      schema: { foo: 'string' },
      upsert_columns: { id: ['182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e'], vector: [[0]] },
      upsert_rows: [{ id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', vector: [0] }],
    });
  });
});
