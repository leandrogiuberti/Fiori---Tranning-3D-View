/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "./library"], function (Log, ___library) {
  "use strict";

  const OrientationType = ___library["OrientationType"];
  const renderPanel = (rm, control, panel) => {
    if (!panel.getVisible()) {
      return;
    }
    const orientation = control.getProperty("orientation");
    const isSideBySide = orientation === OrientationType.SideBySide;
    rm.openStart("div", panel.getId()).class("sapUiBasePanel").openEnd();
    if (!isSideBySide) {
      // render panel header
      rm.renderControl(control.getPanelHeader(panel));
    }

    //render panel content
    panel.getContent().forEach(content => {
      rm.renderControl(content);
    });
    rm.close("div");
  };

  /**
   * Renders custom loader based on container type.
   */
  const renderCustomPlaceholder = (rm, control) => {
    try {
      const placeholder = control.getAggregation("_placeholder");
      if (!placeholder) {
        rm.openStart("div", control.getId() + "-placeholder").class("sapUiBaseContainerPlaceholder").openEnd().close("div");
        return;
      }
      rm.renderControl(placeholder);
    } catch (error) {
      Log.error("Failed to render placeholder:", error);
    }
  };
  var __exports = {
    apiVersion: 2,
    /**
     * Renders the control.
     *
     * @public
     * @override
     * @param {RenderManager} rm - The RenderManager object.
     * @param {BaseContainer} control - The BaseContainer control to be rendered.
     */
    render: function (rm, control) {
      rm.openStart("div", control).class("sapCuxBaseContainer");

      //Apply Layout based style classes
      if (control.getProperty("orientation") === OrientationType.SideBySide) {
        rm.class("sapCuxSideBySide");
      } else if (control.getProperty("orientation") === OrientationType.Horizontal) {
        rm.class("sapCuxHorizontal");
      } else {
        rm.class("sapCuxVertical");
      }

      //update width and height
      rm.style("width", control.getWidth());
      rm.style("height", control.getHeight());
      rm.openEnd();

      //render content only if it is loaded, render placeholder otherwise
      const isLazyLoadEnabled = control.getProperty("enableLazyLoad");
      if (!isLazyLoadEnabled || control.getProperty("loaded")) {
        this.renderContent(rm, control);
      } else {
        renderCustomPlaceholder(rm, control);
      }
      rm.close("div");
    },
    /**
     * Renders the content of the control.
     *
     * @private
     * @param {RenderManager} rm - The RenderManager object.
     * @param {BaseContainer} control - The BaseContainer control.
     */
    renderContent: function (rm, control) {
      if (control.getContent()?.length > 0) {
        //render header
        rm.openStart("div", control.getId() + "-header").class("sapUiBaseContainerHeader").openEnd();
        rm.renderControl(control._getHeader());
        rm.close("div");

        //render inner control only if orientation is SideBySide
        const orientation = control.getProperty("orientation");
        const isSideBySide = orientation === OrientationType.SideBySide;

        //render content
        rm.openStart("div", control.getId() + "-content").class("sapUiBaseContainerContent").class(`sapUiOrientation${orientation}`).openEnd();
        if (isSideBySide) {
          rm.renderControl(control._getInnerControl());
        } else {
          //render individual panels
          control.getContent().forEach(panel => renderPanel(rm, control, panel));
        }
        rm.close("div");
      }
    }
  };
  return __exports;
});
//# sourceMappingURL=BaseContainerRenderer-dbg.js.map
