// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/Control",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/library" // css style dependency
], (
    Localization,
    Control,
    jQuery,
    ushellResources
) => {
    "use strict";

    const RightFloatingContainer = Control.extend("sap.ushell.ui.shell.RightFloatingContainer", {
        metadata: {
            library: "sap.ushell",
            properties: {
                size:
                    { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "56px" },
                top:
                    { type: "string", group: "Appearance", defaultValue: "0" },
                right:
                    { type: "string", group: "Appearance", defaultValue: "0" },
                textVisible:
                    { type: "boolean", group: "Appearance", defaultValue: true },
                /**
                 * @deprecated since 1.68. The functionality has been discontinued.
                 */
                insertItemsWithAnimation:
                    { type: "boolean", group: "Appearance", defaultValue: true, deprecated: true },
                hideItemsAfterPresentation:
                    { type: "boolean", group: "Appearance", defaultValue: false },
                enableBounceAnimations:
                    { type: "boolean", group: "Appearance", defaultValue: false },
                actAsPreviewContainer:
                    { type: "boolean", group: "Appearance", defaultValue: false }
            },
            aggregations: {
                floatingContainerItems: { type: "sap.ui.core.Control", multiple: true }
            },
            events: {
                // event is fired after rendering of the control
                afterRendering: {}
            }
        },
        renderer: {
            apiVersion: 2,

            render: function (rm, oRightFloatingContainer) {
                const bIsRTL = Localization.getRTL();
                rm.openStart("aside", oRightFloatingContainer);
                rm.class("sapUshellRightFloatingContainer");
                rm.style("top", `${oRightFloatingContainer.getTop()}rem`);
                rm.attr("aria-label", ushellResources.i18n.getText("FloatingContainer_AriaLabel"));
                rm.style(bIsRTL ? "left" : "right", `${oRightFloatingContainer.getRight()}rem`);
                rm.attr("data-role", "alert");
                rm.openEnd();
                rm.openStart("ul");
                rm.class("sapUshellNotificationListContainer");
                rm.attr("role", "list");
                rm.openEnd();
                this.renderFloatingContainerItems(rm, oRightFloatingContainer);
                rm.close("ul");
                rm.close("aside");
            },

            renderFloatingContainerItems: function (rm, oRightFloatingContainer) {
                const bInsertItemsWithAnimation = oRightFloatingContainer.getInsertItemsWithAnimation();
                const bActAsPreviewContainer = oRightFloatingContainer.getActAsPreviewContainer();
                const aItems = oRightFloatingContainer.getFloatingContainerItems();
                let i;

                for (i = 0; i < aItems.length; i++) {
                    if (bActAsPreviewContainer && !bInsertItemsWithAnimation) {
                        aItems[i].addStyleClass("sapUshellNonAnimatedNotificationListItem");
                    } else if (aItems[i].hasStyleClass("sapUshellNonAnimatedNotificationListItem")) {
                        aItems[i].addStyleClass("sapUshellNotificationsListItem");
                        aItems[i].addStyleClass("sapUshellRightFloatingContainerItemBackToViewport");
                        aItems[i].addStyleClass("sapUshellRightFloatingContainerItemHidden");
                        aItems[i].addStyleClass("sapUshellRightFloatingContainerItmHeightVisible");
                        aItems[i].removeStyleClass("sapUshellNonAnimatedNotificationListItem");
                    }

                    rm.renderControl(aItems[i]);
                }
            }
        }
    });

    RightFloatingContainer.prototype.init = function () {
        let timer;
        addEventListener("resize", () => {
            clearTimeout(timer);
            timer = setTimeout(this._handleResize.bind(this), 100);
        });
        this.iRequiredItemsNumber = 5;
    };

    RightFloatingContainer.prototype.onBeforeRendering = function () { };

    RightFloatingContainer.prototype._setSize = function () { };

    RightFloatingContainer.prototype._handleResize = function () {
        // if there are no items, nothing to do
        if (this.getDomRef() && this.getFloatingContainerItems().length) {
            const nPreviousRequiredItems = this.iRequiredItemsNumber;
            const nWindowHeight = window.innerHeight;
            const oDomRef = this.getDomRef();
            const nTopOffset = oDomRef.getBoundingClientRect().top;
            // we need to leave 3.5rem space for the page floating footer in edit mode in compact mode and 4rem in cozy
            const nBottomOffset = jQuery(".sapUiSizeCompact").length > 0 ? 56 : 64;
            const jqItem = this.$().find("li").eq(0);
            let aItems;
            // if no DOM element, nothing to do
            if (!jqItem.length) {
                return;
            }
            const nItemHeight = jqItem[0].clientHeight;

            const editModeFooter = jQuery("#sapUshellDashboardFooter").outerHeight();

            // the maximum amount of items to display is 5 (if needed, this can be changed to a configuration later on)
            this.iRequiredItemsNumber = Math.min(parseInt((nWindowHeight - nTopOffset - nBottomOffset - editModeFooter) / nItemHeight, 10), 5);
            if (nPreviousRequiredItems !== this.iRequiredItemsNumber) {
                aItems = this.getFloatingContainerItems();
                for (let i = 0; i < aItems.length; i++) {
                    if (i < this.iRequiredItemsNumber || isNaN(this.iRequiredItemsNumber)) {
                        aItems[i].removeStyleClass("sapUshellShellHidden");
                    } else {
                        aItems[i].addStyleClass("sapUshellShellHidden");
                    }
                }
            }
        }
    };

    RightFloatingContainer.prototype.onAfterRendering = function () {
        this.fireAfterRendering();
        // after rendering call the resize handler to make sure that
        // we display only items that fit the height we have
        setTimeout(() => {
            this._handleResize();
        }, 500);

        this.addStyleClass("sapContrastPlus");
        this.addStyleClass("sapContrast");
        this.addStyleClass("sapUshellNotificationsListItem");
    };

    RightFloatingContainer.prototype.setVisible = function (bVisible) {
        this.setProperty("visible", bVisible, true);
        if (bVisible) {
            jQuery(this.getDomRef()).css("visibility", "visible");
        } else {
            jQuery(this.getDomRef()).css("visibility", "hidden");
        }
    };

    RightFloatingContainer.prototype.setFloatingContainerItemsVisiblity = function (bVisible) {
        const items = this.getFloatingContainerItems();
        const timeout = bVisible ? 300 : 0;
        const bInsertItemsWithAnimation = this.getInsertItemsWithAnimation();

        function _fnHandleFloatingContainerItemVisibility (index) {
            if (bVisible) {
                items[index].removeStyleClass("sapUshellRightFloatingContainerItemBounceOut").addStyleClass("sapUshellRightFloatingContainerItemBounceIn");
            } else {
                items[index].removeStyleClass("sapUshellRightFloatingContainerItemBounceIn").addStyleClass("sapUshellRightFloatingContainerItemBounceOut");
            }
        }

        for (let i = 0; i < items.length; i++) {
            (function (index) {
                return function () {
                    if (bInsertItemsWithAnimation) {
                        setTimeout(() => {
                            _fnHandleFloatingContainerItemVisibility(index);
                        }, timeout + index * 100);
                    } else {
                        items[index].setVisible(bVisible);
                    }
                };
            })(i)();
        }
    };

    RightFloatingContainer.prototype._animationBouncer = function _animationBouncer (oNotificationListItem) {
        function _animateItem () {
            if (!_animationBouncer._animationQueue.length) {
                _animationBouncer._itemTimeoutId = undefined;
                return;
            }
            const item = _animationBouncer._animationQueue.shift();
            item.addStyleClass("sapUshellRightFloatingContainerItmHeightVisible").addStyleClass("sapUshellRightFloatingContainerItemBounceIn");
            _animationBouncer._itemTimeoutId = setTimeout(_animateItem, 100);
        }

        if (!_animationBouncer._animationQueue) {
            _animationBouncer._animationQueue = [];
        }
        _animationBouncer._animationQueue.push(oNotificationListItem);
        if (_animationBouncer._mainTimeoutId || _animationBouncer._itemTimeoutId) {
            return;
        }
        _animationBouncer._mainTimeoutId = setTimeout(() => {
            _animationBouncer._mainTimeoutId = undefined;
            _animateItem();
        }, 500);
    };

    RightFloatingContainer.prototype.addFloatingContainerItem = function (oNotificationListItem) {
        this.addAggregation("floatingContainerItems", oNotificationListItem);
        oNotificationListItem.addStyleClass("sapContrastPlus");

        if (this.getInsertItemsWithAnimation()) {
            oNotificationListItem.addStyleClass("sapUshellNotificationsListItem");
            // Initially, add items as hidden (with height 0 and 'right' out of the NavContainer) and later, present them gradually with animation.
            oNotificationListItem.addStyleClass("sapUshellRightFloatingContainerItemHidden");

            if (this.getEnableBounceAnimations()) {
                RightFloatingContainer.prototype._animationBouncer(oNotificationListItem);
            } else {
                setTimeout(() => {
                    const items = this.getFloatingContainerItems();
                    // Hide last item if there are already 5 items in the list
                    if (items.length > 5) {
                        const lastItem = items[items.length - 1];
                        lastItem.addStyleClass("sapUshellRightFloatingContainerHideLastItem");
                    }

                    oNotificationListItem.addStyleClass("sapUshellRightFloatingContainerItemBackToViewport").addStyleClass("sapUshellRightFloatingContainerItmHeightVisible");
                }, 500);
            }
        } else if (this.getActAsPreviewContainer()) {
            oNotificationListItem.addStyleClass("sapUshellNonAnimatedNotificationListItem");
        }
        if (this.getHideItemsAfterPresentation()) {
            // Remove it after 5 secounds.
            setTimeout(() => {
                oNotificationListItem.removeStyleClass("sapUshellRightFloatingContainerItemBackToViewport");
            }, 5000);
        }
    };

    return RightFloatingContainer;
});
