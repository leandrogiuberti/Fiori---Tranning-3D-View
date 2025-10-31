// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This module enables a RendererExtensions like API.
 * This module is NOT a wrapper for the outer shell API and has to be required explicitly.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/util/uid",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext"
], (
    fnGetUid,
    AppCommunicationMgr,
    AppRuntimeContext
) => {
    "use strict";

    let oRenderer = {};

    function _addSubHeader (oItem, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").showSubHeader(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeSubHeader (oItem, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").hideSubHeader(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _addHeaderItem (oItem, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").showHeaderItem(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeHeaderItem (oItem, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").hideHeaderItem(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _addOptionsActionSheetButton (oButton, sLaunchpadState1, sLaunchpadState2) {
        const aButtons = Array.isArray(oButton) ? oButton : [oButton];
        const aStates = [sLaunchpadState1];
        const aButtonsDesc = [];

        if (sLaunchpadState2 !== undefined) {
            aStates.push(sLaunchpadState2);
        }
        aButtons.forEach((oCurrButton) => {
            const sOuerShellId = `${fnGetUid()}-apprt`;

            oCurrButton.idAppRuntime = sOuerShellId;
            oRenderer._addButtonHandler(sOuerShellId, () => {
                oCurrButton.firePress();
            });
            aButtonsDesc.push({
                id: sOuerShellId,
                text: oCurrButton.getText(),
                icon: oCurrButton.getIcon(),
                tooltip: oCurrButton.getTooltip(),
                aStates: aStates
            });
        });

        return AppCommunicationMgr.postMessageToFLP("sap.ushell.services.Renderer.addOptionsActionSheetButton", aButtonsDesc);
    }

    function _removeOptionsActionSheetButton (oButton, sLaunchpadState1, sLaunchpadState2) {
        const aButtons = Array.isArray(oButton) ? oButton : [oButton];
        const aStates = [sLaunchpadState1];
        const aButtonIds = [];

        if (sLaunchpadState2 !== undefined) {
            aStates.push(sLaunchpadState2);
        }

        aButtons.forEach((oCurrButton) => {
            aButtonIds.push({
                id: oCurrButton.idAppRuntime,
                aStates: aStates
            });
        });

        return AppCommunicationMgr.postMessageToFLP("sap.ushell.services.Renderer.removeOptionsActionSheetButton", aButtonIds);
    }

    function _setLeftPaneContent (oContent, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").showLeftPaneContent(oContent.getId(), false,  [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeLeftPaneContent (sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").hideLeftPaneContent(false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _addFloatingActionButton (oItem, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").showFloatingActionButton(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeFloatingActionButton (oItem, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").hideFloatingActionButton(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _addHeaderEndItem (oItem, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").showHeaderEndItem(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeHeaderEndItem (oItem, sLaunchpadState1, sLaunchpadState2) {
        // sap.ushell.Container.getRenderer("fiori2").hideHeaderEndItem(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _getConfiguration () {
        if (AppRuntimeContext.getIsScube()) {
            return {
                enablePersonalization: true
            };
        }
        return {};
    }

    function _setHeaderItemVisibility (sItem, sLaunchpadState, bToLocal, bIsVisible) {
        // var oItem = sap.ui.getCore().byId(sItem);
        // if (bIsVisible) {
        //    sap.ushell.Container.getRenderer("fiori2").showHeaderItem(oItem.getId(), bToLocal, [sLaunchpadState]);
        // }
    }

    function _addEndUserFeedbackCustomUI (oCustomUIContent, bShowCustomUIContent) {
        // Deprecated;
    }

    function _addUserPreferencesEntry (entryObject) {
        // sap.ushell.Container.getRenderer("fiori2").addUserPreferencesEntry(entryObject);
    }

    function _addUserPreferencesGroupedEntry (entryObject) {
        // sap.ushell.Container.getRenderer("fiori2")._addUserPreferencesGroupedEntry(entryObject);
    }

    function _setHeaderTitle (sTitle) {
        // sap.ushell.Container.getRenderer("fiori2").setHeaderTitle(sTitle);
    }

    function _setLeftPaneVisibility (sLaunchpadState, bVisible) {
        // sap.ushell.Container.getRenderer("fiori2").setLeftPaneVisibility(sLaunchpadState, bVisible);
    }

    function _setHeaderHiding (bHiding) {
        // sap.ushell.Container.getRenderer("fiori2").setHeaderHiding(bHiding);
    }

    function _setFooter (oFooter) {
        // sap.ushell.Container.getRenderer("fiori2").setFooter(oFooter);
    }

    function _removeFooter () {
        // sap.ushell.Container.getRenderer("fiori2").removeFooter();
    }

    function _setRenderer (oRendererProxy) {
        oRenderer = oRendererProxy;
    }

    function RendererExtensions () {
        this.addHeaderItem = _addHeaderItem;
        this.setHeaderItemVisibility = _setHeaderItemVisibility;
        this.addSubHeader = _addSubHeader;
        this.removeSubHeader = _removeSubHeader;
        this.addHeaderEndItem = _addHeaderEndItem;
        this.removeHeaderItem = _removeHeaderItem;
        this.removeHeaderEndItem = _removeHeaderEndItem;
        this.addEndUserFeedbackCustomUI = _addEndUserFeedbackCustomUI;
        this.addOptionsActionSheetButton = _addOptionsActionSheetButton;
        this.removeOptionsActionSheetButton = _removeOptionsActionSheetButton;
        this.setFooter = _setFooter;
        this.removeFooter = _removeFooter;
        this.addUserPreferencesEntry = _addUserPreferencesEntry;
        this.addUserPreferencesGroupedEntry = _addUserPreferencesGroupedEntry;
        this.setHeaderTitle = _setHeaderTitle;
        this.setHeaderHiding = _setHeaderHiding;
        this.LaunchpadState = {
            App: "app",
            Home: "home"
        };
        this.addFloatingActionButton = _addFloatingActionButton;
        this.removeFloatingActionButton = _removeFloatingActionButton;
        this.setLeftPaneContent = _setLeftPaneContent;
        this.removeLeftPaneContent = _removeLeftPaneContent;
        this.setLeftPaneVisibility = _setLeftPaneVisibility;
        this.getConfiguration = _getConfiguration;
        this.setRenderer = _setRenderer;
    }

    return new RendererExtensions();
});
