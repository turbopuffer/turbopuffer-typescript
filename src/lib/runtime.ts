type Runtime = 'bun' | 'deno' | 'cloudflare-workers' | 'browser' | 'node' | undefined;

function detectRuntime(): Runtime {
  // @ts-expect-error can be ignored
  if (typeof globalThis.Bun !== 'undefined') return 'bun';

  // @ts-expect-error can be ignored
  if (typeof globalThis.Deno !== 'undefined') return 'deno';

  const userAgent = globalThis.navigator?.userAgent;

  // Try navigator.userAgent:
  // https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent.
  // Fallback: look for presence of non-standard globals specific to the cloudflare runtime:
  // https://community.cloudflare.com/t/how-to-detect-the-cloudflare-worker-runtime/293715/2.
  if (
    userAgent ?
      userAgent === 'Cloudflare-Workers'
      // @ts-expect-error can be ignored
    : typeof WebSocketPair !== 'undefined'
  )
    return 'cloudflare-workers';

  if (typeof window !== 'undefined') return 'browser';

  if (userAgent ? userAgent.startsWith('Node.js') : process.release?.name === 'node') return 'node';

  return undefined;
}

const detectedRuntime = detectRuntime();
export const isRuntimeFullyNodeCompatible = detectedRuntime === 'node' || detectedRuntime === 'deno';
