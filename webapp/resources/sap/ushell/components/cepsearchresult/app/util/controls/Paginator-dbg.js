// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/ToggleButton",
    "sap/ui/core/delegate/ItemNavigation",
    "sap/ushell/components/cepsearchresult/app/util/appendStyleVars",
    "sap/ushell/components/cepsearchresult/app/util/resources",
    "sap/ui/dom/includeStylesheet"
], (
    Control,
    Button,
    ItemNavigation,
    appendStyleVars,
    utilResources,
    includeStylesheet
) => {
    "use strict";

    // Append the style vars for css
    appendStyleVars([
        "sapUiBaseText",
        "sapUiLinkActiveColor"
    ]);

    // Include the css for the control once
    includeStylesheet(sap.ui.require.toUrl("sap/ushell/components/cepsearchresult/app/util/controls/Paginator.css"));

    /**
     * Paginator for the Search Result List
     *
     * @private
     */ // eslint-disable-next-line max-len
    const Paginator = Control.extend("sap.ushell.components.cepsearchresult.app.util.controls.Paginator", /** @lends sap.ushell.components.cepsearchresult.app.cards.serchresult.controls.Paginator.prototype */ {
        metadata: {
            properties: {
                pageSize: {
                    type: "int",
                    defaultValue: 5
                },
                count: {
                    type: "int",
                    defaultValue: 0
                },
                currentPage: {
                    type: "int",
                    defaultValue: 1
                },
                segmentSize: {
                    type: "int",
                    defaultValue: 7
                }

            },
            aggregations: {
                _buttons: {
                    type: "sap.m.Button",
                    multiple: true,
                    hidden: true
                }
            },
            events: {
                selectPage: {}
            }
        },
        renderer: function (rm, oControl) {
            rm.openStart("nav", oControl);
            rm.attr("tabIndex", "0");
            rm.class("sapUiCEPSearchPag");
            rm.attr("role", "navigation");
            rm.attr("aria-label", utilResources.bundle.getText("CATEGORY.Views.PaginationTooltip"));
            rm.openEnd();
            const aButtons = oControl.getAggregation("_buttons") || [];
            for (let i = 0; i < aButtons.length; i++) {
                rm.renderControl(aButtons[i]);
            }
            rm.close("nav");
        }
    });

    Paginator.prototype._setCurrentPageWithEvent = function (iValue) {
        this.setCurrentPage(iValue);
        const iPageIndex = iValue - 1;
        const iPageSize = this.getPageSize();
        this.fireSelectPage({
            page: iValue,
            startIndex: iPageIndex * iPageSize,
            pageSize: iPageSize,
            endIndex: (iPageIndex + 1) * iPageSize - 1
        });
    };

    Paginator.prototype.getPageCount = function () {
        const iPageSize = this.getPageSize();
        const iCount = this.getCount();
        return Math.ceil(iCount / iPageSize);
    };

    // Adds the buttons to the paginator. Currently this is
    Paginator.prototype._addButtons = function () {
        // remove the existing buttons
        this.destroyAggregation("_buttons");

        // get some vars to avoid getter calls for all calculations
        const iPages = this.getPageCount();
        const iCurrentPage = Math.min(this.getCurrentPage(), iPages);
        const iSegmentSize = this.getSegmentSize();
        let iCurrentSegmentStart = Math.max(iCurrentPage - Math.floor(iSegmentSize / 2), 1);
        const iCurrentSegmentEnd = Math.min(iCurrentSegmentStart + iSegmentSize - 1, iPages);
        if (iCurrentSegmentEnd === iPages) {
            iCurrentSegmentStart = Math.max(iPages - iSegmentSize + 1, 1);
        }

        // left arrow
        const oLeftArrow = new Button({
            icon: "sap-icon://navigation-left-arrow",
            enabled: iCurrentPage > 1,
            visible: iPages > 1,
            tooltip: utilResources.bundle.getText(
                "CATEGORY.Views.PageTooltip",
                [ Math.max(iCurrentPage - 1, 1), iPages ]
            ),
            press: function () {
                this._setCurrentPageWithEvent(iCurrentPage - 1);
            }.bind(this)
        });
        this.addAggregation("_buttons", oLeftArrow);

        // first page
        if (iCurrentSegmentStart > 1) {
            const oFirstPage = new Button({
                text: "1",
                enabled: iCurrentPage > 1,
                visible: iCurrentPage > 1,
                tooltip: utilResources.bundle.getText("CATEGORY.Views.PageTooltip", [1, iPages]),
                press: function () {
                    this._setCurrentPageWithEvent(1);
                }.bind(this)
            });
            this.addAggregation("_buttons", oFirstPage);
            const oPrevSegmentPage = new Button({
                text: iCurrentSegmentStart === 3 ? 2 : "...",
                tooltip: utilResources.bundle.getText("CATEGORY.Views.PageTooltip", [iCurrentSegmentStart - 1, iPages]),
                enabled: iCurrentPage >= iCurrentSegmentStart,
                visible: iPages > iSegmentSize && iCurrentSegmentStart > 2,
                press: function () {
                    this._setCurrentPageWithEvent(iCurrentSegmentStart - 1);
                }.bind(this)
            });
            this.addAggregation("_buttons", oPrevSegmentPage);
        }
        // numbered paging buttons, starts with 1
        for (let i = iCurrentSegmentStart; i <= iCurrentSegmentEnd; i++) {
            const oButton = new Button({
                text: `${i}`,
                pressed: i === iCurrentPage,
                tooltip: utilResources.bundle.getText("CATEGORY.Views.PageTooltip", [i, iPages]),
                enabled: true,
                visible: iPages > 1,
                press: (function (oPaginator, iPage) {
                    return function (oEvt) {
                        if (iPage === oPaginator.getCurrentPage()) {
                            oEvt.getSource().setPressed(true);
                            return;
                        }
                        oPaginator._setCurrentPageWithEvent(iPage);
                    };
                })(this, i)
            });
            oButton.data("page", i.toString(), true);
            oButton.addStyleClass("sapUiCEPSearchPagNumber");
            this.addAggregation("_buttons", oButton);
        }
        if (iCurrentSegmentEnd < iPages) {
            const oNextSegmentPage = new Button({
                text: iCurrentSegmentEnd === iPages - 2 ? iPages - 1 : "...",
                enabled: true,
                tooltip: utilResources.bundle.getText("CATEGORY.Views.PageTooltip", [iCurrentSegmentEnd + 1, iPages]),
                visible: iCurrentSegmentEnd < iPages - 1,
                press: function () {
                    this._setCurrentPageWithEvent(iCurrentSegmentEnd + 1);
                }.bind(this)
            });
            this.addAggregation("_buttons", oNextSegmentPage);
            const oLastPage = new Button({
                text: `${iPages}`,
                enabled: true,
                tooltip: utilResources.bundle.getText("CATEGORY.Views.PageTooltip", [iPages, iPages]),
                visible: iPages > 1,
                press: function () {
                    this._setCurrentPageWithEvent(iPages);
                }.bind(this)
            });
            this.addAggregation("_buttons", oLastPage);
        }

        // right arrow
        const oRightArrow = new Button({
            icon: "sap-icon://navigation-right-arrow",
            enabled: iCurrentPage < iPages,
            tooltip: utilResources.bundle.getText(
                "CATEGORY.Views.PageTooltip",
                [ Math.min(iCurrentPage + 1, iPages), iPages ]
            ),
            visible: iPages > 1,
            press: function () {
                this._setCurrentPageWithEvent(iCurrentPage + 1);
            }.bind(this)
        });
        this.addAggregation("_buttons", oRightArrow);
    };

    Paginator.prototype._removeKeyboardNavigation = function () {
        if (this._oItemNavigation) {
            this.removeDelegate(this._oItemNavigation);
            this._oItemNavigation.destroy();
            this._oItemNavigation = null;
        }
    };

    Paginator.prototype._initKeyboardNavigation = function () {
    // remove old
        this._removeKeyboardNavigation();

        // create new
        this._oItemNavigation = new ItemNavigation();

        const aNavigationItems = Array.from(this.getDomRef().querySelectorAll(".sapMBtn"));
        this._oItemNavigation
            .setCycling(false)
            .setTableMode(true, true)
            .setColumns(this.getAggregation("_buttons").length)
            .setRootDomRef(this.getDomRef())
            .setPageSize(this.getPageSize())
            .setItemDomRefs(aNavigationItems);

        this.addDelegate(this._oItemNavigation);
    };

    Paginator.prototype.focusPage = function (iPage) {
        const currentButton = this.getDomRef().querySelector(`.sapMBtn[data-page='${iPage}']`);
        if (currentButton) {
            currentButton.setAttribute("aria-current", "page");
            currentButton.focus();
        }
    };

    // Before rendering handing
    Paginator.prototype.onBeforeRendering = function () {
        // add the buttons
        this._addButtons();
    };

    // After rendering handing
    Paginator.prototype.onAfterRendering = function () {
        this._initKeyboardNavigation();
    };

    // Destroy
    Paginator.prototype.destroy = function () {
        this._removeKeyboardNavigation();
        this.destroyAggregation("_buttons");
    };

    return Paginator;
});
