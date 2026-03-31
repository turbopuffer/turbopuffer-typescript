// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import MiniSearch from 'minisearch';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getLogger } from './logger';

type PerLanguageData = {
  method?: string;
  example?: string;
};

type MethodEntry = {
  name: string;
  endpoint: string;
  httpMethod: string;
  summary: string;
  description: string;
  stainlessPath: string;
  qualified: string;
  params?: string[];
  response?: string;
  markdown?: string;
  perLanguage?: Record<string, PerLanguageData>;
};

type ProseChunk = {
  content: string;
  tag: string;
  sectionContext?: string;
  source?: string;
};

type MiniSearchDocument = {
  id: string;
  kind: 'http_method' | 'prose';
  name?: string;
  endpoint?: string;
  summary?: string;
  description?: string;
  qualified?: string;
  stainlessPath?: string;
  content?: string;
  sectionContext?: string;
  _original: Record<string, unknown>;
};

type SearchResult = {
  results: (string | Record<string, unknown>)[];
};

const EMBEDDED_METHODS: MethodEntry[] = [
  {
    name: 'namespaces',
    endpoint: '/v1/namespaces',
    httpMethod: 'get',
    summary: '',
    description: 'List namespaces.',
    stainlessPath: '(resource) $client > (method) namespaces',
    qualified: 'client.namespaces',
    params: ['cursor?: string;', 'page_size?: number;', 'prefix?: string;'],
    response: '{ id: string; }',
    markdown:
      "## namespaces\n\n`client.namespaces(cursor?: string, page_size?: number, prefix?: string): { id: string; }`\n\n**get** `/v1/namespaces`\n\nList namespaces.\n\n### Parameters\n\n- `cursor?: string`\n  Retrieve the next page of results.\n\n- `page_size?: number`\n  Limit the number of results per page.\n\n- `prefix?: string`\n  Retrieve only the namespaces that match the prefix.\n\n### Returns\n\n- `{ id: string; }`\n  A summary of a namespace.\n\n  - `id: string`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\n// Automatically fetches more pages as needed.\nfor await (const namespaceSummary of client.namespaces()) {\n  console.log(namespaceSummary);\n}\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tpage, err := client.Namespaces(context.TODO(), turbopuffer.NamespacesParams{})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", page)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v1/namespaces \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.ClientNamespacesPage;\nimport com.turbopuffer.models.ClientNamespacesParams;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.fromEnv();\n\n        ClientNamespacesPage page = client.namespaces();\n    }\n}',
      },
      python: {
        method: 'namespaces',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\npage = client.namespaces()\npage = page.namespaces[0]\nprint(page.id)',
      },
      ruby: {
        method: 'namespaces',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\npage = turbopuffer.namespaces\n\nputs(page)',
      },
      typescript: {
        method: 'client.namespaces',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\n// Automatically fetches more pages as needed.\nfor await (const namespaceSummary of client.namespaces()) {\n  console.log(namespaceSummary.id);\n}",
      },
    },
  },
  {
    name: 'write',
    endpoint: '/v2/namespaces/{namespace}',
    httpMethod: 'post',
    summary: '',
    description: 'Create, update, or delete documents.',
    stainlessPath: '(resource) namespaces > (method) write',
    qualified: 'client.namespaces.write',
    params: [
      'namespace: string;',
      'branch_from_namespace?: string | { source_namespace: string; };',
      'copy_from_namespace?: string | { source_namespace: string; source_api_key?: string; source_region?: string; };',
      'delete_by_filter?: object;',
      'delete_by_filter_allow_partial?: boolean;',
      'delete_condition?: object;',
      'deletes?: string | number[];',
      'disable_backpressure?: boolean;',
      "distance_metric?: 'cosine_distance' | 'euclidean_squared';",
      'encryption?: { cmek?: { key_name: string; }; };',
      'patch_by_filter?: { filters: object; patch: object; };',
      'patch_by_filter_allow_partial?: boolean;',
      'patch_columns?: { id: string | number[]; vector?: number[] | string[] | number[] | string; };',
      'patch_condition?: object;',
      'patch_rows?: { id: string | number; vector?: number[] | string; }[];',
      'return_affected_ids?: boolean;',
      'schema?: object;',
      'upsert_columns?: { id: string | number[]; vector?: number[] | string[] | number[] | string; };',
      'upsert_condition?: object;',
      'upsert_rows?: { id: string | number; vector?: number[] | string; }[];',
    ],
    response:
      "{ billing: { billable_logical_bytes_written: number; query?: query_billing; }; message: string; rows_affected: number; status: 'OK'; deleted_ids?: string | number[]; patched_ids?: string | number[]; performance?: { server_total_ms: number; }; rows_deleted?: number; rows_patched?: number; rows_remaining?: boolean; rows_upserted?: number; upserted_ids?: string | number[]; }",
    markdown:
      "## write\n\n`client.namespaces.write(namespace: string, branch_from_namespace?: string | { source_namespace: string; }, copy_from_namespace?: string | { source_namespace: string; source_api_key?: string; source_region?: string; }, delete_by_filter?: object, delete_by_filter_allow_partial?: boolean, delete_condition?: object, deletes?: string | number[], disable_backpressure?: boolean, distance_metric?: 'cosine_distance' | 'euclidean_squared', encryption?: { cmek?: { key_name: string; }; }, patch_by_filter?: { filters: object; patch: object; }, patch_by_filter_allow_partial?: boolean, patch_columns?: { id: id[]; vector?: vector[] | number[] | string; }, patch_condition?: object, patch_rows?: { id: id; vector?: vector; }[], return_affected_ids?: boolean, schema?: object, upsert_columns?: { id: id[]; vector?: vector[] | number[] | string; }, upsert_condition?: object, upsert_rows?: { id: id; vector?: vector; }[]): { billing: write_billing; message: string; rows_affected: number; status: 'OK'; deleted_ids?: id[]; patched_ids?: id[]; performance?: write_performance; rows_deleted?: number; rows_patched?: number; rows_remaining?: boolean; rows_upserted?: number; upserted_ids?: id[]; }`\n\n**post** `/v2/namespaces/{namespace}`\n\nCreate, update, or delete documents.\n\n### Parameters\n\n- `namespace: string`\n\n- `branch_from_namespace?: string | { source_namespace: string; }`\n  The namespace to create an instant, copy-on-write clone of.\n\n- `copy_from_namespace?: string | { source_namespace: string; source_api_key?: string; source_region?: string; }`\n  The namespace to copy documents from.\n\n- `delete_by_filter?: object`\n  The filter specifying which documents to delete.\n\n- `delete_by_filter_allow_partial?: boolean`\n  Allow partial completion when filter matches too many documents.\n\n- `delete_condition?: object`\n  A condition evaluated against the current value of each document targeted by a delete write. Only documents that pass the condition are deleted.\n\n\n- `deletes?: string | number[]`\n\n- `disable_backpressure?: boolean`\n  Disables write throttling (HTTP 429 responses) during high-volume ingestion.\n\n\n- `distance_metric?: 'cosine_distance' | 'euclidean_squared'`\n  A function used to calculate vector similarity.\n\n- `encryption?: { cmek?: { key_name: string; }; }`\n  The encryption configuration for a namespace.\n  - `cmek?: { key_name: string; }`\n\n- `patch_by_filter?: { filters: object; patch: object; }`\n  The patch and filter specifying which documents to patch.\n  - `filters: object`\n    Filter by attributes. Same syntax as the query endpoint.\n  - `patch: object`\n\n- `patch_by_filter_allow_partial?: boolean`\n  Allow partial completion when filter matches too many documents.\n\n- `patch_columns?: { id: string | number[]; vector?: number[] | string[] | number[] | string; }`\n  A list of documents in columnar format. Each key is a column name, mapped to an array of values for that column.\n\n  - `id: string | number[]`\n    The IDs of the documents.\n  - `vector?: number[] | string[] | number[] | string`\n    The vector embeddings of the documents.\n\n- `patch_condition?: object`\n  A condition evaluated against the current value of each document targeted by a patch write. Only documents that pass the condition are patched.\n\n\n- `patch_rows?: { id: string | number; vector?: number[] | string; }[]`\n\n- `return_affected_ids?: boolean`\n  If true, return the IDs of affected rows (deleted, patched, upserted) in the response. For filtered and conditional writes, only IDs for writes that succeeded will be included.\n\n\n- `schema?: object`\n  The schema of the attributes attached to the documents.\n\n\n- `upsert_columns?: { id: string | number[]; vector?: number[] | string[] | number[] | string; }`\n  A list of documents in columnar format. Each key is a column name, mapped to an array of values for that column.\n\n  - `id: string | number[]`\n    The IDs of the documents.\n  - `vector?: number[] | string[] | number[] | string`\n    The vector embeddings of the documents.\n\n- `upsert_condition?: object`\n  A condition evaluated against the current value of each document targeted by an upsert write. Only documents that pass the condition are upserted.\n\n\n- `upsert_rows?: { id: string | number; vector?: number[] | string; }[]`\n\n### Returns\n\n- `{ billing: { billable_logical_bytes_written: number; query?: query_billing; }; message: string; rows_affected: number; status: 'OK'; deleted_ids?: string | number[]; patched_ids?: string | number[]; performance?: { server_total_ms: number; }; rows_deleted?: number; rows_patched?: number; rows_remaining?: boolean; rows_upserted?: number; upserted_ids?: string | number[]; }`\n  The response to a successful write request.\n\n  - `billing: { billable_logical_bytes_written: number; query?: { billable_logical_bytes_queried: number; billable_logical_bytes_returned: number; }; }`\n  - `message: string`\n  - `rows_affected: number`\n  - `status: 'OK'`\n  - `deleted_ids?: string | number[]`\n  - `patched_ids?: string | number[]`\n  - `performance?: { server_total_ms: number; }`\n  - `rows_deleted?: number`\n  - `rows_patched?: number`\n  - `rows_remaining?: boolean`\n  - `rows_upserted?: number`\n  - `upserted_ids?: string | number[]`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.write({ namespace: 'namespace' });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.Write',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.Write(context.TODO(), turbopuffer.NamespaceWriteParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.DeletedIDs)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v2/namespaces/$NAMESPACE \\\n    -X POST \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY" \\\n    --retry 6',
      },
      java: {
        method: 'namespaces().write',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceWriteParams;\nimport com.turbopuffer.models.namespaces.NamespaceWriteResponse;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceWriteResponse response = client.namespaces().write();\n    }\n}',
      },
      python: {
        method: 'namespaces.write',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.write(\n    namespace="namespace",\n)\nprint(response.deleted_ids)',
      },
      ruby: {
        method: 'namespaces.write',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.write(namespace: "namespace")\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.write',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.write({ namespace: 'namespace' });\n\nconsole.log(response.deleted_ids);",
      },
    },
  },
  {
    name: 'query',
    endpoint: '/v2/namespaces/{namespace}/query',
    httpMethod: 'post',
    summary: '',
    description: 'Query, filter, full-text search and vector search documents.',
    stainlessPath: '(resource) namespaces > (method) query',
    qualified: 'client.namespaces.query',
    params: [
      'namespace: string;',
      'aggregate_by?: object;',
      "consistency?: { level?: 'strong' | 'eventual'; };",
      "distance_metric?: 'cosine_distance' | 'euclidean_squared';",
      'exclude_attributes?: string[];',
      'filters?: object;',
      'group_by?: string[];',
      'include_attributes?: boolean | string[];',
      'limit?: number | { total: number; per?: { attributes: string[]; limit: number; }; };',
      'rank_by?: object;',
      'top_k?: number;',
      "vector_encoding?: 'float' | 'base64';",
    ],
    response:
      '{ billing: { billable_logical_bytes_queried: number; billable_logical_bytes_returned: number; }; performance: { approx_namespace_size: number; cache_hit_ratio: number; cache_temperature: string; exhaustive_search_count: number; query_execution_ms: number; server_total_ms: number; }; aggregation_groups?: object[]; aggregations?: object; rows?: { id: id; vector?: vector; }[]; }',
    markdown:
      "## query\n\n`client.namespaces.query(namespace: string, aggregate_by?: object, consistency?: { level?: 'strong' | 'eventual'; }, distance_metric?: 'cosine_distance' | 'euclidean_squared', exclude_attributes?: string[], filters?: object, group_by?: string[], include_attributes?: boolean | string[], limit?: number | { total: number; per?: object; }, rank_by?: object, top_k?: number, vector_encoding?: 'float' | 'base64'): { billing: query_billing; performance: query_performance; aggregation_groups?: aggregation_group[]; aggregations?: object; rows?: row[]; }`\n\n**post** `/v2/namespaces/{namespace}/query`\n\nQuery, filter, full-text search and vector search documents.\n\n### Parameters\n\n- `namespace: string`\n\n- `aggregate_by?: object`\n  Aggregations to compute over all documents in the namespace that match the filters.\n\n\n- `consistency?: { level?: 'strong' | 'eventual'; }`\n  The consistency level for a query.\n  - `level?: 'strong' | 'eventual'`\n    The query's consistency level.\n\n- `strong` - Strong consistency. Requires a round-trip to object storage to fetch the latest writes.\n- `eventual` - Eventual consistency. Does not require a round-trip to object storage, but may not see the latest writes.\n\n- `distance_metric?: 'cosine_distance' | 'euclidean_squared'`\n  A function used to calculate vector similarity.\n\n- `exclude_attributes?: string[]`\n  List of attribute names to exclude from the response. All other attributes will be included in the response.\n\n\n- `filters?: object`\n  Exact filters for attributes to refine search results for. Think of it as a SQL WHERE clause.\n\n\n- `group_by?: string[]`\n  Groups documents by the specified attributes (the \"group key\") before computing aggregates. Aggregates are computed separately for each group.\n\n\n- `include_attributes?: boolean | string[]`\n  Whether to include attributes in the response.\n\n- `limit?: number | { total: number; per?: { attributes: string[]; limit: number; }; }`\n  Limits the documents returned by a query.\n\n- `rank_by?: object`\n  How to rank the documents in the namespace.\n\n\n- `top_k?: number`\n  The number of results to return.\n\n- `vector_encoding?: 'float' | 'base64'`\n  The encoding to use for vectors in the response.\n\n### Returns\n\n- `{ billing: { billable_logical_bytes_queried: number; billable_logical_bytes_returned: number; }; performance: { approx_namespace_size: number; cache_hit_ratio: number; cache_temperature: string; exhaustive_search_count: number; query_execution_ms: number; server_total_ms: number; }; aggregation_groups?: object[]; aggregations?: object; rows?: { id: id; vector?: vector; }[]; }`\n  The result of a query.\n\n  - `billing: { billable_logical_bytes_queried: number; billable_logical_bytes_returned: number; }`\n  - `performance: { approx_namespace_size: number; cache_hit_ratio: number; cache_temperature: string; exhaustive_search_count: number; query_execution_ms: number; server_total_ms: number; }`\n  - `aggregation_groups?: object[]`\n  - `aggregations?: object`\n  - `rows?: { id: string | number; vector?: number[] | string; }[]`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.query({ namespace: 'namespace' });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.Query',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.Query(context.TODO(), turbopuffer.NamespaceQueryParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.Billing)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v2/namespaces/$NAMESPACE/query \\\n    -X POST \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().query',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceQueryParams;\nimport com.turbopuffer.models.namespaces.NamespaceQueryResponse;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceQueryResponse response = client.namespaces().query();\n    }\n}',
      },
      python: {
        method: 'namespaces.query',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.query(\n    namespace="namespace",\n)\nprint(response.billing)',
      },
      ruby: {
        method: 'namespaces.query',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.query(namespace: "namespace")\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.query',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.query({ namespace: 'namespace' });\n\nconsole.log(response.billing);",
      },
    },
  },
  {
    name: 'multi_query',
    endpoint: '/v2/namespaces/{namespace}/query?stainless_overload=multiQuery',
    httpMethod: 'post',
    summary: '',
    description: 'Issue multiple concurrent queries filter or search documents.',
    stainlessPath: '(resource) namespaces > (method) multi_query',
    qualified: 'client.namespaces.multiQuery',
    params: [
      'namespace: string;',
      "queries: { aggregate_by?: object; distance_metric?: 'cosine_distance' | 'euclidean_squared'; exclude_attributes?: string[]; filters?: object; group_by?: string[]; include_attributes?: boolean | string[]; limit?: number | { total: number; per?: object; }; rank_by?: object; top_k?: number; }[];",
      "consistency?: { level?: 'strong' | 'eventual'; };",
      "vector_encoding?: 'float' | 'base64';",
    ],
    response:
      '{ billing: { billable_logical_bytes_queried: number; billable_logical_bytes_returned: number; }; performance: { approx_namespace_size: number; cache_hit_ratio: number; cache_temperature: string; exhaustive_search_count: number; query_execution_ms: number; server_total_ms: number; }; results: { aggregation_groups?: object[]; aggregations?: object; rows?: object[]; }[]; }',
    markdown:
      "## multi_query\n\n`client.namespaces.multiQuery(namespace: string, queries: { aggregate_by?: object; distance_metric?: distance_metric; exclude_attributes?: string[]; filters?: object; group_by?: string[]; include_attributes?: include_attributes; limit?: number | limit; rank_by?: object; top_k?: number; }[], consistency?: { level?: 'strong' | 'eventual'; }, vector_encoding?: 'float' | 'base64'): { billing: query_billing; performance: query_performance; results: object[]; }`\n\n**post** `/v2/namespaces/{namespace}/query?stainless_overload=multiQuery`\n\nIssue multiple concurrent queries filter or search documents.\n\n### Parameters\n\n- `namespace: string`\n\n- `queries: { aggregate_by?: object; distance_metric?: 'cosine_distance' | 'euclidean_squared'; exclude_attributes?: string[]; filters?: object; group_by?: string[]; include_attributes?: boolean | string[]; limit?: number | { total: number; per?: object; }; rank_by?: object; top_k?: number; }[]`\n\n- `consistency?: { level?: 'strong' | 'eventual'; }`\n  The consistency level for a query.\n  - `level?: 'strong' | 'eventual'`\n    The query's consistency level.\n\n- `strong` - Strong consistency. Requires a round-trip to object storage to fetch the latest writes.\n- `eventual` - Eventual consistency. Does not require a round-trip to object storage, but may not see the latest writes.\n\n- `vector_encoding?: 'float' | 'base64'`\n  The encoding to use for vectors in the response.\n\n### Returns\n\n- `{ billing: { billable_logical_bytes_queried: number; billable_logical_bytes_returned: number; }; performance: { approx_namespace_size: number; cache_hit_ratio: number; cache_temperature: string; exhaustive_search_count: number; query_execution_ms: number; server_total_ms: number; }; results: { aggregation_groups?: object[]; aggregations?: object; rows?: object[]; }[]; }`\n  The result of a multi-query.\n\n  - `billing: { billable_logical_bytes_queried: number; billable_logical_bytes_returned: number; }`\n  - `performance: { approx_namespace_size: number; cache_hit_ratio: number; cache_temperature: string; exhaustive_search_count: number; query_execution_ms: number; server_total_ms: number; }`\n  - `results: { aggregation_groups?: object[]; aggregations?: object; rows?: { id: string | number; vector?: number[] | string; }[]; }[]`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.multiQuery({ namespace: 'namespace', queries: [{}] });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.MultiQuery',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.MultiQuery(context.TODO(), turbopuffer.NamespaceMultiQueryParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t\tQueries:   []turbopuffer.QueryParam{{}},\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.Billing)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v2/namespaces/$NAMESPACE/query \\\n    -H \'Content-Type: application/json\' \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY" \\\n    -d \'{\n          "queries": [\n            {}\n          ]\n        }\'',
      },
      java: {
        method: 'namespaces().multiQuery',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceMultiQueryParams;\nimport com.turbopuffer.models.namespaces.NamespaceMultiQueryResponse;\nimport com.turbopuffer.models.namespaces.Query;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceMultiQueryParams params = NamespaceMultiQueryParams.builder()\n            .addQuery(Query.builder().build())\n            .build();\n        NamespaceMultiQueryResponse response = client.namespaces().multiQuery(params);\n    }\n}',
      },
      python: {
        method: 'namespaces.multi_query',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.multi_query(\n    namespace="namespace",\n    queries=[{}],\n)\nprint(response.billing)',
      },
      ruby: {
        method: 'namespaces.multi_query',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.multi_query(namespace: "namespace", queries: [{}])\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.multiQuery',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.multiQuery({ namespace: 'namespace', queries: [{}] });\n\nconsole.log(response.billing);",
      },
    },
  },
  {
    name: 'explain_query',
    endpoint: '/v2/namespaces/{namespace}/explain_query',
    httpMethod: 'post',
    summary: '',
    description: 'Explain a query plan.',
    stainlessPath: '(resource) namespaces > (method) explain_query',
    qualified: 'client.namespaces.explainQuery',
    params: [
      'namespace: string;',
      'aggregate_by?: object;',
      "consistency?: { level?: 'strong' | 'eventual'; };",
      "distance_metric?: 'cosine_distance' | 'euclidean_squared';",
      'exclude_attributes?: string[];',
      'filters?: object;',
      'group_by?: string[];',
      'include_attributes?: boolean | string[];',
      'limit?: number | { total: number; per?: { attributes: string[]; limit: number; }; };',
      'rank_by?: object;',
      'top_k?: number;',
      "vector_encoding?: 'float' | 'base64';",
    ],
    response: '{ plan_text?: string; }',
    markdown:
      "## explain_query\n\n`client.namespaces.explainQuery(namespace: string, aggregate_by?: object, consistency?: { level?: 'strong' | 'eventual'; }, distance_metric?: 'cosine_distance' | 'euclidean_squared', exclude_attributes?: string[], filters?: object, group_by?: string[], include_attributes?: boolean | string[], limit?: number | { total: number; per?: object; }, rank_by?: object, top_k?: number, vector_encoding?: 'float' | 'base64'): { plan_text?: string; }`\n\n**post** `/v2/namespaces/{namespace}/explain_query`\n\nExplain a query plan.\n\n### Parameters\n\n- `namespace: string`\n\n- `aggregate_by?: object`\n  Aggregations to compute over all documents in the namespace that match the filters.\n\n\n- `consistency?: { level?: 'strong' | 'eventual'; }`\n  The consistency level for a query.\n  - `level?: 'strong' | 'eventual'`\n    The query's consistency level.\n\n- `strong` - Strong consistency. Requires a round-trip to object storage to fetch the latest writes.\n- `eventual` - Eventual consistency. Does not require a round-trip to object storage, but may not see the latest writes.\n\n- `distance_metric?: 'cosine_distance' | 'euclidean_squared'`\n  A function used to calculate vector similarity.\n\n- `exclude_attributes?: string[]`\n  List of attribute names to exclude from the response. All other attributes will be included in the response.\n\n\n- `filters?: object`\n  Exact filters for attributes to refine search results for. Think of it as a SQL WHERE clause.\n\n\n- `group_by?: string[]`\n  Groups documents by the specified attributes (the \"group key\") before computing aggregates. Aggregates are computed separately for each group.\n\n\n- `include_attributes?: boolean | string[]`\n  Whether to include attributes in the response.\n\n- `limit?: number | { total: number; per?: { attributes: string[]; limit: number; }; }`\n  Limits the documents returned by a query.\n\n- `rank_by?: object`\n  How to rank the documents in the namespace.\n\n\n- `top_k?: number`\n  The number of results to return.\n\n- `vector_encoding?: 'float' | 'base64'`\n  The encoding to use for vectors in the response.\n\n### Returns\n\n- `{ plan_text?: string; }`\n  The response to a successful query explain.\n\n  - `plan_text?: string`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.explainQuery({ namespace: 'namespace' });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.ExplainQuery',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.ExplainQuery(context.TODO(), turbopuffer.NamespaceExplainQueryParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.PlanText)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v2/namespaces/$NAMESPACE/explain_query \\\n    -X POST \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().explainQuery',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceExplainQueryParams;\nimport com.turbopuffer.models.namespaces.NamespaceExplainQueryResponse;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceExplainQueryResponse response = client.namespaces().explainQuery();\n    }\n}',
      },
      python: {
        method: 'namespaces.explain_query',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.explain_query(\n    namespace="namespace",\n)\nprint(response.plan_text)',
      },
      ruby: {
        method: 'namespaces.explain_query',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.explain_query(namespace: "namespace")\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.explainQuery',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.explainQuery({ namespace: 'namespace' });\n\nconsole.log(response.plan_text);",
      },
    },
  },
  {
    name: 'schema',
    endpoint: '/v1/namespaces/{namespace}/schema',
    httpMethod: 'get',
    summary: '',
    description: 'Get namespace schema.',
    stainlessPath: '(resource) namespaces > (method) schema',
    qualified: 'client.namespaces.schema',
    params: ['namespace: string;'],
    response: 'object',
    markdown:
      "## schema\n\n`client.namespaces.schema(namespace: string): object`\n\n**get** `/v1/namespaces/{namespace}/schema`\n\nGet namespace schema.\n\n### Parameters\n\n- `namespace: string`\n\n### Returns\n\n- `object`\n  The response to a successful namespace schema request.\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.schema({ namespace: 'namespace' });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.Schema',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.Schema(context.TODO(), turbopuffer.NamespaceSchemaParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v1/namespaces/$NAMESPACE/schema \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().schema',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceSchemaParams;\nimport com.turbopuffer.models.namespaces.NamespaceSchemaResponse;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceSchemaResponse response = client.namespaces().schema();\n    }\n}',
      },
      python: {
        method: 'namespaces.schema',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.schema(\n    namespace="namespace",\n)\nprint(response)',
      },
      ruby: {
        method: 'namespaces.schema',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.schema(namespace: "namespace")\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.schema',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.schema({ namespace: 'namespace' });\n\nconsole.log(response);",
      },
    },
  },
  {
    name: 'update_schema',
    endpoint: '/v1/namespaces/{namespace}/schema',
    httpMethod: 'post',
    summary: '',
    description: 'Update namespace schema.',
    stainlessPath: '(resource) namespaces > (method) update_schema',
    qualified: 'client.namespaces.updateSchema',
    params: ['namespace: string;', 'schema?: object;'],
    response: 'object',
    markdown:
      "## update_schema\n\n`client.namespaces.updateSchema(namespace: string, schema?: object): object`\n\n**post** `/v1/namespaces/{namespace}/schema`\n\nUpdate namespace schema.\n\n### Parameters\n\n- `namespace: string`\n\n- `schema?: object`\n  The desired schema for the namespace.\n\n### Returns\n\n- `object`\n  The updated schema for the namespace.\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.updateSchema({ namespace: 'namespace' });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.UpdateSchema',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.UpdateSchema(context.TODO(), turbopuffer.NamespaceUpdateSchemaParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v1/namespaces/$NAMESPACE/schema \\\n    -X POST \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().updateSchema',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceUpdateSchemaParams;\nimport com.turbopuffer.models.namespaces.NamespaceUpdateSchemaResponse;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceUpdateSchemaResponse response = client.namespaces().updateSchema();\n    }\n}',
      },
      python: {
        method: 'namespaces.update_schema',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.update_schema(\n    namespace="namespace",\n)\nprint(response)',
      },
      ruby: {
        method: 'namespaces.update_schema',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.update_schema(namespace: "namespace")\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.updateSchema',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.updateSchema({ namespace: 'namespace' });\n\nconsole.log(response);",
      },
    },
  },
  {
    name: 'metadata',
    endpoint: '/v1/namespaces/{namespace}/metadata',
    httpMethod: 'get',
    summary: '',
    description: 'Get metadata about a namespace.',
    stainlessPath: '(resource) namespaces > (method) metadata',
    qualified: 'client.namespaces.metadata',
    params: ['namespace: string;'],
    response:
      "{ approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: { sse: boolean; } | { cmek: { key_name: string; }; }; index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }; schema: object; updated_at: string; pinning?: { replicas?: number; }; }",
    markdown:
      "## metadata\n\n`client.namespaces.metadata(namespace: string): { approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: object | object; index: object | object; schema: object; updated_at: string; pinning?: pinning_config; }`\n\n**get** `/v1/namespaces/{namespace}/metadata`\n\nGet metadata about a namespace.\n\n### Parameters\n\n- `namespace: string`\n\n### Returns\n\n- `{ approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: { sse: boolean; } | { cmek: { key_name: string; }; }; index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }; schema: object; updated_at: string; pinning?: { replicas?: number; }; }`\n  Metadata about a namespace.\n\n  - `approx_logical_bytes: number`\n  - `approx_row_count: number`\n  - `created_at: string`\n  - `encryption: { sse: boolean; } | { cmek: { key_name: string; }; }`\n  - `index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }`\n  - `schema: object`\n  - `updated_at: string`\n  - `pinning?: { replicas?: number; }`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst namespaceMetadata = await client.namespaces.metadata({ namespace: 'namespace' });\n\nconsole.log(namespaceMetadata);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.Metadata',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tnamespaceMetadata, err := client.Namespaces.Metadata(context.TODO(), turbopuffer.NamespaceMetadataParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", namespaceMetadata.ApproxLogicalBytes)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v1/namespaces/$NAMESPACE/metadata \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().metadata',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceMetadata;\nimport com.turbopuffer.models.namespaces.NamespaceMetadataParams;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceMetadata namespaceMetadata = client.namespaces().metadata();\n    }\n}',
      },
      python: {
        method: 'namespaces.metadata',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nnamespace_metadata = client.namespaces.metadata(\n    namespace="namespace",\n)\nprint(namespace_metadata.approx_logical_bytes)',
      },
      ruby: {
        method: 'namespaces.metadata',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nnamespace_metadata = turbopuffer.namespaces.metadata(namespace: "namespace")\n\nputs(namespace_metadata)',
      },
      typescript: {
        method: 'client.namespaces.metadata',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst namespaceMetadata = await client.namespaces.metadata({ namespace: 'namespace' });\n\nconsole.log(namespaceMetadata.approx_logical_bytes);",
      },
    },
  },
  {
    name: 'update_metadata',
    endpoint: '/v1/namespaces/{namespace}/metadata',
    httpMethod: 'patch',
    summary: '',
    description: 'Update metadata configuration for a namespace.',
    stainlessPath: '(resource) namespaces > (method) update_metadata',
    qualified: 'client.namespaces.updateMetadata',
    params: ['namespace: string;', 'pinning?: boolean | { replicas?: number; };'],
    response:
      "{ approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: { sse: boolean; } | { cmek: { key_name: string; }; }; index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }; schema: object; updated_at: string; pinning?: { replicas?: number; }; }",
    markdown:
      "## update_metadata\n\n`client.namespaces.updateMetadata(namespace: string, pinning?: boolean | { replicas?: number; }): { approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: object | object; index: object | object; schema: object; updated_at: string; pinning?: pinning_config; }`\n\n**patch** `/v1/namespaces/{namespace}/metadata`\n\nUpdate metadata configuration for a namespace.\n\n### Parameters\n\n- `namespace: string`\n\n- `pinning?: boolean | { replicas?: number; }`\n  Configuration for namespace pinning.\n- Missing field: no change to pinning configuration\n- `null` or `false`: explicitly remove pinning\n- `true`: enable pinning with default configuration\n- Object: set pinning configuration\n\n\n### Returns\n\n- `{ approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: { sse: boolean; } | { cmek: { key_name: string; }; }; index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }; schema: object; updated_at: string; pinning?: { replicas?: number; }; }`\n  Metadata about a namespace.\n\n  - `approx_logical_bytes: number`\n  - `approx_row_count: number`\n  - `created_at: string`\n  - `encryption: { sse: boolean; } | { cmek: { key_name: string; }; }`\n  - `index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }`\n  - `schema: object`\n  - `updated_at: string`\n  - `pinning?: { replicas?: number; }`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst namespaceMetadata = await client.namespaces.updateMetadata({ namespace: 'namespace' });\n\nconsole.log(namespaceMetadata);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.UpdateMetadata',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tnamespaceMetadata, err := client.Namespaces.UpdateMetadata(context.TODO(), turbopuffer.NamespaceUpdateMetadataParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", namespaceMetadata.ApproxLogicalBytes)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v1/namespaces/$NAMESPACE/metadata \\\n    -X PATCH \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().updateMetadata',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceMetadata;\nimport com.turbopuffer.models.namespaces.NamespaceUpdateMetadataParams;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceMetadata namespaceMetadata = client.namespaces().updateMetadata();\n    }\n}',
      },
      python: {
        method: 'namespaces.update_metadata',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nnamespace_metadata = client.namespaces.update_metadata(\n    namespace="namespace",\n)\nprint(namespace_metadata.approx_logical_bytes)',
      },
      ruby: {
        method: 'namespaces.update_metadata',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nnamespace_metadata = turbopuffer.namespaces.update_metadata(namespace: "namespace")\n\nputs(namespace_metadata)',
      },
      typescript: {
        method: 'client.namespaces.updateMetadata',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst namespaceMetadata = await client.namespaces.updateMetadata({ namespace: 'namespace' });\n\nconsole.log(namespaceMetadata.approx_logical_bytes);",
      },
    },
  },
  {
    name: 'hint_cache_warm',
    endpoint: '/v1/namespaces/{namespace}/hint_cache_warm',
    httpMethod: 'get',
    summary: '',
    description: 'Signal turbopuffer to prepare for low-latency requests.',
    stainlessPath: '(resource) namespaces > (method) hint_cache_warm',
    qualified: 'client.namespaces.hintCacheWarm',
    params: ['namespace: string;'],
    response: "{ status: 'ACCEPTED'; message?: string; }",
    markdown:
      "## hint_cache_warm\n\n`client.namespaces.hintCacheWarm(namespace: string): { status: 'ACCEPTED'; message?: string; }`\n\n**get** `/v1/namespaces/{namespace}/hint_cache_warm`\n\nSignal turbopuffer to prepare for low-latency requests.\n\n### Parameters\n\n- `namespace: string`\n\n### Returns\n\n- `{ status: 'ACCEPTED'; message?: string; }`\n  The response to a successful cache warm request.\n\n  - `status: 'ACCEPTED'`\n  - `message?: string`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.hintCacheWarm({ namespace: 'namespace' });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.HintCacheWarm',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.HintCacheWarm(context.TODO(), turbopuffer.NamespaceHintCacheWarmParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.Status)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v1/namespaces/$NAMESPACE/hint_cache_warm \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().hintCacheWarm',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceHintCacheWarmParams;\nimport com.turbopuffer.models.namespaces.NamespaceHintCacheWarmResponse;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceHintCacheWarmResponse response = client.namespaces().hintCacheWarm();\n    }\n}',
      },
      python: {
        method: 'namespaces.hint_cache_warm',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.hint_cache_warm(\n    namespace="namespace",\n)\nprint(response.status)',
      },
      ruby: {
        method: 'namespaces.hint_cache_warm',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.hint_cache_warm(namespace: "namespace")\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.hintCacheWarm',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.hintCacheWarm({ namespace: 'namespace' });\n\nconsole.log(response.status);",
      },
    },
  },
  {
    name: 'delete_all',
    endpoint: '/v2/namespaces/{namespace}',
    httpMethod: 'delete',
    summary: '',
    description: 'Delete namespace.',
    stainlessPath: '(resource) namespaces > (method) delete_all',
    qualified: 'client.namespaces.deleteAll',
    params: ['namespace: string;'],
    response: "{ status: 'OK'; }",
    markdown:
      "## delete_all\n\n`client.namespaces.deleteAll(namespace: string): { status: 'OK'; }`\n\n**delete** `/v2/namespaces/{namespace}`\n\nDelete namespace.\n\n### Parameters\n\n- `namespace: string`\n\n### Returns\n\n- `{ status: 'OK'; }`\n  The response to a successful namespace deletion request.\n\n  - `status: 'OK'`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.deleteAll({ namespace: 'namespace' });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.DeleteAll',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.DeleteAll(context.TODO(), turbopuffer.NamespaceDeleteAllParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.Status)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v2/namespaces/$NAMESPACE \\\n    -X DELETE \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().deleteAll',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceDeleteAllParams;\nimport com.turbopuffer.models.namespaces.NamespaceDeleteAllResponse;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceDeleteAllResponse response = client.namespaces().deleteAll();\n    }\n}',
      },
      python: {
        method: 'namespaces.delete_all',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.delete_all(\n    namespace="namespace",\n)\nprint(response.status)',
      },
      ruby: {
        method: 'namespaces.delete_all',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.delete_all(namespace: "namespace")\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.deleteAll',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.deleteAll({ namespace: 'namespace' });\n\nconsole.log(response.status);",
      },
    },
  },
  {
    name: 'recall',
    endpoint: '/v1/namespaces/{namespace}/_debug/recall',
    httpMethod: 'post',
    summary: '',
    description: 'Evaluate recall.',
    stainlessPath: '(resource) namespaces > (method) recall',
    qualified: 'client.namespaces.recall',
    params: [
      'namespace: string;',
      'filters?: object;',
      'include_ground_truth?: boolean;',
      'num?: number;',
      'top_k?: number;',
    ],
    response:
      '{ avg_ann_count: number; avg_exhaustive_count: number; avg_recall: number; ground_truth?: { nearest_neighbors: object[]; query_vector: number[]; }[]; }',
    markdown:
      "## recall\n\n`client.namespaces.recall(namespace: string, filters?: object, include_ground_truth?: boolean, num?: number, top_k?: number): { avg_ann_count: number; avg_exhaustive_count: number; avg_recall: number; ground_truth?: object[]; }`\n\n**post** `/v1/namespaces/{namespace}/_debug/recall`\n\nEvaluate recall.\n\n### Parameters\n\n- `namespace: string`\n\n- `filters?: object`\n  Filter by attributes. Same syntax as the query endpoint.\n\n- `include_ground_truth?: boolean`\n  Include ground truth data (query vectors and true nearest neighbors) in the response.\n\n- `num?: number`\n  The number of searches to run.\n\n- `top_k?: number`\n  Search for `top_k` nearest neighbors.\n\n### Returns\n\n- `{ avg_ann_count: number; avg_exhaustive_count: number; avg_recall: number; ground_truth?: { nearest_neighbors: object[]; query_vector: number[]; }[]; }`\n  The response to a successful cache warm request.\n\n  - `avg_ann_count: number`\n  - `avg_exhaustive_count: number`\n  - `avg_recall: number`\n  - `ground_truth?: { nearest_neighbors: { id: string | number; vector?: number[] | string; }[]; query_vector: number[]; }[]`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces.recall({ namespace: 'namespace' });\n\nconsole.log(response);\n```",
    perLanguage: {
      go: {
        method: 'client.Namespaces.Recall',
        example:
          'package main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."),\n\t)\n\tresponse, err := client.Namespaces.Recall(context.TODO(), turbopuffer.NamespaceRecallParams{\n\t\tNamespace: turbopuffer.String("namespace"),\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.AvgAnnCount)\n}\n',
      },
      http: {
        example:
          'curl https://$TURBOPUFFER_REGION.turbopuffer.com/v1/namespaces/$NAMESPACE/_debug/recall \\\n    -X POST \\\n    -H "Authorization: Bearer $TURBOPUFFER_API_KEY"',
      },
      java: {
        method: 'namespaces().recall',
        example:
          'package com.turbopuffer.example;\n\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.NamespaceRecallParams;\nimport com.turbopuffer.models.namespaces.NamespaceRecallResponse;\n\npublic final class Main {\n    private Main() {}\n\n    public static void main(String[] args) {\n        TurbopufferClient client = TurbopufferOkHttpClient.builder()\n            .fromEnv()\n            .defaultNamespace("My Default Namespace")\n            .build();\n\n        NamespaceRecallResponse response = client.namespaces().recall();\n    }\n}',
      },
      python: {
        method: 'namespaces.recall',
        example:
          'import os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\nresponse = client.namespaces.recall(\n    namespace="namespace",\n)\nprint(response.avg_ann_count)',
      },
      ruby: {
        method: 'namespaces.recall',
        example:
          'require "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(api_key: "tpuf_A1...")\n\nresponse = turbopuffer.namespaces.recall(namespace: "namespace")\n\nputs(response)',
      },
      typescript: {
        method: 'client.namespaces.recall',
        example:
          "import Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.recall({ namespace: 'namespace' });\n\nconsole.log(response.avg_ann_count);",
      },
    },
  },
];

