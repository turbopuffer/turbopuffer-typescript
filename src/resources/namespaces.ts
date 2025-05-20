// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as NamespacesAPI from './namespaces';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Namespaces extends APIResource {
  /**
   * Delete namespace.
   */
  deleteAll(
    params: NamespaceDeleteAllParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceDeleteAllResponse> {
    const { namespace = this._client.defaultNamespace } = params ?? {};
    return this._client.delete(path`/v2/namespaces/${namespace}`, options);
  }

  /**
   * Export documents.
   */
  export(
    params: NamespaceExportParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceExportResponse> {
    const { namespace = this._client.defaultNamespace, ...query } = params ?? {};
    return this._client.get(path`/v1/namespaces/${namespace}`, { query, ...options });
  }

  /**
   * Get namespace schema.
   */
  getSchema(
    params: NamespaceGetSchemaParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceGetSchemaResponse> {
    const { namespace = this._client.defaultNamespace } = params ?? {};
    return this._client.get(path`/v1/namespaces/${namespace}/schema`, options);
  }

  /**
   * Send multiple queries at once.
   */
  multiQuery(
    params: NamespaceMultiQueryParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceMultiQueryResponse> {
    const { namespace = this._client.defaultNamespace, ...body } = params ?? {};
    return this._client.post(path`/v2/namespaces/${namespace}/query?overload=multi`, { body, ...options });
  }

  /**
   * Query, filter, full-text search and vector search documents.
   */
  query(
    params: NamespaceQueryParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceQueryResponse> {
    const { namespace = this._client.defaultNamespace, ...body } = params ?? {};
    return this._client.post(path`/v2/namespaces/${namespace}/query`, { body, ...options });
  }

  /**
   * Update namespace schema.
   */
  updateSchema(
    params: NamespaceUpdateSchemaParams | null | undefined = undefined,
    options?: RequestOptions,
  ): APIPromise<NamespaceUpdateSchemaResponse> {
    const { namespace = this._client.defaultNamespace, body } = params ?? {};
    return this._client.post(path`/v1/namespaces/${namespace}/schema`, { body: body, ...options });
  }

  /**
   * Create, update, or delete documents.
   */
  write(
    params: NamespaceWriteParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceWriteResponse> {
    const { namespace = this._client.defaultNamespace, ...body } = params ?? {};
    return this._client.post(path`/v2/namespaces/${namespace}`, { body, ...options });
  }
}

/**
 * The schema for an attribute attached to a document.
 */
export interface AttributeSchema {
  /**
   * Whether or not the attributes can be used in filters/WHERE clauses.
   */
  filterable?: boolean;

  /**
   * Whether this attribute can be used as part of a BM25 full-text search. Requires
   * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
   * filterable. You can override this by setting `filterable: true`.
   */
  full_text_search?: boolean | FullTextSearchConfig;

  /**
   * The data type of the attribute.
   *
   * - `string` - A string.
   * - `uint` - An unsigned integer.
   * - `uuid` - A UUID.
   * - `bool` - A boolean.
   * - `datetime` - A date and time.
   * - `[]string` - An array of strings.
   * - `[]uint` - An array of unsigned integers.
   * - `[]uuid` - An array of UUIDs.
   * - `[]datetime` - An array of date and time values.
   */
  type?: 'string' | 'uint' | 'uuid' | 'bool' | 'datetime' | '[]string' | '[]uint' | '[]uuid' | '[]datetime';
}

/**
 * A function used to calculate vector similarity.
 *
 * - `cosine_distance` - Defined as `1 - cosine_similarity` and ranges from 0 to 2.
 *   Lower is better.
 * - `euclidean_squared` - Defined as `sum((x - y)^2)`. Lower is better.
 */
export type DistanceMetric = 'cosine_distance' | 'euclidean_squared';

/**
 * A list of documents in columnar format. The keys are the column names.
 */
export interface DocumentColumns {
  /**
   * The IDs of the documents.
   */
  id?: Array<ID>;

  [k: string]: Array<unknown> | Array<ID> | undefined;
}

/**
 * A single document, in a row-based format.
 */
export interface DocumentRow {
  /**
   * An identifier for a document.
   */
  id?: ID;

  /**
   * A vector describing the document.
   */
  vector?: Array<number> | string | null;

  [k: string]: unknown;
}

/**
 * Detailed configuration options for BM25 full-text search.
 */
export interface FullTextSearchConfig {
  /**
   * Whether searching is case-sensitive. Defaults to `false` (i.e.
   * case-insensitive).
   */
  case_sensitive?: boolean;

  /**
   * The language of the text. Defaults to `english`.
   */
  language?:
    | 'arabic'
    | 'danish'
    | 'dutch'
    | 'english'
    | 'finnish'
    | 'french'
    | 'german'
    | 'greek'
    | 'hungarian'
    | 'italian'
    | 'norwegian'
    | 'portuguese'
    | 'romanian'
    | 'russian'
    | 'spanish'
    | 'swedish'
    | 'tamil'
    | 'turkish';

  /**
   * Removes common words from the text based on language. Defaults to `true` (i.e.
   * remove common words).
   */
  remove_stopwords?: boolean;

  /**
   * Language-specific stemming for the text. Defaults to `false` (i.e., do not
   * stem).
   */
  stemming?: boolean;
}

/**
 * An identifier for a document.
 */
export type ID = string | number;

/**
 * The response to a successful namespace deletion request.
 */
export interface NamespaceDeleteAllResponse {
  /**
   * The status of the request.
   */
  status: 'OK';
}

/**
 * A list of documents in columnar format. The keys are the column names.
 */
export interface NamespaceExportResponse extends DocumentColumns {
  /**
   * The cursor to use to retrieve the next page of results.
   */
  next_cursor?: string;
}

/**
 * The response to a successful namespace schema request.
 */
export type NamespaceGetSchemaResponse = Record<string, AttributeSchema>;

export interface NamespaceMultiQueryResponse {
  results: Array<NamespaceMultiQueryResponse.Result>;
}

export namespace NamespaceMultiQueryResponse {
  /**
   * The result of a query.
   */
  export interface Result {
    aggregations?: Array<Record<string, unknown>>;

    rows?: Array<NamespacesAPI.DocumentRow>;
  }
}

/**
 * The result of a query.
 */
export interface NamespaceQueryResponse {
  aggregations?: Array<Record<string, unknown>>;

  rows?: Array<DocumentRow>;
}

/**
 * The updated schema for the namespace.
 */
export type NamespaceUpdateSchemaResponse = Record<string, AttributeSchema>;

/**
 * The response to a successful upsert request.
 */
export interface NamespaceWriteResponse {
  /**
   * The status of the request.
   */
  status: 'OK';
}

export interface NamespaceDeleteAllParams {
  /**
   * The name of the namespace.
   */
  namespace?: string;
}

export interface NamespaceExportParams {
  /**
   * Path param:
   */
  namespace?: string;

  /**
   * Query param: Retrieve the next page of results.
   */
  cursor?: string;
}

export interface NamespaceGetSchemaParams {
  /**
   * The name of the namespace.
   */
  namespace?: string;
}

export interface NamespaceMultiQueryParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: The consistency level for a query.
   */
  consistency?: NamespaceMultiQueryParams.Consistency;

  /**
   * Body param:
   */
  queries?: Array<NamespaceMultiQueryParams.Query>;

  /**
   * Body param: The encoding to use for vectors in the response.
   */
  vector_encoding?: 'float' | 'base64';
}

export namespace NamespaceMultiQueryParams {
  /**
   * The consistency level for a query.
   */
  export interface Consistency {
    /**
     * The query's consistency level.
     *
     * - `strong` - Strong consistency. Requires a round-trip to object storage to
     *   fetch the latest writes.
     * - `eventual` - Eventual consistency. Does not require a round-trip to object
     *   storage, but may not see the latest writes.
     */
    level?: 'strong' | 'eventual';
  }

  /**
   * Query, filter, full-text search and vector search documents.
   */
  export interface Query {
    /**
     * A function used to calculate vector similarity.
     */
    distance_metric?: NamespacesAPI.DistanceMetric;

    filters?: Array<unknown> | Array<unknown> | Array<unknown> | Array<unknown>;

    /**
     * Whether to include attributes in the response.
     */
    include_attributes?: boolean | Array<string>;

    rank_by?:
      | Array<unknown>
      | Array<unknown>
      | Array<unknown>
      | Array<unknown>
      | Array<unknown>
      | Array<unknown>
      | Array<unknown>;

    /**
     * The number of results to return.
     */
    top_k?: number;
  }
}

export interface NamespaceQueryParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: The consistency level for a query.
   */
  consistency?: NamespaceQueryParams.Consistency;

  /**
   * Body param: A function used to calculate vector similarity.
   */
  distance_metric?: DistanceMetric;

  /**
   * Body param:
   */
  filters?: Array<unknown> | Array<unknown> | Array<unknown> | Array<unknown>;

  /**
   * Body param: Whether to include attributes in the response.
   */
  include_attributes?: boolean | Array<string>;

  /**
   * Body param:
   */
  rank_by?:
    | Array<unknown>
    | Array<unknown>
    | Array<unknown>
    | Array<unknown>
    | Array<unknown>
    | Array<unknown>
    | Array<unknown>;

  /**
   * Body param: The number of results to return.
   */
  top_k?: number;

  /**
   * Body param: The encoding to use for vectors in the response.
   */
  vector_encoding?: 'float' | 'base64';
}

export namespace NamespaceQueryParams {
  /**
   * The consistency level for a query.
   */
  export interface Consistency {
    /**
     * The query's consistency level.
     *
     * - `strong` - Strong consistency. Requires a round-trip to object storage to
     *   fetch the latest writes.
     * - `eventual` - Eventual consistency. Does not require a round-trip to object
     *   storage, but may not see the latest writes.
     */
    level?: 'strong' | 'eventual';
  }
}

export interface NamespaceUpdateSchemaParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: The desired schema for the namespace.
   */
  body?: Record<string, AttributeSchema>;
}

export interface NamespaceWriteParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: The namespace to copy documents from.
   */
  copy_from_namespace?: string;

  /**
   * Body param: The filter specifying which documents to delete.
   */
  delete_by_filter?: unknown;

  /**
   * Body param:
   */
  deletes?: Array<ID>;

  /**
   * Body param: A function used to calculate vector similarity.
   */
  distance_metric?: DistanceMetric;

  /**
   * Body param: A list of documents in columnar format. The keys are the column
   * names.
   */
  patch_columns?: DocumentColumns;

  /**
   * Body param:
   */
  patch_rows?: Array<DocumentRow>;

  /**
   * Body param: The schema of the attributes attached to the documents.
   */
  schema?: Record<string, AttributeSchema>;

  /**
   * Body param: A list of documents in columnar format. The keys are the column
   * names.
   */
  upsert_columns?: DocumentColumns;

  /**
   * Body param:
   */
  upsert_rows?: Array<DocumentRow>;
}

export declare namespace Namespaces {
  export {
    type AttributeSchema as AttributeSchema,
    type DistanceMetric as DistanceMetric,
    type DocumentColumns as DocumentColumns,
    type DocumentRow as DocumentRow,
    type FullTextSearchConfig as FullTextSearchConfig,
    type ID as ID,
    type NamespaceDeleteAllResponse as NamespaceDeleteAllResponse,
    type NamespaceExportResponse as NamespaceExportResponse,
    type NamespaceGetSchemaResponse as NamespaceGetSchemaResponse,
    type NamespaceMultiQueryResponse as NamespaceMultiQueryResponse,
    type NamespaceQueryResponse as NamespaceQueryResponse,
    type NamespaceUpdateSchemaResponse as NamespaceUpdateSchemaResponse,
    type NamespaceWriteResponse as NamespaceWriteResponse,
    type NamespaceDeleteAllParams as NamespaceDeleteAllParams,
    type NamespaceExportParams as NamespaceExportParams,
    type NamespaceGetSchemaParams as NamespaceGetSchemaParams,
    type NamespaceMultiQueryParams as NamespaceMultiQueryParams,
    type NamespaceQueryParams as NamespaceQueryParams,
    type NamespaceUpdateSchemaParams as NamespaceUpdateSchemaParams,
    type NamespaceWriteParams as NamespaceWriteParams,
  };
}
