import Turbopuffer, { APIConnectionError, APIError, NotFoundError } from '@turbopuffer/turbopuffer';
import { isRuntimeFullyNodeCompatible } from '@turbopuffer/turbopuffer/lib/runtime';
import { AttributeSchema, RankBy } from '@turbopuffer/turbopuffer/resources';
import assert from 'assert';

const tpuf = new Turbopuffer({
  region: 'gcp-us-central1',
});

const testNamespacePrefix = `typescript_sdk_${Date.now()}_`;

/**
 * Escape the error message to be used in a Jest `toThrow` matcher (where
 * the error message is matched against the raw JSON returned by the server).s
 */
function escapeError(error: string) {
  return JSON.stringify(error).slice(1, -1);
}

async function expectThrows(promise: Promise<any>, errorMatcher: any) {
  // Work around a Bun limitation: https://github.com/oven-sh/bun/issues/5602
  // @ts-ignore
  if (typeof Bun !== 'undefined') {
    await expect(async () => await promise).toThrow(errorMatcher);
  } else {
    await expect(promise).rejects.toThrow(errorMatcher);
  }
}

test('bm25_with_custom_schema_and_sum_query', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'bm25_with_custom_schema_and_sum_query');

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
        text: 'Walruses are large marine mammals with long tusks and whiskers',
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        text: 'They primarily inhabit the cold Arctic regions',
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        text: 'Walruses use their tusks to help haul themselves onto ice',
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        text: 'Their diet mainly consists of mollusks and other sea creatures',
      },
      {
        id: 5,
        vector: [0.5, 0.5],
        text: 'Walrus populations are affected by climate change and melting ice',
      },
    ],
    distance_metric: 'cosine_distance',
    schema: {
      text: {
        type: 'string',
        full_text_search: {
          language: 'english',
          stemming: true,
          case_sensitive: false,
          remove_stopwords: true,
        },
      },
    },
  });

  const results = await ns.query({
    rank_by: [
      'Sum',
      [
        ['text', 'BM25', 'large tusk'],
        ['text', 'BM25', 'mollusk diet'],
      ],
    ],
    top_k: 10,
  });

  assert(results.rows);
  expect(results.rows.length).toEqual(3);
  expect(results.rows[0]?.id).toEqual(4);
  expect(results.rows[1]?.id).toEqual(1);
  expect(results.rows[2]?.id).toEqual(3);
});

test('bm25_with_tokenizer_pre_tokenized_array', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'bm25_with_tokenizer_pre_tokenized_array');
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
        ['jumped', 'over', 'the', 'lazy', 'dog'],
        ['the', 'lazy', 'dog', 'is', 'brown'],
      ],
    },
    schema: {
      content: {
        type: '[]string',
        full_text_search: {
          tokenizer: 'pre_tokenized_array',
        },
      },
    },
    distance_metric: 'cosine_distance',
  });

  let results = await ns.query({
    rank_by: ['content', 'BM25', ['jumped', 'over']],
    top_k: 10,
  });
  assert(results.rows);
  expect(results.rows.length).toEqual(1);
  expect(results.rows[0]?.id).toEqual(1);

  results = await ns.query({
    rank_by: ['content', 'BM25', ['dog']],
    top_k: 10,
  });
  expect(results.rows?.length).toEqual(2);

  await expectThrows(
    ns.query({
      rank_by: ['content', 'BM25', 'jumped'],
      top_k: 10,
    }),
    escapeError('invalid input \'jumped\' for rank_by field "content", expecting []string'),
  );
});

test('contains_all_tokens', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'contains_all_tokens');
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
      text: ['Walruses are large marine mammals with long tusks and whiskers'],
    },
    schema: {
      text: {
        type: 'string',
        full_text_search: {
          stemming: true,
        },
      },
    },
    distance_metric: 'cosine_distance',
  });

  const results = await ns.query({
    rank_by: ['text', 'BM25', 'walrus whisker'],
    filters: ['text', 'ContainsAllTokens', 'marine mammals'],
    top_k: 10,
  });
  expect(results.rows?.length).toEqual(1);

  const missing = await ns.query({
    rank_by: ['text', 'BM25', 'walrus whisker'],
    filters: ['text', 'ContainsAllTokens', 'marine mammals short'],
    top_k: 10,
  });
  expect(missing.rows?.length).toEqual(0);
});

