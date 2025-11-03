// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
QUnit.config.testTimeout = 400000;

/**
 * @fileOverview QUnit tests for behaviour of the ShellUIService in an iFrame
 */
sap.ui.define([
    "sap/ushell/test/utils/IframeUtils"
], (
    IframeUtils
) => {
    "use strict";

    /* global QUnit */

    let oFlpIframe;

    QUnit.module("Test", {
        beforeEach: function () {
            oFlpIframe = IframeUtils.createIframe("sap/ushell/shells/demo/FioriLaunchpadIsolation.html#Shell-home", true);
            IframeUtils.appendToQunitFixture(oFlpIframe);
        }
    });

    QUnit.test("setting the app title", async function (assert) {
        // Arrange
        const sAppHash = "#Action-toAppShellUIServiceSample";
        const sAppId = "application-Action-toAppShellUIServiceSample";
        IframeUtils.setHash(oFlpIframe, "#Shell-home");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

        IframeUtils.setHash(oFlpIframe, sAppHash);

        const sControlPrefix = `${sAppId}-component---appView-`;
        await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, `#${sControlPrefix}-setTitleButton`, sAppId);
        const oSetTitleButton = await IframeUtils.waitForControlInApplication(oFlpIframe, `${sControlPrefix}-setTitleButton`, sAppId);
        const oSetTitleTitle = await IframeUtils.waitForControlInApplication(oFlpIframe, `${sControlPrefix}-setTitleTitle`, sAppId);
        const oSetTitleAddInfoHeaderText = await IframeUtils.waitForControlInApplication(oFlpIframe, `${sControlPrefix}-setTitleAdditionalInfoHeaderText`, sAppId);
        const oSetTitleAddInfoAddContext = await IframeUtils.waitForControlInApplication(oFlpIframe, `${sControlPrefix}-setTitleAdditionalInfoAdditionalContext`, sAppId);

        // Act
        oSetTitleTitle.setValue("Test Title");
        oSetTitleAddInfoHeaderText.setValue("Test Header Text");
        oSetTitleAddInfoAddContext.setValue("Test Additional Context");
        oSetTitleButton.firePress();

        const ushellUtils = await IframeUtils.requireAsync(oFlpIframe, "sap/ushell/utils");

        // wait for UI5 rendering to happen
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.strictEqual(oFlpIframe.contentWindow.document.title, "Test Header Text - Test Additional Context",
            "The title of the iFrame document should be set to 'Test Header Text - Test Additional Context'");
        const oFLPTitle = await IframeUtils.waitForControl(oFlpIframe, "shellAppTitle");
        assert.strictEqual(oFLPTitle.getText(),
            "Test Title", "The title of the shell header should be set to 'Test Title'");

        // Act
        oSetTitleTitle.setValue("");
        oSetTitleAddInfoHeaderText.setValue("Test Header Text 2");
        oSetTitleAddInfoAddContext.setValue("Test Additional Context 2");
        oSetTitleButton.firePress();

        // wait for UI5 rendering to happen
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.strictEqual(oFlpIframe.contentWindow.document.title, "Test Header Text 2 - Test Additional Context 2",
            "The title of the iFrame document should be set to 'Test Header Text 2 - Test Additional Context 2'");
        assert.strictEqual(oFLPTitle.getText(),
            "App ShellUIService Sample", "The title of the shell header should be set to the default title: 'App ShellUIService Sample'");
    });
});
