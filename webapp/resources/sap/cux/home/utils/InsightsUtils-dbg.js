/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Element", "./FESRUtil"], function (UI5Element, ___FESRUtil) {
  "use strict";

  const addFESRId = ___FESRUtil["addFESRId"];
  /**
   * Retrieves the associated full screen menu item.
   *
   * @returns {MenuItem} The associated full screen menu item.
   * @private
   */
  const getAssociatedFullScreenMenuItem = control => {
    return UI5Element.getElementById(control.getAssociation("fullScreenMenuItem", null));
  };

  /**
   * Retrieves the associated full screen button.
   *
   * @returns {Button} The associated full screen button.
   * @private
   *
   */
  const getAssociatedFullScreenButton = control => {
    return UI5Element.getElementById(control.getAssociation("fullScreenButton", null));
  };

  /**
   * Creates a "Show More" menu item.
   *
   * @private
   * @param {string} id - The ID of the menu item.
   * @param {string} [fesrId] - The FESR ID for the menu item.
   * @returns {MenuItem} The created MenuItem instance.
   */
  const createShowMoreMenuItem = (control, id, fesrId) => {
    const associatedFullScreenMenuItem = getAssociatedFullScreenMenuItem(control);
    const menuItem = associatedFullScreenMenuItem?.clone(id);
    if (fesrId) {
      addFESRId(menuItem, fesrId);
    }
    return menuItem;
  };

  /**
   * Creates a "Show More" action button.
   *
   * @private
   * @param {string} id - The ID of the button.
   * @param {string} [fesrId] - The FESR ID for the button.
   * @returns {Button} The created Button instance.
   */
  const createShowMoreActionButton = (control, id, fesrId) => {
    const associatedFullScreenButton = getAssociatedFullScreenButton(control);
    const actionButton = associatedFullScreenButton ? associatedFullScreenButton.clone(id) : null;
    if (fesrId && actionButton) {
      addFESRId(actionButton, fesrId);
    }
    return actionButton;
  };

  /**
   * Sort Menuitems based on the order provided
   *
   * @private
   * @param {string[]} menuItemOrder - The Ids of the menu item in the order in which to be sorted.
   * @param {MenuItem[]} menuItems- The menuitems list to be sorted.
   * @returns {MenuItem[]} The sorted MenuItems.
   */
  const sortMenuItems = (menuItemOrder, menuItems) => {
    return menuItems?.sort((a, b) => {
      const aId = a.getId();
      const bId = b.getId();
      const aIndex = menuItemOrder.findIndex(id => aId.includes(id));
      const bIndex = menuItemOrder.findIndex(id => bId.includes(id));
      return aIndex - bIndex;
    });
  };

  /**
   * Compares two intent objects to determine if they are equal.
   *
   * The function checks the following conditions:
   * 1. If both objects are empty (i.e., have no keys), they are considered equal.
   * 2. If both objects have keys, their `semanticObject` and `action` properties are compared for equality.
   * 3. If either object is `undefined` or the conditions above are not met, they are considered not equal.
   *
   * @param targetA - The first intent object to compare.
   * @param targetB - The second intent object to compare.
   * @returns `true` if the objects are considered equal, otherwise `false`.
   */
  const targetsAreEqual = (targetA, targetB) => {
    // Check if both are empty objects
    if (targetA && targetB) {
      if (Object.keys(targetA).length === 0 && Object.keys(targetB).length === 0) {
        return true;
      } else if (Object.keys(targetA).length && Object.keys(targetB).length) {
        return targetA.semanticObject === targetB.semanticObject && targetA.action === targetB.action;
      }
    }
    return false;
  };
  var __exports = {
    __esModule: true
  };
  __exports.getAssociatedFullScreenMenuItem = getAssociatedFullScreenMenuItem;
  __exports.getAssociatedFullScreenButton = getAssociatedFullScreenButton;
  __exports.createShowMoreMenuItem = createShowMoreMenuItem;
  __exports.createShowMoreActionButton = createShowMoreActionButton;
  __exports.sortMenuItems = sortMenuItems;
  __exports.targetsAreEqual = targetsAreEqual;
  return __exports;
});
//# sourceMappingURL=InsightsUtils-dbg.js.map
