import NodeHTTPClient from "./httpClient/node";
import DefaultHTTPClient from "./httpClient/default";
import { isNode } from "./helpers";

/**
 * This a helper function that returns a class for making fetch requests
 * against the API.
 *
 * @param baseUrl The base URL of the API endpoint.
 * @param apiKey The API key to use for authentication.
 *
 * @returns An HTTPClient to make requests against the API.
 */
export const createHTTPClient = (
  baseUrl: string,
  apiKey: string,
  connectTimeout: number,
  idleTimeout: number,
  warmConnections: number,
  compression: boolean,
) => {
  if (isNode)
    return new NodeHTTPClient(
      baseUrl,
      apiKey,
      connectTimeout,
      idleTimeout,
      warmConnections,
      compression,
    );

  return new DefaultHTTPClient(
    baseUrl,
    apiKey,
    warmConnections,
    compression,
  );
}
