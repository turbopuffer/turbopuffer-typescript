// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as NamespacesAPI from './namespaces';
import { APIPromise } from '../core/api-promise';
import { ListNamespaces, type ListNamespacesParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Namespaces extends APIResource {
  /**
   * List namespaces.
   */
  list(
    query: NamespaceListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<NamespaceSummariesListNamespaces, NamespaceSummary> {
    return this._client.getAPIList('/v1/namespaces', ListNamespaces<NamespaceSummary>, { query, ...options });
  }

  /**
   * Delete namespace.
   */
  deleteAll(namespace: string, options?: RequestOptions): APIPromise<NamespaceDeleteAllResponse> {
    return this._client.delete(path`/v2/namespaces/${namespace}`, options);
  }

  /**
   * Get namespace schema.
   */
  getSchema(namespace: string, options?: RequestOptions): APIPromise<NamespaceGetSchemaResponse> {
    return this._client.get(path`/v1/namespaces/${namespace}/schema`, options);
  }

  /**
   * Query, filter, full-text search and vector search documents.
   */
  query(
    namespace: string,
    body: NamespaceQueryParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceQueryResponse> {
    return this._client.post(path`/v1/namespaces/${namespace}/query`, { body, ...options });
  }

  /**
   * Create, update, or delete documents.
   */
  write(
    namespace: string,
    params: NamespaceWriteParams | null | undefined = undefined,
    options?: RequestOptions,
  ): APIPromise<NamespaceWriteResponse> {
    const { write } = params ?? {};
    return this._client.post(path`/v1/namespaces/${namespace}`, { body: write, ...options });
  }
}

// Namespace pagination.
export type NamespaceSummariesListNamespaces = ListNamespaces<NamespaceSummary>;

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
   * - `[]string` - An array of strings.
   * - `[]uint` - An array of unsigned integers.
   * - `[]uuid` - An array of UUIDs.
   */
  type?: 'string' | 'uint' | 'uuid' | 'bool' | '[]string' | '[]uint' | '[]uuid';
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

  [k: string]: Array<Record<string, unknown>> | Array<ID> | undefined;
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
 * A single document, in a row-based format.
 */
export interface DocumentRowWithScore extends DocumentRow {
  /**
   * For vector search, the distance between the query vector and the document
   * vector. For BM25 full-text search, the score of the document. Not present for
   * other types of queries.
   */
  dist?: number;
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
 * A summary of a namespace.
 */
export interface NamespaceSummary {
  /**
   * The namespace ID.
   */
  id: string;
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
 * The response to a successful namespace schema request.
 */
export type NamespaceGetSchemaResponse = Record<string, Array<AttributeSchema>>;

/**
 * The response to a successful query request.
 */
export type NamespaceQueryResponse = Array<DocumentRowWithScore>;

/**
 * The response to a successful upsert request.
 */
export interface NamespaceWriteResponse {
  /**
   * The status of the request.
   */
  status: 'OK';
}

export interface NamespaceListParams extends ListNamespacesParams {
  /**
   * Limit the number of results per page.
   */
  page_size?: number;

  /**
   * Retrieve only the namespaces that match the prefix.
   */
  prefix?: string;
}

export interface NamespaceQueryParams {
  /**
   * The consistency level for a query.
   */
  consistency?: NamespaceQueryParams.Consistency;

  /**
   * A function used to calculate vector similarity.
   */
  distance_metric?: DistanceMetric;

  /**
   * Exact filters for attributes to refine search results for. Think of it as a SQL
   * WHERE clause.
   */
  filters?: unknown;

  /**
   * Whether to include attributes in the response.
   */
  include_attributes?: boolean | Array<string>;

  /**
   * Whether to return vectors for the search results. Vectors are large and slow to
   * deserialize on the client, so use this option only if you need them.
   */
  include_vectors?: boolean;

  /**
   * The attribute to rank the results by. Cannot be specified with `vector`.
   */
  rank_by?: unknown;

  /**
   * The number of results to return.
   */
  top_k?: number;

  /**
   * A vector to search for. It must have the same number of dimensions as the
   * vectors in the namespace. Cannot be specified with `rank_by`.
   */
  vector?: Array<number>;
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

export interface NamespaceWriteParams {
  /**
   * Write documents.
   */
  write?:
    | NamespaceWriteParams.WriteDocuments
    | NamespaceWriteParams.CopyFromNamespace
    | NamespaceWriteParams.DeleteByFilter;
}

export namespace NamespaceWriteParams {
  /**
   * Write documents.
   */
  export interface WriteDocuments {
    /**
     * A function used to calculate vector similarity.
     */
    distance_metric?: NamespacesAPI.DistanceMetric;

    /**
     * A list of documents in columnar format. The keys are the column names.
     */
    patch_columns?: NamespacesAPI.DocumentColumns;

    patch_rows?: Array<NamespacesAPI.DocumentRow>;

    /**
     * The schema of the attributes attached to the documents.
     */
    schema?: Record<string, Array<NamespacesAPI.AttributeSchema>>;

    /**
     * A list of documents in columnar format. The keys are the column names.
     */
    upsert_columns?: NamespacesAPI.DocumentColumns;

    upsert_rows?: Array<NamespacesAPI.DocumentRow>;
  }

  /**
   * Copy documents from another namespace.
   */
  export interface CopyFromNamespace {
    /**
     * The namespace to copy documents from.
     */
    copy_from_namespace: string;
  }

  /**
   * Delete documents by filter.
   */
  export interface DeleteByFilter {
    /**
     * The filter specifying which documents to delete.
     */
    delete_by_filter: unknown;
  }
}

export declare namespace Namespaces {
  export {
    type AttributeSchema as AttributeSchema,
    type DistanceMetric as DistanceMetric,
    type DocumentColumns as DocumentColumns,
    type DocumentRow as DocumentRow,
    type DocumentRowWithScore as DocumentRowWithScore,
    type FullTextSearchConfig as FullTextSearchConfig,
    type ID as ID,
    type NamespaceSummary as NamespaceSummary,
    type NamespaceDeleteAllResponse as NamespaceDeleteAllResponse,
    type NamespaceGetSchemaResponse as NamespaceGetSchemaResponse,
    type NamespaceQueryResponse as NamespaceQueryResponse,
    type NamespaceWriteResponse as NamespaceWriteResponse,
    type NamespaceSummariesListNamespaces as NamespaceSummariesListNamespaces,
    type NamespaceListParams as NamespaceListParams,
    type NamespaceQueryParams as NamespaceQueryParams,
    type NamespaceWriteParams as NamespaceWriteParams,
  };
}
