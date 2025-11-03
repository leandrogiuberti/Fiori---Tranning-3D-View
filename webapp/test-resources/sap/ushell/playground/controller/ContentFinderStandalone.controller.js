// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Container",
    "sap/ushell/playground/controller/BaseController",
    "sap/ushell/utils/workpage/WorkPageService",
    "sap/ushell/components/contentFinder/CatalogService",
    "../testData/WorkPageBuilder/data",
    "../testData/NewContentFinder/ContentFinderModel",
    "sap/ui/core/Element"
], (
    Container,
    BaseController,
    WorkPageService,
    CatalogService,
    WorkPageBuilderData,
    ContentFinderModel,
    Element
) => {
    "use strict";

    /* global sinon */
    const sandbox = sinon.createSandbox({});

    return BaseController.extend("sap.ushell.playground.controller.ContentFinderStandalone", {

        /** @type {sap.ui.Component} */
        contentFinderComponent: undefined,

        /** @type {sinon.SinonStub} */
        workPageLoadVizStub: undefined,

        prepareMocks: function () {
            BaseController.prototype.prepareMocks.call(this);

            if (Container.getRendererInternal.restore?.sinon) {
                Container.getRendererInternal.returns({
                    getRouter: sandbox.stub().returns({
                        getRoute: sandbox.stub().returns({
                            attachMatched: sandbox.stub()
                        })
                    })
                });
            } else {
                sandbox.stub(Container, "getRendererInternal").returns({
                    getRouter: sandbox.stub().returns({
                        getRoute: sandbox.stub().returns({
                            attachMatched: sandbox.stub()
                        })
                    })
                });
            }

            this.workPageLoadVizStub = sandbox.stub(WorkPageService.prototype, "loadVisualizations").callsFake(this.loadVisualizations);
            sandbox.stub(CatalogService.prototype, "loadVisualizations").callsFake(this.loadVisualizations);
            sandbox.stub(CatalogService.prototype, "getCatalogs").resolves({
                catalogs: ContentFinderModel.getProperty("/categoryTree/1/nodes")
            });
        },

        restoreMocks: function () {
            BaseController.prototype.restoreMocks.call(this);
            sandbox.restore();
        },

        loadVisualizations: function (oParams) {
            const iSkip = oParams.skip || 0;
            const iTop = oParams.top || 100;
            const aVisualizations = WorkPageBuilderData.visualizations.nodes;
            let fnResolve;

            setTimeout(() => {
                fnResolve({
                    visualizations: {
                        totalCount: aVisualizations.length,
                        nodes: aVisualizations.slice(iSkip, iSkip + iTop)
                    }
                });
            }, 1600);
            return new Promise((resolve) => {
                fnResolve = resolve;
            });
        },
        appSearchComponentCreated: function (oEvent) {
            this.contentFinderComponent = oEvent.getParameters().component;
        },
        toggleEmptyResponse: function () {
            this.workPageLoadVizStub.returns(Promise.resolve({
                visualizations: {
                    totalCount: 0,
                    nodes: []
                }
            }));

            Element.getElementById("contentFinderAppSearch---contentFinderView").getController().onSearch({ getParameter: () => { } });
        },
        toggleActualResponse: function () {
            this.workPageLoadVizStub.callsFake(this.loadVisualizations);
            Element.getElementById("contentFinderAppSearch---contentFinderView").getController().onSearch({ getParameter: () => { } });
        },
        toggleErrorResponse: function () {
            this.workPageLoadVizStub.callsFake(() => {
                throw new Error("");
            });
            Element.getElementById("contentFinderAppSearch---contentFinderView").getController().onSearch({ getParameter: () => { } });
        },
        toggleErrorResponseOnPagination: function () {
            this.workPageLoadVizStub.callsFake(() => {
                throw new Error("");
            });
            Element.getElementById("contentFinderAppSearch---contentFinderView").getController().onUpdateStarted({
                getParameter: (param) => {
                    switch (param) {
                        case "reason":
                            return "Growing";
                        case "actual":
                            return 100;
                        default:
                            return undefined;
                    }
                }
            });
        }
    });
});
