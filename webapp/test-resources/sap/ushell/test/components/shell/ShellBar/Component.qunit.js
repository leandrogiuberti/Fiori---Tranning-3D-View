// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.ShellBar.Component
 */
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ushell/components/shell/ShellBar/Component"
], (
    UIComponent,
    Device,
    ShellBarComponent
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("Component Initialization", {
        beforeEach: function () {
            this.oInitRangeSetStub = sandbox.stub(Device.media, "initRangeSet");
            this.oParentInitStub = sandbox.stub(UIComponent.prototype, "init");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("init - Calls parent init, sets up the model and initializes FLPRangeSet with correct parameters", async function (assert) {
        // Arrange
        const aFLPRangeSetParams = [
            "Ushell",
            [600, 1024, 1440, 1920],
            "px",
            ["Phone", "Tablet", "Desktop", "LargeDesktop", "ExtraLargeDesktop"]
        ];

        // Act
        const oComponent = new ShellBarComponent();

        // Assert
        assert.ok(this.oParentInitStub.calledOnce, "Parent UIComponent.init was called");

        const oModel = oComponent.getModel();
        assert.ok(oModel, "Model was set on the component");
        assert.deepEqual(oModel.getProperty("/logo"), {}, "logo is set to an empty object");
        assert.strictEqual(oModel.getProperty("/searchField/show"), false, "searchField.show is set to false");

        assert.ok(this.oInitRangeSetStub.calledOnce, "Device.media.initRangeSet was called");
        assert.ok(this.oInitRangeSetStub.calledWithExactly(...aFLPRangeSetParams), "FLPRangeSet was initialized with the correct parameters");

        oComponent.destroy();
    });

    QUnit.test("Component has enhanced API", async function (assert) {
        // Act
        const oComponent = new ShellBarComponent();

        // Assert
        assert.ok(oComponent.setSearch);
        assert.ok(oComponent.setSearchState);
        assert.ok(oComponent.getSearchState);
        assert.ok(oComponent.isPhoneState);
        assert.ok(oComponent.getSearchWidth);
        assert.ok(oComponent.attachSearchSizeChanged);
        assert.ok(oComponent.attachSearchButtonPress);
        assert.ok(oComponent.setAppTitle);
        assert.ok(oComponent.getAppTitle);
        assert.ok(oComponent.isLargeState);
        assert.ok(oComponent.isExtraLargeState);
        assert.ok(oComponent.getNotificationsBtnDomRef);
        assert.ok(oComponent.getProductSwitchDomRef);

        oComponent.destroy();
    });

    QUnit.test("Component has enhanced API", async function (assert) {
        // Act
        const oComponent = new ShellBarComponent();

        // Assert
        assert.ok(oComponent.setSearch);
        assert.ok(oComponent.setSearchState);
        assert.ok(oComponent.getSearchState);
        assert.ok(oComponent.isPhoneState);
        assert.ok(oComponent.getSearchWidth);
        assert.ok(oComponent.attachSearchSizeChanged);
        assert.ok(oComponent.attachSearchButtonPress);
        assert.ok(oComponent.setAppTitle);
        assert.ok(oComponent.getAppTitle);
        assert.ok(oComponent.isLargeState);
        assert.ok(oComponent.isExtraLargeState);
        assert.ok(oComponent.getNotificationsBtnDomRef);
        assert.ok(oComponent.getProductSwitchDomRef);
        assert.ok(oComponent.setFocusToLogo);
        assert.ok(oComponent.setFocusToAppFinderButton);
    });

    QUnit.module("Search Functionality", {
        beforeEach: async function () {
            this.oComponent = new ShellBarComponent();

            this.oMockShellBar = {
                addSearchField: sandbox.stub(),
                destroySearchField: sandbox.stub()
            };
            this.byIdStub = sandbox.stub();
            this.byIdStub.withArgs("shellBar").returns(this.oMockShellBar);
            this.oRootControlLoadedStub = sandbox.stub(this.oComponent, "rootControlLoaded").resolves({
                byId: this.byIdStub
            });

            this.oGetSearchStateStub = sandbox.stub(this.oComponent, "getSearchState");
            this.oGetSearchStateStub.returns("COL");
            this.oSetPropertyStub = sandbox.stub(this.oComponent, "setProperty");
            this.oGetModelStub = sandbox.stub(this.oComponent, "getModel").returns({
                setProperty: sandbox.stub()
            });

            this.oToggleClassStub = sandbox.stub(document.body.classList, "toggle");
        },
        afterEach: function () {
            this.oComponent.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("setSearch - Adds the search field to the shellBar", async function (assert) {
        // Arrange
        const oMockSearchField = { id: "mockSearchField" };

        // Act
        await this.oComponent.setSearch(oMockSearchField);

        // Assert
        assert.ok(this.oRootControlLoadedStub.calledOnce, "rootControlLoaded was called");
        assert.ok(this.oMockShellBar.addSearchField.calledOnceWithExactly(oMockSearchField), "Search field was added to the shellBar.");
        assert.ok(this.oMockShellBar.destroySearchField.calledOnce, "Dummy Search Field was destroyed.");
    });

    QUnit.test("setSearchState - Does nothing if state is unchanged", function (assert) {
        // Arrange
        const sStateName = "COL";

        // Act
        this.oComponent.setSearchState(sStateName);

        // Assert
        assert.ok(this.oSetPropertyStub.notCalled, "searchState property was not updated");
        assert.ok(this.oGetModelStub().setProperty.notCalled, "searchField.show was not updated in the model");
        assert.ok(this.oToggleClassStub.notCalled, "Overlay class was not toggled");
        assert.strictEqual(this.oComponent.getSearchWidth(), 0, "_iSearchWidth was not updated");
    });

    QUnit.test("setSearchState - Updates search state and toggles overlay class", function (assert) {
        // Arrange
        const sStateName = "EXP";
        const maxRemSize = 40;
        const bWithOverlay = true;

        // Act
        this.oComponent.setSearchState(sStateName, maxRemSize, bWithOverlay);

        // Assert
        assert.ok(this.oSetPropertyStub.calledOnceWithExactly("searchState", sStateName, false), "searchState property was updated");
        assert.ok(this.oGetModelStub().setProperty.calledWithExactly("/searchField/show", true), "searchField.show was set to true in the model");
        assert.ok(this.oToggleClassStub.calledOnceWithExactly("sapUshellShellShowSearchOverlay", true), "Overlay class was toggled on the body");
        assert.strictEqual(this.oComponent.getSearchWidth(), 40, "_iSearchWidth was set to the provided maxRemSize value");
    });

    QUnit.test("setSearchState - Resets search state and removes overlay class", function (assert) {
        // Arrange
        this.oGetSearchStateStub.returns("EXP");
        const sStateName = "COL";

        // Act
        this.oComponent.setSearchState(sStateName);

        // Assert
        assert.ok(this.oSetPropertyStub.calledOnceWithExactly("searchState", sStateName, false), "searchState property was updated");
        assert.ok(this.oGetModelStub().setProperty.calledWithExactly("/searchField/show", false), "searchField.show was set to false in the model");
        assert.ok(this.oToggleClassStub.calledOnceWithExactly("sapUshellShellShowSearchOverlay", false), "Overlay class was removed from the body");
        assert.strictEqual(this.oComponent.getSearchWidth(), 0, "_iSearchWidth was reset to 0");
    });

    QUnit.test("setSearchState - Uses default maxRemSize when not provided", function (assert) {
        // Arrange
        const sStateName = "EXP";

        // Act
        this.oComponent.setSearchState(sStateName, false);

        // Assert
        assert.ok(this.oSetPropertyStub.calledOnceWithExactly("searchState", sStateName, false), "searchState property was updated");
        assert.ok(this.oGetModelStub().setProperty.calledWithExactly("/searchField/show", true), "searchField.show was set to true in the model");
        assert.ok(this.oToggleClassStub.calledOnceWithExactly("sapUshellShellShowSearchOverlay", false), "Overlay class was not toggled (default bWithOverlay is false)");
        assert.strictEqual(this.oComponent.getSearchWidth(), 35, "_iSearchWidth was set to the default value of 35");
    });

    QUnit.test("setSearchState - Handles boolean maxRemSize and updates overlay", function (assert) {
        // Arrange
        const sStateName = "EXP";
        const maxRemSize = true;

        // Act
        this.oComponent.setSearchState(sStateName, maxRemSize);

        // Assert
        assert.ok(this.oSetPropertyStub.calledOnceWithExactly("searchState", sStateName, false), "searchState property was updated");
        assert.ok(this.oGetModelStub().setProperty.calledWithExactly("/searchField/show", true), "searchField.show was set to true in the model");
        assert.ok(this.oToggleClassStub.calledOnceWithExactly("sapUshellShellShowSearchOverlay", true), "Overlay class was toggled on the body");
        assert.strictEqual(this.oComponent.getSearchWidth(), 35, "_iSearchWidth was set to the default value of 35");
    });

    QUnit.module("Device State Handling", {
        beforeEach: async function () {
            this.oComponent = new ShellBarComponent();

            this.oMockDomRef = {
                getBoundingClientRect: sandbox.stub().returns({ width: 800 })
            };
            this.oComponent.getDomRef = sandbox.stub().returns(this.oMockDomRef);

            this.oGetCurrentRangeStub = sandbox.stub(Device.media, "getCurrentRange").returns({
                name: "Desktop"
            });

            this.oSystemStub = sandbox.stub(Device.system, "phone").value(false);
        },
        afterEach: function () {
            this.oComponent.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("isPhoneState - Returns true when device is a phone", async function (assert) {
        // Arrange
        this.oSystemStub.value(true);

        // Act
        const bResult = this.oComponent.isPhoneState();

        // Assert
        assert.strictEqual(bResult, true, "Returns true when the device is a phone");
    });

    QUnit.test("isPhoneState - Returns true when device type is 'Phone'", async function (assert) {
        // Arrange
        this.oGetCurrentRangeStub.returns({ name: "Phone" });

        // Act
        const bResult = this.oComponent.isPhoneState();

        // Assert
        assert.strictEqual(bResult, true, "Returns true when the device type is 'Phone'");
    });

    QUnit.test("isPhoneState - Returns true when there is not enough space for search", async function (assert) {
        // Arrange
        this.oMockDomRef.getBoundingClientRect.returns({ width: 20 });
        sandbox.stub(this.oComponent, "getSearchWidth").returns(40);

        // Act
        const bResult = this.oComponent.isPhoneState();

        // Assert
        assert.strictEqual(bResult, true, "Returns true when there is not enough space for search");
    });

    QUnit.test("isPhoneState - Returns false when device is not a phone and there is enough space", async function (assert) {
        // Arrange
        this.oMockDomRef.getBoundingClientRect.returns({ width: 100 });
        sandbox.stub(this.oComponent, "getSearchWidth").returns(40);

        // Act
        const bResult = this.oComponent.isPhoneState();

        // Assert
        assert.strictEqual(bResult, false, "Returns false when the device is not a phone and there is enough space");
    });

    QUnit.test("isExtraLargeState - Returns true when the current range is 'ExtraLargeDesktop'", function (assert) {
        // Arrange
        this.oGetCurrentRangeStub.returns({ from: 1920 });

        // Act
        const bResult = this.oComponent.isExtraLargeState();

        // Assert
        assert.strictEqual(bResult, true, "Returns true when the current range is 'ExtraLargeDesktop'");
    });

    QUnit.test("isExtraLargeState - Returns false when the current range is not 'ExtraLargeDesktop'", function (assert) {
        // Arrange
        this.oGetCurrentRangeStub.returns({ from: 1440 });

        // Act
        const bResult = this.oComponent.isExtraLargeState();

        // Assert
        assert.strictEqual(bResult, false, "Returns false when the current range is not 'ExtraLargeDesktop'");
    });
});
