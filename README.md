The **official TypeScript SDK** for Turbopuffer.

To install,

```bash
npm i @turbopuffer/turbopuffer
```

Usage:

```ts
// Make a new client
const client = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY as string,
});

// Upsert some vectors to a namespace
await client.upsert({
  "my-cool-namespace",
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

// Query the namespace
let results = await client.query({
  namespace,
  vector: [1, 1],
  filters: {
    numbers: [["In", [2, 4]]],
  },
});
```

To publish a new version,

```bash
npm publish --access public
```
