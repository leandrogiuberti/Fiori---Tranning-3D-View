/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/CustomListItem", "sap/m/Dialog", "sap/m/HBox", "sap/m/Image", "sap/m/Label", "sap/m/library", "sap/m/Link", "sap/m/List", "sap/m/ObjectStatus", "sap/m/Text", "sap/m/Title", "sap/m/VBox", "sap/ui/core/CustomData", "sap/ui/core/Element", "sap/ui/core/HTML", "sap/ui/core/Icon", "sap/ui/core/library", "./BaseNewsItem", "./library", "./NewsItem", "./utils/DataFormatUtils", "./utils/FESRUtil"], function (Button, CustomListItem, Dialog, HBox, Image, Label, sap_m_library, Link, List, ObjectStatus, Text, Title, VBox, CustomData, Element, HTML, Icon, sap_ui_core_library, __BaseNewsItem, ___library, __NewsItem, ___utils_DataFormatUtils, ___utils_FESRUtil) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const FlexAlignItems = sap_m_library["FlexAlignItems"];
  const FlexRendertype = sap_m_library["FlexRendertype"];
  const Priority = sap_m_library["Priority"];
  const TitleLevel = sap_ui_core_library["TitleLevel"];
  const BaseNewsItem = _interopRequireDefault(__BaseNewsItem);
  const NewsType = ___library["NewsType"];
  const NewsItem = _interopRequireDefault(__NewsItem);
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  /**
   *
   * Class for managing and storing News Group items.
   *
   * @extends sap.cux.home.BaseNewsItem
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   * @private
   *
   * @alias sap.cux.home.NewsGroup
   */
  const NewsGroup = BaseNewsItem.extend("sap.cux.home.NewsGroup", {
    metadata: {
      library: "sap.cux.home",
      aggregations: {
        /**
         * newsItems aggregation of the news. These items will be shown in a dialog on click of the news
         */
        newsItems: {
          type: "sap.cux.home.NewsItem",
          singularName: "newsItem",
          multiple: true
        }
      }
    },
    constructor: function _constructor(id, settings) {
      BaseNewsItem.prototype.constructor.call(this, id, settings);
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      BaseNewsItem.prototype.init.call(this);
      this._oTile.attachPress(this, this.pressNewsItem.bind(this));
      this.createNewsGroupDialog();
    },
    /**
     * Handles the press event on the news item, opens the dialog.
     * @returns {void}
     */
    pressNewsItem: function _pressNewsItem(oEvent) {
      const tile = oEvent.getSource();
      if (!tile.getProperty("pressEnabled")) {
        // Prevent dialog opening if the tile's pressEnabled is false
        return;
      }
      void this.openNewsGroupDialog();
    },
    /**
     * Opens the dialog for news details
     * @returns {Promise<void>}
     */
    openNewsGroupDialog: function _openNewsGroupDialog() {
      try {
        const _this = this;
        function _temp2() {
          _this.oNewsGroupDialog?.setTitle(_this.getTitle());
          _this.oNewsGroupImage?.setSrc(sImageUrl);
          _this.loadNewsDetails(newsFeedData);
          _this.oNewsList?.setBusy(false);
        }
        _this.oNewsList?.setBusy(true);
        const oNewsPanel = _this.getParent();
        const customFileName = oNewsPanel.getProperty("customFileName");
        const isCSVFileFormat = customFileName.split(".").pop()?.toLowerCase() === "csv";
        const endUserChanges = oNewsPanel.getParent().getIsEndUserChange();
        const feedType = endUserChanges.newsType || oNewsPanel.getProperty("type");
        const sImageUrl = _this.getImageUrl();
        const persDataNewsFeed = oNewsPanel.getPersDataNewsFeed();
        let newsFeedData = [];
        let imgData;
        const sUrl = oNewsPanel.getUrl();
        let showDefault = feedType === NewsType.Default;
        const _temp = function () {
          if (!showDefault) {
            const oNewsConfig = {
              changeId: oNewsPanel.getCustomFeedKey(),
              title: _this.getTitle(),
              showAllPreparationRequired: isCSVFileFormat ? false : !persDataNewsFeed ? true : persDataNewsFeed.showAllPreparationRequired
            };
            _this.oNewsGroupDialog?.open();
            const sNewsFeedURL = endUserChanges.isEndUser ? sUrl : oNewsPanel.getNewsFeedDetailsUrl(oNewsConfig);
            return Promise.resolve(oNewsPanel.getAuthNewsFeed(sNewsFeedURL, oNewsConfig.title)).then(function (_oNewsPanel$getAuthNe) {
              newsFeedData = _oNewsPanel$getAuthNe;
            });
          } else {
            _this.criticalStatus.setVisible(_this.getPriority() === Priority.Medium);
            _this.oNewsGroupDialog?.open();
            _this.currentDefaultGroup = oNewsPanel.getCurrentNewsGroup(_this.getId());
            newsFeedData = _this.currentDefaultGroup?._group_to_article || [];
            imgData = _this.currentDefaultGroup?._group_to_image;
            if (imgData?.image_alt_text) {
              _this.oNewsGroupImage?.setAlt(imgData.image_alt_text);
            }
          }
        }();
        return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Iterate through the provided news details data and loads the news items
     * @param {INewsFeed[]} aNewsDetails array of news items to be shown in the list
     * @returns {void}
     */
    loadNewsDetails: function _loadNewsDetails(aNewsDetails) {
      this.clearExistingNewsItems();
      const oNewsPanel = this.getParent();
      const showDefault = oNewsPanel?.getNewsType() === NewsType.Default;
      (aNewsDetails || []).forEach((oItem, i) => {
        const newsItemInstance = new NewsItem(recycleId(`${this.getId()}--newsItem--${i}`), {
          title: showDefault ? oItem.title : oItem.Title.value,
          subTitle: showDefault ? oItem.subTitle : oItem.Description.value,
          footer: showDefault ? oItem.footer_text : "",
          imageUrl: showDefault ? this.getImageUrl() : "",
          priority: showDefault && oItem.priority == "1" ? Priority.Medium : Priority.None,
          priorityText: showDefault && oItem.priority == "1" ? this._i18nBundle.getText("criticalNews") : ""
        });
        this.addAggregation("newsItems", newsItemInstance);
        this.oNewsList?.addItem(this.generateNewsListTemplate(oItem, i));
      });
    },
    /**
     * Clears the existing news items from the dialog list and aggregation
     * @returns {void}
     */
    clearExistingNewsItems: function _clearExistingNewsItems() {
      // Destroy list items
      this.oNewsList?.destroyAggregation("items", true);
      this.destroyAggregation("newsItems", true);
    },
    /**
     * Generates the custom list item templates for the news details
     * @param {INewsFeed} oItem news feed item for binding the template
     * @param {number} i index of the item
     * @returns {CustomListItem} the template of list item to be shown in the dialog
     */
    generateNewsListTemplate: function _generateNewsListTemplate(oItem, i) {
      const oNewsPanel = this.getParent();
      const showDefault = oNewsPanel?.getNewsType() === NewsType.Default;
      if (!showDefault) {
        const oFieldVBox = new VBox(recycleId(this.getId() + "--idNewsFieldsBox" + "--" + i)).addStyleClass("newsListItemContainer");
        (oItem?.expandFields || []).forEach((oField, idx) => {
          oFieldVBox.addItem(new HBox(recycleId(this.getId() + "--idNewsFieldHBox--" + idx), {
            items: [new Label(recycleId(this.getId() + "--idNewsFieldsLabel--" + idx), {
              text: oField.label + ":",
              tooltip: oField.label
            }), new Text(recycleId(this.getId() + "--idNewsFieldsValue--" + idx), {
              text: oField.value
            })]
          }).addStyleClass("newsListItemContainer"));
        });
        oFieldVBox.setVisible(false);
        const sInitialText = this._i18nBundle.getText("expand");
        const oExpandButton = new Button(`${this.getId()}--expand--${i}`, {
          text: sInitialText,
          press: this.handleShowNewsFeedDetails.bind(this),
          customData: new CustomData({
            key: "index",
            value: i
          })
        });
        addFESRSemanticStepName(oExpandButton, FESR_EVENTS.PRESS, sInitialText);
        return new CustomListItem(recycleId(`${this.getId()}--idNewsDetailItem--${i}`), {
          content: [new VBox(recycleId(`${this.getId()}--newsList--${i}`), {
            items: [new Title(recycleId(`${this.getId()}--newsTitle--${i}`), {
              text: oItem.Title.value,
              titleStyle: "H6"
            }), new Text(recycleId(`${this.getId()}--newsText--${i}`), {
              text: oItem.Description.value
            }), new HBox(recycleId(`${this.getId()}--newsHBox--${i}`), {
              items: [new Label(recycleId(`${this.getId()}--newsLabel--${i}`), {
                text: oItem.Type.label + ":",
                tooltip: oItem.Type.label
              }), new Text(recycleId(`${this.getId()}--newsItemText--${i}`), {
                text: oItem.Type.value
              })]
            }).addStyleClass("newsListItemContainer"), new HBox(recycleId(`${this.getId()}--newsListItemBox--${i}`), {
              items: [new Label(recycleId(`${this.getId()}--newsListItemLabel--${i}`), {
                text: this._i18nBundle.getText("readMoreLink") + ":",
                tooltip: oItem.Link.value.label + ""
              }), new Link(recycleId(`${this.getId()}--newsListItemLink--${i}`), {
                href: oItem.Link.value.value + "",
                text: oItem.Link.text,
                target: "_blank"
              })]
            }).addStyleClass("newsListItemContainer"), oFieldVBox, oExpandButton]
          }).addStyleClass("newsListItemContainer")]
        }).addStyleClass("newsListItem");
      } else {
        return new CustomListItem(recycleId(`${this.getId()}--idDefaultNewsDetailItem--${i}`), {
          content: [new VBox(recycleId(`${this.getId()}--defaultNewsItemVbox--${i}`), {
            renderType: FlexRendertype.Bare,
            items: [new HBox(recycleId(`${this.getId()}--defaultNewsItemTitle--${i}`), {
              alignItems: FlexAlignItems.Center,
              renderType: FlexRendertype.Bare,
              items: [new Icon(recycleId(`${this.getId()}--newsPriorityIcon--${i}`), {
                src: "sap-icon://high-priority",
                width: "1rem",
                height: "1rem",
                size: "1rem",
                visible: oItem.priority === "1",
                tooltip: this._i18nBundle.getText("criticalNewsIcon")
              }).addStyleClass("newsCriticalIconColor"), new Title(recycleId(`${this.getId()}--newsTitle--${i}`), {
                text: oItem.title,
                titleStyle: TitleLevel.H5
              })]
            }).addStyleClass("newsListItemContainer"), new Title(recycleId(`${this.getId()}--newsSubTitle--${i}`), {
              text: oItem.subTitle,
              visible: !!oItem.subTitle,
              titleStyle: TitleLevel.H6
            }), new HTML(recycleId(`${this.getId()}--defaultNewsItemHTML--${i}`), {
              // add an outer div to add CSS class for styling
              content: `<div class="newsGroupHtmlContent">${oItem.description}</div>`
            })]
          }).addStyleClass("newsListItemContainer")]
        }).addStyleClass("newsListItem");
      }
    },
    /**
     * Creates the dialog which contains the news detail items
     * @returns {void}
     */
    createNewsGroupDialog: function _createNewsGroupDialog() {
      //create the dialog template without binding
      if (!this.oNewsGroupDialog) {
        this.oNewsGroupImage = new Image(recycleId(`${this.getId()}-custNewsImage`), {
          width: "100%",
          height: "100%",
          src: "/resources/sap/cux/home/img/CustomNewsFeed/SupplyChain/3.jpg"
        }).addStyleClass("newsGroupDialogImage");
        this.oNewsList = new List(recycleId(`${this.getId()}-custNewsList`)).addStyleClass("sapUiSmallMarginBottom");
        this.criticalStatus = new ObjectStatus(recycleId(`${this.getId()}-newsDialogCriticalStatus`), {
          visible: false,
          text: this._i18nBundle.getText("criticalNews"),
          inverted: true,
          icon: "sap-icon://high-priority",
          state: "Warning"
        }).addStyleClass("newsGroupDialogPriorityStatus");
        let oImagePriorityVBox = new VBox(recycleId(`${this.getId()}-newsDialogPriorityVBox`), {
          renderType: FlexRendertype.Bare,
          height: "15rem",
          items: [this.oNewsGroupImage, this.criticalStatus]
        }).addStyleClass("newsDialogPriorityVBox");
        const closeButton = new Button(recycleId(`${this.getId()}-custNewsFeedDetailsCloseBtn`), {
          text: this._i18nBundle.getText("XBUT_CLOSE"),
          press: this.closeNewsGroupDialog.bind(this),
          type: "Transparent"
        });
        addFESRSemanticStepName(closeButton, FESR_EVENTS.PRESS, "newsDlgCloseBtn");
        this.oNewsGroupDialog = new Dialog(recycleId(`${this.getId()}-custNewsFeedDetailsDialog`), {
          title: this.getTitle() || "",
          contentWidth: "52rem",
          contentHeight: "calc(100% - 2.5rem)",
          content: [oImagePriorityVBox, this.oNewsList],
          buttons: [closeButton]
        });
        this.addDependent(this.oNewsGroupDialog);
      }
    },
    /**
     * Closes the news details dialog
     * @returns {void}
     */
    closeNewsGroupDialog: function _closeNewsGroupDialog() {
      // Close the dialog first
      this.oNewsGroupDialog?.close();
    },
    /**
     * Handles the click on the show more button of news detail items in news group dialog
     * @param {Event} oEvent
     * @returns {void}
     */
    handleShowNewsFeedDetails: function _handleShowNewsFeedDetails(oEvent) {
      const oButton = oEvent.getSource();
      const listItemIndex = oButton.data("index");
      const fieldsVBox = Element.getElementById(this.getId() + "--idNewsFieldsBox" + "--" + listItemIndex);
      const fieldExpanded = fieldsVBox.getVisible();
      fieldsVBox.setVisible(!fieldExpanded);
      const sButtonShowText = fieldExpanded ? this._i18nBundle.getText("expand") : this._i18nBundle.getText("collapse");
      oButton.setText(sButtonShowText);
      addFESRSemanticStepName(oButton, FESR_EVENTS.PRESS, sButtonShowText);
    }
  });
  return NewsGroup;
});
//# sourceMappingURL=NewsGroup-dbg.js.map