const EMBEDDED_READMES: { language: string; content: string }[] = [
  {
    language: 'python',
    content:
      '# Turbopuffer Python API library\n\n<!-- prettier-ignore -->\n[![PyPI version](https://img.shields.io/pypi/v/turbopuffer.svg?label=pypi%20(stable))](https://pypi.org/project/turbopuffer/)\n\nThe Turbopuffer Python library provides convenient access to the Turbopuffer REST API from any Python 3.9+\napplication. The library includes type definitions for all request params and response fields,\nand offers both synchronous and asynchronous clients powered by [httpx](https://github.com/encode/httpx).\n\n\n\nIt is generated with [Stainless](https://www.stainless.com/).\n\n## MCP Server\n\nUse the Turbopuffer MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.\n\n[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=%40turbopuffer%2Fturbopuffer-mcp&config=eyJuYW1lIjoiQHR1cmJvcHVmZmVyL3R1cmJvcHVmZmVyLW1jcCIsInRyYW5zcG9ydCI6Imh0dHAiLCJ1cmwiOiJodHRwczovL3R1cmJvcHVmZmVyLnN0bG1jcC5jb20iLCJoZWFkZXJzIjp7IngtdHVyYm9wdWZmZXItYXBpLWtleSI6InRwdWZfQTEuLi4ifX0)\n[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22%40turbopuffer%2Fturbopuffer-mcp%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fturbopuffer.stlmcp.com%22%2C%22headers%22%3A%7B%22x-turbopuffer-api-key%22%3A%22tpuf_A1...%22%7D%7D)\n\n> Note: You may need to set environment variables in your MCP client.\n\n## Documentation\n\nThe REST API documentation can be found on [turbopuffer.com](https://turbopuffer.com/docs/auth). The full API of this library can be found in [api.md](api.md).\n\n## Installation\n\n```sh\n# install from PyPI\npip install turbopuffer\n```\n\n## Usage\n\nThe full API of this library can be found in [api.md](api.md).\n\n```python\nimport os\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\n\nresponse = client.namespaces.write(\n    namespace="products",\n    distance_metric="cosine_distance",\n    upsert_rows=[{\n        "id": "2108ed60-6851-49a0-9016-8325434f3845",\n        "vector": [0.1, 0.2],\n    }],\n)\nprint(response.rows_affected)\n```\n\nWhile you can provide an `api_key` keyword argument,\nwe recommend using [python-dotenv](https://pypi.org/project/python-dotenv/)\nto add `TURBOPUFFER_API_KEY="tpuf_A1..."` to your `.env` file\nso that your API Key is not stored in source control.\n\n## Async usage\n\nSimply import `AsyncTurbopuffer` instead of `Turbopuffer` and use `await` with each API call:\n\n```python\nimport os\nimport asyncio\nfrom turbopuffer import AsyncTurbopuffer\n\nclient = AsyncTurbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n)\n\nasync def main() -> None:\n  response = await client.namespaces.write(\n      namespace="products",\n      distance_metric="cosine_distance",\n      upsert_rows=[{\n          "id": "2108ed60-6851-49a0-9016-8325434f3845",\n          "vector": [0.1, 0.2],\n      }],\n  )\n  print(response.rows_affected)\n\nasyncio.run(main())\n```\n\nFunctionality between the synchronous and asynchronous clients is otherwise identical.\n\n### With aiohttp\n\nBy default, the async client uses `httpx` for HTTP requests. However, for improved concurrency performance you may also use `aiohttp` as the HTTP backend.\n\nYou can enable this by installing `aiohttp`:\n\n```sh\n# install from PyPI\npip install turbopuffer[aiohttp]\n```\n\nThen you can enable it by instantiating the client with `http_client=DefaultAioHttpClient()`:\n\n```python\nimport os\nimport asyncio\nfrom turbopuffer import DefaultAioHttpClient\nfrom turbopuffer import AsyncTurbopuffer\n\nasync def main() -> None:\n  async with AsyncTurbopuffer(\n    api_key=os.environ.get("TURBOPUFFER_API_KEY"),  # This is the default and can be omitted\n    http_client=DefaultAioHttpClient(),\n) as client:\n    response = await client.namespaces.write(\n        namespace="products",\n        distance_metric="cosine_distance",\n        upsert_rows=[{\n            "id": "2108ed60-6851-49a0-9016-8325434f3845",\n            "vector": [0.1, 0.2],\n        }],\n    )\n    print(response.rows_affected)\n\nasyncio.run(main())\n```\n\n\n\n## Using types\n\nNested request parameters are [TypedDicts](https://docs.python.org/3/library/typing.html#typing.TypedDict). Responses are [Pydantic models](https://docs.pydantic.dev) which also provide helper methods for things like:\n\n- Serializing back into JSON, `model.to_json()`\n- Converting to a dictionary, `model.to_dict()`\n\nTyped requests and responses provide autocomplete and documentation within your editor. If you would like to see type errors in VS Code to help catch bugs earlier, set `python.analysis.typeCheckingMode` to `basic`.\n\n## Pagination\n\nList methods in the Turbopuffer API are paginated.\n\nThis library provides auto-paginating iterators with each list response, so you do not have to request successive pages manually:\n\n```python\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer()\n\nall_clients = []\n# Automatically fetches more pages as needed.\nfor client in client.namespaces(\n    prefix="products",\n):\n    # Do something with client here\n    all_clients.append(client)\nprint(all_clients)\n```\n\nOr, asynchronously:\n\n```python\nimport asyncio\nfrom turbopuffer import AsyncTurbopuffer\n\nclient = AsyncTurbopuffer()\n\nasync def main() -> None:\n    all_clients = []\n    # Iterate through items across all pages, issuing requests as needed.\n    async for client in client.namespaces(\n    prefix="products",\n):\n        all_clients.append(client)\n    print(all_clients)\n\nasyncio.run(main())\n```\n\nAlternatively, you can use the `.has_next_page()`, `.next_page_info()`, or  `.get_next_page()` methods for more granular control working with pages:\n\n```python\nfirst_page = await client.namespaces(\n    prefix="products",\n)\nif first_page.has_next_page():\n    print(f"will fetch next page using these details: {first_page.next_page_info()}")\n    next_page = await first_page.get_next_page()\n    print(f"number of items we just fetched: {len(next_page.namespaces)}")\n\n# Remove `await` for non-async usage.\n```\n\nOr just work directly with the returned data:\n\n```python\nfirst_page = await client.namespaces(\n    prefix="products",\n)\n\nprint(f"next page cursor: {first_page.next_cursor}") # => "next page cursor: ..."\nfor client in first_page.namespaces:\n    print(client.id)\n\n# Remove `await` for non-async usage.\n```\n\n## Nested params\n\nNested parameters are dictionaries, typed using `TypedDict`, for example:\n\n```python\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer()\n\nresponse = client.namespaces.write(\n    namespace="namespace",\n    encryption={},\n)\nprint(response.encryption)\n```\n\n\n\n## Handling errors\n\nWhen the library is unable to connect to the API (for example, due to network connection problems or a timeout), a subclass of `turbopuffer.APIConnectionError` is raised.\n\nWhen the API returns a non-success status code (that is, 4xx or 5xx\nresponse), a subclass of `turbopuffer.APIStatusError` is raised, containing `status_code` and `response` properties.\n\nAll errors inherit from `turbopuffer.APIError`.\n\n```python\nimport turbopuffer\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer()\n\ntry:\n    client.namespaces(\n        prefix="foo",\n    )\nexcept turbopuffer.APIConnectionError as e:\n    print("The server could not be reached")\n    print(e.__cause__) # an underlying Exception, likely raised within httpx.\nexcept turbopuffer.RateLimitError as e:\n    print("A 429 status code was received; we should back off a bit.")\nexcept turbopuffer.APIStatusError as e:\n    print("Another non-200-range status code was received")\n    print(e.status_code)\n    print(e.response)\n```\n\nError codes are as follows:\n\n| Status Code | Error Type                 |\n| ----------- | -------------------------- |\n| 400         | `BadRequestError`          |\n| 401         | `AuthenticationError`      |\n| 403         | `PermissionDeniedError`    |\n| 404         | `NotFoundError`            |\n| 422         | `UnprocessableEntityError` |\n| 429         | `RateLimitError`           |\n| >=500       | `InternalServerError`      |\n| N/A         | `APIConnectionError`       |\n\n### Retries\n\nCertain errors are automatically retried 4 times by default, with a short exponential backoff.\nConnection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict,\n429 Rate Limit, and >=500 Internal errors are all retried by default.\n\nYou can use the `max_retries` option to configure or disable retry settings:\n\n```python\nfrom turbopuffer import Turbopuffer\n\n# Configure the default for all requests:\nclient = Turbopuffer(\n    # default is 2\n    max_retries=0,\n)\n\n# Or, configure per-request:\nclient.with_options(max_retries = 5).namespaces(\n    prefix="foo",\n)\n```\n\n### Timeouts\n\nBy default requests time out after 1 minute. You can configure this with a `timeout` option,\nwhich accepts a float or an [`httpx.Timeout`](https://www.python-httpx.org/advanced/timeouts/#fine-tuning-the-configuration) object:\n\n```python\nfrom turbopuffer import Turbopuffer\n\n# Configure the default for all requests:\nclient = Turbopuffer(\n    # 20 seconds (default is 1 minute)\n    timeout=20.0,\n)\n\n# More granular control:\nclient = Turbopuffer(\n    timeout=httpx.Timeout(60.0, read=5.0, write=10.0, connect=2.0),\n)\n\n# Override per-request:\nclient.with_options(timeout = 5.0).namespaces(\n    prefix="foo",\n)\n```\n\nOn timeout, an `APITimeoutError` is thrown.\n\nNote that requests that time out are [retried twice by default](#retries).\n\n\n\n## Advanced\n\n### Logging\n\nWe use the standard library [`logging`](https://docs.python.org/3/library/logging.html) module.\n\nYou can enable logging by setting the environment variable `TURBOPUFFER_LOG` to `info`.\n\n```shell\n$ export TURBOPUFFER_LOG=info\n```\n\nOr to `debug` for more verbose logging.\n\n### How to tell whether `None` means `null` or missing\n\nIn an API response, a field may be explicitly `null`, or missing entirely; in either case, its value is `None` in this library. You can differentiate the two cases with `.model_fields_set`:\n\n```py\nif response.my_field is None:\n  if \'my_field\' not in response.model_fields_set:\n    print(\'Got json like {}, without a "my_field" key present at all.\')\n  else:\n    print(\'Got json like {"my_field": null}.\')\n```\n\n### Accessing raw response data (e.g. headers)\n\nThe "raw" Response object can be accessed by prefixing `.with_raw_response.` to any HTTP method call, e.g.,\n\n```py\nfrom turbopuffer import Turbopuffer\n\nclient = Turbopuffer()\nresponse = client.with_raw_response.namespaces(\n    prefix="foo",\n)\nprint(response.headers.get(\'X-My-Header\'))\n\nclient = response.parse()  # get the object that `namespaces()` would have returned\nprint(client.id)\n```\n\nThese methods return an [`APIResponse`](https://github.com/turbopuffer/turbopuffer-python/tree/main/src/turbopuffer/_response.py) object.\n\nThe async client returns an [`AsyncAPIResponse`](https://github.com/turbopuffer/turbopuffer-python/tree/main/src/turbopuffer/_response.py) with the same structure, the only difference being `await`able methods for reading the response content.\n\n#### `.with_streaming_response`\n\nThe above interface eagerly reads the full response body when you make the request, which may not always be what you want.\n\nTo stream the response body, use `.with_streaming_response` instead, which requires a context manager and only reads the response body once you call `.read()`, `.text()`, `.json()`, `.iter_bytes()`, `.iter_text()`, `.iter_lines()` or `.parse()`. In the async client, these are async methods.\n\n```python\nwith client.with_streaming_response.namespaces(\n    prefix="foo",\n) as response :\n    print(response.headers.get(\'X-My-Header\'))\n\n    for line in response.iter_lines():\n      print(line)\n```\n\nThe context manager is required so that the response will reliably be closed.\n\n### Making custom/undocumented requests\n\nThis library is typed for convenient access to the documented API.\n\nIf you need to access undocumented endpoints, params, or response properties, the library can still be used.\n\n#### Undocumented endpoints\n\nTo make requests to undocumented endpoints, you can make requests using `client.get`, `client.post`, and other\nhttp verbs. Options on the client will be respected (such as retries) when making this request.\n\n```py\nimport httpx\n\nresponse = client.post(\n    "/foo",\n    cast_to=httpx.Response,\n    body={"my_param": True},\n)\n\nprint(response.headers.get("x-foo"))\n```\n\n#### Undocumented request params\n\nIf you want to explicitly send an extra param, you can do so with the `extra_query`, `extra_body`, and `extra_headers` request\noptions.\n\n#### Undocumented response properties\n\nTo access undocumented response properties, you can access the extra fields like `response.unknown_prop`. You\ncan also get all the extra fields on the Pydantic model as a dict with\n[`response.model_extra`](https://docs.pydantic.dev/latest/api/base_model/#pydantic.BaseModel.model_extra).\n\n### Configuring the HTTP client\n\nYou can directly override the [httpx client](https://www.python-httpx.org/api/#client) to customize it for your use case, including:\n\n- Support for [proxies](https://www.python-httpx.org/advanced/proxies/)\n- Custom [transports](https://www.python-httpx.org/advanced/transports/)\n- Additional [advanced](https://www.python-httpx.org/advanced/clients/) functionality\n\n```python\nimport httpx\nfrom turbopuffer import Turbopuffer, DefaultHttpxClient\n\nclient = Turbopuffer(\n    # Or use the `TURBOPUFFER_BASE_URL` env var\n    base_url="http://my.test.server.example.com:8083",\n    http_client=DefaultHttpxClient(proxy="http://my.test.proxy.example.com", transport=httpx.HTTPTransport(local_address="0.0.0.0")),\n)\n```\n\nYou can also customize the client on a per-request basis by using `with_options()`:\n\n```python\nclient.with_options(http_client=DefaultHttpxClient(...))\n```\n\n### Managing HTTP resources\n\nBy default the library closes underlying HTTP connections whenever the client is [garbage collected](https://docs.python.org/3/reference/datamodel.html#object.__del__). You can manually close the client using the `.close()` method if desired, or with a context manager that closes when exiting.\n\n```py\nfrom turbopuffer import Turbopuffer\n\nwith Turbopuffer() as client:\n  # make requests here\n  ...\n\n# HTTP client is now closed\n```\n\n## Versioning\n\nThis package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:\n\n1. Changes that only affect static types, without breaking runtime behavior.\n2. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_\n3. Changes that we do not expect to impact the vast majority of users in practice.\n\nWe take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.\n\nWe are keen for your feedback; please open an [issue](https://www.github.com/turbopuffer/turbopuffer-python/issues) with questions, bugs, or suggestions.\n\n### Determining the installed version\n\nIf you\'ve upgraded to the latest version but aren\'t seeing any new features you were expecting then your python environment is likely still using an older version.\n\nYou can determine the version that is being used at runtime with:\n\n```py\nimport turbopuffer\nprint(turbopuffer.__version__)\n```\n\n## Requirements\n\nPython 3.9 or higher.\n\n## Contributing\n\nSee [the contributing documentation](./CONTRIBUTING.md).\n',
  },
  {
    language: 'go',
    content:
      '# Turbopuffer Go API Library\n\n<a href="https://pkg.go.dev/github.com/turbopuffer/turbopuffer-go"><img src="https://pkg.go.dev/badge/github.com/turbopuffer/turbopuffer-go.svg" alt="Go Reference"></a>\n\nThe Turbopuffer Go library provides convenient access to the [Turbopuffer REST API](https://turbopuffer.com/docs/auth)\nfrom applications written in Go.\n\nIt is generated with [Stainless](https://www.stainless.com/).\n\n## MCP Server\n\nUse the Turbopuffer MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.\n\n[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=%40turbopuffer%2Fturbopuffer-mcp&config=eyJuYW1lIjoiQHR1cmJvcHVmZmVyL3R1cmJvcHVmZmVyLW1jcCIsInRyYW5zcG9ydCI6Imh0dHAiLCJ1cmwiOiJodHRwczovL3R1cmJvcHVmZmVyLnN0bG1jcC5jb20iLCJoZWFkZXJzIjp7IngtdHVyYm9wdWZmZXItYXBpLWtleSI6InRwdWZfQTEuLi4ifX0)\n[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22%40turbopuffer%2Fturbopuffer-mcp%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fturbopuffer.stlmcp.com%22%2C%22headers%22%3A%7B%22x-turbopuffer-api-key%22%3A%22tpuf_A1...%22%7D%7D)\n\n> Note: You may need to set environment variables in your MCP client.\n\n## Installation\n\n<!-- x-release-please-start-version -->\n\n```go\nimport (\n\t"github.com/turbopuffer/turbopuffer-go" // imported as SDK_PackageName\n)\n```\n\n<!-- x-release-please-end -->\n\nOr to pin the version:\n\n<!-- x-release-please-start-version -->\n\n```sh\ngo get -u \'github.com/turbopuffer/turbopuffer-go@v0.0.1\'\n```\n\n<!-- x-release-please-end -->\n\n## Requirements\n\nThis library requires Go 1.22+.\n\n## Usage\n\nThe full API of this library can be found in [api.md](api.md).\n\n```go\npackage main\n\nimport (\n\t"context"\n\t"fmt"\n\n\t"github.com/turbopuffer/turbopuffer-go"\n\t"github.com/turbopuffer/turbopuffer-go/option"\n)\n\nfunc main() {\n\tclient := turbopuffer.NewClient(\n\t\toption.WithAPIKey("tpuf_A1..."), // defaults to os.LookupEnv("TURBOPUFFER_API_KEY")\n\t)\n\tresponse, err := client.Namespaces.Write(context.TODO(), turbopuffer.NamespaceWriteParams{\n\t\tNamespace:      turbopuffer.String("products"),\n\t\tDistanceMetric: turbopuffer.DistanceMetricCosineDistance,\n\t\tUpsertRows: []turbopuffer.RowParam{{\n\t\t\tID: turbopuffer.IDParam{\n\t\t\t\tString: turbopuffer.String("2108ed60-6851-49a0-9016-8325434f3845"),\n\t\t\t},\n\t\t\tVector: turbopuffer.VectorParam{\n\t\t\t\tFloatArray: []float64{0.1, 0.2},\n\t\t\t},\n\t\t}},\n\t})\n\tif err != nil {\n\t\tpanic(err.Error())\n\t}\n\tfmt.Printf("%+v\\n", response.RowsAffected)\n}\n\n```\n\n### Request fields\n\nAll request parameters are wrapped in a generic `Field` type,\nwhich we use to distinguish zero values from null or omitted fields.\n\nThis prevents accidentally sending a zero value if you forget a required parameter,\nand enables explicitly sending `null`, `false`, `\'\'`, or `0` on optional parameters.\nAny field not specified is not sent.\n\nTo construct fields with values, use the helpers `String()`, `Int()`, `Float()`, or most commonly, the generic `F[T]()`.\nTo send a null, use `Null[T]()`, and to send a nonconforming value, use `Raw[T](any)`. For example:\n\n```go\nparams := FooParams{\n\tName: SDK_PackageName.F("hello"),\n\n\t// Explicitly send `"description": null`\n\tDescription: SDK_PackageName.Null[string](),\n\n\tPoint: SDK_PackageName.F(SDK_PackageName.Point{\n\t\tX: SDK_PackageName.Int(0),\n\t\tY: SDK_PackageName.Int(1),\n\n\t\t// In cases where the API specifies a given type,\n\t\t// but you want to send something else, use `Raw`:\n\t\tZ: SDK_PackageName.Raw[int64](0.01), // sends a float\n\t}),\n}\n```\n\n### Response objects\n\nAll fields in response structs are value types (not pointers or wrappers).\n\nIf a given field is `null`, not present, or invalid, the corresponding field\nwill simply be its zero value.\n\nAll response structs also include a special `JSON` field, containing more detailed\ninformation about each property, which you can use like so:\n\n```go\nif res.Name == "" {\n\t// true if `"name"` is either not present or explicitly null\n\tres.JSON.Name.IsNull()\n\n\t// true if the `"name"` key was not present in the response JSON at all\n\tres.JSON.Name.IsMissing()\n\n\t// When the API returns data that cannot be coerced to the expected type:\n\tif res.JSON.Name.IsInvalid() {\n\t\traw := res.JSON.Name.Raw()\n\n\t\tlegacyName := struct{\n\t\t\tFirst string `json:"first"`\n\t\t\tLast  string `json:"last"`\n\t\t}{}\n\t\tjson.Unmarshal([]byte(raw), &legacyName)\n\t\tname = legacyName.First + " " + legacyName.Last\n\t}\n}\n```\n\nThese `.JSON` structs also include an `Extras` map containing\nany properties in the json response that were not specified\nin the struct. This can be useful for API features not yet\npresent in the SDK.\n\n```go\nbody := res.JSON.ExtraFields["my_unexpected_field"].Raw()\n```\n\n### RequestOptions\n\nThis library uses the functional options pattern. Functions defined in the\n`SDK_PackageOptionName` package return a `RequestOption`, which is a closure that mutates a\n`RequestConfig`. These options can be supplied to the client or at individual\nrequests. For example:\n\n```go\nclient := SDK_PackageName.SDK_ClientInitializerName(\n\t// Adds a header to every request made by the client\n\tSDK_PackageOptionName.WithHeader("X-Some-Header", "custom_header_info"),\n)\n\nclient.Namespaces(context.TODO(), ...,\n\t// Override the header\n\tSDK_PackageOptionName.WithHeader("X-Some-Header", "some_other_custom_header_info"),\n\t// Add an undocumented field to the request body, using sjson syntax\n\tSDK_PackageOptionName.WithJSONSet("some.json.path", map[string]string{"my": "object"}),\n)\n```\n\nSee the [full list of request options](https://pkg.go.dev/github.com/turbopuffer/turbopuffer-go/SDK_PackageOptionName).\n\n### Pagination\n\nThis library provides some conveniences for working with paginated list endpoints.\n\nYou can use `.ListAutoPaging()` methods to iterate through items across all pages:\n\n```go\niter := client.NamespacesAutoPaging(context.TODO(), turbopuffer.NamespacesParams{\n\tPrefix: turbopuffer.String("products"),\n})\n// Automatically fetches more pages as needed.\nfor iter.Next() {\n\tnamespaceSummary := iter.Current()\n\tfmt.Printf("%+v\\n", namespaceSummary)\n}\nif err := iter.Err(); err != nil {\n\tpanic(err.Error())\n}\n```\n\nOr you can use simple `.List()` methods to fetch a single page and receive a standard response object\nwith additional helper methods like `.GetNextPage()`, e.g.:\n\n```go\npage, err := client.Namespaces(context.TODO(), turbopuffer.NamespacesParams{\n\tPrefix: turbopuffer.String("products"),\n})\nfor page != nil {\n\tfor _, client := range page.Namespaces {\n\t\tfmt.Printf("%+v\\n", client)\n\t}\n\tpage, err = page.GetNextPage()\n}\nif err != nil {\n\tpanic(err.Error())\n}\n```\n\n### Errors\n\nWhen the API returns a non-success status code, we return an error with type\n`*SDK_PackageName.Error`. This contains the `StatusCode`, `*http.Request`, and\n`*http.Response` values of the request, as well as the JSON of the error body\n(much like other response objects in the SDK).\n\nTo handle errors, we recommend that you use the `errors.As` pattern:\n\n```go\n_, err := client.Namespaces(context.TODO(), turbopuffer.NamespacesParams{\n\tPrefix: turbopuffer.String("foo"),\n})\nif err != nil {\n\tvar apierr *turbopuffer.Error\n\tif errors.As(err, &apierr) {\n\t\tprintln(string(apierr.DumpRequest(true)))  // Prints the serialized HTTP request\n\t\tprintln(string(apierr.DumpResponse(true))) // Prints the serialized HTTP response\n\t}\n\tpanic(err.Error()) // GET "/v1/namespaces": 400 Bad Request { ... }\n}\n```\n\nWhen other errors occur, they are returned unwrapped; for example,\nif HTTP transport fails, you might receive `*url.Error` wrapping `*net.OpError`.\n\n### Timeouts\n\nRequests do not time out by default; use context to configure a timeout for a request lifecycle.\n\nNote that if a request is [retried](#retries), the context timeout does not start over.\nTo set a per-retry timeout, use `SDK_PackageOptionName.WithRequestTimeout()`.\n\n```go\n// This sets the timeout for the request, including all the retries.\nctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)\ndefer cancel()\nclient.Namespaces(\n\tctx,\n\tturbopuffer.NamespacesParams{\n\t\tPrefix: turbopuffer.String("foo"),\n\t},\n\t// This sets the per-retry timeout\n\toption.WithRequestTimeout(20*time.Second),\n)\n```\n\n### File uploads\n\nRequest parameters that correspond to file uploads in multipart requests are typed as\n`param.Field[io.Reader]`. The contents of the `io.Reader` will by default be sent as a multipart form\npart with the file name of "anonymous_file" and content-type of "application/octet-stream".\n\nThe file name and content-type can be customized by implementing `Name() string` or `ContentType()\nstring` on the run-time type of `io.Reader`. Note that `os.File` implements `Name() string`, so a\nfile returned by `os.Open` will be sent with the file name on disk.\n\nWe also provide a helper `SDK_PackageName.FileParam(reader io.Reader, filename string, contentType string)`\nwhich can be used to wrap any `io.Reader` with the appropriate file name and content type.\n\n\n\n### Retries\n\nCertain errors will be automatically retried 4 times by default, with a short exponential backoff.\nWe retry by default all connection errors, 408 Request Timeout, 409 Conflict, 429 Rate Limit,\nand >=500 Internal errors.\n\nYou can use the `WithMaxRetries` option to configure or disable this:\n\n```go\n// Configure the default for all requests:\nclient := turbopuffer.NewClient(\n\toption.WithMaxRetries(0), // default is 2\n)\n\n// Override per-request:\nclient.Namespaces(\n\tcontext.TODO(),\n\tturbopuffer.NamespacesParams{\n\t\tPrefix: turbopuffer.String("foo"),\n\t},\n\toption.WithMaxRetries(5),\n)\n```\n\n\n### Accessing raw response data (e.g. response headers)\n\nYou can access the raw HTTP response data by using the `option.WithResponseInto()` request option. This is useful when\nyou need to examine response headers, status codes, or other details.\n\n```go\n// Create a variable to store the HTTP response\nvar response *http.Response\nnamespaces, err := client.Namespaces(\n\tcontext.TODO(),\n\tturbopuffer.NamespacesParams{\n\t\tPrefix: turbopuffer.String("foo"),\n\t},\n\toption.WithResponseInto(&response),\n)\nif err != nil {\n\t// handle error\n}\nfmt.Printf("%+v\\n", namespaces)\n\nfmt.Printf("Status Code: %d\\n", response.StatusCode)\nfmt.Printf("Headers: %+#v\\n", response.Header)\n```\n\n### Making custom/undocumented requests\n\nThis library is typed for convenient access to the documented API. If you need to access undocumented\nendpoints, params, or response properties, the library can still be used.\n\n#### Undocumented endpoints\n\nTo make requests to undocumented endpoints, you can use `client.Get`, `client.Post`, and other HTTP verbs.\n`RequestOptions` on the client, such as retries, will be respected when making these requests.\n\n```go\nvar (\n    // params can be an io.Reader, a []byte, an encoding/json serializable object,\n    // or a "…Params" struct defined in this library.\n    params map[string]interface{}\n\n    // result can be an []byte, *http.Response, a encoding/json deserializable object,\n    // or a model defined in this library.\n    result *http.Response\n)\nerr := client.Post(context.Background(), "/unspecified", params, &result)\nif err != nil {\n    …\n}\n```\n\n#### Undocumented request params\n\nTo make requests using undocumented parameters, you may use either the `SDK_PackageOptionName.WithQuerySet()`\nor the `SDK_PackageOptionName.WithJSONSet()` methods.\n\n```go\nparams := FooNewParams{\n    ID:   SDK_PackageName.F("id_xxxx"),\n    Data: SDK_PackageName.F(FooNewParamsData{\n        FirstName: SDK_PackageName.F("John"),\n    }),\n}\nclient.Foo.New(context.Background(), params, SDK_PackageOptionName.WithJSONSet("data.last_name", "Doe"))\n```\n\n#### Undocumented response properties\n\nTo access undocumented response properties, you may either access the raw JSON of the response as a string\nwith `result.JSON.RawJSON()`, or get the raw JSON of a particular field on the result with\n`result.JSON.Foo.Raw()`.\n\nAny fields that are not present on the response struct will be saved and can be accessed by `result.JSON.ExtraFields()` which returns the extra fields as a `map[string]Field`.\n\n### Middleware\n\nWe provide `SDK_PackageOptionName.WithMiddleware` which applies the given\nmiddleware to requests.\n\n```go\nfunc Logger(req *http.Request, next SDK_PackageOptionName.MiddlewareNext) (res *http.Response, err error) {\n\t// Before the request\n\tstart := time.Now()\n\tLogReq(req)\n\n\t// Forward the request to the next handler\n\tres, err = next(req)\n\n\t// Handle stuff after the request\n\tend := time.Now()\n\tLogRes(res, err, start - end)\n\n    return res, err\n}\n\nclient := SDK_PackageName.SDK_ClientInitializerName(\n\tSDK_PackageOptionName.WithMiddleware(Logger),\n)\n```\n\nWhen multiple middlewares are provided as variadic arguments, the middlewares\nare applied left to right. If `SDK_PackageOptionName.WithMiddleware` is given\nmultiple times, for example first in the client then the method, the\nmiddleware in the client will run first and the middleware given in the method\nwill run next.\n\nYou may also replace the default `http.Client` with\n`SDK_PackageOptionName.WithHTTPClient(client)`. Only one http client is\naccepted (this overwrites any previous client) and receives requests after any\nmiddleware has been applied.\n\n## Semantic versioning\n\nThis package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:\n\n1. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_\n2. Changes that we do not expect to impact the vast majority of users in practice.\n\nWe take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.\n\nWe are keen for your feedback; please open an [issue](https://www.github.com/turbopuffer/turbopuffer-go/issues) with questions, bugs, or suggestions.\n\n## Contributing\n\nSee [the contributing documentation](./CONTRIBUTING.md).\n',
  },
  {
    language: 'typescript',
    content:
      "# Turbopuffer TypeScript API Library\n\n[![NPM version](https://img.shields.io/npm/v/@turbopuffer/turbopuffer.svg?label=npm%20(stable))](https://npmjs.org/package/@turbopuffer/turbopuffer) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@turbopuffer/turbopuffer)\n\nThis library provides convenient access to the Turbopuffer REST API from server-side TypeScript or JavaScript.\n\n\n\nThe REST API documentation can be found on [turbopuffer.com](https://turbopuffer.com/docs/auth). The full API of this library can be found in [api.md](api.md).\n\nIt is generated with [Stainless](https://www.stainless.com/).\n\n## MCP Server\n\nUse the Turbopuffer MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.\n\n[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=%40turbopuffer%2Fturbopuffer-mcp&config=eyJuYW1lIjoiQHR1cmJvcHVmZmVyL3R1cmJvcHVmZmVyLW1jcCIsInRyYW5zcG9ydCI6Imh0dHAiLCJ1cmwiOiJodHRwczovL3R1cmJvcHVmZmVyLnN0bG1jcC5jb20iLCJoZWFkZXJzIjp7IngtdHVyYm9wdWZmZXItYXBpLWtleSI6InRwdWZfQTEuLi4ifX0)\n[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22%40turbopuffer%2Fturbopuffer-mcp%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fturbopuffer.stlmcp.com%22%2C%22headers%22%3A%7B%22x-turbopuffer-api-key%22%3A%22tpuf_A1...%22%7D%7D)\n\n> Note: You may need to set environment variables in your MCP client.\n\n## Installation\n\n```sh\nnpm install @turbopuffer/turbopuffer\n```\n\n\n\n## Usage\n\nThe full API of this library can be found in [api.md](api.md).\n\n<!-- prettier-ignore -->\n```js\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst response = await client.namespaces.write({\n  namespace: 'products',\n  distance_metric: 'cosine_distance',\n  upsert_rows: [{ id: '2108ed60-6851-49a0-9016-8325434f3845', vector: [0.1, 0.2] }],\n});\n\nconsole.log(response.rows_affected);\n```\n\n\n\n### Request & Response types\n\nThis library includes TypeScript definitions for all request params and response fields. You may import and use them like so:\n\n<!-- prettier-ignore -->\n```ts\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  apiKey: process.env['TURBOPUFFER_API_KEY'], // This is the default and can be omitted\n});\n\nconst params: Turbopuffer.NamespacesParams = { prefix: 'foo' };\nconst [namespaceSummary]: [Turbopuffer.NamespaceSummary] = await client.namespaces(params);\n```\n\nDocumentation for each method, request param, and response field are available in docstrings and will appear on hover in most modern editors.\n\n\n\n\n\n## Handling errors\n\nWhen the library is unable to connect to the API,\nor if the API returns a non-success status code (i.e., 4xx or 5xx response),\na subclass of `APIError` will be thrown:\n\n<!-- prettier-ignore -->\n```ts\nconst namespaces = await client.namespaces({ prefix: 'foo' }).catch(async (err) => {\n  if (err instanceof Turbopuffer.APIError) {\n    console.log(err.status); // 400\n    console.log(err.name); // BadRequestError\n    console.log(err.headers); // {server: 'nginx', ...}\n  } else {\n    throw err;\n  }\n});\n```\n\nError codes are as follows:\n\n| Status Code | Error Type                 |\n| ----------- | -------------------------- |\n| 400         | `BadRequestError`          |\n| 401         | `AuthenticationError`      |\n| 403         | `PermissionDeniedError`    |\n| 404         | `NotFoundError`            |\n| 422         | `UnprocessableEntityError` |\n| 429         | `RateLimitError`           |\n| >=500       | `InternalServerError`      |\n| N/A         | `APIConnectionError`       |\n\n### Retries\n\nCertain errors will be automatically retried 4 times by default, with a short exponential backoff.\nConnection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict,\n429 Rate Limit, and >=500 Internal errors will all be retried by default.\n\nYou can use the `maxRetries` option to configure or disable this:\n\n<!-- prettier-ignore -->\n```js\n// Configure the default for all requests:\nconst client = new Turbopuffer({\n  maxRetries: 0, // default is 2\n});\n\n// Or, configure per-request:\nawait client.namespaces({ prefix: 'foo' }, {\n  maxRetries: 5,\n});\n```\n\n### Timeouts\n\nRequests time out after 1 minute by default. You can configure this with a `timeout` option:\n\n<!-- prettier-ignore -->\n```ts\n// Configure the default for all requests:\nconst client = new Turbopuffer({\n  timeout: 20 * 1000, // 20 seconds (default is 1 minute)\n});\n\n// Override per-request:\nawait client.namespaces({ prefix: 'foo' }, {\n  timeout: 5 * 1000,\n});\n```\n\nOn timeout, an `APIConnectionTimeoutError` is thrown.\n\nNote that requests which time out will be [retried twice by default](#retries).\n\n## Auto-pagination\n\nList methods in the Turbopuffer API are paginated.\nYou can use the `for await … of` syntax to iterate through items across all pages:\n\n```ts\nasync function fetchAllNamespaceSummaries(params) {\n  const allNamespaceSummaries = [];\n  // Automatically fetches more pages as needed.\n  for await (const namespaceSummary of client.namespaces({ prefix: 'products' })) {\n    allNamespaceSummaries.push(namespaceSummary);\n  }\n  return allNamespaceSummaries;\n}\n```\n\nAlternatively, you can request a single page at a time:\n\n```ts\nlet page = await client.namespaces({ prefix: 'products' });\nfor (const namespaceSummary of page.namespaces) {\n  console.log(namespaceSummary);\n}\n\n// Convenience methods are provided for manually paginating:\nwhile (page.hasNextPage()) {\n  page = await page.getNextPage();\n  // ...\n}\n```\n\n\n\n## Advanced Usage\n\n### Accessing raw Response data (e.g., headers)\n\nThe \"raw\" `Response` returned by `fetch()` can be accessed through the `.asResponse()` method on the `APIPromise` type that all methods return.\nThis method returns as soon as the headers for a successful response are received and does not consume the response body, so you are free to write custom parsing or streaming logic.\n\nYou can also use the `.withResponse()` method to get the raw `Response` along with the parsed data.\nUnlike `.asResponse()` this method consumes the body, returning once it is parsed.\n\n<!-- prettier-ignore -->\n```ts\nconst client = new Turbopuffer();\n\nconst response = await client.namespaces({ prefix: 'foo' }).asResponse();\nconsole.log(response.headers.get('X-My-Header'));\nconsole.log(response.statusText); // access the underlying Response object\n\nconst { data: namespaces, response: raw } = await client\n  .namespaces({ prefix: 'foo' })\n  .withResponse();\nconsole.log(raw.headers.get('X-My-Header'));\nfor await (const namespaceSummary of namespaces) {\n  console.log(namespaceSummary.id);\n}\n```\n\n### Logging\n\n> [!IMPORTANT]\n> All log messages are intended for debugging only. The format and content of log messages\n> may change between releases.\n\n#### Log levels\n\nThe log level can be configured in two ways:\n\n1. Via the `TURBOPUFFER_LOG` environment variable\n2. Using the `logLevel` client option (overrides the environment variable if set)\n\n```ts\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  logLevel: 'debug', // Show all log messages\n});\n```\n\nAvailable log levels, from most to least verbose:\n\n- `'debug'` - Show debug messages, info, warnings, and errors\n- `'info'` - Show info messages, warnings, and errors\n- `'warn'` - Show warnings and errors (default)\n- `'error'` - Show only errors\n- `'off'` - Disable all logging\n\nAt the `'debug'` level, all HTTP requests and responses are logged, including headers and bodies.\nSome authentication-related headers are redacted, but sensitive data in request and response bodies\nmay still be visible.\n\n#### Custom logger\n\nBy default, this library logs to `globalThis.console`. You can also provide a custom logger.\nMost logging libraries are supported, including [pino](https://www.npmjs.com/package/pino), [winston](https://www.npmjs.com/package/winston), [bunyan](https://www.npmjs.com/package/bunyan), [consola](https://www.npmjs.com/package/consola), [signale](https://www.npmjs.com/package/signale), and [@std/log](https://jsr.io/@std/log). If your logger doesn't work, please open an issue.\n\nWhen providing a custom logger, the `logLevel` option still controls which messages are emitted, messages\nbelow the configured level will not be sent to your logger.\n\n```ts\nimport Turbopuffer from '@turbopuffer/turbopuffer';\nimport pino from 'pino';\n\nconst logger = pino();\n\nconst client = new Turbopuffer({\n  logger: logger.child({ name: 'Turbopuffer' }),\n  logLevel: 'debug', // Send all messages to pino, allowing it to filter\n});\n```\n\n### Making custom/undocumented requests\n\nThis library is typed for convenient access to the documented API. If you need to access undocumented\nendpoints, params, or response properties, the library can still be used.\n\n#### Undocumented endpoints\n\nTo make requests to undocumented endpoints, you can use `client.get`, `client.post`, and other HTTP verbs.\nOptions on the client, such as retries, will be respected when making these requests.\n\n```ts\nawait client.post('/some/path', {\n  body: { some_prop: 'foo' },\n  query: { some_query_arg: 'bar' },\n});\n```\n\n#### Undocumented request params\n\nTo make requests using undocumented parameters, you may use `// @ts-expect-error` on the undocumented\nparameter. This library doesn't validate at runtime that the request matches the type, so any extra values you\nsend will be sent as-is.\n\n```ts\nclient.namespaces.write({\n  // ...\n  // @ts-expect-error baz is not yet public\n  baz: 'undocumented option',\n});\n```\n\nFor requests with the `GET` verb, any extra params will be in the query, all other requests will send the\nextra param in the body.\n\nIf you want to explicitly send an extra argument, you can do so with the `query`, `body`, and `headers` request\noptions.\n\n#### Undocumented response properties\n\nTo access undocumented response properties, you may access the response object with `// @ts-expect-error` on\nthe response object, or cast the response object to the requisite type. Like the request params, we do not\nvalidate or strip extra properties from the response from the API.\n\n### Customizing the fetch client\n\nBy default, this library expects a global `fetch` function is defined.\n\nIf you want to use a different `fetch` function, you can either polyfill the global:\n\n```ts\nimport fetch from 'my-fetch';\n\nglobalThis.fetch = fetch;\n```\n\nOr pass it to the client:\n\n```ts\nimport Turbopuffer from '@turbopuffer/turbopuffer';\nimport fetch from 'my-fetch';\n\nconst client = new Turbopuffer({ fetch });\n```\n\n### Fetch options\n\nIf you want to set custom `fetch` options without overriding the `fetch` function, you can provide a `fetchOptions` object when instantiating the client or making a request. (Request-specific options override client options.)\n\n```ts\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  fetchOptions: {\n    // `RequestInit` options\n  },\n});\n```\n\n#### Configuring proxies\n\nTo modify proxy behavior, you can provide custom `fetchOptions` that add runtime-specific proxy\noptions to requests:\n\n<img src=\"https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/node.svg\" align=\"top\" width=\"18\" height=\"21\"> **Node** <sup>[[docs](https://github.com/nodejs/undici/blob/main/docs/docs/api/ProxyAgent.md#example---proxyagent-with-fetch)]</sup>\n\n```ts\nimport Turbopuffer from '@turbopuffer/turbopuffer';\nimport * as undici from 'undici';\n\nconst proxyAgent = new undici.ProxyAgent('http://localhost:8888');\nconst client = new Turbopuffer({\n  fetchOptions: {\n    dispatcher: proxyAgent,\n  },\n});\n```\n\n<img src=\"https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/bun.svg\" align=\"top\" width=\"18\" height=\"21\"> **Bun** <sup>[[docs](https://bun.sh/guides/http/proxy)]</sup>\n\n```ts\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer({\n  fetchOptions: {\n    proxy: 'http://localhost:8888',\n  },\n});\n```\n\n<img src=\"https://raw.githubusercontent.com/stainless-api/sdk-assets/refs/heads/main/deno.svg\" align=\"top\" width=\"18\" height=\"21\"> **Deno** <sup>[[docs](https://docs.deno.com/api/deno/~/Deno.createHttpClient)]</sup>\n\n```ts\nimport Turbopuffer from 'npm:@turbopuffer/turbopuffer';\n\nconst httpClient = Deno.createHttpClient({ proxy: { url: 'http://localhost:8888' } });\nconst client = new Turbopuffer({\n  fetchOptions: {\n    client: httpClient,\n  },\n});\n```\n\n## Frequently Asked Questions\n\n## Semantic versioning\n\nThis package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:\n\n1. Changes that only affect static types, without breaking runtime behavior.\n2. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_\n3. Changes that we do not expect to impact the vast majority of users in practice.\n\nWe take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.\n\nWe are keen for your feedback; please open an [issue](https://www.github.com/turbopuffer/turbopuffer-typescript/issues) with questions, bugs, or suggestions.\n\n## Requirements\n\nTypeScript >= 4.9 is supported.\n\nThe following runtimes are supported:\n\n- Web browsers (Up-to-date Chrome, Firefox, Safari, Edge, and more)\n- Node.js 20 LTS or later ([non-EOL](https://endoflife.date/nodejs)) versions.\n- Deno v1.28.0 or higher.\n- Bun 1.0 or later.\n- Cloudflare Workers.\n- Vercel Edge Runtime.\n- Jest 28 or greater with the `\"node\"` environment (`\"jsdom\"` is not supported at this time).\n- Nitro v2.6 or greater.\n\nNote that React Native is not supported at this time.\n\nIf you are interested in other runtime environments, please open or upvote an issue on GitHub.\n\n## Contributing\n\nSee [the contributing documentation](./CONTRIBUTING.md).\n",
  },
  {
    language: 'ruby',
    content:
      '# Turbopuffer Ruby API library\n\nThe Turbopuffer Ruby library provides convenient access to the Turbopuffer REST API from any Ruby 3.2.0+ application. It ships with comprehensive types & docstrings in Yard, RBS, and RBI – [see below](https://github.com/turbopuffer/turbopuffer-ruby#Sorbet) for usage with Sorbet. The standard library\'s `net/http` is used as the HTTP transport, with connection pooling via the `connection_pool` gem.\n\n\n\nIt is generated with [Stainless](https://www.stainless.com/).\n\n## MCP Server\n\nUse the Turbopuffer MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.\n\n[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=%40turbopuffer%2Fturbopuffer-mcp&config=eyJuYW1lIjoiQHR1cmJvcHVmZmVyL3R1cmJvcHVmZmVyLW1jcCIsInRyYW5zcG9ydCI6Imh0dHAiLCJ1cmwiOiJodHRwczovL3R1cmJvcHVmZmVyLnN0bG1jcC5jb20iLCJoZWFkZXJzIjp7IngtdHVyYm9wdWZmZXItYXBpLWtleSI6InRwdWZfQTEuLi4ifX0)\n[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22%40turbopuffer%2Fturbopuffer-mcp%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fturbopuffer.stlmcp.com%22%2C%22headers%22%3A%7B%22x-turbopuffer-api-key%22%3A%22tpuf_A1...%22%7D%7D)\n\n> Note: You may need to set environment variables in your MCP client.\n\n## Documentation\n\nDocumentation for releases of this gem can be found [on RubyDoc](https://gemdocs.org/gems/turbopuffer).\n\nThe REST API documentation can be found on [turbopuffer.com](https://turbopuffer.com/docs/auth).\n\n## Installation\n\nTo use this gem, install via Bundler by adding the following to your application\'s `Gemfile`:\n\n<!-- x-release-please-start-version -->\n\n```ruby\ngem "turbopuffer", "~> 0.0.1"\n```\n\n<!-- x-release-please-end -->\n\n## Usage\n\n```ruby\nrequire "bundler/setup"\nrequire "turbopuffer"\n\nturbopuffer = Turbopuffer::Client.new(\n  api_key: ENV["TURBOPUFFER_API_KEY"] # This is the default and can be omitted\n)\n\nresponse = turbopuffer.namespaces.write(\n  namespace: "products",\n  distance_metric: "cosine_distance",\n  upsert_rows: [{id: "2108ed60-6851-49a0-9016-8325434f3845", vector: [0.1, 0.2]}]\n)\n\nputs(response.rows_affected)\n```\n\n\n\n### Pagination\n\nList methods in the Turbopuffer API are paginated.\n\nThis library provides auto-paginating iterators with each list response, so you do not have to request successive pages manually:\n\n```ruby\npage = turbopuffer.namespaces(prefix: "products")\n\n# Fetch single item from page.\nclient = page.namespaces[0]\nputs(client.id)\n\n# Automatically fetches more pages as needed.\npage.auto_paging_each do |client|\n  puts(client.id)\nend\n```\n\nAlternatively, you can use the `#next_page?` and `#next_page` methods for more granular control working with pages.\n\n```ruby\nif page.next_page?\n  new_page = page.next_page\n  puts(new_page.namespaces[0].id)\nend\n```\n\n\n\n### Handling errors\n\nWhen the library is unable to connect to the API, or if the API returns a non-success status code (i.e., 4xx or 5xx response), a subclass of `Turbopuffer::Errors::APIError` will be thrown:\n\n```ruby\nbegin\n  client = turbopuffer.namespaces(prefix: "foo")\nrescue Turbopuffer::Errors::APIConnectionError => e\n  puts("The server could not be reached")\n  puts(e.cause)  # an underlying Exception, likely raised within `net/http`\nrescue Turbopuffer::Errors::RateLimitError => e\n  puts("A 429 status code was received; we should back off a bit.")\nrescue Turbopuffer::Errors::APIStatusError => e\n  puts("Another non-200-range status code was received")\n  puts(e.status)\nend\n```\n\nError codes are as follows:\n\n| Cause            | Error Type                 |\n| ---------------- | -------------------------- |\n| HTTP 400         | `BadRequestError`          |\n| HTTP 401         | `AuthenticationError`      |\n| HTTP 403         | `PermissionDeniedError`    |\n| HTTP 404         | `NotFoundError`            |\n| HTTP 409         | `ConflictError`            |\n| HTTP 422         | `UnprocessableEntityError` |\n| HTTP 429         | `RateLimitError`           |\n| HTTP >= 500      | `InternalServerError`      |\n| Other HTTP error | `APIStatusError`           |\n| Timeout          | `APITimeoutError`          |\n| Network error    | `APIConnectionError`       |\n\n### Retries\n\nCertain errors will be automatically retried 4 times by default, with a short exponential backoff.\n\nConnection errors (for example, due to a network connectivity problem), 408 Request Timeout, 409 Conflict, 429 Rate Limit, >=500 Internal errors, and timeouts will all be retried by default.\n\nYou can use the `max_retries` option to configure or disable this:\n\n```ruby\n# Configure the default for all requests:\nturbopuffer = Turbopuffer::Client.new(\n  max_retries: 0 # default is 4\n)\n\n# Or, configure per-request:\nturbopuffer.namespaces(prefix: "foo", request_options: {max_retries: 5})\n```\n\n### Timeouts\n\nBy default, requests will time out after 60 seconds. You can use the timeout option to configure or disable this:\n\n```ruby\n# Configure the default for all requests:\nturbopuffer = Turbopuffer::Client.new(\n  timeout: nil # default is 60\n)\n\n# Or, configure per-request:\nturbopuffer.namespaces(prefix: "foo", request_options: {timeout: 5})\n```\n\nOn timeout, `Turbopuffer::Errors::APITimeoutError` is raised.\n\nNote that requests that time out are retried by default.\n\n## Advanced concepts\n\n### BaseModel\n\nAll parameter and response objects inherit from `Turbopuffer::Internal::Type::BaseModel`, which provides several conveniences, including:\n\n1. All fields, including unknown ones, are accessible with `obj[:prop]` syntax, and can be destructured with `obj => {prop: prop}` or pattern-matching syntax.\n\n2. Structural equivalence for equality; if two API calls return the same values, comparing the responses with == will return true.\n\n3. Both instances and the classes themselves can be pretty-printed.\n\n4. Helpers such as `#to_h`, `#deep_to_h`, `#to_json`, and `#to_yaml`.\n\n### Making custom or undocumented requests\n\n#### Undocumented properties\n\nYou can send undocumented parameters to any endpoint, and read undocumented response properties, like so:\n\nNote: the `extra_` parameters of the same name overrides the documented parameters.\n\n```ruby\npage =\n  turbopuffer.namespaces(\n    prefix: "foo",\n    request_options: {\n      extra_query: {my_query_parameter: value},\n      extra_body: {my_body_parameter: value},\n      extra_headers: {"my-header": value}\n    }\n  )\n\nputs(page[:my_undocumented_property])\n```\n\n#### Undocumented request params\n\nIf you want to explicitly send an extra param, you can do so with the `extra_query`, `extra_body`, and `extra_headers` under the `request_options:` parameter when making a request, as seen in the examples above.\n\n#### Undocumented endpoints\n\nTo make requests to undocumented endpoints while retaining the benefit of auth, retries, and so on, you can make requests using `client.request`, like so:\n\n```ruby\nresponse = client.request(\n  method: :post,\n  path: \'/undocumented/endpoint\',\n  query: {"dog": "woof"},\n  headers: {"useful-header": "interesting-value"},\n  body: {"hello": "world"}\n)\n```\n\n### Concurrency & connection pooling\n\nThe `Turbopuffer::Client` instances are threadsafe, but are only are fork-safe when there are no in-flight HTTP requests.\n\nEach instance of `Turbopuffer::Client` has its own HTTP connection pool with a default size of 99. As such, we recommend instantiating the client once per application in most settings.\n\nWhen all available connections from the pool are checked out, requests wait for a new connection to become available, with queue time counting towards the request timeout.\n\nUnless otherwise specified, other classes in the SDK do not have locks protecting their underlying data structure.\n\n## Sorbet\n\nThis library provides comprehensive [RBI](https://sorbet.org/docs/rbi) definitions, and has no dependency on sorbet-runtime.\n\nYou can provide typesafe request parameters like so:\n\n```ruby\nturbopuffer.namespaces.write(\n  namespace: "products",\n  distance_metric: "cosine_distance",\n  upsert_rows: [Turbopuffer::Row.new(id: "2108ed60-6851-49a0-9016-8325434f3845", vector: [0.1, 0.2])]\n)\n```\n\nOr, equivalently:\n\n```ruby\n# Hashes work, but are not typesafe:\nturbopuffer.namespaces.write(\n  namespace: "products",\n  distance_metric: "cosine_distance",\n  upsert_rows: [{id: "2108ed60-6851-49a0-9016-8325434f3845", vector: [0.1, 0.2]}]\n)\n\n# You can also splat a full Params class:\nparams = Turbopuffer::NamespaceWriteParams.new(\n  namespace: "products",\n  distance_metric: "cosine_distance",\n  upsert_rows: [Turbopuffer::Row.new(id: "2108ed60-6851-49a0-9016-8325434f3845", vector: [0.1, 0.2])]\n)\nturbopuffer.namespaces.write(**params)\n```\n\n### Enums\n\nSince this library does not depend on `sorbet-runtime`, it cannot provide [`T::Enum`](https://sorbet.org/docs/tenum) instances. Instead, we provide "tagged symbols" instead, which is always a primitive at runtime:\n\n```ruby\n# :cosine_distance\nputs(Turbopuffer::DistanceMetric::COSINE_DISTANCE)\n\n# Revealed type: `T.all(Turbopuffer::DistanceMetric, Symbol)`\nT.reveal_type(Turbopuffer::DistanceMetric::COSINE_DISTANCE)\n```\n\nEnum parameters have a "relaxed" type, so you can either pass in enum constants or their literal value:\n\n```ruby\n# Using the enum constants preserves the tagged type information:\nturbopuffer.namespaces.explain_query(\n  distance_metric: Turbopuffer::DistanceMetric::COSINE_DISTANCE,\n  # …\n)\n\n# Literal values are also permissible:\nturbopuffer.namespaces.explain_query(\n  distance_metric: :cosine_distance,\n  # …\n)\n```\n\n## Versioning\n\nThis package follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions. As the library is in initial development and has a major version of `0`, APIs may change at any time.\n\nThis package considers improvements to the (non-runtime) `*.rbi` and `*.rbs` type definitions to be non-breaking changes.\n\n## Requirements\n\nRuby 3.2.0 or higher.\n\n## Contributing\n\nSee [the contributing documentation](https://github.com/turbopuffer/turbopuffer-ruby/tree/main/CONTRIBUTING.md).\n',
  },
  {
    language: 'java',
    content:
      '# Turbopuffer Java API Library\n\n<!-- x-release-please-start-version -->\n[![Maven Central](https://img.shields.io/maven-central/v/com.turbopuffer/turbopuffer-java)](https://central.sonatype.com/artifact/com.turbopuffer/turbopuffer-java/0.0.1)\n[![javadoc](https://javadoc.io/badge2/com.turbopuffer/turbopuffer-java/0.0.1/javadoc.svg)](https://javadoc.io/doc/com.turbopuffer/turbopuffer-java/0.0.1)\n<!-- x-release-please-end -->\n\nThe Turbopuffer Java SDK provides convenient access to the [Turbopuffer REST API](https://turbopuffer.com/docs/auth)   from applications written in Java.\n\n\n\nIt is generated with [Stainless](https://www.stainless.com/).\n\n## MCP Server\n\nUse the Turbopuffer MCP Server to enable AI assistants to interact with this API, allowing them to explore endpoints, make test requests, and use documentation to help integrate this SDK into your application.\n\n[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=%40turbopuffer%2Fturbopuffer-mcp&config=eyJuYW1lIjoiQHR1cmJvcHVmZmVyL3R1cmJvcHVmZmVyLW1jcCIsInRyYW5zcG9ydCI6Imh0dHAiLCJ1cmwiOiJodHRwczovL3R1cmJvcHVmZmVyLnN0bG1jcC5jb20iLCJoZWFkZXJzIjp7IngtdHVyYm9wdWZmZXItYXBpLWtleSI6InRwdWZfQTEuLi4ifX0)\n[![Install in VS Code](https://img.shields.io/badge/_-Add_to_VS_Code-blue?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHBhdGggZmlsbD0iI0VFRSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjM1IDM5Ljg4NGEyLjQ5MSAyLjQ5MSAwIDAgMS0xLjc4MS0uNzNMMTIuNyAyNC43OGwtMy40NiAyLjYyNC0zLjQwNiAyLjU4MmExLjY2NSAxLjY2NSAwIDAgMS0xLjA4Mi4zMzggMS42NjQgMS42NjQgMCAwIDEtMS4wNDYtLjQzMWwtMi4yLTJhMS42NjYgMS42NjYgMCAwIDEgMC0yLjQ2M0w3LjQ1OCAyMCA0LjY3IDE3LjQ1MyAxLjUwNyAxNC41N2ExLjY2NSAxLjY2NSAwIDAgMSAwLTIuNDYzbDIuMi0yYTEuNjY1IDEuNjY1IDAgMCAxIDIuMTMtLjA5N2w2Ljg2MyA1LjIwOUwyOC40NTIuODQ0YTIuNDg4IDIuNDg4IDAgMCAxIDEuODQxLS43MjljLjM1MS4wMDkuNjk5LjA5MSAxLjAxOS4yNDVsOC4yMzYgMy45NjFhMi41IDIuNSAwIDAgMSAxLjQxNSAyLjI1M3YuMDk5LS4wNDVWMzMuMzd2LS4wNDUuMDk1YTIuNTAxIDIuNTAxIDAgMCAxLTEuNDE2IDIuMjU3bC04LjIzNSAzLjk2MWEyLjQ5MiAyLjQ5MiAwIDAgMS0xLjA3Ny4yNDZabS43MTYtMjguOTQ3LTExLjk0OCA5LjA2MiAxMS45NTIgOS4wNjUtLjAwNC0xOC4xMjdaIi8+PC9zdmc+)](https://vscode.stainless.com/mcp/%7B%22name%22%3A%22%40turbopuffer%2Fturbopuffer-mcp%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fturbopuffer.stlmcp.com%22%2C%22headers%22%3A%7B%22x-turbopuffer-api-key%22%3A%22tpuf_A1...%22%7D%7D)\n\n> Note: You may need to set environment variables in your MCP client.\n\n<!-- x-release-please-start-version -->\n\nThe REST API documentation can be found on [turbopuffer.com](https://turbopuffer.com/docs/auth). Javadocs are available on [javadoc.io](https://javadoc.io/doc/com.turbopuffer/turbopuffer-java/0.0.1).\n\n<!-- x-release-please-end -->\n\n## Installation\n\n<!-- x-release-please-start-version -->\n\n### Gradle\n\n~~~kotlin\nimplementation("com.turbopuffer:turbopuffer-java:0.0.1")\n~~~\n\n### Maven\n\n~~~xml\n<dependency>\n  <groupId>com.turbopuffer</groupId>\n  <artifactId>turbopuffer-java</artifactId>\n  <version>0.0.1</version>\n</dependency>\n~~~\n\n<!-- x-release-please-end -->\n\n## Requirements\n\nThis library requires Java 8 or later.\n\n## Usage\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.DistanceMetric;\nimport com.turbopuffer.models.namespaces.NamespaceWriteParams;\nimport com.turbopuffer.models.namespaces.NamespaceWriteResponse;\nimport com.turbopuffer.models.namespaces.Row;\nimport java.util.List;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    // Configures using the `turbopuffer.apiKey`, `turbopuffer.region` and `turbopuffer.baseUrl` system properties\n    // Or configures using the `TURBOPUFFER_API_KEY`, `TURBOPUFFER_REGION` and `TURBOPUFFER_BASE_URL` environment variables\n    .fromEnv()\n    .defaultNamespace("My Default Namespace")\n    .build();\n\nNamespaceWriteParams params = NamespaceWriteParams.builder()\n    .distanceMetric(DistanceMetric.COSINE_DISTANCE)\n    .addUpsertRow(Row.builder()\n        .id("2108ed60-6851-49a0-9016-8325434f3845")\n        .vectorOfNumber(List.of(\n          0.1, 0.2\n        ))\n        .build())\n    .build();\nNamespaceWriteResponse response = client.namespaces().write(params);\n```\n\n## Client configuration\n\nConfigure the client using system properties or environment variables:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\n\n// Configures using the `turbopuffer.apiKey`, `turbopuffer.region` and `turbopuffer.baseUrl` system properties\n// Or configures using the `TURBOPUFFER_API_KEY`, `TURBOPUFFER_REGION` and `TURBOPUFFER_BASE_URL` environment variables\nTurbopufferClient client = TurbopufferOkHttpClient.fromEnv();\n```\n\nOr manually:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    .apiKey("tpuf_A1...")\n    .build();\n```\n\nOr using a combination of the two approaches:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    // Configures using the `turbopuffer.apiKey`, `turbopuffer.region` and `turbopuffer.baseUrl` system properties\n    // Or configures using the `TURBOPUFFER_API_KEY`, `TURBOPUFFER_REGION` and `TURBOPUFFER_BASE_URL` environment variables\n    .fromEnv()\n    .defaultNamespace("My Default Namespace")\n    .build();\n```\n\nSee this table for the available options:\n\n| Setter    | System property       | Environment variable   | Required | Default value                        |\n| --------- | --------------------- | ---------------------- | -------- | ------------------------------------ |\n| `apiKey`  | `turbopuffer.apiKey`  | `TURBOPUFFER_API_KEY`  | true     | -                                    |\n| `region`  | `turbopuffer.region`  | `TURBOPUFFER_REGION`   | false    | -                                    |\n| `baseUrl` | `turbopuffer.baseUrl` | `TURBOPUFFER_BASE_URL` | true     | `"https://{region}.turbopuffer.com"` |\n\nSystem properties take precedence over environment variables.\n\n> [!TIP]\n> Don\'t create more than one client in the same application. Each client has a connection pool and\n> thread pools, which are more efficient to share between requests.\n\n### Modifying configuration\n\nTo temporarily use a modified client configuration, while reusing the same connection and thread       pools, call `withOptions()` on any client or service:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\n\nTurbopufferClient clientWithOptions = client.withOptions(optionsBuilder -> {\n    optionsBuilder.baseUrl("https://example.com");\n    optionsBuilder.maxRetries(42);\n});\n```\n\nThe `withOptions()` method does not affect the original client or service.\n\n## Requests and responses\n\nTo send a request to the Turbopuffer API, build an instance of some `Params` class and pass it to the     corresponding client method. When the response is received, it will be deserialized into an instance of     a Java class.\n\nFor example, `client.namespaces().write(...)` should be called with an instance of `NamespaceWriteParams`, and it     will return an instance of `NamespaceWriteResponse`.\n\n## Immutability\n\nEach class in the SDK has an associated   [builder](https://blogs.oracle.com/javamagazine/post/exploring-joshua-blochs-builder-design-pattern-in-java)   or factory method for constructing it.\n\nEach class is [immutable](https://docs.oracle.com/javase/tutorial/essential/concurrency/immutable.html)   once constructed. If the class has an associated builder, then it has a `toBuilder()` method, which can   be used to convert it back to a builder for making a modified copy.\n\nBecause each class is immutable, builder modification will _never_ affect already built class instances.\n\n## Asynchronous execution\n\nThe default client is synchronous. To switch to asynchronous execution, call the `async()` method:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport com.turbopuffer.models.namespaces.DistanceMetric;\nimport com.turbopuffer.models.namespaces.NamespaceWriteParams;\nimport com.turbopuffer.models.namespaces.NamespaceWriteResponse;\nimport com.turbopuffer.models.namespaces.Row;\nimport java.util.List;\nimport java.util.concurrent.CompletableFuture;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    // Configures using the `turbopuffer.apiKey`, `turbopuffer.region` and `turbopuffer.baseUrl` system properties\n    // Or configures using the `TURBOPUFFER_API_KEY`, `TURBOPUFFER_REGION` and `TURBOPUFFER_BASE_URL` environment variables\n    .fromEnv()\n    .defaultNamespace("My Default Namespace")\n    .build();\n\nNamespaceWriteParams params = NamespaceWriteParams.builder()\n    .distanceMetric(DistanceMetric.COSINE_DISTANCE)\n    .addUpsertRow(Row.builder()\n        .id("2108ed60-6851-49a0-9016-8325434f3845")\n        .vectorOfNumber(List.of(\n          0.1, 0.2\n        ))\n        .build())\n    .build();\nCompletableFuture<NamespaceWriteResponse> response = client.async().namespaces().write(params);\n```\n\nOr create an asynchronous client from the beginning:\n\n```java\nimport com.turbopuffer.client.TurbopufferClientAsync;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClientAsync;\nimport com.turbopuffer.models.namespaces.DistanceMetric;\nimport com.turbopuffer.models.namespaces.NamespaceWriteParams;\nimport com.turbopuffer.models.namespaces.NamespaceWriteResponse;\nimport com.turbopuffer.models.namespaces.Row;\nimport java.util.List;\nimport java.util.concurrent.CompletableFuture;\n\nTurbopufferClientAsync client = TurbopufferOkHttpClientAsync.builder()\n    // Configures using the `turbopuffer.apiKey`, `turbopuffer.region` and `turbopuffer.baseUrl` system properties\n    // Or configures using the `TURBOPUFFER_API_KEY`, `TURBOPUFFER_REGION` and `TURBOPUFFER_BASE_URL` environment variables\n    .fromEnv()\n    .defaultNamespace("My Default Namespace")\n    .build();\n\nNamespaceWriteParams params = NamespaceWriteParams.builder()\n    .distanceMetric(DistanceMetric.COSINE_DISTANCE)\n    .addUpsertRow(Row.builder()\n        .id("2108ed60-6851-49a0-9016-8325434f3845")\n        .vectorOfNumber(List.of(\n          0.1, 0.2\n        ))\n        .build())\n    .build();\nCompletableFuture<NamespaceWriteResponse> response = client.namespaces().write(params);\n```\n\nThe asynchronous client supports the same options as the synchronous one, except most methods return `CompletableFuture`s.\n\n\n\n\n\n\n\n## Raw responses\n\nThe SDK defines methods that deserialize responses into instances of Java classes.       However, these methods don\'t provide access to the response headers, status code, or the raw response       body.\n\nTo access this data, prefix any HTTP method call on a client or service with `withRawResponse()`:\n\n```java\nimport com.turbopuffer.core.http.Headers;\nimport com.turbopuffer.core.http.HttpResponseFor;\nimport com.turbopuffer.models.ClientNamespacesPage;\nimport com.turbopuffer.models.ClientNamespacesParams;\n\nClientNamespacesParams params = ClientNamespacesParams.builder()\n    .prefix("foo")\n    .build();\nHttpResponseFor<ClientNamespacesPage> namespaces = client.withRawResponse().namespaces(params);\n\nint statusCode = namespaces.statusCode();\nHeaders headers = namespaces.headers();\n```\n\nYou can still deserialize the response into an instance of a Java class if needed:\n\n```java\nimport com.turbopuffer.models.ClientNamespacesPage;\n\nClientNamespacesPage parsedNamespaces = namespaces.parse();\n```\n\n## Error handling\n\nThe SDK throws custom unchecked exception types:\n\n- [`TurbopufferServiceException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/TurbopufferServiceException.kt): Base class for HTTP errors. See this table for which exception       subclass is thrown for each HTTP status code:\n\n  | Status | Exception                                          |\n  | ------ | -------------------------------------------------- |\n  | 400    | [`BadRequestException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/BadRequestException.kt)           |\n  | 401    | [`UnauthorizedException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/UnauthorizedException.kt)         |\n  | 403    | [`PermissionDeniedException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/PermissionDeniedException.kt)     |\n  | 404    | [`NotFoundException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/NotFoundException.kt)             |\n  | 422    | [`UnprocessableEntityException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/UnprocessableEntityException.kt)  |\n  | 429    | [`RateLimitException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/RateLimitException.kt)            |\n  | 5xx    | [`InternalServerException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/InternalServerException.kt)       |\n  | others | [`UnexpectedStatusCodeException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/UnexpectedStatusCodeException.kt) |\n\n- [`TurbopufferIoException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/TurbopufferIoException.kt): I/O networking errors.\n\n- [`TurbopufferRetryableException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/TurbopufferRetryableException.kt): Generic error indicating a failure that could be retried by the client.\n\n- [`TurbopufferInvalidDataException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/TurbopufferInvalidDataException.kt): Failure to interpret successfully parsed data. For example,       when accessing a property that\'s supposed to be required, but the API unexpectedly omitted it from the       response.\n\n- [`TurbopufferException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/TurbopufferException.kt): Base class for all exceptions. Most errors will result in one of the       previously mentioned ones, but completely generic errors may be thrown using the base class.\n\n## Pagination\n\nThe SDK defines methods that return a paginated lists of results. It provides convenient ways to access     the results either one page at a time or item-by-item across all pages.\n\n### Auto-pagination\n\nTo iterate through all results across all pages, use the `autoPager()` method, which automatically     fetches more pages as needed.\n\nWhen using the synchronous client, the method returns an [`Iterable`](https://docs.oracle.com/javase/8/docs/api/java/lang/Iterable.html)\n\n```java\nimport com.turbopuffer.models.ClientNamespacesPage;\nimport com.turbopuffer.models.NamespaceSummary;\n\nClientNamespacesPage page = client.namespaces();\n\n// Process as an Iterable\nfor (NamespaceSummary client : page.autoPager()) {\n    System.out.println(client);\n}\n\n// Process as a Stream\npage.autoPager()\n    .stream()\n    .limit(50)\n    .forEach(client -> System.out.println(client));\n```\n\nWhen using the asynchronous client, the method returns an [`AsyncStreamResponse`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/core/http/AsyncStreamResponse.kt):\n\n```java\nimport com.turbopuffer.core.http.AsyncStreamResponse;\nimport com.turbopuffer.models.ClientNamespacesPageAsync;\nimport com.turbopuffer.models.NamespaceSummary;\nimport java.util.Optional;\nimport java.util.concurrent.CompletableFuture;\n\nCompletableFuture<ClientNamespacesPageAsync> pageFuture = client.async().namespaces();\n\npageFuture.thenRun(page -> page.autoPager().subscribe(client -> {\n    System.out.println(client);\n}));\n\n// If you need to handle errors or completion of the stream\npageFuture.thenRun(page -> page.autoPager().subscribe(new AsyncStreamResponse.Handler<>() {\n    @Override\n    public void onNext(NamespaceSummary client) {\n        System.out.println(client);\n    }\n\n    @Override\n    public void onComplete(Optional<Throwable> error) {\n        if (error.isPresent()) {\n            System.out.println("Something went wrong!");\n            throw new RuntimeException(error.get());\n        } else {\n            System.out.println("No more!");\n        }\n    }\n}));\n\n// Or use futures\npageFuture.thenRun(page -> page.autoPager()\n    .subscribe(client -> {\n        System.out.println(client);\n    })\n    .onCompleteFuture()\n    .whenComplete((unused, error) -> {\n        if (error != null) {\n            System.out.println("Something went wrong!");\n            throw new RuntimeException(error);\n        } else {\n            System.out.println("No more!");\n        }\n    }));\n```\n\n### Manual pagination\n\nTo access individual page items and manually request the next page, use the `items()`,\n`hasNextPage()`, and `nextPage()` methods:\n\n```java\nimport com.turbopuffer.models.ClientNamespacesPage;\nimport com.turbopuffer.models.NamespaceSummary;\n\nClientNamespacesPage page = client.namespaces();\nwhile (true) {\n    for (NamespaceSummary client : page.items()) {\n        System.out.println(client);\n    }\n\n    if (!page.hasNextPage()) {\n        break;\n    }\n\n    page = page.nextPage();\n}\n```\n\n## Logging\n\nThe SDK uses the standard   [OkHttp logging interceptor](https://github.com/square/okhttp/tree/master/okhttp-logging-interceptor).\n\nEnable logging by setting the `TURBOPUFFER_LOG` environment variable to   `info`:\n\n```sh\nexport TURBOPUFFER_LOG=info\n```\n\nOr to `debug` for more verbose logging:\n\n```sh\nexport TURBOPUFFER_LOG=debug\n```\n\n## ProGuard and R8\n\nAlthough the SDK uses reflection, it is still usable with     [ProGuard](https://github.com/Guardsquare/proguard) and     [R8](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization) because     `turbopuffer-java-core` is published with a     [configuration file](turbopuffer-java-core/src/main/resources/META-INF/proguard/turbopuffer-java-core.pro) containing     [keep rules](https://www.guardsquare.com/manual/configuration/usage).\n\nProGuard and R8 should automatically detect and use the published rules, but you can also manually copy     the keep rules if necessary.\n\n\n\n\n\n## Jackson\n\nThe SDK depends on [Jackson](https://github.com/FasterXML/jackson) for JSON     serialization/deserialization. It is compatible with version 2.13.4 or higher,     but depends on version 2.18.2 by default.\n\nThe SDK throws an exception if it detects an incompatible Jackson version at runtime (e.g. if the     default version was overridden in your Maven or Gradle config).\n\nIf the SDK threw an exception, but you\'re _certain_ the version is compatible, then disable the version     check using the `checkJacksonVersionCompatibility` on [`TurbopufferOkHttpClient`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/TurbopufferOkHttpClient.kt) or     [`TurbopufferOkHttpClientAsync`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/TurbopufferOkHttpClientAsync.kt).\n\n> [!CAUTION]\n> We make no guarantee that the SDK works correctly when the Jackson version check is disabled.\n\nAlso note that there are bugs in older Jackson versions that can affect the SDK. We don\'t work around all     Jackson bugs ([example](https://github.com/FasterXML/jackson-databind/issues/3240)) and expect users to     upgrade Jackson for those instead.\n\n## Network options\n\n### Retries\n\nThe SDK automatically retries 4 times by default, with a short exponential backoff between requests.\n\nOnly the following error types are retried:\n- Connection errors (for example, due to a network connectivity problem)\n- 408 Request Timeout\n- 409 Conflict\n- 429 Rate Limit\n- 5xx Internal\n\nThe API may also explicitly instruct the SDK to retry or not retry a request.\n\nTo set a custom number of retries, configure the client using the `maxRetries` method:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    .fromEnv()\n    .maxRetries(4)\n    .build();\n```\n\n### Timeouts\n\nRequests time out after 1 minute by default.\n\nTo set a custom timeout, configure the method call using the `timeout` method:\n\n```java\nimport com.turbopuffer.models.ClientNamespacesPage;\n\nClientNamespacesPage namespaces = client.namespaces(RequestOptions.builder().timeout(Duration.ofSeconds(30)).build());\n```\n\nOr configure the default for all method calls at the client level:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport java.time.Duration;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    .fromEnv()\n    .timeout(Duration.ofSeconds(30))\n    .build();\n```\n\n### Proxies\n\nTo route requests through a proxy, configure the client using the `proxy` method:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport java.net.InetSocketAddress;\nimport java.net.Proxy;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    .fromEnv()\n    .proxy(new Proxy(\n      Proxy.Type.HTTP, new InetSocketAddress(\n        "https://example.com", 8080\n      )\n    ))\n    .build();\n```\n\n### Connection pooling\n\nTo customize the underlying OkHttp connection pool, configure the client using the   `maxIdleConnections` and `keepAliveDuration` methods:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\nimport java.time.Duration;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    .fromEnv()\n    // If `maxIdleConnections` is set, then `keepAliveDuration` must be set, and vice versa.\n    .maxIdleConnections(10)\n    .keepAliveDuration(Duration.ofMinutes(2))\n    .build();\n```\n\nIf both options are unset, OkHttp\'s default connection pool settings are used.\n\n### HTTPS\n\n> [!NOTE]\n> Most applications should not call these methods, and instead use the system defaults. The defaults include\n> special optimizations that can be lost if the implementations are modified.\n\nTo configure how HTTPS connections are secured, configure the client using the `sslSocketFactory`,   `trustManager`, and `hostnameVerifier` methods:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    .fromEnv()\n    // If `sslSocketFactory` is set, then `trustManager` must be set, and vice versa.\n    .sslSocketFactory(yourSSLSocketFactory)\n    .trustManager(yourTrustManager)\n    .hostnameVerifier(yourHostnameVerifier)\n    .build();\n```\n\n\n\n### Custom HTTP client\n\nThe SDK consists of three artifacts:\n- `turbopuffer-java-core`\n  - Contains core SDK logic\n  - Does not depend on [OkHttp](https://square.github.io/okhttp)\n  - Exposes [`TurbopufferClient`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClient.kt), [`TurbopufferClientAsync`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientAsync.kt),             [`TurbopufferClientImpl`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientImpl.kt), and [`TurbopufferClientAsyncImpl`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientAsyncImpl.kt), all of which can             work with any HTTP client\n- `turbopuffer-java-client-okhttp`\n  - Depends on [OkHttp](https://square.github.io/okhttp)\n  - Exposes [`TurbopufferOkHttpClient`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/TurbopufferOkHttpClient.kt) and [`TurbopufferOkHttpClientAsync`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/TurbopufferOkHttpClientAsync.kt), which             provide a way to construct [`TurbopufferClientImpl`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientImpl.kt) and             [`TurbopufferClientAsyncImpl`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientAsyncImpl.kt), respectively, using OkHttp\n- `turbopuffer-java`\n  - Depends on and exposes the APIs of both `turbopuffer-java-core` and `turbopuffer-java-client-okhttp`\n  - Does not have its own logic\n\nThis structure allows replacing the SDK\'s default HTTP client without pulling in unnecessary dependencies.\n\n#### Customized [`OkHttpClient`](https://square.github.io/okhttp/3.x/okhttp/okhttp3/OkHttpClient.html)\n\n> [!TIP]\n> Try the available [network options](#network-options) before replacing the default client.\n\nTo use a customized `OkHttpClient`:\n\n1. Replace your [`turbopuffer-java` dependency](#installation) with `turbopuffer-java-core`\n2. Copy `turbopuffer-java-client-okhttp`\'s [`OkHttpClient`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/OkHttpClient.kt) class into your code and        customize it\n3. Construct [`TurbopufferClientImpl`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientImpl.kt) or [`TurbopufferClientAsyncImpl`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientAsyncImpl.kt), similarly to        [`TurbopufferOkHttpClient`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/TurbopufferOkHttpClient.kt) or [`TurbopufferOkHttpClientAsync`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/TurbopufferOkHttpClientAsync.kt), using your        customized client\n\n### Completely custom HTTP client\n\nTo use a completely custom HTTP client:\n\n1. Replace your [`turbopuffer-java` dependency](#installation) with `turbopuffer-java-core`\n2. Write a class that implements the [`HttpClient`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/core/http/HttpClient.kt) interface\n3. Construct [`TurbopufferClientImpl`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientImpl.kt) or [`TurbopufferClientAsyncImpl`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/client/TurbopufferClientAsyncImpl.kt), similarly to        [`TurbopufferOkHttpClient`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/TurbopufferOkHttpClient.kt) or [`TurbopufferOkHttpClientAsync`](turbopuffer-java-client-okhttp/src/main/kotlin/com/turbopuffer/client/okhttp/TurbopufferOkHttpClientAsync.kt), using your new        client class\n\n## Undocumented API functionality\n\nThe SDK is typed for convenient usage of the documented API. However, it also supports working with undocumented or not yet supported parts of the API.\n\n### Parameters\n\nTo set undocumented parameters, call the `putAdditionalHeader`, `putAdditionalQueryParam`, or       `putAdditionalBodyProperty` methods on any `Params` class:\n\n```java\nimport com.turbopuffer.core.JsonValue;\nimport com.turbopuffer.models.namespaces.NamespaceWriteParams;\n\nNamespaceWriteParams params = NamespaceWriteParams.builder()\n    .putAdditionalHeader("Secret-Header", "42")\n    .putAdditionalQueryParam("secret_query_param", "42")\n    .putAdditionalBodyProperty("secretProperty", JsonValue.from("42"))\n    .build();\n```\n\nThese can be accessed on the built object later using the `_additionalHeaders()`,       `_additionalQueryParams()`, and `_additionalBodyProperties()` methods.\n\nTo set undocumented parameters on _nested_ headers, query params, or body classes, call the         `putAdditionalProperty` method on the nested class:\n\n```java\nimport com.turbopuffer.core.JsonValue;\nimport com.turbopuffer.models.namespaces.NamespaceWriteParams;\n\nNamespaceWriteParams params = NamespaceWriteParams.builder()\n    .encryption(NamespaceWriteParams.Encryption.builder()\n        .putAdditionalProperty("secretProperty", JsonValue.from("42"))\n        .build())\n    .build();\n```\n\nThese properties can be accessed on the nested built object later using the         `_additionalProperties()` method.\n\nTo set a documented parameter or property to an undocumented or not yet supported _value_, pass a       [`JsonValue`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/core/Values.kt) object to its setter:\n\n```java\nimport com.turbopuffer.core.JsonValue;\nimport com.turbopuffer.models.namespaces.NamespaceWriteParams;\nimport com.turbopuffer.models.namespaces.Row;\nimport java.util.List;\n\nNamespaceWriteParams params = NamespaceWriteParams.builder()\n    .namespace("products")\n    .distanceMetric(JsonValue.from(42))\n    .addUpsertRow(Row.builder()\n        .id("2108ed60-6851-49a0-9016-8325434f3845")\n        .vectorOfNumber(List.of(\n          0.1, 0.2\n        ))\n        .build())\n    .build();\n```\n\nThe most straightforward way to create a [`JsonValue`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/core/Values.kt) is using its       `from(...)` method:\n\n```java\nimport com.turbopuffer.core.JsonValue;\nimport java.util.List;\nimport java.util.Map;\n\n// Create primitive JSON values\nJsonValue nullValue = JsonValue.from(null);\nJsonValue booleanValue = JsonValue.from(true);\nJsonValue numberValue = JsonValue.from(42);\nJsonValue stringValue = JsonValue.from("Hello World!");\n\n// Create a JSON array value equivalent to `["Hello", "World"]`\nJsonValue arrayValue = JsonValue.from(List.of(\n  "Hello", "World"\n));\n\n// Create a JSON object value equivalent to `{ "a": 1, "b": 2 }`\nJsonValue objectValue = JsonValue.from(Map.of(\n  "a", 1,\n  "b", 2\n));\n\n// Create an arbitrarily nested JSON equivalent to:\n// {\n//   "a": [1, 2],\n//   "b": [3, 4]\n// }\nJsonValue complexValue = JsonValue.from(Map.of(\n  "a", List.of(\n    1, 2\n  ),\n  "b", List.of(\n    3, 4\n  )\n));\n```\n\nNormally a `Builder` class\'s `build` method will throw         [`IllegalStateException`](https://docs.oracle.com/javase/8/docs/api/java/lang/IllegalStateException.html)         if any required parameter or property is unset.\n\nTo forcibly omit a required parameter or property, pass [`JsonMissing`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/core/Values.kt):\n\n```java\nimport com.turbopuffer.core.JsonMissing;\nimport com.turbopuffer.models.namespaces.NamespaceWriteParams;\n\nNamespaceWriteParams params = NamespaceWriteParams.builder()\n    .namespace(JsonMissing.of())\n    .build();\n```\n\n### Response properties\n\nTo access undocumented response properties, call the `_additionalProperties()` method:\n\n```java\nimport com.turbopuffer.core.JsonValue;\nimport java.util.Map;\n\nMap<String, JsonValue> additionalProperties = client.namespaces().write(params)._additionalProperties();\nJsonValue secretPropertyValue = additionalProperties.get("secretProperty");\n\nString result = secretPropertyValue.accept(new JsonValue.Visitor<>() {\n    @Override\n    public String visitNull() {\n        return "It\'s null!";\n    }\n\n    @Override\n    public String visitBoolean(boolean value) {\n        return "It\'s a boolean!";\n    }\n\n    @Override\n    public String visitNumber(Number value) {\n        return "It\'s a number!";\n    }\n\n    // Other methods include `visitMissing`, `visitString`, `visitArray`, and `visitObject`\n    // The default implementation of each unimplemented method delegates to `visitDefault`, which throws by default, but can also be overridden\n});\n```\n\nTo access a property\'s raw JSON value, which may be undocumented, call its `_` prefixed method:\n\n```java\nimport com.turbopuffer.core.JsonField;\nimport com.turbopuffer.models.namespaces.BranchFromNamespaceParams;\nimport java.util.Optional;\n\nJsonField<BranchFromNamespaceParams> branchFromNamespace = client.namespaces().write(params)._branchFromNamespace();\n\nif (branchFromNamespace.isMissing()) {\n  // The property is absent from the JSON response\n} else if (branchFromNamespace.isNull()) {\n  // The property was set to literal null\n} else {\n  // Check if value was provided as a string\n  // Other methods include `asNumber()`, `asBoolean()`, etc.\n  Optional<String> jsonString = branchFromNamespace.asString();\n\n  // Try to deserialize into a custom type\n  MyClass myObject = branchFromNamespace.asUnknown().orElseThrow().convert(MyClass.class);\n}\n```\n\n### Response validation\n\nIn rare cases, the API may return a response that doesn\'t match the expected type. For example, the SDK     may expect a property to contain a `String`, but the API could return something else.\n\nBy default, the SDK will not throw an exception in this case. It will throw     [`TurbopufferInvalidDataException`](turbopuffer-java-core/src/main/kotlin/com/turbopuffer/errors/TurbopufferInvalidDataException.kt) only if you directly access the property.\n\nIf you would prefer to check that the response is completely well-typed upfront, then either call     `validate()`:\n\n```java\nimport com.turbopuffer.models.namespaces.NamespaceWriteResponse;\n\nNamespaceWriteResponse response = client.namespaces().write(params).validate();\n```\n\nOr configure the method call to validate the response using the `responseValidation` method:\n\n```java\nimport com.turbopuffer.models.namespaces.NamespaceWriteResponse;\n\nNamespaceWriteResponse response = client.namespaces().write(RequestOptions.builder().responseValidation(true).build());\n```\n\nOr configure the default for all method calls at the client level:\n\n```java\nimport com.turbopuffer.client.TurbopufferClient;\nimport com.turbopuffer.client.okhttp.TurbopufferOkHttpClient;\n\nTurbopufferClient client = TurbopufferOkHttpClient.builder()\n    .fromEnv()\n    .responseValidation(true)\n    .build();\n```\n\n## FAQ\n\n### Why don\'t you use plain `enum` classes?\n\nJava `enum` classes are not trivially   [forwards compatible](https://www.stainless.com/blog/making-java-enums-forwards-compatible). Using them in   the SDK could cause runtime exceptions if the API is updated to respond with a new enum value.\n\n### Why do you represent fields using `JsonField<T>` instead of just plain `T`?\n\nUsing `JsonField<T>` enables a few features:\n\n- Allowing usage of [undocumented API functionality](#undocumented-api-functionality)\n- Lazily [validating the API response against the expected shape](#response-validation)\n- Representing absent vs explicitly null values\n\n### Why don\'t you use [`data` classes](https://kotlinlang.org/docs/data-classes.html)?\n\nIt is not [backwards compatible to add new fields to a data class](https://kotlinlang.org/docs/api-guidelines-backward-compatibility.html#avoid-using-data-classes-in-your-api)   and we don\'t want to introduce a breaking change every time we add a field to a class.\n\n### Why don\'t you use checked exceptions?\n\nChecked exceptions are widely considered a mistake in the Java programming language. In fact, they were   omitted from Kotlin for this reason.\n\nChecked exceptions:\n\n- Are verbose to handle\n- Encourage error handling at the wrong level of abstraction, where nothing can be done about the error\n- Are tedious to propagate due to the [function coloring problem](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function)\n- Don\'t play well with lambdas (also due to the function coloring problem)\n\n## Semantic versioning\n\nThis package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:\n\n1. Changes to library internals which are technically public but not intended or documented for external use. _(Please open a GitHub issue to let us know if you are relying on such internals.)_\n2. Changes that we do not expect to impact the vast majority of users in practice.\n\nWe take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.\n\nWe are keen for your feedback; please open an [issue](https://www.github.com/turbopuffer/turbopuffer-java/issues) with questions, bugs, or suggestions.\n',
  },
];

