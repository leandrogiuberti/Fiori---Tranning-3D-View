/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/m/CustomTreeItem"], function (CustomTreeItem) {
  "use strict";

  /**
   * @namespace sap.esh.search.ui.tree
   */
  const TreeViewItem = CustomTreeItem.extend("sap.esh.search.ui.tree.TreeViewItem", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      CustomTreeItem.prototype.constructor.call(this, sId, options);
      this.data("esh-tree-node-id", "{id}", true);
    }
  });
  return TreeViewItem;
});
//# sourceMappingURL=TreeViewItem-dbg.js.map
