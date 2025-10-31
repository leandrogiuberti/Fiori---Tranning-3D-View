// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the NavigationHandler class.
 *
 * Any handlers that are relevant for navigation
 * - ushell services
 *   + Navigation
 *   + CrossApplicationNavigation
 *   + ShellNavigation(Internal)
 *   + NavTargetResolution(Internal)
 * - UserDefaults
 * - SystemAlias
 */
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/URI",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/services/Navigation/compatibility",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], (
    deepExtend,
    hasher,
    URI,
    PostMessageManager,
    Container,
    navigationCompatibility,
    ushellUtils,
    UrlParsing
) => {
    "use strict";

    const oDistributionPolicies = {};

    const oServiceRequestHandlers = {
        /**
         * @private
         */
        "sap.ushell.services.Navigation.getHref": {
            async handler (oMessageBody, oMessageEvent) {
                const { oTarget } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.getHref(oTarget);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.backToPreviousApp": {
            async handler (oMessageBody, oMessageEvent) {
                const Navigation = await Container.getServiceAsync("Navigation");
                await Navigation.backToPreviousApp();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.historyBack": {
            async handler (oMessageBody, oMessageEvent) {
                const { iSteps } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                Navigation.historyBack(iSteps);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.isInitialNavigation": {
            async handler (oMessageBody, oMessageEvent) {
                const Navigation = await Container.getServiceAsync("Navigation");
                return Navigation.isInitialNavigation();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.navigate": {
            async handler (oMessageBody, oMessageEvent) {
                const { oTarget } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                const oTargetClone = deepExtend({}, oTarget);
                ushellUtils.storeSapSystemToLocalStorage(oTargetClone);

                await Navigation.navigate(oTargetClone);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.getPrimaryIntent": {
            async handler (oMessageBody, oMessageEvent) {
                const { sSemanticObject, oLinkFilter } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.getPrimaryIntent(sSemanticObject, oLinkFilter);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.getLinks": {
            async handler (oMessageBody, oMessageEvent) {
                const oParams = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.getLinks(oParams);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.getSemanticObjects": {
            async handler (oMessageBody, oMessageEvent) {
                const Navigation = await Container.getServiceAsync("Navigation");
                return Navigation.getSemanticObjects();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.isNavigationSupported": {
            async handler (oMessageBody, oMessageEvent) {
                const { aTargets } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.isNavigationSupported(aTargets);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.resolveIntent": {
            async handler (oMessageBody, oMessageEvent) {
                const { sHashFragment } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.resolveIntent(sHashFragment);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.isUrlSupported": {
            async handler (oMessageBody, oMessageEvent) {
                const { sUrl } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                await Navigation.isUrlSupported(sUrl);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.hrefForExternal": {
            async handler (oMessageBody, oMessageEvent) {
                const { oArgs } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.getHref(oArgs);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks": {
            async handler (oMessageBody, oMessageEvent) {
                // beware sSemanticObject may also be an array of argument arrays
                // {sSemanticObject, mParameters, bIgnoreFormFactors }
                const { sSemanticObject, mParameters, bIgnoreFormFactors, sAppStateKey, bCompactIntents } = oMessageBody;

                return navigationCompatibility.getSemanticObjectLinks(
                    sSemanticObject,
                    mParameters,
                    bIgnoreFormFactors,
                    undefined, // oComponent
                    sAppStateKey,
                    bCompactIntents
                );
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.isIntentSupported": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIntents } = oMessageBody;

                return navigationCompatibility.isIntentSupported(aIntents);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.isNavigationSupported": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIntents } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.isNavigationSupported(aIntents);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.CrossApplicationNavigation.backToPreviousApp": {
            async handler (oMessageBody, oMessageEvent) {
                const Navigation = await Container.getServiceAsync("Navigation");
                return Navigation.backToPreviousApp();
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.historyBack": {
            async handler (oMessageBody, oMessageEvent) {
                const { iSteps } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.historyBack(iSteps);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.toExternal": {
            async handler (oMessageBody, oMessageEvent) {
                const { oArgs } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                const oArgsClone = deepExtend({}, oArgs);
                ushellUtils.storeSapSystemToLocalStorage(oArgsClone);

                await Navigation.navigate(oArgsClone);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.CrossApplicationNavigation.expandCompactHash": {
            async handler (oMessageBody, oMessageEvent) {
                const { sHashFragment } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.expandCompactHash(sHashFragment);
                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.CrossApplicationNavigation.getDistinctSemanticObjects": {
            async handler (oMessageBody, oMessageEvent) {
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.getSemanticObjects();
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.getLinks": {
            async handler (oMessageBody, oMessageEvent) {
                const vParams = oMessageBody;

                return navigationCompatibility.getLinks(vParams);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.CrossApplicationNavigation.getPrimaryIntent": {
            async handler (oMessageBody, oMessageEvent) {
                const { sSemanticObject, mParameters } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.getPrimaryIntent(sSemanticObject, mParameters);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.CrossApplicationNavigation.hrefForAppSpecificHash": {
            async handler (oMessageBody, oMessageEvent) {
                const { sAppHash } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.getHref({
                    appSpecificRoute: sAppHash
                });
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.CrossApplicationNavigation.isInitialNavigation": {
            async handler (oMessageBody, oMessageEvent) {
                const Navigation = await Container.getServiceAsync("Navigation");
                return Navigation.isInitialNavigation();
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute": {
            async handler (oMessageBody, oMessageEvent) {
                const { appSpecificRoute, writeHistory } = oMessageBody;

                const oHash = UrlParsing.parseShellHash(hasher.getHash());

                // do nothing if new is exactly like the current one
                if (oHash.appSpecificRoute === appSpecificRoute) {
                    return;
                }
                oHash.appSpecificRoute = appSpecificRoute;
                const sNewHash = `#${UrlParsing.constructShellHash(oHash)}`;
                hasher.disableBlueBoxHashChangeTrigger = true;
                if (writeHistory === true || writeHistory === "true") {
                    hasher.setHash(sNewHash);
                } else {
                    hasher.replaceHash(sNewHash);
                }
                hasher.disableBlueBoxHashChangeTrigger = false;
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.resolveIntent": {
            async handler (oMessageBody, oMessageEvent) {
                const { sHashFragment } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                return Navigation.resolveIntent(sHashFragment);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellNavigation.toExternal": {
            async handler (oMessageBody, oMessageEvent) {
                const { oArgs, bWriteHistory } = oMessageBody;
                const ShellNavigationInternal = await Container.getServiceAsync("ShellNavigationInternal");

                ShellNavigationInternal.toExternal(oArgs, undefined, bWriteHistory);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellNavigation.toAppHash": {
            async handler (oMessageBody, oMessageEvent) {
                const { sAppHash, bWriteHistory } = oMessageBody;
                const ShellNavigationInternal = await Container.getServiceAsync("ShellNavigationInternal");

                ShellNavigationInternal.toAppHash(sAppHash, bWriteHistory);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.ShellNavigationInternal.toExternal": {
            async handler (oMessageBody, oMessageEvent) {
                const { oArgs, bWriteHistory } = oMessageBody;
                const ShellNavigationInternal = await Container.getServiceAsync("ShellNavigationInternal");

                ShellNavigationInternal.toExternal(oArgs, undefined, bWriteHistory);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.ShellNavigationInternal.toAppHash": {
            async handler (oMessageBody, oMessageEvent) {
                const { sAppHash, bWriteHistory } = oMessageBody;
                const ShellNavigationInternal = await Container.getServiceAsync("ShellNavigationInternal");

                ShellNavigationInternal.toAppHash(sAppHash, bWriteHistory);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.NavTargetResolution.getDistinctSemanticObjects": {
            async handler (oMessageBody, oMessageEvent) {
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.getDistinctSemanticObjects();

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.NavTargetResolution.expandCompactHash": {
            async handler (oMessageBody, oMessageEvent) {
                const { sHashFragment } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.expandCompactHash(sHashFragment);

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.NavTargetResolution.resolveHashFragment": {
            async handler (oMessageBody, oMessageEvent) {
                const { sHashFragment } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.resolveHashFragment(sHashFragment);

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.NavTargetResolution.isIntentSupported": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIntents } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                // isIntentSupported: [intent1, intent2, ...] => { intent1: result1, intent2: result2, ... }
                // isNavigationSupported: [intent1, intent2, ...] => [result1, result2, ...]
                const oDeferred = NavTargetResolutionInternal.isNavigationSupported(aIntents);
                const aResults = await ushellUtils.promisify(oDeferred);

                return aResults.reduce((oResult, oIntentSupported, iIndex) => {
                    const sIntent = aIntents[iIndex];
                    oResult[sIntent] = oIntentSupported;
                    return oResult;
                }, {});
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.NavTargetResolution.isNavigationSupported": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIntents } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.isNavigationSupported(aIntents);

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.NavTargetResolutionInternal.getDistinctSemanticObjects": {
            async handler (oMessageBody, oMessageEvent) {
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.getDistinctSemanticObjects();

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.NavTargetResolutionInternal.expandCompactHash": {
            async handler (oMessageBody, oMessageEvent) {
                const { sHashFragment } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.expandCompactHash(sHashFragment);

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.NavTargetResolutionInternal.resolveHashFragment": {
            async handler (oMessageBody, oMessageEvent) {
                const { sHashFragment } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.resolveHashFragment(sHashFragment);

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.NavTargetResolutionInternal.isIntentSupported": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIntents } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                // isIntentSupported: [intent1, intent2, ...] => { intent1: result1, intent2: result2, ... }
                // isNavigationSupported: [intent1, intent2, ...] => [result1, result2, ...]
                const oDeferred = NavTargetResolutionInternal.isNavigationSupported(aIntents);
                const aResults = await ushellUtils.promisify(oDeferred);

                return aResults.reduce((oResult, oIntentSupported, iIndex) => {
                    const sIntent = aIntents[iIndex];
                    oResult[sIntent] = oIntentSupported;
                    return oResult;
                }, {});
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.NavTargetResolutionInternal.isNavigationSupported": {
            async handler (oMessageBody, oMessageEvent) {
                const { aIntents } = oMessageBody;
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");

                const oDeferred = NavTargetResolutionInternal.isNavigationSupported(aIntents);

                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.UserDefaultParameters.getValue": {
            async handler (oMessageBody, oMessageEvent) {
                const { sParameterName } = oMessageBody;
                const [AppLifeCycle, UserDefaultParameters] = await Promise.all([
                    Container.getServiceAsync("AppLifeCycle"),
                    Container.getServiceAsync("UserDefaultParameters")
                ]);
                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                return UserDefaultParameters.getValue(sParameterName, oSystemContext);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.ReferenceResolver.resolveReferences": {
            async handler (oMessageBody, oMessageEvent) {
                const { aReferences } = oMessageBody;

                /**
                 * This API is for S/Cube only!
                 *
                 * For S/Cube references are resolved in the context of the outer shell.
                 * Therefore, we resolve the references without a system context.
                 * However, for regular cflp integrations we would need to resolve with a system context.
                 */

                const ReferenceResolver = await Container.getServiceAsync("ReferenceResolver");

                return ReferenceResolver.resolveReferences(aReferences);
            }
        },
        /**
         * The request is originally documented as "sap.ushell.services.appLifeCycle.getFullyQualifiedXhrUrl".
         * However, "sap.ushell.services.appLifeCycle.*" messages are transformed to "sap.ushell.AppLifeCycle.*" in the PostMessageHandler.
         * Therefore, the handler is registered as "sap.ushell.AppLifeCycle.setup" and supports both cases.
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.AppLifeCycle.getFullyQualifiedXhrUrl": {
            async handler (oMessageBody, oMessageEvent) {
                const { path } = oMessageBody;

                if (!path) {
                    // ignore empty path
                    return;
                }

                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");
                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                const sXhrUrl = oSystemContext.getFullyQualifiedXhrUrl(path);

                let sHostName = "";
                let sProtocol = "";
                let sPort = "";
                const sFlpURL = Container.getFLPUrl(true);
                const oURI = new URI(sFlpURL);

                if (oURI.protocol()) {
                    sProtocol = `${oURI.protocol()}://`;
                }
                if (oURI.hostname()) {
                    sHostName = oURI.hostname();
                }
                if (oURI.port()) {
                    sPort = `:${oURI.port()}`;
                }

                const sResult = sProtocol + sHostName + sPort + sXhrUrl;
                return sResult;
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.AppLifeCycle.getSystemAlias": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const oAppTargetResolution = oApplicationContainer.getCurrentAppTargetResolution();
                const sFullyQualifiedSystemAlias = oAppTargetResolution.systemAlias;
                const sContentProviderId = oAppTargetResolution.contentProviderId;

                const [SystemAlias] = await ushellUtils.requireAsync(["sap/ushell/ApplicationType/systemAlias"]);

                return SystemAlias.getSystemAliasInProvider(sFullyQualifiedSystemAlias, sContentProviderId);
            },
            options: {
                provideApplicationContext: true
            }
        }
    };

    return {
        register () {
            Object.keys(oDistributionPolicies).forEach((sServiceRequest) => {
                const oDistributionPolicy = oDistributionPolicies[sServiceRequest];
                PostMessageManager.setDistributionPolicy(sServiceRequest, oDistributionPolicy);
            });

            Object.keys(oServiceRequestHandlers).forEach((sServiceRequest) => {
                const oHandler = oServiceRequestHandlers[sServiceRequest];
                PostMessageManager.setRequestHandler(sServiceRequest, oHandler.handler, oHandler.options);
            });
        }
    };
});
