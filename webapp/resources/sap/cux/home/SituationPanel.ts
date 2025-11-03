/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Localization from "sap/base/i18n/Localization";
import GenericTile from "sap/m/GenericTile";
import Text from "sap/m/Text";
import TileContent from "sap/m/TileContent";
import { LoadState, URLHelper, ValueColor } from "sap/m/library";
import Event from "sap/ui/base/Event";
import Component from "sap/ui/core/Component";
import Control from "sap/ui/core/Control";
import Context from "sap/ui/model/Context";
import S4MyHome from "sap/ushell/api/S4MyHome";
import type { $ToDoPanelSettings } from "./ToDoPanel";
import ToDoPanel from "./ToDoPanel";
import ToDosContainer from "./ToDosContainer";
import {
	executeNavigation,
	fetchNavigationTargetData,
	getSituationMessage,
	InstanceAttribute,
	NavigationData
} from "./utils/SituationUtils";

interface Situation {
	SitnInstceKey: string;
	SitnInstceCreatedAtDateTime: string;
	SitnEngineType: string;
	_InstanceAttribute: InstanceAttribute[];
	_InstanceText: InstanceText;
	loadState?: LoadState;
}

interface InstanceText {
	SituationTitle: string;
	SituationText: string;
}

interface NavigationHelperError {
	_sErrorCode: string;
}

/**
 *
 * Panel class for managing and storing Situation cards.
 *
 * @extends ToDoPanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.SituationPanel
 */
export default class SituationPanel extends ToDoPanel {
	/**
	 * Constructor for a new Situation Panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $ToDoPanelSettings) {
		super(id, settings);
	}

	/**
	 * Init lifecycle method
	 *
	 * @private
	 * @override
	 */
	public init(): void {
		super.init();

		//Configure Header
		this.setProperty("key", "situations");
		this.setProperty("title", this._i18nBundle.getText("situationsTabTitle"));
	}

	/**
	 * Generates request URLs for fetching data based on the specified card count.
	 * Overridden method to provide situation-specific URLs.
	 *
	 * @private
	 * @override
	 * @param {number} cardCount - The number of cards to retrieve.
	 * @returns {string[]} An array of request URLs.
	 */
	public generateRequestUrls(cardCount: number): string[] {
		const language = Localization.getSAPLogonLanguage() || "";
		return [
			this.getCountUrl(),
			`${this.getDataUrl()}&$expand=_InstanceAttribute($expand=_InstanceAttributeValue($filter=(Language eq '${language}' or Language eq ''))),_InstanceText($filter=(Language eq '${language}' or Language eq ''))&$skip=0&$top=${cardCount}`
		];
	}

	/**
	 * Generates a card template for situations.
	 * Overridden method from To-Do panel to generate situation-specific card template.
	 *
	 * @private
	 * @override
	 * @param {string} id The ID for the template card.
	 * @param {Context} context The context object.
	 * @returns {Control} The generated card control template.
	 */
	public generateCardTemplate(id: string, context: Context): Control {
		return new GenericTile(`${id}-actionTile`, {
			mode: "ActionMode",
			frameType: "TwoByOne",
			pressEnabled: true,
			header: getSituationMessage(
				context.getProperty("_InstanceText/0/SituationTitle") as string,
				context.getProperty("_InstanceAttribute") as InstanceAttribute[]
			),
			headerImage: "sap-icon://alert",
			valueColor: ValueColor.Critical,
			state: context.getProperty("loadState") as LoadState,
			press: (event: Event) => {
				void this._onPressSituation(event);
			},
			tileContent: [
				new TileContent(`${id}-actionTileContent`, {
					content: new Text(`${id}-text`, {
						text: getSituationMessage(
							context.getProperty("_InstanceText/0/SituationText") as string,
							context.getProperty("_InstanceAttribute") as InstanceAttribute[]
						)
					}),
					footer: S4MyHome.formatDate(context.getProperty("SitnInstceCreatedAtDateTime") as string)
				})
			]
		});
	}

	/**
	 * Handle the press event for a situation.
	 *
	 * @private
	 * @param {Event} event - The event object.
	 */
	private async _onPressSituation(event: Event): Promise<void> {
		const control = event.getSource<GenericTile>();
		const context = control.getBindingContext();
		const { loadState, SitnInstceKey: id, SitnEngineType } = context?.getObject() as Situation;
		const url = this.getTargetAppUrl();

		if (loadState !== LoadState.Loading && url) {
			if (id) {
				try {
					const navigationTargetData = (await fetchNavigationTargetData(id, SitnEngineType)) as NavigationData;
					await executeNavigation(
						navigationTargetData,
						Component.getOwnerComponentFor(this.getParent() as ToDosContainer) as Component
					);
				} catch (error: unknown) {
					if (
						error &&
						SitnEngineType === "1" &&
						(error as NavigationHelperError)._sErrorCode === "NavigationHandler.isIntentSupported.notSupported"
					) {
						// Navigate to the situations app
						URLHelper.redirect(this.getTargetAppUrl(), false);
					}
				}
			} else {
				URLHelper.redirect(url, false);
			}
		}
	}

	/**
	 * Get the text for the "No Data" message.
	 *
	 * @private
	 * @returns {string} The text for the "No Data" message.
	 */
	public getNoDataText(): string {
		return this._i18nBundle.getText("noSituationTitle") as string;
	}
}
