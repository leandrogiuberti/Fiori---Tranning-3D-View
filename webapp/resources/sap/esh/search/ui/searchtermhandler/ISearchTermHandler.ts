/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export interface ISearchTermHandler {
    /**
     * Handles the search term input by the user. This interface can be implemented
     * in case, some custom handling of search terms is required, like transactions for example.
     * @param searchTerm The search term entered by the user.
     * @returns boolean indicating whether the search term was handled.
     */
    handleSearchTerm: (searchTerm: string) => boolean;
}
