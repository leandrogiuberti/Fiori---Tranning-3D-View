/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/IconTabFilter", "sap/m/Label", "sap/m/Text", "sap/m/VBox", "sap/ui/codeeditor/CodeEditor", "sap/ui/layout/form/SimpleForm", "./XMLSerializer", "sap/fe/base/jsx-runtime/jsx"], function (Button, IconTabFilter, Label, Text, VBox, CodeEditor, SimpleForm, XMLSerializer, _jsx) {
  "use strict";

  var _exports = {};
  var serializeControlAsFormattedXML = XMLSerializer.serializeControlAsFormattedXML;
  let buildingBlockIconTabFilter;
  function addBuildingBlockTab(inspector) {
    buildingBlockIconTabFilter = _jsx(IconTabFilter, {
      text: "Building Block",
      children: {
        items: [_jsx(IconTabFilter, {
          text: "Control Tree",
          children: _jsx(Text, {
            text: "Start inspecting by hovering over items"
          })
        }, "controlTree"), _jsx(IconTabFilter, {
          text: "Definition"
        }, "definition")]
      }
    }, "buildingBlock");
    inspector.insertAggregation("items", buildingBlockIconTabFilter, 1);
  }
  _exports.addBuildingBlockTab = addBuildingBlockTab;
  function addBBInfo(ui5Control) {
    const bb = getBuildingBlock(ui5Control);
    addBuildingBlockInfo(bb);
    addDefinition(bb);
  }
  _exports.addBBInfo = addBBInfo;
  async function addBuildingBlockInfo(bb) {
    let iconTabFilterContent;
    if (!bb) {
      iconTabFilterContent = _jsx(Text, {
        text: "No associated Builing Block"
      });
    } else {
      const formattedXML = await serializeControlAsFormattedXML(bb);
      iconTabFilterContent = _jsx(CodeEditor, {
        syntaxHints: false,
        type: "XML"
      });
      iconTabFilterContent.setHeight(window.innerHeight - 120 + "px");
      iconTabFilterContent.setValue(formattedXML);
    }
    addContentToIconTabFilter("controlTree", iconTabFilterContent);
  }
  _exports.addBuildingBlockInfo = addBuildingBlockInfo;
  const getBuildingBlock = function (ui5Control) {
    let bbInstance;
    while (ui5Control) {
      ui5Control = ui5Control.getParent();
      if (!ui5Control) {
        break;
      }
      if (ui5Control.isA("sap.fe.core.buildingBlocks.BuildingBlock")) {
        bbInstance = ui5Control;
        break;
      }
    }
    return bbInstance;
  };
  function addDefinition(bb) {
    let iconTabFilterContent;
    if (bb && bb.metaPath && bb.contextPath) {
      const involvedObject = bb.getDataModelObjectForMetaPath(bb.metaPath, bb.contextPath);
      iconTabFilterContent = getDefinitionNavigator(involvedObject);
    } else if (!bb) {
      iconTabFilterContent = _jsx(Text, {
        text: "No associated Builing Block"
      });
    } else {
      iconTabFilterContent = _jsx(Text, {
        text: "No Definition Found"
      });
    }
    addContentToIconTabFilter("definition", iconTabFilterContent);
  }
  _exports.addDefinition = addDefinition;
  function getDefinitionNavigator(involvedObject, parent) {
    const formFields = [];
    involvedObject.$parent = parent;
    if (parent) {
      formFields.push({
        label: "Parent",
        visualization: _jsx(Button, {
          text: "Go Up",
          type: "Transparent",
          press: () => {
            const definition = getDefinitionNavigator(parent, parent.$parent);
            addContentToIconTabFilter("definition", definition);
          }
        })
      });
    }
    for (const key in involvedObject) {
      if (key === "$parent") {
        continue; // Skip the $parent property
      }
      let visualization;
      const involvedObjectElement = involvedObject[key];
      if (typeof involvedObjectElement === "object") {
        let targetType = involvedObjectElement._type;
        if (Array.isArray(involvedObjectElement) && involvedObjectElement.length > 0) {
          targetType = involvedObjectElement[0]._type + " Array";
        } else if (!targetType) {
          targetType = "Object";
        }
        visualization = _jsx(Button, {
          text: "Type " + targetType + " > Drill Down",
          type: "Transparent",
          press: () => {
            const definition = getDefinitionNavigator(involvedObjectElement, involvedObject);
            addContentToIconTabFilter("definition", definition);
          }
        });
      } else if (typeof involvedObjectElement === "string" || typeof involvedObjectElement === "number" || typeof involvedObjectElement === "boolean") {
        visualization = _jsx(Text, {
          text: involvedObjectElement.toString()
        });
      } else if (involvedObjectElement === undefined || involvedObjectElement === null) {
        visualization = _jsx(Text, {
          text: "undefined"
        });
      } else if (typeof involvedObjectElement === "function") {
        _jsx(Button, {
          text: key,
          type: "Transparent",
          press: () => {
            const value = involvedObjectElement();
            const definition = getDefinitionNavigator({
              value: value
            });
            addContentToIconTabFilter("definition", definition);
          }
        });
        // TODO: we can probably do better over here
        continue;
      }
      formFields.push({
        label: key,
        visualization
      });
    }
    const simpleForm = _jsx(SimpleForm, {});
    if (formFields.length > 0) {
      for (const element of formFields) {
        simpleForm.addContent(_jsx(Label, {
          text: element.label
        }));
        simpleForm.addContent(element.visualization);
      }
    }
    return _jsx(VBox, {
      children: simpleForm
    });
  }
  _exports.getDefinitionNavigator = getDefinitionNavigator;
  function addContentToIconTabFilter(key, content) {
    let index = 0;
    switch (key) {
      case "controlTree":
        index = 0;
        break;
      case "definition":
        index = 1;
        break;
      default:
        break;
    }
    const iconTabFilter = buildingBlockIconTabFilter.getItems()[index];
    iconTabFilter.removeContent(iconTabFilter.getContent()[0]);
    iconTabFilter.addContent(content);
  }
  return _exports;
}, false);
//# sourceMappingURL=BuildingBlockTab-dbg.js.map
