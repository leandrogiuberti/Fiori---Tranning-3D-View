// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the ExtensionHandler class.
 *
 * Any handlers that are relevant for extensions
 * - Head(End)Items
 * - UserActions
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Element",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/appIntegration/PostMessageHandler/ExtensionItems",
    "sap/ushell/utils"
], (
    Log,
    Element,
    PostMessageManager,
    Container,
    ExtensionItems,
    ushellUtils
) => {
    "use strict";

    let oExtensionItems;

    /**
     * Destroys a control by its ID.
     * Does nothing if the control does not exist.
     * @param {string} sControlId The ID of the control.
     *
     * @since 1.125.0
     * @private
     */
    function destroyControl (sControlId) {
        oExtensionItems.removeItem(sControlId);

        const oControl = Element.getElementById(sControlId);
        if (oControl?.destroy) {
            oControl.destroy();
        }
    }

    const oDistributionPolicies = {};

    const oServiceRequestHandlers = {
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Renderer.addHeaderItem": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { sId, sTooltip, sIcon, iFloatingNumber, bVisible } = oMessageBody;
                const FrameBoundExtension = await Container.getServiceAsync("FrameBoundExtension");

                const oItem = await FrameBoundExtension.createHeaderItem({
                    id: sId,
                    tooltip: sTooltip,
                    icon: sIcon,
                    floatingNumber: iFloatingNumber,
                    press: function () {
                        PostMessageManager.sendRequest(
                            "sap.ushell.appRuntime.buttonClick",
                            { buttonId: sId },
                            oApplicationContainer.getPostMessageTarget(),
                            oApplicationContainer.getPostMessageTargetOrigin(),
                            false // bWaitForResponse
                        );
                    }
                }, {
                    position: "begin"
                });

                oExtensionItems.storeItem(sId, oItem);
                oExtensionItems.applyItemVisibility(oItem, bVisible);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Renderer.showHeaderItem": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIds: vIds } = oMessageBody;

                const aIds = Array.isArray(vIds) ? vIds : [vIds];

                oExtensionItems.visitItems(aIds, (oItem) => {
                    oExtensionItems.applyItemVisibility(oItem, true);
                });
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Renderer.hideHeaderItem": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIds: vIds } = oMessageBody;

                const aIds = Array.isArray(vIds) ? vIds : [vIds];

                oExtensionItems.visitItems(aIds, (oItem) => {
                    oExtensionItems.applyItemVisibility(oItem, false);
                });
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Renderer.updateHeaderItem": {
            async handler (oMessageBody, oMessageEvent) {
                const { sId, oControlProperties } = oMessageBody;

                // we only support update of floatingNumber
                if (!Object.hasOwn(oControlProperties, "floatingNumber")) {
                    return;
                }

                const oItem = oExtensionItems.getItem(sId);

                if (oItem?.getControl) {
                    const oControl = await oItem.getControl();
                    oControl?.setFloatingNumber?.(oControlProperties.floatingNumber);
                }
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Renderer.addHeaderEndItem": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { sId, sTooltip, sIcon, iFloatingNumber, bVisible } = oMessageBody;
                const FrameBoundExtension = await Container.getServiceAsync("FrameBoundExtension");

                const oItem = await FrameBoundExtension.createHeaderItem({
                    id: sId,
                    tooltip: sTooltip,
                    icon: sIcon,
                    floatingNumber: iFloatingNumber,
                    press: function () {
                        PostMessageManager.sendRequest(
                            "sap.ushell.appRuntime.buttonClick",
                            { buttonId: sId },
                            oApplicationContainer.getPostMessageTarget(),
                            oApplicationContainer.getPostMessageTargetOrigin(),
                            false // bWaitForResponse
                        );
                    }
                }, {
                    position: "end"
                });

                oExtensionItems.storeItem(sId, oItem);
                oExtensionItems.applyItemVisibility(oItem, bVisible);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Renderer.showHeaderEndItem": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIds: vIds } = oMessageBody;

                const aIds = Array.isArray(vIds) ? vIds : [vIds];

                oExtensionItems.visitItems(aIds, (oItem) => {
                    oExtensionItems.applyItemVisibility(oItem, true);
                });
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Renderer.hideHeaderEndItem": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIds: vIds } = oMessageBody;

                const aIds = Array.isArray(vIds) ? vIds : [vIds];

                oExtensionItems.visitItems(aIds, (oItem) => {
                    oExtensionItems.applyItemVisibility(oItem, false);
                });
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Renderer.addUserAction": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { controlType, oControlProperties, bIsVisible } = oMessageBody.oParameters;
                const FrameBoundExtension = await Container.getServiceAsync("FrameBoundExtension");

                oControlProperties.press = async function () {
                    PostMessageManager.sendRequest(
                        "sap.ushell.appRuntime.buttonClick",
                        { buttonId: oControlProperties.id },
                        oApplicationContainer.getPostMessageTarget(),
                        oApplicationContainer.getPostMessageTargetOrigin(),
                        false // bWaitForResponse
                    );
                };

                const oItem = await FrameBoundExtension.createUserAction(oControlProperties, {
                    controlType
                });

                oExtensionItems.storeItem(oControlProperties.id, oItem);
                oExtensionItems.applyItemVisibility(oItem, bIsVisible);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Renderer.showActionButton": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIds: vIds } = oMessageBody;

                const aIds = Array.isArray(vIds) ? vIds : [vIds];

                oExtensionItems.visitItems(aIds, (oItem) => {
                    oExtensionItems.applyItemVisibility(oItem, true);
                });
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Renderer.hideActionButton": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIds: vIds } = oMessageBody;

                const aIds = Array.isArray(vIds) ? vIds : [vIds];

                oExtensionItems.visitItems(aIds, (oItem) => {
                    oExtensionItems.applyItemVisibility(oItem, false);
                });
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Renderer.addOptionsActionSheetButton": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const vButtons = oMessageBody;
                const [Button] = await ushellUtils.requireAsync(["sap/m/Button"]);
                const FrameBoundExtension = await Container.getServiceAsync("FrameBoundExtension");

                const aButtons = Array.isArray(vButtons) ? vButtons : [vButtons];

                aButtons.forEach(async (oButton) => {
                    destroyControl(oButton.id);

                    // eslint-disable-next-line no-new
                    new Button({
                        id: oButton.id,
                        text: oButton.text,
                        icon: oButton.icon,
                        tooltip: oButton.tooltip,
                        press: async function () {
                            PostMessageManager.sendRequest(
                                "sap.ushell.appRuntime.buttonClick",
                                { buttonId: oButton.id },
                                oApplicationContainer.getPostMessageTarget(),
                                oApplicationContainer.getPostMessageTargetOrigin(),
                                false // bWaitForResponse
                            );
                        }
                    });

                    const oItem = await FrameBoundExtension.createUserAction({
                        id: oButton.id
                    });

                    oExtensionItems.storeItem(oButton.id, oItem);
                    oExtensionItems.applyItemVisibility(oItem, true);
                });
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Renderer.removeOptionsActionSheetButton": {
            async handler (oMessageBody, oMessageEvent) {
                const vButtons = oMessageBody;

                const aButtons = Array.isArray(vButtons) ? vButtons : [vButtons];

                aButtons.forEach((oButton) => {
                    const oItem = oExtensionItems.getItem(oButton.id);
                    if (!oItem) {
                        Log.warning(`User action with id ${oButton.id} not found`);
                        return;
                    }

                    oExtensionItems.applyItemVisibility(oItem, false);
                    return destroyControl(oButton.id);
                });
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Renderer.destroyButton": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIds: vIds } = oMessageBody;

                const aIds = Array.isArray(vIds) ? vIds : [vIds];

                aIds.forEach((sId) => {
                    destroyControl(sId);
                });
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Renderer.createShellHeadItem": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { params } = oMessageBody;
                params.press = async function () {
                    PostMessageManager.sendRequest(
                        "sap.ushell.appRuntime.buttonClick",
                        { buttonId: params.id },
                        oApplicationContainer.getPostMessageTarget(),
                        oApplicationContainer.getPostMessageTargetOrigin(),
                        false // bWaitForResponse
                    );
                };

                const [ShellHeadItem] = await ushellUtils.requireAsync(["sap/ushell/ui/shell/ShellHeadItem"]);

                // eslint-disable-next-line no-new
                new ShellHeadItem(params);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.Renderer.setHeaderVisibility": {
            async handler (oMessageBody, oMessageEvent) {
                const { bVisible, bCurrentState, aStates } = oMessageBody;
                const oRenderer = Container.getRendererInternal("fiori2");

                oRenderer.setHeaderVisibility(bVisible, !!bCurrentState, aStates);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.createHeaderItem": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { controlProperties, events, parameters } = oMessageBody;
                const sItemId = oExtensionItems.generateItemId();

                events.forEach((sEventName) => {
                    controlProperties[sEventName] = async function () {
                        PostMessageManager.sendRequest(
                            "sap.ushell.services.Extension.handleControlEvent",
                            {
                                eventName: sEventName,
                                itemId: sItemId
                            },
                            oApplicationContainer.getPostMessageTarget(),
                            oApplicationContainer.getPostMessageTargetOrigin(),
                            false // bWaitForResponse
                        );
                    };
                });

                const Extension = await Container.getServiceAsync("Extension");
                const oItem = await Extension.createHeaderItem(controlProperties, parameters);
                oExtensionItems.storeItem(sItemId, oItem);

                return {
                    itemId: sItemId
                };
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.createUserAction": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { controlProperties, events, parameters } = oMessageBody;
                const sItemId = oExtensionItems.generateItemId();

                events.forEach((sEventName) => {
                    controlProperties[sEventName] = async function () {
                        PostMessageManager.sendRequest(
                            "sap.ushell.services.Extension.handleControlEvent",
                            {
                                eventName: sEventName,
                                itemId: sItemId
                            },
                            oApplicationContainer.getPostMessageTarget(),
                            oApplicationContainer.getPostMessageTargetOrigin(),
                            false // bWaitForResponse
                        );
                    };
                });

                const Extension = await Container.getServiceAsync("Extension");
                const oItem = await Extension.createUserAction(controlProperties, parameters);
                oExtensionItems.storeItem(sItemId, oItem);

                return {
                    itemId: sItemId
                };
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.Item.destroy": {
            async handler (oMessageBody, oMessageEvent) {
                const { itemId } = oMessageBody;

                const oItem = oExtensionItems.getItem(itemId);
                if (!oItem) {
                    Log.error(`Extension item with id ${itemId} not found - cannot destroy it.`);
                    return;
                }

                oExtensionItems.removeItem(itemId);
                oItem.destroy();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.Item.showForCurrentApp": {
            async handler (oMessageBody, oMessageEvent) {
                const { itemId } = oMessageBody;

                const oItem = oExtensionItems.getItem(itemId);
                if (!oItem) {
                    Log.error(`Extension item with id ${itemId} not found - cannot update its visibility.`);
                    return;
                }

                oItem.showForCurrentApp();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.Item.hideForCurrentApp": {
            async handler (oMessageBody, oMessageEvent) {
                const { itemId } = oMessageBody;

                const oItem = oExtensionItems.getItem(itemId);
                if (!oItem) {
                    Log.error(`Extension item with id ${itemId} not found - cannot update its visibility.`);
                    return;
                }

                oItem.hideForCurrentApp();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.Item.showForAllApps": {
            async handler (oMessageBody, oMessageEvent) {
                const { itemId } = oMessageBody;

                const oItem = oExtensionItems.getItem(itemId);
                if (!oItem) {
                    Log.error(`Extension item with id ${itemId} not found - cannot update its visibility.`);
                    return;
                }

                oItem.showForAllApps();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.Item.hideForAllApps": {
            async handler (oMessageBody, oMessageEvent) {
                const { itemId } = oMessageBody;

                const oItem = oExtensionItems.getItem(itemId);
                if (!oItem) {
                    Log.error(`Extension item with id ${itemId} not found - cannot update its visibility.`);
                    return;
                }

                oItem.hideForAllApps();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.Item.showOnHome": {
            async handler (oMessageBody, oMessageEvent) {
                const { itemId } = oMessageBody;

                const oItem = oExtensionItems.getItem(itemId);
                if (!oItem) {
                    Log.error(`Extension item with id ${itemId} not found - cannot update its visibility.`);
                    return;
                }

                oItem.showOnHome();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Extension.Item.hideOnHome": {
            async handler (oMessageBody, oMessageEvent) {
                const { itemId } = oMessageBody;

                const oItem = oExtensionItems.getItem(itemId);
                if (!oItem) {
                    Log.error(`Extension item with id ${itemId} not found - cannot update its visibility.`);
                    return;
                }

                oItem.hideOnHome();
            }
        }
    };

    return {
        register () {
            oExtensionItems = new ExtensionItems();

            Object.keys(oDistributionPolicies).forEach((sServiceRequest) => {
                const oDistributionPolicy = oDistributionPolicies[sServiceRequest];
                PostMessageManager.setDistributionPolicy(sServiceRequest, oDistributionPolicy);
            });

            Object.keys(oServiceRequestHandlers).forEach((sServiceRequest) => {
                const oHandler = oServiceRequestHandlers[sServiceRequest];
                PostMessageManager.setRequestHandler(sServiceRequest, oHandler.handler, oHandler.options);
            });
        },

        // for testing,
        getExtensionItems () {
            return oExtensionItems;
        }
    };
});
