/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
], function(FlexCommand) {
	"use strict";

	/**
	 * Split a control/element
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version 1.141.1
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.command.Split
	 */
	const Split = FlexCommand.extend("sap.ui.rta.command.Split", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				newElementIds: {
					type: "string[]",
					group: "content"
				},
				source: {
					type: "any",
					group: "content"
				},
				parentElement: {
					type: "any",
					group: "content"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	Split.prototype._getChangeSpecificData = function() {
		const mSpecificInfo = {
			changeType: this.getChangeType(),
			content: {
				newElementIds: this.getNewElementIds(),
				sourceControlId: this.getSource().getId(),
				parentId: this.getParentElement().getId()
			}
		};
		return mSpecificInfo;
	};

	return Split;
});
