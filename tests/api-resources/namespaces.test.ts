// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Turbopuffer from '@turbopuffer/turbopuffer';

const client = new Turbopuffer({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource namespaces', () => {
  // skipped: tests are disabled for the time being
  test.skip('list', async () => {
    const responsePromise = client.namespaces.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.namespaces.list(
        { cursor: 'cursor', page_size: 1, prefix: 'prefix' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Turbopuffer.NotFoundError);
  });

  // skipped: tests are disabled for the time being
  test.skip('deleteAll', async () => {
    const responsePromise = client.namespaces.deleteAll('namespace');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('getSchema', async () => {
    const responsePromise = client.namespaces.getSchema('namespace');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('query', async () => {
    const responsePromise = client.namespaces.query('namespace');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('query: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.namespaces.query(
        'namespace',
        {
          consistency: { level: 'strong' },
          distance_metric: 'cosine_distance',
          filter: {},
          include_attributes: true,
          include_vectors: true,
          rank_by: {},
          top_k: 0,
          vector: [0],
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Turbopuffer.NotFoundError);
  });

  // skipped: tests are disabled for the time being
  test.skip('upsert: only required params', async () => {
    const responsePromise = client.namespaces.upsert('namespace', {
      documents: { distance_metric: 'cosine_distance' },
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('upsert: required and optional params', async () => {
    const response = await client.namespaces.upsert('namespace', {
      documents: {
        attributes: { foo: [{ foo: 'bar' }] },
        ids: ['182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e'],
        vectors: [[0]],
        distance_metric: 'cosine_distance',
        schema: { foo: [{ filterable: true, full_text_search: true, type: 'string' }] },
      },
    });
  });
});
