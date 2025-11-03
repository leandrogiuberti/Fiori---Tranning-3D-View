/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import { Event as JQueryEvent } from "jquery";
import Button from "sap/m/Button";
import FlexBox from "sap/m/FlexBox";
import IconTabBar from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";
import IllustratedMessage from "sap/m/IllustratedMessage";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import { BackgroundDesign, ButtonType, IconTabHeaderMode } from "sap/m/library";
import Control from "sap/ui/core/Control";
import AppsAdditionPanel from "./AppsAdditionPanel";
import BaseSettingsDialog from "./BaseSettingsDialog";
import BaseSettingsPanel from "./BaseSettingsPanel";
import InsightsAdditionPanel from "./InsightsAdditionPanel";
import { FESR_IDS } from "./utils/Constants";
import { addFESRSemanticStepName, FESR_EVENTS } from "./utils/FESRUtil";

/**
 *
 * Dialog class for My Home Content Addition.
 *
 * @extends BaseSettingsDialog
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.136
 * @private
 *
 * @alias sap.cux.home.ContentAdditionDialog
 */
export default class ContentAdditionDialog extends BaseSettingsDialog {
	private iconTabBar!: IconTabBar;
	private cancelButton!: Button;
	private panelsAdded!: boolean;
	private errorMessageContainer!: FlexBox;

	static renderer = {
		apiVersion: 2
	};

	/**
	 * Init lifecycle method
	 *
	 * @public
	 * @override
	 */
	public init(): void {
		super.init();

		//setup dialog
		this.setStretch(false);
		this.setContentWidth("59.375rem");
		this.setContentHeight("43.75rem");
		this.setVerticalScrolling(false);
		this.setTitle(this._i18nBundle.getText("addContent"));
		this.addStyleClass("sapCuxContentAdditionDialog");
		this.attachAfterClose(this.onDialogClose.bind(this));

		//setup panels
		this.addPanel(new AppsAdditionPanel(`${this.getId()}-appsAdditionPanel`));
		this.addPanel(new InsightsAdditionPanel(`${this.getId()}-cardsAdditionPanel`));

		//setup content
		this._setupDialogContent();
	}

	/**
	 * Sets up the dialog content with an icon tab bar and error message container.
	 *
	 * @private
	 */
	private _setupDialogContent(): void {
		this.iconTabBar = new IconTabBar(`${this.getId()}-iconTabBar`, {
			headerMode: IconTabHeaderMode.Inline,
			backgroundDesign: BackgroundDesign.Transparent,
			expandable: false,
			select: () => {
				this.setProperty("selectedKey", this.iconTabBar.getSelectedKey());
				this.updateActionButtons();
			}
		});
		this.errorMessageContainer = new FlexBox(`${this.getId()}-errorMessageContainer`, {
			direction: "Column",
			renderType: "Bare",
			height: "100%",
			justifyContent: "Center",
			items: [
				new IllustratedMessage(`${this.getId()}-errorMessage`, {
					illustrationSize: IllustratedMessageSize.Auto,
					illustrationType: IllustratedMessageType.NoData
				})
			]
		});

		const wrapper = new FlexBox(`${this.getId()}-wrapper`, {
			direction: "Column",
			renderType: "Bare",
			height: "100%",
			items: [this.iconTabBar, this.errorMessageContainer]
		});

		this.addContent(wrapper);
	}

	/**
	 * onBeforeRendering lifecycle method.
	 * Prepares the SettingsDialog content and navigate to the selected settings panel.
	 *
	 * @public
	 * @override
	 */
	public onBeforeRendering(event: JQueryEvent): void {
		super.onBeforeRendering(event);

		//add panels to icon tab bar
		void this._addPanelsToIconTabBar();

		//set selected key
		const selectedKey = (this.getProperty("selectedKey") as string) || (this.getPanels()[0]?.getProperty("key") as string);
		this.iconTabBar.setSelectedKey(selectedKey);

		//update action buttons to be displayed
		this.updateActionButtons();
	}

	/**
	 * Adds supported panels to the icon tab bar.
	 *
	 * @private
	 * @async
	 */
	private async _addPanelsToIconTabBar(): Promise<void> {
		if (!this.panelsAdded) {
			this.panelsAdded = true;
			const panels = this.getPanels();

			for (const panel of panels) {
				const isSupported = await panel.isSupported();
				if (!isSupported) {
					continue;
				}

				const key = panel.getProperty("key") as string;
				const iconTabFilter = new IconTabFilter(`${this.getId()}-${panel.getId()}-${key}`, {
					key,
					text: panel.getProperty("title") as string
				});

				const content = panel.getAggregation("content") as Control[] | undefined;
				content?.forEach((control) => iconTabFilter.addContent(control));

				this.iconTabBar.addItem(iconTabFilter);
				addFESRSemanticStepName(iconTabFilter, FESR_EVENTS.SELECT, panel.getProperty("key") as string);
			}

			const hasItems = this.iconTabBar.getItems().length > 0;
			this.iconTabBar.setVisible(hasItems);
			this.errorMessageContainer.setVisible(!hasItems);
		}
	}

	/**
	 * Retrieves a panel by its key from the dialog.
	 *
	 * @private
	 * @param {string} key - The key of the panel to retrieve.
	 * @returns {BaseSettingsPanel} The panel matching the provided key.
	 */
	private _getSelectedPanel(key: string): BaseSettingsPanel {
		let selectedPanel = this.getPanels().find((panel) => panel.getProperty("key") === key);
		if (!selectedPanel) {
			selectedPanel = this.getPanels()[0];
			this.setProperty("selectedKey", selectedPanel?.getProperty("key"));
		}
		return selectedPanel;
	}

	/**
	 * Updates the action buttons based on the selected panel.
	 *
	 * @private
	 */
	public updateActionButtons(): void {
		this.cancelButton =
			this.cancelButton ||
			new Button(`${this.getId()}-close-btn`, {
				text: this._i18nBundle.getText("XBUT_CANCEL"),
				type: ButtonType.Transparent,
				press: () => this.close()
			});
		addFESRSemanticStepName(this.cancelButton, FESR_EVENTS.PRESS, FESR_IDS.CANCEL_CONTENT_DIALOG);
		const selectedKey = this.getProperty("selectedKey") as string;
		this.removeAllButtons();

		// add action buttons from the selected panel
		this._getSelectedPanel(selectedKey)
			?.getActionButtons()
			.forEach((button) => {
				this.addButton(button);
			});

		// add cancel button as common action button
		this.addButton(this.cancelButton);
	}

	/**
	 * Handles the dialog close event and triggers panel cleanup.
	 *
	 * @private
	 */
	private onDialogClose(): void {
		this.getPanels().forEach((panel) => panel.fireEvent("onDialogClose"));
	}
}
