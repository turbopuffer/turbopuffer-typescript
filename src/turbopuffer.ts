/**
 * Official TypeScript SDK for turbopuffer.com's API
 * Something missing or should be improved? Email morgan@turbopuffer.com.
 *
 * Based off the initial work of https://github.com/holocron-hq! Thank you ❤️
 */

import { createHTTPClient } from "./createHTTPClient";
import {
  parseIntMetric,
  parseFloatMetric,
  parseServerTiming,
  shouldCompressWrite,
} from "./helpers";
import type {
  Consistency,
  DistanceMetric,
  ExportResponse,
  Filters,
  HintCacheWarmResponse,
  HTTPClient,
  NamespaceMetadata,
  NamespacesListResult,
  QueryMetrics,
  QueryResults,
  RankBy,
  RecallMeasurement,
  Schema,
  WriteParams,
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
   * See: https://turbopuffer.com/docs/namespaces
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

  async write(params: WriteParams): Promise<number> {
    const response = await this.client.http.doRequest<{
      status: string;
      rows_affected: number;
    }>({
      method: "POST",
      path: `/v2/namespaces/${this.id}`,
      compress: shouldCompressWrite(params),
      body: params,
      retryable: true, // writes are idempotent
    });
    return response.body?.rows_affected ?? 0;
  }

  /**
   * Queries vectors.
   * See: https://turbopuffer.com/docs/query
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
   * See: https://turbopuffer.com/docs/query
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
        query_execution_time: parseIntMetric(
          serverTiming["query_execution_time.dur"],
        ),
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
   * Warm the cache.
   */
  async hintCacheWarm(): Promise<HintCacheWarmResponse> {
    return (
      await this.client.http.doRequest<HintCacheWarmResponse>({
        method: "GET",
        path: `/v1/namespaces/${this.id}/hint_cache_warm`,
        retryable: true,
      })
    ).body!;
  }

  /**
   * Export all vectors at full precision.
   * See: https://turbopuffer.com/docs/export
   */
  async export(params?: { cursor?: string }): Promise<ExportResponse> {
    const response = await this.client.http.doRequest<ExportResponse>({
      method: "GET",
      path: `/v1/namespaces/${this.id}`,
      query: { cursor: params?.cursor },
      retryable: true,
    });
    const body = response.body!;
    return {
      ids: body.ids,
      vectors: body.vectors,
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
   * See: https://turbopuffer.com/docs/delete-namespace
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
   * See: https://turbopuffer.com/docs/recall
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
   * Updates the schema for a namespace.
   * Returns the final schema after updates are done.
   * See https://turbopuffer.com/docs/schema for specifics on allowed updates.
   */
  async updateSchema(updatedSchema: Schema): Promise<Schema> {
    return (
      await this.client.http.doRequest<Schema>({
        method: "POST",
        path: `/v1/namespaces/${this.id}/schema`,
        body: updatedSchema,
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
    });
  }
}
