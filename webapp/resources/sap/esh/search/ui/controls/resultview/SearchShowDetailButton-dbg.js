/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/m/Button", "../../UIEvents", "sap/ui/core/EventBus"], function (Button, __UIEvents, EventBus) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const UIEvents = _interopRequireDefault(__UIEvents);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchShowDetailButton = Button.extend("sap.esh.search.ui.controls.SearchShowDetailButton", {
    metadata: {
      properties: {
        visualisation: {
          type: "string",
          defaultValue: "arrow" // "Button", "Arrow", "Hyperlink"
        }
      },
      aggregations: {
        _text: {
          type: "sap.m.Text",
          multiple: false
        },
        icon: {
          type: "sap.ui.core.Icon",
          multiple: false
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Button.prototype.constructor.call(this, sId, settings);
    },
    setVisualisation: function _setVisualisation(sVisualisation) {
      this.setProperty("visualisation", sVisualisation);
      return this;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    press: function _press(oEvent) {
      const model = this.getModel();
      // notify subscribers
      model.notifySubscribers(UIEvents.ESHShowResultDetail);
      EventBus.getInstance().publish(UIEvents.ESHShowResultDetail, this);
    }
  });
  return SearchShowDetailButton;
});
//# sourceMappingURL=SearchShowDetailButton-dbg.js.map
