// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/Device",
    "sap/ui/core/Control",
    "sap/ushell/resources",
    "sap/ushell/library" // css style dependency
], (
    Device,
    Control,
    ushellResources,
    ushellLibrary
) => {
    "use strict";

    const SidePane = Control.extend("sap.ushell.ui.shell.SidePane", {
        metadata: {
            library: "sap.ushell",
            aggregations: {
                content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (rm, oSidePane) {
                rm.openStart("aside", oSidePane);
                rm.class("sapUshellSidePane");
                rm.attr("aria-label", ushellResources.i18n.getText("SidePane_AriaLabel"));
                rm.style("width", oSidePane._getContentWidth());
                rm.openEnd(); // aside - tag

                const aContent = oSidePane.getContent();
                aContent.forEach((oContent) => {
                    rm.renderControl(oContent);
                });

                rm.close("aside");
            }
        }
    });

    SidePane._WIDTH_PHONE = 13;
    SidePane._WIDTH_TABLET = 13;
    SidePane._WIDTH_DESKTOP = 15;

    SidePane.prototype.init = function () {
        Device.resize.attachHandler(this._handleResize, this);
    };

    SidePane.prototype._getContentWidth = function () {
        const sRange = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;
        const sWidth = `${SidePane[`_WIDTH_${sRange.toUpperCase()}`]}rem`;
        return sWidth;
    };

    SidePane.prototype._handleResize = function () {
        const sContentWidth = this._getContentWidth();
        const oDomRef = this.getDomRef();

        if (oDomRef) {
            oDomRef.style.height = "";
            oDomRef.style.width = sContentWidth;
        }
    };

    SidePane.prototype.exit = function () {
        Device.resize.detachHandler(this._handleResize, this);
    };

    return SidePane;
});
