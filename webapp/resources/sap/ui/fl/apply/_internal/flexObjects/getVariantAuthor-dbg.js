/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/initial/_internal/Loader",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/Layer"
], function(
	Lib,
	Loader,
	Settings,
	Layer
) {
	"use strict";

	/**
	 * Retrieves the full username by the ID of a variant author.
	 * In case the user herself is the author, a translated 'You' will be displayed or in case of developers, no exchange takes place.
	 *
	 * @function
	 * @since 1.121
	 * @version 1.141.1
	 * @private
	 * @ui5-restricted sap.ui.fl
	 * @alias module:sap/ui/fl/apply/_internal/flexState/compVariants/getVariantAuthor
	 *
	 * @param {string} sUserId - UserId of variant author
	 * @param {sap.ui.fl.Layer} sLayer - Layer in which the variant should be stored
	 * @param {string} sReference - Reference of the application
	 * @returns {string} The resolved author of variant
	 */
	return (sUserId, sLayer, sReference) => {
		const sAuthor = sUserId || "";
		const oSettings = Settings.getInstanceOrUndef();
		const mMapIdsNames = Loader.getCachedFlexData(sReference).authors || {};

		if (sLayer === Layer.USER || sAuthor === oSettings?.getUserId()) {
			return Lib.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME");
		}

		if (![Layer.PUBLIC, Layer.CUSTOMER].includes(sLayer)) {
			return sAuthor;
		}

		return mMapIdsNames?.[sAuthor] || sAuthor;
	};
});