test('order_by_attribute', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'order_by_attribute');

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
        a: '5',
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        a: '4',
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        a: '3',
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        a: '2',
      },
      {
        id: 5,
        vector: [0.5, 0.5],
        a: '1',
      },
    ],
    distance_metric: 'euclidean_squared',
  });

  const results_asc = await ns.query({
    rank_by: ['a', 'asc'],
    top_k: 10,
  });
  assert(results_asc.rows);
  expect(results_asc.rows.length).toEqual(5);
  expect(results_asc.rows[0]?.id).toEqual(5);
  expect(results_asc.rows[1]?.id).toEqual(4);
  expect(results_asc.rows[2]?.id).toEqual(3);
  expect(results_asc.rows[3]?.id).toEqual(2);
  expect(results_asc.rows[4]?.id).toEqual(1);

  const results_desc = await ns.query({
    rank_by: ['a', 'desc'],
    top_k: 10,
  });
  assert(results_desc.rows);
  expect(results_desc.rows.length).toEqual(5);
  expect(results_desc.rows[0]?.id).toEqual(1);
  expect(results_desc.rows[1]?.id).toEqual(2);
  expect(results_desc.rows[2]?.id).toEqual(3);
  expect(results_desc.rows[3]?.id).toEqual(4);
  expect(results_desc.rows[4]?.id).toEqual(5);
});

test('bm25_with_default_schema_and_simple_query', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'bm25_with_default_schema_and_simple_query');

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
        text: 'Walruses can produce a variety of funny sounds, including whistles, grunts, and bell-like noises.',
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        text: 'They sometimes use their tusks as a tool to break through ice or to scratch their bodies.',
      },
    ],
    distance_metric: 'cosine_distance',
    schema: {
      text: {
        type: 'string',
        full_text_search: true,
      },
    },
  });

  const results = await ns.query({
    rank_by: ['text', 'BM25', 'scratch'],
    top_k: 10,
  });

  assert(results.rows);
  expect(results.rows.length).toEqual(1);
  expect(results.rows[0]?.id).toEqual(2);
});

test('namespaces', async () => {
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

test('hint_cache_warm', async () => {
  const nsId = (await tpuf.namespaces({ page_size: 1 })).namespaces[0]?.id!;
  const ns = await tpuf.namespace(nsId);

  const result = await ns.hintCacheWarm();

  expect(typeof result.message).toBe('string');
  expect(['ACCEPTED', 'OK']).toContain(result.status);
});

test('schema', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'schema');

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
        title: 'one',
        private: true,
        tags: ['a', 'b'],
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        title: null,
        private: null,
        tags: ['b', 'd'],
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        title: 'three',
        private: false,
        tags: [],
      },
      {
        id: 4,
        vector: [0.4, 0.4],
        title: 'four',
        private: true,
        tags: ['c'],
      },
    ],
    distance_metric: 'cosine_distance',
    schema: {
      title: {
        type: 'string',
        full_text_search: {
          stemming: true,
          remove_stopwords: true,
          case_sensitive: false,
        },
      },
      tags: {
        type: '[]string',
        full_text_search: {
          stemming: false,
          remove_stopwords: false,
          case_sensitive: true,
        },
      },
      vector: {
        type: '[2]f16',
        ann: true,
      },
    },
  });

  const schema = await ns.schema();
  expect(schema).toEqual({
    id: {
      type: 'uint',
      filterable: null,
      full_text_search: null,
    },
    title: {
      type: 'string',
      filterable: false,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: 'english',
        stemming: true,
        max_token_length: 39,
        remove_stopwords: true,
        case_sensitive: false,
        tokenizer: 'word_v1',
      },
    },
    tags: {
      type: '[]string',
      filterable: false,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: 'english',
        stemming: false,
        max_token_length: 39,
        remove_stopwords: false,
        case_sensitive: true,
        tokenizer: 'word_v1',
      },
    },
    private: {
      type: 'bool',
      filterable: true,
      full_text_search: null,
    },
    vector: {
      type: '[2]f16',
      ann: true,
      filterable: null,
      full_text_search: null,
    },
  });
});

