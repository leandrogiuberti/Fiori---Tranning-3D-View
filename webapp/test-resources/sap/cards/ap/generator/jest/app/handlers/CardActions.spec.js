/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/cards/ap/generator/app/handlers/CardActions", "sap/m/ComboBox", "sap/ui/core/Element", "sap/ui/core/ListItem", "sap/ui/model/json/JSONModel"], function (sap_cards_ap_generator_app_handlers_CardActions, ComboBox, CoreElement, ListItem, JSONModel) {
  "use strict";

  const filterCardActions = sap_cards_ap_generator_app_handlers_CardActions["filterCardActions"];
  jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/Transpiler"), () => {
    return {
      transpileIntegrationCardToAdaptive: jest.fn()
    };
  });
  describe("filterCardActions", () => {
    let coreElementGetElementByIdSpy;
    const oDialogModelData = {
      configuration: {
        actions: {
          addedActions: [{
            title: "Reopen",
            titleKey: "C_SalesPlanTPReopen",
            style: "Positive",
            enablePathKey: "IsActiveEntity",
            isStyleControlEnabled: true
          }],
          annotationActions: [{
            action: "C_SalesPlanTPRelease",
            label: "Release"
          }, {
            action: "C_SalesPlanTPReopen",
            label: "Reopen"
          }]
        }
      }
    };
    const oDialogModel = new JSONModel(oDialogModelData);
    beforeAll(() => {
      coreElementGetElementByIdSpy = jest.spyOn(CoreElement, "getElementById");
      coreElementGetElementByIdSpy.mockImplementation(id => {
        if (id === "cardGeneratorDialog--cardGeneratorDialog") {
          return {
            getModel: jest.fn().mockReturnValue(oDialogModel)
          };
        }
      });
    });
    afterAll(() => {
      coreElementGetElementByIdSpy.mockRestore();
    });
    test("should filter the available card actions in the ComboBox control based on the added actions", () => {
      const comboBox = new ComboBox({
        items: {
          path: "/configuration/actions/annotationActions",
          template: new ListItem({
            key: "{action}",
            text: "{label}"
          })
        }
      });
      comboBox.setModel(oDialogModel);
      expect(comboBox.getItems().length).toEqual(2);
      filterCardActions(comboBox);
      expect(comboBox.getItems().length).toEqual(1);
      expect(comboBox.getItems()[0].getProperty("text")).toEqual("Release");
      expect(comboBox.getItems()[0].getProperty("key")).toEqual("C_SalesPlanTPRelease");
    });
  });
});
//# sourceMappingURL=CardActions.spec.js.map