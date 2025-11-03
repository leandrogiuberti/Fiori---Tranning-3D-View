/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../i18n", "sap/m/Toolbar", "sap/m/library", "sap/m/Button", "sap/m/ToolbarLayoutData", "sap/m/ToolbarSpacer", "sap/m/ActionSheet", "sap/ui/core/InvisibleText", "sap/ui/core/IconPool", "sap/ui/core/delegate/ItemNavigation", "sap/ui/core/Control", "../../sinaNexTS/sina/NavigationTarget", "../SearchLink"], function (__i18n, Toolbar, sap_m_library, Button, ToolbarLayoutData, ToolbarSpacer, ActionSheet, InvisibleText, IconPool, ItemNavigation, Control, ____sinaNexTS_sina_NavigationTarget, __SearchLink) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const ToolbarDesign = sap_m_library["ToolbarDesign"];
  const ButtonType = sap_m_library["ButtonType"];
  const PlacementType = sap_m_library["PlacementType"];
  const NavigationTarget = ____sinaNexTS_sina_NavigationTarget["NavigationTarget"];
  const SearchLink = _interopRequireDefault(__SearchLink);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchRelatedObjectsToolbar = Control.extend("sap.esh.search.ui.controls.SearchRelatedObjectsToolbar", {
    renderer: {
      apiVersion: 2,
      render(oRm, oControl) {
        oRm.openStart("div", oControl);
        oRm.class("sapUshellSearchResultListItem-RelatedObjectsToolbar");
        const oModel = oControl.getModel();
        if (oModel.config.optimizeForValueHelp) {
          oRm.class("sapUshellSearchResultListItem-RelatedObjectsToolbarValueHelp");
        }
        oRm.openEnd();
        oRm.renderControl(oControl.getAggregation("_ariaDescriptionForLinks"));
        oControl._renderToolbar(oRm, oControl);
        oRm.close("div");
      }
    },
    metadata: {
      properties: {
        itemId: "string",
        navigationObjects: {
          type: "object",
          multiple: true
        },
        positionInList: "int"
      },
      aggregations: {
        _relatedObjectActionsToolbar: {
          type: "sap.m.Toolbar",
          multiple: false,
          visibility: "hidden"
        },
        _ariaDescriptionForLinks: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Control.prototype.constructor.call(this, sId, settings);
      const relatedObjectActionsToolbar = new Toolbar(`${this.getId()}--toolbar`, {
        design: ToolbarDesign.Solid
      });
      relatedObjectActionsToolbar.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
      relatedObjectActionsToolbar.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Toolbar");
      relatedObjectActionsToolbar.addEventDelegate({
        onAfterRendering: this.layoutToolbarElements.bind(this)
      });
      this.setAggregation("_relatedObjectActionsToolbar", relatedObjectActionsToolbar);
      this.setAggregation("_ariaDescriptionForLinks", new InvisibleText({
        text: i18n.getText("result_list_item_aria_has_more_links")
      }));
      window.addEventListener("resize", () => {
        this.layoutToolbarElements();
      });
    },
    exit: function _exit(...args) {
      if (Control.prototype.exit) {
        // check whether superclass implements the method
        Control.prototype.exit.apply(this, args); // call the method with the original arguments
      }
      this._overFlowActionSheet?.destroy();
    },
    _renderToolbar: function _renderToolbar(oRm, oControl) {
      const oModel = oControl.getModel();
      const _relatedObjectActionsToolbar = oControl.getAggregation("_relatedObjectActionsToolbar");
      _relatedObjectActionsToolbar.destroyContent();
      if (oModel.config.optimizeForValueHelp) {
        _relatedObjectActionsToolbar.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-ToolbarValueHelp");
      }
      const navigationObjects = oControl.getProperty("navigationObjects");
      if (Array.isArray(navigationObjects) && navigationObjects.length > 0) {
        const navigationObjectsLinks = navigationObjects.map((navigationObject, i) => {
          const link = new SearchLink(`${oControl.getId()}--link_${i}`, {
            text: navigationObject?.text || "",
            navigationTarget: navigationObject,
            layoutData: new ToolbarLayoutData({
              shrinkable: false
            })
          });
          link.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Element");
          return link;
        });

        // 1. spacer
        const toolbarSpacer = new ToolbarSpacer();
        toolbarSpacer.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Spacer");
        _relatedObjectActionsToolbar.addContent(toolbarSpacer);

        // 2. navigation objects
        navigationObjectsLinks.forEach(link => {
          _relatedObjectActionsToolbar.addContent(link);
        });

        // 3. overFlowButton
        this._overFlowButton = new Button(`${this.getId()}--overflowButton`, {
          icon: IconPool.getIconURI("overflow")
        });
        this._overFlowButton.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-OverFlowButton");
        if (oModel.config.optimizeForValueHelp) {
          this._overFlowButton.addStyleClass("sapUiSmallMarginBegin");
          this._overFlowButton.addStyleClass("sapUiTinyMarginEnd");
          this._overFlowButton.setType(ButtonType.Transparent);
        }
        _relatedObjectActionsToolbar.addContent(this._overFlowButton);

        // 4. overFlowActionSheet (items of overFlowButton)
        if (!this._overFlowActionSheet) {
          this._overFlowActionSheet = new ActionSheet(`${this.getId()}--actionSheet`, {
            placement: PlacementType.Top
          });
        }
        this._overFlowButton.attachPress(() => {
          if (this._overFlowActionSheet.isOpen()) {
            this._overFlowActionSheet.close();
          } else {
            this._overFlowActionSheet.openBy(this._overFlowButton);
          }
        });
        oRm.renderControl(_relatedObjectActionsToolbar);
      }
    },
    // after rendering
    // ===================================================================
    onAfterRendering: function _onAfterRendering() {
      if (this.getAggregation("_relatedObjectActionsToolbar")) {
        this._addAriaInformation();
      }
    },
    /**
     * Layout toolbar elements and move overflowing elements to the action sheet.
     * CAUTION: DO NOT CALL ANY UI5 METHODS HERE OR RERENDERING ENDLESS LOOP WILL HAPPEN!!!
     * @returns void
     */
    layoutToolbarElements: function _layoutToolbarElements() {
      if (this.isDestroyed() || this.isDestroyStarted()) {
        return;
      }
      const _relatedObjectActionsToolbar = this.getAggregation("_relatedObjectActionsToolbar");
      if (!(this.getDomRef() && _relatedObjectActionsToolbar.getDomRef())) {
        return;
      }
      const toolbarElem = this.getAggregation("_relatedObjectActionsToolbar").getDomRef();
      const toolbarWidth = toolbarElem.offsetWidth;
      if (getComputedStyle(this.getDomRef()).display === "none" || getComputedStyle(toolbarElem).display === "none") {
        return;
      }
      this.toolbarWidth = toolbarWidth;
      const overFlowButtonElem = this._overFlowButton.getDomRef();
      overFlowButtonElem.style.display = "none";
      let toolbarElementsWidth = 0;
      const pressButton = (event, _navigationObject) => {
        if (_navigationObject instanceof NavigationTarget) {
          _navigationObject.performNavigation({
            event: event
          });
        }
      };
      const toolbarElements = Array.from(toolbarElem.querySelectorAll(".sapUshellSearchResultListItem-RelatedObjectsToolbar-Element"));
      let element;
      for (let i = 0; i < toolbarElements.length; i++) {
        element = toolbarElements[i];
        element.style.display = "";
        const elementWidth = element.offsetWidth + parseInt(getComputedStyle(element).marginLeft) + parseInt(getComputedStyle(element).marginRight);
        const _toolbarElementsWidth = toolbarElementsWidth + elementWidth;
        if (_toolbarElementsWidth > toolbarWidth) {
          overFlowButtonElem.style.display = "";
          const overFlowButtonWidth = overFlowButtonElem.offsetWidth + parseInt(getComputedStyle(overFlowButtonElem).marginLeft) + parseInt(getComputedStyle(overFlowButtonElem).marginRight);
          for (; i >= 0; i--) {
            element = toolbarElements[i];
            toolbarElementsWidth -= element.offsetWidth + parseInt(getComputedStyle(element).marginLeft) + parseInt(getComputedStyle(element).marginRight);
            if (toolbarElementsWidth + overFlowButtonWidth <= toolbarWidth) {
              break;
            }
          }
          const navigationObjects = this.getProperty("navigationObjects");
          this._overFlowActionSheet.destroyButtons();
          i = i >= 0 ? i : 0;
          for (; i < toolbarElements.length; i++) {
            element = toolbarElements[i];
            element.style.display = "none";
            const navigationObject = navigationObjects[i];
            const button = new Button({
              text: navigationObject?.text || ""
            });
            button.attachPress(navigationObject, pressButton);
            this._overFlowActionSheet.addButton(button);
          }
          break;
        }
        toolbarElementsWidth = _toolbarElementsWidth;
      }
      if (this._overFlowActionSheet.getButtons().length === toolbarElements.length) {
        // this._setupItemNavigation(); // overflow button focusable, if all action buttons are part of overflow sheet (see config.optimizeForValueHelp)
      } else {
        this._setupItemNavigation(); // overflow button focusable, only if next to action buttons
      }
    },
    _setupItemNavigation: function _setupItemNavigation() {
      if (!this._theItemNavigation) {
        this._theItemNavigation = new ItemNavigation(null, []);
        this["addDelegate"](this._theItemNavigation);
      }
      this._theItemNavigation.setCycling(false);
      this._theItemNavigation.setRootDomRef(this.getDomRef());
      const itemDomRefs = [];
      const _relatedObjectActionsToolbar = this.getAggregation("_relatedObjectActionsToolbar");
      const content = _relatedObjectActionsToolbar.getContent();
      content.filter(item => item.hasStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Element")).forEach(item => {
        const domRef = item.getDomRef();
        if (domRef && !domRef.hasAttribute("tabindex")) {
          let tabindex = "-1";
          if (item["getPressed"] && item["getPressed"]()) {
            tabindex = "0";
          }
          domRef.setAttribute("tabindex", tabindex);
        }
        itemDomRefs.push(domRef);
      });
      const overFlowButtonDomRef = this._overFlowButton.getDomRef();
      overFlowButtonDomRef?.setAttribute("tabindex", "-1"); // sap.ui.core.delegate.ItemNavigation is very special, regarding tabindex value "1" / "-1"

      itemDomRefs.push(overFlowButtonDomRef);
      this._theItemNavigation.setItemDomRefs(itemDomRefs);
    },
    _addAriaInformation: function _addAriaInformation() {
      const toolbarElem = this.getAggregation("_relatedObjectActionsToolbar").getDomRef();
      const navigationLinks = Array.from(toolbarElem.querySelectorAll(".sapUshellSearchResultListItem-RelatedObjectsToolbar-Element"));
      const overFlowButtonElem = this._overFlowButton.getDomRef();
      const isOverFlowButtonVisible = overFlowButtonElem.offsetParent !== null;
      if (navigationLinks.length > 0 || isOverFlowButtonVisible) {
        const ariaDescriptionId = this.getAggregation("_ariaDescriptionForLinks").getId();
        navigationLinks.forEach(function (el) {
          let ariaDescription = el.getAttribute("aria-describedby") || "";
          ariaDescription += " " + ariaDescriptionId;
          el.setAttribute("aria-describedby", ariaDescription);
        });
        if (isOverFlowButtonVisible) {
          let ariaDescription = overFlowButtonElem.getAttribute("aria-describedby") || "";
          ariaDescription += " " + ariaDescriptionId;
          overFlowButtonElem.setAttribute("aria-describedby", ariaDescription);
        }
      }
    }
  });
  return SearchRelatedObjectsToolbar;
});
//# sourceMappingURL=SearchRelatedObjectsToolbar-dbg.js.map
