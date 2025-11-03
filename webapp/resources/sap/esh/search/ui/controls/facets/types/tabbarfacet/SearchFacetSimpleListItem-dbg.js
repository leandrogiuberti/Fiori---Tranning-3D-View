/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/esh/search/ui/SearchHelper", "sap/ui/core/CustomData", "sap/m/library", "sap/m/StandardListItem"], function (SearchHelper, CustomData, sap_m_library, StandardListItem) {
  "use strict";

  const ListType = sap_m_library["ListType"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchFacetSimpleListItem = StandardListItem.extend("sap.esh.search.ui.controls.SearchFacetSimpleListItem", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        isDataSource: {
          type: "boolean",
          defaultValue: false
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      StandardListItem.prototype.constructor.call(this, sId, settings);
      this.setType(ListType.Active);
      this.bindProperty("title", {
        path: "label"
      });
      this.bindProperty("tooltip", {
        parts: [{
          path: "label"
        }, {
          path: "valueLabel"
        }],
        formatter: (label, valueLabel) => valueLabel ? `${label}: ${valueLabel}` : ""
      });
      if (!settings.isDataSource) {
        this.bindProperty("icon", {
          path: "icon"
        });
      }
      this.bindProperty("info", {
        parts: [{
          path: "value"
        }, {
          path: "valueLabel"
        }],
        formatter: function (value, valueLabel) {
          if (typeof value === "number") {
            return SearchHelper.formatInteger(value);
          } else if (typeof value === "string") {
            return value;
          } else if (typeof valueLabel !== "undefined" && valueLabel !== "") {
            return valueLabel;
          } else {
            return "";
          }
        }
      });
      this.bindProperty("selected", {
        path: "selected"
      });
      this.insertCustomData(new CustomData({
        key: "test-id-facet-dimension-value",
        value: {
          parts: [{
            path: "facetTitle"
          }, {
            path: "label"
          }],
          formatter: (facetTitle, label) => `${facetTitle}-${label}`
        },
        writeToDom: true
      }), 0);
      this.addStyleClass("sapUshellSearchFacetGenericItem");
      this.addStyleClass("sapUshellSearchFacetItem"); // deprecated
      this.addEventDelegate({
        onAfterRendering: () => {
          const bindingContext = this?.getBindingContext();
          const bindingObject = bindingContext?.getObject();
          if (!bindingObject) return;
          const level = bindingObject.level;
          const isRTL = document.documentElement.getAttribute("dir") === "rtl";
          const domRef = this.getDomRef();
          if (!domRef) return;
          const contentElement = domRef.querySelector(".sapMLIBContent");
          if (!contentElement) return;
          const paddingValue = level + "rem";
          if (isRTL) {
            contentElement.style.paddingRight = paddingValue;
          } else {
            contentElement.style.paddingLeft = paddingValue;
          }
        }
      });
    }
  });
  return SearchFacetSimpleListItem;
});
//# sourceMappingURL=SearchFacetSimpleListItem-dbg.js.map
