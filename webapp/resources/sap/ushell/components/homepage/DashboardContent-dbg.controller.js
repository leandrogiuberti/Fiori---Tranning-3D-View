// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
 *
 * @fileoverview Classical home page content controller
 * @deprecated since 1.112. Deprecated together with the classic homepage.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Core",
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/components/homepage/DashboardUIActions",
    "sap/ushell/components/HomepageManager",
    "sap/ushell/EventHub",
    "sap/ushell/Layout",
    "sap/ushell/resources",
    "sap/ushell/utils"
], (
    Log,
    Core,
    Controller,
    Device,
    Filter,
    FilterOperator,
    jQuery,
    DashboardUIActions,
    HomepageManager,
    EventHub,
    Layout,
    ushellResources,
    utils
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.homepage.DashboardContent", {
        onInit: function () {
            const oEventBus = Core.getEventBus();
            this.handleDashboardScroll = function () {
                // TODO: there are race conditions in the scrolling mechanism related to the "/topGroupInViewPortIndex" model property;
                // this "setTimeout" aims for consistent behavior between Chrome and Firefox until a proper refactoring is done.
                window.setTimeout(this._handleDashboardScroll.bind(this), 0);
            }.bind(this);

            oEventBus.subscribe("sap.ushell", "appOpened", this._appOpenedHandler, this);
            oEventBus.subscribe("launchpad", "dashboardModelContentLoaded", this._modelLoaded, this);
            oEventBus.subscribe("launchpad", "actionModeInactive", this._handleGroupVisibilityChanges, this);
            oEventBus.subscribe("launchpad", "switchTabBarItem", this._handleTabBarItemPressEventHandler, this);

            // when the browser tab is hidden we want to stop sending requests from tiles
            window.document.addEventListener("visibilitychange", utils.handleTilesVisibility, false);
        },

        onExit: function () {
            const oEventBus = Core.getEventBus();
            oEventBus.unsubscribe("sap.ushell", "appOpened", this._appOpenedHandler, this);
            oEventBus.unsubscribe("launchpad", "dashboardModelContentLoaded", this._modelLoaded, this);
            oEventBus.unsubscribe("launchpad", "actionModeInactive", this._handleGroupVisibilityChanges, this);
            oEventBus.unsubscribe("launchpad", "switchTabBarItem", this._handleTabBarItemPressEventHandler, this);
            window.document.removeEventListener("visibilitychange", utils.handleTilesVisibility, false);
            if (this.oDashboardUIActionsModule) {
                this.oDashboardUIActionsModule.destroy();
                delete this.oDashboardUIActionsModule;
            }
            window.removeEventListener("resize", this._resizeHandler.bind(this));
        },

        onAfterRendering: function () {
            utils.setPerformanceMark("FLP - dashboard after rendering");

            const oHomepageManager = HomepageManager.prototype.getInstance();
            if (!oHomepageManager.getPreparedGroupModel()) {
                oHomepageManager.loadPersonalizedGroups();
            } else {
                EventHub.once("firstSegmentCompleteLoaded").do(oHomepageManager.handleFirstSegmentLoaded.bind(oHomepageManager));
            }

            const oEventBus = Core.getEventBus();
            let oModel;
            let topViewPortGroupIndex;
            let oGroup;
            let bIsInEditTitle;

            // Bind launchpad event handlers
            oEventBus.unsubscribe("launchpad", "scrollToGroup", this._scrollToGroup, this);
            oEventBus.unsubscribe("launchpad", "scrollToGroupByName", this._scrollToGroupByName, this);
            oEventBus.subscribe("launchpad", "scrollToGroup", this._scrollToGroup, this);
            oEventBus.subscribe("launchpad", "scrollToGroupByName", this._scrollToGroupByName, this);

            Device.orientation.attachHandler(function () {
                const jqTileContainers = jQuery("#dashboardGroups").find(".sapUshellTileContainer").filter(":visible");
                if (jqTileContainers.length) {
                    oModel = this.getView().getModel();
                    topViewPortGroupIndex = oModel.getProperty("/topGroupInViewPortIndex");

                    if (jqTileContainers.get(topViewPortGroupIndex)) {
                        oGroup = Core.byId(jqTileContainers.get(topViewPortGroupIndex).id);
                        bIsInEditTitle = oModel.getProperty("/editTitle");
                        this._publishAsync("launchpad", "scrollToGroup", {
                            group: oGroup,
                            isInEditTitle: bIsInEditTitle
                        });
                    }
                }
            }, this);

            window.addEventListener("resize", this._resizeHandler.bind(this));

            this._updateTopGroupInModel();
        },

        _resizeHandler: function () {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(this.resizeHandler.bind(this), 300);
        },

        _dashboardDeleteTileHandler: function (oEvent) {
            const oTileModel = oEvent.getSource().getBindingContext().getObject();
            Core.getEventBus().publish("launchpad", "deleteTile", {
                tileId: oTileModel.uuid,
                items: "tiles"
            }, this);
        },

        dashboardTilePress: function (oEvent) {
            const oTileControl = oEvent.getSource();

            if (!oTileControl) {
                return;
            }

            Core.getEventBus().publish("launchpad", "dashboardTileClick", { uuid: oTileControl.getUuid() });

            if (Device.system.desktop) {
                const oRenderer = sap.ushell.Container.getRendererInternal();
                const oHomeRoute = oRenderer.getRouter().getRoute("home");

                if (this._fnSetFocusOnLastVisitedTile) {
                    // On tiles with with buttons, the tile press can be triggered without navigating
                    oHomeRoute.detachBeforeMatched(this._fnSetFocusOnLastVisitedTile);
                }

                this._fnSetFocusOnLastVisitedTile = this._setFocusOnLastVisitedTile.bind(this, oTileControl, oHomeRoute);
                oHomeRoute.attachBeforeMatched(this._fnSetFocusOnLastVisitedTile);
            }
        },

        _setFocusOnLastVisitedTile: function (tileControl, homeRoute) {
            sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], (ComponentKeysHandler) => {
                ComponentKeysHandler.getInstance().then((ComponentKeysHandlerInstance) => {
                    ComponentKeysHandlerInstance.moveScrollDashboard(tileControl.$());
                    homeRoute.detachBeforeMatched(this._fnSetFocusOnLastVisitedTile);
                    delete this._fnSetFocusOnLastVisitedTile;
                });
            });
        },

        _updateTopGroupInModel: function () {
            const oModel = this.getView().getModel();
            const topViewPortGroupIndex = this._getIndexOfTopGroupInViewPort();

            const iSelectedGroupInModel = this._getModelGroupFromVisibleIndex(topViewPortGroupIndex);

            oModel.setProperty("/iSelectedGroup", iSelectedGroupInModel);
            oModel.setProperty("/topGroupInViewPortIndex", topViewPortGroupIndex);
        },

        _getIndexOfTopGroupInViewPort: function () {
            const oViewDomRef = this.getView().getDomRef();
            if (!oViewDomRef) {
                return 0;
            }
            const oScrollableElement = oViewDomRef.getElementsByTagName("section")[0];
            const jqTileContainers = jQuery(oScrollableElement).find(".sapUshellTileContainer").not(".sapUshellHidden");

            // in some weird cases, "jqTileContainers" may be undefined -> bail out
            if (!jqTileContainers) {
                return 0;
            }

            for (let i = 0; i < jqTileContainers.length; i++) {
                const oGroupElement = jqTileContainers[i].parentElement;
                if (oScrollableElement.scrollTop <= (oGroupElement.offsetTop + oGroupElement.offsetHeight)) {
                    return i;
                }
            }

            // safeguard: returns last Group in case no Groups are visible (e.g. on overscroll)
            return (jqTileContainers.length ? (jqTileContainers.length - 1) : 0);
        },

        _handleDashboardScroll: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            const nDelay = 100;

            const sHomePageGroupDisplay = oModel.getProperty("/homePageGroupDisplay");
            const bEnableAnchorBar = sHomePageGroupDisplay !== "tabs";
            const bTileActionModeActive = oModel.getProperty("/tileActionModeActive");

            // We want to set tiles visibility only after the user finished the scrolling.
            // In IE this event is thrown also after scroll direction change, so we wait 1 second to
            // determine whether scrolling was ended completely or not
            function fHandleTilesVisibility () {
                utils.handleTilesVisibility();
            }
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(fHandleTilesVisibility, nDelay);

            if (!Device.system.phone) {
                // close anchor popover if it is open
                oView.oAnchorNavigationBar.closeOverflowPopup();
            }

            if (bEnableAnchorBar || bTileActionModeActive) {
                this._updateTopGroupInModel();
            }

            // update anchor navigation bar
            oView.oAnchorNavigationBar.reArrangeNavigationBarElements();
        },

        // Delete or Reset a given group according to the removable state.
        _handleGroupDeletion: function (oGroupBindingCtx) {
            sap.ui.require(["sap/m/MessageBox"], (MessageBox) => {
                const oEventBus = Core.getEventBus();
                const oGroup = oGroupBindingCtx.getObject();
                const bIsGroupRemovable = oGroup.removable;
                const sGroupTitle = oGroup.title;
                const sGroupId = oGroup.groupId;
                const oResourceBundle = ushellResources.i18n;
                const mActions = MessageBox.Action;
                const mCurrentAction = (bIsGroupRemovable ? mActions.DELETE : oResourceBundle.getText("ResetGroupBtn"));

                sap.ushell.Container.getServiceAsync("MessageInternal").then((oMessageSrvc) => {
                    oMessageSrvc.confirm(oResourceBundle.getText(bIsGroupRemovable ? "delete_group_msg" : "reset_group_msg", [sGroupTitle]), (oAction) => {
                        if (oAction === mCurrentAction) {
                            oEventBus.publish("launchpad", bIsGroupRemovable ? "deleteGroup" : "resetGroup", {
                                groupId: sGroupId
                            });
                        }
                    }, oResourceBundle.getText(bIsGroupRemovable ? "delete_group" : "reset_group"), [mCurrentAction, mActions.CANCEL]);
                });
            });
        },

        _modelLoaded: function () {
            this.bModelInitialized = true;
            Layout.getInitPromise().then(() => {
                this._initializeUIActions();
            });
        },

        _initializeUIActions: function () {
            if (!this.oDashboardUIActionsModule) {
                this.oDashboardUIActionsModule = new DashboardUIActions();
            }
            this.oDashboardUIActionsModule.initializeUIActions(this);
        },

        resizeHandler: function () {
            utils.recalculateBottomSpace();
            utils.handleTilesVisibility();

            // Layout calculation is relevant only when the dashboard is presented
            if (Layout && jQuery("#dashboardGroups").is(":visible") && this.bModelInitialized) {
                Layout.reRenderGroupsLayout(null);
                this._initializeUIActions();
            }
        },

        _appOpenedHandler: function (sChannelId, sEventId, oData) {
            const oModel = this.getView().getModel();
            const sAdditionalInfo = oData.additionalInformation || "";

            // checking if application component opened is not the FLP App Component (e.g. navigation to an app, not 'Home')
            // call to set all tiles visibility off (so no tile calls will run in the background)
            const oParentComponent = this.getOwnerComponent();
            const sParentName = oParentComponent.getMetadata().getComponentName();
            if (sAdditionalInfo.indexOf(sParentName) === -1) {
                utils.setTilesNoVisibility(); // setting no visibility on all visible tiles
            }

            // in a direct navigation scenario the ActionMode might not exist yet.
            // In this case we would like to skip this check.
            const ActionMode = sap.ui.require("sap/ushell/components/homepage/ActionMode");

            if (oModel.getProperty("/tileActionModeActive") && ActionMode) {
                ActionMode.toggleActionMode(oModel, "Menu Item");

                if (oModel.getProperty("/homePageGroupDisplay") === "tabs") {
                    this._deactivateActionModeInTabsState();
                    // this call is necessary to make the current tab active.
                    this.getView().oAnchorNavigationBar.reArrangeNavigationBarElements();
                }
            }

            if (this.oDashboardUIActionsModule) {
                this.oDashboardUIActionsModule.disableAllDashboardUiAction();
            }
        },

        /**
         * Scrolling the dashboard according to group name, in order to show a desired group
         *
         * @param {string} sChannelId Not used
         * @param {string} sEventId not used
         * @param {object} oData Payload for the event handler
         */
        _scrollToGroupByName: function (sChannelId, sEventId, oData) {
            const aGroups = this.getView().getModel().getProperty("/groups");
            const sGroupName = oData.groupName;

            sap.ushell.Container.getServiceAsync("FlpLaunchPage").then((oLaunchPageSrv) => {
                aGroups.forEach((oGroup) => {
                    if (oLaunchPageSrv.getGroupTitle(oGroup.object) === sGroupName) {
                        this._scrollToGroup(sChannelId, sEventId, {
                            groupId: oGroup.groupId
                        });
                    }
                });
            });
        },

        /**
         * Scrolls the dashboard to show a Group.
         *
         * @param {string} sChannelId Not used.
         * @param {string} sEventId Not used.
         * @param {object} oData Payload for the event handler.
         *
         * @returns {Promise<undefined>} resolves if the scrolling worked, rejects if it didn't.
         */
        _scrollToGroup: function (sChannelId, sEventId, oData) {
            const sGroupId = oData.group ? oData.group.getGroupId() : oData.groupId;
            let oGroup;

            if (this.oView.oDashboardGroupsBox.getGroups()) {
                // Calling again getGroups() because of the lazy loading mechanism
                oGroup = this.oView.oDashboardGroupsBox.getGroups().reduce((result, group) => {
                    return group && group.getGroupId() === sGroupId ? group : result;
                }, null);
            }

            const oGroupElement = oGroup && oGroup.getDomRef();
            if (!oGroupElement) {
                return Log.warning("Could not scroll to group: Group is not rendered!");
            }

            const oGroupContentElement = oGroupElement.querySelector(".sapUshellTileContainerContent"); // includes the Group header
            if (!oGroupContentElement) {
                return Log.warning("Could not scroll to group: Group Content is not rendered!");
            }

            const oDashboardGroupsElement = document.getElementById("dashboardGroups");
            const oGroupRect = oGroupContentElement.getBoundingClientRect();
            const oDashboardRect = oDashboardGroupsElement.getBoundingClientRect();
            if (oGroupRect.top === oDashboardRect.top) {
                // First group
                oDashboardGroupsElement.parentElement.scrollTop = 0;
            } else {
                oGroupContentElement.scrollIntoView();
            }

            const pPro = new Promise((resolve) => {
                if (Device.system.desktop && (oData.restoreLastFocusedTile || oData.groupChanged)) {
                    sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], (ComponentKeysHandler) => {
                        ComponentKeysHandler.getInstance()
                            .then((ComponentKeysHandlerInstance) => {
                                let jqTileContainer = oGroup.$();
                                // regardless to group change - if we need to restore last focused tile we must do so.
                                if (oData.restoreLastFocusedTile) {
                                    let bLookForLastVisitedInSameGroup = false;

                                    // if we need to restore focus on a specific tile-container (rather then current group)
                                    // then we supply the tile container and set true to bLookForLastVisitedInSameGroup (see goToLastVisitedTile method)
                                    if (oData.restoreLastFocusedTileContainerById) {
                                        jqTileContainer = jQuery(`#${oData.restoreLastFocusedTileContainerById}`);
                                        bLookForLastVisitedInSameGroup = true;
                                    }

                                    ComponentKeysHandlerInstance.goToLastVisitedTile(jqTileContainer, bLookForLastVisitedInSameGroup);
                                } else if (oData.groupChanged) {
                                    // set focus on the first content of the group we scrolled to
                                    const jqGroupContent = jqTileContainer.find(".sapUshellTile, .sapMGTLineMode, .sapFCard").filter(":visible").eq(0);

                                    if (jqGroupContent.length) {
                                        ComponentKeysHandlerInstance.moveScrollDashboard(jqGroupContent);
                                    }
                                }
                            })
                            .then(resolve);
                    });
                } else {
                    resolve();
                }
            });

            pPro.then(() => {
                if (oData.isInEditTitle) {
                    oGroup.setEditMode(true);
                }
                utils.handleTilesVisibility();
            });

            return pPro;
        },

        /**
         * Handler for dropping a tile object at the end of drag and drop action.
         *
         * @param {any} event not used
         * @param {string} ui tile DOM Reference
         *
         * @returns {jQuery.Promise|null} Resolves once the handling is done.
         *
         * @private
         */
        _handleDrop: function (event, ui) {
            const oLayout = Layout.getLayoutEngine();
            const tileMoveInfo = oLayout.layoutEndCallback();
            const bIsShortDrop = !tileMoveInfo.dstArea;
            const oEventBus = Core.getEventBus();
            let noRefreshSrc;
            let noRefreshDst;
            let oDeferred = jQuery.Deferred();
            const oView = this.getView();
            const oModel = oView.getModel();
            const bTabMode = oModel.getProperty("/homePageGroupDisplay") && oModel.getProperty("/homePageGroupDisplay") === "tabs";
            const bEditMode = oModel.getProperty("/tileActionModeActive");
            let bIsShortDropToLocked = true;

            // Handle cases where the drop event is triggered before the drag event. This can happen during page load.
            if (!tileMoveInfo.tile) {
                oEventBus.publish("launchpad", "sortableStop");
                return null;
            }

            Layout.getLayoutEngine()._toggleAnchorItemHighlighting(false);
            // Short drop to a locked group
            if (tileMoveInfo.dstGroup) {
                const dstGroupBindingContext = tileMoveInfo.dstGroup.getBindingContext();
                const isDestGroupLocked = dstGroupBindingContext.getProperty(dstGroupBindingContext.sPath).isGroupLocked;
                bIsShortDropToLocked = bIsShortDrop && isDestGroupLocked;
            }

            const bIsLinkPersonalizationSupported = tileMoveInfo.tile.getBindingContext().getObject().isLinkPersonalizationSupported;
            if (!tileMoveInfo.tileMovedFlag || bIsShortDropToLocked || (!bIsLinkPersonalizationSupported && tileMoveInfo.dstArea === "links")) {
                oEventBus.publish("launchpad", "sortableStop");
                return null; // tile was not moved
            }

            // If we are in EditMode and the target group has no links (empty links area) and the anchor bar isn't in tabs mode,
            // then we continue as tile was not moved.
            if (!bEditMode && !bTabMode && tileMoveInfo.dstArea === "links" && !tileMoveInfo.dstGroupData.getLinks().length) {
                oEventBus.publish("launchpad", "sortableStop");
                return null; // tile was not moved
            }

            noRefreshSrc = true;
            noRefreshDst = true; // Default - suppress re-rendering after drop
            // if src and destination groups differ - refresh src and dest groups
            // else if a tile has moved & dropped in a different position in the same group - only dest should refresh (dest == src)
            // if a tile was picked and dropped - but never moved - the previous if would have returned
            if ((tileMoveInfo.srcGroup !== tileMoveInfo.dstGroup)) {
                noRefreshSrc = noRefreshDst = false;
            } else if (tileMoveInfo.tile !== tileMoveInfo.dstGroup.getTiles()[tileMoveInfo.dstTileIndex]) {
                noRefreshDst = false;
            }

            const sTileUuid = this._getTileUuid(tileMoveInfo.tile);
            if (tileMoveInfo.srcGroup && tileMoveInfo.srcGroup.removeAggregation && tileMoveInfo.srcArea) {
                tileMoveInfo.srcGroup.removeAggregation("tiles", tileMoveInfo.tile, noRefreshSrc);
            }

            // If this is Tab Bar use-case, and the action is "long" Drag&Drop of a tile on a tab (group):
            // the destination group (whose aggregation needs to be updated) is not in the dashboard, unless the drag is to the same group.
            // Instead - the publish of movetile event will update the group in the model
            const bSameDropArea = tileMoveInfo.dstGroupData && tileMoveInfo.dstGroupData.insertAggregation && tileMoveInfo.dstArea === tileMoveInfo.srcArea;

            // Handles two scenarios - 1. Same group drop - tile to tile/link to link 2. Long drop - tile to tile/link to link
            if (bSameDropArea) {
                tileMoveInfo.tile.sParentAggregationName = tileMoveInfo.dstArea;// "tiles"
                tileMoveInfo.dstGroupData.insertAggregation(tileMoveInfo.dstArea, tileMoveInfo.tile, tileMoveInfo.dstTileIndex, noRefreshDst);

                oDeferred = this._handleSameTypeDrop(tileMoveInfo, sTileUuid, bSameDropArea);

                // Handles three scenarios - 1. Short drop 2. Same group - tile to link/link to tile 3. Long drop - tile to link/link to tile
            } else if (bIsShortDrop) {
                oDeferred = this._handleShortDrop(tileMoveInfo, sTileUuid, bSameDropArea);
            } else {
                oDeferred = this._handleConvertDrop(tileMoveInfo, bSameDropArea, ui);
            }

            if (this.getView().getModel()) {
                this.getView().getModel().setProperty("/draggedTileLinkPersonalizationSupported", true);
            }
            oEventBus.publish("launchpad", "sortableStop");
            return oDeferred.promise();
        },

        _handleSameTypeDrop: function (tileMoveInfo, sTileUuid, bSameDropArea) {
            const oEventBus = Core.getEventBus();
            const oDeferred = jQuery.Deferred();
            tileMoveInfo.tile._getBindingContext().oModel.setProperty(`${tileMoveInfo.tile._getBindingContext().sPath}/draggedInTabBarToSourceGroup`, false);
            oEventBus.publish("launchpad", "movetile", {
                sTileId: sTileUuid,
                sToItems: tileMoveInfo.dstArea ? tileMoveInfo.dstArea : "tiles",
                sFromItems: tileMoveInfo.srcArea ? tileMoveInfo.srcArea : "tiles",
                sTileType: tileMoveInfo.dstArea ? tileMoveInfo.dstArea.substr(0, tileMoveInfo.dstArea.length - 1) : undefined,
                toGroupId: tileMoveInfo.dstGroupData.getGroupId ? tileMoveInfo.dstGroupData.getGroupId() : tileMoveInfo.dstGroupData.groupId,
                toIndex: tileMoveInfo.dstTileIndex,
                longDrop: bSameDropArea,
                callBack: function () {
                    oDeferred.resolve();
                }
            });
            return oDeferred.promise();
        },

        _handleShortDrop: function (tileMoveInfo, sTileUuid, bSameDropArea) {
            const oEventBus = Core.getEventBus();
            const oDeferred = jQuery.Deferred();
            oEventBus.publish("launchpad", "movetile", {
                sTileId: sTileUuid,
                sToItems: tileMoveInfo.srcArea || "tiles",
                sFromItems: tileMoveInfo.srcArea || "tiles",
                sTileType: tileMoveInfo.srcArea ? tileMoveInfo.srcArea.substr(0, tileMoveInfo.srcArea.length - 1) : undefined,
                toGroupId: tileMoveInfo.dstGroupData.getGroupId ? tileMoveInfo.dstGroupData.getGroupId() : tileMoveInfo.dstGroupData.groupId,
                toIndex: tileMoveInfo.dstTileIndex,
                longDrop: bSameDropArea,
                callBack: function () {
                    oDeferred.resolve();
                }
            });
            return oDeferred.promise();
        },

        _handleConvertDrop: function (tileMoveInfo, bSameDropArea, ui) {
            const oEventBus = Core.getEventBus();
            const oDeferred = jQuery.Deferred();
            oEventBus.publish("launchpad", "convertTile", {
                toGroupId: tileMoveInfo.dstGroupData.getGroupId ? tileMoveInfo.dstGroupData.getGroupId() : tileMoveInfo.dstGroupData.groupId,
                toIndex: tileMoveInfo.dstTileIndex,
                tile: Core.byId(ui.id),
                srcGroupId: tileMoveInfo.srcGroup.getGroupId ? tileMoveInfo.srcGroup.getGroupId() : tileMoveInfo.srcGroup.groupId,
                longDrop: bSameDropArea,
                callBack: function () {
                    oDeferred.resolve();
                }
            });
            return oDeferred.promise();
        },

        _getTileUuid: function (oTileObject) {
            if (oTileObject.getUuid) {
                return oTileObject.getUuid();
            }

            const oTileModelObject = oTileObject.getBindingContext().getObject();

            if (oTileModelObject.getParent) {
                return oTileModelObject.getParent().getUuid();
            }

            return oTileModelObject.uuid;
        },

        _handleDrag: function (event, ui) {
            const tileDragInfo = Layout.getLayoutEngine().layoutEndCallback();
            const oTileModel = tileDragInfo.tile.getBindingContext().getObject();
            const oModel = this.getView().getModel();

            if (oModel) {
                oModel.setProperty("/draggedTileLinkPersonalizationSupported", oTileModel.isLinkPersonalizationSupported);
            }
        },

        _handleTabBarItemPressEventHandler: function (sChannelId, sEventId, oData) {
            const oView = this.getView();
            const oModel = oView.getModel();
            const aGroups = oModel.getProperty("/groups");
            const iGroupIndex = oData.iGroupIndex;

            // first reset the isGroupSelected property for all groups.
            for (let i = 0; i < aGroups.length; i++) {
                oModel.setProperty(`/groups/${i}/isGroupSelected`, false);
            }
            // set the selected group (for the model update we use the original index)
            oModel.setProperty(`/groups/${iGroupIndex}/isGroupSelected`, true);

            this._handleTabBarItemPress(sChannelId, sEventId, iGroupIndex);
        },

        _handleTabBarItemPress: function (sChannelId, sEventId, iGroupIndex, oEvent) {
            const oView = this.getView();
            // Fix the selected group index not to include the hidden groups.
            let selectedGroupIndex;

            if (oEvent) {
                selectedGroupIndex = oEvent.getParameter("group").getIndex();
            } else {
                selectedGroupIndex = iGroupIndex;
            }

            Core.getEventBus().publish("launchpad", "tabSelected", { iSelectedGroup: selectedGroupIndex });

            const fixedIndex = this._getVisibleGroupIndex(selectedGroupIndex);

            // apply the filter
            oView.oDashboardGroupsBox.removeLinksFromUnselectedGroups();
            oView.oDashboardGroupsBox.getBinding("groups").filter([oView.oFilterSelectedGroup]);
            // change the anchor bar selection
            oView.oAnchorNavigationBar.setSelectedItemIndex(fixedIndex);
            oView.oAnchorNavigationBar.reArrangeNavigationBarElements();
            // change tiles visibility of the new selected group
            setTimeout(() => {
                utils.handleTilesVisibility();
            }, 0);
        },

        _getVisibleGroupIndex: function (selectedGroupIndex) {
            const aGroups = this.getView().getModel().getProperty("/groups");
            let iHiddenGroupsCount = 0;

            // Go through the groups that are located before the selected group
            for (let i = 0; i < selectedGroupIndex; i++) {
                if (!aGroups[i].isGroupVisible || !aGroups[i].visibilityModes[0]) {
                    // Count all groups that are not visible in non-edit mode
                    iHiddenGroupsCount++;
                }
            }

            return selectedGroupIndex - iHiddenGroupsCount;
        },

        _getModelGroupFromVisibleIndex: function (selectedGroupIndex) {
            const aGroups = this.getView().getModel().getProperty("/groups");
            let iVisGroupsCount = 0;

            for (let i = 0; i < aGroups.length; i++) {
                if (aGroups[i].isGroupVisible && aGroups[i].visibilityModes[0]) {
                    // Count all groups that are not visible in non-edit mode
                    iVisGroupsCount++;

                    if (iVisGroupsCount > selectedGroupIndex) {
                        return i;
                    }
                }
            }

            return 0;
        },

        _handleAnchorItemPress: function (oEvent) {
            const oView = this.getView();
            const oModel = oView.getModel();
            const aGroups = oModel.getProperty("/groups");

            // press on item could also be fired from overflow popup, but it will not have "manualPress" parameter
            if (Device.system.phone && oEvent.getParameter("manualPress")) {
                oEvent.oSource.openOverflowPopup();
            }

            // reset the isGroupSelected property for all groups before set the selected group
            for (let i = 0; i < aGroups.length; i++) {
                if (oModel.getProperty(`/groups/${i}/isGroupSelected`) === true) {
                    oModel.setProperty(`/groups/${i}/isGroupSelected`, false);
                }
            }
            // set the selected group (for the model update we use the original index)
            oModel.setProperty(`/groups/${oEvent.getParameter("group").getIndex()}/isGroupSelected`, true);
            oModel.setProperty("/iSelectedGroup", oEvent.getParameter("group").getIndex());

            // if tabs
            if (oModel.getProperty("/homePageGroupDisplay") && oModel.getProperty("/homePageGroupDisplay") === "tabs" && !oModel.getProperty("/tileActionModeActive")) {
                this._handleTabBarItemPress(undefined, undefined, undefined, oEvent);

                // else scroll or edit mode
            } else {
                // reset the filter

                if (!oModel.getProperty("/tileActionModeActive")) {
                    oView.oDashboardGroupsBox.getBinding("groups").filter([new Filter("isGroupVisible", FilterOperator.EQ, true)]);
                } else {
                    oView.oDashboardGroupsBox.getBinding("groups").filter([]);
                }

                // scroll to selected group
                this._scrollToGroup("launchpad", "scrollToGroup", {
                    group: oEvent.getParameter("group"),
                    groupChanged: true,
                    focus: (oEvent.getParameter("action") === "sapenter")
                });
            }
        },

        _addGroupHandler: function (oData) {
            const sPath = oData.getSource().getBindingContext().getPath();
            const aPathParts = sPath.split("/");

            let iModelIndex = window.parseInt(aPathParts[aPathParts.length - 1], 10);

            if (oData.getSource().sParentAggregationName === "afterContent") {
                iModelIndex++;
            }

            Core.getEventBus().publish("launchpad", "createGroupAt", {
                title: "",
                location: iModelIndex,
                isRendered: true
            });
        },

        _publishAsync: function (sChannelId, sEventId, oData) {
            const oBus = Core.getEventBus();
            window.setTimeout(oBus.publish.bind(oBus, sChannelId, sEventId, oData), 1);
        },
        _changeGroupVisibility: function (oGroupBindingCtx) {
            const sBindingCtxPath = oGroupBindingCtx.getPath();
            const oModel = oGroupBindingCtx.getModel();
            const bGroupVisibilityState = oModel.getProperty(`${sBindingCtxPath}/isGroupVisible`);

            if (oModel.getProperty(`${sBindingCtxPath}/isDefaultGroup`)
                || oModel.getProperty(`${sBindingCtxPath}/isGroupLocked`)) {
                return;
            }

            oModel.setProperty(`${sBindingCtxPath}/isGroupVisible`, !bGroupVisibilityState);
        },

        // Persist the group visibility changes (hidden groups) in the back-end upon deactivation of the Actions Mode.
        _handleGroupVisibilityChanges: function (sChannelId, sEventId, aOrigHiddenGroupsIds) {
            const oModel = this.getView().getModel();
            const oHomepageManager = HomepageManager.prototype.getInstance();
            const aCurrentHiddenGroupsIds = oHomepageManager.getCurrentHiddenGroupIds(oModel);
            const bSameLength = aCurrentHiddenGroupsIds.length === aOrigHiddenGroupsIds.length;
            let bIntersect = bSameLength;
            let oPromise;

            // Checks whether there's a symmetric difference between the current set of hidden groups and the genuine one
            aCurrentHiddenGroupsIds.some((sHiddenGroupId, iIndex) => {
                if (!bIntersect) {
                    return true;
                }
                bIntersect = aOrigHiddenGroupsIds && Array.prototype.indexOf.call(aOrigHiddenGroupsIds, sHiddenGroupId) !== -1;

                return !bIntersect;
            });

            if (!bIntersect) {
                sap.ushell.Container.getServiceAsync("FlpLaunchPage").then((oLaunchPageSrv) => {
                    oPromise = oLaunchPageSrv.hideGroups(aCurrentHiddenGroupsIds);
                    oPromise.done(() => {
                        oModel.updateBindings("groups");
                    });
                    oPromise.fail(() => {
                        sap.ushell.Container.getServiceAsync("MessageInternal").then((msgService) => {
                            msgService.error(ushellResources.i18n.getText("hideGroups_error"));
                        });
                    });
                });
            }

            window.setTimeout(() => {
                utils.recalculateBottomSpace();
            }, 0);
        },

        _deactivateActionModeInTabsState: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            let i;
            // First reset the isGroupSelected property for all groups.
            const aGroups = oModel.getProperty("/groups");
            for (i = 0; i < aGroups.length; i++) {
                oModel.setProperty(`/groups/${i}/isGroupSelected`, false);
            }

            let selectedIndex = oView.oAnchorNavigationBar.getSelectedItemIndex();

            let iHiddenGroupsCount = 0;
            // If the selected group is a hidden group, go to the first visible group
            if (!this._isGroupVisible(selectedIndex)) {
                for (i = 0; i < aGroups.length; i++) {
                    if (!this._isGroupVisible(i)) {
                        iHiddenGroupsCount++;
                    } else {
                        selectedIndex = i;
                        break;
                    }
                }
            } else {
                // Count all hidden groups that are located before the selected group
                for (i = 0; i < selectedIndex; i++) {
                    if (!this._isGroupVisible(i)) {
                        iHiddenGroupsCount++;
                    }
                }
            }

            // Fix the selected index not to include the hidden groups
            const fixedIndex = selectedIndex - iHiddenGroupsCount;
            // Change the anchor bar selection
            oView.oAnchorNavigationBar.setSelectedItemIndex(fixedIndex);
            oView.oAnchorNavigationBar.adjustItemSelection();

            // Set the selected group and then filter
            oModel.setProperty(`/groups/${selectedIndex}/isGroupSelected`, true);
            oView.oDashboardGroupsBox.removeLinksFromAllGroups();

            const sGroupsMode = oModel.getProperty("/homePageGroupDisplay");
            if (sGroupsMode && sGroupsMode === "tabs") {
                oView.oDashboardGroupsBox.getBinding("groups").filter([oView.oFilterSelectedGroup]);
                // update links in the selected group (only the selected group is displayed in tabs mode)
                const aNewGroups = oView.oDashboardGroupsBox.getGroups && oView.oDashboardGroupsBox.getGroups();
                const oGroup = Array.isArray(aNewGroups) && aNewGroups[0];
                if (oGroup && oGroup.updateLinks) {
                    oGroup.updateLinks();
                }
            }
        },

        _isGroupVisible: function (groupIndex) {
            const aGroups = this.getView().getModel().getProperty("/groups");
            return (aGroups[groupIndex].isGroupVisible && aGroups[groupIndex].visibilityModes[0]);
        }
    });
});
