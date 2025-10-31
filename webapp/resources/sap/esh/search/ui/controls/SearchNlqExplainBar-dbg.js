/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../i18n", "sap/m/Toolbar", "sap/m/library", "sap/m/Button", "sap/m/Popover", "sap/m/FormattedText", "sap/m/Link", "sap/m/ToolbarSpacer", "sap/m/MessageToast"], function (__i18n, Toolbar, sap_m_library, Button, Popover, FormattedText, Link, ToolbarSpacer, MessageToast) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const PlacementType = sap_m_library["PlacementType"];
  const ToolbarDesign = sap_m_library["ToolbarDesign"];
  class SearchNlqExplainBar extends Toolbar {
    _aiPopover;
    _nlqViewAllPopover;
    _nlqExplainText;
    constructor(sId, settings) {
      super(sId, settings);

      // Set the blue bar style
      this.setProperty("design", ToolbarDesign.Info);
      this.addStyleClass("sapUshellSearchNlqExplainBar");

      // Create popovers
      this._aiPopover = this.assembleAiPopover();
      this._nlqViewAllPopover = this.assembleNlqViewAllPopover();
      const nlqExplainButton = new Button(this.getId() + "-nlqExplainButton", {
        icon: "sap-icon://ai",
        tooltip: "{i18n>nlqExplainButtonTooltip}",
        press: () => {
          this._aiPopover.openBy(nlqExplainButton);
        }
      });
      nlqExplainButton.addStyleClass("sapUshellSearchNlqExplainButton");
      this.addContent(nlqExplainButton);
      const nlqExplainText = new FormattedText(this.getId() + "-nlqExplainText", {
        htmlText: {
          parts: [{
            path: "/nlqResult/filterDescription"
          }],
          formatter: sFilterDesc => {
            if (!sFilterDesc) {
              return i18n.getText("nlqNoFilter");
            }

            // Replace br tags with spaces
            let result = sFilterDesc.replace(/<br\s*\/?>/gi, " ");
            // Remove all HTML tags except strong and em
            result = result.replace(/<(?!\/?(?:strong|em)\b)[^>]*>/gi, "");
            return result;
          }
        }
      }).addStyleClass("sapUshellSearchNlqFilterFormattedTextEllipsis");

      // store the reference
      this._nlqExplainText = nlqExplainText;
      this.addContent(nlqExplainText);
      const toolbarSpacer = new ToolbarSpacer(this.getId() + "-nlqExplainToolbarSpacer", {});
      this.addContent(toolbarSpacer);
      const nlqExplainFilterLink = new Link(this.getId() + "-nlqExplainFilterLink", {
        text: "View All",
        tooltip: "{i18n>nlqExplainButtonTooltip}",
        press: () => {
          this._nlqViewAllPopover.setModel(this.getModel());
          this._nlqViewAllPopover.setModel(this.getModel("i18n"), "i18n");
          this._nlqViewAllPopover.openBy(nlqExplainFilterLink);
        }
      });
      nlqExplainFilterLink.addStyleClass("sapUshellSearchNlqExplainLink");
      this.addContent(nlqExplainFilterLink);
      this.assembleNlqFilterCopyButton();
    }
    assembleNlqViewAllPopover() {
      const filterDescription = new FormattedText({
        htmlText: {
          parts: [{
            path: "/nlqResult/filterDescription"
          }],
          formatter: desc => {
            if (!desc) {
              return i18n.getText("nlqNoFilter");
            }
            return desc;
          }
        }
      });
      filterDescription.addStyleClass("sapUiSmallMargin");
      const popover = new Popover({
        showHeader: false,
        content: [filterDescription],
        placement: PlacementType.Bottom
      });
      popover.addStyleClass("sapUshellSearchNlqExplainPopover");
      return popover;
    }
    assembleAiPopover() {
      const staticText = new FormattedText({
        htmlText: "Results on this page have been filtered by artificial intelligence (AI) technologies.<br>" + "<br>Verify results before use."
      });
      staticText.addStyleClass("sapUiSmallMargin");
      const closeButton = new Button({
        text: "Close",
        press: () => {
          this._aiPopover.close();
        }
      });
      const popover = new Popover({
        title: "Created with AI",
        content: [staticText],
        placement: PlacementType.Bottom,
        contentWidth: "400px",
        footer: new Toolbar({
          design: ToolbarDesign.Auto,
          content: [new ToolbarSpacer(), closeButton]
        })
      });
      popover.addStyleClass("sapUshellSearchNlqExplainPopover");
      return popover;
    }
    assembleNlqFilterCopyButton() {
      const nlqExplainFilterButton = new Button(this.getId() + "-nlqExplainFilterCopyButton", {
        icon: "sap-icon://copy",
        type: "Transparent",
        tooltip: "{i18n>nlqcopyText}",
        press: () => {
          const domRef = this._nlqExplainText.getDomRef();
          const text = (domRef?.textContent || "").replace(/\s+/g, " ").trim();

          // Copy to clipboard
          if (window.navigator.clipboard) {
            window.navigator.clipboard.writeText(text).then(() => {
              MessageToast.show("Copied to clipboard");
            }).catch(err => {
              MessageToast.show("Copy failed: " + err);
            });
          } else {
            MessageToast.show("Clipboard API not available");
          }
        }
      });
      this.addContent(nlqExplainFilterButton);
    }
    static renderer = {
      apiVersion: 2
    };
  }
  return SearchNlqExplainBar;
});
//# sourceMappingURL=SearchNlqExplainBar-dbg.js.map