test('update_schema', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'update_schema');

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
        tags: ['a', 'b'],
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        private: null,
        tags: ['b', 'd'],
      },
    ],
    distance_metric: 'cosine_distance',
    schema: {
      tags: {
        type: '[]string',
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
      type: 'uint',
      filterable: null,
      full_text_search: null,
    },
    tags: {
      type: '[]string',
      filterable: false,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: 'english',
        stemming: false,
        max_token_length: 39,
        remove_stopwords: false,
        case_sensitive: true,
        tokenizer: 'word_v1',
      },
    },
    private: {
      type: 'bool',
      filterable: true,
      full_text_search: null,
    },
    vector: {
      type: '[2]f32',
      ann: true,
      filterable: null,
      full_text_search: null,
    },
  });

  // Write an update to the schema making 'tags'
  // filterable and 'private' not filterable
  const updateSchema = await ns.updateSchema({
    schema: {
      tags: {
        type: '[]string',
        filterable: true,
        full_text_search: {
          k1: 1.2,
          b: 0.75,
          language: 'english',
          stemming: false,
          remove_stopwords: false,
          case_sensitive: true,
          tokenizer: 'word_v1',
        },
      },
      private: {
        type: 'bool',
        filterable: false,
        full_text_search: false,
      },
    },
  });
  expect(updateSchema).toEqual({
    id: {
      type: 'uint',
      filterable: null,
      full_text_search: null,
    },
    tags: {
      type: '[]string',
      filterable: true,
      full_text_search: {
        k1: 1.2,
        b: 0.75,
        language: 'english',
        stemming: false,
        max_token_length: 39,
        remove_stopwords: false,
        case_sensitive: true,
        tokenizer: 'word_v1',
      },
    },
    private: {
      type: 'bool',
      filterable: false,
      full_text_search: null,
    },
    vector: {
      type: '[2]f32',
      ann: true,
      filterable: null,
      full_text_search: null,
    },
  });
});

test('sanity', async () => {
  const nameSpaceName = testNamespacePrefix + 'sanity';
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
        foo: 'bar',
        numbers: [1, 2, 3],
        maybeNull: null,
        bool: true,
      },
      {
        id: 2,
        vector: [3, 4],
        foo: 'baz',
        numbers: [2, 3, 4],
        maybeNull: null,
        bool: true,
      },
      {
        id: 3,
        vector: [3, 4],
        foo: 'baz',
        numbers: [17],
        maybeNull: 'oh boy!',
        bool: true,
      },
    ],
    distance_metric: 'cosine_distance',
  });

  const resultsWithPerformance = await ns.query({
    rank_by: ['vector', 'ANN', [1, 1]],
    filters: ['numbers', 'In', [2, 4]],
    top_k: 10,
  });
  assert(resultsWithPerformance.rows);
  expect(resultsWithPerformance.rows.length).toEqual(2);
  expect(resultsWithPerformance.rows[0]?.id).toEqual(2);
  expect(resultsWithPerformance.rows[1]?.id).toEqual(1);

  const performance = resultsWithPerformance.performance;
  expect(performance.approx_namespace_size).toEqual(3);
  expect(performance.exhaustive_search_count).toEqual(3);
  expect(performance.query_execution_ms).toBeGreaterThan(10);
  expect(performance.server_total_ms).toBeGreaterThan(10);

  const billing = resultsWithPerformance.billing;
  expect(billing).toEqual({
    billable_logical_bytes_queried: 256000000,
    billable_logical_bytes_returned: 24,
  });

  const results2 = await ns.query({
    rank_by: ['vector', 'ANN', [1, 1]],
    filters: [
      'And',
      [
        [
          'Or',
          [
            ['numbers', 'In', [2, 3]],
            ['numbers', 'In', [1, 7]],
          ],
        ],
        [
          'Or',
          [
            ['foo', 'Eq', 'bar'],
            ['numbers', 'In', 4],
          ],
        ],
        ['foo', 'NotEq', null],
        ['maybeNull', 'Eq', null],
        ['bool', 'Eq', true],
      ],
    ],
    top_k: 10,
  });
  assert(results2.rows);
  expect(results2.rows.length).toEqual(2);
  expect(results2.rows[0]?.id).toEqual(2);
  expect(results2.rows[1]?.id).toEqual(1);

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
  const results = await ns.query({
    rank_by: ['vector', 'ANN', [1, 1]],
    filters: ['numbers', 'In', [2, 4]],
    top_k: 10,
  });
  assert(results.rows);
  expect(results.rows.length).toEqual(1);
  expect(results.rows[0]?.id).toEqual(2);

  const aggResults = await ns.query({
    aggregate_by: {
      count: ['Count', 'id'],
    },
  });
  expect(aggResults.aggregations).toEqual({ count: 2 });

  // Delete the entire namespace.
  await ns.deleteAll();

  await expectThrows(
    ns.query({
      rank_by: ['vector', 'ANN', [1, 1]],
      filters: ['numbers', 'In', [2, 4]],
      top_k: 10,
    }),
    NotFoundError,
  );
}, 10_000);

