// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @private
 */

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Core",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/cepsearchresult/app/util/Edition",
    "sap/ushell/components/cepsearchresult/app/util/resources",
    "sap/m/library",
    "sap/m/Menu",
    "sap/m/MenuItem",
    "sap/ushell/ui/footerbar/AddBookmarkButton",
    "sap/f/GridContainerItemLayoutData",
    "sap/ushell/EventHub",
    "sap/ushell/Container"
], (
    Controller,
    Core,
    JSONModel,
    Edition,
    utilResources,
    mLib,
    Menu,
    MenuItem,
    AddBookmarkButton,
    GridContainerItemLayoutData,
    EventHub,
    Container
) => {
    "use strict";
    const URLHelper = mLib.URLHelper;
    return Controller.extend("sap.ushell.components.cepsearchresult.app.Main", {

        totalCounts: {},

        onInit: function () {
            this._sSearchTerm = "";
            this._iTotalCount = 0;
            this._oTabBar = this.byId("searchCategoriesTabs");
            this._oCountModel = new JSONModel(this.totalCounts);
            this._oTabBar.setModel(this._oCountModel, "counts");
            this.updateTitles();
            this.applyPersonalization();
            this.getView().setVisible(false);
            const oShellRenderer = Container?.getRendererInternal("fiori2");
            if (oShellRenderer && oShellRenderer.getRouter && oShellRenderer.getRouter()) {
                this._oRouter = oShellRenderer.getRouter();
                this._oRouter.getRoute("wzsearch").attachMatched(this.onRouteMatched.bind(this));
            }
            this.changeEdition(Edition.getEditionName());
        },

        getResourceModel: function () {
            return this.getOwnerComponent().getModel("appI18n");
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getResourceBundle();
        },

        onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const oQuery = oArgs["?query"];
            const sQuerySearchTerm = oQuery && oQuery.searchTerm;
            const sQueryCategory = oQuery && oQuery.category;
            this._oEdition.loaded().then(() => {
                if (
                    sQuerySearchTerm !== this.getSearchTerm()
                    && sQueryCategory === this.getCategory()
                ) {
                    this.changeSearchTerm(sQuerySearchTerm);
                } else if (sQueryCategory !== this.getCategory()) {
                    if (sQuerySearchTerm !== this.getSearchTerm()) {
                        this._sSearchTerm = sQuerySearchTerm;
                    }
                    this.changeCategory(sQueryCategory);
                }
                this.getView().setVisible(true);

                // Close FESR Record - consumed in ShellAnalytics
                EventHub.emit("CloseFesrRecord", Date.now());
            });
        },

        changeEdition: function (sEditionName) {
            if (sEditionName === this._sEditionName) {
                return Promise.resolve();
            }
            this._sEditionName = sEditionName;
            this._oEdition = new Edition(this._sEditionName);
            return this._oEdition.loaded().then(() => {
                const oCategory = this._oEdition.getDefaultCategory();
                this._sCategory = oCategory.getKey();
                this.updateTabs();
                // if run without container, the router is not attached and by default all content of category is returned, so we need to update categories
                // otherwise this is done on the router event
                if (!this._oRouter) {
                    this.updateCategories(true);
                }
                this.getView().setVisible(true);
            });
        },

        changeCategory: function (sCategory) {
            this._sCategory = sCategory;
            this.updateTabs();
        },

        changeSearchTerm: function (sSearchTerm) {
            this._sSearchTerm = sSearchTerm;
            this.updateCategories(true);
        },

        getEditionName: function () {
            return this._sEditionName;
        },

        getSearchTerm: function () {
            return this._sSearchTerm;
        },

        getCategory: function () {
            return this._sCategory;
        },

        applyPersonalization: function () {
            // Currently personalization is not saved
        },

        getPersonalization: function (sKey, vDefault) {
            // personalization service missing
            const sValue = localStorage.getItem(`sap.ushell.components.cepsearchresult.app-${sKey}`);
            return Promise.resolve(sValue !== undefined ? sValue : vDefault);
        },

        setPersonalization: function (sKey, vValue) {
            // personalization service missing
            localStorage.setItem(`sap.ushell.components.cepsearchresult.app-${sKey}`, `${vValue}`);
        },

        updateTabs: function () {
            const oTabs = this._oTabBar;
            oTabs.removeAllItems();
            this._oEdition.getAppMenuItems().map((oItem) => {
                oTabs.addItem(oItem);
            });
            oTabs.setModel(utilResources.model, "i18n");
            oTabs.setSelectedKey(this.getCategory());
            oTabs.setVisible(oTabs.getItems().length > 2);
            this.totalCounts = {};
            this._oCountModel.setData(this.totalCounts);
            this.updateTitles();
        },

        updateCategories: function (bReset) {
            const oTabs = this._oTabBar;
            const sKey = oTabs.getSelectedKey();
            oTabs.getItems().map((oItem) => {
                const s = oItem.getKey();
                const oCategory = oItem._getCategoryInstance();
                if (bReset) {
                    this.detachCategory(oCategory);
                    oCategory.resetData();
                }
                if (s === sKey) {
                    this.showCategory(oCategory);
                }
                oCategory.setVisible(s === sKey);
                this.updateResult(oCategory);
            });
        },

        tabSelectionChange: function (oEvent) {
            this.updateCategories(false);
        },

        showCategory: function (oCategory) {
            const oContentCell = this.byId("searchResultContent");
            oContentCell.removeAllItems();
            oCategory.setLayoutData(new GridContainerItemLayoutData({
                columns: 16,
                minRows: 2
            }));
            oContentCell.addItem(oCategory);
        },

        updateTitles: function () {
            let iTotalCount = 0;
            for (const n in this.totalCounts) {
                if (n !== "all") {
                    iTotalCount += this.totalCounts[n];
                }
            }
            this.totalCounts.all = iTotalCount;
            this.updateAppTitle(iTotalCount);
            this._oCountModel.checkUpdate(true, true);
        },

        updateAppTitle: function (iTotalCount) {
            const oTitle = this.byId("titleText");
            if (!oTitle) {
                return;
            }
            let sNumberText = "...";
            if (Number.isInteger(iTotalCount)) {
                sNumberText = `(${iTotalCount})`;
            }
            oTitle.setText(
                this.getResourceBundle().getText(
                    "SEARCHRESULTAPP.HeaderTitle",
                    [this.getSearchTerm() || "", sNumberText]
                )
            );
        },

        updateResult: function (oCategory) {
            this.attachCategory(oCategory);
            oCategory.search(this.getSearchTerm());
        },

        attachCategory: function (oCategory) {
            if (!oCategory._attached) {
                oCategory.attachAfterSearch(this.handleAfterSearch, this);
                oCategory.attachViewAll(this.handleViewAll, this);
                oCategory._attached = true;
            }
        },

        detachCategory: function (oCategory) {
            if (oCategory._attached) {
                oCategory.detachAfterSearch(this.handleAfterSearch, this);
                oCategory.detachViewAll(this.handleViewAll, this);
                oCategory._attached = false;
            }
        },

        viewAll: function (sKey, sView) {
            this._oTabBar.setSelectedKey(sKey);
            const oTabs = this._oTabBar;
            oTabs.getItems().map((oItem) => {
                if (oItem.getKey() === sKey) {
                    oItem._getCategoryInstance().setCurrentView(sView);
                }
            });
            this.updateCategories();
        },

        handleAfterSearch: function (oEvent) {
            this._oCountModel.setProperty(`/${oEvent.getParameter("category")}`, oEvent.getParameter("count"));
            const oCategory = oEvent.getSource();
            oCategory.focusCategory();
            this.updateTitles();
            this.adaptScrollArea();
        },

        handleViewAll: function (oEvent) {
            this.viewAll(oEvent.getParameter("key"), oEvent.getParameter("currentView"));
        },

        adaptScrollArea: function () {
            if (this.getView().getDomRef()) {
                const oContentArea = this.getView().getDomRef().querySelector(".sapUiCEPSRAppScroll");
                oContentArea.style.height = `calc( 100% - ${oContentArea.offsetTop}px )`;
            }
        },

        /**
         * Opens the title menu and creates the menu items once.
         * The "save as tile" menu item is currently disabled.
         * @param {*} oEvent the event from the MenuButton
         */
        openTitleMenu: function (oEvent) {
            if (!this._oTitleMenu) {
                this._oTitleMenu = new Menu({
                    items: [
                        new MenuItem({
                            text: "{appI18n>SEARCHRESULTAPP.TitleMenu.SaveAsTile}",
                            icon: "sap-icon://header",
                            press: this.triggerBookmark.bind(this),
                            visible: false
                        }),
                        new MenuItem({
                            text: "{appI18n>SEARCHRESULTAPP.TitleMenu.Email}",
                            icon: "sap-icon://email",
                            press: this.triggerEmail.bind(this)
                        })
                    ]
                });
                this._oTitleMenu.setModel(this.getResourceModel(), "appI18n");
            }
            this._oTitleMenu.openBy(oEvent.getSource());
        },

        /**
         * Triggers the creation of a bookmark tile to this search term via AddBookmarkButton
         * @see sap/ushell/ui/footerbar/AddBookmarkButton
         */
        triggerBookmark: function () {
            const sSearchTerm = this.getSearchTerm();
            const oBookmark = new AddBookmarkButton({
                title: this.getResourceBundle().getText("SEARCHRESULTAPP.Bookmark.Title", [sSearchTerm]),
                subtitle: "",
                tileIcon: "sap-icon://search",
                keywords: `search,result,${sSearchTerm}`,
                showGroupSelection: false,
                customUrl: document.location.hash
            });
            oBookmark.firePress();
        },

        /**
         * Triggers native mailto: to send the search URL via mail
         */
        triggerEmail: function () {
            URLHelper.triggerEmail(
                "",
                this.getResourceBundle().getText("SEARCHRESULTAPP.EMail.Subject", [this.getSearchTerm()]),
                document.location.href);
        },

        onExit: function () {
            const oTabs = this._oTabBar;
            oTabs.getItems().map((oItem) => {
                const oCategory = oItem._getCategoryInstance();
                this.detachCategory(oCategory);
                oCategory.resetData();
            });
        }
    });
});
