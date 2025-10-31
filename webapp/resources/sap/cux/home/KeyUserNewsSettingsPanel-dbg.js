/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/Input", "sap/m/Label", "sap/m/MessageBox", "sap/m/MessageStrip", "sap/m/MessageToast", "sap/m/RadioButton", "sap/m/Toolbar", "sap/m/VBox", "sap/m/library", "sap/ui/core/EventBus", "sap/ui/core/message/MessageType", "sap/ui/layout/form/SimpleForm", "sap/ui/unified/FileUploader", "sap/ushell/Container", "./BaseSettingsPanel", "./flexibility/Layout.flexibility", "./library", "./utils/Constants", "./utils/HttpHelper"], function (Button, Input, Label, MessageBox, MessageStrip, MessageToast, RadioButton, Toolbar, VBox, Library, EventBus, MessageType, SimpleForm, FileUploader, Container, __BaseSettingsPanel, ___flexibility_Layoutflexibility, ___library, ___utils_Constants, __HttpHelper) {
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
  const BaseSettingsPanel = _interopRequireDefault(__BaseSettingsPanel);
  const CHANGE_TYPES = ___flexibility_Layoutflexibility["CHANGE_TYPES"];
  const NewsType = ___library["NewsType"];
  const DEFAULT_NEWS_URL = ___utils_Constants["DEFAULT_NEWS_URL"];
  const KEYUSER_SETTINGS_PANELS_KEYS = ___utils_Constants["KEYUSER_SETTINGS_PANELS_KEYS"];
  const HttpHelper = _interopRequireDefault(__HttpHelper);
  const Constants = {
    NEWS_FEED_POST_API: "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/" + "insights_repo_srv/0001/" + "NEWS_FEED"
  };
  /**
   *
   * Class for News Settings Panel for KeyUser Settings Dialog.
   *
   * @extends BaseSettingsPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   * @private
   *
   * @alias sap.cux.home.KeyUserNewsSettingsPanel
   */
  const KeyUserNewsSettingsPanel = BaseSettingsPanel.extend("sap.cux.home.KeyUserNewsSettingsPanel", {
    metadata: {
      library: "sap.cux.home"
    },
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      BaseSettingsPanel.prototype.init.call(this);
      this.controlMap = new Map();

      //setup panel
      this.setProperty("key", KEYUSER_SETTINGS_PANELS_KEYS.NEWS);
      this.setProperty("title", this._i18nBundle.getText("editNewsFeed"));

      // //setup layout content
      this.addAggregation("content", this.getContent());

      // fired every time on panel navigation
      this.attachPanelNavigated(() => this.loadSettings());
      this._eventBus = EventBus.getInstance();
      this._eventBus.subscribe("KeyUserChanges", "newsFeedLoadFailed", (channelId, eventId, data) => {
        //errorstate is false when import is successful
        if (data?.showError) {
          this.showMessageStrip(true, MessageType.Warning, "invalidNewsUrl");
          this.validChanges = false;
        } else {
          this.getMessageStrip().setVisible(false);
          this.validChanges = true;
        }
      }, this);
    },
    getCurrentKeyUserChange: function _getCurrentKeyUserChange() {
      const keyUserChanges = this.getKeyUserChanges();
      const existingChange = keyUserChanges.find(change => {
        return change.changeSpecificData.changeType === CHANGE_TYPES.NEWS_FEED_URL;
      });
      return existingChange?.changeSpecificData.content;
    },
    /**
     * Returns the content for the KeyUser news Settings Panel.
     *
     * @private
     * @returns {VBox} The control containing the KeyUser news Settings Panel content.
     */
    getContent: function _getContent() {
      const wrapperVBoxId = `${this.getId()}-wrapperVBox`;
      const wrapperVBox = new VBox(wrapperVBoxId);
      this.controlMap.set(wrapperVBoxId, wrapperVBox);
      return wrapperVBox;
    },
    checkNewsType: function _checkNewsType(type) {
      if (this._getPanel().getProperty("type") === type) return true;
      return false;
    },
    isValidChanges: function _isValidChanges(newsVisible) {
      try {
        const _this = this;
        function _temp5() {
          return _this.validChanges;
        }
        _this.validChanges = true;
        const fileUploader = _this.getFileUploader();
        const keyUserChangeContent = _this.getCurrentKeyUserChange();
        const showCustom = _this.customNewsVisibility ?? !!_this.checkNewsType(NewsType.Custom);
        const showDefault = _this.defaultNewsVisibility ?? !!_this.checkNewsType(NewsType.Default);
        const _temp4 = function () {
          if (_this.getNewsFeedUploadBtn().getEnabled()) {
            if (showCustom) {
              MessageBox.error(String(_this._i18nBundle.getText("newsFeedSaveUploadChanges")));
              _this.validChanges = false;
            } else {
              if (fileUploader) {
                fileUploader.setValue(keyUserChangeContent.customNewsFeedFileName || String(_this._getPanel().getProperty("customFileName")));
              }
            }
          } else {
            const _temp3 = function () {
              if (showCustom && fileUploader.getValue() === "" && newsVisible) {
                _this.showMessageStrip(true, MessageType.Error, "noNewsFileError");
                _this.validChanges = false;
              } else {
                const _temp2 = function () {
                  if (!showCustom && !showDefault && newsVisible && !_this.getMessageStrip().getVisible()) {
                    const newsUrl = _this.controlMap.get(`${_this.getId()}-newsFeedURLInput`).getValue();
                    const _temp = function () {
                      if (!_this.getValidURL(newsUrl)) {
                        _this.showMessageStrip(true, MessageType.Error, "invalidNewsUrl");
                        _this.validChanges = false;
                      } else {
                        return Promise.resolve(_this._getPanel().setURL(String(newsUrl))).then(function () {});
                      }
                    }();
                    if (_temp && _temp.then) return _temp.then(function () {});
                  }
                }();
                if (_temp2 && _temp2.then) return _temp2.then(function () {});
              }
            }();
            if (_temp3 && _temp3.then) return _temp3.then(function () {});
          }
        }();
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    clearNewsPanelChanges: function _clearNewsPanelChanges() {
      const newsPanel = this._getPanel();
      this.getMessageStrip().setVisible(false);
      const newsUrlInput = this.controlMap.get(`${this.getId()}-newsFeedURLInput`);
      const url = String(newsPanel.getProperty("url"));
      newsUrlInput.setValue(url !== DEFAULT_NEWS_URL ? url : "");
      this.customNewsVisibility = this.checkNewsType(NewsType.Custom);
      this.defaultNewsVisibility = this.checkNewsType(NewsType.Default);
      this.rssNewsVisibility = this.checkNewsType(NewsType.NewsUrl);
      this.controlMap.get(`${this.getId()}-customNewsUploadFileUploader`).setEnabled(this.customNewsVisibility);
      this.controlMap.get(`${this.getId()}-newsFeedURLInput`).setEnabled(this.rssNewsVisibility);
      this.controlMap.get(`${this.getId()}-customNewsFeedRadioBtn`).setSelected(this.customNewsVisibility);
      this.controlMap.get(`${this.getId()}-defaultNewsFeedRadioBtn`).setSelected(this.defaultNewsVisibility);
      this.controlMap.get(`${this.getId()}-newsUrlRadioBtn`).setSelected(this.rssNewsVisibility);
      this.getFileUploader().setValue(String(newsPanel.getProperty("customFileName")));
      this.clearKeyUserChanges();
    },
    addMessageStrip: function _addMessageStrip(wrapperVBox) {
      const keyUserNewsPanelToolbarId = `${this.getId()}-keyUserNewsPanelToolbar`;
      if (!this.controlMap.get(keyUserNewsPanelToolbarId)) {
        const keyUserNewsPanelToolbar = new Toolbar(keyUserNewsPanelToolbarId, {
          height: "auto"
        });
        const messageStripWrapper = new VBox(`${this.getId()}-messageStripWrapper`, {
          width: "100%"
        });
        const messageStripId = `${this.getId()}-messageStrip`;
        const messsageStrip = new MessageStrip(messageStripId, {
          showIcon: true,
          visible: false
        });
        this.controlMap.set(messageStripId, messsageStrip);
        messageStripWrapper.addItem(messsageStrip);
        keyUserNewsPanelToolbar.addContent(messageStripWrapper);
        this.controlMap.set(keyUserNewsPanelToolbarId, keyUserNewsPanelToolbar);
      }
      wrapperVBox.addItem(this.controlMap.get(keyUserNewsPanelToolbarId));
    },
    handleSelectCustomNewsFeed: function _handleSelectCustomNewsFeed(oEvent) {
      this.customNewsVisibility = oEvent.getParameter("selected");
      this.controlMap.get(`${this.getId()}-customNewsUploadFileUploader`).setEnabled(this.customNewsVisibility);
      this.controlMap.get(`${this.getId()}-newsFeedURLInput`).setEnabled(!this.customNewsVisibility);
      const newsPanel = this._getPanel();
      const newsPageContainer = newsPanel.getParent();
      const layout = newsPageContainer.getParent();
      const keyUserChangeContent = this.getCurrentKeyUserChange();
      if (!keyUserChangeContent) {
        this.addKeyUserChanges({
          selectorControl: layout,
          changeSpecificData: {
            changeType: CHANGE_TYPES.NEWS_FEED_URL,
            content: {
              oldNewsFeedUrl: String(this._getPanel().getProperty("url")),
              oldShowCustomNewsFeed: this.checkNewsType(NewsType.Custom),
              oldCustomNewsFeedKey: String(this._getPanel().getProperty("customFeedKey")),
              oldshowDefaultNewsFeed: this.checkNewsType(NewsType.Default),
              oldShowRssNewsFeed: this.checkNewsType(NewsType.NewsUrl),
              newsFeedURL: String(this._getPanel().getProperty("url")),
              showCustomNewsFeed: this.customNewsVisibility,
              customNewsFeedKey: String(this._getPanel().getProperty("customFeedKey")),
              customNewsFeedFileName: String(this._getPanel().getProperty("customFileName")),
              showDefaultNewsFeed: false,
              showRssNewsFeed: false
            }
          }
        });
        this._eventBus.publish("KeyUserChanges", "addNewsPagesChanges", {
          changes: this.getKeyUserChanges()
        });
      } else if (keyUserChangeContent.showCustomNewsFeed !== this.customNewsVisibility) {
        keyUserChangeContent.showCustomNewsFeed = this.customNewsVisibility;
      }
      this.removeUrlMesageStrip();
      this._eventBus.publish("KeyUserChanges", "disabledSaveBtn", {
        disable: false,
        date: new Date()
      });
    },
    /**
     * Add Radio Button for Custom News Feed.
     *
     * @private
     */
    addCustomNewsFeedRadioBtn: function _addCustomNewsFeedRadioBtn(wrapperVBox) {
      const customNewsFeedRadioBtnId = `${this.getId()}-customNewsFeedRadioBtn`;
      const showCustom = this.checkNewsType(NewsType.Custom);
      if (!this.controlMap.get(customNewsFeedRadioBtnId)) {
        const customNewsFeedRadioBtn = new RadioButton(`${this.getId()}-customNewsFeedRadioBtn`, {
          text: this._i18nBundle.getText("selectCustomNewsFeed"),
          selected: showCustom,
          select: this.handleSelectCustomNewsFeed.bind(this)
        }).addStyleClass("sapUiTinyMargin");
        this.controlMap.set(customNewsFeedRadioBtnId, customNewsFeedRadioBtn);
      } else if (!this.getCurrentKeyUserChange()) {
        let customRadioBtn = this.controlMap.get(`${this.getId()}-customNewsFeedRadioBtn`);
        customRadioBtn.setSelected(showCustom);
        this.controlMap.get(`${this.getId()}-customNewsUploadFileUploader`).setEnabled(showCustom);
      }
      wrapperVBox.addItem(this.controlMap.get(customNewsFeedRadioBtnId));
    },
    /**
     * Add Radio Button for Manage News Feed.
     *
     * @private
     */
    addDefaultNewsFeedRadioBtn: function _addDefaultNewsFeedRadioBtn(wrapperVBox) {
      const defaultNewsFeedRadioBtnId = `${this.getId()}-defaultNewsFeedRadioBtn`;
      const showDefault = this.checkNewsType(NewsType.Default);
      if (!this.controlMap.get(defaultNewsFeedRadioBtnId)) {
        const defaultNewsFeedRadioBtn = new RadioButton(`${this.getId()}-defaultNewsFeedRadioBtn`, {
          text: this._i18nBundle.getText("selectDefaultNewsFeed"),
          selected: showDefault,
          select: this.handleselectDefaultNewsFeed.bind(this)
        }).addStyleClass("sapUiTinyMargin");
        this.controlMap.set(defaultNewsFeedRadioBtnId, defaultNewsFeedRadioBtn);
      } else if (!this.getCurrentKeyUserChange()) {
        let defaultRadioBtn = this.controlMap.get(`${this.getId()}-defaultNewsFeedRadioBtn`);
        defaultRadioBtn.setSelected(showDefault);
      }
      wrapperVBox.addItem(this.controlMap.get(defaultNewsFeedRadioBtnId));
    },
    addNewsPaneLabel: function _addNewsPaneLabel(wrapperVBox) {
      const newsPanelLabelId = `${this.getId()}-newsPanelLabel`;
      if (!this.controlMap.get(newsPanelLabelId)) {
        const newsPanelLabel = new Label(newsPanelLabelId, {
          text: this._i18nBundle.getText("newsFeedOptionLabel")
        }).addStyleClass("sapUiTinyMargin");
        this.controlMap.set(newsPanelLabelId, newsPanelLabel);
      }
      wrapperVBox.addItem(this.controlMap.get(newsPanelLabelId));
    },
    handleSelectRssNewsFeed: function _handleSelectRssNewsFeed(oEvent) {
      this.rssNewsVisibility = oEvent.getParameter("selected");
      this.controlMap.get(`${this.getId()}-customNewsUploadFileUploader`).setEnabled(!this.rssNewsVisibility);
      this.controlMap.get(`${this.getId()}-newsFeedURLInput`).setEnabled(this.rssNewsVisibility);
      const newsPanel = this._getPanel();
      const newsPageContainer = newsPanel.getParent();
      const layout = newsPageContainer.getParent();
      const keyUserChangeContent = this.getCurrentKeyUserChange();
      if (!keyUserChangeContent) {
        this.addKeyUserChanges({
          selectorControl: layout,
          changeSpecificData: {
            changeType: CHANGE_TYPES.NEWS_FEED_URL,
            content: {
              oldNewsFeedUrl: String(this._getPanel().getProperty("url")),
              oldShowCustomNewsFeed: this.checkNewsType(NewsType.Custom),
              oldCustomNewsFeedKey: String(this._getPanel().getProperty("customFeedKey")),
              oldshowDefaultNewsFeed: this.checkNewsType(NewsType.Default),
              oldShowRssNewsFeed: this.checkNewsType(NewsType.NewsUrl),
              newsFeedURL: String(this._getPanel().getProperty("url")),
              showCustomNewsFeed: false,
              customNewsFeedKey: String(this._getPanel().getProperty("customFeedKey")),
              customNewsFeedFileName: String(this._getPanel().getProperty("customFileName")),
              showDefaultNewsFeed: false,
              showRssNewsFeed: this.rssNewsVisibility
            }
          }
        });
        this._eventBus.publish("KeyUserChanges", "addNewsPagesChanges", {
          changes: this.getKeyUserChanges()
        });
      } else if (keyUserChangeContent.showRssNewsFeed !== this.rssNewsVisibility) {
        keyUserChangeContent.showRssNewsFeed = this.rssNewsVisibility;
      }
      this.removeUrlMesageStrip();
      this._eventBus.publish("KeyUserChanges", "disabledSaveBtn", {
        disable: false,
        date: new Date()
      });
    },
    addNewsUrlRadioBtn: function _addNewsUrlRadioBtn(wrapperVBox) {
      const newsUrlRadioBtnId = `${this.getId()}-newsUrlRadioBtn`;
      const showRss = this.checkNewsType(NewsType.NewsUrl);
      if (!this.controlMap.get(newsUrlRadioBtnId)) {
        const newsUrlRadioBtn = new RadioButton(`${this.getId()}-newsUrlRadioBtn`, {
          text: this._i18nBundle.getText("selectNewsFeedUrl"),
          selected: showRss,
          select: this.handleSelectRssNewsFeed.bind(this)
        }).addStyleClass("sapUiTinyMargin");
        this.controlMap.set(newsUrlRadioBtnId, newsUrlRadioBtn);
      } else if (!this.getCurrentKeyUserChange()) {
        let rssRadioBtn = this.controlMap.get(`${this.getId()}-newsUrlRadioBtn`);
        rssRadioBtn.setSelected(showRss);
        this.controlMap.get(`${this.getId()}-newsFeedURLInput`).setEnabled(showRss);
      }
      wrapperVBox.addItem(this.controlMap.get(newsUrlRadioBtnId));
    },
    /**
     * Handle the selection of the Manage News Feed Radio Button.
     *
     * @private
     */
    handleselectDefaultNewsFeed: function _handleselectDefaultNewsFeed(oEvent) {
      this.defaultNewsVisibility = oEvent.getParameter("selected");
      this.controlMap.get(`${this.getId()}-customNewsUploadFileUploader`).setEnabled(!this.defaultNewsVisibility);
      this.controlMap.get(`${this.getId()}-newsFeedURLInput`).setEnabled(!this.defaultNewsVisibility);
      const newsPanel = this._getPanel();
      const newsPageContainer = newsPanel.getParent();
      const layout = newsPageContainer.getParent();
      const keyUserChangeContent = this.getCurrentKeyUserChange();
      const newsUrlInput = this.controlMap.get(`${this.getId()}-newsFeedURLInput`);
      if (!keyUserChangeContent) {
        this.addKeyUserChanges({
          selectorControl: layout,
          changeSpecificData: {
            changeType: CHANGE_TYPES.NEWS_FEED_URL,
            content: {
              oldNewsFeedUrl: String(this._getPanel().getProperty("url")),
              oldShowCustomNewsFeed: this.checkNewsType(NewsType.Custom),
              oldCustomNewsFeedKey: String(this._getPanel().getProperty("customFeedKey")),
              oldshowDefaultNewsFeed: this.checkNewsType(NewsType.Default),
              oldShowRssNewsFeed: this.checkNewsType(NewsType.NewsUrl),
              newsFeedURL: String(newsUrlInput.getValue()),
              showCustomNewsFeed: false,
              customNewsFeedKey: String(this._getPanel().getProperty("customFeedKey")),
              customNewsFeedFileName: String(this._getPanel().getProperty("customFileName")),
              showDefaultNewsFeed: this.defaultNewsVisibility,
              showRssNewsFeed: false
            }
          }
        });
        this._eventBus.publish("KeyUserChanges", "addNewsPagesChanges", {
          changes: this.getKeyUserChanges()
        });
      } else if (keyUserChangeContent.showDefaultNewsFeed !== this.defaultNewsVisibility) {
        keyUserChangeContent.showDefaultNewsFeed = this.defaultNewsVisibility;
        keyUserChangeContent.showCustomNewsFeed = false;
      }
      this.removeUrlMesageStrip();
      this._eventBus.publish("KeyUserChanges", "disabledSaveBtn", {
        disable: false,
        date: new Date()
      });
    },
    onNewsUrlChange: function _onNewsUrlChange(oEvent) {
      const newsPanel = this._getPanel();
      const newsPageContainer = newsPanel.getParent();
      const layout = newsPageContainer.getParent();
      let newsUrl = oEvent.getParameter("value");
      const keyUserContent = this.getCurrentKeyUserChange();
      const validUrl = this.getValidURL(String(newsUrl));
      if (!validUrl) {
        return;
      } else {
        newsUrl = validUrl;
      }
      if (!keyUserContent) {
        this.addKeyUserChanges({
          selectorControl: layout,
          changeSpecificData: {
            changeType: CHANGE_TYPES.NEWS_FEED_URL,
            content: {
              oldNewsFeedUrl: String(this._getPanel().getProperty("url")),
              oldShowCustomNewsFeed: this.checkNewsType(NewsType.Custom),
              oldCustomNewsFeedKey: String(this._getPanel().getProperty("customFeedKey")),
              oldshowDefaultNewsFeed: this.checkNewsType(NewsType.Default),
              oldShowRssNewsFeed: this.checkNewsType(NewsType.NewsUrl),
              newsFeedURL: newsUrl,
              showCustomNewsFeed: false,
              customNewsFeedKey: String(this._getPanel().getProperty("customFeedKey")),
              customNewsFeedFileName: String(this._getPanel().getProperty("customFileName")),
              showDefaultNewsFeed: false,
              showRssNewsFeed: this.rssNewsVisibility
            }
          }
        });
        this._eventBus.publish("KeyUserChanges", "addNewsPagesChanges", {
          changes: this.getKeyUserChanges()
        });
      } else if (keyUserContent.newsFeedURL !== newsUrl) {
        keyUserContent.newsFeedURL = newsUrl;
        keyUserContent.showCustomNewsFeed = false;
        keyUserContent.showDefaultNewsFeed = false;
      }
    },
    showMessageStrip: function _showMessageStrip(bShow, type, textKey) {
      this.getMessageStrip().setType(type);
      this.getMessageStrip().setVisible(bShow);
      this.getMessageStrip().setText(String(this._i18nBundle.getText(textKey)));
      if (type === MessageType.Error) {
        this._eventBus.publish("KeyUserChanges", "disabledSaveBtn", {
          disable: bShow,
          date: new Date()
        });
      }
    },
    getValidURL: function _getValidURL(urlString) {
      try {
        const url = new URL(urlString);
        return url.href;
      } catch {
        return "";
      }
    },
    removeUrlMesageStrip: function _removeUrlMesageStrip() {
      this._eventBus.publish("KeyUserChanges", "disabledSaveBtn", {
        disable: false,
        date: new Date()
      });
      this.getMessageStrip().setVisible(false);
      const newsUrlInput = this.controlMap.get(`${this.getId()}-newsFeedURLInput`);
      if (!this.getValidURL(newsUrlInput.getValue())) {
        newsUrlInput.setValue("");
      }
    },
    onUrlLiveChange: function _onUrlLiveChange(oEvent) {
      const sNewValue = oEvent.getParameter("value") || "";
      this.showMessageStrip(!this.getValidURL(sNewValue), MessageType.Error, "invalidNewsUrl");
    },
    getMessageStrip: function _getMessageStrip() {
      const messageStripId = `${this.getId()}-messageStrip`;
      return this.controlMap.get(messageStripId);
    },
    /**
     * Add SimpleForm for News URL.
     *
     * @private
     */
    addNewsURLSimpleForm: function _addNewsURLSimpleForm(wrapperVBox) {
      const newsFeedURLSimpleFormId = `${this.getId()}-newsFeedURLSimpleForm`;
      const showRss = this.checkNewsType(NewsType.NewsUrl);
      const newsInputUrl = String(this._getPanel().getProperty("url"));
      if (!this.controlMap.get(newsFeedURLSimpleFormId)) {
        const newsFeedURLSimpleForm = new SimpleForm(`${this.getId()}-newsFeedURLSimpleForm`).addStyleClass("sapContrastPlus formCustomPadding");
        const newsFeedURLInputId = `${this.getId()}-newsFeedURLInput`;
        const newsFeedURLInput = new Input(newsFeedURLInputId, {
          value: newsInputUrl !== DEFAULT_NEWS_URL ? newsInputUrl : "",
          type: Library.InputType.Url,
          change: this.onNewsUrlChange.bind(this),
          liveChange: this.onUrlLiveChange.bind(this),
          enabled: showRss
        });
        this.controlMap.set(newsFeedURLInputId, newsFeedURLInput);
        newsFeedURLSimpleForm.addContent(newsFeedURLInput);
        this.controlMap.set(newsFeedURLSimpleFormId, newsFeedURLSimpleForm);
      } else if (this.getCurrentKeyUserChange()) {
        let inputUrlField = this.controlMap.get(`${this.getId()}-newsFeedURLInput`);
        inputUrlField.setValue(newsInputUrl);
      }
      wrapperVBox.addItem(this.controlMap.get(newsFeedURLSimpleFormId));
    },
    handleFileChange: function _handleFileChange(oEvent) {
      const fileUploader = oEvent.getSource();
      this.getMessageStrip().setVisible(false);
      this._eventBus.publish("KeyUserChanges", "disabledSaveBtn", {
        disable: false,
        date: new Date()
      });
      this.setNewsFeedEnabled(fileUploader.getValue() !== "");
    },
    setNewsFeedEnabled: function _setNewsFeedEnabled(bEnabled) {
      const newsFeedUploadBtn = this.getNewsFeedUploadBtn();
      if (newsFeedUploadBtn) {
        newsFeedUploadBtn.setEnabled(bEnabled);
      }
    },
    getNewsFeedUploadBtn: function _getNewsFeedUploadBtn() {
      const customNewsUploadFileUploaderButtonId = `${this.getId()}-customNewsUploadFileUploaderButton`;
      return this.controlMap.get(customNewsUploadFileUploaderButtonId);
    },
    handleFileUploadError: function _handleFileUploadError(oEvent) {
      const fileUploader = oEvent.getSource();
      const iMaxFileSize = fileUploader.getMaximumFileSize();
      this.setNewsFeedEnabled(false);
      MessageBox.error(String(this._i18nBundle.getText("newsFeedMaxFileSizeError", [iMaxFileSize])));
    },
    handleFileDialogClose: function _handleFileDialogClose(event) {
      const fileUploader = event.getSource();
      let fileName = fileUploader.getValue();
      // if file selection dialog is closed and no file is selected, set value as last uploaded file

      if (fileName === "") {
        fileName = this.getCurrentKeyUserChange()?.customNewsFeedFileName || String(this._getPanel().getProperty("customFileName"));
        this.setNewsFeedEnabled(false);
      }
      fileUploader.setValue(fileName);
    },
    handleNewsFeedFileUpload: function _handleNewsFeedFileUpload() {
      try {
        const _this2 = this;
        let errorMsg = _this2._i18nBundle.getText("newsFeedFileUploadError");
        return Promise.resolve(_catch(function () {
          return Promise.resolve(Promise.all([_this2.getUploadedFile(), Container.getServiceAsync("UserInfo")])).then(function (response) {
            const fileData = response[0];
            const userInfo = response[1];
            const userId = userInfo && userInfo.getId();
            const payload = {
              changeId: userId + "_" + Date.now().toString(),
              attachment: fileData.content
            };

            //pass documentType if file is in csv format
            //if documentType is not passed by default document type is considered as excel.
            if (fileData.type) {
              payload.documentType = fileData.type;
            }
            return Promise.resolve(HttpHelper.Post(Constants.NEWS_FEED_POST_API, payload)).then(function (oResponse) {
              const keyUserChangeContent = _this2.getCurrentKeyUserChange();
              const newsPanel = _this2._getPanel();
              const newsPageContainer = newsPanel.getParent();
              const layout = newsPageContainer.getParent();
              if (oResponse && oResponse.error) {
                _this2.getFileUploader().setValue("");
                if (keyUserChangeContent) {
                  keyUserChangeContent.customNewsFeedFileName = "";
                } else {
                  _this2.addKeyUserChanges({
                    selectorControl: layout,
                    changeSpecificData: {
                      changeType: CHANGE_TYPES.NEWS_FEED_URL,
                      content: {
                        oldNewsFeedUrl: String(_this2._getPanel().getProperty("url")),
                        oldShowCustomNewsFeed: _this2.checkNewsType(NewsType.Custom),
                        oldCustomNewsFeedKey: String(_this2._getPanel().getProperty("customFeedKey")),
                        oldshowDefaultNewsFeed: _this2.checkNewsType(NewsType.Default),
                        oldShowRssNewsFeed: _this2.checkNewsType(NewsType.NewsUrl),
                        newsFeedURL: String(_this2._getPanel().getProperty("url")),
                        showCustomNewsFeed: true,
                        customNewsFeedKey: String(_this2._getPanel().getProperty("customFeedKey")),
                        customNewsFeedFileName: String(_this2._getPanel().getProperty("customFileName")),
                        showDefaultNewsFeed: false,
                        showRssNewsFeed: false
                      }
                    }
                  });
                }
                errorMsg = oResponse.error.message.includes("NODATA") ? _this2._i18nBundle.getText("newsFeedEmptyFileError") : errorMsg;
                throw new Error(errorMsg);
              }
              const customKey = oResponse.changeId;
              if (keyUserChangeContent) {
                keyUserChangeContent.customNewsFeedKey = customKey;
                keyUserChangeContent.customNewsFeedFileName = _this2.getFileUploader().getValue();
              } else {
                _this2.addKeyUserChanges({
                  selectorControl: layout,
                  changeSpecificData: {
                    changeType: CHANGE_TYPES.NEWS_FEED_URL,
                    content: {
                      oldNewsFeedUrl: String(_this2._getPanel().getProperty("url")),
                      oldShowCustomNewsFeed: _this2.checkNewsType(NewsType.Custom),
                      oldCustomNewsFeedKey: String(_this2._getPanel().getProperty("customFeedKey")),
                      oldshowDefaultNewsFeed: _this2.checkNewsType(NewsType.Default),
                      oldShowRssNewsFeed: _this2.checkNewsType(NewsType.NewsUrl),
                      newsFeedURL: String(_this2._getPanel().getProperty("url")),
                      showCustomNewsFeed: true,
                      customNewsFeedKey: customKey,
                      customNewsFeedFileName: _this2.getFileUploader().getValue(),
                      showDefaultNewsFeed: false,
                      showRssNewsFeed: false
                    }
                  }
                });
                _this2._eventBus.publish("KeyUserChanges", "addNewsPagesChanges", {
                  changes: _this2.getKeyUserChanges()
                });
              }
              MessageToast.show(String(_this2._i18nBundle.getText("customNewsFeedUploaded")));
              _this2.setNewsFeedEnabled(false);
            });
          });
        }, function (oErr) {
          MessageBox.error(oErr.message);
          _this2.setNewsFeedEnabled(false);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    getUploadedFile: function _getUploadedFile() {
      return new Promise((resolve, reject) => {
        const fileUploader = this.getFileUploader();
        let errorMsg = this._i18nBundle.getText("newsFeedFileUploadError");
        if (fileUploader && !fileUploader.getValue()) {
          errorMsg = this._i18nBundle.getText("noNewsFileError");
          reject(new Error(errorMsg));
        }
        const file = fileUploader.oFileUpload.files[0];
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const fileContent = reader.result;
            let base64String;
            const fileData = {
              type: "",
              content: ""
            };
            if (file.type === "text/csv") {
              base64String = window.btoa(encodeURIComponent(String(fileContent)).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
              }));
              fileData.type = "CSV";
            } else {
              base64String = fileContent.replace("data:", "").replace(/^.+,/, "");
            }
            fileData.content = base64String;
            resolve(fileData);
          } catch {
            reject(new Error(errorMsg));
          }
        };
        if (file.type === "text/csv") {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    },
    getFileUploader: function _getFileUploader() {
      const customNewsUploadFileUploader = `${this.getId()}-customNewsUploadFileUploader`;
      return this.controlMap.get(customNewsUploadFileUploader);
    },
    /**
     * Add SimpleForm for Custom News Upload Form.
     *
     * @private
     */
    addCustomNewsUploadSimpleForm: function _addCustomNewsUploadSimpleForm(wrapperVBox) {
      const customNewsUploadSimpleFormId = `${this.getId()}-customNewsUploadSimpleForm`;
      if (!this.controlMap.get(customNewsUploadSimpleFormId)) {
        const customNewsUploadSimpleForm = new SimpleForm(`${this.getId()}-customNewsUploadSimpleForm`).addStyleClass("sapContrastPlus formCustomPadding");
        const customNewsUploadVBox = new VBox(`${this.getId()}-customNewsUploadVBox`);
        const customNewsUploadFileUploader = `${this.getId()}-customNewsUploadFileUploader`;
        const newsPanel = this._getPanel();
        const customNewsUploadFileUploaderControl = new FileUploader(customNewsUploadFileUploader, {
          name: "newsFeedFileUploader",
          tooltip: this._i18nBundle.getText("uploadNewsFeedFile"),
          fileType: newsPanel?.getProperty("supportedFileFormats"),
          width: "100%",
          change: this.handleFileChange.bind(this),
          maximumFileSize: 25,
          fileSizeExceed: this.handleFileUploadError.bind(this),
          sameFilenameAllowed: true,
          afterDialogClose: this.handleFileDialogClose.bind(this),
          value: String(this._getPanel().getProperty("customFileName")),
          enabled: this.checkNewsType(NewsType.Custom)
        });
        this.controlMap.set(customNewsUploadFileUploader, customNewsUploadFileUploaderControl);
        const customNewsUploadFileUploaderButtonId = `${this.getId()}-customNewsUploadFileUploaderButton`;
        const customNewsUploadFileUploaderButton = new Button(customNewsUploadFileUploaderButtonId, {
          text: this._i18nBundle.getText("uploadNewsFeedBtn"),
          press: this.handleNewsFeedFileUpload.bind(this),
          type: "Emphasized",
          enabled: false
        });
        this.controlMap.set(customNewsUploadFileUploaderButtonId, customNewsUploadFileUploaderButton);
        customNewsUploadVBox.addItem(customNewsUploadFileUploaderControl);
        customNewsUploadVBox.addItem(customNewsUploadFileUploaderButton);
        customNewsUploadSimpleForm.addContent(customNewsUploadVBox);
        this.controlMap.set(customNewsUploadSimpleFormId, customNewsUploadSimpleForm);
      }
      wrapperVBox.addItem(this.controlMap.get(customNewsUploadSimpleFormId));
    },
    /**
     * Load settings for the panel.
     *
     * @private
     */
    loadSettings: function _loadSettings() {
      const wrapperVBoxId = `${this.getId()}-wrapperVBox`;
      const wrapperVBox = this.controlMap.get(wrapperVBoxId);
      wrapperVBox.removeAllItems();
      this.addMessageStrip(wrapperVBox);
      this.addNewsPaneLabel(wrapperVBox);
      this.addDefaultNewsFeedRadioBtn(wrapperVBox);
      this.addNewsUrlRadioBtn(wrapperVBox);
      this.addNewsURLSimpleForm(wrapperVBox);
      this.addCustomNewsFeedRadioBtn(wrapperVBox);
      this.addCustomNewsUploadSimpleForm(wrapperVBox);
    }
  });
  return KeyUserNewsSettingsPanel;
});
//# sourceMappingURL=KeyUserNewsSettingsPanel-dbg.js.map
