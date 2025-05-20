// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Turbopuffer from '@turbopuffer/turbopuffer';

const client = new Turbopuffer({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('top level methods', () => {
  test('listNamespaces', async () => {
    const responsePromise = client.listNamespaces();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('listNamespaces: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.listNamespaces(
        { cursor: 'cursor', page_size: 1, prefix: 'prefix' },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Turbopuffer.NotFoundError);
  });
});