const INDEX_OPTIONS = {
  fields: [
    'name',
    'endpoint',
    'summary',
    'description',
    'qualified',
    'stainlessPath',
    'content',
    'sectionContext',
  ],
  storeFields: ['kind', '_original'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.1,
    boost: {
      name: 5,
      stainlessPath: 3,
      endpoint: 3,
      qualified: 3,
      summary: 2,
      content: 1,
      description: 1,
    } as Record<string, number>,
  },
};

/**
 * Self-contained local search engine backed by MiniSearch.
 * Method data is embedded at SDK build time; prose documents
 * can be loaded from an optional docs directory at runtime.
 */
export class LocalDocsSearch {
  private methodIndex: MiniSearch<MiniSearchDocument>;
  private proseIndex: MiniSearch<MiniSearchDocument>;

  private constructor() {
    this.methodIndex = new MiniSearch<MiniSearchDocument>(INDEX_OPTIONS);
    this.proseIndex = new MiniSearch<MiniSearchDocument>(INDEX_OPTIONS);
  }

  static async create(opts?: { docsDir?: string }): Promise<LocalDocsSearch> {
    const instance = new LocalDocsSearch();
    instance.indexMethods(EMBEDDED_METHODS);
    for (const readme of EMBEDDED_READMES) {
      instance.indexProse(readme.content, `readme:${readme.language}`);
    }
    if (opts?.docsDir) {
      await instance.loadDocsDirectory(opts.docsDir);
    }
    return instance;
  }