test('contains_and_contains_any', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'contains_and_contains_any');

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        tags: ['python', 'javascript', 'rust'],
        category: 'backend',
      },
      {
        id: 2,
        tags: ['javascript', 'typescript', 'react'],
        category: 'frontend',
      },
      {
        id: 3,
        tags: ['rust', 'go', 'c++'],
        category: 'systems',
      },
      {
        id: 4,
        tags: ['python', 'django', 'flask'],
        category: 'backend',
      },
    ],
  });

  // Test Contains operator
  const containsResults = await ns.query({
    rank_by: ['id', 'asc'],
    filters: ['tags', 'Contains', 'javascript'],
    top_k: 10,
  });
  assert(containsResults.rows);
  const containsIds = containsResults.rows.map((row) => row.id).sort();
  expect(containsIds).toEqual([1, 2]);

  // Test NotContains operator
  const notContainsResults = await ns.query({
    rank_by: ['id', 'asc'],
    filters: ['tags', 'NotContains', 'javascript'],
    top_k: 10,
  });
  assert(notContainsResults.rows);
  const notContainsIds = notContainsResults.rows.map((row) => row.id).sort();
  expect(notContainsIds).toEqual([3, 4]);

  // Test ContainsAny operator
  const containsAnyResults = await ns.query({
    rank_by: ['id', 'asc'],
    filters: ['tags', 'ContainsAny', ['rust', 'typescript']],
    top_k: 10,
  });
  assert(containsAnyResults.rows);
  // Check that all expected IDs are present, regardless of order
  const containsAnyIds = containsAnyResults.rows.map((row) => row.id).sort();
  expect(containsAnyIds).toEqual([1, 2, 3]);

  // Test NotContainsAny operator
  const notContainsAnyResults = await ns.query({
    rank_by: ['id', 'asc'],
    filters: ['tags', 'NotContainsAny', ['javascript', 'rust', 'go']],
    top_k: 10,
  });
  assert(notContainsAnyResults.rows);
  expect(notContainsAnyResults.rows[0]?.id).toEqual(4);

  // Test combined with other filters
  const combinedResults = await ns.query({
    rank_by: ['id', 'asc'],
    filters: [
      'And',
      [
        ['tags', 'Contains', 'python'],
        ['category', 'Eq', 'backend'],
      ],
    ],
    top_k: 10,
  });
  assert(combinedResults.rows);
  const combinedIds = combinedResults.rows.map((row) => row.id).sort();
  expect(combinedIds).toEqual([1, 4]);

  // Test edge case: Contains with single element array
  const singleElementResults = await ns.query({
    rank_by: ['id', 'asc'],
    filters: ['tags', 'ContainsAny', ['python']],
    top_k: 10,
  });
  assert(singleElementResults.rows);
  const singleElementIds = singleElementResults.rows.map((row) => row.id).sort();
  expect(singleElementIds).toEqual([1, 4]);

  // Test error case: passing non-array to ContainsAny
  await expectThrows(
    ns.query({
      rank_by: ['id', 'asc'],
      filters: ['tags', 'ContainsAny', 'python'],
      top_k: 10,
    }),
    escapeError("filter error in key `tags`: type mismatch, ContainsAny expects []string, but got 'python'"),
  );

  // Test error case: passing array to Contains
  await expectThrows(
    ns.query({
      rank_by: ['id', 'asc'],
      filters: ['tags', 'Contains', ['python', 'javascript']],
      top_k: 10,
    }),
    escapeError(
      "filter error in key `tags`: type mismatch, Contains expects string, but got '[python, javascript]'",
    ),
  );

  // Test error case: passing non-array to NotContainsAny
  await expectThrows(
    ns.query({
      rank_by: ['id', 'asc'],
      filters: ['tags', 'NotContainsAny', 'python'],
      top_k: 10,
    }),
    escapeError(
      "filter error in key `tags`: type mismatch, NotContainsAny expects []string, but got 'python'",
    ),
  );

  // Test error case: passing array to NotContains
  await expectThrows(
    ns.query({
      rank_by: ['id', 'asc'],
      filters: ['tags', 'NotContains', ['python', 'javascript']],
      top_k: 10,
    }),
    escapeError(
      "filter error in key `tags`: type mismatch, NotContains expects string, but got '[python, javascript]'",
    ),
  );
});

