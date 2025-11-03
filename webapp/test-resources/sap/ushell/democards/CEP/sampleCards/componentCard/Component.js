// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/utils"
], (UIComponent, Utils) => {
    "use strict";

    const Component = UIComponent.extend("sap.ushell.samplecards.componentCard.Component", {
        /**
         * Initializes component card component
         * - adding a performance mark for time to interaction, TTI, after rendering of this component.
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            function fnAfterRendering (oEvent) {
                Utils.setPerformanceMark(
                    "FLP-TTI-Homepage",
                    { bUseUniqueMark: true, bUseLastMark: true }
                );
                const oRootControl = oEvent.getSource();
                oRootControl.$().closest(".sapFCard").addClass("sapFCardTransparent").css({
                    boxShadow: "none"
                });
                oRootControl.byId("myCustomComponentFlexBox").$().css({
                    padding: "1px"
                });
            }
            this.getRootControl()
                .detachAfterRendering(fnAfterRendering)
                .attachAfterRendering(fnAfterRendering);
        },

        onCardReady: function (oCard) {
            this.oCard = oCard;
        },

        triggerCardAction: function (oParameters) {
            if (this.oCard) {
                this.oCard.triggerAction(oParameters);
            }
        }
    });

    return Component;
});
