// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Namespaces extends APIResource {
  /**
   * Retrieve metadata for a specific namespace.
   */
  retrieve(namespace: string, options?: RequestOptions): APIPromise<NamespaceRetrieveResponse> {
    return this._client.get(path`/v1/namespaces/${namespace}`, options);
  }

  /**
   * Retrieve a list of all namespaces.
   */
  list(options?: RequestOptions): APIPromise<NamespaceListResponse> {
    return this._client.get('/v1/namespaces', options);
  }

  /**
   * Searches documents in a namespace using a vector (and optionally attribute
   * filters). Provide a query vector, filters, ranking, and other parameters to
   * retrieve matching documents.
   */
  query(
    namespace: string,
    body: NamespaceQueryParams,
    options?: RequestOptions,
  ): APIPromise<NamespaceQueryResponse> {
    return this._client.post(path`/v1/namespaces/${namespace}/query`, { body, ...options });
  }

  /**
   * Creates, updates, or deletes documents in a namespace. Documents are upserted in
   * a column-oriented format (using `ids`, `vectors`, `attributes`, etc.) or in a
   * row-based format (using `upserts`). To delete a document, send a `null` vector.
   */
  upsert(
    namespace: string,
    body: NamespaceUpsertParams,
    options?: RequestOptions,
  ): APIPromise<NamespaceUpsertResponse> {
    return this._client.post(path`/v1/namespaces/${namespace}`, { body, ...options });
  }
}

export interface NamespaceRetrieveResponse {
  approx_count?: number;

  dimensions?: number;

  name?: string;
}

export type NamespaceListResponse = Array<NamespaceListResponse.NamespaceListResponseItem>;

export namespace NamespaceListResponse {
  export interface NamespaceListResponseItem {
    approx_count?: number;

    dimensions?: number;

    name?: string;
  }
}

export interface NamespaceQueryResponse {
  /**
   * Array of search result objects.
   */
  vectors?: Array<NamespaceQueryResponse.Vector>;
}

export namespace NamespaceQueryResponse {
  export interface Vector {
    id?: string | number;

    attributes?: unknown;

    /**
     * The distance (or relevance) score.
     */
    dist?: number;

    vector?: Array<number>;
  }
}

export interface NamespaceUpsertResponse {
  status?: string;
}

export interface NamespaceQueryParams {
  /**
   * Consistency level for the query.
   */
  consistency?: NamespaceQueryParams.Consistency;

  /**
   * Required if a query vector is provided.
   */
  distance_metric?: 'cosine_distance' | 'euclidean_squared';

  /**
   * Filters to narrow down search results (e.g., attribute conditions).
   */
  filters?: unknown | Array<unknown>;

  /**
   * A list of attribute names to return or `true` to include all attributes.
   */
  include_attributes?: Array<string> | boolean;

  /**
   * Whether to include the stored vectors in the response.
   */
  include_vectors?: boolean;

  /**
   * Parameter to order results (either BM25 for full-text search or attribute-based
   * ordering).
   */
  rank_by?: Array<string>;

  /**
   * Number of results to return.
   */
  top_k?: number;

  /**
   * The query vector.
   */
  vector?: Array<number>;
}

export namespace NamespaceQueryParams {
  /**
   * Consistency level for the query.
   */
  export interface Consistency {
    level?: 'strong' | 'eventual';
  }
}

export type NamespaceUpsertParams = NamespaceUpsertParams.Variant0 | NamespaceUpsertParams.Variant1;

export declare namespace NamespaceUpsertParams {
  export interface Variant0 {
    /**
     * The function used to calculate vector similarity.
     */
    distance_metric: 'cosine_distance' | 'euclidean_squared';

    /**
     * Array of document IDs (unsigned 64-bit integers, UUIDs, or strings).
     */
    ids: Array<number | string>;

    /**
     * Array of vectors. Each vector is an array of numbers. Use `null` to delete a
     * document.
     */
    vectors: Array<Array<number> | null>;

    /**
     * Object mapping attribute names to arrays of attribute values.
     */
    attributes?: Record<string, Array<unknown>>;

    /**
     * Copy all documents from another namespace into this one.
     */
    copy_from_namespace?: string;

    /**
     * Manually specify the schema for the documents.
     */
    schema?: unknown;
  }

  export interface Variant1 {
    /**
     * Array of document operations in row-based format.
     */
    upserts: Array<Variant1.Upsert>;
  }

  export namespace Variant1 {
    export interface Upsert {
      /**
       * Document ID.
       */
      id: number | string;

      /**
       * Object mapping attribute names to values.
       */
      attributes?: unknown;

      /**
       * Document vector. Use `null` to indicate deletion.
       */
      vector?: Array<number> | null;
    }
  }
}

export declare namespace Namespaces {
  export {
    type NamespaceRetrieveResponse as NamespaceRetrieveResponse,
    type NamespaceListResponse as NamespaceListResponse,
    type NamespaceQueryResponse as NamespaceQueryResponse,
    type NamespaceUpsertResponse as NamespaceUpsertResponse,
    type NamespaceQueryParams as NamespaceQueryParams,
    type NamespaceUpsertParams as NamespaceUpsertParams,
  };
}
