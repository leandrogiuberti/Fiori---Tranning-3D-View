// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
QUnit.config.testTimeout = 400000;

/**
 * @fileOverview QUnit tests for application state (e.g. state management)
 */
sap.ui.define([
    "sap/ushell/test/utils/IframeUtils",
    "sap/ushell/test/utils",
    "sap/ushell/utils"
], (
    IframeUtils,
    testUtils,
    ushellUtils
) => {
    "use strict";

    /* global QUnit */

    async function updateUserPreference (oFlpIframe, sNewContentDensity) {
        const Container = await IframeUtils.requireAsync(oFlpIframe, "sap/ushell/Container");
        const User = Container.getUser();
        User.setContentDensity(sNewContentDensity);

        const UserInfo = await Container.getServiceAsync("UserInfo");
        await ushellUtils.promisify(UserInfo.updateUserPreferences());

        // mock Appearance.controller event
        const EventHub = await IframeUtils.requireAsync(oFlpIframe, "sap/ushell/EventHub");
        EventHub.emit("toggleContentDensity", { contentDensity: sNewContentDensity });
        await ushellUtils.awaitTimeout(0);
    }

    function getContentDensityClasses (oFlpIframe) {
        const aClasses = Array.from(oFlpIframe.contentDocument.body.classList);
        return aClasses.filter((sClass) => sClass.startsWith("sapUiSize"));
    }

    let oFlpIframe;

    QUnit.module("test", {
        before: function () {
            testUtils.clearLocalStorage();
        },
        beforeEach: function () {
            oFlpIframe = IframeUtils.createIframe("sap/ushell/shells/cdm/FioriLaunchpad.Spaces.html#Shell-home", true);
            IframeUtils.appendToQunitFixture(oFlpIframe);
        }
    });

    QUnit.test("The content density is set and restored according to app preferences", async function (assert) {
        // Act #1
        // => default content density is cozy for this device type
        IframeUtils.setHash(oFlpIframe, "#Shell-home");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

        // Assert #1
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCozy"], "correct classes were found (#1)");

        // Act #2
        // open an app which only supports compact
        // => user preference is ignored
        IframeUtils.setHash(oFlpIframe, "#Action-toAppExtensionSample?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".appExtensionSampleText");

        // Assert #2
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCompact"], "correct classes were found (#2)");

        // Act #3
        // open an app which supports only cozy
        // => user preference is identical to app support
        IframeUtils.setHash(oFlpIframe, "#Action-toappnavsample?sap-keep-alive=restricted");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".idQunitDirtyStateProvider");

        // Assert #3
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCozy"], "correct classes were found (#3)");

        // Act #4
        // Update user preference to compact
        // => user preference is ignored
        await updateUserPreference(oFlpIframe, "compact");

        // Assert #4
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCozy"], "correct classes were found (#4)");

        // Act #5
        // navigate back to the app which only supports compact
        // => user preference is identical to app support
        IframeUtils.navigateBack(oFlpIframe);
        await IframeUtils.waitForCssSelector(oFlpIframe, ".appExtensionSampleText");

        // Assert #5
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCompact"], "correct classes were found (#5)");

        // Act #6
        // Navigate back to the home page
        // => user preference is restored / contentDensity is not updated
        IframeUtils.navigateBack(oFlpIframe);
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

        // Assert #6
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCompact"], "correct classes were found (#6)");

        // Act #7
        // Update user preference to cozy
        // => user preference is applied
        await updateUserPreference(oFlpIframe, "cozy");

        // Assert #7
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCozy"], "correct classes were found (#7)");

        // Act #8
        // navigate back to the app which only supports compact
        // => user preference is ignored again
        IframeUtils.setHash(oFlpIframe, "#Action-toAppExtensionSample");
        await IframeUtils.waitForCssSelector(oFlpIframe, ".appExtensionSampleText");

        // Assert #8
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCompact"], "correct classes were found (#8)");

        // Act #9
        // navigate back to the home page
        // => user preference is restored
        IframeUtils.navigateBack(oFlpIframe);
        await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

        // Assert #9
        assert.deepEqual(getContentDensityClasses(oFlpIframe), ["sapUiSizeCozy"], "correct classes were found (#9)");
    });
});
