/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/m/List", "sap/ui/core/ResizeHandler", "sap/m/library", "../../SelectionMode"], function (List, ResizeHandler, sap_m_library, ____SelectionMode) {
  "use strict";

  const ListMode = sap_m_library["ListMode"];
  const SelectionMode = ____SelectionMode["SelectionMode"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchResultList = List.extend("sap.esh.search.ui.controls.SearchResultList", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      List.prototype.constructor.call(this, sId, options);
      this.addStyleClass("searchResultList");
      this.attachSelectionChange(oEvent => {
        // console.log("SELECTION: table, selectionChange event ");
        // for list mode "SingleSelectMaster" -> select on row click
        // -> thus checkbox change will not be fired, and we need to update selection here
        const oModel = this.getModel();
        const listItem = oEvent.getParameter("listItem");
        oModel.setProperty(`${listItem.getBindingContext().getPath()}/selected`, oEvent.getParameter("selected"));
        oModel.updateMultiSelectionSelected();
      });
      this.bindProperty("mode", {
        parts: [{
          path: "/multiSelectionEnabled"
        }, {
          path: "/resultviewSelectionVisibility"
        }, {
          path: "/config/resultviewSelectionMode"
        }],
        formatter: (multiSelectionEnabled, resultviewSelectionVisibility, resultviewSelectionMode) => {
          if (resultviewSelectionMode === SelectionMode.MultipleItems && multiSelectionEnabled === true) {
            if (resultviewSelectionVisibility === true) {
              return ListMode.None; // result list item comes with its own checkbox
            } else {
              return ListMode.None; // see ColumnListItem, type="Navigation"
            }
          } else if (resultviewSelectionMode === SelectionMode.OneItem) {
            return ListMode.SingleSelectMaster;
          } else {
            return ListMode.None;
          }
        }
      });
    },
    onAfterRendering: function _onAfterRendering(...args) {
      // first let the original sap.m.List do its work
      List.prototype.onAfterRendering.apply(this, args);
      const model = this.getModel();
      const multiSelectionEnabled = model.getProperty("/multiSelectionEnabled");
      if (multiSelectionEnabled) {
        this.enableSelectionMode();
      }
      this._prepareResizeHandler();
    },
    _prepareResizeHandler: function _prepareResizeHandler() {
      const resizeThresholds = [768, 1151];
      const windowWidthIndex = () => {
        const windowWidth = window.innerWidth;
        if (windowWidth < resizeThresholds[0]) {
          return 0;
        }
        for (let i = 0; i < resizeThresholds.length - 1; i++) {
          if (windowWidth >= resizeThresholds[i] && windowWidth < resizeThresholds[i + 1]) {
            return i + 1;
          }
        }
        return resizeThresholds.length;
      };
      let lastWindowWidthIndex = windowWidthIndex();
      this._resizeHandler = forceResize => {
        const currentWindowWidthIndex = windowWidthIndex();
        if (currentWindowWidthIndex != lastWindowWidthIndex || forceResize) {
          lastWindowWidthIndex = currentWindowWidthIndex;
          const aMyListItems = this.getItems();
          for (const listItem of aMyListItems) {
            const listItemContent = listItem.getContent();
            if (listItemContent?.length > 0) {
              if (typeof listItemContent[0]?.resizeEventHappened === "function") {
                listItemContent[0]?.resizeEventHappened();
              }
            }
          }
        }
      };
      ResizeHandler.register(this, () => {
        this._resizeHandler();
      });
    },
    resize: function _resize() {
      if (typeof this._resizeHandler !== "undefined") {
        this._resizeHandler(true /* forceResize */);
      }
    },
    enableSelectionMode: function _enableSelectionMode() {
      const domRef = this.getDomRef();
      if (domRef && domRef.classList) {
        domRef.classList.add("sapUshellSearchResultList-ShowMultiSelection");
      }
    }
  });
  return SearchResultList;
});
//# sourceMappingURL=SearchResultList-dbg.js.map
