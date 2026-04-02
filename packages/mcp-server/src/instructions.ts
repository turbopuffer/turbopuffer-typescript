// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import fs from 'fs/promises';
import { readEnv } from './util';
import { getLogger } from './logger';

const INSTRUCTIONS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface InstructionsCacheEntry {
  fetchedInstructions: string;
  fetchedAt: number;
}

const instructionsCache = new Map<string, InstructionsCacheEntry>();

export async function getInstructions({
  stainlessApiKey,
  customInstructionsPath,
}: {
  stainlessApiKey?: string | undefined;
  customInstructionsPath?: string | undefined;
}): Promise<string> {
  const now = Date.now();
  const cacheKey = customInstructionsPath ?? stainlessApiKey ?? '';
  const cached = instructionsCache.get(cacheKey);

  if (cached && now - cached.fetchedAt <= INSTRUCTIONS_CACHE_TTL_MS) {
    return cached.fetchedInstructions;
  }

  // Evict stale entries so the cache doesn't grow unboundedly.
  for (const [key, entry] of instructionsCache) {
    if (now - entry.fetchedAt > INSTRUCTIONS_CACHE_TTL_MS) {
      instructionsCache.delete(key);
    }
  }

  let fetchedInstructions: string;

  if (customInstructionsPath) {
    fetchedInstructions = await fetchLatestInstructionsFromFile(customInstructionsPath);
  } else {
    fetchedInstructions = await fetchLatestInstructionsFromApi(stainlessApiKey);
  }

  instructionsCache.set(cacheKey, { fetchedInstructions, fetchedAt: now });
  return fetchedInstructions;
}

async function fetchLatestInstructionsFromFile(path: string): Promise<string> {
  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    getLogger().error({ error, path }, 'Error fetching instructions from file');
    throw error;
  }
}

async function fetchLatestInstructionsFromApi(stainlessApiKey: string | undefined): Promise<string> {
  // Setting the stainless API key is optional, but may be required
  // to authenticate requests to the Stainless API.
  const response = await fetch(
    readEnv('CODE_MODE_INSTRUCTIONS_URL') ?? 'https://api.stainless.com/api/ai/instructions/turbopuffer',
    {
      method: 'GET',
      headers: { ...(stainlessApiKey && { Authorization: stainlessApiKey }) },
    },
  );

  let instructions: string | undefined;
  if (!response.ok) {
    getLogger().warn(
      'Warning: failed to retrieve MCP server instructions. Proceeding with default instructions...',
    );

    instructions =
      '\n  This is the turbopuffer MCP server.\n\n  Available tools:\n  - search_docs: Search SDK documentation to find the right methods and parameters.\n  - execute: Run TypeScript code against a pre-authenticated SDK client. Define an async run(client) function.\n\n  Workflow:\n  - If unsure about the API, call search_docs first.\n  - Write complete solutions in a single execute call when possible. For large datasets, use API filters to narrow results or paginate within a single execute block.\n  - If execute returns an error, read the error and fix your code rather than retrying the same approach.\n  - Variables do not persist between execute calls. Return or log all data you need.\n  - Individual HTTP requests to the API have a 30-second timeout. If a request times out, try a smaller query or add filters.\n  - Code execution has a total timeout of approximately 5 minutes. If your code times out, simplify it or break it into smaller steps.\n  ';
  }

  instructions ??= ((await response.json()) as { instructions: string }).instructions;

  instructions +=
    "\nRuns JavaScript code to interact with the Turbopuffer API.\n\nDefine an async function named \"run\" that takes a single parameter of an initialized SDK client.\n\n## Listing namespaces\n\n```\nasync function run(client) {\n  for await (const ns of client.namespaces()) {\n    console.log(ns.id);\n  }\n}\n```\n\n## Checking a namespace's schema\n\n```\nasync function run(client) {\n  const ns = client.namespace('your-namespace');\n  const schema = await ns.schema();\n  console.log(JSON.stringify(schema, null, 2));\n}\n```\n\n## Querying (BM25 full-text search)\n\n```\nasync function run(client) {\n  const ns = client.namespace('your-namespace');\n  const response = await ns.query({\n    top_k: 10,\n    rank_by: ['text', 'BM25', 'your search query'],\n    include_attributes: ['summary', 'text']\n  });\n\n  if (response.rows) {\n    for (const row of response.rows) {\n      console.log(\"ID:\", row.id);\n      const summary = row.summary as string;\n      console.log(\"Summary:\", summary ? summary.substring(0, 800) : \"N/A\");\n    }\n  }\n}\n```\n\n## Writing documents\n\n```\nasync function run(client) {\n  const ns = client.namespace('your-namespace');\n  const response = await ns.write({\n    distance_metric: 'cosine_distance',\n    upsert_rows: [{ id: '1', vector: [0.1, 0.2] }],\n  });\n  console.log(response.rows_affected);\n}\n```\n\n## Deleting a namespace\n\n```\nasync function run(client) {\n  const ns = client.namespace('your-namespace');\n  await ns.deleteAll();\n}\n```\n\n## Important\n\n- If you don't know what namespaces exist, list them first with `client.namespaces()`\n- Before querying, check the namespace schema with `ns.schema()` to see available attributes\n- Only use attributes that exist in the schema for `include_attributes`\n- Always use client.namespace('name') to get a namespace object first\n- Then call methods on it: .query(), .write(), .deleteAll(), .schema()\n- Always truncate output with substring() to avoid token limits\n- Cast attributes before using string methods: `row.field as string`\n- Do not add try-catch; the tool handles errors\n- Variables do not persist between calls\n";
  return instructions;
}
