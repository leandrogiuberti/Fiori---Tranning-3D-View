/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import type SearchModel from "sap/esh/search/ui/SearchModel";
import { ISearchTermHandler } from "./ISearchTermHandler";
import ErrorHandler from "../error/ErrorHandler";

// @ts-expect-error - module will be available during transpilation. Types are not available yet.
import TCodeNavigation from "sap/ushell_abap/components/TCodeNavigation";
import i18n from "../i18n";

interface TCodeNavigationErrorResultType extends Error {
    successful: boolean;
    messagecode:
        | "NAV_SUCCESS"
        /** Indicates that no matching inbound was found for the transaction code or a mandatory parameter is missing. */
        | "NO_INBOUND_FOUND"
        | "UNKNOWN_ERROR";
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
    private readonly errorHandler = ErrorHandler.getInstance();

    constructor(private readonly searchModel: SearchModel) {}

    private handleTCodeError(error: TCodeNavigationErrorResultType): void {
        let label = i18n.getText("error.TCodeUnknownError.message");
        if (error.messagecode && error.messagecode === "NO_INBOUND_FOUND") {
            label = i18n.getText("error.TCodeNotFound.message");
        }
        this.searchModel.setProperty("/suggestions", [
            {
                label,
            },
        ]);
        // if (error.messagecode && error.messagecode === "NO_INBOUND_FOUND") {
        //     return new TCodeNotFoundError(error);
        // } else {
        //     return new TCodeUnknownError(error);
        // }
    }

    handleSearchTerm(searchTerm: string): boolean {
        let searchTermWasHandled = false;

        if ((window.sap as any).cf) {
            // no transaction handling in cFLP/multiprovider
            return searchTermWasHandled;
        }

        let explace;
        // replace current app:
        if (searchTerm.toLowerCase().indexOf("/n") === 0) {
            explace = false;
        }
        // open in new window (explace):
        if (searchTerm.toLowerCase().indexOf("/o") === 0) {
            explace = true;
        }
        if (typeof explace !== "undefined") {
            this.searchModel.setProperty("/suggestions", []);
            searchTermWasHandled = true;
            const slicedSearchTerm = searchTerm.slice(2);
            (TCodeNavigation as TCodeNavigationType)
                .navigateByTCode(slicedSearchTerm, explace)
                .then(() => {
                    this.searchModel.setSearchBoxTerm("", false);
                })
                .catch((error: TCodeNavigationErrorResultType) => {
                    this.handleTCodeError(error);
                });
        }

        // if (searchTermWasHandled) {
        //     // transaction is started, reset search input state:
        //     searchInput.destroySuggestionRows();
        //     searchInput.setValue("");
        //     // if (!SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()) {
        //     //     collapseSearch();
        //     // }
        // }

        return searchTermWasHandled;
    }
}
