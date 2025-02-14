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
export type Attributes = Record<string, AttributeType>;
export interface FTSParams {
  k1: number;
  b: number;
  language: string;
  stemming: boolean;
  remove_stopwords: boolean;
  case_sensitive: boolean;
  tokenizer: string;
}
// TODO: index signature is a better fit here imo.
// also look into eslint config to allow for usage of index signatures
export type Schema = Record<
  string,
  {
    type?: string;
    filterable?: boolean;
    bm25?: boolean | Partial<FTSParams>;
    full_text_search?: boolean | Partial<FTSParams>;
  }
>;
export type RankBySingleField = [string, "BM25", string];
export type OrderByAttribute = [string, "asc" | "desc"];
export type RankBy =
  | RankBySingleField
  | ["Sum", RankBySingleField[]]
  | OrderByAttribute;
export interface Consistency {
  level: "strong" | "eventual"
}

export interface Vector {
  id: Id;
  vector?: number[];
  attributes?: Attributes;
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
  | "And"
  | "Or";
export type FilterConnective = "And" | "Or";
export type FilterValue = AttributeType;
export type FilterCondition = [string, FilterOperator, FilterValue];
export type Filters = [FilterConnective, Filters[]] | FilterCondition;

export type QueryResults = {
  id: Id;
  vector?: number[];
  attributes?: Attributes;
  dist?: number;
  rank_by?: RankBy;
}[];

export interface QueryMetrics {
  approx_namespace_size: number;
  cache_hit_ratio: number;
  cache_temperature: string;
  processing_time: number;
  exhaustive_search_count: number;
  response_time: number;
  body_read_time: number;
  deserialize_time: number;
  decompress_time: number;
  compress_time: number;
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
  body_read_time: number;
  decompress_time: number;
  compress_time: number;
  deserialize_time: number;
}

export interface MakeRequestTiming {
  request_start: number,
  response_start: number,
  body_read_end?: number,
  decompress_end?: number,
  deserialize_end?: number,
  requestCompressionDuration?: number,
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

export type ColumnarAttributes = Record<string, AttributeType[]>;
export interface ColumnarVectors {
  ids: Id[];
  vectors: number[][];
  attributes?: ColumnarAttributes;
}
