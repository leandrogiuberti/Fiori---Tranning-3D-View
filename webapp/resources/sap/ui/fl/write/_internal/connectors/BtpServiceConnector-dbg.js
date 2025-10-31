/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/BtpServiceConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	merge,
	Layer,
	KeyUserConnector,
	InitialConnector,
	InitialUtils,
	WriteUtils
) {
	"use strict";

	/**
	 * Connector for saving and deleting data from SAPUI5 Flexibility KeyUser service - including personalization.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.BtpServiceConnector
	 * @version 1.141.1
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	const BtpServiceConnector = merge({}, KeyUserConnector, /** @lends sap.ui.fl.write._internal.connectors.BtpServiceConnector */ {
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC,
			Layer.USER
		],
		ROUTES: {
			CONDENSE: `${InitialConnector.ROOT}/actions/condense`,
			CHANGES: `${InitialConnector.ROOT}/changes`,
			SETTINGS: `${InitialConnector.ROOT}/settings`,
			TOKEN: `${InitialConnector.ROOT}/settings`,
			VERSIONS: {
				GET: `${InitialConnector.ROOT}/versions`,
				ACTIVATE: `${InitialConnector.ROOT}/versions/activate`,
				DISCARD: `${InitialConnector.ROOT}/versions/draft`,
				PUBLISH: `${InitialConnector.ROOT}/versions/publish`
			},
			TRANSLATION: {
				UPLOAD: `${InitialConnector.ROOT}/translation/texts`,
				DOWNLOAD: `${InitialConnector.ROOT}/translation/texts`,
				GET_SOURCELANGUAGE: `${InitialConnector.ROOT}/translation/sourcelanguages`
			},
			CONTEXTS: `${InitialConnector.ROOT}/contexts`,
			SEEN_FEATURES: `${InitialConnector.ROOT}/seenFeatures`,
			DELETE_USER_VARIANTS: `${InitialConnector.ROOT}/variantdata/delete`
		},

		async getSeenFeatureIds(mPropertyBag) {
			const sUrl = InitialUtils.getUrl(this.ROUTES.SEEN_FEATURES, mPropertyBag);
			const oResult = await InitialUtils.sendRequest(sUrl, "GET", {initialConnector: InitialConnector});
			return oResult.response?.seenFeatureIds;
		},

		async setSeenFeatureIds(mPropertyBag) {
			const mParameters = {
				seenFeatureIds: mPropertyBag.seenFeatureIds
			};
			const sUrl = InitialUtils.getUrl(this.ROUTES.SEEN_FEATURES, mPropertyBag);
			const oResult = await WriteUtils.sendRequest(sUrl, "PUT", {
				tokenUrl: this.ROUTES.TOKEN,
				initialConnector: InitialConnector,
				payload: JSON.stringify(mParameters),
				dataType: "json",
				contentType: "application/json; charset=utf-8"
			});
			return oResult.response?.seenFeatureIds;
		},

		/**
		 * Write flex data into the KeyUser service
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {object} mPropertyBag.flexObjects - Map of condensed changes
		 * @param {string} [mPropertyBag.parentVersion] - Indicates if changes should be based on a version
		 * @param {string} mPropertyBag.url - Configured url for the connector
		 * @returns {Promise} Promise resolves as soon as the writing was completed
		 */
		condense(mPropertyBag) {
			const mParameters = {};
			if (mPropertyBag.parentVersion !== undefined) {
				mParameters.parentVersion = mPropertyBag.parentVersion;
			}
			if (this.isLanguageInfoRequired) {
				InitialUtils.addLanguageInfo(mParameters);
			}
			const sUrl = InitialUtils.getUrl(this.ROUTES.CONDENSE, mPropertyBag, mParameters);
			const oRequestOption = WriteUtils.getRequestOptions(
				InitialConnector,
				this.ROUTES.TOKEN,
				mPropertyBag.flexObjects,
				"application/json; charset=utf-8",
				"json"
			);

			return WriteUtils.sendRequest(sUrl, "POST", oRequestOption);
		},

		/**
		 * Deletes all user variants for the given variant management references.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.flexReference - Flex reference of the app the variant management controls belong to
		 * @param {string[]} mPropertyBag.variantManagementReferences - Array of variant management references
		 * @param {string} mPropertyBag.url - Configured url for the connector
		 * @returns {Promise<undefined>} Promise that resolves as soon as the deletion was completed
		 */
		deleteUserVariantsForVM(mPropertyBag) {
			const mPayload = {
				flexReference: mPropertyBag.flexReference,
				variantManagementReferences: mPropertyBag.variantManagementReferences
			};
			const sUrl = InitialUtils.getUrl(this.ROUTES.DELETE_USER_VARIANTS, mPropertyBag);
			return WriteUtils.sendRequest(sUrl, "POST", {
				tokenUrl: this.ROUTES.TOKEN,
				initialConnector: InitialConnector,
				payload: JSON.stringify(mPayload),
				dataType: "json",
				contentType: "application/json; charset=utf-8"
			});
		}
	});

	BtpServiceConnector.initialConnector = InitialConnector;
	return BtpServiceConnector;
});
