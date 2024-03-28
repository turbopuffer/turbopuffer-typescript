import { Turbopuffer } from "./turbopuffer";

const client = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY as string,
});

test("sanity", async () => {
  const namespace = "typescript_sdk_" + expect.getState().currentTestName;

  try {
    await client.deleteNamespace(namespace);
  } catch (_: any) {}

  await client.upsert({
    namespace,
    vectors: [
      {
        id: 1,
        vector: [1, 2],
        attributes: {
          foo: "bar",
          numbers: [1, 2, 3],
        },
      },
      {
        id: 2,
        vector: [3, 4],
        attributes: {
          foo: "baz",
          numbers: [2, 3, 4],
        },
      },
    ],
    distance_metric: "cosine_distance",
  });

  let results = await client.query({
    namespace,
    vector: [1, 1],
    filters: {
      numbers: [["In", [2, 4]]],
    },
  });
  expect(results.length).toEqual(2);
  expect(results[0].id).toEqual(2);
  expect(results[1].id).toEqual(1);

  let recall = await client.recall({
    namespace,
    num: 1,
    top_k: 2,
  });
  expect(recall.avg_recall).toEqual(1);
  expect(recall.avg_exhaustive_count).toEqual(2);
  expect(recall.avg_ann_count).toEqual(2);

  await client.deleteNamespace(namespace);

  // For some reason, expect().toThrow doesn't catch properly
  let gotError = false;
  try {
    await client.query({
      namespace,
      vector: [1, 1],
      filters: {
        numbers: [["In", [2, 4]]],
      },
    });
  } catch (_: any) {
    gotError = true;
  }
  expect(gotError).toBe(true);
});
