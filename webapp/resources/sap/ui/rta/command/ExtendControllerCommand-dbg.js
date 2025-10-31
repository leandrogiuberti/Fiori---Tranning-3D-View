/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/rta/command/FlexCommand"
], function(
	Element,
	FlexRuntimeInfoAPI,
	ChangesWriteAPI,
	FlexCommand
) {
	"use strict";

	/**
	 * Extend Controller Command
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.141.1
	 * @constructor
	 * @private
	 * @since 1.135
	 * @alias sap.ui.rta.command.ExtendControllerCommand
	 */
	const ExtendControllerCommand = FlexCommand.extend("sap.ui.rta.command.ExtendControllerCommand", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				changeType: {
					type: "string",
					defaultValue: "codeExt"
				},
				codeRef: {
					type: "string"
				},
				viewId: {
					type: "string"
				}
			},
			associations: {},
			events: {}
		}
	});

	ExtendControllerCommand.prototype._createChange = function(mFlexSettings) {
		const sViewId = this.getViewId();
		const sCodeRef = this.getCodeRef();
		const oView = Element.getElementById(sViewId);
		const oAppComponent = this.getAppComponent();
		const sControllerName = oView.getControllerModuleName() ? `module:${oView.getControllerModuleName()}` : oView.getController()?.getMetadata().getName();
		// Calculate moduleName for code extension
		const sReference = FlexRuntimeInfoAPI.getFlexReference({element: oAppComponent});
		const sModuleName = `${sReference.replace(/\.Component/g, "").replace(/\./g, "/")}/changes/${sCodeRef.replace(/\.js/g, "")}`;

		const oChangeSpecificData = {
			changeType: this.getChangeType(),
			layer: mFlexSettings.layer,
			codeRef: this.getCodeRef(),
			controllerName: sControllerName,
			reference: sReference,
			moduleName: sModuleName,
			generator: "sap.ui.rta.command.ExtendControllerCommand"
		};

		return ChangesWriteAPI.create({
			changeSpecificData: oChangeSpecificData,
			selector: oAppComponent
		});
	};

	ExtendControllerCommand.prototype.execute = function() {
		return Promise.resolve();
	};

	ExtendControllerCommand.prototype.undo = function() {
		return Promise.resolve();
	};

	/**
	 * For the extended controller commands to take effect, restart the app. This reloads the models.
	 */
	ExtendControllerCommand.prototype.needsReload = true;

	return ExtendControllerCommand;
});
