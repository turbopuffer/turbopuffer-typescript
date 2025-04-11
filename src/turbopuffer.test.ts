import { Turbopuffer, RankBy, Schema, TurbopufferError } from "./index";
import { isRuntimeFullyNodeCompatible, buildUrl } from "./helpers";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY!,
});

const testNamespacePrefix = "typescript_sdk_";

test("trailing_slashes_in_base_url", async () => {
  const tpuf = new Turbopuffer({
    apiKey: process.env.TURBOPUFFER_API_KEY!,
    baseUrl: "https://gcp-us-east4.turbopuffer.com//",
  });

  const ns = tpuf.namespace(
    testNamespacePrefix + "trailing_slashes_in_base_url",
  );

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        text: "Walruses are large marine mammals with long tusks and whiskers",
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        text: "They primarily inhabit the cold Arctic regions",
      },
    ],
    distance_metric: "cosine_distance",
  });

  const schema = await ns.schema();
  expect(schema).toEqual({
    id: {
      type: "uint",
      filterable: null,
      full_text_search: null,
    },
    text: {
      type: "string",
      filterable: true,
      full_text_search: null,
    },
    vector: {
      type: "[2]f32",
      ann: true,
      filterable: null,
      full_text_search: null,
    },
  });
});

test("bm25_with_custom_schema_and_sum_query", async () => {
  const ns = tpuf.namespace(
    testNamespacePrefix + "bm25_with_custom_schema_and_sum_query",
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        text: "Walruses are large marine mammals with long tusks and whiskers",
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        text: "They primarily inhabit the cold Arctic regions",
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        text: "Walruses use their tusks to help haul themselves onto ice",
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        text: "Their diet mainly consists of mollusks and other sea creatures",
      },
      {
        id: 5,
        vector: [0.5, 0.5],
        text: "Walrus populations are affected by climate change and melting ice",
      },
    ],
    distance_metric: "cosine_distance",
    schema: {
      text: {
        type: "string",
        bm25: {
          language: "english",
          stemming: true,
          case_sensitive: false,
          remove_stopwords: true,
        },
      },
    },
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

test("bm25_with_tokenizer_pre_tokenized_array", async () => {
  const ns = tpuf.namespace(
    testNamespacePrefix + "bm25_with_tokenizer_pre_tokenized_array",
  );
  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  // let's test with a columnar write
  await ns.write({
    upsert_columns: {
      id: [1, 2],
      vector: [
        [0.1, 0.1],
        [0.2, 0.2],
      ],
      content: [
        ["jumped", "over", "the", "lazy", "dog"],
        ["the", "lazy", "dog", "is", "brown"],
      ],
    },
    schema: {
      content: {
        type: "[]string",
        full_text_search: {
          tokenizer: "pre_tokenized_array",
        },
      },
    },
    distance_metric: "cosine_distance",
  });

  let results = await ns.query({
    rank_by: ["content", "BM25", ["jumped"]],
    top_k: 10,
  });
  expect(results.length).toEqual(1);
  expect(results[0].id).toEqual(1);

  results = await ns.query({
    rank_by: ["content", "BM25", ["dog"]],
    top_k: 10,
  });
  expect(results.length).toEqual(2);

  await expect(
    ns.query({
      rank_by: ["content", "BM25", "jumped"],
      top_k: 10,
    }),
  ).rejects.toThrow(
    "invalid input 'jumped' for rank_by field \"content\", expecting []string",
  );
});

test("contains_all_tokens", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "contains_all_tokens");
  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  // let's test with a columnar write
  await ns.write({
    upsert_columns: {
      id: [1],
      vector: [[0.1, 0.1]],
      text: ["Walruses are large marine mammals with long tusks and whiskers"],
    },
    schema: {
      text: {
        type: "string",
        full_text_search: {
          stemming: true,
        },
      },
    },
    distance_metric: "cosine_distance",
  });

  const results = await ns.query({
    rank_by: ["text", "BM25", "walrus whisker"],
    filters: ["text", "ContainsAllTokens", "marine mammals"],
  });
  expect(results.length).toEqual(1);

  const missing = await ns.query({
    rank_by: ["text", "BM25", "walrus whisker"],
    filters: ["text", "ContainsAllTokens", "marine mammals short"],
  });
  expect(missing.length).toEqual(0);
});

