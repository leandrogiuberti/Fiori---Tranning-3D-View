/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/f/GridContainer", "sap/f/GridContainerSettings", "sap/m/Button", "sap/m/Dialog", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/Input", "sap/m/Title", "sap/m/Toolbar", "sap/m/ToolbarSpacer", "sap/ui/core/Icon", "sap/ui/core/theming/Parameters", "sap/ushell/Config", "sap/ushell/Container", "./BaseAppPersPanel", "./Group", "./utils/Accessibility", "./utils/CommonUtils", "./utils/Constants"], function (GridContainer, GridContainerSettings, Button, Dialog, IllustratedMessageSize, IllustratedMessageType, Input, Title, Toolbar, ToolbarSpacer, Icon, Parameters, Config, Container, __BaseAppPersPanel, __Group, ___utils_Accessibility, ___utils_CommonUtils, ___utils_Constants) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
  function _settle(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      const observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  const _Pact = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      const result = new _Pact();
      const state = this.s;
      if (state) {
        const callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle(result, 1, callback(this.v));
          } catch (e) {
            _settle(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          const value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(value));
          } else {
            _settle(result, 2, value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact(thenable) {
    return thenable instanceof _Pact && thenable.s & 1;
  }
  function _forTo(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    return pact;
  }
  const BaseAppPersPanel = _interopRequireDefault(__BaseAppPersPanel);
  function _forOf(target, body, check) {
    if (typeof target[_iteratorSymbol] === "function") {
      var iterator = target[_iteratorSymbol](),
        step,
        pact,
        reject;
      function _cycle(result) {
        try {
          while (!(step = iterator.next()).done && (!check || !check())) {
            result = body(step.value);
            if (result && result.then) {
              if (_isSettledPact(result)) {
                result = result.v;
              } else {
                result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
                return;
              }
            }
          }
          if (pact) {
            _settle(pact, 1, result);
          } else {
            pact = result;
          }
        } catch (e) {
          _settle(pact || (pact = new _Pact()), 2, e);
        }
      }
      _cycle();
      if (iterator.return) {
        var _fixup = function (value) {
          try {
            if (!step.done) {
              iterator.return();
            }
          } catch (e) {}
          return value;
        };
        if (pact && pact.then) {
          return pact.then(_fixup, function (e) {
            throw _fixup(e);
          });
        }
        _fixup();
      }
      return pact;
    }
    // No support for Symbol.iterator
    if (!("length" in target)) {
      throw new TypeError("Object is not iterable");
    }
    // Handle live collections properly
    var values = [];
    for (var i = 0; i < target.length; i++) {
      values.push(target[i]);
    }
    return _forTo(values, function (i) {
      return body(values[i]);
    }, check);
  }
  const Group = _interopRequireDefault(__Group);
  const getInvisibleText = ___utils_Accessibility["getInvisibleText"];
  const filterVisualizations = ___utils_CommonUtils["filterVisualizations"];
  const getPageManagerInstance = ___utils_CommonUtils["getPageManagerInstance"];
  const MYHOME_PAGE_ID = ___utils_Constants["MYHOME_PAGE_ID"];
  const _showAddApps = () => {
    return Config.last("/core/shell/enablePersonalization") || Config.last("/core/catalog/enabled");
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
  const SpacePanel = BaseAppPersPanel.extend("sap.cux.home.SpacePanel", {
    metadata: {
      library: "sap.cux.home",
      defaultAggregation: "apps",
      properties: {
        /**
         * Specifies the space whose apps should be loaded.
         */
        spaceId: {
          type: "string",
          group: "Data",
          defaultValue: ""
        },
        /**
         * Title for the tiles panel
         */
        title: {
          type: "string",
          group: "Misc",
          defaultValue: ""
        }
      },
      aggregations: {
        /**
         * Apps aggregation for Favorite apps
         */
        apps: {
          type: "sap.cux.home.App",
          singularName: "app",
          multiple: true,
          visibility: "hidden"
        },
        /**
         * Group aggregation for Favorite apps
         */
        groups: {
          type: "sap.cux.home.Group",
          singularName: "group",
          multiple: true,
          visibility: "hidden"
        }
      }
    },
    /**
     * Constructor for a new favorite app panel.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      BaseAppPersPanel.prototype.constructor.call(this, id, settings);
    },
    init: function _init() {
      BaseAppPersPanel.prototype.init.call(this);
      this.setProperty("key", "spacePanel");
      this.pageManager = getPageManagerInstance(this);
      this.attachPersistDialog(() => {
        // if while navigating to different page, a group detail dialog was open, then while navigating back group detail dialog should be in open state.
        if (this._selectedGroupId) {
          void this._showGroupDetailDialog(this._selectedGroupId, false, this._selectedPageId);
        }
      });
    },
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
    loadApps: function _loadApps() {
      try {
        const _this = this;
        function _temp4(_this$pageManager$fet) {
          function _temp3() {
            //Filter out static tiles

            //Create groups

            //Create apps
            allVisualizations = filterVisualizations(allVisualizations);
            _this.destroyAggregation("groups", true);
            const groupVisualizations = allVisualizations.filter(visualization => visualization.isSection);
            const groups = _this._generateGroups(groupVisualizations);
            _this._setGroups(groups);
            _this.destroyAggregation("apps", true);
            const appVisualizations = allVisualizations.filter(visualization => !visualization.isSection);
            const apps = _this.generateApps(appVisualizations);
            _this.setApps(apps);
            if (_this._selectedGroupId) {
              void _this._setGroupDetailDialogApps(_this._selectedGroupId, _this._selectedPageId);
            }
          }
          _this.allSpaces = _this$pageManager$fet;
          const space = _this.allSpaces.find(space => space.id === spaceId);
          if (!space || space.children.length === 0) _this.setApps([]);
          let allVisualizations = [];
          const _temp2 = function () {
            if (space && space.children.length > 0) {
              const _temp = _forOf(space.children, function (child) {
                return Promise.resolve(_this.appManagerInstance.fetchFavVizs(true, false, child.id)).then(function (visualizations) {
                  allVisualizations.push(...visualizations);
                });
              });
              if (_temp && _temp.then) return _temp.then(function () {});
            }
          }();
          return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
        }
        const spaceId = _this.getProperty("spaceId");
        const _this$allSpaces = _this.allSpaces;
        return Promise.resolve(_this$allSpaces ? _temp4(_this$allSpaces) : Promise.resolve(_this.pageManager.fetchAllAvailableSpaces()).then(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Creates and returns group instances for given group objects
     * @private
     * @param {object[]} aGroupObject - Array of group object.
     * @returns {sap.cux.home.Group[]} - Array of group instances
     */
    _generateGroups: function _generateGroups(groupVisualizations) {
      return groupVisualizations.map((groupVisualization, index) => {
        const bgColor = typeof groupVisualization.BGColor === "object" && "key" in groupVisualization.BGColor ? groupVisualization.BGColor.key : groupVisualization.BGColor;
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
        groupVisualization.menuItems?.forEach(oMenuItem => {
          group.addAggregation("menuItems", oMenuItem);
        });
        return group;
      });
    },
    /**
     * Add multiple groups in the groups aggregation.
     * @private
     * @param {sap.cux.home.Group[]} groups - Array of groups.
     */
    _setGroups: function _setGroups(groups) {
      groups.forEach(group => {
        this.addAggregation("groups", group, true);
      });
    },
    /**
     * Navigates to the App Finder with optional group Id.
     * @async
     * @private
     * @param {string} [groupId] - Optional group Id
     */
    navigateToAppFinder: function _navigateToAppFinder(groupId, pageID = MYHOME_PAGE_ID) {
      try {
        return Promise.resolve(Container.getServiceAsync("Navigation")).then(function (navigationService) {
          const navigationObject = {
            pageID
          };
          if (groupId) {
            navigationObject.sectionID = groupId;
          }
          return Promise.resolve(navigationService.navigate({
            target: {
              shellHash: `Shell-appfinder?&/catalog/${JSON.stringify(navigationObject)}`
            }
          })).then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Shows the detail dialog for a group.
     * @async
     * @param {string} groupId - The Id of the group.
     * @param {boolean} [editMode=false] - Whether to open the dialog in edit mode.
     * @private
     */
    _showGroupDetailDialog: function _showGroupDetailDialog(groupId, editMode = false, pageId = MYHOME_PAGE_ID) {
      try {
        const _this2 = this;
        const group = _this2._getGroup(groupId);
        if (!group) {
          return Promise.resolve();
        }
        _this2._selectedGroupId = groupId;
        _this2._selectedPageId = pageId;
        const dialog = _this2._generateGroupDetailDialog();
        //set group icon
        const groupIconControl = _this2._controlMap.get(`${_this2.getId()}-detailDialog-toolbar-color`);
        groupIconControl.setColor(Parameters.get({
          name: group.getBgColor()
        }));
        //set group apps
        return Promise.resolve(_this2._setGroupDetailDialogApps(groupId, pageId)).then(function () {
          dialog.open();
          //set group title
          _this2._setGroupNameControl(group.getTitle(), editMode);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Sets the apps for the detail dialog for a group.
     * @async
     * @param {string} groupId - The Id of the group.
     * @returns {Promise<void>} - A Promise that resolves once the apps for the group detail dialog are set.
     * @private
     */
    _setGroupDetailDialogApps: function _setGroupDetailDialogApps(groupId, pageId = MYHOME_PAGE_ID) {
      try {
        const _this3 = this;
        const group = _this3._getGroup(groupId);
        const _temp5 = function () {
          if (group) {
            return Promise.resolve(_this3.appManagerInstance.getSectionVisualizations(groupId, false, pageId)).then(function (_this3$appManagerInst) {
              let appVisualizations = filterVisualizations(_this3$appManagerInst);
              group.destroyAggregation("apps", true);
              const apps = _this3.generateApps(appVisualizations);
              const appsWrapper = _this3._controlMap.get(`${_this3.getId()}-detailDialog-apps`);
              _this3._setAggregation(group, apps, "apps");
              appsWrapper.destroyItems();
              _this3._setAggregation(appsWrapper, group.getApps().map(app => _this3.getParent()._getAppTile(app)));
              _this3._applyGroupedAppsPersonalization(groupId);
              _this3._dispatchAppsLoadedEvent(apps);
            });
          }
        }();
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Applies personalization to the grouped apps within the specified group.
     * @param {string} groupId - The ID of the group to which the apps belong.
     * @private
     */
    _applyGroupedAppsPersonalization: function _applyGroupedAppsPersonalization(groupId) {
      const appsWrapper = this._controlMap.get(`${this.getId()}-detailDialog-apps`);
      const tiles = appsWrapper?.getItems() || [];
      void this._applyTilesPersonalization(tiles, groupId);
    },
    /**
     * Applies Deprecated Info for apps inside the group.
     * @param {App[]} apps - The ID of the group to which the apps belong.
     * @private
     */
    _dispatchAppsLoadedEvent: function _dispatchAppsLoadedEvent(apps) {
      const appsWrapper = this._controlMap.get(`${this.getId()}-detailDialog-apps`);
      const tiles = appsWrapper?.getItems() || [];
      this.getParent().fireEvent("appsLoaded", {
        apps,
        tiles
      });
    },
    /**
     * Generates the group detail dialog.
     * @private
     * @returns {sap.m.Dialog} The generated detail dialog for the group.
     */
    _generateGroupDetailDialog: function _generateGroupDetailDialog() {
      const id = `${this.getId()}-detailDialog`;
      if (!this._controlMap.get(id)) {
        //group color icon
        this._controlMap.set(`${id}-toolbar-color`, new Icon({
          id: `${id}-toolbar-color`,
          src: "sap-icon://color-fill",
          size: "1.25rem"
        }).addStyleClass("sapUiTinyMarginEnd"));
        this._controlMap.set(`${id}-toolbar-title`, new Title({
          id: `${id}-toolbar-title`,
          visible: true
        }));
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
        this._controlMap.set(`${id}-addAppsBtn`, new Button(`${id}-addAppsBtn`, {
          text: this._i18nBundle.getText("addApps"),
          icon: "sap-icon://action",
          visible: _showAddApps(),
          press: () => {
            const groupId = this._selectedGroupId;
            this._closeGroupDetailDialog();
            this._selectedGroupId = groupId;
            void this.navigateToAppFinder(groupId, this._selectedPageId);
          }
        }));
        this._controlMap.set(id, new Dialog(id, {
          content: this._controlMap.get(`${id}-apps`),
          contentWidth: "60.75rem",
          endButton: new Button({
            id: `${id}-groupDetailCloseBtn`,
            text: this._i18nBundle.getText("XBUT_CLOSE"),
            press: this._closeGroupDetailDialog.bind(this)
          }),
          escapeHandler: this._closeGroupDetailDialog.bind(this),
          customHeader: new Toolbar(`${this.getId()}-toolbar`, {
            content: [this._controlMap.get(`${id}-toolbar-color`), this._controlMap.get(`${id}-toolbar-title`), this._controlMap.get(`${id}-toolbar-title-edit`), this._controlMap.get(`${id}-toolbar-renameTitle`), new ToolbarSpacer({
              id: `${this.getId()}-toolbarSpacer`
            }), this._controlMap.get(`${id}-addAppsBtn`)]
          })
        }).addStyleClass("sapCuxGroupDetailDialog"));
      }
      return this._controlMap.get(id);
    },
    /**
     * Closes the group detail dialog.
     * @private
     */
    _closeGroupDetailDialog: function _closeGroupDetailDialog() {
      const groupDetailDialog = this._controlMap.get(`${this.getId()}-detailDialog`);
      const group = this._getGroup(this._selectedGroupId);
      group?.destroyApps();
      this._selectedGroupId = undefined;
      groupDetailDialog?.close();
    },
    /**
     * Sets the group name control in the detail dialog.
     * Shows input control to edit the group name in edit mode, otherwise, shows group name as title control.
     * @private
     * @param {string} groupTitle - The title of the group.
     * @param {boolean} editMode - Whether the dialog is in edit mode.
     */
    _setGroupNameControl: function _setGroupNameControl(groupTitle, editMode) {
      const groupDetailDialog = this._controlMap.get(`${this.getId()}-detailDialog`);
      const groupTitleControl = this._controlMap.get(`${this.getId()}-detailDialog-toolbar-title`);
      const groupInputControl = this._controlMap.get(`${this.getId()}-detailDialog-toolbar-title-edit`);
      groupInputControl.setValue(groupTitle);
      groupTitleControl.setText(groupTitle);
      groupInputControl?.setVisible(editMode);
      groupTitleControl?.setVisible(!editMode);
      if (editMode) {
        //in edit mode set the focus on input
        groupDetailDialog.setInitialFocus(groupInputControl);
      }
    },
    /**
     * Handles the press event of a group.
     * @param {Group$PressEvent} event - The press event object.
     * @private
     */
    _handleGroupPress: function _handleGroupPress(event) {
      const groupId = event.getParameter("groupId");
      const pageId = event.getParameter("pageId") || MYHOME_PAGE_ID;
      if (groupId) {
        void this._showGroupDetailDialog(groupId, false, pageId);
      }
    },
    /**
     * Generates illustrated message for favorite apps panel.
     * @private
     * @override
     * @returns {sap.m.IllustratedMessage} Illustrated error message.
     */
    generateIllustratedMessage: function _generateIllustratedMessage() {
      const illustratedMessage = BaseAppPersPanel.prototype.generateIllustratedMessage.call(this);
      //overrride the default title and add additional content
      illustratedMessage.setDescription(this._i18nBundle.getText("noFavAppsDescription"));
      illustratedMessage.setIllustrationSize(IllustratedMessageSize.Small);
      illustratedMessage.setIllustrationType(IllustratedMessageType.AddingColumns);
      illustratedMessage.addAdditionalContent(new Button(`${this.getId()}-errorMessage-addApps`, {
        text: this._i18nBundle.getText("addApps"),
        tooltip: this._i18nBundle.getText("addAppsTooltip"),
        icon: "sap-icon://action",
        visible: _showAddApps(),
        press: () => {
          void this.navigateToAppFinder();
        },
        type: "Emphasized"
      }));
      return illustratedMessage;
    }
  });
  return SpacePanel;
});
//# sourceMappingURL=SpacePanel-dbg.js.map
