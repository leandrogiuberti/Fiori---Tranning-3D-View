// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Component",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (Log, Component, Controller, JSONModel, Container) => {
    "use strict";

    function convertParametersToSimpleSyntax (oExtendedParameters) {
        try {
            return Object.keys(oExtendedParameters).map((sParameterName) => {
                const vParameterValue = oExtendedParameters[sParameterName].value;

                if (Object.prototype.toString.apply(vParameterValue) === "[object Array]") {
                    return vParameterValue.map((sValue) => {
                        return `${sParameterName}=${sValue}`;
                    }).join("&");
                }

                const sParameterValue = `${vParameterValue}`;
                return `${sParameterName}=${sParameterValue}`;
            }).join("&");
        } catch (oError) {
            return "cannot convert: check format";
        }
    }

    function convertParametersToExtendedSyntax (sParamsSimple) {
        const oParamsExtended = sParamsSimple.split("&").map((sNameValue) => {
            const aNameValue = sNameValue.split("=");
            return {
                name: aNameValue[0],
                value: aNameValue[1]
            };
        }).reduce((oExtendedParams, oParamParsed) => {
            if (oExtendedParams[oParamParsed.name]) {
                const vExistingValue = oExtendedParams[oParamParsed.name].value;

                if (Object.prototype.toString.apply(vExistingValue) === "[object Array]") {
                    vExistingValue.push(oParamParsed.value);
                } else { // assume existing value is a string
                    oExtendedParams[oParamParsed.name].value = [
                        vExistingValue, oParamParsed.value
                    ];
                }

                return oExtendedParams;
            }

            oExtendedParams[oParamParsed.name] = { value: oParamParsed.value };
            return oExtendedParams;
        }, {});

        return JSON.stringify(oParamsExtended, null, 3);
    }

    return Controller.extend("sap.ushell.demo.AppNavSample.view.View4", {
        oApplication: null,
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberof view.Detail
         */
        onInit: function () {
            this.oInputModel = new JSONModel({
                SO: "Action",
                action: "toappnavsample",
                params: "A=B&C=D",
                paramsExtended: "",
                compactIntents: false,
                ignoreFormFactor: false,
                useExtendedParamSyntax: false
            });

            this.oModel = new JSONModel({
                SO: "Action",
                action: "toappnavsample",
                params: "A=B&C=D",
                supported: false,
                supportedColor: "red",
                navSupportedColor: "red",
                compactIntents: false,
                treatTechHintAsFilter: false,
                withAtLeastOneUsedParam: false,
                hashFragment: "",
                hashFragmentLength: 0,
                callMethod: "getSemanticObjectLinks",
                callCount: 0,
                sortResultsBy: "intent",
                links: []
            });

            this.getView().setModel(this.oInputModel, "mdlInput");
            this.getView().setModel(this.oModel, "v1");

            this.updateFromInputModel();

            // register an event handler on the model, to track future changes
            this.oInputModel.bindTree("/").attachChange(() => {
                this.updateFromInputModel();
            });

            this._initCodeEditor();
        },
        _initCodeEditor: function () {
            const oCodeEditor = this.getView().byId("callInfo");
            const sCallMethod = this.oModel.getProperty("/callMethod") || "";
            const sCallArgs = this.oModel.getProperty("/callArgs") || "";
            const sCodeEditorValue = "sap.ushell.Container.getServiceAsync(\"CrossApplicationNavigation\")\n"
            + "\t .then(function (CrossApplicationNavigation) {\n"
            + `\t\tCrossApplicationNavigation.${sCallMethod}(${sCallArgs});\n`
            + "\t});";

            oCodeEditor.setValue(sCodeEditorValue);
        },
        onParamSyntaxChanged: function (oEvent) {
            let sExtendedParameters;
            let sSimpleParameters;
            let oExtendedParameters;

            if (oEvent.getSource().getState() === true) {
                sSimpleParameters = this.oInputModel.getProperty("/params");
                sExtendedParameters = convertParametersToExtendedSyntax(sSimpleParameters);
                this.oInputModel.setProperty("/paramsExtended", sExtendedParameters);
            } else {
                try {
                    oExtendedParameters = JSON.parse(this.oInputModel.getProperty("/paramsExtended"));
                } catch (oError) {
                    oExtendedParameters = {};
                }
                sSimpleParameters = convertParametersToSimpleSyntax(oExtendedParameters);
                this.oInputModel.setProperty("/params", sSimpleParameters);
            }
        },
        onMethodSelected: function (oEvent) {
            const sMethod = oEvent.getSource().getSelectedButton().getText();
            this.oModel.setProperty("/callMethod", sMethod);
            if (sMethod === "getSemanticObjectLinks") {
                this.oInputModel.setProperty("/useExtendedParamSyntax", false);
            }
            this.updateFromInputModel();
        },
        onSortResultsByChanged: function (oEvent) {
            const sSortResultsBy = oEvent.getParameters().newValue;
            this.oModel.setProperty("/sortResultsBy", sSortResultsBy);
        },
        handleTextLiveChange: function (oEvent) {
            const oMdlV1 = this.getView().getModel("v1");
            const sSemanticObject = this.byId("f2").getValue() || "";
            const sAction = this.byId("f3").getValue() || "";
            const sParams = this.byId("f4").getValue() || "";
            const sIntent = `#${sSemanticObject}-${sAction}${sParams.length > 0 ? `?${sParams}` : ""}`;

            oMdlV1.setProperty("/hashFragment", sIntent);
            oMdlV1.setProperty("/hashFragmentLength", sIntent.length);
        },
        updateFromInputModel: function () {
            const sSemanticObject = this.getView().getModel("mdlInput").getProperty("/SO");
            const sAction = this.getView().getModel("mdlInput").getProperty("/action");
            const bUseExtended = this.getView().getModel("mdlInput").getProperty("/useExtendedParamSyntax");
            const sExtendedParams = this.getView().getModel("mdlInput").getProperty("/paramsExtended");
            const sSimpleParams = this.getView().getModel("mdlInput").getProperty("/params");
            const bCompactIntents = this.getView().getModel("mdlInput").getProperty("/compactIntents");
            const bWithAtLeastOneUsedParam = this.getView().getModel("mdlInput").getProperty("/withAtLeastOneUsedParam");
            const bIgnoreFormFactor = this.getView().getModel("mdlInput").getProperty("/ignoreFormFactor");
            const sSortResultsBy = this.getView().getModel("v1").getProperty("/sortResultsBy");
            const bTreatTechHintAsFilter = this.getView().getModel("mdlInput").getProperty("/treatTechHintAsFilter");
            const oRootComponent = this.getRootComponent();

            Promise.all([
                Container.getServiceAsync("URLParsing"),
                Container.getServiceAsync("CrossApplicationNavigation")
            ], (aServices) => {
                const oURLParsingService = aServices[0];
                const oCANService = aServices[1];
                let oExtendedParams;
                if (bUseExtended) {
                    try {
                        oExtendedParams = JSON.parse(sExtendedParams);
                    } catch (oError) {
                        Log.error("updateFromInputModel failed:", oError);
                        oExtendedParams = {};
                    }
                }

                const oSimpleParams = oURLParsingService.parseParameters(`?${sSimpleParams}` || "");

                // --- call hrefForExternal ---

                this.args = {
                    target: {
                        semanticObject: sSemanticObject,
                        action: sAction
                    },
                    params: bUseExtended
                        ? convertParametersToSimpleSyntax(sSimpleParams) // extended syntax not supported in this case
                        : sSimpleParams
                };

                const href = oCANService.hrefForExternal(this.args, this.getRootComponent());
                if (this.getView() && this.getView().getModel()) {
                    this.getView().getModel().setProperty("/toGeneratedLink", href);
                }

                // --- call getLinks or getSemanticObjectLinks ---

                const sCallMethod = this.oModel.getProperty("/callMethod");

                let sCallArgsType;
                let vCallArgs;

                if (sCallMethod === "getLinks") {
                    sCallArgsType = "nominal";
                    vCallArgs = {
                        semanticObject: sSemanticObject.length > 0 ? sSemanticObject : undefined,
                        action: sAction.length > 0 ? sAction : undefined,
                        params: bUseExtended ? oExtendedParams : oSimpleParams,
                        withAtLeastOneUsedParam: bWithAtLeastOneUsedParam,
                        treatTechHintAsFilter: bTreatTechHintAsFilter,
                        ui5Component: oRootComponent,
                        compactIntents: bCompactIntents,
                        ignoreFormFactor: bIgnoreFormFactor,
                        sortResultsBy: sSortResultsBy
                    };
                } else {
                    sCallArgsType = "positional";
                    vCallArgs = [
                        sSemanticObject,

                        bUseExtended // oParams
                            ? oExtendedParams
                            : oSimpleParams,

                        bIgnoreFormFactor, // bIgnoreFormFactor
                        oRootComponent,
                        undefined, // sAppStateKey
                        bCompactIntents
                    ];
                }

                function fnCallDoneHandler (aResult) {
                    this.oModel.setProperty("/links", aResult.map((oEntry) => {
                        return {
                            name: oEntry.text,
                            link: oEntry.intent,
                            escapedLink: oCANService.hrefForExternal({
                                target: {
                                    shellHash: oEntry.intent
                                }
                            }, oRootComponent)
                        };
                    }));
                }

                if (sCallArgsType === "positional") {
                    oCANService[sCallMethod].apply(oCANService, vCallArgs)
                        .done(fnCallDoneHandler.bind(this));
                } else if (sCallArgsType === "nominal") {
                    oCANService[sCallMethod](oCANService, vCallArgs)
                        .done(fnCallDoneHandler.bind(this));
                } else {
                    throw new Error(`Unknown call argument type '${sCallArgsType}'`);
                }

                this.oModel.setProperty("/callArgsType", sCallArgsType);

                // Remove the app root component before saving the arguments
                const sRootComponentName = `<AppRootComponent ${oRootComponent.getId()}>`;
                if (Object.prototype.toString.apply(vCallArgs) === "[object Array]") {
                    vCallArgs = vCallArgs.map((vArg) => {
                        return vArg === oRootComponent
                            ? sRootComponentName
                            : vArg;
                    });
                    let sCallArgs = JSON.stringify(vCallArgs, null, 3);

                    // remove square brackets
                    sCallArgs = sCallArgs.slice(1, sCallArgs.length - 1);
                    this.oModel.setProperty("/callArgs", sCallArgs);
                } else {
                    vCallArgs.ui5Component = sRootComponentName;
                    this.oModel.setProperty("/callArgs", JSON.stringify(vCallArgs, null, 3));
                }

                this.oModel.setProperty("/callCount", this.oModel.getProperty("/callCount") + 1);

                const sShellHash = `#${oURLParsingService.constructShellHash(this.args)}`;
                oCANService.isIntentSupported([sShellHash]).done((oResult) => {
                    if (oResult && oResult[sShellHash].supported === true) {
                        this.oModel.setProperty("/supported", "supported");
                        this.oModel.setProperty("/supportedColor", "green");
                    } else {
                        this.oModel.setProperty("/supported", "not supported");
                        this.oModel.setProperty("/supportedColor", "red");
                    }
                });
                oCANService.isNavigationSupported([this.args]).done((oResult) => {
                    if (oResult && oResult[0].supported === true) {
                        this.oModel.setProperty("/navSupported", "supported");
                        this.oModel.setProperty("/navSupportedColor", "green");
                    } else {
                        this.oModel.setProperty("/navSupported", "not supported");
                        this.oModel.setProperty("/navSupportedColor", "red");
                    }
                });
            });

            this.handleTextLiveChange();
        },

        getMyComponent: function () {
            return this.getOwnerComponent();
        },

        handleBtn1Press: function () {
            this.oApplication.navigate("toView", "View2");
        },

        handleBtnGSOPress: function () {
            this.updateFromInputModel();
        },

        handleListLinkPress: function (ev) {
            const sLink = ev.getSource().getSelectedItem().data("navigateTo");
            Container.getServiceAsync("CrossApplicationNavigation").then((oCANService) => {
                oCANService.toExternal({ target: { shellHash: sLink } });
            });
        },

        handleBtnAddParamsPress: function (oEvent) {
            const sCurrentParams = this.getView().getModel("mdlInput").getProperty("/params");
            const iNumParamsCurrent = sCurrentParams.split("&").length;
            const iNumParams = iNumParamsCurrent * 2;
            const iLastNum = parseInt(sCurrentParams.split(/[a-zA-Z]/).pop(), 10);

            const iStartFrom = (iLastNum || 0) + 1;
            const aParams = [];

            if (sCurrentParams) {
                aParams.push(sCurrentParams);
            }

            for (let i = iStartFrom; i <= iStartFrom + iNumParams; i++) {
                aParams.push(`p${i}=v${i}`);
            }

            this.getView().getModel("mdlInput").setProperty("/params", aParams.join("&"));
        },

        handleBtnExpandPress: function (oEvent) {
            // get link text
            const oButton = oEvent.getSource();
            const oModel = new JSONModel();

            oModel.setData({
                linkText: oButton.data("linkText")
            });

            // create popover
            if (!this._oPopoverPromise) {
                this._oPopoverPromise = new Promise((resolve, reject) => {
                    sap.ui.require(["/sap/ui/core/Fragment"], (Fragment) => {
                        Fragment.load({
                            name: "sap.ushell.demo.AppNavSample.view.View4Popover",
                            type: "XML",
                            controller: this
                        }).then((popover) => {
                            this._oPopover = popover;
                            this.getView().addDependent(this._oPopover);
                            resolve(popover);
                        });
                    }, reject);
                });
            }

            this._oPopoverPromise.then(() => {
                this._oPopover.setModel(oModel);
                // delay because addDependent will do a async rerendering and the
                // actionSheet will immediately close without it.
                setTimeout(() => {
                    this._oPopover.openBy(oButton);
                }, 0);
            });
        },
        getRootComponent: function () {
            return Component.getOwnerComponentFor(this.getView());
        },

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberof view.Detail
         */
        onExit: function () {
            Log.info("sap.ushell.demo.AppNavSample: onExit of View4");
        }
    });
});
