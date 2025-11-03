// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element"
], (
    Element
) => {
    "use strict";

    /**
     * @alias sap.ushell.state.BindingHelper
     * @namespace
     * @description Helper class for bindings on control references
     *
     * @since 1.129.0
     * @private
     */
    class BindingHelper {
        /**
         * Overrides the original updateAggregation method of the control
         * For updates on any aggregation, the aggregation items are removed instead of being destroyed.
         * This allows to bind references to controls which cannot be recreated in a factory.
         *
         * <b>Note:</b>: Custom getters and setters will be completely ignored!
         * @param {sap.ui.core.Control} oControl The control to override the updateAggregation method
         *
         * @since 1.129.0
         * @private
         */
        overrideUpdateAggregation (oControl) {
            oControl.updateAggregation = this.#updateAggregation;
        }

        /**
         * Custom aggregation update handler.
         * Removes aggregation items instead of destroying them.
         * @param {string} sName Aggregation name.
         *
         * @since 1.129.0
         * @private
         */
        #updateAggregation (sName) {
            const sModelName = this.getBindingInfo(sName).model;
            // make a shallow copy to avoid issues with iteration on the original array
            const aCurrentControls = [...this.getAggregation(sName) || []];

            aCurrentControls.forEach((oControlToRemove) => {
                this.removeAggregation(sName, oControlToRemove, true);
            });

            this.getBinding(sName).getCurrentContexts().forEach((oModelContext) => {
                const oControl = BindingHelper.prototype.factory("", oModelContext);
                if (!oControl) {
                    return;
                }

                oControl.setBindingContext(oModelContext, sModelName);
                this.addAggregation(sName, oControl, true);
            });

            this.invalidate();
        }

        /**
         * Item factory for {@link sap.ushell.state.BindingHelper#overrideUpdateAggregation}.
         * Returns the referenced control.
         * @param {sap.ui.core.ID} sId The Control ID.
         * @param {sap.ui.model.Context} oContext UI5 context.
         * @returns {sap.ui.core.Control} The control.
         *
         * @since 1.129.0
         * @private
         */
        factory (sId, oContext) {
            return Element.getElementById(oContext.getObject());
        }
    }

    return new BindingHelper();
});
