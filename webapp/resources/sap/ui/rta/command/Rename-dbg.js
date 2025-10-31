/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/rta/command/FlexCommand"], function(FlexCommand) {
	"use strict";

	/**
	 * Rename Element from one place to another
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.141.1
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.Rename
	 */
	const Rename = FlexCommand.extend("sap.ui.rta.command.Rename", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				renamedElement: {
					type: "object",
					group: "content"
				},
				newValue: {
					type: "string",
					defaultValue: "new text",
					group: "content"
				}
			},
			associations: {},
			events: {}
		}
	});

	Rename.prototype._getChangeSpecificData = function() {
		const mSpecificInfo = {
			changeType: this.getChangeType(),
			content: {
				renamedElement: {
					id: this.getRenamedElement().getId()
				},
				value: this.getNewValue()
			}
		};

		return mSpecificInfo;
	};

	return Rename;
});