  search(props: {
    query: string;
    language?: string;
    detail?: string;
    maxResults?: number;
    maxLength?: number;
  }): SearchResult {
    const { query, language = 'typescript', detail = 'default', maxResults = 5, maxLength = 100_000 } = props;

    const useMarkdown = detail === 'verbose' || detail === 'high';

    // Search both indices and merge results by score.
    // Filter prose hits so language-tagged content (READMEs and docs with
    // frontmatter) only matches the requested language.
    const methodHits = this.methodIndex
      .search(query)
      .map((hit) => ({ ...hit, _kind: 'http_method' as const }));
    const proseHits = this.proseIndex
      .search(query)
      .filter((hit) => {
        const source = ((hit as Record<string, unknown>)['_original'] as ProseChunk | undefined)?.source;
        if (!source) return true;
        // Check for language-tagged sources: "readme:<lang>" or "lang:<lang>:<filename>"
        let taggedLang: string | undefined;
        if (source.startsWith('readme:')) taggedLang = source.slice('readme:'.length);
        else if (source.startsWith('lang:')) taggedLang = source.split(':')[1];
        if (!taggedLang) return true;
        return taggedLang === language || (language === 'javascript' && taggedLang === 'typescript');
      })
      .map((hit) => ({ ...hit, _kind: 'prose' as const }));
    const merged = [...methodHits, ...proseHits].sort((a, b) => b.score - a.score);
    const top = merged.slice(0, maxResults);

    const fullResults: (string | Record<string, unknown>)[] = [];

    for (const hit of top) {
      const original = (hit as Record<string, unknown>)['_original'];
      if (hit._kind === 'http_method') {
        const m = original as MethodEntry;
        if (useMarkdown && m.markdown) {
          fullResults.push(m.markdown);
        } else {
          // Use per-language data when available, falling back to the
          // top-level fields (which are TypeScript-specific in the
          // legacy codepath).
          const langData = m.perLanguage?.[language];
          fullResults.push({
            method: langData?.method ?? m.qualified,
            summary: m.summary,
            description: m.description,
            endpoint: `${m.httpMethod.toUpperCase()} ${m.endpoint}`,
            ...(langData?.example ? { example: langData.example } : {}),
            ...(m.params ? { params: m.params } : {}),
            ...(m.response ? { response: m.response } : {}),
          });
        }
      } else {
        const c = original as ProseChunk;
        fullResults.push({
          content: c.content,
          ...(c.source ? { source: c.source } : {}),
        });
      }
    }

    let totalLength = 0;
    const results: (string | Record<string, unknown>)[] = [];
    for (const result of fullResults) {
      const len = typeof result === 'string' ? result.length : JSON.stringify(result).length;
      totalLength += len;
      if (totalLength > maxLength) break;
      results.push(result);
    }

    if (results.length < fullResults.length) {
      results.unshift(`Truncated; showing ${results.length} of ${fullResults.length} results.`);
    }

    return { results };
  }

