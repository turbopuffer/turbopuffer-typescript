/**
 * Official TypeScript SDK for turbopuffer.com's API
 * Something missing or should be improved? Email morgan@turbopuffer.com.
 *
 * Based off the initial work of https://github.com/holocron-hq! Thank you ❤️
 */

import pako from "pako";
import "isomorphic-fetch";
import { version } from "../package.json";

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

/* Error type */
export class TurbopufferError extends Error {
  status?: number;
  constructor(
    public error: string,
    { status }: { status?: number }
  ) {
    super(error);
    this.status = status;
  }
}

/* Base Client */
export class Turbopuffer {
  private baseUrl: string;
  apiKey: string;

  constructor({
    apiKey,
    baseUrl = "https://api.turbopuffer.com",
  }: {
    apiKey: string;
    baseUrl?: string;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  statusCodeShouldRetry(statusCode: number): boolean {
    return statusCode >= 500;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async doRequest<T>({
    method,
    path,
    query,
    body,
    compress,
    retryable,
  }: {
    method: string;
    path: string;
    query?: Record<string, string | undefined>;
    body?: unknown;
    compress?: boolean;
    retryable?: boolean;
  }): Promise<{ body?: T; headers: Headers }> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value) {
          url.searchParams.append(key, value);
        }
      });
    }

    const headers: Record<string, string> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Accept-Encoding": "gzip",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${this.apiKey}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "User-Agent": `tpuf-typescript/${version}`,
    };
    if (body) {
      headers["Content-Type"] = "application/json";
    }

    let requestBody: BodyInit | null = null;
    if (body && compress) {
      headers["Content-Encoding"] = "gzip";
      requestBody = pako.gzip(JSON.stringify(body));
    } else if (body) {
      requestBody = JSON.stringify(body);
    }

    const maxAttempts = retryable ? 3 : 1;
    let response!: Response;
    let error: TurbopufferError | null = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      response = await fetch(url.toString(), {
        method,
        headers,
        body: requestBody,
      });
      if (response.status >= 400) {
        let message: string | undefined = undefined;
        if (response.headers.get("Content-Type") === "application/json") {
          try {
            const body = await response.json();
            if (body && body.status === "error") {
              message = body.error;
            } else {
              message = JSON.stringify(body);
            }
          } catch (_: unknown) {
            /* empty */
          }
        } else {
          try {
            const body = await response.text();
            if (body) {
              message = body;
            }
          } catch (_: unknown) {
            /* empty */
          }
        }
        error = new TurbopufferError(message ?? response.statusText, {
          status: response.status,
        });
      }
      if (
        error &&
        this.statusCodeShouldRetry(response.status) &&
        attempt + 1 != maxAttempts
      ) {
        await this.delay(150 * (attempt + 1)); // 150ms, 300ms, 450ms
        continue;
      }
      break;
    }
    if (error) {
      throw error;
    }

    if (!response.body) {
      return {
        headers: response.headers,
      };
    }

    const json = await response.json();
    if (json.status && json.status === "error") {
      throw new TurbopufferError(json.error || (json as string), {
        status: response.status,
      });
    }

    return {
      body: json as T,
      headers: response.headers,
    };
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
      await this.doRequest<NamespacesListResult>({
        method: "GET",
        path: "/v1/vectors",
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
      await this.client.doRequest<{ status: string }>({
        method: "POST",
        path: `/v1/vectors/${this.id}`,
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
    await this.client.doRequest<{ status: string }>({
      method: "POST",
      path: `/v1/vectors/${this.id}`,
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
      await this.client.doRequest<QueryResults>({
        method: "POST",
        path: `/v1/vectors/${this.id}/query`,
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
    type ResponseType = ColumnarVectors & { next_cursor: string };
    const response = await this.client.doRequest<ResponseType>({
      method: "GET",
      path: `/v1/vectors/${this.id}`,
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
    const response = await this.client.doRequest<object>({
      method: "HEAD",
      path: `/v1/vectors/${this.id}`,
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
    await this.client.doRequest<{ status: string }>({
      method: "DELETE",
      path: `/v1/vectors/${this.id}`,
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
      await this.client.doRequest<RecallMeasurement>({
        method: "POST",
        path: `/v1/vectors/${this.id}/_debug/recall`,
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
