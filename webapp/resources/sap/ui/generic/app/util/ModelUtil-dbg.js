/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

sap.ui.define(["sap/ui/core/Messaging"], function(Messaging) {
	"use strict";

	/**
	 * Constructor for generic utility for model access.
	 *
	 * @private
	 * @class
	 * @classdesc
	 * Generic utility for model access.
	 * @author SAP SE
	 * @version 1.141.0
	 * @since 1.30.0
	 * @alias sap.ui.generic.app.util.ModelUtil
	 * @param {sap.ui.model.odata.ODataModel} oModel The OData model currently used
	 */
	var ModelUtil = function(oModel) {
		this._oModel = oModel;
	};

	/**
	 * Converts response data into a binding context.
	 *
	 * @param {object} oResponseData Response data.
	 * @returns {sap.ui.model.Context} Binding context, can be <code>null</code>.
	 * @public
	 */
	ModelUtil.prototype.getContextFromResponse = function(oResponseData) {
		var sPath = "/" + this._oModel.getKey(oResponseData);
		return this._oModel.getContext(sPath);
	};

	/**
	 * Calculates the name of an OData entity set from the given binding context.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {string} The name of the entity set, can be <code>null</code>
	 * @throws {Error} If no context is handed over as input parameter
	 * @public
	 */
	ModelUtil.getEntitySetFromContext = function(oContext) {
		var oEntitySet = ModelUtil.getEntitySetObjectFromContext(oContext);
		return oEntitySet ? oEntitySet.name : null;
	};

	/**
	 * Calculates the name of an OData entity set from the given binding context.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {object} EntitySet Object from the meta model, can be <code>undefined</code>
	 * @throws {Error} If no context is handed over as input parameter
	 * @public
	 */
	ModelUtil.getEntitySetObjectFromContext = function(oContext) {
		var sPath, sEntitySet;

		if (!oContext) {
			throw new Error("No context");
		}

		if (oContext && oContext.getPath) {
			sPath = oContext.getPath().split("(")[0];
			sEntitySet = sPath.substring(1);
		}

		if (sEntitySet) {
			return oContext.getModel().getMetaModel().getODataEntitySet(sEntitySet);
		}

		return undefined;
	};

	/**
	 * Calculates the name of an OData entity set from the given binding context.
	 *
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {object} EntityType Object from the meta model, can be <code>undefined</code>
	 * @throws {Error} If no context is handed over as input parameter
	 * @public
	 */
	ModelUtil.getEntityTypeFromContext = function(oContext) {
		var oEntitySet = ModelUtil.getEntitySetObjectFromContext(oContext);
		return oEntitySet ? oContext.getModel().getMetaModel().getODataEntityType(oEntitySet.entityType) : undefined;
	};

	/**
	 * Checks for client-side messages, e.g. validation errors.
	 *
	 * @returns {boolean} <code>true</code>, if client-side messages exist, <code>false</code> otherwise
	 * @public
	 */
	ModelUtil.prototype.hasClientMessages = function() {
		var len = 0;

		var aMessages = Messaging.getMessageModel().getData(); // Returns the current data of the client message model

		if (aMessages) {
			len = aMessages.length;
		}

		for (var i = 0; i < len; i++) {
			var oMessage = aMessages[i];

			if (oMessage.processor.getMetadata()._sClassName === "sap.ui.core.message.ControlMessageProcessor") {
				return true;
			}
		}

		return false;
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 *
	 * @public
	 */
	ModelUtil.prototype.destroy = function() {
		this._oModel = null;
	};

	return ModelUtil;

}, /* bExport= */true);