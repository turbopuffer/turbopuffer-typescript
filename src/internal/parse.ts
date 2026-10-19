// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { FinalRequestOptions } from './request-options';
import type { RequestObservation } from './observer';
import { type Turbopuffer } from '../client';
import { formatRequestDetails, loggerFor } from './utils/log';

export type APIResponseProps = {
  response: Response;
  options: FinalRequestOptions;
  controller: AbortController;
  requestLogID: string;
  retryOfRequestLogID: string | undefined;
  startTime: number;
  observation?: RequestObservation | undefined;
};

export async function defaultParseResponse<T>(client: Turbopuffer, props: APIResponseProps): Promise<T> {
  const { response, requestLogID, retryOfRequestLogID, startTime, observation } = props;
  const body = await (async () => {
    // fetch refuses to read the body when the status code is 204.
    if (response.status === 204) {
      return null as T;
    }

    if (props.options.__binaryResponse) {
      return response as unknown as T;
    }

    const contentType = response.headers.get('content-type');
    const mediaType = contentType?.split(';')[0]?.trim();
    const isJSON = mediaType?.includes('application/json') || mediaType?.endsWith('+json');
    if (isJSON) {
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        // if there is no content we can't do anything
        return undefined as T;
      }

      // Read before parsing, so that reading the body isn't timed as parsing it.
      const text = await response.text();
      observation?.startParse();
      return JSON.parse(text) as T;
    }

    const text = await response.text();
    observation?.startParse();
    return text as unknown as T;
  })().catch((err) => {
    observation?.parseFailed(response, err);
    throw err;
  });
  // A response whose body the caller reads itself doesn't finish.
  if (body !== (response as unknown)) {
    observation?.finish(response, body);
  }
  loggerFor(client).debug(
    `[${requestLogID}] response parsed`,
    formatRequestDetails({
      retryOfRequestLogID,
      url: response.url,
      status: response.status,
      body,
      durationMs: Date.now() - startTime,
    }),
  );
  return body;
}
