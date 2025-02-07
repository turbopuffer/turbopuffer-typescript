import { Turbopuffer, TurbopufferError } from "./turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY!,
});

test("bm25_with_custom_schema_and_sum_query", async () => {
  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  const schema = {
    text: {
      type: "?string",
      bm25: {
        language: "english",
        stemming: true,
        case_sensitive: false,
        remove_stopwords: true,
      },
    },
  };

  await ns.upsert({
    vectors: [
      {
        id: 1,
        vector: [0.1, 0.1],
        attributes: {
          text: "Walruses are large marine mammals with long tusks and whiskers",
        },
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        attributes: { text: "They primarily inhabit the cold Arctic regions" },
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        attributes: {
          text: "Walruses use their tusks to help haul themselves onto ice",
        },
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        attributes: {
          text: "Their diet mainly consists of mollusks and other sea creatures",
        },
      },
      {
        id: 5,
        vector: [0.5, 0.5],
        attributes: {
          text: "Walrus populations are affected by climate change and melting ice",
        },
      },
    ],
    distance_metric: "cosine_distance",
    schema: schema,
  });

  const results = await ns.query({
    rank_by: [
      "Sum",
      [
        ["text", "BM25", "large tusk"],
        ["text", "BM25", "mollusk diet"],
      ],
    ],
  });

  expect(results.length).toEqual(3);
  expect(results[0].id).toEqual(4);
  expect(results[1].id).toEqual(1);
  expect(results[2].id).toEqual(3);
});

test("order_by_attribute", async () => {
  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.upsert({
    vectors: [
      {
        id: 1,
        vector: [0.1, 0.1],
        attributes: {
          a: "5",
        },
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        attributes: {
          a: "4",
        },
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        attributes: {
          a: "3",
        },
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        attributes: {
          a: "2",
        },
      },
      {
        id: 5,
        vector: [0.5, 0.5],
        attributes: {
          a: "1",
        },
      },
    ],
    distance_metric: "euclidean_squared",
  });

  const results_asc = await ns.query({
    rank_by: ["a", "asc"],
  });
  expect(results_asc.length).toEqual(5);
  expect(results_asc[0].id).toEqual(5);
  expect(results_asc[1].id).toEqual(4);
  expect(results_asc[2].id).toEqual(3);
  expect(results_asc[3].id).toEqual(2);
  expect(results_asc[4].id).toEqual(1);

  const results_desc = await ns.query({
    rank_by: ["a", "desc"],
  });
  expect(results_desc.length).toEqual(5);
  expect(results_desc[0].id).toEqual(1);
  expect(results_desc[1].id).toEqual(2);
  expect(results_desc[2].id).toEqual(3);
  expect(results_desc[3].id).toEqual(4);
  expect(results_desc[4].id).toEqual(5);
});

test("bm25_with_default_schema_and_simple_query", async () => {
  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  const schema = {
    text: {
      type: "?string",
      bm25: true,
    },
  };

  await ns.upsert({
    vectors: [
      {
        id: 1,
        vector: [0.1, 0.1],
        attributes: {
          text: "Walruses can produce a variety of funny sounds, including whistles, grunts, and bell-like noises.",
        },
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        attributes: {
          text: "They sometimes use their tusks as a tool to break through ice or to scratch their bodies.",
        },
      },
    ],
    distance_metric: "cosine_distance",
    schema: schema,
  });

  const results = await ns.query({
    rank_by: ["text", "BM25", "scratch"],
  });

  expect(results.length).toEqual(1);
  expect(results[0].id).toEqual(2);
});

