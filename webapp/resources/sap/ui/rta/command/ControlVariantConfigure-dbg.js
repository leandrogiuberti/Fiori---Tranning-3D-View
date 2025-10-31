/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/variants/VariantManager",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library"
], function(
	ControlVariantApplyAPI,
	FlexRuntimeInfoAPI,
	VariantManager,
	ChangesWriteAPI,
	FlUtils,
	BaseCommand,
	rtaLibrary
) {
	"use strict";

	/**
	 * Configure control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version 1.141.1
	 * @constructor
	 * @private
	 * @since 1.52
	 * @alias sap.ui.rta.command.ControlVariantConfigure
	 */
	const ControlVariantConfigure = BaseCommand.extend("sap.ui.rta.command.ControlVariantConfigure", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				control: {
					type: "any"
				},
				changes: {
					type: "array"
				},
				deletedVariants: {
					type: "array"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantConfigure.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	ControlVariantConfigure.prototype.getPreparedChange = function() {
		if (!this._aPreparedChanges) {
			return undefined;
		}
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the configuration of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantConfigure.prototype.execute = async function() {
		const oVariantManagementControl = this.getControl();
		this.oAppComponent = FlUtils.getAppComponentForControl(oVariantManagementControl);
		this.sVariantManagementReference = oVariantManagementControl.getVariantManagementReference();

		this._aPreparedChanges = [];
		if (this.getChanges().some((oChange) => {
			if (
				oChange.visible === false
				&& oChange.variantReference === oVariantManagementControl.getCurrentVariantKey()
			) {
				this._sOldVReference = oChange.variantReference;
				return true;
			}
			return false;
		})) {
			await ControlVariantApplyAPI.activateVariant({
				element: oVariantManagementControl,
				variantReference: this.sVariantManagementReference
			});
		}

		this.getChanges().forEach(function(mChangeProperties) {
			mChangeProperties.appComponent = this.oAppComponent;
			mChangeProperties.generator = rtaLibrary.GENERATOR_NAME;
			this._aPreparedChanges.push(VariantManager.addVariantChange(this.sVariantManagementReference, mChangeProperties));
		}.bind(this));

		this._aDeletedFlexObjects = ChangesWriteAPI.deleteVariantsAndRelatedObjects({
			variantManagementControl: oVariantManagementControl,
			layer: this.sLayer,
			variants: this.getDeletedVariants()
		});

		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantConfigure.prototype.undo = async function() {
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({ element: this.getControl() });
		ChangesWriteAPI.restoreDeletedFlexObjects({
			reference: sFlexReference,
			flexObjects: this._aDeletedFlexObjects
		});
		delete this._aDeletedFlexObjects;

		this.getChanges().forEach((mChangeProperties, index) => {
			const mPropertyBag = {
				appComponent: this.oAppComponent
			};
			Object.keys(mChangeProperties).forEach(function(sProperty) {
				const sOriginalProperty = `original${sProperty.charAt(0).toUpperCase()}${sProperty.substr(1)}`;
				if (sProperty === "visible") {
					mPropertyBag[sProperty] = true; /* visibility of the variant always set back to true on undo */
				} else if (mChangeProperties[sOriginalProperty]) {
					mPropertyBag[sProperty] = mChangeProperties[sOriginalProperty];
					mPropertyBag[sOriginalProperty] = mChangeProperties[sProperty];
				} else if (sProperty.indexOf("original") === -1) {
					mPropertyBag[sProperty] = mChangeProperties[sProperty];
				}
			});
			const oChange = this._aPreparedChanges[index];
			VariantManager.deleteVariantChange(this.sVariantManagementReference, mPropertyBag, oChange);
		});

		this._aPreparedChanges = null;
		if (this._sOldVReference) {
			await ControlVariantApplyAPI.activateVariant({
				element: this.getControl(),
				variantReference: this._sOldVReference
			});
			delete this._sOldVReference;
		}
	};

	return ControlVariantConfigure;
});
