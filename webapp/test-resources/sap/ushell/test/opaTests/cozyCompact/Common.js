// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ushell/opa/utils/OpaUtils"
], (Opa5, OpaUtils) => {
    "use strict";

    // All the arrangements for all Opa tests are defined here
    const Common = Opa5.extend("sap.ushell.test.opaTests.cozyCompact.Common", {
        StartAppWithCozyCompact: function (val) {
            let sFrameUrl = `../../shells/demo/ui5appruntime.html?${val ? `sap-touch=${val}&` : ""}sap-ui-app-id=sap.ushell.demo.AppLetterBoxing#Action-toLetterBoxing`;

            if (document.getElementsByTagName("base")[0]) { // new test suite with <base>
                sFrameUrl = OpaUtils.normalizeConfigPath(`../shells/demo/ui5appruntime.html?${val ? `sap-touch=${val}&` : ""
                }sap-ui-app-id=sap.ushell.demo.AppLetterBoxing#Action-toLetterBoxing`);
            }
            this.iStartMyAppInAFrame(sFrameUrl);
            return this.waitFor({
                timeout: 15,
                errorMessage: "Could not load application"
            });
        }
    });

    return Common;
});
