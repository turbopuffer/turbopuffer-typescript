/**
 * Official TypeScript SDK for turbopuffer.com's API
 * Something missing or should be improved? Email morgan@turbopuffer.com.
 *
 * Based off the initial work of https://github.com/holocron-hq! Thank you ❤️
 */

import type { HTTPClient } from "./httpClient";
import { createHTTPClient } from "./httpClient";
export { TurbopufferError } from "./httpClient";

/**
 * Utility Types
 *
 * Note: At the moment, negative numbers aren't supported.
 */
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

function parseServerTiming(value: string): Record<string, string> {
  const output: Record<string, string> = {};
  const sections = value.split(", ");
  for (const section of sections) {
    const tokens = section.split(";");
    const base_key = tokens.shift();
    for (const token of tokens) {
      const components = token.split("=");
      const key = base_key + "." + components[0];
      const value = components[1];
      output[key] = value;
    }
  }
  return output;
}

function parseIntMetric(value: string | null): number {
  return value ? parseInt(value) : 0;
}

function parseFloatMetric(value: string | null): number {
  return value ? parseFloat(value) : 0;
}

/* Base Client */
export class Turbopuffer {
  http: HTTPClient;

  constructor({
    apiKey,
    baseUrl = "https://api.turbopuffer.com",
    connectTimeout = 10 * 1000, // timeout to establish a connection
    connectionIdleTimeout = 60 * 1000, // socket idle timeout in ms, default 1 minute
    warmConnections = 0, // number of connections to open initially when creating a new client
    compression = true,
  }: {
    apiKey: string;
    baseUrl?: string;
    connectTimeout?: number;
    connectionIdleTimeout?: number;
    warmConnections?: number;
    compression?: boolean;
  }) {
    this.http = createHTTPClient(
      baseUrl,
      apiKey,
      connectTimeout,
      connectionIdleTimeout,
      warmConnections,
      compression,
    );
  }

  /**
   * List all your namespaces.
   * See: https://turbopuffer.com/docs/reference/namespaces
   */
  async namespaces({
    cursor,
    page_size,
  }: {
    cursor?: string;
    page_size?: number;
  }): Promise<NamespacesListResult> {
    return (
      await this.http.doRequest<NamespacesListResult>({
        method: "GET",
        path: "/v1/namespaces",
        query: {
          cursor,
          page_size: page_size ? page_size.toString() : undefined,
        },
        retryable: true,
      })
    ).body!;
  }

  /**
   * Creates a namespace object to operate on. Operations
   * should be called on the Namespace object itself.
   */
  namespace(id: string): Namespace {
    return new Namespace(this, id);
  }
}

export class Namespace {
  private client: Turbopuffer;
  id: string;

  constructor(client: Turbopuffer, id: string) {
    this.client = client;
    this.id = id;
  }

