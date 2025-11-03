/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SinaObject", "./SimpleCondition", "./ComplexCondition", "../core/errors", "./HierarchyDisplayType", "./DataSourceType", "./i18n"], function (___SinaObject, ___SimpleCondition, ___ComplexCondition, ___core_errors, ___HierarchyDisplayType, ___DataSourceType, ___i18n) {
  "use strict";

  const SinaObject = ___SinaObject["SinaObject"];
  const SimpleCondition = ___SimpleCondition["SimpleCondition"];
  const ComplexCondition = ___ComplexCondition["ComplexCondition"];
  const InternalSinaError = ___core_errors["InternalSinaError"];
  const HierarchyDisplayType = ___HierarchyDisplayType["HierarchyDisplayType"];
  const DataSourceSubType = ___DataSourceType["DataSourceSubType"];
  const getText = ___i18n["getText"];
  class Filter extends SinaObject {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.getAllDataSource();
    //             }
    //         },
    //         searchTerm: {
    //             required: false,
    //             default: '',
    //             setter: true
    //         },
    //         rootCondition: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.createComplexCondition();
    //             },
    //             setter: true
    //         }
    //     }
    // },

    dataSource;
    searchTerm = "";
    rootCondition;
    constructor(properties) {
      super(properties);
      this.dataSource = properties.dataSource ?? this.sina.getAllDataSource();
      this.searchTerm = properties.searchTerm ?? this.searchTerm;
      this.rootCondition = properties.rootCondition ?? new ComplexCondition({
        sina: this.sina
      });
    }
    setSearchTerm(searchTerm) {
      this.searchTerm = searchTerm;
    }
    setRootCondition(rootCondition) {
      this.rootCondition = rootCondition;
      if (this.sina && !this.rootCondition.sina) {
        // pass sina recursively to condition tree
        // (rootCondition may have no sina because it was assembled by PublicSearchUtil before sina was created)
        this.rootCondition.setSina(this.sina);
      }
    }
    clone() {
      return new Filter({
        sina: this.sina,
        dataSource: this.dataSource,
        searchTerm: this.searchTerm,
        rootCondition: this.rootCondition.clone()
      });
    }
    equals(other) {
      return other instanceof Filter && this.dataSource === other.dataSource && this.searchTerm === other.searchTerm && this.rootCondition.equals(other.rootCondition);
    }
    _getAttribute(condition) {
      if (condition instanceof SimpleCondition) {
        return condition.attribute;
      }
      for (let i = 0; i < condition.conditions.length; ++i) {
        const attribute = this._getAttribute(condition.conditions[i]);
        if (attribute) {
          return attribute;
        }
      }
    }
    setDataSource(dataSource) {
      if (this.dataSource === dataSource) {
        return;
      }
      this.dataSource = dataSource;
      this.resetConditions();
    }
    resetConditions() {
      if (this.rootCondition instanceof ComplexCondition) {
        this.rootCondition.resetConditions();
      } else {
        throw new Error("Method is not applicable for SimpleCondition");
      }
    }
    autoInsertCondition(condition) {
      if (this.rootCondition instanceof ComplexCondition) {
        this.rootCondition.autoInsertCondition(condition);
      } else {
        throw new Error("Method is not applicable for SimpleCondition");
      }
    }
    autoRemoveCondition(condition) {
      if (this.rootCondition instanceof ComplexCondition) {
        this.rootCondition.autoRemoveCondition(condition);
      } else {
        throw new Error("Method is not applicable for SimpleCondition");
      }
    }
    isFolderMode() {
      // 1. check feature flag
      if (!this.sina.configuration?.folderMode) {
        return false;
      }
      // 2. check metadata
      // 2.1 check for hierarchy attribute in datsource
      const hierarchyAttributes = this.dataSource.attributesMetadata.filter(attribute => attribute.isHierarchy && attribute.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet);
      const hierarchyAttributeExists = hierarchyAttributes.length > 0;
      // 2.2 check whether datasource itself is a hierarchy datasource
      const isHierarchyDataSource = this.dataSource.isHierarchyDataSource && this.dataSource.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView;
      if (!hierarchyAttributeExists && !isHierarchyDataSource) {
        return false;
      }
      // 3. check datasource type
      if (this.dataSource.subType === DataSourceSubType.Filtered) {
        return false; // search mode
      }
      // 4. check query
      // 4.1 check folder filter conditions
      const folderAttribute = this.getFolderAttribute();
      const filterAttributes = this.rootCondition.getAttributes();
      const folderFilterAttributes = filterAttributes.filter(attribute => attribute === folderAttribute);
      const noneFolderFilterAttributes = filterAttributes.filter(attribute => attribute != folderAttribute);
      if (!this.sina.configuration.folderModeForInitialSearch) {
        if (folderFilterAttributes.length === 0) {
          return false;
        }
      }
      // 4.2 check search term
      if ((this.searchTerm.length === 0 || this.searchTerm.trim() === "*") && noneFolderFilterAttributes.length === 0) {
        return true; // folder mode
      } else {
        return false; // search mode
      }
    }
    getFolderAttribute() {
      // use case 1: we are displaying an hierarchy (helper) datasource
      if (this.dataSource.isHierarchyDataSource && this.dataSource.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView) {
        return this.dataSource.hierarchyAttribute;
      }
      // use case 2: we display a "regular" datasource with associatea hierarchy helper datasource
      const hierarchyAttributes = this.dataSource.attributesMetadata.filter(attribute => attribute.isHierarchy && attribute.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet);
      if (hierarchyAttributes.length === 0) {
        throw new InternalSinaError({
          message: getText("error.sina.hierarchyAttributesMissing")
        });
      }
      return hierarchyAttributes[0].id;
    }
    toJson() {
      return {
        dataSource: this.dataSource.toJson(),
        searchTerm: this.searchTerm,
        rootCondition: this.rootCondition.toJson()
      };
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.Filter = Filter;
  return __exports;
});
//# sourceMappingURL=Filter-dbg.js.map
