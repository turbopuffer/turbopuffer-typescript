// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Export, type ExportParams } from '../core/pagination';

// Document pagination.
export type ListNamespacesResponsesExport = Export<ListNamespacesResponse>;

/**
 * A summary of a namespace.
 */
export interface NamespaceSummary {
  /**
   * The namespace ID.
   */
  id: string;
}

export interface ListNamespacesResponse {
  /**
   * The list of namespaces.
   */
  namespaces?: Array<NamespaceSummary>;

  /**
   * The cursor to use to retrieve the next page of results.
   */
  next_cursor?: string;
}

export interface ListNamespacesParams extends ExportParams {
  /**
   * Limit the number of results per page.
   */
  page_size?: number;

  /**
   * Retrieve only the namespaces that match the prefix.
   */
  prefix?: string;
}

export declare namespace TopLevel {
  export {
    type NamespaceSummary as NamespaceSummary,
    type ListNamespacesResponse as ListNamespacesResponse,
    type ListNamespacesResponsesExport as ListNamespacesResponsesExport,
    type ListNamespacesParams as ListNamespacesParams,
  };
}
