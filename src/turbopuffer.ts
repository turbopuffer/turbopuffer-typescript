/**
 * Official TypeScript SDK for turbopuffer.com's API
 * Something missing or should be improved? Email morgan@turbopuffer.com.
 *
 * Based off the initial work of https://github.com/holocron-hq! Thank you ❤️
 */

import { createHTTPClient } from "./createHTTPClient";
import {
  shouldCompressWrite,
  TurbopufferError,
} from "./helpers";
import type {
  Consistency,
  ExportResponse,
  Filters,
  HintCacheWarmResponse,
  HTTPClient,
  NamespaceMetadata,
  NamespacesListResult,
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
    top_k?: number;
    include_attributes?: boolean | string[];
    filters?: Filters;
    rank_by: RankBy;
    consistency?: Consistency;
  }): Promise<QueryResults> {
    const response = await this.client.http.doRequest<QueryResults>({
      method: "POST",
      path: `/v2/namespaces/${this.id}/query`,
      body: params,
      retryable: true,
      compress: true,
    });

    const results = response.body!;
    results.performance = {
      ...results.performance,
      ...response.request_timing,
    };

    return results;
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
    const { ids, vectors, attributes, next_cursor } = response.body!;
    return {
      ids,
      vectors,
      attributes,
      next_cursor,
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
   * Checks if a namespace exists.
   */
  async exists(): Promise<boolean> {
    try {
      await this.metadata();
      return true;
    } catch (e) {
      if (e instanceof TurbopufferError && e.status === 404) {
        return false;
      }
      throw e;
    }
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
