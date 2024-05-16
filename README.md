The **official TypeScript SDK** for Turbopuffer.

To install:

```bash
npm i @turbopuffer/turbopuffer
```

Usage:

```ts
// Make a new client
const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY as string,
});

// Instantiate an object to work with a namespace
const ns = tpuf.namespace("my-cool-namespace");

// Upsert some vectors
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

// Query
let results = await ns.query({
  vector: [1, 1],
  filters: {
    numbers: ["In", [2, 4]],
  },
});
```

To run tests:

```bash
npm run test
```

To publish a new version:

```bash
npm publish --access public
```
