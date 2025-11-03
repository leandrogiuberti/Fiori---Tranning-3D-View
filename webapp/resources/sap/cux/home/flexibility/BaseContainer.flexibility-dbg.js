/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/fl/changeHandler/HideControl", "sap/ui/fl/changeHandler/UnhideControl", "./Layout.flexibility"], function (HideControl, UnHideControl, ___Layoutflexibility) {
  "use strict";

  const CHANGE_TYPES = ___Layoutflexibility["CHANGE_TYPES"];
  var Action = /*#__PURE__*/function (Action) {
    Action["applyChange"] = "applyChange";
    Action["revertChange"] = "revertChange";
    return Action;
  }(Action || {});
  const resetLayoutSections = function (changeType, action, change, control, propertyBag) {
    try {
      const genericChange = changeType;
      return Promise.resolve(genericChange[action](change, control, propertyBag)).then(function () {
        // Reset sections to update the layout
        control.getParent().resetSections?.();
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var __exports = {
    [CHANGE_TYPES.HIDE]: {
      layers: {
        USER: true
      },
      changeHandler: {
        ...HideControl,
        applyChange: function (change, control, propertyBag) {
          try {
            return Promise.resolve(resetLayoutSections(HideControl, Action.applyChange, change, control, propertyBag)).then(function () {});
          } catch (e) {
            return Promise.reject(e);
          }
        },
        revertChange: function (change, control, propertyBag) {
          try {
            return Promise.resolve(resetLayoutSections(HideControl, Action.revertChange, change, control, propertyBag)).then(function () {});
          } catch (e) {
            return Promise.reject(e);
          }
        }
      }
    },
    [CHANGE_TYPES.UNHIDE]: {
      layers: {
        USER: true
      },
      changeHandler: {
        ...UnHideControl,
        applyChange: function (change, control, propertyBag) {
          try {
            return Promise.resolve(resetLayoutSections(UnHideControl, Action.applyChange, change, control, propertyBag)).then(function () {});
          } catch (e) {
            return Promise.reject(e);
          }
        },
        revertChange: function (change, control, propertyBag) {
          try {
            return Promise.resolve(resetLayoutSections(UnHideControl, Action.revertChange, change, control, propertyBag)).then(function () {});
          } catch (e) {
            return Promise.reject(e);
          }
        }
      }
    }
  };
  return __exports;
});
//# sourceMappingURL=BaseContainer.flexibility-dbg.js.map
