// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for behaviour of restricted keep alive
 */
QUnit.config.testTimeout = 400000;

sap.ui.define([
    "sap/ushell/test/utils/IframeUtils"
], (
    IframeUtils
) => {
    "use strict";

    /* global QUnit */

    let oFlpIframe;

    QUnit.module("test", {
        beforeEach: async function () {
            oFlpIframe = IframeUtils.createIframe("sap/ushell/shells/demo/FioriLaunchpadIsolation.html#Shell-home", true);
            IframeUtils.appendToQunitFixture(oFlpIframe);
            IframeUtils.setConfig(oFlpIframe, {
                renderers: {
                    fiori2: {
                        componentData: {
                            config: {
                                enableSearch: false,
                                esearch: {
                                    sinaConfiguration: "sample"
                                }
                            }
                        }
                    }
                }
            });

            await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

            // UI5 History does not keep track of the history when running within an iframe
            const UI5History = await IframeUtils.requireAsync(oFlpIframe, "sap/ui/core/routing/History");
            UI5History._bUsePushState = true;
        }
    });

    function getApplicationCount () {
        const oNavContainer = IframeUtils.getWithCssSelector(oFlpIframe, "#viewPortContainer");
        return Array.from(oNavContainer.children).filter((element) => element.classList.contains("sapUShellApplicationContainer")).length;
    }

    QUnit.test("check use of same iframe for two apps", async function (assert) {
        /*
         * Overall lifecycle of keepAlive restricted apps (keep until home)
         */

        // Nav to non isolated keepAlive app#1
        IframeUtils.setHash(oFlpIframe, "#AppNotIsolated-Action?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idApplist", "application-AppNotIsolated-Action");

        // Nav to different isolated keepAlive app#2
        IframeUtils.setHash(oFlpIframe, "#Action-toLetterBoxing?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idQunitChangeLetterBoxButton", "application-Action-toLetterBoxing");

        // Nav to different non isolated app#3
        IframeUtils.setHash(oFlpIframe, "#FioriToExtApp-Action");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".btnSubmitToMain", "application-FioriToExtApp-Action");

        // Nav to different non isolated keepAlive app#4
        IframeUtils.setHash(oFlpIframe, "#FioriToExtAppTarget-Action?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idQunitSubmit", "application-FioriToExtAppTarget-Action");

        /**
         * app#1: still alive in DOM
         * app#2: still alive in iframe
         * app#3: destroyed
         * app#4: active app
         */
        let iApplicationCount = getApplicationCount();
        assert.strictEqual(iApplicationCount, 3, "apps were found in NavContainer");
        assert.ok(IframeUtils.getApplicationContainer(oFlpIframe, "application-AppNotIsolated-Action"), "application-AppNotIsolated-Action was found");
        assert.ok(IframeUtils.getApplicationContainer(oFlpIframe, "application-Action-toLetterBoxing"), "application-Action-toLetterBoxing was found");
        assert.ok(IframeUtils.getApplicationContainer(oFlpIframe, "application-FioriToExtAppTarget-Action"), "application-FioriToExtAppTarget-Action was found");

        // Nav to home
        IframeUtils.setHash(oFlpIframe, "#Shell-home");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

        /**
         * app#1: destroyed
         * app#2: destroyed, but iframe still exists
         * app#3: destroyed
         * app#4: destroyed
         */
        iApplicationCount = getApplicationCount();
        assert.strictEqual(iApplicationCount, 1, "apps were found in NavContainer");
        assert.ok(IframeUtils.getApplicationContainer(oFlpIframe, "application-Action-toLetterBoxing"), "application-Action-toLetterBoxing was found");

        // Nav to isolated keepAlive app#2
        IframeUtils.setHash(oFlpIframe, "#Action-toLetterBoxing?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idQunitChangeLetterBoxButton", "application-Action-toLetterBoxing");

        // Nav to isolated non keepAlive app#5
        IframeUtils.setHash(oFlpIframe, "#Action-toAppExtensionSample?sap-keep-alive=false");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".appExtensionSampleText", "application-Action-toLetterBoxing");

        // Nav to home
        IframeUtils.setHash(oFlpIframe, "#Shell-home");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

        /**
         * app#2: destroyed, but iframe still exists
         * app#5: destroyed
         */
        iApplicationCount = getApplicationCount();
        assert.strictEqual(iApplicationCount, 1, "apps were found in NavContainer");

        let oApplicationNode = IframeUtils.getWithCssSelectorInApplication(oFlpIframe, "[id$=\"sap\\.ushell\\.demo\\.AppLetterBoxing-content\"]", "application-Action-toLetterBoxing");
        assert.notOk(oApplicationNode, "application-Action-toLetterBoxing was destroyed");
        oApplicationNode = IframeUtils.getWithCssSelectorInApplication(oFlpIframe, "#sap\\.ushell\\.demo\\.AppExtensionSample-content", "application-Action-toLetterBoxing");
        assert.notOk(oApplicationNode, "application-Action-toAppExtensionSample was destroyed");

        /*
         * Navigation to non isolated keepAlive app with same component name
         */

        // Nav to non isolated keepAlive app#5
        IframeUtils.setHash(oFlpIframe, "#AppNav-SAP1?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idQunitDirtyStateProvider", "application-AppNav-SAP1");

        assert.ok(IframeUtils.getApplicationContainer(oFlpIframe, "application-AppNav-SAP1"), "application-AppNav-SAP1 was found");

        // Nav to non isolated keepAlive app#6 with same component
        IframeUtils.setHash(oFlpIframe, "#AppNav-SAP2?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idQunitDirtyStateProvider", "application-AppNav-SAP2");

        /**
         * app#5: destroyed
         * app#6: active app
         */
        assert.notOk(IframeUtils.getApplicationContainer(oFlpIframe, "application-AppNav-SAP1"), "application-AppNav-SAP1 was not found");
        assert.ok(IframeUtils.getApplicationContainer(oFlpIframe, "application-AppNav-SAP2"), "application-AppNav-SAP2 was found");

        // Nav to home
        IframeUtils.setHash(oFlpIframe, "#Shell-home");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

        /*
         * Navigation to isolated keepAlive app with same component name
         */

        // Nav to isolated keepAlive app#7
        IframeUtils.setHash(oFlpIframe, "#FioriToExtAppIsolated-Action?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".btnSubmitToMain", "application-Action-toLetterBoxing");

        // Nav to isolated keepAlive app#8 with same component
        IframeUtils.setHash(oFlpIframe, "#FioriToExtAppIsolated-KeepAlive?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".btnSubmitToMain", "application-Action-toLetterBoxing");

        // Nav to home
        IframeUtils.setHash(oFlpIframe, "#Shell-home");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

        /*
         * Navigation to same keepAlive app with different params
         */

        // Nav to isolated keepAlive app#9
        IframeUtils.setHash(oFlpIframe, "#Action-toappnavsample?sap-keep-alive=restricted&variant=AppVariant1");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idQunitDirtyStateProvider", "application-Action-toLetterBoxing");

        oApplicationNode = IframeUtils.getWithCssSelectorInApplication(oFlpIframe, "#sap\\.ushell\\.demo\\.AppNavSample-content", "application-Action-toLetterBoxing");
        assert.ok(oApplicationNode.innerText.includes("AppVariant1"), "AppVariant1 was found");

        // Nav to same isolated keepAlive app#9 with different params
        IframeUtils.setHash(oFlpIframe, "#Action-toappnavsample?sap-keep-alive=restricted&variant=AppVariant2");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idQunitDirtyStateProvider", "application-Action-toLetterBoxing");

        oApplicationNode = IframeUtils.getWithCssSelectorInApplication(oFlpIframe, "#sap\\.ushell\\.demo\\.AppNavSample-content", "application-Action-toLetterBoxing");
        assert.notOk(oApplicationNode.innerText.includes("AppVariant1"), "AppVariant1 was not found");
        assert.ok(oApplicationNode.innerText.includes("AppVariant2"), "AppVariant2 was found");

        // Nav back to app9 with initial params
        IframeUtils.navigateBack(oFlpIframe);
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".idQunitDirtyStateProvider", "application-Action-toLetterBoxing");

        oApplicationNode = IframeUtils.getWithCssSelectorInApplication(oFlpIframe, "#sap\\.ushell\\.demo\\.AppNavSample-content", "application-Action-toLetterBoxing");
        assert.ok(oApplicationNode.innerText.includes("AppVariant1"), "AppVariant1 was found");
        assert.notOk(oApplicationNode.innerText.includes("AppVariant2"), "AppVariant2 was not found");
    });

    QUnit.module("workzone search", {
        beforeEach: async function () {
            oFlpIframe = IframeUtils.createIframe("sap/ushell/shells/demo/FioriLaunchpad.Isolation.html#Shell-home", true);
            IframeUtils.appendToQunitFixture(oFlpIframe);

            await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

            // UI5 History does not keep track of the history when running within an iframe
            const UI5History = await IframeUtils.requireAsync(oFlpIframe, "sap/ui/core/routing/History");
            UI5History._bUsePushState = true;
        }
    });

    QUnit.test("check navigation with workzone search", async function (assert) {
        IframeUtils.setHash(oFlpIframe, "#WorkZoneSearchResult-display?searchTerm=app&category=app");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUiCEPSearchCatList .sapUshellVizInstance");

        IframeUtils.setHash(oFlpIframe, "#Action-toappnavsample?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".testDirtyFlagOnBtn", "application-Action-toappnavsample");

        IframeUtils.navigateBack(oFlpIframe);
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUiCEPSearchCatList .sapUshellVizInstance");

        assert.ok(!IframeUtils.getWithCssSelectorInApplication(oFlpIframe, ".testDirtyFlagOnBtn", "application-Action-toappnavsample"), "App was destroyed");

        IframeUtils.setHash(oFlpIframe, "#Action-toappnavsample?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, ".testDirtyFlagOnBtn", "application-Action-toappnavsample");
    });
});
