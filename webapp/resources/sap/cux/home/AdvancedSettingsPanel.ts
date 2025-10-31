/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import CardHelper from "sap/insights/CardHelper";
import Button from "sap/m/Button";
import CheckBox, { CheckBox$SelectEvent } from "sap/m/CheckBox";
import CustomListItem from "sap/m/CustomListItem";
import HBox from "sap/m/HBox";
import IconTabBar, { IconTabBar$SelectEvent } from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";
import Input, { Input$LiveChangeEvent } from "sap/m/Input";
import Label from "sap/m/Label";
import { FlexAlignItems, ToolbarStyle } from "sap/m/library";
import List from "sap/m/List";
import MessageStrip from "sap/m/MessageStrip";
import MessageToast from "sap/m/MessageToast";
import ObjectStatus from "sap/m/ObjectStatus";
import OverflowToolbar from "sap/m/OverflowToolbar";
import Page from "sap/m/Page";
import Panel from "sap/m/Panel";
import Text from "sap/m/Text";
import Title from "sap/m/Title";
import Toolbar from "sap/m/Toolbar";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import VBox from "sap/m/VBox";
import Component from "sap/ui/core/Component";
import Control from "sap/ui/core/Control";
import type { MetadataOptions } from "sap/ui/core/Element";
import Element from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import { ValueState } from "sap/ui/core/library";
import MessageType from "sap/ui/core/message/MessageType";
import File from "sap/ui/core/util/File";
import SimpleForm from "sap/ui/layout/form/SimpleForm";
import JSONModel from "sap/ui/model/json/JSONModel";
import FileUploader, { FileUploader$ChangeEvent } from "sap/ui/unified/FileUploader";
import Container from "sap/ushell/Container";
import ClientSideTargetResolution from "sap/ushell/services/ClientSideTargetResolution";
import Navigation from "sap/ushell/services/Navigation";
import SearchableContent, { AppData } from "sap/ushell/services/SearchableContent";
import { $AdvancedSettingsPanelSettings } from "./AdvancedSettingsPanel";
import BaseSettingsPanel from "./BaseSettingsPanel";
import { IAppInbounds, IAppPersonalization, ISection, ISectionAndVisualization, IVisualization } from "./interface/AppsInterface";
import { ICard, ICardActionParameters, ICardHelper, ICardHelperInstance, ICardManifest } from "./interface/CardsInterface";
import { IPage } from "./interface/PageSpaceInterface";
import { checkPanelExists } from "./utils/Accessibility";
import AppManager from "./utils/AppManager";
import { SETTINGS_PANELS_KEYS } from "./utils/Constants";
import { recycleId } from "./utils/DataFormatUtils";
import { calculateDeviceType, DeviceType } from "./utils/Device";
import { addFESRSemanticStepName, FESR_EVENTS } from "./utils/FESRUtil";
import HttpHelper from "./utils/HttpHelper";
import PageManager from "./utils/PageManager";
import PersonalisationUtils from "./utils/PersonalisationUtils";
import UShellPersonalizer, { IPersonalizationData } from "./utils/UshellPersonalizer";

export enum ImportExportType {
	IMPORT = "import",
	EXPORT = "export"
}

export interface IExportData {
	apps?: ISection[];
	tiles?: ISectionAndVisualization[];
	groupInfo?: IAppPersonalization[];
	host?: string;
	sections?: ISection[];
	createdDate?: string;
	favouritePages: ISectionAndVisualization[] | IPage[];
	cards?: ICardManifest[];
	personalization?: IPersonalizationData;
}
interface IExportSections {
	title: string;
	selected: boolean | undefined;
	enabled: boolean | undefined;
	panelClass: string;
	status?: ValueState;
}
type SectionOrVisualization = ISectionAndVisualization[] | IVisualization[];
interface IExportImportFile {
	host?: string;
	createdDate?: Date;
	sections?: SectionOrVisualization | [];
	groupInfo?: IAppPersonalization[] | IVisualization[] | [];
	tiles?: SectionOrVisualization;
	cards?: ICardManifest[];
	favouritePages: IPage[] | ISectionAndVisualization[];
	apps?: ISection[] | [];
}
interface ApiResponse {
	value: { fileContent: string }[];
	// Define other properties if present in ApiResponse
}

const BASE_URL = "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/";
const REPO_BASE_URL = BASE_URL + "insights_cards_repo_srv/0001/";
const EXPORT_API = REPO_BASE_URL + "INSIGHTS_CARDS/com.sap.gateway.srvd.ui2.insights_cards_repo_srv.v0001.importExport?";
const MYINSIGHT_SECTION_ID = "AZHJGRIT78TG7Y65RF6EPFJ9U";

const NewsAndPagesContainerName: string = "sap.cux.home.NewsAndPagesContainer";
const AppsContainerlName: string = "sap.cux.home.AppsContainer";
const InsightsContainerName: string = "sap.cux.home.InsightsContainer";
const PagePanelName: string = "sap.cux.home.PagePanel";
const FavAppPanelName: string = "sap.cux.home.FavAppPanel";
const RecommendedAppPanelName: string = "sap.cux.home.RecommendedAppPanel";
const TilesPanelName: string = "sap.cux.home.TilesPanel";
const CardsPanelName: string = "sap.cux.home.CardsPanel";

/**
 *
 * Class for My Home Advanced Settings Panel.
 *
 * @extends BaseSettingsPanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 * @private
 *
 * @alias sap.cux.home.AdvancedSettingsPanel
 */
export default class AdvancedSettingsPanel extends BaseSettingsPanel {
	private oControlModel!: JSONModel;
	private oImportExportTab!: IconTabBar;
	private oFileNameInput!: Input;
	private oSelectedTab!: string | undefined;
	private oExportList!: List;
	private oImportList!: List;
	private oImportBtn!: Button;
	private oExportBtn!: Button;
	private oEventBus!: EventBus;
	private oAppManagerInstance!: AppManager;
	private oPageManagerInstance!: PageManager;
	private oPersonalizerInstance!: UShellPersonalizer;
	private cardHelperInstance!: ICardHelperInstance;
	private persData!: IPersonalizationData;
	private oContentVBox!: VBox;
	private oExportMessage!: MessageStrip;
	private oImportMessage!: MessageStrip;
	private oDetailPage!: Page;
	private oSectionsImported!: {
		[key: string]: boolean;
	};
	private oUserPersonalization!: {
		export: {
			data?: IExportData;
			sections?: IExportSections[];
			fileName?: string;
			sectionsSelected?: boolean;
			error?: boolean;
			errorMessage?: string;
			errorType?: string;
		};
		import: {
			data?: IExportData | IExportImportFile;
			sections?: IExportSections[];
			sectionsSelected?: boolean;
			error?: boolean;
			errorMessage?: string;
			errorType?: MessageType;
		};
		selectedTab: string;
		showNoImport: boolean;
	};

	constructor(id?: string | $AdvancedSettingsPanelSettings);
	constructor(id?: string, settings?: $AdvancedSettingsPanelSettings);
	constructor(id?: string, settings?: $AdvancedSettingsPanelSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		events: {
			sectionsImported: {}
		}
	};
	private _recommendationSettingsPanel!: Panel;
	private _importExportPanel!: Panel;

