/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../error/ErrorHandler", "sap/ushell_abap/components/TCodeNavigation", "../i18n"], function (__ErrorHandler, TCodeNavigation, __i18n) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const ErrorHandler = _interopRequireDefault(__ErrorHandler); // @ts-expect-error - module will be available during transpilation. Types are not available yet.
  const i18n = _interopRequireDefault(__i18n);
  class TransactionsHandler {
    errorHandler = ErrorHandler.getInstance();
    constructor(searchModel) {
      this.searchModel = searchModel;
    }
    handleTCodeError(error) {
      let label = i18n.getText("error.TCodeUnknownError.message");
      if (error.messagecode && error.messagecode === "NO_INBOUND_FOUND") {
        label = i18n.getText("error.TCodeNotFound.message");
      }
      this.searchModel.setProperty("/suggestions", [{
        label
      }]);
      // if (error.messagecode && error.messagecode === "NO_INBOUND_FOUND") {
      //     return new TCodeNotFoundError(error);
      // } else {
      //     return new TCodeUnknownError(error);
      // }
    }
    handleSearchTerm(searchTerm) {
      let searchTermWasHandled = false;
      if (window.sap.cf) {
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
        TCodeNavigation.navigateByTCode(slicedSearchTerm, explace).then(() => {
          this.searchModel.setSearchBoxTerm("", false);
        }).catch(error => {
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
  return TransactionsHandler;
});
//# sourceMappingURL=TransactionsHandler-dbg.js.map
