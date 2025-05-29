# Upgrade guide

This document describes only the most notable breaking changes in new versions
of the SDK. See [CHANGELOG.md](./CHANGELOG.md) for a full list of changes.

## v0.10

* Compression is not optimized for large responses.

  TODO(benesch): fix this.

* Several changes have been made to the `Turbopuffer` constructor:

  * A mandatory `region` parameter has been added. This is more convenient
    than passing the full base URL.

  * The `baseUrl` parameter has been renamed to `baseURL`. The base URL must
    be a fully-specified URL, including the protocol (e.g., `https://`).

  * The `apiKey` parameter defaults to the `TURBOPUFFER_API_KEY` environment
    variable.

  Old:

  ```ts
  const tpuf = new Turbopuffer({
    apiKey: process.env.TURBOPUFFER_API_KEY,
    region: "https://gcp-us-central1.turbopuffer.com",
  });
  ```

  New:

  ```ts
  const tpuf = new Turbopuffer({
    // Use `region` instead of `baseUrl` if possible.
    region: "gcp-us-central1",
    // No need to pass `apiKey` if using the `TURBOPUFFER_API_KEY` environment
    // variable.
  });
  ```

* The `namespaces` method has been renamed to `listNamespaces`.

* The `schema` method has been renamed to `getSchema`.

* The `updateSchema` method now takes a `schema` parameter instead of
  taking the schema directly.

  Old:

  ```ts
  await tpuf.namespace("ns").updateSchema({
    attr1: "val1",
    attr2: "val2",
    // ...
  });
  ```

  New:

  ```ts
  await tpuf.namespace("ns").updateSchema({
    schema: {
      attr1: "val1",
      attr2: "val2",
      // ...
    },
  });
  ```

* The following performance metrics have been removed without replacement:
  * `response_time`
  * `body_read_time`
  * `compress_time`
  * `deserialize_time`

  TODO(benesch): restore these?

* The `metadata` method has been removed.

  * To query for the number of documents in a namespace, use a `count` aggregate
    query instead.

    ```ts
    const results = await tpuf.namespace("ns").query({
      aggregate_by: {"count": ["Count", "id"]}
    });
    console.log(results.aggregations?.count);
    ```

  * To determine the dimensionality of the vectors in a namespace, use
    `getSchema` instead and inspect the type of the `vector` attribute.

  * There is no replacement for accessing the `created_at` field. [Contact us]
    if you need this field.

* The `export` method has been removed.

  Instead, use the `query` method to page through documents by advancing a
  filter on the `id` attribute.

  See <https://turbopuffer.com/docs/export> for sample code.

* The `rows` field returned by the `query` method is now nullable. Adjust your
  code to handle this appropriately (e.g., by using a non-null assertion or a
  null coalescing operator):

  Old:

  ```ts
  const results = await tpuf.namespace("ns").query({ top_k: 10 });
  const topDoc = results.rows[0];
  ```

  New:

  ```ts
  const results = await tpuf.namespace("ns").query({ top_k: 10 });
  const topDoc = results.rows![0]; // note non-null assertion
  ```

  The reason for this change is that queries that specify an `aggregate_by`
  parameter will return data in the `aggregations` field rather than the
  `rows` field.

* Error types have been refactored. The new types are reasonably self
  describing, but [contact us] if you need help.

[contact us]: https://turbopuffer.com/contact
