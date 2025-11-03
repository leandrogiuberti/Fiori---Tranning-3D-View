/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import GridContainer from "sap/f/GridContainer";
import GridContainerSettings from "sap/f/GridContainerSettings";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import GenericTile from "sap/m/GenericTile";
import HBox from "sap/m/HBox";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import Input from "sap/m/Input";
import Title from "sap/m/Title";
import Toolbar from "sap/m/Toolbar";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import { MetadataOptions } from "sap/ui/base/ManagedObject";
import Icon from "sap/ui/core/Icon";
import InvisibleText from "sap/ui/core/InvisibleText";
import Parameters from "sap/ui/core/theming/Parameters";
import Config from "sap/ushell/Config";
import Container from "sap/ushell/Container";
import Navigation from "sap/ushell/services/Navigation";
import App from "./App";
import AppsContainer from "./AppsContainer";
import BaseAppPersPanel from "./BaseAppPersPanel";
import Group, { Group$PressEvent } from "./Group";
import { ISectionAndVisualization } from "./interface/AppsInterface";
import { ISpace } from "./interface/PageSpaceInterface";
import type { $SpacePanelSettings } from "./SpacePanel";
import { getInvisibleText } from "./utils/Accessibility";
import { filterVisualizations, getPageManagerInstance } from "./utils/CommonUtils";
import { MYHOME_PAGE_ID } from "./utils/Constants";
import PageManager from "./utils/PageManager";
const _showAddApps = () => {
	return (Config.last("/core/shell/enablePersonalization") || Config.last("/core/catalog/enabled")) as boolean;
};

/**
 *
 * Provides the SpacePanel Class.
 *
 * @extends sap.cux.home.BaseAppPersPanel
 *
 * @author SAP SE
 * @version 0.0.1
 *
 * @private
 * @ui5-experimental-since 1.138.0
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.SpacePanel
 */
