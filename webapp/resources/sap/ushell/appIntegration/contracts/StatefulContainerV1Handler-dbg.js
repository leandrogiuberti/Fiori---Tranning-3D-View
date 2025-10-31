// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains miscellaneous utility functions for WebGui stateful container V1
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/Container"
], (
    ushellUtils,
    Container
) => {
    "use strict";

    class StatefulContainerV1Handler {
        async createApp (oApplicationContainer, sStorageAppId, oResolvedHashFragment) {
            oApplicationContainer.setCurrentAppId(sStorageAppId);
            oApplicationContainer.setCurrentAppUrl(oResolvedHashFragment.url);
            oApplicationContainer.setCurrentAppTargetResolution(oResolvedHashFragment);

            const oPostParams = await this.#createPostParams(oApplicationContainer, oResolvedHashFragment);
            await oApplicationContainer.sendRequest("sap.its.startService", oPostParams, true);
        }

        async #createPostParams (oApplicationContainer, oResolvedHashFragment) {
            let sUrl = oResolvedHashFragment.url;

            sUrl = await ushellUtils.appendSapShellParam(sUrl);
            sUrl = ushellUtils.filterOutParamsFromLegacyAppURL(sUrl);

            const oPostParams = {
                url: sUrl
            };

            if (oApplicationContainer.getIframeWithPost()) {
                const oAppStatesInfo = ushellUtils.getParamKeys(sUrl);
                const oFLPParams = {};

                if (oAppStatesInfo.aAppStateNamesArray.length > 0) {
                    const Navigation = await Container.getServiceAsync("Navigation");
                    try {
                        const aDataArray = await Navigation.getAppStateData(oAppStatesInfo.aAppStateKeysArray);
                        oAppStatesInfo.aAppStateNamesArray.forEach((sParamName, iIndex) => {
                            if (aDataArray[iIndex]) {
                                oFLPParams[sParamName] = aDataArray[iIndex];
                            }
                        });
                    } catch {
                        // fail silently
                    }
                }

                oPostParams["sap-flp-params"] = {
                    ...oFLPParams,
                    "sap-flp-url": Container.getFLPUrl(true),
                    "system-alias": oApplicationContainer.getSystemAlias()
                };
            }

            return oPostParams;
        }

        async destroyApp (oApplicationContainer) {
            oApplicationContainer.setCurrentAppId("");
            await oApplicationContainer.sendRequest("sap.gui.triggerCloseSession", {}, false);
        }
    }

    return new StatefulContainerV1Handler();
});