test("schema", async () => {
  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.upsert({
    vectors: [
      {
        id: 1,
        vector: [0.1, 0.1],
        attributes: {
          title: "one",
          private: true,
          tags: ["a", "b"],
        },
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        attributes: {
          title: null,
          private: null,
          tags: ["b", "d"],
        },
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        attributes: {
          title: "three",
          private: false,
          "tags": [],
        },
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        attributes: {
          title: "four",
          private: true,
          tags: ["c"],
        },
      },
    ],
    distance_metric: "cosine_distance",
    schema: {
      title: {
        type: "string",
        full_text_search: {
          stemming: true,
          remove_stopwords: true,
          case_sensitive: false
        }
      },
      tags: {
        type: "[]string",
        full_text_search: {
          stemming: false,
          remove_stopwords: false,
          case_sensitive: true
        }
      }
    }
  });

  const schema = await ns.schema();
  expect(schema).toEqual({
    id: {
      type: 'uint',
      filterable: null,
      bm25: null,
      full_text_search: null
    },
    title: {
      type: 'string',
      filterable: false,
      bm25: null,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: 'english',
        stemming: true,
        remove_stopwords: true,
        case_sensitive: false,
        tokenizer: 'Word',
      }
    },
    tags: {
      type: '[]string',
      filterable: false,
      bm25: null,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: 'english',
        stemming: false,
        remove_stopwords: false,
        case_sensitive: true,
        tokenizer: 'Word',
      }
    },
    private: {
      type: 'bool',
      filterable: true,
      bm25: null,
      full_text_search: null
    }
  });
});

test("sanity", async () => {
  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.upsert({
    vectors: [
      {
        id: 1,
        vector: [1, 2],
        attributes: {
          foo: "bar",
          numbers: [1, 2, 3],
          maybeNull: null,
          bool: true,
        },
      },
      {
        id: 2,
        vector: [3, 4],
        attributes: {
          foo: "baz",
          numbers: [2, 3, 4],
          maybeNull: null,
          bool: true,
        },
      },
      {
        id: 3,
        vector: [3, 4],
        attributes: {
          foo: "baz",
          numbers: [17],
          maybeNull: "oh boy!",
          bool: true,
        },
      },
    ],
    distance_metric: "cosine_distance",
  });

  const resultsWithMetrics = await ns.queryWithMetrics({
    vector: [1, 1],
    filters: ["numbers", "In", [2, 4]],
  });
  let results = resultsWithMetrics.results;
  expect(results.length).toEqual(2);
  expect(results[0].id).toEqual(2);
  expect(results[1].id).toEqual(1);

  const metrics = resultsWithMetrics.metrics;
  expect(metrics.approx_namespace_size).toEqual(3);
  expect(metrics.exhaustive_search_count).toEqual(3);
  expect(metrics.processing_time).toBeGreaterThan(10);
  expect(metrics.response_time).toBeGreaterThan(10);
  expect(metrics.body_read_time).toBeGreaterThan(0);
  expect(metrics.decompress_time).toEqual(0); // response was too small to compress
  expect(metrics.compress_time).toBeGreaterThan(0);
  expect(metrics.deserialize_time).toBeGreaterThan(0);

  const results2 = await ns.query({
    vector: [1, 1],
    filters: [
      "And",
      [
        [
          "Or",
          [
            ["numbers", "In", [2, 3]],
            ["numbers", "In", [1, 7]],
          ],
        ],
        [
          "Or",
          [
            ["foo", "Eq", "bar"],
            ["numbers", "In", 4],
          ],
        ],
        ["foo", "NotEq", null],
        ["maybeNull", "Eq", null],
        ["bool", "Eq", true],
      ],
    ],
  });
  expect(results2.length).toEqual(2);
  expect(results2[0].id).toEqual(2);
  expect(results2[1].id).toEqual(1);

  const recall = await ns.recall({
    num: 1,
    top_k: 2,
  });
  expect(recall.avg_recall).toEqual(1);
  expect(recall.avg_exhaustive_count).toEqual(2);
  expect(recall.avg_ann_count).toEqual(2);

  // Delete the second vector.
  await ns.delete({ ids: [1] });

  // If we query now, we should only get one result.
  results = await ns.query({
    vector: [1, 1],
    filters: ["numbers", "In", [2, 4]],
  });
  expect(results.length).toEqual(1);
  expect(results[0].id).toEqual(2);

  let num = await ns.approxNumVectors();
  expect(num).toEqual(2);

  let metadata = await ns.metadata();
  expect(metadata.approx_count).toEqual(2);
  expect(metadata.dimensions).toEqual(2);

  // Check that `metadata.created_at` data is a valid Date for today, but don't bother checking the
  // time. We know it was created today as the test deletes the namespace in the
  // beginning. When we compare against the current time, ensure it's UTC.
  const now = new Date();
  expect(metadata.created_at.getFullYear()).toEqual(now.getUTCFullYear());
  expect(metadata.created_at.getMonth()).toEqual(now.getUTCMonth());
  expect(metadata.created_at.getDate()).toEqual(now.getUTCDate());

  // Delete the entire namespace.
  await ns.deleteAll();

  // For some reason, expect().toThrow doesn't catch properly
  let gotError: any = null;
  try {
    await ns.query({
      vector: [1, 1],
      filters: ["numbers", "In", [2, 4]],
    });
  } catch (e: any) {
    gotError = e;
  }
  expect(gotError).toStrictEqual(
    new TurbopufferError("🤷 namespace 'typescript_sdk_sanity' was not found", {
      status: 404,
    }),
  );
}, 10_000);

