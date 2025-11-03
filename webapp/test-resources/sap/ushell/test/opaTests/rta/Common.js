// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ushell/opa/utils/OpaUtils",
    // imports the resources needed for the Opa tests from the openui5 repo
    "test-resources/sap/ui/rta/integration/pages/Adaptation"
], (
    Opa5,
    OpaUtils
) => {
    "use strict";

    function getFrameUrl (sHash, sUrlParameters, sTestSandbox) {
        const sFlpSandbox = sTestSandbox || "flpSandbox.html";
        let sUrl = `../../demoapps/RTATestApp/test/${sFlpSandbox}`;
        sHash = sHash || "";
        sUrlParameters = sUrlParameters ? `?${sUrlParameters}` : "";

        if (sHash) {
            sHash = `#Worklist-display${sHash}`;
        } else {
            sHash = "#Worklist-display";
        }

        if (document.getElementsByTagName("base")[0]) { // new test suite with <base>
            sUrl = OpaUtils.normalizeConfigPath(`../demoapps/RTATestApp/test/${sFlpSandbox}`);
        }

        return sUrl + sUrlParameters + sHash;
    }

    return Opa5.extend("sap.ushell.test.opaTests.rta.Common", {
        iStartTheApp: function (oOptions) {
            oOptions = oOptions || {};
            this.iStartMyAppInAFrame({
                source: getFrameUrl(oOptions.hash, oOptions.urlParameters, oOptions.testSandbox),
                autoWait: true
            });
        },
        iAddTheVariantURLParameter: function () {
            Object.keys(window.sessionStorage).some((key) => {
                if (key.indexOf("sap.ui.fl.variant.id") > -1) {
                    Opa5.getContext().variantId = JSON.parse(window.sessionStorage[key]).fileName;
                    return true;
                }
                return false;
            });
        },
        iShouldSeeTheSectionAfterReload (sId, oRTAPluginBeforeReload) {
            return this.waitFor({
                controlType: "sap.ui.dt.ElementOverlay",
                visible: false,
                matchers (oOverlay) {
                    return oOverlay.getElement().getId() === sId;
                },
                success (aOverlays) {
                    const oOpa5Window = Opa5.getWindow();
                    Opa5.assert.ok(aOverlays[0].getElement().getVisible(), "The section is not shown on the UI");
                    Opa5.assert.ok(
                        oRTAPluginBeforeReload === oOpa5Window.sap.ushell.plugins.rta,
                        "The plugin was not loaded again - soft reload"
                    );
                },
                errorMessage: "Did not find the element or it is still visible"
            });
        }
    });
});
