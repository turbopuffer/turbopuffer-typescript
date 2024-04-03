/**
 * Official TypeScript SDK for turbopuffer.com's API
 * Something missing or should be improved? Email morgan@turbopuffer.com.
 *
 * Based off the initial work of https://github.com/holocron-hq! Thank you ❤️
 */

import "isomorphic-fetch";
import { z } from "zod";
import type { RequestParams, RequestResponse } from "./createDoRequest";
import { createDoRequest } from "./createDoRequest";
import {
  ATTRIBUTE_TYPE_SCHEMA,
  ID_SCHEMA,
  NAMESPACES_LIST_RESULT_SCHEMA,
  QUERY_RESULTS_SCHEMA,
  RECALL_MEASUREMENT_SCHEMA,
} from "./schemas";
import type {
  AttributeType,
  DistanceMetric,
  Filters,
  Id,
  NamespacesListResult,
  QueryResults,
  RecallMeasurement,
  Vector,
} from "./schemas";

/* Base Client */
export class Turbopuffer {
  private baseUrl: string;
  apiKey: string;
  doRequest: <T extends object>(_: RequestParams<T>) => RequestResponse<T>;

  constructor({
    apiKey,
    baseUrl = "https://api.turbopuffer.com",
  }: {
    apiKey: string;
    baseUrl?: string;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    this.doRequest = createDoRequest(this.baseUrl, this.apiKey);
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
      await this.doRequest({
        method: "GET",
        path: "/v1/vectors",
        schema: NAMESPACES_LIST_RESULT_SCHEMA,
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
    batchSize = 10000,
  }: {
    vectors: Vector[];
    distance_metric: DistanceMetric;
    batchSize?: number;
  }): Promise<void> {
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.client.doRequest({
        method: "POST",
        path: `/v1/vectors/${this.id}`,
        schema: z.object({ status: z.string() }),
        compress: batch.length > 10,
        body: {
          upserts: batch,
          distance_metric,
        },
        retryable: true, // Upserts are idempotent
      });
    }
  }

  /**
   * Deletes vectors (by IDs).
   */
  async delete({ ids }: { ids: Id[] }): Promise<void> {
    await this.client.doRequest({
      method: "POST",
      path: `/v1/vectors/${this.id}`,
      schema: z.object({ status: z.string() }),
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
  }): Promise<QueryResults> {
    return (
      await this.client.doRequest({
        method: "POST",
        path: `/v1/vectors/${this.id}/query`,
        schema: QUERY_RESULTS_SCHEMA,
        body: params,
        retryable: true,
      })
    ).body!;
  }

  /**
   * Export all vectors at full precision.
   * See: https://turbopuffer.com/docs/reference/list
   */
  async export(params?: {
    cursor?: string;
  }): Promise<{ vectors: Vector[]; next_cursor?: string }> {
    const response = await this.client.doRequest({
      method: "GET",
      path: `/v1/vectors/${this.id}`,
      schema: COLUMNAR_VECTORS_SCHEMA.and(
        z.object({ next_cursor: z.string() })
      ),
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
    const response = await this.client.doRequest({
      method: "HEAD",
      path: `/v1/vectors/${this.id}`,
      schema: z.object({}),
      retryable: true,
    });
    const num = response.headers.get("X-turbopuffer-Approx-Num-Vectors");
    return num ? parseInt(num) : 0;
  }

  /**
   * Delete a namespace fully (all data).
   * See: https://turbopuffer.com/docs/reference/delete-namespace
   */
  async deleteAll(): Promise<void> {
    await this.client.doRequest({
      method: "DELETE",
      path: `/v1/vectors/${this.id}`,
      schema: z.object({ status: z.string() }),
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
      await this.client.doRequest({
        method: "POST",
        path: `/v1/vectors/${this.id}/_debug/recall`,
        schema: RECALL_MEASUREMENT_SCHEMA,
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
}

/* Helpers */

type ColumnarAttributes = z.infer<typeof COLUMNAR_ATTRIBUTES_SCHEMA>;
const COLUMNAR_ATTRIBUTES_SCHEMA = z.record(
  z.string(),
  ATTRIBUTE_TYPE_SCHEMA.array()
);

type ColumnarVectors = z.infer<typeof COLUMNAR_VECTORS_SCHEMA>;
const COLUMNAR_VECTORS_SCHEMA = z.object({
  ids: ID_SCHEMA.array(),
  vectors: z.number().array().array(),
  attributes: COLUMNAR_ATTRIBUTES_SCHEMA.optional(),
});

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
  const res = new Array<Vector>(cv.ids.length);
  const attributeEntries = Object.entries(cv.attributes ?? {});
  for (let i = 0; i < cv.ids.length; i++) {
    res[i] = {
      id: cv.ids[i],
      vector: cv.vectors[i],
      attributes: cv.attributes
        ? Object.fromEntries(
            attributeEntries.map(([key, values]) => [key, values[i]])
          )
        : undefined,
    };
  }
  return res;
}
