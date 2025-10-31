// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file PageRuntime controller for PageRuntime view
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ui/core/CustomData",
    "sap/ushell/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/events/KeyCodes",
    "sap/m/GenericTile",
    "sap/ushell/resources",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/ushell/components/pages/StateManager",
    "sap/ushell/EventHub",
    "sap/ushell/utils",
    "sap/m/Button",
    "sap/base/strings/capitalize",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ushell/components/pages/controller/PagesAndSpaceId",
    "sap/ushell/components/pages/MyHomeImport",
    "sap/ui/thirdparty/hasher",
    "sap/base/Log",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/ui/launchpad/Section",
    "sap/ushell/Container",
    "sap/ushell/navigation/NavigationState",
    "sap/ushell/utils/LaunchpadError",
    /* jQuery Plugin "firstFocusableDomRef" */
    "sap/ui/dom/jquery/Focusable"
], (
    Element,
    EventBus,
    CustomData,
    ushellLibrary,
    Controller,
    KeyCodes,
    GenericTile,
    resources,
    JSONModel,
    Config,
    mLibrary,
    MessageToast,
    StateManager,
    EventHub,
    ushellUtils,
    Button,
    capitalize,
    Filter,
    FilterOperator,
    PagesAndSpaceId,
    MyHomeImport,
    hasher,
    Log,
    ActionItem,
    Section,
    Container,
    NavigationState,
    LaunchpadError
) => {
    "use strict";

    // shortcut for sap.m.LoadState
    const LoadState = mLibrary.LoadState;

    // shortcut for sap.ushell.DisplayFormat
    const DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * Controller of the PagesRuntime view.
     * It is responsible for navigating between different pages and combines the
     * Pages service (@see sap.ushell.services.Pages) with the
     * VisualizationInstantiation service (@see sap.ushell.services.VisualizationInstantiation) to create
     * the content area of the Fiori Launchpad.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     * @class
     * @extends sap.ui.core.mvc.Controller
     * @private
     * @since 1.72.0
     * @alias sap.ushell.components.pages.controller.Pages
     */
    return Controller.extend("sap.ushell.components.pages.controller.Pages", /** @lends sap.ushell.components.pages.controller.Pages.prototype */ {
        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * It gets all the required UShell services and sets the Pages service
         * model to the view. It also sets a separate model to the view which includes
         * some settings which change the view behavior.
         *
         * @private
         * @since 1.72.0
         */
        onInit: function () {
            this._setPerformanceMark("FLP-PagesRuntime-onInit");

            this._oVisualizationInstantiationServicePromise = Container.getServiceAsync("VisualizationInstantiation");
            this._oURLParsingService = Container.getServiceAsync("URLParsing");

            this._oViewSettingsModel = new JSONModel({
                sizeBehavior: Config.last("/core/home/sizeBehavior"),
                actionModeActive: false,
                actionModeEditActive: false, // There are two action modes: normal Edit and Add Tiles to My Home
                showHideButton: Config.last("/core/catalog/enableHideGroups"),
                showAddButton: Config.last("/core/catalog/enabled"),
                personalizationEnabled: Config.last("/core/shell/enablePersonalization"),
                isNavigationRunning: NavigationState.isNavigationRunning(),
                addToMyHomeOnly: false,
                gridContainerGap: [],
                gridContainerRowSize: []
            });
            this.getView().setModel(this._oViewSettingsModel, "viewSettings");

            this._sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");

            this._aConfigListeners = Config.on("/core/home/sizeBehavior").do((sSizeBehavior) => {
                this._oViewSettingsModel.setProperty("/sizeBehavior", sSizeBehavior);
            });

            this._oErrorPageModel = new JSONModel({
                title: "",
                description: "",
                details: "",
                pageAndSpaceId: "",
                technicalError: ""
            });
            this.getView().setModel(this._oErrorPageModel, "errorPage");

            this.oInitFinishedPromise = Promise.all([
                this._oVisualizationInstantiationServicePromise,
                this.getOwnerComponent().getPagesService()
            ]).then((aServices) => {
                // bind the model only when the vizInstance service is loaded so that it
                // can be used in the factory function synchronously
                this._oVisualizationInstantiationService = aServices[0];
                this.getView().setModel(aServices[1].getModel());
            });

            const oRenderer = Container.getRendererInternal();
            this.bIsHomeIntentRootIntent = ushellUtils.isFlpHomeIntent(oRenderer.getShellConfig().rootIntent);
            this.oErrorPage = this.byId("errorPage");
            this.oEmptyPage = this.byId("emptyPage");
            this.oPagesNavContainer = this.byId("pagesNavContainer");
            this.oPagesRuntimeNavContainer = this.byId("pagesRuntimeNavContainer");
            // Navigate initially to empty page to avoid implicit page rendering
            // BCP: 2270064359
            this.oPagesRuntimeNavContainer.to(this.oEmptyPage);
            // Handles the states(visible/invisible, active/inactive) of the visualizations
            StateManager.init(this.oPagesRuntimeNavContainer, this.oPagesNavContainer);

            this.oEventHubListener = EventHub.once("PagesRuntimeRendered").do(this._onFirstPageRendering.bind(this));

            this._oEventBus = EventBus.getInstance();
            this._oEventBus.subscribe("launchpad", "shellFloatingContainerIsDocked", this._handleUshellContainerDocked, this);
            this._oEventBus.subscribe("launchpad", "shellFloatingContainerIsUnDocked", this._handleUshellContainerDocked, this);

            NavigationState.attachNavigationStateChanged(this._handleNavigationStateChanged, this);

            this.oVisualizationInstantiationListener = EventHub.on("VizInstanceLoaded").do(() => {
                this._setPerformanceMark("FLP-TTI-Homepage");
                // Should be adjusted after next iteration of the VisualizationInstantiation
                if (!this.oVisualizationInstantiationListenerTimeout) {
                    // Currently there is no good place to mark TTI time, because all visualizations
                    // are loaded async and update visualizations views directly through setAggregation.
                    // For this reason, we listen to the loading of the all static and dynamic tiles
                    // and mark the last time. Timeout in 5 sec in order to avoid the cases when
                    // personalization or other interaction  replace the TTI time
                    this.oVisualizationInstantiationListenerTimeout = setTimeout(() => {
                        this.oVisualizationInstantiationListener.off();
                    }, 5000);
                }
            });

            this.fnBoundSetGridContainerSizes = this._setGridContainerSizes.bind(this);
            Config.on("/core/home/sizeBehavior").do(this.fnBoundSetGridContainerSizes);
            EventHub.on("themeChanged").do(this.fnBoundSetGridContainerSizes);

            this.sCurrentTargetPageId = "";
            this._oInitPromise = this._openFLPPage().then(() => {
                // The NavContainer handles initial focus which lands on the emptyPage instead of the loaded page after first render
                // Therefore we are focusing the first item on first render in case there is no item focused yet
                if (!document.activeElement || document.activeElement === document.body) {
                    const oCurrentPage = this.oPagesNavContainer.getCurrentPage();
                    const oCurrentLaunchpadPage = oCurrentPage && oCurrentPage.getContent()[0];
                    const oFirstSection = oCurrentLaunchpadPage && oCurrentLaunchpadPage.getSections()[0];
                    if (oFirstSection) {
                        oFirstSection.focus();
                    } else {
                        // jQuery Plugin "firstFocusableDomRef"
                        const oFocusableDomRef = this.oPagesNavContainer.$().firstFocusableDomRef();
                        if (oFocusableDomRef) {
                            oFocusableDomRef.focus();
                        }
                    }
                }

                if (!this.getOwnerComponent().getNavigationDisabled()) {
                    // add listener to the router after the rendering the page in order to avoid page re-rendering
                    this.oContainerRouter = oRenderer.getRouter();
                    this.oContainerRouter.getRoute("home").attachMatched(this.onRouteMatched.bind(this, true /* bIsHomeRoute */));
                    this.oContainerRouter.getRoute("openFLPPage").attachMatched(this.onRouteMatched.bind(this, false));
                }
            });
        },

        /**
         * Set the section grid container gap and row size for different screen sizes
         */
        _setGridContainerSizes: async function () {
            const sSizeBehavior = Config.last("/core/home/sizeBehavior");
            const oViewSettingsModel = this.getView().getModel("viewSettings");

            const sTileGapParam = (sSizeBehavior === "Small")
                ? "_sap_ushell_Tile_SpacingXS"
                : "_sap_ushell_Tile_Spacing";

            const sTileGapParamS = (sSizeBehavior === "Small")
                ? "_sap_ushell_Tile_SpacingXS"
                : "_sap_ushell_Tile_SpacingS";

            const [sGap, sGapXS, sGapS] = await ushellUtils.getThemingParameters([sTileGapParam, "_sap_ushell_Tile_SpacingXS", sTileGapParamS]);

            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGap", this._formatNumericThemeParam(sGap));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapXS", this._formatNumericThemeParam(sGapXS));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapS", this._formatNumericThemeParam(sGapS));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapM", this._formatNumericThemeParam(sGap));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapL", this._formatNumericThemeParam(sGap));
            oViewSettingsModel.setProperty("/gridContainerGap/gridContainerGapXL", this._formatNumericThemeParam(sGap));

            const sTileWidthParam = (sSizeBehavior === "Small")
                ? "_sap_ushell_Tile_WidthXS"
                : "_sap_ushell_Tile_Width";

            const sTileWidthParamS = (sSizeBehavior === "Small")
                ? "_sap_ushell_Tile_WidthXS"
                : "_sap_ushell_Tile_WidthS";

            const [sRowSize, sRowSizeXS, sRowSizeS] = await ushellUtils.getThemingParameters([sTileWidthParam, "_sap_ushell_Tile_WidthXS", sTileWidthParamS]);

            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSize", this._formatNumericThemeParam(sRowSize));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeXS", this._formatNumericThemeParam(sRowSizeXS));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeS", this._formatNumericThemeParam(sRowSizeS));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeM", this._formatNumericThemeParam(sRowSize));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeL", this._formatNumericThemeParam(sRowSize));
            oViewSettingsModel.setProperty("/gridContainerRowSize/gridContainerRowSizeXL", this._formatNumericThemeParam(sRowSize));
        },

        /**
         * Returns a .rem value based on the tile gap or width parameter
         *
         * @param {string} sValue Tile spacing parameter
         * @returns {string} Value in .rem
         */
        _formatNumericThemeParam: function (sValue) {
            if (sValue && sValue.indexOf(".") === 0) {
                sValue = `0${sValue}`;
            }
            return sValue;
        },

        _isMyHomeEnabled: function () {
            return Config.last("/core/spaces/myHome/userEnabled") && Config.last("/core/spaces/myHome/enabled");
        },

        _getMyHomeTitle: function () {
            return Container.getServiceAsync("Menu")
                .then((oMenuService) => {
                    return oMenuService.getMyHomeSpace();
                })
                .then((oHomeSpace) => {
                    if (!oHomeSpace || !oHomeSpace.children.length) {
                        return "";
                    }
                    return oHomeSpace.children[0].label;
                });
        },

        /**
         * It is called on the first page rendering, even in the error case.
         * Creates the action mode button.
         */
        _onFirstPageRendering: function () {
            const bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");
            const bMyHomeEnabled = this._isMyHomeEnabled();
            if (bPersonalizationEnabled) {
                this._createActionModeButton();
            } else if (bMyHomeEnabled) {
                this._getMyHomeTitle().then(this._createActionModeButton.bind(this));
            }

            EventHub.emit("firstSegmentCompleteLoaded", true);
        },

        _handleNavigationStateChanged: function (oEvent) {
            const bIsNavigationRunning = oEvent.getParameter("isNavigationRunning");
            this._oViewSettingsModel.setProperty("/isNavigationRunning", bIsNavigationRunning);
        },

        /**
         * Updates the homeUri in the shell header
         * @param {object} oCurrentSpaceAndPage The current space and page
         *
         * @since 1.127.0
         * @private
         */
        _updateHomeUri: function (oCurrentSpaceAndPage) {
            const sRootIntent = Config.last("/core/shellHeader/rootIntent");
            if (Config.last("/core/spaces/homeNavigationTarget") === "origin_page") {
                const sNewHash = oCurrentSpaceAndPage ? encodeURI(oCurrentSpaceAndPage.hash) : sRootIntent;
                Config.emit("/core/shellHeader/homeUri", `#${sNewHash}`);
            }
        },

        /**
         * Handles the route matching for the "home" and "openFLPPage" route
         *
         * @param {boolean} bIsHomeRoute Whether the home route matched
         * @private
         */
        onRouteMatched: function (bIsHomeRoute) {
            const bIsHomeAppEnabled = Config.last("/core/homeApp/enabled");
            const bNavigationToHomeApp = bIsHomeAppEnabled && bIsHomeRoute;

            Log.debug("cep/editMode: on Route matched", "Page runtime");
            // Remove home page and display target page
            // We do not display the target page in case we are navigating to the homeApp
            this._removeMyHomePage();
            if (!bNavigationToHomeApp) {
                this._openFLPPage();
            } else {
                this._cancelActionMode();
                // Navigate to empty page to avoid flickering of old page
                // BCP: 2270064359
                this.oPagesRuntimeNavContainer.to(this.oEmptyPage);
                // Reset spacePage for hierarchy and home button
                // BCP: 2270105250
                this._updateHomeUri(undefined);

                // Needed for Hierarchy Menu in Spaces mode - see sap/ushell/ui5service/ShellUIService
                Config.emit("/core/spaces/currentSpaceAndPage", undefined);
            }

            // Hide "[Edit Current Page]" button of page`s runtime
            // if custom home app is displayed
            const oActionModeButton = Element.getElementById("ActionModeBtn");
            if (!oActionModeButton) {
                return;
            }

            const oRenderer = Container.getRendererInternal("fiori2");
            const oStateInfo = this._getStateInfoActionModeButton();

            if (bNavigationToHomeApp) {
                if (this._moveEditActionToHeader()) {
                    oRenderer.hideHeaderEndItem(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                } else {
                    oRenderer.hideActionButton(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                }
                return;
            }

            // Display it again if other page is displayed when custom home app is configured
            if (!bIsHomeRoute && bIsHomeAppEnabled) {
                if (this._moveEditActionToHeader()) {
                    oRenderer.showHeaderEndItem(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                } else {
                    oRenderer.showActionButton(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                }
                return;
            }

            // Display "[Edit Current Page]" button
            // if a custom root intent was defined, e.g. WorkZone
            if (!this.bIsHomeIntentRootIntent) {
                if (this._moveEditActionToHeader()) {
                    oRenderer.showHeaderEndItem(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                } else {
                    oRenderer.showActionButton(oActionModeButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
                }
            }
        },

        /**
         * Used to set performance mark related to the loading of the page runtime
         *
         * @param {string} sMark - the name of the performance mark.
         * @private
         */
        _setPerformanceMark: function (sMark) {
            ushellUtils.setPerformanceMark(sMark, {
                bUseUniqueMark: true,
                bUseLastMark: true
            });
        },

        // Set either "Edit My Home" or "Add Tiles to My Home" text of the Action Mode button.
        _setActionButtonText: function (sTextId) {
            sTextId = sTextId || this._sActionModeTextId;
            if (!sTextId) {
                return; // Personalization is enabled, there is no need to change the text.
            }
            this._sActionModeTextId = sTextId; // For the case when the Action Mode button was not created yet.

            this._getMyHomeTitle().then((sTitle) => {
                const oActionModeButton = Element.getElementById("ActionModeBtn");
                if (oActionModeButton) {
                    const sActionModeText = resources.i18n.getText(sTextId, [sTitle]);
                    oActionModeButton.setText(sActionModeText);
                    oActionModeButton.setTooltip(sActionModeText);
                }
            });
        },

        // Check if the personalization is disabled and set the corresponding Action Mode logic.
        // Special logic for "Add Tiles to My Home" when personalization is disabled.
        // bMyHomeActive means that the My Home page is the currently visible one.
        _setActionModeLogic: function (bMyHomeActive) {
            let bEnableEditing = false;
            let bAddToMyHomeOnly = false;

            if (Config.last("/core/shell/enablePersonalization")) {
                bEnableEditing = true; // Most usual case, the Action Mode button has the text "Edit Current Page"
            } else if (bMyHomeActive) {
                bEnableEditing = true; // MyHome can always be personalized
                this._setActionButtonText("PageRuntime.EditModeForPage.Activate"); // "Edit My Home"
            } else if (this._isMyHomeEnabled()) { // personalization is disabled but My Home is enabled - special mode
                bAddToMyHomeOnly = true; // Add Tiles to My Home only
                this._setActionButtonText("PageRuntime.EditModeForPage.AddTilesToMyHome"); // "Add Tiles to My Home"
            }
            this._oViewSettingsModel.setProperty("/personalizationEnabled", bEnableEditing);
            this._oViewSettingsModel.setProperty("/addToMyHomeOnly", bAddToMyHomeOnly);
        },

        /**
         * Triggers the navigation to a specific Page after the pageId is returned
         * and the Pages service could successfully load the requested Page.
         * Triggers the navigation to an error page when an error occurs.
         *
         * @returns {Promise<string>} Resolves to the Page model path after the Page is successfully loaded.
         * @private
         * @since 1.72.0
         */
        _openFLPPage: function () {
            return PagesAndSpaceId.getPageAndSpaceId()
                .then(({ pageId, spaceId }) => {
                    // this property may be updated by consecutive calls to _openFLPPage and prevents race conditions when opening pages
                    this.sCurrentTargetPageId = pageId;
                    this.sCurrentTargetSpaceId = spaceId;

                    return Promise.all([
                        this.oInitFinishedPromise,
                        Container.getServiceAsync("Menu")
                    ])
                        .then((aResults) => {
                            const oMenuService = aResults[1];
                            return oMenuService.isSpacePageAssigned(spaceId, pageId);
                        })
                        .then((bAssigned) => {
                            if (!bAssigned) {
                                const sErrorMessage = "The combination of space and page is not assigned to the user.";
                                throw new LaunchpadError(sErrorMessage);
                            }
                            return this.getOwnerComponent().getPagesService();
                        })
                        .then((pagesService) => {
                            Log.debug(`cep/editMode: load Page: ${pageId}`, "Page runtime");
                            return pagesService.loadPage(pageId);
                        })
                        .then(async () => {
                            Log.debug(`cep/editMode: load Page: show action mode button ${pageId}`, "Page runtime");
                            this._showActionModeButton();
                            if (this.sCurrentTargetPageId === pageId) {
                                const bMyHomeActive = this._isMyHomeRouteActive();

                                // Special logic for "Add Tiles to My Home" when personalization is disabled.
                                this._setActionModeLogic(bMyHomeActive);

                                // Placeholder page for empty My Home
                                if (bMyHomeActive && this._isMyHomePageEmpty()) { // If the home page is empty, show the splash screen
                                    await this._navigateToInitialMyHome();
                                } else {
                                    await this._navigate(pageId, spaceId);
                                }

                                return this._onAfterPageNavigated(pageId, spaceId);
                            }
                        })
                        .catch((oError) => {
                            return this.navigateToErrorPage(oError, pageId, spaceId);
                        });
                })
                .catch(this.navigateToErrorPage.bind(this));
        },

        /**
         * Displays an error message on a MessagePage.
         *
         * @param {Error|LaunchpadError} oError The error message.
         * @param {string} [sPageId] The page id
         * @param {string} [sSpaceId] The space id
         * @private
         */
        navigateToErrorPage: function (oError, sPageId, sSpaceId) {
            Log.debug("cep/editMode: open FLP Page: Handle errors", "Page runtime");

            if (sPageId && sSpaceId) {
                this._oErrorPageModel.setProperty("/title", resources.i18n.getText("PageRuntime.CannotLoadPage.Title"));
                this._oErrorPageModel.setProperty("/pageAndSpaceId", resources.i18n.getText("PageRuntime.CannotLoadPage.PageAndSpaceId", [sPageId, sSpaceId]));
            } else {
                this._oErrorPageModel.setProperty("/title", resources.i18n.getText("PageRuntime.GeneralError.Text"));
                this._oErrorPageModel.setProperty("/pageAndSpaceId", "");
            }

            if (oError instanceof Error && !(oError instanceof LaunchpadError)) {
                // E.g. UI5 modules cannot be loaded
                this._oErrorPageModel.setProperty("/details", oError.message);
                this._oErrorPageModel.setProperty("/technicalError", oError.stack);
            } else {
                let sTechnicalError;
                if (oError instanceof LaunchpadError) {
                    sTechnicalError = oError.details?.translatedMessage || oError.message;
                } else { // every error should be either Error or LaunchpadError. Just to be on the safe side.
                    sTechnicalError = JSON.stringify(oError);
                }

                this._oErrorPageModel.setProperty("/details", resources.i18n.getText("PageRuntime.CannotLoadPage.SystemErrorMessagePrefix"));
                this._oErrorPageModel.setProperty("/technicalError", sTechnicalError);
            }

            this._oErrorPageModel.setProperty("/description", "");

            this.oPagesRuntimeNavContainer.to(this.oErrorPage);

            this._hideActionModeButton();
            this._cancelActionMode();

            this._onAfterPageNavigated();
        },
        /**
         * Loops through every page in the inner NavContainer and displays
         * the one which was specified. Also determines if the page title should be shown.
         *
         * @param {string} targetPageId The ID of the page which should be displayed
         * @param {string} spaceId The ID of the space to which the page is assigned to
         * @param {boolean} [keepActionMode] Boolean indicating if the target page should also be in action mode.
         * @returns {Promise<undefined>} Promise which is resolved after the navigation occurred
         * @private
         * @since 1.72.0
         */
        _navigate: async function (targetPageId, spaceId, keepActionMode) {
            const oPageControl = this.oPagesNavContainer.getPages().find((oControl) => {
                return targetPageId === oControl.data("pageId");
            });

            if (!oPageControl) {
                throw new Error("Page control not found");
            }

            const oMenuService = await Container.getServiceAsync("Menu");
            const bSamePage = this.oPagesNavContainer.getCurrentPage() === oPageControl;

            this.oPagesNavContainer.to(oPageControl);
            this.oPagesRuntimeNavContainer.to(this.oPagesNavContainer);

            // Only cancel edit mode in case of navigation to a different page
            if (!bSamePage && !keepActionMode) {
                this._cancelActionMode();
            }

            // no need to wait for this to finish the navigation
            const oTitles = await oMenuService.getSpaceAndPageTitles(spaceId, targetPageId);
            const bHasMultiplePages = await oMenuService.hasMultiplePages(spaceId);
            const bIsPinned = await oMenuService.isPinned(spaceId);
            const bMenu = Config.last("/core/menu/enabled");
            const bSideNav = Config.last("/core/sideNavigation/enabled");
            const bSideNavMode = Config.last("/core/sideNavigation/mode");
            const bShowSpaceInTitle = !bIsPinned || bIsPinned && !bMenu && bSideNav && bSideNavMode === "Popover";

            // The properties title and showTitle have to be set per page control and not only
            // once in the view settings model to avoid a flickering during navigation between pages.
            const oFLPPageControl = oPageControl.getContent()[0];
            const bShowTitle = bHasMultiplePages || !bIsPinned;
            oFLPPageControl.setTitle(this._formatPageTitle(oTitles.pageTitle, oTitles.spaceTitle, bHasMultiplePages, bShowSpaceInTitle));
            oFLPPageControl.setShowTitle(bShowTitle);

            const oSpacePageData = {
                pageTitle: oTitles.pageTitle,
                spaceTitle: oTitles.spaceTitle,
                hash: hasher.getHash()
            };

            // Needed for navigation target of the header Logo in Spaces mode
            this._updateHomeUri(oSpacePageData);

            // Needed for Hierarchy Menu in Spaces mode - see sap/ushell/ui5service/ShellUIService
            Config.emit("/core/spaces/currentSpaceAndPage", oSpacePageData);
        },

        /**
         * Navigates to the initial MyHome page.
         * Loads the view if it does not exist yet.
         *
         * @returns {Promise<undefined>} A promise resolving when the navigation is done.
         * @private
         * @since 1.89.0
         */
        _navigateToInitialMyHome: async function () {
            if (!this._pLoadMyHomeView) {
                this._pLoadMyHomeView = new Promise((resolve, reject) => {
                    sap.ui.require(["sap/ui/core/mvc/XMLView"], (XMLView) => {
                        XMLView.create({
                            id: "sapUshellMyHomePage",
                            viewName: "sap.ushell.components.pages.view.MyHomeStart"
                        }).then((oMyHomeStartPage) => {
                            oMyHomeStartPage.getController().connect({
                                onEdit: this.pressActionModeButton.bind(this),
                                onOpenDialog: this.openMyHomeImportDialog.bind(this)
                            });
                            resolve(oMyHomeStartPage);
                        }).catch(reject);
                    }, reject);
                });
            }

            return this._pLoadMyHomeView.then((oMyHomePage) => {
                this._cancelActionMode();
                this.oPagesRuntimeNavContainer.insertPage(oMyHomePage, 0);
                this.oPagesRuntimeNavContainer.to(oMyHomePage);
            });
        },

        /**
         * Emit events when page is rendered
         *
         * @since 1.79.0
         * @private
         */
        _onAfterPageNavigated: function () {
            if (this.sCurrentTargetPageId && this.sCurrentTargetSpaceId) {
                // Save new space and page for ShellAnalytics
                EventHub.emit("PageRendered", {
                    time: Date.now(),
                    pageId: this.sCurrentTargetPageId,
                    spaceId: this.sCurrentTargetSpaceId
                });
            }

            // track navigation in ShellAnalytics
            if (!EventHub.last("PagesRuntimeRendered")) {
                EventHub.emit("PagesRuntimeRendered", true);
            } else {
                EventHub.emit("CloseFesrRecord", Date.now());
            }
        },

        /**
         * Displays the description of the current error and hide the button after it is pressed.
         *
         * @since 1.73.0
         * @private
         */
        _pressViewDetailsButton: async function () {
            if (!this._oDetailsDialogPromise) {
                this._oDetailsDialogPromise = new Promise((resolve, reject) => {
                    sap.ui.require(["sap/ui/core/Fragment"], async (Fragment) => {
                        try {
                            const oDetailsDialog = await Fragment.load({
                                name: "sap.ushell.components.pages.fragment.DialogPageNotExists",
                                controller: this
                            });

                            this.getView().addDependent(oDetailsDialog);
                            resolve(oDetailsDialog);
                        } catch (oError) {
                            reject(oError);
                        }
                    }, reject);
                });
            }

            const oDetailsDialog = await this._oDetailsDialogPromise;
            oDetailsDialog.open();
        },

        /**
         * Closes the PageNotExists Dialog
         *
         * @since 1.132.0
         * @private
         */
        _onDialogClose: async function () {
            const oDetailsDialog = await this._oDetailsDialogPromise;
            oDetailsDialog.close();
        },

        /**
         * Copies the content of the text provided to the clipboard and shows a MessageToast with a success or error message
         *
         * @since 1.73.0
         * @private
         */
        _copyToClipboard: function () {
            let sClipboardString;
            if (this._oErrorPageModel.getProperty("/pageAndSpaceId")) {
                sClipboardString = `${this._oErrorPageModel.getProperty("/technicalError")}\n${this._oErrorPageModel.getProperty("/pageAndSpaceId")}`;
            } else {
                sClipboardString = this._oErrorPageModel.getProperty("/technicalError");
            }
            const bResult = ushellUtils.copyToClipboard(sClipboardString);
            if (bResult) {
                MessageToast.show(resources.i18n.getText("PageRuntime.CannotLoadPage.CopySuccess"), {
                    closeOnBrowserNavigation: false
                });
            } else {
                MessageToast.show(resources.i18n.getText("PageRuntime.CannotLoadPage.CopyFail"), {
                    closeOnBrowserNavigation: false
                });
            }
        },

        /**
         * UI5 factory function which is used by the page control inside the runtime view to fill the sections aggregation
         * @see sap.ushell.ui.launchpad.Section
         *
         * @param {string} id Control ID
         * @param {sap.ui.model.Context} context UI5 context
         * @returns {sap.ushell.ui.launchpad.Section} The UI5 control
         * @private
         * @since 1.117.0
         */
        _sectionFactory: function (id, context) {
            return new Section({
                title: "{title}",
                sizeBehavior: "{viewSettings>/sizeBehavior}",
                dataHelpId: "Section-{id}",
                ariaLabel: {
                    parts: [
                        { path: "title" },
                        { value: context.getPath() },
                        { path: "viewSettings>/actionModeEditActive" }
                    ],
                    formatter: this._formatSectionAriaLabel.bind(this)
                },
                default: "{default}",
                visualizations: {
                    path: "visualizations",
                    factory: this._visualizationFactory.bind(this),
                    key: "id"
                },
                gridContainerGap: "{viewSettings>/gridContainerGap/gridContainerGap}",
                gridContainerGapXS: "{viewSettings>/gridContainerGap/gridContainerGapXS}",
                gridContainerGapS: "{viewSettings>/gridContainerGap/gridContainerGapS}",
                gridContainerGapM: "{viewSettings>/gridContainerGap/gridContainerGapM}",
                gridContainerGapL: "{viewSettings>/gridContainerGap/gridContainerGapL}",
                gridContainerGapXL: "{viewSettings>/gridContainerGap/gridContainerGapXL}",
                gridContainerRowSize: "{viewSettings>/gridContainerRowSize/gridContainerRowSize}",
                gridContainerRowSizeXS: "{viewSettings>/gridContainerRowSize/gridContainerRowSizeXS}",
                gridContainerRowSizeS: "{viewSettings>/gridContainerRowSize/gridContainerRowSizeS}",
                gridContainerRowSizeM: "{viewSettings>/gridContainerRowSize/gridContainerRowSizeM}",
                gridContainerRowSizeL: "{viewSettings>/gridContainerRowSize/gridContainerRowSizeL}",
                gridContainerRowSizeXL: "{viewSettings>/gridContainerRowSize/gridContainerRowSizeXL}",
                enableGridBreakpoints: false,
                enableGridContainerQuery: "{viewSettings>/ushellContainerDocked}",
                editable: "{viewSettings>/actionModeEditActive}",
                add: this.handleEditModeAction.bind(this, "addVisualization"),
                delete: this.handleEditModeAction.bind(this, "deleteSection"),
                reset: this.handleEditModeAction.bind(this, "resetSection"),
                sectionVisibilityChange: this.handleEditModeAction.bind(this, "changeSectionVisibility"),
                titleChange: this.handleEditModeAction.bind(this, "changeSectionTitle"),
                enableVisualizationReordering: "{= ${viewSettings>/personalizationEnabled} && !${viewSettings>/isNavigationRunning} }",
                areaDragEnter: this.onAreaDragEnter.bind(this),
                visualizationDrop: this.moveVisualization.bind(this),
                showSection: "{visible}",
                visible: "{= !!${visualizations}.length || ${viewSettings>/actionModeEditActive} }",
                noVisualizationsText: "{i18n>PageRuntime.EditMode.EmptySection}",
                showNoVisualizationsText: true,
                enableAddButton: "{viewSettings>/showAddButton}",
                enableResetButton: {
                    parts: ["id", "preset"],
                    formatter: this._sectionEnableReset.bind(this)
                },
                enableDeleteButton: {
                    parts: ["id", "preset"],
                    formatter: this._sectionEnableDelete.bind(this)
                },
                enableShowHideButton: "{viewSettings>/showHideButton}"
            }).addStyleClass("sapContrastPlus");
        },

        /**
         * UI5 factory function which is used by the sections control inside the runtime view to fill the visualizations aggregation
         * @see sap.ushell.ui.launchpad.Section
         *
         * @param {string} id Control ID
         * @param {sap.ui.model.Context} context UI5 context
         * @returns {sap.ui.core.Control} The UI5 control
         * @private
         * @since 1.72.0
         */
        _visualizationFactory: function (id, context) {
            if (this._oVisualizationInstantiationService) {
                const oData = context.getObject();
                const sPath = context.getPath();
                const sSectionPath = sPath.replace(/\/visualizations\/\d*\/?$/, "");
                const sPagePath = sSectionPath.replace(/\/sections\/\d*\/?$/, "");
                const oPageData = context.getModel().getProperty(sPagePath);

                const oVisualization = this._oVisualizationInstantiationService.instantiateVisualization(oData);
                oVisualization.attachPress(this.onVisualizationPress, this);
                oVisualization.bindEditable("viewSettings>/actionModeActive");
                oVisualization.bindClickable({
                    path: "viewSettings>/isNavigationRunning",
                    formatter: (bIsNavigationRunning) => !bIsNavigationRunning
                });
                if (oVisualization.bindRemovable) {
                    oVisualization.bindRemovable("viewSettings>/actionModeEditActive");
                }

                // add regular TileActions
                this._addTileActions(oVisualization, (oPageData ? oPageData.id : ""));

                // dynamic decision on displaying the move Tile action
                oVisualization.attachBeforeActionSheetOpen(() => {
                    const oButton = this._createMoveTileActionButton(oVisualization, oPageData);
                    if (oButton) {
                        oVisualization.attachEventOnce("afterActionSheetClose", () => {
                            oVisualization.removeTileAction(oButton);
                        });
                    }
                });

                // the path looks like "/pages/0/sections/0/visualizations/0"
                const sPagePathIndex = context.getPath().split("/")[2];
                const bActive = !!StateManager.getPageVisibility(`/pages/${sPagePathIndex}`);
                oVisualization.setActive(bActive);

                return oVisualization;
            }
            return new GenericTile({
                state: LoadState.Failed
            });
        },

        /**
         * Adds tile actions to the VizInstance for change of display format
         *
         * @param {sap.ushell.ui.launchpad.VizInstance} oVizInstance The VizInstance which the tile actions are added to.
         * @param {string} sPageId The pageId of the given vizInstance.
         * @private
         * @since 1.85
         */
        _addTileActions: function (oVizInstance, sPageId) {
            const aAvailableDisplayFormats = oVizInstance.getAvailableDisplayFormats();
            const bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");
            const bMyHomeEnabled = this._isMyHomeEnabled();
            const bIsMyHome = sPageId === this._sMyHomePageId;

            if (bPersonalizationEnabled || bIsMyHome) {
                for (let i = 0; i < aAvailableDisplayFormats.length; i++) {
                    oVizInstance.addTileAction(new Button({
                        text: `{i18n>VisualizationInstance.ConvertTo${capitalize(aAvailableDisplayFormats[i])}Action}`,
                        press: [aAvailableDisplayFormats[i], this._updateVisualizationDisplayFormat, this]
                    }));
                }
            }

            if (bMyHomeEnabled && !bIsMyHome) {
                oVizInstance.addTileAction(new Button({
                    text: "{i18n>addToMyHome_action}",
                    press: [oVizInstance, this._addToMyHome, this]
                }));
            }
        },

        /**
         * Creates a move Tile action button and adds it to the given oVizInstance when necessary.
         *
         * @param {sap.ushell.ui.launchpad.VizInstance} oVizInstance The VizInstance that should own the Tile actions.
         * @param {object} oPageData The Page data of the given vizInstance.
         * @returns {sap.m.Button|undefined} The created "Move" Tile action button or "undefined" when there should be no move Tile action
         * @private
         * @since 1.107.0
         */
        _createMoveTileActionButton: function (oVizInstance, oPageData) {
            const sPageId = (oPageData ? oPageData.id : "");
            const bIsMyHome = (sPageId === this._sMyHomePageId);
            const bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");
            const aPersonalizableSections = oPageData.sections.filter((oSection) => { return !oSection.default; });
            const bTileIsInDefaultSection = oVizInstance.getParent().getBindingContext().getProperty("default");
            if ((bPersonalizationEnabled || bIsMyHome) && (aPersonalizableSections.length >= (bTileIsInDefaultSection ? 1 : 2))) {
                const oButton = new Button({
                    text: resources.i18n.getText("moveTile_action"),
                    press: [oVizInstance, this._openMoveVisualizationDialog, this]
                });
                oVizInstance.addTileAction(oButton);
                return oButton;
            }
        },

        /**
         * Opens a dialog which allows the user to move a visualization to a different section.
         *
         * @param {sap.ui.base.Event} oEvent SAP UI5 event object
         * @param {sap.ushell.ui.launchpad.VizInstance} oVizInstance The VizInstance to be moved.
         * @returns {Promise<undefined>} Resolves when the Move Visualization Dialog is opened.
         */
        _openMoveVisualizationDialog: async function (oEvent, oVizInstance) {
            this._oVizInstanceToBeMoved = oVizInstance;
            const sVizInstanceToBeMovedContextPath = oVizInstance.getBindingContext().getPath();
            const aVizInstancePathParts = sVizInstanceToBeMovedContextPath.split("/");
            const sSectionID = oVizInstance.getParent().getBindingContext().getProperty("id");
            const sBindingPath = `/pages/${aVizInstancePathParts[2]}/sections`;

            if (!this._oMoveVisualizationDialogPromise) {
                this._oMoveVisualizationDialogPromise = new Promise((resolve, reject) => {
                    sap.ui.require(["sap/ui/core/Fragment"], async (Fragment) => {
                        try {
                            const oMoveVisualizationDialog = await Fragment.load({
                                name: "sap.ushell.components.pages.MoveVisualization",
                                controller: this
                            });

                            this.getView().addDependent(oMoveVisualizationDialog);
                            resolve(oMoveVisualizationDialog);
                        } catch (oError) {
                            reject(oError);
                        }
                    }, reject);
                });
            }

            const oMoveVisualizationDialog = await this._oMoveVisualizationDialogPromise;
            oMoveVisualizationDialog.bindObject({ path: sBindingPath });
            oMoveVisualizationDialog.getBinding("items").filter([
                new Filter("default", FilterOperator.EQ, false),
                new Filter("id", FilterOperator.NE, sSectionID)
            ]);
            oMoveVisualizationDialog.open();
        },

        /**
         * Adds the given vizInstance to the My Home page.
         *
         * @param {sap.ui.base.Event} oEvent The click event.
         * @param {sap.ushell.ui.launchpad.VizInstance} oVizInstance The vizInstance that should be added to the My Home page.
         * @returns {Promise<undefined>} A promise resolving when the vizInstance was added to the My Home page
         * @private
         */
        _addToMyHome: function (oEvent, oVizInstance) {
            const oVizData = oVizInstance.getBindingContext().getObject();

            return this.getOwnerComponent().getPagesService().then((oPagesService) => {
                return oPagesService.copyVisualization(this._sMyHomePageId, null, oVizData);
            }).then(() => {
                MessageToast.show(resources.i18n.getText("PageRuntime.Message.VisualizationAddedToMyHome"));
            });
        },

        /**
         * The event handler which is called after a Section is selected in the MoveVisualization dialog.
         * The Visualization move happens directly after selecting a Section from the dialog list.
         * A message is announced to the user confirming the success of the move.
         *
         * @param {sap.ui.base.Event} oEvent SAP UI5 event object.
         * @returns {Promise<undefined>} Resolves after the Visualization is moved.
         */
        _confirmSelect: function (oEvent) {
            const oVizInstanceToBeMovedContextPath = this._oVizInstanceToBeMoved.getBindingContext().getPath();
            const aVizInstancePathParts = oVizInstanceToBeMovedContextPath.split("/");

            const iPageIndex = aVizInstancePathParts[2];
            const iCurrentSectionIndex = aVizInstancePathParts[4];
            const iCurrentVizIndex = aVizInstancePathParts[6];

            const sTargetPath = oEvent.getParameter("selectedItem").getBindingContext().getPath();
            const aTargetPathParts = sTargetPath.split("/");

            const iTargetSectionIndex = aTargetPathParts[4];
            const oSourceSection = this._getAncestorControl(this._oVizInstanceToBeMoved, "sap.ushell.ui.launchpad.Section");
            const oPage = this._getAncestorControl(this._oVizInstanceToBeMoved, "sap.ushell.ui.launchpad.Page");
            const aSections = oPage.getSections();
            const oTargetSection = aSections[iTargetSectionIndex];
            const sArea = oSourceSection.getItemPosition(this._oVizInstanceToBeMoved).area;

            this._oVizInstanceToBeMoved = null;
            const oComponent = this.getOwnerComponent();
            return oComponent.getPagesService()
                .then((oPagesService) => {
                    return oPagesService.moveVisualization(iPageIndex, iCurrentSectionIndex, iCurrentVizIndex, iTargetSectionIndex, -1);
                })
                .then((oResult) => {
                    const oViz = oTargetSection.getVisualizations()[oResult.visualizationIndex];
                    if (oViz) {
                        oTargetSection.focusVisualization(oViz);
                    }
                    const sMessage = this._getVizMoveMessage(iCurrentSectionIndex, iTargetSectionIndex, sArea, sArea);
                    MessageToast.show(sMessage);
                });
        },

        /**
         * The event handler which is called when the user searches in the MoveVisualization dialog.
         * @param {sap.ui.base.Event} oEvent SAP UI5 event object.
         */
        _onMoveTileSearch: function (oEvent) {
            const sValue = oEvent.getParameter("value");
            const oFilter = new Filter("title", FilterOperator.Contains, sValue);
            const oDefaultGroupFilter = new Filter("default", FilterOperator.EQ, false);
            const oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter, oDefaultGroupFilter]);
        },

        /**
         * The event handler which is called when the user presses cancel in the MoveVisualization dialog.
         * @param {sap.ui.base.Event} oEvent SAP UI5 event object.
         */
        _onMoveTileDialogClose: function (oEvent) {
            this._oVizInstanceToBeMoved = null;
        },

        /**
         * Searches for the Tile control
         * @param {string} sPageId The id of the page
         * @param {string} sSectionId The id of the section
         * @param {string} sVizRefId The id of the vizRef
         *
         * @returns {sap.ui.core.Control} The requested tile control
         * @private
         * @since 1.111
         */
        _getVizInstanceById: function (sPageId, sSectionId, sVizRefId) {
            const oNavContainer = this.byId("pagesNavContainer");

            const oMatchingPage = oNavContainer.getPages().find((oPage) => {
                return oPage.getBindingContext().getObject().id === sPageId;
            });

            if (!oMatchingPage) {
                return null;
            }

            const oLaunchpadPage = oMatchingPage.getContent()[0];
            const oMatchingSection = oLaunchpadPage.getSections().find((oSection) => {
                return oSection.getBindingContext().getObject().id === sSectionId;
            });

            if (!oMatchingSection) {
                return null;
            }

            const oMatchingVisualization = oMatchingSection.getVisualizations().find((oVisualization) => {
                return oVisualization.getBindingContext().getObject().id === sVizRefId;
            });

            return oMatchingVisualization || null;
        },

        /**
         * Updates the displayFormatHint property of the visualization
         *
         * @param {sap.ui.base.Event} oEvent
         *  SAPUI5 event object. The source is used to identify the visualization which should be updated.
         * @param {sap.ushell.DisplayFormat} sNewDisplayFormatHint
         *  The new displayFormatHint which is used to update the current displayFormatHint property.
         *
         * @returns {Promise<undefined>} A promise which is resolved as soon as the visualization was updated.
         * @private
         * @since 1.84
         */
        _updateVisualizationDisplayFormat: function (oEvent, sNewDisplayFormatHint) {
            const oContext = oEvent.getSource().getBindingContext();
            const sPath = oContext.getPath();
            const aPathParts = sPath.split("/");
            let sOldDisplayFormatHint;
            const iCurrentSectionIndex = aPathParts[4];
            const iTargetSectionIndex = aPathParts[4];

            const oComponent = this.getOwnerComponent();
            return oComponent.getPagesService()
                .then((oPagesService) => {
                    sOldDisplayFormatHint = oPagesService.getModel().getProperty(sPath).displayFormatHint;
                    const oVizData = {
                        displayFormatHint: sNewDisplayFormatHint
                    };
                    // pageIndex, sectionIndex, visualizationIndex
                    return oPagesService.updateVisualization(aPathParts[2], aPathParts[4], aPathParts[6], oVizData);
                })
                .then((oData) => {
                    const oVizInstance = this._getVizInstanceById(oData.pageId, oData.sectionId, oData.vizRefId);
                    const oSection = this._getAncestorControl(oVizInstance, "sap.ushell.ui.launchpad.Section");
                    if (oSection) {
                        oSection.focusVisualization(oVizInstance);
                    }
                    const sMessage = this._getVizMoveMessage(iCurrentSectionIndex, iTargetSectionIndex, sOldDisplayFormatHint, sNewDisplayFormatHint);
                    MessageToast.show(sMessage);
                });
        },

        /**
         * Press handler which is called upon visualization press.
         * Used only in Display Mode and when clicking on the Visualization's "x" in Edit Mode.
         *
         * @param {sap.ui.base.Event} oEvent SAPUI5 event object
         * @returns {Promise<undefined>} Resolves with an empty value
         * @since 1.75
         * @private
         */
        onVisualizationPress: function (oEvent) {
            const sScope = oEvent.getParameter("scope");
            const sAction = oEvent.getParameter("action");
            const oVisualization = oEvent.getSource();
            const oContext = oVisualization.getBindingContext();
            const sPath = oContext.getPath();
            const aPathParts = sPath.split("/");
            const oSection = this._getAncestorControl(oVisualization, "sap.ushell.ui.launchpad.Section");

            if (sScope === "Display" && sAction === "Press") {
                // This scope & action will probably lead to an application to be loaded
                // With this the StateManager will refresh the visualization once navigating back to the launchpad
                StateManager.addVisualizationForRefresh(oVisualization);
            } else if (sScope === "Actions" && sAction === "Remove") {
                return this.getOwnerComponent().getPagesService().then((oPagesService) => {
                    const oOldPosition = oSection.getItemPosition(oVisualization);
                    // pageIndex, sectionIndex, visualizationIndex
                    oPagesService.deleteVisualization(aPathParts[2], aPathParts[4], aPathParts[6]);
                    MessageToast.show(resources.i18n.getText("PageRuntime.Message.VisualizationRemoved"));
                    oSection._focusItem(oOldPosition);
                });
            }

            return Promise.resolve();
        },

        /**
         * UI5 lifecycle method which is called upon controller destruction.
         * It detaches the router events and config listeners.
         *
         * @private
         * @since 1.72.0
         */
        onExit: function () {
            this.oContainerRouter.getRoute("home").detachMatched(this.onRouteMatched, this);
            this.oContainerRouter.getRoute("openFLPPage").detachMatched(this.onRouteMatched, this);
            this._aConfigListeners.off();
            this.oEventHubListener.off();
            this._oEventBus.unsubscribe("launchpad", "shellFloatingContainerIsDocked", this._handleUshellContainerDocked, this);
            this._oEventBus.unsubscribe("launchpad", "shellFloatingContainerIsUnDocked", this._handleUshellContainerDocked, this);
            NavigationState.detachNavigationStateChanged(this._handleNavigationStateChanged, this);
            StateManager.exit();

            const oActionModeButton = Element.getElementById("ActionModeBtn");
            if (oActionModeButton) {
                oActionModeButton.destroy();
            }
        },

        /**
         * Hides the action mode button
         *
         * @private
         * @since 1.84.0
         */
        _hideActionModeButton: function () {
            const oActionModeButton = Element.getElementById("ActionModeBtn");
            Log.debug("cep/editMode: hide Action Mode Button", "Page runtime");
            if (oActionModeButton) {
                oActionModeButton.setVisible(false);
            }
        },

        /**
         * Shows the action mode button
         *
         * @private
         * @since 1.84.0
         */
        _showActionModeButton: function () {
            const oActionModeButton = Element.getElementById("ActionModeBtn");
            if (oActionModeButton) {
                oActionModeButton.setVisible(true);
            }
        },

        /**
         * Check if the Edit Page action should be rendered as a header button
         *
         * @returns {boolean} True if the action is rendered as the shell header button instead of the user menu entry
         * @since 1.98
         * @private
         */
        _moveEditActionToHeader: function () {
            const oRenderer = Container.getRendererInternal("fiori2");
            const bMoveEditButtonToHeader = oRenderer.getShellConfig().moveEditHomePageActionToShellHeader;
            // Move the action to the header only if personalization is enabled.
            // Otherwise, the action "Add Tiles To My Home" is always rendered in user menu and never as a shell button.
            // See _setActionModeLogic() and _setActionButtonText().
            return bMoveEditButtonToHeader && Config.last("/core/shell/enablePersonalization");
        },

        /**
         * Creates the action mode button to edit pages.
         * Based on the config, the button will be created in the header or the user menu
         *
         * @param {string} sPageTitle The title of the page
         *
         * @private
         * @since 1.86.0
         */
        _createActionModeButton: async function (sPageTitle) {
            const sButtonText = sPageTitle ? resources.i18n.getText("PageRuntime.EditModeForPage.Activate", [sPageTitle])
                : resources.i18n.getText("PageRuntime.EditMode.Activate");
            const oActionButtonObjectData = {
                id: "ActionModeBtn",
                text: sButtonText,
                icon: "sap-icon://edit",
                press: [this.pressActionModeButton, this]
            };
            Log.debug("cep/editMode: create Action Mode Button", "Page runtime");
            if (this._moveEditActionToHeader()) {
                oActionButtonObjectData.tooltip = sButtonText;
                await this._createHeaderActionModeButton(oActionButtonObjectData);
            } else {
                this._createUserActionModeButton(oActionButtonObjectData);
            }
        },

        /**
         * Creates the action mode button in the shell header.
         *
         * @param {object} oActionButtonObjectData the button property
         *
         * @private
         * @since 1.86.0
         */
        _createHeaderActionModeButton: async function (oActionButtonObjectData) {
            let sRequirePath = "sap/ushell/ui/shell/ShellHeadItem";
            if (Config.last("/core/shellBar/enabled")) {
                sRequirePath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarItem";
                if (oActionButtonObjectData.press) {
                    oActionButtonObjectData.click = oActionButtonObjectData.press;
                    delete oActionButtonObjectData.press; // remove press handler, since it is not used in ShellBarItem
                }
            }

            const [ShellHeadItem] = await ushellUtils.requireAsync([sRequirePath]);

            const oActionsButton = new ShellHeadItem(oActionButtonObjectData);
            if (Config.last("/core/extension/enableHelp")) {
                oActionsButton.addStyleClass("help-id-ActionModeBtn"); // xRay help ID
                oActionsButton.addCustomData(new CustomData({
                    key: "help-id",
                    value: "ActionModeBtn",
                    writeToDom: true
                }));
            }
            const oRenderer = Container.getRendererInternal("fiori2");
            const oStateInfo = this._getStateInfoActionModeButton();
            oRenderer.showHeaderEndItem(oActionsButton.getId(), oStateInfo.bCurrentState, oStateInfo.aStates);
        },

        /**
         * Tells for which states the [Edit Current Page] button is relevant
         *
         * This information is needed when calling the renderer API.
         * @returns {{bCurrentState: boolean, aStates: string[]}}}
         *    <code>bCurrentState</code> indicates if the ActionModeButton is relevant for the ushell current state only.
         *    <code>aStates</code> indicates if the button is relevant for a list of states.
         *
         * @private
         * @since 1.101.0
         */
        _getStateInfoActionModeButton: function () {
            // Relevant for current state only if home and root intent differ
            // ... This is the work zone's use case.
            if (!this.bIsHomeIntentRootIntent) {
                return {
                    bCurrentState: true,
                    aStates: null
                };
            }

            // Relevant for the ushell home state otherwise
            return {
                bCurrentState: false,
                aStates: ["home"]
            };
        },

        /**
         * Creates the user action menu entry for the action mode.
         *
         * @param {object} oActionModeButtonObjectData the button property
         *
         * @private
         * @since 1.74.0
         */
        _createUserActionModeButton: function (oActionModeButtonObjectData) {
            const oStateInfo = this._getStateInfoActionModeButton();
            /*
             * Workaround:
             * For workzone the button is added via currentState. With this it gets destroyed when navigating to a different state.
             * When precreating the button it does not follow the currentState=true lifecycle.
             *
             * This could be resolved by integrating the Renderer component in the keepAlive mechanism.
             */
            new ActionItem(oActionModeButtonObjectData);

            const oAddActionButtonParameters = {
                controlType: "sap.ushell.ui.launchpad.ActionItem",
                oControlProperties: oActionModeButtonObjectData,
                bIsVisible: true,
                bCurrentState: oStateInfo.bCurrentState,
                aStates: oStateInfo.aStates
            };
            const oRenderer = Container.getRendererInternal("fiori2");
            oRenderer.addUserAction(oAddActionButtonParameters).done((oActionButton) => {
                // if xRay is enabled
                if (Config.last("/core/extension/enableHelp")) {
                    oActionButton.addStyleClass("help-id-ActionModeBtn");// xRay help ID
                }
                this._setActionButtonText();
            });
        },

        /**
         * Handles the button press on the user action menu entry.
         *
         * @private
         * @since 1.74.0
         */
        pressActionModeButton: function () {
            const oViewSettingsModel = this.getView().getModel("viewSettings");
            const bActionModeActive = oViewSettingsModel.getProperty("/actionModeActive");
            const bPersonalizationEnabled = oViewSettingsModel.getProperty("/personalizationEnabled");
            const bAddToMyHomeOnly = oViewSettingsModel.getProperty("/addToMyHomeOnly");

            sap.ui.require([
                "sap/ushell/components/pages/ActionMode"
            ], (ActionMode) => {
                if (bActionModeActive) {
                    ActionMode.cancel();
                    return;
                } else if (bPersonalizationEnabled || bAddToMyHomeOnly || this._isMyHomeRouteActive()) {
                    ActionMode.start(this, bAddToMyHomeOnly ? resources.i18n.getText("PageRuntime.EditMode.ExitAddTilesMode") : null);
                }
            });
        },

        /**
         * Cancels the action mode in case it is active
         *
         * @private
         * @since 1.84.0
         */
        _cancelActionMode: function () {
            const bActionModeActive = this.getView().getModel("viewSettings").getProperty("/actionModeActive");
            if (bActionModeActive) {
                sap.ui.require([
                    "sap/ushell/components/pages/ActionMode"
                ], (ActionMode) => {
                    ActionMode.cancel();
                });
            }
        },

        /**
         * Generic handler for action mode actions
         *
         * @param {string} sHandler Name of the handler within the action mode module
         * @param {sap.ui.base.Event} oEvent Event object
         * @private
         * @since 1.74.0
         */
        handleEditModeAction: function (sHandler, oEvent) {
            const oSource = oEvent.getSource();
            const oParameters = oEvent.getParameters();
            sap.ui.require([
                "sap/ushell/components/pages/ActionMode"
            ], (ActionMode) => {
                Log.debug("cep/editMode: handle Edit Mode Action", "Page runtime");
                ActionMode[sHandler](oEvent, oSource, oParameters);
            });
        },

        /**
         * Finds the ancestor control with a certain control type.
         *
         * @param {sap.ui.core.Control} control The control to start the search from.
         * @param {string} controlType The control type that matches the control that should be found and returned.
         * @returns {sap.ui.core.Control} A parent control that matches the given control type or null.
         * @private
         * @since 1.84.0
         */
        _getAncestorControl: function (control, controlType) {
            if (control && control.isA && control.isA(controlType)) {
                return control;
            } else if (control && control.getParent) {
                return this._getAncestorControl(control.getParent(), controlType);
            }
            return null;
        },

        /**
         * Handler for visualization drag and drop.
         *
         * @param {sap.ui.base.Event} oEvent Event object.
         * @returns {Promise<undefined>} Resolves when the Pages service is retrieved.
         * @private
         * @since 1.75.0
         */
        moveVisualization: function (oEvent) {
            const oDragged = oEvent.getParameter("draggedControl");
            let oDropped = oEvent.getParameter("droppedControl");
            let sDropPosition = oEvent.getParameter("dropPosition");
            const oBrowserEvent = oEvent.getParameter("browserEvent");
            const sKeyCode = oBrowserEvent && oBrowserEvent.keyCode;
            const oPage = this._getAncestorControl(oDragged, "sap.ushell.ui.launchpad.Page");
            const iPageIndex = parseInt(oDragged.getBindingContext().getPath().split("/")[2], 10);
            const oCurrentSection = this._getAncestorControl(oDragged, "sap.ushell.ui.launchpad.Section");
            const iCurrentSectionIndex = oPage.indexOfSection(oCurrentSection);
            const iCurrentVizIndex = oCurrentSection.indexOfVisualization(oDragged);
            const oCurrentViz = oCurrentSection.getVisualizations()[iCurrentVizIndex];
            const oCurrentPos = oCurrentSection.getItemPosition(oCurrentViz);
            let oTargetSection;
            let iTargetSectionIndex;
            let iTargetVizIndex;
            let oTargetViz;
            let oTargetPos;

            if (!oDropped) { // Target is an empty area of the section or an inner compactArea dnd (only happens during keyboard dnd)
                const bUp = oEvent.mParameters.browserEvent.keyCode === KeyCodes.ARROW_UP;
                const aSection = oPage.getSections();
                iTargetSectionIndex = iCurrentSectionIndex;

                while (true) {
                    iTargetSectionIndex = bUp ? --iTargetSectionIndex : ++iTargetSectionIndex;
                    oTargetSection = aSection[iTargetSectionIndex];

                    if (!oTargetSection || oTargetSection.getDefault()) {
                        oCurrentViz.invalidate();
                        return Promise.resolve();
                    }

                    if (oTargetSection.getShowSection() || oTargetSection.getEditable()) {
                        iTargetVizIndex = oTargetSection.getClosestCompactItemIndex(oDragged.getDomRef(), bUp);
                        oTargetViz = oTargetSection.getVisualizations()[iTargetVizIndex];
                        oTargetPos = oTargetSection.getItemPosition(oTargetViz);
                        if (oTargetPos.area !== oCurrentPos.area) {
                            oTargetPos = oCurrentPos;
                        }
                        break;
                    }
                }
            } else {
                // when dropping on the CompactArea, pretend it was dropped after its last item
                if (oDropped.isA("sap.ushell.ui.launchpad.section.CompactArea")) {
                    const aItems = oDropped.getItems();
                    if (aItems.length) {
                        oDropped = aItems[aItems.length - 1];
                        sDropPosition = "After";
                    }
                }

                oTargetSection = this._getAncestorControl(oDropped, "sap.ushell.ui.launchpad.Section");
                iTargetSectionIndex = oPage.indexOfSection(oTargetSection);

                if (oTargetSection.getDefault() && !oCurrentSection.getDefault()) {
                    oCurrentViz.invalidate();
                    return Promise.resolve();
                }

                iTargetVizIndex = oTargetSection.indexOfVisualization(oDropped);
                oTargetViz = oTargetSection.getVisualizations()[iTargetVizIndex];
                oTargetPos = oTargetSection.getItemPosition(oTargetViz);

                if (oTargetPos.index === -1) {
                    oTargetPos.area = oCurrentPos.area;
                }

                if (iCurrentSectionIndex === iTargetSectionIndex) {
                    if (sDropPosition === "Before" && iCurrentVizIndex < iTargetVizIndex) {
                        iTargetVizIndex--;
                    } else if (sDropPosition === "After" && iCurrentVizIndex > iTargetVizIndex) {
                        iTargetVizIndex++;
                    }

                    if (iCurrentVizIndex === iTargetVizIndex && oTargetPos.area === oCurrentPos.area) {
                        oCurrentViz.invalidate();
                        return Promise.resolve();
                    }
                } else if (sDropPosition === "After") {
                    iTargetVizIndex++;
                }
            }

            if ((iCurrentSectionIndex !== iTargetSectionIndex)
                && (sKeyCode === KeyCodes.ARROW_UP || sKeyCode === KeyCodes.ARROW_DOWN) // only adjust if keyboard dnd
                && (oCurrentPos.index > oTargetPos.index)) {
                iTargetVizIndex++;
            }

            let oPagesService;
            const oComponent = this.getOwnerComponent();
            return oComponent.getPagesService()
                .then((oService) => {
                    oPagesService = oService;
                    oPagesService.enableImplicitSave(false);
                    return oPagesService.moveVisualization(
                        iPageIndex,
                        iCurrentSectionIndex,
                        iCurrentVizIndex,
                        iTargetSectionIndex,
                        iTargetVizIndex
                    );
                })
                .then((oResult) => {
                    iTargetVizIndex = oResult.visualizationIndex;
                    if (oCurrentPos.area !== oTargetPos.area) {
                        const oVizData = {
                            displayFormatHint: oTargetPos.area
                        };
                        return oPagesService.updateVisualization(iPageIndex, iTargetSectionIndex, iTargetVizIndex, oVizData);
                    }
                    return Promise.resolve();
                })
                .then(() => {
                    return oPagesService.savePersonalization();
                })
                .then(() => {
                    const oViz = oTargetSection.getVisualizations()[iTargetVizIndex];
                    if (oViz) {
                        oTargetSection.focusVisualization(oViz);
                        oViz.invalidate();
                    }
                    const sMessage = this._getVizMoveMessage(iCurrentSectionIndex, iTargetSectionIndex, oCurrentPos.area, oTargetPos.area);
                    MessageToast.show(sMessage);
                })
                .finally(() => {
                    oPagesService.enableImplicitSave(true);
                });
        },

        /**
         * Returns the text message that should be announced after moving a Tile.
         * The message depends on the source and destination content areas.
         *
         * @param {sap.ushell.DisplayFormat} sFromAreaType The source content area
         * @param {sap.ushell.DisplayFormat} sToAreaType The target content area
         * @returns {string} The text message that should be announced
         * @private
         * @since 1.85.0
         */

        _getVizMoveMessage: function (iCurrentSectionIndex, iTargetSectionIndex, sFromAreaType, sToAreaType) {
            if (iCurrentSectionIndex === iTargetSectionIndex) {
                if (sFromAreaType !== sToAreaType) {
                    return resources.i18n.getText("PageRuntime.Message.VisualizationConverted");
                }
            }
            if (sFromAreaType === sToAreaType) {
                return resources.i18n.getText("PageRuntime.Message.VisualizationMoved");
            }
            return resources.i18n.getText("PageRuntime.Message.VisualizationMovedAndConverted");
        },

        /**
         * Handler for visualization drag and drop, when a dragged item enters a section.
         * Disables drop into a default section.
         * However, it is still possible to rearrange tiles inside of the default section.
         *
         * @param {sap.ui.base.Event} oEvent Event object
         * @private
         * @since 1.75.0
         */
        onDragEnter: function (oEvent) {
            const oTargetSection = oEvent.getParameter("dragSession").getDropControl();

            if (oTargetSection.getDefault()) {
                oEvent.preventDefault();
            }
        },

        /**
         * Handler for visualization drag and drop, when a dragged item enters an area inside a section.
         * Checks if the vizInstance supports the display format of the target area.
         *
         * @param {sap.ui.base.Event} oEvent Event object
         * @private
         * @since 1.84.0
         */
        onAreaDragEnter: function (oEvent) {
            const sSourceArea = oEvent.getParameter("sourceArea");
            const sTargetArea = oEvent.getParameter("targetArea");

            // same area means no change of the display format
            if (sSourceArea === sTargetArea) {
                return;
            }

            const oVizInstance = oEvent.getParameter("dragControl");
            const aAvailableDisplayFormats = oVizInstance.getAvailableDisplayFormats();

            if (aAvailableDisplayFormats.indexOf(sTargetArea) === -1) {
                // VizInstance only supports standardWide
                if (sTargetArea === DisplayFormat.Standard && aAvailableDisplayFormats.indexOf(DisplayFormat.StandardWide) > -1) {
                    return;
                }
                // VizInstance only supports flatWide
                if (sTargetArea === DisplayFormat.Flat && aAvailableDisplayFormats.indexOf(DisplayFormat.FlatWide) > -1) {
                    return;
                }
                oEvent.getParameter("originalEvent").preventDefault();
            }
        },

        /**
         * Handles the resize event triggered by copilot docking, the grid container containerQuery must be enabled in this case.
         *
         * @param {string} channel The channel name of the event
         * @param {string} event The name of the event
         * @since 1.77.0
         * @private
         */
        _handleUshellContainerDocked: function (channel, event) {
            this._oViewSettingsModel.setProperty("/ushellContainerDocked", event === "shellFloatingContainerIsDocked");
        },

        /**
         * Returns true if the MyHome feature is enabled and the current spaceId matches the MyHome space id.
         *
         * @returns {boolean} The boolean result.
         * @private
         * @since 1.89.0
         */
        _isMyHomeRouteActive: function () {
            return Config.last("/core/spaces/myHome/enabled") && Config.last("/core/spaces/myHome/userEnabled") &&
                Config.last("/core/spaces/myHome/myHomeSpaceId") === this.sCurrentTargetSpaceId;
        },

        /** Returns the home page data as stored in the model or null if the home page is not present
         * @returns {object} Home page data
         * @private
         */
        _getMyHomePageData: function () {
            const aPages = this.getView().getModel().getProperty("/pages") || [];
            const sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");
            for (let i = 0; i < aPages.length; i++) {
                if (aPages[i] && aPages[i].id === sMyHomePageId) {
                    return aPages[i];
                }
            }
            return null;
        },

        /** Returns true if the page is empty
         * @returns {boolean} The boolean result
         * @private
         */
        _isMyHomePageEmpty: function () {
            const oPage = this._getMyHomePageData();
            if (oPage && oPage.sections) {
                return oPage.sections.every((oSection) => {
                    const aViz = oSection.visualizations;
                    return !(aViz && aViz.length); // all sections must be empty
                });
            }
            return false;
        },

        /**
         * If editMode is entered:
         * - checks if the editMode is entered from the initial MyHome page and navigates to the 'real' MyHome page.
         * If editMode is left:
         * - checks if the editMode is left from the 'real' MyHome page and navigates to the initial MyHome page.
         *
         * @private
         * @param {boolean} editMode Boolean indicating if editMode is entered or left.
         * @returns {Promise<undefined>} A promise resolving when navigation is finished.
         * @since 1.89.0
         */
        handleMyHomeActionMode: async function (editMode) {
            if (this._isMyHomeRouteActive()) {
                if (editMode) {
                    await this._enterMyHomeActionMode(); // Add message strip in edit mode
                } else if (this._isMyHomePageEmpty()) {
                    await this._navigateToInitialMyHome(); // Navigate to illustrated page
                }
            }
            // Do nothing - normal navigation
        },

        /**
         * Navigates to the 'real' MyHome page and adds a MessageStrip.
         *
         * @returns {Promise<undefined>} A promise resolving when the navigation is completed.
         * @private
         * @since 1.89.0
         */
        _enterMyHomeActionMode: async function () {
            await this._navigate(this.sCurrentTargetPageId, this.sCurrentTargetSpaceId, true);
            const bIsImportEnabled = await MyHomeImport.isImportEnabled();

            if (!bIsImportEnabled) {
                if (this._pMessageStrip) { // do not show the message strip after user dismissed it
                    this._pMessageStrip.then((messageStrip) => {
                        messageStrip.setVisible(false);
                    });
                }
                return; // Import is disabled. Don't show the message strip
            }

            if (!this._pMessageStrip) {
                this._pMessageStrip = new Promise((resolve, reject) => {
                    sap.ui.require(["sap/ui/core/Fragment"], async (Fragment) => {
                        try {
                            const oMessageStrip = await Fragment.load({
                                name: "sap.ushell.components.pages.view.MessageStrip",
                                controller: this
                            });

                            // In case the message strip visibility is managed in another place
                            EventHub.on("importBookmarksFlag").do((value) => {
                                oMessageStrip.setVisible(!!value);
                            });
                            oMessageStrip.addStyleClass("sapUiSmallMarginBottom");
                            resolve(oMessageStrip);
                        } catch (oError) {
                            reject(oError);
                        }
                    }, reject);
                });
            }

            const oMessageStrip = await this._pMessageStrip;
            this.oPagesNavContainer.getCurrentPage().getContent()[0].setMessageStrip(oMessageStrip);
        },

        /**
         * Loads and opens the import dialog for the MyHome page.
         *
         * @returns {Promise<sap.m.Dialog>} A promise resolving to the dialog, when opened.
         * @private
         * @since 1.89.0
         */
        openMyHomeImportDialog: function () {
            if (!this._pLoadImportDialog) {
                this._pLoadImportDialog = new Promise((resolve, reject) => {
                    sap.ui.require(["sap/ushell/components/pages/controller/ImportDialog.controller"], (ImportDialogController) => {
                        resolve(new ImportDialogController());
                    }, reject);
                });
            }
            return this._pLoadImportDialog.then((oImportDialogController) => {
                return oImportDialogController.open();
            });
        },

        /**
         * Opens the MyHome import dialog.
         * @private
         * @since 1.89.0
         */
        onImportDialogPress: function () {
            this.openMyHomeImportDialog();
        },

        /**
         * The user has pressed "x" button on the import MessageStrip. Save the decision
         * @private
         */
        onMessageStripClose: function () {
            MyHomeImport.setImportEnabled(false);
            sap.ui.require(["sap/m/MessageBox"], (MessageBox) => {
                MessageBox.information(resources.i18n.getText("MyHome.InitialPage.MessageStrip.Popup"));
            });
        },

        /**
         * Removes the MyHome page from the PagesNavContainer.
         *
         * @private
         */
        _removeMyHomePage: function () {
            this.oPagesNavContainer.removePage("sapUshellMyHomePage");
        },

        /**
         * Creates a string to be used in the aria-label property in the HTML of a section element.
         *
         * If the section has a title, the title is used in a translated text.
         * If the section has no title, a translated text for empty sections is used, including the section position.
         * In display mode empty sections are not displayed, therefore the position can be different than in edit mode.
         *
         * @param {string} sTitle The section title.
         * @param {string} sSectionPath The path in the model to the current section.
         * @param {boolean} bActionModeEditActive Flag for edit mode.
         * @returns {string} The aria-label
         * @private
         */
        _formatSectionAriaLabel: function (sTitle, sSectionPath, bActionModeEditActive) {
            if (sTitle && sTitle.trim()) { return resources.i18n.getText("Section.Description", [sTitle]); }
            if (!sSectionPath) { return ""; }

            const aParts = sSectionPath.split("/");
            if (aParts.length !== 5) { return ""; }

            const sPageSectionsPath = `/${aParts[1]}/${aParts[2]}/${aParts[3]}`;
            let aSections = this.getView().getModel().getProperty(sPageSectionsPath);
            const oCurrentSection = this.getView().getModel().getProperty(sSectionPath);

            if (!aSections || aSections.length === 0) { return ""; }
            if (!oCurrentSection) { return ""; }

            if (!bActionModeEditActive) {
                // In display mode: filter out the hidden and empty sections as they are not displayed
                aSections = aSections.filter((oSection) =>
                    oSection.visible &&
                    oSection.visualizations &&
                    oSection.visualizations.length > 0
                );
            }

            const iIndex = aSections.indexOf(oCurrentSection);

            if (iIndex < 0) { return ""; }

            return resources.i18n.getText("Section.Description.EmptySectionAriaLabel", [iIndex + 1]);
        },

        /**
         * Formatter to show/hide the 'Reset' button for a section.
         *
         * @param {string} sectionId The section id.
         * @param {boolean} preset The preset property.
         * @returns {boolean} The result.
         * @private
         */
        _sectionEnableReset: function (sectionId, preset) {
            // Determine the preset 'My Apps' section on the My Home page.
            if (sectionId === Config.last("/core/spaces/myHome/presetSectionId")) {
                return false;
            }
            return preset;
        },

        /**
         * Formatter to show/hide the 'Delete' button for a section.
         *
         * @param {string} sectionId The section id.
         * @param {boolean} preset The preset property.
         * @returns {boolean} The result.
         * @private
         */
        _sectionEnableDelete: function (sectionId, preset) {
            // Determine the preset 'My Apps' section on the My Home page.
            if (sectionId === Config.last("/core/spaces/myHome/presetSectionId")) {
                return false;
            }
            return !preset;
        },

        /**
         * Hides the Pages Runtime.
         * Navigates the Pages Runtime NavContainer to the empty page.
         * @private
         */
        hideRuntime: function () {
            Log.debug("cep/editMode: navigate to empty page", "Page runtime");
            this._hideActionModeButton();
            this.oPagesRuntimeNavContainer.to(this.oEmptyPage);
        },

        /**
         * Returns the page title, the space title or both if requested.
         *
         * @param {string} pageTitle The page title
         * @param {string} spaceTitle The spaceTitle
         * @param {boolean} showPageTitle Shall the page title be displayed
         * @param {boolean} showSpaceTitle Shall the space title be displayed
         *
         * @returns {string} The title to display
         *
         * @private
         * @since 1.115
         */
        _formatPageTitle: function (pageTitle, spaceTitle, showPageTitle, showSpaceTitle) {
            if (showPageTitle && showSpaceTitle) {
                return `${spaceTitle} - ${pageTitle}`;
            } else if (showSpaceTitle) {
                return spaceTitle;
            }
            return pageTitle;
        }

    });
});
