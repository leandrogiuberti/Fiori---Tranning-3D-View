/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../controls/resultview/SearchResultTable", "sap/ui/core/InvisibleText", "../controls/resultview/SearchResultList", "../i18n", "sap/m/library", "../controls/resultview/SearchResultGrid", "sap/f/GridContainerSettings", "../error/errors", "sap/ui/layout/VerticalLayout", "sap/f/GridContainer", "../eventlogging/UserEvents", "sap/f/GridContainerItemLayoutData", "sap/m/Text", "sap/m/Button", "sap/m/FlexBox", "sap/m/CustomListItem", "../controls/SearchTileHighlighter", "../controls/resultview/CustomSearchResultListItem", "../controls/resultview/SearchResultListItem", "sap/m/GenericTile", "sap/m/TileContent", "sap/ui/core/Element", "../SelectionMode", "../UIEvents", "sap/ui/core/EventBus"], function (__SearchResultTable, InvisibleText, __SearchResultList, __i18n, sap_m_library, __SearchResultGrid, GridContainerSettings, __errors, VerticalLayout, GridContainer, ___eventlogging_UserEvents, GridContainerItemLayoutData, Text, Button, FlexBox, CustomListItem, ___controls_SearchTileHighlighter, __CustomSearchResultListItem, __SearchResultListItem, GenericTile, TileContent, Element, ___SelectionMode, __UIEvents, EventBus) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const SearchResultTable = _interopRequireDefault(__SearchResultTable);
  const SearchResultList = _interopRequireDefault(__SearchResultList);
  const i18n = _interopRequireDefault(__i18n);
  const ButtonType = sap_m_library["ButtonType"];
  const FlexJustifyContent = sap_m_library["FlexJustifyContent"];
  const ListMode = sap_m_library["ListMode"];
  const ListType = sap_m_library["ListType"];
  const SearchResultGrid = _interopRequireDefault(__SearchResultGrid);
  const errors = _interopRequireDefault(__errors);
  const UserEventType = ___eventlogging_UserEvents["UserEventType"];
  const Highlighter = ___controls_SearchTileHighlighter["Highlighter"];
  const CustomSearchResultListItem = _interopRequireDefault(__CustomSearchResultListItem);
  const SearchResultListItem = _interopRequireDefault(__SearchResultListItem);
  const SelectionMode = ___SelectionMode["SelectionMode"];
  const UIEvents = _interopRequireDefault(__UIEvents);
  class ResultViewsAssembler {
    compositeControl;
    constructor(compositeControl) {
      this.compositeControl = compositeControl;
    }

    /* private _getPhoneSize(): number {
        return 767;
    } */

    assembleResultView(idPrefix) {
      // list
      this.compositeControl.searchResultList = this.assembleSearchResultList(idPrefix);

      // table
      this.compositeControl.searchResultTable = this.assembleSearchResultTable(idPrefix);

      // grid
      this.compositeControl.searchResultGrid = this.assembleSearchResultGrid(idPrefix);

      // app search result
      this.compositeControl.appSearchResult = this.assembleAppSearch(idPrefix);

      // show more footer
      this.compositeControl.showMoreFooter = this.assembleShowMoreFooter();
      const resultView = [this.compositeControl.searchResultList, this.compositeControl.searchResultTable, this.compositeControl.searchResultGrid, this.compositeControl.appSearchResult, this.compositeControl.showMoreFooter, this.compositeControl.countBreadcrumbsHiddenElement];
      return resultView;
    }
    assembleCountBreadcrumbsHiddenElement() {
      const countBreadcrumbsHiddenElement = new InvisibleText("", {
        text: {
          parts: [{
            path: "/count"
          }],
          formatter: count => {
            if (typeof count !== "number") {
              return "";
            }
            return i18n.getText("results_count_for_screenreaders", [count.toString()]);
          }
        }
      });
      return countBreadcrumbsHiddenElement;
    }
    assembleSearchResultTable(idPrefix) {
      const oModel = this.compositeControl.getModelInternal();
      const resultTable = new SearchResultTable(`${idPrefix}-ushell-search-result-table`, {});
      resultTable.assembleTable(oModel);
      // add aria label to table header row
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      resultTable.addEventDelegate({
        onAfterRendering: () => {
          const controlDom = this.compositeControl.getDomRef();
          if (!controlDom) {
            return;
          }
          const rows = controlDom.querySelectorAll("table tbody tr");
          for (const row of Array.from(rows)) {
            const rowId = row.getAttribute("id");
            const tableRow = Element.getElementById(rowId);
            if (tableRow) {
              const currentAriaLabelledBy = tableRow.getAriaLabelledBy();
              if (currentAriaLabelledBy.indexOf(this.compositeControl.countBreadcrumbsHiddenElement.getId()) === -1) {
                tableRow.addAriaLabelledBy(this.compositeControl.countBreadcrumbsHiddenElement);
              }
            }
            break; // stop after first line for now
          }
        }
      });
      return resultTable;
    }
    assembleSearchResultList(idPrefix) {
      const resultList = new SearchResultList(idPrefix + "-ushell-search-result-list", {
        mode: ListMode.None,
        width: "auto",
        showNoData: false,
        visible: {
          parts: [{
            path: "/resultViewType"
          }, {
            path: "/count"
          }],
          formatter: (resultViewType, count) => {
            return resultViewType === "searchResultList" && count !== 0;
          }
        }
      });
      resultList.bindItems({
        path: "/results",
        factory: (path, oContext) => {
          return this.assembleListItem(path, oContext);
        }
      });
      return resultList;
    }
    assembleSearchResultGrid(idPrefix) {
      const oModel = this.compositeControl.getModelInternal();
      let resultGrid;
      if (typeof oModel.config.customGridView === "function") {
        try {
          resultGrid = oModel.config.customGridView();
        } catch (err) {
          const oError = new errors.ConfigurationExitError("customGridView", oModel.config.applicationComponent, err);
          throw oError;
        }
      } else {
        const gridContainerSettings = new GridContainerSettings("", {
          rowSize: "11rem",
          columnSize: "11rem",
          gap: "0.5rem"
        });
        resultGrid = new SearchResultGrid(idPrefix + "-ushell-search-result-grid", {
          layout: gridContainerSettings,
          snapToRow: true
        });
      }
      resultGrid.bUseExtendedChangeDetection = false; // workaround to avoid circular structure issue for data binding
      resultGrid.bindProperty("visible", {
        parts: ["/resultViewType", "/count"],
        formatter: (resultViewType, count) => {
          return resultViewType === "searchResultGrid" && count !== 0;
        }
      });
      resultGrid.addStyleClass("sapUshellSearchGrid");
      return resultGrid;
    }
    assembleAppSearch(idPrefix) {
      const gridContainerSettings = new GridContainerSettings("", {
        rowSize: "5.5rem",
        columnSize: "5.5rem",
        gap: "0.25rem"
      });
      const gridContainer = new GridContainer(idPrefix + "-ushell-search-result-app", {
        layout: gridContainerSettings,
        snapToRow: true,
        visible: {
          parts: [{
            path: "/count"
          }],
          formatter: count => {
            const oModel = this.compositeControl.getModelInternal();
            return (oModel.isAppCategory() || oModel.isUserCategoryAppSearchOnlyWithoutBOs()) && count !== 0;
          }
        },
        items: {
          path: "/appResults",
          factory: (id, context) => {
            const oModel = this.compositeControl.getModelInternal();
            if (oModel.isAppCategory() || oModel.isUserCategoryAppSearchOnlyWithoutBOs()) {
              const item = context.getObject();
              const visualization = item.visualization;
              const visualizationService = oModel.uShellVisualizationInstantiationService;
              const visualizationControl = visualizationService.instantiateVisualization(visualization);
              visualizationControl.attachPress(() => {
                oModel.eventLogger.logEvent({
                  type: UserEventType.TILE_NAVIGATE,
                  tileTitle: visualization.title,
                  targetUrl: visualization.targetURL
                });
              });
              visualizationControl.addEventDelegate({
                onAfterRendering: this.highlightTile
              });
              visualizationControl.setActive(false, true);
              visualizationControl.setLayoutData(new GridContainerItemLayoutData(visualizationControl.getLayout()));
              return visualizationControl;
            }
            // bind dummy view, prevent douplicated binding
            return new Text("", {
              text: ""
            });
          }
        }
      });
      gridContainer.addStyleClass("sapUshellSearchGridContainer");
      const button = new Button({
        text: "{i18n>showMore}",
        type: ButtonType.Transparent,
        visible: {
          parts: [{
            path: "/appCount"
          }, {
            path: "/appResults"
          }],
          formatter: (appCount, appResults) => {
            const oModel = this.compositeControl.getModelInternal();
            return (oModel.isAppCategory() || oModel.isUserCategoryAppSearchOnlyWithoutBOs()) && appResults.length < appCount;
          }
        },
        press: () => {
          const oModel = this.compositeControl.getModelInternal();
          const newTop = oModel.getTop() + oModel.pageSize;
          oModel.setProperty("/focusIndex", oModel.getTop());
          oModel.setTop(newTop);
          oModel.eventLogger.logEvent({
            type: UserEventType.SHOW_MORE
          });
        }
      });
      button.addStyleClass("sapUshellResultListMoreFooter");
      const verticalLayout = new VerticalLayout("", {
        width: "100%",
        visible: {
          parts: [{
            path: "/count"
          }],
          formatter: count => {
            const oModel = this.compositeControl.getModelInternal();
            return (oModel.isAppCategory() || oModel.isUserCategoryAppSearchOnlyWithoutBOs()) && count !== 0;
          }
        },
        content: [gridContainer, button]
      });
      verticalLayout.addStyleClass("sapUshellResultApps");
      return verticalLayout;
    }
    highlightTile(oEvent) {
      const oInnerControl = oEvent["srcControl"]?.getAggregation("content"); // ToDo
      if (oInnerControl) {
        let aControls = oInnerControl.findAggregatedObjects(true, oControl => {
          return oControl.isA("sap.m.GenericTile") || oControl.isA("sap.f.Card");
        });
        if (aControls.length === 0 && oInnerControl.getComponentInstance) {
          aControls = oInnerControl.getComponentInstance().findAggregatedObjects(true, oControl => {
            return oControl.isA("sap.m.GenericTile") || oControl.isA("sap.f.Card");
          });
        }
        if (aControls.length > 0) {
          const tile = aControls[0];
          const tileHighlighter = new Highlighter();
          tileHighlighter.setHighlightTerms(oEvent["srcControl"]?.getModel().getProperty("/uiFilter/searchTerm"));
          tileHighlighter.highlight(tile);
        }
      }
    }
    assembleShowMoreFooter() {
      const button = new Button(this.compositeControl.getId() + "-resultview-moreFooter-button", {
        text: "{i18n>showMore}",
        type: ButtonType.Transparent,
        press: () => {
          const oCurrentModel = this.compositeControl.getModelInternal();
          oCurrentModel.setProperty("/focusIndex", oCurrentModel.getTop());
          const newTop = oCurrentModel.getTop() + oCurrentModel.pageSize;
          oCurrentModel.setTop(newTop);
          oCurrentModel.eventLogger.logEvent({
            type: UserEventType.SHOW_MORE
          });
        }
      });
      button.addStyleClass("sapUshellResultListMoreFooter");
      const container = new FlexBox(this.compositeControl.getId() + "-resultview-moreFooter", {
        visible: {
          parts: [{
            path: "/boCount"
          }, {
            path: "/boResults"
          }],
          formatter: (boCount, boResults) => {
            return boResults.length < boCount;
          }
        },
        justifyContent: FlexJustifyContent.Center
      });
      container.addStyleClass("sapUshellResultListMoreFooterContainer");
      container.addItem(button);
      return container;
    }
    assembleListItem(resultItemPath, oContext) {
      const oData = oContext.getObject(); // ToDo
      if (oData.type === "footer") {
        return new CustomListItem(`${resultItemPath}-footerItem`, {
          selected: {
            path: "selected"
          }
        }); // return empty list item
      } else if (oData.type === "appcontainer") {
        this.compositeControl.appResultListItem = this.assembleAppContainerResultListItem(resultItemPath);
        return this.compositeControl.appResultListItem;
      }
      return this.assembleResultListItem(resultItemPath, oData);
    }
    assembleResultListItem(resultItemPath, oData) {
      const oModel = this.compositeControl.getModelInternal();
      const dataSourceConfig = oModel.config.getDataSourceConfig(oData.dataSource);
      const searchResultListItemSettings = {
        dataSource: oData.dataSource,
        title: "{title}",
        isTitleHighlighted: {
          path: "isTitleHighlighted"
        },
        titleDescription: "{titleDescription}",
        isTitleDescriptionHighlighted: {
          path: "isTitleDescriptionHighlighted"
        },
        titleNavigation: {
          path: "titleNavigation"
        },
        type: "{dataSourceName}",
        imageUrl: "{imageUrl}",
        imageFormat: "{imageFormat}",
        imageNavigation: {
          path: "imageNavigation"
        },
        geoJson: "{geoJson}",
        attributes: {
          path: "itemattributes"
        },
        navigationObjects: {
          path: "navigationObjects"
        },
        selected: {
          path: "selected"
        },
        selectionEnabled: {
          path: "selectionEnabled"
        },
        customItemStyleClass: {
          path: "customItemStyleClass"
        },
        expanded: {
          path: "expanded"
        },
        positionInList: {
          path: "positionInList"
        },
        resultSetId: {
          path: "resultSetId"
        },
        layoutCache: {
          path: "layoutCache"
        },
        titleIconUrl: {
          path: "titleIconUrl"
        },
        titleInfoIconUrl: {
          path: "titleInfoIconUrl"
        },
        titleInfoIconTooltip: "{titleInfoIconTooltip}"
      };
      let itemContent;
      if (dataSourceConfig.searchResultListItemControl) {
        itemContent = new dataSourceConfig.searchResultListItemControl(searchResultListItemSettings);
      } else if (dataSourceConfig.searchResultListItemContentControl) {
        searchResultListItemSettings["content"] =
        // ToDo
        new dataSourceConfig.searchResultListItemContentControl();
        itemContent = new CustomSearchResultListItem(`${resultItemPath}--customItemContent`, searchResultListItemSettings);
      } else {
        itemContent = new SearchResultListItem(`${resultItemPath}--itemContent`, searchResultListItemSettings);
      }
      if (itemContent.setCountBreadcrumbsHiddenElement) {
        itemContent.setCountBreadcrumbsHiddenElement(this.compositeControl.countBreadcrumbsHiddenElement);
      }
      const listItem = new CustomListItem(`${resultItemPath}--customListItem`, {
        content: itemContent
      });
      listItem.addStyleClass("sapUshellSearchResultListItem");
      listItem.bindProperty("type", {
        parts: [{
          path: "/config/resultviewMasterDetailMode"
        }, {
          path: "/config/resultviewSelectionMode"
        }],
        formatter: (resultviewMasterDetailMode, resultviewSelectionMode) => {
          let newType;
          const pressFunction = oEvent => {
            // notify subscribers
            oModel.notifySubscribers(UIEvents.ESHShowResultDetail);
            EventBus.getInstance().publish(UIEvents.ESHShowResultDetail, oEvent);
          };
          if (resultviewMasterDetailMode) {
            newType = ListType.Navigation;
            listItem.attachPress(pressFunction.bind(this));
          } else if (resultviewSelectionMode === SelectionMode.OneItem) {
            newType = ListType.Active;
            listItem.detachPress(pressFunction);
          } else {
            newType = ListType.Inactive;
            listItem.detachPress(pressFunction);
          }

          // special handling for phone mode, see _setListItemStatusBasedOnWindowSize in SearchResultListItem.ts
          /* const windowWidth = window.innerWidth;
          if (
              listItem.getContent()[0].getProperty("titleNavigation") &&
              windowWidth <= this._getPhoneSize()
          ) {
              newType = ListType.Active;
          } */
          return newType;
        }
      });
      if (itemContent.setParentListItem) {
        itemContent.setParentListItem(listItem);
      }
      return listItem;
    }
    assembleAppContainerResultListItem(resultItemPath) {
      const appItemContainerLayout = new GridContainerSettings("", {
        rowSize: "5.5rem",
        columnSize: "5.5rem",
        gap: "0.25rem"
      });
      const appContainerId = `${resultItemPath}-appItemContainer`;
      const container = new GridContainer(appContainerId, {
        layout: appItemContainerLayout,
        snapToRow: true,
        items: {
          path: "/appResults",
          factory: (id, context) => {
            const oModel = this.compositeControl.getModelInternal();
            if (!oModel.isAppCategory()) {
              const item = context.getObject();
              const visualization = item.visualization;
              const visualizationService = oModel.uShellVisualizationInstantiationService;
              const visualizationControl = visualizationService.instantiateVisualization(visualization);
              visualizationControl.attachPress(() => {
                const oModel = this.compositeControl.getModelInternal();
                oModel.eventLogger.logEvent({
                  type: UserEventType.TILE_NAVIGATE,
                  tileTitle: visualization.title,
                  targetUrl: visualization.targetURL
                });
              });
              visualizationControl.addEventDelegate({
                onAfterRendering: this.highlightTile
              });
              visualizationControl.setActive(false, true);
              visualizationControl.setLayoutData(new GridContainerItemLayoutData(visualizationControl.getLayout()));
              return visualizationControl;
            }
            // bind dummy view, prevent duplicated binding
            // tile can handle only one view
            return new Text(id, {
              text: ""
            });
          }
        }
      });
      container.addStyleClass("sapUshellSearchGridContainer");
      container.addEventDelegate({
        onAfterRendering: () => {
          const oModel = this.compositeControl.getModelInternal();
          const tileWidth = 180;
          const tileMargin = 4;
          const tileWidthWithMargin = tileWidth + tileMargin;
          const containerPaddingLeft = 6;
          const fullItems = container.getItems();
          const appCount = oModel.getProperty("/appCount");
          const boCount = oModel.getProperty("/boCount");
          const lastItem = fullItems[fullItems.length - 1];

          // calculate the suitable items for container
          if (container.getDomRef().clientWidth === 0) {
            return;
          }
          let maxWidth = container.getDomRef().clientWidth - containerPaddingLeft - tileWidth; // container width - padding left - last show more tile width

          // after introducing new layout, we should new calculation for showMore button
          if (maxWidth < 0) {
            if (lastItem.hasStyleClass("sapUshellSearchResultListItemAppsShowMore")) {
              const appResults = oModel.getProperty("/appResults");
              oModel.setProperty("/appResults", appResults.slice(0, -1));
            }
            return;
          }
          if (maxWidth < tileWidth) {
            maxWidth = tileWidth;
          }
          const maxItems = Math.floor(maxWidth / tileWidthWithMargin);
          if (lastItem.hasStyleClass("sapUshellSearchResultListItemAppsShowMore")) {
            return; // already done with cutting and adding show more tile, do not do multipule times
          }
          if (fullItems.length > maxItems + 1) {
            // items greater than maxItems+showMore, must be cut
            let width = 0,
              i = 0;
            for (; i < fullItems.length; i++) {
              width = width + fullItems[i].getDomRef().clientWidth + tileMargin; // tile width + margin
              if (width > maxWidth) {
                break;
              }
            }
            const appResults = oModel.getProperty("/appResults");
            oModel.setProperty("/appResults", appResults.slice(0, i));
          } else if (fullItems.length < maxItems + 1) {
            // appCount greater than maxItems, add showMore tile
            if (appCount > maxItems && !lastItem.hasStyleClass("sapUshellSearchResultListItemAppsShowMore")) {
              const appContainerShowMoreId = `${appContainerId}--showMore`;
              const showMoreTile = new GenericTile(appContainerShowMoreId, {
                tileContent: new TileContent(`${appContainerShowMoreId}--content`, {
                  content: new Text(`${appContainerShowMoreId}--content--text`, {
                    text: i18n.getText("showMoreApps")
                  })
                }),
                press: () => {
                  const oModel = this.compositeControl.getModelInternal();
                  oModel.setDataSource(oModel.appDataSource);
                }
              });
              showMoreTile.addStyleClass("sapUshellSearchResultListItemAppsShowMore");
              container.addItem(showMoreTile);
              // force update showMore button to avoid outdated binding
              oModel.setProperty("/resultViewType", "appSearchResult");
              oModel.setProperty("/resultViewType", "searchResultList");
              oModel.setProperty("/boCount", 0);
              oModel.setProperty("/boCount", boCount);
            }
          }
        }
      }, container);
      const listItem = new CustomListItem(`${this.compositeControl.getId()}-appItem`, {
        content: container
      });
      listItem.addStyleClass("sapUshellSearchResultListItem");
      listItem.addStyleClass("sapUshellSearchResultListItemApps");
      listItem.addEventDelegate({
        onAfterRendering: function () {
          const domRef = listItem.getDomRef();
          if (domRef) {
            domRef.removeAttribute("role");
            domRef.setAttribute("aria-hidden", "true");
          }
        }
      }, listItem);
      return listItem;
    }
  }
  return ResultViewsAssembler;
});
//# sourceMappingURL=ResultViewsAssembler-dbg.js.map