test('exists', async () => {
  let ns = tpuf.namespace(testNamespacePrefix + 'exists');

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_columns: {
      id: [1],
      vector: [[0.1, 0.1]],
      private: [true],
      tags: [['a', 'b']],
    },
    distance_metric: 'cosine_distance',
  });

  let exists = await ns.exists();
  expect(exists).toEqual(true);
  await ns.deleteAll();

  ns = tpuf.namespace('non_existent_ns');
  exists = await ns.exists();
  expect(exists).toEqual(false);
});

test('connection_errors_are_wrapped', async () => {
  const tpuf = new Turbopuffer({
    baseURL: 'http://localhost:12345',
    timeout: 500,
  });

  const ns = tpuf.namespace(testNamespacePrefix + 'connection_errors_are_wrapped');

  await expectThrows(
    ns.query({
      rank_by: ['vector', 'ANN', [1, 1]],
      top_k: 10,
    }),
    APIConnectionError,
  );
});

test('empty_namespace', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'empty_namespace');

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
      },
    ],
    distance_metric: 'cosine_distance',
  });

  await ns.write({
    deletes: [1],
  });

  await ns.query({
    rank_by: ['id', 'asc'],
    top_k: 10,
  });
});

test('no_cmek', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'no_cmek');

  await expectThrows(
    ns.write({
      upsert_rows: [
        {
          id: 1,
          vector: [0.1, 0.1],
        },
      ],
      distance_metric: 'cosine_distance',
      encryption: {
        cmek: {
          key_name: 'mykey',
        },
      },
    }),
    APIError,
  );
});

test('copy_from_namespace', async () => {
  const ns1Name = testNamespacePrefix + 'copy_from_namespace_1';
  const ns1 = tpuf.namespace(ns1Name);
  const ns2 = tpuf.namespace(testNamespacePrefix + 'copy_from_namespace_2');

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
      tags: [['a'], ['b'], ['c']],
    },
    distance_metric: 'cosine_distance',
  });

  await ns2.write({
    copy_from_namespace: ns1Name,
  });

  const res = await ns2.query({
    rank_by: ['vector', 'ANN', [0.1, 0.1]],
    include_attributes: true,
    top_k: 10,
  });

  expect(res.rows?.length).toEqual(3);
});

