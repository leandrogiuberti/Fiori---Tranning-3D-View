/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SearchFacetHierarchyStaticTreeItem", "sap/m/Label", "sap/m/library", "sap/ui/core/Icon", "sap/m/FlexBox", "../../../tree/TreeView", "sap/m/FlexItemData", "sap/m/VBox"], function (__SearchFacetHierarchyStaticTreeItem, Label, sap_m_library, Icon, FlexBox, __TreeView, FlexItemData, VBox) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const SearchFacetHierarchyStaticTreeItem = _interopRequireDefault(__SearchFacetHierarchyStaticTreeItem);
  const FlexAlignItems = sap_m_library["FlexAlignItems"];
  const FlexJustifyContent = sap_m_library["FlexJustifyContent"];
  const ListType = sap_m_library["ListType"];
  const TreeView = _interopRequireDefault(__TreeView);
  /**
   * Hierarchy facet (static)
   *
   * The SearchFacetHierarchyStatic control is used for displaying static hierarchy facets.
   * Corresponding model objects:
   * - hierarchystatic/SearchHierarchyStaticFacet.js : facet with pointer to root hierarchy node
   * - hierarchystatic/SearchHierarchyStaticNode.js  : hierarchy node
   */
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchFacetHierarchyStatic = VBox.extend("sap.esh.search.ui.controls.SearchFacetHierarchyStatic", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      VBox.prototype.constructor.call(this, sId, options);
      this.addStyleClass("sapUshellSearchFacetContainer");
      // heading
      const header = new FlexBox({
        justifyContent: FlexJustifyContent.SpaceBetween,
        alignItems: FlexAlignItems.Center,
        items: [new Label({
          text: "{title}"
        })]
      });
      header.addStyleClass("sapUshellSearchFacetHeader");
      this.addItem(header);
      // tree
      const treeView = new TreeView("", {
        treeNodeFactory: "{treeNodeFactory}",
        items: {
          path: "rootTreeNode/childTreeNodes",
          factory: this.createTreeItem.bind(this)
        }
      });
      this.addItem(treeView);
      treeView.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
      this.bindProperty("visible", {
        parts: [{
          path: "rootTreeNode/childTreeNodes/length"
        }],
        formatter: () => {
          const facet = this.getBindingContext().getObject();
          const childTreeNodes = facet?.rootTreeNode?.childTreeNodes;
          if (!childTreeNodes) {
            return false;
          }
          const realTreeNodes = childTreeNodes.filter(treeNode => treeNode.id !== "dummy");
          return realTreeNodes.length > 0;
        }
      });
    },
    createTreeItem: function _createTreeItem(sId, oContext) {
      // label
      const treeItemLabel = new Label({
        text: "{label}",
        width: "100%"
      });
      treeItemLabel.setLayoutData(new FlexItemData({
        growFactor: 1
      }));
      treeItemLabel.addStyleClass("sapUshellSearchHierarchyFacetItemLabel");
      const treeNode = oContext.getObject();
      // icon
      const treeItemIcon = new Icon("", {
        src: "{icon}"
      });
      treeItemIcon.addStyleClass("sapUshellSearchHierarchyFacetItemIcon");
      treeItemIcon.setLayoutData(new FlexItemData({
        growFactor: 0
      }));

      // flex box containing label + icon
      const treeItemFlex = new FlexBox("", {
        items: [treeItemIcon, treeItemLabel],
        width: "100%"
      });
      // tree item containing flex box
      const treeItem = new SearchFacetHierarchyStaticTreeItem("", {
        content: treeItemFlex,
        selectLine: "{hasFilter}"
      });
      treeItem.attachPress(() => {
        treeNode.toggleFilter();
      });
      treeItem.setType(ListType.Active);
      return treeItem;
    }
  });
  return SearchFacetHierarchyStatic;
});
//# sourceMappingURL=SearchFacetHierarchyStatic-dbg.js.map
