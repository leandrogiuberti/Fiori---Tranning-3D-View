// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/tiles/utils",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/utils/LaunchpadError"
], (Controller, tileUtils, JSONModel, jQuery, Log, LaunchpadError) => {
    "use strict";

    return Controller.extend("sap.ushell.components.tiles.action.ActionTile", {
        onInit: function () {
            const oView = this.getView();
            const oViewData = oView.getViewData();
            const oResourceModel = tileUtils.getResourceBundleModel();
            const oTileApi = oViewData.chip; // instance
            const oConfig = tileUtils.getActionConfiguration(oTileApi);
            const that = this;

            function formatDisplayText (sSemanticObject, sSemanticAction) {
                const oBundle = tileUtils.getResourceBundle();
                const sResult = `${oBundle.getText("configuration.semantic_object")}:\n${sSemanticObject}\n\n${
                    oBundle.getText("configuration.semantic_action")}:\n${sSemanticAction}`;
                return sResult;
            }

            oView.setModel(oResourceModel, "i18n");
            const oModel = new JSONModel({
                config: oConfig,
                displayText: formatDisplayText(oConfig.semantic_object, oConfig.semantic_action)
            });
            oView.setModel(oModel);

            // implement configurationUi contract: setup configuration UI
            if (oTileApi.configurationUi.isEnabled()) {
                // attach configuration UI provider, which is essentially a components.tiles.action.Configuration
                oTileApi.configurationUi.setAsyncUiProvider(() => {
                    return tileUtils.getConfigurationUi(
                        that.getView(),
                        "sap.ushell.components.tiles.action.Configuration"
                    ).then((oConfigurationUi) => {
                        oTileApi.configurationUi.attachCancel(that.onCancelConfiguration.bind(null, oConfigurationUi));
                        oTileApi.configurationUi.attachSave(that.onSaveConfiguration.bind(null, oConfigurationUi, formatDisplayText));
                        return oConfigurationUi;
                    });
                });
                oView.byId("actionTile").setTooltip(tileUtils.getResourceBundle().getText("edit_configuration.tooltip"));
            }
        },

        onPress: function (oEvent) {
            // trigger to show the configuration UI if the tile is pressed in Admin mode
            const oTileApi = this.getView().getViewData().chip;
            if (oTileApi.configurationUi.isEnabled()) {
                oTileApi.configurationUi.display();
            }
        },

        // configuration save handler
        // The target mapping tile is enhanced with mapping_signature and supported form_factors properties.
        onSaveConfiguration: function (oConfigurationView, fnFormatDisplayText) {
            // the deferred object required from the configurationUi contract
            const oDeferred = jQuery.Deferred();
            let oModel = oConfigurationView.getModel();
            // tile model placed into configuration model by getConfigurationUi
            const oTileModel = oModel.getProperty("/tileModel");
            const oTileApi = oConfigurationView.getViewData().chip;

            // If the input fields icon, semantic object and action are failing the input validations, then through an error message requesting the
            // user to enter/correct those fields
            const bReject = tileUtils.checkTMInputOnSaveConfig(oConfigurationView);
            if (bReject) {
                oDeferred.reject(new Error("mandatory_fields_missing"));
                return oDeferred.promise();
            }
            // Before saving the model data, check if Mapping signature table contains duplicate parameter names
            // in this case the save will fail and all the data will be lost as this is the designer behavior.
            const oBundle = tileUtils.getResourceBundle();
            if (tileUtils.tableHasDuplicateParameterNames(oModel.getProperty("/config/rows"))) {
                oDeferred.reject(new Error(oBundle.getText("configuration.signature.uniqueParamMessage.text")));
            } else if (!tileUtils.tableHasInvalidSapPrelaunchOperationValue(oModel.getProperty("/config/rows"))) {
                const sSapPrelaunchOperationsTemplate = JSON.stringify([{
                    type: "split",
                    source: "p1",
                    target: ["p2", "p3"]
                }, {
                    type: "merge",
                    source: ["p4", "p5"],
                    target: "p6"
                }]);
                oDeferred.reject(new Error(oBundle.getText("configuration.signature.invalidSapPrelaunchOperationsMessage.text", [sSapPrelaunchOperationsTemplate])));
            } else { // only if the data is valid proceed with the save operation
                // Decide according to special flag if the setting in form factor are default
                // if so , the configuration should not be saved - this is crucial for the backend checks
                const oFormFactor = oModel.getProperty("/config/formFactorConfigDefault") ? undefined : tileUtils.buildFormFactorsObject(oModel);
                const sMappingSignature = tileUtils.getMappingSignatureString(oModel.getProperty("/config/rows"), oModel.getProperty("/config/isUnknownAllowed"));
                const oMappingSignature = tileUtils.getMappingSignature(oModel.getProperty("/config/rows"), oModel.getProperty("/config/isUnknownAllowed"));
                // get the configuration to save from the model
                const configToSave = {
                    semantic_object: (oModel.getProperty("/config/semantic_object") || "").trim(),
                    semantic_action: (oModel.getProperty("/config/semantic_action") || "").trim(),
                    display_title_text: (oModel.getProperty("/config/display_title_text") || "").trim(),
                    url: (oModel.getProperty("/config/url") || "").trim(),
                    ui5_component: (oModel.getProperty("/config/ui5_component") || "").trim(),
                    navigation_provider: (oModel.getProperty("/config/navigation_provider") || "").trim(),
                    navigation_provider_role: (oModel.getProperty("/config/navigation_provider_role") || "").trim(),
                    navigation_provider_instance: (oModel.getProperty("/config/navigation_provider_instance") || "").trim(),
                    target_application_id: (oModel.getProperty("/config/target_application_id") || "").trim(),
                    target_application_alias: (oModel.getProperty("/config/target_application_alias") || "").trim(),
                    transaction: {
                        code: (oModel.getProperty("/config/transaction/code") || "").trim()
                    },
                    web_dynpro: {
                        application: (oModel.getProperty("/config/web_dynpro/application") || "").trim(),
                        configuration: (oModel.getProperty("/config/web_dynpro/configuration") || "").trim()
                    },
                    target_system_alias: (oModel.getProperty("/config/target_system_alias") || "").trim(),
                    display_info_text: (oModel.getProperty("/config/display_info_text") || "").trim(),
                    form_factors: oFormFactor, // retrieve a structure describing form factor's mode (from application or admin selection) + form
                    // factors values.
                    mapping_signature: sMappingSignature,
                    signature: oMappingSignature
                };
                // use bag in order to store translatable properties
                const tilePropertiesBag = oTileApi.bag.getBag("tileProperties");
                tilePropertiesBag.setText("display_title_text", configToSave.display_title_text);

                // use configuration contract to write parameter values
                oTileApi.writeConfiguration.setParameterValues({
                    tileConfiguration: JSON.stringify(configToSave)
                },
                // success handler
                () => {
                    const oConfigurationConfig = tileUtils.getActionConfiguration(oTileApi, false);
                    const oTileConfig = tileUtils.getActionConfiguration(oTileApi, true);
                    // switching the model under the tile -> keep the tile model
                    oModel = new JSONModel({
                        config: oConfigurationConfig,
                        tileModel: oTileModel
                    });
                    oConfigurationView.setModel(oModel);
                    // update model (no merge)
                    oTileModel.setData({
                        config: oTileConfig,
                        displayText: fnFormatDisplayText(oTileConfig.semantic_object, oTileConfig.semantic_action)
                    }, false);
                    // Added for new LPD_CUST implementation
                    tilePropertiesBag.save(
                        // success handler
                        () => {
                            Log.debug("property bag 'tileProperties' saved successfully");
                            oDeferred.resolve();
                        // fnFailure
                        }, (mErrorMessages, mErrorInfo) => {
                            const sFirstFailedBag = Object.keys(mErrorMessages)[0];

                            const oError = new LaunchpadError(`Bag save failed: ${mErrorMessages[sFirstFailedBag]}`, {
                                info: mErrorInfo[sFirstFailedBag],
                                otherMessages: mErrorMessages,
                                otherInfo: mErrorInfo
                            });
                            Log.error("property bag 'tileProperties' save failed", oError, "sap.ushell.components.tiles.action.ActionTile.controller");
                            oDeferred.reject(oError);
                        }
                    );
                }, (sErrorMessage) => { // error handler
                    Log.error(`property bag 'tileProperties' save failed: ${sErrorMessage}`, null, "sap.ushell.components.tiles.action.ActionTile.controller");
                    oDeferred.reject(new Error(sErrorMessage));
                });
            }
            return oDeferred.promise();
        },

        // configuration cancel handler
        onCancelConfiguration: function (oConfigurationView) {
            // reload old configuration and display
            const oViewData = oConfigurationView.getViewData();
            const oModel = oConfigurationView.getModel();
            // tile model placed into configuration model by getConfigurationUi
            const oTileModel = oModel.getProperty("/tileModel");
            const oTileApi = oViewData.chip;
            const oCurrentConfig = tileUtils.getActionConfiguration(oTileApi, false);
            oConfigurationView.getModel().setData({
                config: oCurrentConfig,
                tileModel: oTileModel
            }, false);
        }
    });
});