  private indexMethods(methods: MethodEntry[]): void {
    const docs: MiniSearchDocument[] = methods.map((m, i) => ({
      id: `method-${i}`,
      kind: 'http_method' as const,
      name: m.name,
      endpoint: m.endpoint,
      summary: m.summary,
      description: m.description,
      qualified: m.qualified,
      stainlessPath: m.stainlessPath,
      _original: m as unknown as Record<string, unknown>,
    }));
    if (docs.length > 0) {
      this.methodIndex.addAll(docs);
    }
  }

  private async loadDocsDirectory(docsDir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(docsDir, { withFileTypes: true });
    } catch (err) {
      getLogger().warn({ err, docsDir }, 'Could not read docs directory');
      return;
    }

    const files = entries
      .filter((e) => e.isFile())
      .filter((e) => e.name.endsWith('.md') || e.name.endsWith('.markdown') || e.name.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(docsDir, file.name);
        const content = await fs.readFile(filePath, 'utf-8');

        if (file.name.endsWith('.json')) {
          const texts = extractTexts(JSON.parse(content));
          if (texts.length > 0) {
            this.indexProse(texts.join('\n\n'), file.name);
          }
        } else {
          // Parse optional YAML frontmatter for language tagging.
          // Files with a "language" field in frontmatter will only
          // surface in searches for that language.
          //
          // Example:
          //   ---
          //   language: python
          //   ---
          //   # Error handling in Python
          //   ...
          const frontmatter = parseFrontmatter(content);
          const source = frontmatter.language ? `lang:${frontmatter.language}:${file.name}` : file.name;
          this.indexProse(content, source);
        }
      } catch (err) {
        getLogger().warn({ err, file: file.name }, 'Failed to index docs file');
      }
    }
  }

  private indexProse(markdown: string, source: string): void {
    const chunks = chunkMarkdown(markdown);
    const baseId = this.proseIndex.documentCount;

    const docs: MiniSearchDocument[] = chunks.map((chunk, i) => ({
      id: `prose-${baseId + i}`,
      kind: 'prose' as const,
      content: chunk.content,
      ...(chunk.sectionContext != null ? { sectionContext: chunk.sectionContext } : {}),
      _original: { ...chunk, source } as unknown as Record<string, unknown>,
    }));

    if (docs.length > 0) {
      this.proseIndex.addAll(docs);
    }
  }
}

