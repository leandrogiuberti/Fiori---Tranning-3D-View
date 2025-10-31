/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
*/
sap.ui.define([
	"sap/base/util/deepClone",
	"sap/suite/ui/generic/template/designtime/utils/designtimeUtils",
	"sap/base/util/ObjectPath",
	"sap/suite/ui/generic/template/genericUtilities/testableHelper"
],
	function (deepClone, designtimeUtils, ObjectPath, testableHelper) {
		"use strict";

		/**
		 * @typedef {Object} DesigntimeSetting
		 * @property {string} id - The ID of the designtime setting.
		 * @property {string} name - The name of the designtime setting.
		 * @property {string} description - The description of the designtime setting.
		 * @property {PropertyValue} [value] - The default value of the designtime setting.
		 * @property {string} type - The type of the designtime setting.
		 * @property {Array.<Enum>} [enums] - The array of possible enum values for the designtime setting.
		 * @property {(mControlDetails: ControlInfo) => string} [getPath] - The path to the designtime setting in the manifest.
		 * @property {boolean} [bSupportsGlobalScope] - Indicates if the setting supports global scope. (Default: false)
		 * @property {string[]} [restrictedTo] - The array of components for which the setting is restricted.
		 * @property {Partial<DesigntimeSetting>[]} [writeObject] - An array of DesigntimeSetting objects.
		 * @property {string} [writeObjectFor] - The value for which the writeObject should be applied.
		 * @property {boolean} [skipChange] - Indicates if the change should be skipped.
		 * @property {boolean} keyUser - Indicates if the setting is allowed for key user.

		===============================================
		 * @typedef {Object} ChangeParameters - Descriptor change parameters.
		 * @property {string} [sScope] - The scope of the manifest setting.
		 * @property {string} [sChangeType] - Desciptor change type.
		===============================================

		 * @typedef {Object} ControlInfo
		 * @property {string} [sParentComponentName] - The name of the parent component.
		 * @extends ChangeParameters

		 * @typedef {ChangeParameters & ControlInfo} ControlChangeParams

		 * @typedef {string | boolean | string[] | null } PropertyValue

		 * @typedef {Object} Enum
		 * @property {string} id - The ID of the enum value.
		 * @property {string} name - The name of the enum value.
		 * @property {Object} [value] - The value of the enum value.
		 */


		/**
	 * Retrieves the runtime adaptation properties based on the allowed design-time settings and global settings.
	 *
	 * @param {Array} aAllowedDesigntimeSettings - The array of allowed design-time settings.
	 * @param {Object} mSettings - The global manifest settings object.
	 * @returns {Object} - The object containing the runtime adaptation properties.
	 */
		function getRuntimeAdaptationProperties(aAllowedDesigntimeSettings, mSettings) {
			const mPropertyValues = {};

			aAllowedDesigntimeSettings.forEach(oSetting => {
				const sProperty = oSetting.id;
				switch (sProperty) {
					case "editableHeaderContent":
						mPropertyValues[sProperty] = mSettings[sProperty] ?? oSetting.value;
						break;
					case "tableVariantManagement":
						mPropertyValues[sProperty] = mSettings[sProperty] ?? oSetting.value;
						break;
					case "chartVariantManagement":
						mPropertyValues[sProperty] = mSettings[sProperty] ?? oSetting.value;
						break;
					case "showRelatedApps":
						mPropertyValues[sProperty] = mSettings[sProperty] ?? oSetting.value;
						break;
					default:
						break;
				}
			});
			return mPropertyValues;
		}

		/**
		 * Retrieves the designtime settings for the Control.
		 * @param {object} oControl - The Control object.
		 * @returns {DesigntimeSetting[]}
		 */
		let getAllDesigntimeSettings = function getAllDesigntimeSettings(oControl) {
			let oResourceBundle = designtimeUtils.getResourceBundle(oControl);

			/**
			 * @type {DesigntimeSetting}
			 */
			const editableHeaderContent = {
				id: "editableHeaderContent",
				name: oResourceBundle.getText('RTA_OP_EDITABLE_HEADER_CONTENT'),
				description: oResourceBundle.getText('RTA_OP_EDITABLE_HEADER_CONTENT_DESC'),
				value: false,
				getPath: () => 'component/settings/editableHeaderContent',
				type: "boolean",
				keyUser: true
			};
			/**
			 * @type {DesigntimeSetting}
			 */
			const tableVariantManagement = {
				id: "tableVariantManagement",
				name: oResourceBundle.getText('RTA_OP_VARIANT_MANAGEMENT_TABLE'),
				description: oResourceBundle.getText('RTA_OP_VARIANT_MANAGEMENT_TABLE_DESC'),
				value: true, // The default value is true
				getPath: () => 'component/settings/tableSettings/variantManagement',
				type: "boolean",
				keyUser: true
			};
			/**
			 * @type {DesigntimeSetting}
			 */
			const chartVariantManagement = {
				id: "chartVariantManagement",
				name: oResourceBundle.getText('RTA_OP_VARIANT_MANAGEMENT_CHART'),
				description: oResourceBundle.getText('RTA_OP_VARIANT_MANAGEMENT_CHART_DESC'),
				value: true, // The default value is true
				getPath: () => 'component/settings/chartSettings/variantManagement',
				type: "boolean",
				keyUser: true
			};

			/**
			 * @type {DesigntimeSetting}
			 */
			const showRelatedApps = {
				id: "showRelatedApps",
				name: oResourceBundle.getText('RTA_OP_SHOW_RELATED_APPS'),
				description: oResourceBundle.getText('RTA_OP_SHOW_RELATED_APPS_DESC'),
				value: false,
				getPath: () => 'component/settings/showRelatedApps',
				type: "boolean",
				keyUser: true
			};

			return [
				editableHeaderContent,
				tableVariantManagement,
				chartVariantManagement,
				showRelatedApps
			];

		};



		function getObjectPageSettings(oComponent) {
			return {
				editableHeaderContent: JSON.parse(oComponent.getEditableHeaderContent()),
				tableVariantManagement: ObjectPath.get(["variantManagement"], oComponent.getTableSettings()),
				chartVariantManagement: ObjectPath.get(["variantManagement"], oComponent.getChartSettings()),
				showRelatedApps: JSON.parse(oComponent.getShowRelatedApps())
			};
		}




		/**
		 * Opens the dialog for the table configuration.
		 * @param {sap.ui.core.Control} oControl - The control for which the dialog should be opened.
		 * @param {object} mPropertyBag - The property bag.
		 * @returns {Promise<ControlChangeParams[]>} - The changes.
		 */
		async function fnOpenObjectPageConfigurationDialog(oControl, mPropertyBag) {
			const oResourceModel = oControl.getModel("i18n");
			const oComponent = designtimeUtils.getOwnerComponentFor(oControl);

			const mObjectPageSettings = getObjectPageSettings(oComponent);

			// Get all the designtime settings
			const aAllDesigntimeSettings = getAllDesigntimeSettings(oControl);
			// Get the allowed designtime settings based on the floorplan
			/**
			 * @type {DesigntimeSetting[]}
			 */
			let aAllowedDesigntimeSettings = designtimeUtils.filterDesigntimeSettingsByFloorPlan(oControl, aAllDesigntimeSettings);

			// Get the allowed designtime settings based on the adaptation mode (key user or Designtime)
			aAllowedDesigntimeSettings = designtimeUtils.getAllowedDesigntimeSettingsBasedOnAdaptationMode(aAllowedDesigntimeSettings, oComponent);


			// Get the current values of the properties
			const mRuntimeAdaptationPropertyValues = getRuntimeAdaptationProperties(aAllowedDesigntimeSettings, mObjectPageSettings);
			// Save the unchanged data to compare later
			const mUnchangedData = deepClone(mRuntimeAdaptationPropertyValues);
			// Get the settings of the dialog from the designtime settings using which the dialog will be created
			const aItems = designtimeUtils.getSettings(mRuntimeAdaptationPropertyValues, aAllowedDesigntimeSettings);

			// disable the scope control if there is only one option

			const mPropertyValuesEntered = await designtimeUtils.openAdaptionDialog([...aItems], mRuntimeAdaptationPropertyValues, mUnchangedData, "{i18n>RTA_CONFIGURATION_TITLE_OBJECT_PAGE}", { width: "650px", height: "800px" }, oResourceModel);


			/**
			 * @type {ControlChangeParams}
			 */
			const mPathParameters = {
				sChangeType: designtimeUtils.ChangeType.ChangePageConfiguration
			};
			return designtimeUtils.extractChanges(mPropertyValuesEntered, mUnchangedData, aAllowedDesigntimeSettings, oComponent, mPathParameters);

		}

		// Expose the functions for QUnit tests
		testableHelper.testableStatic(fnOpenObjectPageConfigurationDialog, "fnOpenObjectPageConfigurationDialog");


		const oHelper = {
			getDesigntime: function (oControl) {
				return {
					actions: {
						settings: {
							fe: {
								name: designtimeUtils.getResourceBundle(oControl).getText("RTA_CONTEXT_MENU_CONFIG"),
								icon: "sap-icon://developer-settings",
								handler: fnOpenObjectPageConfigurationDialog
							}
						}
					}
				};
			}
		};
		return oHelper;
	}
);
