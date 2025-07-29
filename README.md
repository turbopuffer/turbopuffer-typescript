# Turbopuffer TypeScript API Library <a href="https://turbopuffer.com"><img src="https://github.com/user-attachments/assets/8d6cca4c-10b7-4d3a-9782-696053baf44e" align="right"></a>

<a href="https://npmjs.org/package/@turbopuffer/turbopuffer"><img src="https://img.shields.io/npm/v/@turbopuffer/turbopuffer.svg?label=npm%20(stable)" alt="NPM version" align="right"></a> <img src="https://img.shields.io/bundlephobia/minzip/@turbopuffer/turbopuffer" alt="npm bundle size" align="right">

This library provides convenient access to the Turbopuffer HTTP API from server-side TypeScript or JavaScript.

It is generated with [Stainless](https://www.stainless.com/).

> [!IMPORTANT]
> **The latest version of the TypeScript SDK (v0.10) contains several breaking changes.**
>
> Consult [UPGRADING.md](./UPGRADING.md) for details.

## Documentation

The HTTP API documentation can be found at [turbopuffer.com/docs](https://turbopuffer.com/docs).

## Installation

```sh
npm install @turbopuffer/turbopuffer
```

## Usage

<!-- prettier-ignore -->
```js
import Turbopuffer from '@turbopuffer/turbopuffer';

const tpuf = new Turbopuffer({
  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted
});

const ns = tpuf.namespace("example");

// Query nearest neighbors with filter.
const vectorResult = await ns.query({
  rank_by: ["vector", "ANN", [0.1, 0.2]],
  top_k: 10,
  filters: [
    "And",
    [
      ["name", "Eq", "foo"],
      ["public", "Eq", 1],
    ],
  ],
  include_attributes: ["name"],
});
console.log(vectorResult.rows);
// [{ id: 1, attributes: { name: 'foo' }, dist: 0.009067952632904053 }]

// Full-text search on an attribute.
const ftsResult = await ns.query({
  top_k: 10,
  filters: ["name", "Eq", "foo"],
  rank_by: ["text", "BM25", "quick walrus"],
});
console.log(ftsResult.rows);
// [{ id: 1, attributes: { name: 'foo' }, dist: 0.19 }]
// [{ id: 2, attributes: { name: 'foo' }, dist: 0.168 }]

// See https://turbopuffer.com/docs/quickstart for more.
```

### Request & Response types

This library includes TypeScript definitions for all request params and response fields. You may import and use them like so:

<!-- prettier-ignore -->
```ts
import Turbopuffer from '@turbopuffer/turbopuffer';

const client = new Turbopuffer({
  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted
});

const params: Turbopuffer.NamespacesParams = { prefix: 'foo' };
const [namespaceSummary]: [Turbopuffer.NamespaceSummary] = await client.namespaces(params);
```

Documentation for each method, request param, and response field are available in docstrings and will appear on hover in most modern editors.

## Handling errors

When the library is unable to connect to the API,
or if the API returns a non-success status code (i.e., 4xx or 5xx response),
a subclass of `APIError` will be thrown:

<!-- prettier-ignore -->
```ts
const namespaces = await client.namespaces({ prefix: 'foo' }).catch(async (err) => {
  if (err instanceof Turbopuffer.APIError) {
    console.log(err.status); // 400
    console.log(err.name); // BadRequestError
    console.log(err.headers); // {server: 'nginx', ...}
  } else {
    throw err;
  }
});
```

Error codes are as follows:

| Status Code | Error Type                 |
| ----------- | -------------------------- |
| 400         | `BadRequestError`          |
| 401         | `AuthenticationError`      |
| 403         | `PermissionDeniedError`    |
| 404         | `NotFoundError`            |
| 422         | `UnprocessableEntityError` |
| 429         | `RateLimitError`           |
| >=500       | `InternalServerError`      |
| N/A         | `APIConnectionError`       |

### Retries

Certain errors will be automatically retried 4 times by default, with a short exponential backoff.
Connection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict,
429 Rate Limit, and >=500 Internal errors will all be retried by default.

You can use the `maxRetries` option to configure or disable this:

<!-- prettier-ignore -->
```js
// Configure the default for all requests:
const client = new Turbopuffer({
  maxRetries: 0, // default is 2
});

// Or, configure per-request:
await client.namespaces({ prefix: 'foo' }, {
  maxRetries: 5,
});
```

### Timeouts

Requests time out after 1 minute by default. You can configure this with a `timeout` option:

<!-- prettier-ignore -->
```ts
// Configure the default for all requests:
const client = new Turbopuffer({
  timeout: 20 * 1000, // 20 seconds (default is 1 minute)
});

// Override per-request:
await client.namespaces({ prefix: 'foo' }, {
  timeout: 5 * 1000,
});
```

On timeout, an `APIConnectionTimeoutError` is thrown.

Note that requests which time out will be [retried twice by default](#retries).

## Auto-pagination

List methods in the Turbopuffer API are paginated.
You can use the `for await … of` syntax to iterate through items across all pages:

```ts
async function fetchAllNamespaceSummaries(params) {
  const allNamespaceSummaries = [];
  // Automatically fetches more pages as needed.
  for await (const namespaceSummary of client.namespaces({ prefix: 'products' })) {
    allNamespaceSummaries.push(namespaceSummary);
  }
  return allNamespaceSummaries;
}
```

Alternatively, you can request a single page at a time:

```ts
let page = await client.namespaces({ prefix: 'products' });
for (const namespaceSummary of page.namespaces) {
  console.log(namespaceSummary);
}

// Convenience methods are provided for manually paginating:
while (page.hasNextPage()) {
  page = await page.getNextPage();
  // ...
}
```

## Advanced Usage

### Accessing raw Response data (e.g., headers)

The "raw" `Response` returned by `fetch()` can be accessed through the `.asResponse()` method on the `APIPromise` type that all methods return.
This method returns as soon as the headers for a successful response are received and does not consume the response body, so you are free to write custom parsing or streaming logic.

You can also use the `.withResponse()` method to get the raw `Response` along with the parsed data.
Unlike `.asResponse()` this method consumes the body, returning once it is parsed.

<!-- prettier-ignore -->
```ts
const client = new Turbopuffer();

const response = await client.namespaces({ prefix: 'foo' }).asResponse();
console.log(response.headers.get('X-My-Header'));
console.log(response.statusText); // access the underlying Response object

const { data: namespaces, response: raw } = await client.namespaces({ prefix: 'foo' }).withResponse();
console.log(raw.headers.get('X-My-Header'));
for await (const namespaceSummary of namespaces) {
  console.log(namespaceSummary.id);
}
```

### Logging

> [!IMPORTANT]
> All log messages are intended for debugging only. The format and content of log messages
> may change between releases.

#### Log levels

The log level can be configured in two ways:

1. Via the `TURBOPUFFER_LOG` environment variable
2. Using the `logLevel` client option (overrides the environment variable if set)

```ts
import Turbopuffer from '@turbopuffer/turbopuffer';

const client = new Turbopuffer({
  logLevel: 'debug', // Show all log messages
});
```

Available log levels, from most to least verbose:

- `'debug'` - Show debug messages, info, warnings, and errors
- `'info'` - Show info messages, warnings, and errors
- `'warn'` - Show warnings and errors (default)
- `'error'` - Show only errors
- `'off'` - Disable all logging

At the `'debug'` level, all HTTP requests and responses are logged, including headers and bodies.
Some authentication-related headers are redacted, but sensitive data in request and response bodies
may still be visible.

#### Custom logger

By default, this library logs to `globalThis.console`. You can also provide a custom logger.
Most logging libraries are supported, including [pino](https://www.npmjs.com/package/pino), [winston](https://www.npmjs.com/package/winston), [bunyan](https://www.npmjs.com/package/bunyan), [consola](https://www.npmjs.com/package/consola), [signale](https://www.npmjs.com/package/signale), and [@std/log](https://jsr.io/@std/log). If your logger doesn't work, please open an issue.

When providing a custom logger, the `logLevel` option still controls which messages are emitted, messages
below the configured level will not be sent to your logger.

```ts
import Turbopuffer from '@turbopuffer/turbopuffer';
import pino from 'pino';

const logger = pino();

const client = new Turbopuffer({
  logger: logger.child({ name: 'Turbopuffer' }),
  logLevel: 'debug', // Send all messages to pino, allowing it to filter
});
```

### Making custom/undocumented requests

This library is typed for convenient access to the documented API. If you need to access undocumented
endpoints, params, or response properties, the library can still be used.

#### Undocumented endpoints

To make requests to undocumented endpoints, you can use `client.get`, `client.post`, and other HTTP verbs.
Options on the client, such as retries, will be respected when making these requests.

```ts
await client.post('/some/path', {
  body: { some_prop: 'foo' },
  query: { some_query_arg: 'bar' },
});
```

#### Undocumented request params

To make requests using undocumented parameters, you may use `// @ts-expect-error` on the undocumented
parameter. This library doesn't validate at runtime that the request matches the type, so any extra values you
send will be sent as-is.

```ts
client.namespaces.write({
  // ...
  // @ts-expect-error baz is not yet public
  baz: 'undocumented option',
});
```

For requests with the `GET` verb, any extra params will be in the query, all other requests will send the
extra param in the body.

If you want to explicitly send an extra argument, you can do so with the `query`, `body`, and `headers` request
options.

#### Undocumented response properties

To access undocumented response properties, you may access the response object with `// @ts-expect-error` on
the response object, or cast the response object to the requisite type. Like the request params, we do not
validate or strip extra properties from the response from the API.

### Customizing the fetch client

By default, this library expects a global `fetch` function is defined.

If you want to use a different `fetch` function, you can either polyfill the global:

```ts
import fetch from 'my-fetch';

globalThis.fetch = fetch;
```

Or pass it to the client:

```ts
import Turbopuffer from '@turbopuffer/turbopuffer';
import fetch from 'my-fetch';

const client = new Turbopuffer({ fetch });
```

### Fetch options

If you want to set custom `fetch` options without overriding the `fetch` function, you can provide a `fetchOptions` object when instantiating the client or making a request. (Request-specific options override client options.)

```ts
import Turbopuffer from '@turbopuffer/turbopuffer';

const client = new Turbopuffer({
  fetchOptions: {
    // `RequestInit` options
  },
});
```

#### Configuring proxies

To modify proxy behavior, you can provide custom `fetchOptions` that add runtime-specific proxy
options to requests:

<img src="https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/node.svg" align="top" width="18" height="21"> **Node** <sup>[[docs](https://github.com/nodejs/undici/blob/main/docs/docs/api/ProxyAgent.md#example---proxyagent-with-fetch)]</sup>

```ts
import Turbopuffer from '@turbopuffer/turbopuffer';
import * as undici from 'undici';

const proxyAgent = new undici.ProxyAgent('http://localhost:8888');
const client = new Turbopuffer({
  fetchOptions: {
    dispatcher: proxyAgent,
  },
});
```

<img src="https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/bun.svg" align="top" width="18" height="21"> **Bun** <sup>[[docs](https://bun.sh/guides/http/proxy)]</sup>

```ts
import Turbopuffer from '@turbopuffer/turbopuffer';

const client = new Turbopuffer({
  fetchOptions: {
    proxy: 'http://localhost:8888',
  },
});
```

<img src="https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/deno.svg" align="top" width="18" height="21"> **Deno** <sup>[[docs](https://docs.deno.com/api/deno/~/Deno.createHttpClient)]</sup>

```ts
import Turbopuffer from 'npm:@turbopuffer/turbopuffer';

const httpClient = Deno.createHttpClient({ proxy: { url: 'http://localhost:8888' } });
const client = new Turbopuffer({
  fetchOptions: {
    client: httpClient,
  },
});
```

## Frequently Asked Questions

## Semantic versioning

This package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:

1. Changes that only affect static types, without breaking runtime behavior.
2. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_
3. Changes that we do not expect to impact the vast majority of users in practice.

We take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.

We are keen for your feedback; please open an [issue](https://www.github.com/turbopuffer/turbopuffer-typescript/issues) with questions, bugs, or suggestions.

## Requirements

TypeScript >= 4.9 is supported.

The following runtimes are supported:

- Web browsers (Up-to-date Chrome, Firefox, Safari, Edge, and more)
- Node.js 20 LTS or later ([non-EOL](https://endoflife.date/nodejs)) versions.
- Deno v1.28.0 or higher.
- Bun 1.0 or later.
- Cloudflare Workers.
- Vercel Edge Runtime.
- Jest 28 or greater with the `"node"` environment
- Nitro v2.6 or greater.

Note that React Native is not supported at this time.

If you are interested in other runtime environments, please open or upvote an issue on GitHub.

## Contributing

See [the contributing documentation](./CONTRIBUTING.md).
