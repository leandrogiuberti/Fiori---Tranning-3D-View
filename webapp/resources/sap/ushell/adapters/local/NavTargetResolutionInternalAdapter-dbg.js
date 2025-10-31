// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The NavTargetResolutionInternal adapter for the demo platform.
 * @version 1.141.1
 * @since 1.120
 * @private
 */
sap.ui.define([
    "sap/ushell/services/ClientSideTargetResolution/VirtualInbounds",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/utils",
    "sap/ushell/Container"
], (
    oVirtualInbounds,
    ObjectPath,
    jQuery,
    Log,
    utils,
    Container
) => {
    "use strict";

    /**
     * This adapter reads its configuration from the demo config, where the target applications are defined.
     * Note that only a constructed tuple is returned, which returns the platform-neutral
     * expected result (cf. adjustResult in the ABAP Platform adapter)
     * It does not perform parameter matching of form factor selection like other implementations on real systems
     *
     * @param {object} oUnused unused
     * @param {string} sParameter parameters
     * @param {object} oAdapterConfiguration configuration, typically contains the statically defined applications
     * @private
     */
    function NavTargetResolutionInternalAdapter (oUnused, sParameter, oAdapterConfiguration) {
        function addVirtualInboundsToApplications (aVirtualInbounds, oApplications) {
            aVirtualInbounds.forEach((oInbound) => {
                const sIntent = `${oInbound.semanticObject}-${oInbound.action}`;
                oApplications[sIntent] = oInbound.resolutionResult;
            });
        }

        const oApplications = ObjectPath.create("config.applications", oAdapterConfiguration);

        const aVirtualInbounds = oVirtualInbounds.getInbounds();
        addVirtualInboundsToApplications(aVirtualInbounds, oApplications);

        this.resolveHashFragment = function (sHashFragment) {
            const oDeferred = new jQuery.Deferred();
            let sParameters;

            if (sHashFragment && sHashFragment.charAt(0) !== "#") {
                throw new utils.Error("Hash fragment expected",
                    "sap.ushell.renderers.minimal.Shell");
            }

            sHashFragment = sHashFragment.substring(1);

            if (!sHashFragment && !oApplications[sHashFragment]) {
                oDeferred.resolve(undefined);
            } else {
                Log.info(`Hash Fragment: ${sHashFragment}`);

                // Eliminate app-specific hash part (inner-app routes) as they aren't relevant for resolution
                let iIndex = sHashFragment.indexOf("&/");
                if (iIndex >= 0) {
                    sHashFragment = sHashFragment.slice(0, iIndex);
                }

                // Split out intent params
                iIndex = sHashFragment.indexOf("?");
                if (iIndex >= 0) {
                    sParameters = sHashFragment.slice(iIndex + 1);
                    sHashFragment = sHashFragment.slice(0, iIndex);
                }

                const oResult = oApplications[sHashFragment];
                // we need a copy (!), as we cannot modify the original data configured
                if (oResult) {
                    const oReturnedResult = {
                        additionalInformation: oResult.additionalInformation,
                        applicationType: oResult.applicationType,
                        url: oResult.url,
                        text: oResult.text,
                        fullWidth: oResult.fullWidth,
                        navigationMode: "embedded"
                    };
                    // add sParameter to URL
                    if (sParameters) {
                        oReturnedResult.url += (oReturnedResult.url.indexOf("?") < 0) ? "?" : "&";
                        oReturnedResult.url += sParameters;
                    }
                    if (oResult.navigationMode !== undefined) {
                        oReturnedResult.navigationMode = oResult.navigationMode;
                    }
                    oDeferred.resolve(oReturnedResult);
                } else {
                    oDeferred.reject(new Error(`Could not resolve link '${sHashFragment}'`));
                }
            }

            return oDeferred.promise();
        };

        this.getSemanticObjectLinks = function (sSemanticObject, mParams) {
            const aResult = [];
            let i = 0;
            const oDeferred = new jQuery.Deferred();

            if (!sSemanticObject) {
                setTimeout(() => {
                    oDeferred.resolve([]);
                }, 0);
            } else {
                Container.getServiceAsync("URLParsing").then((oURLParsingService) => {
                    const sParameters = oURLParsingService.paramsToString(mParams);
                    Log.info(`getSemanticObjectLinks: ${sSemanticObject}`);
                    for (const sIntent in oApplications) {
                        if (oApplications.hasOwnProperty(sIntent) && sIntent.substring(0, sIntent.indexOf("-")) === sSemanticObject) {
                            // result must have at least .text and .sIntent
                            // see documentation of getSemanticObjectLinks in NavTargetResolutionInternal.js
                            aResult[i] = oApplications[sIntent];
                            aResult[i].id = sIntent;
                            aResult[i].text = aResult[i].text || aResult[i].description || "no text";
                            aResult[i].intent = `#${sIntent}`;
                            if (sParameters !== "") {
                                if (aResult[i].intent.indexOf("?") !== -1) {
                                    aResult[i].intent += `&${sParameters}`;
                                } else {
                                    aResult[i].intent += `?${sParameters}`;
                                }
                            }
                            i += 1;
                        }
                    }
                    if (aResult) {
                        oDeferred.resolve(aResult);
                    } else {
                        oDeferred.reject(new Error(`Could not get links for '${sSemanticObject}'`));
                    }
                });
            }
            return oDeferred.promise();
        };

        /**
         * Indicates whether the given intent(s) are supported,
         * "Supported" means that navigation to the intent is possible.
         * Note that the local adapter does not perform complex parameter matching!
         *
         * @param {string[]} aIntents
         *   the intents (such as <code>"#AnObject-Action?A=B&C=e&C=j"</code>) to be checked
         *
         * @returns {jQuery.Promise} Resolves with a map containing the intents from <code>aIntents</code> as keys. The map values are
         *   objects with a property <code>supported</code> of type <code>boolean</code>.<br/>
         *   Example:
         * <pre>
         * {
         *   "#AnObject-Action?A=B&C=e&C=j": { supported: false },
         *   "#AnotherObject-Action2": { supported: true }
         * }
         * </pre>
         */
        this.isIntentSupported = function (aIntents) {
            const oDeferred = new jQuery.Deferred();
            const mSupportedByIntent = {};
            const aDeferrers = [];
            const that = this;

            /**
             * Sets the result for the given intent as indicated.
             * @param {string} sIntent the intent.
             * @param {boolean} bSupported whether it is supported.
             */
            function setResult (sIntent, bSupported) {
                mSupportedByIntent[sIntent] = { supported: bSupported };
            }

            aIntents.forEach((sIntent, i) => {
                // we have to use separate promises that we always resolve
                // because jQuery.when immediately rejects if the first promise is rejected
                const oDeferredWrapper = new jQuery.Deferred();
                aDeferrers.push(oDeferredWrapper.promise());
                that.resolveHashFragment(sIntent)
                    .fail((oError) => {
                        setResult(sIntent, false);
                        oDeferredWrapper.resolve();
                    })
                    .done((oApplication) => {
                        setResult(sIntent, true);
                        oDeferredWrapper.resolve();
                    });
            });
            if (aIntents.length > 0) {
                jQuery.when.apply(jQuery, aDeferrers).always(() => {
                    oDeferred.resolve(mSupportedByIntent);
                });
            } else {
                oDeferred.resolve(mSupportedByIntent);
            }
            return oDeferred.promise();
        };
    }

    return NavTargetResolutionInternalAdapter;
}, /* bExport= */ false);
