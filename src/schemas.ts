import { z } from "zod";

/**
 * Utility Types
 *
 * Note: At the moment, negative numbers aren't supported.
 */
export type Id = z.infer<typeof ID_SCHEMA>;
export const ID_SCHEMA = z.union([z.string(), z.number()]);

export type AttributeType = z.infer<typeof ATTRIBUTE_TYPE_SCHEMA>;
export const ATTRIBUTE_TYPE_SCHEMA = z.union([
  z.null(),
  z.string(),
  z.number(),
  z.string().array(),
  z.number().array(),
]);

export type Attributes = z.infer<typeof ATTRIBUTES_SCHEMA>;
export const ATTRIBUTES_SCHEMA = z.record(z.string(), ATTRIBUTE_TYPE_SCHEMA);

export type Vector = z.infer<typeof VECTOR_SCHEMA>;
export const VECTOR_SCHEMA = z.object({
  id: ID_SCHEMA,
  vector: z.number().array().optional(),
  attributes: ATTRIBUTES_SCHEMA.optional(),
});

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

export type QueryResults = z.infer<typeof QUERY_RESULTS_SCHEMA>;
export const QUERY_RESULTS_SCHEMA = z
  .object({
    id: ID_SCHEMA,
    vector: z.number().array().optional(),
    attributes: ATTRIBUTES_SCHEMA.optional(),
    dist: z.number().optional(),
  })
  .array();

export type NamespaceDesc = z.infer<typeof NAMESPACE_DESC_SCHEMA>;
export const NAMESPACE_DESC_SCHEMA = z.object({
  id: z.string(),
  approx_count: z.number(),
  dimensions: z.number(),
  created_at: z.string(), // RFC3339 format
});

export type NamespacesListResult = z.infer<
  typeof NAMESPACES_LIST_RESULT_SCHEMA
>;
export const NAMESPACES_LIST_RESULT_SCHEMA = z.object({
  namespaces: NAMESPACE_DESC_SCHEMA.array(),
  next_cursor: z.string().optional(),
});

export type RecallMeasurement = z.infer<typeof RECALL_MEASUREMENT_SCHEMA>;
export const RECALL_MEASUREMENT_SCHEMA = z.object({
  avg_recall: z.number(),
  avg_exhaustive_count: z.number(),
  avg_ann_count: z.number(),
});
