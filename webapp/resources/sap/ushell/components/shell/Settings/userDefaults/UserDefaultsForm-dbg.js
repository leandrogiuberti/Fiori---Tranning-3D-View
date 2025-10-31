// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/comp/smartform/ColumnLayout",
    "sap/ui/comp/smartform/SmartForm",
    "sap/ui/core/Control"
], (
    fnDeepExtend,
    ColumnLayout,
    SmartForm,
    Control
) => {
    "use strict";

    const aAllowedFields = [
        "sap.ui.comp.smartfield.SmartField",
        "sap.m.Input"
    ];

    const UserDefaultsForm = Control.extend("sap.ushell.components.shell.Settings.userDefaults.UserDefaultsForm", {
        metadata: {
            properties: {
                /**
                 * The key used to save and retrieve the values
                 */
                persistencyKey: {type: "string"}
            },
            aggregations: {
                /**
                 * Private smartform control to edit the default values
                 */
                _smartForm: {type: "sap.ui.comp.smartform.SmartForm", multiple: false, visibility: "hidden"}
            },
            events: {}
        },

        renderer: {
            apiVersion: 2,

            /**
             * Renders the HTML for the UserDefaultsForm, using the provided {@link sap.ui.core.RenderManager}.
             *
             * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
             * @param {sap.ui.core.Control} userDefaultsForm UserDefaultsForm to be rendered
             */
            render: function (rm, userDefaultsForm) {
                rm.openStart("div", userDefaultsForm);
                rm.openEnd(); // div - tag
                rm.renderControl(userDefaultsForm.getAggregation("_smartForm"));
                rm.close("div");
            }
        }
    });

    /**
     * Initializes the smartForm aggregation.
     */
    UserDefaultsForm.prototype.init = function () {
        const oForm = new SmartForm({
            editable: true
        });
        const oColumnLayout = new ColumnLayout({
            columnsM: 1,
            columnsL: 1,
            columnsXL: 1
        });
        oForm.setLayout(oColumnLayout);
        this.setAggregation("_smartForm", oForm);
    };

    /**
     * Fetches the variant from the inputs / smart fields with group ID "User Defaults".
     * @returns {object} An object with the parameter names as key and the current input values as values.
     */
    UserDefaultsForm.prototype.fetchVariant = function () {
        let sInputName; let oAdditionalValues;
        const oModel = this.getAggregation("_smartForm").getModel("MdlParameter");

        return this._getFieldControls().reduce((oCollectedControls, oCurrentFieldControl) => {
            sInputName = oCurrentFieldControl.getName();
            oCollectedControls[sInputName] = { value: oModel.getProperty(`/${sInputName}/valueObject/value/`) };
            oAdditionalValues = oModel.getProperty(`/${sInputName}/valueObject/extendedValue/`);
            if (oAdditionalValues) {
                oCollectedControls[sInputName].additionalValues = oAdditionalValues;
            }
            return oCollectedControls;
        }, {});
    };

    /**
     * Applies the given oVariantData to the smartForm.
     * @param {object} oVariantData The variant data to apply.
     */
    UserDefaultsForm.prototype.applyVariant = function (oVariantData) {
        if (oVariantData) {
            const oModel = this.getAggregation("_smartForm").getModel("MdlParameter");
            const aUserDefaultInputs = this._getFieldControls();
            let sInputName; let oValueObject;

            for (let i = 0; i < aUserDefaultInputs.length; i++) {
                sInputName = aUserDefaultInputs[i].getName();
                if (oVariantData[sInputName] !== undefined) {
                    if (aUserDefaultInputs[i].getDataType && aUserDefaultInputs[i].getDataType() === "Edm.DateTime") {
                        aUserDefaultInputs[i].setValue(new Date(oVariantData[sInputName].value));
                    } else {
                        aUserDefaultInputs[i].setValue(oVariantData[sInputName].value);
                    }
                    oValueObject = oModel.getProperty(`/${sInputName}/valueObject/`);
                    oValueObject.extendedValue = undefined;
                    if (oVariantData[sInputName].additionalValues) {
                        oValueObject = fnDeepExtend(oValueObject, {extendedValue: oVariantData[sInputName].additionalValues});
                    }
                    oModel.setProperty(`/${sInputName}/valueObject`, oValueObject);
                }
            }
        }
    };

    /**
     * Returns the controls in the fieldGroupId and filters them by allowed type.
     * @returns {object[]} An array of SmartInput and sap.m.Input controls.
     * @private
     */
    UserDefaultsForm.prototype._getFieldControls = function () {
        return this.getControlsByFieldGroupId("UserDefaults").filter((field) => {
            const sFieldName = field.getMetadata().getName();
            return aAllowedFields.indexOf(sFieldName) !== -1;
        });
    };

    /**
     * Wrapper for smartForm.addGroup. Adds a group at the end of the form.
     * @param {sap.ui.comp.smartform.Group} group The group.
     */
    UserDefaultsForm.prototype.addGroup = function (group) {
        this.getAggregation("_smartForm").addGroup(group);
    };

    /**
     * Wrapper for smartForm.getGroups. Returns all existing groups in the form.
     * @returns {sap.ui.comp.smartform.Group[]} The groups.
     */
    UserDefaultsForm.prototype.getGroups = function () {
        return this.getAggregation("_smartForm").getGroups();
    };

    /**
     * Wrapper for smartForm.removeGroup. Removes the group at the given index.
     * @param {int} index The index to remove.
     */
    UserDefaultsForm.prototype.removeGroup = function (index) {
        this.getAggregation("_smartForm").removeGroup(index);
    };

    /**
     * Wrapper for smartForm.removeAllGroups. Removes all groups from the form.
     */
    UserDefaultsForm.prototype.removeAllGroups = function () {
        this.getAggregation("_smartForm").removeAllGroups();
    };

    return UserDefaultsForm;
});
