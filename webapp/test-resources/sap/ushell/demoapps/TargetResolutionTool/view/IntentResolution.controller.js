// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/isPlainObject",
    "sap/m/MessageToast",
    "sap/ui/core/Element",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container",
    "sap/ushell/utils/UrlParsing"
], (
    isPlainObject,
    MessageToast,
    Element,
    Controller,
    JSONModel,
    jQuery,
    Container,
    URLParsing
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.TargetResolutionTool.view.IntentResolution", {
        onInit: async function () {
            this.oClientSideTargetResolution = await Container.getServiceAsync("ClientSideTargetResolution");

            this.oModel = new JSONModel({
                matchedInbounds: [],
                tookString: ""
            });
            this.getView().setModel(this.oModel);

            this.oModel.bindTree("/").attachChange(this._onModelChanged);
        },
        prepareModelData: function (oMatchingTarget, sFixedHashFragment) {
            const oModelData = {
                rawMatchingTarget: JSON.stringify(oMatchingTarget, null, "   "),
                rawResolutionResult: "N/A",
                intent: `#${oMatchingTarget.inbound.semanticObject}-${oMatchingTarget.inbound.action}`,
                priorityString: oMatchingTarget.priorityString,
                compactSignature: this.oClientSideTargetResolution._compactSignatureNotation(oMatchingTarget.inbound.signature),
                url: oMatchingTarget.inbound.resolutionResult
                    ? oMatchingTarget.inbound.resolutionResult.url
                    : "Inbound did not provide a resolution result",
                inbound: {}, // filled separately
                resolutionResult: oMatchingTarget.inbound.resolutionResult,
                parameters: [],
                additionalParameters: oMatchingTarget.inbound.signature.additionalParameters,
                resolvedResolutionResult: {
                    text: "N/A",
                    url: "N/A",
                    applicationType: "N/A",
                    additionalInformation: "N/A",
                    ui5ComponentName: "N/A",
                    applicationDependencies: "N/A"
                },
                resolvedIn: ""
            };

            // Make sure application dependencies comes formatted as a string
            const oResolutionResult = oModelData.resolutionResult;
            if (typeof oResolutionResult.applicationDependencies !== "string") {
                if (!isPlainObject(oResolutionResult.applicationDependencies)) {
                    oResolutionResult.applicationDependencies = "Unknown type (should be object or string)";
                } else {
                    oResolutionResult.applicationDependencies = JSON.stringify(
                        oResolutionResult.applicationDependencies, null, "   ");
                }
            }

            // Fill inbound properties
            const oInbound = oMatchingTarget.inbound;
            oModelData.inbound.title = oInbound.title;
            oModelData.inbound.deviceTypes = Object.keys(oInbound.deviceTypes)
                .filter((sKey) => { return !!oInbound.deviceTypes[sKey]; })
                .join("; ");

            // Fill parameters
            const aSeparatedParameters = [];
            const oParameters = (oInbound.signature || {}).parameters || {};

            Object.keys(oParameters).forEach((sParamName) => {
                const oParameter = oParameters[sParamName];
                const bRequired = !!oParameter.required || false;

                // Create filter parameter
                if (typeof oParameter.filter === "object") {
                    aSeparatedParameters.push({
                        typeIcon: "locked",
                        typeIconColor: bRequired ? "black" : "gray",
                        name: sParamName,
                        value: oParameter.filter.value || "<UNKNOWN VALUE>"
                    });
                }

                // Create default parameter
                if (typeof oParameter.defaultValue === "object") {
                    aSeparatedParameters.push({
                        typeIcon: "unlocked",
                        typeIconColor: bRequired ? "black" : "gray",
                        name: sParamName,
                        value: oParameter.defaultValue.value || "<UNKNOWN VALUE>"
                    });
                }

                // RenameTo Parameters
                if (typeof oParameter.renameTo === "string") {
                    aSeparatedParameters.push({
                        typeIcon: "redo",
                        typeIconColor: "black",
                        name: sParamName,
                        value: (oParameter || {}).renameTo
                    });
                }
            });
            oModelData.parameters = aSeparatedParameters;

            const oDeferred = new jQuery.Deferred();
            // Run resolve hash fragment to get the actual resolution result
            this._resolveHashFragment(sFixedHashFragment, oMatchingTarget)
                .done((oResolvedHashFragment, iTime) => {
                    oModelData.resolvedResolutionResult = oResolvedHashFragment;
                    oModelData.rawResolutionResult = JSON.stringify(oResolvedHashFragment, null, "   ");
                    oModelData.resolvedIn = ` - resolved in ${this.roundFloat(iTime)}ms`;
                })
                .always(() => {
                    oDeferred.resolve(oModelData);
                });

            return oDeferred.promise();
        },
        _resolveHashFragment: function (sFixedHashFragment, oForceMatchingTarget) {
            return Container.getServiceAsync("ClientSideTargetResolution").then((oClientSideTargetResolution) => {
                const fnOriginalGetInbounds = oClientSideTargetResolution._oInboundProvider.getInbounds;
                oClientSideTargetResolution._oInboundProvider.getInbounds = async function () {
                    return [oForceMatchingTarget.inbound];
                };

                const oDeferred = new jQuery.Deferred();
                const bHighResPerformance = !!window.performance;
                const iResolveHashFragmentTime = bHighResPerformance
                    ? window.performance.now()
                    : (new Date()).getTime();
                oClientSideTargetResolution.resolveHashFragment(sFixedHashFragment)
                    .then((oResolutionResult) => {
                        oClientSideTargetResolution._oInboundProvider.getInbounds = fnOriginalGetInbounds;
                        oDeferred.resolve(
                            oResolutionResult,
                            (bHighResPerformance ? window.performance.now() : (new Date()).getTime()) - iResolveHashFragmentTime
                        );
                    })
                    .catch((oError) => {
                        oClientSideTargetResolution._oInboundProvider.getInbounds = fnOriginalGetInbounds;
                        MessageToast.show(`Failed to resolve ${sFixedHashFragment}: ${oError.message}`);
                        oDeferred.reject(oError);
                    });
                return oDeferred.promise();
            });
        },
        onBtnResolveHashPress: function () {
            const sHashFragment = Element.getElementById(this.createId("txtIntent")).getValue();
            const sFixedHashFragment = sHashFragment.indexOf("#") === 0 ? sHashFragment : `#${sHashFragment}`;

            const oList = Element.getElementById(this.createId("lstInbounds"));
            oList.setBusy(true);

            const oShellHash = URLParsing.parseShellHash(sFixedHashFragment);
            if (oShellHash === undefined) {
                MessageToast.show("Shell hash cannot be parsed");
                oList.setBusy(false);
                return;
            }

            const bHighResPerformance = !!window.performance;

            let iGetInboundsTime = bHighResPerformance
                ? window.performance.now()
                : (new Date()).getTime();

            this.oClientSideTargetResolution._oInboundProvider.getInbounds()
                .then((aInbounds) => {
                    iGetInboundsTime = bHighResPerformance
                        ? window.performance.now() - iGetInboundsTime
                        : (new Date()).getTime() - iGetInboundsTime;

                    let iMatchingInboundsTime = bHighResPerformance
                        ? window.performance.now()
                        : (new Date()).getTime();

                    this.oClientSideTargetResolution._getMatchingInbounds(oShellHash, aInbounds)
                        .then((aMatchingTargets) => {
                            iMatchingInboundsTime = bHighResPerformance
                                ? window.performance.now() - iMatchingInboundsTime
                                : (new Date()).getTime() - iMatchingInboundsTime;

                            const oModel = this.getView().getModel();
                            const oModelData = {
                                matchedInbounds: [],
                                tookString: `took ${
                                    this.roundFloat(iGetInboundsTime)
                                }ms for _oInboundProvider.getInbounds() call, and ${
                                    this.roundFloat(iMatchingInboundsTime)
                                }ms for _getMatchingInbounds() call`
                            };

                            const that = this;
                            function processNextMatchingTarget (aRemainingMatchingTargets) {
                                if (aRemainingMatchingTargets.length === 0) {
                                    oModel.setData(oModelData);
                                    return;
                                }

                                that.prepareModelData(aRemainingMatchingTargets.shift(), sFixedHashFragment)
                                    .done((oPreparedModelData) => {
                                        oModelData.matchedInbounds.push(oPreparedModelData);
                                    })
                                    .then(() => {
                                        processNextMatchingTarget(aRemainingMatchingTargets);
                                    });
                            }

                            processNextMatchingTarget(aMatchingTargets);
                        })
                        .catch((oError) => {
                            MessageToast.show(oError.message);
                        });
                })
                .catch((oError) => {
                    MessageToast.show(oError.message);
                })
                .finally(() => {
                    oList.setBusy(false);
                });
        },
        roundFloat: function (iNum) {
            return Number(`${Math.round(`${iNum}e3`)}e-3`)
                .toFixed(3);
        },
        onInboundListItemSelected: function (oEvent) {
            const oSelectedInbound = oEvent.getSource().getBindingContext().getObject();

            this.oApplication.navigate("toView", "ShowResolvedTarget", oSelectedInbound);
        },
        _onModelChanged: function () {
            // read from the model and update internal state
        },
        onExit: function () { }
    });
});
