/**
 * Utility Types
 *
 * Note: At the moment, negative numbers aren't supported.
 */
export type Id = string | number;
export type AttributeType = null | string | number | string[] | number[];
export type Attributes = Record<string, AttributeType>;
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
export type FilterValue = Exclude<AttributeType, null>;
export type FilterCondition = [string, FilterOperator, FilterValue];
export type Filters = [FilterConnective, Filters[]] | FilterCondition;
export type QueryResults = {
  id: Id;
  vector?: number[];
  attributes?: Attributes;
  dist?: number;
}[];
export interface NamespaceDesc {
  id: string;
  approx_count: number;
  dimensions: number;
  created_at: string; // RFC3339 format
}
export interface NamespacesListResult {
  namespaces: NamespaceDesc[];
  next_cursor?: string;
}
export interface RecallMeasurement {
  avg_recall: number;
  avg_exhaustive_count: number;
  avg_ann_count: number;
}
