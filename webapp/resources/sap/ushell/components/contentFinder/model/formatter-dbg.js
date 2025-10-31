// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/m/library",
    "sap/ui/core/message/MessageType"
], (
    Localization,
    mLibrary,
    MessageType
) => {
    "use strict";

    const IllustratedMessageType = mLibrary.IllustratedMessageType;
    const ListMode = mLibrary.ListMode;

    return {
        /**
         * Formatter for the visualizations list mode.
         *
         * @param {boolean} bEnablePersonalization Flag indicating if personalization is enabled.
         * @param {string} sSelectedVisualizationsFilter The selected visualization filter.
         * @returns {sap/ui/core/message/MessageType} The message type.
         *
         * @since 1.132.0
         * @private
         */
        formatVisualizationsListMode: function (bEnablePersonalization, sSelectedVisualizationsFilter) {
            if (bEnablePersonalization) {
                // Temporary, until the page builder can handle multiple selected visualizations for all types
                if (sSelectedVisualizationsFilter === "tiles") {
                    return ListMode.MultiSelect;
                }
                return ListMode.SingleSelectMaster;
            }
            return ListMode.None;
        },

        /**
         * Returns true if the visualization is already added.
         *
         * @param {string} sId The id of the visualization.
         * @param {object[]} aVisualizations The visualizations. This parameter is required to trigger the binding update! Do not remove it!
         * @returns {sap.ui.core.message.MessageType} The message type.
         */
        formatIsVisualizationAdded: function (sId, aVisualizations) {
            if (Array.isArray(aVisualizations)) {
                return this.getOwnerComponent().oRestrictedVisualizationsMap.has(sId) ? MessageType.Information : MessageType.None;
            }
            return MessageType.None;
        },

        /**
         * Formatter for the selected state of an AppBox.
         *
         * Returns true if the given vizId is found in the array of visualizations.
         *
         * @param {string} sId The id of the visualization.
         * @param {object[]} aVisualizations Array of selected visualizations.
         * @returns {boolean} True if the tile with id was found in the array
         *
         * @since 1.121
         * @private
         */
        formatVisualizationSelected: function (sId, aVisualizations) {
            return aVisualizations.some((oViz) => oViz.id === sId);
        },

        /**
         * Formatter to set the title of AppSearch list.
         *
         * @param {string} sVisualizationsFiltersSelected Selected visualization filter.
         * @param {object[]} aVisualizationsFiltersAvailable Available visualization filters.
         * @param {boolean} bFilterIsTitle Flag indicating if the filter should be used as the title.
         * @param {string} sSearchTerm GridList search field query.
         * @param {string} sCategoryTitle Selected category title.
         * @param {boolean} bShowSelectedVisualizationsPressed Show All Selected Button pressed property.
         * @param {int} iSelectedAppCount Count of all the Selected Apps.
         * @param {object[]} aVisualizations All available visualizations.
         * @param {int} iTotalCount Amount of filtered Viz.
         * @returns {string} The GridList Title text.

         * @since 1.113.0
         * @private
         */
        formatAppSearchTitle: function (
            sVisualizationsFiltersSelected,
            aVisualizationsFiltersAvailable,
            bFilterIsTitle,
            sSearchTerm,
            sCategoryTitle,
            bShowSelectedVisualizationsPressed,
            iSelectedAppCount,
            aVisualizations,
            iTotalCount
        ) {
            const oResourceBundle = this.getOwnerComponent().getResourceBundle();
            const bItemsAvailable = !!aVisualizations.length;
            const oSelectedFilter = aVisualizationsFiltersAvailable.find((oAvailableFilter) => {
                return oAvailableFilter.key === sVisualizationsFiltersSelected;
            });
            let sResultText;

            // Only the selected visualizations are shown
            if (bShowSelectedVisualizationsPressed && iSelectedAppCount) {
                sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.SelectedApp", [iSelectedAppCount]);
                // All Items are shown and visualizations are available
            } else if (bItemsAvailable) {
                // 1. Search has priority over category selection title
                if (sSearchTerm) {
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.SearchResult", [sSearchTerm, iTotalCount]);
                    // 2. With category selection title or selected filter title
                } else if (sCategoryTitle || oSelectedFilter?.title) {
                    const sTitle = bFilterIsTitle ? oSelectedFilter?.title || sCategoryTitle : sCategoryTitle;
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.AllFromCategory", [sTitle, iTotalCount]);
                    // Fallback to all apps
                } else {
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.AllApps", [iTotalCount]);
                }
            } else if (sCategoryTitle || oSelectedFilter?.title) {
                if (bFilterIsTitle && oSelectedFilter?.title) {
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.NoVisualization", [oSelectedFilter?.title]);
                } else {
                    sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.AllFromCategory", [sCategoryTitle, iTotalCount]);
                }
                // Fallback to no apps
            } else {
                sResultText = oResourceBundle.getText("ContentFinder.AppSearch.Title.NoApps");
            }

            return sResultText;
        },

        /**
         * Formats the category description to concatenate content provider id and content provider label
         *
         * @param {string} sId The content provider id of the category.
         * @param {string} sLabel The content provider label of the category. This is optional.
         * @returns {string} Returns the concatenated id and label or just the id.
         *
         * @since 1.127.0
         * @private
         */
        formatCategoryDescription: function (sId, sLabel) {
            const bRtl = Localization.getRTL();

            if (!sLabel) {
                return sId;
            }

            if (bRtl) {
                return `${sLabel} • ${sId}`;
            }

            return `${sId} • ${sLabel}`;
        },

        /**
         * Checks if the category is visible.
         *
         * @param {string} sId The content provider id of the category.
         * @param {string} sLabel The content provider label of the category.
         * @returns {boolean} Returns the whether to display the category.
         *
         * @since 1.136.0
         * @private
         */
        isCategoryVisible: function (sId, sLabel) {
            return !!(sId || sLabel);
        },

        /**
         * Formats the title of the "noData" message title if no visualizations are available in the AppSearch area.
         *
         * Fallback to default noData title if undefined is returned.
         *
         * @param {boolean} bTreeItemPressed Flag indicating if a tree item is pressed.
         * @param {string} sSearchTerm The search term in the AppSearch area.
         * @param {string} sNoItemsInCatalogTitle The desired title of the "noData" message.
         * @param {?string} sOverrideTitle custom title - overrides
         * @returns {string|undefined} The title of the "noData" message or undefined for default fallback message.
         *
         * @private
         */
        formatVisualizationsNoDataIllustratedMessageTitle: function (bTreeItemPressed, sSearchTerm, sNoItemsInCatalogTitle, sOverrideTitle) {
            if (typeof sOverrideTitle === "string") {
                return sOverrideTitle;
            }

            // If search term is provided, show the default noData description
            if (sSearchTerm) {
                return;
            }

            // If no search term is provided and a tree item is pressed, show the noItemsInCatalogTitle
            if (bTreeItemPressed && sNoItemsInCatalogTitle) {
                return sNoItemsInCatalogTitle;
            }

            const oResourceBundle = this.getOwnerComponent().getResourceBundle();
            return oResourceBundle.getText("ContentFinder.AppSearch.IllustratedMessage.Tiles.NoData.Title");
        },

        /**
         * Formats the title of the "noData" message description if no visualizations are available in the AppSearch area.
         *
         * Fallback to default noData description if undefined is returned.
         *
         * @param {boolean} bTreeItemPressed Flag indicating if a tree item is pressed.
         * @param {string} sSearchTerm The search term in the AppSearch area.
         * @param {string} sNoItemsInCatalogDescription The desired title of the "noData" message.
         * @param {?string} sOverrideDescription override description
         * @returns {string|undefined} The title of the "noData" message or undefined for default fallback message.
         *
         * @private
         */
        formatVisualizationsNoDataIllustratedMessageDescription: function (
            bTreeItemPressed,
            sSearchTerm,
            sNoItemsInCatalogDescription,
            sOverrideDescription
        ) {
            // there was an error on request (initial or search and/or on catalog selected)
            if (typeof sOverrideDescription === "string") {
                return sOverrideDescription;
            }

            // If search term is provided, show the default noData description
            if (sSearchTerm) {
                return;
            }

            const oResourceBundle = this.getOwnerComponent().getResourceBundle();

            // If tree item is pressed, show provided description when available
            if (bTreeItemPressed) {
                if (sNoItemsInCatalogDescription) {
                    return sNoItemsInCatalogDescription;
                }
                return oResourceBundle.getText("ContentFinder.AppSearch.IllustratedMessage.NoItems.InCatalog.Description");
            }

            return oResourceBundle.getText("ContentFinder.AppSearch.IllustratedMessage.Tiles.NoData.Details");
        },

        /**
         * Formats the type of the "noData" message illustration if no visualizations are available in the AppSearch area.
         *
         * @param {string} sSearchTerm The search term in the AppSearch area.
         * @param {(sap.m.IllustratedMessageType|undefined|null)} sOverrideType override the message type
         * @returns {sap.m.IllustratedMessageType} The type of the "noData" message illustration.
         *
         * @private
         */
        formatVisualizationsNoDataIllustratedMessageType: function (sSearchTerm, sOverrideType) {
            // there was an error on request (initial or search and/or on catalog selected)
            if (sOverrideType) {
                return sOverrideType;
            }
            if (sSearchTerm) {
                return IllustratedMessageType.NoSearchResults;
            }
            return IllustratedMessageType.NoData;
        },

        /**
         * Formats the accessibility description for the custom list item.
         *
         * This will be part of the string read out by the screen reader.
         *
         * @param {string} sTitle The app title.
         * @param {string} sSubtitle The app subtitle.
         * @param {string} sVisualizationId The visualization ID.
         * @param {string} sAppIdLabel The app ID label.
         * @param {string} sAppId The app ID.
         * @param {string} sSystemLabel The system ID label
         * @param {string} sSystemId The system ID.
         * @param {string} sInformationLabel The information label.
         * @param {string} sInfo The app information.
         * @param {string} sLocalContentProvider Replace missing content provider with "Local".
         * @param {boolean} bShowAppBoxFieldsPlaceholder If the fields should be shown as "not maintained" when empty.
         * @param {string} sFieldNotMaintained The field empty text.
         * @param {string} sAlreadyUsed The already used text.
         * @param {boolean} bShowLaunchButton Flag indicating if the launch button should be shown
         * @returns {string} The accessibility description for the custom list item.
         *
         * @since 1.115.0
         * @private
         */
        formatAppBoxAccDescription: function (
            sTitle,
            sSubtitle,
            sVisualizationId,
            sAppIdLabel,
            sAppId,
            sSystemLabel,
            sSystemId,
            sInformationLabel,
            sInfo,
            sLocalContentProvider,
            bShowAppBoxFieldsPlaceholder,
            sFieldNotMaintained,
            sAlreadyUsed,
            bShowLaunchButton
        ) {
            const aDescriptions = [];
            // App Title and Subtitle
            if (sTitle) {
                aDescriptions.push(sTitle);
            }
            if (sSubtitle) {
                aDescriptions.push(sSubtitle);
            }
            if (this.getOwnerComponent().oRestrictedVisualizationsMap.has(sVisualizationId)) {
                aDescriptions.push(sAlreadyUsed);
            }

            // App id
            if (sAppId) {
                aDescriptions.push(sAppIdLabel);
                aDescriptions.push(sAppId);
            } else if (bShowAppBoxFieldsPlaceholder) {
                aDescriptions.push(sAppIdLabel);
                aDescriptions.push(sFieldNotMaintained);
            }

            // System information
            aDescriptions.push(sSystemLabel);
            if (sSystemId) {
                aDescriptions.push(sSystemId);
            } else {
                aDescriptions.push(sLocalContentProvider);
            }

            // Additional Information
            if (sInfo) {
                aDescriptions.push(sInformationLabel);
                aDescriptions.push(sInfo);
            } else if (bShowAppBoxFieldsPlaceholder) {
                aDescriptions.push(sInformationLabel);
                aDescriptions.push(sFieldNotMaintained);
            }

            if (bShowLaunchButton) {
                const oResourceBundle = this.getOwnerComponent().getResourceBundle();
                aDescriptions.push(oResourceBundle.getText("ContentFinder.AppSearch.Button.Tooltip.LaunchApplication", [sTitle]));
            }

            return aDescriptions?.filter(Boolean).join(" . ");
        }
    };
});
