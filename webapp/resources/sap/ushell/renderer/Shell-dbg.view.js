// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/Avatar",
    "sap/m/library",
    "sap/ui/core/Component",
    "sap/ui/core/Element",
    "sap/ushell/renderer/shellHeader/ShellHeader.controller",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/Fragment",
    "sap/ushell/api/NewExperience",
    "sap/ushell/renderer/ShellLayout",
    "sap/ushell/renderer/Shell.controller", // controller must be preloaded to avoid naming clashes
    "sap/ushell/state/ShellModel",
    "sap/ushell/state/StateManager",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/state/BindingHelper",
    "sap/ui/core/ComponentContainer"
], (
    Log,
    Avatar,
    mobileLibrary,
    Component,
    Element,
    ShellHeaderController,
    AccessibilityCustomData,
    EventHub,
    ushellResources,
    utils,
    View,
    XMLView,
    Fragment,
    NewExperience,
    ShellLayout,
    ShellController,
    ShellModel,
    StateManager,
    Config,
    Container,
    BindingHelper,
    ComponentContainer
) => {
    "use strict";

    // shortcut for sap.m.AvatarSize
    const AvatarSize = mobileLibrary.AvatarSize;

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    // shortcut for sap.ushell.renderer.ShellLayout.ShellArea
    const ShellArea = ShellLayout.ShellArea;

    const BINDING_TYPE = {
        Property: "Property",
        List: "List"
    };

    return View.extend("sap.ushell.renderer.Shell", {
        getControllerName: function () {
            return "sap.ushell.renderer.Shell";
        },

        waitForShellLayout: function () {
            if (!this._oShellLayoutPromise) {
                this._oShellLayoutPromise = new Promise((resolve) => {
                    this.getController().addDoable(EventHub.once("ShellLayoutApplied").do(resolve));
                });
            }
            return this._oShellLayoutPromise;
        },

        getViewDataConfig: function () {
            const oViewData = this.getViewData() || {};
            const oConfig = oViewData.config || {};
            return oConfig;
        },

        createContent: function () {
            this._createUserActionsMenuButton(ShellModel.getConfigModel());

            // Change config if more then three buttons moved to the header
            this._allowUpToThreeActionInShellHeader();
            StateManager.init(this.getViewDataConfig());

            // BackgroundImage
            this.initBackgroundImage();

            // ShellHeader + HeaderControlManager.init
            const oShellHeaderPromise = this.createShellHeader();

            // NavigationBar
            this.setNavigationBarMinHeight();

            // RendererRootView / NavContainer / viewPortContainer
            const oRendererRootViewPromise = this.createRendererRootView();

            this.setDisplayBlock(true);

            utils.setPerformanceMark("FLP - Shell.view rendering started!");

            return Promise.all([
                oRendererRootViewPromise,
                oShellHeaderPromise // we have to wait as well otherwise the HeaderControlManager is initialized late
            ]).then((aResults) => {
                const oRendererRootView = aResults[0];

                return oRendererRootView;
            });
        },

        initBackgroundImage: function () {
            this.waitForShellLayout().then(() => {
                const oDomRef = document.getElementById(ShellArea.BackgroundImage);
                const sBackgroundHtml = [
                    // "Shell Canvas" category in ThemeDesigner
                    "<div class='sapUiShellBackgroundImage sapUiGlobalBackgroundImageForce sapUshellShellBG sapContrastPlus'></div>",
                    // "Application Background" category in ThemeDesigner
                    "<div class='sapMShellBG sapUiGlobalBackgroundImage'></div>"
                ].join("\n");
                oDomRef.insertAdjacentHTML("afterbegin", sBackgroundHtml);
            });
        },

        createRendererRootView: function () {
            const oController = this.getController();
            return Fragment.load({
                name: "sap.ushell.renderer.RendererRootView",
                controller: oController
            }).then((oRendererRootView) => {
                BindingHelper.overrideUpdateAggregation(oRendererRootView);

                return oRendererRootView;
            });
        },

        createRendererRootViewFallback: function () {
            const oController = this.getController();
            return Fragment.load({
                name: "sap.ushell.renderer.RendererRootViewFallback",
                controller: oController
            }).then((oRendererRootView) => {
                BindingHelper.overrideUpdateAggregation(oRendererRootView);

                return oRendererRootView;
            });
        },

        createShellHeader: async function () {
            if (Config.last("/core/shellBar/enabled")) {
                // Render the new ShellBar component
                return Component.create({
                    name: "sap.ushell.components.shell.ShellBar"
                }).then((oShellBar) => {
                    // Assign models to the Shell Bar
                    oShellBar.setModel(ushellResources.i18nModel, "i18n");
                    oShellBar.setModel(NewExperience.getModel(), "newExperience");
                    oShellBar.setModel(ShellModel.getModel(), "shellModel");

                    this.waitForShellLayout().then(() => {
                        const oShellBarComponentContainer = new ComponentContainer({
                            component: oShellBar,
                            id: "shell-header",
                            async: true
                        });
                        oShellBar.enhanceComponentContainerAPI(oShellBarComponentContainer);
                        oShellBarComponentContainer.placeAt(ShellArea.ShellHeader, "only");

                        this.addDanglingControl(oShellBarComponentContainer);
                        this._oShellHeader = oShellBarComponentContainer;
                    });
                });
            } else if (!Config.last("/core/shellBar/enabled")) {
                // Render the old ShellHeader
                const oHeaderController = new ShellHeaderController();

                return Fragment.load({
                    name: "sap.ushell.renderer.shellHeader.ShellHeader",
                    controller: oHeaderController
                }).then((oShellHeader) => {
                    BindingHelper.overrideUpdateAggregation(oShellHeader);

                    // Assign models to the Shell Header
                    oShellHeader.setModel(ushellResources.i18nModel, "i18n");
                    oShellHeader.setModel(NewExperience.getModel(), "newExperience");
                    oShellHeader.setModel(ShellModel.getModel(), "shellModel");
                    this.addDanglingControl(oShellHeader);
                    // save for later use
                    this._oShellHeader = oShellHeader;

                    this.waitForShellLayout().then(() => {
                        oShellHeader.placeAt(ShellArea.ShellHeader, "only");
                        oHeaderController.onInit();
                    });
                });
            }
        },

        setNavigationBarMinHeight: function () {
            return Container.getServiceAsync("Menu")
                .then((oMenuService) => {
                    return oMenuService.isMenuEnabled();
                })
                .then((bMenuEnabled) => {
                    if (!bMenuEnabled) {
                        return;
                    }

                    this.waitForShellLayout().then(() => {
                        const navigationBar = document.getElementById(ShellArea.NavigationBar);
                        navigationBar.classList.add("sapUshellMenuBarHeight");
                    });
                })
                .catch((oError) => {
                    Log.info("Could not apply min-height of the navigationBar", oError);
                });
        },

        createRightFloatingContainer: function () {
            this.addPendingInitialization(new Promise((resolve) => {
                sap.ui.require(["sap/ushell/ui/shell/RightFloatingContainer"], (RightFloatingContainer) => {
                    const oRightFloatingContainer = new RightFloatingContainer({
                        id: "right-floating-container",
                        top: "2",
                        right: "2",
                        hideItemsAfterPresentation: true,
                        visible: "{shellModel>/rightFloatingContainer/visible}",
                        floatingContainerItems: {
                            path: "shellModel>/rightFloatingContainer/items",
                            factory: BindingHelper.factory
                        }
                    });
                    BindingHelper.overrideUpdateAggregation(oRightFloatingContainer);

                    oRightFloatingContainer.setModel(ShellModel.getModel(), "shellModel");
                    this.addDanglingControl(oRightFloatingContainer);
                    // save for later use
                    this._oRightFloatingContainer = oRightFloatingContainer;
                    resolve();

                    this.waitForShellLayout().then(() => {
                        oRightFloatingContainer.placeAt(ShellArea.RightFloatingContainer, "only");
                    });
                });
            }));
        },

        createSubHeader: function () {
            sap.ui.require(["sap/ushell/ui/shell/SubHeader"], (SubHeader) => {
                const oSubHeader = new SubHeader({
                    id: "subhdr",
                    content: {
                        path: "shellModel>/subHeader/items",
                        factory: BindingHelper.factory
                    }
                });
                BindingHelper.overrideUpdateAggregation(oSubHeader);

                oSubHeader.setModel(ShellModel.getModel(), "shellModel");
                this.addDanglingControl(oSubHeader);

                this.waitForShellLayout().then(() => {
                    oSubHeader.placeAt(ShellArea.SubHeader, "only");
                });
            });
        },

        createFloatingContainer: async function () {
            const oComponent = await Component.create({
                name: "sap.ushell.components.shell.FloatingContainer"
            });
            this.addDanglingControl(oComponent);
            return oComponent;
        },

        createSidePane: function () {
            sap.ui.require(["sap/ushell/ui/shell/SidePane"], (SidePane) => {
                const oSidePane = new SidePane({
                    id: "shell-sidePane",
                    visible: "{shellModel>/sidePane/visible}",
                    content: {
                        path: "shellModel>/sidePane/items",
                        factory: BindingHelper.factory
                    }
                });
                BindingHelper.overrideUpdateAggregation(oSidePane);

                oSidePane.setModel(ShellModel.getModel(), "shellModel");
                this.addDanglingControl(oSidePane);

                this.waitForShellLayout().then(() => {
                    oSidePane.placeAt(ShellArea.SidePane, "only");
                });
            });
        },

        createToolArea: function () {
            sap.ui.require(["sap/ushell/ui/shell/ToolArea"], (ToolArea) => {
                const oShellToolArea = new ToolArea({
                    id: "shell-toolArea",
                    visible: "{shellModel>/toolArea/visible}",
                    toolAreaItems: {
                        path: "shellModel>/toolArea/items",
                        factory: BindingHelper.factory
                    }
                });
                BindingHelper.overrideUpdateAggregation(oShellToolArea);

                oShellToolArea.setModel(ShellModel.getModel(), "shellModel");
                this.addDanglingControl(oShellToolArea);

                this.waitForShellLayout().then(() => {
                    oShellToolArea.placeAt(ShellArea.ToolArea, "only");
                });
            });
        },

        /**
         * @deprecated since 1.120
         */
        createFloatingActions: function () {
            sap.ui.require(["sap/ushell/ui/shell/ShellFloatingActions"], (ShellFloatingActions) => {
                const oShellFloatingActions = new ShellFloatingActions({
                    id: "shell-floatingActions",
                    floatingActions: {
                        path: "shellModel>/floatingActions/items",
                        factory: BindingHelper.factory
                    }
                });
                BindingHelper.overrideUpdateAggregation(oShellFloatingActions);

                oShellFloatingActions.setModel(ShellModel.getModel(), "shellModel");
                this.addDanglingControl(oShellFloatingActions);

                this.waitForShellLayout().then(() => {
                    oShellFloatingActions.placeAt(ShellArea.FloatingActions, "only");
                });
            });
        },

        initAllMyAppsView: function () {
            return Container.getServiceAsync("AllMyApps").then((oAllMyApps) => {
                if (oAllMyApps.isEnabled()) {
                    return this.createAllMyAppsView();
                }
            });
        },

        createAllMyAppsView: function () {
            return XMLView.create({
                id: "allMyAppsView",
                viewName: "sap.ushell.renderer.allMyApps.AllMyApps"
            }).then((allMyAppsView) => {
                allMyAppsView.setModel(ShellModel.getConfigModel(), "configModel");
                allMyAppsView.setModel(ushellResources.i18nModel, "i18n");
                allMyAppsView.addCustomData(new AccessibilityCustomData({
                    key: "aria-label",
                    value: ushellResources.i18n.getText("allMyApps_headerTitle"),
                    writeToDom: true
                }));
                this.addDanglingControl(allMyAppsView);
                if (Config.last("/core/shellBar/enabled")) {
                    Element.getElementById(this.getShellHeader().getAppTitle()).setAllMyApps(allMyAppsView);
                } else {
                    this.getShellHeader().getAppTitle().setAllMyApps(allMyAppsView);
                }
            });
        },

        /**
         * Begin factory functions for lazy instantiation of Shell Layout controls
         */
        createPostCoreExtControls: function () {
            const oShellModel = ShellModel.getModel();

            // apply the highest z-index used by the shell
            sap.ui.require(["sap/ui/core/Popup"], (Popup) => {
                Popup.setInitialZIndex(11);
            });

            // FloatingContainer
            this.bindFactory({
                model: oShellModel,
                factory: this.createFloatingContainer.bind(this),
                // CollaborationManager (sap.h2hchat.ui) requires the content to be already invisibly rendered
                bindingPath: "/floatingContainer/items",
                bindingType: BINDING_TYPE.List,
                valueCheck: function (aValues) {
                    return !!aValues.length;
                }
            });

            // RightFloatingContainer
            this.bindFactory({
                model: oShellModel,
                factory: this.createRightFloatingContainer.bind(this),
                bindingPath: "/rightFloatingContainer/visible",
                bindingType: BINDING_TYPE.Property,
                valueCheck: function (bValue) {
                    return !!bValue;
                }
            });

            // SubHeader
            this.bindFactory({
                model: oShellModel,
                factory: this.createSubHeader.bind(this),
                bindingPath: "/subHeader/items",
                bindingType: BINDING_TYPE.List,
                valueCheck: function (aValues) {
                    return !!aValues.length;
                }
            });

            // ToolArea
            this.bindFactory({
                model: oShellModel,
                factory: this.createToolArea.bind(this),
                bindingPath: "/toolArea/visible",
                bindingType: BINDING_TYPE.Property,
                valueCheck: function (bValue) {
                    return !!bValue;
                }
            });

            // (Left)SidePane
            this.bindFactory({
                model: oShellModel,
                factory: this.createSidePane.bind(this),
                bindingPath: "/sidePane/visible",
                bindingType: BINDING_TYPE.Property,
                valueCheck: function (bValue) {
                    return !!bValue;
                }
            });

            /**
             * code shall be automatically removed by tooling
             * @deprecated since 1.120
             */
            this.bindFactory({ // FloatingActions (deprecated)
                model: oShellModel,
                factory: this.createFloatingActions.bind(this),
                bindingPath: "/floatingActions/items",
                bindingType: BINDING_TYPE.List,
                valueCheck: function (aValues) {
                    return !!aValues.length;
                }
            });

            this.addPendingInitialization(this.initAllMyAppsView());
        },

        /**
         * allow up to 3 actions in shell header
         */
        _allowUpToThreeActionInShellHeader: function () {
            const aParameter = [
                "moveAppFinderActionToShellHeader",
                "moveUserSettingsActionToShellHeader",
                "moveContactSupportActionToShellHeader",
                "moveEditHomePageActionToShellHeader"
            ];
            const oConfig = this.getViewDataConfig();

            // only allow the first three actions to be moved to the shell header
            aParameter.reduce((iCount, sParam) => {
                if (iCount >= 3) {
                    oConfig[sParam] = false;
                    return iCount;
                }
                if (oConfig[sParam]) {
                    iCount++;
                }
                return iCount;
            }, 0);
        },

        _createUserActionsMenuButton: function (oConfigModel) {
            const oUser = Container.getUser();
            const sTooltip = ushellResources.i18n.getText("UserActionsMenuToggleButtonAria", [oUser.getFullName() || oUser.getId()]);
            const addDanglingControl = this.addDanglingControl.bind(this);
            let oUserActionsMenuAvatar;
            if (Config.last("/core/shellBar/enabled")) {
                sap.ui.require(["sap/ushell/gen/ui5/webcomponents/dist/Avatar", "sap/m/Image"], (AvatarWC, Image) => {
                    oUserActionsMenuAvatar = new AvatarWC({
                        id: "userActionsMenuHeaderButton",
                        icon: "sap-icon://person-placeholder",
                        initials: oUser.getInitials(),
                        tooltip: sTooltip,
                        click: function () {
                            EventHub.emit("showUserActionsMenu", Date.now());
                        },
                        image: new Image({
                            src: "{configModel>/userImage/personPlaceHolder}"
                        })
                    });
                    oUserActionsMenuAvatar.setModel(oConfigModel, "configModel");
                    addDanglingControl(oUserActionsMenuAvatar);
                    StateManager.updateAllBaseStates("header.headEndItems", Operation.Add, "userActionsMenuHeaderButton");
                });
            } else {
                oUserActionsMenuAvatar = new Avatar({
                    id: "userActionsMenuHeaderButton",
                    src: "{configModel>/userImage/personPlaceHolder}",
                    initials: oUser.getInitials(),
                    ariaHasPopup: "Menu",
                    displaySize: AvatarSize.XS,
                    tooltip: sTooltip,
                    press: function () {
                        EventHub.emit("showUserActionsMenu", Date.now());
                    }
                });
                oUserActionsMenuAvatar.setModel(oConfigModel, "configModel");
                this.addDanglingControl(oUserActionsMenuAvatar);
                StateManager.updateAllBaseStates("header.headEndItems", Operation.Add, "userActionsMenuHeaderButton");
            }
        },

        /**
         * @returns {sap.ui.core.Control} The ShellHeader
         *
         * @private
         * @ui5-restricted sap.ui.rta
         * @since 1.114.0
         */
        getShellHeader: function () {
            return this._oShellHeader;
        },

        getRightFloatingContainer: function () {
            return this._oRightFloatingContainer;
        },

        /**
         * Executes the factory instantly in case the <code>model already fulfills the valueCheck.
         * Otherwise binds the factory against the model path.
         * Once the binding fulfills the valueCheck the binding gets destroyed.
         *
         * @param {object} oSettings The settings
         * @param {sap.ui.model.Model} oSettings.model The model
         * @param {function} oSettings.factory The handler which gets executed
         * @param {string} oSettings.bindingPath The binding path
         * @param {string} oSettings.bindingType The type of binding. Either "Property" or "List".
         * @param {function} oSettings.valueCheck The check function.
         *  it receives the bound property as argument. It should return true once the value fulfills the requirements.
         *
         * @private
         * @since 1.115.0
         */
        bindFactory: function (oSettings) {
            const oModel = oSettings.model;
            const fnFactory = oSettings.factory;
            const sPath = oSettings.bindingPath;
            const sBindingType = oSettings.bindingType;
            const fnValueCheck = oSettings.valueCheck;

            let vValue = oModel.getProperty(sPath);
            if (fnValueCheck(vValue)) { // model already fulfills the requirements
                fnFactory();
            } else {
                let oBinding;
                switch (sBindingType) {
                    case BINDING_TYPE.List:
                        oBinding = oModel.bindList(sPath);
                        break;
                    default: // BINDING_TYPE.Property
                        oBinding = oModel.bindProperty(sPath);
                }
                this.addDanglingBinding(oBinding);
                oBinding.attachChange(function () {
                    vValue = oBinding.getModel().getProperty(oBinding.getPath());
                    if (fnValueCheck(vValue)) {
                        this.removeDanglingBinding(oBinding);
                        oBinding.destroy();

                        fnFactory();
                    }
                }, this);
            }
        },

        /**
         * Adds a binding which is destroyed on Renderer destroy
         * @param {sap.ui.model.Binding} oBinding The Binding
         * @see sap.ushell.renderer.Shell.controller#onExit
         *
         * @private
         * @since 1.114.0
         */
        addDanglingBinding: function (oBinding) {
            this.getController().addDanglingBinding(oBinding);
        },

        /**
         * @param {sap.ui.model.Binding} oBinding The Binding
         * @see sap.ushell.renderer.Shell.controller#onExit
         *
         * @private
         * @since 1.114.0
         */
        removeDanglingBinding: function (oBinding) {
            this.getController().removeDanglingBinding(oBinding);
        },

        /**
         * @param {sap.ui.core.Control} oControl The Control
         * @see sap.ushell.renderer.Shell.controller#onExit
         *
         * @private
         * @since 1.114.0
         */
        addDanglingControl: function (oControl) {
            this.getController().addDanglingControl(oControl);
        },

        /**
         * Adds a promise to the list of initializations
         * Only used in test environments!
         * @param {Promise} oPromise A Promise
         * @returns {Promise} Returns the provided promise to allow chaining
         *
         * @private
         * @since 1.114.0
         */
        addPendingInitialization: function (oPromise) {
            return this.getController().addPendingInitialization(oPromise);
        }
    });
});
