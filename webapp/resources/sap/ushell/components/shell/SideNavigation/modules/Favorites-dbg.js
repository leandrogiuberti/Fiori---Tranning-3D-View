// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/GenericTile",
    "sap/tnt/NavigationListGroup",
    "sap/tnt/NavigationListItem",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/CustomData",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/components/shell/SideNavigation/modules/NavigationHelper",
    "sap/ui/model/resource/ResourceModel",
    "sap/base/i18n/Localization"
], (
    GenericTile,
    NavigationListGroup,
    NavigationListItem,
    ComponentContainer,
    CustomData,
    Filter,
    FilterOperator,
    JSONModel,
    Config,
    Container,
    NavigationHelper,
    ResourceModel,
    Localization
) => {
    "use strict";

    /**
     * The menu entry "Favorites" with the sections (folders) and apps from the MyHome page for the SideNavigation.
     *
     * @since 1.134.0
     * @private
     */
    class Favorites {
        /**
         * The side navigation API object passed to the constructor.
         * @type {sap.ushell.modules.NavigationMenu.ListProviderAPI}
         */
        #oSideNavAPI;

        /**
         * The promise which resolves with the root navigation list item when everything is loaded.
         * @type {Promise<sap.tnt.NavigationListGroup>}
         */
        #pItemReady;

        /**
         * The root navigation list item group item configured with sections and apps.
         * @type {sap.tnt.NavigationListGroup}
         */
        #oRootItem;

        /**
         * Helper class for performing navigation actions.
         * @type {NavigationHelper} Helper class for performing navigation actions.
         */
        #NavigationHelper;

        /**
         * The object that stores the smart business visualization instances.
         * Those are used to navigate to the app by firing the press event on the GenericTile.
         * @type {object}
         */
        #oSmartBusinessVizInstances = {};

        /**
         * The promise that resolves with the resource bundle for the i18n texts.
         * @type {sap.ui.model.resource.ResourceModel}
         */
        #oI18nModel;

        /**
         * Creates a new menu entry "Favorites" with the sections and apps from the MyHome page for the SideNavigation.
         *
         * @param {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI The side navigation API object.
         *
         * @since 1.134.0
         * @private
         */
        constructor (oSideNavAPI) {
            this.#oI18nModel = new ResourceModel({
                bundleUrl: sap.ui.require.toUrl("sap/ushell/components/shell/SideNavigation/resources/resources.properties"),
                bundleLocale: Localization.getLanguage(),
                async: true
            });
            this.#oSideNavAPI = oSideNavAPI;
            this.#oRootItem = new NavigationListGroup({
                text: "{i18n>SideNavigation.Item.Favorites.Title}",
                enabled: "{viewConfiguration>/enableSideNavigation}",
                items: {
                    path: "favorites>/",
                    key: "{favorites>id}",
                    factory: this.#favoritesModelItemFactory.bind(this)
                },
                customData: [new CustomData({
                    key: "help-id",
                    value: "MenuEntry-Favorites",
                    writeToDom: true
                })]
            });
            this.#pItemReady = new Promise((resolve, reject) => {
                this.#prepareModel(resolve, reject);
            });

            this.#NavigationHelper = new NavigationHelper();
        }

        /**
         * Asynchronously retrieves the root navigation list item.
         *
         * @async
         * @returns {Promise<sap.tnt.NavigationListGroup>} A promise that resolves to NavigationListGroup once the model is prepared and ready.
         * @since 1.134.0
         * @private
         */
        async getRootItem () {
            return this.#pItemReady;
        }

        /**
         * Triggered whenever a user selects a recent activity item.
         *
         * Closes the side navigation.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         * @since 1.134.0
         */
        async onItemPressed (oEvent) {
            const oVisualization = oEvent.getSource().getBindingContext("favorites").getProperty();
            // Check if the item is a visualization
            if (!oVisualization.vizType) {
                // No navigation for sections
                return;
            }

            const oVizInstance = this.#oSmartBusinessVizInstances[oVisualization.id];
            if (oVizInstance) {
                // Is smart business visualization
                await oVizInstance.loaded();
                this.#getGenericTileInstance(oVizInstance.getContent())?.firePress();
            } else if (oVisualization.targetURL && oVisualization.target?.type === "URL") {
                this.#NavigationHelper.navigate({
                    target: { url: oVisualization.targetURL },
                    type: "URL"
                });
            } else if (oVisualization.targetURL && oVisualization.target?.semanticObject && oVisualization.target?.action) {
                this.#NavigationHelper.navigate({
                    target: { shellHash: oVisualization.targetURL },
                    type: "IBN"
                });
            }
            this.#oSideNavAPI.closeSideNavigation();
        }

        /**
         * Prepares the model by fetching the pages service and setting the favorites model on the root item.
         *
         * @async
         * @param {function} resolve The function to call if the operation is successful.
         * @param {function} reject The function to call if the operation fails.
         * @returns {Promise<undefined>} A promise that resolves when the model is prepared.
         * @since 1.134.0
         * @private
         */
        async #prepareModel (resolve, reject) {
            const oPagesService = await Container.getServiceAsync("Pages");

            const sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");
            if (!sMyHomePageId) {
                reject(new Error("MyHome pageId is not defined"));
                return;
            }

            const sHomePagePath = await oPagesService.loadPage(sMyHomePageId);
            if (!sHomePagePath) {
                reject(new Error("MyHome page not loaded"));
                return;
            }

            const oPagesModel = oPagesService.getModel();
            const oFavoritesModel = new JSONModel([]);
            oPagesModel.attachEvent("dataChange", () => {
                this.#updateFavoritesModel(oFavoritesModel, sMyHomePageId);
            });

            this.#oRootItem.setModel(oFavoritesModel, "favorites");
            await this.#updateFavoritesModel(oFavoritesModel, sMyHomePageId);

            resolve(this.#oRootItem);
        }

        /**
         * Updates the favorites model with the sections and apps from the MyHome page.
         *
         * @param {sap.ui.model.json.JSONModel} oFavoritesModel The favorites model.
         * @param {string} sMyHomePageId The path to the MyHome page.
         *
         * @since 1.134.0
         * @private
         */
        async #updateFavoritesModel (oFavoritesModel, sMyHomePageId) {
            const oPagesService = await Container.getServiceAsync("Pages");
            const sHomePagePath = await oPagesService.loadPage(sMyHomePageId);
            const oPagesModel = oPagesService.getModel();

            const aMyHomePageSections = oPagesModel.getProperty(`${sHomePagePath}/sections`) || [];
            const aFavorites = [];
            let oDefaultSection;

            const oCurrentFavorites = oFavoritesModel.getProperty("/");

            const oExpandedList = oCurrentFavorites.reduce((oExpanded, oSection) => {
                oExpanded[oSection.id] = oSection.expanded;
                return oExpanded;
            }, {});

            aMyHomePageSections.forEach((oSection) => {
                // Remember default section to add its visualizations to the beginning
                if (oSection.default) {
                    oDefaultSection = oSection;
                    return;
                }
                // Add sections in existing order
                const aVisualizations = oSection.visualizations;
                if (aVisualizations.length > 0) {
                    this.#processSmartBusinessVisualizations(aVisualizations);
                    aFavorites.push({
                        id: oSection.id,
                        title: oSection.title,
                        visualizations: aVisualizations,
                        expanded: !!oExpandedList[oSection.id]
                    });
                }
            });

            // Add a button at the bottom of the "Favorites" menu entry to add new favorite apps using the App Finder
            const sAddAppsText = (await this.#oI18nModel.getResourceBundle()).getText("SideNavigation.Item.Favorites.AddApps");
            aFavorites.push({
                id: "addAppsToFavoritesFolder",
                title: sAddAppsText,
                vizType: "sap.ushell.StaticAppLauncher",
                targetURL: "#Shell-appfinder"
            });

            if (oDefaultSection?.visualizations?.length > 0) {
                // Add default section visualizations to the beginning
                this.#processSmartBusinessVisualizations(oDefaultSection.visualizations);
                aFavorites.splice(0, 0, ...oDefaultSection.visualizations);
            }
            oFavoritesModel.setProperty("/", aFavorites);
        }

        /**
         * Creates visualization instances for smart business visualizations and registers callbacks to update their titles.
         *
         * @param {Array} aVisualizations The array of visualizations to process.
         *
         * @since 1.136.0
         * @private
         */
        #processSmartBusinessVisualizations (aVisualizations) {
            // Process visualizations to extract relevant information
            Container.getServiceAsync("VisualizationInstantiation").then((oVisualizationInstantiationService) => {
                aVisualizations.forEach((oVisualization) => {
                    if (oVisualization.vizType?.startsWith("X-SAP-UI2-CHIP:SSB") && !this.#oSmartBusinessVizInstances[oVisualization.id]) {
                        const oVizInstance = oVisualizationInstantiationService.instantiateVisualization(oVisualization);
                        oVizInstance.setActive(true);
                        oVizInstance.loaded().then(() => {
                            const sTitle = this.#getGenericTileInstance(oVizInstance.getContent())?.getHeader();
                            if (!oVisualization.title && sTitle) {
                                const oModel = this.#oRootItem.getModel("favorites");
                                const aFavorites = oModel.getProperty("/");
                                for (let iSectionIndex = 0; iSectionIndex < aFavorites.length; iSectionIndex++) {
                                    const oElement = aFavorites[iSectionIndex];

                                    // Is in default section
                                    if (oElement.id === oVisualization.id) {
                                        oModel.setProperty(`/${iSectionIndex}/title`, sTitle);
                                        oModel.setProperty(`/${iSectionIndex}/targetURL`, "");
                                    }

                                    // Is in section
                                    if (Array.isArray(oElement.visualizations)) {
                                        for (let iVizIndex = 0; iVizIndex < oElement.visualizations.length; iVizIndex++) {
                                            const oVisualizationInSection = oElement.visualizations[iVizIndex];
                                            if (oVisualizationInSection.id === oVisualization.id) {
                                                oModel.setProperty(`/${iSectionIndex}/visualizations/${iVizIndex}/title`, sTitle);
                                                oModel.setProperty(`/${iSectionIndex}/visualizations/${iVizIndex}/targetURL`, "");
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        this.#oSmartBusinessVizInstances[oVisualization.id] = oVizInstance;
                    }
                });
            });
        }

        /**
         * Recursively retrieves the GenericTile instance from the given control.
         *
         * @param {sap.ui.core.Control} oVizInstanceRootControl The root control of the visualization instance.
         * @returns {sap.m.GenericTile|null} The GenericTile instance if found, otherwise null.
         * @since 1.136.0
         * @private
         */
        #getGenericTileInstance (oVizInstanceRootControl) {
            if (!oVizInstanceRootControl) {
                return null;
            }

            if (oVizInstanceRootControl instanceof GenericTile) {
                return oVizInstanceRootControl;
            } else if (oVizInstanceRootControl instanceof ComponentContainer) {
                oVizInstanceRootControl = oVizInstanceRootControl.getComponentInstance().getRootControl();
            }

            const oControlMetadata = oVizInstanceRootControl.getMetadata();
            const oDefaultAggregationDefinition = oControlMetadata.getDefaultAggregation() || null;
            const sDefaultAggregationName = oDefaultAggregationDefinition ? oDefaultAggregationDefinition?.name : "content";

            const aAggregationData = sDefaultAggregationName ? oVizInstanceRootControl.getAggregation(sDefaultAggregationName) : null;
            const oAggregationValue = Array.isArray(aAggregationData) ? aAggregationData[0] : aAggregationData;

            if (!oAggregationValue) {
                return null;
            }

            return this.#getGenericTileInstance(oAggregationValue);
        }

        /**
         * Factory function for creating a navigation list item in the "Favorites" menu entry for the favorites model.
         *
         * @param {string} sId - The unique identifier for the navigation list item.
         * @returns {sap.tnt.NavigationListItem} A new instance of NavigationListItem configured for the favorites model.
         * @since 1.134.0
         * @private
         */
        #favoritesModelItemFactory (sId) {
            return new NavigationListItem(sId, {
                key: "{favorites>id}",
                text: "{= !%{favorites>vizType} && %{favorites>title} === '' ? %{i18n>SideNavigation.Item.Favorites.UntitledFolder} : %{favorites>title} }",
                enabled: "{viewConfiguration>/enableSideNavigation}",
                expanded: "{favorites>expanded}",
                icon: "{= !%{favorites>vizType} ? 'sap-icon://folder' : '' }",
                href: "{favorites>targetURL}",
                selectable: false,
                // There should be atleast one visualization with a title to show the folder
                visible: {
                    path: "favorites>visualizations",
                    formatter: (aVisualizations) => aVisualizations?.some((oItem) => !!oItem.title)
                },
                items: {
                    path: "favorites>visualizations",
                    template: new NavigationListItem({
                        key: "{favorites>id}",
                        text: "{favorites>title}",
                        enabled: "{viewConfiguration>/enableSideNavigation}",
                        href: "{favorites>targetURL}",
                        selectable: false,
                        press: this.onItemPressed.bind(this)
                    }),
                    filters: new Filter("title", FilterOperator.NE, "")
                },
                press: this.onItemPressed.bind(this)
            });
        }
    }

    return Favorites;
}, false);
