# Turbopuffer

Types:

- <code><a href="./src/resources/top-level.ts">NamespaceSummary</a></code>

Methods:

- <code title="get /v1/namespaces">client.<a href="./src/index.ts">listNamespaces</a>({ ...params }) -> NamespaceSummariesListNamespaces</code>

# Shared

Types:

- <code><a href="./src/resources/shared.ts">Filter</a></code>

# Namespaces

Types:

- <code><a href="./src/resources/namespaces.ts">AttributeSchema</a></code>
- <code><a href="./src/resources/namespaces.ts">DistanceMetric</a></code>
- <code><a href="./src/resources/namespaces.ts">DocumentColumns</a></code>
- <code><a href="./src/resources/namespaces.ts">DocumentRow</a></code>
- <code><a href="./src/resources/namespaces.ts">FullTextSearchConfig</a></code>
- <code><a href="./src/resources/namespaces.ts">ID</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceDeleteAllResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceGetSchemaResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceMultiQueryResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceQueryResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceUpdateSchemaResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceWriteResponse</a></code>

Methods:

- <code title="delete /v2/namespaces/{namespace}">client.namespaces.<a href="./src/resources/namespaces.ts">deleteAll</a>({ ...params }) -> NamespaceDeleteAllResponse</code>
- <code title="get /v1/namespaces/{namespace}/schema">client.namespaces.<a href="./src/resources/namespaces.ts">getSchema</a>({ ...params }) -> NamespaceGetSchemaResponse</code>
- <code title="post /v2/namespaces/{namespace}/query?overload=multi">client.namespaces.<a href="./src/resources/namespaces.ts">multiQuery</a>({ ...params }) -> NamespaceMultiQueryResponse</code>
- <code title="post /v2/namespaces/{namespace}/query">client.namespaces.<a href="./src/resources/namespaces.ts">query</a>({ ...params }) -> NamespaceQueryResponse</code>
- <code title="post /v1/namespaces/{namespace}/schema">client.namespaces.<a href="./src/resources/namespaces.ts">updateSchema</a>({ ...params }) -> NamespaceUpdateSchemaResponse</code>
- <code title="post /v2/namespaces/{namespace}">client.namespaces.<a href="./src/resources/namespaces.ts">write</a>({ ...params }) -> NamespaceWriteResponse</code>
