/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/esh/search/ui/SearchHelper", "sap/m/Link", "../sinaNexTS/sina/NavigationTarget", "../uiConstants"], function (SearchHelper, Link, ___sinaNexTS_sina_NavigationTarget, ___uiConstants) {
  "use strict";

  const NavigationTarget = ___sinaNexTS_sina_NavigationTarget["NavigationTarget"];
  const initialValueUnicode = ___uiConstants["initialValueUnicode"]; // reduced sina-NavigationTarget ()
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchLink = Link.extend("sap.esh.search.ui.controls.SearchLink", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        navigationTarget: {
          type: "object",
          group: "Data"
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Link.prototype.constructor.call(this, sId, settings);
      this._pressHandlerAttached = false;
      this.addStyleClass("sapUshellSearchLink");
    },
    pressHandlerSearchLink: function _pressHandlerSearchLink(oEvent) {
      const navTarget = this.getNavigationTarget();
      const model = this.getModel();
      if (model && model.config?.clearObjectSelectionOnSearchLinkClick) {
        this.getModel().resetKeyStore();
      }
      if (navTarget.targetUrl) {
        // 1) navigation target has target url
        // - navigation itself is performed by clicking on <a> tag
        // - performNavigation is just called for tracking
        navTarget.performNavigation({
          trackingOnly: true,
          event: oEvent
        });
      } else {
        // 2) no target url instead there is a js target function
        // performNavigation does tracking + navigation (window.open...)
        oEvent.preventDefault(); // really necessary?
        navTarget.performNavigation({
          event: oEvent
        });
      }
      // oEvent.preventDefault does work for
      // -desktop
      // -mobile in case targetUrl=empty
      // oEvent.preventDefault does not work for mobile in case targetUrl is filled
      // reason: for mobile there is a UI5 async event simulation so preventDefault does not work
      // for sap.m.Link this a special logic which makes preventDefault working for mobile in case
      // targetUrl=empty (href='#')
    },
    setNavigationTarget: function _setNavigationTarget(navigationTarget) {
      this.setProperty("navigationTarget", navigationTarget);

      // calculate enabled
      const text = this.getText();
      if ((typeof navigationTarget?.targetUrl !== "string" || navigationTarget?.targetUrl?.length === 0) && typeof navigationTarget?.targetFunction !== "function" || !(typeof text === "string" && text !== initialValueUnicode) // dash
      ) {
        this.setProperty("enabled", false);
      } else {
        this.setProperty("enabled", true);
      }

      // set href
      const navigationTargetHref = navigationTarget?.targetUrl;
      if (typeof navigationTargetHref === "string" && navigationTargetHref?.length > 0) {
        this.setProperty("href", navigationTargetHref);
      } else {
        this.setProperty("href", "");
      }

      // set target
      const navigationTargetTarget = navigationTarget?.target;
      if (typeof navigationTargetTarget === "string" && navigationTargetTarget?.length > 0) {
        this.setProperty("target", navigationTargetTarget);
      } else {
        this.setProperty("target", "_self");
      }

      // set icon
      const navigationTargetIcon = navigationTarget?.icon;
      if (!this.getIcon() && typeof navigationTargetIcon === "string" && navigationTargetIcon?.length > 0) {
        this.setIcon(navigationTargetIcon);
      }

      // set tooltip
      const navigationTargetTooltip = navigationTarget?.tooltip;
      if (!this.getTooltip() && typeof navigationTargetTooltip === "string" && navigationTargetTooltip?.length > 0) {
        this.setTooltip(navigationTargetTooltip);
      }
      return this;
    },
    setText: function _setText(sText) {
      this.setProperty("text", sText);
      const navigationTarget = this.getNavigationTarget();
      if (!(navigationTarget instanceof NavigationTarget)) {
        return this;
      }
      if ((typeof navigationTarget?.targetUrl !== "string" || navigationTarget?.targetUrl?.length === 0) && typeof navigationTarget?.targetFunction !== "function" || !(typeof sText === "string" && sText !== initialValueUnicode) // dash
      ) {
        this.setProperty("enabled", false);
      }
      return this;
    },
    getNavigationTarget: function _getNavigationTarget() {
      return this.getProperty("navigationTarget");
    },
    setEnabled: function _setEnabled(bEnabled) {
      if (bEnabled === true) {
        const navigationTarget = this.getNavigationTarget();
        const text = this.getText();
        if (navigationTarget instanceof NavigationTarget && (typeof navigationTarget.targetUrl !== "string" || navigationTarget.targetUrl?.length === 0) && typeof navigationTarget.targetFunction !== "function" || !(typeof text === "string" && text !== initialValueUnicode) // dash
        ) {
          this.setProperty("enabled", false);
          return this;
        }
      }
      this.setProperty("enabled", bEnabled);
      return this;
    },
    setIcon: function _setIcon(sIcon) {
      if (!this.getIcon() && typeof sIcon === "string" && sIcon.startsWith("sap-icon://")) {
        Link.prototype.setIcon.call(this, sIcon);
      }
      return this;
    },
    onAfterRendering: function _onAfterRendering(oEvent) {
      Link.prototype.onAfterRendering.call(this, oEvent);
      if (this.isDestroyed()) {
        return;
      }
      if (!this._pressHandlerAttached) {
        this.attachPress(this.pressHandlerSearchLink, this);
        this._pressHandlerAttached = true;
      }
      const linkDomRef = this.getDomRef();
      // recover bold tag with the help of text() in a safe way
      SearchHelper.boldTagUnescaper(linkDomRef);
      SearchHelper.calculateTooltipForwordEllipsis(linkDomRef);
    },
    _handlePress: function _handlePress(oEvent) {
      // in case of highlighting the target property of the event is a <b> element inside the Link.
      // therefore setting it manually to Links DomRef / parentElement of the target.
      if (oEvent.target.localName === "b") {
        const oTarget = this.getDomRef() ? this.getDomRef() : oEvent.target.parentElement;
        oEvent.target = oTarget;
      }
      // eslint-disable-next-line prefer-rest-params
      Link.prototype["_handlePress"].apply(this, arguments);
    },
    // overwrite necessary because in sap.m.Link: Link.prototype.onsapenter = Link.prototype._handlePress;
    onsapenter: function _onsapenter(oEvent) {
      this._handlePress(oEvent);
    },
    // overwrite necessary because in sap.m.Link: Link.prototype.onsapenter = Link.prototype._handlePress;
    onclick: function _onclick(oEvent) {
      this._handlePress(oEvent);
    }
  });
  return SearchLink;
});
//# sourceMappingURL=SearchLink-dbg.js.map
