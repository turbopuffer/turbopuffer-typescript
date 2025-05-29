// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import {
  ListNamespaces,
  type ListNamespacesParams as PaginationListNamespacesParams,
} from '../core/pagination';

// Namespace pagination.
export type NamespaceSummariesListNamespaces = ListNamespaces<NamespaceSummary>;

/**
 * A summary of a namespace.
 */
export interface NamespaceSummary {
  /**
   * The namespace ID.
   */
  id: string;
}

export interface ListNamespacesParams extends PaginationListNamespacesParams {
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
    type NamespaceSummariesListNamespaces as NamespaceSummariesListNamespaces,
    type ListNamespacesParams as ListNamespacesParams,
  };
}
