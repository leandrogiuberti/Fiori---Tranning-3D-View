/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./i18n", "./controls/facets/types/tabbarfacet/SearchFacetPieChart", "sap/base/Log", "sap/suite/ui/microchart/ComparisonMicroChart", "sap/m/IconTabFilter", "sap/m/Button", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/core/ResizeHandler", "sap/suite/ui/microchart/ComparisonMicroChartData", "sap/m/ActionSheet", "sap/m/library", "sap/ui/core/Element"], function (__i18n, __SearchFacetPieChart, Log, ComparisonMicroChart, IconTabFilter, Button, Filter, FilterOperator, ResizeHandler, ComparisonMicroChartData, ActionSheet, sap_m_library, Element) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const SearchFacetPieChart = _interopRequireDefault(__SearchFacetPieChart);
  const ValueColor = sap_m_library["ValueColor"];
  const PlacementType = sap_m_library["PlacementType"];
  class SearchFacetDialogHelperCharts {
    static dialog;
    constructor(dialog) {
      SearchFacetDialogHelperCharts.dialog = dialog;
    }

    // create bar chart
    static getBarChartPlaceholder() {
      const chartSettings = {
        height: "90%",
        width: "100%",
        colorPalette: "",
        // the colorPalette merely stops the evaluation of the bar with 'neutral', 'good' etc
        tooltip: ""
      };
      const oChart1 = new ComparisonMicroChart(chartSettings);
      oChart1.addStyleClass("largeChart1barchart");
      const oBarchartFilter1 = new Filter({
        path: "value",
        operator: FilterOperator.GT,
        value1: 0
      });
      const oBindingInfo = {
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
              formatter: val => {
                let res = ValueColor.Good;
                if (!val) {
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
              this.dialog.onDetailPageSelectionChangeCharts(oEvent);
            }
          });
          return oComparisonMicroChartData;
        },
        filters: [oBarchartFilter1]
      };
      oChart1.bindAggregation("data", oBindingInfo);
      oChart1.setBusyIndicatorDelay(0);
      return oChart1;
    }
    testWhetherPieWedgeOrLabelIsDummy(oEvent) {
      let res = false;
      try {
        const params = oEvent.getParameters();
        const label = JSON.stringify(params.data[0].data).split('"')[3];
        // 75% of data is outside the top 9 shown in pie chart
        const possibleNumPerc = label.match(/\d+/g)[0];
        const possibleNumTop = label.match(/\d+/g)[1];
        if (label === i18n.getText("facetPieChartOverflowText2", [possibleNumPerc, possibleNumTop])) {
          res = true;
        } else if (label === i18n.getText("facetPieChartOverflowText2", [possibleNumTop, possibleNumPerc])) {
          res = true; // in case order of numbers reversed in foreign language
        }
      } catch (e) {
        Log.debug(e);
      }
      return res;
    }
    static getPieChartPlaceholder() {
      const piechartOptions = {
        oSearchFacetDialog: this.dialog
      };
      const oChart = new SearchFacetPieChart("", piechartOptions);
      oChart.addStyleClass("largeChart2piechart");
      ResizeHandler.register(oChart, function (oEvent) {
        let svgX = 0;
        let marginLeft = 0;
        const eventObj = oEvent;
        if (eventObj.target.firstChild) {
          svgX = parseInt(window.getComputedStyle(eventObj.target.firstChild, null).getPropertyValue("transform-origin").split(" ")[0], 10);
          marginLeft = eventObj.size.width / 2 - svgX;
          eventObj.target.firstChild.style.marginLeft = marginLeft + "px";
        }
      });
      return oChart;
    }
    static setDummyTabBarItems(oControl, ...args) {
      const dummyTabBarItems = [new IconTabFilter({
        text: i18n.getText("facetList"),
        icon: "sap-icon://list",
        key: "list" + args[0]
      }), new IconTabFilter({
        text: i18n.getText("facetBarChart"),
        icon: "sap-icon://horizontal-bar-chart",
        key: "barChart" + args[0]
      }), new IconTabFilter({
        text: i18n.getText("facetPieChart"),
        icon: "sap-icon://pie-chart",
        key: "pieChart" + args[0]
      })];
      oControl.setProperty("tabBarItems", dummyTabBarItems);
      oControl.chartOnDisplayIndex = 0;
    }

    // create an DropDownButton with an actionsheet
    static getDropDownButton(oControl) {
      const aButtons = [];
      let oButton;
      const tabBarItems = oControl.getProperty("tabBarItems");
      const oDropDownButton = new Button({
        icon: tabBarItems[oControl.chartOnDisplayIndex].getIcon(),
        visible: oControl.getModel().getProperty("/config").enableCharts
      });
      for (let i = 0; i < tabBarItems.length; i++) {
        oButton = new Button({
          text: tabBarItems[i].getText(),
          icon: tabBarItems[i].getIcon(),
          press: oEvent => {
            let buttonClickedIndex;
            const buttonClickedId = oEvent.getSource().sId;
            const buttonElem = document.getElementById(buttonClickedId);
            buttonClickedIndex = buttonElem && buttonElem.dataset ? buttonElem.dataset.facetViewIndex : undefined;
            buttonClickedIndex = buttonClickedIndex ? parseInt(buttonClickedIndex, 10) : 0;
            oControl.chartOnDisplayIndex = buttonClickedIndex;
            if (oControl.chartOnDisplayIndex === 0) {
              const settingsContainers = document.getElementsByClassName("sapUshellSearchFacetDialogSettingsContainer");
              for (const el of settingsContainers) {
                el.style.display = "block";
              }
            } else {
              const settingsContainers = document.getElementsByClassName("sapUshellSearchFacetDialogSettingsContainer");
              for (const el of settingsContainers) {
                el.style.display = "none";
              }
            }

            // change the chartOnDisplayIndex value for the current filter selection
            oControl.chartOnDisplayIndexByFilterArray[oControl.facetOnDisplayIndex] = buttonClickedIndex;

            // reset the main button
            const btn = tabBarItems[oControl.chartOnDisplayIndex].getIcon();
            oDropDownButton.setIcon(btn);
            const asWhat = tabBarItems[oControl.chartOnDisplayIndex].getText();

            // reset the main button tooltip
            const displayAs = i18n.getText("displayAs", [asWhat]);
            oDropDownButton.setTooltip(displayAs);

            // change what is displayed in the detail page
            const elemFacetList = document.getElementsByClassName("sapUshellSearchFacetDialogFacetList")[0];
            if (elemFacetList) {
              const oFacetList = Element.getElementById(elemFacetList.id);
              if (oFacetList && typeof oFacetList.getSelectedItem === "function" && !oFacetList.getSelectedItem()) {
                oFacetList.setSelectedItem(oFacetList.getItems()[0]);
              }
              if (oFacetList && typeof oFacetList.fireSelectionChange === "function") {
                oFacetList.fireSelectionChange({
                  listItem: oFacetList.getSelectedItem()
                });
              }
            }
            oControl.controlChartVisibility(oControl, buttonClickedIndex);
          }
        });
        oButton.data("facet-view-index", "" + i, true);
        aButtons.push(oButton);
      }
      const oActionSheet = new ActionSheet({
        showCancelButton: true,
        buttons: aButtons,
        placement: PlacementType.Bottom,
        cancelButtonPress: function () {
          Log.info("sap.m.ActionSheet: cancelButton is pressed");
        }
      });
      oDropDownButton.addStyleClass("sapUshellSearchFacetDialogTabBarButton");
      const asWhat = tabBarItems[oControl.chartOnDisplayIndex].getText();
      const displayAs = i18n.getText("displayAs", [asWhat]);
      oDropDownButton.setTooltip(displayAs);
      oDropDownButton.attachPress(function () {
        oActionSheet.openBy(this);
      });
      return oDropDownButton;
    }
    static getListContainersForDetailPage() {
      // heuristic due to difficulty of finding what user can see in chaos of 'virtual' fiori elements
      let textChartNode = null;
      let barChartNode = null;
      let pieChartNode = null;
      const res = [];
      let relevantContainerIndex = 0;
      let relevantContainerHeight = 440;
      const searchFacetLargeChartContainer = Array.from(document.getElementsByClassName("searchFacetLargeChartContainer"));
      for (let i = 0; i < searchFacetLargeChartContainer.length; i++) {
        if (searchFacetLargeChartContainer[i].clientHeight > 0) {
          // the not ui-relevant chartContainers have height of 0
          let parent = searchFacetLargeChartContainer[i];
          // walk up three levels to get the correct parent
          for (let j = 0; j < 3; j++) {
            parent = parent && parent.offsetParent;
          }
          if (parent) {
            relevantContainerHeight = parent.clientHeight;
          }
          relevantContainerIndex = i;
          break;
        }
      }
      const chartParent = searchFacetLargeChartContainer[relevantContainerIndex];
      if (chartParent) {
        const oListContainer = Element.getElementById(chartParent.id);
        const oInputFieldForFilterTextSet = document.querySelectorAll(".sapUshellSearchFacetDialogSubheaderToolbar .sapMSF");
        const oSortButtonSet = document.querySelectorAll(".sapUshellSearchFacetDialogSortButton");
        const aPotentialCharts = chartParent.firstChild && chartParent.firstChild.children ? chartParent.firstChild.children : [];
        for (let j = 0; j < aPotentialCharts.length; j++) {
          const className = aPotentialCharts[j].className;
          if (className) {
            if (className.match(/sapMList/)) {
              textChartNode = aPotentialCharts[j];
            } else if (className.match(/barchart/)) {
              barChartNode = aPotentialCharts[j];
            } else if (className.match(/piechart/)) {
              pieChartNode = aPotentialCharts[j];
            }
          }
        }
        res.push(chartParent);
        res.push(oListContainer);
        res.push(relevantContainerHeight);
        res.push(textChartNode);
        res.push(barChartNode);
        res.push(pieChartNode);
        res.push(oSortButtonSet);
        res.push(oInputFieldForFilterTextSet);
      }
      return res;
    }
  }
  return SearchFacetDialogHelperCharts;
});
//# sourceMappingURL=SearchFacetDialogHelperCharts-dbg.js.map
