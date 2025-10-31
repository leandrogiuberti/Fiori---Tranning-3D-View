/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/_internal/init"
], function(
	DelegateMediator
) {
	"use strict";

	/**
	 * Provides an API to handle default delegates.
	 *
	 * @namespace sap.ui.fl.apply.api.DelegateMediatorAPI
	 * @since 1.80
	 * @private
	 * @ui5-restricted
	 */
	const DelegateMediatorAPI = /** @lends sap.ui.fl.apply.api.DelegateMediatorAPI */{
		/**
		 * Register model-specific read delegate by the model type.
		 *
		 * @param {object} mPropertyBag - Property bag for read delegate
		 * @param {object} mPropertyBag.modelType - Read delegate model type
		 * @param {object} mPropertyBag.delegate - Path to read delegate
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta, smart controls
		 */
		registerReadDelegate(mPropertyBag) {
			DelegateMediator.registerReadDelegate(mPropertyBag);
		},

		/**
		 * Registers a control-specific write delegate by control type.
		 *
		 * @param {object} mPropertyBag - Property bag for control-specific delegate
		 * @param {object} mPropertyBag.controlType - Control type
		 * @param {object} mPropertyBag.delegate - Path to control-specific delegate
		 * @param {object} [mPropertyBag.requiredLibraries] - Map of required libraries
		 * @param {object} [mPropertyBag.payload] - Payload for the delegate
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta, smart controls
		 */
		registerWriteDelegate(mPropertyBag) {
			DelegateMediator.registerWriteDelegate(mPropertyBag);
		},

		/**
		 * Returns the model-specific read delegate for the requested control.
		 * The instance-specific read delegate is returned if available.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.core.Element|Element} mPropertyBag.control - Control for which the corresponding delegate should be returned
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @param {string} [mPropertyBag.modelType] - Model type; required in case you passed the <code>XmlTreeModifier</code>
		 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta, smart controls
		 */
		getReadDelegateForControl(mPropertyBag) {
			return DelegateMediator.getReadDelegateForControl(
				mPropertyBag.control,
				mPropertyBag.modifier,
				mPropertyBag.modelType,
				mPropertyBag.supportsDefault
			);
		},

		/**
		 * Returns the write delegate for the requested control.
	 	 * The instance-specific write delegate is returned if available.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.core.Element|Element} mPropertyBag.control - Control for which the corresponding delegate should be returned
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta, smart controls
		 */
		getWriteDelegateForControl(mPropertyBag) {
			return DelegateMediator.getWriteDelegateForControl(
				mPropertyBag.control,
				mPropertyBag.modifier
			);
		},

		/**
		 * Registers a handler for adjusting XML fragments. The handler will be stored without reference to the app,
		 * and will therefore be available for all apps.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.key - Key for the handler
		 * @param {function} mPropertyBag.handler - Handler function returning the adjusted fragment or a Promise resolving with the adjusted fragment
		 *
		 * @private
		 * @ui5-restricted sap.fe
		 */
		registerAddXMLAdjustFragmentHandler(mPropertyBag) {
			DelegateMediator.registerAddXMLAdjustFragmentHandler(mPropertyBag);
		}
	};

	return DelegateMediatorAPI;
});
