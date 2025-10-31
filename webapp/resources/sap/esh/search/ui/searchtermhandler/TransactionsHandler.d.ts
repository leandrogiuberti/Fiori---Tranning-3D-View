declare module "sap/esh/search/ui/searchtermhandler/TransactionsHandler" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import type SearchModel from "sap/esh/search/ui/SearchModel";
    import { ISearchTermHandler } from "sap/esh/search/ui/searchtermhandler/ISearchTermHandler";
    interface TCodeNavigationErrorResultType extends Error {
        successful: boolean;
        messagecode: "NAV_SUCCESS"
        /** Indicates that no matching inbound was found for the transaction code or a mandatory parameter is missing. */
         | "NO_INBOUND_FOUND" | "UNKNOWN_ERROR";
    }
    interface TCodeNavigationType {
        /**
         *
         * @param sTcode sTCode The transaction code to search for, can also be an App ID.
         * @param bExplace Indicates whether to open the navigation in a new tab.
         * @returns A promise that resolves to a boolean indicating the success of the navigation.
         */
        navigateByTCode(sTcode: string, bExplace: boolean): Promise<boolean>;
    }
    export default class TransactionsHandler implements ISearchTermHandler {
        private readonly searchModel;
        private readonly errorHandler;
        constructor(searchModel: SearchModel);
        private handleTCodeError;
        handleSearchTerm(searchTerm: string): boolean;
    }
}
//# sourceMappingURL=TransactionsHandler.d.ts.map