test("order_by_attribute", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "order_by_attribute");

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        a: "5",
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        a: "4",
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        a: "3",
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        a: "2",
      },
      {
        id: 5,
        vector: [0.5, 0.5],
        a: "1",
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
    testNamespacePrefix + "bm25_with_default_schema_and_simple_query",
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        text: "Walruses can produce a variety of funny sounds, including whistles, grunts, and bell-like noises.",
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        text: "They sometimes use their tusks as a tool to break through ice or to scratch their bodies.",
      },
    ],
    distance_metric: "cosine_distance",
    schema: {
      text: {
        type: "string",
        bm25: true,
      },
    },
  });

  const results = await ns.query({
    rank_by: ["text", "BM25", "scratch"],
  });

  expect(results.length).toEqual(1);
  expect(results[0].id).toEqual(2);
});

test("namespaces", async () => {
  const namespaces0 = await tpuf.namespaces({ page_size: 5 });
  const cursor0 = namespaces0.next_cursor;

  const namespaces1 = await tpuf.namespaces({
    cursor: cursor0,
    page_size: 5,
  });
  const cursor1 = namespaces1.next_cursor;

  expect(namespaces0.namespaces.length).toEqual(5);
  expect(namespaces0.namespaces.length).toEqual(5);
  expect(cursor0).not.toEqual(cursor1);
});

test("hint_cache_warm", async () => {
  const nsId = (await tpuf.namespaces({ page_size: 1 })).namespaces[0].id;
  const ns = await tpuf.namespace(nsId);

  const result = await ns.hintCacheWarm();

  expect(typeof result.message).toBe("string");
  expect(["ACCEPTED", "OK"]).toContain(result.status);
});

test("schema", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "schema");

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        title: "one",
        private: true,
        tags: ["a", "b"],
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        title: null,
        private: null,
        tags: ["b", "d"],
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        title: "three",
        private: false,
        tags: [],
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        title: "four",
        private: true,
        tags: ["c"],
      },
    ],
    distance_metric: "cosine_distance",
    schema: {
      title: {
        type: "string",
        full_text_search: {
          stemming: true,
          remove_stopwords: true,
          case_sensitive: false,
        },
      },
      tags: {
        type: "[]string",
        full_text_search: {
          stemming: false,
          remove_stopwords: false,
          case_sensitive: true,
        },
      },
      vector: {
        type: "[2]f16",
        ann: true,
      },
    },
  });

  const schema = await ns.schema();
  expect(schema).toEqual({
    id: {
      type: "uint",
      filterable: null,
      full_text_search: null,
    },
    title: {
      type: "string",
      filterable: false,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: "english",
        stemming: true,
        remove_stopwords: true,
        case_sensitive: false,
        tokenizer: "word_v1",
      },
    },
    tags: {
      type: "[]string",
      filterable: false,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: "english",
        stemming: false,
        remove_stopwords: false,
        case_sensitive: true,
        tokenizer: "word_v1",
      },
    },
    private: {
      type: "bool",
      filterable: true,
      full_text_search: null,
    },
    vector: {
      type: "[2]f16",
      ann: true,
      filterable: null,
      full_text_search: null,
    },
  });
});

test("update_schema", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "update_schema");

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        private: true,
        tags: ["a", "b"],
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        private: null,
        tags: ["b", "d"],
      },
    ],
    distance_metric: "cosine_distance",
    schema: {
      tags: {
        type: "[]string",
        full_text_search: {
          stemming: false,
          remove_stopwords: false,
          case_sensitive: true,
        },
      },
    },
  });

  const schema = await ns.schema();
  expect(schema).toEqual({
    id: {
      type: "uint",
      filterable: null,
      full_text_search: null,
    },
    tags: {
      type: "[]string",
      filterable: false,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: "english",
        stemming: false,
        remove_stopwords: false,
        case_sensitive: true,
        tokenizer: "word_v1",
      },
    },
    private: {
      type: "bool",
      filterable: true,
      full_text_search: null,
    },
    vector: {
      type: "[2]f32",
      ann: true,
      filterable: null,
      full_text_search: null,
    },
  });

  // Write an update to the schema making 'tags'
  // filterable and 'private' not filterable
  const updateSchema = await ns.updateSchema({
    tags: {
      type: "[]string",
      filterable: true,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: "english",
        stemming: false,
        remove_stopwords: false,
        case_sensitive: true,
        tokenizer: "word_v1",
      },
    },
    private: {
      type: "bool",
      filterable: false,
      full_text_search: false,
    },
  });
  expect(updateSchema).toEqual({
    id: {
      type: "uint",
      filterable: null,
      full_text_search: null,
    },
    tags: {
      type: "[]string",
      filterable: true,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: "english",
        stemming: false,
        remove_stopwords: false,
        case_sensitive: true,
        tokenizer: "word_v1",
      },
    },
    private: {
      type: "bool",
      filterable: false,
      full_text_search: null,
    },
    vector: {
      type: "[2]f32",
      ann: true,
      filterable: null,
      full_text_search: null,
    },
  });
});

