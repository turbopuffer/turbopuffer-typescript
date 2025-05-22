// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

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
