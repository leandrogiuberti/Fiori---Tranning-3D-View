/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/cards/ap/generator/app/controls/CriticalityEditor", "sap/cards/ap/generator/helpers/IntegrationCardHelper", "sap/m/Button", "sap/m/ComboBox", "sap/m/List", "sap/m/Text", "sap/m/VBox", "sap/ui/core/Element", "sap/ui/core/library", "sap/ui/model/json/JSONModel"], function (CriticalityEditor, sap_cards_ap_generator_helpers_IntegrationCardHelper, Button, ComboBox, List, Text, VBox, CoreElement, sap_ui_core_library, JSONModel) {
  "use strict";

  const getPreviewItems = sap_cards_ap_generator_helpers_IntegrationCardHelper["getPreviewItems"];
  const ValueState = sap_ui_core_library["ValueState"];
  jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper"), () => ({
    getPreviewItems: jest.fn().mockReturnValue([""])
  }));
  describe("CriticalityEditor", () => {
    let criticalityEditor;
    const settings = {
      type: "criticality",
      selectionKeys: {
        path: "/configuration/properties",
        parameters: {
          name: "name",
          label: "labelWithValue"
        }
      },
      items: {
        path: "/configuration/criticalityOptions",
        parameters: {
          name: "name",
          value: "criticality"
        }
      },
      navigationSelectionKeys: []
    };
    beforeAll(() => {
      criticalityEditor = new CriticalityEditor(settings);
      criticalityEditor.fireEvent = jest.fn();
      criticalityEditor.getBindingPath = jest.fn(path => {
        if (path === "items") {
          return "/configuration/criticalityOptions";
        } else if (path === "selectionKeys") {
          return "/configuration/properties";
        }
      });
      criticalityEditor.getSelectionKeys = jest.fn(() => [{
        label: "High Priority",
        type: "Edm.String",
        name: "high_priority",
        value: "critical"
      }, {
        label: "Low Priority",
        type: "Edm.String",
        name: "low_priority",
        value: "non-critical"
      }]);
      criticalityEditor.setSelectionKeysMap = {
        name: "high_priority",
        label: "High Priority"
      };
      criticalityEditor.getType = jest.fn().mockReturnValue("COMPACT");
      criticalityEditor.getModel = jest.fn().mockReturnValue({
        getProperty: jest.fn(path => {
          if (path === criticalityEditor.getBindingPath("items")) {
            return [{
              value: "critical",
              name: "low_priority"
            }, {
              value: "non-critical",
              name: "high_priority"
            }, {}];
          } else {
            return {
              name: "A",
              value: "1000",
              activeCalculation: false
            };
          }
        }),
        setProperty: jest.fn(),
        refresh: jest.fn()
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test("init: initializes _list aggregation correctly", () => {
      criticalityEditor.init();
      expect(criticalityEditor.list).toBeInstanceOf(List);
      expect(criticalityEditor.separatorColon).toBeInstanceOf(Text);
      expect(criticalityEditor.criticalityComboBox).toBeInstanceOf(ComboBox);
      expect(criticalityEditor.deleteButton).toBeInstanceOf(Button);
      expect(criticalityEditor.addButton).toBeInstanceOf(Button);
    });
    test("init: should initialize propertyComboBox,criticalityCalculator and criticalityComboBox bind change event", () => {
      criticalityEditor.init();
      expect(criticalityEditor.propertyComboBox).toBeDefined();
      expect(criticalityEditor.propertyComboBox instanceof ComboBox).toBeTruthy();
      criticalityEditor.propertyComboBox.fireChange();
      expect(criticalityEditor.fireEvent).toHaveBeenCalledWith("change", {
        value: criticalityEditor.getItems(),
        isCalcuationType: false,
        selectedItem: {
          activeCalculation: false,
          name: "A",
          value: "1000"
        }
      });
      expect(criticalityEditor.criticalityCalculator).toBeDefined();
      expect(criticalityEditor.criticalityCalculator instanceof VBox).toBeTruthy();
      criticalityEditor.propertyComboBox.fireChange();
      expect(criticalityEditor.fireEvent).toHaveBeenCalledWith("change", {
        value: criticalityEditor.getItems(),
        isCalcuationType: false,
        selectedItem: {
          activeCalculation: false,
          name: "A",
          value: "1000"
        }
      });
      criticalityEditor.getModel = jest.fn().mockReturnValue({
        getProperty: jest.fn().mockReturnValue({
          activeCalculation: false
        }),
        setProperty: jest.fn()
      });
      expect(criticalityEditor.criticalityComboBox).toBeDefined();
      expect(criticalityEditor.criticalityComboBox instanceof ComboBox).toBeTruthy();
      criticalityEditor.criticalityComboBox.fireChange();
      expect(criticalityEditor.fireEvent).toHaveBeenCalledWith("change", {
        value: criticalityEditor.getItems(),
        isCalcuationType: false
      });
    });
    test("handleComboBoxEvents: updates group with navigation info", () => {
      const comboBoxEventMock = {
        getParameter: jest.fn().mockReturnValue("mockComboBoxId"),
        getSource: jest.fn().mockReturnValue({
          getBindingContext: jest.fn().mockReturnValue({
            getPath: jest.fn().mockReturnValue("/configuration/criticalityOptions/0")
          })
        })
      };
      const mockComboBox = {
        getSelectedKey: jest.fn().mockReturnValue("selectedKey123"),
        getBindingContext: jest.fn().mockReturnValue({
          getPath: () => "/configuration/criticalityOptions/0"
        })
      };

      // Add mock ComboBox to CoreElement
      jest.spyOn(CoreElement, "getElementById").mockReturnValue(mockComboBox);
      const mockGroup = {
        name: "navGroup"
      };
      const mockNavProps = [{
        name: "navGroup",
        properties: ["prop1", "prop2"]
      }];
      const mockModel = {
        getProperty: jest.fn(path => {
          if (path === "/configuration/navigationProperty") {
            return mockNavProps;
          }
          if (path === "/configuration/criticalityOptions/0") {
            return mockGroup;
          }
        }),
        refresh: jest.fn()
      };
      const editor = {
        getModel: jest.fn().mockReturnValue(mockModel),
        hasNavigationProperty: jest.fn((navProps, name) => {
          return navProps.some(prop => prop.name === name);
        }),
        setValueStateForModel: jest.fn()
      };

      // Act
      const resultGroup = CriticalityEditor.prototype.handleComboBoxEvents.call(editor, comboBoxEventMock, false);

      // Assert
      expect(CoreElement.getElementById).toHaveBeenCalledWith("mockComboBoxId");
      expect(mockModel.refresh).toHaveBeenCalled();
      expect(resultGroup.propertyKeyForId).toEqual("selectedKey123");
      expect(resultGroup.navigationalPropertiesForId).toEqual(["prop1", "prop2"]);
      expect(resultGroup.isNavigationForId).toBe(true);
    });
    test("handleComboBoxEvents: sets valueState and valueStateText to ValueState.Information for criticality property when the property is not in preview", () => {
      getPreviewItems.mockReturnValue(["bp_id"]);
      const mockModel = {
        getProperty: jest.fn(path => {
          if (path === "/configuration/mainIndicatorOptions/criticality") {
            return [{
              name: "selectedKey123",
              valueState: ValueState.None
            }];
          }
        }),
        setProperty: jest.fn(),
        refresh: jest.fn()
      };
      const mockI18nModel = {
        getObject: jest.fn().mockReturnValue("The card preview doesn't show this value because the field isn't configured.")
      };
      const editor = {
        getModel: jest.fn(name => {
          return name === "i18n" ? mockI18nModel : mockModel;
        }),
        setValueStateForModel: jest.fn()
      };
      CriticalityEditor.prototype.setValueStateForModel.call(editor, mockModel, "selectedKey123", true);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/valueState", ValueState.Information);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/valueStateText", "The card preview doesn't show this value because the field isn't configured.");
    });
    test("handleComboBoxEvents: sets valueState and valueStateText to ValueState.Information for navigational property in criticality editor when the property is not in preview", () => {
      getPreviewItems.mockReturnValue(["to_BillingStatus/Status_Text"]);
      const mockModel = {
        getProperty: jest.fn(path => {
          if (path === "/configuration/mainIndicatorOptions/criticality") {
            return [{
              isNavigationForId: true,
              name: "to_BillingStatus",
              navigationKeyForId: "Status_Text",
              navigationalPropertiesForDescription: [{
                label: "Lower Value",
                type: "Edm.String",
                name: "Status",
                labelWithValue: "Lower Value (<empty>)"
              }, {
                label: "Confirmation",
                type: "Edm.String",
                name: "Status_Text",
                labelWithValue: "Confirmation (Initial)"
              }],
              propertyKeyForId: "Status_Text",
              valueState: ValueState.None,
              valueStateText: "",
              navigationValueState: ValueState.None,
              navigationValueStateText: ""
            }];
          }
        }),
        setProperty: jest.fn(),
        refresh: jest.fn()
      };
      const mockI18nModel = {
        getObject: jest.fn().mockReturnValue("The card preview doesn't show this value because the field isn't configured.")
      };
      const editor = {
        getModel: jest.fn(name => {
          return name === "i18n" ? mockI18nModel : mockModel;
        }),
        setValueStateForModel: jest.fn()
      };
      CriticalityEditor.prototype.setValueStateForModel.call(editor, mockModel, "to_BillingStatus/Status_Text", true);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/valueState", ValueState.Information);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/valueStateText", "The card preview doesn't show this value because the field isn't configured.");
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/navigationValueState", ValueState.Information);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/navigationValueStateText", "The card preview doesn't show this value because the field isn't configured.");
    });
    test("handleComboBoxEvents: sets valueState and valueStateText to ValueState.None for criticality property when the property is in preview", () => {
      getPreviewItems.mockReturnValue(["bp_id", "so_id"]);
      const mockModel = {
        getProperty: jest.fn(path => {
          if (path === "/configuration/mainIndicatorOptions/criticality") {
            return [{
              name: "bp_id",
              valueState: ValueState.Information
            }];
          }
        }),
        setProperty: jest.fn(),
        refresh: jest.fn()
      };
      const mockI18nModel = {
        getObject: jest.fn().mockReturnValue("The card preview doesn't show this value because the field isn't configured.")
      };
      const editor = {
        getModel: jest.fn(name => {
          return name === "i18n" ? mockI18nModel : mockModel;
        }),
        setValueStateForModel: jest.fn()
      };
      CriticalityEditor.prototype.setValueStateForModel.call(editor, mockModel, "bp_id", false);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/valueState", ValueState.None);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/valueStateText", "");
    });
    test("handleComboBoxEvents: sets valueState and valueStateText to ValueState.None for navigational property in criticality editor when the property is in preview", () => {
      getPreviewItems.mockReturnValue(["to_BillingStatus/Status_Text"]);
      const mockModel = {
        getProperty: jest.fn(path => {
          if (path === "/configuration/mainIndicatorOptions/criticality") {
            return [{
              isNavigationForId: true,
              name: "to_BillingStatus",
              navigationKeyForId: "Status_Text",
              navigationalPropertiesForDescription: [{
                label: "Lower Value",
                type: "Edm.String",
                name: "Status",
                labelWithValue: "Lower Value (<empty>)"
              }, {
                label: "Confirmation",
                type: "Edm.String",
                name: "Status_Text",
                labelWithValue: "Confirmation (Initial)"
              }],
              propertyKeyForId: "Status_Text",
              valueState: ValueState.Information,
              valueStateText: "The card preview doesn't show this value because the field isn't configured.",
              navigationValueState: ValueState.Information,
              navigationValueStateText: "The card preview doesn't show this value because the field isn't configured."
            }];
          }
        }),
        setProperty: jest.fn(),
        refresh: jest.fn()
      };
      const mockI18nModel = {
        getObject: jest.fn().mockReturnValue("The card preview doesn't show this value because the field isn't configured.")
      };
      const editor = {
        getModel: jest.fn(name => {
          return name === "i18n" ? mockI18nModel : mockModel;
        }),
        setValueStateForModel: jest.fn()
      };
      CriticalityEditor.prototype.setValueStateForModel.call(editor, mockModel, "to_BillingStatus/Status_Text", false);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/valueState", ValueState.None);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/valueStateText", "");
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/navigationValueState", ValueState.None);
      expect(mockModel.setProperty).toHaveBeenCalledWith("/configuration/mainIndicatorOptions/criticality/0/navigationValueStateText", "");
    });
    test("init: criticalityComboBox when type is not compact", () => {
      criticalityEditor.getType = jest.fn().mockReturnValue("STANDARD");
      expect(criticalityEditor.criticalityComboBox).toBeDefined();
      expect(criticalityEditor.criticalityComboBox instanceof ComboBox).toBeTruthy();
      criticalityEditor.criticalityComboBox.fireChange();
      expect(criticalityEditor.fireEvent).toHaveBeenCalledWith("change", {
        value: criticalityEditor.getItems(),
        isCalcuationType: false
      });
    });
    test("setSelectionKeys: setSelectionKeys method", () => {
      criticalityEditor.setAggregation = jest.fn();
      criticalityEditor.setProperty = jest.fn();
      criticalityEditor.getBindingInfo = jest.fn().mockReturnValue({
        parameters: {
          name: "name",
          label: "labelWithValue",
          value: "criticality"
        }
      });
      const selectionKeys = [{
        label: "Gross Amount",
        type: "Edm.Decimal",
        name: "gross_amount",
        UOM: "currency_code",
        isDate: false,
        value: "5631.08",
        labelWithValue: "Gross Amount (5631.08)"
      }];
      criticalityEditor.setSelectionKeys(selectionKeys);
      expect(criticalityEditor.setAggregation).toHaveBeenCalledWith("list", criticalityEditor.list);
      expect(criticalityEditor.setProperty).toHaveBeenCalledWith("selectionKeys", selectionKeys);
    });
    test("onAfterRendering: should refresh internal model after rendering", () => {
      criticalityEditor.getModel = jest.fn().mockReturnValue({
        getObject: jest.fn(path => {
          if (path === "CRITICALITY") {
            return "Critical";
          }
        })
      });
      criticalityEditor.criticalityComboBox = {
        getModel: jest.fn(() => ({
          setData: jest.fn(),
          refresh: jest.fn()
        }))
      };
      criticalityEditor.onAfterRendering();
      const internalModel = criticalityEditor.criticalityComboBox.getModel("internal");
      internalModel.setData({
        criticality: "Critical"
      }, true);
      expect(internalModel.setData).toHaveBeenCalled();
      expect(criticalityEditor.getSelectionKeys).toHaveBeenCalled();
    });
    test("onAddButtonClicked: add item to the model when model is undefined", () => {
      criticalityEditor.getModel = jest.fn().mockReturnValue({
        getProperty: jest.fn(path => {
          if (path === "/configuration/criticalityOptions") {
            return undefined;
          }
        }),
        refresh: jest.fn()
      });
      const model = criticalityEditor.getModel("items");
      if (model) {
        const refreshSpy = jest.spyOn(model, "refresh");
        criticalityEditor.onAddButtonClicked();
        expect(refreshSpy).toHaveBeenCalled();
      } else {
        throw new Error("Model 'items' is undefined");
      }
    });
    test("check for hasNavigationProperty", () => {
      const navigationProperties = [{
        name: "net/worth",
        value: "net"
      }];
      const name = "net/worth";
      expect(criticalityEditor.hasNavigationProperty(navigationProperties, name)).toBe(true);
      const nameNotPresent = "gross/worth";
      expect(criticalityEditor.hasNavigationProperty(navigationProperties, nameNotPresent)).toBe(false);
    });
    test("isPotentialCriticality: should identify potential criticality values", () => {
      const mockProperty = {
        name: "high_priority",
        label: "High Priority"
      };
      // Test initial condition
      expect(criticalityEditor.isPotentialCriticality(mockProperty)).toBe(false);
      // Test different types and values
      const testCases = [{
        type: "Edm.String",
        value: "Positive",
        expected: true
      }, {
        type: "Edm.Int32",
        value: undefined,
        expected: false
      }, {
        type: "Edm.Int32",
        value: 4,
        expected: true
      }, {
        type: "Edm.DateTimeOffset",
        value: undefined,
        expected: false
      }, {
        type: "Edm.Guid",
        value: undefined,
        expected: false
      }, {
        type: "Edm.Date",
        value: undefined,
        expected: false
      }, {
        type: "Edm.String",
        value: "Information",
        expected: true
      }, {
        type: "Edm.String",
        value: "VeryPositive",
        expected: true
      }, {
        type: "Edm.String",
        value: "VeryNegative",
        expected: true
      }, {
        type: "Edm.String",
        value: "Negative",
        expected: true
      }, {
        type: "Edm.String",
        value: "Neutral",
        expected: true
      }, {
        type: "Edm.String",
        value: "Critical",
        expected: true
      }, {
        type: "Edm.String",
        value: "1",
        expected: true
      }, {
        type: "Edm.String",
        value: "2",
        expected: true
      }, {
        type: "Edm.String",
        value: "3",
        expected: true
      }, {
        type: "Edm.String",
        value: "4",
        expected: true
      }, {
        type: "Edm.String",
        value: "5",
        expected: true
      }];
      testCases.forEach(({
        type,
        value,
        expected
      }) => {
        mockProperty.type = type;
        mockProperty.value = value;
        expect(criticalityEditor.isPotentialCriticality(mockProperty)).toBe(expected);
      });
    });
    test("setItems: should correctly set items, bind properties, and configure controls", () => {
      const selectionKeysArr = [{
        name: "Option1",
        value: "1"
      }, {
        name: "Option2",
        value: "2"
      }];
      criticalityEditor.setProperty = jest.fn();
      criticalityEditor.criticalityComboBox = {
        bindProperty: jest.fn(),
        setWidth: jest.fn()
      };
      criticalityEditor.propertyComboBox = {
        bindProperty: jest.fn()
      };
      criticalityEditor.criticalityCalculator = {
        getItems: jest.fn().mockReturnValue([{
          setVisible: jest.fn()
        }])
      };
      criticalityEditor.getType = jest.fn().mockReturnValue("COMPACT");
      criticalityEditor.list = {
        bindItems: jest.fn()
      };
      criticalityEditor.getBindingInfo = jest.fn().mockReturnValue({
        parameters: {
          name: "name",
          label: "labelWithValue",
          value: "criticality"
        }
      });

      // Act: Call the `setItems` method with mock data
      criticalityEditor.setItems(selectionKeysArr);

      // Assert: Verify setProperty was called correctly
      expect(criticalityEditor.setProperty).toHaveBeenCalledWith("items", selectionKeysArr, true);

      // Assert: Verify bindProperty was called correctly on ComboBox
      expect(criticalityEditor.criticalityComboBox.bindProperty).toHaveBeenCalledWith("selectedKey", "criticality");

      // Assert: Verify combo box width adjustment
      expect(criticalityEditor.criticalityComboBox.setWidth).toHaveBeenCalledWith("300px");
    });
    test("_getInternalModel: creates a new internal model if it does not exist", () => {
      const criticalityEditor = new CriticalityEditor(settings);
      const setModelSpy = jest.spyOn(criticalityEditor, "setModel");
      const internalModel = criticalityEditor._getInternalModel();
      expect(internalModel).toBeInstanceOf(JSONModel);
      expect(setModelSpy).toHaveBeenCalled();
      expect(internalModel).toEqual(criticalityEditor.getModel("internal"));
    });
    test("onAddButtonClicked: adds an item to the model", () => {
      //when getProperty of model already has value for getBindingPath("items")
      criticalityEditor.getModel = jest.fn().mockReturnValue({
        getProperty: jest.fn(path => {
          if (path === "/configuration/criticalityOptions") {
            return;
          }
        }),
        refresh: jest.fn()
      });
      const model = criticalityEditor.getModel();
      const refreshSpy = jest.spyOn(model, "refresh");
      criticalityEditor.onAddButtonClicked();
      expect(refreshSpy).toHaveBeenCalled();

      //when getProperty of model already has value for getBindingPath("items")
      criticalityEditor.getModel = jest.fn().mockReturnValue({
        getProperty: jest.fn(path => {
          if (path === "/configuration/criticalityOptions") {
            return [{
              arrangementKey: "gross_amount",
              value: "gross_amount",
              propKey: "net_amount",
              name: "net_amount",
              arrangementType: "TextFirst",
              textArrangement: "TextFirst"
            }];
          }
        }),
        refresh: jest.fn()
      });
      criticalityEditor.onAddButtonClicked();
      expect(refreshSpy).toHaveBeenCalled();

      //when model is not present
      const critical = new CriticalityEditor(settings);
      critical.onAddButtonClicked();
      expect(refreshSpy).toHaveBeenCalled();
    });
    test("onDeleteButtonClicked: removes an item from the model", () => {
      const mockEvent = {
        getSource: () => ({
          getBindingContext: () => ({
            getPath: () => "/configuration/criticalityOptions/1"
          })
        })
      };
      criticalityEditor.getModel = jest.fn().mockReturnValue({
        getProperty: jest.fn(path => {
          if (path === criticalityEditor.getBindingPath("items")) {
            return [{
              value: "critical",
              name: "low_priority"
            }, {
              value: "non-critical",
              name: "high_priority"
            }, {}];
          } else if (path === "/configuration/advancedFormattingOptions/sourceCriticalityProperty/0/name") {
            return "A";
          } else if (path === "/configuration/mainIndicatorOptions/criticality") {
            return [{
              name: "A",
              value: "1000",
              activeCalculation: false
            }];
          }
        }),
        setProperty: jest.fn(),
        refresh: jest.fn()
      });
      const model = criticalityEditor.getModel();
      const refreshSpy = jest.spyOn(model, "refresh");
      criticalityEditor.onDeleteButtonClicked(mockEvent);
      expect(refreshSpy).toHaveBeenCalled();
    });
    test("onDeleteButtonClicked: removes an item from the model - when not compact mode", () => {
      const mockEvent = {
        getSource: () => ({
          getBindingContext: () => ({
            getPath: () => "/configuration/criticalityOptions/1"
          })
        })
      };
      criticalityEditor.getModel = jest.fn().mockReturnValue({
        getProperty: jest.fn(path => {
          if (path === criticalityEditor.getBindingPath("items")) {
            return [{
              value: "critical",
              name: "low_priority"
            }, {
              value: "non-critical",
              name: "high_priority"
            }, {}];
          } else if (path === "/configuration/advancedFormattingOptions/sourceCriticalityProperty/0/name") {
            return "NetAmount";
          } else if (path === "/configuration/criticalityOptions/1") {
            return {
              name: "NetAmount",
              value: "1000"
            };
          }
        }),
        setProperty: jest.fn(),
        refresh: jest.fn()
      });
      const model = criticalityEditor.getModel();
      const refreshSpy = jest.spyOn(model, "refresh");
      criticalityEditor.getType = jest.fn().mockReturnValue("STANDARD");
      criticalityEditor.onDeleteButtonClicked(mockEvent);
      expect(refreshSpy).toHaveBeenCalled();
    });
  });
});
//# sourceMappingURL=CriticalityEditor.spec.js.map