import type {
  ColumnarVectors,
  RequestTiming,
  Vector,
} from "./types";

type Runtime =
  | "bun"
  | "deno"
  | "cloudflare-workers"
  | "browser"
  | "node"
  | undefined;

function detectRuntime(): Runtime {
  // @ts-expect-error can be ignored
  if (typeof globalThis.Bun !== "undefined")
    return "bun";

  // @ts-expect-error can be ignored
  if (typeof globalThis.Deno !== "undefined")
    return "deno";

  const userAgent = globalThis.navigator?.userAgent;

  // Try navigator.userAgent:
  // https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent.
  // Fallback: look for presence of non-standard globals specific to the cloudflare runtime:
  // https://community.cloudflare.com/t/how-to-detect-the-cloudflare-worker-runtime/293715/2.
  if (
    userAgent
      ? userAgent === "Cloudflare-Workers"
      // @ts-expect-error can be ignored
      : typeof WebSocketPair !== "undefined"
  )
    return "cloudflare-workers";

  if (typeof window !== "undefined")
    return "browser";

  if (
    userAgent
      ? userAgent.startsWith("Node.js")
      : process.release?.name === "node"
  )
    return "node";
}

const detectedRuntime = detectRuntime();
export const isRuntimeFullyNodeCompatible =
  detectedRuntime === "node" || detectedRuntime === "deno";

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
  body_read_end,
  decompress_end,
  deserialize_end,
  requestCompressionDuration,
}: {
  request_start: number;
  response_start: number;
  body_read_end?: number;
  decompress_end?: number;
  deserialize_end?: number;
  requestCompressionDuration?: number;
}): RequestTiming {
  const deserialize_start = decompress_end ?? body_read_end;
  return {
    response_time: response_start - request_start,
    // `!= null` checks for both null and undefined
    body_read_time: body_read_end != null ? body_read_end - response_start : null,
    compress_time: requestCompressionDuration ?? null,
    decompress_time:
      decompress_end != null && body_read_end != null
        ? decompress_end - body_read_end
        : null,
    deserialize_time:
      deserialize_end != null && deserialize_start != null
        ? deserialize_end - deserialize_start
        : null,
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