test("connection errors are wrapped", async () => {
  const tpuf = new Turbopuffer({
    baseUrl: "https://api.turbopuffer.com:12345",
    apiKey: process.env.TURBOPUFFER_API_KEY!,
    connectTimeout: 500,
  });

  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  let gotError: any = null;
  try {
    await ns.query({
      vector: [1, 1],
    });
  } catch (e: any) {
    gotError = e;
  }
  expect(gotError).toStrictEqual(
    new TurbopufferError("fetch failed: Connect Timeout Error", {}),
  );
});

test("empty_namespace", async () => {
  const tpuf = new Turbopuffer({
    apiKey: process.env.TURBOPUFFER_API_KEY!,
  });

  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  await ns.upsert({
    vectors: [
      {
        id: 1,
        vector: [0.1, 0.1],
      },
    ],
    distance_metric: "cosine_distance",
  });

  await ns.delete({ ids: [1] });

  await ns.export();
});

function randomVector(dims: number) {
  return Array(dims)
    .fill(0)
    .map(() => Math.random());
}

test("compression", async () => {
  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  // Insert a large number of vectors to trigger compression
  const vectors = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    vector: randomVector(1024),
    attributes: {
      text: "b".repeat(1024),
    },
  }));

  await ns.upsert({
    vectors: vectors,
    distance_metric: "cosine_distance",
  });

  const resultsWithMetrics = await ns.queryWithMetrics({
    vector: randomVector(1024),
    top_k: 10,
    include_vectors: true,
    include_attributes: true,
  });

  const metrics = resultsWithMetrics.metrics;
  expect(metrics.compress_time).toBeGreaterThan(0);
  expect(metrics.decompress_time).toBeGreaterThan(0); // Response should be compressed
  expect(metrics.body_read_time).toBeGreaterThan(0);
  expect(metrics.deserialize_time).toBeGreaterThan(0);
});

test("disable_compression", async () => {
  const tpufNoCompression = new Turbopuffer({
    apiKey: process.env.TURBOPUFFER_API_KEY!,
    compression: false,
  });

  const ns = tpufNoCompression.namespace(
    "typescript_sdk_" + expect.getState().currentTestName,
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  // Insert a large number of vectors to trigger compression
  const vectors = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    vector: randomVector(1024),
    attributes: {
      text: "b".repeat(1024),
    },
  }));

  await ns.upsert({
    vectors: vectors,
    distance_metric: "cosine_distance",
  });

  const resultsWithMetrics = await ns.queryWithMetrics({
    vector: randomVector(1024),
    top_k: 10,
    include_vectors: true,
    include_attributes: true,
  });

  const metrics = resultsWithMetrics.metrics;
  expect(metrics.compress_time).toEqual(0);
  expect(metrics.decompress_time).toEqual(0);
  expect(metrics.body_read_time).toBeGreaterThan(0);
  expect(metrics.deserialize_time).toBeGreaterThan(0);
});