	/**
	 * Init lifecycle method
	 *
	 * @public
	 * @override
	 */
	public init(): void {
		super.init();

		//setup panel
		this.setProperty("key", SETTINGS_PANELS_KEYS.ADVANCED);
		this.setProperty("title", this._i18nBundle.getText("advancedSettings"));
		this.setProperty("icon", "sap-icon://grid");
		this.oEventBus = EventBus.getInstance();
		this.oAppManagerInstance = AppManager.getInstance();
		this.oSectionsImported = {};
		this.oUserPersonalization = {
			export: {
				sections: [],
				fileName: "MY_HOME",
				sectionsSelected: false,
				error: false
			},
			import: {
				sections: [],
				sectionsSelected: false,
				error: false
			},
			selectedTab: "export",
			showNoImport: false
		};
		this.oControlModel = new JSONModel(this.oUserPersonalization);
		//setup layout content
		this.addAggregation("content", this.getContent());
		this.addInnerContent();
		//fired every time on panel navigation
		this.attachPanelNavigated(() => {
			void (async () => {
				if (!this.oPageManagerInstance) {
					this.oPageManagerInstance = PageManager.getInstance(
						PersonalisationUtils.getPersContainerId(this._getPanel()),
						PersonalisationUtils.getOwnerComponent(this._getPanel()) as Component
					);
				}

				// subscribe to all import events for all sections
				this.oEventBus.subscribe(
					"importChannel",
					"tilesImported",
					(channelId?: string, eventId?: string, data?: object) => {
						const customData = (data as { status: boolean }).status;
						//errorstate is false when import is successful
						this.updateImportStatus("insightsTiles", !customData);
					},
					this
				);

				this.oEventBus.subscribe(
					"importChannel",
					"appsImported",
					(channelId?: string, eventId?: string, data?: object) => {
						const customData = (data as { status: boolean }).status;
						//errorstate is false when import is successful
						this.updateImportStatus("favApps", !customData);
					},
					this
				);

				this.oEventBus.subscribe(
					"importChannel",
					"favPagesImported",
					(channelId?: string, eventId?: string, data?: object) => {
						const customData = (data as { status: boolean }).status;
						//errorstate is false when import is successful
						this.updateImportStatus("pages", !customData);
					},
					this
				);

				this.oEventBus.subscribe(
					"importChannel",
					"cardsImported",
					(channelId?: string, eventId?: string, data?: object) => {
						const customData = (data as { status: boolean }).status;
						//errorstate is false when import is successful
						this.updateImportStatus("insightsCards", !customData);
					},
					this
				);

				//get the detailPage of advanced settingspanel
				this.oDetailPage = Element.getElementById(this.getProperty("key") + "-detail-page") as Page;
				const layout = this._getPanel();
				if (checkPanelExists(layout, AppsContainerlName, RecommendedAppPanelName) && calculateDeviceType() !== DeviceType.Mobile) {
					void this._setRecommendationSettingsPanel();
				}

				//load user personalization data
				await this.loadUserPersonalizationData();

				//import button set enabled/disabled based on sections selected
				this.oImportBtn.setEnabled(this.oUserPersonalization.import.sectionsSelected);
				this.enableDisableActions(this.oUserPersonalization.selectedTab as ImportExportType);

				//set export and import list
				this.setImportExportList();
				this.oExportMessage.setText(
					this.oUserPersonalization.export.errorMessage ? String(this.oUserPersonalization.export.errorMessage) : ""
				);
				this.oExportMessage.setType(this.oUserPersonalization.export.errorType as MessageType);
				this.oExportMessage.setProperty("visible", this.oUserPersonalization.export.error, true);
				this.oFileNameInput.setValue(String(this.oUserPersonalization.export.fileName));

				this.oImportMessage.setText(
					this.oUserPersonalization.import.errorMessage ? String(this.oUserPersonalization.import.errorMessage) : ""
				);
				this.oImportMessage.setType(this.oUserPersonalization.import.errorType as MessageType);
				this.oImportMessage.setVisible(this.oUserPersonalization.import.error);
			})();
		});
	}

	private setImportExportList(): void {
		this.oExportList?.destroy();
		this.oExportList = this.setExportSectionList();
		this._importExportPanel.addContent(this.oExportList);
		if (!this.oImportList) {
			this.oImportList = this.setImportSectionList();
			this._importExportPanel.addContent(this.oImportList);
		} else {
			this.oImportList.invalidate();
		}
	}

	/**
	 *
	 * @param sType selected tab type
	 * Set import / export button enable property and selectedkey of importexport tab
	 */
	private enableDisableActions(sType: ImportExportType): void {
		this.oImportExportTab?.setSelectedKey(sType);
		this.oImportBtn?.setVisible(sType === ImportExportType.IMPORT);
		this.oExportBtn?.setVisible(sType === ImportExportType.EXPORT);
		if (this.oUserPersonalization.import.sectionsSelected && sType === ImportExportType.IMPORT) {
			this.oImportBtn.setEnabled(true);
		} else {
			this.oImportBtn.setEnabled(false);
		}

		if (
			sType === ImportExportType.EXPORT &&
			this.oUserPersonalization.export.fileName &&
			this.oUserPersonalization.export.sections?.length &&
			this.oUserPersonalization.export.sectionsSelected
		) {
			this.oExportBtn.setEnabled(true);
		} else {
			this.oExportBtn.setEnabled(false);
		}
	}

	/**
	 *
	 * @param sType selected tab type
	 * Set import/ export message values
	 */
	private setExportImportValues(sType: ImportExportType): void {
		if (sType === ImportExportType.EXPORT) {
			this.oExportMessage.setText(
				this.oUserPersonalization.export.errorMessage ? String(this.oUserPersonalization.export.errorMessage) : ""
			);
			this.oExportMessage.setType(this.oUserPersonalization.export.errorType as MessageType);
			this.oExportMessage.setProperty("visible", this.oUserPersonalization.export.error, true);
		} else if (sType === ImportExportType.IMPORT) {
			this.oImportMessage.setText(
				this.oUserPersonalization.import.errorMessage ? String(this.oUserPersonalization.import.errorMessage) : ""
			);
			this.oImportMessage.setType(this.oUserPersonalization.import.errorType as MessageType);
			this.oImportMessage.setProperty("visible", this.oUserPersonalization.import.error);
		}
	}

