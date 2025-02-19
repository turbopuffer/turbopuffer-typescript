// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import { ListNamespaces, type ListNamespacesParams, PagePromise } from '../pagination';
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
    return this._client.delete(path`/v1/namespaces/${namespace}`, options);
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
  upsert(
    namespace: string,
    body: NamespaceUpsertParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<NamespaceUpsertResponse> {
    return this._client.post(path`/v1/namespaces/${namespace}`, { body, ...options });
  }
}

// Namespace pagination.
export type NamespaceSummariesListNamespaces = ListNamespaces<NamespaceSummary>;

/**
 * A list of documents in columnar format.
 */
export interface DocumentColumns {
  /**
   * The attributes attached to each of the documents.
   */
  attributes?: Record<string, Array<DocumentColumns.Attribute>>;

  /**
   * The IDs of the documents.
   */
  ids?: Array<string | number>;

  /**
   * Vectors describing each of the documents.
   */
  vectors?: Array<number | Array<number> | null>;
}

export namespace DocumentColumns {
  /**
   * The schema for the attributes attached to a document.
   */
  export interface Attribute {
    /**
     * Whether or not the attributes can be used in filters/WHERE clauses.
     */
    filterable?: boolean;

    /**
     * Whether this attribute can be used as part of a BM25 full-text search. Requires
     * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
     * filterable. You can override this by setting `filterable: true`.
     */
    full_text_search?: boolean | Attribute.FullTextSearchConfig;

    /**
     * The data type of the attribute.
     */
    type?: 'string' | 'uint' | 'uuid' | 'bool' | '[]string' | '[]uint' | '[]uuid';
  }

  export namespace Attribute {
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
  }
}

/**
 * A single document, in a row-based format.
 */
export interface DocumentRow {
  /**
   * An identifier for a document.
   */
  id?: string | number;

  /**
   * The attributes attached to the document.
   */
  attributes?: Record<string, DocumentRow.Attributes>;

  /**
   * A vector describing the document.
   */
  vector?: Array<number> | null;
}

export namespace DocumentRow {
  /**
   * The schema for the attributes attached to a document.
   */
  export interface Attributes {
    /**
     * Whether or not the attributes can be used in filters/WHERE clauses.
     */
    filterable?: boolean;

    /**
     * Whether this attribute can be used as part of a BM25 full-text search. Requires
     * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
     * filterable. You can override this by setting `filterable: true`.
     */
    full_text_search?: boolean | Attributes.FullTextSearchConfig;

    /**
     * The data type of the attribute.
     */
    type?: 'string' | 'uint' | 'uuid' | 'bool' | '[]string' | '[]uint' | '[]uuid';
  }

  export namespace Attributes {
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
  }
}

/**
 * A summary of a namespace.
 */
export interface NamespaceSummary {
  /**
   * The namespace ID.
   */
  id?: string;
}

/**
 * The response to a successful namespace deletion request.
 */
export interface NamespaceDeleteAllResponse {
  /**
   * The status of the request.
   */
  status?: 'ok';
}

/**
 * The response to a successful namespace schema request.
 */
export type NamespaceGetSchemaResponse = Record<string, Array<NamespaceGetSchemaResponse.Item>>;

export namespace NamespaceGetSchemaResponse {
  /**
   * The schema for the attributes attached to a document.
   */
  export interface Item {
    /**
     * Whether or not the attributes can be used in filters/WHERE clauses.
     */
    filterable?: boolean;

    /**
     * Whether this attribute can be used as part of a BM25 full-text search. Requires
     * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
     * filterable. You can override this by setting `filterable: true`.
     */
    full_text_search?: boolean | Item.FullTextSearchConfig;

    /**
     * The data type of the attribute.
     */
    type?: 'string' | 'uint' | 'uuid' | 'bool' | '[]string' | '[]uint' | '[]uuid';
  }

  export namespace Item {
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
  }
}

/**
 * The response to a successful query request.
 */
export type NamespaceQueryResponse = Array<DocumentRow>;

/**
 * The response to a successful upsert request.
 */
export interface NamespaceUpsertResponse {
  /**
   * The status of the request.
   */
  status?: 'OK';
}

export interface NamespaceListParams extends ListNamespacesParams {
  /**
   * Limit the number of results per page.
   */
  page_size?: number;

  /**
   * Retrieve only namespaces that match the prefix.
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
   *
   * - `cosine_distance` - Defined as `1 - cosine_similarity` and ranges from 0 to 2.
   *   Lower is better.
   * - `euclidean_squared` - Defined as `sum((x - y)^2)`. Lower is better.
   */
  distance_metric?: 'cosine_distance' | 'euclidean_squared';

