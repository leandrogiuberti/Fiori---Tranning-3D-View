/* global QUnit */
sap.ui.define([
    "sap/suite/ui/commons/collaboration/flpplugins/msplugin/Component",
    "sap/suite/ui/commons/collaboration/CollaborationHelper",
    "sap/suite/ui/commons/collaboration/ServiceContainer",
    "sap/ushell/EventHub"
], function (MsPluginComponent, CollaborationHelper, ServiceContainer, EventHub) {
    "use strict";

    QUnit.module("Component", {
        beforeEach: function () {
            this.oComponent = new MsPluginComponent();
            this.oSandbox = sinon.sandbox.create();
            this.collaborationHelperStub = sinon.stub(CollaborationHelper, "_getCurrentUrl");
            this.oConfig = sinon.stub(this.oComponent, "getComponentData");
            this.eventHubEmitStub = sinon.stub(EventHub, "emit");
            this.oConfig.returns({
                config: {
                    isShareAsLinkEnabled: "X",
                    isShareAsTabEnabled: "X",
                    isShareAsCardEnabled: "X"
                }
            });
            this.oSpy = sinon.stub(ServiceContainer, "setCollaborationType");
            this.oSpy.returns(Promise.resolve());
            this.collaborationHelperStub.returns(Promise.resolve("https://www.example.com?authEndUrl=https://www.example.com"));
        },
        afterEach: function () {
            this.collaborationHelperStub.restore();
            this.oSpy.restore();
            this.oConfig.restore();
            this.eventHubEmitStub.restore();
            this.oComponent.destroy();
        }
    });

    QUnit.test("should initiliza component", function (assert) {
        assert.ok(this.oComponent, "Component is loaded");
    });

    QUnit.test("should init", function (assert) {
        assert.ok(this.oComponent.init, "Component is initialized");
    });

    QUnit.test("should redirect to teamsAuthEndUrl", function (assert) {
        this.oComponent.init();
        assert.ok(this.oSpy.calledOnce, "setCollaborationType is called");
    });

    QUnit.test("should not set collaboration if config is missing", function (assert) {
        this.oConfig.returns(null);
        var errorLogStub = sinon.stub(console, "error");

        this.oComponent.init();
        assert.ok(this.oSpy.notCalled, "Collaboration type not set");
        assert.ok(this.eventHubEmitStub.calledWith("CollaborationMSPluginLoaded"), "EventHub emit called");

        errorLogStub.restore();
    });

    QUnit.test("should emit CollaborationMSPluginLoaded event", function (assert) {
        this.oComponent.init();
        assert.ok(this.eventHubEmitStub.calledWith("CollaborationMSPluginLoaded"), "Event emitted");
    });
});