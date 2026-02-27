// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  SetLevelRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ClientOptions } from '@turbopuffer/turbopuffer';
import Turbopuffer from '@turbopuffer/turbopuffer';
import { codeTool } from './code-tool';
import docsSearchTool from './docs-search-tool';
import { McpOptions } from './options';
import { HandlerFunction, McpTool } from './types';

export { McpOptions } from './options';
export { ClientOptions } from '@turbopuffer/turbopuffer';

export const newMcpServer = () =>
  new McpServer(
    {
      name: 'turbopuffer_turbopuffer_api',
      version: '1.18.0',
    },
    {
      capabilities: {
        tools: {},
        logging: {},
      },
      instructions:
        "Runs JavaScript code to interact with the Turbopuffer API.\n\nDefine an async function named \"run\" that takes a single parameter of an initialized SDK client.\n\n## Listing namespaces\n\n```\nasync function run(client) {\n  for await (const ns of client.namespaces()) {\n    console.log(ns.id);\n  }\n}\n```\n\n## Checking a namespace's schema\n\n```\nasync function run(client) {\n  const ns = client.namespace('your-namespace');\n  const schema = await ns.schema();\n  console.log(JSON.stringify(schema, null, 2));\n}\n```\n\n## Querying (BM25 full-text search)\n\n```\nasync function run(client) {\n  const ns = client.namespace('your-namespace');\n  const response = await ns.query({\n    top_k: 10,\n    rank_by: ['text', 'BM25', 'your search query'],\n    include_attributes: ['summary', 'text']\n  });\n\n  if (response.rows) {\n    for (const row of response.rows) {\n      console.log(\"ID:\", row.id);\n      const summary = row.summary as string;\n      console.log(\"Summary:\", summary ? summary.substring(0, 800) : \"N/A\");\n    }\n  }\n}\n```\n\n## Writing documents\n\n```\nasync function run(client) {\n  const ns = client.namespace('your-namespace');\n  const response = await ns.write({\n    distance_metric: 'cosine_distance',\n    upsert_rows: [{ id: '1', vector: [0.1, 0.2] }],\n  });\n  console.log(response.rows_affected);\n}\n```\n\n## Deleting a namespace\n\n```\nasync function run(client) {\n  const ns = client.namespace('your-namespace');\n  await ns.deleteAll();\n}\n```\n\n## Important\n\n- If you don't know what namespaces exist, list them first with `client.namespaces()`\n- Before querying, check the namespace schema with `ns.schema()` to see available attributes\n- Only use attributes that exist in the schema for `include_attributes`\n- Always use client.namespace('name') to get a namespace object first\n- Then call methods on it: .query(), .write(), .deleteAll(), .schema()\n- Always truncate output with substring() to avoid token limits\n- Cast attributes before using string methods: `row.field as string`\n- Do not add try-catch; the tool handles errors\n- Variables do not persist between calls\n",
    },
  );

// Create server instance
export const server = newMcpServer();

/**
 * Initializes the provided MCP Server with the given tools and handlers.
 * If not provided, the default client, tools and handlers will be used.
 */
export function initMcpServer(params: {
  server: Server | McpServer;
  clientOptions?: ClientOptions;
  mcpOptions?: McpOptions;
}) {
  const server = params.server instanceof McpServer ? params.server.server : params.server;

  const logAtLevel =
    (level: 'debug' | 'info' | 'warning' | 'error') =>
    (message: string, ...rest: unknown[]) => {
      void server.sendLoggingMessage({
        level,
        data: { message, rest },
      });
    };
  const logger = {
    debug: logAtLevel('debug'),
    info: logAtLevel('info'),
    warn: logAtLevel('warning'),
    error: logAtLevel('error'),
  };

  let client = new Turbopuffer({
    ...{ defaultNamespace: readEnv('TURBOPUFFER_DEFAULT_NAMESPACE') },
    logger,
    ...params.clientOptions,
    defaultHeaders: {
      ...params.clientOptions?.defaultHeaders,
      'X-Stainless-MCP': 'true',
    },
  });

  const providedTools = selectTools(params.mcpOptions);
  const toolMap = Object.fromEntries(providedTools.map((mcpTool) => [mcpTool.tool.name, mcpTool]));

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: providedTools.map((mcpTool) => mcpTool.tool),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const mcpTool = toolMap[name];
    if (!mcpTool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return executeHandler(mcpTool.handler, client, args);
  });

  server.setRequestHandler(SetLevelRequestSchema, async (request) => {
    const { level } = request.params;
    switch (level) {
      case 'debug':
        client = client.withOptions({ logLevel: 'debug' });
        break;
      case 'info':
        client = client.withOptions({ logLevel: 'info' });
        break;
      case 'notice':
      case 'warning':
        client = client.withOptions({ logLevel: 'warn' });
        break;
      case 'error':
        client = client.withOptions({ logLevel: 'error' });
        break;
      default:
        client = client.withOptions({ logLevel: 'off' });
        break;
    }
    return {};
  });
}

/**
 * Selects the tools to include in the MCP Server based on the provided options.
 */
export function selectTools(options?: McpOptions): McpTool[] {
  const includedTools = [codeTool()];
  if (options?.includeDocsTools ?? true) {
    includedTools.push(docsSearchTool);
  }
  return includedTools;
}

/**
 * Runs the provided handler with the given client and arguments.
 */
export async function executeHandler(
  handler: HandlerFunction,
  client: Turbopuffer,
  args: Record<string, unknown> | undefined,
) {
  return await handler(client, args || {});
}

export const readEnv = (env: string): string | undefined => {
  if (typeof (globalThis as any).process !== 'undefined') {
    return (globalThis as any).process.env?.[env]?.trim();
  } else if (typeof (globalThis as any).Deno !== 'undefined') {
    return (globalThis as any).Deno.env?.get?.(env)?.trim();
  }
  return;
};

export const readEnvOrError = (env: string): string => {
  let envValue = readEnv(env);
  if (envValue === undefined) {
    throw new Error(`Environment variable ${env} is not set`);
  }
  return envValue;
};

export const requireValue = <T>(value: T | undefined, description: string): T => {
  if (value === undefined) {
    throw new Error(`Missing required value: ${description}`);
  }
  return value;
};
