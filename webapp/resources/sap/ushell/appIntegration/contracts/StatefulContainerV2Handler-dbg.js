// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview handle all the resources for the different applications.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell/ApplicationType/UrlPostProcessing",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/utils",
    "sap/ushell/Container"
], (
    UrlPostProcessing,
    hasher,
    ushellUtils,
    Container
) => {
    "use strict";

    class StatefulContainerV2Handler {
        async createApp (oApplicationContainer, sStorageAppId, oResolvedHashFragment) {
            oApplicationContainer.setReservedParameters(oResolvedHashFragment.reservedParameters);
            oApplicationContainer.setCurrentAppUrl(oResolvedHashFragment.url);
            oApplicationContainer.setCurrentAppId(sStorageAppId);
            oApplicationContainer.setCurrentAppTargetResolution(oResolvedHashFragment);

            const oPostParams = await this.#createPostParams(oApplicationContainer, sStorageAppId, oResolvedHashFragment);
            const oResult = await oApplicationContainer.sendRequest("sap.ushell.services.appLifeCycle.create", oPostParams, true);

            return oResult?.result;
        }

        async #createPostParams (oApplicationContainer, sStorageAppId, oResolvedHashFragment) {
            const sUrl = UrlPostProcessing.processUrl(
                oResolvedHashFragment.url,
                oResolvedHashFragment.applicationType,
                false, // bForExplaceNavigation
                oApplicationContainer
            );

            const oPostParams = {
                sCacheId: sStorageAppId,
                sHash: hasher.getHash(),
                sUrl: sUrl
            };

            if (sUrl.indexOf("sap-iframe-hint=GUI") > 0 || sUrl.indexOf("sap-iframe-hint=WDA") > 0 || sUrl.indexOf("sap-iframe-hint=WCF") > 0) {
                const oAppStatesInfo = ushellUtils.getParamKeys(sUrl);
                const oFLPParams = {};

                if (oAppStatesInfo.aAppStateNamesArray.length > 0) {
                    try {
                        const Navigation = await Container.getServiceAsync("Navigation");
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

        async destroyApp (oApplicationContainer, sStorageKey) {
            const bIsActiveApp = oApplicationContainer.getCurrentAppId() === sStorageKey;

            if (bIsActiveApp) {
                oApplicationContainer.setCurrentAppUrl("");
                oApplicationContainer.setCurrentAppId("");
                oApplicationContainer.setCurrentAppTargetResolution(undefined);
                Container.setAsyncDirtyStateProvider(undefined);
            }

            await oApplicationContainer.sendRequest("sap.ushell.services.appLifeCycle.destroy", {
                sCacheId: sStorageKey
            }, true);
        }

        async storeAppWithinSameFrame (oApplicationContainer, sStorageKey) {
            const bIsActiveApp = oApplicationContainer.getCurrentAppId() === sStorageKey;
            if (!bIsActiveApp) {
                throw new Error("Cannot store an already stored/destroyed app");
            }

            oApplicationContainer.setCurrentAppUrl("");
            oApplicationContainer.setCurrentAppId("");
            oApplicationContainer.setCurrentAppTargetResolution(undefined);
            // todo: [FLPCOREANDUX-10024] should this be part of the keep alive?
            Container.setAsyncDirtyStateProvider(undefined);

            await oApplicationContainer.sendRequest("sap.ushell.services.appLifeCycle.store", {
                sCacheId: sStorageKey
            }, true);
        }

        async restoreAppWithinSameFrame (oApplicationContainer, sStorageKey, oResolvedHashFragment) {
            oApplicationContainer.setCurrentAppUrl(oResolvedHashFragment.url);
            oApplicationContainer.setCurrentAppId(sStorageKey);
            oApplicationContainer.setCurrentAppTargetResolution(oResolvedHashFragment);

            await oApplicationContainer.sendRequest("sap.ushell.services.appLifeCycle.restore", {
                sCacheId: sStorageKey,
                sUrl: oResolvedHashFragment.url,
                sHash: hasher.getHash()
            }, true);
        }

        isStatefulContainerSupportingKeepAlive (oApplicationContainer) {
            return oApplicationContainer.supportsCapabilities([
                // stateful capabilities
                "sap.ushell.services.AppLifeCycle.create",
                "sap.ushell.services.appLifeCycle.destroy",
                // keep alive capabilities
                "sap.ushell.services.appLifeCycle.store",
                "sap.ushell.services.appLifeCycle.restore"
            ]);
        }
    }

    return new StatefulContainerV2Handler();
});
