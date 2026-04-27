// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { NamespacePage, type NamespacePageParams } from '../core/pagination';

// Namespace pagination.
export type NamespaceSummariesNamespacePage = NamespacePage<NamespaceSummary>;

/**
 * A summary of a namespace.
 */
export interface NamespaceSummary {
  /**
   * The namespace ID.
   */
  id: string;
}

export interface NamespacesParams extends NamespacePageParams {
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
    type NamespaceSummariesNamespacePage as NamespaceSummariesNamespacePage,
    type NamespacesParams as NamespacesParams,
  };
}
