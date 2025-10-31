// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/m/library",
    "sap/m/VBox",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/state/ShellModel",
    "sap/ushell/EventHub"
], (
    mLibrary,
    VBox,
    ComponentContainer,
    Fragment,
    UIComponent,
    Device,
    JSONModel,
    Config,
    Container,
    ShellModel,
    EventHub
) => {
    "use strict";

    const FlexRendertype = mLibrary.FlexRendertype;
    const FlexAlignItems = mLibrary.FlexAlignItems;

    return UIComponent.extend("sap.ushell.components.shell.SideNavigation.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.sSideNavigationMode = Config.last("/core/sideNavigation/mode");

            this._oSideNavigationComponentContainer = new ComponentContainer({
                id: this.createId("SideNavigationComponentContainer"),
                height: "100%",
                component: this
            });
            this._oDockedMainLayout = new VBox({
                id: this.createId("mainLayout"),
                renderType: FlexRendertype.Bare,
                alignItems: FlexAlignItems.Start,
                height: "100%"
            });
            Container.getRendererInternal().setSideNavigation(this._oDockedMainLayout);

            this._addHamburgerButton();

            const oViewConfiguration = new JSONModel({
                // We need to initialize with a non-empty key to avoid flickering of the selection.
                selectedKey: "NONE",
                enableSideNavigation: true,
                expanded: true,
                renderMode: this.sSideNavigationMode
            });
            Config.on("/core/sideNavigation/mode").do(this._handleRenderModeChange.bind(this));

            Device.resize.attachHandler(this._handleRenderModeChange.bind(this));

            this.setModel(oViewConfiguration, "viewConfiguration");
            this._handleRenderModeChange(true);
            this.setModel(ShellModel.getModel(), "shellModel");
        },

        _handleRenderModeChange: function (bModeChange) {
            const oModel = this.getModel("viewConfiguration");
            let sValue = Config.last("/core/sideNavigation/mode");

            if (Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name !== "Desktop") {
                sValue = "Popover";
                oModel.setProperty("/expanded", true);
            }
            bModeChange = bModeChange ?? (this.sSideNavigationMode !== sValue);
            this.sSideNavigationMode = sValue;
            oModel.setProperty("/renderMode", sValue);

            if (bModeChange) {
                this.rootControlLoaded().then(() => {
                    EventHub.emit("sideNavigationModeChanged", sValue);
                    if (sValue === "Docked") {
                        this._oDockedMainLayout.addItem(this._oSideNavigationComponentContainer);
                        this.popoverClose();
                    } else {
                        this._getPopover().then((oPopover) => {
                            oPopover.addContent(this._oSideNavigationComponentContainer);
                        });
                    }
                });
            }
        },

        /**
         * Adds (attach) the hamburger button to the shell bar.
         * Shows the button on the home page and for all apps.
         *
         * @since 1.132.0
         * @private
         * @async
         */
        _addHamburgerButton: async function () {
            this.headerHamburgerButtonItemStart = await this._hamburgerButtonFactory();
            this.headerHamburgerButtonItemStart.showOnHome();
            this.headerHamburgerButtonItemStart.showForAllApps();
        },

        /**
         * Toggles the side navigation between expanded and collapsed.
         *
         * If the parameter is not provided, the side navigation will be toggled to the opposite of its current state.
         *
         * @param {boolean} [bExpanded] Optionally, the new state of the side navigation.
         * @since 1.134.0
         * @private
         */
        toggleSideNavigationExpansion: function (bExpanded) {
            const oViewConfigModel = this.getModel("viewConfiguration");
            if (bExpanded === undefined) {
                bExpanded = !oViewConfigModel.getProperty("/expanded");
            }
            oViewConfigModel.setProperty("/expanded", !!bExpanded);
        },

        /**
         * Returns a promise that resolves with the Fragment including the Popover.
         *
         * @returns {Promise<sap.ui.core.Control>} A promise that resolves with the Popover.
         * @since 1.135.0
         * @private
         */
        _getPopover: function () {
            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: this.createId("sideNavigationPopover"),
                    name: "sap.ushell.components.shell.SideNavigation.fragment.Popover"
                });
            }
            return this._pPopover;
        },

        /**
         * Handles the press event of the side navigation button (hamburger button) in the shell bar.
         *
         * Expands or collapses the side navigation based on its current state if in Docked mode or
         * opens or closes the side navigation popover if in Popover mode.
         *
         * @param {object} oEvent The press event object.
         * @since 1.133.0
         */
        onSideNavigationTogglePress: async function (oEvent) {
            switch (this.sSideNavigationMode) {
                case "Docked":
                    this.toggleSideNavigationExpansion();
                    this.rootControlLoaded().then((oSideNavigation) => {
                        const oNavContainer = oSideNavigation.byId("navContainer");
                        if (oNavContainer.getCurrentPage() !== "sideNavigation") {
                            oNavContainer.to(oSideNavigation.byId("sideNavigation"));
                        }
                    });
                    break;
                case "Popover":
                    const oButton = oEvent.getSource();

                    if (!this._pPopover) {
                        this._getPopover().then((oPopover) => {
                            oPopover.addContent(this._oSideNavigationComponentContainer);

                            this.getModel("viewConfiguration").setProperty("/popover", oPopover);
                            return oPopover;
                        });
                    }

                    this._pPopover.then((oPopover) => {
                        if (oPopover.isOpen()) {
                            oPopover.close();
                        } else {
                            oPopover.openBy(oButton);
                        }
                    });
                    break;
                default:
                    throw new Error(`Unhandled side navigation mode: ${this.sSideNavigationMode}`);
            }
        },

        /**
         * Opens the side navigation popover.
         *
         * @since 1.134.0
         * @private
         */
        popoverOpen: function () {
            this._pPopover?.then(async (oPopover) => {
                oPopover.openBy(await this.headerHamburgerButtonItemStart.getControl());
            });
        },

        /**
         * Closes the side navigation popover.
         *
         * @since 1.134.0
         * @private
         */
        popoverClose: function () {
            this._pPopover?.then((oPopover) => {
                oPopover.close();
            });
        },

        /**
        * Creates a header item for the side navigation button (hamburger button) in the shell bar.
        * The button is used to expand or collapse the side navigation.
        * @returns {Promise<sap.ushell.services.FrameBoundExtension.Item>} A promise that resolves to the newly created header item.
        *
        * @see sap.ushell.services.FrameBoundExtension.Item
        * @async
        * @since 1.132.0
        * @private
        */
        _hamburgerButtonFactory: async function () {
            const ExtensionService = await Container.getServiceAsync("FrameBoundExtension");
            const oHeaderItem = await ExtensionService.createHeaderItem({
                id: "sideMenuExpandCollapseBtn",
                ariaHaspopup: "dialog",
                icon: "sap-icon://menu2",
                press: this.onSideNavigationTogglePress.bind(this),
                tooltip: "{= ${viewConfiguration>/renderMode} === 'Popover' ? ${i18n>ShellBar.SideNavigation.Button.Open.Tooltip}" +
                    " : (${viewConfiguration>/expanded} ? ${i18n>ShellBar.SideNavigation.Button.Collapse.Tooltip} : ${i18n>ShellBar.SideNavigation.Button.Expand.Tooltip})}"
            }, {
                position: "begin"
            });
            const oHeaderItemControl = await oHeaderItem.getControl();
            oHeaderItemControl.setModel(this.getModel("i18n"), "i18n");
            oHeaderItemControl.setModel(this.getModel("viewConfiguration"), "viewConfiguration");
            return oHeaderItem;
        },

        /**
         * Called when the component is destroyed.
         *
         * Cleans up the component by destroying the controls created by the component.
         *
         * @since 1.135.0
         */
        exit: function () {
            // The component needs to be removed first because destroying the ComponentContainer triggers also calls the destroy
            // method of the component. This could cause an infinite loop.
            this._oSideNavigationComponentContainer?.setComponent(undefined);
            this._oSideNavigationComponentContainer?.destroy();
            this._oDockedMainLayout?.destroy();
        }
    });
});
