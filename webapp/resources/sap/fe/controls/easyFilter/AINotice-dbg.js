/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/Link", "sap/m/OverflowToolbar", "sap/m/Popover", "sap/m/Text", "sap/m/ToolbarSpacer", "sap/m/VBox", "sap/m/library", "sap/ui/core/Lib", "sap/fe/base/jsx-runtime/jsx", "sap/fe/base/jsx-runtime/jsxs", "sap/fe/base/jsx-runtime/Fragment"], function (Button, Link, OverflowToolbar, Popover, Text, ToolbarSpacer, VBox, library, Lib, _jsx, _jsxs, _Fragment) {
  "use strict";

  var _exports = {};
  var PlacementType = library.PlacementType;
  var ButtonType = library.ButtonType;
  const resourceBundle = Lib.getResourceBundleFor("sap.fe.controls");

  /**
   * @param titleText The title of the AI notice popover
   * @returns A Popover component containing the AI notice text and a close button
   */

  function AIPopoverContent() {
    const $aiNoticePopover = _jsx(Popover, {
      contentWidth: "22.8125rem",
      showArrow: true,
      showHeader: true,
      placement: PlacementType.Auto,
      title: resourceBundle.getText("M_EASY_FILTER_POPOVER_AI_TITLE"),
      children: {
        content: _jsxs(VBox, {
          children: [_jsx(Text, {
            class: "sapFeControlsAiPopoverText1",
            text: resourceBundle.getText("M_EASY_FILTER_POPOVER_AI_TEXT_1")
          }), _jsx(Text, {
            class: "sapFeControlsAiPopoverText2",
            text: resourceBundle.getText("M_EASY_FILTER_POPOVER_AI_TEXT_2")
          })]
        }),
        footer: _jsx(OverflowToolbar, {
          children: {
            content: _jsxs(_Fragment, {
              children: [_jsx(ToolbarSpacer, {}), _jsx(Button, {
                text: resourceBundle.getText("M_EASY_FILTER_POPOVER_CLOSE"),
                press: () => {
                  $aiNoticePopover?.close();
                }
              })]
            })
          }
        })
      }
    });
    return $aiNoticePopover;
  }

  /**
   * Tiny component to display a link that opens a popover with the AI notice.
   * @param props
   * @param props.resourceBundle
   * @returns The AI Notice component
   */
  _exports.AIPopoverContent = AIPopoverContent;
  function AINotice(props) {
    return _jsx(Button, {
      text: props.resourceBundle.getText("M_EASY_FILTER_FILTER_SET_AI"),
      icon: "sap-icon://ai",
      type: ButtonType.Transparent,
      press: e => {
        const $disclaimerPopover = AIPopoverContent();
        $disclaimerPopover.openBy(e.getSource());
      }
    });
  }

  /**
   * @param title The title of the AI notice popover
   * @param description The description text of the AI notice popover
   * @param text The text of the button in the AI notice popover
   * @returns The AI Notice link component that opens a popover with the AI notice
   */
  _exports.AINotice = AINotice;
  function AILinkNotice() {
    return _jsx(Link, {
      text: `${resourceBundle.getText("M_EASY_FILTER_POPOVER_AI_TITLE")}.`,
      press: e => {
        const $aiNoticePopover = AIPopoverContent();
        $aiNoticePopover.openBy(e.getSource());
      }
    });
  }
  _exports.AILinkNotice = AILinkNotice;
  return _exports;
}, false);
//# sourceMappingURL=AINotice-dbg.js.map
