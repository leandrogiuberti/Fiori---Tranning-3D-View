/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import HTML from "sap/ui/core/HTML";
import RenderManager from "sap/ui/core/RenderManager";
import BaseContainer from "./BaseContainer";
import BasePanel from "./BasePanel";
import { OrientationType } from "./library";
import Control from "sap/ui/core/Control";

const renderPanel = (rm: RenderManager, control: BaseContainer, panel: BasePanel) => {
	if (!panel.getVisible()) {
		return;
	}

	const orientation = control.getProperty("orientation") as OrientationType;
	const isSideBySide = orientation === OrientationType.SideBySide;

	rm.openStart("div", panel.getId()).class("sapUiBasePanel").openEnd();

	if (!isSideBySide) {
		// render panel header
		rm.renderControl(control.getPanelHeader(panel));
	}

	//render panel content
	panel.getContent().forEach((content: Control) => {
		rm.renderControl(content);
	});

	rm.close("div");
};

/**
 * Renders custom loader based on container type.
 */
const renderCustomPlaceholder = (rm: RenderManager, control: BaseContainer) => {
	try {
		const placeholder = control.getAggregation("_placeholder") as HTML;
		if (!placeholder) {
			rm.openStart("div", control.getId() + "-placeholder")
				.class("sapUiBaseContainerPlaceholder")
				.openEnd()
				.close("div");
			return;
		}
		rm.renderControl(placeholder);
	} catch (error) {
		Log.error("Failed to render placeholder:", error as string);
	}
};

export default {
	apiVersion: 2,

	/**
	 * Renders the control.
	 *
	 * @public
	 * @override
	 * @param {RenderManager} rm - The RenderManager object.
	 * @param {BaseContainer} control - The BaseContainer control to be rendered.
	 */
	render: function (rm: RenderManager, control: BaseContainer) {
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
		const isLazyLoadEnabled = control.getProperty("enableLazyLoad") as boolean;
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
	renderContent: function (rm: RenderManager, control: BaseContainer) {
		if (control.getContent()?.length > 0) {
			//render header
			rm.openStart("div", control.getId() + "-header")
				.class("sapUiBaseContainerHeader")
				.openEnd();
			rm.renderControl(control._getHeader());
			rm.close("div");

			//render inner control only if orientation is SideBySide
			const orientation = control.getProperty("orientation") as OrientationType;
			const isSideBySide = orientation === OrientationType.SideBySide;

			//render content
			rm.openStart("div", control.getId() + "-content")
				.class("sapUiBaseContainerContent")
				.class(`sapUiOrientation${orientation}`)
				.openEnd();
			if (isSideBySide) {
				rm.renderControl(control._getInnerControl());
			} else {
				//render individual panels
				control.getContent().forEach((panel: BasePanel) => renderPanel(rm, control, panel));
			}

			rm.close("div");
		}
	}
};