test("sanity", async () => {
  const nameSpaceName = testNamespacePrefix + "sanity";
  const ns = tpuf.namespace(nameSpaceName);

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [1, 2],
        foo: "bar",
        numbers: [1, 2, 3],
        maybeNull: null,
        bool: true,
      },
      {
        id: 2,
        vector: [3, 4],
        foo: "baz",
        numbers: [2, 3, 4],
        maybeNull: null,
        bool: true,
      },
      {
        id: 3,
        vector: [3, 4],
        foo: "baz",
        numbers: [17],
        maybeNull: "oh boy!",
        bool: true,
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
  expect(metrics.query_execution_time).toBeGreaterThan(10);
  expect(metrics.response_time).toBeGreaterThan(10);
  expect(metrics.body_read_time).toBeGreaterThan(0);
  expect(metrics.compress_time).toBeGreaterThan(0);
  expect(metrics.deserialize_time).toBeGreaterThan(0);
  if (isRuntimeFullyNodeCompatible) {
    expect(metrics.decompress_time).toEqual(0); // response was too small to compress
  } else {
    expect(metrics.decompress_time).toBeNull;
  }

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
  await ns.write({
    deletes: [1],
  });

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
    new TurbopufferError(`🤷 namespace '${nameSpaceName}' was not found`, {
      status: 404,
    }),
  );
}, 10_000);

const t = isRuntimeFullyNodeCompatible ? it : it.skip;
t("connection_errors_are_wrapped", async () => {
  const tpuf = new Turbopuffer({
    baseUrl: "https://api.turbopuffer.com:12345",
    apiKey: process.env.TURBOPUFFER_API_KEY!,
    connectTimeout: 500,
  });

  const ns = tpuf.namespace(
    testNamespacePrefix + "connection_errors_are_wrapped",
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

  const ns = tpuf.namespace(testNamespacePrefix + "empty_namespace");

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
      },
    ],
    distance_metric: "cosine_distance",
  });

  await ns.write({
    deletes: [1],
  });

  await ns.export();
});

test("export", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "export");

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        title: "one",
        private: false,
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        title: "two",
        private: true,
      },
    ],
    schema: {
      title: {
        type: "string",
        full_text_search: true,
      },
      private: {
        type: "bool",
      },
    },
    distance_metric: "cosine_distance",
  });

  const data = await ns.export();
  expect(data).toEqual({
    ids: [1, 2],
    vectors: [
      [0.1, 0.1],
      [0.2, 0.2],
    ],
    next_cursor: null,
  });

  await ns.deleteAll();
});

test("no_cmek", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "no_cmek");

  let error: any = null;
  try {
    await ns.write({
      upsert_rows: [
        {
          id: 1,
          vector: [0.1, 0.1],
        },
      ],
      distance_metric: "cosine_distance",
      encryption: {
        cmek: {
          key_name: "mykey",
        },
      },
    });
  } catch (e: any) {
    error = e;
  }

  expect(error).toBeInstanceOf(TurbopufferError);
});

test("copy_from_namespace", async () => {
  const ns1Name = testNamespacePrefix + "copy_from_namespace_1";
  const ns1 = tpuf.namespace(ns1Name);
  const ns2 = tpuf.namespace(testNamespacePrefix + "copy_from_namespace_2");

  try {
    await ns1.deleteAll();
    await ns2.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  // let's test with a columnar write
  await ns1.write({
    upsert_columns: {
      id: [1, 2, 3],
      vector: [
        [0.1, 0.1],
        [0.2, 0.2],
        [0.3, 0.3],
      ],
      tags: [["a"], ["b"], ["c"]],
    },
    distance_metric: "cosine_distance",
  });

  await ns2.copyFromNamespace(ns1Name);

  const res = await ns2.query({
    vector: [0.1, 0.1],
    include_vectors: true,
    include_attributes: true,
  });

  expect(res.length).toEqual(3);
});

test("patch", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "patch");

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [1, 1],
      },
      {
        id: 2,
        vector: [2, 2],
      },
    ],
    distance_metric: "cosine_distance",
  });

  await ns.write({
    patch_rows: [
      { id: 1, a: 1 },
      { id: 2, b: 2 },
    ],
  });

  await ns.write({
    patch_rows: [
      { id: 1, b: 1 },
      { id: 2, a: 2 },
    ],
  });

  let results = await ns.query({ include_attributes: true });
  expect(results.length).toEqual(2);
  expect(results[0].id).toEqual(1);
  expect(results[0].attributes).toEqual({ a: 1, b: 1 });
  expect(results[1].id).toEqual(2);
  expect(results[1].attributes).toEqual({ a: 2, b: 2 });

  await ns.write({
    patch_columns: {
      id: [1, 2],
      a: [11, 22],
      c: [1, 2],
    },
  });

  results = await ns.query({ include_attributes: true });
  expect(results.length).toEqual(2);
  expect(results[0].id).toEqual(1);
  expect(results[0].attributes).toEqual({ a: 11, b: 1, c: 1 });
  expect(results[1].id).toEqual(2);
  expect(results[1].attributes).toEqual({ a: 22, b: 2, c: 2 });

  await ns.deleteAll();
});

