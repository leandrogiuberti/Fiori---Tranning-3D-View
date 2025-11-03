// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.utils.workpage.WorkPageHost
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ushell/utils/workpage/WorkPageHost",
    "sap/ui/integration/Host",
    "sap/ui/integration/widgets/Card",
    "sap/ushell/EventHub",
    "sap/ushell/Container",
    "sap/ui/integration/library",
    "sap/ushell/utils/workpage/DestinationResolver"
], (
    Localization,
    WorkPageHost,
    Host,
    Card,
    EventHub,
    Container,
    integrationLibrary,
    destinationResolver
) => {
    "use strict";

    // shortcut for sap.m.PlacementType
    const CardDataMode = integrationLibrary.CardDataMode;

    /* global QUnit sinon */

    const sandbox = sinon.sandbox.create();

    function createCard (oHost) {
        return new Card({
            manifest:
            {
                _version: "1.15.0",
                "sap.app": {
                    id: "card.explorer.table.card",
                    type: "card",
                    title: "Sample of a Table Card",
                    subTitle: "Sample of a Table Card"
                },
                "sap.ui": {
                    technology: "UI5",
                    icons: {
                        icon: "sap-icon://table-view"
                    }
                },
                "sap.card": {
                    type: "Table",
                    data: {
                        request: {
                            url: "./card/tableData.json"
                        }
                    },
                    header: {
                        title: "Project Staffing Watchlist",
                        subTitle: "Today"
                    },
                    content: {
                        row: {
                            columns: [{
                                title: "Project",
                                value: "{salesOrder}",
                                identifier: true
                            },
                            {
                                title: "Customer",
                                value: "{customerName}"
                            },
                            {
                                title: "Staffing",
                                value: "{netAmount}",
                                hAlign: "End"
                            },
                            {
                                title: "Status",
                                value: "{status}",
                                state: "{statusState}"
                            },
                            {
                                title: "Staffing",
                                progressIndicator: {
                                    percent: "{deliveryProgress}",
                                    text: "{= format.percent(${deliveryProgress} / 100)}",
                                    state: "{statusState}"
                                }
                            }]
                        }
                    }
                }
            },
            host: oHost,
            referenceId: "provider1",
            dataMode: CardDataMode.Active,
            baseUrl: sap.ui.require.toUrl("sap/ushell/test/components/workPageBuilder/controller")
        });
    }

    Localization.setLanguage("en");

    QUnit.module("WorkPageHost traces", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            this.oDestinationFetchStub = sandbox.stub(destinationResolver.prototype, "fetchData")
                .returns("test-data");

            this.oDestinationResolverStub = sandbox.stub(destinationResolver.prototype, "resolveCardDestination")
                .returns(Promise.resolve("abc"));
            this.oHost = new WorkPageHost("myId", {});
            this.oRoot = document.createElement("div");
            const oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves();
            oGetServiceAsyncStub.callThrough();
            Container.init("local").then(() => {
                fnDone();
            });
        },
        afterEach: function () {
            sandbox.restore();
            this.oRoot.remove();
            this.oHost.destroy();
        }
    });

    QUnit.test("instantiation works", function (assert) {
        const done = assert.async();
        assert.ok(this.oHost instanceof Host, "The WorkPageHost was instantiated and is a host");
        done();
    });

    QUnit.test("init event and fetch emit ui-trace", function (assert) {
        const done = assert.async();

        const oCard = createCard(this.oHost).placeAt(this.oRoot);

        let iTraceCount = 0;
        EventHub.on("UITracer.trace").do((oTrace) => {
            iTraceCount++;
            if (oTrace.source === "Card") {
                if (oTrace.reason === "Init") {
                    assert.ok(true, "Init was emitted");
                    assert.deepEqual(
                        oTrace.data,
                        {
                            cardId: "card.explorer.table.card",
                            providerId: "provider1"
                        },
                        "Init was emitted with correct data ");
                }
                if (oTrace.reason === "FetchData") {
                    assert.ok(this.oHost instanceof Host, "The WorkPageHost was instantiated and is a host");
                    assert.deepEqual(
                        oTrace.data,
                        {
                            cardId: "card.explorer.table.card",
                            providerId: "provider1",
                            status: 200,
                            targetUrl: `${sap.ui.require.toUrl("sap/ushell/test/components/workPageBuilder/controller")}/./card/tableData.json`
                        },
                        "Fetch was emitted with correct data");
                }
            }
            if (iTraceCount >= 2) {
                oCard.destroy();
                assert.expect(4);
                done();
            }
        });
    });

    QUnit.module("WorkPageHost without resource model", {
        beforeEach: function (assert) {
            const fnDone = assert.async();

            this.oDestinationFetchStub = sandbox.stub(destinationResolver.prototype, "fetchData")
                .returns("test-data");

            this.oDestinationResolverStub = sandbox.stub(destinationResolver.prototype, "resolveCardDestination")
                .returns(Promise.resolve("abc"));

            this.oHost = new WorkPageHost("myId", {});
            this.oRoot = document.createElement("div");

            // overwrite to test error in bundle
            this.oHost._getBundle = function () {
                return Promise.reject(new Error("Failed intentionally"));
            };

            const oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            oGetServiceAsyncStub.withArgs("UserInfo").resolves({
                getId: sandbox.stub().returns("UserId"),
                getFullName: sandbox.stub().returns("FirstName LastName"),
                getFirstName: sandbox.stub().returns("FirstName"),
                getLastName: sandbox.stub().returns("LastName"),
                getEmail: sandbox.stub().returns("FirstName.LastName@Company.org")
            });

            oGetServiceAsyncStub.withArgs("ShellNavigation").resolves();
            oGetServiceAsyncStub.callThrough();
            Container.init("local").then(() => {
                fnDone();
            });
        },
        afterEach: function () {
            sandbox.restore();
            this.oRoot.remove();
            this.oHost.destroy();
        }
    });

    QUnit.test("instantiation works", function (assert) {
        const done = assert.async();
        assert.ok(this.oHost instanceof Host, "The WorkPageHost was instantiated and is a host");
        done();
    });

    QUnit.test("check getContext", function (assert) {
        const done = assert.async();

        const oExpectedContext = {
            "sap.workzone": {
                label: "WorkPage.Host.Context.WorkZone.Label",
                currentUser: {
                    label: "WorkPage.Host.Context.WorkZone.CurrentUser.Label",
                    id: {
                        label: "WorkPage.Host.Context.WorkZone.CurrentUser.Id.Label",
                        type: "string",
                        tags: ["technical"],
                        placeholder: "WorkPage.Host.Context.WorkZone.CurrentUser.Id.Placeholder",
                        description: "WorkPage.Host.Context.WorkZone.CurrentUser.Id.Desc",
                        value: "UserId"
                    },
                    name: {
                        label: "WorkPage.Host.Context.WorkZone.CurrentUser.Name.Label",
                        type: "string",
                        placeholder: "WorkPage.Host.Context.WorkZone.CurrentUser.Name.Placeholder",
                        description: "WorkPage.Host.Context.WorkZone.CurrentUser.Name.Desc",
                        value: "FirstName LastName"
                    },
                    firstName: {
                        label: "WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Label",
                        type: "string",
                        placeholder: "WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Placeholder",
                        description: "WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Desc",
                        value: "FirstName"
                    },
                    lastName: {
                        label: "WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Label",
                        type: "string",
                        placeholder: "WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Placeholder",
                        description: "WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Desc",
                        value: "LastName"
                    },
                    email: {
                        label: "WorkPage.Host.Context.WorkZone.CurrentUser.Email.Label",
                        type: "string",
                        placeholder: "WorkPage.Host.Context.WorkZone.CurrentUser.Email.Placeholder",
                        description: "WorkPage.Host.Context.WorkZone.CurrentUser.Email.Desc",
                        value: "FirstName.LastName@Company.org"
                    }
                }
            }
        };

        this.oHost.getContext().then((oContext) => {
            assert.deepEqual(
                oContext,
                oExpectedContext,
                "Context object returned as expected");
            done();
        });
    });

    QUnit.test("check getContextValue('sap.workzone/currentUser/id')", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("sap.workzone/currentUser/id").then((sValue) => {
            assert.strictEqual(
                sValue,
                "UserId",
                "'sap.workzone/currentUser/id' returned correctly"
            );
            done();
        });
    });

    QUnit.test("check getContextValue('sap.workzone/currentUser/name')", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("sap.workzone/currentUser/name").then((sValue) => {
            assert.strictEqual(
                sValue,
                "FirstName LastName",
                "'sap.workzone/currentUser/name' returned correctly"
            );
            done();
        });
    });

    QUnit.test("check getContextValue('sap.workzone/currentUser/firstName')", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("sap.workzone/currentUser/firstName").then((sValue) => {
            assert.strictEqual(
                sValue,
                "FirstName",
                "'sap.workzone/currentUser/firstName/value' returned correctly"
            );
            done();
        });
    });

    QUnit.test("check getContextValue('sap.workzone/currentUser/lastName')", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("sap.workzone/currentUser/lastName").then((sValue) => {
            assert.strictEqual(
                sValue,
                "LastName",
                "'sap.workzone/currentUser/lastName/value' returned correctly"
            );
            done();
        });
    });

    QUnit.test("check getContextValue('sap.workzone/currentUser/email')", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("sap.workzone/currentUser/email").then((sValue) => {
            assert.strictEqual(
                sValue,
                "FirstName.LastName@Company.org",
                "'sap.workzone/currentUser/email' returned correctly"
            );
            done();
        });
    });

    QUnit.test("check getContextValue reject", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("").catch(() => {
            assert.ok(true, "getContextValue empty path rejected correctly");
            done();
        });
    });

    QUnit.test("check getContextValue empty", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("not/a/path/with/value").then((v) => {
            assert.ok(v === undefined, "getContextValue path not found empty correctly");
            done();
        });
    });

    QUnit.test("check getContextValue reject with /", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("////").catch((oError) => {
            assert.ok(true, "getContextValue //// path rejected correctly");
            done();
        });
    });

    QUnit.test("check getContextValue empty for /// ///", function (assert) {
        const done = assert.async();

        this.oHost.getContextValue("//no///").then((v) => {
            assert.ok(v === undefined, "getContextValue path //no/// not found empty correctly");
            done();
        });
    });

    QUnit.test("check resolveDestination", function (assert) {
        const done = assert.async();

        this.oHost.getResolveDestination()("/destinationurl/", "oCard").then((sValue) => {
            assert.ok(this.oDestinationResolverStub.calledOnce, "DestinationResolver Called once");
            done();
        });
    });

    QUnit.test("check resolveDestination - reject", function (assert) {
        const done = assert.async();

        this.oHost.getResolveDestination()().catch((oError) => {
            assert.ok(true, "resolveDestination rejected correctly");
            done();
        });
    });

    QUnit.test("check resolveDestination", function (assert) {
        const done = assert.async();

        this.oHost.getResolveDestination()("xy").catch((oError) => {
            assert.ok(true, "resolveDestination rejected correctly");
            done();
        });
    });

    QUnit.module("WorkPageHost with resource model", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            this.oDestinationFetchStub = sandbox.stub(destinationResolver.prototype, "fetchData")
                .returns("test-data");

            this.oDestinationResolverStub = sandbox.stub(destinationResolver.prototype, "resolveCardDestination")
                .returns(Promise.resolve("abc"));
            this.oHost = new WorkPageHost("myId", {});
            const oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves();
            oGetServiceAsyncStub.withArgs("UserInfo").resolves({
                getId: sandbox.stub().returns("UserId"),
                getFullName: sandbox.stub().returns("FirstName LastName"),
                getFirstName: sandbox.stub().returns("FirstName"),
                getLastName: sandbox.stub().returns("LastName"),
                getEmail: sandbox.stub().returns("FirstName.LastName@Company.org")
            });
            oGetServiceAsyncStub.callThrough();
            Container.init("local").then(() => {
                fnDone();
            });
        },
        afterEach: function () {
            sandbox.restore();
            this.oHost.destroy();
        }
    });

    QUnit.test("check getContext translated", function (assert) {
        const done = assert.async();
        const oBundlePromise = this.oHost._getBundle();
        oBundlePromise.then((oBundle) => {
            const oExpectedContext = {
                "sap.workzone": {
                    label: oBundle.getText("WorkPage.Host.Context.WorkZone.Label"),
                    currentUser: {
                        label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Label"),
                        id: {
                            label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Id.Label"),
                            type: "string",
                            tags: ["technical"],
                            placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Id.Placeholder"),
                            description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Id.Desc"),
                            value: "UserId"
                        },
                        name: {
                            label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Name.Label"),
                            type: "string",
                            placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Name.Placeholder"),
                            description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Name.Desc"),
                            value: "FirstName LastName"
                        },
                        firstName: {
                            label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Label"),
                            type: "string",
                            placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Placeholder"),
                            description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Desc"),
                            value: "FirstName"
                        },
                        lastName: {
                            label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Label"),
                            type: "string",
                            placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Placeholder"),
                            description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Desc"),
                            value: "LastName"
                        },
                        email: {
                            label: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Email.Label"),
                            type: "string",
                            placeholder: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Email.Placeholder"),
                            description: oBundle.getText("WorkPage.Host.Context.WorkZone.CurrentUser.Email.Desc"),
                            value: "FirstName.LastName@Company.org"
                        }
                    }
                }
            };
            this.oHost.getContext().then((oContext) => {
                assert.deepEqual(
                    oContext,
                    oExpectedContext,
                    "Context object returned as expected with translated texts");

                assert.notEqual(oContext["sap.workzone"].label, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.Label has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.label, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Label has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.id.label, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Id.Label has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.id.description, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Id.Desc has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.id.placeholder, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Id.Placeholder has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.name.label, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Name.Label has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.name.description, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Name.Desc has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.name.placeholder, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Name.Placeholder has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.firstName.label, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Label has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.firstName.description, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Desc has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.firstName.placeholder, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.FirstName.Placeholder has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.lastName.label, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Label has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.lastName.description, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Desc has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.lastName.placeholder, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.LastName.Placeholder has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.email.label, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Email.Label has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.email.description, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Email.Desc has translation");
                assert.notEqual(oContext["sap.workzone"].currentUser.email.placeholder, "WorkPage.Host.Context.WorkZone.Label",
                    "WorkPage.Host.Context.WorkZone.CurrentUser.Email.Placeholder has translation");
                done();
            });
        });
    });
});

