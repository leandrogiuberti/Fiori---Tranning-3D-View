// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for ApplicationType/UrlPostProcessing.js
 */
sap.ui.define([
    "sap/ui/core/Supportability",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/ApplicationType/UrlPostProcessing",
    "sap/ushell/appIntegration/ApplicationContainer",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/User",
    "sap/ushell/utils"
], (
    Supportability,
    hasher,
    jQuery,
    UrlPostProcessing,
    ApplicationContainer,
    Config,
    Container,
    ushellLibrary,
    User,
    ushellUtils
) => {
    "use strict";

    /* global sinon, QUnit */

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    const sandbox = sinon.createSandbox({});

    QUnit.module("module", {
        beforeEach: async function () {
            this.oUser = new User();
            sandbox.stub(Container, "getUser").returns(this.oUser);
        },
        afterEach: async function () {
            sandbox.restore();

            document.body.classList.remove("sapUiSizeCompact");
            document.body.classList.remove("sapUiSizeCozy");
        }
    });

    [{
        description: "accessibility was set to 'X'",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`, // NOTE: not the browser location URL!
        expectedUrlAddition: "sap-ie=edge&sap-accessibility=X&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: "X",
        applicationType: "NWBC"
    }, {
        description: "sap-accessibility was set to 'X' in the browser location url",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        sapAccessibilityUrlBoolean: true,
        expectedUrlAddition: "sap-ie=edge&sap-accessibility=X&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "sap-accessibility was set to false in the browser location url",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        sapAccessibilityUrlBoolean: false,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: "X",
        applicationType: "NWBC"
    }, {
        description: "accessibility was set to undefined",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "accessibility was set to ''",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "theme from User object is undefined",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "theme from User object is a sap_ theme",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-theme=sap_horizon&sap-ushell-timeout=0",
        nwbcTheme: "sap_horizon",
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "theme from User object is a custom theme",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-theme=custom_theme@https://frontendserver.company.com/the/theme/repository/path&sap-ushell-timeout=0",
        nwbcTheme: "custom_theme@https://frontendserver.company.com/the/theme/repository/path",
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "the version is set (1.32.5) and applicationType = NWBC",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0&sap-shell=FLP1.32.5-NWBC",
        version: "1.32.5",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "the version is set (1.32.5) and no applicationType is set",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: undefined,
        version: "1.32.5",
        nwbcTheme: undefined,
        accessibility: undefined
        // no application type
    }, {
        description: "the version is set (1.32.5) and applicationType = TR",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-keepclientsession=2&sap-ushell-timeout=0&sap-shell=FLP1.32.5",
        version: "1.32.5",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "TR"
    }, {
        description: "sap-statistics was set to true in UI5 configuration",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        sapStatisticsUI5ConfigBoolean: true,
        expectedUrlAddition: "sap-ie=edge&sap-statistics=true&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "sap-statistics was set to false in UI5 configuration",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        sapStatisticsUI5ConfigBoolean: false,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "sap-statistics was set to true in the UI5 configuration and the sap-statistics appears as a non-true and non-false intent parameter",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas?sap-statistics=something`,
        sapStatisticsUI5ConfigBoolean: true,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "sap-statistics was set to true in the UI5 configuration and the sap-statistics appears false intent parameter",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas?sap-statistics=false`,
        sapStatisticsUI5ConfigBoolean: true,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        applicationType: "NWBC"
    }, {
        description: "`bReuseSession` is true; the url has the query parameter `sap-keepclientsession=1`",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-keepclientsession=1&sap-ushell-timeout=0",
        nwbcTheme: undefined,
        accessibility: undefined,
        bReuseSession: true
    }, {
        description: "flp URL contains sap-iapp-state parameter in the hash in 1 parameter",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-iapp-state=APPSTATEID&sap-ushell-timeout=0",
        applicationType: "NWBC",
        getHashFunc: function () { return "Action-Semantic&/sap-iapp-state=APPSTATEID"; }
    }, {
        description: "flp URL contains sap-iapp-state parameter in the hash in 3 parameters",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-iapp-state=APPSTATEID&sap-ushell-timeout=0",
        applicationType: "NWBC",
        getHashFunc: function () { return "Action-Semantic&/AAAAA=12345667/sap-iapp-state=APPSTATEID/BBBBB=987654"; }
    }, {
        description: "flp URL contains empty hash",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        getHashFunc: function () { return ""; }
    }, {
        description: "flp URL contains undefined hash",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        getHashFunc: function () { return undefined; }
    }, {
        description: "flp URL contains no sap-iapp-state parameter in the hash",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        getHashFunc: function () { return "Action-Semantic"; }
    }, {
        description: "flp URL contains empty sap-iapp-state parameter in the hash with 3 parameters",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        getHashFunc: function () { return "Action-Semantic&/AAAAA=12345667/sap-iapp-state=/BBBBB=987654"; }
    }, {
        description: "flp URL contains empty sap-iapp-state parameter in the hash with 1 parameter only",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        getHashFunc: function () { return "Action-Semantic&/sap-iapp-state="; }
    }, {
        description: "URL for compact density",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-touch=0&sap-ushell-timeout=0",
        applicationType: "NWBC",
        densityFunc: function () {
            jQuery("body")
                .toggleClass("sapUiSizeCompact", true)
                .toggleClass("sapUiSizeCozy", false);
        }
    }, {
        description: "URL for cozy density",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-touch=1&sap-ushell-timeout=0",
        applicationType: "NWBC",
        densityFunc: function () {
            jQuery("body")
                .toggleClass("sapUiSizeCompact", false)
                .toggleClass("sapUiSizeCozy", true);
        }
    }, {
        description: "session timeout is disabled",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        sessionTimeoutFunc: function () {
            return sandbox.stub(Config, "last").returns(-1);
        }
    }, {
        description: "session timeout is null",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        sessionTimeoutFunc: function () {
            return sandbox.stub(Config, "last").returns(null);
        }
    }, {
        description: "session timeout is empty string",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        sessionTimeoutFunc: function () {
            return sandbox.stub(Config, "last").returns("");
        }
    }, {
        description: "session timeout is undefined",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        sessionTimeoutFunc: function () {
            return sandbox.stub(Config, "last").returns(undefined);
        }
    }, {
        description: "session timeout is 10 min",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=10",
        applicationType: "NWBC",
        sessionTimeoutFunc: function () {
            return sandbox.stub(Config, "last").returns(10);
        }
    }, {
        description: "session timeout is 0",
        inputUrl: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`,
        expectedUrlAddition: "sap-ie=edge&sap-ushell-timeout=0",
        applicationType: "NWBC",
        sessionTimeoutFunc: function () {
            return sandbox.stub(Config, "last").returns(0);
        }
    }].forEach((oFixture) => {
        QUnit.test(`adjustNwbcUrl returns the correct URL when ${oFixture.description}`, function (assert) {
            // Arrange
            sandbox.stub(ushellUtils, "getParameterValueBoolean").callsFake((sParameter, sUrl) => {
                if (sParameter === "sap-accessibility" && sUrl === undefined) {
                    return oFixture.sapAccessibilityUrlBoolean;
                }
                // eslint-disable-next-line no-throw-literal
                throw "code is calling getParameterValueBoolean with unexpected arguments";
            });

            sandbox.stub(Supportability, "isStatisticsEnabled").returns(oFixture.sapStatisticsUI5ConfigBoolean);

            ApplicationContainer._setCachedUI5Version(oFixture.version);

            if (oFixture.nwbcTheme) {
                sandbox.stub(this.oUser, "getTheme").returns(oFixture.nwbcTheme);
            }

            if (oFixture.accessibility) {
                sandbox.stub(this.oUser, "getAccessibilityMode").returns(oFixture.accessibility);
            }

            if (oFixture.getHashFunc) {
                const fHashStub = sandbox.stub(hasher, "getHash");
                fHashStub.callsFake(oFixture.getHashFunc);
            }

            if (oFixture.densityFunc) {
                oFixture.densityFunc();
            }
            if (oFixture.sessionTimeoutFunc) {
                oFixture.sessionTimeoutFunc();
            }

            const oApplicationContainer = new ApplicationContainer();
            if (oFixture.bReuseSession) {
                oApplicationContainer.setFrameworkId("TR");
                oApplicationContainer.setStatefulType(StatefulType.ContractV2);
            }

            // Act
            const sAdjustedUrl = UrlPostProcessing.processUrl(
                oFixture.inputUrl,
                oFixture.applicationType,
                false, // bForFramelessWindow
                oApplicationContainer
            );

            // Assert
            // decode the URL for better readability in case of errors
            const sAdjustedDecodedUrl = decodeURIComponent(sAdjustedUrl);
            const sSep = oFixture.inputUrl.indexOf("?") >= 0 ? "&" : "?";

            if (oFixture.expectedUrlAddition) {
                assert.strictEqual(sAdjustedDecodedUrl, oFixture.inputUrl + sSep + oFixture.expectedUrlAddition);
            } else {
                assert.strictEqual(sAdjustedDecodedUrl, oFixture.inputUrl);
            }
        });
    });
});
