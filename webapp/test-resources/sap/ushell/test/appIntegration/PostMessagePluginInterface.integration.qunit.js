// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for behaviour plugins post message api interface
 *
 * Communication from outer shell plugin
 *      sap/ushell/demoapps/BootstrapPluginSample/CFLPPluginsSample/YellowBoxPlugin/floatingWindow/Component
 * to appruntime plugin
 *      sap/ushell/demoapps/BootstrapPluginSample/CFLPPluginsSample/BlueBoxPlugin/Component
 * and back to the outer shell
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
        beforeEach: function () {
            oFlpIframe = IframeUtils.createIframe("sap/ushell/shells/demo/FioriLaunchpadIsolation.html#Action-toLetterBoxing", true);
            IframeUtils.appendToQunitFixture(oFlpIframe);
        }
    });

    QUnit.test("check plugins API", async function (assert) {
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, "#idHelloFromParent", "application-Action-toLetterBoxing");

        const oButton = await IframeUtils.waitForControl(oFlpIframe, "copilotBtn");
        oButton.firePress();

        await IframeUtils.waitForControl(oFlpIframe, "shell-floatingContainer");

        const oFlpBody = IframeUtils.getWithCssSelector(oFlpIframe, "body");
        const aNodes = Array.from(oFlpBody.querySelectorAll("span"));

        assert.ok(aNodes.find((oNode) => oNode.textContent.includes("Agent connected successfully")), "did not find hello from plugin");
        assert.ok(aNodes.find((oNode) => oNode.textContent.includes("Response from Plugin 1234")), "did not find message from plugin");
    });
});
