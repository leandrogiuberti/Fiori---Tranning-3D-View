// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ushell/library" // css style dependency
], (
    Control,
    ushellLibrary
) => {
    "use strict";

    const SubHeader = Control.extend("sap.ushell.ui.shell.SubHeader", {
        metadata: {
            library: "sap.ushell",
            aggregations: {
                content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (rm, oSubHeader) {
                rm.openStart("div", oSubHeader);
                rm.class("sapUshellSubHeader");
                rm.openEnd(); // div - tag

                // only render first sub header
                const aContent = oSubHeader.getContent();
                if (aContent.length) {
                    rm.renderControl(aContent[0]);
                }

                rm.close("div");
            }
        }
    });

    return SubHeader;
});
