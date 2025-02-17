# Namespaces

Types:

- <code><a href="./src/resources/namespaces.ts">DocumentColumns</a></code>
- <code><a href="./src/resources/namespaces.ts">DocumentRow</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceSummary</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceDeleteAllResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceGetSchemaResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceQueryResponse</a></code>
- <code><a href="./src/resources/namespaces.ts">NamespaceUpsertResponse</a></code>

Methods:

- <code title="get /v1/namespaces">client.namespaces.<a href="./src/resources/namespaces.ts">list</a>({ ...params }) -> NamespaceSummariesListNamespaces</code>
- <code title="delete /v1/namespaces/{namespace}">client.namespaces.<a href="./src/resources/namespaces.ts">deleteAll</a>(namespace) -> NamespaceDeleteAllResponse</code>
- <code title="get /v1/namespaces/{namespace}/schema">client.namespaces.<a href="./src/resources/namespaces.ts">getSchema</a>(namespace) -> NamespaceGetSchemaResponse</code>
- <code title="post /v1/namespaces/{namespace}/query">client.namespaces.<a href="./src/resources/namespaces.ts">query</a>(namespace, { ...params }) -> NamespaceQueryResponse</code>
- <code title="post /v1/namespaces/{namespace}">client.namespaces.<a href="./src/resources/namespaces.ts">upsert</a>(namespace, { ...params }) -> NamespaceUpsertResponse</code>
