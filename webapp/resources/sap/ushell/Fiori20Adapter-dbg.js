// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview The Fiori20 adapter is not a platform adapter, but a UI adapter.
 *
 * The Fiori20 adapter automatically re-styles old (Fiori 1) applications to match Fiori2 design requirements.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Component",
    "sap/ui/core/UIComponent",
    "sap/ui/core/ComponentHooks",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/Fiori20Adapter",
    "sap/ui/thirdparty/hasher",
    "sap/base/util/extend",
    "sap/ushell/utils/CallbackQueue"
], (
    BaseObject,
    Component,
    UIComponent,
    ComponentHooks,
    ResourceModel,
    SapMFiori20Adapter,
    hasher,
    extend,
    CallbackQueue
) => {
    "use strict";
    ComponentHooks.onUIComponentInstanceDestroy.register((oComponent) => {
        if (oComponent._fioriAdapter) {
            oComponent._fioriAdapter.destroy();
        }
        if (oComponent._oShellUIService) {
            oComponent._oShellUIService.destroy();
        }
    });
    /**
     * Fetches application information from app-descriptor or metadata
     *
     * @type {function}
     */
    const AppInfo = BaseObject.extend("AppInfo", {
        constructor: function (oComponent) {
            BaseObject.call(this);
            this._oComponent = oComponent;
        },
        getDefaultTitle: async function () {
            // first possible source
            const oAppInfo = this._oComponent.getManifestEntry("sap.app");
            if (oAppInfo && oAppInfo.title) {
                const sTitle = oAppInfo.title;
                if (this._isLocalizationKey(sTitle)) {
                    const sResBundle = (oAppInfo.i18n || "i18n/i18n.properties");
                    return this._getLocalized(sTitle, sResBundle);
                }
                return sTitle;
            }
            // second possible source
            const oUI5Info = this._oComponent.getManifestEntry("sap.ui5");
            if (oUI5Info?.config?.resourceBundle && oUI5Info.config.titleResource) {
                const sTitle = oUI5Info.config.titleResource;
                const sResBundle = oUI5Info.config.resourceBundle;
                return this._getLocalized(sTitle, sResBundle);
            }
        },
        _getLocalized: async function (sText, sResBundle) {
            const oModel = new ResourceModel({
                async: true,
                bundleUrl: `${sap.ui.require.toUrl(this._oComponent.getMetadata().getComponentName())}/${sResBundle}`
            });
            const oResourceBundle = await oModel.getResourceBundle();
            return oResourceBundle.getText(sText.replace(/^{{/, "").replace(/}}$/, ""));
        },
        _isLocalizationKey: function (sTitle) {
            return (sTitle.indexOf("{{") === 0) && (sTitle.indexOf("}}") > 0);
        }
    });
    /**
     * Sets header info (title and navigation hierarchy) to the FLP header via the ShellUIService
     *
     * @type {function}
     */
    const HeaderInfo = BaseObject.extend("HeaderInfo", {
        constructor: function (oComponent, oConfig, oAppInfo) {
            BaseObject.call(this);
            this._oConfig = oConfig;
            this._oAppInfo = oAppInfo;
            this._oShellUIService = oComponent._oShellUIService;
            this._aHierarchy = [];
            this._pInit = this._oAppInfo.getDefaultTitle().then((sDefaultTitle) => {
                this._sDefaultTitle = sDefaultTitle;
            });
        },
        registerView: async function (oViewInfo, sHash) {
            if (this._oConfig.bMoveTitle === true) { // disabled by configuration
                if (!oViewInfo.oTitleInfo && oViewInfo.oSubTitleInfo) {
                    oViewInfo.oTitleInfo = oViewInfo.oSubTitleInfo; // subtitle promotion in the absence of title
                }
                this._oCurrentViewInfo = oViewInfo;
                const sTitle = oViewInfo.oTitleInfo ? oViewInfo.oTitleInfo.text : undefined;
                if (sTitle !== this._oShellUIService.getTitle()) {
                    try {
                        this._oShellUIService.setTitle(sTitle);
                    } catch {
                        /*
                         * fail silently:
                         * The app might run in autoTitle mode. Any manual title change will raise an error.
                         */
                    }
                }
                await this._updateHierarchy(oViewInfo, sHash);
            }
            this._setBackNavigation(oViewInfo.oBackButton, oViewInfo.oAdaptOptions);
        },
        _setBackNavigation: function (oBackButton, oAdaptOptions) {
            if (oAdaptOptions && oAdaptOptions.bHideBackButton === false) { // disabled by configuration
                return;
            }
            let fnBackPress;
            if (oBackButton) {
                fnBackPress = oBackButton.firePress.bind(oBackButton);
            }
            this._oShellUIService.setBackNavigation(fnBackPress);
        },
        _updateHierarchy: async function (oViewInfo, sHash) {
            if (this._oConfig.bHierarchy === false) { // disabled by configuration
                return;
            }
            await this._pInit;
            if (!oViewInfo) {
                return;
            }
            let bNew = true;
            for (let i = this._aHierarchy.length - 1; i >= 0; i--) {
                let oEntry = this._aHierarchy[i];
                const bKnownView = (oEntry.id === oViewInfo.sViewId);
                const bKnownHash = (oEntry.intent === sHash);
                if (bKnownView || bKnownHash) {
                    bNew = false;
                    oEntry = this._updateHierarchyEntry(oEntry, oViewInfo);
                    this._aHierarchy[i] = oEntry;
                    this._aHierarchy = this._aHierarchy.slice(0, i + 1);
                    if (bKnownView) {
                        oEntry.intent = sHash;
                    }
                    break;
                }
            }
            if (bNew) {
                const oHierarchyEntry = this._createHierarchyEntry(oViewInfo, sHash);
                this._aHierarchy.push(oHierarchyEntry);
            }
            const aNewHierarchy = [];
            for (let j = this._aHierarchy.length - 2; j >= 0; j--) {
                aNewHierarchy.push(this._aHierarchy[j]);
            }
            try {
                this._oShellUIService.setHierarchy(this._deleteUndefinedProperties(aNewHierarchy));
            } catch {
                /*
                 * fail silently:
                 * The app might run in autoHierarchy mode. Any manual hierarchy change will raise an error.
                 */
            }
        },
        _createHierarchyEntry: function (oViewInfo, sHash) {
            return {
                id: oViewInfo.sViewId,
                title: oViewInfo.oTitleInfo ? oViewInfo.oTitleInfo.text : this._sDefaultTitle,
                subtitle: oViewInfo.oSubTitleInfo ? oViewInfo.oSubTitleInfo.text : undefined,
                intent: sHash
            };
        },
        _updateHierarchyEntry: function (oEntry, oViewInfo) {
            oEntry.id = oViewInfo.sViewId;
            oEntry.title = oViewInfo.oTitleInfo ? oViewInfo.oTitleInfo.text : this._sDefaultTitle;
            oEntry.subtitle = oViewInfo.oSubTitleInfo ? oViewInfo.oSubTitleInfo.text : undefined;
            return oEntry;
        },
        /* ShellUIService validation throws an error if a string field received a falsy (undefined or null) value */
        _deleteUndefinedProperties: function (aObjects) { // TODO: think refactor
            aObjects.forEach((oObject) => {
                for (const sPropertyName in oObject) {
                    if (oObject.hasOwnProperty(sPropertyName) && !oObject[sPropertyName] && sPropertyName !== "title") {
                        delete oObject[sPropertyName];
                    }
                }
            });
            return aObjects;
        }
    });
    const Fiori20Adapter = BaseObject.extend("sap.ushell.Fiori20Adapter", {
        constructor: function (oComponent, oConfig) {
            BaseObject.call(this);
            this._oComponent = oComponent;
            this._oConfig = oConfig;
            this._oHeaderInfo = new HeaderInfo(oComponent, oConfig, new AppInfo(oComponent));
            if (SapMFiori20Adapter) {
                SapMFiori20Adapter.attachViewChange(this._onViewChange, this);
            }
            this._oViewChangeQueue = new CallbackQueue();
        },
        init: function () {
            if (!SapMFiori20Adapter) {
                return;
            }
            const oConfig = extend({}, this._oConfig);
            SapMFiori20Adapter.traverse(this._oComponent.getAggregation("rootControl"), oConfig);
        },
        destroy: function () {
            if (SapMFiori20Adapter) {
                SapMFiori20Adapter.detachViewChange(this._onViewChange, this);
            }
        },
        _onViewChange: async function (oEvent) {
            // await previous view changes as they might interfere with each other
            const sHash = `#${hasher.getHash()}`; // store now the hash as it might change later on
            await this._oViewChangeQueue.push(async () => {
                await this._oHeaderInfo.registerView(oEvent.getParameters(), sHash);
            });
        }
    });
    Fiori20Adapter.applyTo = function (oControl, oComponent, oConfig, oShellUIService) {
        let oOwner = oControl instanceof UIComponent ? oControl : Component.getOwnerComponentFor(oControl);
        if (!oOwner) {
            oOwner = oComponent;
        }
        if (!oOwner) {
            return;
        }
        oOwner._oShellUIService = oShellUIService;
        if (!oOwner._fioriAdapter) {
            oOwner._fioriAdapter = new Fiori20Adapter(oOwner, oConfig);
            oOwner._fioriAdapter.init();
        }
    };
    return Fiori20Adapter;
});
