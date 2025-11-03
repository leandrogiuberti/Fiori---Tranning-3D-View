// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Provides control sap.ushell.ui.launchpad.AnchorNavigationBar.
 * @deprecated since 1.120
 */
sap.ui.define([
    "./AnchorNavigationBarRenderer",
    "sap/base/i18n/Localization",
    "sap/base/util/isEmptyObject",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/ui/core/Element",
    "sap/ui/core/ResizeHandler",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources"
], (
    AnchorNavigationBarRenderer,
    Localization,
    isEmptyObject,
    Bar,
    Button,
    Element,
    ResizeHandler,
    Device,
    jQuery,
    ushellLibrary,
    resources
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.launchpad.AnchorNavigationBar
     * @class
     * @classdesc Constructor for a new ui/launchpad/AnchorNavigationBar.
     * Add your documentation for the new ui/launchpad/AnchorNavigationBar
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @extends sap.m.Bar
     *
     * @private
     */
    const AnchorNavigationBar = Bar.extend("sap.ushell.ui.launchpad.AnchorNavigationBar", /** @lends sap.ushell.ui.launchpad.AnchorNavigationBar.prototype */{
        metadata: {
            library: "sap.ushell",
            properties: {
                // a value for an optional accessibility label
                accessibilityLabel: { type: "string", defaultValue: null },
                selectedItemIndex: { type: "int", group: "Misc", defaultValue: 0 },
                overflowEnabled: { type: "boolean", group: "Misc", defaultValue: true }
            },
            aggregations: {
                groups: { type: "sap.ushell.ui.launchpad.AnchorItem", multiple: true, singularName: "group" }
            },
            events: {
                afterRendering: {},
                itemPress: {}
            }
        },
        renderer: AnchorNavigationBarRenderer
    });

    AnchorNavigationBar.prototype.init = function () {
        this.bGroupWasPressed = false;
        this.bIsRtl = Localization.getRTL();
        this._bIsRenderedCompletely = false;

        this.fnNavigationBarItemsVisibility = this.setNavigationBarItemsVisibility.bind(this);
        this.fnAdjustVisibleAnchorItemsAccessibility = this.adjustVisibleAnchorItemsAccessibility.bind(this);
    };

    AnchorNavigationBar.prototype.onBeforeRendering = function () {
        if (this._sResizeListenerId) {
            ResizeHandler.deregister(this._sResizeListenerId);
            this._sResizeListenerId = null;
        }
        const oScrollItem = window.document.getElementsByClassName("sapUshellAnchorNavigationBarItemsScroll")[0];
        if (oScrollItem) {
            oScrollItem.removeEventListener("scroll", this.fnNavigationBarItemsVisibility);
        }
    };

    AnchorNavigationBar.prototype.onAfterRendering = function () {
        const oDomRef = this.getDomRef();

        if (this._bIsRenderedCompletely) {
            this.reArrangeNavigationBarElements();
            this.adjustVisibleAnchorItemsAccessibility();

            const oScrollItem = window.document.getElementsByClassName("sapUshellAnchorNavigationBarItemsScroll")[0];
            if (oScrollItem) {
                oScrollItem.addEventListener("scroll", this.fnNavigationBarItemsVisibility);
            }

            // listen to resize
            if (oDomRef) { // onAfterRendering test does not actually render the AnchorNavigationBar
                this._sResizeListenerId = ResizeHandler.register(oDomRef, this.reArrangeNavigationBarElements.bind(this));
            }
        }
    };

    AnchorNavigationBar.prototype.openOverflowPopup = function () {
        const overflowOpened = jQuery(".sapUshellAnchorItemOverFlow").hasClass("sapUshellAnchorItemOverFlowOpen");
        if (this.oOverflowButton && !overflowOpened) {
            this.oOverflowButton.firePress();
        }
    };

    AnchorNavigationBar.prototype.closeOverflowPopup = function () {
        if (this.oPopover) {
            this.oPopover.close();
        }
    };

    AnchorNavigationBar.prototype.reArrangeNavigationBarElements = function () {
        this.anchorItems = this.getVisibleGroups();
        const selectedItemIndex = this.getSelectedItemIndex() || 0;

        if (this.anchorItems.length) {
            // Make sure only one item is selected at a time
            this.adjustItemSelection(selectedItemIndex);
        }

        if (Device.system.phone && this.anchorItems.length) {
            this.anchorItems.forEach((oItem) => {
                oItem.setIsGroupVisible(false);
            });
            this.anchorItems[this.getSelectedItemIndex()].setIsGroupVisible(true);
        } else {
            setTimeout(() => {
                if (this.isDestroyed()) {
                    return;
                }
                this.setNavigationBarItemsVisibility();
            }, 200);
        }
    };

    AnchorNavigationBar.prototype._scrollToGroupByGroupIndex = function (groupIndex, speed) {
        // The layout is different between touch and non-touch screens
        // See the CSS rule for .sap-tablet .sapUshellAnchorNavigationBarItemsScroll
        const sScrollArea = Device.system.tablet ? ".sapUshellAnchorNavigationBarItemsScroll" : ".sapUshellAnchorNavigationBarItems";
        const oContainer = document.documentElement.querySelector(sScrollArea);
        const oSelectedElement = this.anchorItems[groupIndex].getDomRef();
        if (oContainer && oSelectedElement) {
            const oContainerRect = oContainer.getBoundingClientRect();
            const oItemRect = oSelectedElement.getBoundingClientRect();
            const $Container = jQuery(oContainer);
            const iScrollLeft = this.bIsRtl ? $Container.scrollLeftRTL() : oContainer.scrollLeft;
            let iX; // scroll increment
            // adjust the horizontal scroll position of the container, if needed
            if (oItemRect.left < oContainerRect.left) {
                iX = oItemRect.left - oContainerRect.left - 16; // add 1 rem padding
            } else if (oItemRect.right > oContainerRect.right) {
                iX = oItemRect.right - oContainerRect.right + 16; // add 1 rem padding
            }
            if (iX) {
                if (this.bIsRtl) {
                    $Container.scrollLeftRTL(iScrollLeft + iX);
                } else {
                    oContainer.scrollLeft = iScrollLeft + iX;
                }
            }
            this.setNavigationBarItemsVisibility();
        }
    };

    AnchorNavigationBar.prototype.setNavigationBarItemsVisibility = function () {
        if (!Device.system.phone) {
            this.setNavigationBarItemsVisibilityOnDesktop();
        } else if (this.anchorItems && this.anchorItems.length > 0) {
            this.oOverflowButton.removeStyleClass("sapUshellShellHidden");
            const selectedItemIndex = this.getSelectedItemIndex() || 0;
            if (this.oPopover) {
                this.oPopover.setTitle(this.anchorItems[selectedItemIndex].getTitle());
            }
        }
    };

    AnchorNavigationBar.prototype.setNavigationBarItemsVisibilityOnDesktop = function () {
        // check if to show or hide the popover overflow button
        if (this.anchorItems.length && (!this.isMostRightAnchorItemVisible() || !this.isMostLeftAnchorItemVisible())) {
            this.oOverflowButton.removeStyleClass("sapUshellShellHidden");
        } else if (this.oOverflowButton) {
            this.oOverflowButton.addStyleClass("sapUshellShellHidden");
        }
        // add left / right overflow indication on anchor items with respect to locale direction
        if (this.bIsRtl) {
            if (this.anchorItems.length && !this.isMostLeftAnchorItemVisible()) {
                this.oOverflowRightButton.removeStyleClass("sapUshellShellHidden");
            } else if (this.oOverflowRightButton) {
                this.oOverflowRightButton.addStyleClass("sapUshellShellHidden");
            }
            if (this.anchorItems.length && !this.isMostRightAnchorItemVisible()) {
                this.oOverflowLeftButton.removeStyleClass("sapUshellShellHidden");
            } else if (this.oOverflowLeftButton) {
                this.oOverflowLeftButton.addStyleClass("sapUshellShellHidden");
            }
        } else {
            if (this.anchorItems.length && !this.isMostLeftAnchorItemVisible()) {
                this.oOverflowLeftButton.removeStyleClass("sapUshellShellHidden");
            } else if (this.oOverflowLeftButton) {
                this.oOverflowLeftButton.addStyleClass("sapUshellShellHidden");
            }
            if (this.anchorItems.length && !this.isMostRightAnchorItemVisible()) {
                this.oOverflowRightButton.removeStyleClass("sapUshellShellHidden");
            } else if (this.oOverflowRightButton) {
                this.oOverflowRightButton.addStyleClass("sapUshellShellHidden");
            }
        }
    };

    AnchorNavigationBar.prototype.adjustItemSelection = function (iSelectedIndex) {
        // call adjustItemSelection with timeout since after deletion of group the dashboard scrolls and changes the selection wrongly
        // so wait a bit for the scroll and then adjust the selection
        setTimeout(() => {
            if (this.anchorItems && this.anchorItems.length) {
                this.anchorItems.forEach((oItem) => {
                    oItem.setSelected(false);
                });
                if (iSelectedIndex >= 0 && iSelectedIndex < this.anchorItems.length) {
                    this.anchorItems[iSelectedIndex].setSelected(true);

                    // scroll to group
                    this._scrollToGroupByGroupIndex(iSelectedIndex);
                }
            }
        }, 50);
    };

    AnchorNavigationBar.prototype.isMostRightAnchorItemVisible = function () {
        const jqNavigationBar = jQuery(".sapUshellAnchorNavigationBarInner");
        const navigationBarWidth = !isEmptyObject(jqNavigationBar) ? jqNavigationBar.width() : 0;
        const navigationBarOffset = !isEmptyObject(jqNavigationBar) && jqNavigationBar.offset() ?
            jqNavigationBar.offset().left : 0;
        const lastItem = this.bIsRtl ? this.anchorItems[0].getDomRef() : this.anchorItems[this.anchorItems.length - 1].getDomRef();
        let lastItemWidth = !isEmptyObject(lastItem) ? jQuery(lastItem).width() : 0;
        // when the anchor bar isn't visible, the items gets negative width
        // use the minimal width for items instead
        if (lastItemWidth < 0) {
            lastItemWidth = 80;
        }
        const lastItemOffset = lastItem && jQuery(lastItem).offset() ? jQuery(lastItem).offset().left : 0;

        // last item is completely shown in the navigation bar
        return Math.ceil(lastItemOffset) + lastItemWidth <= navigationBarOffset + navigationBarWidth;
    };

    AnchorNavigationBar.prototype.isMostLeftAnchorItemVisible = function () {
        const jqNavigationBar = jQuery(".sapUshellAnchorNavigationBarInner");
        const navigationBarOffsetLeft = !isEmptyObject(jqNavigationBar)
                && jqNavigationBar.offset() && jqNavigationBar.offset().left || 0;
        const firstItem = this.bIsRtl ? this.anchorItems[this.anchorItems.length - 1].getDomRef() : this.anchorItems[0].getDomRef();
        const firstItemOffset = !isEmptyObject(firstItem) && jQuery(firstItem).offset() ? jQuery(firstItem).offset().left : 0;

        // last item is not completely shown in the navigation bar
        return Math.ceil(firstItemOffset) >= navigationBarOffsetLeft;
    };

    AnchorNavigationBar.prototype.setSelectedItemIndex = function (iSelectedIndex) {
        if (iSelectedIndex !== undefined) {
            this.setProperty("selectedItemIndex", iSelectedIndex, true);
        }
    };

    AnchorNavigationBar.prototype.setOverflowEnabled = function (bEnabled) {
        this.setProperty("overflowEnabled", bEnabled);
        if (this.oOverflowButton) {
            this.oOverflowButton.setEnabled(bEnabled);
        }
    };

    AnchorNavigationBar.prototype._getOverflowLeftArrowButton = function () {
        if (!this.oOverflowLeftButton) {
            this.oOverflowLeftButton = new Button({
                icon: "sap-icon://slim-arrow-left",
                tooltip: resources.i18n.getText("scrollToTop"),
                press: function () {
                    this._scrollToGroupByGroupIndex(0);
                }.bind(this)
            }).addStyleClass("sapUshellShellHidden");
            this.oOverflowLeftButton._bExcludeFromTabChain = true;
        }

        return this.oOverflowLeftButton;
    };

    AnchorNavigationBar.prototype._getOverflowRightArrowButton = function () {
        if (!this.oOverflowRightButton) {
            this.oOverflowRightButton = new Button({
                icon: "sap-icon://slim-arrow-right",
                tooltip: resources.i18n.getText("scrollToEnd"),
                press: function () {
                    this._scrollToGroupByGroupIndex(this.anchorItems.length - 1);
                }.bind(this)
            }).addStyleClass("sapUshellShellHidden");
            this.oOverflowRightButton._bExcludeFromTabChain = true;
        }

        return this.oOverflowRightButton;
    };

    AnchorNavigationBar.prototype._getOverflowButton = function () {
        if (!this.oOverflowButton) {
            this.oOverflowButton = new Button("sapUshellAnchorBarOverflowButton", {
                icon: "sap-icon://slim-arrow-down",
                tooltip: resources.i18n.getText("more_groups"),
                enabled: this.getOverflowEnabled(),
                press: function () {
                    this._togglePopover();
                }.bind(this)
            }).addStyleClass("sapUshellShellHidden");
        }

        return this.oOverflowButton;
    };

    AnchorNavigationBar.prototype._togglePopover = function () {
        sap.ui.require([
            "sap/m/Popover",
            "sap/ui/model/Filter",
            "sap/ushell/ui/launchpad/GroupListItem",
            "sap/m/List",
            "sap/m/library"
        ], (
            Popover,
            Filter,
            GroupListItem,
            List,
            mobileLibrary
        ) => {
            // shortcut for sap.m.ListMode
            const ListMode = mobileLibrary.ListMode;

            if (!this.oPopover) {
                this.oList = new List({
                    mode: ListMode.SingleSelectMaster,
                    rememberSelections: false,
                    selectionChange: function (oEvent) {
                        this.fireItemPress({ group: oEvent.getParameter("listItem") });
                        this.oPopover.close();
                    }.bind(this)
                });

                this.oPopover = new Popover("sapUshellAnchorBarOverflowPopover", {
                    showArrow: false,
                    showHeader: false,
                    placement: "Left",
                    content: [this.oList],
                    horizontalScrolling: false,
                    beforeOpen: function () {
                        // place the popover under the overflow button
                        const jqOverflowBtn = jQuery(".sapUshellAnchorItemOverFlow");
                        const bIsRtl = Localization.getRTL();
                        const offset = bIsRtl ? -1 * jqOverflowBtn.outerWidth() : jqOverflowBtn.outerWidth();
                        this.setOffsetX(offset);
                    },
                    afterClose: function () {
                        jQuery(".sapUshellAnchorItemOverFlow").removeClass("sapUshellAnchorItemOverFlowOpen");
                        jQuery(".sapUshellAnchorItemOverFlow").toggleClass("sapUshellAnchorItemOverFlowPressed", false);
                    }
                }).addStyleClass("sapUshellAnchorItemsPopover").addStyleClass("sapContrastPlus");
            }

            // if we need to close the popover
            if (this.oPopover.isOpen()) {
                this.oPopover.close();
            } else {
                // if we need to open the popover
                this.anchorItems = this.getVisibleGroups();
                this.oList.setModel(this.getModel());
                const bActionModeActive = this.getModel().getProperty("/tileActionModeActive");
                const visibleGroupFilter = new Filter("", "EQ", "a");
                visibleGroupFilter.fnTest = function (itemModel) {
                    // Empty groups should not be displayed when personalization is off or
                    // if they are locked or default group not in action mode
                    if (!itemModel.visibilityModes[bActionModeActive ? 1 : 0]) {
                        return false;
                    }
                    return itemModel.isGroupVisible || bActionModeActive;
                };
                this.oList.bindItems({
                    path: "/groups",
                    template: new GroupListItem({
                        title: "{title}",
                        groupId: "{groupId}",
                        index: "{index}"
                    }),
                    filters: [visibleGroupFilter]
                });
                const sSelectedGroupId = jQuery(".sapUshellAnchorItemSelected").attr("id");
                const oSelectedGroup = Element.getElementById(sSelectedGroupId);
                this.oList.getItems().forEach((oItem) => {
                    if (oSelectedGroup.mProperties.groupId === oItem.mProperties.groupId) {
                        oItem.addStyleClass("sapUshellAnchorPopoverItemSelected");
                    } else {
                        oItem.addStyleClass("sapUshellAnchorPopoverItemNonSelected");
                    }
                });
                jQuery(".sapUshellAnchorItemOverFlow").toggleClass("sapUshellAnchorItemOverFlowPressed", true);
                this.oPopover.openBy(this.oOverflowButton);
            }
        });
    };

    AnchorNavigationBar.prototype.getVisibleGroups = function () {
        return this.getGroups().filter((oGroup) => {
            return oGroup.getVisible();
        });
    };

    /**
     * Sets the value that indicates whether the control is rendered completely.
     *
     * @param {boolean} bRendered True, if the control is rendered completely. False otherwise.
     * @private
     */
    AnchorNavigationBar.prototype._setRenderedCompletely = function (bRendered) {
        this._bIsRenderedCompletely = bRendered;
    };

    AnchorNavigationBar.prototype.handleAnchorItemPress = function (oEvent) {
        this.bGroupWasPressed = true;
        this.fireItemPress({ group: oEvent.getSource(), manualPress: true });
    };

    /**
     * Sets the correct posinset and setsize properties for all visible anchorItems.
     */
    AnchorNavigationBar.prototype.adjustVisibleAnchorItemsAccessibility = function () {
        const aVisibleGroups = this.getVisibleGroups();
        const iSetSize = aVisibleGroups.length;

        aVisibleGroups.forEach((oAnchorItem, index) => {
            oAnchorItem.setPosinset(index + 1);
            oAnchorItem.setSetsize(iSetSize);
        });
    };

    AnchorNavigationBar.prototype.addGroup = function (oGroup, bSuppressInvalidate) {
        oGroup.attachVisibilityChanged(this.fnAdjustVisibleAnchorItemsAccessibility);
        return this.addAggregation("groups", oGroup, bSuppressInvalidate);
    };

    AnchorNavigationBar.prototype.insertGroup = function (oGroup, index, bSuppressInvalidate) {
        oGroup.attachVisibilityChanged(this.fnAdjustVisibleAnchorItemsAccessibility);
        return this.insertAggregation("groups", oGroup, index, bSuppressInvalidate);
    };

    AnchorNavigationBar.prototype.removeGroup = function (oGroup, bSuppressInvalidate) {
        oGroup.detachVisibilityChanged(this.fnAdjustVisibleAnchorItemsAccessibility);
        return this.removeAggregation("groups", oGroup, bSuppressInvalidate);
    };

    AnchorNavigationBar.prototype.exit = function () {
        if (this.oOverflowLeftButton) {
            this.oOverflowLeftButton.destroy();
        }
        if (this.oOverflowRightButton) {
            this.oOverflowRightButton.destroy();
        }
        if (this.oOverflowButton) {
            this.oOverflowButton.destroy();
        }
        if (this.oPopover) {
            this.oPopover.destroy();
        }

        if (Bar.prototype.exit) {
            Bar.prototype.exit.apply(this, arguments);
        }

        if (this._sResizeListenerId) {
            ResizeHandler.deregister(this._sResizeListenerId);
            this._sResizeListenerId = null;
        }
    };

    return AnchorNavigationBar;
});
