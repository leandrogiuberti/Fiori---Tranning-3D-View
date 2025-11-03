// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * Provides control sap.ushell.ui.shell.ShellAppTitle
 *
 * This control is responsible to display the Shell Header Title.
 * This control could be rendered in two different states:
 * 1. Title only: only the title will be rendered inside the Shell Header
 * 2. Title with popover button: A button will be placed in the Shell Header Title area.
 *    When the user clicks on the button, a popover will raise and render the innerControl as its content.
 *    innerControl: the content of the popover. Will be destroyed by the ShellAppTitle control.
 */
sap.ui.define([
    "sap/m/Bar",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/library",
    "sap/m/Popover",
    "sap/m/ResponsivePopover",
    "sap/m/Title",
    "sap/m/ToggleButton",
    "sap/ui/core/Element",
    "sap/ui/core/Icon",
    "sap/ui/core/IconPool",
    "sap/ui/Device",
    "sap/ui/performance/Measurement",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/state/StateManager",
    "sap/ushell/state/ShellModel"
], (
    Bar,
    Button,
    Label,
    HBox,
    VBox,
    mobileLibrary,
    Popover,
    ResponsivePopover,
    Title,
    ToggleButton,
    Element,
    Icon,
    IconPool,
    Device,
    Measurement,
    hasher,
    Config,
    Container,
    ushellLibrary,
    ushellResources,
    AccessibilityCustomData,
    StateManager,
    ShellModel
) => {
    "use strict";

    // shortcut for sap.ushell.AppTitleState
    const AppTitleState = ushellLibrary.AppTitleState;

    // shortcut for sap.ushell.AllMyAppsState
    const AllMyAppsState = ushellLibrary.AllMyAppsState;

    // shortcut for sap.m.PlacementType
    const PlacementType = mobileLibrary.PlacementType;

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;

    const ShellAppTitle = Button.extend("sap.ushell.ui.shell.ShellAppTitle", {
        metadata: {
            library: "sap.ushell",
            properties: {
                title: { type: "string", group: "Data", defaultValue: null },
                subTitle: { type: "string", group: "Data", defaultValue: null },
                showAppTitle: { type: "boolean", group: "Data", defaultValue: true },
                icon: { type: "sap.ui.core.URI", group: "Appearance", defaultValue: "sap-icon://folder" }
            },
            associations: {
                navigationMenu: {
                    type: "sap.ushell.ui.shell.ShellNavigationMenu"
                },
                allMyApps: {
                    type: "sap.ui.core.mvc.View"
                },
                newExperienceControl: {
                    type: "sap.ui.core.Control"
                }
            },
            events: {
                /**
                 * @deprecated since 1.68. The event is never fired.
                 */
                textChanged: { deprecated: true }
            }
        },

        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                // Calculate visibility of the ShellAppTitle control and the state of the ShallNavMenu/AllMyAps UIs
                const bShellAppTitleIsVisible = oControl._getControlVisibilityAndState();
                const sText = oControl.getText();

                oRm.openStart("div", oControl);
                oRm.class("sapUshellHeadTitle");
                if (bShellAppTitleIsVisible || Device.system.phone) {
                    oRm.class("sapUshellAppTitleClickable");
                }
                oRm.openEnd(); // div - tag

                // This invisible title element is purley for accessibility reasons.
                oRm.openStart("h1");
                oRm.class("sapUiPseudoInvisibleText");
                oRm.attr("aria-level", "1");
                oRm.openEnd(); // h1 - tag
                oRm.text(sText || "");
                oRm.close("h1");

                oRm.openStart("div", `${oControl.getId()}-button`);
                oRm.class("sapUshellAppTitle");
                if (bShellAppTitleIsVisible || Device.system.phone) {
                    oRm.attr("tabindex", "0");
                }

                if (oControl.getTooltip_AsString()) {
                    oRm.attr("title", oControl.getTooltip_AsString());
                }

                if (bShellAppTitleIsVisible) {
                    oRm.attr("role", "button");
                    oRm.attr("aria-haspopup", "dialog");
                    oRm.attr("aria-label", sText);
                }
                oRm.openEnd(); // div - tag

                if (oControl.getShowAppTitle()) { // do not render title text on phones
                    oRm.openStart("span");
                    oRm.class("sapUshellAppTitleText");
                    oRm.openEnd(); // span - tag
                    oRm.text(sText || "");
                    oRm.close("span");
                }

                if (bShellAppTitleIsVisible && sText) { // Chevron Icon
                    oRm.openStart("span");
                    oRm.class("sapUshellShellHeadAction");
                    oRm.openEnd(); // span - tag
                    oRm.renderControl(oControl.oIcon);
                    oRm.close("span");
                }
                oRm.close("div");

                oRm.close("div");
            }
        }
    });

    ShellAppTitle.prototype.init = function () {
        Button.prototype.init.apply(this, arguments);

        this.oIcon = IconPool.createControlByURI(IconPool.getIconURI("slim-arrow-down"));
        this.oIcon.addStyleClass("sapUshellAppTitleMenuIcon");
        this._screenWidth = null;

        // only for desktop
        if (Device.system.desktop) {
            // add acc support for open menu
            this.addEventDelegate({
                onkeydown: function (oEvent) {
                    // support for open the menu with Alt&Down arrow
                    if (oEvent.altKey && oEvent.keyCode === 40) {
                        this.onclick(oEvent);
                    }
                }.bind(this)
            });
        }
        if (Config.last("/core/shellBar/enabled")) {
            Device.resize.attachHandler(ShellAppTitle._showAppTitleText.bind(this));
        }
    };

    // For the ShellBar use case, shows the ShellAppTitle text when screen gets re-sized with more than 50px.
    // The hiding of the ShellAppTitle text is handled in the onContentItemVisibilityChange inside the ShellBar controller
    ShellAppTitle._showAppTitleText = function (oEvent) {
        const iCurrentWidth = oEvent.width;
        if (!this._screenWidth || Math.abs(this._screenWidth - iCurrentWidth) > 50) {
            this.setShowAppTitle(true);
            this._screenWidth = iCurrentWidth;
        }
    };

    /**
     * Creates a new experience wrapper for the ShellAppTitle.
     *
     * @returns {sap.m.VBox} The new experience wrapper.
     *
     * @since 1.136.0
     * @private
     */
    ShellAppTitle.prototype._getNewExperienceWrapper = function () {
        if (!this._oNewExperienceWrapper) {
            this._oNewExperienceWrapper = new VBox({ renderType: "Bare" });
            this._oNewExperienceWrapper.addStyleClass("sapUiSmallMarginBeginEnd");
            this.addDependent(this._oNewExperienceWrapper);
        }
        return this._oNewExperienceWrapper;
    };

    // For the ShellHeader use case, make the visibility of the app title dependent on the Device API to ensure an unchanged behavior.
    ShellAppTitle.prototype.onBeforeRendering = function () {
        if (!Config.last("/core/shellBar/enabled")) {
            this.setShowAppTitle(Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name !== "Phone");
        }
    };

    ShellAppTitle.prototype.getFocusDomRef = function () {
        return this.getDomRef("button");
    };

    /**
     * Retrieves the ShellAppTitleState configuration value.
     *
     * @returns {sap.ushell.AppTitleState} The current value as a member of sap.ushell.AppTitleState.
     * @static
     * @private
     */
    ShellAppTitle._getCurrentState = function () {
        return ShellModel.getConfigModel().getProperty("/shellAppTitleState");
    };

    /**
     * Sets the ShellAppTitleState configuration value.
     *
     * @param {sap.ushell.AppTitleState} sNewState The new value as a member of sap.ushell.AppTitleState.
     * @static
     * @private
     */
    ShellAppTitle._setCurrentState = function (sNewState) {
        ShellModel.getConfigModel().setProperty("/shellAppTitleState", sNewState);
    };

    /*
     * ShellAppTitle click handler:
     * 1. Calculating UI visibility and state
     * 2. Creating content popover
     */
    ShellAppTitle.prototype.onclick = function (oEvent) {
        oEvent.preventDefault();
        this.firePress();

        // it may be that the Title was clicked on (and not the icon which opens the menu)
        // we need to make sure the icon is displayed (e.g. rendered) - in case not we do not
        // open the menu
        if (!this._getControlVisibilityAndState()) {
            if (Device.system.phone) {
                hasher.setHash(Config.last("/core/shellHeader/rootIntent"));
            }
            return;
        }

        // The current state must be read from the configuration as it might not be saved to the model in some cases.
        // See BCP: 2070002470
        if (ShellAppTitle._getCurrentState() === AppTitleState.AllMyAppsOnly) {
            Measurement.start("FLP:ShellAppTitle.onClick", "Click ShellAppTitle in HOME state, Launching AllMyApps", "FLP");
            this._openCloseAllMyAppsPopover();
            return;
        }

        this._openCloseNavMenuPopover();
    };

    ShellAppTitle.prototype._openCloseAllMyAppsPopover = function () {
        // create a popover for the allMyApps menu
        if (!this.oAllMyAppsPopover) {
            this.oAllMyAppsPopover = this._createAllMyAppsPopover();
        }

        // might not be available, as AllMyApps might not be loaded yet
        if (this.oAllMyAppsPopover) {
            if (this.oAllMyAppsPopover.isOpen()) {
                this.oAllMyAppsPopover.close();
            } else {
                this.oAllMyAppsPopover.openBy(this);
            }
        }
    };

    ShellAppTitle.prototype._openCloseNavMenuPopover = function () {
        // create a popover for the navMenu
        if (!this.oNavMenuPopover) {
            this.oNavMenuPopover = this._createNavMenuPopover();
        }

        ShellAppTitle._setCurrentState(AppTitleState.ShellNavMenu);

        if (this.oNavMenuPopover.isOpen()) {
            this.oNavMenuPopover.close();
        } else {
            this.oNavMenuPopover.openBy(this);
        }

        if (this.oNavMenuPopover.getFooter()) {
            const bDefaultShellMode = StateManager.getShellMode() === ShellMode.Default;
            const bLegacyHomeState = StateManager.isLegacyHome();
            // Popover footer should be visible only on SHELL_NAV_MENU state, while the shell is either in home or in app state
            this.oNavMenuPopover.getFooter().setVisible(bDefaultShellMode || bLegacyHomeState);
        }
    };

    /**
     * Calculates the visibility of the shellAppTitle button and UI
     * (i.e. whether the the header title should be clickable or not)
     * and the state of the shellAppTitle UI (states defined by AppTitleState)
     *
     * @returns {boolean} true in case the header title should be clickable and false if not
     */
    ShellAppTitle.prototype._getControlVisibilityAndState = function () {
        Measurement.start(
            "FLP:ShellAppTitle.getControlVisibilityAndState",
            "Check AllMyApps and NavShellMenu visibility",
            "FLP"
        );
        const bDefaultShellMode = StateManager.getShellMode() === ShellMode.Default;
        const bLegacyHomeState = StateManager.isLegacyHome();
        const bNavMenuEnabled = this._isNavMenuEnabled();
        let bVisible = bNavMenuEnabled;

        if (bDefaultShellMode || bLegacyHomeState) {
            const bAllMyAppsEnabled = Config.last("/core/services/allMyApps/enabled");

            // ShellAppTitle is visible if at least one of the options AllMyApps & NavMenu is enabled
            bVisible = bAllMyAppsEnabled || bNavMenuEnabled;

            // Calculate the state
            // Option 1: both AllMyApps && NavMenu are enabled
            if (bAllMyAppsEnabled && bNavMenuEnabled) {
                ShellAppTitle._setCurrentState(AppTitleState.ShellNavMenu);

                // Option 2: Only NavMenu is enabled
            } else if (!bAllMyAppsEnabled && bNavMenuEnabled) {
                ShellAppTitle._setCurrentState(AppTitleState.ShellNavMenuOnly);

                // Option 3: Only AllMyApps is enabled
            } else if (bAllMyAppsEnabled && !bNavMenuEnabled) {
                ShellAppTitle._setCurrentState(AppTitleState.AllMyAppsOnly);
            }
        } else {
            ShellAppTitle._setCurrentState(AppTitleState.ShellNavMenuOnly);
        }
        Measurement.end("FLP:ShellAppTitle.getControlVisibilityAndState");
        return bVisible;
    };

    //******************************************************************************************************
    //* **************************************** Create Popover UI ******************************************

    /*
     * Create and return the popover object that will contain the AllMyApps UI
     */
    ShellAppTitle.prototype._createAllMyAppsPopover = function () {
        const oAllMyApps = Element.getElementById(this.getAllMyApps());

        // do not open the all my apps popover if the data is not available yet
        if (!oAllMyApps) {
            return null;
        }

        const oAllMyAppsPopover = new ResponsivePopover("sapUshellAllMyAppsPopover", {
            placement: PlacementType.Bottom,
            title: "",
            showArrow: true,
            customHeader: this._getPopoverHeader(),
            verticalScrolling: false,
            showHeader: {
                path: "configModel>/shellAppTitleState",
                formatter: function (oCurrentState) {
                    return oCurrentState !== AppTitleState.ShellNavMenu;
                }
            },
            content: [oAllMyApps],
            contentHeight: "28rem",
            contentWidth: "56rem"
        }).addStyleClass("sapContrastPlus");
        oAllMyAppsPopover.setModel(ShellModel.getConfigModel(), "configModel");

        oAllMyAppsPopover.attachBeforeOpen(() => {
            Container.getServiceAsync("AppLifeCycle").then((AppLifeCycleService) => {
                if (AppLifeCycleService.getCurrentApplication()?.homePage) {
                    const oNewExperienceControl = Element.getElementById(this.getNewExperienceControl());
                    if (oNewExperienceControl) {
                        const oNewExperienceWrapper = this._getNewExperienceWrapper();
                        oNewExperienceWrapper.addItem(oNewExperienceControl);
                        oAllMyAppsPopover.insertContent(oNewExperienceWrapper, 0);
                    } else if (this._oNewExperienceWrapper) {
                        // don't use the getter here to avoid control creation
                        this.addDependent(this._oNewExperienceWrapper);
                    }
                }
            });
        });

        oAllMyAppsPopover.attachAfterOpen(() => {
            const oHeader = oAllMyAppsPopover.getCustomHeader();
            const oBackButton = oHeader.getContentLeft()[0];
            const oToggleButton = oHeader.getContentLeft()[1];

            if (oToggleButton.getVisible()) {
                oToggleButton.firePress();
                oToggleButton.setPressed(true);
            }
            oBackButton.focus();
        });

        oAllMyAppsPopover.attachAfterClose(this._afterCloseAllMyAppsPopover.bind(this));

        return oAllMyAppsPopover;
    };

    /**
     * Called after closing the All My Apps popover
     */
    ShellAppTitle.prototype._afterCloseAllMyAppsPopover = function () {
        if (this._bOpenNavigationMenu === true) {
            // make sure the navigation menu is opened after the all my apps menu
            // is finally closed so that they don't interfere with each other
            this._bOpenNavigationMenu = false;
            this.oNavMenuPopover.openBy(this);
        } else if (!Device.system.phone) {
            this.focus();
        }
    };

    /**
     * Create and return the popover object that will contain the ShellNavMenu UI
     *
     * @returns {sap.m.Popover} The popover object
     */
    ShellAppTitle.prototype._createNavMenuPopover = function () {
        const oNavMenu = Element.getElementById(this.getNavigationMenu());

        this.oTitle = new Title("navMenuInnerTitle", {
            wrapping: true,
            text: "{shellModel>/application/title}"
        });
        this.oSecondTitle = new Label("navMenuInnerSecondTitle", {
            text: "{shellModel>/header/secondTitle}",
            visible: "{= !!${shellModel>/header/secondTitle}}",
            wrapping: true
        });
        this.oIconControl = new Icon({
            src: "{shellModel>/application/icon}"
        });

        const oTitleBox = new VBox({
            items: [this.oTitle, this.oSecondTitle]
        }).addStyleClass("sapUshellNavTitleBox");
        const oIconBox = new VBox({
            items: [this.oIconControl]
        }).addStyleClass("sapUiContentPadding");
        const oTitleBar = new HBox("navMenuTitleBar", {
            width: "100%",
            items: [oIconBox, oTitleBox]
        });

        const oNavMenuPopover = new Popover("sapUshellAppTitlePopover", {
            placement: PlacementType.Bottom,
            showArrow: true,
            showHeader: false,
            contentWidth: "20rem",
            horizontalScrolling: false,
            content: [
                oTitleBar,
                oNavMenu
            ]
        }).addStyleClass("sapContrastPlus");

        if (Config.last("/core/services/allMyApps/enabled")) {
            oNavMenuPopover.setFooter(this._getPopoverFooterContent());
        }

        oNavMenuPopover.addStyleClass("sapUshellAppTitleNavigationMenuPopover");
        oNavMenuPopover.setModel(ShellModel.getModel(), "shellModel");
        ShellModel.getConfigModel().setProperty("/allMyAppsMasterLevel", AllMyAppsState.FirstLevel);

        // before popover open - call to before menu open
        oNavMenuPopover.attachBeforeOpen(() => {
            oNavMenu._beforeOpen();
            const oNewExperienceControl = Element.getElementById(this.getNewExperienceControl());
            if (oNewExperienceControl) {
                const oNewExperienceWrapper = this._getNewExperienceWrapper();
                oNewExperienceWrapper.addItem(oNewExperienceControl);
                oNavMenuPopover.insertContent(oNewExperienceWrapper, 1);
            } else if (this._oNewExperienceWrapper) {
                // don't use the getter here to avoid control creation
                this.addDependent(this._oNewExperienceWrapper);
            }
        });

        // after popover open - fix scrolling for IOS and call to menu after open
        oNavMenuPopover.attachAfterOpen(() => {
            // fix for scrolling (By @Alexander Pashkov) on sap.m.Popover being override
            // in Mobile by UI5
            oNavMenu.$().on("touchmove.scrollFix", (oEvent) => {
                oEvent.stopPropagation();
            });

            // calls to afterOpen on the navigation menu itself in case some things needed to be made
            oNavMenu._afterOpen();
        });

        oNavMenuPopover.attachAfterClose(this._afterCloseNavigationMenuPopover.bind(this));

        return oNavMenuPopover;
    };

    /**
     * Called after closing the Navigation Menu Popover
     */
    ShellAppTitle.prototype._afterCloseNavigationMenuPopover = function () {
        if (this._bOpenAllMyApps) {
            // make sure the all my apps menu is opened after the navigation menu
            // is finally closed so that they don't interfere with each other
            this._bOpenAllMyApps = false;
            this._openCloseAllMyAppsPopover();
        } else if (!Device.system.phone) {
            this.focus();
        }
    };

    ShellAppTitle.prototype._setAllMyAppsTitle = function (text) {
        const sCurrentState = ShellAppTitle._getCurrentState();
        const sSecondTitle = ShellModel.getModel().getProperty("/header/secondTitle");
        if (sSecondTitle && (sCurrentState === "AllMyAppsOnly" || sCurrentState === "AllMyApps")) {
            text = `${text} - ${sSecondTitle}`;
        }
        Title.prototype.setText.apply(this, [text]);
    };

    /*
     * Create and return the popover header, containing back button and toggle button
     */
    ShellAppTitle.prototype._getPopoverHeader = function () {
        const oAllMyAppsTitle = new Title({
            text: ushellResources.i18n.getText("allMyApps_headerTitle"),
            level: "H1"
        });

        // The title is set in three different places (ShellAppTitle, AllMyApps.controller, ShellModel).
        // To ensure correct title set if a subtitle is given, we override the setter to ensure the logic is only done once.
        oAllMyAppsTitle.setText = this._setAllMyAppsTitle.bind(oAllMyAppsTitle);

        const oPopoverHeader = new Bar("sapUshellShellAppPopoverHeader", {
            contentLeft: [
                this._createPopoverBackButton(),
                this._createPopoverToggleButton()
            ],
            contentMiddle: [oAllMyAppsTitle]
        });
        return oPopoverHeader;
    };

    ShellAppTitle.prototype.onAfterRendering = function () {
        this._adjustAppTitleTooltip();
    };

    /**
     * Sets the correct tooltip for the ShellAppTitle.
     * If the ShellAppTitle has a navigation menu it should be: "Navigation menu".
     * Otherwise there should only be a tooltip if the Title is truncated.
     */
    ShellAppTitle.prototype._adjustAppTitleTooltip = function () {
        const oDivElement = this.getDomRef("button");
        const oSpanElement = oDivElement && oDivElement.firstChild;
        if (oSpanElement) {
            let sNewTooltip;

            const bAllMyAppsEnabled = Config.last("/core/services/allMyApps/enabled");
            const bDefaultShellMode = StateManager.getShellMode() === ShellMode.Default;
            const bLegacyHomeState = StateManager.isLegacyHome();

            const bAllMyAppsMenu = (bDefaultShellMode || bLegacyHomeState) && bAllMyAppsEnabled;

            const oNavMenu = Element.getElementById(this.getNavigationMenu());
            const bNavMenu = oNavMenu && oNavMenu.getItems() && oNavMenu.getItems().length > 0;
            if (bNavMenu) {
                sNewTooltip = ushellResources.i18n.getText("shellNavMenu_openMenuTooltip_navigationMenu");
            } else if (bAllMyAppsMenu) {
                sNewTooltip = ushellResources.i18n.getText("shellNavMenu_openMenuTooltip_allMyApps");
            } else {
                const bTruncated = oSpanElement.offsetWidth < oSpanElement.scrollWidth;
                sNewTooltip = bTruncated ? this.getText() : null;
            }

            // This will trigger a rerender
            if (this.getTooltip() !== sNewTooltip) {
                this.setTooltip(sNewTooltip);
            }
        }
    };

    /*
     * Popover Back Button functionality:
     * 1. In case the Master area is in first level - switch to ShellNavMenu
     * 2. In case the Master area is in second level - return the Master area to the first level (call switchToInitialState)
     */
    ShellAppTitle.prototype._createPopoverBackButton = function () {
        const oBackButton = new Button("sapUshellAppTitleBackButton", {
            icon: IconPool.getIconURI("nav-back"),
            press: [this._popoverBackButtonPressHandler, this],
            tooltip: ushellResources.i18n.getText("backBtn_tooltip"),
            visible: this.getAllMyAppsController().getBackButtonVisible()
        });
        oBackButton.addStyleClass("sapUshellCatalogNewGroupBackButton");

        return oBackButton;
    };

    ShellAppTitle.prototype._popoverBackButtonPressHandler = function () {
        const oAllMyAppsController = this.getAllMyAppsController();
        const oAllMyAppsState = oAllMyAppsController.getCurrentState();

        // In case of clicking "back" when in FIRST_LEVEL - switch to ShellNavMenu
        if ((oAllMyAppsState === AllMyAppsState.FirstLevel) ||
            (oAllMyAppsState === AllMyAppsState.FirstLevelSpread)) {
            if (ShellAppTitle._getCurrentState() !== AppTitleState.AllMyAppsOnly) {
                ShellAppTitle._setCurrentState(AppTitleState.ShellNavMenu);

                // Open Nav Menu popover and close allMyAppsPopover
                this.oAllMyAppsPopover.close();
                this._bOpenNavigationMenu = true;
            }
        } else if (oAllMyAppsState === AllMyAppsState.SecondLevel) {
            oAllMyAppsController.switchToInitialState();
        } else {
            oAllMyAppsController.handleSwitchToMasterAreaOnPhone();
        }
        oAllMyAppsController.updateHeaderButtonsState();
    };

    /*
     * This button should be visible only on devices, and is used for toggling between the master and the details areas
     */
    ShellAppTitle.prototype._createPopoverToggleButton = function () {
        const oAllMyAppsController = this.getAllMyAppsController();

        const oToggleButton = new ToggleButton("sapUshellAllMyAppsToggleListButton", {
            icon: IconPool.getIconURI("sap-icon://menu2"),
            press: function (eEvent) {
                oAllMyAppsController.switchToInitialState();
                this.setTooltip(eEvent.getParameter("pressed") ?
                    ushellResources.i18n.getText("ToggleButtonHide") :
                    ushellResources.i18n.getText("ToggleButtonShow"));
            },
            tooltip: ushellResources.i18n.getText("ToggleButtonShow"),
            visible: oAllMyAppsController.getToggleListButtonVisible()
        });

        Device.media.attachHandler(() => {
            oToggleButton.setVisible(oAllMyAppsController.getToggleListButtonVisible());
        }, this, Device.media.RANGESETS.SAP_STANDARD);

        oToggleButton.addStyleClass("sapUshellAllMyAppsToggleListButton");

        return oToggleButton;
    };

    /*
     * Create and return the popover footer, containing a button for switching from ShellNavMenu to AllMyApps
     */
    ShellAppTitle.prototype._getPopoverFooterContent = function () {
        const oAllMyAppsButton = new Button("allMyAppsButton", {
            text: ushellResources.i18n.getText("allMyApps_launchingButtonTitle"),
            press: this._allMyAppsButtonPressHandler.bind(this),
            visible: {
                path: "shellConfig>/shellAppTitleState",
                formatter: function (oCurrentState) {
                    return oCurrentState === AppTitleState.ShellNavMenu;
                }
            }
        });

        const oPopoverFooterContent = new Bar("shellpopoverFooter", {
            contentMiddle: [oAllMyAppsButton]
        });
        this.addCustomData(oAllMyAppsButton, "role", "button");
        this.addCustomData(oAllMyAppsButton, "aria-label", ushellResources.i18n.getText("allMyApps_launchingButtonTitle"));
        return oPopoverFooterContent;
    };

    /**
     * Opens the All My Apps popover
     */
    ShellAppTitle.prototype._allMyAppsButtonPressHandler = function () {
        // might not be available, as AllMyApps might not be loaded yet
        if (Element.getElementById(this.getAllMyApps())) {
            Measurement.start(
                "FLP:ShellNavMenu.footerClick",
                "Click the footer of ShellNavMenu, Launching AllMyApps",
                "FLP"
            );

            ShellAppTitle._setCurrentState(AppTitleState.AllMyApps);
            this.oNavMenuPopover.close();
            this._bOpenAllMyApps = true;
        }
    };

    /** ************************************* Create Popover UI - End ***************************************/
    /*******************************************************************************************************/

    ShellAppTitle.prototype._isNavMenuEnabled = function () {
        const oNavMenu = Element.getElementById(this.getNavigationMenu());
        return oNavMenu ? oNavMenu.getItems() && oNavMenu.getItems().length > 0 : false;
    };

    ShellAppTitle.prototype.addCustomData = function (oItem, sKey, sValue) {
        oItem.addCustomData(new AccessibilityCustomData({
            key: sKey,
            value: sValue,
            writeToDom: true
        }));
    };

    ShellAppTitle.prototype.close = function () {
        if (this.oNavMenuPopover && this.oNavMenuPopover.isOpen()) {
            this.oNavMenuPopover.close();
        }

        if (this.oAllMyAppsPopover && this.oAllMyAppsPopover.isOpen()) {
            this.oAllMyAppsPopover.close();
        }
    };

    ShellAppTitle.prototype.setTooltip = function (sTooltip) {
        this.setAggregation("tooltip", sTooltip);
        this.oIcon.setTooltip(sTooltip);
    };

    ShellAppTitle.prototype.getAllMyAppsController = function () {
        const oAllMyApps = Element.getElementById(this.getAllMyApps());
        return oAllMyApps.getController();
    };

    ShellAppTitle.prototype.onkeyup = function (oEvent) {
        Button.prototype.onkeyup.apply(this, arguments);
        if (oEvent.keyCode === 32) { // Spacebar
            this.onclick(oEvent);
        }
    };

    ShellAppTitle.prototype.onsapenter = ShellAppTitle.prototype.onclick;

    ShellAppTitle.prototype.exit = function () {
        const oNavMenu = Element.getElementById(this.getNavigationMenu());
        const oAllMyApps = Element.getElementById(this.getAllMyApps());

        if (oNavMenu) {
            oNavMenu.destroy();
        }

        if (oAllMyApps) {
            oAllMyApps.destroy();
        }

        if (this.oAllMyAppsPopover) {
            this.oAllMyAppsPopover.destroy();
        }

        if (this.oNavMenuPopover) {
            this.oNavMenuPopover.destroy();
        }

        if (this.oIcon) {
            this.oIcon.destroy();
        }
    };

    return ShellAppTitle;
});