export default class SpacePanel extends BaseAppPersPanel {
	constructor(idOrSettings?: string | $SpacePanelSettings);
	constructor(id?: string, settings?: $SpacePanelSettings);
	/**
	 * Constructor for a new favorite app panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $SpacePanelSettings) {
		super(id, settings);
	}

	private _selectedGroupId: string | undefined;
	private _selectedPageId: string | undefined;
	private allSpaces!: ISpace[];
	private pageManager!: PageManager;

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		defaultAggregation: "apps",
		properties: {
			/**
			 * Specifies the space whose apps should be loaded.
			 */
			spaceId: { type: "string", group: "Data", defaultValue: "" },
			/**
			 * Title for the tiles panel
			 */
			title: { type: "string", group: "Misc", defaultValue: "" }
		},
		aggregations: {
			/**
			 * Apps aggregation for Favorite apps
			 */
			apps: { type: "sap.cux.home.App", singularName: "app", multiple: true, visibility: "hidden" },
			/**
			 * Group aggregation for Favorite apps
			 */
			groups: { type: "sap.cux.home.Group", singularName: "group", multiple: true, visibility: "hidden" }
		}
	};

	public init() {
		super.init();

		this.setProperty("key", "spacePanel");
		this.pageManager = getPageManagerInstance(this);

		this.attachPersistDialog(() => {
			// if while navigating to different page, a group detail dialog was open, then while navigating back group detail dialog should be in open state.
			if (this._selectedGroupId) {
				void this._showGroupDetailDialog(this._selectedGroupId, false, this._selectedPageId);
			}
		});
	}

	// /**
	//  * Sets the space ID for the panel and updates the title accordingly.
	//  * @param {string} spaceId - The ID of the space to set.
	//  * @returns {Promise<void>} A promise that resolves when the space ID is set.
	//  */
	// public async setSpaceId(spaceId: string): Promise<void> {
	// 	this.setProperty("spaceId", spaceId, true);

	// 	//update the panel title
	// 	this.allSpaces = this.allSpaces || await this.pageManager.fetchAllAvailableSpaces();
	// 	const space = this.allSpaces.find((space) => space.id === spaceId);
	// 	const title = space ? space.label : this._i18nBundle.getText("invalidSpaceTitle");
	// 	this.setProperty("title", title);
	// }

	/**
	 * Fetch apps and set apps aggregation
	 * @private
	 */
	public async loadApps() {
		const spaceId = this.getProperty("spaceId") as string;
		this.allSpaces = this.allSpaces || (await this.pageManager.fetchAllAvailableSpaces());
		const space = this.allSpaces.find((space) => space.id === spaceId);

		if (!space || space.children.length === 0) this.setApps([]);
		let allVisualizations: ISectionAndVisualization[] = [];

		if (space && space.children.length > 0) {
			for (const child of space.children) {
				const visualizations = await this.appManagerInstance.fetchFavVizs(true, false, child.id);
				allVisualizations.push(...visualizations);
			}
		}

		//Filter out static tiles
		allVisualizations = filterVisualizations(allVisualizations);

		//Create groups
		this.destroyAggregation("groups", true);
		const groupVisualizations = allVisualizations.filter((visualization) => visualization.isSection);
		const groups = this._generateGroups(groupVisualizations);
		this._setGroups(groups);

		//Create apps
		this.destroyAggregation("apps", true);
		const appVisualizations = allVisualizations.filter((visualization) => !visualization.isSection);
		const apps = this.generateApps(appVisualizations);
		this.setApps(apps);
		if (this._selectedGroupId) {
			void this._setGroupDetailDialogApps(this._selectedGroupId, this._selectedPageId);
		}
	}

	/**
	 * Creates and returns group instances for given group objects
	 * @private
	 * @param {object[]} aGroupObject - Array of group object.
	 * @returns {sap.cux.home.Group[]} - Array of group instances
	 */
	private _generateGroups(groupVisualizations: ISectionAndVisualization[]): Group[] {
		return groupVisualizations.map((groupVisualization, index) => {
			const bgColor =
				typeof groupVisualization.BGColor === "object" && "key" in groupVisualization.BGColor
					? groupVisualization.BGColor.key
					: groupVisualization.BGColor;
			const group = new Group(`${this.getId()}-group-${index}`, {
				title: groupVisualization.title,
				bgColor: bgColor,
				status: groupVisualization.status,
				icon: groupVisualization.icon,
				number: groupVisualization.badge,
				groupId: groupVisualization.id,
				pageId: groupVisualization.pageId,
				press: this._handleGroupPress.bind(this)
			});
			groupVisualization.menuItems?.forEach((oMenuItem) => {
				group.addAggregation("menuItems", oMenuItem);
			});
			return group;
		});
	}

	/**
	 * Add multiple groups in the groups aggregation.
	 * @private
	 * @param {sap.cux.home.Group[]} groups - Array of groups.
	 */
	private _setGroups(groups: Group[]) {
		groups.forEach((group) => {
			this.addAggregation("groups", group, true);
		});
	}

	/**
	 * Navigates to the App Finder with optional group Id.
	 * @async
	 * @private
	 * @param {string} [groupId] - Optional group Id
	 */
	private async navigateToAppFinder(groupId?: string, pageID: string = MYHOME_PAGE_ID) {
		const navigationService = await Container.getServiceAsync<Navigation>("Navigation");
		const navigationObject: { pageID: string; sectionID?: string } = {
			pageID
		};
		if (groupId) {
			navigationObject.sectionID = groupId;
		}
		await navigationService.navigate({
			target: {
				shellHash: `Shell-appfinder?&/catalog/${JSON.stringify(navigationObject)}`
			}
		});
	}

	/**
	 * Shows the detail dialog for a group.
	 * @async
	 * @param {string} groupId - The Id of the group.
	 * @param {boolean} [editMode=false] - Whether to open the dialog in edit mode.
	 * @private
	 */
	private async _showGroupDetailDialog(groupId: string, editMode = false, pageId: string = MYHOME_PAGE_ID) {
		const group = this._getGroup(groupId);
		if (!group) {
			return;
		}
		this._selectedGroupId = groupId;
		this._selectedPageId = pageId;
		const dialog = this._generateGroupDetailDialog();
		//set group icon
		const groupIconControl = this._controlMap.get(`${this.getId()}-detailDialog-toolbar-color`) as Icon;
		groupIconControl.setColor(Parameters.get({ name: group.getBgColor() }) as string);
		//set group apps
		await this._setGroupDetailDialogApps(groupId, pageId);
		dialog.open();
		//set group title
		this._setGroupNameControl(group.getTitle(), editMode);
	}

	/**
	 * Sets the apps for the detail dialog for a group.
	 * @async
	 * @param {string} groupId - The Id of the group.
	 * @returns {Promise<void>} - A Promise that resolves once the apps for the group detail dialog are set.
	 * @private
	 */
	private async _setGroupDetailDialogApps(groupId: string, pageId: string = MYHOME_PAGE_ID) {
		const group = this._getGroup(groupId);
		if (group) {
			let appVisualizations = filterVisualizations(await this.appManagerInstance.getSectionVisualizations(groupId, false, pageId));
			group.destroyAggregation("apps", true);
			const apps = this.generateApps(appVisualizations);
			const appsWrapper = this._controlMap.get(`${this.getId()}-detailDialog-apps`) as GridContainer;
			this._setAggregation(group, apps, "apps");
			appsWrapper.destroyItems();
			this._setAggregation(
				appsWrapper,
				group.getApps().map((app) => (this.getParent() as AppsContainer)._getAppTile(app))
			);
			this._applyGroupedAppsPersonalization(groupId);
			this._dispatchAppsLoadedEvent(apps);
		}
	}

	/**
	 * Applies personalization to the grouped apps within the specified group.
	 * @param {string} groupId - The ID of the group to which the apps belong.
	 * @private
	 */
	private _applyGroupedAppsPersonalization(groupId: string) {
		const appsWrapper = this._controlMap.get(`${this.getId()}-detailDialog-apps`) as GridContainer;
		const tiles = (appsWrapper?.getItems() || []) as GenericTile[];
		void this._applyTilesPersonalization(tiles, groupId);
	}

	/**
	 * Applies Deprecated Info for apps inside the group.
	 * @param {App[]} apps - The ID of the group to which the apps belong.
	 * @private
	 */
	private _dispatchAppsLoadedEvent(apps: App[]) {
		const appsWrapper = this._controlMap.get(`${this.getId()}-detailDialog-apps`) as GridContainer;
		const tiles = (appsWrapper?.getItems() || []) as GenericTile[];
		(this.getParent() as AppsContainer).fireEvent("appsLoaded", { apps, tiles });
	}

	/**
	 * Generates the group detail dialog.
	 * @private
	 * @returns {sap.m.Dialog} The generated detail dialog for the group.
	 */
	private _generateGroupDetailDialog() {
		const id = `${this.getId()}-detailDialog`;
		if (!this._controlMap.get(id)) {
			//group color icon
			this._controlMap.set(
				`${id}-toolbar-color`,
				new Icon({
					id: `${id}-toolbar-color`,
					src: "sap-icon://color-fill",
					size: "1.25rem"
				}).addStyleClass("sapUiTinyMarginEnd")
			);

			this._controlMap.set(
				`${id}-toolbar-title`,
				new Title({
					id: `${id}-toolbar-title`,
					visible: true
				})
			);

			const oInvisibleText = getInvisibleText(`${id}-toolbar-renameTitle`, this._i18nBundle.getText("renameGroup"));
			this._controlMap.set(`${id}-toolbar-renameTitle`, oInvisibleText);

			const oGroupNameInput = new Input({
				id: `${id}-toolbar-title-edit`,
				width: "13.75rem",
				visible: false,
				ariaLabelledBy: [`${id}-toolbar-renameTitle`]
			});

			this._controlMap.set(`${id}-toolbar-title-edit`, oGroupNameInput);

			//apps wrapper
			const appsWrapper = new GridContainer({
				id: `${id}-apps`,
				layout: new GridContainerSettings(`${id}-appsLayout`, {
					columnSize: "19rem",
					gap: "0.5rem"
				})
			}).addStyleClass("sapCuxAppsContainerBorder sapCuxAppsDetailContainerPadding");

			this._controlMap.set(`${id}-apps`, appsWrapper);
			//add apps button
			this._controlMap.set(
				`${id}-addAppsBtn`,
				new Button(`${id}-addAppsBtn`, {
					text: this._i18nBundle.getText("addApps"),
					icon: "sap-icon://action",
					visible: _showAddApps(),
					press: () => {
						const groupId = this._selectedGroupId;
						this._closeGroupDetailDialog();
						this._selectedGroupId = groupId;
						void this.navigateToAppFinder(groupId, this._selectedPageId);
					}
				})
			);

			this._controlMap.set(
				id,
				new Dialog(id, {
					content: this._controlMap.get(`${id}-apps`) as HBox,
					contentWidth: "60.75rem",
					endButton: new Button({
						id: `${id}-groupDetailCloseBtn`,
						text: this._i18nBundle.getText("XBUT_CLOSE"),
						press: this._closeGroupDetailDialog.bind(this)
					}),
					escapeHandler: this._closeGroupDetailDialog.bind(this),
					customHeader: new Toolbar(`${this.getId()}-toolbar`, {
						content: [
							this._controlMap.get(`${id}-toolbar-color`) as Icon,
							this._controlMap.get(`${id}-toolbar-title`) as Title,
							this._controlMap.get(`${id}-toolbar-title-edit`) as Input,
							this._controlMap.get(`${id}-toolbar-renameTitle`) as InvisibleText,
							new ToolbarSpacer({ id: `${this.getId()}-toolbarSpacer` }),
							this._controlMap.get(`${id}-addAppsBtn`) as Button
						]
					})
				}).addStyleClass("sapCuxGroupDetailDialog")
			);
		}
		return this._controlMap.get(id) as Dialog;
	}

	/**
	 * Closes the group detail dialog.
	 * @private
	 */
	private _closeGroupDetailDialog() {
		const groupDetailDialog = this._controlMap.get(`${this.getId()}-detailDialog`) as Dialog;
		const group = this._getGroup(this._selectedGroupId as string);
		group?.destroyApps();
		this._selectedGroupId = undefined;
		groupDetailDialog?.close();
	}

	/**
	 * Sets the group name control in the detail dialog.
	 * Shows input control to edit the group name in edit mode, otherwise, shows group name as title control.
	 * @private
	 * @param {string} groupTitle - The title of the group.
	 * @param {boolean} editMode - Whether the dialog is in edit mode.
	 */
	private _setGroupNameControl(groupTitle: string, editMode: boolean) {
		const groupDetailDialog = this._controlMap.get(`${this.getId()}-detailDialog`) as Dialog;
		const groupTitleControl = this._controlMap.get(`${this.getId()}-detailDialog-toolbar-title`) as Title;
		const groupInputControl = this._controlMap.get(`${this.getId()}-detailDialog-toolbar-title-edit`) as Input;
		groupInputControl.setValue(groupTitle);
		groupTitleControl.setText(groupTitle);
		groupInputControl?.setVisible(editMode);
		groupTitleControl?.setVisible(!editMode);
		if (editMode) {
			//in edit mode set the focus on input
			groupDetailDialog.setInitialFocus(groupInputControl);
		}
	}

	/**
	 * Handles the press event of a group.
	 * @param {Group$PressEvent} event - The press event object.
	 * @private
	 */
	private _handleGroupPress(event: Group$PressEvent) {
		const groupId = event.getParameter("groupId");
		const pageId = event.getParameter("pageId") || MYHOME_PAGE_ID;
		if (groupId) {
			void this._showGroupDetailDialog(groupId, false, pageId);
		}
	}

	/**
	 * Generates illustrated message for favorite apps panel.
	 * @private
	 * @override
	 * @returns {sap.m.IllustratedMessage} Illustrated error message.
	 */
	protected generateIllustratedMessage() {
		const illustratedMessage = super.generateIllustratedMessage();
		//overrride the default title and add additional content
		illustratedMessage.setDescription(this._i18nBundle.getText("noFavAppsDescription"));
		illustratedMessage.setIllustrationSize(IllustratedMessageSize.Small);
		illustratedMessage.setIllustrationType(IllustratedMessageType.AddingColumns);
		illustratedMessage.addAdditionalContent(
			new Button(`${this.getId()}-errorMessage-addApps`, {
				text: this._i18nBundle.getText("addApps"),
				tooltip: this._i18nBundle.getText("addAppsTooltip"),
				icon: "sap-icon://action",
				visible: _showAddApps(),
				press: () => {
					void this.navigateToAppFinder();
				},
				type: "Emphasized"
			})
		);
		return illustratedMessage;
	}
}