/** Lightweight markdown chunker — splits on headers, chunks by word count. */
function chunkMarkdown(markdown: string): { content: string; tag: string; sectionContext?: string }[] {
  // Strip YAML frontmatter
  const stripped = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const lines = stripped.split('\n');

  const chunks: { content: string; tag: string; sectionContext?: string }[] = [];
  const headers: string[] = [];
  let current: string[] = [];

  const flush = () => {
    const text = current.join('\n').trim();
    if (!text) return;
    const sectionContext = headers.length > 0 ? headers.join(' > ') : undefined;
    // Split into ~200-word chunks
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i += 200) {
      const slice = words.slice(i, i + 200).join(' ');
      if (slice) {
        chunks.push({ content: slice, tag: 'p', ...(sectionContext != null ? { sectionContext } : {}) });
      }
    }
    current = [];
  };

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      flush();
      const level = headerMatch[1]!.length;
      const text = headerMatch[2]!.trim();
      while (headers.length >= level) headers.pop();
      headers.push(text);
    } else {
      current.push(line);
    }
  }
  flush();

  return chunks;
}

/** Recursively extracts string values from a JSON structure. */
function extractTexts(data: unknown, depth = 0): string[] {
  if (depth > 10) return [];
  if (typeof data === 'string') return data.trim() ? [data] : [];
  if (Array.isArray(data)) return data.flatMap((item) => extractTexts(item, depth + 1));
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).flatMap((v) => extractTexts(v, depth + 1));
  }
  return [];
}

/** Parses YAML frontmatter from a markdown string, extracting the language field if present. */
function parseFrontmatter(markdown: string): { language?: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const body = match[1] ?? '';
  const langMatch = body.match(/^language:\s*(.+)$/m);
  return langMatch ? { language: langMatch[1]!.trim() } : {};
}
