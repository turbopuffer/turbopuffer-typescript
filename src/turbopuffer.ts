/**
 * Official TypeScript SDK for turbopuffer.com's API
 * Something missing or should be improved? Email morgan@turbopuffer.com.
 *
 * Based off the initial work of https://github.com/holocron-hq! Thank you ❤️
 */

import { createHTTPClient } from "./createHTTPClient";
import {
  fromColumnar,
  parseIntMetric,
  parseFloatMetric,
  parseServerTiming,
} from "./helpers";
import type {
  ColumnarVectors,
  Consistency,
  DistanceMetric,
  Encryption,
  Filters,
  HTTPClient,
  Id,
  NamespaceMetadata,
  NamespacesListResult,
  QueryMetrics,
  QueryResults,
  RankBy,
  RecallMeasurement,
  Schema,
  Vector,
} from "./types";

/* Base Client */
export class Turbopuffer {
  http: HTTPClient;

  constructor({
    apiKey,
    baseUrl = "https://api.turbopuffer.com",
    connectTimeout = 10 * 1000,
    connectionIdleTimeout = 60 * 1000,
    warmConnections = 0,
    compression = true,
  }: {
    /** The API key to authenticate with. */
    apiKey: string;
    /** The base URL. Default is https://api.turbopuffer.com. */
    baseUrl?: string;
    /** The timeout to establish a connection, in ms. Default is 10_000. Only applicable in Node and Deno.*/
    connectTimeout?: number;
    /** The socket idle timeout, in ms. Default is 60_000. Only applicable in Node and Deno.*/
    connectionIdleTimeout?: number;
    /** The number of connections to open initially when creating a new client. Default is 0. */
    warmConnections?: number;
    /** Whether to compress requests and accept compressed responses. Default is true. */
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
    prefix,
    page_size,
  }: {
    cursor?: string;
    prefix?: string;
    page_size?: number;
  } = {}): Promise<NamespacesListResult> {
    return (
      await this.http.doRequest<NamespacesListResult>({
        method: "GET",
        path: "/v1/namespaces",
        query: {
          cursor,
          prefix,
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
    encryption,
    batchSize = 10000,
  }: {
    vectors: Vector[];
    distance_metric: DistanceMetric;
    schema?: Schema;
    /** Only available as part of our enterprise offerings. */
    encryption?: Encryption;
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
          encryption,
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
   * Deletes vectors (by filter).
   */
  async deleteByFilter({ filters }: { filters: Filters }): Promise<number> {
    const response = await this.client.http.doRequest<{
      status: string;
      rows_affected: number;
    }>({
      method: "POST",
      path: `/v1/namespaces/${this.id}`,
      compress: false,
      body: {
        delete_by_filter: filters,
      },
      retryable: true,
    });
    return response?.body?.rows_affected || 0;
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
    return (
      await this.client.http.doRequest<Schema>({
        method: "GET",
        path: `/v1/namespaces/${this.id}/schema`,
        retryable: true,
      })
    ).body!;
  }

  /**
   * Copies all documents from another namespace to this namespace.
   * See: https://turbopuffer.com/docs/upsert#parameters `copy_from_namespace`
   * for specifics on how this works.
   */
  async copyFromNamespace(sourceNamespace: string) {
    await this.client.http.doRequest<Schema>({
      method: "POST",
      path: `/v1/namespaces/${this.id}`,
      body: {
        copy_from_namespace: sourceNamespace,
      },
      retryable: true,
    })
  }
}

// Re-export all types in types.ts for consumers
export * from './types';
