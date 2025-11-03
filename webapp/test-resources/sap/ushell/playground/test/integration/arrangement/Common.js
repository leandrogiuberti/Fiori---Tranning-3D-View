// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/Opa5"
], (Opa5) => {
    "use strict";

    return Opa5.extend("ControlPlaygrounds.test.integration.arrangement.Common", {
        iStartMyApp: function () {
            return this.iStartMyAppInAFrame("../../PlaygroundHomepage.html");
        },
        iTeardownMyApp: function () {
            return this.iTeardownMyAppFrame();
        }
    });
});
