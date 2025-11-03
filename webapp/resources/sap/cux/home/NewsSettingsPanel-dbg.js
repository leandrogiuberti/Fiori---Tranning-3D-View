/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/CheckBox", "sap/m/CustomListItem", "sap/m/HBox", "sap/m/Label", "sap/m/List", "sap/m/Switch", "sap/m/Text", "sap/m/Title", "sap/m/VBox", "sap/ui/core/CustomData", "./BaseSettingsPanel", "./library", "./utils/Accessibility", "./utils/Constants", "./utils/FESRUtil", "./utils/PersonalisationUtils", "./utils/UshellPersonalizer"], function (CheckBox, CustomListItem, HBox, Label, List, Switch, Text, Title, VBox, CustomData, __BaseSettingsPanel, ___library, ___utils_Accessibility, ___utils_Constants, ___utils_FESRUtil, __PersonalisationUtils, __UshellPersonalizer) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BaseSettingsPanel = _interopRequireDefault(__BaseSettingsPanel);
  const NewsType = ___library["NewsType"];
  const getInvisibleText = ___utils_Accessibility["getInvisibleText"];
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  const PersonalisationUtils = _interopRequireDefault(__PersonalisationUtils);
  const UshellPersonalizer = _interopRequireDefault(__UshellPersonalizer);
  /**
   *
   * Class for My Home News Settings Panel.
   *
   * @extends BaseSettingsPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   * @private
   *
   * @alias sap.cux.home.NewsSettingsPanel
   */
  const NewsSettingsPanel = BaseSettingsPanel.extend("sap.cux.home.NewsSettingsPanel", {
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      BaseSettingsPanel.prototype.init.call(this);

      //setup panel
      this.setProperty("key", SETTINGS_PANELS_KEYS.NEWS);
      this.setProperty("title", this._i18nBundle.getText("news"));
      this.setProperty("icon", "sap-icon://newspaper");

      //setup layout content
      this.addAggregation("content", this.getContent());

      //fired every time on panel navigation
      this.attachPanelNavigated(() => {
        void this.loadNewsFeedSettings();
      });
      this.aFavNewsFeed = [];
    },
    /**
     * Returns the content for the News Settings Panel.
     *
     * @private
     * @returns {Control} The control containing the News Settings Panel content.
     */
    getContent: function _getContent() {
      const oHeader = this.setHeader();
      const oTitle = this.setTitleMessage();
      const oContentVBox = new VBox(this.getId() + "--idNewsPageOuterVBoX", {
        alignItems: "Start",
        justifyContent: "SpaceBetween",
        items: [oHeader, oTitle, this.setNewsList()]
      });
      return oContentVBox;
    },
    /**
     * Get personalization instance
     */
    getPersonalization: function _getPersonalization() {
      try {
        const _this = this;
        function _temp2() {
          return _this.oPersonalizer;
        }
        const _temp = function () {
          if (!_this.oPersonalizer) {
            return Promise.resolve(UshellPersonalizer.getInstance(PersonalisationUtils.getPersContainerId(_this._getPanel()), PersonalisationUtils.getOwnerComponent(_this._getPanel()))).then(function (_UshellPersonalizer$g) {
              _this.oPersonalizer = _UshellPersonalizer$g;
            });
          }
        }();
        return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Returns the content for the News Settings Panel Header.
     *
     * @private
     * @returns {sap.ui.core.Control} The control containing the News Settings Panel's Header content.
     */
    setHeader: function _setHeader() {
      this.headerText = new Text(this.getId() + "--idCustNewsFeedSettingsText", {
        text: this._i18nBundle.getText("newsFeedSettingsText")
      });
      const oHeaderVBox = new VBox(this.getId() + "--idCustNewsFeedSettingsTextContainer", {
        alignItems: "Start",
        justifyContent: "SpaceBetween",
        items: [this.headerText]
      }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin");
      return oHeaderVBox;
    },
    /**
     * Returns the content for the News Settings Panel Title description.
     *
     * @private
     * @returns {sap.ui.core.Control} The control containing the News Settings Panel's Title description.
     */
    setTitleMessage: function _setTitleMessage() {
      this.title = new Title(this.getId() + "--idCustNewsFeedSettignsTitle", {
        text: this._i18nBundle.getText("newsFeedSettingsHeading"),
        titleStyle: "H3"
      });
      const oTitleHbox = new HBox(this.getId() + "--idCustNewsFeedSettingsTitleContainer", {
        alignItems: "Center",
        justifyContent: "SpaceBetween",
        items: [this.title]
      });
      const oTitleVBox = new VBox(this.getId() + "--idCustNewsFeedSettingsTitleVBox", {
        alignItems: "Start",
        justifyContent: "SpaceBetween",
        items: [oTitleHbox]
      }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin");
      return oTitleVBox;
    },
    /**
     * Returns the content for the news List
     *
     * @private
     * @returns {sap.ui.core.Control} The control containing the News Settings Panel's List
     */
    setNewsList: function _setNewsList() {
      //showAllPrepRequired Switch
      const oShowSwitchLabel = new Label(this.getId() + "--idShowAllCustNewsSwitchLabel", {
        text: this._i18nBundle.getText("showAllPreparationRequiredSwitchLabel")
      });
      this.oShowSwitch = new Switch(`${this.getId()}-showSwitch`, {
        // 'ariaLabelledBy': "idShowAllCustNewsSwitchLabel idShowAllCustNewsSwitch",
        customTextOn: " ",
        customTextOff: " ",
        change: () => {
          void this.saveNewsFeedSettings();
        },
        // 'fesr:change': "showPrepRequire",
        state: false,
        ariaLabelledBy: [`${this.getId()}--idShowAllCustNewsSwitchLabel`]
      });
      addFESRSemanticStepName(this.oShowSwitch, FESR_EVENTS.CHANGE, "showPrepRequire");
      this.oCustNewsSwitchContainer = new HBox(this.getId() + "--idShowAllCustNewsSwitchContainer", {
        alignItems: "Center",
        items: [oShowSwitchLabel, this.oShowSwitch],
        width: "94%"
      }).addStyleClass("sapUiSmallMarginTop");
      const oShowAllPrep = new VBox(this.getId() + "--idShowAllCustNewsSwitchVBox", {
        items: [this.oCustNewsSwitchContainer],
        width: "94%"
      }).addStyleClass("sapUiSmallMarginTop");
      const oInvisibleText = getInvisibleText(`${this.getId()}--newsTitleText`, this._i18nBundle.getText("newsTitle"));
      //List of news items
      this.oList = new List(this.getId() + "--idCustNewsFeedList", {
        ariaLabelledBy: [oInvisibleText.getId(), `${this.getId()}--idCustNewsFeedSettingsText`, `${this.getId()}--idCustNewsFeedSettignsTitle`]
      });
      //Outer VBox
      const oNewsListVBox = new VBox(this.getId() + "--idCustNewsFeedListContainer", {
        direction: "Column",
        items: [this.oList, oShowAllPrep, oInvisibleText],
        width: "96%"
      }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin");
      return oNewsListVBox;
    },
    /**
     * Checks if the custom file format is CSV based on the custom file name.
     *
     * @param {string} fileName - The custom file name.
     * @returns {boolean} True if the file format is CSV, otherwise false.
     */
    isCSVFileFormat: function _isCSVFileFormat(fileName) {
      return fileName.split(".").pop()?.toLowerCase() === "csv";
    },
    /**
     *
     * Saves news feed settings and shows news feed based on selection change of list of switch
     *
     * @private
     */
    saveNewsFeedSettings: function _saveNewsFeedSettings() {
      try {
        const _this2 = this;
        const selectedFeeds = [];
        const deselectedDefaultFeeds = [];
        const newsType = _this2.oNewsPanel?.getNewsType();
        const showDefault = newsType === NewsType.Default;
        const customFileName = _this2.oNewsPanel.getProperty("customFileName");
        const feedKey = _this2.oNewsPanel.getCustomFeedKey();
        _this2.oList.getItems().forEach(item => {
          const newsListContent = item.getAggregation("content");
          const newsListHBox = newsListContent[0];
          const [checkbox, label] = newsListHBox.getItems();
          const isSelected = checkbox.getSelected();
          if (showDefault) {
            const groupId = _this2.getDefaultGroupId(newsListHBox);
            if (!isSelected && groupId) {
              deselectedDefaultFeeds.push(groupId);
            }
          } else if (isSelected) {
            selectedFeeds.push(label.getText());
          }
        });
        return Promise.resolve(_this2.getPersonalization()).then(function (personalizer) {
          return Promise.resolve(personalizer.read()).then(function (personalizationData) {
            if (showDefault) {
              personalizationData.defaultNewsFeed = {
                items: deselectedDefaultFeeds
              };
            } else {
              personalizationData.favNewsFeed = {
                items: selectedFeeds,
                showAllPreparationRequired: _this2.isCSVFileFormat(customFileName) ? false : _this2.oShowSwitch.getState()
              };
            }
            return Promise.resolve(personalizer.write(personalizationData)).then(function () {
              // get the latest value of switch and set the state
              if (!showDefault) {
                _this2.oShowSwitch.setState(personalizationData.favNewsFeed?.showAllPreparationRequired);
              }
              return Promise.resolve(_this2.oNewsPanel.setCustomNewsFeed(showDefault ? "" : feedKey)).then(function () {});
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /** Get groupId info  for the default NewsList
     * @param {HBox} [contentBox] content Hbox
     * @returns {string} groupId
     * @private
     */
    getDefaultGroupId: function _getDefaultGroupId(contentBox) {
      const customData = contentBox.getCustomData();
      return customData?.length ? customData[0].getValue() : "";
    },
    /** Set items for the NewsList
     * @param {Array} [aItems] news items to be set as items aggregation
     * @private
     */
    setItems: function _setItems(aItems) {
      this.oList.destroyAggregation("items", true);
      const newsType = this.oNewsPanel?.getNewsType();
      let showDefault = newsType === NewsType.Default;
      (aItems || []).forEach((oItem, i) => {
        let oNewsListItemHbox = new HBox({
          id: `${this.getId()}--idCustNewsFeedItemContent--${i}`,
          alignItems: "Center",
          items: [new CheckBox(`${this.getId()}--custNewsFeedItemCheckBox--${i}`, {
            select: () => {
              void this.saveNewsFeedSettings();
            },
            selected: oItem.selected,
            enabled: !oItem.disabled
          }), new Text(`${this.getId()}--custNewsFeedItemText--${i}`, {
            text: oItem.title
          })],
          width: "100%"
        });
        if (showDefault) {
          // if showDefault is true, add group_id as custom data to the item
          oNewsListItemHbox.addCustomData(new CustomData({
            key: "newsGroupId",
            value: oItem.group_id
          }));
        }
        const customListItem = new CustomListItem({
          id: `${this.getId()}--idCustNewsFeedItem--${i}`,
          content: [oNewsListItemHbox]
        });
        this.oList.addItem(customListItem);
      });
    },
    /**
     * Loads news feed settings
     *
     * @returns {Promise} resolves to news feed settings
     */
    loadNewsFeedSettings: function _loadNewsFeedSettings() {
      try {
        const _this3 = this;
        _this3.oNewsPanel = _this3._getPanel();
        const sFeedKey = _this3.oNewsPanel.getCustomFeedKey();
        const newsType = _this3.oNewsPanel?.getNewsType();
        const showDefaultNewsFeed = newsType === NewsType.Default;
        const customFileName = _this3.oNewsPanel.getProperty("customFileName");
        if (_this3.isCSVFileFormat(customFileName) || showDefaultNewsFeed) {
          _this3.oCustNewsSwitchContainer.setVisible(false);
        }
        return Promise.resolve(_this3.getPersonalization()).then(function (oPersonalizer) {
          return Promise.resolve(oPersonalizer.read()).then(function (oPersData) {
            const aPersNewsFeed = showDefaultNewsFeed ? oPersData?.["defaultNewsFeed"] : oPersData?.["favNewsFeed"];
            const showAllPreparationRequired = aPersNewsFeed?.showAllPreparationRequired ?? !aPersNewsFeed;
            return Promise.resolve(_this3.oNewsPanel.getCustomOrDefaultNewsFeed(showDefaultNewsFeed ? "" : sFeedKey, false)).then(function (aNewsFeed) {
              if (showDefaultNewsFeed) {
                return _this3._handleDefaultNewsFeed(aNewsFeed, aPersNewsFeed);
              } else {
                return _this3._handleCustomNewsFeed(aNewsFeed, aPersNewsFeed, showAllPreparationRequired);
              }
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     *
     * @param {INewsFeed[]} aNewsFeed
     * @param {IFavNewsFeed} aPersNewsFeed
     * @returns {INewsFeed[] | undefined}
     * @private
     * @description Handles the default news feed settings by setting the header text, title, and items.
     * It maps the news feed items to set their selected and disabled states based on the personalisation data.
     * If no news feed is provided, it returns undefined.
     */
    _handleDefaultNewsFeed: function _handleDefaultNewsFeed(aNewsFeed, aPersNewsFeed) {
      this.headerText.setText(this._i18nBundle.getText("defaultNewsSettingsText"));
      this.title.setText(this._i18nBundle.getText("defaultNewsSettingsHeading"));
      const mandatoryNewsFeed = this.oNewsPanel.getMandatoryDefaultNewsFeed();
      this.deselectedDefaultFeeds = aPersNewsFeed?.items || [];
      if (!aNewsFeed || aNewsFeed.length === 0) {
        return;
      }
      aNewsFeed = aNewsFeed.map(oNewsFeed => {
        // if group_id not available in deselectedDefaultFeeds, then mark it as selected
        const isDeselected = oNewsFeed.group_id ? this.deselectedDefaultFeeds.includes(oNewsFeed.group_id) : false;
        oNewsFeed.selected = !aPersNewsFeed ? true : !isDeselected;
        // if group_id is available in mandatoryNewsFeed, then mark it as disabled, user cannot hide mandatory feeds
        if (mandatoryNewsFeed.includes(oNewsFeed.group_id ?? "")) {
          oNewsFeed.selected = true;
          oNewsFeed.disabled = true;
        }
        return oNewsFeed;
      });
      this.setItems(aNewsFeed);
      this.oShowSwitch.setState(false);
      return aNewsFeed;
    },
    /**
     * @param {INewsFeed[]} aNewsFeed
     * @param aPersNewsFeed
     * @param showAllPreparationRequired
     * @returns {INewsFeed[] | undefined}
     * @private
     * This method is responsible for managing the custom news feed settings in the News Settings Panel.
     * It updates the header text and title, checks if the news feed is available, and maps the news feed items to set their selected state.
     * If the news feed is not available or empty, it returns undefined.
     * It also sets the state of the show switch based on the `showAllPreparationRequired` parameter.
     */
    _handleCustomNewsFeed: function _handleCustomNewsFeed(aNewsFeed, aPersNewsFeed, showAllPreparationRequired) {
      this.headerText.setText(this._i18nBundle.getText("newsFeedSettingsText"));
      this.title.setText(this._i18nBundle.getText("newsFeedSettingsHeading"));
      if (!aNewsFeed || aNewsFeed.length === 0) {
        return;
      }
      const favFeedTitles = aPersNewsFeed?.items || aNewsFeed;
      aNewsFeed = aNewsFeed.map(oNewsFeed => {
        const isFavorite = favFeedTitles.includes(oNewsFeed.title);
        oNewsFeed.selected = !aPersNewsFeed ? true : isFavorite;
        return oNewsFeed;
      });
      this.aFavNewsFeed = aNewsFeed;
      this.setItems(this.aFavNewsFeed);
      this.oShowSwitch.setState(!!showAllPreparationRequired);
      return aNewsFeed;
    },
    /**
     * Checks if the News Settings Panel is supported based on the properties of the News Panel.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the News Settings Panel is supported, otherwise false.
     */
    isSupported: function _isSupported() {
      try {
        const _this4 = this;
        const newsPanel = _this4._getPanel();
        if (!newsPanel || !(newsPanel?.getParent()).getProperty("newsFeedVisibility")) {
          return Promise.resolve(false);
        }
        return Promise.resolve((newsPanel.getNewsType() === NewsType.Custom || newsPanel.getNewsType() === NewsType.Default) && !newsPanel.isNoUpdatesNewsFeed());
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
  return NewsSettingsPanel;
});
//# sourceMappingURL=NewsSettingsPanel-dbg.js.map
