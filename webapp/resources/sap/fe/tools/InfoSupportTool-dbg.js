/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/tools/SupportLinks", "sap/fe/tools/XMLSerializer", "sap/m/Button", "sap/m/CheckBox", "sap/m/CustomListItem", "sap/m/HBox", "sap/m/IconTabBar", "sap/m/IconTabFilter", "sap/m/Label", "sap/m/Link", "sap/m/List", "sap/m/MessageBox", "sap/m/StandardListItem", "sap/m/Text", "sap/m/Toolbar", "sap/m/VBox", "sap/ui/codeeditor/CodeEditor", "sap/ui/core/HTML", "sap/ui/core/ResizeHandler", "sap/ui/layout/form/SimpleForm", "./BuildingBlockTab", "sap/fe/base/jsx-runtime/jsx", "sap/fe/base/jsx-runtime/jsxs"], function (Log, SupportLinks, XMLSerializer, Button, CheckBox, CustomListItem, HBox, IconTabBar, IconTabFilter, Label, Link, List, MessageBox, StandardListItem, Text, Toolbar, VBox, CodeEditor, HTML, ResizeHandler, SimpleForm, BuildingBlockTab, _jsx, _jsxs) {
  "use strict";

  var addBuildingBlockTab = BuildingBlockTab.addBuildingBlockTab;
  var addBBInfo = BuildingBlockTab.addBBInfo;
  var serializeControlAsFormattedXML = XMLSerializer.serializeControlAsFormattedXML;
  var loadSupportLinksForElement = SupportLinks.loadSupportLinksForElement;
  let currentControl;
  const codeEditor = _jsx(CodeEditor, {
    syntaxHints: false,
    type: "XML"
  });
  const parentButton = _jsx(Button, {
    enabled: false,
    text: "Select an item to see it's parent",
    press: function () {
      showElement(currentControl?.getParent());
    }
  });
  // @ts-ignore
  const FE = window?.opener?.$fe ?? window?.$fe;
  const requestList = _jsx(List, {
    items: "{/data}",
    mode: "SingleSelectMaster",
    class: "feRequestList",
    selectionChange: function (oEvent) {
      const oItem = oEvent.getParameter("listItem");
      if (oItem) {
        //console.log("Selected item is: " + oItem.getId());
        const currentRequest = oItem.getBindingContext()?.getObject();
        this.getModel().setProperty("/selectedItem", currentRequest);
        const currentCache = FE.createdCaches[currentRequest.trace];
        const odataPropsToControl = [];
        if (currentCache) {
          Object.keys(currentCache.mChangeListeners).forEach(key => {
            odataPropsToControl.push({
              key,
              count: currentCache.mChangeListeners[key].length
            });
          });
          this.getModel().setProperty("/odataPropsToControl", odataPropsToControl);
          this.getModel().setProperty("/currentCache", currentCache);
        }
      }
    },
    children: {
      items: _jsx(StandardListItem, {
        title: "{urlBase}",
        description: "{request/method}",
        info: "#{trace}"
      })
    }
  });
  const inspector = _jsx(IconTabBar, {
    expanded: true,
    children: {
      items: [_jsxs(IconTabFilter, {
        text: "Service Implementation",
        children: [_jsx(List, {
          items: "{/supportLinks}",
          noData: "{/supportLinksStateText}",
          children: _jsx(CustomListItem, {
            children: _jsx(Link, {
              text: "{Text}",
              href: "{Url}",
              target: "linkContent",
              class: "sapUiTinyMargin"
            })
          })
        }), _jsx(HTML, {
          content: '<iframe name="linkContent" width="99%" height="85%"/>'
        })]
      }, "supportLinks"), _jsxs(IconTabFilter, {
        text: "Control Tree",
        children: [_jsx(VBox, {
          renderType: "Bare",
          children: {
            items: [_jsx(Toolbar, {
              children: {
                content: [_jsx(CheckBox, {
                  text: "Prevent interaction",
                  selected: "{/preventInteraction}"
                }), _jsx(Button, {
                  text: "Send to Console",
                  press: function () {
                    FE["$" + FE.controlIndex] = currentControl;
                    MessageBox.alert("Control sent to console as $fe.$" + FE.controlIndex);
                    FE.controlIndex++;
                  }
                }), parentButton]
              }
            }), codeEditor]
          }
        }), ";"]
      }, "tree"), _jsx(IconTabFilter, {
        text: "Control Properties"
      }, "properties"), _jsx(IconTabFilter, {
        text: "Control State",
        children: _jsx(List, {
          items: "{/state}",
          children: _jsx(StandardListItem, {
            title: "{key}",
            description: "{value}"
          })
        })
      }, "state"), _jsxs(IconTabFilter, {
        text: "OData Requests",
        children: [_jsx(Button, {
          press: function () {
            this.getModel().setProperty("/data", []);
          },
          text: "Clear All"
        }), _jsx(HBox, {
          height: "100%",
          class: "feRequestHBox",
          children: {
            items: [requestList, _jsxs(VBox, {
              width: "100%",
              children: [_jsx(Button, {
                text: "Highlight related controls",
                press: function () {
                  const traceId = this.getModel().getProperty("/selectedItem").trace;
                  const dependentBindings = FE.createdCaches[traceId].__feBinding.getDependentBindings();
                  dependentBindings.forEach(binding => {
                    try {
                      if (binding.__feSource && binding.closestDomRef) {
                        binding.closestDomRef.style.outline = "3px auto green";
                      }
                    } catch (e) {
                      Log.info("Error while highlighting dependent bindings", e);
                    }
                  });
                }
              }), _jsxs(SimpleForm, {
                children: [_jsx(Label, {
                  text: "Method"
                }), _jsx(Text, {
                  text: "{/selectedItem/request/method}"
                }), _jsx(Label, {
                  text: "URL"
                }), _jsx(Text, {
                  text: "{/selectedItem/urlBase}"
                }), _jsx(Label, {
                  text: "Parameters"
                }), _jsx(CodeEditor, {
                  value: "{/selectedItem/parameters}",
                  type: "json",
                  editable: true,
                  height: "200px"
                }), _jsx(Label, {
                  text: "Data"
                }), _jsx(CodeEditor, {
                  value: "{/selectedItem/responseBody}",
                  type: "json",
                  editable: true,
                  height: "300px"
                }), _jsx(Label, {
                  text: "Data Tree"
                })]
              })]
            })]
          }
        })]
      }, "requests"), _jsx(IconTabFilter, {
        text: "OData Properties > Controls",
        children: _jsx(HBox, {
          children: {
            items: [_jsx(List, {
              items: "{/odataPropsToControl}",
              mode: "SingleSelectMaster",
              selectionChange: function (oEvent) {
                const oItem = oEvent.getParameter("listItem");
                if (oItem) {
                  //console.log("Selected item is: " + oItem.getId());
                  const currentValue = oItem.getBindingContext()?.getObject();
                  const currentCache = this.getModel().getProperty("/currentCache");
                  const changeListeners = currentCache.mChangeListeners[currentValue.key];
                  const selectedOdataPropControls = [];
                  const controlPerKey = {};
                  for (const selectedOdataPropControl of changeListeners) {
                    const key = selectedOdataPropControl.__feSource.getMetadata().getName() + " #" + selectedOdataPropControl.__feSource.getId();
                    const prop = selectedOdataPropControl.__feForProp;
                    controlPerKey[key + "_" + prop] ??= {
                      key: key,
                      prop: prop,
                      count: 0,
                      control: selectedOdataPropControl.__feSource
                    };
                    controlPerKey[key + "_" + prop].count++;
                  }
                  Object.keys(controlPerKey).forEach(key => {
                    selectedOdataPropControls.push(controlPerKey[key]);
                  });
                  this.getModel().setProperty("/selectedOdataPropControls", selectedOdataPropControls);
                }
              },
              children: _jsx(StandardListItem, {
                title: "{key}",
                description: "{count}"
              })
            }), _jsx(List, {
              items: "{/selectedOdataPropControls}",
              mode: "SingleSelectMaster",
              selectionChange: function (oEvent) {
                const oItem = oEvent.getParameter("listItem");
                if (oItem) {
                  //console.log("Selected item is: " + oItem.getId());
                  const currentValue = oItem.getBindingContext()?.getObject();
                  showElement(currentValue.control);
                  //(this.getModel() as JSONModel).setProperty("/odataPropsToControl", odataPropsToControl);
                }
              },
              children: _jsx(StandardListItem, {
                title: "{key}",
                description: "Used #{count}",
                info: "Property: {prop}"
              })
            })]
          }
        })
      }, "state")],
      content: []
    }
  });
  inspector.placeAt("sapUiSupportBody");
  inspector.setModel(FE.supportModel);
  addBuildingBlockTab(inspector);
  ResizeHandler.register(document.querySelector("body"), () => {
    codeEditor?.setHeight(window.innerHeight - 120 + "px");
  });
  const showElement = async function (ui5Control) {
    codeEditor.setHeight(window.innerHeight - 120 + "px");
    if (currentControl && currentControl.getDomRef()) {
      currentControl.getDomRef().style.outline = "none";
    }
    currentControl = ui5Control;
    parentButton.setEnabled(!!currentControl?.getParent());
    parentButton.setText("Parent " + currentControl?.getParent()?.getMetadata().getName());
    if (ui5Control.getDomRef()) {
      ui5Control.getDomRef().style.outline = "3px auto red";
    }
    const formattedXML = await serializeControlAsFormattedXML(ui5Control);
    codeEditor.setValue(formattedXML);
    addBBInfo(ui5Control);
    const stateValue = [];
    if (ui5Control.getModel("$componentState")) {
      const stateContent = ui5Control.getModel("$componentState").getData();
      for (const stateContentKey in stateContent) {
        const stateContentValue = stateContent[stateContentKey];
        if (stateContentKey !== "__boundProperties") {
          stateValue.push({
            key: stateContentKey,
            value: stateContentValue
          });
        }
      }
    }
    codeEditor.getModel().setProperty("/state", stateValue);
    loadSupportLinksForElement(ui5Control);
  };
  FE.toggleElementInspector({
    showElement
  });
}, false);
//# sourceMappingURL=InfoSupportTool-dbg.js.map