test('patch', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'patch');

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
    distance_metric: 'cosine_distance',
  });

  await ns.write({
    patch_rows: [
      { id: 1, a: 1 },
      { id: 2, b: 2 },
    ],
    distance_metric: 'cosine_distance',
  });

  await ns.write({
    patch_rows: [
      { id: 1, b: 1 },
      { id: 2, a: 2 },
    ],
    distance_metric: 'cosine_distance',
  });

  let results = await ns.query({ rank_by: ['id', 'asc'], include_attributes: ['id', 'a', 'b'], top_k: 10 });
  assert(results.rows);
  expect(results.rows.length).toEqual(2);
  expect(results.rows[0]).toEqual({ id: 1, a: 1, b: 1 });
  expect(results.rows[1]).toEqual({ id: 2, a: 2, b: 2 });

  await ns.write({
    patch_columns: {
      id: [1, 2],
      a: [11, 22],
      c: [1, 2],
    },
  });

  results = await ns.query({ rank_by: ['id', 'asc'], include_attributes: ['id', 'a', 'b', 'c'], top_k: 10 });
  assert(results.rows);
  expect(results.rows.length).toEqual(2);
  expect(results.rows[0]).toEqual({ id: 1, a: 11, b: 1, c: 1 });
  expect(results.rows[1]).toEqual({ id: 2, a: 22, b: 2, c: 2 });

  await ns.deleteAll();
});

test('delete_by_filter', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'delete_by_filter');

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
        foo: 'bar',
      },
      {
        id: 2,
        vector: [3, 4],
        foo: 'baz',
      },
      {
        id: 3,
        vector: [3, 4],
        foo: 'baz',
      },
    ],
    distance_metric: 'cosine_distance',
  });

  let results = await ns.query({ rank_by: ['id', 'asc'], top_k: 10 });
  assert(results.rows);
  expect(results.rows.length).toEqual(3);

  const deleteResults = await ns.write({
    delete_by_filter: ['foo', 'Eq', 'baz'],
  });
  expect(deleteResults.rows_affected).toEqual(2);

  results = await ns.query({ rank_by: ['id', 'asc'], top_k: 10 });
  assert(results.rows);
  expect(results.rows.length).toEqual(1);
  expect(results.rows[0]?.id).toEqual(1);

  await ns.deleteAll();
});

function randomVector(dims: number) {
  return Array(dims)
    .fill(0)
    .map(() => Math.random());
}

test('compression', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'compression');

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
      text: 'b'.repeat(1024),
    })),
    distance_metric: 'cosine_distance',
  });

  const results = await ns.query({
    rank_by: ['vector', 'ANN', randomVector(1024)],
    top_k: 10,
    include_attributes: true,
  });

  const performance = results.performance;
  expect(performance.client_total_ms).toBeGreaterThan(0);
  expect(performance.client_compress_ms).toBeGreaterThan(0);
  expect(performance.client_deserialize_ms).toBeGreaterThan(0);
  if (isRuntimeFullyNodeCompatible) {
    expect(performance.client_response_ms).toBeGreaterThan(0);
    expect(performance.client_body_read_ms).toBeGreaterThan(0);
    expect(performance.client_decompress_ms).toBeGreaterThan(0); // Response should be compressed
  } else {
    expect(performance.client_response_ms).toBeUndefined();
    expect(performance.client_body_read_ms).toBeUndefined();
    expect(performance.client_decompress_ms).toBeUndefined();
  }
});

test('disable_compression', async () => {
  const tpufNoCompression = tpuf.withOptions({
    compression: false,
  });

  const ns = tpufNoCompression.namespace(testNamespacePrefix + 'disable_compression');

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
      text: 'b'.repeat(1024),
    })),
    distance_metric: 'cosine_distance',
  });

  const results = await ns.query({
    rank_by: ['vector', 'ANN', randomVector(1024)],
    top_k: 10,
    include_attributes: true,
  });

  const performance = results.performance;
  expect(performance.client_total_ms).toBeGreaterThan(0);
  expect(performance.client_compress_ms).toEqual(0);
  expect(performance.client_deserialize_ms).toBeGreaterThan(0);
  if (isRuntimeFullyNodeCompatible) {
    expect(performance.client_response_ms).toBeGreaterThan(0);
    expect(performance.client_body_read_ms).toBeGreaterThan(0);
    expect(performance.client_decompress_ms).toEqual(0);
  } else {
    expect(performance.client_response_ms).toBeUndefined();
    expect(performance.client_body_read_ms).toBeUndefined();
    expect(performance.client_decompress_ms).toBeUndefined();
  }
});

