// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { McpOptions } from './options';

export type SdkMethod = {
  clientCallName: string;
  fullyQualifiedName: string;
  httpMethod?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'query';
  httpPath?: string;
};

export const sdkMethods: SdkMethod[] = [
  {
    clientCallName: 'client.namespaces',
    fullyQualifiedName: 'namespaces',
    httpMethod: 'get',
    httpPath: '/v1/namespaces',
  },
  {
    clientCallName: 'client.namespaces.deleteAll',
    fullyQualifiedName: 'namespaces.deleteAll',
    httpMethod: 'delete',
    httpPath: '/v2/namespaces/{namespace}',
  },
  {
    clientCallName: 'client.namespaces.explainQuery',
    fullyQualifiedName: 'namespaces.explainQuery',
    httpMethod: 'post',
    httpPath: '/v2/namespaces/{namespace}/explain_query',
  },
  {
    clientCallName: 'client.namespaces.hintCacheWarm',
    fullyQualifiedName: 'namespaces.hintCacheWarm',
    httpMethod: 'get',
    httpPath: '/v1/namespaces/{namespace}/hint_cache_warm',
  },
  {
    clientCallName: 'client.namespaces.metadata',
    fullyQualifiedName: 'namespaces.metadata',
    httpMethod: 'get',
    httpPath: '/v1/namespaces/{namespace}/metadata',
  },
  {
    clientCallName: 'client.namespaces.multiQuery',
    fullyQualifiedName: 'namespaces.multiQuery',
    httpMethod: 'post',
    httpPath: '/v2/namespaces/{namespace}/query?stainless_overload=multiQuery',
  },
  {
    clientCallName: 'client.namespaces.query',
    fullyQualifiedName: 'namespaces.query',
    httpMethod: 'post',
    httpPath: '/v2/namespaces/{namespace}/query',
  },
  {
    clientCallName: 'client.namespaces.recall',
    fullyQualifiedName: 'namespaces.recall',
    httpMethod: 'post',
    httpPath: '/v1/namespaces/{namespace}/_debug/recall',
  },
  {
    clientCallName: 'client.namespaces.schema',
    fullyQualifiedName: 'namespaces.schema',
    httpMethod: 'get',
    httpPath: '/v1/namespaces/{namespace}/schema',
  },
  {
    clientCallName: 'client.namespaces.updateSchema',
    fullyQualifiedName: 'namespaces.updateSchema',
    httpMethod: 'post',
    httpPath: '/v1/namespaces/{namespace}/schema',
  },
  {
    clientCallName: 'client.namespaces.write',
    fullyQualifiedName: 'namespaces.write',
    httpMethod: 'post',
    httpPath: '/v2/namespaces/{namespace}',
  },
];

function allowedMethodsForCodeTool(options: McpOptions | undefined): SdkMethod[] | undefined {
  if (!options) {
    return undefined;
  }

  let allowedMethods: SdkMethod[];

  if (options.codeAllowHttpGets || options.codeAllowedMethods) {
    // Start with nothing allowed and then add into it from options
    let allowedMethodsSet = new Set<SdkMethod>();

    if (options.codeAllowHttpGets) {
      // Add all methods that map to an HTTP GET
      sdkMethods
        .filter((method) => method.httpMethod === 'get')
        .forEach((method) => allowedMethodsSet.add(method));
    }

    if (options.codeAllowedMethods) {
      // Add all methods that match any of the allowed regexps
      const allowedRegexps = options.codeAllowedMethods.map((pattern) => {
        try {
          return new RegExp(pattern);
        } catch (e) {
          throw new Error(
            `Invalid regex pattern for allowed method: "${pattern}": ${e instanceof Error ? e.message : e}`,
          );
        }
      });

      sdkMethods
        .filter((method) => allowedRegexps.some((regexp) => regexp.test(method.fullyQualifiedName)))
        .forEach((method) => allowedMethodsSet.add(method));
    }

    allowedMethods = Array.from(allowedMethodsSet);
  } else {
    // Start with everything allowed
    allowedMethods = [...sdkMethods];
  }

  if (options.codeBlockedMethods) {
    // Filter down based on blocked regexps
    const blockedRegexps = options.codeBlockedMethods.map((pattern) => {
      try {
        return new RegExp(pattern);
      } catch (e) {
        throw new Error(
          `Invalid regex pattern for blocked method: "${pattern}": ${e instanceof Error ? e.message : e}`,
        );
      }
    });

    allowedMethods = allowedMethods.filter(
      (method) => !blockedRegexps.some((regexp) => regexp.test(method.fullyQualifiedName)),
    );
  }

  return allowedMethods;
}

export function blockedMethodsForCodeTool(options: McpOptions | undefined): SdkMethod[] | undefined {
  const allowedMethods = allowedMethodsForCodeTool(options);
  if (!allowedMethods) {
    return undefined;
  }

  const allowedSet = new Set(allowedMethods.map((method) => method.fullyQualifiedName));

  // Return any methods that are not explicitly allowed
  return sdkMethods.filter((method) => !allowedSet.has(method.fullyQualifiedName));
}
