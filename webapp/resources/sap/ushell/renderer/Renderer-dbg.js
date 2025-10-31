// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * Default renderer for SAP Fiori launchpad.
 * Publishes all lifecycle events as described in the documentation of the "sap.ushell" namespace.
 */
sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/core/Element",
    "sap/ui/core/UIComponent",
    "sap/ushell/ui/shell/ToolAreaItem",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/utils",
    "sap/ushell/appIntegration/AppLifeCycle",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/resources",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/extend",
    "sap/ui/base/Object",
    "sap/base/util/ObjectPath",
    "sap/ui/core/library",
    "sap/ushell/library",
    "sap/ui/core/mvc/View",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/m/NotificationListItem",
    "sap/ushell/renderer/ShellLayout",
    "sap/ushell/renderer/utils",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/state/ShellModel",
    "sap/ushell/state/StateManager",
    "sap/ushell/navigation/NavigationState",
    "sap/ushell/renderers/fiori2/RendererExtensions" // restore deprecated globals
], function (
    Component,
    Element,
    UIComponent,
    ToolAreaItem,
    Config,
    Container,
    EventHub,
    ushellUtils,
    AppLifeCycleAI,
    Device,
    JSONModel,
    oSharedComponentUtils,
    AppConfiguration,
    ushellResources,
    hasher,
    jQuery,
    Log,
    deepExtend,
    extend,
    BaseObject,
    ObjectPath,
    coreLibrary,
    ushellLibrary,
    View,
    ShellHeadItem,
    NotificationListItem,
    ShellLayout,
    RendererUtils,
    ActionItem,
    ShellModel,
    StateManager,
    NavigationState,
    RendererExtensions // restore deprecated globals
) {
    "use strict";

    // shortcut for sap.ui.core.mvc.ViewType
    const ViewType = coreLibrary.mvc.ViewType;

    // shortcut for sap.ushell.AppType
    const AppType = ushellLibrary.AppType;

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;
    const {
        Headerless,
        Merged,
        Blank,
        Lean
    } = ShellMode;

    /**
     * @alias sap.ushell.renderer.Renderer
     * @class
     * @classdesc The SAPUI5 component of SAP Fiori Launchpad renderer for the Unified Shell.
     * @extends sap.ui.core.UIComponent
     * @since 1.15.0
     * @private
     */
    const Renderer = UIComponent.extend("sap.ushell.renderer.Renderer", /** @lends sap.ushell.renderer.Renderer.prototype */ {
        metadata: {
            version: "1.141.1",
            dependencies: {
                version: "1.141.1",
                libs: ["sap.ui.core", "sap.m"],
                components: []
            },
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            routing: {
                config: {
                    async: true,
                    controlId: "viewPortContainer",
                    clearAggregation: false,
                    controlAggregation: "pages"
                },
                routes: [{
                    name: "appfinder-legacy",
                    pattern: "Shell-home&/appFinder/:menu:/:filter:" // TODO root intent must come from configuration
                }, {
                    name: "home",
                    pattern: ["Shell-home?:hashParameters:", "Shell-home&/:innerHash*:", "Shell-home"], // TODO must come from configuration
                    target: (function () {
                        if (Config.last("/core/homeApp/enabled")) {
                            return "homeapp";
                        }

                        // SAP Start
                        if (Config.last("/core/workPages/enabled") && !Config.last("/core/workPages/runtimeSwitcher")) {
                            return "workpages";
                        }

                        // SAP Build Work Zone, standard edition: "New Experience"
                        if (Config.last("/core/workPages/enabled") && Config.last("/core/workPages/runtimeSwitcher")) {
                            return "runtimeSwitcher";
                        }

                        // Pages Spaces Mode
                        if (Config.last("/core/spaces/enabled")) {
                            return "pages";
                        }

                        // Classic Homepage
                        return "home";
                    })()
                }, {
                    name: "appfinder",
                    pattern: [ // TODO must come from configuration
                        "Shell-appfinder?:hashParameters:&/:innerHash*:",
                        "Shell-appfinder?:hashParameters*:",
                        "Shell-appfinder&/:innerHash*:",
                        "Shell-appfinder"
                    ],
                    target: (function () {
                        if (
                            Config.last("/core/site/siteId") &&
                            Config.last("/core/catalog/enabled") &&
                            Config.last("/core/workPages/contentFinderStandalone") &&
                            Config.last("/core/workPages/enabled")
                        ) {
                            return "contentfinder";
                        }

                        return Config.last("/core/catalog/enabled") ? "appfinder" : undefined; // Avoid the loading of Component
                    })()
                }, {
                    name: "openFLPPage",
                    pattern: [
                        "Launchpad-openFLPPage?:hashParameters:",
                        "Launchpad-openFLPPage"
                    ],
                    target: (function () {
                        // SAP Start
                        if (Config.last("/core/workPages/enabled") && !Config.last("/core/workPages/runtimeSwitcher")) {
                            return "workpages";
                        }

                        // SAP Build Work Zone, standard edition: "New Experience"
                        if (Config.last("/core/workPages/enabled") && Config.last("/core/workPages/runtimeSwitcher")) {
                            return "runtimeSwitcher";
                        }

                        if (Config.last("/core/spaces/enabled")) {
                            return "pages";
                        }

                        return "home";
                    })()
                }, {
                    // Testing workpages - technical route
                    name: "openWorkPage",
                    pattern: [
                        "Launchpad-openWorkPage?:hashParameters:",
                        "Launchpad-openWorkPage"
                    ],
                    target: "workpages"
                }, {
                    name: "wzsearch",
                    pattern: [ // TODO must come from configuration
                        "WorkZoneSearchResult-display:?query:"
                    ],
                    target: "wzsearch"
                }],
                targets: {
                    home: {
                        name: "sap.ushell.components.homepage",
                        type: "Component",
                        id: "Shell-home-component",
                        options: {
                            manifest: false,
                            asyncHints: {
                                preloadBundles: Config.last("/core/home/featuredGroup/enable") ?
                                    ["sap/ushell/preload-bundles/homepage-af-dep.js", "sap/ushell/components/homepage/cards-preload.js"] :
                                    ["sap/ushell/preload-bundles/homepage-af-dep.js"]
                            },
                            componentData: {
                                // use additional settings here as needed...
                                config: {
                                    enablePersonalization: true,
                                    enableHomePageSettings: false
                                }
                            }
                        }
                    },
                    appfinder: {
                        name: "sap.ushell.components.appfinder",
                        type: "Component",
                        // TODO title: "",
                        id: "Shell-appfinder-component",
                        options: {
                            manifest: false,
                            asyncHints: { preloadBundles: ["sap/ushell/preload-bundles/homepage-af-dep.js"] },
                            componentData: {
                                // use additional settings here as needed...
                                config: {
                                    enablePersonalization: true,
                                    enableHomePageSettings: false
                                }
                            }
                        }
                    },
                    contentfinder: {
                        name: "sap.ushell.components.contentFinderStandalone",
                        type: "Component",
                        id: "Shell-appfinder-component",
                        options: {
                            manifest: true,
                            asyncHints: { preloadBundles: [] },
                            componentData: {}
                        }
                    },
                    pages: {
                        name: "sap.ushell.components.pages",
                        type: "Component",
                        id: "pages-component",
                        options: {
                            componentData: {},
                            asyncHints: {
                                preloadBundles: ["sap/ushell/preload-bundles/homepage-af-dep.js"]
                            }
                        }
                    },
                    workpages: {
                        // always use the default runtime for direct embedding for now
                        // to simplify the contract for DWS work page builder
                        name: Config.last("/core/workPages/defaultComponent/name"),
                        type: "Component",
                        id: "workPageRuntime-component",
                        options: Config.last("/core/workPages/defaultComponent")
                    },
                    runtimeSwitcher: {
                        name: "sap.ushell.components.runtimeSwitcher",
                        type: "Component",
                        id: "runtimeSwitcher-component",
                        options: {
                            componentData: {}
                        }
                    },
                    wzsearch: {
                        name: "sap.ushell.components.cepsearchresult.app",
                        type: "Component",
                        id: "cepsearchresult-app-component",
                        options: {
                            manifest: true,
                            componentData: {
                                // use additional settings here as needed...
                                config: {
                                    enablePersonalization: true,
                                    enableHomePageSettings: false
                                }
                            }
                        }
                    }
                }
            }
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            const oRouter = this.getRouter();

            // Track flp navigation with ShellAnalytics
            [
                "appfinder-legacy",
                "home",
                "appfinder",
                "openFLPPage",
                "openWorkPage",
                "wzsearch"
            ].forEach((sRouteName) => {
                oRouter.getRoute(sRouteName).attachBeforeMatched(() => {
                    EventHub.emit("trackHashChange", hasher.getHash());
                    // all targets have to close the FESR Record on their own

                    NavigationState.endNavigation();
                });
            });

            // Add HomeApp target dynamically
            if (Config.last("/core/homeApp/enabled")) {
                this._getHomeAppTarget().then((oTarget) => {
                    oRouter.getTargets().addTarget("homeapp", oTarget);
                    oRouter.getTarget("homeapp").attachEventOnce("display", () => {
                        // Core-ext complement has been loaded by the routing component of the renderer.
                        // Trigger instantiation of SchedulingAgent which is bringing up the menu bar.
                        EventHub.emit("CoreResourcesComplementLoaded", { status: "success" });
                    });
                });
            }

            oRouter.getRoute("home").attachMatched(this._prepareHomepage, this);
            oRouter.getRoute("openFLPPage").attachMatched(this._prepareHomepage, this);
            oRouter.getRoute("openWorkPage").attachMatched(this._prepareHomepage, this);

            oRouter.getRoute("appfinder-legacy").attachMatched((oEvent) => {
                // TODO consider innerapp routes from old intent, e.g.:
                //   - #Shell-home&/appFinder/catalog
                //   - #Shell-home&/appFinder/catalog/%7B"tileFilter":"set","tagFilter":%5B%5D,"targetGroup":""%7D
                oRouter.navTo("appfinder", {}, true);
            });

            oRouter.getRoute("appfinder").attachMatched(async function (oEvent) {
                if (!Config.last("/core/catalog/enabled")) {
                    Log.warning("AppFinder is disabled. Re-route to the homepage.");
                    oRouter.navTo("home", null, true);
                    return;
                }

                const oComponent = Component.getComponentById(this.createId("Shell-appfinder-component"));
                const oData = oEvent.getParameter("arguments");
                if (Container.getRendererInternal("fiori2")) {
                    AppLifeCycleAI.getShellUIService().setBackNavigation();
                    Container.getRendererInternal("fiori2").setCurrentCoreView("appFinder");
                }
                AppConfiguration.setCurrentApplication(null);

                const oAppFinderRouter = oComponent.getRouter();
                // wait for the root view to be loaded before the inner hash is forwarded to the AppFinder component
                oComponent.getRootControl().loaded().then(() => {
                    oAppFinderRouter.parse(oData["innerHash*"] || "");
                });

                AppLifeCycleAI.switchViewState(LaunchpadState.App, false, "Shell-appfinder");

                oSharedComponentUtils.initializeAccessKeys();
            }, this);

            oRouter.getRoute("wzsearch").attachMatched((oEvent) => {
                AppLifeCycleAI.getShellUIService().setBackNavigation();
                AppLifeCycleAI.switchViewState(LaunchpadState.App, false, "cepsearchresult-app");
            });

            const oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");
            this.setModel(ushellResources.i18nModel, "i18n");
        }
    });

    /**
     * Hook which is called every time a route is matched
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.100.0
     */
    Renderer.prototype._prepareHomepage = function (oEvent) {
        if (AppConfiguration.getCurrentApplication()) {
            Container.getServiceAsync("ShellNavigationInternal").then((ShellNavigationInternal) => {
                ShellNavigationInternal.setIsInitialNavigation(false);
            });
        }

        const sCurrentHash = hasher.getHash();
        if (!Config.last("/core/spaces/enabled") && sCurrentHash.indexOf("Launchpad-openFLPPage") === 0) {
            Container.getServiceAsync("ShellNavigationInternal").then((ShellNavigationInternal) => {
                ShellNavigationInternal.replaceHashWithoutNavigation("Shell-home");
            });
        }

        const sCustomHomeTitle = Config.last("/core/shell/homePageTitle");
        const sHomeTitle = ushellResources.getTranslationFromJSON(sCustomHomeTitle) || ushellResources.i18n.getText("homeBtn_tooltip");

        const sRootIntent = this.getShellConfig().rootIntent;
        const bIsRootIntentFlpHome = !sRootIntent || ushellUtils.isFlpHomeIntent(sRootIntent);

        // switch to home first so that #set calls below have effect
        AppLifeCycleAI.switchViewState(bIsRootIntentFlpHome ? LaunchpadState.Home : LaunchpadState.App, false, "Shell-home");

        this.setCurrentCoreView("home");
        AppConfiguration.setCurrentApplication(null);

        AppLifeCycleAI.getShellUIService().setTitle(sHomeTitle);
        AppLifeCycleAI.getShellUIService().setHierarchy();
        AppLifeCycleAI.getShellUIService().setRelatedApps();

        oSharedComponentUtils.initializeAccessKeys();
    };

    /**
     * Returns the configured homeApp
     * @returns {Promise<object>} Resolves the oTargetOptions for the homeapp target
     *
     * @private
     * @since 1.100.0
     */
    Renderer.prototype._getHomeAppTarget = function () {
        return Container.getServiceAsync("Ui5ComponentLoader").then((Ui5ComponentLoader) => {
            const oHomeAppComponent = Config.last("/core/homeApp/component");
            const aCoreResourcesComplement = Ui5ComponentLoader.getCoreResourcesComplementBundle();

            if (oHomeAppComponent.url) {
                return {
                    name: "rendererTargetWrapper",
                    type: "Component",
                    id: "homeApp-component-wrapper",
                    path: "sap/ushell/renderer", // needed, otherwise sap/ushell/components is used
                    options: {
                        componentData: {
                            componentId: "homeApp-component",
                            name: oHomeAppComponent.name,
                            url: oHomeAppComponent.url
                        },
                        asyncHints: Object.assign({}, oHomeAppComponent.asyncHints || {}, {
                            // Merging dynamic asyncHints of FLP startup config and static preload bundles
                            preloadBundles: aCoreResourcesComplement
                        })
                    }
                };
            }

            return {
                name: "error",
                type: "Component",
                id: "homeApp-component",
                path: "sap/ushell/components/homeApp", // needed, otherwise sap/ushell/components is used
                options: {
                    componentData: {},
                    asyncHints: {
                        preloadBundles: aCoreResourcesComplement
                    }
                }
            };
        });
    };

    /**
     * @returns {object} an instance of Shell view
     * @since 1.15.0
     * @private
     */
    Renderer.prototype.createContent = function () {
        const viewData = this.getComponentData() || {};
        const oAppConfig = {
            applications: { "Shell-home": {} },
            rootIntent: "Shell-home"
        };
        const sCurrentShellMode = StateManager.getShellMode();

        // the code below migrates a configuration structure from version 1.28 or older, to the default expected configuration structure in 1.30
        if (viewData.config) {
            // We need to pass this flag in order to check lately the possibility of local resolution for empty hash
            if (viewData.config.rootIntent === undefined) {
                viewData.config.migrationConfig = true;
            }
            // Merge all needed configuration
            // config.applications["Shell-home"] is created with the first extend.
            viewData.config = deepExtend(
                oAppConfig,
                viewData.config
            );
            extend(
                viewData.config.applications["Shell-home"],
                Config.last("/core/home"),
                Config.last("/core/catalog")
            );

            // handle the Personalization flag
            if ([Headerless, Merged, Blank].includes(sCurrentShellMode)) {
                viewData.config.enablePersonalization = false;
                Config.emit("/core/shell/enablePersonalization", false);
            } else {
                viewData.config.enablePersonalization = Config.last("/core/shell/enablePersonalization");
            }

            if ([Lean].includes(sCurrentShellMode)) {
                viewData.config.showRecentActivity = false;
            } else if (viewData.config.showRecentActivity === undefined) {
                viewData.config.showRecentActivity = Config.last("/core/shell/model/showRecentActivity");
            }
            Config.emit("/core/shell/model/showRecentActivity", viewData.config.showRecentActivity);

            // If the personalization is disabled, do not create the AppFinder and Edit buttons in the header
            if (!viewData.config.enablePersonalization) {
                viewData.config.moveEditHomePageActionToShellHeader = false;

                if (!viewData.config.enableAppFinder) {
                    viewData.config.moveAppFinderActionToShellHeader = false;
                }
            }
        }

        if (!this.getComponentData().async) {
            let oView;
            Log.error("sap/ushell/renderer/Renderer component is created synchronously. Synchronous instantiation is not allowed. Please use async:true in component data");
            (function () {
                oView = this._createSyncContent(viewData);
            }.bind(this))();
            return oView;
        }

        return View.create({
            id: "mainShell",
            viewName: "module:sap/ushell/renderer/Shell.view",
            height: "100%",
            viewData: viewData
        }).then((oView) => {
            oView.addStyleClass("sapUshellRenderer");
            this._oShellView = oView;

            // initialize the RendererExtensions after the view is created.
            // This also publishes an external event that indicates that sap.ushell.renderer.RendererExtensions can be used.
            this.shellCtrl = oView.getController();
            RendererUtils.init(oView.getController());
            return oView;
        });
    };

    /**
     * Creates the renderer synchronously.
     * @param {object} viewData The viewData.
     * @returns {sap.ui.core.JSView} The Renderer view.
     *
     * @since 1.121.0
     * @private
     * @deprecated since 1.120
     */
    Renderer.prototype._createSyncContent = function (viewData) {
        const oSyncView = sap.ui.view("mainShell", { // LEGACY API (deprecated)
            type: ViewType.JS,
            viewName: "sap.ushell.renderers.fiori2.Shell",
            height: "100%",
            viewData: viewData
        });
        oSyncView.addStyleClass("sapUshellRenderer");
        this._oShellView = oSyncView;

        oSyncView.loaded().then((oCreatedView) => {
            // initialize the RendererExtensions after the view is created.
            // This also publishes an external event that indicates that sap.ushell.renderer.RendererExtensions can be used.
            this.shellCtrl = oCreatedView.oController;
            RendererUtils.init(oCreatedView.getController());
        });

        return oSyncView;
    };

    /**
     * Creates an extended shell state.<br>
     * An extended shell state is an extension for the current shell that can be applied by the function applyExtendedShellState.<br>
     *
     * <pre>
     * Container.getRendererInternal("fiori2").createCustomShellState('test1', function () {
     *   var oTileActionsButton = Container.getRendererInternal("fiori2").addActionButton("sap.ushell.ui.launchpad.ActionItem",{
     *   id: "xxx2",
     *   text: 'aaaaaaaaaaaa',
     *   icon: 'sap-icon://edit',
     *   tooltip: resources.i18n.getText("activateActionMode"),
     *   press: function () {
     *     sap.ushell.components.homepage.ActionMode.toggleActionMode(oModel, "Menu Item");
     *   }}, true, true);
     * });
     * </pre>
     *
     * @param {string} sShellName Name of the extended shell state.
     * @param {function} fnCreationInstructions Shell API commands for creating the extension.
     *
     * @since 1.35
     * @private
     * @deprecated since 1.120. Deprecated without successor.
     */
    Renderer.prototype.createExtendedShellState = function (sShellName, fnCreationInstructions) {
        Log.error("The function createExtendedShellState was deprecated  discontinued.");
    };

    /**
     * Set the extended shell to be active.<br>
     * This function changes the shell state to display the extended shell merged with the current shell.<br>
     *
     * <b>Example:</b>
     * <pre>
     * Container.getRendererInternal("fiori2").createCustomShellState('test1', function () {
     *   var oTileActionsButton = Container.getRendererInternal("fiori2").addActionButton("sap.ushell.ui.launchpad.ActionItem",{
     *   id: "xxx2",
     *   text: 'aaaaaaaaaaaa',
     *   icon: 'sap-icon://edit',
     *   tooltip: resources.i18n.getText("activateActionMode"),
     *   press: function () {
     *     sap.ushell.components.homepage.ActionMode.toggleActionMode(oModel, "Menu Item");
     *   }}, true, true);
     * });
     * Container.getRendererInternal("fiori2").applyExtendedShellState('test1');
     * </pre>
     *
     * @param {string} sShellName Name of the extended shell state.
     * @param {function} fnCustomMerge fnCustomMerge
     * @since 1.35
     * @private
     * @deprecated since 1.120. Functionality was discontinued.
     */
    Renderer.prototype.applyExtendedShellState = function (sShellName, fnCustomMerge) {
        Log.error("The function applyExtendedShellState was discontinued.");
    };

    /**
     * Sets the content of the left pane in Fiori launchpad, in the given launchpad states
     * (see sap.ushell.renderer.Renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is added in all states.
     *
     * <b>Example:</b>
     * <pre>
     * var oButton = new Button(id: "newButton", text: "Test Button"); // e.g. sap.m.Button
     * var oRenderer = Container.getRendererInternal("fiori2");
     * oRenderer.showActionButton([oButton.getId()], false, ["home", "app"]);
     * </pre>
     *
     * @param {string|string[]} aIds Either ID or an array of IDs of elements to be added to the shell.
     * @param {boolean} bCurrentState if true, add the current component only to the current instance of the rendering of the shell.
     *   if false, add the component to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the aIds.
     * @since 1.30
     * @private
     */
    Renderer.prototype.showLeftPaneContent = function (aIds, bCurrentState, aStates) {
        this._updateItemStates(aIds, bCurrentState, aStates, "sidePane.items", Operation.Add);
    };

    /**
     * Creates and displays one or more HeaderItem controls according to the given control IDs and Shell states<br>
     * (see sap.ushell.renderer.Renderer.LaunchpadState).<br><br>
     * The HeaderItem controls will be displayed on the left side of the Fiori Launchpad shell header according to the given display parameters.<br>
     * There can be up to three header items. If the number of existing header items plus the given ones exceeds 3,
     * then the operation fails and no new header items are created.<br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.ushell.ui.shell.ShellHeadItem();
     * var button2 = new sap.ushell.ui.shell.ShellHeadItem();
     * var renderer = Container.getRendererInternal("fiori2");
     * renderer.showHeaderItem ([button1.getId(), button2.getId()], false, ["home", "app"]);
     * </pre>
     * <br>Note: Was public with fiori2/Renderer
     * @param {string|string[]} vIds Either ID or an array of IDs of headerItem controls to be added to the shell header.
     * @param {boolean} bCurrentState If <code>true</code> then the new created controls are added to the current rendered shell state.
     *   When the user navigates to another application (including the Home page) then the controls will be removed.
     *   If <code>false</code> then the controls are added to the LaunchPadState itself.
     * @param {string[]} vStates Valid only if bCurrentState is <code>false</code>.
     *   A list of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) in which the controls are added.
     *   If no launchpad state is provided the controls are added in all states.
     *   @see sap.ushell.renderer.Renderer.LaunchpadState.
     * @since 1.30
     * @private
     */
    Renderer.prototype.showHeaderItem = function (vIds, bCurrentState, vStates) {
        const aIds = Array.isArray(vIds) ? vIds : [vIds];
        const aStates = this._sanitizeStates(vStates);

        aIds.forEach((sId) => {
            StateManager.updateManagedControl(sId, !bCurrentState);

            if (bCurrentState) {
                StateManager.updateCurrentState("header.headItems", Operation.Add, sId);
                return;
            }

            StateManager.updateBaseStates(aStates, "header.headItems", Operation.Add, sId);
        });
    };

    /**
     * Displays RightFloatingContainerItem on the left side of the Fiori launchpad shell, in the given launchpad states
     * (see sap.ushell.renderer.Renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.ushell.ui.shell.RightFloatingContainerItem();
     * var renderer = Container.getRendererInternal("fiori2");
     * renderer.showRightFloatingContainerItem(button1.getId(), false, ["home", "app"]);
     * </pre>
     *
     * @param {string|string[]} aIds Either ID or an array of IDs of elements to be added to the Tool Area.
     * @param {boolean} bCurrentState if true, add the current RightFloatingContainerItems only to the current instance of the rendering of the shell.
     *   if false, add the RightFloatingContainerItems to the LaunchPadState itself.
     * @param {string[]} aStates Only valid if bCurrentState is set to false.
     *   A list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the aIds.
     * @since 1.37
     * @private
     */
    Renderer.prototype.showRightFloatingContainerItem = function (aIds, bCurrentState, aStates) {
        this._updateItemStates(aIds, bCurrentState, aStates, "rightFloatingContainer.items", Operation.Add);
    };

    /**
     * Displays RightFloatingContainerItem on the right side of the Fiori launchpad shell.
     *
     * @param {boolean} bShow Defines whether to show or hide the
     * @since 1.37
     * @private
     */
    Renderer.prototype.showRightFloatingContainer = function (bShow) {
        StateManager.updateCurrentState("rightFloatingContainer.visible", Operation.Set, bShow);
    };

    /**
     * Displays ToolAreaItems on the left side of the Fiori Launchpad shell, in the given launchpad states.
     *
     * <b>Example:</b>
     * <pre>
     * sap.ui.require(["sap/ushell/ui/shell/ToolAreaItem"], function (ToolAreaItem) {
     *     var oRenderer = Container.getRendererInternal("fiori2"),
     *         oToolAreaItem = new ToolAreaItem({ icon: "sap-icon://wrench" });
     *     renderer.showToolAreaItem(oToolAreaItem.getId(), false, ["home", "app"]);
     * });
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string|string[]} aIds A single ID or an array of IDs to add to the Tool Area.
     * @param {boolean} bCurrentState If <code>true</code>, add the items to the currently rendered shell.
     *   If <code>false</code>, add the items to the LaunchPadState itself,
     *   causing the items to be rendered every time the given states are active.
     * @param {string[]} aStates Only valid if bCurrentState is set to <code>false</code>.
     *   An array of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) in which the controls are added.
     *   If no launchpad state is provided the items are added in all states.
     *   @see sap.ushell.renderer.renderer.LaunchpadState.
     * @since 1.30
     * @private
     */
    Renderer.prototype.showToolAreaItem = function (aIds, bCurrentState, aStates) {
        this._updateItemStates(aIds, bCurrentState, aStates, "toolArea.items", Operation.Add);
    };

    /**
     * Displays action buttons in the User Actions Menu in the SAP Fiori launchpad, in the given launchpad states (LaunchpadState).
     * (see sap.ushell.renderer.Renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     * The user actions menu is opened via the button on the right hand side of the shell header.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.m.Button();
     * var renderer = Container.getRendererInternal("fiori2");
     * renderer.showActionButton([button1.getId()], false, ["home", "app"]);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} vIds List of ID elements to that should be added to the User Actions Menu options bar.
     * @param {boolean} bCurrentState If true, add the created control to the current rendered shell state. When the user navigates to a
     *   different state, or to a different application, then the control is removed. If false, the control is added to the LaunchpadState.
     * @param {string[]} aStates List of the launchpad states (sap.ushell.renderer.Renderer.LaunchpadState) in which to add the aIds.
     *   Valid only if bCurrentState is set to false.
     *   @see sap.ushell.renderer.renderer.LaunchpadState.
     *   If no launchpad state is provided, the content is added in all states.
     * @since 1.30
     * @private
     */
    Renderer.prototype.showActionButton = function (vIds, bCurrentState, aStates) {
        const aIds = Array.isArray(vIds) ? vIds : [vIds];

        // In case the method was called with instance of sap.m.Button, we need to convert it to
        // sap.ushell.ui.launchpad.ActionItem in order to apply the action item behavior and styles to this control
        const { buttons, actions } = aIds.reduce((oResult, sId) => {
            const oElement = Element.getElementById(sId);
            const bIsButton = BaseObject.isObjectA(oElement, "sap.m.Button") && !(BaseObject.isObjectA(oElement, "sap.ushell.ui.launchpad.ActionItem"));

            if (bIsButton) {
                oResult.buttons.push(sId);
            } else {
                oResult.actions.push(sId);
            }

            return oResult;
        }, { buttons: [], actions: [] });

        if (buttons.length) {
            this.convertButtonsToActions(buttons, bCurrentState, aStates);
        }

        this._updateItemStates(actions, bCurrentState, aStates, "userActions.items", Operation.Add);
    };

    /**
     * Displays FloatingActionButton on the bottom right corner of the Fiori launchpad, in the given launchpad states.
     * The FloatingActionButton is rendered in the bottom right corner of the shell.</br>
     * (see sap.ushell.renderer.Renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.ushell.ui.shell.ShellFloatingAction();
     * var renderer = Container.getRendererInternal("fiori2");
     * renderer.showFloatingActionButton([button1.getId()], true);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} aIds List of ID elements to add to the user actions menu.
     * @param {boolean} bCurrentState if true, add the current Buttons only to the current instance of the rendering of the shell.
     *   if false, add the Buttons to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the aIds.
     * @since 1.30
     * @private
     * @deprecated since 1.52. Support for the FloatingActionButton has been discontinued.
     */
    Renderer.prototype.showFloatingActionButton = function (aIds, bCurrentState, aStates) {
        this._updateItemStates(aIds, bCurrentState, aStates, "floatingActions.items", Operation.Add);
    };

    /**
     * Displays HeaderItems on the right side of the Fiori launchpad shell header, in the given launchpad states
     * (see sap.ushell.renderer.Renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     * The shell header can display the user HeaderItem, and just one more HeaderItem.</br>
     * If this method is called when the right side of the header is full, this method will not do anything.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.ushell.ui.shell.ShellHeadItem();
     * var renderer = Container.getRendererInternal("fiori2");
     * renderer.showHeaderEndItem ([button1.getId()], false, ["home", "app"]);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} aIds List of ID elements to add to the shell header.
     * @param {boolean} bCurrentState if true, add the current HeaderItems only to the current instance of the rendering of the shell.
     *   if false, add the HeaderItems to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the aIds.
     * @since 1.30
     * @private
     */
    Renderer.prototype.showHeaderEndItem = function (aIds, bCurrentState, aStates) {
        this._updateItemStates(aIds, bCurrentState, aStates, "header.headEndItems", Operation.Add);
    };

    /**
     * Sanitizes the given list of launchpad states by removing any invalid states.
     * For undefined or empty lists, all valid launchpad states are returned.
     *
     * @param {Array<sap.ushell.renderer.Renderer.LaunchpadState | string> | undefined} vLaunchpadStates A list of string which might not adhere to the LaunchpadState enum or undefined.
     * @returns {sap.ushell.renderer.Renderer.LaunchpadState[]} The sanitized list of LaunchpadStates.
     *
     * @since 1.127
     * @private
     */
    Renderer.prototype._sanitizeStates = function (vLaunchpadStates) {
        const aLaunchpadStates = Array.isArray(vLaunchpadStates) ? vLaunchpadStates : [];

        const aFilteredLaunchpadStates = aLaunchpadStates
            .filter((sLaunchpadState) => {
                return sLaunchpadState !== undefined && sLaunchpadState !== null;
            })
            .filter((sLaunchpadState) => {
                const bValidLaunchpadState = Object.values(this.LaunchpadState).includes(sLaunchpadState);

                if (!bValidLaunchpadState) {
                    throw new Error(`Invalid launchpad state: ${sLaunchpadState}`);
                }
                return bValidLaunchpadState;
            });

        if (aFilteredLaunchpadStates.length === 0) {
            return Object.values(this.LaunchpadState);
        }

        return aFilteredLaunchpadStates;
    };

    Renderer.prototype._updateItemStates = function (vIds, bCurrentState, vStates, sPath, sOperation) {
        const aIds = Array.isArray(vIds) ? vIds : [vIds];
        const aStates = this._sanitizeStates(vStates);

        aIds.forEach((sId) => {
            StateManager.updateManagedControl(sId, !bCurrentState);

            if (bCurrentState) {
                StateManager.updateCurrentState(sPath, sOperation, sId);
                return;
            }

            StateManager.updateBaseStates(aStates, sPath, sOperation, sId);
        });
    };

    /**
     * Sets the header visibility according to the given value and shell states.
     * (see sap.ushell.renderer.Renderer.LaunchpadState).
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2");
     * oRenderer.setHeaderVisibility(false, false, ["home", "app"]);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {boolean} bVisible The visibility of the header<br>
     * @param {boolean} bCurrentState If <code>true</code> then the visibility is set only to the current rendered shell state.<br>
     *   When the user navigates to another application (including the Home page) then the visibility flag is reset.<br>
     *   If <code>false</code> then set the visibility according to the states provided in the aState parameter.<br>
     * @param {string[]} vStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) in which the header visibility flag should be set.<br>
     *   If no launchpad state is provided the visibility flag is set for all states.
     *   @see LaunchpadState
     * @since 1.38
     * @private
     */
    Renderer.prototype.setHeaderVisibility = function (bVisible, bCurrentState, vStates) {
        const aStates = this._sanitizeStates(vStates);

        if (bCurrentState) {
            StateManager.updateCurrentState("header.visible", Operation.Set, bVisible);
            return;
        }

        StateManager.updateBaseStates(aStates, "header.visible", Operation.Set, bVisible);
    };

    /**
     * Displays one or more sub header controls according to the given control IDs and shell states.<br>
     * (see sap.ushell.renderer.Renderer.LaunchpadState).<br><br>
     * A sub header is placed in a container, located directly below the main Fiori launchpad shell header.<br>
     *
     * <b>Example:</b>
     * <pre>
     * var bar = new sap.m.Bar({id: "testBar", contentLeft: [new sap.m.Button({text: "Test SubHeader Button",
     *   press: function () {
     *     sap.m.MessageToast.show("Pressed");
     *   }})
     * ]});
     * var oRenderer = Container.getRendererInternal("fiori2");
     * oRenderer.showSubHeader([bar.getId()], false, ["home", "app"]);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} aIds Array of sub header control IDs to be added<br>
     * @param {boolean} bCurrentState If <code>true</code> then the new created controls are added only to the current rendered shell state.<br>
     *   When the user navigates to another application (including the Home page) then the controls will be removed.<br>
     *   If <code>false</code> then add the control to the LaunchPadState itself.<br>
     * @param {string[]} aStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) in which the controls are added.<br>
     *   If no launchpad state is provided the controls are added in all states.
     *   @see LaunchpadState
     * @since 1.30
     * @private
     */
    Renderer.prototype.showSubHeader = function (aIds, bCurrentState, aStates) {
        this._updateItemStates(aIds, bCurrentState, aStates, "subHeader.items", Operation.Add);
    };

    /**
     * Displays Sign Out button in User Actions Menu in the given launchpad state
     * (see sap.ushell.renderer.Renderer.LaunchpadState).</br>
     * If no launchpad state is provided the item is displayed in all states.</br>
     * If this method is called when the sign out button already displayed, this method will not do anything.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var renderer = Container.getRendererInternal("fiori2");
     * renderer.showSignOutItem (false, ["home", "app"]);
     * </pre>
     *
     * @param {boolean} bCurrentState if true, add the sign out button only to the current instance of the rendering of the shell.
     *   if false, add the sign out button to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the aIds.
     * @since 1.44
     * @private
     */
    Renderer.prototype.showSignOutItem = function (bCurrentState, aStates) {
        this.showActionButton(["logoutBtn"], bCurrentState, aStates);
    };

    /**
     * Displays Settings button in User Actions Menu in the given launchpad state
     * (see sap.ushell.renderer.Renderer.LaunchpadState).</br>
     * If no launchpad state is provided the item is displayed in all states.</br>
     * If this method is called when the sign out button already displayed, this method will not do anything.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var renderer = Container.getRendererInternal("fiori2");
     * renderer.showSettingsItem (false, ["home", "app"]);
     * </pre>
     *
     * @param {boolean} bCurrentState if true, add the settings button only to the current instance of the rendering of the shell.
     *   if false, add settings button to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the aIds.
     * @since 1.44
     * @private
     */
    Renderer.prototype.showSettingsItem = function (bCurrentState, aStates) {
        this.showActionButton(["userSettingsBtn"], bCurrentState, aStates);
    };

    /**
     * Displays the given sap.m.Bar as the footer of the Fiori launchpad shell.</br>
     * The footer will be displayed in all states. </br>
     *
     * <b>Example:</b>
     * <pre>
     * var bar = new sap.m.Bar({contentLeft: [new sap.m.Button({text: "Test Footer Button",
     *   press: function () {
     *     sap.m.MessageToast.show("Pressed");
     *   }})
     * ]});
     * var renderer = Container.getRendererInternal("fiori2");
     * renderer.setFooter(bar);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {sap.m.Bar} oFooter - sap.m.Bar, the control to be added as the footer of the Fiori Launchpad
     * @since 1.30
     * @private
     */
    Renderer.prototype.setFooter = function (oFooter) {
        this.shellCtrl.setFooter(oFooter);
    };

    /**
     * @param {sap.ui.core.Control} oNavigationBar The NavigationBar Control
     *
     * @private
     * @since 1.114.0
     */
    Renderer.prototype.setNavigationBar = function (oNavigationBar) {
        this.shellCtrl.setNavigationBar(oNavigationBar);
    };

    /**
     * @param {sap.ui.core.Control} oSideNavigation The SideNavigation Control
     *
     * @private
     * @since 1.131.0
     */
    Renderer.prototype.setSideNavigation = function (oSideNavigation) {
        this.shellCtrl.setSideNavigation(oSideNavigation);
    };

    /**
     * @param {sap.ui.core.Control | HTMLElement} oShellShapes The shapes
     *
     * @private
     * @since 1.114.0
     */
    Renderer.prototype.setShellShapes = function (oShellShapes) {
        this.shellCtrl.setShellShapes(oShellShapes);
    };

    /**
     * Creates and displays an SAPUI5 control as the footer of the Fiori launchpad shell.<br>
     * The footer will be displayed in all states. <br>
     * Previously created footer will be removed. <br>
     *
     * <b>For example, using the sap.m.Bar control:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2"),
     *   oFooterControlProperties = {
     *     controlType : "sap.m.Bar",
     *     oControlProperties : {
     *       id: "testBar",
     *       contentLeft: [new sap.m.Button({
     *         text: "Test Footer Button",
     *         press: function () {
     *           sap.m.MessageToast.show("Pressed");
     *         }
     *       })]
     *     }
     *   };
     * oRenderer.setShellFooter(oFooterControlProperties);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {object} oParameters Contains the required parameters for creating and showing the new control object.
     * @param {string} oParameters.controlType The (class) name of the control type to create, for example: <code>sap.m.Bar</code>
     * @param {object} oParameters.oControlProperties The properties that will be passed to the created control, for example: <code>{id: "testBar"}</code>
     *
     * @returns {jQuery.Promise} Resolves with the newly created control
     * @since 1.48
     * @private
     */
    Renderer.prototype.setShellFooter = function (oParameters) {
        const oDeferred = new jQuery.Deferred();
        const that = this;
        let oControlInstance;
        const controlType = oParameters.controlType;
        const oControlProperties = oParameters.oControlProperties;

        if (!controlType) {
            Log.warning("You must specify control type in order to create it");
            oDeferred.reject(new Error("You must specify control type in order to create it"));
            return oDeferred.promise();
        }

        if (!oControlProperties) {
            Log.warning("You must specify control properties in order to create it");
            oDeferred.reject(new Error("You must specify control properties in order to create it"));
            return oDeferred.promise();
        }

        const sControlResource = controlType.replace(/\./g, "/");
        sap.ui.require([sControlResource], (ControlObject) => {
            // If a control instance is already created - get it by its id
            oControlInstance = Element.getElementById(oControlProperties.id);
            if (!oControlInstance) {
                // only create the control if it doesn't already exist
                oControlInstance = new ControlObject(oControlProperties);
            }

            // In case a footer was created before, we remove it first before setting a new one
            if (that.lastFooterId) {
                that.removeFooter();
            }

            // This parameter holds the id of a footer that was created by the setFooterControl API
            that.lastFooterId = oControlInstance.getId();
            that.shellCtrl.setFooter(oControlInstance);

            oDeferred.resolve(oControlInstance);
        });

        return oDeferred.promise();
    };

    /**
     * Creates and displays an SAPUI5 control as the footer of the Fiori launchpad shell.<br>
     * The footer will be displayed in all states. <br>
     * Previously created footer will be removed. <br>
     *
     * <b>For example, using the sap.m.Bar control:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2");
     * oRenderer.setFooterControl("sap.m.Bar", {id: "testBar", contentLeft: [new sap.m.Button({text: "Test Footer Button",
     *   press: function () {
     *     sap.m.MessageToast.show("Pressed");
     *   }})
     * ]});
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} controlType The (class) name of the control type to create.<br>
     *   For example: <code>"sap.m.Bar"</code><br>
     * @param {object} oControlProperties The properties that will be passed to the created control.<br>
     *   For example: <code>{id: "testBar"}</code><br>
     * @returns {sap.ui.core.Control} The created control
     * @since 1.42
     * @deprecated since 1.48. Please use {@link #setShellFooter} instead.
     * @private
     */
    Renderer.prototype.setFooterControl = function (controlType, oControlProperties) {
        const sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        const ControlObject = sap.ui.require(sControlResource);
        let bResourceLoadedAsObject = false;

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error(`Renderer.setFooterControl: the referenced control resource ${controlType} is not available.`,
                undefined, "sap.ushell.renderer.Renderer");
            return undefined;
        }

        const oControlInstance = this.createItem(oControlProperties, undefined, (oProperties) => {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                const ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        // In case a footer was created before, we remove it first before setting a new one
        if (this.lastFooterId) {
            this.removeFooter();
        }
        // This parameter holds the id of a footer that was created by s previous call to setFooterControl
        this.lastFooterId = oControlInstance.getId();
        this.shellCtrl.setFooter(oControlInstance);
        return oControlInstance;
    };

    /* --------------------------Hide ----------------------------------*/

    /**
     * Hide the given sap.ushell.ui.shell.ShellHeadItem from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} vIds the Ids of the sap.ushell.ui.shell.ShellHeadItem to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} vStates list of the sap.ushell.renderer.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @private
     */
    Renderer.prototype.hideHeaderItem = function (vIds, bCurrentState, vStates) {
        this._updateItemStates(vIds, bCurrentState, vStates, "header.headItems", Operation.Remove);
    };

    /**
     * Remove the given Tool Area Item from Fiori Launchpad, in the given launchpad states.
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string|string[]} aIds A single ID or an array of IDs to remove from the Tool Area.
     * @param {boolean} bCurrentState If <code>true</code>, remove the items from the currently rendered shell.
     *   If <code>false</code>, remove the items from the LaunchPadState itself,
     *   causing the items to be removed every time the given states are active.
     * @param {string[]} aStates (only valid if bCurrentState is set to <code>false</code>) -
     *   An array of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) from which the controls are removed.
     *   If no launchpad state is provided the items are removed from all states.
     *   @see sap.ushell.renderer.Renderer.LaunchpadState.
     * @since 1.30
     * @private
     */
    Renderer.prototype.removeToolAreaItem = function (aIds, bCurrentState, aStates) {
        this._updateItemStates(aIds, bCurrentState, aStates, "toolArea.items", Operation.Remove);
    };

    /**
     * Remove the given Tool Area Item from Fiori Launchpad, in the given launchpad states.
     *
     * @param {string[]} aIds the Ids of the sap.ushell.ui.shell.RightFloatingContainerItem control to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} aStates list of the sap.ushell.renderer.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @private
     */
    Renderer.prototype.removeRightFloatingContainerItem = function (aIds, bCurrentState, aStates) {
        this._updateItemStates(aIds, bCurrentState, aStates, "rightFloatingContainer.items", Operation.Remove);
    };

    /**
     * Hides an action button from the User Actions Menu in the SAP Fiori launchpad, in the given launchpad states (LaunchpadState).
     * The removed button will not be destroyed.<br><br>
     * This API is meant to be used for custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on standard launchpad elements, as this may interfere with the standard launchpad functionality.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} vIds IDs of the button controls that should hidden.
     * @param {boolean} bCurrentState If true, removes the current control only from the current rendered shell state.
     * @param {string[]} vStates A list of the launchpad states in which to hide the control. Valid only if bCurrentState is set to false.
     *   @see sap.ushell.renderer.Renderer.LaunchpadState.
     *   If no launchpad state is provided, the content is hidden in all states.
     * @since 1.30
     * @private
     */
    Renderer.prototype.hideActionButton = function (vIds, bCurrentState, vStates) {
        this._updateItemStates(vIds, bCurrentState, vStates, "userActions.items", Operation.Remove);
    };

    /**
     * Hide the given control from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} vIds the Ids of the controls to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} vStates list of the sap.ushell.renderer.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @private
     */
    Renderer.prototype.hideLeftPaneContent = function (vIds, bCurrentState, vStates) {
        this._updateItemStates(vIds, bCurrentState, vStates, "sidePane.items", Operation.Remove);
    };

    /**
     * Hide the given sap.ushell.ui.shell.ShellFloatingAction from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} vIds the Ids of the sap.ushell.ui.shell.ShellFloatingAction to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} vStates list of the sap.ushell.renderer.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @private
     * @deprecated since 1.52
     */
    Renderer.prototype.hideFloatingActionButton = function (vIds, bCurrentState, vStates) {
        this._updateItemStates(vIds, bCurrentState, vStates, "floatingActions.items", Operation.Remove);
    };

    /**
     * Hide the given sap.ushell.ui.shell.ShellHeadItem from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} vIds the Ids of the sap.ushell.ui.shell.ShellHeadItem to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} vStates list of the sap.ushell.renderer.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @private
     */
    Renderer.prototype.hideHeaderEndItem = function (vIds, bCurrentState, vStates) {
        this._updateItemStates(vIds, bCurrentState, vStates, "header.headEndItems", Operation.Remove);
    };

    /**
     * Hide the given control from the Fiori Launchpad sub header, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string[]} vIds the Ids of the controls to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} vStates list of the sap.ushell.renderer.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @private
     */
    Renderer.prototype.hideSubHeader = function (vIds, bCurrentState, vStates) {
        this._updateItemStates(vIds, bCurrentState, vStates, "subHeader.items", Operation.Remove);
    };

    /**
     * Removes and destroys a footer control, but only if it matches the current footer
     * @param {string} footerId The id of the footer control
     *
     * @since 1.120.0
     * @private
     */
    Renderer.prototype.removeFooterById = function (footerId) {
        if (footerId === this.shellCtrl.getFooterId()) {
            this.shellCtrl.removeFooter();
        }
        const oFooter = Element.getElementById(footerId);
        if (oFooter) {
            oFooter.destroy();
        }
    };

    /**
     * If exists, this method will remove the footer from the Fiori Launchpad.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @since 1.30
     * @private
     */
    Renderer.prototype.removeFooter = function () {
        this.shellCtrl.removeFooter();
        // If the footer was created by the renderer (setFooterControl API) then we will destroy it after it removed
        if (this.lastFooterId) {
            const oFooter = Element.getElementById(this.lastFooterId);
            if (oFooter) {
                oFooter.destroy();
            }
            this.lastFooterId = undefined;
        }
    };

    /* ------------------------------------------------ Adding controls functionality ------------------------------------------*/

    /**
     * Creates and displays a sub header control in Fiori launchpad, in the given launchpad states.<br>
     * The new control is displayed in FLP UI according to the given display parameters.<br>
     * If a sub header already exists, the new created one will replace the existing one.<br><br>
     * <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2"),
     *     oAddSubHeaderProperties = {
     *         controlType : "sap.m.Bar",
     *         oControlProperties : {
     *             id: "testBar",
     *             contentLeft: [new sap.m.Button({
     *                 text: "Test SubHeader Button",
     *                 press: function () {
     *                     sap.m.MessageToast.show("Pressed");
     *                 }
     *             })
     *         },
     *         bIsVisible: true,
     *         bCurrentState: true
     *     };
     *
     * oRenderer.addShellSubHeader(oAddSubHeaderProperties);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {object} oParameters Contains the required parameters for creating and showing the new control object.
     * @param {string} oParameters.controlType The (class) name of the control type to create.
     * @param {object} oParameters.oControlProperties The properties that will be passed to the created control.
     * @param {boolean} oParameters.bIsVisible Specify whether to display the control.
     * @param {boolean} oParameters.bCurrentState If true, add the current control only to the current rendered shell state. Once the user
     * navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} oParameters.aStates (only valid if bCurrentState is set to false) - list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the control.
     *
     * @returns {jQuery.Promise} Resolves with the newly created control
     * @since 1.48
     * @private
     */
    Renderer.prototype.addShellSubHeader = function (oParameters) {
        const oDeferred = new jQuery.Deferred();
        const that = this;
        let oControlInstance;
        const controlType = oParameters.controlType;
        const oControlProperties = oParameters.oControlProperties;
        const bIsVisible = oParameters.bIsVisible;
        const bCurrentState = oParameters.bCurrentState;
        const aStates = oParameters.aStates;

        if (!controlType) {
            Log.warning("You must specify control type in order to create it");
            oDeferred.reject(new Error("You must specify control type in order to create it"));
            return oDeferred.promise();
        }

        if (!oControlProperties) {
            Log.warning("You must specify control properties in order to create it");
            oDeferred.reject(new Error("You must specify control properties in order to create it"));
            return oDeferred.promise();
        }

        const sControlResource = controlType.replace(/\./g, "/");
        sap.ui.require([sControlResource], (ControlObject) => {
            // If a control instance is already created - get it by its id
            oControlInstance = Element.getElementById(oControlProperties.id);
            if (!oControlInstance) {
                // only create the control if it doesn't already exist
                oControlInstance = new ControlObject(oControlProperties);

                StateManager.addManagedControl(oControlInstance.getId(), !bCurrentState);
            }

            if (bIsVisible) {
                that.showSubHeader(oControlInstance.getId(), bCurrentState, aStates);
            }
            oDeferred.resolve(oControlInstance);
        });
        return oDeferred.promise();
    };

    /**
     * Creates and displays a sub header control in Fiori launchpad, in the given launchpad states.<br>
     * The new control is displayed in FLP UI according to the given display parameters.<br>
     * If a sub header already exists, the new created one will replace the existing one.<br><br>
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2");
     * oRenderer.addSubHeader("sap.m.Bar", {id: "testBar", contentLeft: [new sap.m.Button({text: "Test SubHeader Button",
     *   press: function () {
     *     sap.m.MessageToast.show("Pressed");
     *   }})
     * ]}, true, true);
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} controlType The (class) name of the control type to create.<br>
     *   For example: <code>"sap.m.Bar"</code><br>
     * @param {object} oControlProperties The properties that will be passed to the created control.<br>
     *   For example: <code>{id: "testBar"}</code><br>
     * @param {boolean} bIsVisible Specifies whether the sub header control is displayed after being created.<br>
     *   If <code>true</code> then the control is displayed according to parameters bCurrentState and aStates,<br>
     *   if <code>false</code> then the control is created but not displayed.<br>
     * @param {boolean} bCurrentState If <code>true</code> then the new created control is added to the current rendered shell state.<br>
     *   When the user navigates to another application (including the Home page) then the control will be removed.<br>
     *   If <code>false</code> then add the control to the LaunchPadState itself.<br>
     * @param {string[]} vStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) in which the control is added.<br>
     *   If no launchpad state is provided the control is added in all states.
     *   @see LaunchpadState
     * @returns {object} The created control
     * @since 1.30
     * @deprecated since 1.48. Please use {@link #addShellSubHeader} instead.
     * @private
     */
    Renderer.prototype.addSubHeader = function (controlType, oControlProperties, bIsVisible, bCurrentState, vStates) {
        const aStates = this._sanitizeStates(vStates);

        const sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        const ControlObject = sap.ui.require(sControlResource);
        let bResourceLoadedAsObject = false;

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error(`Renderer.setFooterControl: the referenced control resource ${controlType} is not available.`,
                undefined, "sap.ushell.renderer.Renderer");
            return undefined;
        }

        const oControlInstance = this.createItem(oControlProperties, bCurrentState, (oProperties) => {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                const ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        if (bIsVisible) {
            this.showSubHeader(oControlInstance.getId(), bCurrentState, aStates);
        }
        return oControlInstance;
    };

    /**
     * Creates an Action Button in Fiori launchpad, in the given launchpad states. </br>
     * The button will be displayed in the user actions menu, that is opened from the user button in the shell header.</br>
     *  <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2"),
     *     oAddActionButtonProperties = {
     *         controlType : "sap.m.Button",
     *         oControlProperties : {
     *             id: "exampleButton",
     *             text: "Example Button",
     *             icon: "sap-icon://refresh",
     *             press: function () {
     *                 alert("Example Button was pressed!");
     *             }
     *         },
     *         bIsVisible: true,
     *         bCurrentState: true
     *     };
     * oRenderer.addUserAction(oAddActionButtonProperties);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {object} oParameters Contains the required parameters for creating and showing the new control object.
     * @param {string} oParameters.controlType The (class) name of the control type to create.<br>
     * @param {object} oParameters.oControlProperties The properties that will be passed to the created control.<br>
     * @param {boolean} oParameters.bIsVisible Specify whether to display the control.
     * @param {boolean} oParameters.bCurrentState If true, add the current control only to the current rendered shell state.
     * Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} oParameters.aStates (only valid if bCurrentState is set to false) - list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the control.
     * If no launchpad state is provided the content is added in all states. @see LaunchpadState
     *
     * @returns {jQuery.Promise} Resolves with the newly created control
     * @since 1.48
     * @private
     */
    Renderer.prototype.addUserAction = function (oParameters) {
        const oDeferred = new jQuery.Deferred();
        const that = this;
        let { controlType } = oParameters;
        const {
            oControlProperties,
            bIsVisible,
            bCurrentState,
            aStates
        } = oParameters;

        if (!controlType) {
            if (Element.getElementById(oControlProperties?.id)) {
                controlType = "sap.ushell.ui.launchpad.ActionItem";
            } else {
                const sNoControlTypeErrorMessage = "You must specify control type in order to create it";
                Log.warning(sNoControlTypeErrorMessage);
                oDeferred.reject(new Error(sNoControlTypeErrorMessage));
                return oDeferred.promise();
            }
        }

        if (!oControlProperties) {
            const sNoControlPropertiesErrorMessage = "You must specify control properties in order to create it";
            Log.warning(sNoControlPropertiesErrorMessage);
            oDeferred.reject(new Error(sNoControlPropertiesErrorMessage));
            return oDeferred.promise();
        }

        const sControlType = controlType === "sap.m.Button" ? "sap.ushell.ui.launchpad.ActionItem" : controlType;
        const sControlResource = sControlType.replace(/\./g, "/");
        sap.ui.require([sControlResource], (ControlClass) => {
            // If a control instance is already created - get it by its id
            let oControlInstance = Element.getElementById(oControlProperties.id);
            if (!oControlInstance) {
                // only create the control if it doesn't already exist
                oControlInstance = new ControlClass(oControlProperties);

                StateManager.addManagedControl(oControlInstance.getId(), !bCurrentState);
            }

            if (bIsVisible) {
                that.showActionButton(oControlInstance.getId(), bCurrentState, aStates);
            }

            oDeferred.resolve(oControlInstance);
        }, () => {
            const sControlTypeErrorMessage = `The control type ${sControlType} is not available.`;
            Log.error(sControlTypeErrorMessage);
            oDeferred.reject(new Error(sControlTypeErrorMessage));
        });

        return oDeferred.promise();
    };

    /**
     * Creates an action button in the User Actions Menu in the SAP Fiori launchpad, in the given launchpad states (LaunchpadState).</br>
     *
     * <b>Example:</b>
     * <pre>
     * Container.getRendererInternal("fiori2").addActionButton("sap.m.Button", {id: "testBtn2", text: "test button"}, true, true);
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} controlType The (class) name of the control type to create.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     * @param {boolean} bIsVisible Specify whether to display the control. If true, the control is displayed (calls the showActionButton method)
     *   according to the bCurrentState and aStates parameters. If false, the control is created but not displayed
     *   (you can use showActionButton to display the control when needed).
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the home page, this control will be removed.
     * @param {string[]} vStates List of the launchpad states (sap.ushell.renderer.Renderer.LaunchpadState) in which to add the control.
     *   Valid only if bCurrentState is set to false.
     *   @see sap.ushell.renderer.Renderer.LaunchpadState
     *   If no launchpad state is provided, the content is added in all states.
     * @returns {sap.ui.core.Control} oItem - the created control
     * @since 1.30
     * @deprecated since 1.48. Please use {@link #addUserAction} instead.
     * @private
     */
    Renderer.prototype.addActionButton = function (controlType, oControlProperties, bIsVisible, bCurrentState, vStates) {
        const aStates = this._sanitizeStates(vStates);
        let bResourceLoadedAsObject = false;

        if (controlType === "sap.m.Button") {
            controlType = "sap.ushell.ui.launchpad.ActionItem";
        }

        const sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        const ControlObject = sap.ui.require(sControlResource);

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error(`Renderer.setFooterControl: the referenced control resource ${controlType} is not available.`,
                undefined, "sap.ushell.renderer.Renderer");
            return undefined;
        }

        const oControlInstance = this.createItem(oControlProperties, bCurrentState, (oProperties) => {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                const ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        if (bIsVisible) {
            this.showActionButton(oControlInstance.getId(), bCurrentState, aStates);
        }

        return oControlInstance;
    };

    /**
     * Creates a FloatingActionButton in Fiori launchpad, in the given launchpad states.</br>
     * The FloatingActionButton is rendered in the bottom right corner of the shell.</br>
     *
     * <b>Example:</b>
     * <pre>
     * Container.getRendererInternal("fiori2").addFloatingActionButton("sap.ushell.ui.shell.ShellFloatingAction", {id: "testBtn"}, true, true);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {object} oParameters Contains the required parameters for creating and showing the new control object:<br>
     *  Properties:<br>
     *   - {string} controlType<br>
     *     The (class) name of the control type to create.<br>
     *   - {object} oControlProperties<br>
     *     The properties that will be passed to the created control.<br>
     *   - {boolean} bIsVisible<br>
     *     Specify whether to display the control.<br>
     *   - {boolean} bCurrentState<br>
     *     If true, add the current control only to the current rendered shell state.<br>
     *     Once the user navigates to another app or back to the Home page, this control will be removed.<br>
     *   - {string[]} aStates<br>
     *     (only valid if bCurrentState is set to false) - list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the control.<br>
     *
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {jQuery.Promise} Resolves with the newly created control
     * @since 1.48
     * @private
     * @deprecated since 1.52
     */
    Renderer.prototype.addFloatingButton = function (oParameters) {
        const oDeferred = new jQuery.Deferred();
        const that = this;
        let oControlInstance;
        const sControlType = oParameters.controlType || "sap.m.Button";
        const oControlProperties = oParameters.oControlProperties;
        const bIsVisible = oParameters.bIsVisible;
        const bCurrentState = oParameters.bCurrentState;
        const aStates = oParameters.aStates;

        if (!oControlProperties) {
            Log.warning("You must specify control properties in order to create it");
            oDeferred.reject(new Error("You must specify control properties in order to create it"));
            return oDeferred.promise();
        }

        const sControlResource = sControlType.replace(/\./g, "/");
        sap.ui.require([sControlResource], (ControlObject) => {
            // If a control instance is already created - get it by its id
            oControlInstance = Element.getElementById(oControlProperties.id);
            if (!oControlInstance) {
                // only create the control if it doesn't already exist
                oControlInstance = new ControlObject(oControlProperties);

                StateManager.addManagedControl(oControlInstance.getId(), !bCurrentState);
            }

            if (bIsVisible) {
                that.showFloatingActionButton(oControlInstance.getId(), bCurrentState, aStates);
            }
            oDeferred.resolve(oControlInstance);
        });
        return oDeferred.promise();
    };

    /**
     * Creates a FloatingActionButton in Fiori launchpad, in the given launchpad states.</br>
     * The FloatingActionButton is rendered in the bottom right corner of the shell.</br>
     *
     * <b>Example:</b>
     * <pre>
     * Container.getRendererInternal("fiori2").addFloatingActionButton("sap.ushell.ui.shell.ShellFloatingAction", {id: "testBtn"}, true, true);
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} controlType The (class) name of the control type to create.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} vStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the control.
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} oItem - the created control
     * @since 1.30
     * @deprecated since 1.48. Please use {@link #addFloatingButton} instead.
     * @private
     */
    Renderer.prototype.addFloatingActionButton = function (controlType, oControlProperties, bIsVisible, bCurrentState, vStates) {
        const aStates = this._sanitizeStates(vStates);
        let bResourceLoadedAsObject = false;

        if (!controlType) {
            controlType = "sap.m.Button";
        }

        const sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        const ControlObject = sap.ui.require(sControlResource);

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error(`Renderer.setFooterControl: the referenced control resource ${controlType} is not available.`,
                undefined, "sap.ushell.renderer.Renderer");
            return undefined;
        }

        const oControlInstance = this.createItem(oControlProperties, bCurrentState, (oProperties) => {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                const ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        if (bIsVisible) {
            this.showFloatingActionButton(oControlInstance.getId(), bCurrentState, aStates);
        }

        return oControlInstance;
    };

    /**
     * Creates the Left Pane content in Fiori launchpad, in the given launchpad states.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2"),
     *     oSidePaneContentProperties = {
     *         controlType : "sap.m.Button",
     *         oControlProperties : {
     *             id: "testBtn",
     *             text: "Test Button"
     *         },
     *         bIsVisible: true,
     *         bCurrentState: true
     *     };
     *
     * oRenderer.addSidePaneContent(oSidePaneContentProperties);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {object} oParameters
     *      Contains the parameters for the control that should be added to the side pane
     * @param {string} oParameters.controlType
     *      The (class) name of the control type to create.
     * @param {object} oParameters.oControlProperties
     *      The properties that will be passed to the created control.
     * @param {boolean} oParameters.bIsVisible
     *      Specify whether to display the control.
     * @param {boolean} oParameters.bCurrentState
     *      If true, add the current control only to the current rendered shell state.
     *      Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} oParameters.aStates
     *      (only valid if bCurrentState is set to false) - list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the control.
     *      @see LaunchpadState
     *      If no launchpad state is provided the content is added in all states.
     *
     * @returns {jQuery.Promise} Resolves with the newly created control
     *
     * @since 1.48
     * @private
     */
    Renderer.prototype.addSidePaneContent = function (oParameters) {
        const oDeferred = new jQuery.Deferred();
        const that = this;
        let oControlInstance;
        const controlType = oParameters.controlType;
        const oControlProperties = oParameters.oControlProperties;
        const bIsVisible = oParameters.bIsVisible;
        const bCurrentState = oParameters.bCurrentState;
        const aStates = oParameters.aStates;

        if (!controlType) {
            Log.warning("You must specify control type in order to create it");
            oDeferred.reject(new Error("You must specify control type in order to create it"));
            return oDeferred.promise();
        }

        if (!oControlProperties) {
            Log.warning("You must specify control properties in order to create it");
            oDeferred.reject(new Error("You must specify control properties in order to create it"));
            return oDeferred.promise();
        }

        const sControlResource = controlType.replace(/\./g, "/");
        sap.ui.require([sControlResource], (ControlObject) => {
            // If a control instance is already created - get it by its id
            oControlInstance = Element.getElementById(oControlProperties.id);
            if (!oControlInstance) {
                // only create the control if it doesn't already exist
                oControlInstance = new ControlObject(oControlProperties);

                StateManager.addManagedControl(oControlInstance.getId(), !bCurrentState);
            }

            if (bIsVisible) {
                that.showLeftPaneContent(oControlInstance.getId(), bCurrentState, aStates);
            }
            oDeferred.resolve(oControlInstance);
        });

        return oDeferred.promise();
    };

    /**
     * Creates the Left Pane content in Fiori launchpad, in the given launchpad states.</br>
     *
     * <b>Example:</b>
     * <pre>
     * Container.getRendererInternal("fiori2").addLeftPaneContent("sap.m.Button", {id: "testBtn", text: "Test Button"}, true, true);
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} controlType The (class) name of the control type to create.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} vStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the control.
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} oItem - the created control
     * @since 1.30
     * @deprecated since 1.48. Please use {@link #addSidePaneContent} instead.
     * @private
     */
    Renderer.prototype.addLeftPaneContent = function (controlType, oControlProperties, bIsVisible, bCurrentState, vStates) {
        const aStates = this._sanitizeStates(vStates);
        const sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        const ControlObject = sap.ui.require(sControlResource);
        let bResourceLoadedAsObject;

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error(`Renderer.setFooterControl: the referenced control resource ${controlType} is not available.`,
                undefined, "sap.ushell.renderer.Renderer");
            return undefined;
        }

        const oControlInstance = this.createItem(oControlProperties, bCurrentState, (oProperties) => {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                const ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        if (bIsVisible) {
            this.showLeftPaneContent(oControlInstance.getId(), bCurrentState, aStates);
        }

        return oControlInstance;
    };

    /**
     * Creates and displays an item in the header of Fiori launchpad, in the given launchpad states.<br>
     * The new header item will be displayed on the left-hand side of the Fiori Launchpad shell header, according to the given display parameters.<br>
     * The new header item will be added to the right of any existing header items. The header can contain a maximum of three header items.<br><br>
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2");
     *     oRenderer.addHeaderItem({
     *         id: "myTestButton",
     *         ariaLabel: resources.i18n.getText("testButton.label"),
     *         ariaHaspopup: "dialog",
     *         icon: "sap-icon://action-settings",
     *         tooltip: resources.i18n.getText("testButton.tooltip"),
     *         text: resources.i18n.getText("testButton.text"),
     *         press: controller.handleTestButtonPress
     *     }, true, true);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} [controlType] The (class) name of the control type to create.
     *   <b>Deprecated</b>: Since version 1.38.
     *   This parameter is no longer supported and can be omitted.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     *   For example: <code>{id: "testButton"}</code><br>
     * @param {boolean} bIsVisible Specifies whether the header item control is displayed after being created.<br>
     *   If <code>true</code> then the control is displayed according to parameters bCurrentState and aStates.<br>
     *   If <code>false</code> then the control is created but not displayed.<br>
     * @param {boolean} bCurrentState If <code>true</code> then the new created control is added to the current rendered shell state.<br>
     *   When the user navigates to a different state including a different application then the control will be removed.<br>
     *   If <code>false</code> then add the control to the LaunchPadState itself.<br>
     * @param {string[]} vStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) in which the control is added.<br>
     *   If no launchpad state is provided the control is added in all states.
     *   @see LaunchpadState
     * @returns {sap.ui.core.Control} The created control
     * @since 1.30
     * @private
     */
    Renderer.prototype.addHeaderItem = function (controlType, oControlProperties, bIsVisible, bCurrentState, vStates) {
        // in order to support deprecation of the never used argument: 'controlType' , we'll need to check whether it was passed to
        // the function by checking the types of the first two arguments
        if (typeof (arguments[0]) === "object" && typeof (arguments[1]) === "boolean") {
            oControlProperties = arguments[0];
            bIsVisible = arguments[1];
            bCurrentState = arguments[2];
            vStates = arguments[3];
        } else {
            Log.error("sap.ushell.renderer.Renderer: The parameter 'controlType' of the function 'addHeaderItem' is deprecated. Usage will be ignored!");
        }

        const aStates = this._sanitizeStates(vStates);

        const oItem = this.createItem(oControlProperties, bCurrentState, (oProperties) => {
            if (Config.last("/core/shellBar/enabled")) {
                // TODO Move to async import once the infrastructure gets updated with the latest browser version
                const Button = sap.ui.require("sap/ushell/gen/ui5/webcomponents/dist/Button");
                oProperties = {
                    ...oProperties,
                    click: oProperties.press
                };
                delete oProperties.press;

                // Map ariaHaspopup to ButtonAccessibilityAttributes.hasPopup so that it's compatible with the Button Web Component
                if (oProperties.ariaHaspopup) {
                    oProperties.accessibilityAttributes = {
                        ...(oProperties.accessibilityAttributes || {}),
                        hasPopup: oProperties.ariaHaspopup
                    };
                    delete oProperties.ariaHaspopup;
                }

                return new Button(oProperties);
            }
            return new ShellHeadItem(oProperties);
        });

        if (bIsVisible) {
            this.showHeaderItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /**
     * Creates a RightFloatingContainerItem  in Fiori Launchpad and adds it to the Tool Area, in the given launchpad states.</br>
     * If no items are added to the Tool Area, it will not be displayed.</br>
     * Once an item is added, the Tool Area is rendered on the left side on the Fiori Launchpad shell.</br>
     *
     * <b>Example:</b>
     * <pre>
     * Container.getRendererInternal("fiori2").addRightFloatingContainerItem({
     *   id: 'testButton',
     *   icon: "sap-icon://documents",
     *   press: function (evt) {
     *     window.alert('Press' );
     *   },
     *   expand: function (evt) {
     *     window.alert('Expand' );
     *   }
     * }, true, false, ["home"]);
     * </pre>
     *
     * @param {object} oControlProperties The properties object that will be passed to the constructor of sap.ushell.ui.shell.RightFloatingContainerItem control.
     *   @see sap.ushell.ui.shell.RightFloatingContainerItem
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     * @param {string[]} vStates List of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the control.
     *   Only valid if bCurrentState is set to false.
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} oItem - the created control
     * @since 1.30
     * @private
     */
    Renderer.prototype.addRightFloatingContainerItem = function (oControlProperties, bIsVisible, bCurrentState, vStates) {
        const aStates = this._sanitizeStates(vStates);
        const oItem = this.createItem(oControlProperties, bCurrentState, (oProperties) => {
            return new NotificationListItem(oProperties).addStyleClass("sapUshellNotificationsListItem");
        });

        if (bIsVisible) {
            this.showRightFloatingContainerItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /**
     * Creates a ToolAreaItem  in Fiori Launchpad and adds it to the Tool Area, in the given launchpad states.
     * Once the item is added, the Tool Area is rendered on the left side on the Fiori Launchpad shell.
     *
     * <b>Example:</b>
     * <pre>
     * Container.getRendererInternal("fiori2").addToolAreaItem({
     *   id: "testButton",
     *   icon: "sap-icon://documents",
     *   expandable: true,
     *   press: function (evt) {
     *     window.alert("Press" );
     *   },
     *   expand: function (evt) {
     *     // This function will be called on the press event of the "expand" button. The result of "expand" event in the UI must be determined by the developer
     *     window.alert("Expand" );
     *   }
     * }, true, false, ["home"]);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {object} oControlProperties The properties object that will be passed to the constructor of sap.ushell.ui.shell.ToolAreaItem control.
     *    @see sap.ushell.ui.shell.ToolAreaItem
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If <code>true</code>, add the item to the currently rendered shell.
     *    If <code>false</code>, add the item to the given LaunchPadStates
     *    This causes the items to be rendered every time the given states are active.
     * @param {string[]} vStates (only valid if bCurrentState is set to <code>false</code>) -
     *    An array of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) in which the controls are added.
     *    If no launchpad state is provided the items are added in all states.
     *    @see sap.ushell.renderer.Renderer.LaunchpadState.
     * @returns {sap.ui.core.Control} the added control
     * @since 1.30
     * @private
     */
    Renderer.prototype.addToolAreaItem = function (oControlProperties, bIsVisible, bCurrentState, vStates) {
        const aStates = this._sanitizeStates(vStates);
        if (bIsVisible !== null) { // ExtensionService case: do not overwrite control properties;
            oControlProperties.visible = !!bIsVisible;
        }

        function fnCreate (oProperties) {
            return new ToolAreaItem(oProperties);
        }
        const oItem = this.createItem(oControlProperties, bCurrentState, fnCreate);

        if (bIsVisible) {
            this.showToolAreaItem([oItem.getId()], bCurrentState, aStates);

            // turn on tool area visibility
            if (bCurrentState) {
                const sCurrentLaunchpadState = StateManager.getLaunchpadState();
                this.showToolArea(sCurrentLaunchpadState, true);
            } else {
                aStates.forEach((sLaunchpadState) => {
                    this.showToolArea(sLaunchpadState, true);
                });
            }
        }

        return oItem;
    };

    /**
     * Creates and displays a shell header icon in Fiori launchpad, in the given launchpad states.</br>
     * The icon is displayed in the right side of the Fiori Launchpad shell header or in an overflow menu.</br>
     * The text property is mandatory as it might be used in the overflow menu.</br>
     * The tooltip property must not have the same text as the text property, as this causes accessibility issues if the item is in the overflow menu.</br>
     * If no tooltip is provided, the text property is shown as tooltip when the item is not in the overflow menu.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2");
     *
     *     // Create an icon button that opens a dialog
     *     oRenderer.addHeaderEndItem({
     *         id: "myTestButton",
     *         icon: "sap-icon://action-settings",
     *         tooltip: resources.i18n.getText("testButton.tooltip"),
     *         text: resources.i18n.getText("testButton.text"),
     *         ariaLabel: resources.i18n.getText("testButton.ariaLabel"),
     *         ariaHaspopup: "dialog",
     *         press: [myController.handleTestButtonPress, myController]
     *     }, true);
     *
     *     // Create a temporary link
     *     oRenderer.addHeaderEndItem({
     *         id: "myTestLink",
     *         ariaLabel: resources.i18n.getText("testLink.label"),
     *         target: "#MyTestApplication-show",
     *         icon: "sap-icon://overflow"
     *     }, true, true);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} controlType The (class) name of the control type to create.
     *   <b>Deprecated</b>: Since version 1.38.
     *   This parameter is no longer supported and can be omitted.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     *   The object may contain the following properties:
     *   <ul>
     *     <li>{string} [id] - The ID of the object.<br>
     *     <li>{string} icon - The button icon source.<br>
     *     <li>{string} [text] - The button text. It is only rendered in the overflow popover but not in the shell header.<br>
     *     <li>{string} [target] - target URI for a navigation link.<br>
     *     <li>{string} [ariaLabel] - Accessibility: aria-label attribute.<br>
     *     <li>{string} [ariaHaspopup] - Accessibility: aria-haspopup attribute.<br>
     *     <li>{Function} [press] - A function to be called when the button is depressed.<br>
     *   </ul>
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} vStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderer.Renderer.LaunchpadState in which to add the control.
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {sap.ui.core.Control} oItem - the created control
     * @since 1.30
     * @private
     */
    Renderer.prototype.addHeaderEndItem = function (controlType, oControlProperties, bIsVisible, bCurrentState, vStates) {
        // in order to support deprecation of the never used argument: 'controlType' , we'll need to check whether it was passed to
        // the function by checking the types of the first two arguments
        if (typeof (arguments[0]) === "object" && typeof (arguments[1]) === "boolean") {
            oControlProperties = arguments[0];
            bIsVisible = arguments[1];
            bCurrentState = arguments[2];
            vStates = arguments[3];
        }
        const aStates = this._sanitizeStates(vStates);

        const oItem = this.createItem(oControlProperties, bCurrentState, (oProperties) => {
            // the new ShellBarItem has its event handler called 'click' instead of 'press'
            // while all current headerEndItem implementations are passing oProperties with 'press' key
            // that is why we are creating a property with 'click' key
            if (Config.last("/core/shellBar/enabled")) {
                // since some plugins e.g Built-in support are adding the press event handler later
                // we make sure we create the 'click' property only if there is a press event handler
                if (typeof oProperties.press === "function") {
                    oProperties = {
                        ...oProperties,
                        click: oProperties.press
                    };
                }

                delete oProperties.press;
                delete oProperties.ariaLabel;
                // TODO Move to async import once the infrastructure gets updated with the latest browser version
                const ShellBarItem = sap.ui.require("sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarItem");
                return new ShellBarItem(oProperties);
            }
            return new ShellHeadItem(oProperties);
        });

        if (bIsVisible) {
            this.showHeaderEndItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /* -------------------general---------------------------*/

    Renderer.prototype.getModelConfiguration = function () {
        return this.shellCtrl.getModelConfiguration();
    };

    /**
     * Adds the given sap.ui.core.Control to the EndUserFeedback dialog.</br>
     * The EndUserFeedback dialog is opened via the user actions menu in the Fiori Launchpad shell header.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {object} oCustomUIContent The control to be added to the EndUserFeedback dialog.
     * @param {boolean} bShowCustomUIContent Specify whether to display the control.
     * @since 1.30
     * @deprecated since 1.93
     * @private
     */
    Renderer.prototype.addEndUserFeedbackCustomUI = function (oCustomUIContent, bShowCustomUIContent) {
        if (oCustomUIContent || bShowCustomUIContent) {
            Log.info("Application calls sap.ushell.Renderer.addEndUserFeedbackCustomUI. This function is deprecated. The call has no effect.");
        }
    };

    /**
     * Adds an entry to the User Preferences dialog box including the UI control that appears when the user clicks the new entry,
     * and handling of User Preferences actions such as SAVE and CANCEL.
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2");
     * var oEntry = {
     *   title: "title",
     *   value: function() {
     *       return jQuery.Deferred().resolve("entryTitleToBeDisplayed");
     *   },
     *   content: function() {
     *       return jQuery.Deferred().resolve(new sap.m.Button("userPrefEntryButton", {text: "Button"}));
     *   },
     *   onSave: function() {
     *       return jQuery.Deferred().resolve();
     *   }
     * };
     * oRenderer.addUserPreferencesEntry(oEntry);
     * </pre>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {object} entryObject The data of the new added User Preference entry.
     * @param {string} entryObject.entryHelpID (Optional) - The ID of the object.
     * @param {string} entryObject.title - The title of the entry to be presented in the list in the User Preferences dialog box. We recommend using a string from the translation bundle.
     * @param {string|function} value - A string to be presented as the value of the entry OR a function to be called which returns a {@link jQuery.Promise} object.
     * @param {function} entryObject.content - A function to be called that returns a {@link jQuery.Promise} object which consists of a
     * {sap.ui.core.Control} to be displayed in a follow-on dialog box. A SAPUI5 view instance can also be returned. The function is called on each time the user opens the User Preferences dialog box.
     * @param {function} entryObject.onSave - A function to be called which returns a {@link jQuery.Promise} object when the user clicks "save" in the User Preferences dialog box.
     * If an error occurs, pass the error message via the {@link jQuery.Promise} object. Errors are displayed in the log.
     * @param {function} entryObject.onCancel - A function to be called that closes the User Preferences dialog box without saving any changes.
     * @param {boolean} entryObject.provideEmptyWrapper - Experimental. Set this value to true if you want that your content is displayed without the standard header.
     *
     * @since 1.30
     * @private
     */
    Renderer.prototype.addUserPreferencesEntry = function (entryObject) {
        this.shellCtrl.addUserPreferencesEntry(entryObject);
    };

    /**
     * Adds an entry to the User Preferences dialog box including the UI control that appears when the user clicks the new entry,
     * and handling of User Preferences actions such as SAVE and CANCEL.
     *
     * If an entry with the same groupingId exists, then they will share one entry and the content of each entry in the group,
     * is reachable via an IconTabBar.
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2");
     * var oEntry = {
     *     title: "title",
     *     value: function() {
     *         return jQuery.Deferred().resolve("entryTitleToBeDisplayed");
     *     },
     *     content: function() {
     *         return jQuery.Deferred().resolve(new sap.m.Button("userPrefEntryButton", {text: "Button"}));
     *     },
     *     onSave: function() {
     *         return jQuery.Deferred().resolve();
     *     },
     *     groupingId: "userActivities",
     *     groupingTabHelpId: "myNewUserActivitiesTab",
     *     groupingTabTitle: "myNewUserActivitiesTabName"
     * };
     * oRenderer.addUserPreferencesGroupedEntry(oEntry);
     * </pre>
     *
     * @param {object} entryObject The data of the new added User Preference entry
     *   Including:
     *   <ul>
     *     <li>{string} entryHelpID (Optional) - The ID of the object.<br>
     *     <li>{string} title - The title of the entry to be presented in the list in the User Preferences dialog box.<br>
     *     We recommend using a string from the translation bundle.<br>
     *     <li>{string}/{Function} value - A string to be presented as the value of the entry<br>
     *     OR a function to be called which returns a {@link jQuery.Promise} object.<br>
     *     <li>{Function} content - A function to be called that returns a {@link jQuery.Promise} object<br>
     *     which consists of a {sap.ui.core.Control} to be displayed in a follow-on dialog box. A SAPUI5 view instance can also be returned.
     *     The functions is called on each time the user opens the User Preferences dialog box.
     *     <li>{Function} onSave - A function to be called which returns a {@link jQuery.Promise}
     *     object when the user clicks Save in the User Preferences dialog box.<br>
     *     If an error occurs, pass the error message via the {@link jQuery.Promise} object. Errors are displayed in the log.<br>
     *     <li>{Function} onCancel - A function to be called that closes the User Preferences dialog box without saving any changes. <br>
     *     <li>{boolean} provideEmptyWrapper - Experimental. Set this value to true if you want that your content is displayed without the standard header<br>
     *     <li>{string} groupingId - The ID of the group this entry should be included in <br>
     *     <li>{string} groupingTabTitle - The tab title of the entry, when this entry is grouped. <br>
     *     <li>{string} groupingTabHelpId - The help ID for the grouped tab, when this entry is grouped. <br>
     *   </ul>
     *
     * @returns {object} User Preference Entry.
     *
     * @ui5-restricted sap.fe, sap.esh.search.ui
     * @since 1.110
     * @private
     */
    Renderer.prototype.addUserPreferencesGroupedEntry = function (entryObject) {
        return this.shellCtrl.addUserPreferencesEntry(entryObject, true);
    };

    /**
     * Sets the title in the Fiori Launchpad shell header.
     * Note: This is not the actual title but the second title.
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} sTitle The title to be displayed in the Fiori Launchpad shell header
     * @since 1.30
     * @private
     */
    Renderer.prototype.setHeaderTitle = function (sTitle) {
        this.shellCtrl.setHeaderTitle(sTitle);
    };

    /**
     * Sets the visibility of the left pane in the Fiori Launchpad shell, in the given launchpad state @see LaunchpadState
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} sLaunchpadState LaunchpadState in which to show/hide the left pane
     * @param {boolean} bVisible specify whether to display the left pane or not
     * @since 1.30
     * @private
     */
    Renderer.prototype.setLeftPaneVisibility = function (sLaunchpadState, bVisible) {
        if (!sLaunchpadState) {
            sLaunchpadState = this.LaunchpadState.Home;
        }
        StateManager.updateBaseStates([sLaunchpadState], "sidePane.visible", Operation.Set, bVisible);
    };

    /**
     * Sets the ToolArea visibility
     *
     * <br>Note: Was public with fiori2/Renderer
     * @param {string} [sLaunchpadState] - LaunchpadState in which to show/hide the ToolArea @see LaunchpadState
     * @param {boolean} [bVisible] - specifies whether to display the ToolArea or not
     * @private
     */
    Renderer.prototype.showToolArea = function (sLaunchpadState, bVisible) {
        if (!sLaunchpadState) {
            sLaunchpadState = this.LaunchpadState.Home;
        }
        StateManager.updateBaseStates([sLaunchpadState], "toolArea.visible", Operation.Set, bVisible);
    };

    /**
     * Hides the header
     * @param {boolean} bHiding Whether to hide the header
     * @deprecated since 1.120. Functionality was discontinued.
     */
    Renderer.prototype.setHeaderHiding = function (bHiding) {
        Log.error("sap.ushell.Renderer.setHeaderHiding: Functionality was discontinued.");
    };

    /**
     * Set the content of the floating container in the given launchpad states.<br><br>
     *
     * The floating container displays a single UI control of type <code>sap.ui.core.Control</code>.<br>
     * The initial visibility of the floating container  is <code>false</code> and is set using:
     *   @see sap.ushell.renderer.Renderer.prototype.setFloatingContainerVisibility<br><br>
     *
     * <b>Example for setting the container's content for the "home" and "app" states:</b>
     * <pre>
     * var oRenderer = Container.getRendererInternal("fiori2"),
     *     oButton = new sap.m.Button("Button", {text: "Button"});
     * oRenderer.setFloatingContainerContent(oButton, false, ["home", "app"]);
     * oRenderer.setFloatingContainerVisibility(true);
     * </pre>
     *
     * @param {sap.ui.core.Control} oControl The UI control that is set to be the content of the floating container
     * @param {boolean} bCurrentState If <code>true</code> (and the container's visibility is set to <code>true</code>)
     *   then the given content is displayed by the container in the current shell state.<br>
     *   When the user navigates to a different state (including navigating to a different application) then the content will be removed.<br>
     *   If <code>false</code> then the content is added to the states mentioned in the parameter <code>aStates</code>.<br>
     * @param {string[]} aStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderer.Renderer.LaunchpadState) in which the given content is shown in
     *   the floating container (if the container's visibility is set to <code>true</code>).<br>
     *   If no launchpad state is provided the content is added in all states.
     *   @see LaunchpadState
     * @private
     */
    Renderer.prototype.setFloatingContainerContent = function (oControl, bCurrentState, aStates) {
        this._updateItemStates([oControl.getId()], bCurrentState, aStates, "floatingContainer.items", Operation.Add);
    };

    /**
     * Set the current visibility state of the floating container
     *
     * @param {boolean} bVisible The visibility state of the floating container
     * @private
     */
    Renderer.prototype.setFloatingContainerVisibility = function (bVisible) {
        StateManager.updateAllBaseStates("floatingContainer.visible", Operation.Set, bVisible);
    };

    /**
     * Get the current docking state of the floating container
     *
     * @returns {boolean} The state : floating or docked
     * @private
     */
    Renderer.prototype.getFloatingContainerState = function () {
        return ShellModel.getModel().getProperty("/floatingContainer/state");
    };

    /**
     * Get the current visibility state of the floating container
     *
     * @returns {boolean} Indicates whether the floating container is visible
     * @private
     */
    Renderer.prototype.getFloatingContainerVisiblity = function () {
        return ShellModel.getModel().getProperty("/floatingContainer/visible");
    };

    /**
     * Get the current visibility state of the floating container
     *
     * @returns {boolean} Indicates whether the floating container is visible
     * @private
     */
    Renderer.prototype.getRightFloatingContainerVisibility = function () {
        return this.shellCtrl.getRightFloatingContainerVisibility();
    };

    /**
     * Set the element that will capture the floating container
     *
     * @param {string} sElementToCaptureSelector Element to capture selector.
     * @private
     */
    Renderer.prototype.setFloatingContainerDragSelector = function (sElementToCaptureSelector) {
        StateManager.updateAllBaseStates("floatingContainer.dragSelector", Operation.Set, sElementToCaptureSelector);
    };

    /* ---------------States------------------------*/

    /**
     * The launchpad states that can be passed as a parameter.</br>
     *
     * <b>Values:</b>
     *   App - launchpad state when running a Fiori app</br>
     *   Home - launchpad state when the home page is open</br>
     *
     * <br>Note: Was public with fiori2/Renderer
     * @since 1.30
     * @private
     */
    Renderer.prototype.LaunchpadState = {
        App: "app",
        Home: "home"
    };

    /* ---------------Conditional----------------*/

    Renderer.prototype.createTriggers = function (aTriggers, bCurrentState, vStates) {
        Log.error("'createTriggers' was discontinued.");
    };

    /* ---------------Generic--------------------*/

    Renderer.prototype.convertButtonsToActions = function (aIds, bCurrentState, vStates) {
        const aStates = this._sanitizeStates(vStates);

        const oProperties = {};
        const that = this;
        aIds.forEach((sId) => {
            const oButton = Element.getElementById(sId);
            oProperties.id = oButton.getId();
            oProperties.text = oButton.getText();
            oProperties.icon = oButton.getIcon();
            oProperties.tooltip = oButton.getTooltip();
            oProperties.enabled = oButton.getEnabled();
            oProperties.visible = oButton.getVisible();
            if (oButton.mEventRegistry && oButton.mEventRegistry.press) {
                oProperties.press = oButton.mEventRegistry.press[0].fFunction;
            }
            oButton.destroy();
            that.addActionButton("sap.ushell.ui.launchpad.ActionItem", oProperties, oProperties.visible, bCurrentState, aStates);
        });
    };

    Renderer.prototype.createItem = function (oControlProperties, bCurrentState, fnCreateItem) {
        // create the object
        let oControl;
        if (oControlProperties && oControlProperties.id) {
            oControl = Element.getElementById(oControlProperties.id);
        }
        if (!oControl) {
            oControl = fnCreateItem(oControlProperties);
            StateManager.addManagedControl(oControl.getId(), !bCurrentState);
        }

        return oControl;
    };

    /* ------------Custom State Entry------------------------------*/

    /**
     * @deprecated since 1.120. Deprecated without successor.
     * @private
     */
    Renderer.prototype.addEntryInShellStates = function () {
        Log.error("'addEntryInShellStates' was deprecated and discontinued.");
    };

    /**
     * @deprecated since 1.120. Deprecated without successor.
     * @private
     */
    Renderer.prototype.removeCustomItems = function () {
        Log.error("'removeCustomItems' was deprecated and discontinued.");
    };

    /**
     * @deprecated since 1.120. Deprecated without successor.
     * @private
     */
    Renderer.prototype.addCustomItems = function () {
        Log.error("'addCustomItems' was deprecated and discontinued.");
    };

    /**
     * @deprecated since 1.120. The ViewPortState is related to Fiori2 and not used anymore.
     */
    Renderer.prototype.addRightViewPort = function () { };

    /**
     * @deprecated since 1.120. The ViewPortState is related to Fiori2 and not used anymore.
     */
    Renderer.prototype.addLeftViewPort = function () { };

    Renderer.prototype.getShellController = function () {
        return this.shellCtrl;
    };

    /**
     * @returns {string} The current ViewPort State
     * @deprecated since 1.120. The ViewPortState is related to Fiori2 and not used anymore.
     */
    Renderer.prototype.getViewPortContainerCurrentState = function () {
        return "Center";
    };

    Renderer.prototype.ViewPortContainerNavTo = function (sName, sTargetName, sAction) {
        this.shellCtrl.getNavContainer().navTo(sTargetName);
    };

    /**
     * @deprecated since 1.65
     */
    Renderer.prototype.switchViewPortStateByControl = function () { };

    /**
     * @deprecated since 1.65
     */
    Renderer.prototype.ViewPortContainerAttachAfterSwitchStateAnimationFinished = function () { };

    Renderer.prototype.setUserActionsMenuSelected = function (bSelected) {
        this.shellCtrl.setUserActionsMenuSelected(bSelected);
    };

    Renderer.prototype.setNotificationsSelected = function (bSelected) {
        this.shellCtrl.setNotificationsSelected(bSelected);
    };

    Renderer.prototype.addShellDanglingControl = function (oControl) {
        this.shellCtrl.getView().addDanglingControl(oControl);
    };

    Renderer.prototype.getShellConfig = function () {
        return (this.shellCtrl.getView().getViewData() ? this.shellCtrl.getView().getViewData().config || {} : {});
    };

    /**
     * @returns {object} The configuration
     * @deprecated since 1.93
     */
    Renderer.prototype.getEndUserFeedbackConfiguration = function () {
        return {};
    };

    Renderer.prototype.reorderUserPrefEntries = function (entries) {
        return this.shellCtrl._reorderUserPrefEntries(entries);
    };

    Renderer.prototype.logRecentActivity = function (oRecentEntry) {
        if (!oRecentEntry.appType) {
            oRecentEntry.appType = AppType.APP;
        }
        if (!oRecentEntry.appId) {
            oRecentEntry.appId = oRecentEntry.url;
        }
        return this.shellCtrl._logRecentActivity(oRecentEntry);
    };

    Renderer.prototype.setCurrentCoreView = function (sCoreView) {
        this.currentCoreView = sCoreView;
    };

    Renderer.prototype.getCurrentCoreView = function () {
        return this.currentCoreView;
    };

    /**
     * Helper function that determines if a given intent is a built-in intent
     * (as listed in the metadata's routes).
     * It returns true if it can match the intent, false otherwise.
     * On its first call, a copy of all of those path is created and stored.
     *
     * @param {object} oParsedHash A resolved hash as returned by URLParsing
     * @returns {boolean} True if the intent is built in, false otherwise
     * @private
     * @since 1.85.0
     */
    Renderer.prototype._isBuiltInIntent = function (oParsedHash) {
        if (!Renderer._aBuiltInRoutes) {
            const aRoutes = this.getManifestEntry("/sap.ui5/routing/routes");
            Renderer._aBuiltInRoutes = aRoutes.reduce((aConcatenatedRoutes, oCurrentRoutes) => {
                return aConcatenatedRoutes.concat(oCurrentRoutes.pattern);
            }, []);
        }

        if (!oParsedHash || !oParsedHash.semanticObject || !oParsedHash.action) {
            return false;
        }

        const sIntent = `${oParsedHash.semanticObject}-${oParsedHash.action}`;

        return Renderer._aBuiltInRoutes.indexOf(sIntent) !== -1;
    };

    /**
     * Adding an empty area between the shell and the Iframe.
     * This method is relevant only for the AppRuntime and not
     * for the shell rendering.
     *
     * @since 1.100.0
     * @private
     * @ui5-restricted sap.ui.fl, sap.ui.rta
     */
    this.addTopHeaderPlaceHolder = function () {
    };

    /**
     * Removing the empty area between the shell and the Iframe.
     * This method is relevant only for the AppRuntime and not
     * for the shell rendering.
     *
     * @since 1.100.0
     * @private
     * @ui5-restricted sap.ui.fl, sap.ui.rta
     */
    this.removeTopHeaderPlaceHolder = function () {
    };

    /**
     * Updates the properties of the header item control.
     *
     * Feature was added specifically for one app
     * BCP 2280166193
     *
     * @param {string} sId id of the button
     * @param {{ floatingNumber: int }} oControlProperties New set of properties
     *
     * @since 1.106
     * @private
     */
    Renderer.prototype.updateHeaderItem = function (sId, oControlProperties) {
        const oItem = Element.getElementById(sId);

        if (oItem && oControlProperties) {
            if (oControlProperties.hasOwnProperty("floatingNumber")) {
                oItem.setFloatingNumber(oControlProperties.floatingNumber);
            }
        }
    };

    /**
     * Destroy the button/s controls created by the renderer
     * This method is relevant only for the AppRuntime and not
     * for the shell rendering.
     *
     * @param {string|string[]} vIds the id of a button or an array of ids.
     *
     * @private
     * @since 1.108.0
     */
    Renderer.prototype.destroyButton = function (vIds) {
        if (!vIds) {
            return;
        }
        const aIds = Array.isArray(vIds) ? vIds : [vIds];

        aIds.forEach((sId) => {
            const oButton = Element.getElementById(sId);
            if (oButton) {
                oButton.destroy();
            }
        });
    };

    /**
     * @returns {Promise} Resolves once the Renderer was placed and the ShellLayout was created
     *
     * @private
     * @since 1.114.0
     */
    Renderer.prototype.waitForShellLayout = function () {
        return this.shellCtrl.getView().waitForShellLayout();
    };

    /**
     * @returns {Promise<undefined>} after the shell layout was destroyed.
     * @private
     */
    Renderer.prototype.destroy = function () {
        const oPromise = this.shellCtrl ? this.shellCtrl.awaitPendingInitializations() : Promise.resolve();
        return oPromise
            .then(function () {
                return UIComponent.prototype.destroy.apply(this, arguments);
            }.bind(this))
            .then(() => {
                ShellLayout.destroyLayout();
            });
    };

    /**
     * restore deprecated globals
     * @deprecated since 1.119
     */
    setTimeout(() => { // defer by a tick to avoid circular dependencies
        sap.ui.require([
            "sap/ushell/renderers/fiori2/Renderer"
        ], () => { });
    }, 0);

    return Renderer;
});
