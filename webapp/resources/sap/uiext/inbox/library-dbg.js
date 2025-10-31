/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

/**
 * Initialization Code and shared classes of library sap.uiext.inbox.
 */
sap.ui.define([
	"sap/ui/core/library", // library dependency
	"sap/ui/commons/library", // library dependency
	"sap/ui/ux3/library", // library dependency
	"sap/ui/core/Core"
], function() {
	"use strict";

	/**
	 * The Unified Inbox control
	 *
	 * @namespace
	 * @alias sap.uiext.inbox
	 * @public
	 */
	var thisLib = sap.ui.getCore().initLibrary({
		name : "sap.uiext.inbox",
		dependencies : ["sap.ui.core","sap.ui.commons","sap.ui.ux3"],
		types: [],
		interfaces: [],
		controls: [
			"sap.uiext.inbox.Inbox",
			"sap.uiext.inbox.InboxLaunchPad",
			"sap.uiext.inbox.InboxSplitApp",
			"sap.uiext.inbox.SubstitutionRulesManager",
			"sap.uiext.inbox.composite.InboxAddAttachmentTile",
			"sap.uiext.inbox.composite.InboxAttachmentTile",
			"sap.uiext.inbox.composite.InboxAttachmentsTileContainer",
			"sap.uiext.inbox.composite.InboxBusyIndicator",
			"sap.uiext.inbox.composite.InboxComment",
			"sap.uiext.inbox.composite.InboxTaskComments",
			"sap.uiext.inbox.composite.InboxTaskTitleControl",
			"sap.uiext.inbox.composite.InboxUploadAttachmentTile"
		],
		elements: [],
		version: "1.141.1"
	});

	return thisLib;

});
