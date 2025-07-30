// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as NamespacesAPI from './namespaces';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';
import { AggregateBy, Filter, RankBy } from './custom';
import { ClientPerformance } from '../internal/custom/performance';
import { NotFoundError } from '../error';

export class Namespace extends APIResource {
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
   * Explain a query plan.
   */
  explainQuery(
    params: NamespaceExplainQueryParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceExplainQueryResponse> {
    const { namespace = this._client.defaultNamespace, ...body } = params ?? {};
    return this._client.post(path`/v2/namespaces/${namespace}/explain_query`, { body, ...options });
  }

  /**
   * Warm the cache for a namespace.
   */
  hintCacheWarm(
    params: NamespaceHintCacheWarmParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceHintCacheWarmResponse> {
    const { namespace = this._client.defaultNamespace } = params ?? {};
    return this._client.get(path`/v1/namespaces/${namespace}/hint_cache_warm`, options);
  }

  /**
   * Get metadata about a namespace.
   */
  metadata(
    params: NamespaceMetadataParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceMetadata> {
    const { namespace = this._client.defaultNamespace } = params ?? {};
    return this._client.get(path`/v1/namespaces/${namespace}/metadata`, options);
  }

  /**
   * Issue multiple concurrent queries filter or search documents.
   */
  multiQuery(
    params: NamespaceMultiQueryParams,
    options?: RequestOptions,
  ): APIPromise<NamespaceMultiQueryResponse> {
    const { namespace = this._client.defaultNamespace, ...body } = params;
    return this._client.post(path`/v2/namespaces/${namespace}/query?stainless_overload=multiQuery`, {
      body,
      ...options,
    });
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
   * Get namespace schema.
   */
  schema(
    params: NamespaceSchemaParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceSchemaResponse> {
    const { namespace = this._client.defaultNamespace } = params ?? {};
    return this._client.get(path`/v1/namespaces/${namespace}/schema`, options);
  }

  /**
   * Check whether the namespace exists.
   */
  async exists() {
    try {
      await this.schema();
      return true;
    } catch (e) {
      if (e instanceof NotFoundError) {
        return false;
      }
      throw e;
    }
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
   * Create, update, or delete documents.
   */
  write(
    params: NamespaceWriteParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceWriteResponse> {
    const { namespace = this._client.defaultNamespace, ...body } = params ?? {};
    return this._client.post(path`/v2/namespaces/${namespace}`, { body, maxRetries: 6, ...options });
  }
}

/**
 * The schema for an attribute attached to a document.
 */
export type AttributeSchema = AttributeType | AttributeSchemaConfig;

/**
 * Detailed configuration for an attribute attached to a document.
 */
export interface AttributeSchemaConfig {
  /**
   * Whether to create an approximate nearest neighbor index for the attribute.
   */
  ann?: boolean;

  /**
   * Whether or not the attributes can be used in filters.
   */
  filterable?: boolean;

  /**
   * Whether this attribute can be used as part of a BM25 full-text search. Requires
   * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
   * filterable. You can override this by setting `filterable: true`.
   */
  full_text_search?: FullTextSearch;

  /**
   * Whether to enable Regex filters on this attribute.
   */
  regex?: boolean;

  /**
   * The data type of the attribute. Valid values: string, int, uint, uuid, datetime,
   * bool, []string, []int, []uint, []uuid, []datetime, [DIMS]f16, [DIMS]f32.
   */
  type?: AttributeType;
}

/**
 * The data type of the attribute. Valid values: string, int, uint, uuid, datetime,
 * bool, []string, []int, []uint, []uuid, []datetime, [DIMS]f16, [DIMS]f32.
 */
export type AttributeType = string;

/**
 * A list of documents in columnar format. Each key is a column name, mapped to an
 * array of values for that column.
 */
export interface Columns {
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
 * A function used to calculate vector similarity.
 *
 * - `cosine_distance` - Defined as `1 - cosine_similarity` and ranges from 0 to 2.
 *   Lower is better.
 * - `euclidean_squared` - Defined as `sum((x - y)^2)`. Lower is better.
 */
export type DistanceMetric = 'cosine_distance' | 'euclidean_squared';

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
   * The `b` document length normalization parameter for BM25. Defaults to `0.75`.
   */
  b?: number;

  /**
   * Whether searching is case-sensitive. Defaults to `false` (i.e.
   * case-insensitive).
   */
  case_sensitive?: boolean;

  /**
   * The `k1` term saturation parameter for BM25. Defaults to `1.2`.
   */
  k1?: number;

  /**
   * Describes the language of a text attribute. Defaults to `english`.
   */
  language?: Language;

  /**
   * Maximum length of a token in bytes. Tokens larger than this value during
   * tokenization will be filtered out. Has to be between `1` and `254` (inclusive).
   * Defaults to `39`.
   */
  max_token_length?: number;

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

  /**
   * The tokenizer to use for full-text search on an attribute.
   */
  tokenizer?: Tokenizer;
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
 * Metadata about a namespace.
 */
export interface NamespaceMetadata {
  /**
   * The approximate number of logical bytes in the namespace.
   */
  approx_logical_bytes: number;

  /**
   * The approximate number of rows in the namespace.
   */
  approx_row_count: number;

  /**
   * The timestamp when the namespace was created.
   */
  created_at: string;

  /**
   * The schema of the namespace.
   */
  schema: { [key: string]: AttributeSchemaConfig };
}

/**
 * Query, filter, full-text search and vector search documents.
 */
export interface Query {
  /**
   * Aggregations to compute over all documents in the namespace that match the
   * filters.
   */
  aggregate_by?: Record<string, AggregateBy>;

  /**
   * A function used to calculate vector similarity.
   */
  distance_metric?: DistanceMetric;

  /**
   * List of attribute names to exclude from the response. All other attributes will
   * be included in the response.
   */
  exclude_attributes?: Array<string>;

  /**
   * Exact filters for attributes to refine search results for. Think of it as a SQL
   * WHERE clause.
   */
  filters?: Filter;

  /**
   * Whether to include attributes in the response.
   */
  include_attributes?: IncludeAttributes;

  /**
   * How to rank the documents in the namespace.
   */
  rank_by?: RankBy;

  /**
   * The number of results to return.
   */
  top_k?: number;
}

/**
 * The billing information for a query.
 */
export interface QueryBilling {
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
export interface QueryPerformance {
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

/**
 * A single document, in a row-based format.
 */
export interface Row {
  /**
   * An identifier for a document.
   */
  id: ID;

  /**
   * A vector embedding associated with a document.
   */
  vector?: Vector;

  /**
   * The ranking function's score for the document: distance from the query
   * vector for ANN, BM25 score for BM25, omitted when ordering by an attribute.
   */
  $dist?: number;

  [k: string]: unknown;
}

/**
 * The tokenizer to use for full-text search on an attribute.
 */
export type Tokenizer = 'pre_tokenized_array' | 'word_v0' | 'word_v1';

/**
 * A vector embedding associated with a document.
 */
export type Vector = Array<number> | string;

/**
 * The encoding to use for vectors in the response.
 */
export type VectorEncoding = 'float' | 'base64';

/**
 * The billing information for a write request.
 */
export interface WriteBilling {
  /**
   * The number of billable logical bytes written to the namespace.
   */
  billable_logical_bytes_written: number;

  /**
   * The billing information for a query.
   */
  query?: QueryBilling;
}

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
 * The response to a successful query explain.
 */
export interface NamespaceExplainQueryResponse {
  /**
   * The textual representation of the query plan.
   */
  plan_text?: string;
}

/**
 * The response to a successful cache warm request.
 */
export interface NamespaceHintCacheWarmResponse {
  /**
   * The status of the request.
   */
  status: 'OK';

  message?: string;
}

/**
 * The result of a multi-query.
 */
export interface NamespaceMultiQueryResponse {
  /**
   * The billing information for a query.
   */
  billing: QueryBilling;

  /**
   * The performance information for a query.
   */
  performance: QueryPerformance;

  results: Array<NamespaceMultiQueryResponse.Result>;
}

export namespace NamespaceMultiQueryResponse {
  export interface Result {
    aggregations?: { [key: string]: unknown };

    rows?: Array<NamespacesAPI.Row>;
  }
}

/**
 * The result of a query.
 */
export interface NamespaceQueryResponse {
  /**
   * The billing information for a query.
   */
  billing: QueryBilling;

  /**
   * The performance information for a query.
   */
  performance: QueryPerformance & ClientPerformance;

  aggregations?: { [key: string]: unknown };

  rows?: Array<Row>;
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
 * The response to a successful namespace schema request.
 */
export type NamespaceSchemaResponse = { [key: string]: AttributeSchemaConfig };

/**
 * The updated schema for the namespace.
 */
export type NamespaceUpdateSchemaResponse = { [key: string]: AttributeSchemaConfig };

/**
 * The response to a successful write request.
 */
export interface NamespaceWriteResponse {
  /**
   * The billing information for a write request.
   */
  billing: WriteBilling;

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

  /**
   * The number of rows deleted by the write request.
   */
  rows_deleted?: number;

  /**
   * The number of rows patched by the write request.
   */
  rows_patched?: number;

  /**
   * The number of rows upserted by the write request.
   */
  rows_upserted?: number;
}

export interface NamespaceDeleteAllParams {
  /**
   * The name of the namespace.
   */
  namespace?: string;
}

export interface NamespaceExplainQueryParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: Aggregations to compute over all documents in the namespace that
   * match the filters.
   */
  aggregate_by?: { [key: string]: unknown };

  /**
   * Body param: The consistency level for a query.
   */
  consistency?: NamespaceExplainQueryParams.Consistency;

  /**
   * Body param: A function used to calculate vector similarity.
   */
  distance_metric?: DistanceMetric;

  /**
   * Body param: List of attribute names to exclude from the response. All other
   * attributes will be included in the response.
   */
  exclude_attributes?: Array<string>;

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
   * Body param: How to rank the documents in the namespace.
   */
  rank_by?: unknown;

  /**
   * Body param: The number of results to return.
   */
  top_k?: number;

  /**
   * Body param: The encoding to use for vectors in the response.
   */
  vector_encoding?: VectorEncoding;
}

export namespace NamespaceExplainQueryParams {
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

export interface NamespaceHintCacheWarmParams {
  /**
   * The name of the namespace.
   */
  namespace?: string;
}

export interface NamespaceMetadataParams {
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
   * Body param:
   */
  queries: Array<Query>;

  /**
   * Body param: The consistency level for a query.
   */
  consistency?: NamespaceMultiQueryParams.Consistency;

  /**
   * Body param: The encoding to use for vectors in the response.
   */
  vector_encoding?: VectorEncoding;
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
}

export interface NamespaceQueryParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: Aggregations to compute over all documents in the namespace that
   * match the filters.
   */
  aggregate_by?: Record<string, AggregateBy>;

  /**
   * Body param: The consistency level for a query.
   */
  consistency?: NamespaceQueryParams.Consistency;

  /**
   * Body param: A function used to calculate vector similarity.
   */
  distance_metric?: DistanceMetric;

  /**
   * Body param: List of attribute names to exclude from the response. All other
   * attributes will be included in the response.
   */
  exclude_attributes?: Array<string>;

  /**
   * Body param: Exact filters for attributes to refine search results for. Think of
   * it as a SQL WHERE clause.
   */
  filters?: Filter;

  /**
   * Body param: Whether to include attributes in the response.
   */
  include_attributes?: IncludeAttributes;

  /**
   * Body param: How to rank the documents in the namespace.
   */
  rank_by?: RankBy;

  /**
   * Body param: The number of results to return.
   */
  top_k?: number;

  /**
   * Body param: The encoding to use for vectors in the response.
   */
  vector_encoding?: VectorEncoding;
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

export interface NamespaceSchemaParams {
  /**
   * The name of the namespace.
   */
  namespace?: string;
}

export interface NamespaceUpdateSchemaParams {
  /**
   * Path param: The name of the namespace.
   */
  namespace?: string;

  /**
   * Body param: The desired schema for the namespace.
   */
  schema?: { [key: string]: AttributeSchema };
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
  delete_by_filter?: Filter;

  /**
   * Body param: A condition evaluated against the current value of each document
   * targeted by a delete write. Only documents that pass the condition are deleted.
   */
  delete_condition?: Filter;

  /**
   * Body param:
   */
  deletes?: Array<ID>;

  /**
   * Body param: A function used to calculate vector similarity.
   */
  distance_metric?: DistanceMetric;

  /**
   * Body param: The encryption configuration for a namespace.
   */
  encryption?: NamespaceWriteParams.Encryption;

  /**
   * Body param: A list of documents in columnar format. Each key is a column name,
   * mapped to an array of values for that column.
   */
  patch_columns?: Columns;

  /**
   * Body param: A condition evaluated against the current value of each document
   * targeted by a patch write. Only documents that pass the condition are patched.
   */
  patch_condition?: Filter;

  /**
   * Body param:
   */
  patch_rows?: Array<Row>;

  /**
   * Body param: The schema of the attributes attached to the documents.
   */
  schema?: { [key: string]: AttributeSchema };

  /**
   * Body param: A list of documents in columnar format. Each key is a column name,
   * mapped to an array of values for that column.
   */
  upsert_columns?: Columns;

  /**
   * Body param: A condition evaluated against the current value of each document
   * targeted by an upsert write. Only documents that pass the condition are
   * upserted.
   */
  upsert_condition?: Filter;

  /**
   * Body param:
   */
  upsert_rows?: Array<Row>;
}

export namespace NamespaceWriteParams {
  /**
   * The encryption configuration for a namespace.
   */
  export interface Encryption {
    cmek?: Encryption.Cmek;
  }

  export namespace Encryption {
    export interface Cmek {
      /**
       * The identifier of the CMEK key to use for encryption. For GCP, the
       * fully-qualified resource name of the key. For AWS, the ARN of the key.
       */
      key_name: string;
    }
  }
}

export declare namespace Namespaces {
  export {
    type AttributeSchema as AttributeSchema,
    type AttributeSchemaConfig as AttributeSchemaConfig,
    type AttributeType as AttributeType,
    type Columns as Columns,
    type DistanceMetric as DistanceMetric,
    type FullTextSearch as FullTextSearch,
    type FullTextSearchConfig as FullTextSearchConfig,
    type ID as ID,
    type IncludeAttributes as IncludeAttributes,
    type Language as Language,
    type NamespaceMetadata as NamespaceMetadata,
    type Query as Query,
    type QueryBilling as QueryBilling,
    type QueryPerformance as QueryPerformance,
    type Row as Row,
    type Tokenizer as Tokenizer,
    type Vector as Vector,
    type VectorEncoding as VectorEncoding,
    type WriteBilling as WriteBilling,
    type NamespaceDeleteAllResponse as NamespaceDeleteAllResponse,
    type NamespaceExplainQueryResponse as NamespaceExplainQueryResponse,
    type NamespaceHintCacheWarmResponse as NamespaceHintCacheWarmResponse,
    type NamespaceMultiQueryResponse as NamespaceMultiQueryResponse,
    type NamespaceQueryResponse as NamespaceQueryResponse,
    type NamespaceRecallResponse as NamespaceRecallResponse,
    type NamespaceSchemaResponse as NamespaceSchemaResponse,
    type NamespaceUpdateSchemaResponse as NamespaceUpdateSchemaResponse,
    type NamespaceWriteResponse as NamespaceWriteResponse,
    type NamespaceDeleteAllParams as NamespaceDeleteAllParams,
    type NamespaceExplainQueryParams as NamespaceExplainQueryParams,
    type NamespaceHintCacheWarmParams as NamespaceHintCacheWarmParams,
    type NamespaceMetadataParams as NamespaceMetadataParams,
    type NamespaceMultiQueryParams as NamespaceMultiQueryParams,
    type NamespaceQueryParams as NamespaceQueryParams,
    type NamespaceRecallParams as NamespaceRecallParams,
    type NamespaceSchemaParams as NamespaceSchemaParams,
    type NamespaceUpdateSchemaParams as NamespaceUpdateSchemaParams,
    type NamespaceWriteParams as NamespaceWriteParams,
  };
}
