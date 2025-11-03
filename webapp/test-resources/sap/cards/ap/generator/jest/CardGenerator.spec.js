/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/cards/ap/generator/CardGenerator", "sap/cards/ap/generator/pages/Application", "sap/ui/core/Component", "sap/ui/core/Fragment"], function (CardGenerator, sap_cards_ap_generator_pages_Application, Component, Fragment) {
  "use strict";

  const Application = sap_cards_ap_generator_pages_Application["Application"];
  jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/app/CardGeneratorDialogController"), () => {
    return {
      CardGeneratorDialogController: {
        initialize: jest.fn()
      },
      setValueStateForAdvancedPanel: jest.fn()
    };
  });
  jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/CardGeneratorModel"), () => {
    return {
      ...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/helpers/CardGeneratorModel")),
      getCardGeneratorDialogModel: jest.fn().mockReturnValue(Promise.resolve({
        getProperty: jest.fn().mockReturnValue({})
      }))
    };
  });
  jest.mock(sap.jest.resolvePath("sap/cards/ap/common/services/RetrieveCard"), () => {
    return {
      ...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/common/services/RetrieveCard")),
      getObjectPageCardManifestForPreview: jest.fn().mockReturnValue(Promise.resolve({}))
    };
  });
  jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/odata/ODataUtils"), () => {
    return {
      ...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/odata/ODataUtils")),
      createPathWithEntityContext: jest.fn().mockReturnValue(Promise.resolve("salesOrderManage(salesOrder=1234,IsActiveEntity=true)"))
    };
  });
  jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper"), () => {
    return {
      ...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper")),
      createInitialManifest: jest.fn(),
      renderCardPreview: jest.fn(),
      addQueryParametersToManifest: jest.fn(),
      createCardManifest: jest.fn().mockReturnValue(Promise.resolve({})),
      updateCardGroups: jest.fn()
    };
  });
  describe("cardGenerator - initializeAsync", () => {
    afterEach(() => {
      jest.clearAllMocks();
      Application.getInstance()._resetInstance();
    });
    it("should not create the cardGeneratorDialog instance if entityset and object context are missing", function () {
      try {
        let appComponent = new Component();
        let setModelMock = jest.fn();
        let getModelMock = jest.fn().mockReturnValue(false);
        appComponent.getModel = jest.fn().mockReturnValue({
          isA: jest.fn().mockReturnValue(false),
          sServiceUrl: "/sap/opu/odata"
        });
        appComponent.getManifestEntry = jest.fn().mockReturnValue({});
        const originalHasher = window.hasher;
        window.hasher = {
          getHash: jest.fn().mockReturnValue(""),
          setHash: jest.fn()
        };
        Fragment.load = jest.fn().mockResolvedValue(Promise.resolve({
          setBindingContext: jest.fn(),
          setModel: setModelMock,
          getModel: getModelMock,
          open: jest.fn()
        }));
        return Promise.resolve(CardGenerator.initializeAsync(appComponent)).then(function () {
          expect(Fragment.load).toHaveBeenCalledTimes(0);
          expect(setModelMock).toHaveBeenCalledTimes(0);
          expect(getModelMock).toHaveBeenCalledTimes(0);
          window.hasher = originalHasher;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    });
    it("should create cardGeneratorDialog instance for ObjectPage application", function () {
      try {
        let setModelMock = jest.fn();
        let getModelMock = jest.fn().mockReturnValue(false);
        let appComponent = new Component();
        appComponent.getModel = jest.fn().mockReturnValue({
          isA: jest.fn().mockReturnValue(false),
          sServiceUrl: "/sap/opu/odata"
        });
        appComponent.getManifestEntry = jest.fn().mockReturnValue("sap.ui.generic.app");
        const originalHasher = window.hasher;
        window.hasher = {
          getHash: jest.fn().mockReturnValue("Cards-generator&/salesOrderManage(salesOrder=1234,IsActiveEntity=true)"),
          setHash: jest.fn()
        };
        Fragment.load = jest.fn().mockResolvedValue(Promise.resolve({
          setBindingContext: jest.fn(),
          setModel: setModelMock,
          getModel: getModelMock,
          open: jest.fn()
        }));
        return Promise.resolve(CardGenerator.initializeAsync(appComponent)).then(function () {
          expect(Fragment.load).toHaveBeenCalledTimes(1);
          expect(setModelMock).toHaveBeenCalledTimes(4);
          expect(getModelMock).toHaveBeenCalledTimes(2);
          expect(getModelMock).toHaveBeenCalledWith("i18n");
          window.hasher = originalHasher;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    });
  });
});
//# sourceMappingURL=CardGenerator.spec.js.map