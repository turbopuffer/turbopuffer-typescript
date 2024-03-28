/**
 * Official TypeScript SDK for turbopuffer.com's API
 * Something missing or should be improved? Email morgan@turbopuffer.com.
 *
 * Based off the initial work of https://github.com/holocron-hq! Thank you ❤️
 */

import pako from "pako";
import "isomorphic-fetch";

/**
 * Utility Types
 *
 * Note: At the moment, negative numbers aren't supported.
 */
export type Id = string | number;
export type AttributeType = null | string | number | string[] | number[];
export type Attributes = {
  [key: string]: AttributeType;
};
export type Vector = {
  id: Id;
  vector: number[];
  attributes?: Attributes;
};
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
export type FilterValue = Exclude<AttributeType, null>;
export type FilterEntry = FilterOperator | FilterValue;
export type FilterParam = FixedLengthArray<FilterEntry | FilterEntry[], 2>;
export type Filters = {
  [key: string]: FilterParam[];
};
export type QueryResults = {
  id: Id;
  vector?: number[];
  attributes?: Attributes;
  dist?: number;
}[];
export type NamespaceDesc = {
  id: string;
  approx_count: number;
  dimensions: number;
  created_at: string; // RFC3339 format
};
export type NamespacesListResult = {
  namespaces: NamespaceDesc[];
  next_cursor?: string;
};
export type RecallMeasurement = {
  avg_recall: number;
  avg_exhaustive_count: number;
  avg_ann_count: number;
};

/* Error type */
export class TurbopufferError extends Error {
  status?: number;
  constructor(public error: string, { status }: { status?: number }) {
    super(error);
    this.status = status;
  }
}

/* Client */
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

  async doRequest<T>({
    method,
    path,
    query,
    body,
    compress,
  }: {
    method: string;
    path: string;
    query?: {
      [key: string]: string | undefined;
    };
    body?: any;
    compress?: boolean;
  }): Promise<{ body: T; headers: Headers }> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      Object.keys(query).forEach((key) => {
        let value = query[key];
        if (value) {
          url.searchParams.append(key, value);
        }
      });
    }

    let headers: Record<string, string> = {
      "Accept-Encoding": "gzip",
      Authorization: `Bearer ${this.apiKey}`,
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

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: requestBody,
    });
    if (response.status >= 400) {
      let message = response.statusText;
      try {
        let body = await response.text();
        if (body) {
          message = body;
        }
      } catch (_: any) {}
      throw new TurbopufferError(message, { status: response.status });
    }

    if (method == "HEAD") {
      return {
        body: {} as T,
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
   * Creates, updates, or deletes vectors.
   * See: https://turbopuffer.com/docs/reference/upsert
   */
  async upsert({
    namespace,
    vectors,
    distance_metric,
  }: {
    namespace: string;
    vectors: Vector[];
    distance_metric: DistanceMetric;
  }): Promise<void> {
    await this.doRequest<{ status: string }>({
      method: "POST",
      path: `/v1/vectors/${namespace}`,
      compress: vectors.length > 10,
      body: {
        upserts: vectors,
        distance_metric,
      },
    });
  }

  /**
   * Queries vectors.
   * See: https://turbopuffer.com/docs/reference/query
   */
  async query({
    namespace,
    ...params
  }: {
    namespace: string;
    vector?: number[];
    distance_metric?: DistanceMetric;
    top_k?: number;
    include_vectors?: boolean;
    include_attributes?: boolean | string[];
    filters?: Filters;
  }): Promise<QueryResults> {
    return (
      await this.doRequest<QueryResults>({
        method: "POST",
        path: `/v1/vectors/${namespace}/query`,
        body: params,
      })
    ).body;
  }

  /**
   * Export all vectors at full precision.
   * See: https://turbopuffer.com/docs/reference/list
   */
  async export({
    namespace,
    cursor,
  }: {
    namespace: string;
    cursor?: string;
  }): Promise<{ vectors: Vector[]; next_cursor?: string }> {
    type responseType = ColumnarVectors & { next_cursor: string };
    let response = await this.doRequest<responseType>({
      method: "GET",
      path: `/v1/vectors/${namespace}`,
      query: { cursor },
    });
    return {
      vectors: fromColumnar(response.body),
      next_cursor: response.body.next_cursor,
    };
  }

  /**
   * Fetches the approximate number of vectors in a namespace.
   */
  async approxNumVectors(namespace: string): Promise<number> {
    let response = await this.doRequest<{}>({
      method: "HEAD",
      path: `/v1/vectors/${namespace}`,
    });
    let num = response.headers.get("X-turbopuffer-Approx-Num-Vectors");
    return num ? parseInt(num) : 0;
  }

  /**
   * List all your namespaces.
   * See: https://turbopuffer.com/docs/reference/namespaces
   */
  async listNamespaces({
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
      })
    ).body;
  }

  /**
   * Delete a namespace fully (all data).
   * See: https://turbopuffer.com/docs/reference/delete-namespace
   */
  async deleteNamespace(namespace: string): Promise<void> {
    await this.doRequest<{ status: string }>({
      method: "DELETE",
      path: `/v1/vectors/${namespace}`,
    });
  }

  /**
   * Evaluates the recall performance of ANN queries in a namespace.
   * See: https://turbopuffer.com/docs/reference/recall
   */
  async recall({
    namespace,
    num,
    top_k,
    filters,
    queries,
  }: {
    namespace: string;
    num?: number;
    top_k?: number;
    filters?: Filters;
    queries?: number[][];
  }): Promise<RecallMeasurement> {
    return (
      await this.doRequest<RecallMeasurement>({
        method: "POST",
        path: `/v1/vectors/${namespace}/_debug/recall`,
        compress: queries && queries.length > 10,
        body: {
          num,
          top_k,
          filters,
          queries: queries
            ? queries.reduce((acc, value) => acc.concat(value), [])
            : undefined,
        },
      })
    ).body;
  }
}

/* Helpers */

// See https://github.com/microsoft/TypeScript/issues/26223.
interface FixedLengthArray<T extends any, L extends number> extends Array<T> {
  0: T;
  length: L;
}

type ColumnarAttributes = {
  [key: string]: AttributeType[];
};
type ColumnarVectors = {
  ids: Id[];
  vectors: number[][];
  attributes?: ColumnarAttributes;
};

// Unused atm.
function toColumnar(vectors: Vector[]): ColumnarVectors {
  if (vectors.length == 0) {
    return {
      ids: [],
      vectors: [],
      attributes: {},
    };
  }
  let attributes: ColumnarAttributes = {};
  vectors.forEach((vec, i) => {
    for (let [key, val] of Object.entries(vec.attributes || {})) {
      if (!attributes[key]) {
        attributes[key] = new Array<AttributeType>(vectors.length).fill(null);
      }
      attributes[key][i] = val;
    }
  });
  return {
    ids: vectors.map((v) => v.id),
    vectors: vectors.map((v) => v.vector),
    attributes: attributes,
  };
}

function fromColumnar(cv: ColumnarVectors): Vector[] {
  let res = new Array<Vector>(cv.ids.length);
  const attributeEntries = Object.entries(cv.attributes || {});
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
