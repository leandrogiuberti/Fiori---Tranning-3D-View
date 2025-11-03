/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "./i18n";
import SearchFieldGroup from "./controls/searchfieldgroup/SearchFieldGroup";
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import Event from "sap/ui/base/Event";
import SearchModel from "sap/esh/search/ui/SearchModel";
import SearchSelect from "./controls/searchfieldgroup/SearchSelect";
import SearchFieldStateManager from "./controls/searchfieldgroup/SearchFieldStateManager";
import SearchShellHelperHorizonTheme from "./SearchShellHelperHorizonTheme";
import UIEvents from "./UIEvents";
import Element from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { PeriodicRetry } from "./SearchUtil";
import WebCompSearchFieldStateManager from "./controls/webcompsearchfieldgroup/WebCompSearchFieldStateManager";
import Control from "sap/ui/core/Control";
import { createWebCompSearchFieldGroupBindings } from "./controls/webcompsearchfieldgroup/WebCompSearchFieldGroupBindings";
import type ShellBarSearch from "@ui5/webcomponents-fiori/dist/ShellBarSearch";
import { loadUShellWebComps } from "./controls/webcompsearchfieldgroup/UShellWebCompLoader";

export default abstract class SearchShellHelper {
    static isInitialized: boolean;
    static sSearchOverlayCSS: "sapUshellShellShowSearchOverlay";
    static oModel: SearchModel;
    static oShellHeader: any;
    static oSearchFieldGroup: SearchFieldGroup;
    static focusInputFieldTimeout: number | undefined;
    static isFocusHandlerActive: boolean;
    static searchFieldStateManager: SearchFieldStateManager | WebCompSearchFieldStateManager;
    static periodicRetryFocus: PeriodicRetry;

    // =======================================================================
    // generic methods: used for webcomponents and not webcomponents use case
    // =======================================================================

    constructor() {
        throw new Error("Cannot instantiate static class 'SearchShellHelper'");
    }

    public static async init(searchField?: ShellBarSearch): Promise<void> {
        // get search model and shell header
        this.oModel = SearchModel.getModelSingleton({}, "flp") as SearchModel;
        this.oShellHeader = Element.getElementById("shell-header") as any;

        if (this.oModel.config.isWebCompSearchFieldGroupEnabled() && !searchField) {
            // ignore legacy initialization calls without a searchField
            return;
        }

        if (this.isInitialized) {
            // check already initialized
            return;
        }
        this.isInitialized = true;

        // pre-fetch all app tiles
        (window.sap.ushell as any).Container.getServiceAsync("Search").then((service) => {
            service.prefetch();
        });

        // create search field group
        if (this.oModel.config.isWebCompSearchFieldGroupEnabled()) {
            this.oSearchFieldGroup = await this.createWebCompSearchFieldGroup(searchField);
            /*this.searchFieldStateManager = new WebCompSearchFieldStateManager({
                shellHeader: this.oShellHeader,
                model: this.oModel,
                searchFieldGroup: this.oSearchFieldGroup,
            });*/
            if (!searchField) {
                this.oShellHeader.setSearch(this.oSearchFieldGroup);
                // search field created by elisa needs to be added to shell
                // search field provided by ushell is already part of shell
            }
        } else {
            this.oSearchFieldGroup = this.createSearchFieldGroup();
            this.searchFieldStateManager = new SearchFieldStateManager({
                shellHeader: this.oShellHeader,
                model: this.oModel,
                searchFieldGroup: this.oSearchFieldGroup,
            });
            this.oShellHeader.setSearch(this.oSearchFieldGroup);
        }

        // after search comp loaded -> expand search field (important for reload of search result list)
        EventBus.getInstance().subscribe(
            "shell",
            "searchCompLoaded",
            this.onSearchComponentLoaded.bind(this),
            {}
        );

        // after navigation -> set focus to first element of results list
        (Element.getElementById("viewPortContainer") as any).attachAfterNavigate(
            this.onAfterNavigate.bind(this),
            {}
        );

        // event ?? -> set focus to first element of results list
        EventBus.getInstance().subscribe("sap.ushell", "appComponentLoaded", () => {
            if (this?.oModel?.focusHandler && SearchHelper.isSearchAppActive()) {
                this.oModel.focusHandler.setFocus();
            }
        });
    }

    public static onSearchComponentLoaded(): void {
        // triggered by shell after search component is loaded
        // (search field is created in search component)
        if (!SearchHelper.isSearchAppActive()) {
            return;
        }
        this.expandSearch();
    }

    public static resetModel(): void {
        this.oModel.resetQuery();
    }

    public static onAfterNavigate(oEvent: any): void {
        // navigation tries to restore the focus -> but application knows better how to set the focus
        // -> after navigation call focus setter of search application
        if (
            oEvent.getParameter("toId") !== "shellPage-Action-search" &&
            oEvent.getParameter("toId") !== "applicationShellPage-Action-search" &&
            oEvent.getParameter("toId") !== "application-Action-search"
        ) {
            return;
        }
        this.oModel.focusHandler.setFocus();
        this.oModel.notifySubscribers(UIEvents.ESHSearchLayoutChanged);
    }

    public static expandSearch(focusSearchField?: boolean): void {
        this.searchFieldStateManager?.expandSearch(focusSearchField);
    }

    public static collapseSearch(): void {
        this.searchFieldStateManager?.collapseSearch();
    }

    // =======================================================================
    // webcomponents methods
    // =======================================================================

