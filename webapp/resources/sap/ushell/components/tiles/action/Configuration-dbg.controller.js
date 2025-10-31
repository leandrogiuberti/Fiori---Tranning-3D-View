// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/tiles/utils",
    "sap/ui/core/library",
    "sap/m/MessageBox"
], (Element, Controller, tileUtils, coreLibrary, MessageBox) => {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    const ValueState = coreLibrary.ValueState;

    return Controller.extend("sap.ushell.components.tiles.action.Configuration", {
        sEnterValuePlaceHolder: "",
        sDuplicateErrorMsg: "",
        sDuplicateErrorTitle: "",
        sInvalidParmMsg: "",

        aDefaultObjects: [
            {
                obj: "",
                name: ""
            }, {
                obj: "*",
                name: "*"
            }
        ],

        onConfigurationInputChange: function (oControlEvent) {
            tileUtils.checkTMInput(this.getView(), oControlEvent);
        },
        onInit: function () {
            const oView = this.getView();
            const oSemanticObjectSelector = oView.byId("semantic_objectInput");
            const oRoleSelector = oView.byId("navigation_provider_roleInput");
            const oInstanceSelector = oView.byId("navigation_provider_instanceInput");
            const oAliasSelector = oView.byId("target_application_aliasInput");
            const oActionSelector = oView.byId("semantic_actionInput");
            const oTargetTypeSelector = oView.byId("targetTypeInput");
            const oResourceModel = tileUtils.getResourceBundleModel();

            oView.setModel(oResourceModel, "i18n");
            oView.setViewName("sap.ushell.components.tiles.action.Configuration");
            // initialize semantic object input field
            tileUtils.createSemanticObjectModel(this, oSemanticObjectSelector, this.aDefaultObjects);
            tileUtils.createRoleModel(this, oRoleSelector, oInstanceSelector);
            tileUtils.createAliasModel(this, oAliasSelector);
            tileUtils.createActionModel(this, oActionSelector);
            tileUtils.createNavigationProviderModel(this, oTargetTypeSelector);
            // make sure that the chose object is written back to the configuration
            oSemanticObjectSelector.attachChange((oControlEvent) => {
                const sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/semantic_object", sValue);
            });
            oRoleSelector.attachChange((oControlEvent) => {
                const sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/navigation_provider_role", sValue);
                tileUtils.updateAliasModel(oView, oAliasSelector);
            });
            oInstanceSelector.attachChange((oControlEvent) => {
                const sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/navigation_provider_instance", sValue);
            });
            oAliasSelector.attachChange((oControlEvent) => {
                const sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/target_application_alias", sValue);
            });

            const oBundle = tileUtils.getResourceBundle();
            this.sEnterValuePlaceHolder = oBundle.getText("configuration.signature.table.valueFieldLbl");
            this.sDuplicateErrorMsg = oBundle.getText("configuration.signature.uniqueParamMessage.text");
            this.sDuplicateErrorTitle = oBundle.getText("configuration.signature.uniqueParamMessage.title");
            this.sInvalidParmMsg = oBundle.getText("configuration.signature.invalidParamMessage.text");
        },

        // This function applies table logic for the mapping signature structure according to the Mandatory check-box:
        // if mandatory is unselected: Value and isRegularExpression fields should be disabled and vice versa...
        handleMandatoryChange: function (oMandatoryCheckBox) {
            const sId = oMandatoryCheckBox.getParameter("id");
            const aParentCells = Element.getElementById(sId).getParent().getCells();

            const bIsMandatory = oMandatoryCheckBox.getParameter("selected");

            if (bIsMandatory) {
                aParentCells[2].setEnabled(true); // Value field
                aParentCells[2].setPlaceholder(this.sEnterValuePlaceHolder);
                aParentCells[4].setEnabled(false); // DefaultValue field
                aParentCells[4].setValue("");
                aParentCells[4].setPlaceholder("");
                aParentCells[3].setEnabled(true); // IsRegularExpression check-box field
            } else {
                aParentCells[2].setEnabled(false); // Value field
                aParentCells[2].setValue("");
                aParentCells[2].setPlaceholder(""); // Were requested that a disabled text field will not show the Enter Value
                aParentCells[4].setEnabled(true); // DefaultValue field
                aParentCells[4].setPlaceholder(this.sEnterValuePlaceHolder);
                aParentCells[3].setEnabled(false); // IsRegularExpression check-box field
                aParentCells[3].setSelected(false);
            }
        },

        addRow: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            const rows = oModel.getProperty("/config/rows");

            // Init a row template for adding new empty row to the params table (mapping signature)
            const newParamRow = tileUtils.getEmptyRowObj();
            rows.push(newParamRow);
            oModel.setProperty("/config/rows", rows);
        },

        deleteRow: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            const rows = oModel.getProperty("/config/rows");

            const table = oView.byId("mappingSignatureTable");
            const aSelectedItemsIndexes = table.getSelectedIndices();
            const aSortedDescending = aSelectedItemsIndexes.sort((a, b) => {
                return b - a;
            }).slice();

            for (let i = 0; i < aSortedDescending.length; i++) {
                table.removeSelectionInterval(aSortedDescending[i], aSortedDescending[i]);// Make sure to turn off the selection or it will pass to
                // the next row.
                rows.splice(aSortedDescending[i], 1); // There is a major assumption here that the index in the model is identical to the index in
                // the table !!!
            }
            oModel.setProperty("/config/rows", rows);
        },
        // Will be called on change event of the name column in Parameters table.
        // 2 parameters cannot have the same name. (in case the user decide to ignore the error message, there is a second validation on the save)
        checkDuplicateNames: function (changeEvent) {
            const oModel = this.getView().getModel();
            const rows = oModel.getProperty("/config/rows");
            const nameCol = Element.getElementById(changeEvent.getParameter("id"));
            const sNewValue = changeEvent.getParameter("newValue");

            if (sNewValue !== "" && !(/^[\w-/]+$/.test(sNewValue))) {
                nameCol.setValueState(ValueState.Error); MessageBox.alert(this.sInvalidParmMsg, this.focusNameField.bind(nameCol), this.sDuplicateErrorTitle);
            }
            if (tileUtils.tableHasDuplicateParameterNames(rows)) {
                nameCol.setValueState(ValueState.Error); MessageBox.alert(this.sDuplicateErrorMsg, this.focusNameField.bind(nameCol), this.sDuplicateErrorTitle);
            } else {
                nameCol.setValueState(ValueState.None);
            }
        },
        // a callback function for the duplicate error MessageBox
        focusNameField: function () {
            this.focus();
        },

        // forward value helper request to utils
        onValueHelpRequest: function (oEvent) {
            // Third parameter is to differentiate whether it's Tile Actions icon field or general icon field. If it's true, then it's tile actions
            // icon field, else general icon field.
            tileUtils.objectSelectOnValueHelpRequest(this, oEvent, false);
        },
        onActionValueHelpRequest: function (oEvent) {
            tileUtils.actionSelectOnValueHelpRequest(this, oEvent);
        },
        onRoleValueHelpRequest: function (oEvent) {
            tileUtils.roleSelectOnValueHelpRequest(this, oEvent);
        },
        onInstanceValueHelpRequest: function (oEvent) {
            tileUtils.instanceSelectOnValueHelpRequest(this, oEvent);
        },
        instanceSuggest: function (oEvent) {
            tileUtils.instanceSuggest(this, oEvent);
        },
        aliasSuggest: function (oEvent) {
            tileUtils.aliasSuggest(this, oEvent);
        },
        onAliasValueHelpRequest: function (oEvent) {
            tileUtils.applicationAliasSelectOnValueHelpRequest(this, oEvent);
        },
        onFormFactorChange: function () {
            const oModel = this.getView().getModel();
            oModel.setProperty("/config/formFactorConfigDefault", false);
        },

        // Will be called on change event of the application type radio buttons.
        onApplicationTypeChange: function (oEvent) {
            const oParameter = oEvent.getParameters();
            if (oParameter.selectedItem) {
                tileUtils.displayApplicationTypeFields(oParameter.selectedItem.getKey(), this.getView());
            }
        }
    });
});
