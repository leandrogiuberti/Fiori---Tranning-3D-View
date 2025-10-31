/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/esh/search/ui/SearchHelper", "sap/f/GridContainer", "sap/m/ImageContent", "sap/m/GenericTile", "sap/m/TileContent", "sap/m/CheckBox", "sap/m/HBox", "sap/m/VBox", "sap/m/Toolbar", "./SearchText", "../SearchLink", "sap/ui/base/ManagedObject", "../../SelectionMode", "../../sinaNexTS/sina/AttributeFormatType"], function (SearchHelper, GridContainer, ImageContent, GenericTile, TileContent, CheckBox, HBox, VBox, Toolbar, __SearchText, __SearchLink, ManagedObject, ____SelectionMode, ____sinaNexTS_sina_AttributeFormatType) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const SearchText = _interopRequireDefault(__SearchText);
  const SearchLink = _interopRequireDefault(__SearchLink);
  const SelectionMode = ____SelectionMode["SelectionMode"];
  const AttributeFormatType = ____sinaNexTS_sina_AttributeFormatType["AttributeFormatType"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchResultGrid = GridContainer.extend("sap.esh.search.ui.controls.SearchResultGrid", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      GridContainer.prototype.constructor.call(this, sId, options);
      this.bindAggregation("items", {
        path: "publicSearchModel>/results/items",
        factory: (id, context) => {
          const item = context.getObject();
          let checkboxContent;
          let headerToolbar;
          let imageContent;
          let tileContainer;
          let oTitle;
          let titleDescription;
          const contentItems = [];
          if (item.data.attributes) {
            headerToolbar = new Toolbar({
              design: "Transparent",
              content: []
            }).addStyleClass("sapUiTinyMarginBottom");
            contentItems.push(headerToolbar);
            const imageUrls = item.data.attributes.filter(attr => {
              return attr?.metadata?.type === "ImageUrl"; // ToDo -> attribute 'HASHIERARCHYNODECHILD' has no property 'metadata'
            });
            checkboxContent = new CheckBox(`${id}--tileCheckBox`, {
              selected: {
                path: "publicSearchModel>selected"
              },
              select: () => {
                // console.log("SELECTION: tile checkbox, select event");
                this.ignoreNextTilePress = true; // prevent navigation when selecting checkbox
                this.getItems().forEach(item => {
                  this._syncSelectionCssClass(item);
                });
              },
              enabled: {
                parts: [{
                  path: "publicSearchModel>selectionEnabled"
                }]
              },
              visible: {
                parts: [{
                  path: "publicSearchModel>/resultviewSelectionVisibility"
                }, {
                  path: "publicSearchModel>/config/resultviewSelectionMode"
                }],
                formatter: (resultviewSelectionVisibility, resultviewSelectionMode) => {
                  return resultviewSelectionVisibility && resultviewSelectionMode !== SelectionMode.OneItem;
                }
              }
            });
            headerToolbar.addContent(checkboxContent);
            if (imageUrls.length > 0 && typeof imageUrls[0].value === "string") {
              imageContent = new ImageContent(`${id}-Image`, {
                src: ManagedObject.escapeSettingsValue(imageUrls[0].value)
              }).addStyleClass("sapUiMediumMarginBegin");
              const imageFormat = imageUrls[0].metadata.format;
              if (imageFormat === AttributeFormatType.Round) {
                imageContent.addStyleClass("sapUshellResultListGrid-ImageContainerRound");
              }
            }
            // title link
            let titleText;
            if (item.data?.defaultNavigationTarget) {
              if (item.data.titleAttributes.length > 0) {
                oTitle = new SearchLink(`${id}-Title`, {
                  text: ManagedObject.escapeSettingsValue(item.title),
                  navigationTarget: item.data.defaultNavigationTarget
                });
                contentItems.push(oTitle);
              } else {
                oTitle = new SearchText("", {
                  text: ManagedObject.escapeSettingsValue(item.data.defaultNavigationTarget.text || "No Title (def. nav. target w/o text)")
                });
                contentItems.push(oTitle);
              }
            } else if (item.data.titleAttributes.length > 0) {
              oTitle = new SearchText("", {
                text: ManagedObject.escapeSettingsValue(item.title)
              });
              contentItems.push(oTitle);
            } else if (item.data.detailAttributes.length > 0) {
              titleText = item.data.detailAttributes[0].valueFormatted;
              oTitle = new SearchText("", {
                text: ManagedObject.escapeSettingsValue(titleText)
              });
              contentItems.push(oTitle);
            }
            if (imageContent) {
              contentItems.push(imageContent);
            }
            tileContainer = new VBox({
              items: [headerToolbar, new VBox({
                items: contentItems
              })]
            });
          } else {
            // robustness for app search tiles (grid not rendered but updated based on search results!!!)
            if (item.data["title"]) {
              oTitle = item.data["title"];
              titleDescription = item.data["subtitle"];
            }
            contentItems.push(new VBox({
              items: [oTitle, titleDescription]
            }));
            tileContainer = new HBox({
              items: contentItems
            });
          }
          const oTile = new GenericTile(`${id}-resultItemTile`, {
            tileContent: new TileContent(`${id}-resultItemTileContent`, {
              content: tileContainer
            }),
            press: oEvent => {
              if (this.ignoreNextTilePress) {
                this.ignoreNextTilePress = false;
                return;
              }
              const publicModel = this.getModel("publicSearchModel");
              const data = publicModel.getProperty(oEvent.getSource().getBindingContext("publicSearchModel").getPath()).data;
              if (publicModel.getProperty("/config/resultviewSelectionMode") === SelectionMode.OneItem) {
                const publicModelItem = oEvent.getSource().getTileContent()[0].getBindingContext("publicSearchModel").getObject();
                publicModelItem.setSelected(!publicModelItem.selected);
              } else {
                const defaultNavigationTarget = data.defaultNavigationTarget;
                if (typeof defaultNavigationTarget?.performNavigation === "function") {
                  defaultNavigationTarget.performNavigation({
                    event: oEvent
                  });
                }
                const titleNavigation = data.titleNavigation;
                if (typeof titleNavigation?.performNavigation === "function") {
                  titleNavigation.performNavigation({
                    event: oEvent
                  });
                }
              }
              this.getItems().forEach(item => {
                this._syncSelectionCssClass(item);
              });
            }
          }).addStyleClass("sapElisaGridTile");
          return oTile;
        }
      });
      this.addStyleClass("sapUshellResultListGrid");
    },
    onAfterRendering: function _onAfterRendering(oEvent) {
      GridContainer.prototype.onAfterRendering.call(this, oEvent);
      // unescape bold tags
      SearchHelper.boldTagUnescaper(this.getDomRef());
      // apply custom style class to all result items based on property 'customItemStyleClass'
      SearchHelper.resultItemCustomStyleClassSetter(this);
      // sync background selection style
      this.getItems().forEach(item => {
        this._syncSelectionCssClass(item);
      });
    },
    // sync the CSS class for selection state
    _syncSelectionCssClass: function _syncSelectionCssClass(item) {
      const selected = item.getBindingContext("publicSearchModel").getProperty("selected");
      if (selected) {
        item.addStyleClass("sapUshellSearchResultGridTile-Selected");
      } else {
        item.removeStyleClass("sapUshellSearchResultGridTile-Selected");
      }
    }
  });
  return SearchResultGrid;
});
//# sourceMappingURL=SearchResultGrid-dbg.js.map
