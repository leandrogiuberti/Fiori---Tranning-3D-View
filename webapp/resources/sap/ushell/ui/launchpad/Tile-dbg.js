// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/m/Text",
    "sap/ui/base/ManagedObject",
    "sap/ui/core/Control",
    "sap/ui/core/EventBus",
    "sap/ui/core/Icon",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "./TileRenderer"
], (
    Log,
    Text,
    ManagedObject,
    Control,
    EventBus,
    Icon,
    jQuery,
    ushellLibrary,
    resources,
    AccessibilityCustomData,
    TileRenderer
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.launchpad.Tile
     * @class
     * @classdesc Constructor for a new ui/launchpad/Tile.
     * A tile to be displayed in the tile container. This tile acts as container for specialized tile implementations.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @extends sap.ui.core.Control
     *
     * @private
     */
    const Tile = Control.extend("sap.ushell.ui.launchpad.Tile", /** @lends sap.ushell.ui.launchpad.Tile.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                long: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                uuid: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                tileCatalogId: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                tileCatalogIdStable: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                isCustomTile: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                target: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                debugInfo: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                rgba: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                animationRendered: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                isLocked: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                showActionsIcon: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                tileActionModeActive: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                ieHtml5DnD: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                navigationMode: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                isDraggedInTabBarToSourceGroup: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                noContainerMode: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                }
            },
            aggregations: {
                tileViews: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "tileView"
                },
                pinButton: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    singularName: "pinButton"
                }
            },
            events: {
                press: {},
                coverDivPress: {},
                afterRendering: {},
                showActions: {},
                deletePress: {}
            }
        },
        renderer: TileRenderer
    });

    Tile.prototype.init = function () {
        this.addDelegate({
            onkeyup: function (oEvent) {
                const oKeyEvent = oEvent.originalEvent;
                const bSpace = oKeyEvent.code === "Space" || oEvent.keyCode === 32;
                const bEnter = oKeyEvent.code === "Enter" || oEvent.keyCode === 13;
                const bModifierKey = oKeyEvent.altKey || oKeyEvent.shiftKey || oKeyEvent.ctrlKey || oKeyEvent.metaKey;

                // The modifier keys allow a keyboard user to abort the space or enter key (similar to a dragging click preventing the actual click event)
                if ((bSpace || bEnter) && !bModifierKey) {
                    this._launchTileViaKeyboard(oEvent);
                }
            }
        }, this);
    };

    Tile.prototype.exit = function () {
        if (this.actionSheetIcon) {
            this.actionSheetIcon.destroy();
        }
        if (this.actionIcon) {
            this.actionIcon.destroy();
        }
        if (this.failedToLoadViewText) {
            this.failedToLoadViewText.destroy();
        }
    };

    Tile.prototype.getFailedtoLoadViewText = function () {
        if (!this.failedToLoadViewText) {
            this.failedToLoadViewText = new Text({
                text: resources.i18n.getText("Tile.failedToLoadView")
            });
        }
        return this.failedToLoadViewText;
    };

    // icon will be created only in action mode otherwise undefined will be returned
    Tile.prototype.getActionSheetIcon = function () {
        if (!this.getTileActionModeActive()) {
            return undefined;
        }
        if (!this.actionSheetIcon) {
            this.actionSheetIcon = new Icon({
                src: "sap-icon://overflow",
                tooltip: resources.i18n.getText("configuration.category.tile_actions")
            }).addStyleClass("sapUshellTileActionIconDivBottomInner");
        }
        return this.actionSheetIcon;
    };

    Tile.prototype.ontap = function () {
        // dump debug info when tile is clicked
        Log.info("Tile clicked:", this.getDebugInfo(), "sap.ushell.ui.launchpad.Tile");

        this.firePress();
    };
    Tile.prototype.destroy = function (bSuppressInvalidate) {
        this.destroyTileViews();
        Control.prototype.destroy.call(this, bSuppressInvalidate);
    };

    Tile.prototype.addTileView = function (oObject, bSuppressInvalidate) {
        // Workaround for a problem in addAggregation. If a child is added to its current parent again,
        // it is actually removed from the aggregation. Prevent this by removing it from its parent first.
        oObject.setParent(null);
        ManagedObject.prototype.addAggregation.call(this, "tileViews", oObject, bSuppressInvalidate);
    };

    Tile.prototype.destroyTileViews = function () {
        // Don't delete the tileViews when destroying the aggregation. They are stored in the model and must be handled manually.
        if (this.mAggregations.tileViews) {
            this.mAggregations.tileViews.length = 0;
        }
    };

    Tile.prototype.onBeforeRendering = function () {
        const oDomRef = this.getDomRef();

        if (oDomRef) {
            const oInnerLink = oDomRef.querySelector("a.sapUshellTileInner");

            if (oInnerLink) {
                oInnerLink.onclick = null;
            }

            if (document.activeElement === oDomRef) {
                this.bFocused = true;
            }

            this.sTabIndex = oDomRef.getAttribute("tabindex");
            if (this.sTabIndex) {
                oDomRef.removeAttribute("tabindex");
            }
        }
    };

    Tile.prototype.onAfterRendering = function () {
        if (this.getIsDraggedInTabBarToSourceGroup()) {
            const oTileContainer = this.getParent();
            oTileContainer.removeAggregation("tiles", this, false);
        }

        const oDomRef = this.getDomRef();
        if (oDomRef) {
            if (this.sTabIndex) {
                oDomRef.setAttribute("tabindex", this.sTabIndex);
                delete this.sTabIndex;
            }

            if (this.bFocused) {
                oDomRef.focus();
                delete this.bFocused;
            }
        }

        this._redrawRGBA();
        this._disableInnerLink();

        this.fireAfterRendering();
    };

    /**
     * Disables the inner link's press event by assigning an event handler to its 'onclick' event.
     *
     * @private
     */
    Tile.prototype._disableInnerLink = function () {
        const oDomRef = this.getDomRef();
        const oInnerLink = oDomRef.querySelector("a.sapUshellTileInner");

        if (oInnerLink) {
            oInnerLink.onclick = function (event) {
                // Prevent default in order to not trigger navigation twice.
                // This could happen on e.g. iPads that triggered both, the anchor's navigation
                // and the programmatic navigation via window.open, resulting in two tabs being opened.
                event.preventDefault();
            };
        }
    };

    Tile.prototype._launchTileViaKeyboard = function (oEvent) {
        if (this.getTileActionModeActive()) {
            // If in ActionMode - invoke the cover DIV press event
            this.fireCoverDivPress({
                id: this.getId()
            });
        } else {
            this._announceLoadingApplication();
            if (oEvent.target.tagName !== "BUTTON") {
                let oTileUIWrapper = this.getTileViews()[0];
                let bPressHandled = false;
                let oComponent;
                let oTile;

                if (oTileUIWrapper.firePress) {
                    oTileUIWrapper.firePress({ id: this.getId() });
                    // If oTileUIWrapper is a View or a Component.
                } else if (oTileUIWrapper.getComponentInstance) {
                    oComponent = oTileUIWrapper.getComponentInstance();
                    if (oComponent._oController && oComponent._oController.oView.getContent()) {
                        oTile = oComponent._oController.oView.getContent()[0];
                        if (oTile && oTile.firePress) {
                            oTile.firePress({ id: this.getId() });
                        }
                    }
                } else {
                    while (oTileUIWrapper.getContent && !bPressHandled) {
                        // Restriction: since there's no way to know which of the views is the currently presented one,
                        //             we assume it's the first one.
                        oTileUIWrapper = oTileUIWrapper.getContent()[0];
                        if (oTileUIWrapper.firePress) {
                            oTileUIWrapper.firePress({ id: this.getId() });
                            bPressHandled = true;
                        }
                    }
                }
            }
        }
    };

    Tile.prototype.onfocusin = function () {
        const oTileDomRef = this.getDomRef();

        if (!oTileDomRef.classList.contains("sapUshellPlusTile")) {
            const jqPrevSiblingList = this.$().prevUntil("h3");
            let oCatalogGroup;

            // get the CatalogGroupId of this tile in catalog (in dashboard we will get empty string)
            if (jqPrevSiblingList.length > 0) {
                oCatalogGroup = jqPrevSiblingList[jqPrevSiblingList.length - 1].previousSibling;
            } else {
                oCatalogGroup = oTileDomRef.previousSibling;
            }
            // get the inner tile id (relevant to catalog and dashboard)
            const oTileInner = oTileDomRef.querySelector(".sapUshellTileInner");

            if (oTileInner && oTileInner.children && oTileInner.children[0]) {
                const aLabelledbyArray = [];

                if (oCatalogGroup) {
                    aLabelledbyArray.push("sapUshellCatalogAccessibilityTileText");
                } else {
                    aLabelledbyArray.push("sapUshellDashboardAccessibilityTileText");
                }

                const sNavigationMode = this.getNavigationMode();
                if (sNavigationMode) {
                    // embeddedNavigationMode, newWindowNavigationMode, replaceNavigationMode, newWindowThenEmbeddedNavigationMode
                    const sNavigationModeTranslatedText = resources.i18n.getText(`${sNavigationMode}NavigationMode`);
                    if (sNavigationModeTranslatedText) {
                        const sNavigationModeDivId = `${this.getId()}-navigationMode`;

                        if (!document.getElementById(sNavigationModeDivId)) {
                            const oNavigationModeDiv = document.createElement("div");
                            oNavigationModeDiv.setAttribute("id", sNavigationModeDivId);
                            oNavigationModeDiv.style.display = "none";
                            oNavigationModeDiv.innerText = sNavigationModeTranslatedText;
                            oTileInner.appendChild(oNavigationModeDiv);
                        }

                        aLabelledbyArray.push(sNavigationModeDivId);
                    } else {
                        Log.warning("The navigation mode is of a unkown mode, it can not be read!");
                    }
                }

                aLabelledbyArray.push(oTileInner.children[0].getAttribute("id"));

                const deleteIcon = oTileDomRef.querySelector(".sapUshellTileDeleteClickArea .sapUiIcon");
                if (deleteIcon) {
                    aLabelledbyArray.push(deleteIcon.id);
                }

                if (oCatalogGroup) {
                    aLabelledbyArray.push(oCatalogGroup.getAttribute("id"));
                }

                if (this.getTileActionModeActive()) {
                    aLabelledbyArray.push("sapUshellDashboardAccessibilityTileEditModeText");
                }

                oTileDomRef.setAttribute("aria-labelledby", aLabelledbyArray.join(" "));
            }
        }
    };

    Tile.prototype.onclick = function (oEvent) {
        // if tile is in Edit Mode (Action Mode)
        if (this.getTileActionModeActive()) {
            // in case we clicked on the Delete-Action Click-Area trigger delete
            const srcElement = oEvent.originalEvent.srcElement;
            if (jQuery(srcElement).closest(".sapUshellTileDeleteClickArea").length > 0) {
                this.fireDeletePress();
            } else {
                // otherwise click made on cover-div
                this.fireCoverDivPress({
                    id: this.getId()
                });
            }
        } else {
            this._announceLoadingApplication();
        }
    };

    Tile.prototype._announceLoadingApplication = function () {
        const oAccessibilityHelperAppInfo = document.getElementById("sapUshellLoadingAccessibilityHelper-appInfo");
        const sLoadingString = resources.i18n.getText("screenReaderNavigationLoading");

        if (oAccessibilityHelperAppInfo) {
            oAccessibilityHelperAppInfo.setAttribute("role", "alert");
            oAccessibilityHelperAppInfo.innerText = sLoadingString;

            setTimeout(() => {
                // switch because rude will repeat the text "loading application" several times
                // set the text to "" so it will be announce in the next navigation
                oAccessibilityHelperAppInfo.removeAttribute("role");
                oAccessibilityHelperAppInfo.innerText = "";
            }, 0);
        }
    };

    Tile.prototype._initDeleteAction = function () {
        const that = this; // the tile control
        if (!this.deleteIcon) {
            this.deleteIcon = new Icon({
                src: "sap-icon://decline",
                tooltip: resources.i18n.getText("removeButtonTitle")
            });
            this.deleteIcon.addEventDelegate({
                onclick: function (oEvent) {
                    that.fireDeletePress();
                    oEvent.stopPropagation();
                }
            });
            this.deleteIcon.addStyleClass("sapUshellTileDeleteIconInnerClass");
            this.deleteIcon.addCustomData(new AccessibilityCustomData({
                key: "aria-label",
                value: resources.i18n.getText("removeButtonLabel"),
                writeToDom: true
            }));
        }
        return this.deleteIcon;
    };

    Tile.prototype.setShowActionsIcon = function (bShow) {
        if (bShow) {
            if (!this.actionIcon) {
                this.actionIcon = new Icon({
                    size: "1rem",
                    src: "sap-icon://overflow",
                    press: function () {
                        this.fireShowActions();
                        this.addStyleClass("showTileActionsIcon");

                        const oEventBus = EventBus.getInstance();
                        function eventFunction (name, name2, tile) {
                            tile.removeStyleClass("showTileActionsIcon");
                            oEventBus.unsubscribe("dashboard", "actionSheetClose", eventFunction);
                        }
                        oEventBus.subscribe("dashboard", "actionSheetClose", eventFunction);
                    }.bind(this)
                }).addStyleClass("sapUshellTileActionsIconClass");
            }
        }
        this.setProperty("showActionsIcon", bShow);
    };

    Tile.prototype.setIsDraggedInTabBarToSourceGroup = function (bDraggedInTabBarToSourceGroup) {
        this.setProperty("isDraggedInTabBarToSourceGroup", bDraggedInTabBarToSourceGroup);
        this.setVisible(!bDraggedInTabBarToSourceGroup);
    };

    Tile.prototype.setRgba = function (sValue) {
        this.setProperty("rgba", sValue);
        this._redrawRGBA();
    };

    Tile.prototype._redrawRGBA = function () {
        const sRGBAvalue = this.getRgba();
        const jqTile = this.$();

        if (sRGBAvalue && jqTile) {
            const oModel = this.getModel();
            jqTile.css("background-color", sRGBAvalue);

            jqTile.off("mouseenter mouseleave");
            let updatedShadowColor;
            const tileBorderWidth = jqTile.css("border").split("px")[0];

            // tile has border
            if (tileBorderWidth > 0) {
                updatedShadowColor = jqTile.css("border-color");
            } else {
                updatedShadowColor = sRGBAvalue;
            }

            jqTile.hover(
                () => {
                    if (oModel && !oModel.getProperty("/tileActionModeActive")) {
                        const sOriginalTileShadow = jqTile.css("box-shadow");
                        const sTitleShadowDimension = sOriginalTileShadow ? sOriginalTileShadow.split(") ")[1] : null;

                        if (sTitleShadowDimension) {
                            jqTile.css("box-shadow", `${sTitleShadowDimension} ${updatedShadowColor}`);
                        }
                    }
                },
                () => {
                    jqTile.css("box-shadow", "");
                }
            );
        }
    };

    return Tile;
});
