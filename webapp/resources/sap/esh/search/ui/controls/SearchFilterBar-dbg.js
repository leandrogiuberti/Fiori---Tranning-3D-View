/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../i18n", "sap/m/Text", "sap/m/Toolbar", "sap/m/ToolbarSpacer", "sap/m/library", "sap/ui/core/Icon", "../sinaNexTS/sina/ComplexCondition", "../sinaNexTS/sina/ComparisonOperator", "../eventlogging/UserEvents", "../sinaNexTS/sina/HierarchyDisplayType", "../error/errors", "./facets/FacetTypeUI", "../sinaNexTS/sina/SimpleCondition"], function (__i18n, Text, Toolbar, ToolbarSpacer, sap_m_library, Icon, ___sinaNexTS_sina_ComplexCondition, ___sinaNexTS_sina_ComparisonOperator, ___eventlogging_UserEvents, ___sinaNexTS_sina_HierarchyDisplayType, __errors, ___facets_FacetTypeUI, ___sinaNexTS_sina_SimpleCondition) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const ToolbarDesign = sap_m_library["ToolbarDesign"];
  const ComplexCondition = ___sinaNexTS_sina_ComplexCondition["ComplexCondition"];
  const ComparisonOperator = ___sinaNexTS_sina_ComparisonOperator["ComparisonOperator"];
  const UserEventType = ___eventlogging_UserEvents["UserEventType"];
  const HierarchyDisplayType = ___sinaNexTS_sina_HierarchyDisplayType["HierarchyDisplayType"];
  const errors = _interopRequireDefault(__errors);
  const FacetTypeUI = ___facets_FacetTypeUI["FacetTypeUI"];
  const SimpleCondition = ___sinaNexTS_sina_SimpleCondition["SimpleCondition"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchFilterBar = Toolbar.extend("sap.esh.search.ui.controls.SearchFilterBar", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, settings) {
      Toolbar.prototype.constructor.call(this, sId, settings);

      // blue bar
      this.setProperty("design", ToolbarDesign.Info);
      this.addStyleClass("sapUshellSearchFilterContextualBar");

      // bind file formatter
      this.filterFormatter = this.filterFormatter.bind(this);

      // filter text string
      this.filterText = new Text(this.getId() + "-resetFilterText", {
        text: {
          parts: [{
            path: "/uiFilter/rootCondition"
          }, {
            path: "/facets"
          }],
          formatter: this.filterFormatter
        },
        tooltip: {
          parts: [{
            path: "/uiFilter/rootCondition"
          }, {
            path: "/facets"
          }],
          formatter: this.filterFormatter
        }
      }).addStyleClass("sapUshellSearchFilterText");
      this.filterText.setMaxLines(1);
      this.addContent(this.filterText);

      // filter middle space
      this.addContent(new ToolbarSpacer());

      // filter reset button
      this.resetButton = new Icon(this.getId() + "-resetFilterButton", {
        src: "sap-icon://clear-filter",
        tooltip: i18n.getText("resetFilterButton_tooltip")
      }).addStyleClass("sapUshellSearchFilterResetButton");
      this.addContent(this.resetButton);
    },
    filterFormatter: function _filterFormatter(rootCondition, facets) {
      if (!rootCondition || !rootCondition.hasFilters()) {
        return "";
      }
      const model = this.getModel();
      if (model.config.formatFilterBarText) {
        // 1) exit
        try {
          return model.config.formatFilterBarText(this._assembleFilterLabels(rootCondition, facets));
        } catch (error) {
          const oError = new errors.ConfigurationExitError("formatFilterBarText", model.config.applicationComponent, error);
          const searchCompositeControl = model.getSearchCompositeControlInstanceByChildControl(this);
          searchCompositeControl?.errorHandler.onError(oError);
          return this._formatFilterText(rootCondition, facets); // fallback default formatter
        }
      } else {
        // 2) default formatter
        return this._formatFilterText(rootCondition, facets);
      }
    },
    _assembleFilterLabels: function _assembleFilterLabels(rootCondition, facets) {
      const attributeFilters = [];
      // sort filter values, use same order as in facets
      rootCondition = this.sortConditions(rootCondition, facets);
      // collect all filter values
      for (let i = 0; i < rootCondition.conditions.length; ++i) {
        const complexCondition = rootCondition.conditions[i];
        const model = this.getModel();
        const attribute = complexCondition.getFirstAttribute();
        const attributeMetadata = model.getProperty("/uiFilter")?.dataSource.attributeMetadataMap[attribute];
        if (attributeMetadata && attributeMetadata.isHierarchy === true && attributeMetadata.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet) {
          continue;
        }
        const attributeFilter = {
          attributeName: attributeMetadata?.id || attribute,
          attributeLabel: "",
          attributeFilterValueLabels: []
        };
        attributeFilters.push(attributeFilter);
        for (let j = 0; j < complexCondition.conditions.length; ++j) {
          const filterCondition = complexCondition.conditions[j];
          if (j === 0) {
            attributeFilter.attributeLabel = filterCondition.attributeLabel;
          }
          let label;
          if (filterCondition instanceof SimpleCondition) {
            label = this._formatLabel(filterCondition.valueLabel, filterCondition.operator);
          } else if (filterCondition instanceof ComplexCondition) {
            label = this._formatLabel(filterCondition.valueLabel);
          }
          attributeFilter.attributeFilterValueLabels.push(label);
        }
      }
      return attributeFilters;
    },
    _formatFilterText: function _formatFilterText(rootCondition, facets) {
      const attributeFilters = this._assembleFilterLabels(rootCondition, facets);
      const result = attributeFilters.map(attributeFilter => attributeFilter.attributeLabel + " (" + attributeFilter.attributeFilterValueLabels.join(", ") + ")");
      return i18n.getText("filtered_by", [result.join(", ")]);
    },
    _formatLabel: function _formatLabel(label, operator) {
      let labelFormatted;
      switch (operator) {
        case ComparisonOperator.Bw:
          // "Bw"
          labelFormatted = label + "*";
          break;
        case ComparisonOperator.Ew:
          // "Ew"
          labelFormatted = "*" + label;
          break;
        case ComparisonOperator.Co:
          // "Co"
          labelFormatted = "*" + label + "*";
          break;
        default:
          labelFormatted = label;
          break;
      }
      return labelFormatted;
    },
    sortConditions: function _sortConditions(rootCondition, facets) {
      // cannot sort without facets
      if (facets.length === 0) {
        return rootCondition;
      }
      // helper: get attribute from a complex condition
      const getAttribute = function (complexCondition) {
        const firstFilter = complexCondition.conditions[0];
        if (firstFilter.attribute) {
          return firstFilter.attribute;
        }
        return firstFilter.conditions[0].attribute;
      };
      // helper get list index
      const getIndex = function (list, attribute, value) {
        for (let i = 0; i < list.length; ++i) {
          const element = list[i];
          if (element[attribute] === value) {
            return i;
          }
        }
      };
      // clone: we don't want to modify the original filter
      rootCondition = rootCondition.clone();
      // 1) sort complexConditons (each complexCondition holds the filters for a certain attribute)
      rootCondition.conditions.sort(function (complexCondition1, complexCondition2) {
        const attribute1 = getAttribute(complexCondition1);
        const index1 = getIndex(facets, "dimension", attribute1);
        const attribute2 = getAttribute(complexCondition2);
        const index2 = getIndex(facets, "dimension", attribute2);
        return index1 - index2;
      });
      // 2) sort filters within a complexConditon
      const sortValues = function (complexCondition) {
        const attribute = getAttribute(complexCondition);
        const index = getIndex(facets, "dimension", attribute);
        if (!index) {
          return;
        }
        const facet = facets[index];
        if (facet.facetType === FacetTypeUI.Hierarchy) {
          return; // no sort for hierarchy
        }
        const valueSortFunction = function (filter1, filter2) {
          return getIndex(facet.items, "label", filter1.valueLabel) - getIndex(facet.items, "label", filter2.valueLabel);
        };
        complexCondition.conditions.sort(valueSortFunction);
      };
      for (let i = 0; i < rootCondition.conditions.length; ++i) {
        const complexCondition = rootCondition.conditions[i];
        sortValues(complexCondition);
      }
      return rootCondition;
    },
    onAfterRendering: function _onAfterRendering(oEvent) {
      Toolbar.prototype.onAfterRendering.call(this, oEvent);

      // don't have model until after rendering
      // attach press action
      this.resetButton.attachPress(() => {
        const model = this.getModel();
        model.eventLogger.logEvent({
          type: UserEventType.CLEAR_ALL_FILTERS,
          dataSourceKey: model.getDataSource().id
        });
        model.resetFilterByFilterConditions(true);
      });

      // add aria label
      const filterText = document.querySelector(".sapUshellSearchFilterText");
      if (filterText) {
        filterText.setAttribute("aria-label", i18n.getText("filtered_by_aria_label"));
      }
    }
  });
  return SearchFilterBar;
});
//# sourceMappingURL=SearchFilterBar-dbg.js.map
