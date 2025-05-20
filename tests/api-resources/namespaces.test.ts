// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Turbopuffer from '@turbopuffer/turbopuffer';

const client = new Turbopuffer({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource namespaces', () => {
  test('deleteAll: only required params', async () => {
    const responsePromise = client.namespaces.deleteAll({ namespace: 'namespace' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('deleteAll: required and optional params', async () => {
    const response = await client.namespaces.deleteAll({ namespace: 'namespace' });
  });

  test('export: only required params', async () => {
    const responsePromise = client.namespaces.export({ namespace: 'namespace' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('export: required and optional params', async () => {
    const response = await client.namespaces.export({ namespace: 'namespace', cursor: 'cursor' });
  });

  test('getSchema: only required params', async () => {
    const responsePromise = client.namespaces.getSchema({ namespace: 'namespace' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('getSchema: required and optional params', async () => {
    const response = await client.namespaces.getSchema({ namespace: 'namespace' });
  });

  test('multiQuery: only required params', async () => {
    const responsePromise = client.namespaces.multiQuery({ namespace: 'namespace' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('multiQuery: required and optional params', async () => {
    const response = await client.namespaces.multiQuery({
      namespace: 'namespace',
      consistency: { level: 'strong' },
      queries: [
        {
          distance_metric: 'cosine_distance',
          filters: [{}],
          include_attributes: true,
          rank_by: [{}],
          top_k: 0,
        },
      ],
      vector_encoding: 'float',
    });
  });

  test('query: only required params', async () => {
    const responsePromise = client.namespaces.query({ namespace: 'namespace' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('query: required and optional params', async () => {
    const response = await client.namespaces.query({
      namespace: 'namespace',
      consistency: { level: 'strong' },
      distance_metric: 'cosine_distance',
      filters: [{}],
      include_attributes: true,
      rank_by: [{}],
      top_k: 0,
      vector_encoding: 'float',
    });
  });

  test('updateSchema: only required params', async () => {
    const responsePromise = client.namespaces.updateSchema({ namespace: 'namespace' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('updateSchema: required and optional params', async () => {
    const response = await client.namespaces.updateSchema({
      namespace: 'namespace',
      body: { foo: { filterable: true, full_text_search: true, type: 'string' } },
    });
  });

  test('write: only required params', async () => {
    const responsePromise = client.namespaces.write({ namespace: 'namespace' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('write: required and optional params', async () => {
    const response = await client.namespaces.write({
      namespace: 'namespace',
      copy_from_namespace: 'copy_from_namespace',
      delete_by_filter: {},
      deletes: ['182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e'],
      distance_metric: 'cosine_distance',
      patch_columns: { id: ['182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e'] },
      patch_rows: [{ id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', vector: [0] }],
      schema: { foo: { filterable: true, full_text_search: true, type: 'string' } },
      upsert_columns: { id: ['182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e'] },
      upsert_rows: [{ id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', vector: [0] }],
    });
  });
});
