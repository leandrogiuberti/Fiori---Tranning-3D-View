// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.renderer.NavContainer
 */
sap.ui.define([
    "sap/m/Page",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/renderer/NavContainer",
    "sap/ushell/Container"
], (
    Page,
    nextUIUpdate,
    NavContainer,
    Container
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.config.reorder = false;

    let oPage2;

    QUnit.module("NavContainer integration test", {
        before: function () {
            // Stub the logic of home component id finding
            sandbox.stub(Container, "getRendererInternal").returns({
                byId: sandbox.stub().returns({
                    getId: function (id) { return id; }
                })
            });

            this.oTestContainer = window.document.createElement("div");
            this.oTestContainer.setAttribute("id", "app-container");
            this.oTestContainer.setAttribute("height", "400px");
            this.oTestContainer.setAttribute("width", "100%");
            window.document.body.appendChild(this.oTestContainer);

            this.oPage1 = new Page("home-page", { title: "Home" });
            this.oNavContainer = new NavContainer("viewPortContainer", { pages: this.oPage1 });
            this.oNavContainer.navTo("home-page");
            this.oNavContainer.placeAt("app-container");
            return nextUIUpdate();
        },
        after: function () {
            this.oNavContainer.destroy();
            window.document.body.removeChild(this.oTestContainer);
            sandbox.restore();
        }
    });

    QUnit.test("Rendering", function (assert) {
        // Assert
        const sCurrentPageId = this.oNavContainer.getProperty("currentPageId");
        assert.ok(this.oNavContainer.getDomRef().offsetWidth > 0, "NavContainer is visible");
        assert.ok(this.oPage1.getDomRef().offsetWidth > 0, "NavContainer home page is visible");

        assert.strictEqual(sCurrentPageId, this.oPage1.getId(), "Page 1 is the current center page");
    });

    QUnit.test("Add page", async function (assert) {
        // Arrange
        oPage2 = new Page("second-page", { title: "Application" });

        // Act
        this.oNavContainer.addPage(oPage2);
        await nextUIUpdate();

        // Assert
        assert.ok(oPage2.getDomRef().children.length > 0, "Page 2 is rendered");
        assert.ok(oPage2.hasStyleClass("sapUShellNavContainerPageHidden"), "Page 2 is not visible");
    });

    QUnit.test("Navigate to second page", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const onAfterNavigate = function (oEvent) {
            this.oNavContainer.detachAfterNavigate(onAfterNavigate);
            // Assert
            assert.strictEqual(oEvent.getParameter("fromId"), "home-page", "Navigation event fromId OK");
            assert.strictEqual(oEvent.getParameter("toId"), "second-page", "Navigation event toId OK");
            fnDone();
        }.bind(this);
        this.oNavContainer.attachAfterNavigate(onAfterNavigate);

        // Act
        this.oNavContainer.navTo("second-page");

        // Assert
        const sCurrentPageId = this.oNavContainer.getProperty("currentPageId");
        assert.ok(!oPage2.hasStyleClass("sapUShellNavContainerPageHidden"), "Page 2 is visible");
        assert.ok(this.oPage1.hasStyleClass("sapUShellNavContainerPageHidden"), "Page 1 is not visible");
        assert.strictEqual(sCurrentPageId, oPage2.getId(), "Page 2 is the current center page");
    });

    QUnit.test("Clears busy state with navigation", function (assert) {
        // Arrange
        this.oNavContainer.setBusy(true);

        // Act
        this.oNavContainer.navTo("second-page");

        // Assert
        assert.strictEqual(this.oNavContainer.getBusy(), false, "Busy state is cleared after navigation");
    });

    QUnit.test("Navigate back", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const onAfterNavigate = function (oEvent) {
            this.oNavContainer.detachAfterNavigate(onAfterNavigate);

            // Assert
            assert.strictEqual(oEvent.getParameter("toId"), "home-page", "Navigation event toId OK");
            assert.strictEqual(oEvent.getParameter("fromId"), "second-page", "Navigation event fromId OK");
            fnDone();
        }.bind(this);
        this.oNavContainer.attachAfterNavigate(onAfterNavigate);

        // Act
        this.oNavContainer.navTo("home-page");

        // Assert
        const sCurrentPageId = this.oNavContainer.getProperty("currentPageId");
        assert.ok(oPage2.hasStyleClass("sapUShellNavContainerPageHidden"), "Page 2 is not visible");
        assert.ok(!this.oPage1.hasStyleClass("sapUShellNavContainerPageHidden"), "Page 1 is visible");
        assert.strictEqual(sCurrentPageId, this.oPage1.getId(), "Page 1 is the current center page");
    });

    QUnit.test("Delete second page", function (assert) {
        // Act
        this.oNavContainer.removePage("second-page");

        // Assert
        assert.strictEqual(this.oNavContainer.getPages().length, 1, "Page 2 was removed");
    });
});
