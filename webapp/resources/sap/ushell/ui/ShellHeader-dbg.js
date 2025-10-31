// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/Control",
    "sap/ui/core/Element",
    "sap/ui/Device",
    "sap/ui/dom/units/Rem",
    "sap/ui/thirdparty/hasher",
    "sap/base/Log",
    "sap/ushell/api/NewExperience",
    "sap/ushell/EventHub",
    "sap/ushell/library", // css style dependency
    "sap/ushell/ui/ShellHeaderRenderer",
    "sap/ushell/utils",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/state/StateManager",
    "sap/ushell/Container",
    "sap/ui/events/KeyCodes",
    "sap/ushell/renderer/ShellLayout"
], (
    Localization,
    Control,
    Element,
    Device,
    Rem,
    hasher,
    Log,
    NewExperience,
    EventHub,
    ushellLibrary,
    ShellHeaderRenderer,
    utils,
    WindowUtils,
    StateManager,
    Container,
    KeyCodes,
    ShellLayout
) => {
    "use strict";

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;

    const sSearchOverlayCSS = "sapUshellShellShowSearchOverlay";

    let _iSearchWidth = 0; // width as requested by the SearchShellHelper
    let _sCurrentTheme;

    const ShellHeader = Control.extend("sap.ushell.ui.ShellHeader", /** @lends sap.ushell.ui.ShellHeader.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                /*
                 * Company logo in the header.
                 * If not set, the "sapUiGlobalLogo" of the current theme is used.
                 * If the "sapUiGlobalLogo" is "none", SAP logo is displayed.
                 */
                logo: { type: "sap.ui.core.URI", defaultValue: "" },
                logoAltText: { type: "string", defaultValue: "" },
                homeUri: { type: "sap.ui.core.URI", defaultValue: "#" }, // navigation URI when pressing on the header Logo
                searchState: { type: "string", defaultValue: "COL" },
                ariaLabel: { type: "string" },
                centralAreaElement: { type: "string", defaultValue: null },
                showNewExperienceSwitch: { type: "boolean", defaultValue: false },
                title: { type: "string", defaultValue: "" }
            },
            aggregations: {
                headItems: { type: "sap.ushell.ui.shell.ShellHeadItem", multiple: true },
                headEndItems: { type: "sap.ui.core.Control", multiple: true },
                search: { type: "sap.ui.core.Control", multiple: false },
                appTitle: { type: "sap.ushell.ui.shell.ShellAppTitle", multiple: false }
            },
            associations: {},
            events: {
                searchSizeChanged: {}
            }
        },

        renderer: ShellHeaderRenderer
    });

    /**
     * Setter for the property "homeUri"
     *
     * @param {string} sHomeUri The new value for homeUri
     * @returns {sap.ushell.ui.ShellHeader} this to allow method chaining.
     * @private
     */
    ShellHeader.prototype.setHomeUri = function (sHomeUri) {
        if (WindowUtils.hasInvalidProtocol(sHomeUri)) {
            Log.fatal("Tried to set a URL with an invalid protocol as the home uri. Setting to an empty string instead.", null, "sap/ushell/ui/ShellHeader");
            sHomeUri = "";
        }
        this._bHomeIsRoot = utils.isRootIntent(sHomeUri);
        return this.setProperty("homeUri", sHomeUri);
    };

    /**
     * The search states that can be passed as a parameter to the setSearchState.
     * Values:
     * COL - search field is hidden
     * EXP - search field is visible, other shell header elements can be hidden
     * EXP_S - search field is visible, other elements in the header remain visible
     */
    ShellHeader.prototype.SearchState = {
        COL: "COL",
        EXP: "EXP",
        EXP_S: "EXP_S"
    };

    /**
     * The range set for FLP including extra large desktops
     * extending the range set SAP_STANDARD_EXTENDED by the range ExtraLargeDesktop
     */
    ShellHeader.prototype.FLPRangeSet = {
        name: "Ushell",
        rangeBorders: [600, 1024, 1440, 1920],
        rangeNames: ["Phone", "Tablet", "Desktop", "LargeDesktop", "ExtraLargeDesktop"]
    };

    /**
     * Initializes the ShellHeader control
     * @private
     */
    ShellHeader.prototype.init = function () {
        Device.media.initRangeSet(
            this.FLPRangeSet.name,
            this.FLPRangeSet.rangeBorders,
            "px",
            this.FLPRangeSet.rangeNames
        );

        // handle initial state of the side content
        const bInitialValue = ShellLayout.hasAdjacentSideContentBeforeMain();
        this._applySideContent(bInitialValue);

        // attach event handler for side content changes
        ShellLayout.attachAdjacentSideContentBeforeMainChanged(this._handleSideContent, this);
        Device.media.attachHandler(this.invalidate, this, this.FLPRangeSet.name);
        Device.resize.attachHandler(this.refreshLayout, this);

        /*
         * Calling shell navigation directly here would cause
         * sap.ushell.Container to load and instantiate ShellNavigationInternal early.
         * This causes Shell.controller#getServiceAsync("ShellNavigationInternal") to
         * load the service faster, therefore soon executing ShellNavigationInternal
         * initialization code. In the past we implemented an optimization that
         * prioritized rendering and delayed all processing on the critical
         * path.  Navigation included. To preserve that optimization we let
         * shell controller initialize ShellNavigationInternal before using it here.
         */
        EventHub.once("ShellNavigationInitialized").do(() => {
            Container.getServiceAsync("ShellNavigationInternal").then((oShellNavigationInternal) => {
                this._rerenderLogoNavigationFilterBound = this._rerenderLogoNavigationFilter.bind(this, oShellNavigationInternal);

                oShellNavigationInternal.registerNavigationFilter(this._rerenderLogoNavigationFilterBound);
                this._rerenderLogoNavigationFilterBound.detach = function () {
                    oShellNavigationInternal.unregisterNavigationFilter(this._rerenderLogoNavigationFilterBound);
                };
            });
        });

        this._oLastFocusedHeaderElement = null;
        this._oEventDelegate = {
            onfocusin: this._handleOnFocusIn,
            onkeydown: this._handleOnKeyDown,
            onBeforeFastNavigationFocus: this._handleOnBeforeFastNavigationFocus
        };
        this.addEventDelegate(this._oEventDelegate, this);
    };

    /**
     * This hook is called before the shell header control is destroyed
     * @private
     */
    ShellHeader.prototype.exit = function () {
        Device.media.detachHandler(this.invalidate, this, this.FLPRangeSet.name);
        Device.resize.detachHandler(this.refreshLayout, this);

        if (this._rerenderLogoNavigationFilterfnRerenderLogoNavigationFilter) {
            this._rerenderLogoNavigationFilterfnRerenderLogoNavigationFilter.detach();
        }

        this.removeEventDelegate(this._oEventDelegate);
        delete this._oEventDelegate;
        ShellLayout.detachAdjacentSideContentBeforeMainChanged(this._handleSideContent, this);
    };

    ShellHeader.prototype._handleSideContent = function (oEvent) {
        const oParameters = oEvent.getParameters();
        const bHasAdjacentContentBefore = oParameters.hasAdjacentContentBefore;
        this._applySideContent(bHasAdjacentContentBefore);
    };

    ShellHeader.prototype._applySideContent = function (bHasAdjacentContentBefore) {
        this.toggleStyleClass("sapUshellFixedPadding", bHasAdjacentContentBefore);
    };

    /**
     * Set focus to the shell Header
     * @param {boolean} backwardsNavigation whether the focus should be on the first or last element of the shell header
     * @private
     */
    ShellHeader.prototype.setFocusOnShellHeader = function (backwardsNavigation) {
        if (backwardsNavigation) {
            const aHeaderEndItems = this.getHeadEndItems();
            if (aHeaderEndItems.length > 0) {
                aHeaderEndItems[aHeaderEndItems.length - 1].focus();
            } else {
                this.getAppTitle().focus();
            }
        } else {
            const aHeaderItems = this.getHeadItems();

            if (aHeaderItems.length > 0) {
                aHeaderItems[0].focus();
            } else {
                this.getAppTitle().focus();
            }
        }
    };

    /**
     * Sets focus on search icon after it collapsed
     * @private
     */
    ShellHeader.prototype.setFocusOnSearchAfterRender = function () {
        const sSearchState = this.getSearchState();
        const sSearchBar = Element.getElementById("searchFieldInShell-input");

        if (sSearchState === "COL" && sSearchBar) {
            const oSearchIcon = Element.getElementById("sf");
            if (oSearchIcon) {
                oSearchIcon.focus();
            }
        }
    };

    /**
     * Handle space key when focus is in the ShellHeader.
     *
     * @param {object} oEvent - the keyboard event
     * @private
     */
    ShellHeader.prototype.onsapspace = function (oEvent) {
        // Navigate home when a user presses the space keyboard button in the logo
        if (oEvent.target === this.getDomRef("logo")) {
            this._setLocationHref(oEvent.target.href);
        }
    };

    ShellHeader.prototype._setLocationHref = function (sHref) {
        if (WindowUtils.hasInvalidProtocol(sHref)) {
            Log.fatal("Tried to navigate to URL with an invalid protocol. Preventing navigation.", null, "sap/ushell/ui/ShellHeader");
            return;
        }
        window.location.href = sHref;
    };

    /**
     * Handle logic after rendering of the ShellHeader
     */
    ShellHeader.prototype.onAfterRendering = function () {
        // ShellHeader may render earlier than the initial theme is loaded.
        // Check this situation and hide the unstyled content.
        // Ideally, getComputedStyle should be used, but getBoundingClientRect is faster
        const oHeaderElement = this.getDomRef();
        if (!_sCurrentTheme && document.body.getBoundingClientRect().height === 0) {
            // The header has position:static -> the library style is not applied yet -> hide it
            oHeaderElement.style.visibility = "hidden";
            oHeaderElement.style.height = "2.75rem";
            return;
        }

        this.refreshLayout();

        setTimeout(() => {
            if (!document.activeElement || document.activeElement === document.body) {
                // Sets focus on search if no element is focused or if there is no active element
                this.setFocusOnSearchAfterRender();
            }
        }, 1);
    };

    /**
     * Handle keyboard navigation in the ShellHeader on spaces & pages launchpad. Callback for the keydown event.
     * @param {Event} event The keyboard event
     * @private
     * @since 1.133.0
     */
    ShellHeader.prototype._handleOnKeyDown = function (event) {
        if (event.keyCode === KeyCodes.ARROW_RIGHT || event.keyCode === KeyCodes.ARROW_LEFT) {
            this._handleArrowNavigation(event);
        }
        if (event.keyCode === KeyCodes.END || event.keyCode === KeyCodes.HOME) {
            this._handleHomeEndNavigation(event);
        }
        return;
    };

    /**
     * Handler for the Arrow key navigation in the ShellHeader
     * @param {Event} event The keyboard event
     * @since 1.133.0
     */
    ShellHeader.prototype._handleArrowNavigation = function (event) {
        const oShellHeader = this.getDomRef();
        const oFocusedItem = document.activeElement;

        if (!oFocusedItem
            || !oShellHeader.contains(oFocusedItem)
            || oFocusedItem.tagName === "INPUT"
            || oFocusedItem.tagName === "TEXTAREA") {
            return;
        }

        const aItems = this._getFocusableHeaderItems();
        let oNextItem;

        let iCurrentIndex = aItems.indexOf(oFocusedItem);
        if (iCurrentIndex < 0 && this._oLastFocusedHeaderElement) {
            // the currently focused element is not in the list of focusable items => use the last focused element
            iCurrentIndex = aItems.indexOf(this._oLastFocusedHeaderElement);
        }

        if (iCurrentIndex >= 0) {
            const iNextIndex = event.keyCode === KeyCodes.ARROW_RIGHT ? iCurrentIndex + 1 : iCurrentIndex - 1;
            oNextItem = aItems[iNextIndex];
        }

        if (!oNextItem) {
            aItems[iCurrentIndex].focus();
            return;
        }

        oNextItem.focus();
    };

    /**
     * Handler for Home and End Key navigation
     * @param {object} oEvent the keyboard event
     */
    ShellHeader.prototype._handleHomeEndNavigation = function (oEvent) {
        const oShellHeader = this.getDomRef();
        const oFocusedItem = document.activeElement;

        if (!oFocusedItem || !oShellHeader.contains(oFocusedItem) || oFocusedItem.id === "searchFieldInShell-input-inner") {
            return;
        }

        const aItems = this._getFocusableHeaderItems();
        let oNextItem;

        if (oEvent.keyCode === KeyCodes.END) {
            oNextItem = aItems.at(-1);
        } else if (oEvent.keyCode === KeyCodes.HOME) {
            oNextItem = aItems.at(0);
        } else {
            return;
        }

        oNextItem.focus();
    };

    /**
     * Handler for the "focus in" event in the ShellHeader.
     * Stores the last focused element.
     *
     * @since 1.133.0
     * @private
     */
    ShellHeader.prototype._handleOnFocusIn = function () {
        const oFocusedItem = document.activeElement;
        this._oLastFocusedHeaderElement = oFocusedItem;
    };

    /**
     * Get all focusable items in the ShellHeader
     * @returns {Node[]} Array of focusable items in the ShellHeader
     * @private
     * @since 1.133.0
    */
    ShellHeader.prototype._getFocusableHeaderItems = function () {
        const oShellHeaderDomRef = this.getDomRef();

        const aItems = Array.from(oShellHeaderDomRef.querySelectorAll("*:is(input, textarea, select, button, a, [tabindex])"))
            .filter((oNode) => !oNode.disabled
                && !oNode.hidden
                && (oNode.checkVisibility?.() ?? true) // selenium tests are running on a very old version of chrome that does not support checkVisibility
                && oNode.getAttribute("tabindex") !== "-1"
            );

        if (Localization.getRTL()) {
            return aItems.reverse();
        }
        return aItems;
    };

    /**
     * Handler function for updating and reading the last visited header item for F6 navigation before UI5 fast nav
     * @param {Event} event The keyboard event
     * @param {Node} oFocusedElement The currently focused element
     * @private
     * @since 1.133.0
     */
    ShellHeader.prototype._handleOnBeforeFastNavigationFocus = function (event) {
        event.preventDefault();

        const aFocusableItems = this._getFocusableHeaderItems();

        if (this._oLastFocusedHeaderElement && aFocusableItems.includes(this._oLastFocusedHeaderElement)) {
            this._oLastFocusedHeaderElement.focus();
            return;
        }

        // invalid last focused element or focus was not yet in shell header
        this._oLastFocusedHeaderElement = null;

        if (document.getElementById("shell-header-logo")) {
            document.getElementById("shell-header-logo").focus();
        } else {
            this.setFocusOnShellHeader();
        }
    };

    /**
     * Triggered by UI5.
     *
     * @param {object} oEvent Given
     * @private
     */
    ShellHeader.prototype.onThemeChanged = function (oEvent) {
        _sCurrentTheme = oEvent.theme;
    };

    /**
     * RTA uses getLogo() to find the current logo URL.
     *
     * @returns {string|undefined} Logo URL
     * @private
     * @ui5-restricted sap.ui.rta
     */
    ShellHeader.prototype.getLogo = function () {
        return this.getProperty("logo");
    };

    /**
     * RTA uses getShowLogo() to check whether it should display a logo.
     *
     * @returns {boolean} Whether a logo is displayed
     * @private
     * @ui5-restricted sap.ui.rta
     */
    ShellHeader.prototype.getShowLogo = function () {
        return !!this.getProperty("logo");
    };

    /**
     * Recalculates the sizes and what should be shown on the shellHeader
     * @protected
     */
    ShellHeader.prototype.refreshLayout = function () {
        if (!this.getDomRef()) {
            return;
        }

        // Search field related logic:
        if (this.getSearchVisible()) {
            const oSearch = this.getDomRef("hdr-search");
            oSearch.style.display = "none";
            this._hideElementsForSearch();
            oSearch.style.display = "";
            oSearch.style["max-width"] = `${_iSearchWidth}rem`;
            this.fireSearchSizeChanged({
                remSize: Rem.fromPx(oSearch.getBoundingClientRect().width),
                isFullWidth: this.isPhoneState() || this.getDomRef("hdr-end").style.display === "none"
            });
        }
    };

    /**
     * removes a headItem from the aggregation headItems
     * @param {string} vItem The headItem to remove or its index or id
     */
    ShellHeader.prototype.removeHeadItem = function (vItem) {
        if (typeof vItem === "number") {
            vItem = this.getHeadItems()[vItem];
        }
        this.removeAggregation("headItems", vItem);
    };

    /**
     * Whether the device is in the expanded state
     * @returns {boolean} true if the device is in the expanded state
     */
    ShellHeader.prototype.isExtraLargeState = function () {
        return Device.media.getCurrentRange(this.FLPRangeSet.name).from === this.FLPRangeSet.rangeBorders[3];
    };

    /**
     * Whether the device is in the medium or bigger state
     * @returns {boolean} true if the device is in the medium or bigger state
     */
    ShellHeader.prototype.isMediumOrBiggerState = function () {
        return Device.media.getCurrentRange(this.FLPRangeSet.name).from >= this.FLPRangeSet.rangeBorders[0];
    };

    /**
     * Whether the device is in the phone state
     * @returns {boolean} true if the device is in the phone state
     */
    ShellHeader.prototype.isPhoneState = function () {
        const deviceType = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;
        const bEnoughSpaceForSearch = this.getDomRef().getBoundingClientRect().width > _iSearchWidth;
        return (Device.system.phone || deviceType === "Phone" || !bEnoughSpaceForSearch);
    };

    /**
     * @param {string} sStateName The search state to be set. The validate values are - COL, EXP, EXP_S.
     * @param {string} [maxRemSize] The optional max width in rem.
     * @param {boolean} [bWithOverlay] If the state is EXP the overlay appears according to this parameter (the default is true).
     */
    ShellHeader.prototype.setSearchState = function (sStateName, maxRemSize, bWithOverlay) {
        if (this.SearchState[sStateName] && this.getSearchState() !== sStateName) {
            if (typeof maxRemSize === "boolean") {
                bWithOverlay = maxRemSize;
                maxRemSize = undefined;
            }

            this.setProperty("searchState", sStateName, false);

            const bShow = (sStateName !== "COL");
            document.body.classList.toggle(sSearchOverlayCSS, bShow && bWithOverlay);

            // save for animation after rendering
            _iSearchWidth = bShow ? maxRemSize || 35 : 0;
        }
    };

    // When the search field is opened, hide header elements, one after another,
    // until the requested width is provided
    ShellHeader.prototype._hideElementsForSearch = function () {
        if (this.isExtraLargeState()) { // do not hide elements in XL
            return;
        }

        let nReqWidth;
        const oSearchContainer = this.getDomRef("hdr-search-container");
        const oBeginContainer = this.getDomRef("hdr-begin");
        const oCenterContainer = this.getDomRef("hdr-center");
        const oEndContainer = this.getDomRef("hdr-end");

        if (this.getSearchState() === "EXP" || this.isPhoneState()) {
            nReqWidth = Rem.toPx(_iSearchWidth + 3); // 3 rem minimal distance for EXP
        } else {
            nReqWidth = Rem.toPx(9 + 0.5); // minimal search width for EXP_S
        }

        // order of elements: center container, left items in reverse order, left container, right container
        const aElements = [oBeginContainer];
        // add left items in reverse order before the begin container
        // IE11: NodeList does not have the forEach function
        Array.prototype.forEach.call(oBeginContainer.childNodes, (element) => {
            aElements.unshift(element);
        });
        // center container is hidden first
        if (oCenterContainer) {
            aElements.unshift(oCenterContainer);
        }

        // restore all hidden elements to unhide some or all of them when the user makes the window wider
        oBeginContainer.style.flexBasis = "";
        oEndContainer.style.display = "";
        aElements.forEach((oElement) => {
            if (oElement.getAttribute("id") === "shellAppTitle") {
                oElement.classList.remove("sapUiPseudoInvisibleText");
            } else {
                oElement.style.display = "";
            }
        });

        // remove elements one-by-one
        let oElement;
        for (let i = 0; i < aElements.length; i++) {
            oElement = aElements[i];
            if (nReqWidth > oSearchContainer.getBoundingClientRect().width) {
                if (oElement.getAttribute("id") === "shellAppTitle") {
                    oElement.classList.add("sapUiPseudoInvisibleText");
                } else {
                    oElement.style.display = "none";
                    if (oCenterContainer && i === 0) {
                        oBeginContainer.style.flexBasis = "auto";
                    }
                }
            } else {
                return; // finished, do not hide any more elements
            }
        }
        // last attempt to get the required space: hide the end items container
        if (Rem.toPx(_iSearchWidth) > oSearchContainer.getBoundingClientRect().width) { // no minimal distance for the head-end items
            oEndContainer.style.display = "none";
        }
    };

    /**
     * @returns {int} the max width of the search field in rem
     * @private
     */
    ShellHeader.prototype.getSearchWidth = function () {
        return _iSearchWidth;
    };

    /**
     * @returns {boolean} true if the current page is the homepage
     */
    ShellHeader.prototype.isHomepage = function () {
        const sHash = `#${hasher.getHash()}`;

        const rIntentParameterBeforeAppRoute = new RegExp(
            "[?]" + // question mark character
            "(?:" + // begin non capturing block
            "(?!&[/])." + // any character which is not '&' followed by '/'
            ")*" // repeat
        );
        const sHashNoParams = sHash.replace(rIntentParameterBeforeAppRoute, "");

        return utils.isRootIntent(sHashNoParams) || sHashNoParams === "#Launchpad-openFLPPage";
    };

    ShellHeader.prototype._rerenderLogoNavigationFilter = function (oShellNavigationInternal, sNewHash, sOldHash) {
        const bAppSpecificChange = oShellNavigationInternal.hashChanger.isInnerAppNavigation(sNewHash, sOldHash);
        if (bAppSpecificChange) {
            this.invalidate(); // enable/disable logo
        }

        return oShellNavigationInternal.NavigationFilterStatus.Continue;
    };

    // Returns true when the search field is visible
    ShellHeader.prototype.getSearchVisible = function () {
        return this.getSearchState() !== this.SearchState.COL;
    };

    /**
     * gets the central control in the header
     * @returns {Element} The central control in the header
     */
    ShellHeader.prototype.getCentralControl = function () {
        return Element.getElementById(this.getCentralAreaElement());
    };

    /**
     * @returns {boolean} true if FLP runs in lean mode (no back button, no home button)
     * @private
     */
    ShellHeader.prototype._getLeanMode = function () {
        return StateManager.getShellMode() === ShellMode.Lean;
    };

    /**
     * Returns the new experience switch control in case it is available.
     * @returns {sap.ui.core.Control} The control to be rendered in the header
     *
     * @since 1.124.0
     * @private
     */
    ShellHeader.prototype.getNewExperienceSwitchControl = function () {
        if (!NewExperience.isActive()) {
            return;
        }

        if (this.getShowNewExperienceSwitch()) {
            return NewExperience.getShellHeaderControl();
        }
    };

    return ShellHeader;
});
