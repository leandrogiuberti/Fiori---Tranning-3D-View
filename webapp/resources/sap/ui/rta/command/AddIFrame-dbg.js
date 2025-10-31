/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
], function(
	FlexCommand
) {
	"use strict";

	/**
	 * Adds an IFrame
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.141.1
	 * @constructor
	 * @private
	 * @since 1.75
	 * @alias sap.ui.rta.command.AddIFrame
	 */
	const AddIFrame = FlexCommand.extend("sap.ui.rta.command.AddIFrame", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				baseId: {
					type: "string",
					group: "content"
				},
				targetAggregation: {
					type: "string",
					group: "content"
				},
				index: {
					type: "int",
					group: "content"
				},
				url: {
					type: "string",
					group: "content"
				},
				width: {
					type: "string",
					group: "content"
				},
				height: {
					type: "string",
					group: "content"
				},
				title: {
					type: "string",
					group: "content"
				},
				advancedSettings: {
					type: "object",
					defaultValue: {},
					group: "content"
				},
				changeType: {
					type: "string",
					defaultValue: "addIFrame"
				}
			},
			associations: {},
			events: {}
		}
	});

	// Override to avoid url to be 'bound'
	AddIFrame.prototype.applySettings = function(...aArgs) {
		const mSettings = aArgs[0];
		const mSettingsWithoutUrl = {};
		Object.keys(mSettings)
		.filter((sSettingName) => sSettingName !== "url")
		.forEach((sSettingName) => {
			mSettingsWithoutUrl[sSettingName] = mSettings[sSettingName];
		});
		aArgs[0] = mSettingsWithoutUrl;
		FlexCommand.prototype.applySettings.apply(this, aArgs);
		this.setUrl(mSettings.url);
	};

	AddIFrame.prototype._getChangeSpecificData = function() {
		const mChangeSpecificData = FlexCommand.prototype._getChangeSpecificData.call(this);
		const { title: sTitle, ...oContent } = mChangeSpecificData.content;
		return {
			changeType: mChangeSpecificData.changeType,
			content: oContent,
			texts: sTitle
				? {
					title: {
						value: sTitle,
						type: "XTIT"
					}
				}
				: {}
		};
	};

	return AddIFrame;
}, /* bExport= */true);
