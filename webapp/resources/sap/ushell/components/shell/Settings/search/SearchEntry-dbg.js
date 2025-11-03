// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Lib",
    "sap/ui/core/mvc/XMLView",
    "sap/ushell/resources"
], (
    Log,
    Library,
    XMLView,
    resources
) => {
    "use strict";

    let searchPrefsModelPromise = null;

    function getSearchPrefsModel () {
        if (searchPrefsModelPromise) {
            return searchPrefsModelPromise;
        }
        searchPrefsModelPromise = Library.load("sap.esh.search.ui").then(() => {
            return new Promise((resolve, reject) => {
                sap.ui.require([
                    "sap/esh/search/ui/userpref/SearchPrefsModel",
                    "sap/esh/search/ui/SearchShellHelperAndModuleLoader"
                ], (SearchPrefsModel, SearchShellHelperAndModuleLoader) => {
                    resolve(new SearchPrefsModel());
                });
            });
        });
        return searchPrefsModelPromise;
    }

    function getEntry () {
        return getSearchPrefsModel().then((model) => {
            let oViewInstance;
            const oEntry = {
                id: "search",
                entryHelpID: "search",
                title: resources.i18n.getText("searchSetting"),
                valueResult: null,
                contentResult: null,
                icon: "sap-icon://search",
                isActive: model.isSearchPrefsActive.bind(model),
                valueArgument: function () {
                    return model.isMultiProvider().then((isMultiProvider) => {
                        if (isMultiProvider) {
                            return {
                                value: 1,
                                displayText: ""
                            };
                        }
                        return model.isPersonalizedSearchActive().then((status) => {
                            return {
                                value: 1,
                                displayText: status ? resources.i18n.getText("sp.persSearchOn") : resources.i18n.getText("sp.persSearchOff")
                            };
                        });
                    });
                },
                contentFunc: function () {
                    return model
                        .asyncInit()
                        .then(() => {
                            return XMLView.create({
                                id: "searchView",
                                viewName:
                                    "sap.ushell.components.shell.Settings.search.Search"
                            });
                        })
                        .then((oView) => {
                            oView.setModel(model);
                            oViewInstance = oView;
                            return oView;
                        });
                },
                onSave: function () {
                    if (oViewInstance) {
                        return oViewInstance.getController().onSave();
                    }
                    Log.warning(
                        "Save operation for search settings was not executed, because the search view was not initialized"
                    );
                    return Promise.resolve();
                },
                onCancel: function () {
                    if (oViewInstance) {
                        oViewInstance.getController().onCancel();
                        return;
                    }
                    Log.warning(
                        "Cancel operation for search settings was not executed, because the search view was not initialized"
                    );
                },
                provideEmptyWrapper: false
            };
            return oEntry;
        });
    }

    return {
        getEntry: getEntry
    };
});