test("delete_by_filter", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "delete_by_filter");

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [1, 2],
        foo: "bar",
      },
      {
        id: 2,
        vector: [3, 4],
        foo: "baz",
      },
      {
        id: 3,
        vector: [3, 4],
        foo: "baz",
      },
    ],
    distance_metric: "cosine_distance",
  });

  let results = await ns.query({});
  expect(results.length).toEqual(3);

  const rowsAffected = await ns.write({
    delete_by_filter: ["foo", "Eq", "baz"],
  });
  expect(rowsAffected).toEqual(2);

  results = await ns.query({});
  expect(results.length).toEqual(1);
  expect(results[0].id).toEqual(1);

  await ns.deleteAll();
});

function randomVector(dims: number) {
  return Array(dims)
    .fill(0)
    .map(() => Math.random());
}

test("compression", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "compression");

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  // Insert a large number of vectors to trigger compression
  await ns.write({
    upsert_rows: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      vector: randomVector(1024),
      text: "b".repeat(1024),
    })),
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
  expect(metrics.body_read_time).toBeGreaterThan(0);
  expect(metrics.deserialize_time).toBeGreaterThan(0);
  if (isRuntimeFullyNodeCompatible) {
    expect(metrics.decompress_time).toBeGreaterThan(0); // Response should be compressed
  } else {
    expect(metrics.decompress_time).toBeNull;
  }
});

test("disable_compression", async () => {
  const tpufNoCompression = new Turbopuffer({
    apiKey: process.env.TURBOPUFFER_API_KEY!,
    compression: false,
  });

  const ns = tpufNoCompression.namespace(
    testNamespacePrefix + "disable_compression",
  );

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  // Insert a large number of vectors to trigger compression
  await ns.write({
    upsert_rows: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      vector: randomVector(1024),
      text: "b".repeat(1024),
    })),
    distance_metric: "cosine_distance",
  });

  const resultsWithMetrics = await ns.queryWithMetrics({
    vector: randomVector(1024),
    top_k: 10,
    include_vectors: true,
    include_attributes: true,
  });

  const metrics = resultsWithMetrics.metrics;
  expect(metrics.compress_time).toBeNull;
  expect(metrics.body_read_time).toBeGreaterThan(0);
  expect(metrics.deserialize_time).toBeGreaterThan(0);
  if (isRuntimeFullyNodeCompatible) {
    expect(metrics.decompress_time).toEqual(0);
  } else {
    expect(metrics.decompress_time).toBeNull;
  }
});

test("product_operator", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "product_operator");

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  const schema: Schema = {
    title: {
      type: "string",
      full_text_search: true,
    },
    content: {
      type: "string",
      full_text_search: true,
    },
  };

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        title: "one",
        content: "foo bar baz",
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        title: "two",
        content: "foo bar",
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        title: "three",
        content: "bar baz",
      },
    ],
    distance_metric: "euclidean_squared",
    schema: schema,
  });

  const queries: RankBy[] = [
    ["Product", [2, ["title", "BM25", "one"]]],
    ["Product", [["title", "BM25", "one"], 2]],
    [
      "Sum",
      [
        ["Product", [2, ["title", "BM25", "one"]]],
        ["content", "BM25", "foo"],
      ],
    ],
    [
      "Product",
      [
        2,
        [
          "Sum",
          [
            ["Product", [2, ["title", "BM25", "one"]]],
            ["content", "BM25", "foo"],
          ],
        ],
      ],
    ],
  ];

  for (const query of queries) {
    const results = await ns.query({ rank_by: query });
    expect(results.length).toBeGreaterThan(0);
  }
});