	/**
	 * Sets the outer content VBox for the Advanced Settings Panel.
	 * @returns VBox
	 */
	private getContent(): VBox {
		if (!this.oContentVBox) {
			this.oContentVBox = new VBox(this.getId() + "--idAdvancedVBox", {
				items: [
					new Text(this.getId() + "--idPersonalizationSubheader", {
						text: this._i18nBundle.getText("advancedSettingsSubheader")
					}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginTop"),

					this._getImportExportPanel()
				]
			});
		}
		return this.oContentVBox;
	}

	/**
	 * Returns the import/export panel.
	 *
	 * @private
	 * @returns {Panel} The import/export panel.
	 */
	private _getImportExportPanel() {
		if (!this._importExportPanel) {
			this._importExportPanel = new Panel(`${this.getId()}-importExportPanel`, {
				headerToolbar: new OverflowToolbar(`${this.getId()}-importExportPanelToolbar`, {
					style: ToolbarStyle.Clear,
					content: [
						new Title(`${this.getId()}-importExportPanelToolbarText`, {
							text: this._i18nBundle.getText("importAndExportPanelHeader"),
							level: "H3"
						}),
						new ToolbarSpacer(`${this.getId()}-importExportPanelToolbarSpacer`),
						this._getImportButton(),
						this._getExportButton()
					]
				}),
				headerText: this._i18nBundle.getText("importAndExportPanelHeader"),
				expanded: true,
				expandable: true,
				content: []
			}).addStyleClass("sapUiSmallMarginTop");
		}

		return this._importExportPanel;
	}

	/**
	 * Returns the import button.
	 *
	 * @private
	 * @returns {Button} import button.
	 */
	private _getImportButton() {
		if (!this.oImportBtn) {
			this.oImportBtn = new Button({
				id: `${this.getId()}-importBtn`,
				text: this._i18nBundle.getText("import"),
				type: "Transparent",
				press: () => {
					void this.onImportPress();
				},
				visible: false
			});
			addFESRSemanticStepName(this._getImportButton(), FESR_EVENTS.PRESS, "importBtn");
		}
		return this.oImportBtn;
	}

	/**
	 * Returns the export button.
	 *
	 * @private
	 * @returns {Button} export button.
	 */
	private _getExportButton() {
		if (!this.oExportBtn) {
			this.oExportBtn = new Button({
				id: `${this.getId()}-exportBtn`,
				text: this._i18nBundle.getText("export"),
				type: "Transparent",
				press: this.onExportPress.bind(this),
				visible: true
			});
			addFESRSemanticStepName(this.oExportBtn, FESR_EVENTS.PRESS, "exportBtn");
		}
		return this.oExportBtn;
	}

	/**
	 * Returns the inner content for the Advanced Settings Panel.
	 *
	 * @private
	 * @returns {Control} The control containing the Advanced Settings Panel content.
	 */
	private addInnerContent(): void {
		//if not already initialised, create the import/export tab and inner controls
		if (!this.oImportExportTab) {
			this.oImportExportTab = new IconTabBar(this.getId() + "--idImportExportTab", {
				expandable: false,
				backgroundDesign: "Transparent",
				selectedKey: this.oSelectedTab ? this.oSelectedTab : "export",
				select: this.onImportExportTabSelect.bind(this)
			});

			const exportTab = new IconTabFilter(this.getId() + "--idExportTab", {
				key: "export",
				text: this._i18nBundle.getText("exportFile")
			});
			// Add FESR for export tab
			addFESRSemanticStepName(exportTab, FESR_EVENTS.SELECT, "exportTab");

			//export tab content
			this.oExportMessage = new MessageStrip(this.getId() + "--idExportMessageStrip", {
				showIcon: true,
				visible: false
			}).addStyleClass("sapUiNoMarginBegin sapUiTinyMarginBottom");
			const exportText = new Text(this.getId() + "--idExportText", { text: this._i18nBundle.getText("exportText") }).addStyleClass(
				"advancePadding"
			);
			const fileInputContainer = new HBox(this.getId() + "--idFileInputContainer", {
				alignItems: "Center"
			}).addStyleClass("sapUiSmallMargin");
			const filenameLabel = new Label(this.getId() + "--idFilenameLabel", {
				text: this._i18nBundle.getText("exportFileNameLabel"),
				labelFor: "idTitleFilenameInput",
				required: true,
				showColon: true
			}).addStyleClass("sapUiSmallMarginEnd");
			this.oFileNameInput = new Input(this.getId() + "--idFileNameInput", {
				ariaLabelledBy: [`${this.getId()}--idExportText`, `${this.getId()}--idFilenameLabel`],
				required: true,
				width: "13rem",
				liveChange: this.onFileNameInputChange.bind(this),
				value: ""
			});

			fileInputContainer.addItem(filenameLabel);
			fileInputContainer.addItem(this.oFileNameInput);

			exportTab.addContent(this.oExportMessage);
			exportTab.addContent(exportText);
			exportTab.addContent(fileInputContainer);

			//import tab
			const importTab = new IconTabFilter(this.getId() + "--idImportTab", {
				key: "import",
				text: this._i18nBundle.getText("importFile")
			});
			// Add FESR for import tab
			addFESRSemanticStepName(importTab, FESR_EVENTS.SELECT, "importTab");

			//import tab content
			this.oImportMessage = new MessageStrip(this.getId() + "--idImportMessageStrip", {
				text: "{advsettings>/import/errorMessage}",
				type: "{advsettings>/import/errorType}",
				showIcon: true,
				visible: false
			}).addStyleClass("sapUiNoMarginBegin sapUiTinyMarginBottom");
			const importText = new Text(this.getId() + "--idImportText", { text: this._i18nBundle.getText("importText") }).addStyleClass(
				"advancePadding"
			);
			const importSimpleForm = new SimpleForm(this.getId() + "--idImportSimpleForm", {
				editable: true,
				layout: "ResponsiveGridLayout",
				labelSpanS: 4,
				labelSpanM: 4
			});
			const fileUploader = new FileUploader(this.getId() + "--idImportFileUploader", {
				tooltip: this._i18nBundle.getText("uploadImportFile"),
				fileType: ["txt"],
				change: (oEvent: FileUploader$ChangeEvent) => {
					void this.onFileImport(oEvent);
				},
				maximumFileSize: 25,
				sameFilenameAllowed: true,
				width: "80%",
				ariaLabelledBy: [`${this.getId()}--idImportText`],
				buttonText: this._i18nBundle.getText("importFileUploaderButton")
			});
			importSimpleForm.addContent(fileUploader);
			importTab.addContent(this.oImportMessage);
			importTab.addContent(importText);
			importTab.addContent(importSimpleForm);

			const classicImportTab = new IconTabFilter(this.getId() + "--idClassicImportTab", {
				key: "classicImport",
				text: this._i18nBundle.getText("classicImport")
			});
			// Add FESR for classic import tab
			addFESRSemanticStepName(classicImportTab, FESR_EVENTS.SELECT, "classicImportTab");
			const classicText = new Text(this.getId() + "--idClassicImportText", {
				text: this._i18nBundle.getText("classicImportText")
			}).addStyleClass("sapUiSmallMarginBottom advancePadding");
			const resetImportAppsNow = new Button(this.getId() + "--resetImportAppsNow", {
				text: this._i18nBundle.getText("resetButton"),
				press: this.onResetImportApps.bind(this),
				ariaLabelledBy: [`${this.getId()}--idClassicImportText`]
			}).addStyleClass("resetButtonPadding");
			addFESRSemanticStepName(resetImportAppsNow, FESR_EVENTS.PRESS, "resetImportApps");
			classicImportTab.addContent(classicText);
			classicImportTab.addContent(resetImportAppsNow);

			this.oImportExportTab.addItem(exportTab);
			this.oImportExportTab.addItem(importTab);
			this.oImportExportTab.addItem(classicImportTab);
			this._importExportPanel.addContent(this.oImportExportTab);
			this._importExportPanel.addContent(this.setExportSectionList());
		}
	}

	/**
	 *
	 * @returns {List} export section list
	 */
	private setExportSectionList(): List {
		const exportSectionsList = new List(`${this.getId()}--exportSectionsList`, {
			width: "calc(100% - 2rem)",
			growingThreshold: 50,
			includeItemInSelection: true,
			visible: "{= ${advsettings>/selectedTab} === 'export'}"
		}).addStyleClass("sapUiSmallMarginBegin");
		const headerToolbar = new Toolbar(`${this.getId()}--exportSectionsListToolbar`, {
			content: [
				new Title(this.getId() + "--idExportSectionsListHeaderText", {
					text: this._i18nBundle.getText("sectionExportListHeader"),
					level: "H4"
				}).addStyleClass("sectionTitle")
			]
		});
		exportSectionsList.setHeaderToolbar(headerToolbar);
		//set model for the list and bind items to path advsettings>/export/sections
		exportSectionsList.setModel(this.oControlModel, "advsettings");

		exportSectionsList.bindItems({
			path: "advsettings>/export/sections",
			template: new CustomListItem(`${this.getId()}--exportCustomListItem`, {
				visible: {
					path: "advsettings>panelClass",
					formatter: this._isPanelAvailable.bind(this)
				},
				accDescription: {
					parts: [{ path: "advsettings>enabled" }, { path: "advsettings>selected" }, { path: "advsettings>title" }],
					formatter: this._formatAccDescription.bind(this)
				},
				content: [
					new HBox(recycleId(`${this.getId()}--exportContentBox`), {
						alignItems: "Center",
						items: [
							new CheckBox(recycleId(`${this.getId()}--exportListItemCheck`), {
								select: this.onSectionsSelectionChange.bind(this, false),
								selected: "{advsettings>selected}",
								enabled: "{advsettings>enabled}"
							}),
							new Text(recycleId(`${this.getId()}--exportListItemText`), { text: "{advsettings>title}" })
						],
						width: "100%"
					})
				]
			})
		});
		this.oExportList = exportSectionsList;
		return exportSectionsList;
	}

	/**
	 * Returns an accessibility description string for a list item.
	 *
	 * @param enabled Indicates if the checkbox is enabled.
	 * @param selected Indicates if the checkbox is selected (checked).
	 * @param title The title of the list item.
	 * @returns The formatted accessibility description.
	 */
	private _formatAccDescription(enabled: boolean, selected: boolean, title: string): string {
		const statusText = !enabled ? `${this._i18nBundle.getText("checkboxDisabledText")}.` : "";

		const selectionText = selected
			? this._i18nBundle.getText("checkboxCheckedText")
			: this._i18nBundle.getText("checkboxUnCheckedText");

		const instructionText = this._i18nBundle.getText("checkboxInstructionText");

		return `${statusText}${selectionText}. ${title}. ${instructionText}`;
	}

	private _isPanelAvailable(panelClassName: string): boolean {
		const panelMappings: Record<string, { containerName: string; panelName: string }> = {
			[FavAppPanelName]: { containerName: AppsContainerlName, panelName: FavAppPanelName },
			[PagePanelName]: { containerName: NewsAndPagesContainerName, panelName: PagePanelName },
			[TilesPanelName]: { containerName: InsightsContainerName, panelName: TilesPanelName },
			[CardsPanelName]: { containerName: InsightsContainerName, panelName: CardsPanelName }
		};

		const mapping = panelMappings[panelClassName];
		if (!mapping) return false;
		const layout = this._getPanel();
		return checkPanelExists(layout, mapping.containerName, mapping.panelName);
	}

	/**
	 *
	 * @returns {List} import section list
	 */
	private setImportSectionList(): List {
		const importSectionsList = new List(this.getId() + "--idImportSectionsList", {
			width: "calc(100% - 2rem)",
			growingThreshold: 50,
			includeItemInSelection: true,
			visible:
				"{= ${advsettings>/selectedTab} === 'import' && (${advsettings>/import/sections/length} > 0 || ${advsettings>/showNoImport})}"
		}).addStyleClass("sapUiSmallMarginBegin");
		const headerToolbar = new Toolbar(this.getId() + "--idImportSectionsListToolbar", {
			content: [
				new Title(`${this.getId()}--importSectionsListHeaderText`, {
					text: this._i18nBundle.getText("sectionImportListHeader")
				}).addStyleClass("sectionTitle")
			]
		});
		importSectionsList.setHeaderToolbar(headerToolbar);
		//set model for the list and bind items to path advsettings>/import/sections
		importSectionsList.setModel(this.oControlModel, "advsettings");
		importSectionsList.bindItems({
			path: "advsettings>/import/sections",
			template: new CustomListItem(`${this.getId()}--importCustomListItem`, {
				accDescription: {
					path: "advsettings>title",
					formatter: this._formatAccDescription.bind(this)
				},
				content: [
					new HBox(`${this.getId()}--importListCheckBox`, {
						justifyContent: "SpaceBetween",
						items: [
							new HBox(`${this.getId()}--importListItemCheckHBox`, {
								items: [
									new CheckBox(`${this.getId()}--importListItemCheck`, {
										select: this.onSectionsSelectionChange.bind(this, true),
										selected: "{advsettings>selected}",
										enabled: "{advsettings>enabled}"
									}),
									new Text(`${this.getId()}--importListItemText`, { text: "{advsettings>title}" }).addStyleClass(
										"sapUiTinyMarginTop"
									)
								]
							}),
							new HBox(`${this.getId()}--importStatusHBox`, {
								items: [
									new ObjectStatus(`${this.getId()}--importItemStatus`, {
										icon: "{= ${advsettings>status} === 'Success' ? 'sap-icon://status-positive' : 'sap-icon://status-negative' }",
										state: "{advsettings>status}",
										visible: "{= ${advsettings>status} !== 'None'}"
									}).addStyleClass("sapUiSmallMarginEnd sapUiTinyMarginTop")
								]
							})
						],
						width: "100%"
					})
				]
			})
		});

		return importSectionsList;
	}

	/**
	 * Selection change event handler for export and import sections
	 * @param isImport boolean value to check if import or export tab is selected
	 */
	private onSectionsSelectionChange(isImport: boolean): void {
		const allSections = isImport ? this.oImportList.getItems() : this.oExportList.getItems();
		let isSelected = false;
		let content, innerCheckbox;
		const isSectionSelected = allSections.some(function (oSection) {
			if (!isImport) {
				content = oSection.getAggregation("content") as Control[];
				innerCheckbox = (content[0] as HBox).getItems()[0] as CheckBox;
				isSelected = innerCheckbox.getSelected();
			} else {
				content = oSection.getAggregation("content") as Control[];
				const innerHbox = (content[0] as HBox).getItems()[0] as HBox;
				innerCheckbox = innerHbox.getItems()[0] as CheckBox;
				isSelected = innerCheckbox.getSelected();
			}
			return isSelected;
		});
		this.oControlModel.setProperty((isImport ? "/import" : "/export") + "/sectionsSelected", isSectionSelected);
		this.enableDisableActions((isImport ? "import" : "export") as ImportExportType);
	}

	/**
	 * Handler for import button press
	 *
	 */
	private async onImportPress(): Promise<void> {
		this.attachEvent("sectionsImported", () => {
			this.oDetailPage.setBusy(false);
			this.oControlModel.setProperty("/import/sectionsSelected", false);
		});
		this.oImportBtn.setEnabled(false);
		this.oDetailPage.setBusy(true);
		this.handleUserPersonalizationError(ImportExportType.IMPORT, false, "", "");
		const oExportData = this.oUserPersonalization.import.data;
		try {
			const aSelectedSections = await this.importSections(oExportData);
			const bShowError: boolean = aSelectedSections.some((oSection) => {
				return oSection.status === ValueState.Error;
			});
			if (bShowError) {
				this.handleUserPersonalizationError(
					ImportExportType.IMPORT,
					true,
					String(this._i18nBundle.getText("userPersonalizationImportError")),
					"Warning"
				);
			}
			this.oControlModel.setProperty("/import/sections", aSelectedSections);
		} catch (oErr: unknown) {
			Log.error("importpress", String(oErr));
			this.handleUserPersonalizationError(
				ImportExportType.IMPORT,
				true,
				String(this._i18nBundle.getText("userPersonalizationImportError")),
				"Error"
			);
		}
	}

	/**
	 * Invokes import of apps,tiles,pages and cards data
	 * @param oImportData import data
	 * @returns Promise<IExportSections[]>
	 */
	private importSections(oImportData?: IExportData | IExportImportFile): Promise<IExportSections[] | []> {
		const sectionImportChain: (() => Promise<void>)[] = [];
		const aPromise: Promise<void>[] = [];
		const oSelectedSections = this.oControlModel.getProperty("/import/sections") as IExportSections[];

		sectionImportChain.push(() => this.importApps(oImportData));
		sectionImportChain.push(() => this.importTiles(oImportData));
		sectionImportChain.push(() => this.importFavPages(oImportData));

		// Execute apps, tiles, and pages sequentially
		aPromise.push(
			sectionImportChain.reduce((chain, current) => {
				return chain.then(() => current());
			}, Promise.resolve())
		);

		aPromise.push(this.importCards(oImportData));

		return Promise.all(aPromise)
			.then(() => {
				return oSelectedSections;
			})
			.catch((oError: Error) => {
				Log.error("import failed", String(oError));
				return [];
			});
	}

	private importApps(oImportData?: IExportData | IExportImportFile): Promise<void> {
		return new Promise<void>((resolve) => {
			const oSelectedSections = this.oControlModel.getProperty("/import/sections") as IExportSections[];
			if (
				oImportData?.apps &&
				oImportData?.apps.length > 0 &&
				this.isSectionSelected(oSelectedSections, String(this._i18nBundle.getText("favApps")))
			) {
				this.oSectionsImported[String(this._i18nBundle.getText("favApps"))] = false;
				this.oEventBus.publish("importChannel", "appsImport", { apps: oImportData.apps, groupInfo: oImportData.groupInfo });
				resolve();
			} else {
				// if no apps / apps selected then resolve the promise and mark the section as imported
				this.oSectionsImported[String(this._i18nBundle.getText("favApps"))] = true;
				this.updateImportStatus("favApps");
				resolve(); // Resolve the promise if condition doesn't meet
			}
		});
	}

	private importTiles(oImportData?: IExportData | IExportImportFile): Promise<void> {
		return new Promise<void>((resolve) => {
			const oSelectedSections = this.oControlModel.getProperty("/import/sections") as IExportSections[];
			if (
				oImportData?.tiles &&
				oImportData.tiles.length > 0 &&
				this.isSectionSelected(oSelectedSections, String(this._i18nBundle.getText("insightsTiles")))
			) {
				this.oSectionsImported[String(this._i18nBundle.getText("insightsTiles"))] = false;
				this.oEventBus.publish("importChannel", "tilesImport", oImportData.tiles);
				resolve();
			} else {
				// if no tiles / tiles section not selected then resolve the promise and mark the section as imported
				this.oSectionsImported[String(this._i18nBundle.getText("insightsTiles"))] = true;
				this.updateImportStatus("insightsTiles");
				resolve(); // Resolve the promise if condition doesn't meet
			}
		});
	}

	private importFavPages(oImportData?: IExportData | IExportImportFile): Promise<void> {
		return new Promise<void>((resolve) => {
			const oSelectedSections = this.oControlModel.getProperty("/import/sections") as IExportSections[];
			if (
				oImportData?.favouritePages &&
				oImportData.favouritePages.length > 0 &&
				this.isSectionSelected(oSelectedSections, String(this._i18nBundle.getText("pages")))
			) {
				this.oSectionsImported[String(this._i18nBundle.getText("pages"))] = false;
				this.oEventBus.publish("importChannel", "favPagesImport", oImportData.favouritePages);
				resolve();
			} else {
				// if no tiles / tiles section not selected then resolve the promise and mark the section as imported
				this.oSectionsImported[String(this._i18nBundle.getText("pages"))] = true;
				this.updateImportStatus("pages");
				resolve(); // Resolve the promise if condition doesn't meet
			}
		});
	}

	private importCards(oImportData?: IExportData | IExportImportFile): Promise<void> {
		return new Promise<void>((resolve) => {
			const oSelectedSections = this.oControlModel.getProperty("/import/sections") as IExportSections[];
			if (
				oImportData?.cards &&
				oImportData.cards.length > 0 &&
				this.isSectionSelected(oSelectedSections, String(this._i18nBundle.getText("insightsCards")))
			) {
				this.oSectionsImported[String(this._i18nBundle.getText("insightsCards"))] = false;
				this.oEventBus.publish("importChannel", "cardsImport", oImportData.cards);
				resolve();
			} else {
				// if no tiles / tiles section not selected then resolve the promise and mark the section as imported
				this.oSectionsImported[String(this._i18nBundle.getText("insightsCards"))] = true;
				this.updateImportStatus("insightsCards");
				resolve(); // Resolve the promise if condition doesn't meet
			}
		});
	}
	/**
	 *  Updates status of sections being imported
	 *	@param {string} sSectionTitle - section title
	 * 	@param {boolean} errorState - error state
	 * 	@returns {void}
	 */
	private updateImportStatus(sSectionTitle: string, errorState?: boolean): void {
		const sSectionId = String(this._i18nBundle.getText(sSectionTitle));
		const oSelectedSections = this.oControlModel.getProperty("/import/sections") as IExportSections[];
		const oSection = oSelectedSections.find(function (oSec) {
			return oSec.title === sSectionId;
		});
		if (oSection) {
			if (errorState !== undefined) {
				oSection.status = errorState ? ValueState.Error : ValueState.Success;
			} else {
				oSection.status = ValueState.None;
			}
			//if a section's status has become success then disable that particular section
			if (oSection.status === ValueState.Success) {
				oSection.enabled = false;
			}
		}
		this.oSectionsImported[sSectionId] = true;
		const sectionTitles = Object.keys(this.oSectionsImported);
		// if every section has been imported successfully then fire sectionsimported
		const imported = sectionTitles.every((sTitle) => {
			return this.oSectionsImported[sTitle];
		});
		if (imported) {
			this.fireEvent("sectionsImported");
		}
	}

	/**
	 *  Resets the import model values
	 *  @param {boolean} onOpen - value to show if the reset call is happening while opening the dialog for the first time
	 * 	@private
	 */
	public resetImportModel(onOpen?: boolean): void {
		this.oControlModel.setProperty("/import/sections", []);
		this.oControlModel.setProperty("/import/sectionsSelected", false);
		this.oControlModel.setProperty("/import/error", false);
		// if called on settingsdialog open , reset value of selectedtab and fileUploader value
		if (onOpen) {
			this.oControlModel.setProperty("/selectedTab", "export");
			(Element.getElementById(this.getId() + "--idImportFileUploader") as FileUploader)?.setValue("");
		}
	}

	/**
	 * 	Find visualizations that are not already present in the favsections
	 * @param aImportedSections
	 * @returns {Promise<ISection[] | []>} aImportedSections
	 */
	private async getDeltaSectionViz(aImportedSections: ISection[]): Promise<ISection[] | []> {
		try {
			const favSections: ISection[] = await this.oAppManagerInstance._getSections(true);

			aImportedSections.forEach((oImportedSection) => {
				let oSection: ISection | undefined;
				if (oImportedSection.default) {
					oSection = favSections.find((oSec) => oSec.default);
				} else {
					oSection = favSections.find((oSec) => oSec.id === oImportedSection.id);
				}
				if (oSection) {
					// find visualizations that are not already present in the favsections
					const aDelta = oImportedSection.visualizations?.filter((oImportViz) => {
						return oSection.visualizations?.every((oViz) =>
							oViz.isBookmark ? oViz.targetURL !== oImportViz.targetURL : oViz.vizId !== oImportViz.vizId
						);
					});
					oImportedSection.visualizations = aDelta;
				}
			});
			// Remove Sections with no visualizations
			aImportedSections = aImportedSections.filter((oSection) => oSection.visualizations && oSection.visualizations.length > 0);
			return aImportedSections;
		} catch (error) {
			Log.error("Error occurred while fetching delta section visualizations:" + String(error));
			return []; // Return an empty array in case of error
		}
	}

	private getDeltaAuthSectionViz(aImportedSections: ISection[]): Promise<[] | ISection[]> {
		// Get delta visualization
		if (aImportedSections && aImportedSections.length) {
			return this.getDeltaSectionViz(aImportedSections)
				.then((aDeltaSections: ISection[]) => {
					// Filter authorized section visualizations
					return this.filterAuthSectionViz(aDeltaSections);
				})
				.catch((oError) => {
					Log.error(String(oError));
					return [];
				});
		}
		return Promise.resolve([]); // Return a promise resolving to void
	}

	private async filterAuthSectionViz(aSections: ISection[]): Promise<ISection[]> {
		const _getCatalogApps = function () {
			return Container.getServiceAsync<SearchableContent>("SearchableContent").then(function (SearchableContent) {
				return SearchableContent.getApps({ includeAppsWithoutVisualizations: false });
			});
		};

		const _filterAuthViz = function (aAppCatalog: AppData[], aViz: IVisualization[] | undefined) {
			const aSectionViz: IVisualization[] | undefined = [];
			aViz?.forEach(function (oViz) {
				for (let appCatalog of aAppCatalog) {
					const oAppCatalog = appCatalog;
					const oSectionViz = oAppCatalog.visualizations.find(function (oCatalogViz: IVisualization) {
						return (
							oCatalogViz.vizId === oViz.vizId ||
							(oViz.isBookmark &&
								oCatalogViz.target &&
								oViz.target?.action === oCatalogViz.target.action &&
								oViz.target?.semanticObject === oCatalogViz.target.semanticObject)
						);
					});
					if (oSectionViz) {
						oSectionViz.displayFormatHint =
							oViz.displayFormatHint !== "standard" ? String(oViz.displayFormatHint) : String(oSectionViz.displayFormatHint);
						oSectionViz.id = String(oViz.id ?? oSectionViz.id);
						aSectionViz.push(oViz.isBookmark ? oViz : oSectionViz);
						break;
					}
				}
			});
			return aSectionViz;
		};

		return await _getCatalogApps().then(function (aAppCatalog) {
			return aSections.map(function (oSection) {
				oSection.visualizations = _filterAuthViz(aAppCatalog, oSection.visualizations);
				return oSection;
			});
		});
	}

	/**
	 * Filter authorized favorite pages
	 *
	 * @param {Array} aFavPages - array of favorite pages
	 * @returns {Promise} resolves to an array of authorized pages
	 */
	private async filterAuthFavPages(aFavPages: IPage[]): Promise<IPage[] | []> {
		if (aFavPages && aFavPages.length > 0) {
			return await this.oPageManagerInstance.fetchAllAvailablePages().then(function (aAvailablePages) {
				return aFavPages.filter(function (oimportedPage) {
					return aAvailablePages.filter(function (oAvailabePage) {
						return oAvailabePage.pageId === oimportedPage.pageId && oAvailabePage.spaceId === oimportedPage.spaceId;
					}).length;
				});
			});
		}
		return Promise.resolve([]);
	}

	/**
	 * Filter authorized cards
	 *
	 * @param {Array} aCards - array of cards
	 * @returns {Promise} resolves to an array of authorized cards
	 */
	private async filterAuthCards(aCards: ICardManifest[] | void): Promise<ICardManifest[] | undefined> {
		const _getParentApp = function (aAvailableApps: IAppInbounds[], oCard: ICardManifest) {
			return aAvailableApps.find(function (oApp) {
				return (
					oApp.resolutionResult &&
					oApp.resolutionResult.applicationDependencies &&
					oCard["sap.insights"] &&
					oApp.resolutionResult.applicationDependencies.name === oCard["sap.insights"].parentAppId
				);
			});
		};

		const _isNavigationSupported = function (oService: Navigation, oParentApp: IAppInbounds | undefined) {
			if (oParentApp) {
				return oService
					.isNavigationSupported([
						{
							target: {
								semanticObject: oParentApp.semanticObject,
								action: oParentApp.action
							}
						}
					])
					.then(function (aResponses) {
						return aResponses[0].supported || false;
					});
			}
			return Promise.resolve(false);
		};

		if (aCards && aCards.length > 0) {
			return await Promise.all([
				Container.getServiceAsync<ClientSideTargetResolution>("ClientSideTargetResolution"),
				Container.getServiceAsync<Navigation>("Navigation")
			]).then(function (aServices: [ClientSideTargetResolution, Navigation]) {
				const clientSideTargetResolution = aServices[0];
				const Navigation = aServices[1];
				const aAvailableApps = clientSideTargetResolution._oAdapter._aInbounds || [];

				return aCards.reduce<Promise<ICardManifest[]>>(async (promise: Promise<ICardManifest[]>, oCard: ICardManifest) => {
					const aAuthCards: ICardManifest[] = await promise;
					const oParentApp = _getParentApp(aAvailableApps, oCard);
					const bIsNavigationSupported = await _isNavigationSupported(Navigation, oParentApp);
					if (bIsNavigationSupported) {
						aAuthCards.push(oCard);
					}
					return aAuthCards;
				}, Promise.resolve([]));
			});
		}
		return Promise.resolve([]);
	}

	/**
	 * Handles change event for fileuploader on import file
	 *
	 * @returns {Promise} resolves to available import sections being shown
	 */
	private onFileImport(oEvent: FileUploader$ChangeEvent): Promise<void> {
		this.handleUserPersonalizationError(ImportExportType.IMPORT, false, "", "");
		this.resetImportModel();
		this.oDetailPage.setBusy(true);

		const files = oEvent.getParameter("files");
		const oFile = files && (files[0] as File);

		return this.readFileContent(oFile)
			.then((oFileContent) => {
				// btoa doesn't support the characters outside latin-1 range, so first encode to utf-8
				const oEncodedFileContent = window.btoa(
					encodeURIComponent(oFileContent).replace(/%([0-9A-F]{2})/g, function (match, p1: string) {
						return String.fromCharCode(parseInt(p1, 16)); // Convert p1 to a number using parseInt //String.fromCharCode("0x" + p1);
					})
				);
				return HttpHelper.Post(EXPORT_API, { fileContent: oEncodedFileContent }).then((oResponse: unknown) => {
					if (oResponse && (oResponse as { error: string }).error) {
						throw new Error((oResponse as { error: string }).error);
					}
					if (oResponse && (oResponse as { value: string[] }).value && (oResponse as { value: string[] }).value.length) {
						const oImportDataString: string | undefined = (oResponse as ApiResponse).value[0].fileContent;

						// Parse the stringified JSON into the defined type
						const oImportData = JSON.parse(oImportDataString) as IExportImportFile;
						if (oImportData.host === window.location.host) {
							const aImportedSections = (oImportData.sections as ISection[]) || ([] as ISection[]);
							aImportedSections.push({
								id: MYINSIGHT_SECTION_ID,
								visualizations: (oImportData.tiles as IVisualization[]) || []
							});
							//filter authorized data
							return this.filterAuthorizedImportData(aImportedSections, oImportData);
						} else {
							this.handleUserPersonalizationError(
								ImportExportType.IMPORT,
								true,
								String(this._i18nBundle.getText("importSourceErrorMessage")),
								""
							);
							return Promise.resolve();
						}
					}
				});
			})
			.catch((oError) => {
				Log.error(String(oError));
				this.handleUserPersonalizationError(ImportExportType.IMPORT, true, "", "");
			})
			.finally(() => {
				this.oDetailPage.setBusy(false);
				this.enableDisableActions(ImportExportType.IMPORT);
			});
	}

	private async filterAuthorizedImportData(aImportedSections: ISection[], oImportData: IExportImportFile): Promise<void> {
		let promises: Promise<[] | ISection[] | IPage[] | ICardManifest[] | undefined | JSONModel>[] = [
			this.getDeltaAuthSectionViz(aImportedSections),
			this.filterAuthFavPages(oImportData.favouritePages)
		];
		if (await this.isInsightsEnabled()) {
			promises.push(this.filterAuthCards(oImportData.cards));
			promises.push(this.getInsightCards()); // check : send only cards count here as all cards are not required
		}
		return Promise.all(promises).then(async (aResponse) => {
			const aAuthSections = aResponse[0] as ISection[];
			const aAuthFavPages = aResponse[1] as IPage[];
			const aAuthCards = (aResponse[2] || []) as ICardManifest[];
			const iInsightCardsCount = ((aResponse[3] as JSONModel)?.getProperty("/cardCount") as number) || 0;
			oImportData.apps = aAuthSections.filter(function (oSection) {
				return oSection.id !== MYINSIGHT_SECTION_ID;
			});
			oImportData.tiles =
				(
					aAuthSections.find(function (oSection) {
						return oSection.id === MYINSIGHT_SECTION_ID;
					}) || {}
				).visualizations || [];
			oImportData.favouritePages = aAuthFavPages;
			oImportData.cards = aAuthCards || [];
			const iTotalCardCount = iInsightCardsCount + Number(aAuthCards?.length);
			if (iTotalCardCount > 99) {
				this.handleUserPersonalizationError(
					ImportExportType.IMPORT,
					true,
					String(this._i18nBundle.getText("importCardCountErrorMessage")),
					""
				);
			}
			let aSections = await this.getImportedSections(oImportData, ImportExportType.IMPORT, iInsightCardsCount);
			aSections = aSections.map(function (oSection) {
				oSection.status = ValueState.None;
				return oSection;
			});
			this.oUserPersonalization.import.data = oImportData;
			this.oControlModel.setProperty("/import/sections", aSections);
			this.oControlModel.setProperty("/import/sectionsSelected", this.getSelectedSections(aSections).length > 0);
			this.oControlModel.setProperty("/showNoImport", aSections.length === 0);
		});
	}

	private readFileContent(oFile: File | undefined): Promise<string> {
		return new Promise(function (resolve, reject) {
			if (oFile && window.FileReader) {
				const reader = new FileReader();
				reader.onload = function (event: ProgressEvent<FileReader>) {
					const target = event.target as FileReader;
					resolve(target?.result as string);
				};
				// Convert oFile to Blob
				const blob = oFile as unknown as Blob;
				reader.readAsText(blob);
			} else {
				reject(new Error("Error"));
			}
		});
	}

	private async _getPersonalizationData(): Promise<IPersonalizationData> {
		if (!this.oPersonalizerInstance) {
			this.oPersonalizerInstance = await UShellPersonalizer.getInstance(
				PersonalisationUtils.getPersContainerId(this._getPanel()),
				PersonalisationUtils.getOwnerComponent(this._getPanel()) as Component
			);
		}
		this.persData = (await this.oPersonalizerInstance.read()) || {};
		return this.persData;
	}

	private async loadUserPersonalizationData(): Promise<void> {
		this.oExportList.setBusy(true);
		const persData = await this._getPersonalizationData();

		let promises: (Promise<ISection[]> | Promise<JSONModel>)[] = [this.oAppManagerInstance._getSections(true)];
		if (await this.isInsightsEnabled()) {
			promises.push(this.getInsightCards());
		}

		// load all sections, insight apps and cards
		const [favSections, insightModel] = (await Promise.all(promises)) as [ISection[], JSONModel];

		const aSections = favSections,
			favApps = aSections.filter((oSection) => {
				return oSection.id !== MYINSIGHT_SECTION_ID && oSection.visualizations?.length;
			});

		const insightTiles =
			aSections.find((oSection) => {
				return oSection.id === MYINSIGHT_SECTION_ID;
			})?.visualizations || [];

		const insightCards: ICardManifest[] =
			insightModel && insightModel.getProperty("/visibleCards")
				? (insightModel.getProperty("/visibleCards") as ICard[]).map((oCard: ICard) => {
						return oCard.descriptorContent;
					})
				: [];
		const oExportData = {
			apps: favApps,
			tiles: insightTiles,
			favouritePages: persData.favouritePages,
			cards: insightCards,
			personalization: persData
		} as IExportData;
		const aExportSections = await this.getImportedSections(oExportData, ImportExportType.EXPORT, 0);
		this.oUserPersonalization.export.data = oExportData;
		this.oUserPersonalization.export.sections = aExportSections;
		this.oUserPersonalization.export.sectionsSelected = this.getSelectedSections(aExportSections).length > 0;
		this.oControlModel.refresh();
		this.oExportList.setBusy(false);
	}

	/**
	 * Checks if insights is enabled for the system
	 *
	 * @private
	 * @returns {boolean}
	 */
	private async isInsightsEnabled(): Promise<boolean> {
		try {
			if (await (CardHelper as ICardHelper).getServiceAsync()) {
				return true;
			}
			return false;
		} catch (error) {
			Log.error(error instanceof Error ? error.message : String(error));
			return false;
		}
	}

	/**
	 * Returns selected sections out of provided sections
	 *
	 * @param {Array} aSections - array of sections to show in import/export
	 * @returns {Array} array of selected sections
	 */
	getSelectedSections(aSections: IExportSections[]): IExportSections[] {
		return (
			aSections.filter(function (oSection) {
				return oSection.selected && oSection.enabled;
			}) || []
		);
	}

	/**
	 * Returns if section is selected
	 *
	 * @param {Array} oSections - import/export sections
	 * @param {String} sSectionId - import/export section id
	 * @returns {boolean} returns true if section is selected
	 */
	isSectionSelected(sections: IExportSections[], sectionId: string): boolean {
		const section = sections.find(function (sec) {
			return sec.title === sectionId;
		});
		return !!(section && section.selected && section.enabled);
	}

	/**
	 * Returns import/export sections
	 *
	 * @param {object} oData - export/import data
	 * @param {ImportExportType} sType - export/import type
	 * @param {number} iInsightCardsCount - cards count
	 * @returns {Array} array of import/export sections
	 */
	private async getImportedSections(
		oData: IExportData | IExportImportFile,
		sType: ImportExportType,
		iInsightCardsCount: number
	): Promise<IExportSections[]> {
		const aFavPages =
				(sType === ImportExportType.IMPORT ? await this.getDeltaFavPages(oData.favouritePages) : oData.favouritePages) || [],
			isAppViz =
				oData.apps &&
				oData.apps.some(function (oSections) {
					return oSections && oSections.visualizations && oSections.visualizations.length > 0;
				});

		const sections = [
			{
				title: this._i18nBundle.getText("favApps") as string,
				selected: isAppViz,
				enabled: isAppViz,
				panelClass: FavAppPanelName
			},
			{
				title: this._i18nBundle.getText("pages") as string,
				selected: aFavPages?.length > 0,
				enabled: aFavPages?.length > 0,
				panelClass: PagePanelName
			},
			{
				title: this._i18nBundle.getText("insightsTiles") as string,
				selected: oData.tiles && oData.tiles.length > 0,
				enabled: oData.tiles && oData.tiles.length > 0,
				panelClass: TilesPanelName
			}
		];

		if (await this.isInsightsEnabled()) {
			sections.push({
				title: this._i18nBundle.getText("insightsCards") as string,
				selected: oData.cards && oData.cards.length > 0 && oData.cards.length + iInsightCardsCount <= 99,
				enabled: oData.cards && oData.cards.length > 0 && oData.cards.length + iInsightCardsCount <= 99,
				panelClass: CardsPanelName
			});
		}

		return sections;
	}

	private async getDeltaFavPages(aImportedFavPages: IPage[]): Promise<IPage[]> {
		const persData = await this._getPersonalizationData();
		const aFavPages = persData.favouritePages || [];
		if (aFavPages.length !== aImportedFavPages.length) {
			return aImportedFavPages;
		}
		return aImportedFavPages.filter(function (oImportedPage) {
			return !aFavPages.find(function (oFavPage) {
				return oImportedPage.pageId === oFavPage.pageId && oImportedPage.spaceId === oFavPage.spaceId;
			});
		});
	}

	private async getInsightCards(): Promise<JSONModel> {
		try {
			this.cardHelperInstance = await (CardHelper as ICardHelper).getServiceAsync();
			const oUserVisibleCardModel = await this.cardHelperInstance._getUserAllCardModel();
			const aCards = oUserVisibleCardModel.getProperty("/cards") as ICard[];
			const aVisibleCards = aCards.filter(function (oCard: ICard) {
				return oCard.visibility;
			});
			oUserVisibleCardModel.setProperty("/visibleCards", aVisibleCards);
			return oUserVisibleCardModel;
		} catch (error) {
			// Handle any errors
			console.error("Error in getInsightCards:", error);
			throw error; // Re-throw the error to be handled by the caller
		}
	}

	/**
	 * Handles export button press
	 */
	private onExportPress(): void {
		this.handleUserPersonalizationError(ImportExportType.EXPORT, false, "", "");
		const oExportFileName = this.oControlModel.getProperty("/export/fileName") as string,
			aExportSections = this.oControlModel.getProperty("/export/sections") as IExportSections[],
			oExportData = this.oUserPersonalization.export.data;
		const oExportFileContent = this.getExportFileContent(oExportData, aExportSections);
		sap.ui.require(["sap/ui/core/util/File"], (File: File) => {
			try {
				File.save(JSON.stringify(oExportFileContent), oExportFileName, "txt", "text/plain", "utf-8");
				MessageToast.show(String(this._i18nBundle.getText("userPersonalizationExportSuccess")));
			} catch (error) {
				Log.error(error instanceof Error ? error.message : String(error));
				if (error instanceof Error && error?.name !== undefined && error.name !== "AbortError") {
					// Handle the error appropriately
					this.handleUserPersonalizationError(ImportExportType.EXPORT, true, "", "");
				}
			}
		});
	}

	private getExportFileContent(exportData: IExportData | undefined, exportSections: IExportSections[]): IExportImportFile {
		const oPersonalization = exportData?.personalization,
			oExportFileContent = {
				host: window.location.host,
				createdDate: new Date(),
				sections: [] as ISectionAndVisualization[] | IVisualization[] | [],
				groupInfo: [] as IAppPersonalization[] | IVisualization[] | [],
				tiles: [] as ISectionAndVisualization[] | IVisualization[] | [],
				cards: [] as ICardManifest[],
				favouritePages: [] as IPage[] | []
			};
		if (this.isSectionSelected(exportSections, this._i18nBundle.getText("favApps") as string)) {
			oExportFileContent.sections = exportData?.apps || [];
			oExportFileContent.groupInfo = oPersonalization?.favoriteApps || [];
		}
		if (this.isSectionSelected(exportSections, this._i18nBundle.getText("pages") as string)) {
			oExportFileContent.favouritePages = oPersonalization?.favouritePages || [];
		}
		if (this.isSectionSelected(exportSections, this._i18nBundle.getText("insightsTiles") as string)) {
			oExportFileContent.tiles = exportData?.tiles || [];
		}
		if (this.isSectionSelected(exportSections, this._i18nBundle.getText("insightsCards") as string)) {
			oExportFileContent.cards = this.filterNonSensitiveCards(exportData?.cards || []);
		}
		return oExportFileContent;
	}

	/**
	 * Filters out the sensitive cards from the import data
	 *
	 * @private
	 * @param {ICardManifest[]} cards Array of card to filter out before import
	 * @returns {ICardManifest[]} Array of filtered cards
	 */
	private filterNonSensitiveCards(cards: ICardManifest[]): ICardManifest[] {
		const nonSensitiveCards = [] as ICardManifest[];

		cards.forEach((oCard) => {
			if (oCard["sap.card"]?.configuration?.parameters) {
				const parameter = oCard["sap.card"].configuration.parameters;
				let sensitiveProps: string[] = [];
				sensitiveProps = sensitiveProps
					.concat(this.getSensitiveProps(parameter.headerState))
					.concat(this.getSensitiveProps(parameter.lineItemState))
					.concat(this.getSensitiveProps(parameter.state));
				if (sensitiveProps.length === 0) {
					nonSensitiveCards.push(oCard);
				}
			} else {
				nonSensitiveCards.push(oCard);
			}
		});
		if (cards.length !== nonSensitiveCards.length) {
			this.handleUserPersonalizationError(
				ImportExportType.EXPORT,
				true,
				String(this._i18nBundle.getText("exportSensitiveCardsErrorMessage")),
				"Warning"
			);
		}
		return nonSensitiveCards;
	}

	/**
	 * Finds the sensitive properties and parameters
	 *
	 * @private
	 * @param {({ value: string } | undefined)} param
	 * @returns {string[]} Array of sensitive props as strings
	 */
	private getSensitiveProps(param: { value: string } | undefined) {
		let paramSensitiveProps: string[] = [];
		if (param?.value) {
			const paramValue = JSON.parse(param.value) as { sensitiveProps: string[]; parameters: ICardActionParameters };
			const sensitiveProp = paramValue.sensitiveProps || Object.keys(paramValue.parameters?.ibnParams?.sensitiveProps || {});
			if (sensitiveProp.length > 0) {
				paramSensitiveProps = paramSensitiveProps.concat(sensitiveProp);
			}
		}
		return paramSensitiveProps;
	}

	/**
	 * Handles user personalization error, shows the error msg and reset values
	 *
	 * @param {string} sType - type of import/export
	 * @param {boolean} bShowError - flag to show or hide error msg
	 * @param {string} sErrorMsg - error msg text
	 * @param {string} sErrorType - error msg type
	 */
	private handleUserPersonalizationError(sType: ImportExportType, bShowError: boolean, sErrorMsg: string, sErrorType: string): void {
		const sDefaultErrorMsg = this._i18nBundle.getText(sType === ImportExportType.IMPORT ? "importErrorMessage" : "exportErrorMessage");
		this.oControlModel.setProperty("/" + sType + "/error", bShowError, undefined, true);
		this.oControlModel.setProperty("/" + sType + "/errorMessage", sErrorMsg || sDefaultErrorMsg, undefined, true);
		this.oControlModel.setProperty("/" + sType + "/errorType", sErrorType || "Error", undefined, true);
		this.setExportImportValues(sType);
	}

	/**
	 * Handles import/export tab select
	 *
	 * @param {object} oEvent - IconTabBarSeelect event
	 */
	private onImportExportTabSelect(oEvent: IconTabBar$SelectEvent): void {
		const selectedKey = oEvent.getParameter("selectedKey");
		this.oSelectedTab = selectedKey;
		this.oControlModel.setProperty("/selectedTab", selectedKey);
		this.oExportList.setVisible(selectedKey === "export");

		this.oImportBtn.setVisible(selectedKey === "import");
		this.oExportBtn.setVisible(selectedKey === "export");
		this.oImportBtn.setEnabled(this.oUserPersonalization.import.sectionsSelected);
		this.oExportBtn.setEnabled(this.oUserPersonalization.export.sectionsSelected);
		this.oExportBtn.setEnabled(
			!!(
				this.oUserPersonalization.export.fileName &&
				this.oUserPersonalization.export.sections &&
				this.oUserPersonalization.export.sections.length > 0 &&
				this.oUserPersonalization.export.sectionsSelected
			)
		);
	}

	/**
	 * Handles export file name input change
	 *
	 * @param {object} oEvent - event
	 */
	private onFileNameInputChange(oEvent: Input$LiveChangeEvent): void {
		const sInputValue: string | undefined = oEvent.getParameter("value")?.trim();
		const oInput = oEvent.getSource();
		let sValueState = ValueState.None; // Initialize with ValueState.None
		let sValueStateText = "";

		// Validate based on constraints provided at input
		if (!sInputValue || !sInputValue.length) {
			sValueState = ValueState.Error;
			sValueStateText = String(this._i18nBundle.getText("invalidExportFileName"));
		}

		//update value state
		oInput.setValueState(sValueState);
		oInput.setValueStateText(sValueStateText);
		this.oControlModel.setProperty("/export/fileName", sInputValue);
		this.enableDisableActions(ImportExportType.EXPORT);
	}

	private onResetImportApps(): void {
		this.oEventBus.publish("importChannel", "resetImported");
		MessageToast.show(this._i18nBundle.getText("importAppsNowBtnEnabled") as string);
	}

	/**
	 * Generates the recommendation settings panel
	 * @returns {Panel} recommendation settings panel
	 * @private
	 */
	private async _getRecommendationSettingsPanel() {
		const persData = await this._getPersonalizationData();
		if (!this._recommendationSettingsPanel) {
			const panelId = this.getId() + "--recommendationSettingsPanel";
			this._recommendationSettingsPanel = new Panel(panelId, {
				headerToolbar: new OverflowToolbar(this.getId() + "--idRecommenedPanelToolbar", {
					content: [
						new Title({
							text: this._i18nBundle.getText("recommendationSettingsHeader"),
							level: "H3"
						})
					]
				}),
				expanded: true,
				expandable: true,
				content: [
					new Text({
						id: `${panelId}-container-subHeader`,
						text: this._i18nBundle.getText("recommendationSettingsSubHeader")
					}),
					new HBox({
						id: `${panelId}-container`,
						items: [
							new CheckBox({
								id: `${panelId}-container-checkBox`,
								selected: persData.showRecommendation ?? true,
								select: (event) => this.onRecommendationSettingChange(event),
								ariaLabelledBy: [`${panelId}-container-subHeader`, `${panelId}-container-label`]
							}),
							new Text({
								id: `${panelId}-container-label`,
								text: this._i18nBundle.getText("recommendationSettingsCheckboxLabel")
							})
						],
						alignItems: FlexAlignItems.Center
					}).addStyleClass("sapUiSmallMarginTop")
				]
			}).addStyleClass("sapUiSmallMarginTop");
		}
		return this._recommendationSettingsPanel;
	}

	/**
	 * Adds recommendation settings panel to the content vbox, if recommendation feature is enabled
	 * @returns {Promise<void>}
	 * @private
	 */
	private async _setRecommendationSettingsPanel() {
		this.oDetailPage.setBusy(true);
		const recommendationSettingsPanel = await this._getRecommendationSettingsPanel();
		if (recommendationSettingsPanel) {
			this.oContentVBox.addItem(recommendationSettingsPanel);
			this.oDetailPage.setBusy(false);
		}
	}

	/**
	 * Handles recommendation setting change
	 *
	 * @param {CheckBox$SelectEvent} event - checkbox select event
	 * @private
	 */
	private async onRecommendationSettingChange(event: CheckBox$SelectEvent) {
		const showRecommendation = event.getParameter("selected");
		this.oEventBus.publish("importChannel", "recommendationSettingChanged", { showRecommendation });
		const oPersData = await this._getPersonalizationData();
		void this.oPersonalizerInstance.write({ ...oPersData, showRecommendation });
	}
}
