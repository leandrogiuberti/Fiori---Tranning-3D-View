// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file AppSearch controller for AppSearch view
 * @version 1.141.0
 */
sap.ui.define([
    "./ContentFinderDialog.controller",
    "../model/formatter",
    "sap/ushell/Config",
    "sap/base/Log",
    "sap/m/library",
    "sap/ushell/utils/WindowUtils",
    "sap/ui/thirdparty/hasher",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/f/library"
], (
    ContentFinderController,
    formatter,
    Config,
    Log,
    mLibrary,
    WindowUtils,
    hasher,
    Filter,
    FilterOperator,
    fLibrary
) => {
    "use strict";

    const LayoutType = fLibrary.LayoutType;
    const ListType = mLibrary.ListType;

    /**
     * @alias sap.ushell.components.contentFinder.controller.AppSearch
     * @class
     * @classdesc Controller of the AppSearch view.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     *
     * @extends sap.ui.core.mvc.Controller
     *
     * @since 1.113.0
     * @private
     */

    return ContentFinderController.extend("sap.ushell.components.contentFinder.controller.AppSearch", /** @lends sap.ushell.components.contentFinder.controller.AppSearch.prototype */{
        /**
         * The contentFinder formatters.
         *
         * @since 1.113.0
         * @private
         */
        formatter: formatter,

        /**
         * The init function called after the view is initialized.
         *
         * @since 1.113.0
         * @private
         */
        onInit: function () {
            this.oComponent = this.getOwnerComponent();
            this.oUiModel = this.oComponent.getUiModel();
            this.oDataModel = this.oComponent.getDataModel();
            this.oSelectionModel = this.oComponent.getSelectionModel();

            this.byId("contentFinderAppSearchFlexibleColumnLayout").attachStateChange(
                this.onFlexibleColumnLayoutStateChange.bind(this)
            );

            // Ensure the "ui" model is present, even if the view is not part of the control tree yet (dialog).
            this.getView().setModel(this.oUiModel, "ui");

            this._initializeVisualizationsFilter();
        },

        /**
         * Triggered when the 'FlexibleColumnLayout' state changes.
         *
         * Updates only the maxColumnsCount property in the 'ui' model.
         *
         * @param {sap.ui.base.Event} oEvent The 'stateChange' event.
         *
         * @since 1.129.0
         * @private
         */
        onFlexibleColumnLayoutStateChange: function (oEvent) {
            // This value is required to calculate the correct layout type.
            // The calculation is done in the method updateSidebarStatus of the component which
            // is triggered via a binding on the 'maxColumnsCount' property.
            this.oUiModel.setProperty("/maxColumnsCount", oEvent.getParameter("maxColumnsCount"));
        },

        /**
         * Triggered when the visualizations filter is changed.
         *
         * When the filter was changed, all visualizations are reset and the new filter is applied.
         *
         * @since 1.132.0
         * @private
         */
        onSelectVisualizationsFilter: function () {
            this.oComponent.resetVisualizations();
            this.oComponent.queryVisualizations(
                0,
                this.oUiModel.getProperty("/visualizations/searchTerm"),
                this.oUiModel.getProperty("/categoryTree/selectedId")
            );
        },

        /**
         * Triggered when the search is executed. Fires the query to get visualizations with the search term.
         *
         * - Empties all visualizations.
         * - Leaves the selection view.
         *
         * @param {sap.ui.base.Event} oEvent The 'search' event.
         *
         * @since 1.115.0
         * @private
         */
        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query") || "";
            this.sCurrentSearchTerm = sQuery;
            this.oComponent.resetVisualizations();
            this.toggleSelectionView(false);

            const sCategoryId = this.oUiModel.getProperty("/categoryTree/selectedId");
            this.oComponent.queryVisualizations(0, sQuery, sCategoryId);
            this.oUiModel.setProperty("/visualizations/searchTerm", sQuery);
        },

        /**
         * Triggered to search the catalog.
         *
         * @param {string} sQuery The search query.
         * @param {sap.ui.model.Binding} oBinding The binding to apply the filter to.
         *
         * @since 1.135.0
         * @private
         */
        _onCatalogSearch: function (sQuery, oBinding) {
            const oTitleFilter = new Filter("title", FilterOperator.Contains, sQuery);
            const oProviderIdFilter = new Filter("contentProviderId", FilterOperator.Contains, sQuery);
            const oProviderLabelFilter = new Filter("contentProviderLabel", FilterOperator.Contains, sQuery);
            const oFilter = new Filter({
                filters: [
                    oTitleFilter,
                    oProviderIdFilter,
                    oProviderLabelFilter
                ],
                and: false
            });

            oBinding.filter(oFilter);
        },

        /**
         * Triggered to search the catalog from the Tree.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         *
         * @since 1.135.0
         * @private
         */
        onCatalogTreeSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue") || "";
            const oBinding = this.byId("CategoryTreeFragment--CategoryTree").getBinding();
            this._onCatalogSearch(sQuery, oBinding);
        },

        /**
         * Triggered to search the catalog from the TreeTable.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         *
         * @since 1.135.0
         * @private
         */
        onCatalogTreeTableSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue") || "";
            const oBinding = this.byId("CategoryTreeTableFragment--CategoryTreeTable").getBinding("rows");
            this._onCatalogSearch(sQuery, oBinding);
        },

        /**
         * Event handler which is called when an app box was selected.
         *
         * Updates the selection model when a app box is selected.
         * The selected items are added with a handler in the dialog.
         *
         * @param {sap.ui.base.Event} oEvent The 'selected' event.
         *
         * @since 1.121.0
         * @private
         */
        onAppBoxSelected: function (oEvent) {
            // If the dialog is in single select mode, add the selected item and close the dialog.
            if (oEvent.getSource().getMode() === mLibrary.ListMode.SingleSelectMaster) {
                const oVizData = oEvent.getParameter("listItem").getBindingContext("data").getObject();
                this.oComponent.addVisualizations([oVizData]);
            } else {
                // If the dialog is in multi select mode, update the selection model.
                const bSelected = oEvent.getParameter("selected");
                const aListItemsData = oEvent.getParameter("listItems").map((oListItem) => {
                    const oListItemBindingContext = oListItem.getBindingContext("data");
                    const aListItemBindingPathParts = oListItemBindingContext.getPath().split("/");
                    const iListItemIndex = parseInt(aListItemBindingPathParts[aListItemBindingPathParts.length - 1], 10);
                    return {
                        ...oListItemBindingContext.getObject(),
                        index: iListItemIndex
                    };
                });
                const aSelectedItems = this.oSelectionModel.getProperty("/visualizations/items");

                let aNewSelectedItems;
                if (bSelected) {
                    // If something was selected, add the selected items to the existing selection.
                    aNewSelectedItems = [...aSelectedItems, ...aListItemsData];
                } else {
                    // If something was deselected, remove the deselected items from the existing selection.
                    aNewSelectedItems = aSelectedItems.filter((oSelectedItem) => {
                        return !aListItemsData.some((oListItem) => {
                            return oListItem.id === oSelectedItem.id;
                        });
                    });
                }

                // Sort the selected items by their index to keep the order in the selection view.
                // If the items are not sorted, it would be in the order as the user selected them.
                aNewSelectedItems.sort((a, b) => a.index < b.index ? -1 : 1);
                this.oSelectionModel.setProperty("/visualizations/items", aNewSelectedItems);

                // If there are no AppBoxes left, switch back to the default view to avoid showing the "no data" message.
                if (!this.oSelectionModel.getProperty("/visualizations/items/length")) {
                    this.toggleSelectionView(false);
                }
            }
        },

        /**
         * Fired when a data update on the list was started.
         *
         * Queries the new list of visualizations.
         *
         * @param {sap.ui.base.Event} oEvent The 'updateStarted' event.
         *
         * @since 1.115.0
         * @private
         */
        onUpdateStarted: function (oEvent) {
            if (oEvent.getParameter("reason") === "Growing") {
                const sSearchTerm = this.oUiModel.getProperty("/visualizations/searchTerm");
                const iSkip = oEvent.getParameter("actual");
                const sCategoryId = this.oUiModel.getProperty("/categoryTree/selectedId");
                this.oComponent.queryVisualizations(iSkip, sSearchTerm, sCategoryId);
            }
        },

        /**
         * EventHandler which is called when the "show selected" button is pressed
         * to show only selected apps.
         *
         * @param {sap.ui.base.Event} oEvent Button Press Event object.
         *
         * @since 1.113.0
         * @private
         */
        onShowSelectedPressed: function (oEvent) {
            const bPressed = oEvent.getParameter("pressed");
            this.toggleSelectionView(bPressed);
        },

        /**
         * Toggles the between grid and list view.
         *
         * @param {sap.ui.base.Event} oEvent Button Press Event object.
         *
         * @since 1.129.0
         * @private
         */
        onViewSelectionChange: function (oEvent) {
            const sKey = oEvent.getSource().getSelectedKey();
            const bToggleList = sKey === "list";
            this.oUiModel.setProperty("/visualizations/listView", bToggleList);
            this.toggleSelectionView(this.oUiModel.getProperty("/visualizations/showSelectedPressed"));
        },

        /**
         * Toggles the view between results and selection.
         *
         * @param {boolean} bActive Flag to activate the selection view.
         *
         * @since 1.121.0
         * @private
         */
        toggleSelectionView: function (bActive) {
            const sSearchTerm = bActive ? "" : this.sCurrentSearchTerm;
            this.oUiModel.setProperty("/visualizations/searchFieldValue", sSearchTerm);
            this.oUiModel.setProperty("/visualizations/showSelectedPressed", bActive);
            this.oComponent.useSelectionModel(bActive);
        },

        /**
         * Resets all data related to the visualizations search field.
         *
         * @since 1.132.0
         * @private
         */
        resetVisualizationsSearchField: function () {
            this.oUiModel.setProperty("/visualizations/searchTerm", "");
            this.oUiModel.setProperty("/visualizations/searchFieldValue", "");
            this.sCurrentSearchTerm = "";
        },

        /**
         * EventHandler which is called when a category tree item or tree table item is pressed.
         *
         * @param {sap.ui.model.Context} oContext The binding context of the pressed item.
         * @param {object} oItem The data object of the pressed item.
         *
         * @since 1.135.0
         * @private
         */
        _onCategoryItemPressed: function (oContext, oItem) {
            this.oComponent.updateSidebarStatus(LayoutType.TwoColumnsMidExpanded);
            this.getOwnerComponent().resetVisualizations();
            this.resetVisualizationsSearchField();
            this.toggleSelectionView(false);
            this.oUiModel.setProperty("/categoryTree/selectedId", oItem.id);
            this.oUiModel.setProperty("/categoryTree/selectedTitle", oItem.title);
            this.getOwnerComponent().queryVisualizations(0, "" /* searchTerm */, oItem.id);

            // Check if pressed item is a catalog (root node)
            const sPath = oContext.getPath();
            this.oUiModel.setProperty("/categoryTree/itemPressed", sPath.includes("nodes"));

            // Get data from the category tree item or from its parent
            let aAllowedFilters = oItem.allowedFilters;
            let bFilterIsTitle = oItem.filterIsTitle;
            if (!aAllowedFilters && sPath.includes("/nodes/")) {
                const aPathSegments = oContext.getPath().split("/");
                aPathSegments.splice(-2); // remove segments of the current child path
                const sParentPath = aPathSegments.join("/");
                aAllowedFilters = oContext.getModel().getProperty(`${sParentPath}/allowedFilters`);
                bFilterIsTitle = oContext.getModel().getProperty(`${sParentPath}/filterIsTitle`);
            }

            this.oUiModel.setProperty("/visualizations/filters/displayed", aAllowedFilters);
            this.oUiModel.setProperty("/visualizations/filters/filterIsTitle", !!bFilterIsTitle);
        },

        /**
         * EventHandler which is called when a category tree item is pressed.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         *
         * @since 1.135.0
         * @private
         */
        onCategoryTreeItemPressed: function (oEvent) {
            const oContext = oEvent.getParameter("listItem").getBindingContext();
            const oItem = oContext.getObject();

            // Ignore inactive items
            if (oEvent.getParameter("listItem").getType() === ListType.Inactive) {
                return;
            }

            this._onCategoryItemPressed(oContext, oItem);
        },

        /**
         * EventHandler which is called when a category tree table item is pressed.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         *
         * @since 1.135.0
         * @private
         */
        onCategoryTreeTableItemPressed: function (oEvent) {
            const oContext = oEvent.getParameter("rowContext");
            if (!oContext && oEvent.getParameter("rowIndex") === -1) {
                // If the event is triggered by the root, we need to collapse all items
                oEvent.getSource().collapseAll();
                return;
            }
            if (!oContext && oEvent.getParameter("rowIndex") > -1) {
                // If the event is not triggered by a leaf, we need to collapse the specific item
                const index = oEvent.getParameter("rowIndex");
                oEvent.getSource().collapse(index);
                return;
            }

            const oItem = oContext.getObject();

            // Ignore inactive items
            if (oItem.inactive) {
                return;
            }

            this._onCategoryItemPressed(oContext, oItem);
        },

        /**
         * EventHandler which is called when the category tree is updated.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         *
         * @private
         */
        onCategoryTreeUpdateFinished: function (oEvent) {
            const oTree = oEvent.getSource();
            /** The <code>checkUpdate</code> implementation of the <code>ClientTreeBinding</code>
             * does not check for actual changes but always fires an update whenever a model property changes.
             * Hence, we check if there is already a selected item and only set an initial selection if there is none.
            */
            if (!oTree.getSelectedItem()) {
                const aItems = oTree.getItems();
                const oFirstItem = aItems[0];
                if (oFirstItem) {
                    oTree.setSelectedItem(oFirstItem);
                    // set the initial selectedCategory. This is expected by visualizationFilterApplied event
                    // handlers and used to show the title for the visualizations GridList
                    const oData = oFirstItem.getBindingContext().getObject() || {};
                    this.oUiModel.setProperty("/categoryTree/selectedId", oData.id);
                    this.oUiModel.setProperty("/categoryTree/selectedTitle", oData.title);
                }
            }
        },

        /**
         * Updates the layout of the FlexibleColumnLayout based on the current layout and the maximum number of columns,
         * which causes the layout of the 'FlexibleColumnLayout' to change into it's new desired state.
         *
         * OneColumn: Only the SidePanel is shown.
         * MidColumnFullScreen: Only the visualizations are shown.
         * TwoColumnsMidExpanded: The SidePanel is shown and the other columns with the visualizations are expanded.
         *
         * For maxColumnsCount, possible values are:
         * 3 for browser size of 1280px or more
         * 2 for browser size between 960px and 1280px
         * 1 for browser size less than 960px
         *
         * @since 1.129.0
         * @private
         */
        onCategoryTreeTogglePressed: function () {
            const sCurrentLayoutType = this.oUiModel.getProperty("/layoutType");
            const iMaxColumnsCount = this.oUiModel.getProperty("/maxColumnsCount");
            let sNewLayoutType;

            // Layout is currently in FullScreen, no side panel is shown.
            // Toggle to TwoColumnsMidExpanded or OneColumn to show the side panel.
            if (sCurrentLayoutType === LayoutType.MidColumnFullScreen) {
                // If enough space for two columns show the side panel with TwoColumnsMidExpanded,
                // otherwise show only the SidePanel in OneColumn.
                if (iMaxColumnsCount > 1) {
                    sNewLayoutType = LayoutType.TwoColumnsMidExpanded;
                } else {
                    sNewLayoutType = LayoutType.OneColumn;
                }
            // Layout is currently TwoColumnsMidExpanded and shows a side panel, but there is no space available.
            // May happen when the screen is resized to a smaller width while the layout is in expanded mode.
            } else if (sCurrentLayoutType === LayoutType.TwoColumnsMidExpanded && iMaxColumnsCount === 1) {
                sNewLayoutType = LayoutType.OneColumn;
            // If there is enough space available, hide the side panel.
            } else if (sCurrentLayoutType === LayoutType.TwoColumnsMidExpanded) {
                sNewLayoutType = LayoutType.MidColumnFullScreen;
            // Default to TwoColumnsMidExpanded layout.
            } else {
                sNewLayoutType = LayoutType.TwoColumnsMidExpanded;
            }

            this.oComponent.updateSidebarStatus(sNewLayoutType);
        },

        /**
         * Triggered when the 'Launch Application' button is pressed.
         *
         * @param {sap.ui.base.Event} oEvent The event.
         *
         * @private
         */
        onLaunchApplicationPressed: function (oEvent) {
            const sSelectedTileLaunchUrl = oEvent.getSource().getBindingContext("data").getObject().launchUrl;
            if (!sSelectedTileLaunchUrl) {
                Log.info("AppBox url property is not set.", null, "sap.ushell.components.Catalog.controller");
                return;
            }

            if (sSelectedTileLaunchUrl.indexOf("#") === 0) {
                hasher.setHash(sSelectedTileLaunchUrl);
            } else {
                WindowUtils.openURL(sSelectedTileLaunchUrl, "_blank");
            }
        },

        /**
         * Triggered when one of the bindings related to the visualizations filters change any data.
         *
         * The bindings are created in the _initializeVisualizationsFilter method.
         *
         * @since 1.132.0
         * @private
         */
        onUpdateVisualizationsFilterData: function () {
            this.iVisualizationsFilterDataTimeout = this.iVisualizationsFilterDataTimeout || setTimeout(() => {
                this._updateVisualizationsFilter();
                this.iVisualizationsFilterDataTimeout = null;
            }, 0);
        },

        /**
         * Initializes the visualizations filter bindings.
         *
         * Observers all the bindings which are related to the visualizations filters.
         * If data of the bindings change, the visualizations filter is updated.
         *
         * @since 1.132.0
         * @private
         */
        _initializeVisualizationsFilter: function () {
            this.oVisualizationsFilterInitialBinding = this.oUiModel.bindProperty("/visualizations/filters/displayed");
            this.oVisualizationsFilterAvailableBinding = this.oUiModel.bindProperty("/visualizations/filters/available");

            this.oVisualizationsFilterInitialBinding.attachChange(this.onUpdateVisualizationsFilterData, this);
            this.oVisualizationsFilterAvailableBinding.attachChange(this.onUpdateVisualizationsFilterData, this);

            this._updateVisualizationsFilter();
        },

        /**
         * Initializes the visualizations filter.
         *
         * Takes the initial filter values provided from the ComponentData and creates a filter
         * for the "items" binding on the segmented button control.
         *
         * The "initial" visualizations filters are provided by the ComponentData to show the AppSearch
         * area while the CategoryTree is still loading. The CategoryTree filter data must match the
         * initial visualizations filter data in order and content.
         *
         * @since 1.132.0
         * @private
         */
        _updateVisualizationsFilter: function () {
            this.byId("selectVisualizationsFilter")?.getBinding("items")?.filter(
                new Filter((this.oUiModel.getProperty("/visualizations/filters/displayed") || []).map((sKey) => {
                    return new Filter("key", FilterOperator.EQ, sKey);
                }))
            );
        }
    });
});
