/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/insights/CardHelper", "sap/m/Button", "sap/m/CheckBox", "sap/m/CustomListItem", "sap/m/HBox", "sap/m/IconTabBar", "sap/m/IconTabFilter", "sap/m/Input", "sap/m/Label", "sap/m/library", "sap/m/List", "sap/m/MessageStrip", "sap/m/MessageToast", "sap/m/ObjectStatus", "sap/m/OverflowToolbar", "sap/m/Panel", "sap/m/Text", "sap/m/Title", "sap/m/Toolbar", "sap/m/ToolbarSpacer", "sap/m/VBox", "sap/ui/core/Element", "sap/ui/core/EventBus", "sap/ui/core/library", "sap/ui/layout/form/SimpleForm", "sap/ui/model/json/JSONModel", "sap/ui/unified/FileUploader", "sap/ushell/Container", "./BaseSettingsPanel", "./utils/Accessibility", "./utils/AppManager", "./utils/Constants", "./utils/DataFormatUtils", "./utils/Device", "./utils/FESRUtil", "./utils/HttpHelper", "./utils/PageManager", "./utils/PersonalisationUtils", "./utils/UshellPersonalizer"], function (Log, CardHelper, Button, CheckBox, CustomListItem, HBox, IconTabBar, IconTabFilter, Input, Label, sap_m_library, List, MessageStrip, MessageToast, ObjectStatus, OverflowToolbar, Panel, Text, Title, Toolbar, ToolbarSpacer, VBox, Element, EventBus, sap_ui_core_library, SimpleForm, JSONModel, FileUploader, Container, __BaseSettingsPanel, ___utils_Accessibility, __AppManager, ___utils_Constants, ___utils_DataFormatUtils, ___utils_Device, ___utils_FESRUtil, __HttpHelper, __PageManager, __PersonalisationUtils, __UShellPersonalizer) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  const FlexAlignItems = sap_m_library["FlexAlignItems"];
  const ToolbarStyle = sap_m_library["ToolbarStyle"];
  const ValueState = sap_ui_core_library["ValueState"];
  const BaseSettingsPanel = _interopRequireDefault(__BaseSettingsPanel);
  const checkPanelExists = ___utils_Accessibility["checkPanelExists"];
  const AppManager = _interopRequireDefault(__AppManager);
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  const calculateDeviceType = ___utils_Device["calculateDeviceType"];
  const DeviceType = ___utils_Device["DeviceType"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  const HttpHelper = _interopRequireDefault(__HttpHelper);
  const PageManager = _interopRequireDefault(__PageManager);
  const PersonalisationUtils = _interopRequireDefault(__PersonalisationUtils);
  const UShellPersonalizer = _interopRequireDefault(__UShellPersonalizer);
  var ImportExportType = /*#__PURE__*/function (ImportExportType) {
    ImportExportType["IMPORT"] = "import";
    ImportExportType["EXPORT"] = "export";
    return ImportExportType;
  }(ImportExportType || {});
  const BASE_URL = "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/";
  const REPO_BASE_URL = BASE_URL + "insights_cards_repo_srv/0001/";
  const EXPORT_API = REPO_BASE_URL + "INSIGHTS_CARDS/com.sap.gateway.srvd.ui2.insights_cards_repo_srv.v0001.importExport?";
  const MYINSIGHT_SECTION_ID = "AZHJGRIT78TG7Y65RF6EPFJ9U";
  const NewsAndPagesContainerName = "sap.cux.home.NewsAndPagesContainer";
  const AppsContainerlName = "sap.cux.home.AppsContainer";
  const InsightsContainerName = "sap.cux.home.InsightsContainer";
  const PagePanelName = "sap.cux.home.PagePanel";
  const FavAppPanelName = "sap.cux.home.FavAppPanel";
  const RecommendedAppPanelName = "sap.cux.home.RecommendedAppPanel";
  const TilesPanelName = "sap.cux.home.TilesPanel";
  const CardsPanelName = "sap.cux.home.CardsPanel";

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
  const AdvancedSettingsPanel = BaseSettingsPanel.extend("sap.cux.home.AdvancedSettingsPanel", {
    metadata: {
      events: {
        sectionsImported: {}
      }
    },
    constructor: function _constructor(id, settings) {
      BaseSettingsPanel.prototype.constructor.call(this, id, settings);
    },
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      BaseSettingsPanel.prototype.init.call(this);

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
        const _this = this;
        void function () {
          try {
            if (!_this.oPageManagerInstance) {
              _this.oPageManagerInstance = PageManager.getInstance(PersonalisationUtils.getPersContainerId(_this._getPanel()), PersonalisationUtils.getOwnerComponent(_this._getPanel()));
            }

            // subscribe to all import events for all sections
            _this.oEventBus.subscribe("importChannel", "tilesImported", (channelId, eventId, data) => {
              const customData = data.status;
              //errorstate is false when import is successful
              _this.updateImportStatus("insightsTiles", !customData);
            }, _this);
            _this.oEventBus.subscribe("importChannel", "appsImported", (channelId, eventId, data) => {
              const customData = data.status;
              //errorstate is false when import is successful
              _this.updateImportStatus("favApps", !customData);
            }, _this);
            _this.oEventBus.subscribe("importChannel", "favPagesImported", (channelId, eventId, data) => {
              const customData = data.status;
              //errorstate is false when import is successful
              _this.updateImportStatus("pages", !customData);
            }, _this);
            _this.oEventBus.subscribe("importChannel", "cardsImported", (channelId, eventId, data) => {
              const customData = data.status;
              //errorstate is false when import is successful
              _this.updateImportStatus("insightsCards", !customData);
            }, _this);

            //get the detailPage of advanced settingspanel
            _this.oDetailPage = Element.getElementById(_this.getProperty("key") + "-detail-page");
            const layout = _this._getPanel();
            if (checkPanelExists(layout, AppsContainerlName, RecommendedAppPanelName) && calculateDeviceType() !== DeviceType.Mobile) {
              void _this._setRecommendationSettingsPanel();
            }

            //load user personalization data
            return Promise.resolve(_this.loadUserPersonalizationData()).then(function () {
              //import button set enabled/disabled based on sections selected
              _this.oImportBtn.setEnabled(_this.oUserPersonalization.import.sectionsSelected);
              _this.enableDisableActions(_this.oUserPersonalization.selectedTab);

              //set export and import list
              _this.setImportExportList();
              _this.oExportMessage.setText(_this.oUserPersonalization.export.errorMessage ? String(_this.oUserPersonalization.export.errorMessage) : "");
              _this.oExportMessage.setType(_this.oUserPersonalization.export.errorType);
              _this.oExportMessage.setProperty("visible", _this.oUserPersonalization.export.error, true);
              _this.oFileNameInput.setValue(String(_this.oUserPersonalization.export.fileName));
              _this.oImportMessage.setText(_this.oUserPersonalization.import.errorMessage ? String(_this.oUserPersonalization.import.errorMessage) : "");
              _this.oImportMessage.setType(_this.oUserPersonalization.import.errorType);
              _this.oImportMessage.setVisible(_this.oUserPersonalization.import.error);
            });
          } catch (e) {
            return Promise.reject(e);
          }
        }();
      });
    },
    setImportExportList: function _setImportExportList() {
      this.oExportList?.destroy();
      this.oExportList = this.setExportSectionList();
      this._importExportPanel.addContent(this.oExportList);
      if (!this.oImportList) {
        this.oImportList = this.setImportSectionList();
        this._importExportPanel.addContent(this.oImportList);
      } else {
        this.oImportList.invalidate();
      }
    },
    /**
     *
     * @param sType selected tab type
     * Set import / export button enable property and selectedkey of importexport tab
     */
    enableDisableActions: function _enableDisableActions(sType) {
      this.oImportExportTab?.setSelectedKey(sType);
      this.oImportBtn?.setVisible(sType === ImportExportType.IMPORT);
      this.oExportBtn?.setVisible(sType === ImportExportType.EXPORT);
      if (this.oUserPersonalization.import.sectionsSelected && sType === ImportExportType.IMPORT) {
        this.oImportBtn.setEnabled(true);
      } else {
        this.oImportBtn.setEnabled(false);
      }
      if (sType === ImportExportType.EXPORT && this.oUserPersonalization.export.fileName && this.oUserPersonalization.export.sections?.length && this.oUserPersonalization.export.sectionsSelected) {
        this.oExportBtn.setEnabled(true);
      } else {
        this.oExportBtn.setEnabled(false);
      }
    },
    /**
     *
     * @param sType selected tab type
     * Set import/ export message values
     */
    setExportImportValues: function _setExportImportValues(sType) {
      if (sType === ImportExportType.EXPORT) {
        this.oExportMessage.setText(this.oUserPersonalization.export.errorMessage ? String(this.oUserPersonalization.export.errorMessage) : "");
        this.oExportMessage.setType(this.oUserPersonalization.export.errorType);
        this.oExportMessage.setProperty("visible", this.oUserPersonalization.export.error, true);
      } else if (sType === ImportExportType.IMPORT) {
        this.oImportMessage.setText(this.oUserPersonalization.import.errorMessage ? String(this.oUserPersonalization.import.errorMessage) : "");
        this.oImportMessage.setType(this.oUserPersonalization.import.errorType);
        this.oImportMessage.setProperty("visible", this.oUserPersonalization.import.error);
      }
    },
    /**
     * Sets the outer content VBox for the Advanced Settings Panel.
     * @returns VBox
     */
    getContent: function _getContent() {
      if (!this.oContentVBox) {
        this.oContentVBox = new VBox(this.getId() + "--idAdvancedVBox", {
          items: [new Text(this.getId() + "--idPersonalizationSubheader", {
            text: this._i18nBundle.getText("advancedSettingsSubheader")
          }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginTop"), this._getImportExportPanel()]
        });
      }
      return this.oContentVBox;
    },
    /**
     * Returns the import/export panel.
     *
     * @private
     * @returns {Panel} The import/export panel.
     */
    _getImportExportPanel: function _getImportExportPanel() {
      if (!this._importExportPanel) {
        this._importExportPanel = new Panel(`${this.getId()}-importExportPanel`, {
          headerToolbar: new OverflowToolbar(`${this.getId()}-importExportPanelToolbar`, {
            style: ToolbarStyle.Clear,
            content: [new Title(`${this.getId()}-importExportPanelToolbarText`, {
              text: this._i18nBundle.getText("importAndExportPanelHeader"),
              level: "H3"
            }), new ToolbarSpacer(`${this.getId()}-importExportPanelToolbarSpacer`), this._getImportButton(), this._getExportButton()]
          }),
          headerText: this._i18nBundle.getText("importAndExportPanelHeader"),
          expanded: true,
          expandable: true,
          content: []
        }).addStyleClass("sapUiSmallMarginTop");
      }
      return this._importExportPanel;
    },
    /**
     * Returns the import button.
     *
     * @private
     * @returns {Button} import button.
     */
    _getImportButton: function _getImportButton() {
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
    },
    /**
     * Returns the export button.
     *
     * @private
     * @returns {Button} export button.
     */
    _getExportButton: function _getExportButton() {
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
    },
    /**
     * Returns the inner content for the Advanced Settings Panel.
     *
     * @private
     * @returns {Control} The control containing the Advanced Settings Panel content.
     */
    addInnerContent: function _addInnerContent() {
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
        const exportText = new Text(this.getId() + "--idExportText", {
          text: this._i18nBundle.getText("exportText")
        }).addStyleClass("advancePadding");
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
        const importText = new Text(this.getId() + "--idImportText", {
          text: this._i18nBundle.getText("importText")
        }).addStyleClass("advancePadding");
        const importSimpleForm = new SimpleForm(this.getId() + "--idImportSimpleForm", {
          editable: true,
          layout: "ResponsiveGridLayout",
          labelSpanS: 4,
          labelSpanM: 4
        });
        const fileUploader = new FileUploader(this.getId() + "--idImportFileUploader", {
          tooltip: this._i18nBundle.getText("uploadImportFile"),
          fileType: ["txt"],
          change: oEvent => {
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
    },
    /**
     *
     * @returns {List} export section list
     */
    setExportSectionList: function _setExportSectionList() {
      const exportSectionsList = new List(`${this.getId()}--exportSectionsList`, {
        width: "calc(100% - 2rem)",
        growingThreshold: 50,
        includeItemInSelection: true,
        visible: "{= ${advsettings>/selectedTab} === 'export'}"
      }).addStyleClass("sapUiSmallMarginBegin");
      const headerToolbar = new Toolbar(`${this.getId()}--exportSectionsListToolbar`, {
        content: [new Title(this.getId() + "--idExportSectionsListHeaderText", {
          text: this._i18nBundle.getText("sectionExportListHeader"),
          level: "H4"
        }).addStyleClass("sectionTitle")]
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
            parts: [{
              path: "advsettings>enabled"
            }, {
              path: "advsettings>selected"
            }, {
              path: "advsettings>title"
            }],
            formatter: this._formatAccDescription.bind(this)
          },
          content: [new HBox(recycleId(`${this.getId()}--exportContentBox`), {
            alignItems: "Center",
            items: [new CheckBox(recycleId(`${this.getId()}--exportListItemCheck`), {
              select: this.onSectionsSelectionChange.bind(this, false),
              selected: "{advsettings>selected}",
              enabled: "{advsettings>enabled}"
            }), new Text(recycleId(`${this.getId()}--exportListItemText`), {
              text: "{advsettings>title}"
            })],
            width: "100%"
          })]
        })
      });
      this.oExportList = exportSectionsList;
      return exportSectionsList;
    },
    /**
     * Returns an accessibility description string for a list item.
     *
     * @param enabled Indicates if the checkbox is enabled.
     * @param selected Indicates if the checkbox is selected (checked).
     * @param title The title of the list item.
     * @returns The formatted accessibility description.
     */
    _formatAccDescription: function _formatAccDescription(enabled, selected, title) {
      const statusText = !enabled ? `${this._i18nBundle.getText("checkboxDisabledText")}.` : "";
      const selectionText = selected ? this._i18nBundle.getText("checkboxCheckedText") : this._i18nBundle.getText("checkboxUnCheckedText");
      const instructionText = this._i18nBundle.getText("checkboxInstructionText");
      return `${statusText}${selectionText}. ${title}. ${instructionText}`;
    },
    _isPanelAvailable: function _isPanelAvailable(panelClassName) {
      const panelMappings = {
        [FavAppPanelName]: {
          containerName: AppsContainerlName,
          panelName: FavAppPanelName
        },
        [PagePanelName]: {
          containerName: NewsAndPagesContainerName,
          panelName: PagePanelName
        },
        [TilesPanelName]: {
          containerName: InsightsContainerName,
          panelName: TilesPanelName
        },
        [CardsPanelName]: {
          containerName: InsightsContainerName,
          panelName: CardsPanelName
        }
      };
      const mapping = panelMappings[panelClassName];
      if (!mapping) return false;
      const layout = this._getPanel();
      return checkPanelExists(layout, mapping.containerName, mapping.panelName);
    },
    /**
     *
     * @returns {List} import section list
     */
    setImportSectionList: function _setImportSectionList() {
      const importSectionsList = new List(this.getId() + "--idImportSectionsList", {
        width: "calc(100% - 2rem)",
        growingThreshold: 50,
        includeItemInSelection: true,
        visible: "{= ${advsettings>/selectedTab} === 'import' && (${advsettings>/import/sections/length} > 0 || ${advsettings>/showNoImport})}"
      }).addStyleClass("sapUiSmallMarginBegin");
      const headerToolbar = new Toolbar(this.getId() + "--idImportSectionsListToolbar", {
        content: [new Title(`${this.getId()}--importSectionsListHeaderText`, {
          text: this._i18nBundle.getText("sectionImportListHeader")
        }).addStyleClass("sectionTitle")]
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
          content: [new HBox(`${this.getId()}--importListCheckBox`, {
            justifyContent: "SpaceBetween",
            items: [new HBox(`${this.getId()}--importListItemCheckHBox`, {
              items: [new CheckBox(`${this.getId()}--importListItemCheck`, {
                select: this.onSectionsSelectionChange.bind(this, true),
                selected: "{advsettings>selected}",
                enabled: "{advsettings>enabled}"
              }), new Text(`${this.getId()}--importListItemText`, {
                text: "{advsettings>title}"
              }).addStyleClass("sapUiTinyMarginTop")]
            }), new HBox(`${this.getId()}--importStatusHBox`, {
              items: [new ObjectStatus(`${this.getId()}--importItemStatus`, {
                icon: "{= ${advsettings>status} === 'Success' ? 'sap-icon://status-positive' : 'sap-icon://status-negative' }",
                state: "{advsettings>status}",
                visible: "{= ${advsettings>status} !== 'None'}"
              }).addStyleClass("sapUiSmallMarginEnd sapUiTinyMarginTop")]
            })],
            width: "100%"
          })]
        })
      });
      return importSectionsList;
    },
    /**
     * Selection change event handler for export and import sections
     * @param isImport boolean value to check if import or export tab is selected
     */
    onSectionsSelectionChange: function _onSectionsSelectionChange(isImport) {
      const allSections = isImport ? this.oImportList.getItems() : this.oExportList.getItems();
      let isSelected = false;
      let content, innerCheckbox;
      const isSectionSelected = allSections.some(function (oSection) {
        if (!isImport) {
          content = oSection.getAggregation("content");
          innerCheckbox = content[0].getItems()[0];
          isSelected = innerCheckbox.getSelected();
        } else {
          content = oSection.getAggregation("content");
          const innerHbox = content[0].getItems()[0];
          innerCheckbox = innerHbox.getItems()[0];
          isSelected = innerCheckbox.getSelected();
        }
        return isSelected;
      });
      this.oControlModel.setProperty((isImport ? "/import" : "/export") + "/sectionsSelected", isSectionSelected);
      this.enableDisableActions(isImport ? "import" : "export");
    },
    /**
     * Handler for import button press
     *
     */
    onImportPress: function _onImportPress() {
      try {
        const _this2 = this;
        _this2.attachEvent("sectionsImported", () => {
          _this2.oDetailPage.setBusy(false);
          _this2.oControlModel.setProperty("/import/sectionsSelected", false);
        });
        _this2.oImportBtn.setEnabled(false);
        _this2.oDetailPage.setBusy(true);
        _this2.handleUserPersonalizationError(ImportExportType.IMPORT, false, "", "");
        const oExportData = _this2.oUserPersonalization.import.data;
        const _temp = _catch(function () {
          return Promise.resolve(_this2.importSections(oExportData)).then(function (aSelectedSections) {
            const bShowError = aSelectedSections.some(oSection => {
              return oSection.status === ValueState.Error;
            });
            if (bShowError) {
              _this2.handleUserPersonalizationError(ImportExportType.IMPORT, true, String(_this2._i18nBundle.getText("userPersonalizationImportError")), "Warning");
            }
            _this2.oControlModel.setProperty("/import/sections", aSelectedSections);
          });
        }, function (oErr) {
          Log.error("importpress", String(oErr));
          _this2.handleUserPersonalizationError(ImportExportType.IMPORT, true, String(_this2._i18nBundle.getText("userPersonalizationImportError")), "Error");
        });
        return Promise.resolve(_temp && _temp.then ? _temp.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Invokes import of apps,tiles,pages and cards data
     * @param oImportData import data
     * @returns Promise<IExportSections[]>
     */
    importSections: function _importSections(oImportData) {
      const sectionImportChain = [];
      const aPromise = [];
      const oSelectedSections = this.oControlModel.getProperty("/import/sections");
      sectionImportChain.push(() => this.importApps(oImportData));
      sectionImportChain.push(() => this.importTiles(oImportData));
      sectionImportChain.push(() => this.importFavPages(oImportData));

      // Execute apps, tiles, and pages sequentially
      aPromise.push(sectionImportChain.reduce((chain, current) => {
        return chain.then(() => current());
      }, Promise.resolve()));
      aPromise.push(this.importCards(oImportData));
      return Promise.all(aPromise).then(() => {
        return oSelectedSections;
      }).catch(oError => {
        Log.error("import failed", String(oError));
        return [];
      });
    },
    importApps: function _importApps(oImportData) {
      return new Promise(resolve => {
        const oSelectedSections = this.oControlModel.getProperty("/import/sections");
        if (oImportData?.apps && oImportData?.apps.length > 0 && this.isSectionSelected(oSelectedSections, String(this._i18nBundle.getText("favApps")))) {
          this.oSectionsImported[String(this._i18nBundle.getText("favApps"))] = false;
          this.oEventBus.publish("importChannel", "appsImport", {
            apps: oImportData.apps,
            groupInfo: oImportData.groupInfo
          });
          resolve();
        } else {
          // if no apps / apps selected then resolve the promise and mark the section as imported
          this.oSectionsImported[String(this._i18nBundle.getText("favApps"))] = true;
          this.updateImportStatus("favApps");
          resolve(); // Resolve the promise if condition doesn't meet
        }
      });
    },
    importTiles: function _importTiles(oImportData) {
      return new Promise(resolve => {
        const oSelectedSections = this.oControlModel.getProperty("/import/sections");
        if (oImportData?.tiles && oImportData.tiles.length > 0 && this.isSectionSelected(oSelectedSections, String(this._i18nBundle.getText("insightsTiles")))) {
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
    },
    importFavPages: function _importFavPages(oImportData) {
      return new Promise(resolve => {
        const oSelectedSections = this.oControlModel.getProperty("/import/sections");
        if (oImportData?.favouritePages && oImportData.favouritePages.length > 0 && this.isSectionSelected(oSelectedSections, String(this._i18nBundle.getText("pages")))) {
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
    },
    importCards: function _importCards(oImportData) {
      return new Promise(resolve => {
        const oSelectedSections = this.oControlModel.getProperty("/import/sections");
        if (oImportData?.cards && oImportData.cards.length > 0 && this.isSectionSelected(oSelectedSections, String(this._i18nBundle.getText("insightsCards")))) {
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
    },
    /**
     *  Updates status of sections being imported
     *	@param {string} sSectionTitle - section title
     * 	@param {boolean} errorState - error state
     * 	@returns {void}
     */
    updateImportStatus: function _updateImportStatus(sSectionTitle, errorState) {
      const sSectionId = String(this._i18nBundle.getText(sSectionTitle));
      const oSelectedSections = this.oControlModel.getProperty("/import/sections");
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
      const imported = sectionTitles.every(sTitle => {
        return this.oSectionsImported[sTitle];
      });
      if (imported) {
        this.fireEvent("sectionsImported");
      }
    },
    /**
     *  Resets the import model values
     *  @param {boolean} onOpen - value to show if the reset call is happening while opening the dialog for the first time
     * 	@private
     */
    resetImportModel: function _resetImportModel(onOpen) {
      this.oControlModel.setProperty("/import/sections", []);
      this.oControlModel.setProperty("/import/sectionsSelected", false);
      this.oControlModel.setProperty("/import/error", false);
      // if called on settingsdialog open , reset value of selectedtab and fileUploader value
      if (onOpen) {
        this.oControlModel.setProperty("/selectedTab", "export");
        Element.getElementById(this.getId() + "--idImportFileUploader")?.setValue("");
      }
    },
    /**
     * 	Find visualizations that are not already present in the favsections
     * @param aImportedSections
     * @returns {Promise<ISection[] | []>} aImportedSections
     */
    getDeltaSectionViz: function _getDeltaSectionViz(aImportedSections) {
      try {
        const _this3 = this;
        return Promise.resolve(_catch(function () {
          return Promise.resolve(_this3.oAppManagerInstance._getSections(true)).then(function (favSections) {
            aImportedSections.forEach(oImportedSection => {
              let oSection;
              if (oImportedSection.default) {
                oSection = favSections.find(oSec => oSec.default);
              } else {
                oSection = favSections.find(oSec => oSec.id === oImportedSection.id);
              }
              if (oSection) {
                // find visualizations that are not already present in the favsections
                const aDelta = oImportedSection.visualizations?.filter(oImportViz => {
                  return oSection.visualizations?.every(oViz => oViz.isBookmark ? oViz.targetURL !== oImportViz.targetURL : oViz.vizId !== oImportViz.vizId);
                });
                oImportedSection.visualizations = aDelta;
              }
            });
            // Remove Sections with no visualizations
            aImportedSections = aImportedSections.filter(oSection => oSection.visualizations && oSection.visualizations.length > 0);
            return aImportedSections;
          });
        }, function (error) {
          Log.error("Error occurred while fetching delta section visualizations:" + String(error));
          return []; // Return an empty array in case of error
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    getDeltaAuthSectionViz: function _getDeltaAuthSectionViz(aImportedSections) {
      // Get delta visualization
      if (aImportedSections && aImportedSections.length) {
        return this.getDeltaSectionViz(aImportedSections).then(aDeltaSections => {
          // Filter authorized section visualizations
          return this.filterAuthSectionViz(aDeltaSections);
        }).catch(oError => {
          Log.error(String(oError));
          return [];
        });
      }
      return Promise.resolve([]); // Return a promise resolving to void
    },
    filterAuthSectionViz: function _filterAuthSectionViz(aSections) {
      try {
        const _getCatalogApps = function () {
          return Container.getServiceAsync("SearchableContent").then(function (SearchableContent) {
            return SearchableContent.getApps({
              includeAppsWithoutVisualizations: false
            });
          });
        };
        const _filterAuthViz = function (aAppCatalog, aViz) {
          const aSectionViz = [];
          aViz?.forEach(function (oViz) {
            for (let appCatalog of aAppCatalog) {
              const oAppCatalog = appCatalog;
              const oSectionViz = oAppCatalog.visualizations.find(function (oCatalogViz) {
                return oCatalogViz.vizId === oViz.vizId || oViz.isBookmark && oCatalogViz.target && oViz.target?.action === oCatalogViz.target.action && oViz.target?.semanticObject === oCatalogViz.target.semanticObject;
              });
              if (oSectionViz) {
                oSectionViz.displayFormatHint = oViz.displayFormatHint !== "standard" ? String(oViz.displayFormatHint) : String(oSectionViz.displayFormatHint);
                oSectionViz.id = String(oViz.id ?? oSectionViz.id);
                aSectionViz.push(oViz.isBookmark ? oViz : oSectionViz);
                break;
              }
            }
          });
          return aSectionViz;
        };
        return Promise.resolve(_getCatalogApps().then(function (aAppCatalog) {
          return aSections.map(function (oSection) {
            oSection.visualizations = _filterAuthViz(aAppCatalog, oSection.visualizations);
            return oSection;
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Filter authorized favorite pages
     *
     * @param {Array} aFavPages - array of favorite pages
     * @returns {Promise} resolves to an array of authorized pages
     */
    filterAuthFavPages: function _filterAuthFavPages(aFavPages) {
      try {
        let _exit = false;
        const _this4 = this;
        function _temp3(_result) {
          return _exit ? _result : Promise.resolve([]);
        }
        const _temp2 = function () {
          if (aFavPages && aFavPages.length > 0) {
            return Promise.resolve(_this4.oPageManagerInstance.fetchAllAvailablePages().then(function (aAvailablePages) {
              return aFavPages.filter(function (oimportedPage) {
                return aAvailablePages.filter(function (oAvailabePage) {
                  return oAvailabePage.pageId === oimportedPage.pageId && oAvailabePage.spaceId === oimportedPage.spaceId;
                }).length;
              });
            })).then(function (_await$_this4$oPageMa) {
              _exit = true;
              return _await$_this4$oPageMa;
            });
          }
        }();
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Filter authorized cards
     *
     * @param {Array} aCards - array of cards
     * @returns {Promise} resolves to an array of authorized cards
     */
    filterAuthCards: function _filterAuthCards(aCards) {
      try {
        let _exit2 = false;
        function _temp5(_result2) {
          return _exit2 ? _result2 : Promise.resolve([]);
        }
        const _getParentApp = function (aAvailableApps, oCard) {
          return aAvailableApps.find(function (oApp) {
            return oApp.resolutionResult && oApp.resolutionResult.applicationDependencies && oCard["sap.insights"] && oApp.resolutionResult.applicationDependencies.name === oCard["sap.insights"].parentAppId;
          });
        };
        const _isNavigationSupported = function (oService, oParentApp) {
          if (oParentApp) {
            return oService.isNavigationSupported([{
              target: {
                semanticObject: oParentApp.semanticObject,
                action: oParentApp.action
              }
            }]).then(function (aResponses) {
              return aResponses[0].supported || false;
            });
          }
          return Promise.resolve(false);
        };
        const _temp4 = function () {
          if (aCards && aCards.length > 0) {
            return Promise.resolve(Promise.all([Container.getServiceAsync("ClientSideTargetResolution"), Container.getServiceAsync("Navigation")]).then(function (aServices) {
              const clientSideTargetResolution = aServices[0];
              const Navigation = aServices[1];
              const aAvailableApps = clientSideTargetResolution._oAdapter._aInbounds || [];
              return aCards.reduce(function (promise, oCard) {
                return Promise.resolve(promise).then(function (aAuthCards) {
                  const oParentApp = _getParentApp(aAvailableApps, oCard);
                  return Promise.resolve(_isNavigationSupported(Navigation, oParentApp)).then(function (bIsNavigationSupported) {
                    if (bIsNavigationSupported) {
                      aAuthCards.push(oCard);
                    }
                    return aAuthCards;
                  });
                });
              }, Promise.resolve([]));
            })).then(function (_await$Promise$all$th) {
              _exit2 = true;
              return _await$Promise$all$th;
            });
          }
        }();
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Handles change event for fileuploader on import file
     *
     * @returns {Promise} resolves to available import sections being shown
     */
    onFileImport: function _onFileImport(oEvent) {
      this.handleUserPersonalizationError(ImportExportType.IMPORT, false, "", "");
      this.resetImportModel();
      this.oDetailPage.setBusy(true);
      const files = oEvent.getParameter("files");
      const oFile = files && files[0];
      return this.readFileContent(oFile).then(oFileContent => {
        // btoa doesn't support the characters outside latin-1 range, so first encode to utf-8
        const oEncodedFileContent = window.btoa(encodeURIComponent(oFileContent).replace(/%([0-9A-F]{2})/g, function (match, p1) {
          return String.fromCharCode(parseInt(p1, 16)); // Convert p1 to a number using parseInt //String.fromCharCode("0x" + p1);
        }));
        return HttpHelper.Post(EXPORT_API, {
          fileContent: oEncodedFileContent
        }).then(oResponse => {
          if (oResponse && oResponse.error) {
            throw new Error(oResponse.error);
          }
          if (oResponse && oResponse.value && oResponse.value.length) {
            const oImportDataString = oResponse.value[0].fileContent;

            // Parse the stringified JSON into the defined type
            const oImportData = JSON.parse(oImportDataString);
            if (oImportData.host === window.location.host) {
              const aImportedSections = oImportData.sections || [];
              aImportedSections.push({
                id: MYINSIGHT_SECTION_ID,
                visualizations: oImportData.tiles || []
              });
              //filter authorized data
              return this.filterAuthorizedImportData(aImportedSections, oImportData);
            } else {
              this.handleUserPersonalizationError(ImportExportType.IMPORT, true, String(this._i18nBundle.getText("importSourceErrorMessage")), "");
              return Promise.resolve();
            }
          }
        });
      }).catch(oError => {
        Log.error(String(oError));
        this.handleUserPersonalizationError(ImportExportType.IMPORT, true, "", "");
      }).finally(() => {
        this.oDetailPage.setBusy(false);
        this.enableDisableActions(ImportExportType.IMPORT);
      });
    },
    filterAuthorizedImportData: function _filterAuthorizedImportData(aImportedSections, oImportData) {
      try {
        const _this5 = this;
        let promises = [_this5.getDeltaAuthSectionViz(aImportedSections), _this5.filterAuthFavPages(oImportData.favouritePages)];
        return Promise.resolve(_this5.isInsightsEnabled()).then(function (_this5$isInsightsEnab) {
          if (_this5$isInsightsEnab) {
            promises.push(_this5.filterAuthCards(oImportData.cards));
            promises.push(_this5.getInsightCards()); // check : send only cards count here as all cards are not required
          }
          return Promise.all(promises).then(function (aResponse) {
            try {
              const aAuthSections = aResponse[0];
              const aAuthFavPages = aResponse[1];
              const aAuthCards = aResponse[2] || [];
              const iInsightCardsCount = aResponse[3]?.getProperty("/cardCount") || 0;
              oImportData.apps = aAuthSections.filter(function (oSection) {
                return oSection.id !== MYINSIGHT_SECTION_ID;
              });
              oImportData.tiles = (aAuthSections.find(function (oSection) {
                return oSection.id === MYINSIGHT_SECTION_ID;
              }) || {}).visualizations || [];
              oImportData.favouritePages = aAuthFavPages;
              oImportData.cards = aAuthCards || [];
              const iTotalCardCount = iInsightCardsCount + Number(aAuthCards?.length);
              if (iTotalCardCount > 99) {
                _this5.handleUserPersonalizationError(ImportExportType.IMPORT, true, String(_this5._i18nBundle.getText("importCardCountErrorMessage")), "");
              }
              return Promise.resolve(_this5.getImportedSections(oImportData, ImportExportType.IMPORT, iInsightCardsCount)).then(function (aSections) {
                aSections = aSections.map(function (oSection) {
                  oSection.status = ValueState.None;
                  return oSection;
                });
                _this5.oUserPersonalization.import.data = oImportData;
                _this5.oControlModel.setProperty("/import/sections", aSections);
                _this5.oControlModel.setProperty("/import/sectionsSelected", _this5.getSelectedSections(aSections).length > 0);
                _this5.oControlModel.setProperty("/showNoImport", aSections.length === 0);
              });
            } catch (e) {
              return Promise.reject(e);
            }
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    readFileContent: function _readFileContent(oFile) {
      return new Promise(function (resolve, reject) {
        if (oFile && window.FileReader) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const target = event.target;
            resolve(target?.result);
          };
          // Convert oFile to Blob
          const blob = oFile;
          reader.readAsText(blob);
        } else {
          reject(new Error("Error"));
        }
      });
    },
    _getPersonalizationData: function _getPersonalizationData() {
      try {
        const _this6 = this;
        function _temp7() {
          return Promise.resolve(_this6.oPersonalizerInstance.read()).then(function (_this6$oPersonalizerI) {
            _this6.persData = _this6$oPersonalizerI || {};
            return _this6.persData;
          });
        }
        const _temp6 = function () {
          if (!_this6.oPersonalizerInstance) {
            return Promise.resolve(UShellPersonalizer.getInstance(PersonalisationUtils.getPersContainerId(_this6._getPanel()), PersonalisationUtils.getOwnerComponent(_this6._getPanel()))).then(function (_UShellPersonalizer$g) {
              _this6.oPersonalizerInstance = _UShellPersonalizer$g;
            });
          }
        }();
        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(_temp7) : _temp7(_temp6));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    loadUserPersonalizationData: function _loadUserPersonalizationData() {
      try {
        const _this7 = this;
        _this7.oExportList.setBusy(true);
        return Promise.resolve(_this7._getPersonalizationData()).then(function (persData) {
          let promises = [_this7.oAppManagerInstance._getSections(true)];
          return Promise.resolve(_this7.isInsightsEnabled()).then(function (_this7$isInsightsEnab) {
            if (_this7$isInsightsEnab) {
              promises.push(_this7.getInsightCards());
            }
            // load all sections, insight apps and cards
            return Promise.resolve(Promise.all(promises)).then(function (_Promise$all) {
              const [favSections, insightModel] = _Promise$all;
              const aSections = favSections,
                favApps = aSections.filter(oSection => {
                  return oSection.id !== MYINSIGHT_SECTION_ID && oSection.visualizations?.length;
                });
              const insightTiles = aSections.find(oSection => {
                return oSection.id === MYINSIGHT_SECTION_ID;
              })?.visualizations || [];
              const insightCards = insightModel && insightModel.getProperty("/visibleCards") ? insightModel.getProperty("/visibleCards").map(oCard => {
                return oCard.descriptorContent;
              }) : [];
              const oExportData = {
                apps: favApps,
                tiles: insightTiles,
                favouritePages: persData.favouritePages,
                cards: insightCards,
                personalization: persData
              };
              return Promise.resolve(_this7.getImportedSections(oExportData, ImportExportType.EXPORT, 0)).then(function (aExportSections) {
                _this7.oUserPersonalization.export.data = oExportData;
                _this7.oUserPersonalization.export.sections = aExportSections;
                _this7.oUserPersonalization.export.sectionsSelected = _this7.getSelectedSections(aExportSections).length > 0;
                _this7.oControlModel.refresh();
                _this7.oExportList.setBusy(false);
              });
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Checks if insights is enabled for the system
     *
     * @private
     * @returns {boolean}
     */
    isInsightsEnabled: function _isInsightsEnabled() {
      try {
        let _exit3 = false;
        return Promise.resolve(_catch(function () {
          let _exit4 = false;
          return Promise.resolve(CardHelper.getServiceAsync()).then(function (_getServiceAsync) {
            if (_getServiceAsync) {
              _exit3 = true;
              return true;
            }
            return false;
          });
        }, function (error) {
          Log.error(error instanceof Error ? error.message : String(error));
          return false;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Returns selected sections out of provided sections
     *
     * @param {Array} aSections - array of sections to show in import/export
     * @returns {Array} array of selected sections
     */
    getSelectedSections: function _getSelectedSections(aSections) {
      return aSections.filter(function (oSection) {
        return oSection.selected && oSection.enabled;
      }) || [];
    },
    /**
     * Returns if section is selected
     *
     * @param {Array} oSections - import/export sections
     * @param {String} sSectionId - import/export section id
     * @returns {boolean} returns true if section is selected
     */
    isSectionSelected: function _isSectionSelected(sections, sectionId) {
      const section = sections.find(function (sec) {
        return sec.title === sectionId;
      });
      return !!(section && section.selected && section.enabled);
    },
    /**
     * Returns import/export sections
     *
     * @param {object} oData - export/import data
     * @param {ImportExportType} sType - export/import type
     * @param {number} iInsightCardsCount - cards count
     * @returns {Array} array of import/export sections
     */
    getImportedSections: function _getImportedSections(oData, sType, iInsightCardsCount) {
      try {
        const _this8 = this;
        function _temp9(aFavPages) {
          const isAppViz = oData.apps && oData.apps.some(function (oSections) {
            return oSections && oSections.visualizations && oSections.visualizations.length > 0;
          });
          const sections = [{
            title: _this8._i18nBundle.getText("favApps"),
            selected: isAppViz,
            enabled: isAppViz,
            panelClass: FavAppPanelName
          }, {
            title: _this8._i18nBundle.getText("pages"),
            selected: aFavPages?.length > 0,
            enabled: aFavPages?.length > 0,
            panelClass: PagePanelName
          }, {
            title: _this8._i18nBundle.getText("insightsTiles"),
            selected: oData.tiles && oData.tiles.length > 0,
            enabled: oData.tiles && oData.tiles.length > 0,
            panelClass: TilesPanelName
          }];
          return Promise.resolve(_this8.isInsightsEnabled()).then(function (_this8$isInsightsEnab) {
            if (_this8$isInsightsEnab) {
              sections.push({
                title: _this8._i18nBundle.getText("insightsCards"),
                selected: oData.cards && oData.cards.length > 0 && oData.cards.length + iInsightCardsCount <= 99,
                enabled: oData.cards && oData.cards.length > 0 && oData.cards.length + iInsightCardsCount <= 99,
                panelClass: CardsPanelName
              });
            }
            return sections;
          });
        }
        const _temp8 = sType === ImportExportType.IMPORT;
        return Promise.resolve(_temp8 ? Promise.resolve(_this8.getDeltaFavPages(oData.favouritePages)).then(_temp9) : _temp9(oData.favouritePages));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    getDeltaFavPages: function _getDeltaFavPages(aImportedFavPages) {
      try {
        const _this9 = this;
        return Promise.resolve(_this9._getPersonalizationData()).then(function (persData) {
          const aFavPages = persData.favouritePages || [];
          return aFavPages.length !== aImportedFavPages.length ? aImportedFavPages : aImportedFavPages.filter(function (oImportedPage) {
            return !aFavPages.find(function (oFavPage) {
              return oImportedPage.pageId === oFavPage.pageId && oImportedPage.spaceId === oFavPage.spaceId;
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    getInsightCards: function _getInsightCards() {
      try {
        const _this0 = this;
        return Promise.resolve(_catch(function () {
          return Promise.resolve(CardHelper.getServiceAsync()).then(function (_getServiceAsync2) {
            _this0.cardHelperInstance = _getServiceAsync2;
            return Promise.resolve(_this0.cardHelperInstance._getUserAllCardModel()).then(function (oUserVisibleCardModel) {
              const aCards = oUserVisibleCardModel.getProperty("/cards");
              const aVisibleCards = aCards.filter(function (oCard) {
                return oCard.visibility;
              });
              oUserVisibleCardModel.setProperty("/visibleCards", aVisibleCards);
              return oUserVisibleCardModel;
            });
          });
        }, function (error) {
          // Handle any errors

          throw error; // Re-throw the error to be handled by the caller
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Handles export button press
     */
    onExportPress: function _onExportPress() {
      this.handleUserPersonalizationError(ImportExportType.EXPORT, false, "", "");
      const oExportFileName = this.oControlModel.getProperty("/export/fileName"),
        aExportSections = this.oControlModel.getProperty("/export/sections"),
        oExportData = this.oUserPersonalization.export.data;
      const oExportFileContent = this.getExportFileContent(oExportData, aExportSections);
      sap.ui.require(["sap/ui/core/util/File"], File => {
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
    },
    getExportFileContent: function _getExportFileContent(exportData, exportSections) {
      const oPersonalization = exportData?.personalization,
        oExportFileContent = {
          host: window.location.host,
          createdDate: new Date(),
          sections: [],
          groupInfo: [],
          tiles: [],
          cards: [],
          favouritePages: []
        };
      if (this.isSectionSelected(exportSections, this._i18nBundle.getText("favApps"))) {
        oExportFileContent.sections = exportData?.apps || [];
        oExportFileContent.groupInfo = oPersonalization?.favoriteApps || [];
      }
      if (this.isSectionSelected(exportSections, this._i18nBundle.getText("pages"))) {
        oExportFileContent.favouritePages = oPersonalization?.favouritePages || [];
      }
      if (this.isSectionSelected(exportSections, this._i18nBundle.getText("insightsTiles"))) {
        oExportFileContent.tiles = exportData?.tiles || [];
      }
      if (this.isSectionSelected(exportSections, this._i18nBundle.getText("insightsCards"))) {
        oExportFileContent.cards = this.filterNonSensitiveCards(exportData?.cards || []);
      }
      return oExportFileContent;
    },
    /**
     * Filters out the sensitive cards from the import data
     *
     * @private
     * @param {ICardManifest[]} cards Array of card to filter out before import
     * @returns {ICardManifest[]} Array of filtered cards
     */
    filterNonSensitiveCards: function _filterNonSensitiveCards(cards) {
      const nonSensitiveCards = [];
      cards.forEach(oCard => {
        if (oCard["sap.card"]?.configuration?.parameters) {
          const parameter = oCard["sap.card"].configuration.parameters;
          let sensitiveProps = [];
          sensitiveProps = sensitiveProps.concat(this.getSensitiveProps(parameter.headerState)).concat(this.getSensitiveProps(parameter.lineItemState)).concat(this.getSensitiveProps(parameter.state));
          if (sensitiveProps.length === 0) {
            nonSensitiveCards.push(oCard);
          }
        } else {
          nonSensitiveCards.push(oCard);
        }
      });
      if (cards.length !== nonSensitiveCards.length) {
        this.handleUserPersonalizationError(ImportExportType.EXPORT, true, String(this._i18nBundle.getText("exportSensitiveCardsErrorMessage")), "Warning");
      }
      return nonSensitiveCards;
    },
    /**
     * Finds the sensitive properties and parameters
     *
     * @private
     * @param {({ value: string } | undefined)} param
     * @returns {string[]} Array of sensitive props as strings
     */
    getSensitiveProps: function _getSensitiveProps(param) {
      let paramSensitiveProps = [];
      if (param?.value) {
        const paramValue = JSON.parse(param.value);
        const sensitiveProp = paramValue.sensitiveProps || Object.keys(paramValue.parameters?.ibnParams?.sensitiveProps || {});
        if (sensitiveProp.length > 0) {
          paramSensitiveProps = paramSensitiveProps.concat(sensitiveProp);
        }
      }
      return paramSensitiveProps;
    },
    /**
     * Handles user personalization error, shows the error msg and reset values
     *
     * @param {string} sType - type of import/export
     * @param {boolean} bShowError - flag to show or hide error msg
     * @param {string} sErrorMsg - error msg text
     * @param {string} sErrorType - error msg type
     */
    handleUserPersonalizationError: function _handleUserPersonalizationError(sType, bShowError, sErrorMsg, sErrorType) {
      const sDefaultErrorMsg = this._i18nBundle.getText(sType === ImportExportType.IMPORT ? "importErrorMessage" : "exportErrorMessage");
      this.oControlModel.setProperty("/" + sType + "/error", bShowError, undefined, true);
      this.oControlModel.setProperty("/" + sType + "/errorMessage", sErrorMsg || sDefaultErrorMsg, undefined, true);
      this.oControlModel.setProperty("/" + sType + "/errorType", sErrorType || "Error", undefined, true);
      this.setExportImportValues(sType);
    },
    /**
     * Handles import/export tab select
     *
     * @param {object} oEvent - IconTabBarSeelect event
     */
    onImportExportTabSelect: function _onImportExportTabSelect(oEvent) {
      const selectedKey = oEvent.getParameter("selectedKey");
      this.oSelectedTab = selectedKey;
      this.oControlModel.setProperty("/selectedTab", selectedKey);
      this.oExportList.setVisible(selectedKey === "export");
      this.oImportBtn.setVisible(selectedKey === "import");
      this.oExportBtn.setVisible(selectedKey === "export");
      this.oImportBtn.setEnabled(this.oUserPersonalization.import.sectionsSelected);
      this.oExportBtn.setEnabled(this.oUserPersonalization.export.sectionsSelected);
      this.oExportBtn.setEnabled(!!(this.oUserPersonalization.export.fileName && this.oUserPersonalization.export.sections && this.oUserPersonalization.export.sections.length > 0 && this.oUserPersonalization.export.sectionsSelected));
    },
    /**
     * Handles export file name input change
     *
     * @param {object} oEvent - event
     */
    onFileNameInputChange: function _onFileNameInputChange(oEvent) {
      const sInputValue = oEvent.getParameter("value")?.trim();
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
    },
    onResetImportApps: function _onResetImportApps() {
      this.oEventBus.publish("importChannel", "resetImported");
      MessageToast.show(this._i18nBundle.getText("importAppsNowBtnEnabled"));
    },
    /**
     * Generates the recommendation settings panel
     * @returns {Panel} recommendation settings panel
     * @private
     */
    _getRecommendationSettingsPanel: function _getRecommendationSettingsPanel() {
      try {
        const _this1 = this;
        return Promise.resolve(_this1._getPersonalizationData()).then(function (persData) {
          if (!_this1._recommendationSettingsPanel) {
            const panelId = _this1.getId() + "--recommendationSettingsPanel";
            _this1._recommendationSettingsPanel = new Panel(panelId, {
              headerToolbar: new OverflowToolbar(_this1.getId() + "--idRecommenedPanelToolbar", {
                content: [new Title({
                  text: _this1._i18nBundle.getText("recommendationSettingsHeader"),
                  level: "H3"
                })]
              }),
              expanded: true,
              expandable: true,
              content: [new Text({
                id: `${panelId}-container-subHeader`,
                text: _this1._i18nBundle.getText("recommendationSettingsSubHeader")
              }), new HBox({
                id: `${panelId}-container`,
                items: [new CheckBox({
                  id: `${panelId}-container-checkBox`,
                  selected: persData.showRecommendation ?? true,
                  select: event => _this1.onRecommendationSettingChange(event),
                  ariaLabelledBy: [`${panelId}-container-subHeader`, `${panelId}-container-label`]
                }), new Text({
                  id: `${panelId}-container-label`,
                  text: _this1._i18nBundle.getText("recommendationSettingsCheckboxLabel")
                })],
                alignItems: FlexAlignItems.Center
              }).addStyleClass("sapUiSmallMarginTop")]
            }).addStyleClass("sapUiSmallMarginTop");
          }
          return _this1._recommendationSettingsPanel;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Adds recommendation settings panel to the content vbox, if recommendation feature is enabled
     * @returns {Promise<void>}
     * @private
     */
    _setRecommendationSettingsPanel: function _setRecommendationSettingsPanel() {
      try {
        const _this10 = this;
        _this10.oDetailPage.setBusy(true);
        return Promise.resolve(_this10._getRecommendationSettingsPanel()).then(function (recommendationSettingsPanel) {
          if (recommendationSettingsPanel) {
            _this10.oContentVBox.addItem(recommendationSettingsPanel);
            _this10.oDetailPage.setBusy(false);
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Handles recommendation setting change
     *
     * @param {CheckBox$SelectEvent} event - checkbox select event
     * @private
     */
    onRecommendationSettingChange: function _onRecommendationSettingChange(event) {
      try {
        const _this11 = this;
        const showRecommendation = event.getParameter("selected");
        _this11.oEventBus.publish("importChannel", "recommendationSettingChanged", {
          showRecommendation
        });
        return Promise.resolve(_this11._getPersonalizationData()).then(function (oPersData) {
          void _this11.oPersonalizerInstance.write({
            ...oPersData,
            showRecommendation
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
  AdvancedSettingsPanel.ImportExportType = ImportExportType;
  return AdvancedSettingsPanel;
});
//# sourceMappingURL=AdvancedSettingsPanel-dbg.js.map