  /**
   * Creates or updates vectors.
   * See: https://turbopuffer.com/docs/reference/upsert
   *
   * Note: Will automatically batch according to the client's configured batch size.
   */
  async upsert({
    vectors,
    distance_metric,
    schema,
    batchSize = 10000,
  }: {
    vectors: Vector[];
    distance_metric: DistanceMetric;
    schema?: Schema;
    batchSize?: number;
  }): Promise<void> {
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.client.http.doRequest<{ status: string }>({
        method: "POST",
        path: `/v1/namespaces/${this.id}`,
        compress: batch.length > 10,
        body: {
          upserts: batch,
          distance_metric,
          schema,
        },
        retryable: true, // Upserts are idempotent
      });
    }
  }

  /**
   * Deletes vectors (by IDs).
   */
  async delete({ ids }: { ids: Id[] }): Promise<void> {
    await this.client.http.doRequest<{ status: string }>({
      method: "POST",
      path: `/v1/namespaces/${this.id}`,
      compress: ids.length > 500,
      body: {
        ids: ids,
        vectors: new Array(ids.length).fill(null),
      },
      retryable: true,
    });
  }

  /**
   * Queries vectors.
   * See: https://turbopuffer.com/docs/reference/query
   */
  async query({
    ...params
  }: {
    vector?: number[];
    distance_metric?: DistanceMetric;
    top_k?: number;
    include_vectors?: boolean;
    include_attributes?: boolean | string[];
    filters?: Filters;
    rank_by?: RankBy;
    consistency?: Consistency;
  }): Promise<QueryResults> {
    const resultsWithMetrics = await this.queryWithMetrics(params);
    return resultsWithMetrics.results;
  }

  /**
   * Queries vectors and returns performance metrics along with the results.
   * See: https://turbopuffer.com/docs/reference/query
   */
  async queryWithMetrics({
    ...params
  }: {
    vector?: number[];
    distance_metric?: DistanceMetric;
    top_k?: number;
    include_vectors?: boolean;
    include_attributes?: boolean | string[];
    filters?: Filters;
    rank_by?: RankBy;
    consistency?: Consistency;
  }): Promise<{
    results: QueryResults;
    metrics: QueryMetrics;
  }> {
    const response = await this.client.http.doRequest<QueryResults>({
      method: "POST",
      path: `/v1/namespaces/${this.id}/query`,
      body: params,
      retryable: true,
      compress: true,
    });

    const serverTimingStr = response.headers["server-timing"];
    const serverTiming = serverTimingStr
      ? parseServerTiming(serverTimingStr)
      : {};

    return {
      results: response.body!,
      metrics: {
        approx_namespace_size: parseIntMetric(
          response.headers["x-turbopuffer-approx-namespace-size"],
        ),
        cache_hit_ratio: parseFloatMetric(serverTiming["cache.hit_ratio"]),
        cache_temperature: serverTiming["cache.temperature"],
        processing_time: parseIntMetric(serverTiming["processing_time.dur"]),
        exhaustive_search_count: parseIntMetric(
          serverTiming["exhaustive_search.count"],
        ),
        response_time: response.request_timing.response_time,
        body_read_time: response.request_timing.body_read_time,
        decompress_time: response.request_timing.decompress_time,
        deserialize_time: response.request_timing.deserialize_time,
        compress_time: response.request_timing.compress_time,
      },
    };
  }

  /**
   * Export all vectors at full precision.
   * See: https://turbopuffer.com/docs/reference/list
   */
  async export(params?: {
    cursor?: string;
  }): Promise<{ vectors: Vector[]; next_cursor?: string }> {
    type ResponseType = ColumnarVectors & { next_cursor: string };
    const response = await this.client.http.doRequest<ResponseType>({
      method: "GET",
      path: `/v1/namespaces/${this.id}`,
      query: { cursor: params?.cursor },
      retryable: true,
    });
    const body = response.body!;
    return {
      vectors: fromColumnar(body),
      next_cursor: body.next_cursor,
    };
  }

  /**
   * Fetches the approximate number of vectors in a namespace.
   */
  async approxNumVectors(): Promise<number> {
    return (await this.metadata()).approx_count;
  }

  async metadata(): Promise<NamespaceMetadata> {
    const response = await this.client.http.doRequest<NamespaceMetadata>({
      method: "HEAD",
      path: `/v1/namespaces/${this.id}`,
      retryable: true,
    });

    return {
      id: this.id,
      approx_count: parseInt(
        response.headers["x-turbopuffer-approx-num-vectors"],
      ),
      dimensions: parseInt(response.headers["x-turbopuffer-dimensions"]),
      created_at: new Date(response.headers["x-turbopuffer-created-at"]),
    };
  }

  /**
   * Delete a namespace fully (all data).
   * See: https://turbopuffer.com/docs/reference/delete-namespace
   */
  async deleteAll(): Promise<void> {
    await this.client.http.doRequest<{ status: string }>({
      method: "DELETE",
      path: `/v1/namespaces/${this.id}`,
      retryable: true,
    });
  }

  /**
   * Evaluates the recall performance of ANN queries in a namespace.
   * See: https://turbopuffer.com/docs/reference/recall
   */
  async recall({
    num,
    top_k,
    filters,
    queries,
  }: {
    num?: number;
    top_k?: number;
    filters?: Filters;
    queries?: number[][];
  }): Promise<RecallMeasurement> {
    return (
      await this.client.http.doRequest<RecallMeasurement>({
        method: "POST",
        path: `/v1/namespaces/${this.id}/_debug/recall`,
        compress: queries && queries.length > 10,
        body: {
          num,
          top_k,
          filters,
          queries: queries
            ? queries.reduce((acc, value) => acc.concat(value), [])
            : undefined,
        },
        retryable: true,
      })
    ).body!;
  }

  /**
   * Returns the current schema for the namespace.
   * See: https://turbopuffer.com/docs/schema
   */
  async schema(): Promise<Schema> {
    return (await this.client.http.doRequest<Schema>({
      method: "GET",
      path: `/v1/namespaces/${this.id}/schema`,
      retryable: true,
    })).body!;
  }
}

/* Helpers */

type ColumnarAttributes = Record<string, AttributeType[]>;
interface ColumnarVectors {
  ids: Id[];
  vectors: number[][];
  attributes?: ColumnarAttributes;
}

// Unused atm.
function toColumnar(vectors: Vector[]): ColumnarVectors {
  if (vectors.length == 0) {
    return {
      ids: [],
      vectors: [],
      attributes: {},
    };
  }
  const attributes: ColumnarAttributes = {};
  vectors.forEach((vec, i) => {
    for (const [key, val] of Object.entries(vec.attributes ?? {})) {
      if (!attributes[key]) {
        attributes[key] = new Array<AttributeType>(vectors.length).fill(null);
      }
      attributes[key][i] = val;
    }
  });
  return {
    ids: vectors.map((v) => v.id),
    vectors: vectors.map((v) => v.vector!),
    attributes: attributes,
  };
}

function fromColumnar(cv: ColumnarVectors): Vector[] {
  const res = new Array<Vector>(cv.ids?.length);
  const attributeEntries = Object.entries(cv.attributes ?? {});
  for (let i = 0; i < cv.ids?.length; i++) {
    res[i] = {
      id: cv.ids[i],
      vector: cv.vectors[i],
      attributes: cv.attributes
        ? Object.fromEntries(
            attributeEntries.map(([key, values]) => [key, values[i]]),
          )
        : undefined,
    };
  }
  return res;
}
