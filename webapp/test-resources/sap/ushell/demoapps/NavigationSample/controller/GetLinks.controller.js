// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (
    Component,
    Controller,
    JSONModel,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.NavigationSample.controller.GetLinks", {

        oApplication: null,

        onInit: function () {
            this.oInputModel = new JSONModel({
                SO: "Action",
                action: "toNavigation",
                paramsExtended: "",
                compactIntents: false,
                ignoreFormFactor: false
            });

            this.oModel = new JSONModel({
                SO: "Action",
                action: "toNavigation",
                supported: false,
                supportedColor: "red",
                navSupportedColor: "red",
                compactIntents: false,
                treatTechHintAsFilter: false,
                withAtLeastOneUsedParam: false,
                hashFragment: "",
                hashFragmentLength: 0,
                callMethod: "getLinks",
                callCount: 0,
                sortResultsBy: "intent",
                links: [],
                json: "empty"
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

        onSortResultsByChanged: function (oEvent) {
            const sSortResultsBy = oEvent.getParameters().newValue;
            this.oModel.setProperty("/sortResultsBy", sSortResultsBy);
        },
        handleTextLiveChange: function (oEvent) {
            const oMdlV1 = this.getView().getModel("v1");
            const sSemanticObject = this.byId("f2").getValue() || "";
            const sAction = this.byId("f3").getValue() || "";
            // sParams = this.byId("f4").getValue() || "",
            const sIntent = `#${sSemanticObject}-${sAction}`;

            oMdlV1.setProperty("/hashFragment", sIntent);
            oMdlV1.setProperty("/hashFragmentLength", sIntent.length);
        },
        updateFromInputModel: function () {
            const sSemanticObject = this.getView().getModel("mdlInput").getProperty("/SO");
            const sAction = this.getView().getModel("mdlInput").getProperty("/action");
            const bCompactIntents = this.getView().getModel("mdlInput").getProperty("/compactIntents");
            const bIgnoreFormFactor = this.getView().getModel("mdlInput").getProperty("/ignoreFormFactor");
            const sSortResultsBy = this.getView().getModel("v1").getProperty("/sortResultsBy");
            const bTreatTechHintAsFilter = this.getView().getModel("mdlInput").getProperty("/treatTechHintAsFilter");
            const oRootComponent = this.getRootComponent();

            Promise.all([
                Container.getServiceAsync("URLParsing"),
                Container.getServiceAsync("CrossApplicationNavigation")
            ]).then((aServices) => {
                const oURLParsingService = aServices[0];
                const oCANService = aServices[1];

                // --- call hrefForExternal ---

                this.args = {
                    target: {
                        semanticObject: sSemanticObject,
                        action: sAction
                    }
                };

                const href = oCANService.hrefForExternal(this.args, this.getRootComponent());
                if (this.getView() && this.getView().getModel()) {
                    this.getView().getModel().setProperty("/toGeneratedLink", href);
                }

                // --- call getLinks or getSemanticObjectLinks ---

                const sCallMethod = this.oModel.getProperty("/callMethod");

                let vCallArgs;

                const sCallArgsType = "nominal";
                vCallArgs = {
                    semanticObject: sSemanticObject.length > 0 ? sSemanticObject : undefined,
                    action: sAction.length > 0 ? sAction : undefined,
                    treatTechHintAsFilter: !!bTreatTechHintAsFilter,
                    ui5Component: oRootComponent,
                    compactIntents: !!bCompactIntents,
                    ignoreFormFactor: !!bIgnoreFormFactor,
                    sortResultsBy: sSortResultsBy
                };

                function fnCallDoneHandler (aResult) {
                    this.oModel.setProperty("/links", aResult.map((oEntry) => {
                        return {
                            name: oEntry.text,
                            link: oEntry.intent,
                            linkData: JSON.stringify(oEntry, null, 4),
                            json: JSON.stringify(oEntry),
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
                    oCANService[sCallMethod](vCallArgs)
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
        },

        getMyComponent: function () {
            return this.getOwnerComponent();
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
                            name: "sap.ushell.demo.NavigationSample.view.GetLinksPopover",
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
        }
    });
});
