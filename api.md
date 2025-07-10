# Turbopuffer

Types:

- <code><a href="./src/resources/top-level.ts">NamespaceSummary</a></code>

Methods:

- <code title="get /v1/namespaces">client.<a href="./src/index.ts">namespaces</a>({ ...params }) -> NamespaceSummariesNamespacePage</code>

# Namespaces

Types:

- <code><a href="./src/resources/namespaces.ts">AttributeSchema</a></code>
- <code><a href="./src/resources/namespaces.ts">AttributeSchemaConfig</a></code>
- <code><a href="./src/resources/namespaces.ts">AttributeType</a></code>
- <code><a href="./src/resources/namespaces.ts">Columns</a></code>
- <code><a href="./src/resources/namespaces.ts">DistanceMetric</a></code>
- <code><a href="./src/resources/namespaces.ts">FullTextSearch</a></code>
- <code><a href="./src/resources/namespaces.ts">FullTextSearchConfig</a></code>
- <code><a href="./src/resources/namespaces.ts">ID</a></code>
- <code><a href="./src/resources/namespaces.ts">IncludeAttributes</a></code>
- <code><a href="./src/resources/namespaces.ts">Language</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceMetadata</a></code>
- <code><a href="./src/resources/namespaces.ts">Query</a></code>
- <code><a href="./src/resources/namespaces.ts">QueryBilling</a></code>
- <code><a href="./src/resources/namespaces.ts">QueryPerformance</a></code>
- <code><a href="./src/resources/namespaces.ts">Row</a></code>
- <code><a href="./src/resources/namespaces.ts">Tokenizer</a></code>
- <code><a href="./src/resources/namespaces.ts">Vector</a></code>
- <code><a href="./src/resources/namespaces.ts">VectorEncoding</a></code>
- <code><a href="./src/resources/namespaces.ts">WriteBilling</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceDeleteAllResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceHintCacheWarmResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceMultiQueryResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceQueryResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceRecallResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceSchemaResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceUpdateSchemaResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceWriteResponse</a></code>

Methods:

- <code title="delete /v2/namespaces/{namespace}">client.namespaces.<a href="./src/resources/namespaces.ts">deleteAll</a>({ ...params }) -> NamespaceDeleteAllResponse</code>
- <code title="get /v1/namespaces/{namespace}/hint_cache_warm">client.namespaces.<a href="./src/resources/namespaces.ts">hintCacheWarm</a>({ ...params }) -> NamespaceHintCacheWarmResponse</code>
- <code title="get /v1/namespaces/{namespace}/metadata">client.namespaces.<a href="./src/resources/namespaces.ts">metadata</a>({ ...params }) -> NamespaceMetadata</code>
- <code title="post /v2/namespaces/{namespace}/query?stainless_overload=multiQuery">client.namespaces.<a href="./src/resources/namespaces.ts">multiQuery</a>({ ...params }) -> NamespaceMultiQueryResponse</code>
- <code title="post /v2/namespaces/{namespace}/query">client.namespaces.<a href="./src/resources/namespaces.ts">query</a>({ ...params }) -> NamespaceQueryResponse</code>
- <code title="post /v1/namespaces/{namespace}/_debug/recall">client.namespaces.<a href="./src/resources/namespaces.ts">recall</a>({ ...params }) -> NamespaceRecallResponse</code>
- <code title="get /v1/namespaces/{namespace}/schema">client.namespaces.<a href="./src/resources/namespaces.ts">schema</a>({ ...params }) -> NamespaceSchemaResponse</code>
- <code title="post /v1/namespaces/{namespace}/schema">client.namespaces.<a href="./src/resources/namespaces.ts">updateSchema</a>({ ...params }) -> NamespaceUpdateSchemaResponse</code>
- <code title="post /v2/namespaces/{namespace}">client.namespaces.<a href="./src/resources/namespaces.ts">write</a>({ ...params }) -> NamespaceWriteResponse</code>
