/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../../../i18n", "sap/suite/ui/microchart/ComparisonMicroChart", "sap/suite/ui/microchart/ComparisonMicroChartData", "sap/ui/core/Control", "sap/m/library", "sap/ui/core/Element"], function (__i18n, ComparisonMicroChart, ComparisonMicroChartData, Control, sap_m_library, Element) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const ValueColor = sap_m_library["ValueColor"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchFacetBarChart = Control.extend("sap.esh.search.ui.controls.SearchFacetBarChart", {
    renderer: {
      apiVersion: 2,
      render(oRm, oControl) {
        // render start of tile container
        oRm.openStart("div", oControl);
        oRm.openEnd();
        const oComparisonMicroChart = new ComparisonMicroChart("", {
          width: "90%",
          colorPalette: [],
          // the colorPalette merely stops the evaluation of the bar with 'neutral', 'good' etc
          tooltip: "",
          shrinkable: true
        });
        if (oControl.options?.oSearchFacetDialog) {
          oComparisonMicroChart.setWidth("95%");
          oComparisonMicroChart.addStyleClass("sapUshellSearchFacetBarChartLarge");
        } else {
          oComparisonMicroChart.addStyleClass("sapUshellSearchFacetBarChart");
        }
        oComparisonMicroChart.addEventDelegate({
          onAfterRendering: function () {
            const chartDom = document.getElementById(this.getId());
            if (chartDom && chartDom.querySelector(".Good")) {
              chartDom.classList.add("sapUshellSearchFacetBarChartSelected");
            }
            const selectedFacetItem = this.getBindingContext().getObject();
            oComparisonMicroChart.getDomRef().setAttribute("data-test-id-facet-dimension-value", `${selectedFacetItem.title}-${selectedFacetItem.dimension}`);
          }.bind(oControl)
        });
        let barItems = oControl.getAggregation("items");
        const barItems2 = oControl.getProperty("aItems");
        if (barItems.length === 0 && barItems2) {
          barItems = barItems2;
        }
        let iMissingCnt = 0;
        for (const barItem of barItems) {
          if (!oControl.options.oSearchFacetDialog) {
            if (barItem.getProperty("value")) {
              oComparisonMicroChart.addData(barItem);
            } else {
              iMissingCnt++;
            }
          } else {
            oComparisonMicroChart.addData(barItem);
          }
        }
        oControl.iMissingCnt = iMissingCnt;
        oRm.renderControl(oComparisonMicroChart);

        // render end of tile container
        oRm.close("div");
      }
    },
    metadata: {
      properties: {
        aItems: {
          type: "object"
        },
        oSearchFacetDialog: {
          type: "sap.esh.search.ui.controls.SearchFacetDialog"
        }
      },
      aggregations: {
        items: {
          type: "sap.suite.ui.microchart.ComparisonMicroChartData",
          multiple: true
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Control.prototype.constructor.call(this, sId, settings);
      this.options = settings || {};
      this.bindAggregation("items", {
        path: "items",
        factory: () => {
          const oComparisonMicroChartData = new ComparisonMicroChartData({
            title: {
              path: "label"
            },
            value: {
              path: "value"
            },
            color: {
              path: "selected",
              formatter: isSelected => {
                let res;
                if (isSelected) {
                  res = ValueColor.Good;
                } else {
                  res = ValueColor.Neutral;
                }
                return res;
              }
            },
            tooltip: {
              parts: [{
                path: "label"
              }, {
                path: "value"
              }],
              formatter: (label, value) => {
                return label + ": " + value;
              }
            },
            displayValue: {
              path: "valueLabel"
            },
            press: oEvent => {
              const context = oEvent.getSource().getBindingContext();
              const model = context.getModel();
              const data = context.getObject();
              const isSelected = data.selected;
              const filterCondition = data.filterCondition; // ToDo

              if (isSelected) {
                // deselect (remove filter)
                if (this.options.oSearchFacetDialog) {
                  this.options.oSearchFacetDialog.onDetailPageSelectionChangeCharts(oEvent);
                } else {
                  model.removeFilterCondition(filterCondition, true);
                }
              } else if (this.options.oSearchFacetDialog) {
                // select (set filter), first for searchFacetDialog
                this.options.oSearchFacetDialog.onDetailPageSelectionChangeCharts(oEvent);
              } else {
                // select (set filter), without searchFacetDialog / for small facets
                model.addFilterCondition(filterCondition, true);
              }
            }
          });
          return oComparisonMicroChartData;
        }
      });
    },
    onAfterRendering: function _onAfterRendering() {
      const domRef = this.getDomRef();
      const facetIconTabBar = domRef.closest(".sapUshellSearchFacetIconTabBar");
      if (!facetIconTabBar) {
        return;
      }
      const infoZeile = facetIconTabBar.querySelector(".sapUshellSearchFacetInfoZeile");
      if (!infoZeile) {
        return;
      }
      const oInfoZeile = Element.getElementById(infoZeile.id);
      if (this.iMissingCnt > 0) {
        oInfoZeile.setVisible(true);
        const message = i18n.getText("infoZeileNumberMoreSelected", [this.iMissingCnt]);
        oInfoZeile.setText(message);
        oInfoZeile.rerender();
      } else {
        oInfoZeile.setVisible(false);
      }
    }
  });
  return SearchFacetBarChart;
});
//# sourceMappingURL=SearchFacetBarChart-dbg.js.map
