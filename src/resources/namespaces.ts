// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
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
   * Query, filter, full-text search and vector search documents.
   */
  query(params: NamespaceQueryParams, options?: RequestOptions): APIPromise<NamespaceQueryResponse> {
    const { namespace = this._client.defaultNamespace, ...body } = params;
    return this._client.post(path`/v2/namespaces/${namespace}/query`, { body, ...options });
  }

  /**
   * Evaluate recall.
   */
  recall(
    params: NamespaceRecallParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceRecallResponse> {
    const { namespace = this._client.defaultNamespace, ...body } = params ?? {};
    return this._client.post(path`/v1/namespaces/${namespace}/_debug/recall`, { body, ...options });
  }

  /**
   * Update namespace schema.
   */
  updateSchema(
    params: NamespaceUpdateSchemaParams | null | undefined = undefined,
    options?: RequestOptions,
  ): APIPromise<NamespaceUpdateSchemaResponse> {
    const { namespace = this._client.defaultNamespace, schema } = params ?? {};
    return this._client.post(path`/v1/namespaces/${namespace}/schema`, { body: schema, ...options });
  }

  /**
   * Warm the cache for a namespace.
   */
  warmCache(
    params: NamespaceWarmCacheParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceWarmCacheResponse> {
    const { namespace = this._client.defaultNamespace } = params ?? {};
    return this._client.get(path`/v1/namespaces/${namespace}/hint_cache_warm`, options);
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
   * Configuration options for full-text search.
   */
  full_text_search?: FullTextSearchConfig;

  /**
   * The data type of the attribute.
   */
  type?: AttributeType;
}

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
export type AttributeType =
  | 'string'
  | 'uint'
  | 'uuid'
  | 'bool'
  | 'datetime'
  | '[]string'
  | '[]uint'
  | '[]uuid'
  | '[]datetime';

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
  id: Array<ID>;

  /**
   * The vector embeddings of the documents.
   */
  vector?: Array<Vector> | Array<number> | string;

  [k: string]: Array<unknown> | Array<ID> | Array<Vector> | Array<number> | string | undefined;
}

/**
 * A single document, in a row-based format.
 */
export interface DocumentRow {
  /**
   * An identifier for a document.
   */
  id: ID;

  /**
   * A vector embedding associated with a document.
   */
  vector?: Vector;

  [k: string]: unknown;
}

/**
 * Whether this attribute can be used as part of a BM25 full-text search. Requires
 * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
 * filterable. You can override this by setting `filterable: true`.
 */
export type FullTextSearch = boolean | FullTextSearchConfig;

/**
 * Configuration options for full-text search.
 */
export interface FullTextSearchConfig {
  /**
   * Whether searching is case-sensitive. Defaults to `false` (i.e.
   * case-insensitive).
   */
  case_sensitive?: boolean;

  /**
   * Describes the language of a text attribute. Defaults to `english`.
   */
  language?: Language;

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
 * Whether to include attributes in the response.
 */
export type IncludeAttributes = boolean | Array<string>;

/**
 * Describes the language of a text attribute. Defaults to `english`.
 */
export type Language =
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
 * A vector embedding associated with a document.
 */
export type Vector = Array<number> | string;

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
 * The response to a successful namespace schema request.
 */
export type NamespaceGetSchemaResponse = Record<string, AttributeSchema>;

/**
 * The result of a query.
 */
export interface NamespaceQueryResponse {
  aggregations?: Array<Record<string, unknown>>;

  /**
   * The billing information for a query.
   */
  billing?: NamespaceQueryResponse.Billing;

  /**
   * The performance information for a query.
   */
  performance?: NamespaceQueryResponse.Performance;

  rows?: Array<DocumentRow>;
}

export namespace NamespaceQueryResponse {
  /**
   * The billing information for a query.
   */
  export interface Billing {
    /**
     * The number of billable logical bytes queried from the namespace.
     */
    billable_logical_bytes_queried: number;

    /**
     * The number of billable logical bytes returned from the query.
     */
    billable_logical_bytes_returned: number;
  }

  /**
   * The performance information for a query.
   */
  export interface Performance {
    /**
     * the approximate number of documents in the namespace.
     */
    approx_namespace_size: number;

    /**
     * The ratio of cache hits to total cache lookups.
     */
    cache_hit_ratio: number;

    /**
     * A qualitative description of the cache hit ratio (`hot`, `warm`, or `cold`).
     */
    cache_temperature: string;

    /**
     * The number of unindexed documents processed by the query.
     */
    exhaustive_search_count: number;

    /**
     * Request time measured on the server, excluding time spent waiting due to the
     * namespace concurrency limit.
     */
    query_execution_ms: number;

    /**
     * Request time measured on the server, including time spent waiting for other
     * queries to complete if the namespace was at its concurrency limit.
     */
    server_total_ms: number;
  }
}

/**
 * The response to a successful cache warm request.
 */
export interface NamespaceRecallResponse {
  /**
   * The average number of documents retrieved by the approximate nearest neighbor
   * searches.
   */
  avg_ann_count: number;

  /**
   * The average number of documents retrieved by the exhaustive searches.
   */
  avg_exhaustive_count: number;

  /**
   * The average recall of the queries.
   */
  avg_recall: number;
}

/**
 * The updated schema for the namespace.
 */
export type NamespaceUpdateSchemaResponse = Record<string, AttributeSchema>;

/**
 * The response to a successful cache warm request.
 */
export interface NamespaceWarmCacheResponse {
  /**
   * The status of the request.
   */
  status: 'OK';

  message?: string;
}

/**
 * The response to a successful write request.
 */
export interface NamespaceWriteResponse {
  billing: NamespaceWriteResponse.Billing;

  /**
   * A message describing the result of the write request.
   */
  message: string;

  /**
   * The number of rows affected by the write request.
   */
  rows_affected: number;

  /**
   * The status of the request.
   */
  status: 'OK';
}

export namespace NamespaceWriteResponse {
  export interface Billing {
    /**
     * The number of billable logical bytes written to the namespace.
     */
    billable_logical_bytes_written: number;

    /**
     * The billing information for a query.
     */
    query?: Billing.Query;
  }

  export namespace Billing {
    /**
     * The billing information for a query.
     */
    export interface Query {
      /**
       * The number of billable logical bytes queried from the namespace.
       */
      billable_logical_bytes_queried: number;

      /**
       * The number of billable logical bytes returned from the query.
       */
      billable_logical_bytes_returned: number;
    }
  }
}

export interface NamespaceDeleteAllParams {
  /**
   * The name of the namespace.
   */
  namespace?: string;
}

export interface NamespaceGetSchemaParams {
  /**
   * The name of the namespace.
   */
  namespace?: string;
}

export interface NamespaceQueryParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: How to rank the documents in the namespace.
   */
  rank_by: unknown;

  /**
   * Body param: The number of results to return.
   */
  top_k: number;

  /**
   * Body param: The consistency level for a query.
   */
  consistency?: NamespaceQueryParams.Consistency;

  /**
   * Body param: A function used to calculate vector similarity.
   */
  distance_metric?: DistanceMetric;

  /**
   * Body param: Exact filters for attributes to refine search results for. Think of
   * it as a SQL WHERE clause.
   */
  filters?: unknown;

  /**
   * Body param: Whether to include attributes in the response.
   */
  include_attributes?: IncludeAttributes;

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

export interface NamespaceRecallParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: Filter by attributes. Same syntax as the query endpoint.
   */
  filters?: unknown;

  /**
   * Body param: The number of searches to run.
   */
  num?: number;

  /**
   * Body param: Use specific query vectors for the measurement. If omitted, sampled
   * from the index.
   */
  queries?: Array<number>;

  /**
   * Body param: Search for `top_k` nearest neighbors.
   */
  top_k?: number;
}

export interface NamespaceUpdateSchemaParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: The desired schema for the namespace.
   */
  schema?: Record<string, AttributeSchema>;
}

