// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.ProductSwitch.Components
 */
sap.ui.define([
    "sap/m/Popover",
    "sap/ui/core/Element",
    "sap/ui/core/Fragment",
    "sap/ushell/Container",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/ushell/components/shell/ProductSwitch/Component",
    "sap/ushell/utils/WindowUtils"
], (Popover, Element, Fragment, Container, ShellHeadItem, ProductSwitchComponent, WindowUtils) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.module("sap.ushell.components.shell.ProductSwitch.Components", {
        beforeEach: function () {
            window["sap-ushell-config"] = {
                productSwitch: {
                    url: "/some/url"
                },
                renderers: {
                    fiori2: {
                        componentData: {
                            config: {
                                applications: {
                                    "Shell-home": {}
                                },
                                rootIntent: "Shell-home"
                            }
                        }
                    }
                }
            };
        },
        afterEach: function () {
            if (Element.getElementById("productSwitchBtn")) {
                Element.getElementById("productSwitchBtn").destroy();
            }
        }
    });

    let mockRendered;
    function createRenderer () {
        mockRendered = {
            showHeaderEndItem: sinon.spy()
        };
        Container.getRendererInternal = function () {
            return mockRendered;
        };
    }

    QUnit.test("Don't add the button to header if there is no products in response", function (assert) {
        const fnDone = assert.async();
        // arrange
        Container.init("local").then(() => {
            createRenderer();

            const oXHRStub = sinon.useFakeXMLHttpRequest();
            const aRequests = [];
            oXHRStub.onCreate = function (xhr) {
                aRequests.push(xhr);
            };

            // act
            ProductSwitchComponent.prototype._getModel();
            assert.equal(aRequests.length, 1, "ProductSwitch should make request to get the data");
            // return empty json
            aRequests[0].respond(200, { "Content-Type": "application/json" }, "[]");
            setTimeout(() => {
                const fnShowItem = Container.getRendererInternal().showHeaderEndItem;
                assert.ok(fnShowItem.notCalled, "Don't add productSwitchBtn to the header");
                assert.notOk(Element.getElementById("productSwitchBtn"), "The button was not created");
                fnDone();
            }, 10);

            // clean up
            oXHRStub.restore();
        });
    });

    QUnit.test("Don't add the button to the header if request fails", function (assert) {
        const fnDone = assert.async();
        // arrange
        Container.init("local").then(() => {
            createRenderer();

            const oXHRStub = sinon.useFakeXMLHttpRequest();
            const aRequests = [];
            oXHRStub.onCreate = function (xhr) {
                aRequests.push(xhr);
            };

            // act
            ProductSwitchComponent.prototype._getModel();
            assert.equal(aRequests.length, 1, "ProductSwitch should make request to get the data");
            // return empty json
            aRequests[0].respond(500, { "Content-Type": "text/html" }, "");
            setTimeout(() => {
                const fnShowItem = Container.getRendererInternal().showHeaderEndItem;
                assert.ok(fnShowItem.notCalled, "Don't add productSwitchBtn to the header");
                assert.notOk(Element.getElementById("productSwitchBtn"), "The button was not created");
                fnDone();
            }, 10);

            // clean up
            oXHRStub.restore();
        });
    });

    QUnit.test("productSwitchBtn should be added if there are products in response", function (assert) {
        const done = assert.async();
        // arrange
        Container.init("local").then(() => {
            createRenderer();
            const oXHRStub = sinon.useFakeXMLHttpRequest();
            const aRequests = [];
            oXHRStub.onCreate = function (xhr) {
                aRequests.push(xhr);
            };

            // act
            ProductSwitchComponent.prototype._getModel();
            assert.equal(aRequests.length, 1, "ProductSwitch should make request to get the data");

            aRequests[0].respond(200, { "Content-Type": "text/html" }, '[{"title": "test"}]');
            setTimeout(() => {
                const fnShowItem = Container.getRendererInternal().showHeaderEndItem;
                assert.ok(fnShowItem.calledOnce, "Don't add productSwitchBtn to the header");
                assert.ok(Element.getElementById("productSwitchBtn"), "The button was created");
                // clean up
                oXHRStub.restore();
                done();
            }, 10);
        });
    });

    QUnit.test("create popover if it was not created", function (assert) {
        const fnDone = assert.async();
        // arrange
        Container.init("local").then(() => {
            const oOverflowButton = new ShellHeadItem({
                id: "endItemsOverflowBtn"
            });

            const oPopover = new Popover("test");
            const oOpenByStub = sinon.stub(oPopover, "openBy");
            const oFragmentStub = sinon.stub(Fragment, "load").returns(Promise.resolve(oPopover));

            oPopover.setModel = sinon.spy();

            // act
            ProductSwitchComponent.prototype._openProductSwitch().then(() => {
                // assert
                assert.ok(oOpenByStub.calledOnce, "popover was opened");
                assert.ok(oPopover.setModel.calledTwice, "model is set for fragment");

                oPopover.destroy();
                oOverflowButton.destroy();
                oFragmentStub.restore();
                fnDone();
            });
        });
    });

    QUnit.test("open popover by overflow if there is no productSwitchBtn", function (assert) {
        const fnDone = assert.async();
        // arrange
        Container.init("local").then(() => {
            const oOverflowButton = new ShellHeadItem({
                id: "endItemsOverflowBtn"
            });

            const oPopover = new Popover("sapUshellProductSwitchPopover");
            const oOpenByStub = sinon.stub(oPopover, "openBy");

            // act
            ProductSwitchComponent.prototype._openProductSwitch().then(() => {
                assert.ok(oOpenByStub.calledOnce, "popover was opened");
                assert.equal(oOpenByStub.getCall(0).args[0].getId(), "endItemsOverflowBtn", "popover was opened on endItemsOverflowBtn");

                oPopover.destroy();
                oOverflowButton.destroy();
                fnDone();
            });
        });
    });

    QUnit.test("Close popover and open new tab by press on a product", function (assert) {
        const fnDone = assert.async();
        // arrange
        Container.init("local").then(() => {
            const oPopover = new Popover("sapUshellProductSwitchPopover");
            const oPopoverCloseStub = sinon.stub(oPopover, "close");
            const oWindowOpenStub = sinon.stub(WindowUtils, "openURL");
            const sUrl = "https://www.sap.com";

            const oEvent = {
                getParameter: function () {
                    return {
                        getTargetSrc: function () {
                            return sUrl;
                        }
                    };
                }
            };

            // act
            ProductSwitchComponent.prototype.onProductItemPress(oEvent);
            assert.ok(oPopoverCloseStub.calledOnce, "popover was closed");
            assert.ok(oWindowOpenStub.calledOnce, "new tab was opened");
            assert.deepEqual(oWindowOpenStub.getCall(0).args, [sUrl, "_blank"], "the correct url is opened");

            oPopover.destroy();
            oWindowOpenStub.restore();
            fnDone();
        });
    });
});

