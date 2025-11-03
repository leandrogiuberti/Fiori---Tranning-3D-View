// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Token",
    "sap/ui/comp/library",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], (
    Token,
    compLibrary,
    JSONModel,
    Fragment
) => {
    "use strict";

    // shortcut for sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation
    const ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;

    function ExtendedValueDialogController () {}

    ExtendedValueDialogController.prototype.openDialog = function (oRecord, fnOnSave) {
        Fragment.load({
            id: "ExtendedValueDialogFragment",
            name: "sap.ushell.components.shell.Settings.userDefaults.view.ExtendedValueDialog",
            controller: this
        }).then((oValueHelpDialog) => {
            const sPathToTokens = `/${oRecord.parameterName}/valueObject/extendedValue/Ranges`;
            const oExtendedModel = oRecord.modelBind.extendedModel;
            const aRanges = oExtendedModel.getProperty(sPathToTokens) || [];
            let sLabelText;
            let sNameSpace;

            if (oRecord.modelBind.isOdata) {
                sNameSpace = this._getMetadataNameSpace(oRecord.editorMetadata.editorInfo.odataURL);
                const oEntityType = oRecord.modelBind.model.getMetaModel().getODataEntityType(`${sNameSpace}.${oRecord.editorMetadata.editorInfo.entityName}`);
                if (oEntityType) {
                    sLabelText = oRecord.modelBind.model.getMetaModel().getODataProperty(oEntityType, oRecord.editorMetadata.editorInfo.propertyName)["sap:label"];
                }
            }

            const oModelData = {
                label: oRecord.editorMetadata.displayText || sLabelText || oRecord.parameterName,
                key: oRecord.modelBind.sPropertyName,
                parameterName: oRecord.parameterName
            };

            oValueHelpDialog.setModel(new JSONModel(oModelData));
            oValueHelpDialog.setIncludeRangeOperations(this.getListOfSupportedRangeOperations());
            oValueHelpDialog.setTokens(this.getTokensToValueHelpDialog(aRanges, oRecord.parameterName));
            oValueHelpDialog.setRangeKeyFields([{
                label: oModelData.label,
                key: oRecord.parameterName
            }]);
            oValueHelpDialog.attachOk((oEvent) => {
                fnOnSave(oEvent);
                oEvent.getSource().close();
            });
            oValueHelpDialog.open();
        });
    };

    ExtendedValueDialogController.prototype.closeValueHelp = function (oControlEvent) {
        oControlEvent.getSource().close(oControlEvent);
    };

    ExtendedValueDialogController.prototype.afterCloseValueHelp = function (oControlEvent) {
        oControlEvent.getSource().destroy();
    };

    ExtendedValueDialogController.prototype._getMetadataNameSpace = function (sServiceUrl) {
        const aSplit = sServiceUrl.split("/");
        return aSplit[aSplit.length - 1];
    };

    ExtendedValueDialogController.prototype.getListOfSupportedRangeOperations = function () {
        // there is no representation of StartsWith and EndsWith on ABAP so applications won't be able to get these operations
        const aSupportedOps = Object.keys(ValueHelpRangeOperation);
        return aSupportedOps.filter((operation) => {
            return operation !== "StartsWith" && operation !== "EndsWith" && operation !== "Initial";
        });
    };

    ExtendedValueDialogController.prototype.getTokensToValueHelpDialog = function (aRanges, sParameterName) {
        const aTokens = [];
        let oFormattedToken;
        aRanges.forEach((oRange) => {
            if (oRange) {
                // convert the Range format to the format that the value help dialog knows how to read
                oFormattedToken = {};
                oFormattedToken.exclude = oRange.Sign === "E";
                oFormattedToken.keyField = sParameterName;
                oFormattedToken.operation = oRange.Option !== "CP" ? oRange.Option : "Contains";
                oFormattedToken.value1 = oRange.Low;
                oFormattedToken.value2 = oRange.High;
                aTokens.push(new Token({}).data("range", oFormattedToken));
            }
        });
        return aTokens;
    };

    return new ExtendedValueDialogController();
});
