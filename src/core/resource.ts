// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { Turbopuffer } from '../client';

export abstract class APIResource {
  protected _client: Turbopuffer;

  constructor(client: Turbopuffer) {
    this._client = client;
  }
}
