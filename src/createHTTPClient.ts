import { isRuntimeFullyNodeCompatible } from "./helpers";

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
  if (isRuntimeFullyNodeCompatible) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    const NodeHTTPClient = require("./httpClient/node").default;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return new NodeHTTPClient(
      baseUrl,
      apiKey,
      connectTimeout,
      idleTimeout,
      warmConnections,
      compression,
    );
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    const DefaultHTTPClient = require("./httpClient/default").default;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return new DefaultHTTPClient(baseUrl, apiKey, warmConnections, compression);
  }
};
