// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/utils"
], (
    UIComponent,
    ushellUtils
) => {
    "use strict";

    const Component = UIComponent.extend("sap.ushell.samplecards.imageCard.Component", {

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            function fnAfterRendering (oEvent) {
                const oRootControl = oEvent.getSource();
                oRootControl.$().closest(".sapFCard").addClass("sapFCardTransparent").css({
                    boxShadow: "none"
                });

                ushellUtils.setPerformanceMark("FLP -- samplecards.imageCard after rendering");
            }

            this.getRootControl()
                .detachAfterRendering(fnAfterRendering)
                .attachAfterRendering(fnAfterRendering);
        }
    });

    return Component;
});
