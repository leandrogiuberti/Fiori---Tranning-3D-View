/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Button from "sap/m/Button";
import IllustratedMessage from "sap/m/IllustratedMessage";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import VBox from "sap/m/VBox";
import { MetadataOptions } from "sap/ui/core/Element";
import type { $BaseContainerSettings } from "./BaseContainer";
import BaseContainer from "./BaseContainer";
import BaseContainerRenderer from "./BaseContainerRenderer";
import BasePanel from "./BasePanel";
import Layout from "./Layout";
import { OrientationType } from "./library";

/**
 *
 * Panel class to show no data content.
 *
 */
class NoDataContentPanel extends BasePanel {
	/**
	 * Init lifecycle method
	 *
	 */
	public init() {
		super.init();
		this.setProperty("enableSettings", false);
	}
}

/**
 *
 * Container class to show no data content.
 *
 * @extends BaseContainer
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.NoDataContainer
 */
export default class NoDataContainer extends BaseContainer {
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Width of the container. Default value is 100%.
			 */
			width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%", visibility: "hidden" },
			/**
			 * Height of the container. Default value is 100%.
			 */
			height: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%", visibility: "hidden" },
			/**
			 * Orientation of the container. Default value is Vertical.
			 */
			orientation: {
				type: "sap.cux.home.OrientationType",
				group: "Data",
				defaultValue: OrientationType.Vertical,
				visibility: "hidden"
			},
			/**
			 * Enable my home settings. Default value is false.
			 */
			enableSettings: { type: "boolean", group: "Behavior", defaultValue: false, visibility: "hidden" }
		}
	};

	static renderer = {
		...BaseContainerRenderer,
		apiVersion: 2
	};

	constructor(id?: string | $BaseContainerSettings);
	constructor(id?: string, settings?: $BaseContainerSettings);
	/**
	 * Constructor for a new NoData Container.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $BaseContainerSettings) {
		super(id, settings);
	}

	/**
	 * Init lifecycle method
	 *
	 * @private
	 */
	public init(): void {
		super.init();
		this.addStyleClass("sapCuxNoDataContainer");
		this.addStyleClass("sapCuxNoMarginBottom");
	}

	/**
	 * onBeforeRendering lifecycle method
	 *
	 * @private
	 */
	public onBeforeRendering(): void {
		// If no content is set, set up default content
		const content = this.getContent();
		if (content?.length === 0) {
			this._setupDefaultContent();
		}

		super.onBeforeRendering();
	}

	/**
	 * Set up default no-data content for the container.
	 *
	 * @private
	 */
	private _setupDefaultContent(): void {
		// set up default inner illustrated message
		const illustratedMessage = new IllustratedMessage(this.getId() + "-noDataMessage", {
			illustrationSize: IllustratedMessageSize.Large,
			illustrationType: IllustratedMessageType.NoEntries,
			title: this._i18nBundle.getText("noSectionTitle"),
			ariaTitleLevel: "H2",
			description: this._i18nBundle.getText("noSectionDescription")
		}).addStyleClass("myHomeIllustratedMsg");

		// set up button to edit my home
		const editMyHomeButton = new Button(this.getId() + "-editMyHomeBtn", {
			text: this._i18nBundle.getText("noSectionButton"),
			type: "Emphasized",
			press: () => {
				void (this.getParent() as Layout)?.openSettingsDialog();
			}
		});
		illustratedMessage.insertAdditionalContent(editMyHomeButton, 0);

		// set up no-data content wrapper
		const wrapper = new VBox(this.getId() + "-noDataWrapper", {
			alignItems: "Center",
			justifyContent: "Center",
			renderType: "Bare",
			items: [illustratedMessage],
			visible: true
		});

		// set up content panel
		const contentPanel = new NoDataContentPanel(`${this.getId()}-noDataContent`);
		contentPanel.addContent(wrapper);

		// add content to the container
		this.addContent(contentPanel);
	}
}