test("readme", async () => {
  const ns = tpuf.namespace(testNamespacePrefix + "readme");

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [1, 2],
        foo: "bar",
        numbers: [1, 2, 3],
      },
      {
        id: 2,
        vector: [3, 4],
        foo: "baz",
        numbers: [2, 3, 4],
      },
    ],
    distance_metric: "cosine_distance",
  });

  const results = await ns.query({
    vector: [1, 1],
    filters: ["numbers", "In", [2, 4]],
  });

  expect(results.length).toEqual(2);
  expect(results[0].id).toEqual(2);
  expect(results[0].dist).toBeGreaterThanOrEqual(0);
  expect(results[1].id).toEqual(1);
  expect(results[1].dist).toBeGreaterThanOrEqual(0);

  await ns.deleteAll();
});

// test helper and utility methods
test("test_buildUrl", () => {
  /** baseUrl w/o path **/
  /* w/o path + w/o query */
  expect(buildUrl("https://gcp-us-east4.turbopuffer.com", "").href).toEqual(
    "https://gcp-us-east4.turbopuffer.com/",
  );

  /* w/o path + w/ query */
  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com", "/v1/namespaces", {
      cursor: "next_cursor",
      prefix: "my_prefix",
      page_size: "15",
    }).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/v1/namespaces?cursor=next_cursor&prefix=my_prefix&page_size=15",
  );

  /* w/ path + w/o query */
  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com", "/v1/namespaces").href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/v1/namespaces");

  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com", "v1/namespaces").href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/v1/namespaces");

  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com", "v1/namespaces/").href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/v1/namespaces/");

  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com/", "/v1/namespaces").href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/v1/namespaces");

  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com/", "v1/namespaces").href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/v1/namespaces");

  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com//", "/v1/namespaces").href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/v1/namespaces");

  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com//", "//v1/namespaces").href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/v1/namespaces");

  /* w/ path + w/ query */
  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com", "/v1/namespaces", {
      cursor: "next_cursor",
      prefix: "my_prefix",
      page_size: "15",
    }).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/v1/namespaces?cursor=next_cursor&prefix=my_prefix&page_size=15",
  );

  /** baseUrl w/ path **/
  /* w/o path + w/o query */
  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com/my-cool-path", "").href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/my-cool-path/");

  /* w/o path + w/ query */
  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com/my-cool-path", "", {
      cursor: "next_cursor",
      prefix: "my_prefix",
      page_size: "15",
    }).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/my-cool-path/?cursor=next_cursor&prefix=my_prefix&page_size=15",
  );

  expect(
    buildUrl("https://gcp-us-east4.turbopuffer.com/my-cool-path/", "", {
      cursor: "next_cursor",
      prefix: "my_prefix",
      page_size: "15",
    }).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/my-cool-path/?cursor=next_cursor&prefix=my_prefix&page_size=15",
  );

  /* w/ path + w/o query */
  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path",
      "/v1/namespaces",
    ).href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/my-cool-path/v1/namespaces");

  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path/",
      "/v1/namespaces",
    ).href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/my-cool-path/v1/namespaces");

  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path//",
      "/v1/namespaces",
    ).href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/my-cool-path/v1/namespaces");

  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path//",
      "v1/namespaces",
    ).href,
  ).toEqual("https://gcp-us-east4.turbopuffer.com/my-cool-path/v1/namespaces");

  /* w/ path + w/ query */
  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path//",
      "v1/namespaces",
      {
        cursor: "next_cursor",
        prefix: "my_prefix",
        page_size: "15",
      },
    ).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/my-cool-path/v1/namespaces?cursor=next_cursor&prefix=my_prefix&page_size=15",
  );

  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path//",
      "v1/namespaces",
      {
        cursor: "next_cursor",
        prefix: "my_prefix",
        page_size: "15",
      },
    ).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/my-cool-path/v1/namespaces?cursor=next_cursor&prefix=my_prefix&page_size=15",
  );

  /** baseUrl w/ double path **/
  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path/another-dope-path",
      "",
    ).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/my-cool-path/another-dope-path/",
  );

  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path/another-dope-path",
      "",
      {
        cursor: "next_cursor",
        prefix: "my_prefix",
        page_size: "15",
      },
    ).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/my-cool-path/another-dope-path/?cursor=next_cursor&prefix=my_prefix&page_size=15",
  );

  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path/another-dope-path",
      "/v1/namespaces",
    ).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/my-cool-path/another-dope-path/v1/namespaces",
  );

  expect(
    buildUrl(
      "https://gcp-us-east4.turbopuffer.com/my-cool-path/another-dope-path",
      "/v1/namespaces",
      {
        cursor: "next_cursor",
        prefix: "my_prefix",
        page_size: "15",
      },
    ).href,
  ).toEqual(
    "https://gcp-us-east4.turbopuffer.com/my-cool-path/another-dope-path/v1/namespaces?cursor=next_cursor&prefix=my_prefix&page_size=15",
  );
});