    private static async createWebCompSearchFieldGroup(
        searchFieldGroup: ShellBarSearch
    ): Promise<SearchFieldGroup> {
        /*if (!searchFieldGroup) {
            searchFieldGroup = new ShellBarSearch("searchFieldInShell");
        }*/
        createWebCompSearchFieldGroupBindings(searchFieldGroup, await loadUShellWebComps());
        (searchFieldGroup as Control).setModel(this.oModel);
        (searchFieldGroup as Control).setModel(new ResourceModel({ bundle: i18n }), "i18n");
        return searchFieldGroup as SearchFieldGroup;
    }

    // =======================================================================
    //  classical (not webcomponent) methods
    // =======================================================================

    private static createSearchFieldGroup(): SearchFieldGroup {
        // create search field group control
        const oSearchFieldGroup = new SearchFieldGroup("searchFieldInShell");
        oSearchFieldGroup.setModel(this.oModel);
        oSearchFieldGroup.setModel(new ResourceModel({ bundle: i18n }), "i18n");

        // initialize search input
        const oSearchInput = oSearchFieldGroup.input;
        oSearchInput.setMaxSuggestionWidth("30rem");

        // initialize search select
        const oSearchSelect = oSearchFieldGroup.select as SearchSelect;

        oSearchSelect.setTooltip(i18n.getText("searchInTooltip"));

        oSearchSelect.addEventDelegate(
            {
                onAfterRendering: () => {
                    jQuery('[id$="searchFieldInShell-select-icon"]').attr("title", i18n.getText("searchIn"));
                },
            },
            oSearchSelect
        );
        oSearchSelect.setTooltip(i18n.getText("searchIn"));
        oSearchSelect.attachChange(() => {
            (this.searchFieldStateManager as SearchFieldStateManager).focusSearchInput({
                selectContent: true,
            });
        });

        // initialize search button
        const oSearchButton = oSearchFieldGroup.button;
        oSearchButton.attachPress(() => {
            this.handleClickSearchButton();
        });

        // initialize cancel button
        const oSearchCancelButton = oSearchFieldGroup.cancelButton;
        oSearchCancelButton.attachPress(() => {
            this.collapseSearch();
        });
        oSearchFieldGroup.setCancelButtonActive(false);

        // esc key handler
        jQuery(document).on("keydown", this.fnEscCallBack.bind(this));

        // header size changed -> adapt visibility cancel button, dropdown button size, visibility search button
        this.oShellHeader.attachSearchSizeChanged(this.sizeSearchFieldChanged.bind(this));

        return oSearchFieldGroup;
    }

    public static fnEscCallBack(oEvent: any): void {
        // check that search field group is available
        if (!this.oSearchFieldGroup) {
            return;
        }
        // check for ESC
        if (oEvent.keyCode !== 27) {
            return;
        }
        // check that search field is focused
        if (!this.searchFieldStateManager.isSearchInputFocused()) {
            return;
        }
        // check that search app is active
        if (SearchHelper.isSearchAppActive()) {
            return;
        }
        oEvent.preventDefault(); // browser would delete value
        if ((this.oSearchFieldGroup as SearchFieldGroup).input.getValue() === "") {
            this.collapseSearch();
        } else if ((this.oSearchFieldGroup as SearchFieldGroup).input.getValue() === " ") {
            (this.oSearchFieldGroup as SearchFieldGroup).input.setValue(""); // ??
        }
    }

    public static sizeSearchFieldChanged(event: Event): void {
        // check that search field group is available
        if (!this.oSearchFieldGroup) {
            return;
        }
        const size = event.getParameters()["remSize"];
        // display mode of connector dropdown
        let limit = 24;
        if (size <= limit) {
            (this.oSearchFieldGroup as SearchFieldGroup).select.setDisplayMode("icon");
        } else {
            (this.oSearchFieldGroup as SearchFieldGroup).select.setDisplayMode("default");
        }
        // visibility of search button
        limit = 9;
        if (size < limit) {
            (this.oSearchFieldGroup as SearchFieldGroup).button.setVisible(false);
        } else {
            (this.oSearchFieldGroup as SearchFieldGroup).button.setVisible(true);
        }
        // cancel button
        if ((event as any).getParameter("isFullWidth")) {
            (this.oSearchFieldGroup as SearchFieldGroup).setCancelButtonActive(true);
            (this.oSearchFieldGroup as SearchFieldGroup).addStyleClass("sapUshellSearchInputFullWidth");
        } else {
            (this.oSearchFieldGroup as SearchFieldGroup).setCancelButtonActive(false);
            (this.oSearchFieldGroup as SearchFieldGroup).removeStyleClass("sapUshellSearchInputFullWidth");
        }
    }

    public static onShellSearchButtonPressed(): void {
        SearchShellHelper.init();
        if (this.oModel.config.isWebCompSearchFieldGroupEnabled()) {
            return;
        }
        this.expandSearch(true);
    }

    public static handleClickSearchButton(): void {
        if (
            (this.searchFieldStateManager as SearchFieldStateManager).getSearchBoxValue() === "" &&
            this.oModel.getDataSource() === this.oModel.getDefaultDataSource()
        ) {
            if (SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()) {
                // screen size XL: focus input field
                (this.searchFieldStateManager as SearchFieldStateManager).focusSearchInput({
                    selectContent: false,
                });
            } else {
                // small screen size: collapse input field + focus shell magnifier
                this.collapseSearch();
            }
        }
    }
}
