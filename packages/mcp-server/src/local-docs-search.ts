// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import MiniSearch from 'minisearch';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getLogger } from './logger';

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
      "{ approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: { sse: boolean; } | { cmek: { key_name: string; }; }; index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }; schema: object; updated_at: string; }",
    markdown:
      "## metadata\n\n`client.namespaces.metadata(namespace: string): { approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: object | object; index: object | object; schema: object; updated_at: string; }`\n\n**get** `/v1/namespaces/{namespace}/metadata`\n\nGet metadata about a namespace.\n\n### Parameters\n\n- `namespace: string`\n\n### Returns\n\n- `{ approx_logical_bytes: number; approx_row_count: number; created_at: string; encryption: { sse: boolean; } | { cmek: { key_name: string; }; }; index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }; schema: object; updated_at: string; }`\n  Metadata about a namespace.\n\n  - `approx_logical_bytes: number`\n  - `approx_row_count: number`\n  - `created_at: string`\n  - `encryption: { sse: boolean; } | { cmek: { key_name: string; }; }`\n  - `index: { status: 'up-to-date'; } | { status: 'updating'; unindexed_bytes: number; }`\n  - `schema: object`\n  - `updated_at: string`\n\n### Example\n\n```typescript\nimport Turbopuffer from '@turbopuffer/turbopuffer';\n\nconst client = new Turbopuffer();\n\nconst namespaceMetadata = await client.namespaces.metadata({ namespace: 'namespace' });\n\nconsole.log(namespaceMetadata);\n```",
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
    fuzzy: 0.2,
    boost: {
      name: 3,
      endpoint: 2,
      summary: 2,
      qualified: 2,
      content: 1,
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
    if (opts?.docsDir) {
      await instance.loadDocsDirectory(opts.docsDir);
    }
    return instance;
  }

  // Note: Language is accepted for interface consistency with remote search, but currently has no
  // effect since this local search only supports TypeScript docs.
  search(props: {
    query: string;
    language?: string;
    detail?: string;
    maxResults?: number;
    maxLength?: number;
  }): SearchResult {
    const { query, detail = 'default', maxResults = 5, maxLength = 100_000 } = props;

    const useMarkdown = detail === 'verbose' || detail === 'high';

    // Search both indices and merge results by score
    const methodHits = this.methodIndex
      .search(query)
      .map((hit) => ({ ...hit, _kind: 'http_method' as const }));
    const proseHits = this.proseIndex.search(query).map((hit) => ({ ...hit, _kind: 'prose' as const }));
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
          fullResults.push({
            method: m.qualified,
            summary: m.summary,
            description: m.description,
            endpoint: `${m.httpMethod.toUpperCase()} ${m.endpoint}`,
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
          this.indexProse(content, file.name);
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
