// Utility Types
// Note: At the moment, negative numbers aren't supported.
export type Id = string | number;

export type AttributeType =
  | null
  | string
  | number
  | string[]
  | number[]
  | boolean;

export interface FTSParams {
  k1: number;
  b: number;
  language: string;
  stemming: boolean;
  remove_stopwords: boolean;
  case_sensitive: boolean;
  tokenizer: string;
}
export type SchemaType =
  | "string"
  | "int"
  | "uint"
  | "uuid"
  | "datetime"
  | "bool"
  | "[]string"
  | "[]int"
  | "[]uint"
  | "[]uuid"
  | `[${number}]${"f16" | "f32"}`;

export type Schema = Record<
  string,
  {
    type?: SchemaType;
    filterable?: boolean;
    full_text_search?: boolean | Partial<FTSParams>;
    ann?: boolean;
  }
>;

export type RankBy_OrderByAttribute = [string, "asc" | "desc"];
export type RankBy_Text =
  | [string, "BM25", string | string[]]
  | ["Sum", RankBy_Text[]]
  | ["Product", [RankBy_Text, number]]
  | ["Product", [number, RankBy_Text]];
export type RankBy = RankBy_Text | RankBy_OrderByAttribute;

export interface Consistency {
  level: "strong" | "eventual";
}

export type DistanceMetric = "cosine_distance" | "euclidean_squared";
export type FilterOperator =
  | "Eq"
  | "NotEq"
  | "In"
  | "NotIn"
  | "Lt"
  | "Lte"
  | "Gt"
  | "Gte"
  | "Glob"
  | "NotGlob"
  | "IGlob"
  | "NotIGlob"
  | "ContainsAllTokens"
  | "And"
  | "Or";
export type FilterConnective = "And" | "Or";
export type FilterValue = AttributeType;
export type FilterCondition = [string, FilterOperator, FilterValue];
export type Filters = [FilterConnective, Filters[]] | FilterCondition;
export interface Cmek {
  key_name: string;
}
export interface Encryption {
  cmek: Cmek;
}

export interface RequestParams {
  method: string;
  path: string;
  query?: Record<string, string | undefined>;
  body?: unknown;
  compress?: boolean;
  retryable?: boolean;
}

export interface RequestTiming {
  response_time: number;
  body_read_time: number | null;
  decompress_time: number | null;
  compress_time: number | null;
  deserialize_time: number | null;
}

export type RequestResponse<T> = Promise<{
  body?: T;
  headers: Record<string, string>;
  request_timing: RequestTiming;
}>;

export interface HTTPClient {
  doRequest<T>(_: RequestParams): RequestResponse<T>;
}

export interface TpufResponseWithMetadata {
  body_text: string;
  body_read_end: number;
  decompress_end: number;
}

export interface ColumnarDocs {
  id: Id[];
  /**
   * Required if the namespace has a vector index.
   * For non-vector namespaces, this key should be omitted.
   */
  vector?: number[][];
}
export type ColumnarAttributes = Record<string, AttributeType[]>;

export type UpsertColumns = ColumnarDocs & ColumnarAttributes;
export type PatchColumns = { id: Id[] } & ColumnarAttributes;

interface RowDoc {
  id: Id;
  /**
   * Required if the namespace has a vector index.
   * For non-vector namespaces, this key should be omitted.
   */
  vector?: number[];
}
type RowAttributes = Record<string, AttributeType>;

export type UpsertRows = (RowDoc & RowAttributes)[];
export type PatchRows = ({ id: Id } & RowAttributes)[];

export interface WriteParams {
  /** Upserts documents in a column-based format. */
  upsert_columns?: UpsertColumns;
  /** Upserts documents in a row-based format. */
  upsert_rows?: UpsertRows;
  /**
   * Patches documents in a column-based format. Identical to `upsert_columns`, but
   * instead of overwriting entire documents, only the specified keys are written.
   */
  patch_columns?: PatchColumns;
  /**
   * Patches documents in a row-based format. Identical to `upsert_rows`, but
   * instead of overwriting entire documents, only the specified keys are written.
   */
  patch_rows?: PatchRows;
  /** Deletes documents by ID. */
  deletes?: Id[];
  /** Deletes documents that match a filter. */
  delete_by_filter?: Filters;
  distance_metric?: DistanceMetric;
  schema?: Schema;
  /** See https://turbopuffer.com/docs/upsert#param-encryption. */
  encryption?: Encryption;
}

export type QueryResults = {
  id: Id;
  vector?: number[];
  attributes?: RowAttributes;
  dist?: number;
  rank_by?: RankBy;
}[];

export interface QueryMetrics extends RequestTiming {
  approx_namespace_size: number;
  cache_hit_ratio: number;
  cache_temperature: string;
  processing_time: number;
  query_execution_time: number;
  exhaustive_search_count: number;
}

export interface HintCacheWarmResponse {
  message: string;
  status: "ACCEPTED" | "OK";
}

export interface ExportResponse {
  ids: Id[];
  vectors: number[][];
  attributes?: ColumnarAttributes;
  next_cursor: string | null;
}

export interface NamespaceMetadata {
  id: string;
  approx_count: number;
  dimensions: number;
  created_at: Date;
}
export interface NamespacesListResult {
  namespaces: { id: string }[];
  next_cursor?: string;
}
export interface RecallMeasurement {
  avg_recall: number;
  avg_exhaustive_count: number;
  avg_ann_count: number;
}
