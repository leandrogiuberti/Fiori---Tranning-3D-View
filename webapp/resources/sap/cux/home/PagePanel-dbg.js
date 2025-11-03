/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/FlexBox", "sap/m/GenericTile", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/VBox", "sap/m/library", "sap/ui/core/EventBus", "./BasePagePanel", "./MenuItem", "./Page", "./utils/CommonUtils", "./utils/Constants", "./utils/DataFormatUtils", "./utils/Device", "./utils/DragDropUtils", "./utils/FESRUtil", "./utils/PersonalisationUtils", "./utils/UshellPersonalizer"], function (Button, FlexBox, GenericTile, IllustratedMessage, IllustratedMessageSize, IllustratedMessageType, VBox, sap_m_library, EventBus, __BasePagePanel, __MenuItem, __Page, ___utils_CommonUtils, ___utils_Constants, ___utils_DataFormatUtils, ___utils_Device, ___utils_DragDropUtils, ___utils_FESRUtil, __PersonalisationUtils, __UShellPersonalizer) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const LoadState = sap_m_library["LoadState"];
  const BasePagePanel = _interopRequireDefault(__BasePagePanel);
  const MenuItem = _interopRequireDefault(__MenuItem);
  const Page = _interopRequireDefault(__Page);
  const getPageManagerInstance = ___utils_CommonUtils["getPageManagerInstance"];
  const PAGE_SELECTION_LIMIT = ___utils_Constants["PAGE_SELECTION_LIMIT"];
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  const DeviceType = ___utils_Device["DeviceType"];
  const attachKeyboardHandler = ___utils_DragDropUtils["attachKeyboardHandler"];
  const focusDraggedItem = ___utils_DragDropUtils["focusDraggedItem"];
  const addFESRId = ___utils_FESRUtil["addFESRId"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const PersonalisationUtils = _interopRequireDefault(__PersonalisationUtils);
  const UShellPersonalizer = _interopRequireDefault(__UShellPersonalizer);
  const tileSizes = {
    Mobile: {
      maxWidth: 37.5,
      minWidth: 8
    },
    Tablet: {
      maxWidth: 60,
      minWidth: 10.625
    },
    Desktop: {
      maxWidth: 18.75,
      minWidth: 7
    },
    LargeDesktop: {
      maxWidth: 18.75,
      minWidth: 7
    },
    XLargeDesktop: {
      maxWidth: 18.75,
      minWidth: 7
    },
    smallTabletMinWidth: 8
  };
  const mobileOneTileLimit = 3;
  const maxTileCOunt = 8;
  const maxRowCount = 4;

  /**
   *
   * CustomFlexBox extending FlexBox to enable drag & drop.
   *
   * @extends sap.m.FlexBox
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.122
   * @private
   *
   * @alias sap.cux.home.CustomFlexBox
   */
  const CustomFlexBox = FlexBox.extend("sap.cux.home.CustomFlexBox", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      library: "sap.cux.home",
      aggregations: {
        items: {
          type: "sap.ui.core.Control",
          multiple: true,
          singularName: "item",
          dnd: {
            draggable: true,
            droppable: true
          }
        }
      }
    },
    constructor: function _constructor(id, settings) {
      FlexBox.prototype.constructor.call(this, id, settings);
    }
  });
  /**
   *
   * Panel class for managing and storing Pages.
   *
   * @extends sap.cux.home.BasePagePanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.122
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.PagePanel
   */
  const PagePanel = BasePagePanel.extend("sap.cux.home.PagePanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Title for the page panel
         */
        title: {
          type: "string",
          group: "Misc",
          visibility: "hidden"
        },
        /**
         * Key for the page panel
         */
        key: {
          type: "string",
          group: "Misc",
          visibility: "hidden"
        }
      },
      aggregations: {
        /**
         * Aggregation of pages available within the page panel
         */
        pages: {
          type: "sap.cux.home.Page",
          singularName: "page",
          multiple: true,
          visibility: "hidden"
        }
      }
    },
    /**
     * Constructor for a new Page panel.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor2(id, settings) {
      BasePagePanel.prototype.constructor.call(this, id, settings);
    },
    init: function _init() {
      const _this = this;
      BasePagePanel.prototype.init.call(this);
      this._oWrapperFlexBox = new CustomFlexBox(`${this.getId()}-pageWrapper`, {
        justifyContent: "Start",
        height: "100%",
        width: "100%",
        direction: "Row",
        renderType: "Bare",
        wrap: "Wrap",
        items: this.getPlaceholderPageTiles()
      }).addStyleClass("pagesFlexGap sapCuxPagesWrapper");
      if (this.getDeviceType() !== DeviceType.Mobile) {
        this._oWrapperFlexBox.addStyleClass("sapUiSmallMarginTop");
      }
      this._pageWrapper = new VBox(`${this.getId()}-pageContentWrapper`, {
        items: [this._oWrapperFlexBox]
      });
      this.addContent(this._pageWrapper);
      this.setProperty("title", this._i18nBundle.getText("pageTitle"));
      const menuItem = new MenuItem(`${this.getId()}-managePages`, {
        title: this._i18nBundle.getText("mngPage"),
        icon: "sap-icon://edit",
        press: () => this._handleEditPages()
      });
      this.addAggregation("menuItems", menuItem);
      addFESRId(menuItem, "managePages");
      this.oEventBus = EventBus.getInstance();
      // Subscribe to the event
      this.oEventBus.subscribe("importChannel", "favPagesImport", function (sChannelId, sEventId, oData) {
        try {
          _this.aFavPages = oData;
          return Promise.resolve(_this.writeFavPagesIntoPers(_this.aFavPages)).then(function () {
            _this._getInnerControls();
            _this._importdone();
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }, this);

      // Subscribe to page changes from pageManager
      this.oEventBus.subscribe("pageChannel", "pageUpdated", () => {
        void this.getData(true);
      }, this);
    },
    _importdone: function _importdone() {
      const stateData = {
        status: true
      };
      this.oEventBus.publish("importChannel", "favPagesImported", stateData);
    },
    getData: function _getData(forceUpdate = false) {
      try {
        const _this2 = this;
        function _temp2() {
          _this2.fireEvent("loaded");
          return _this2.oPagePromise;
        }
        const _temp = function () {
          if (_this2.oPagePromise === undefined || _this2.oPagePromise === null || forceUpdate) {
            _this2.oPagePromise = _this2._getPageManagerInstance().getFavoritePages();
            return Promise.resolve(_this2.oPagePromise).then(function (aFavPages) {
              _this2.aFavPages = aFavPages;
              _this2._getInnerControls();
              _this2.oPagePromise = null;
            });
          }
        }();
        return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Handles the edit page event.
     * Opens the page dialog for managing page data.
     * @param {Event} oEvent - The event object.
     * @private
     */
    _handleEditPages: function _handleEditPages() {
      const parent = this.getParent();
      parent?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.PAGES);
    },
    /**
     * returns an array of placeholder generic tiles for pages
     * @private
     */
    getPlaceholderPageTiles: function _getPlaceholderPageTiles() {
      const placeholderArray = new Array(PAGE_SELECTION_LIMIT).fill(LoadState.Loading);
      const placeholderTiles = placeholderArray.map((tileState, index) => {
        return new GenericTile(recycleId(`${this.getId()}--${index}`), {
          sizeBehavior: "Responsive",
          state: tileState,
          frameType: "OneByOne",
          mode: "IconMode",
          visible: true,
          renderOnThemeChange: true,
          ariaRole: "listitem",
          dropAreaOffset: 8
        }).addStyleClass("cuxPagesPlaceholder");
      });
      return placeholderTiles;
    },
    attachResizeHandler: function _attachResizeHandler(isNewsTileVisible, containerWidth, pagesContentWrapper) {
      try {
        const favPagesCount = this.aFavPages?.length,
          deviceType = this.getDeviceType();
        let domRefClientWidth = containerWidth;
        if ((deviceType === DeviceType.Desktop || deviceType === DeviceType.LargeDesktop || deviceType === DeviceType.XLargeDesktop) && isNewsTileVisible) {
          domRefClientWidth = containerWidth / 2;
        }
        if (!domRefClientWidth) {
          return;
        }
        let tileWidth,
          hBoxWidth,
          finalTilesWidth,
          wrapperWidth = domRefClientWidth / 16; // Divide by 16 to convert to rem,
        const gap = 1;
        pagesContentWrapper.setWidth("100%");
        if (favPagesCount > 0) {
          const pagesPerRow = this.calculatePagesPerRow(favPagesCount, isNewsTileVisible);
          if (pagesPerRow) {
            const maxTileWidth = tileSizes[deviceType].maxWidth;
            let minTileWidth = tileSizes[deviceType].minWidth;
            // when tablet viewport width is below 800px, 46rem(736px) is the container width and 2 rem is paddings
            if (deviceType === DeviceType.Tablet && containerWidth < 736) {
              minTileWidth = tileSizes.smallTabletMinWidth;
            }
            tileWidth = (wrapperWidth - (pagesPerRow - 1) * gap) / pagesPerRow;
            tileWidth = Math.min(tileWidth, maxTileWidth);
            tileWidth = Math.max(tileWidth, minTileWidth);
            finalTilesWidth = `${tileWidth}rem`;
            hBoxWidth = `${pagesPerRow * tileWidth + (pagesPerRow - 1) * gap}rem`;
          } else {
            finalTilesWidth = "auto";
            hBoxWidth = "100%";
          }
          this._setPropertyValues({
            hBoxWidth: hBoxWidth,
            pagesTileWidth: finalTilesWidth
          });
          pagesContentWrapper.setWidth(hBoxWidth);
        }
      } catch (err) {
        if (err instanceof Error) {}
      }
    },
    getUserAvailablePages: function _getUserAvailablePages() {
      try {
        const _this3 = this;
        return Promise.resolve(_this3._getPageManagerInstance().fetchAllAvailablePages());
      } catch (e) {
        return Promise.reject(e);
      }
    },
    calculatePagesPerRow: function _calculatePagesPerRow(favPagesCount, isNewsFeedVisible) {
      let pagesPerRow = 0;
      const deviceType = this.getDeviceType();
      if (deviceType === DeviceType.Desktop || deviceType === DeviceType.LargeDesktop || deviceType === DeviceType.XLargeDesktop) {
        if (isNewsFeedVisible) {
          // halves the tiles in 2 rows
          pagesPerRow = Math.ceil(favPagesCount >= maxTileCOunt ? maxRowCount : favPagesCount / 2);
        } else {
          pagesPerRow = favPagesCount;
        }
      } else if (deviceType === DeviceType.Mobile) {
        // decides number of columns to either 1 or 2
        pagesPerRow = favPagesCount <= mobileOneTileLimit ? 1 : 2;
      } else if (deviceType === DeviceType.Tablet) {
        // upto 4 in a Row, otherwise halves the tiles in 2 rows
        pagesPerRow = favPagesCount <= maxRowCount ? favPagesCount : Math.ceil(favPagesCount / 2);
      }
      return pagesPerRow;
    },
    _getInnerControls: function _getInnerControls() {
      const myFavPage = [];
      this.oInnerControls = [];
      const oParent = this.getParent();
      if (this.aFavPages) {
        this.aFavPages.forEach((oPage, index) => {
          myFavPage.push(new Page(recycleId(`${this.getId()}-favPage-${index}`), {
            title: oPage.title,
            subTitle: oPage.title === oPage.spaceTitle ? "" : oPage.spaceTitle,
            icon: oPage.icon,
            bgColor: oPage.BGColor,
            pageId: oPage.pageId,
            spaceId: oPage.spaceId,
            spaceTitle: oPage.spaceTitle,
            url: "#Launchpad-openFLPPage?pageId=" + oPage.pageId + "&spaceId=" + oPage.spaceId
          }));
        });
        myFavPage.forEach((oFav, index2) => {
          this.oInnerControls.push(new GenericTile(recycleId(`${oFav.getId()}--genericTile--${index2}`), {
            // width: "10rem",
            header: oFav.getTitle(),
            subheader: oFav.getSubTitle(),
            press: () => void oFav.onPageTilePress(oFav),
            sizeBehavior: "Responsive",
            state: "Loaded",
            frameType: "OneByOne",
            mode: "IconMode",
            backgroundColor: oFav.getBgColor(),
            tileIcon: oFav.getIcon(),
            visible: true,
            renderOnThemeChange: true,
            ariaRole: "listitem",
            dropAreaOffset: 8,
            url: oFav.getProperty("url")
          }).addStyleClass("sapCuxPageTile"));
          this.addAggregation("pages", oFav, true);
        });
        this._oWrapperFlexBox.setAlignItems(this.aFavPages.length == 1 ? "Start" : "Center");
        const dndConfigs = this._oWrapperFlexBox.getDragDropConfig();
        if (this.aFavPages.length) {
          oParent?.panelLoadedFn("Page", {
            loaded: true,
            count: this.aFavPages.length
          });
          this._setFavPagesContent();
          if (!dndConfigs?.length) this.addDragDropConfigTo(this._oWrapperFlexBox, oEvent => void this._handlePageDnd(oEvent), function (oEvent) {
            try {
              return Promise.resolve(attachKeyboardHandler(oEvent, true)).then(function () {});
            } catch (e) {
              return Promise.reject(e);
            }
          });
        } else {
          this._oWrapperFlexBox.removeAllDragDropConfig();
          dndConfigs.forEach(dndConfig => {
            dndConfig.destroy();
          });
          oParent?.panelLoadedFn("Page", {
            loaded: true,
            count: 0
          });
          this._setNoPageContent();
        }
      } else {
        oParent?.panelLoadedFn("Page", {
          loaded: false,
          count: 0
        });
        this.removeAggregation("content", this._oWrapperFlexBox);
      }
    },
    _setFavPagesContent: function _setFavPagesContent() {
      this._oWrapperFlexBox.removeAllItems();
      this._oWrapperFlexBox.removeStyleClass("pagesFlexBox");
      this.oInnerControls.forEach(oTile => {
        this._oWrapperFlexBox.addItem(oTile);
      });
    },
    _createNoPageContent: function _createNoPageContent() {
      if (!this._oIllusMsg) {
        this._oIllusMsg = new IllustratedMessage(this.getId() + "--idNoPages", {
          illustrationSize: IllustratedMessageSize.Small,
          illustrationType: IllustratedMessageType.NoSavedItems,
          title: this._i18nBundle.getText("noDataPageTitle"),
          description: this._i18nBundle.getText("noPageDescription")
        }).addStyleClass("myHomeIllustratedMsg myHomeIllustratedMessageAlign");
        this.oAddPageBtn = new Button(this.getId() + "--idAddPageBtn", {
          text: this._i18nBundle.getText("addPage"),
          tooltip: this._i18nBundle.getText("addPage"),
          type: "Emphasized",
          press: () => this._handleEditPages()
        });
        addFESRSemanticStepName(this.oAddPageBtn, "press", "addPages");
      }
    },
    _setNoPageContent: function _setNoPageContent() {
      if (!this.oWrapperNoPageVBox) {
        this.oWrapperNoPageVBox = new VBox(recycleId(`${this.getId()}--wrapperNoPageVBox`), {
          width: "100%",
          height: "17rem",
          backgroundDesign: "Solid",
          justifyContent: "Center"
        }).addStyleClass("sapUiRoundedBorder noCardsBorder");
        this._createNoPageContent();
        this._oIllusMsg.addAdditionalContent(this.oAddPageBtn);
        this.oWrapperNoPageVBox.addItem(this._oIllusMsg);
      }
      this._oWrapperFlexBox.removeAllItems();
      this._oWrapperFlexBox.addStyleClass("pagesFlexBox");
      this._oWrapperFlexBox.addItem(this.oWrapperNoPageVBox);
    },
    _setPropertyValues: function _setPropertyValues(oVal) {
      const propNames = Object.keys(oVal);
      propNames.forEach(sProperty => {
        if (sProperty === "hBoxWidth") {
          this._oWrapperFlexBox.setProperty("width", oVal[sProperty]);
        } else if (sProperty === "pagesTileWidth" && this.oInnerControls.length) {
          this.oInnerControls.forEach(function (oTile) {
            oTile.setProperty("width", oVal[sProperty]);
          });
        }
      });
    },
    _handlePageDnd: function _handlePageDnd(oEvent) {
      try {
        const _this4 = this;
        const sInsertPosition = oEvent.getParameter?.("dropPosition"),
          oDragItem = oEvent?.getParameter?.("draggedControl"),
          oDropItem = oEvent.getParameter("droppedControl"),
          iDragItemIndex = oDragItem.getParent()?.indexOfItem(oDragItem);
        let iDropItemIndex = oDragItem.getParent()?.indexOfItem(oDropItem);
        if (sInsertPosition === "Before" && iDragItemIndex === iDropItemIndex - 1) {
          iDropItemIndex--;
        } else if (sInsertPosition === "After" && iDragItemIndex === iDropItemIndex + 1) {
          iDropItemIndex++;
        }
        const _temp3 = function () {
          if (iDragItemIndex !== iDropItemIndex) {
            return Promise.resolve(_this4._DragnDropPages(iDragItemIndex, iDropItemIndex, sInsertPosition)).then(function () {});
          }
        }();
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _DragnDropPages: function _DragnDropPages(iDragItemIndex, iDropItemIndex, sInsertPosition) {
      try {
        const _this5 = this;
        if (sInsertPosition === "Before" && iDragItemIndex < iDropItemIndex) {
          iDropItemIndex--;
        } else if (sInsertPosition === "After" && iDragItemIndex > iDropItemIndex) {
          iDropItemIndex++;
        }
        // take the moved item from dragIndex and add to dropindex
        const oItemMoved = _this5.aFavPages.splice(iDragItemIndex, 1)[0];
        _this5.aFavPages.splice(iDropItemIndex, 0, oItemMoved);
        _this5.updateTileOrder(iDragItemIndex, iDropItemIndex);
        return Promise.resolve(_this5.writeFavPagesIntoPers(_this5.aFavPages)).then(function () {
          focusDraggedItem(_this5._oWrapperFlexBox, iDropItemIndex);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Updates the tile order in the UI after a drag-and-drop action.
     *
     * Moves a tile from `dragIndex` to `dropIndex` in the internal array
     * and re-renders the tile container to reflect the new order.
     *
     * @param {number} dragIndex - Index of the dragged tile.
     * @param {number} dropIndex - Index to insert the dragged tile.
     */
    updateTileOrder: function _updateTileOrder(dragIndex, dropIndex) {
      const [draggedItem] = this.oInnerControls.splice(dragIndex, 1);
      this.oInnerControls.splice(dropIndex, 0, draggedItem);
      this._oWrapperFlexBox.removeAllItems();
      this.oInnerControls.forEach(oTile => {
        this._oWrapperFlexBox.addItem(oTile);
      });
    },
    /**
     * Writes the favourite pages data into personalizer
     *
     * @private
     * @async
     * @param {IPage[]} favPages
     * @returns {*}
     */
    writeFavPagesIntoPers: function _writeFavPagesIntoPers(favPages) {
      try {
        const _this6 = this;
        function _temp5() {
          return Promise.resolve(_this6.oPersonalizer.read()).then(function (oPersData) {
            if (!oPersData) oPersData = {
              favouritePages: []
            };
            oPersData.favouritePages = favPages;
            return Promise.resolve(_this6.oPersonalizer.write(oPersData)).then(function () {});
          });
        }
        const _temp4 = function () {
          if (_this6.oPersonalizer === undefined) {
            return Promise.resolve(UShellPersonalizer.getInstance(PersonalisationUtils.getPersContainerId(_this6), PersonalisationUtils.getOwnerComponent(_this6))).then(function (_UShellPersonalizer$g) {
              _this6.oPersonalizer = _UShellPersonalizer$g;
            });
          }
        }();
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    applyColorPersonalizations: function _applyColorPersonalizations(personalizations) {
      void this._getPageManagerInstance()?.applyColorPersonalizations(personalizations);
    },
    applyIconPersonalizations: function _applyIconPersonalizations(personalizations) {
      void this._getPageManagerInstance()?.applyIconPersonalizations(personalizations);
    },
    _getPageManagerInstance: function _getPageManagerInstance() {
      this.pageManagerInstance = this.pageManagerInstance || getPageManagerInstance(this);
      return this.pageManagerInstance;
    },
    /**
     * Returns the wrapper FlexBox for the page panel.
     *
     * @returns {sap.m.FlexBox} The FlexBox that wraps the pages.
     * @private
     */
    getPageWrapper: function _getPageWrapper() {
      return this._oWrapperFlexBox;
    }
  });
  return PagePanel;
});
//# sourceMappingURL=PagePanel-dbg.js.map
