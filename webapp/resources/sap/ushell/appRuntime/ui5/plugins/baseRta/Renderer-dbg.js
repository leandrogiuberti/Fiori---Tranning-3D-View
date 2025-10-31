/* !
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */

sap.ui.define([
    "sap/base/Log",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"
    /*
     * Be careful with new dependencies.
     * Only include dependencies that are already bundled in
     * core-min/core-ext, appruntime or the flex-plugins bundle
     * otherwise load the library lazily before use.
     */
], (
    Log,
    AppLifeCycleUtils
) => {
    "use strict";

    const Renderer = {

        createActionButton: async function (oComponent, onClickHandler, bIsVisible) {
            const oContainer = AppLifeCycleUtils.getContainer();
            const ExtensionService = await oContainer.getServiceAsync("FrameBoundExtension");

            try {
                const oUserAction = await ExtensionService.createUserAction({
                    id: oComponent.mConfig.id,
                    text: oComponent.mConfig.i18n.getText(oComponent.mConfig.text),
                    icon: oComponent.mConfig.icon,
                    press: onClickHandler
                }, {
                    controlType: "sap.ushell.ui.launchpad.ActionItem"
                });
                if (bIsVisible) {
                    oUserAction.showForAllApps();
                    oUserAction.showOnHome();
                } else {
                    oUserAction.hideForAllApps();
                    oUserAction.hideOnHome();
                }
                return oUserAction;
            } catch (sErrorMessage) {
                Log.error(sErrorMessage, undefined, oComponent.mConfig.sComponentName);
            }
        },

        exit: function () {}
    };

    return Renderer;
}, true);
