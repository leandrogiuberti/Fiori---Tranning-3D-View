sap.ui.define(['sap/ushell/thirdparty/webcomponents-base', 'sap/ushell/thirdparty/webcomponents', 'sap/ushell/thirdparty/webcomponents-fiori', 'sap/ushell/thirdparty/ListItemBase', 'sap/ushell/thirdparty/parameters-bundle.css2', 'sap/ushell/thirdparty/Icon', 'sap/ushell/thirdparty/Tag', 'sap/ushell/thirdparty/Button2', 'sap/ushell/thirdparty/information', 'sap/ushell/thirdparty/Icons', 'sap/ushell/thirdparty/parameters-bundle.css3', 'sap/ushell/thirdparty/generateHighlightedMarkup', 'sap/ushell/thirdparty/event-strict', 'sap/ushell/thirdparty/i18n-defaults', 'sap/ushell/thirdparty/parameters-bundle.css', 'sap/ushell/thirdparty/encodeXML', 'sap/ushell/thirdparty/willShowContent', 'sap/ushell/thirdparty/i18n-defaults2', 'sap/ushell/thirdparty/AccessibilityTextsHelper', 'sap/ushell/thirdparty/toLowercaseEnumValue', 'sap/ushell/thirdparty/BusyIndicator', 'sap/ushell/thirdparty/Label'], (function (webcomponentsBase, webcomponents, webcomponentsFiori, ListItemBase, parametersBundle_css, Icon, Tag, Button, information, Icons, parametersBundle_css$1, generateHighlightedMarkup, eventStrict, i18nDefaults, parametersBundle_css$2, encodeXML, willShowContent, i18nDefaults$1, AccessibilityTextsHelper, toLowercaseEnumValue, BusyIndicator, Label) { 'use strict';

    function SearchFieldTemplate() {
        return (parametersBundle_css.jsx("li", { part: "native-li", class: "ui5-li-root ui5-li--focusable", "aria-selected": this.selected, role: "option", "data-sap-focus-ref": true, draggable: this.movable, tabindex: this._effectiveTabIndex, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onClick: this._onclick, children: parametersBundle_css.jsx("div", { part: "content", class: "ui5-search-item-content", children: parametersBundle_css.jsxs("div", { class: "ui5-search-item-begin-content", children: [this.image.length > 0 && !this.icon &&
                            parametersBundle_css.jsx("slot", { name: "image" }), this.icon &&
                            parametersBundle_css.jsx(Icon.Icon, { class: "ui5-search-item-icon", name: this.icon }), this.scopeName &&
                            parametersBundle_css.jsx(Tag.Tag, { design: Tag.TagDesign.Set2, colorScheme: "10", children: this.scopeName }), parametersBundle_css.jsxs("div", { class: "ui5-search-item-titles-container", children: [parametersBundle_css.jsx("span", { part: "title", class: "ui5-search-item-text", dangerouslySetInnerHTML: { __html: this._markupText } }), parametersBundle_css.jsx("span", { part: "subtitle", class: "ui5-search-item-description", children: this.description })] }), this.deletable &&
                            parametersBundle_css.jsx(Button.Button, { class: "ui5-search-item-selected-delete", design: Button.ButtonDesign.Transparent, icon: information.decline, onClick: this._onDeleteButtonClick, tooltip: this._deleteButtonTooltip })] }) }) }));
    }

    Icons.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    Icons.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s" + "-" + "f" + "i" + "o" + "r" + "i", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
    var SearchItemCss = `:host([selected]){border:none}:host{border:none}.ui5-search-item-content{width:100%;height:100%;display:flex;align-items:center;gap:1rem}.ui5-search-item-begin-content{display:flex;height:100%;align-items:center;gap:.75rem;width:100%;box-sizing:border-box;flex:1}:host([desktop]) .ui5-search-item-selected-delete{display:none}:host(:hover),:host(:focus-within){.ui5-search-item-selected-delete{display:inline-block}}.ui5-search-item-text{display:inline-block;font-size:var(--sapFontLargeSize);font-family:var(--sapFontFamily);font-weight:400;color:var(--sapList_TextColor);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-search-item-titles-container{overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;flex:1}.ui5-search-item-icon{padding:.375rem;width:1.25rem;height:1rem;box-sizing:content-box}:host([description]){height:auto;min-height:var(--_ui5-v2-14-0-rc-7_list_item_base_height)}:host([description]) .ui5-search-item-content{padding-top:.5rem;padding-bottom:.5rem}:host([description]) .ui5-search-item-description{display:inline-block}.ui5-search-item-description{display:none;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;color:var(--sapContent_LabelColor);margin-top:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var SearchItem_1;
    /**
     * @class
     *
     * ### Overview
     *
     * A `ui5-search-item` is a list item, used for displaying search suggestions
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents-fiori/dist/SearchItem.js";`
     *
     * @constructor
     * @extends ListItemBase
     * @public
     * @since 2.9.0
     * @experimental
     */
    let SearchItem = SearchItem_1 = class SearchItem extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            /**
             * Defines whether the search item is selected.
             * @default false
             * @public
             */
            this.selected = false;
            /**
             * Defines whether the search item is deletable.
             * @default false
             * @public
             */
            this.deletable = false;
            this.highlightText = "";
            this._markupText = "";
        }
        _onfocusin(e) {
            super._onfocusin(e);
            this.selected = true;
        }
        _onfocusout() {
            this.selected = false;
        }
        _onDeleteButtonClick() {
            this.fireDecoratorEvent("delete");
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            // bold the matched text
            this._markupText = this.highlightText ? generateHighlightedMarkup.f((this.text || ""), this.highlightText) : encodeXML.fnEncodeXML(this.text || "");
        }
        get _deleteButtonTooltip() {
            return SearchItem_1.i18nBundle.getText(i18nDefaults.SEARCH_ITEM_DELETE_BUTTON);
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "description", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], SearchItem.prototype, "selected", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], SearchItem.prototype, "deletable", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "scopeName", void 0);
    __decorate([
        webcomponentsBase.s()
    ], SearchItem.prototype, "highlightText", void 0);
    __decorate([
        webcomponentsBase.d()
    ], SearchItem.prototype, "image", void 0);
    __decorate([
        parametersBundle_css$2.i("@ui5/webcomponents-fiori")
    ], SearchItem, "i18nBundle", void 0);
    SearchItem = SearchItem_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-search-item",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: SearchFieldTemplate,
            styles: [
                ListItemBase.ListItemBase.styles,
                SearchItemCss,
            ],
        })
        /**
         * Fired when delete button is pressed.
         *
         * @public
         */
        ,
        eventStrict.l("delete")
    ], SearchItem);
    SearchItem.define();
    var SearchItem$1 = SearchItem;

    return SearchItem$1;

}));