export interface NamespaceWarmCacheParams {
  /**
   * The name of the namespace.
   */
  namespace?: string;
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
    type AttributeType as AttributeType,
    type DistanceMetric as DistanceMetric,
    type DocumentColumns as DocumentColumns,
    type DocumentRow as DocumentRow,
    type FullTextSearch as FullTextSearch,
    type FullTextSearchConfig as FullTextSearchConfig,
    type ID as ID,
    type IncludeAttributes as IncludeAttributes,
    type Language as Language,
    type Vector as Vector,
    type NamespaceDeleteAllResponse as NamespaceDeleteAllResponse,
    type NamespaceGetSchemaResponse as NamespaceGetSchemaResponse,
    type NamespaceQueryResponse as NamespaceQueryResponse,
    type NamespaceRecallResponse as NamespaceRecallResponse,
    type NamespaceUpdateSchemaResponse as NamespaceUpdateSchemaResponse,
    type NamespaceWarmCacheResponse as NamespaceWarmCacheResponse,
    type NamespaceWriteResponse as NamespaceWriteResponse,
    type NamespaceDeleteAllParams as NamespaceDeleteAllParams,
    type NamespaceGetSchemaParams as NamespaceGetSchemaParams,
    type NamespaceQueryParams as NamespaceQueryParams,
    type NamespaceRecallParams as NamespaceRecallParams,
    type NamespaceUpdateSchemaParams as NamespaceUpdateSchemaParams,
    type NamespaceWarmCacheParams as NamespaceWarmCacheParams,
    type NamespaceWriteParams as NamespaceWriteParams,
  };
}
