/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/library", "../converters/ManifestSettings"], function (library, ManifestSettings) {
  "use strict";

  var ActionType = ManifestSettings.ActionType;
  var OverflowToolbarPriority = library.OverflowToolbarPriority;
  /**
   * Utility functions for action processing and overflow protection
   */
  const ActionUtilities = {
    /**
     * Ensures primary actions never overflow by setting priority to NeverOverflow.
     * @param actions Array of actions to process
     * @returns Processed actions with primary action overflow protection
     */
    ensurePrimaryActionNeverOverflows(actions) {
      return actions.map(action => !this.isPrimaryAction(action) ? action : {
        ...action,
        priority: OverflowToolbarPriority.NeverOverflow
      });
    },
    /**
     * Determines if an action is a primary action.
     * @param action Action to check
     * @returns True if action is primary
     */
    isPrimaryAction(action) {
      // Check if action is primary
      return action.type === ActionType.Primary;
    }
  };
  return ActionUtilities;
}, false);
//# sourceMappingURL=ActionUtilities-dbg.js.map
