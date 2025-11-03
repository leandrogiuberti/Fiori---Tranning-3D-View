// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * <p>This module is about the ushell support plugin </p>
 *
 * Adds a plugin to the SAPUI5 Diagnostics tool to show the startup configuration (window["sap-ushell-config"]) of the
 * Fiori launchpad in a tree table separated by IconTabFilters for the first level properties of the configuration object.
 * Also it provides a search for last level properties.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/Lib",
    "sap/ui/core/RenderManager",
    "sap/ui/core/support/Plugin",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/m/IconTabBar",
    "sap/m/IconTabFilter",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/MessageStrip",
    "sap/m/FlexBox",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/SearchField",
    "sap/m/MessageBox",
    "sap/base/util/isEmptyObject"
], (
    Element,
    Library,
    RenderManager,
    Plugin,
    JSONModel,
    Button,
    IconTabBar,
    IconTabFilter,
    Label,
    Text,
    MessageStrip,
    FlexBox,
    ResourceModel,
    SearchField,
    MessageBox,
    isEmptyObject
) => {
    "use strict";

    const sPluginTitle = "SAP Fiori launchpad configuration";
    // get i18n files and create model
    const oI18nModel = new ResourceModel({
        async: true,
        bundleName: "sap/ushell/support/plugins/flpConfig/i18n/FlpConfigurationPlugin"
    });

    let oResourceBundle;
    oI18nModel.getResourceBundle().then((oResolvedResourceBundle) => {
        oResourceBundle = oResolvedResourceBundle;
    });

    const FlpConfigurationPlugin = Plugin.extend("sap.ushell.support.plugins.flpConfig.FlpConfigurationPlugin", {
        constructor: function (oSupportStub) {
            // base constructor
            Plugin.apply(this, ["sapUiFlpConfigurationPlugin", sPluginTitle, oSupportStub]);

            this._oSupportStub = oSupportStub;
            if (this.runsAsToolPlugin()) {
                // tool window events
                this._aEventIds = [`${this.getId()}ReceiveData`];
            } else {
                // application window events
                this._aEventIds = [`${this.getId()}RequestData`];
            }
        }
    });

    // enable plugin in the tool window
    FlpConfigurationPlugin.prototype.isToolPlugin = function () {
        return true;
    };

    // enable plugin in app window for communication
    FlpConfigurationPlugin.prototype.isAppPlugin = function () {
        return true;
    };

    FlpConfigurationPlugin.prototype.init = function (/* oSupportStub */) {
        // call super init function to register events
        Plugin.prototype.init.apply(this, arguments);

        if (this.runsAsToolPlugin()) {
            // delay call to get FlpConfig and build UI because of asynchronous event handling
            // event to receive data is not accessible immediately
            setTimeout(() => {
                this.requestData();
            }, 500);

            // place plugin in diagnostics tool
            const oRM = new RenderManager().getInterface();
            oRM.openStart("div", this.getId());
            oRM.openEnd();
            oRM.close("div");
            oRM.flush(this.dom());
            oRM.destroy();
        } else {
            // Here, we have access to the FLP config because the plugins runs in the application window
            // which we only use for getting data, important for the UI is the tool window instance
        }
    };

    FlpConfigurationPlugin.prototype.exit = function (/* oSupportStub */) {
        Plugin.prototype.exit.apply(this, arguments);
    };

    // trigger RequestData event in application window
    FlpConfigurationPlugin.prototype.requestData = function () {
        this._oSupportStub.sendEvent(`${this.getId()}RequestData`, {
            eventData: { data: {} }
        });
    };

    // application window handles RequestData event
    FlpConfigurationPlugin.prototype.onsapUiFlpConfigurationPluginRequestData = function (oEvent) {
        // trigger ReceiveData event in tool window
        const oPrepareForSending = {};
        this.prepareForSending(window["sap-ushell-config"], oPrepareForSending);
        this._oSupportStub.sendEvent(`${this.getId()}ReceiveData`, {
            eventData: { data: oPrepareForSending }
        });
    };

    // tool window handles ReceiveData event
    FlpConfigurationPlugin.prototype.onsapUiFlpConfigurationPluginReceiveData = async function (oEvent) {
        this.flpConfig = oEvent.getParameter("eventData").data;
        // now build UI
        await Library.load("sap.ui.table");
        sap.ui.require([
            "sap/ui/table/TreeTable",
            "sap/ui/table/Column",
            "sap/ui/table/library"
        ], (
            TreeTable,
            Column,
            tableLibrary
        ) => {
            this.getFlpConfigurationPluginUI(null, TreeTable, Column, tableLibrary.SelectionMode);
        });
    };

    // get hierarchy level of properties for one specific level one element
    function _getHierarchyDepth (oCurrentObject, sLevelOneProp) {
        let iHierarchyDepth = 0;
        if (oCurrentObject[sLevelOneProp]) {
            oCurrentObject[sLevelOneProp].forEach((oProperty) => {
                const iTmpHierarchyDepth = _getHierarchyDepth(oProperty, sLevelOneProp);
                if (iTmpHierarchyDepth > iHierarchyDepth) {
                    iHierarchyDepth = iTmpHierarchyDepth;
                }
            });
        }
        return iHierarchyDepth + 1;
    }

    /**
     * handles press event for expand button, two steps:
     *   1) get hierarchy depth
     *   2) expand table to retrieved level
     */
    function _onPressExpand (/* oEvent */) {
        let iHierarchyCount = 0;
        const sSelectedKey = Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar").getSelectedKey();
        const oFlpConfig = Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar").getModel().getData();

        if (Array.isArray(oFlpConfig[sSelectedKey])) {
            oFlpConfig[sSelectedKey].forEach((sProperty, iPropIndex) => {
                const iHierarchyCountTmp = _getHierarchyDepth(oFlpConfig[sSelectedKey][iPropIndex], sSelectedKey);
                if (iHierarchyCount < iHierarchyCountTmp) {
                    iHierarchyCount = iHierarchyCountTmp;
                }
            });
            if (iHierarchyCount > 0) {
                // minus 1 because last hierarchy level does not need to expanded but counts because its a hierarchy level as well
                Element.getElementById(`sap-ui-support-flpConfigurationPlugin-TreeTable${sSelectedKey}`).expandToLevel(iHierarchyCount - 1);
            } else {
                MessageBox.error(new Label({
                    text: oResourceBundle.getText("MISSING_HIERARCHY_LEVEL")
                }));
            }
        }
    }

    // handles press event for collapse button
    function _onPressCollapse (/* oEvent */) {
        const sSelectedKey = Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar").getSelectedKey();
        Element.getElementById(`sap-ui-support-flpConfigurationPlugin-TreeTable${sSelectedKey}`).collapseAll();
    }

    // get properties under a specific hierarchy level one property that fit to a search value
    // depth first search
    function _searchForProperties (oCurrentObject, sProperty, sPath, aPathsFound, sSearchQuery) {
        oCurrentObject.forEach((element, index) => {
            // if there are deeper levels go into
            if (element[sProperty]) {
                // build path with current array index and level one property
                sPath = `${sPath}.${index}.${sProperty}`;
                sPath = _searchForProperties(element[sProperty], sProperty, sPath, aPathsFound, sSearchQuery);
                // check if property name contains search query
            } else if (element.property.indexOf(sSearchQuery) > -1) {
                sPath = `${sPath}.${index}`;
                aPathsFound.push(sPath);
                // path must be reduced to one level higher path so that path stays in its level e.g.
                // renderers.0.renderers.0 -> renderers.0.renderers
                sPath = sPath.substring(0, sPath.lastIndexOf("."));
            }
        });
        // see path reducing above, go to previous level
        sPath = sPath.substring(0, sPath.lastIndexOf("."));
        if (isNaN(parseInt(sPath.substr(sPath.lastIndexOf(".") + 1), 10))) {
            return sPath;
        }
        return sPath.substring(0, sPath.lastIndexOf("."));
    }

    // get value of a property of a specific path
    function _getValueForPath (oFlpConfig, aPath) {
        for (let i = 0; i < aPath.length; i++) {
            if (oFlpConfig) {
                oFlpConfig = oFlpConfig[aPath[i]];
            }
        }
        return oFlpConfig;
    }

    // set value of a property of a specific path
    function _setValueFromPath (oFlpConfigSearch, sValue, sPath) {
        const aPath = sPath.split(",");
        for (let i = 0; i < aPath.length - 1; i++) {
            oFlpConfigSearch = oFlpConfigSearch[aPath[i]];
        }
        oFlpConfigSearch[aPath[aPath.length - 1]] = sValue;
    }

    // get number of properties under a specific hierarchy level one property
    // works like recursive depth first search
    function _getPropertyCount (oCurrentObject, sLevelOneProp, iPropertyCounter) {
        if (Array.isArray(oCurrentObject)) {
            oCurrentObject.forEach((oCurrentProp) => {
                if (oCurrentProp[sLevelOneProp]) {
                    iPropertyCounter = _getPropertyCount(oCurrentProp[sLevelOneProp], sLevelOneProp, iPropertyCounter);
                } else {
                    iPropertyCounter += 1;
                }
            });
            return iPropertyCounter;
        } return undefined;
    }

    // build an object containing arrays and objects from a path
    function _createObjectFromPath (oFlpConfigSearch, aPath, oValue, sLevelOneProp, iPathLength) {
        if (aPath.length === 1) {
            oFlpConfigSearch[aPath[0]] = oValue;
        } else {
            const aPathCurrent = aPath.shift();
            oFlpConfigSearch[aPathCurrent] =
                _createObjectFromPath(typeof oFlpConfigSearch[aPathCurrent] === "undefined" ? {} : oFlpConfigSearch[aPathCurrent],
                    aPath, oValue, sLevelOneProp, iPathLength);
        }
        // in case the level has properties "{levelOneProp}", "value", "property" delete "value" because it is not the last level
        if (oFlpConfigSearch[sLevelOneProp] && oFlpConfigSearch.property && oFlpConfigSearch.value) {
            delete oFlpConfigSearch.value;
            oFlpConfigSearch.property = "";
        }
        return oFlpConfigSearch;
    }

    // handles search event for input field
    FlpConfigurationPlugin.prototype.onPressSearchNewModel = function (oEvent) {
        let aPathsForOneProperty;
        let aPropertyIntTmp;
        let aPropertyIntCopy;
        let aAllProperties;
        let aProperty;
        let aPropertyInt;
        let oPropertyTmp;
        let sSelectedKey;
        let oValueForPath;
        let aMissingValues = [];
        const oTabBarFilter = {};
        let sPath = "";
        const oFlpConfigSearch = {};
        const oLevelOneHierarchyPaths = {};
        let oFlpConfig = Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar").getModel("Full");
        const sSearchQuery = oEvent.getParameter("query");

        // check if already searched, if so the normal model only contains the filtered data, in any case get the full config
        if (!oFlpConfig) {
            oFlpConfig = Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar").getModel().getData();
        } else {
            oFlpConfig = oFlpConfig.getData();
        }

        // get all IconTabFilter
        Object.keys(oFlpConfig).forEach((sLevelOneProp) => {
            oTabBarFilter[sLevelOneProp] = 0;
        });

        if (sSearchQuery) {
            // search in full config and get paths
            for (const sLevelOneProp in oFlpConfig) {
                sPath = sLevelOneProp;
                aPathsForOneProperty = [];
                _searchForProperties(oFlpConfig[sLevelOneProp], sLevelOneProp, sPath, aPathsForOneProperty, sSearchQuery);
                oLevelOneHierarchyPaths[sLevelOneProp] = aPathsForOneProperty;
            }

            Object.keys(oLevelOneHierarchyPaths).forEach((sLevelOneProp) => {
                aAllProperties = oLevelOneHierarchyPaths[sLevelOneProp];

                for (let i = 0; i < aAllProperties.length; i++) {
                    aProperty = aAllProperties[i].split(".");
                    aPropertyInt = [];
                    // change numbers from string to integer for creating object with arrays
                    for (let j = 0; j < aProperty.length; j++) {
                        if (!isNaN(parseInt(aProperty[j], 10))) {
                            aPropertyInt.push(parseInt(aProperty[j], 10));
                        } else {
                            aPropertyInt.push(aProperty[j]);
                        }
                    }
                    // for every path build object and set value property "property"
                    for (let k = 0; k < aPropertyInt.length; k += 2) {
                        oPropertyTmp = { property: "" };
                        oPropertyTmp[aPropertyInt[0]] = [];
                        if (isNaN(parseInt(aPropertyInt[k], 10))) {
                            aPropertyIntTmp = aPropertyInt.slice(0, k + 1);
                            // only create object property or part if it does not exist already
                            if (!_getValueForPath(oFlpConfigSearch, aPropertyIntTmp) &&
                                typeof _getValueForPath(oFlpConfigSearch, aPropertyInt.slice(0, aPropertyInt.length - 2)) !== "object") {
                                _createObjectFromPath(oFlpConfigSearch, aPropertyIntTmp, [oPropertyTmp], aPropertyInt[0], aPropertyIntTmp.length);
                            }
                            oValueForPath = _getValueForPath(oFlpConfig, aPropertyInt.slice(0, k + 2));
                            // set value for property if it is not the last level
                            if (oValueForPath && _getValueForPath(oFlpConfigSearch, aPropertyInt.slice(0, k + 2))) {
                                _setValueFromPath(oFlpConfigSearch, oValueForPath.property,
                                    `${aPropertyInt.slice(0, k + 2).toString()},property`);
                            } else if (k !== aPropertyInt.length - 2) {
                                // save all paths for which a value could not be set because object has part not yet and add them later
                                aMissingValues.push(aPropertyInt.slice(0, k + 2).toString());
                            }
                        }
                    }
                    // create object parts for last level and add values to the properties
                    aPropertyIntCopy = aPropertyInt.slice(0);
                    _createObjectFromPath(oFlpConfigSearch, aPropertyInt, { property: "", value: "" }, aPropertyInt[0], aPropertyIntTmp.length);
                    oValueForPath = _getValueForPath(oFlpConfig, aPropertyIntCopy);
                    if (oValueForPath) {
                        _setValueFromPath(oFlpConfigSearch, oValueForPath.value, `${aPropertyIntCopy.toString()},value`);
                        _setValueFromPath(oFlpConfigSearch, oValueForPath.property, `${aPropertyIntCopy.toString()},property`);
                    }
                }
                // add missing values from above
                aMissingValues.forEach((sPath) => {
                    oValueForPath = _getValueForPath(oFlpConfig, sPath.split(","));
                    if (oValueForPath && _getValueForPath(oFlpConfigSearch, sPath.split(","))) {
                        _setValueFromPath(oFlpConfigSearch, oValueForPath.property, `${sPath},property`);
                    }
                });
                aMissingValues = [];
                // if level one property has an empty object in the array, delete the array index
                if (oFlpConfigSearch[sLevelOneProp] && Array.isArray(oFlpConfigSearch[sLevelOneProp][0][sLevelOneProp])
                    && oFlpConfigSearch[sLevelOneProp][0][sLevelOneProp].length === 0) {
                    oFlpConfigSearch[sLevelOneProp] = oFlpConfigSearch[sLevelOneProp].splice(1);
                }
            });
            // set models (one for current search, one for the full config to reset search or search again)
            Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar").setModel(new JSONModel(oFlpConfigSearch));
            Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar").setModel(new JSONModel(oFlpConfig), "Full");

            let iHierarchyCount = 0;
            Object.keys(oTabBarFilter).forEach((sLevelOneProp) => {
                sSelectedKey = sLevelOneProp;
                // get hierarchy level to expand levels in tree table and expand them by default after a search
                if (oFlpConfigSearch[sSelectedKey] && Array.isArray(oFlpConfigSearch[sSelectedKey])) {
                    oFlpConfigSearch[sSelectedKey].forEach((sProperty, iPropIndex) => {
                        const iHierarchyCountTmp = _getHierarchyDepth(oFlpConfigSearch[sSelectedKey][iPropIndex], sSelectedKey);
                        if (iHierarchyCount < iHierarchyCountTmp) {
                            iHierarchyCount = iHierarchyCountTmp;
                        }
                    });
                }
                // minus 1 because last hierarchy level does not need to expanded but counts because its a hierarchy level as well
                Element.getElementById(`sap-ui-support-flpConfigurationPlugin-TreeTable${sLevelOneProp}`).expandToLevel(iHierarchyCount - 1);
                // set numbers of properties in UI
                Element.getElementById(sLevelOneProp).setCount(_getPropertyCount(oFlpConfigSearch[sLevelOneProp], sLevelOneProp, 0));
            });
        } else {
            // set numbers of properties in UI
            Object.keys(oTabBarFilter).forEach((sLevelOneProp) => {
                Element.getElementById(sLevelOneProp).setCount(_getPropertyCount(oFlpConfig[sLevelOneProp], sLevelOneProp, 0));
            });
            Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar").setModel(new JSONModel(oFlpConfig));
        }
    };

    // returns top level node of constructed hierarchical array
    // it is recursive, depth first search
    function _createNewConfigJSON (oCurrentObject, sPropertyKey) {
        // if the first level property does not have an object as value do a special creating
        if (typeof oCurrentObject !== "object") {
            return [{ property: sPropertyKey, value: oCurrentObject }];
        }
        return Object.keys(oCurrentObject).map((sPropertyName) => {
            // produce the nth element
            const oResult = { property: sPropertyName };
            const vValue = oCurrentObject[sPropertyName];
            if (typeof vValue === "object"
                && vValue !== null
                && !isEmptyObject(vValue)
                && !Array.isArray(vValue)) {
                oResult[sPropertyKey] = _createNewConfigJSON(vValue, sPropertyKey);
                return oResult;
            }

            try {
                oResult.value = JSON.stringify(vValue);
            } catch (oError) {
                oResult.value = vValue;
            }

            return oResult;
        });
    }

    /*
     * this method changes the FLP configuration
     *   - replacing undefined values with "undefined"
     *   - removes functions as attributes
     *   - it prepares the data for being sent by the plugin framework
     */
    FlpConfigurationPlugin.prototype.prepareForSending = function (oFlpConfig, oPreparedConfig) {
        Object.keys(oFlpConfig).forEach((sKey) => {
            const oCurrentElement = oFlpConfig[sKey];
            switch (typeof oCurrentElement) {
                case "object":
                    // null and arrays are both considered as Object when checked with typeof
                    if (oCurrentElement === null) {
                        oPreparedConfig[sKey] = oCurrentElement;
                        return;
                    } else if (Array.isArray(oCurrentElement)) {
                        oPreparedConfig[sKey] = [];
                    } else {
                        oPreparedConfig[sKey] = {};
                    }
                    this.prepareForSending(oFlpConfig[sKey], oPreparedConfig[sKey]);
                    break;
                case "undefined":
                    oPreparedConfig[sKey] = "undefined";
                    return;
                case "function":
                    return;
                default:
                    oPreparedConfig[sKey] = oFlpConfig[sKey];
                    return;
            }
        });
    };

    // build new config JSON with structure usable for data binding
    FlpConfigurationPlugin.prototype.getNewConfigJSON = function (oFlpConfig) {
        const oNewConfigJSON = {};
        Object.keys(oFlpConfig).forEach((sLevelOneElement) => {
            oNewConfigJSON[sLevelOneElement] = _createNewConfigJSON(oFlpConfig[sLevelOneElement], sLevelOneElement);
        });
        return oNewConfigJSON;
    };

    // build UI for the extension
    FlpConfigurationPlugin.prototype.getFlpConfigurationPluginUI = function (foo, TreeTable, Column, SelectionMode) {
        let oTabBar;
        const oCountTabBar = {};

        // create config object for data binding in tree table
        const oFlpConfigNew = this.getNewConfigJSON(this.flpConfig);

        // build models for tree table
        const oModelNewConfig = new JSONModel(oFlpConfigNew);

        // count properties to show in icon tab bar
        for (const sProp in oFlpConfigNew) {
            oCountTabBar[sProp] = _getPropertyCount(oFlpConfigNew[sProp], sProp, 0);
        }

        // if someone refreshes the diagnostics tool, the event will be triggered for every refresh
        // so do not build a new UI or set any model in case everything is already there
        if (!Element.getElementById("sap-ui-support-flpConfigurationPlugin-TabBar")) {
            // place an error message on UI if there is no config
            if (!oFlpConfigNew || isEmptyObject(oFlpConfigNew)) {
                new MessageStrip({
                    text: oResourceBundle.getText("ERROR_MESSAGE"),
                    type: "Warning",
                    showIcon: true,
                    showCloseButton: false
                }).placeAt(this.getId());
            } else {
                // build UI with tab bar and tree table
                oTabBar = new IconTabBar("sap-ui-support-flpConfigurationPlugin-TabBar", {
                    headerMode: "Inline"
                });

                // each hierarchy level one property gets an own tab filter
                Object.keys(this.flpConfig).forEach((element, index) => {
                    oTabBar.insertItem(new IconTabFilter(element, {
                        key: element,
                        text: element,
                        count: oCountTabBar[element],
                        content: [
                            new TreeTable(`sap-ui-support-flpConfigurationPlugin-TreeTable${element}`, {
                                rows: `{/${element}/}`,
                                selectionMode: SelectionMode.None,
                                enableCellFilter: true,
                                extension: [
                                    new FlexBox({
                                        items: [
                                            new Button({
                                                icon: "sap-icon://expand",
                                                text: "{i18n>EXPAND_BUTTON}",
                                                press: _onPressExpand
                                            }),
                                            new Button({
                                                icon: "sap-icon://collapse",
                                                text: "{i18n>COLLAPSE_BUTTON}",
                                                press: _onPressCollapse
                                            })
                                        ]
                                    })
                                ],
                                columns: [
                                    new Column({
                                        label: new Label({ text: "{i18n>COLUMN_PROPERTY}" }),
                                        template: new Text({ text: "{property}" })
                                    }),
                                    new Column({
                                        label: new Label({ text: "{i18n>COLUMN_VALUE}" }),
                                        template: new Text({ text: "{value}" })
                                    })
                                ]
                            })
                        ]
                    }), index);
                });

                const oSearchField = new SearchField({
                    search: this.onPressSearchNewModel
                });
                oSearchField.placeAt(this.getId());
                // set model for tab bar and place it
                oTabBar.setModel(oModelNewConfig);
                oTabBar.setModel(oI18nModel, "i18n");
                oTabBar.placeAt(this.getId());
            }
        }
    };

    return FlpConfigurationPlugin;
});
