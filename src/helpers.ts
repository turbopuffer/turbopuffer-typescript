import type {
  ColumnarVectors,
  MakeRequestTiming,
  RequestTiming,
  Vector,
} from "./types";

export const runtime = globalThis.navigator?.userAgent.split("/")[0];
export const isRuntimeFullyNodeCompatible =
  runtime === "Node.js" || runtime === "Deno";

/** An error class for errors returned by the turbopuffer API. */
export class TurbopufferError extends Error {
  status?: number;
  constructor(
    public error: string,
    { status, cause }: { status?: number; cause?: Error },
  ) {
    super(error, { cause: cause });
    this.status = status;
  }
}

/** A helper function to determine if a status code should be retried. */
export function statusCodeShouldRetry(statusCode?: number): boolean {
  return !statusCode || statusCode === 408 || statusCode === 429 || statusCode >= 500;
}

/** A helper function to delay for a given number of milliseconds. */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function make_request_timing({
  request_start,
  response_start,
  body_read_end = 0,
  decompress_end = 0,
  deserialize_end = 0,
  requestCompressionDuration = 0,
}: MakeRequestTiming): RequestTiming {
  return {
    response_time: response_start - request_start,
    body_read_time: body_read_end ? body_read_end - response_start : 0,
    compress_time: requestCompressionDuration ? requestCompressionDuration : 0,
    decompress_time:
      decompress_end && body_read_end ? decompress_end - body_read_end : 0,
    deserialize_time:
      deserialize_end && (isRuntimeFullyNodeCompatible ? decompress_end : body_read_end)
        ? deserialize_end - decompress_end
        : 0,
  };
}

export function parseIntMetric(value: string | null): number {
  return value ? parseInt(value) : 0;
}

export function parseFloatMetric(value: string | null): number {
  return value ? parseFloat(value) : 0;
}

export function parseServerTiming(value: string): Record<string, string> {
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

// Unused atm.
// function toColumnar(vectors: Vector[]): ColumnarVectors {
//   if (vectors.length == 0) {
//     return {
//       ids: [],
//       vectors: [],
//       attributes: {},
//     };
//   }
//   const attributes: ColumnarAttributes = {};
//   vectors.forEach((vec, i) => {
//     for (const [key, val] of Object.entries(vec.attributes ?? {})) {
//       if (!attributes[key]) {
//         attributes[key] = new Array<AttributeType>(vectors.length).fill(null);
//       }
//       attributes[key][i] = val;
//     }
//   });
//   return {
//     ids: vectors.map((v) => v.id),
//     vectors: vectors.map((v) => v.vector!),
//     attributes: attributes,
//   };
// }

export function fromColumnar(cv: ColumnarVectors): Vector[] {
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