test('product_operator', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'product_operator');

  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  const schema: Record<string, AttributeSchema> = {
    title: {
      type: 'string',
      full_text_search: true,
    },
    content: {
      type: 'string',
      full_text_search: true,
    },
  };

  await ns.write({
    upsert_rows: [
      {
        id: 1,
        vector: [0.1, 0.1],
        title: 'one',
        content: 'foo bar baz',
      },
      {
        id: 2,
        vector: [0.2, 0.2],
        title: 'two',
        content: 'foo bar',
      },
      {
        id: 3,
        vector: [0.3, 0.3],
        title: 'three',
        content: 'bar baz',
      },
    ],
    distance_metric: 'euclidean_squared',
    schema: schema,
  });

  const queries: RankBy[] = [
    ['Product', [2, ['title', 'BM25', 'one']]],
    ['Product', [['title', 'BM25', 'one'], 2]],
    [
      'Sum',
      [
        ['Product', [2, ['title', 'BM25', 'one']]],
        ['content', 'BM25', 'foo'],
      ],
    ],
    [
      'Product',
      [
        2,
        [
          'Max',
          [
            ['Product', [2, ['title', 'BM25', 'one']]],
            ['content', 'BM25', 'foo'],
          ],
        ],
      ],
    ],
  ];

  for (const query of queries) {
    const results = await ns.query({ rank_by: query, top_k: 10 });
    expect(results.rows?.length).toBeGreaterThan(0);
  }
});

test('not', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'not');
  try {
    await ns.deleteAll();
  } catch (_: unknown) {
    /* empty */
  }

  await ns.write({
    upsert_columns: {
      id: [1],
      vector: [[0.1, 0.1]],
      text: ['Walruses are large marine mammals with long tusks and whiskers'],
    },
    schema: {
      text: {
        type: 'string',
        full_text_search: {
          stemming: true,
        },
      },
    },
    distance_metric: 'cosine_distance',
  });

  const results = await ns.query({
    rank_by: ['text', 'BM25', 'walrus whisker'],
    filters: ['text', 'ContainsAllTokens', 'marine mammals'],
    top_k: 10,
  });
  expect(results.rows?.length).toEqual(1);

  const resultsNot0 = await ns.query({
    rank_by: ['text', 'BM25', 'walrus whisker'],
    filters: ['Not', ['text', 'ContainsAllTokens', 'marine mammals']],
    top_k: 10,
  });
  expect(resultsNot0.rows?.length).toEqual(0);

  const resultsNot1 = await ns.query({
    rank_by: ['text', 'BM25', 'walrus whisker'],
    filters: ['Not', ['Not', ['text', 'ContainsAllTokens', 'marine mammals']]],
    top_k: 10,
  });
  expect(resultsNot1.rows?.length).toEqual(1);

  const resultsNot2 = await ns.query({
    rank_by: ['text', 'BM25', 'walrus whisker'],
    filters: [
      'Or',
      [
        ['text', 'ContainsAllTokens', 'marine things'],
        [
          'Or',
          [
            [
              'Not',
              [
                'Not',
                [
                  'And',
                  [
                    ['text', 'ContainsAllTokens', 'marine mammals'],
                    ['id', 'In', [0, 1, 2]],
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
    ],
    top_k: 10,
  });
  expect(resultsNot2.rows?.length).toEqual(1);
});

test('readme', async () => {
  const ns = tpuf.namespace(testNamespacePrefix + 'readme');

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
        foo: 'bar',
        numbers: [1, 2, 3],
      },
      {
        id: 2,
        vector: [3, 4],
        foo: 'baz',
        numbers: [2, 3, 4],
      },
    ],
    distance_metric: 'cosine_distance',
  });

  const results = await ns.query({
    rank_by: ['vector', 'ANN', [1, 1]],
    filters: ['numbers', 'In', [2, 4]],
    top_k: 10,
  });

  assert(results.rows);
  expect(results.rows.length).toEqual(2);
  expect(results.rows[0]?.id).toEqual(2);
  expect(results.rows[0]?.$dist).toBeGreaterThanOrEqual(0);
  expect(results.rows[1]?.id).toEqual(1);
  expect(results.rows[1]?.$dist).toBeGreaterThanOrEqual(0);

  await ns.deleteAll();
});