  /**
   * Exact filters for attributes to refine search results for. Think of it as a SQL
   * WHERE clause.
   */
  filter?: unknown;

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

export type NamespaceUpsertParams =
  | NamespaceUpsertParams.UpsertColumnar
  | NamespaceUpsertParams.UpsertRowBased
  | NamespaceUpsertParams.CopyFromNamespace
  | NamespaceUpsertParams.DeleteByFilter;

export declare namespace NamespaceUpsertParams {
  export interface UpsertColumnar {
    /**
     * The attributes attached to each of the documents.
     */
    attributes?: Record<string, Array<UpsertColumnar.Attribute>>;

    /**
     * A function used to calculate vector similarity.
     *
     * - `cosine_distance` - Defined as `1 - cosine_similarity` and ranges from 0 to 2.
     *   Lower is better.
     * - `euclidean_squared` - Defined as `sum((x - y)^2)`. Lower is better.
     */
    distance_metric?: 'cosine_distance' | 'euclidean_squared';

    /**
     * The IDs of the documents.
     */
    ids?: Array<string | number>;

    /**
     * The schema of the attributes attached to the documents.
     */
    schema?: Record<string, Array<UpsertColumnar.Schema>>;

    /**
     * Vectors describing each of the documents.
     */
    vectors?: Array<number | Array<number> | null>;
  }

  export namespace UpsertColumnar {
    /**
     * The schema for the attributes attached to a document.
     */
    export interface Attribute {
      /**
       * Whether or not the attributes can be used in filters/WHERE clauses.
       */
      filterable?: boolean;

      /**
       * Whether this attribute can be used as part of a BM25 full-text search. Requires
       * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
       * filterable. You can override this by setting `filterable: true`.
       */
      full_text_search?: boolean | Attribute.FullTextSearchConfig;

      /**
       * The data type of the attribute.
       */
      type?: 'string' | 'uint' | 'uuid' | 'bool' | '[]string' | '[]uint' | '[]uuid';
    }

    export namespace Attribute {
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
    }

    /**
     * The schema for the attributes attached to a document.
     */
    export interface Schema {
      /**
       * Whether or not the attributes can be used in filters/WHERE clauses.
       */
      filterable?: boolean;

      /**
       * Whether this attribute can be used as part of a BM25 full-text search. Requires
       * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
       * filterable. You can override this by setting `filterable: true`.
       */
      full_text_search?: boolean | Schema.FullTextSearchConfig;

      /**
       * The data type of the attribute.
       */
      type?: 'string' | 'uint' | 'uuid' | 'bool' | '[]string' | '[]uint' | '[]uuid';
    }

    export namespace Schema {
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
    }
  }

  export interface UpsertRowBased {
    /**
     * A function used to calculate vector similarity.
     *
     * - `cosine_distance` - Defined as `1 - cosine_similarity` and ranges from 0 to 2.
     *   Lower is better.
     * - `euclidean_squared` - Defined as `sum((x - y)^2)`. Lower is better.
     */
    distance_metric?: 'cosine_distance' | 'euclidean_squared';

    /**
     * The schema of the attributes attached to the documents.
     */
    schema?: Record<string, Array<UpsertRowBased.Schema>>;

    upserts?: Array<DocumentRow>;
  }

  export namespace UpsertRowBased {
    /**
     * The schema for the attributes attached to a document.
     */
    export interface Schema {
      /**
       * Whether or not the attributes can be used in filters/WHERE clauses.
       */
      filterable?: boolean;

      /**
       * Whether this attribute can be used as part of a BM25 full-text search. Requires
       * the `string` or `[]string` type, and by default, BM25-enabled attributes are not
       * filterable. You can override this by setting `filterable: true`.
       */
      full_text_search?: boolean | Schema.FullTextSearchConfig;

      /**
       * The data type of the attribute.
       */
      type?: 'string' | 'uint' | 'uuid' | 'bool' | '[]string' | '[]uint' | '[]uuid';
    }

    export namespace Schema {
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
    }
  }

  export interface CopyFromNamespace {
    /**
     * The namespace to copy documents from.
     */
    copy_from_namespace?: string;
  }

  export interface DeleteByFilter {
    delete_by_filter?: unknown;
  }
}

export declare namespace Namespaces {
  export {
    type DocumentColumns as DocumentColumns,
    type DocumentRow as DocumentRow,
    type NamespaceSummary as NamespaceSummary,
    type NamespaceDeleteAllResponse as NamespaceDeleteAllResponse,
    type NamespaceGetSchemaResponse as NamespaceGetSchemaResponse,
    type NamespaceQueryResponse as NamespaceQueryResponse,
    type NamespaceUpsertResponse as NamespaceUpsertResponse,
    type NamespaceSummariesListNamespaces as NamespaceSummariesListNamespaces,
    type NamespaceListParams as NamespaceListParams,
    type NamespaceQueryParams as NamespaceQueryParams,
    type NamespaceUpsertParams as NamespaceUpsertParams,
  };
}
