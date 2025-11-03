// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file QUnit tests for "sap.ushell.ui.launchpad.VizInstanceLink"
 */
sap.ui.define([
    "sap/ui/thirdparty/hasher",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/Config",
    "sap/ushell/ui/launchpad/VizInstanceLink",
    "sap/ushell/ui/launchpad/VizInstance",
    "sap/m/GenericTile",
    "sap/ushell/Container"
], (
    hasher,
    WindowUtils,
    Config,
    VizInstanceLink,
    VizInstance,
    GenericTile,
    Container
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("constructor", {
        beforeEach: function () {
            this.oVizInstanceLink = new VizInstanceLink();
        },
        afterEach: function () {
            this.oVizInstanceLink.destroy();
        }
    });

    QUnit.test("Creates an instance of sap.m.GenericTile", function (assert) {
        // Assert
        assert.ok(this.oVizInstanceLink.isA("sap.m.GenericTile"), "The constructor creates a GenericTile instance.");
    });

    QUnit.test("Has the correct default values for properties", function (assert) {
        // Assert
        assert.strictEqual(this.oVizInstanceLink.getTitle(), "", "The title has the correct default value.");
        assert.strictEqual(this.oVizInstanceLink.getSubtitle(), "", "The subtitle has the correct default value.");
        assert.strictEqual(this.oVizInstanceLink.getEditable(), false, "The editable property has the correct default value.");
        assert.strictEqual(this.oVizInstanceLink.getActive(), false, "The active property has the correct default value.");
        assert.strictEqual(this.oVizInstanceLink.getTargetURL(), undefined, "The targetURL has the correct default value.");
        assert.strictEqual(this.oVizInstanceLink.getMode(), "LineMode", "The mode property has the correct default value.");
        assert.strictEqual(this.oVizInstanceLink.getDisplayFormat(), "compact", "The displayFormat property has the correct default value.");
        assert.deepEqual(this.oVizInstanceLink.getSupportedDisplayFormats(), ["compact"], "The supportedDisplayFormats property has the correct default values.");
        assert.strictEqual(this.oVizInstanceLink.getDataHelpId(), "", "The default value for dataHelpId property was correctly set.");
        assert.strictEqual(this.oVizInstanceLink.getVizRefId(), "", "The default value for vizRefId property was correctly set.");
    });

    QUnit.test("Has the correct aggregation", function (assert) {
        // Arrange
        const oDefaultAggregation = this.oVizInstanceLink.getMetadata().getAggregation();
        const oTileActionsAggregation = this.oVizInstanceLink.getMetadata().getAggregation("tileActions");

        // Assert
        assert.strictEqual(oDefaultAggregation.name, "tileActions", "The tile has the correct default aggregation.");
        assert.strictEqual(oTileActionsAggregation.forwarding.getter, "_getTileActionSheet", "The tileActions aggregation is forwarded using the getter function _getTileActionSheet.");
        assert.strictEqual(oTileActionsAggregation.forwarding.aggregation, "buttons", "The tileActions aggregation is forwarded to the buttons aggregation.");
    });

    QUnit.test("Has bindable properties", function (assert) {
        // Assert
        assert.strictEqual(typeof this.oVizInstanceLink.bindEditable, "function", "The function bindEditable is available.");
        assert.strictEqual(typeof this.oVizInstanceLink.bindTitle, "function", "The function bindTitle is available.");
        assert.strictEqual(typeof this.oVizInstanceLink.bindSubtitle, "function", "The function bindSubtitle is available.");
    });

    QUnit.test("Has the correct renderer", function (assert) {
        // Assert
        assert.strictEqual(this.oVizInstanceLink.getMetadata().getRenderer(), GenericTile.getMetadata().getRenderer(), "The renderer is correct");
    });

    QUnit.module("load");

    QUnit.test("Returns a resolved Promise", function (assert) {
        // Arrange
        const oVizInstance = new VizInstanceLink();

        // Act
        const oLoadPromise = oVizInstance.load();

        // Assert
        return oLoadPromise.then(() => {
            assert.ok(true, "a resolved Promise is returned");
            oVizInstance.destroy();
        });
    });

    QUnit.module("loaded");

    QUnit.test("Returns a unresolved Promise", function (assert) {
        // Arrange
        const oVizInstance = new VizInstanceLink();

        // Act
        const oLoadedPromise = oVizInstance.loaded(); // Still unresolved
        const oLoadPromise = oVizInstance.load(); // Should be resolved after "load" is called

        // Assert
        assert.strictEqual(oLoadPromise, oLoadedPromise, "The load and loaded promise are the same");
        return oLoadedPromise.then(() => {
            assert.ok(true, "promise was resolved");
            oVizInstance.destroy();
        });
    });

    QUnit.module("init", {
        beforeEach: function () {
            this.oGenericTileInitSpy = sandbox.spy(GenericTile.prototype, "init");
            this.oAttachPressStub = sandbox.stub(VizInstanceLink.prototype, "attachPress");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Calls the lifecycle hook of the GenericTile", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();

        // Assert
        assert.strictEqual(this.oGenericTileInitSpy.callCount, 1, "The GenericTile init function was called once.");

        // Cleanup
        oVizInstanceLink.destroy();
    });

    QUnit.test("Attaches a press handler to itself", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();

        // Assert
        assert.strictEqual(this.oAttachPressStub.callCount, 1, "The attachPress function was called once.");
        assert.strictEqual(this.oAttachPressStub.firstCall.args[0], oVizInstanceLink._handlePress, "The attachPress function was called with the _handlePress function reference.");
        assert.strictEqual(this.oAttachPressStub.firstCall.args[1], oVizInstanceLink, "The attachPress function was called with the correct context.");

        // Cleanup
        oVizInstanceLink.destroy();
    });

    QUnit.module("_handlePress", {
        beforeEach: function () {
            this.oConfigStub = sandbox.stub(Config, "last");

            this.oLogRecentActivityStub = sandbox.stub();

            sandbox.stub(Container, "getRendererInternal").returns({
                logRecentActivity: this.oLogRecentActivityStub
            });

            this.oSetHashStub = sandbox.stub(hasher, "setHash");
            this.oOpenUrlStub = sandbox.stub(WindowUtils, "openURL");

            this.oVizInstanceLink = new VizInstanceLink();
            this.oOpenByStub = sandbox.stub();
            sandbox.stub(this.oVizInstanceLink, "_getTileActionSheet").returns({
                openBy: this.oOpenByStub,
                isOpen: sandbox.stub().returns(false)
            });

            this.oFireBeforeActionSheetOpenStub = sandbox.stub(this.oVizInstanceLink, "fireBeforeActionSheetOpen");
        },
        afterEach: function () {
            this.oVizInstanceLink.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Opens the ActionSheet if the link is editable", function (assert) {
        // Arrange
        this.oVizInstanceLink.setEditable(true);
        this.oVizInstanceLink.setTargetURL("#some-intent");
        this.oConfigStub.withArgs("/core/shell/enableRecentActivity").returns(true);
        this.oConfigStub.withArgs("/core/shell/enableRecentActivityLogging").returns(true);

        // Act
        this.oVizInstanceLink._handlePress();

        // Assert
        assert.strictEqual(this.oOpenUrlStub.callCount, 0, "The function WindowUtils.openURL has not been called.");
        assert.strictEqual(this.oSetHashStub.callCount, 0, "The function hasher.setHash has not been called.");
        assert.strictEqual(this.oLogRecentActivityStub.callCount, 0, "The function logRecentActivity has not been called.");
        assert.strictEqual(this.oOpenByStub.callCount, 1, "The function openBy was called on the ActionSheet.");
        assert.strictEqual(this.oOpenByStub.firstCall.args[0].getMetadata().getName(),
            "sap.ushell.ui.launchpad.VizInstanceLink",
            "The function openBy was called with the current VizInstanceLink instance.");
    });

    QUnit.test("Does not navigate if the link does not have a targetURL", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enableRecentActivity").returns(true);
        this.oConfigStub.withArgs("/core/shell/enableRecentActivityLogging").returns(true);

        // Act
        this.oVizInstanceLink._handlePress();

        // Assert
        assert.strictEqual(this.oOpenUrlStub.callCount, 0, "The function WindowUtils.openURL has not been called.");
        assert.strictEqual(this.oSetHashStub.callCount, 0, "The function hasher.setHash has not been called.");
        assert.strictEqual(this.oLogRecentActivityStub.callCount, 0, "The function logRecentActivity has not been called.");
    });

    QUnit.test("Sets the correct hash if an intent was provided", function (assert) {
        // Arrange
        this.oVizInstanceLink.setTargetURL("#SemanticObject-Action");

        // Act
        this.oVizInstanceLink._handlePress();

        // Assert
        assert.strictEqual(this.oOpenUrlStub.callCount, 0, "The function WindowUtils.openURL has not been called.");
        assert.strictEqual(this.oLogRecentActivityStub.callCount, 0, "The function logRecentActivity has not been called.");
        assert.strictEqual(this.oSetHashStub.callCount, 1, "The function hasher.setHash has been called once.");
        assert.deepEqual(this.oSetHashStub.firstCall.args, ["#SemanticObject-Action"], "The function hasher.setHash has been called with the correct parameters.");
    });

    QUnit.test("Opens a URL using the WindowUtils", function (assert) {
        // Arrange
        this.oVizInstanceLink.setTargetURL("https://sap.com");

        // Act
        this.oVizInstanceLink._handlePress();

        // Assert
        assert.strictEqual(this.oOpenUrlStub.callCount, 1, "The function WindowUtils.openURL has been called once.");
        assert.deepEqual(this.oOpenUrlStub.firstCall.args, ["https://sap.com", "_blank"], "The function WindowUtils.openURL has been called with the correct parameters.");
        assert.strictEqual(this.oLogRecentActivityStub.callCount, 0, "The function logRecentActivity has not been called.");
        assert.strictEqual(this.oSetHashStub.callCount, 0, "The function hasher.setHash has not been called.");
    });

    QUnit.test("Logs the recent activity in case the target URL is not an intent", function (assert) {
        // Arrange
        this.oVizInstanceLink.setTargetURL("https://sap.com");
        this.oVizInstanceLink.setTitle("SomeTitle");
        this.oConfigStub.withArgs("/core/shell/enableRecentActivity").returns(true);
        this.oConfigStub.withArgs("/core/shell/enableRecentActivityLogging").returns(true);

        // Act
        this.oVizInstanceLink._handlePress();

        // Assert
        assert.strictEqual(this.oOpenUrlStub.callCount, 1, "The function WindowUtils.openURL has been called once.");
        assert.strictEqual(this.oLogRecentActivityStub.callCount, 1, "The function logRecentActivity has been called once.");

        const oExpectedActivity = {
            title: "SomeTitle",
            appType: "External Link",
            url: "https://sap.com",
            appId: "https://sap.com"
        };
        assert.deepEqual(this.oLogRecentActivityStub.firstCall.args, [oExpectedActivity], "The function logRecentActivity has been called with the correct parameters.");
    });

    QUnit.test("fireBeforeActionSheetOpen is called", function (assert) {
        // Arrange
        this.oVizInstanceLink.setEditable(true);

        // Act
        this.oVizInstanceLink._handlePress();

        // Assert
        assert.strictEqual(this.oFireBeforeActionSheetOpenStub.callCount, 1, "fireBeforeActionSheetOpen was called as expected");
    });

    QUnit.module("setTitle");

    QUnit.test("Sets the header property as well as the title property", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        const oResult = oVizInstanceLink.setTitle("SomeTitle");

        // Assert
        assert.strictEqual(oVizInstanceLink.getTitle(), "SomeTitle", "The correct value has been found.");
        assert.strictEqual(oVizInstanceLink.getHeader(), "SomeTitle", "The correct value has been found.");
        assert.strictEqual(oResult, oVizInstanceLink, "The correct reference has been returned.");
        assert.strictEqual(oInvalidateSpy.called, true, "The invalidate function has been called once.");

        // Cleanup
        oVizInstanceLink.destroy();
    });

    QUnit.module("setSubtitle");

    QUnit.test("Sets the subheader property as well as the subtitle property", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        const oResult = oVizInstanceLink.setSubtitle("SomeSubtitle");

        // Assert
        assert.strictEqual(oVizInstanceLink.getSubtitle(), "SomeSubtitle", "The correct value has been found.");
        assert.strictEqual(oVizInstanceLink.getSubheader(), "SomeSubtitle", "The correct value has been found.");
        assert.strictEqual(oResult, oVizInstanceLink, "The correct reference has been returned.");
        assert.strictEqual(oInvalidateSpy.called, true, "The invalidate function has been called once.");

        // Cleanup
        oVizInstanceLink.destroy();
    });

    QUnit.module("setTargetURL");

    QUnit.test("Sets the url property as well as the targetURL property", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        const oResult = oVizInstanceLink.setTargetURL("SomeURL");

        // Assert
        assert.strictEqual(oVizInstanceLink.getTargetURL(), "SomeURL", "The correct value has been found.");
        assert.strictEqual(oVizInstanceLink.getUrl(), "SomeURL", "The correct value has been found.");
        assert.strictEqual(oResult, oVizInstanceLink, "The correct reference has been returned.");
        assert.strictEqual(oInvalidateSpy.called, true, "The invalidate function has been called once.");

        // Cleanup
        oVizInstanceLink.destroy();
    });

    QUnit.module("setVizRefId");

    QUnit.test("sets the data tile id attribute to be written to the DOM", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();
        const oDataSetterSpy = sandbox.spy(oVizInstanceLink, "data");
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        const oResult = oVizInstanceLink.setVizRefId("SomeIdString");

        // Assert
        assert.strictEqual(oResult, oVizInstanceLink, "The correct reference has been returned.");
        assert.strictEqual(oVizInstanceLink.getVizRefId(), "SomeIdString", "The correct value has been found.");
        assert.strictEqual(oDataSetterSpy.called, true, "The data setter function has been called.");
        assert.deepEqual(oDataSetterSpy.getCall(0).args, ["tile-id", "SomeIdString", true], "The data setter function was called with correct parameters");
        assert.strictEqual(oInvalidateSpy.called, true, "The invalidate function has been called once.");
    });

    QUnit.test("Does not set the data tile id attribute when dataHelpId is set", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();
        oVizInstanceLink.setDataHelpId("someHelpId");
        const oDataSetterSpy = sandbox.spy(oVizInstanceLink, "data");
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        const oResult = oVizInstanceLink.setVizRefId("SomeIdString");

        // Assert
        assert.strictEqual(oResult, oVizInstanceLink, "The correct reference has been returned.");
        assert.strictEqual(oVizInstanceLink.getVizRefId(), "SomeIdString", "The correct value has been found.");
        assert.strictEqual(oDataSetterSpy.callCount, 0, "The data setter was not called.");
        assert.strictEqual(oInvalidateSpy.called, true, "The invalidate function has been called once.");
    });

    QUnit.module("setDataHelpId");

    QUnit.test("sets the data help id attribute to be written to the DOM", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();
        const oDataSetterSpy = sandbox.spy(oVizInstanceLink, "data");
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        const oResult = oVizInstanceLink.setDataHelpId("SomeIdString");

        // Assert
        assert.strictEqual(oResult, oVizInstanceLink, "The correct reference has been returned.");
        assert.strictEqual(oVizInstanceLink.getDataHelpId(), "SomeIdString", "The correct value has been found.");
        assert.strictEqual(oDataSetterSpy.called, true, "The data setter function has been called.");
        assert.deepEqual(oDataSetterSpy.getCall(0).args, ["help-id", "SomeIdString", true], "The data setter function was called the first time with correct parameters");
        assert.deepEqual(oDataSetterSpy.getCall(1).args, ["tile-id", "SomeIdString", true], "The data setter function was called the second time with correct parameters");
        assert.strictEqual(oInvalidateSpy.called, true, "The invalidate function has been called once.");
    });

    QUnit.module("setProperty");

    QUnit.test("Sets the GenericTile scope to 'Actions' and invalidates", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink({ editable: false });
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        const oResult = oVizInstanceLink.setProperty("editable", true);

        // Assert
        assert.strictEqual(oVizInstanceLink.getEditable(), true, "The correct value has been found.");
        assert.strictEqual(oVizInstanceLink.getScope(), "Actions", "The correct value has been found.");
        assert.strictEqual(oResult, oVizInstanceLink, "The correct reference has been returned.");
        assert.strictEqual(oInvalidateSpy.called, true, "The invalidate function has been called once.");

        // Cleanup
        oVizInstanceLink.destroy();
    });

    QUnit.test("Sets the GenericTile scope to 'Display' and invalidates", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink({ editable: true });
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        const oResult = oVizInstanceLink.setProperty("editable", false);

        // Assert
        assert.strictEqual(oVizInstanceLink.getEditable(), false, "The correct value has been found.");
        assert.strictEqual(oVizInstanceLink.getScope(), "Display", "The correct value has been found.");
        assert.strictEqual(oResult, oVizInstanceLink, "The correct reference has been returned.");
        assert.strictEqual(oInvalidateSpy.called, true, "The invalidate function has been called once.");

        // Cleanup
        oVizInstanceLink.destroy();
    });

    QUnit.test("Sets the GenericTile scope according to the editable property and does not invalidate", function (assert) {
        // Arrange
        const oVizInstanceLink = new VizInstanceLink();
        const oInvalidateSpy = sandbox.spy(oVizInstanceLink, "invalidate");

        // Act
        oVizInstanceLink.setProperty("editable", true, true);

        // Assert
        assert.strictEqual(oInvalidateSpy.called, false, "The invalidate function has not been called");

        // Cleanup
        oVizInstanceLink.destroy();
    });

    QUnit.module("_getTileActionSheet", {
        beforeEach: function () {
            // We need to temporarily stub _getTileActionSheet because it is called by the UI5 lifecycle
            // as soon as the control is created.
            const oGetTileActionSheetStub = sinon.stub(VizInstanceLink.prototype, "_getTileActionSheet");
            this.oVizInstanceLink = new VizInstanceLink();
            oGetTileActionSheetStub.restore();
        },
        afterEach: function () {
            this.oVizInstanceLink.destroy();
        }
    });

    QUnit.test("Returns a new sap.m.ActionSheet instance if it wasn't yet created", function (assert) {
        // Act
        const oActionSheet = this.oVizInstanceLink._getTileActionSheet();

        // Assert
        assert.ok(oActionSheet.isA("sap.m.ActionSheet"), "The function returns a new sap.m.ActionSheet instance.");
    });

    QUnit.test("Returns the existent sap.m.ActionSheet instance if it was already created", function (assert) {
        // Act
        const oActionSheetMock = {
            id: "actionSheet-1",
            destroy: function () { }
        };

        this.oVizInstanceLink._oActionSheet = oActionSheetMock;
        const oActionSheet = this.oVizInstanceLink._getTileActionSheet();

        // Assert
        assert.strictEqual(oActionSheet.id, "actionSheet-1", "The function doesn't create a new sap.m.ActionSheet if it was already instantiated.");
    });

    QUnit.module("Compatibility to VizInstance", {
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("VizInstanceLink implements all properties", async function (assert) {
        // Arrange
        // ignore bindable properties from VizInstance
        const aIgnoreMethods = [
            "bindSizeBehavior",
            "unbindSizeBehavior",
            "bindState",
            "unbindState",
            "onclick"
        ];
        function getAllMethods (oObject) {
            const sProps = new Set();
            let oCurrentPrototype = oObject;
            do {
                Object.getOwnPropertyNames(oCurrentPrototype).forEach((sKey) => sProps.add(sKey));
            } while ((oCurrentPrototype = Object.getPrototypeOf(oCurrentPrototype)));
            return [...sProps.keys()]
                .filter((sKey) => typeof oObject[sKey] === "function");
        }
        const oVizInstance = new VizInstance();
        const aVizInstanceProperties = Object.keys(oVizInstance.getMetadata().getAllProperties());
        const aVizInstanceAggregations = Object.keys(oVizInstance.getMetadata().getAllAggregations());
        const aVizInstanceEvents = Object.keys(oVizInstance.getMetadata().getAllEvents());
        const aVizInstanceMethods = getAllMethods(oVizInstance)
            .filter((sKey) => !sKey.startsWith("_") && !aIgnoreMethods.includes(sKey));

        // Act
        const oVizInstanceLink = new VizInstanceLink();
        const aVizInstanceLinkProperties = Object.keys(oVizInstanceLink.getMetadata().getAllProperties())
            .filter((sKey) => aVizInstanceProperties.includes(sKey));
        const aVizInstanceLinkAggregations = Object.keys(oVizInstanceLink.getMetadata().getAllAggregations())
            .filter((sKey) => aVizInstanceAggregations.includes(sKey));
        const aVizInstanceLinkEvents = Object.keys(oVizInstanceLink.getMetadata().getAllEvents())
            .filter((sKey) => aVizInstanceEvents.includes(sKey));
        const aVizInstanceLinkMethods = getAllMethods(oVizInstanceLink)
            .filter((sKey) => !sKey.startsWith("_"))
            .filter((sKey) => aVizInstanceMethods.includes(sKey));

        // Assert
        assert.deepEqual(aVizInstanceLinkProperties.sort(), aVizInstanceProperties.sort(), "The properties of VizInstanceLink and VizInstance are the same");
        assert.deepEqual(aVizInstanceLinkAggregations.sort(), aVizInstanceAggregations.sort(), "The aggregations of VizInstanceLink and VizInstance are the same");
        assert.deepEqual(aVizInstanceLinkEvents.sort(), aVizInstanceEvents.sort(), "The events of VizInstanceLink and VizInstance are the same");
        assert.deepEqual(aVizInstanceLinkMethods.sort(), aVizInstanceMethods.sort(), "The methods of VizInstanceLink and VizInstance are the same");
    });

    QUnit.test("VizInstanceLink implements all properties", async function (assert) {
        // Arrange
        const oVizInstance = new VizInstance();
        const aVizInstanceProperties = Object.keys(oVizInstance.getMetadata().getAllProperties());

        // Act
        const oVizInstanceLink = new VizInstanceLink();
        const aVizInstanceLinkProperties = Object.keys(oVizInstanceLink.getMetadata().getAllProperties())
            .filter((sKey) => aVizInstanceProperties.includes(sKey));

        // Assert
        assert.deepEqual(aVizInstanceLinkProperties.sort(), aVizInstanceProperties.sort(), "The properties of VizInstanceLink and VizInstance are the same");
    });

    QUnit.test("VizInstanceLink implements all aggregation", async function (assert) {
        // Arrange
        const oVizInstance = new VizInstance();
        const aVizInstanceAggregations = Object.keys(oVizInstance.getMetadata().getAllAggregations());

        // Act
        const oVizInstanceLink = new VizInstanceLink();
        const aVizInstanceLinkAggregations = Object.keys(oVizInstanceLink.getMetadata().getAllAggregations())
            .filter((sKey) => aVizInstanceAggregations.includes(sKey));

        // Assert
        assert.deepEqual(aVizInstanceLinkAggregations.sort(), aVizInstanceAggregations.sort(), "The aggregations of VizInstanceLink and VizInstance are the same");
    });

    QUnit.test("VizInstanceLink implements all events", async function (assert) {
        // Arrange
        const oVizInstance = new VizInstance();
        const aVizInstanceEvents = Object.keys(oVizInstance.getMetadata().getAllEvents());

        // Act
        const oVizInstanceLink = new VizInstanceLink();
        const aVizInstanceLinkEvents = Object.keys(oVizInstanceLink.getMetadata().getAllEvents())
            .filter((sKey) => aVizInstanceEvents.includes(sKey));

        // Assert
        assert.deepEqual(aVizInstanceLinkEvents.sort(), aVizInstanceEvents.sort(), "The events of VizInstanceLink and VizInstance are the same");
    });

    QUnit.test("VizInstanceLink implements all methods", async function (assert) {
        // Arrange
        // ignore bindable properties from VizInstance
        const aIgnoreMethods = [
            "bindSizeBehavior",
            "unbindSizeBehavior",
            "bindState",
            "unbindState",
            "onclick"
        ];

        function getAllMethods (oObject) {
            const sProps = new Set();
            let oCurrentPrototype = oObject;

            // iterate over all prototypes and collect all methods
            do {
                Object.getOwnPropertyNames(oCurrentPrototype).forEach((sKey) => sProps.add(sKey));
            } while ((oCurrentPrototype = Object.getPrototypeOf(oCurrentPrototype)));
            return [...sProps.keys()]
                .filter((sKey) => typeof oObject[sKey] === "function");
        }

        const oVizInstance = new VizInstance();
        const aVizInstanceMethods = getAllMethods(oVizInstance)
            .filter((sKey) => !sKey.startsWith("_") && !aIgnoreMethods.includes(sKey));

        // Act
        const oVizInstanceLink = new VizInstanceLink();
        const aVizInstanceLinkMethods = getAllMethods(oVizInstanceLink)
            .filter((sKey) => !sKey.startsWith("_"))
            .filter((sKey) => aVizInstanceMethods.includes(sKey));

        // Assert
        assert.deepEqual(aVizInstanceLinkMethods.sort(), aVizInstanceMethods.sort(), "The methods of VizInstanceLink and VizInstance are the same");
    });
});
