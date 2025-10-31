// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ushell/Config",
    "sap/ui/events/KeyCodes",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/renderer/AccessKeysHandler",
    "sap/ushell/bootstrap/common/common.load.model",
    "sap/ushell/ui/launchpad/Tile",
    "sap/ushell/Container"
], (
    Localization,
    Element,
    EventBus,
    Config,
    KeyCodes,
    jQuery,
    Log,
    AccessKeysHandler,
    oModelWrapper,
    Tile,
    Container
) => {
    "use strict";

    function ComponentKeysHandler () { }

    ComponentKeysHandler._instance = undefined;

    ComponentKeysHandler.getInstance = function () {
        if (ComponentKeysHandler._instance === undefined) {
            ComponentKeysHandler._instance = new ComponentKeysHandler();
            return ComponentKeysHandler._instance._init().then(() => {
                return ComponentKeysHandler._instance;
            });
        }
        return Promise.resolve(ComponentKeysHandler._instance);
    };

    ComponentKeysHandler.prototype = {
        keyCodes: KeyCodes,

        _init: function () {
            this.oModel = oModelWrapper.getModel();

            // performance optimization: don't load Launchpage service on the CDM platform
            // to avoid site loading - link personalization is anyway always enabled on CDM platform
            if (Container.getLogonSystem().getPlatform() === "cdm") {
                return Promise.resolve();
            }

            /**
             * @deprecated since 1.120
             */
            if (!this.oLaunchPageService) {
                return Container.getServiceAsync("FlpLaunchPage").then((oLaunchPageService) => {
                    this.oLaunchPageService = oLaunchPageService;
                });
            }

            return Promise.resolve();
        },

        // Go to last visited tile.
        // In general, FLP should remember last focused tile, and refocus it when tabbing into the tiles container.
        // There are cases where there is no-last focused tile, and in those cases a default behavior will be applied,
        // that is, selecting the first tile.
        goToLastVisitedTile: function (jqTileContainerToLookUnder, bLookInGivenGroup) {
            let jqDefaultContent;
            let jqLastVisitedContent;
            const jqAllContent = jQuery(".sapUshellTile, .sapMGTLineMode, .sapFCard");
            if (bLookInGivenGroup) {
                const jqTileContainers = jQuery("#dashboardGroups").find(".sapUshellTileContainer").filter(":visible");
                const topGroupInViewPortIndex = this.oModel.getProperty("/topGroupInViewPortIndex");

                // resolving and setting the tile-container under which we will look
                const jqTileContainer = jqTileContainerToLookUnder || jQuery(jqTileContainers.get(topGroupInViewPortIndex));

                const jqTileContainerContent = jqTileContainer.find(".sapUshellTile, .sapMGTLineMode, .sapFCard");
                jqDefaultContent = jqTileContainerContent.filter(":visible").eq(0);
                jqLastVisitedContent = jqTileContainerContent.filter("[tabindex=0]:visible").eq(0);

                if (!jqDefaultContent.length) {
                    jqDefaultContent = jqAllContent.filter(":visible").eq(0);
                }
            } else {
                jqDefaultContent = jqAllContent.filter(":visible").eq(0);
                jqLastVisitedContent = jqAllContent.filter("[tabindex=0]:visible").eq(0);
            }

            if (jqLastVisitedContent.length) {
                this.moveScrollDashboard(jqLastVisitedContent);
            } else if (jqDefaultContent.length) {
                jqDefaultContent.attr("tabindex", "0");
                this.moveScrollDashboard(jqDefaultContent);
            } else {
                AccessKeysHandler.sendFocusBackToShell();
            }
        },

        _goToFirstTileOfNextGroup: function (sDirection, oEvent) {
            this._preventDefault(oEvent);

            const oInfo = this._getGroupAndTilesInfo();

            if (oInfo) {
                const oNextGroup = this._getNextGroup(sDirection, oInfo.oGroup, false, true);
                if (oNextGroup) {
                    this._goToTileOfGroup("first", oNextGroup);
                }
            }
        },

        _goToTileOfGroup: function (vPosition, oGroup) {
            if (oGroup) {
                let aContent = oGroup.getTiles().filter(this._filterInvisibleTiles);
                const aLinks = oGroup.getLinks().filter(this._filterInvisibleTiles);

                if (oGroup.getShowPlaceholder()) {
                    aContent.push(oGroup.oPlusTile);
                }

                aContent = aContent.concat(aLinks);

                vPosition = vPosition === "first" ? 0 : vPosition;
                vPosition = vPosition === "last" ? aContent.length - 1 : vPosition;

                const oTile = aContent[vPosition];

                if (oTile) {
                    this.moveScrollDashboard(oTile.$());
                    return true;
                }
            }
            return false;
        },

        /**
         *_ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} sDirection Direction
         *
         * @deprecated since 1.112
         */
        _moveTile: function (sDirection) {
            const oInfo = this._getGroupAndTilesInfo();

            // Tiles of locked groups or a plus tile cannot be reordered
            if (!oInfo
                || oInfo.oGroup.getProperty("isGroupLocked")
                || oInfo.oCurTile.isA("sap.ushell.ui.launchpad.PlusTile")) {
                return;
            }

            const oSourceTile = oInfo.oCurTile;
            const oTargetTile = this._getNextTile(sDirection, true);

            if (oTargetTile) {
                const sSourceMode = oSourceTile.getMode ? oSourceTile.getMode() : "ContentMode";
                const sTargetMode = oTargetTile.getMode ? oTargetTile.getMode() : "ContentMode";

                const oSourceGroup = oSourceTile.getParent();
                const oTargetGroup = oTargetTile.getParent();

                const bSameGroup = oSourceGroup === oTargetGroup;
                const bSameAggregation = sSourceMode === sTargetMode;

                const aTargetGroupContent = sTargetMode === "LineMode" ? oTargetGroup.getLinks() : oTargetGroup.getTiles();
                let nTargetTileIndex = aTargetGroupContent.indexOf(oTargetTile);

                const oSourceTileRect = this._getTileRect(sDirection, oSourceTile);
                const oTargetTileRect = this._getTileRect(sDirection, oTargetTile);

                if (!oTargetTileRect) {
                    // The target tile is a not rendered plus tile
                    nTargetTileIndex = 0;
                } else {
                    const bSourceExceedsTargetTile = oSourceTileRect.right > oTargetTileRect.right + 5;
                    const bTargetIsLastTile = nTargetTileIndex === aTargetGroupContent.length - 1;

                    if (!bSameGroup || !bSameAggregation) {
                        if ((sDirection === "up" || sDirection === "down")
                            && bSourceExceedsTargetTile
                            && bTargetIsLastTile) {
                            nTargetTileIndex++;
                        } else if (sDirection === "left") {
                            nTargetTileIndex++;
                        }
                    }
                }

                const oDashboardView = Element.getElementById("sapUshellDashboardPage").getParent();

                EventBus.getInstance().publish(
                    "launchpad",
                    bSameAggregation ? "movetile" : "convertTile",
                    {
                        callBack: this.callbackSetFocus.bind(this),
                        sTileId: oDashboardView.getController()._getTileUuid(oSourceTile),
                        toGroupId: oTargetGroup.getGroupId ? oTargetGroup.getGroupId() : oTargetGroup.groupId,
                        srcGroupId: oSourceGroup.getGroupId ? oSourceGroup.getGroupId() : oSourceGroup.groupId,
                        toIndex: nTargetTileIndex,
                        tile: oSourceTile,
                        sToItems: sTargetMode === "LineMode" ? "links" : "tiles",
                        sFromItems: sSourceMode === "LineMode" ? "links" : "tiles",
                        sTileType: sSourceMode === "LineMode" ? "link" : "tile",
                        longDrop: false
                    });
            }
        },

        callbackSetFocus: function (oTile) {
            setTimeout(() => {
                if (oTile.oParent && oTile.oParent instanceof Tile) {
                    this.moveScrollDashboard(jQuery(oTile.oParent.getDomRef()));
                } else {
                    this.moveScrollDashboard(oTile.$());
                }
            }, 0);
        },

        _getTileCenter: function (sDirection, oTileRect, oTile) {
            if (!(oTile instanceof HTMLElement)) {
                const jqHelpers = oTile.$().find(".sapMGTLineStyleHelper");

                if (oTile.isLink && jqHelpers && jqHelpers.length > 1) {
                    if (sDirection === "down") {
                        return oTileRect.right;
                    }
                    return oTileRect.left;
                }
            }
            return oTileRect.right - ((oTileRect.right - oTileRect.left) / 2);
        },

        _getTileRect: function (sDirection, oTile) {
            if (oTile instanceof HTMLElement) {
                return oTile.getBoundingClientRect();
            }
            // This part of code is responsible for the accessibility of the links.
            // Links can be in a wrapped state. This means that a single Link can be broken down into multiple lines.
            // When this happens, the bouncingRectangle of such links will return us the height of multiple lines,
            // and a width of 100% of the link area. To handle this case, we have to locate special "Helper" - divs,
            // which represent every string of the link and give us the real sizes of the strings belonging to the link.
            const jqHelpers = oTile.$().find(".sapMGTLineStyleHelper");

            if (oTile.isLink && jqHelpers && jqHelpers.length) {
                if (sDirection === "down") {
                    return jqHelpers.get(jqHelpers.length - 1).getBoundingClientRect();
                }
                return jqHelpers.get(0).getBoundingClientRect();
            }

            if (oTile.getDomRef()) {
                return oTile.getDomRef().getBoundingClientRect();
            }
            return undefined;
        },

        _findClosestTile: function (sDirection, aTiles, oCurTile) {
            const oCurTileRect = this._getTileRect(sDirection, oCurTile);
            const nCurCenter = this._getTileCenter(sDirection, oCurTileRect, oCurTile);

            let oClosestTile;
            let nMinDiffernce = Infinity;
            const nStep = sDirection === "down" ? 1 : -1;
            let nIndex = aTiles.indexOf(oCurTile) + nStep;
            let nRowTop;

            for (; ; nIndex += nStep) {
                const oTile = aTiles[nIndex];

                if (!oTile) {
                    return oClosestTile;
                }

                if (!oClosestTile) {
                    if (sDirection === "down" && nIndex === aTiles.length - 1) {
                        // last possible Tile
                        return oTile;
                    }

                    if (sDirection === "up" && nIndex === 0) {
                        // last possible Tile
                        return oTile;
                    }
                }

                const oTileRect = this._getTileRect(sDirection, oTile);

                if (!oTileRect) {
                    return oClosestTile;
                }
                // the offsets are needed for certian styles and to avoid the plus tile in the same group
                if (sDirection === "down" && oCurTileRect.bottom + 5 >= oTileRect.bottom) {
                    continue;
                }

                if (sDirection === "up" && oCurTileRect.top - 5 <= oTileRect.top) {
                    continue;
                }
                if (oClosestTile && nRowTop !== oTileRect.top) {
                    return oClosestTile;
                }
                nRowTop = oTileRect.top;

                const nTileDifference = Math.min(Math.abs(oTileRect.left - nCurCenter), Math.abs(oTileRect.right - nCurCenter));
                if (nMinDiffernce > nTileDifference) {
                    nMinDiffernce = nTileDifference;
                    oClosestTile = oTile;
                } else {
                    return oClosestTile;
                }
            }
        },

        _filterInvisibleTiles: function (oTile) {
            return oTile.getVisible() && oTile.getDomRef();
        },

        /**
         * Calculates the next logical tile in classical home page
         *
         * @param {string} sDirection the logical direction of the key event
         * @param {boolean} bMoveTile do we currently want to move the selected tile
         *
         * @returns {object} the next logical tile in the given logical direction or undefined
         * @deprecated since 1.120
         */
        _getNextTile: function (sDirection, bMoveTile) {
            const oInfo = this._getGroupAndTilesInfo();

            if (!oInfo) {
                return null;
            }

            const oCurrentTile = oInfo.oCurTile;
            const oCurrentGroup = oInfo.oGroup;
            let aCurrentGroupTiles = oCurrentGroup.getTiles().filter(this._filterInvisibleTiles);
            const aCurrentGroupLinks = oCurrentGroup.getLinks().filter(this._filterInvisibleTiles);
            const bCurrentTileIsALink = oCurrentTile.isLink;
            const bCurrentGroupHasPlusTile = oCurrentGroup.getShowPlaceholder();

            const oBindingContext = oCurrentTile.getBindingContext();
            const bLinksAllowed = !bMoveTile || (oBindingContext && this._isLinkPersonalizationSupported(oBindingContext.getObject().object));

            const aCurrentGroupAggregation = bCurrentTileIsALink ? aCurrentGroupLinks : aCurrentGroupTiles;
            const nCurrentIndex = aCurrentGroupAggregation.indexOf(oCurrentTile);

            if (nCurrentIndex < 0) {
                // We are on a plus tile (this should not be possible during moving)
                if (sDirection === "right") {
                    if (aCurrentGroupLinks.length) {
                        return aCurrentGroupLinks[0];
                    }

                    // else go to next group
                }

                if (sDirection === "left") {
                    if (aCurrentGroupTiles.length) {
                        return aCurrentGroupTiles[aCurrentGroupTiles.length - 1];
                    }

                    // else go to previous group
                }
            } else {
                if (sDirection === "right") {
                    if (nCurrentIndex < aCurrentGroupAggregation.length - 1) {
                        return aCurrentGroupAggregation[nCurrentIndex + 1];
                    }

                    if (!bCurrentTileIsALink && bCurrentGroupHasPlusTile && !bMoveTile) {
                        return oCurrentGroup.oPlusTile;
                    }

                    if (!bCurrentTileIsALink && bLinksAllowed && aCurrentGroupLinks.length) {
                        return aCurrentGroupLinks[0];
                    }

                    // else go to next group
                }

                if (sDirection === "left") {
                    if (nCurrentIndex > 0) {
                        return aCurrentGroupAggregation[nCurrentIndex - 1];
                    }

                    if (bCurrentTileIsALink && bCurrentGroupHasPlusTile) {
                        return oCurrentGroup.oPlusTile;
                    }

                    if (bCurrentTileIsALink && aCurrentGroupTiles.length) {
                        return aCurrentGroupTiles[aCurrentGroupTiles.length - 1];
                    }

                    // else go to previous group
                }
            }

            // Maybe the next tile is in the next group
            const oNextGroup = this._getNextGroup(sDirection, oCurrentGroup, bMoveTile, bLinksAllowed);
            let aNextGroupTiles = oNextGroup ? oNextGroup.getTiles().filter(this._filterInvisibleTiles) : [];
            const aNextGroupLinks = oNextGroup ? oNextGroup.getLinks().filter(this._filterInvisibleTiles) : [];
            const bNextGroupHasPlusTile = oNextGroup && oNextGroup.getShowPlaceholder();

            if (oNextGroup) {
                if (sDirection === "right") {
                    if (aNextGroupTiles.length) {
                        return aNextGroupTiles[0];
                    }

                    if (bNextGroupHasPlusTile) {
                        return oNextGroup.oPlusTile;
                    }

                    if (aNextGroupLinks.length) {
                        return aNextGroupLinks[0];
                    }

                    return oNextGroup.oPlusTile;
                }

                if (sDirection === "left") {
                    if (bLinksAllowed && aNextGroupLinks.length) {
                        return aNextGroupLinks[aNextGroupLinks.length - 1];
                    }

                    if (bNextGroupHasPlusTile && !bMoveTile) {
                        return oNextGroup.oPlusTile;
                    }

                    if (aNextGroupTiles.length) {
                        return aNextGroupTiles[aNextGroupTiles.length - 1];
                    }

                    return oNextGroup.oPlusTile;
                }
            }

            if (sDirection === "up" || sDirection === "down") {
                if (!aCurrentGroupTiles.length && bMoveTile) {
                    aCurrentGroupTiles = [oCurrentGroup.oPlusTile];
                }

                const aCurrentGroupContent = bLinksAllowed ? aCurrentGroupTiles.concat(aCurrentGroupLinks) : aCurrentGroupTiles;
                let aNextGroupContent = [];

                if (oNextGroup) {
                    if (!aNextGroupTiles.length && bMoveTile) {
                        aNextGroupTiles = [oNextGroup.oPlusTile];
                    }
                    aNextGroupContent = bLinksAllowed ? aNextGroupTiles.concat(aNextGroupLinks) : aNextGroupTiles;
                }

                const aJoinedContent = (sDirection === "up") ? aNextGroupContent.concat(aCurrentGroupContent) : aCurrentGroupContent.concat(aNextGroupContent);
                return this._findClosestTile(sDirection, aJoinedContent, oCurrentTile);
            }
        },

        /**
         * Helper function wrapping the method <code>isLinkPersonalizationSupported</code> of
         * the Launchpage Service. If the service is not initialized, it always returns true.
         *
         * @param {object} oTile A tile instance.
         * @returns {boolean} Returns <code>true</code> if the tile's link personalization is allowed
         * @private
         * @deprecated since 1.120
         */
        _isLinkPersonalizationSupported: function (oTile) {
            return !this.oLaunchPageService || this.oLaunchPageService.isLinkPersonalizationSupported(oTile);
        },

        /**
         * Calculates the next logical group
         *
         * @param {string} sDirection the logical direction of the key event
         * @param {object} oCurGroup the group of the selected tile
         * @param {boolean} bMoveTile do we currently want to move the selected tile
         * @param {boolean} bLinksAllowed links are possible
         *
         * @returns {object | null} the next logical group in the given logical direction or undefined
         */
        _getNextGroup: function (sDirection, oCurGroup, bMoveTile, bLinksAllowed) {
            let nDirection;
            const aGroups = oCurGroup.getParent().getGroups();
            const nCurGroupIndex = aGroups.indexOf(oCurGroup);
            let nNextGroupIndex = nCurGroupIndex;

            if (sDirection === "down" || sDirection === "right") {
                nDirection = 1;
            } else { // sDirection is "up" or "left"
                nDirection = -1;
            }

            nNextGroupIndex += nDirection;

            while (aGroups[nNextGroupIndex]) {
                const oNextGroup = aGroups[nNextGroupIndex];
                const aNextGroupTiles = oNextGroup.getTiles().filter(this._filterInvisibleTiles);
                const aNextGroupLinks = oNextGroup.getLinks().filter(this._filterInvisibleTiles);

                const nNextGroupContent = bLinksAllowed ? aNextGroupTiles.concat(aNextGroupLinks) : aNextGroupTiles;

                const bIsValidGroup = oNextGroup.getVisible()
                    && !(oNextGroup.getIsGroupLocked() && bMoveTile)
                    && !(oNextGroup.getIsGroupLocked() && nNextGroupContent.length === 0)
                    && !(nNextGroupContent.length === 0 && !(bMoveTile || oNextGroup.getShowPlaceholder()));

                if (bIsValidGroup) {
                    return oNextGroup;
                }

                nNextGroupIndex += nDirection;
            }
            return undefined;
        },

        _getGroupAndTilesInfo: function () {
            const jqTile = this._getFocusOnTile(jQuery(document.activeElement));

            if (!jqTile || !jqTile.length) {
                return null;
            }

            const oCurTile = Element.closestTo(jqTile[0]);

            oCurTile.isLink = jqTile.hasClass("sapUshellLinkTile") || jqTile.hasClass("sapMGTLineMode");

            const oGroup = Element.closestTo(jqTile.closest(".sapUshellTileContainer")[0]);

            if (!oGroup) {
                return null;
            }

            return {
                oCurTile: oCurTile,
                oGroup: oGroup
            };
        },

        /**
         * Move to the next element in classical home
         * @param {string} sDirection Movement direction
         * @param {object} jqFocused jQuery of the focused element
         * @private
         * @deprecated since 1.120
         */
        _goToSiblingElementInTileContainer: function (sDirection, jqFocused) {
            const jqTileContainer = jqFocused.closest(".sapUshellTileContainer");
            let jqTileContainerElement;
            let jqFirstTileInTileContainer;
            let jqTileContainerHeader;

            // If current focused item is the Before Content of a Tile Container.
            jqTileContainerElement = jqFocused.closest(".sapUshellTileContainerBeforeContent");
            if (jqTileContainerElement.length) {
                if (sDirection === "up" || sDirection === "left") {
                    this._goToNextTileContainer(jqTileContainerElement, sDirection);
                } else {
                    jqTileContainerHeader = jqTileContainer.find(".sapUshellTileContainerHeader").eq(0);
                    jqTileContainerHeader.focus();
                }
                return;
            }
            // If current focused item is the Header of a Tile Container.
            jqTileContainerElement = jqFocused.closest(".sapUshellTileContainerHeader");
            if (jqTileContainerElement.length) {
                if (sDirection === "up") {
                    if (!this._goToTileContainerBeforeContent(jqTileContainer)) {
                        // If the Tile Container doesn't have a Before Content, go to the Tile Container above.
                        this._goToNextTileContainer(jqTileContainerElement, sDirection);
                    }
                } else if (sDirection === "down") {
                    jqFirstTileInTileContainer = jqTileContainer.find(".sapUshellTile, .sapUshellLinkTile, .sapFCard").eq(0);
                    // If this Tile Container doesn't have any content (not even a plus tile),
                    // it means that the group is empty and locked.
                    // Thus the next arrow down navigation should be to the descending Tile Container.
                    if (jqFirstTileInTileContainer.length) {
                        this.moveScrollDashboard(jqFirstTileInTileContainer);
                    } else {
                        this._goToNextTileContainer(jqTileContainerElement, sDirection);
                    }
                } else if (sDirection === "left") {
                    if (jqFocused.hasClass("sapUshellTileContainerHeader")) {
                        if (!this._goToTileContainerBeforeContent(jqTileContainer)) {
                            // If the Tile Container doesn't have a Before Content, go to the Tile Container above.
                            this._goToNextTileContainer(jqTileContainerElement, "left");
                        }
                    } else {
                        jqTileContainerHeader = jqFocused.closest(".sapUshellTileContainerHeader");
                        jqTileContainerHeader.focus();
                    }
                } else if (sDirection === "right") {
                    const editInputField = jqFocused.hasClass("sapMInputBaseInner");
                    if (!editInputField) {
                        jqFirstTileInTileContainer = jqTileContainer.find(".sapUshellTile, .sapUshellLinkTile, .sapFCard").eq(0);
                        // If this Tile Container doesn't have any content (not even a plus tile),
                        // it means that the group is empty and locked.
                        // Thus the next arrow down navigation should be to the descending Tile Container.
                        if (jqFirstTileInTileContainer.length) {
                            this.moveScrollDashboard(jqFirstTileInTileContainer);
                        } else {
                            this._goToNextTileContainer(jqTileContainerElement, "down");
                        }
                    }
                }
                return;
            }
            // If current focused item is a Tile.
            jqTileContainerElement = this._getFocusOnTile(jqFocused);
            if (jqTileContainerElement) {
                this._goFromFocusedTile(sDirection, jqTileContainerElement, true);
                return;
            }
            // If current focused item is an After Content of a Tile Container.
            jqTileContainerElement = jqFocused.closest(".sapUshellTileContainerAfterContent");
            if (jqTileContainerElement.length) {
                if (sDirection === "up" || sDirection === "left") {
                    this._goToTileOfGroup("first", jqTileContainerElement.control(0));
                } else {
                    this._goToNextTileContainer(jqTileContainerElement, sDirection);
                }
            }
        },

        _goToNextTileContainer: function (jqTileContainerElement, sDirection) {
            const jqCurGroup = jqTileContainerElement.closest(".sapUshellTileContainer");

            if (jqCurGroup.length === 1) {
                const aAllTileContainers = jQuery(".sapUshellTileContainer").filter(":visible");
                const nDirection = (sDirection === "down") ? 1 : -1;
                const jqNextTileContainer = jQuery(aAllTileContainers[aAllTileContainers.index(jqCurGroup) + nDirection]);

                if (jqNextTileContainer.length === 1) {
                    const jqNextTileContainerHeader = jqNextTileContainer.find(".sapUshellTileContainerHeader");
                    if (sDirection === "down") {
                        if (!this._goToTileContainerBeforeContent(jqNextTileContainer)) {
                            this._setTileContainerSelectiveFocus(jqNextTileContainer);
                        }
                    } else if (!this._goToTileContainerAfterContent(jqNextTileContainer)) {
                        if (sDirection === "up" || sDirection === "left") {
                            const sSelector = sDirection === "up" ? "first" : "last";

                            if (!this._goToTileOfGroup(sSelector, Element.closestTo(jqNextTileContainer[0]))) {
                                jqNextTileContainerHeader.focus();
                            }
                        }
                    }
                }
            }
        },

        _goToTileContainerBeforeContent: function (jqTileContainerElement) {
            const jqTileContainer = jqTileContainerElement.hasClass("sapUshellTileContainer") ? jqTileContainerElement : jqTileContainerElement.closest(".sapUshellTileContainer");
            const jqTileContainerBeforeContent = jqTileContainer.find(".sapUshellTileContainerBeforeContent button").filter(":visible");

            if (jqTileContainerBeforeContent.length) {
                jqTileContainerBeforeContent.focus();
                return true;
            }
            return false;
        },

        _goToTileContainerAfterContent: function (jqTileContainerElement) {
            const jqTileContainer = jqTileContainerElement.hasClass("sapUshellTileContainer") ? jqTileContainerElement : jqTileContainerElement.closest(".sapUshellTileContainer");
            const jqTileContainerAfterContent = jqTileContainer.find(".sapUshellTileContainerAfterContent button").filter(":visible");

            if (jqTileContainerAfterContent.length) {
                jqTileContainerAfterContent.focus();
                return true;
            }
            return false;
        },

        /**
         * Moves focus on the next Element that is described by the logical direction
         *
         * @param {string} sDirection the logical direction of the key event
         * @param {jQuery} $curTile the current selected tile
         * @param {boolean} bIsActionsModeActive is edit Mode active
         * @deprecated since 1.120
         */
        _goFromFocusedTile: function (sDirection, $curTile, bIsActionsModeActive) {
            const oNextTile = this._getNextTile(sDirection);
            const $CurrentTileContainer = $curTile.closest(".sapUshellTileContainer");

            if (oNextTile) {
                const $NextTile = oNextTile.$();
                const $NextTileContainer = $NextTile.closest(".sapUshellTileContainer");

                if (bIsActionsModeActive && ($CurrentTileContainer.get(0).id !== $NextTileContainer.get(0).id)) {
                    if (sDirection === "down" || sDirection === "right") {
                        if (!this._goToTileContainerAfterContent($CurrentTileContainer)) {
                            // If the Tile Container doesn't have a visible AfterContent, go to the next Tile Container.
                            this._setTileContainerSelectiveFocus($NextTileContainer);
                        }
                    } else if (sDirection === "up" || sDirection === "left") {
                        const $CurrentTileContainerHeader = $CurrentTileContainer.find(".sapUshellTileContainerHeader");
                        $CurrentTileContainerHeader.focus();
                    }
                } else {
                    this.moveScrollDashboard($NextTile);
                }
            } else if (bIsActionsModeActive) {
                if (sDirection === "down" || sDirection === "right") {
                    this._goToTileContainerAfterContent($CurrentTileContainer);
                } else if (sDirection === "up" || sDirection === "left") {
                    const $CTCHeader = $CurrentTileContainer.find(".sapUshellTileContainerHeader");
                    $CTCHeader.focus();
                }
            }
        },

        _setTileContainerSelectiveFocus: function (jqGroup) {
            const jqGroups = jQuery("#dashboardGroups").find(".sapUshellTileContainer").filter(":visible");
            const jqGroupBeforeContent = jqGroup.find(".sapUshellTileContainerBeforeContent button");
            const jqGroupHeader = jqGroup.find(".sapUshellTileContainerHeader").eq(0);
            const bBeforeContentDisplayed = jqGroupBeforeContent.length && jqGroupBeforeContent.is(":visible");

            if (bBeforeContentDisplayed) {
                jqGroupBeforeContent.focus();
            } else if (jqGroup.get(0) === jqGroups.get(0)) {
                this.goToLastVisitedTile();
            } else if (jqGroupHeader.length) {
                // Set tab-index on tileContainerHeader and its' children.
                jqGroupHeader.focus();
            }
        },

        _setTileFocus: function (oTileElement) {
            const oCatalogViewElement = document.getElementById("catalogView");
            if (oCatalogViewElement && oCatalogViewElement.contains(oTileElement)) {
                this.setFocusOnCatalogTile(oTileElement);
                return;
            }

            const oDashboardGroupsElement = document.getElementById("dashboardGroups");
            const aFocusableTileElements = oDashboardGroupsElement.querySelectorAll(".sapUshellTile[tabindex]");
            for (let i = 0; i < aFocusableTileElements.length; ++i) {
                aFocusableTileElements[i].removeAttribute("tabindex");
            }
            const sQuery = [
                ".sapMGTLineMode",
                ".sapMGT",
                ".sapFCard"
            ].join("[tabindex=\"0\"], ");
            const aFocusableCardsAndGenericTiles = oDashboardGroupsElement.querySelectorAll(sQuery);
            for (let k = 0; k < aFocusableCardsAndGenericTiles.length; ++k) {
                aFocusableCardsAndGenericTiles[k].setAttribute("tabindex", "-1");
            }

            oTileElement.setAttribute("tabindex", 0);

            const oTileControl = Element.getElementById(oTileElement.getAttribute("id"));

            if (oTileControl) {
                const oGroupControl = oTileControl.getParent();

                if (oGroupControl) {
                    const oEventBus = EventBus.getInstance();
                    oEventBus.publish("launchpad", "scrollToGroup", { group: oGroupControl });
                }
                oTileControl.focus();
            }
        },

        setFocusOnCatalogTile: function (oTileElement) {
            const oPrevFirsTile = jQuery(".sapUshellTile[tabindex=0]");
            let aAllTileFocusableElements;
            let aVisibleTiles;

            if (oPrevFirsTile.length) {
                // remove tabindex attribute from all tiles
                jQuery(".sapUshellTileContainerContent [tabindex=0]").get().forEach((oHTMLElement) => {
                    jQuery(oHTMLElement).attr("tabindex", -1);
                });
                aAllTileFocusableElements = oPrevFirsTile.find("[tabindex], a").addBack().filter("[tabindex], a");
                aAllTileFocusableElements.attr("tabindex", -1);
            }

            if (!oTileElement) {
                aVisibleTiles = jQuery(".sapUshellTile, .sapUshellAppBox").filter(":visible");
                if (aVisibleTiles.length) {
                    oTileElement = aVisibleTiles[0];
                } else {
                    const aMessagePageMainTexts = document.getElementsByClassName("sapMMessagePageMainText");
                    if (aMessagePageMainTexts.length) {
                        aMessagePageMainTexts[0].focus();
                    }
                    return;
                }
            }

            // add tabindex attribute to all tile's elements in TAB cycle
            oTileElement.setAttribute("tabindex", 0);
            jQuery(oTileElement).find("button").attr("tabindex", 0);
            oTileElement.focus();
        },

        /**
         * Sets focus on the given element (which also scrolls it into view).
         *
         * @param {jQuery} $TileSelected Element that should receive focus.
         */
        moveScrollDashboard: function ($TileSelected) {
            if ($TileSelected.length) {
                this._setTileFocus($TileSelected[0]);
            }
        },

        _moveGroupFromDashboard: function (sDirection, jqGroup) {
            const aTileContainers = jQuery(".sapUshellDashboardGroupsContainerItem");

            const jqCurrentTileContainer = jqGroup.closest(".sapUshellDashboardGroupsContainerItem");
            const indexOfTileContainer = aTileContainers.index(jqCurrentTileContainer);
            const toIndex = sDirection === "up" || sDirection === "left" ? indexOfTileContainer - 1 : indexOfTileContainer + 1;
            this._moveGroup(indexOfTileContainer, toIndex);
        },

        _moveGroup: function (fromIndex, toIndex) {
            if (toIndex < 0 || toIndex >= jQuery(".sapUshellDashboardGroupsContainerItem").length || toIndex < jQuery(".sapUshellDisableDragAndDrop").length) {
                return;
            }

            EventBus.getInstance().publish("launchpad", "moveGroup", { fromIndex: fromIndex, toIndex: toIndex });

            setTimeout(() => {
                const tileContainerHeader = jQuery(".sapUshellTileContainerHeader")[toIndex];
                jQuery(tileContainerHeader).focus();
            }, 100);
        },

        _getFocusOnTile: function (jqFocused) {
            let jqTile;

            [".sapUshellTile", ".sapUshellLinkTile", ".sapFCard"].forEach((sClassName) => {
                const jqTileWrapper = jqFocused.closest(sClassName);
                if (jqTileWrapper.length) {
                    jqTile = jqTileWrapper;
                }
            });

            return jqTile;
        },

        _renameGroup: function (jqFocused) {
            if (jqFocused.closest(".sapUshellTileContainerHeader").length === 1) {
                jqFocused = jqFocused[0].tagName === "H2" ? jqFocused : jqFocused.find("h2");
                jqFocused.click();
            }
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} sDirection Direction
         * @param {*} oEvent Event
         * @param {*} jqFocused jqFocused
         *
         * @deprecated since 1.112
         */
        _arrowsButtonsHandler: function (sDirection, oEvent, jqFocused) {
            this._preventDefault(oEvent);

            // Anchor Navigation Item
            if (jqFocused.hasClass("sapUshellAnchorItem")) {
                this._handleAnchorNavigationItemsArrowKeys(sDirection, jqFocused);
                return;
            }

            // Anchor Navigation Overflow Button
            if (jqFocused.is("#sapUshellAnchorBarOverflowButton")) {
                this._handleAnchorNavigationOverflowButtonArrowKeys(sDirection);
                return;
            }

            // DashboardGroups
            const jqTile = this._getFocusOnTile(jqFocused);
            const bIsActionsModeActive = this.oModel.getProperty("/tileActionModeActive");
            const bPersonalizationEnabled = this.oModel.getProperty("/personalization");

            if (oEvent.ctrlKey === true && bPersonalizationEnabled) {
                const jqHeaderElement = jqFocused.closest(".sapUshellTileContainerHeader");

                if (jqTile) {
                    this._moveTile(sDirection);
                } else if (jqHeaderElement.length) {
                    // first we check if we should prevent the move of the group - obtain the wrapping container (content div)
                    const jqFocusGroupContentElement = jqHeaderElement.closest(".sapUshellTileContainerContent");
                    // if the group is the Home group OR Locked group - do not initiate move
                    if (!jqFocusGroupContentElement.hasClass("sapUshellTileContainerDefault") || !jqFocusGroupContentElement.hasClass("sapUshellTileContainerLocked")) {
                        this._moveGroupFromDashboard(sDirection, jqHeaderElement);
                    }
                }
            } else if (bIsActionsModeActive) {
                this._goToSiblingElementInTileContainer(sDirection, jqFocused);
            } else if (jqTile) {
                this._goFromFocusedTile(sDirection, jqTile, bIsActionsModeActive);
            } else {
                this.goToLastVisitedTile();
            }
        },

        _handleAnchorNavigationOverflowButtonArrowKeys: function (sDirection) {
            if (sDirection === "left" || sDirection === "up") {
                const aAnchorItems = jQuery(".sapUshellAnchorItem").filter(":visible");
                this._setAnchorItemFocus(aAnchorItems.eq(aAnchorItems.length - 1)[0]);
            }
        },

        _handleAnchorNavigationItemsArrowKeys: function (sDirection, jqFocused) {
            const aAnchorItems = jQuery(".sapUshellAnchorItem").filter(":visible");
            const nIndexOfFocusedItem = aAnchorItems.index(jqFocused);

            if (sDirection === "left" || sDirection === "up") {
                if (nIndexOfFocusedItem > 0) {
                    this._setAnchorItemFocus(aAnchorItems.eq(nIndexOfFocusedItem - 1)[0]);
                    return;
                }
            }

            if (sDirection === "right" || sDirection === "down") {
                if (nIndexOfFocusedItem < aAnchorItems.length - 1) {
                    this._setAnchorItemFocus(aAnchorItems.eq(nIndexOfFocusedItem + 1)[0]);
                } else if (nIndexOfFocusedItem === aAnchorItems.length - 1) {
                    const oOverflowButton = document.getElementById("sapUshellAnchorBarOverflowButton");
                    oOverflowButton.focus();
                }
            }
        },

        _setAnchorItemFocus: function (oAnchorItemDomRef) {
            // remove tabindex from all anchor items
            const aAnchorItems = document.getElementsByClassName("sapUshellAnchorItem");
            for (let i = 0; i < aAnchorItems.length; ++i) {
                aAnchorItems[i].setAttribute("tabindex", "-1");
            }

            if (!oAnchorItemDomRef) {
                oAnchorItemDomRef = jQuery(".sapUshellAnchorItem").filter(":visible")[0];
            }

            oAnchorItemDomRef.setAttribute("tabindex", "0");
            oAnchorItemDomRef.focus();
        },

        _appFinderHomeEndButtonsHandler: function (sDirection, oEvent, jqFocused) {
            const aVisibleCatalogEntries = jQuery(".sapUshellTile, .sapUshellAppBox").filter(":visible");
            let jqFocusElement;
            if (aVisibleCatalogEntries.length) {
                if (sDirection === "home") {
                    jqFocusElement = jQuery(aVisibleCatalogEntries.get(0));
                }
                if (sDirection === "end") {
                    jqFocusElement = jQuery(aVisibleCatalogEntries.get(aVisibleCatalogEntries.length - 1));
                }
            }
            if (jqFocusElement) {
                this._preventDefault(oEvent);
                this._appFinderFocusAppBox(jqFocused, jqFocusElement);
            }
        },

        _homeEndButtonsHandler: function (selector, oEvent, jqFocused) {
            if (jqFocused.hasClass("sapUshellAnchorItem")) {
                this._preventDefault(oEvent);
                this._setAnchorItemFocus(jQuery(".sapUshellAnchorItem").filter(`:visible:${selector}`)[0]);
            } else if (oEvent.ctrlKey === true) {
                this._preventDefault(oEvent);
                const jqTileToSelect = jQuery(".sapUshellTile, .sapFCard").filter(":visible")[selector]();
                if (jqTileToSelect.length) {
                    this._setTileFocus(jqTileToSelect[0]);
                }
            } else {
                const jqGroup = jqFocused.closest(".sapUshellTileContainer");

                if (jqGroup) {
                    const oGroup = Element.closestTo(jqGroup[0]);

                    if (oGroup) {
                        this._preventDefault(oEvent);
                        this._goToTileOfGroup(selector, oGroup);
                    }
                }
            }
        },

        _deleteButtonHandler: function (jqFocused) {
            const bIsActionsModeActive = this.oModel.getProperty("/tileActionModeActive");
            const bPersonalizationEnabled = this.oModel.getProperty("/personalization");

            if (bIsActionsModeActive && bPersonalizationEnabled) {
                const jqElement = this._getFocusOnTile(jqFocused);

                if (jqElement && !jqElement.hasClass("sapUshellLockedTile") && !jqElement.hasClass("sapUshellPlusTile")) {
                    const oInfo = this._getGroupAndTilesInfo();

                    if (oInfo && !oInfo.oCurTile.isLink) { // links are handled in the HomepageManager
                        const oDashboardView = Element.getElementById("sapUshellDashboardPage").getParent();

                        EventBus.getInstance().publish("launchpad", "deleteTile", {
                            tileId: oDashboardView.getController()._getTileUuid(oInfo.oCurTile),
                            items: "tiles"
                        }, this);
                    }
                }
            }
        },

        _spaceButtonHandler: function (oEvent, jqFocused) {
            oEvent.preventDefault();
            const jqTile = this._getFocusOnTile(jqFocused);

            if (!jqTile || !jqTile.length) {
                jqFocused.click();
                return;
            }
            if (jqTile.hasClass("sapFCard")) {
                Element.closestTo(jqTile[0]).getCardHeader().firePress();
                return;
            }

            // ssb tiles have a genericTile that can be found with this
            const jqClosestButton = jqFocused.find("[role=button], a.sapMGT"); // Generic tiles may be rendered either as buttons or as links
            if (jqClosestButton.length && !this.oModel.getProperty("/tileActionModeActive")) {
                const oButtonControl = Element.closestTo(jqClosestButton[0]);
                if (oButtonControl) {
                    oButtonControl.firePress();
                    return;
                }
            }

            Element.closestTo(jqTile[0]).firePress();
        },

        goToSelectedAnchorNavigationItem: function () {
            this._setAnchorItemFocus(document.getElementsByClassName("sapUshellAnchorItemSelected")[0]);
            return document.activeElement && document.activeElement.classList.contains("sapUshellAnchorItemSelected");
        },

        handleFocusOnMe: function (oEvent, bFocusPassedFirstTime) {
            const oRenderer = Container.getRendererInternal("fiori2");
            const handler = ComponentKeysHandler._instance;

            if (oRenderer) {
                const sCurrentCoreView = oRenderer.getCurrentCoreView();

                /**
                 * @deprecated since 1.118
                 * This part of the code is dedicated only to the classic homepage and should therefore be deprecated.
                 */
                if (sCurrentCoreView === "home" && !Config.last("/core/spaces/enabled")) {
                    // handle focus after tileContainer rename
                    const sTagName = document.activeElement ? document.activeElement.tagName : "";
                    if (sTagName === "INPUT" || sTagName === "TEXTAREA") {
                        if (oEvent.keyCode === handler.keyCodes.ENTER) {
                            let $HeaderElement = jQuery(document.activeElement).closest(".sapUshellTileContainerHeader");
                            if ($HeaderElement.length) {
                                setTimeout(() => {
                                    $HeaderElement = jQuery(`#${$HeaderElement[0].id}`);
                                    $HeaderElement.focus();
                                }, 10);
                            }
                        }
                    } else {
                        handler._dashboardKeydownHandler(oEvent);
                    }
                }

                if (sCurrentCoreView === "appFinder" && !Config.last("/core/workPages/contentFinderStandalone")) {
                    // we got the focus from the shell
                    if (bFocusPassedFirstTime) {
                        if (oEvent.shiftKey) { // backwards navigation
                            handler.setFocusOnCatalogTile();
                        } else { // forward navigation
                            const openCloseSplitAppButton = Element.getElementById("openCloseButtonAppFinderSubheader");
                            if (openCloseSplitAppButton && openCloseSplitAppButton.getVisible()) {
                                openCloseSplitAppButton.focus();
                            } else {
                                handler.appFinderFocusMenuButtons(oEvent);
                            }
                        }
                    } else {
                        handler._appFinderKeydownHandler(oEvent);
                    }
                }
            }
        },

        _appFinderFocusAppBox: function (jqCurAppBox, jqNextAppBox) {
            if (jqCurAppBox && jqNextAppBox) {
                jqCurAppBox.attr("tabindex", "-1").find(".sapUshellPinButton").attr("tabindex", "-1");
                jqNextAppBox.attr("tabindex", "0").focus();
                jqNextAppBox.find(".sapUshellPinButton").attr("tabindex", "0");
            }
        },

        _preventDefault: function (oEvent) {
            // Prevent the browser event from scrolling the page
            // Instead we clone this event and dispatch it programmatic,
            // so all handlers expecting this event will still work
            oEvent.preventDefault();
            oEvent.stopPropagation();
            oEvent.stopImmediatePropagation();
        },

        _getNextCatalog: function (sDirection, jqCurCatalog) {
            let jqNextCatalog;

            if (sDirection === "down" || sDirection === "right") {
                jqNextCatalog = jqCurCatalog.next();
            } else if (sDirection === "up" || sDirection === "left") {
                jqNextCatalog = jqCurCatalog.prev();
            } else {
                Log.error("Direction is unkown", sDirection, "sap.ushell.components.ComponentKeysHandler");
                return null;
            }

            if (jqNextCatalog.length > 0) {
                const nNextCatalogContentLength = jqNextCatalog.find("li.sapUshellAppBox, li.sapUshellTile").get().length;

                if (nNextCatalogContentLength > 0) {
                    return jqNextCatalog;
                }
                return this._getNextCatalog(sDirection, jqNextCatalog);
            }
            return undefined;
        },

        _getNextCatalogItem: function (sDirection, jqFocused, bPageUpDown) {
            const jqCatalogContainer = jQuery(jqFocused.parents()[2]);
            const aCurCatalogItems = jqCatalogContainer.find("li.sapUshellAppBox, li.sapUshellTile").get();

            if (sDirection === "right" || sDirection === "left") {
                const nCurItemIndex = aCurCatalogItems.indexOf(jqFocused.get(0));
                const nNextItemIndex = sDirection === "right" ? nCurItemIndex + 1 : nCurItemIndex - 1;

                // Next item in this catalog
                if (aCurCatalogItems[nNextItemIndex]) {
                    return aCurCatalogItems[nNextItemIndex];
                }
            }

            // Maybe the next item is in the next catalog
            const jqNextCatalog = this._getNextCatalog(sDirection, jqCatalogContainer);
            const aNextCatalogItems = jqNextCatalog ? jqNextCatalog.find("li.sapUshellAppBox, li.sapUshellTile").get() : [];

            if (aNextCatalogItems.length > 0 && sDirection === "right") {
                return aNextCatalogItems[0];
            }

            if (aNextCatalogItems.length > 0 && sDirection === "left") {
                return aNextCatalogItems[aNextCatalogItems.length - 1];
            }

            if (sDirection === "down" || sDirection === "up") {
                if (aNextCatalogItems.length > 0 && bPageUpDown) {
                    return aNextCatalogItems[0];
                }
                const aJoinedItems = (sDirection === "down") ? aCurCatalogItems.concat(aNextCatalogItems) : aNextCatalogItems.concat(aCurCatalogItems);
                return this._findClosestTile(sDirection, aJoinedItems, jqFocused.get(0));
            }

            return undefined;
        },

        _appFinderKeysHandler: function (sDirection, oEvent, jqFocused, bPageUpDown) {
            if (jqFocused.is(".sapUshellAppBox, .sapUshellTile")) {
                this._preventDefault(oEvent);
                const jqNextFocused = jQuery(this._getNextCatalogItem(sDirection, jqFocused, bPageUpDown));

                if (jqNextFocused) {
                    this._appFinderFocusAppBox(jqFocused, jqNextFocused);
                }
            }
        },

        appFinderFocusMenuButtons: function (oEvent) {
            const buttons = jQuery("#catalog-button, #userMenu-button, #sapMenu-button").filter("[tabindex=0]");
            if (buttons.length) {
                buttons.eq(0).focus();
                this._preventDefault(oEvent);
                return true;
            }
            return false;
        },

        _appFinderKeydownHandler: function (oEvent) {
            const jqFocused = jQuery(document.activeElement);
            if (oEvent.srcElement.id !== "appFinderSearch-I") {
                let iPressedKeyCode = oEvent.keyCode;
                const bIsRTL = Localization.getRTL();

                if (bIsRTL && iPressedKeyCode === this.keyCodes.ARROW_RIGHT) {
                    iPressedKeyCode = this.keyCodes.ARROW_LEFT;
                } else if (bIsRTL && iPressedKeyCode === this.keyCodes.ARROW_LEFT) {
                    iPressedKeyCode = this.keyCodes.ARROW_RIGHT;
                }

                switch (iPressedKeyCode) {
                    case this.keyCodes.ARROW_UP:
                        this._appFinderKeysHandler("up", oEvent, jqFocused);
                        break;
                    case this.keyCodes.ARROW_DOWN:
                        this._appFinderKeysHandler("down", oEvent, jqFocused);
                        break;
                    case this.keyCodes.ARROW_RIGHT:
                        this._appFinderKeysHandler("right", oEvent, jqFocused);
                        break;
                    case this.keyCodes.ARROW_LEFT:
                        this._appFinderKeysHandler("left", oEvent, jqFocused);
                        break;
                    case this.keyCodes.PAGE_UP:
                        this._appFinderKeysHandler("up", oEvent, jqFocused, true);
                        break;
                    case this.keyCodes.PAGE_DOWN:
                        this._appFinderKeysHandler("down", oEvent, jqFocused, true);
                        break;
                    case this.keyCodes.HOME:
                        this._appFinderHomeEndButtonsHandler("home", oEvent, jqFocused);
                        break;
                    case this.keyCodes.END:
                        this._appFinderHomeEndButtonsHandler("end", oEvent, jqFocused);
                        break;
                    case this.keyCodes.SPACE:
                        this._spaceButtonHandler(oEvent, jqFocused);
                        break;
                    default:
                        return;
                }
            }
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} oEvent Event
         * @deprecated since 1.112
         */
        _dashboardKeydownHandler: function (oEvent) {
            const sTagName = document.activeElement && document.activeElement.tagName;
            if (sTagName === "INPUT" || sTagName === "TEXTAREA") {
                return; // there may be custom tiles with input controls inside
            }

            let iPressedKeyCode = oEvent.keyCode;
            const bIsRTL = Localization.getRTL();
            const jqFocused = jQuery(document.activeElement);

            if (bIsRTL) {
                if (iPressedKeyCode === this.keyCodes.ARROW_RIGHT) {
                    iPressedKeyCode = this.keyCodes.ARROW_LEFT;
                } else if (iPressedKeyCode === this.keyCodes.ARROW_LEFT) {
                    iPressedKeyCode = this.keyCodes.ARROW_RIGHT;
                }
            }

            switch (iPressedKeyCode) {
                case this.keyCodes.F2:
                    this._renameGroup(jqFocused);
                    break;
                case this.keyCodes.DELETE:
                case this.keyCodes.BACKSPACE:
                    this._deleteButtonHandler(jqFocused);
                    break;
                case this.keyCodes.ARROW_UP:
                    this._arrowsButtonsHandler("up", oEvent, jqFocused);
                    break;
                case this.keyCodes.ARROW_DOWN:
                    this._arrowsButtonsHandler("down", oEvent, jqFocused);
                    break;
                case this.keyCodes.ARROW_RIGHT:
                    this._arrowsButtonsHandler("right", oEvent, jqFocused);
                    break;
                case this.keyCodes.ARROW_LEFT:
                    this._arrowsButtonsHandler("left", oEvent, jqFocused);
                    break;
                case this.keyCodes.PAGE_UP:
                    this._goToFirstTileOfNextGroup("up", oEvent);
                    break;
                case this.keyCodes.PAGE_DOWN:
                    this._goToFirstTileOfNextGroup("down", oEvent);
                    break;
                case this.keyCodes.HOME:
                    this._homeEndButtonsHandler("first", oEvent, jqFocused);
                    break;
                case this.keyCodes.END:
                    this._homeEndButtonsHandler("last", oEvent, jqFocused);
                    break;
                case this.keyCodes.SPACE:
                    this._spaceButtonHandler(oEvent, jqFocused);
                    break;
                case this.keyCodes.ENTER:
                    this._spaceButtonHandler(oEvent, jqFocused);
                    break;
                default:
                    break;
            }
        }
    };

    return ComponentKeysHandler;
});
