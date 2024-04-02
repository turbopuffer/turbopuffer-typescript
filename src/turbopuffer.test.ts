import { Turbopuffer } from "./turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY as string,
});

test("sanity", async () => {
  const ns = tpuf.namespace(
    "typescript_sdk_" + expect.getState().currentTestName
  );

  try {
    await ns.delete();
  } catch (_: any) {}

  await ns.upsert({
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

  let results = await ns.query({
    vector: [1, 1],
    filters: ["numbers", "In", [2, 4]],
  });
  expect(results.length).toEqual(2);
  expect(results[0].id).toEqual(2);
  expect(results[1].id).toEqual(1);

  let results2 = await ns.query({
    vector: [1, 1],
    filters: ["And", [
      ["Or", [
        ["numbers", "In", [2, 3]],
        ["numbers", "In", [1, 7]],
      ]],
      ["Or", [
        ["foo", "Eq", "bar"],
        ["numbers", "In", 4],
      ]]
    ]],
  });
  expect(results2.length).toEqual(2);
  expect(results2[0].id).toEqual(2);
  expect(results2[1].id).toEqual(1);

  let recall = await ns.recall({
    num: 1,
    top_k: 2,
  });
  expect(recall.avg_recall).toEqual(1);
  expect(recall.avg_exhaustive_count).toEqual(2);
  expect(recall.avg_ann_count).toEqual(2);

  await ns.delete();

  // For some reason, expect().toThrow doesn't catch properly
  let gotError = false;
  try {
    await ns.query({
      vector: [1, 1],
      filters: ["numbers", "In", [2, 4]],
    });
  } catch (_: any) {
    gotError = true;
  }
  expect(gotError).toBe(true);
});
