sap.ui.define(['exports', 'sap/esh/search/ui/thirdparty/parameters-bundle.css', 'sap/esh/search/ui/thirdparty/webcomponents-fiori', 'sap/esh/search/ui/thirdparty/toLowercaseEnumValue', 'sap/esh/search/ui/thirdparty/decline', 'sap/esh/search/ui/thirdparty/ResponsivePopover'], (function (exports, parametersBundle_css, webcomponentsBase, toLowercaseEnumValue, decline, ResponsivePopover) { 'use strict';

    /**
     * Overflow Mode.
     * @public
     */
    var ExpandableTextOverflowMode;
    (function (ExpandableTextOverflowMode) {
        /**
         * Overflowing text is appended in-place.
         * @public
         */
        ExpandableTextOverflowMode["InPlace"] = "InPlace";
        /**
         * Full text is displayed in a popover.
         * @public
         */
        ExpandableTextOverflowMode["Popover"] = "Popover";
    })(ExpandableTextOverflowMode || (ExpandableTextOverflowMode = {}));

    /**
     * Empty Indicator Mode.
     * @public
     */
    var TextEmptyIndicatorMode;
    (function (TextEmptyIndicatorMode) {
        /**
         * Empty indicator is never rendered.
         * @public
         */
        TextEmptyIndicatorMode["Off"] = "Off";
        /**
         * Empty indicator is rendered always when the component's content is empty.
         * @public
         */
        TextEmptyIndicatorMode["On"] = "On";
    })(TextEmptyIndicatorMode || (TextEmptyIndicatorMode = {}));
    var TextEmptyIndicatorMode$1 = TextEmptyIndicatorMode;

    function TextTemplate() {
        return parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: parametersBundle_css.jsx("span", { children: this._renderEmptyIndicator ?
                    parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { className: "empty-indicator", "aria-hidden": "true", children: this._emptyIndicatorSymbol }), parametersBundle_css.jsx("span", { className: "empty-indicator-aria-label", children: this._emptyIndicatorAriaLabel })] })
                    :
                        parametersBundle_css.jsx("slot", {}) }) });
    }

    webcomponentsBase.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    webcomponentsBase.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme$1);
    var styles = `:host{max-width:100%;font-size:var(--sapFontSize);font-family:var(--sapFontFamily);color:var(--sapTextColor);line-height:normal;cursor:text;overflow:hidden}:host([max-lines="1"]){display:inline-block;text-overflow:ellipsis;white-space:nowrap}:host(:not([max-lines="1"])){display:-webkit-box;-webkit-line-clamp:var(--_ui5-v2-14-0-rc-7_text_max_lines);line-clamp:var(--_ui5-v2-14-0-rc-7_text_max_lines);-webkit-box-orient:vertical;white-space:normal;word-wrap:break-word}.empty-indicator-aria-label{position:absolute!important;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0;font-size:0}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Text_1;
    /**
     * @class
     *
     * <h3>Overview</h3>
     *
     * The `ui5-text` component displays text that can be used in any content area of an application.
     *
     * <h3>Usage</h3>
     *
     * - Use the `ui5-text` if you want to display text inside a form, table, or any other content area.
     * - Do not use the `ui5-text` if you need to reference input type of components (use ui5-label).
     *
     * <h3>Responsive behavior</h3>
     *
     * The `ui5-text` component is fully adaptive to all screen sizes.
     * By default, the text will wrap when the space is not enough.
     * In addition, the component supports truncation via the <code>max-lines</code> property,
     * by defining the number of lines the text should wrap before start truncating.
     *
     * <h3>ES6 Module Import</h3>
     *
     * <code>import "@ui5/webcomponents/dist/Text";</code>
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.0.0
     */
    let Text = Text_1 = class Text extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines the number of lines the text should wrap before it truncates.
             * @default Infinity
             * @public
             */
            this.maxLines = Infinity;
            /**
             * Specifies if an empty indicator should be displayed when there is no text.
             * @default "Off"
             * @since 2.2.0
             * @public
             */
            this.emptyIndicatorMode = "Off";
        }
        onBeforeRendering() {
            this.style.setProperty(webcomponentsBase.d$1("--_ui5_text_max_lines"), `${this.maxLines}`);
        }
        get hasText() {
            return decline.t(this.text);
        }
        get _renderEmptyIndicator() {
            return !this.hasText && this.emptyIndicatorMode === TextEmptyIndicatorMode$1.On;
        }
        get _emptyIndicatorAriaLabel() {
            return Text_1.i18nBundle.getText(toLowercaseEnumValue.EMPTY_INDICATOR_ACCESSIBLE_TEXT);
        }
        get _emptyIndicatorSymbol() {
            return Text_1.i18nBundle.getText(toLowercaseEnumValue.EMPTY_INDICATOR_SYMBOL);
        }
    };
    __decorate$2([
        webcomponentsBase.s({ type: Number })
    ], Text.prototype, "maxLines", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Text.prototype, "emptyIndicatorMode", void 0);
    __decorate$2([
        webcomponentsBase.d({ type: Node, "default": true })
    ], Text.prototype, "text", void 0);
    __decorate$2([
        parametersBundle_css.i("@ui5/webcomponents")
    ], Text, "i18nBundle", void 0);
    Text = Text_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-text",
            renderer: parametersBundle_css.y,
            template: TextTemplate,
            styles,
        })
    ], Text);
    Text.define();
    var Text$1 = Text;

    /**
     * Different link designs.
     * @public
     */
    var LinkDesign;
    (function (LinkDesign) {
        /**
         * default type (no special styling)
         * @public
         */
        LinkDesign["Default"] = "Default";
        /**
         * subtle type (appears as regular text, rather than a link)
         * @public
         */
        LinkDesign["Subtle"] = "Subtle";
        /**
         * emphasized type
         * @public
         */
        LinkDesign["Emphasized"] = "Emphasized";
    })(LinkDesign || (LinkDesign = {}));
    var LinkDesign$1 = LinkDesign;

    function LinkTemplate() {
        return (parametersBundle_css.jsxs("a", { part: "root", class: "ui5-link-root", role: this.effectiveAccRole, href: this.parsedRef, target: this.target, rel: this._rel, tabindex: this.effectiveTabIndex, title: this.tooltip, "aria-disabled": this.disabled, "aria-label": this.ariaLabelText, "aria-haspopup": this._hasPopup, "aria-expanded": this.accessibilityAttributes.expanded, "aria-current": this.accessibilityAttributes.current, "aria-description": this.ariaDescriptionText, onClick: this._onclick, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, children: [this.icon &&
                    parametersBundle_css.jsx(decline.Icon, { class: "ui5-link-icon", name: this.icon, mode: "Decorative", part: "icon" }), parametersBundle_css.jsx("span", { class: "ui5-link-text", children: parametersBundle_css.jsx("slot", {}) }), this.hasLinkType &&
                    parametersBundle_css.jsx("span", { class: "ui5-hidden-text", children: this.linkTypeText }), this.endIcon &&
                    parametersBundle_css.jsx(decline.Icon, { class: "ui5-link-end-icon", name: this.endIcon, mode: "Decorative", part: "endIcon" })] }));
    }

    webcomponentsBase.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    webcomponentsBase.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme$1);
    var linkCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapLinkColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);cursor:pointer;outline:none;text-decoration:var(--_ui5-v2-14-0-rc-7_link_text_decoration);text-shadow:var(--sapContent_TextShadow);white-space:normal;overflow-wrap:break-word}:host(:hover){color:var(--sapLink_Hover_Color);text-decoration:var(--_ui5-v2-14-0-rc-7_link_hover_text_decoration)}:host(:active){color:var(--sapLink_Active_Color);text-decoration:var(--_ui5-v2-14-0-rc-7_link_active_text_decoration)}:host([disabled]){pointer-events:none}:host([disabled]) .ui5-link-root{text-shadow:none;outline:none;cursor:default;pointer-events:none;opacity:var(--sapContent_DisabledOpacity)}:host([design="Emphasized"]) .ui5-link-root{font-family:var(--sapFontBoldFamily)}:host([design="Subtle"]){color:var(--sapLink_SubtleColor);text-decoration:var(--_ui5-v2-14-0-rc-7_link_subtle_text_decoration)}:host([design="Subtle"]:hover:not(:active)){color:var(--sapLink_SubtleColor);text-decoration:var(--_ui5-v2-14-0-rc-7_link_subtle_text_decoration_hover)}:host([wrapping-type="None"]){white-space:nowrap;overflow-wrap:normal}.ui5-link-root{max-width:100%;display:inline-block;position:relative;overflow:hidden;text-overflow:ellipsis;outline:none;white-space:inherit;overflow-wrap:inherit;text-decoration:inherit;color:inherit}:host([wrapping-type="None"][end-icon]) .ui5-link-root{display:inline-flex;align-items:end}:host .ui5-link-root{outline-offset:-.0625rem;border-radius:var(--_ui5-v2-14-0-rc-7_link_focus_border-radius)}.ui5-link-icon,.ui5-link-end-icon{color:inherit;flex-shrink:0}.ui5-link-icon{float:inline-start;margin-inline-end:.125rem}.ui5-link-end-icon{margin-inline-start:.125rem;vertical-align:bottom}.ui5-link-text{overflow:hidden;text-overflow:ellipsis}.ui5-link-root:focus-visible,:host([desktop]) .ui5-link-root:focus-within,:host([design="Subtle"]) .ui5-link-root:focus-visible,:host([design="Subtle"][desktop]) .ui5-link-root:focus-within{background-color:var(--_ui5-v2-14-0-rc-7_link_focus_background_color);outline:var(--_ui5-v2-14-0-rc-7_link_outline);border-radius:var(--_ui5-v2-14-0-rc-7_link_focus_border-radius);text-shadow:none;color:var(--_ui5-v2-14-0-rc-7_link_focus_color)}:host(:not([desktop])) .ui5-link-root:focus-visible,:host([desktop]:focus-within),:host([design="Subtle"][desktop]:focus-within){text-decoration:var(--_ui5-v2-14-0-rc-7_link_focus_text_decoration)}:host([desktop]:hover:not(:active):focus-within),:host([design="Subtle"][desktop]:hover:not(:active):focus-within){color:var(--_ui5-v2-14-0-rc-7_link_focused_hover_text_color);text-decoration:var(--_ui5-v2-14-0-rc-7_link_focused_hover_text_decoration)}:host([interactive-area-size="Large"]) .ui5-link-root{line-height:var(--_ui5-v2-14-0-rc-7_link_large_interactive_area_height)}:host([interactive-area-size="Large"])::part(icon),:host([interactive-area-size="Large"])::part(endIcon){height:var(--_ui5-v2-14-0-rc-7_link_large_interactive_area_height)}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Link_1;
    /**
     * @class
     *
     * ### Overview
     * The `ui5-link` is a hyperlink component that is used to navigate to other
     * apps and web pages, or to trigger actions.
     * It is a clickable text element, visualized in such a way that it stands out
     * from the standard text.
     * On hover, it changes its style to an underlined text to provide additional feedback to the user.
     *
     * ### Usage
     *
     * You can set the `ui5-link` to be enabled or disabled.
     *
     * To create a visual hierarchy in large lists of links, you can set the less important links as
     * `Subtle` or the more important ones as `Emphasized`,
     * by using the `design` property.
     *
     * If the `href` property is set, the link behaves as the HTML
     * anchor tag (`<a></a>`) and opens the specified URL in the given target frame (`target` property).
     * To specify where the linked content is opened, you can use the `target` property.
     *
     * ### Responsive behavior
     *
     * If there is not enough space, the text of the `ui5-link` becomes truncated.
     * If the `wrappingType` property is set to `"Normal"`, the text is displayed
     * on several lines instead of being truncated.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Link";`
     * @constructor
     * @extends UI5Element
     * @public
     * @csspart icon - Used to style the provided icon within the link
     * @csspart endIcon - Used to style the provided endIcon within the link
     * @slot {Array<Node>} default - Defines the text of the component.
     *
     * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     */
    let Link = Link_1 = class Link extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines whether the component is disabled.
             *
             * **Note:** When disabled, the click event cannot be triggered by the user.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * Defines the component design.
             *
             * **Note:** Avaialble options are `Default`, `Subtle`, and `Emphasized`.
             * @default "Default"
             * @public
             */
            this.design = "Default";
            /**
             * Defines the target area size of the link:
             * - **InteractiveAreaSize.Normal**: The default target area size.
             * - **InteractiveAreaSize.Large**: The target area size is enlarged to 24px in height.
             *
             * **Note:**The property is designed to make links easier to activate and helps meet the WCAG 2.2 Target Size requirement. It is applicable only for the SAP Horizon themes.
             * **Note:**To improve <code>ui5-link</code>'s reliability and usability, it is recommended to use the <code>InteractiveAreaSize.Large</code> value in scenarios where the <code>ui5-link</code> component is placed inside another interactive component, such as a list item or a table cell.
             * Setting the <code>interactiveAreaSize</code> property to <code>InteractiveAreaSize.Large</code> increases the <code>ui5-link</code>'s invisible touch area. As a result, the user's intended one-time selection command is more likely to activate the desired <code>ui5-link</code>, with minimal chance of unintentionally activating the underlying component.
             *
             * @public
             * @since 2.8.0
             * @default "Normal"
             */
            this.interactiveAreaSize = "Normal";
            /**
             * Defines how the text of a component will be displayed when there is not enough space.
             *
             * **Note:** By default the text will wrap. If "None" is set - the text will truncate.
             * @default "Normal"
             * @public
             */
            this.wrappingType = "Normal";
            /**
             * Defines the ARIA role of the component.
             *
             * **Note:** Use the <code>LinkAccessibleRole.Button</code> role in cases when navigation is not expected to occur and the href property is not defined.
             * @default "Link"
             * @public
             * @since 1.9.0
             */
            this.accessibleRole = "Link";
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following fields are supported:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`.
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
             * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
             *
             * @public
             * @since 1.1.0
             * @default {}
             */
            this.accessibilityAttributes = {};
            this._dummyAnchor = document.createElement("a");
        }
        onEnterDOM() {
            if (webcomponentsBase.f()) {
                this.setAttribute("desktop", "");
            }
        }
        onBeforeRendering() {
            const needsNoReferrer = this.target !== "_self"
                && this.href
                && this._isCrossOrigin(this.href);
            this._rel = needsNoReferrer ? "noreferrer noopener" : undefined;
        }
        _isCrossOrigin(href) {
            this._dummyAnchor.href = href;
            return !(this._dummyAnchor.hostname === webcomponentsBase.i()
                && this._dummyAnchor.port === webcomponentsBase.c()
                && this._dummyAnchor.protocol === webcomponentsBase.a());
        }
        get effectiveTabIndex() {
            if (this.forcedTabIndex) {
                return Number.parseInt(this.forcedTabIndex);
            }
            return (this.disabled || !this.textContent?.length) ? -1 : 0;
        }
        get ariaLabelText() {
            return decline.A(this);
        }
        get hasLinkType() {
            return this.design !== LinkDesign$1.Default;
        }
        static typeTextMappings() {
            return {
                "Subtle": toLowercaseEnumValue.LINK_SUBTLE,
                "Emphasized": toLowercaseEnumValue.LINK_EMPHASIZED,
            };
        }
        get linkTypeText() {
            return Link_1.i18nBundle.getText(Link_1.typeTextMappings()[this.design]);
        }
        get parsedRef() {
            return (this.href && this.href.length > 0) ? this.href : undefined;
        }
        get effectiveAccRole() {
            return toLowercaseEnumValue.n(this.accessibleRole);
        }
        get ariaDescriptionText() {
            return this.accessibleDescription === "" ? undefined : this.accessibleDescription;
        }
        get _hasPopup() {
            return this.accessibilityAttributes.hasPopup;
        }
        _onclick(e) {
            const { altKey, ctrlKey, metaKey, shiftKey, } = e;
            e.stopImmediatePropagation();
            const executeEvent = this.fireDecoratorEvent("click", {
                altKey,
                ctrlKey,
                metaKey,
                shiftKey,
            });
            if (!executeEvent) {
                e.preventDefault();
            }
        }
        _onkeydown(e) {
            if (webcomponentsBase.b$1(e) && !this.href) {
                this._onclick(e);
                e.preventDefault();
            }
            else if (webcomponentsBase.A(e)) {
                e.preventDefault();
            }
        }
        _onkeyup(e) {
            if (!webcomponentsBase.A(e)) {
                return;
            }
            this._onclick(e);
            if (this.href && !e.defaultPrevented) {
                const customEvent = new MouseEvent("click");
                customEvent.stopImmediatePropagation();
                this.getDomRef().dispatchEvent(customEvent);
            }
        }
    };
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Link.prototype, "disabled", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "tooltip", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "href", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "target", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "design", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "interactiveAreaSize", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "wrappingType", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "accessibleName", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "accessibleNameRef", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "accessibleRole", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Object })
    ], Link.prototype, "accessibilityAttributes", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "accessibleDescription", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "icon", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Link.prototype, "endIcon", void 0);
    __decorate$1([
        webcomponentsBase.s({ noAttribute: true })
    ], Link.prototype, "_rel", void 0);
    __decorate$1([
        webcomponentsBase.s({ noAttribute: true })
    ], Link.prototype, "forcedTabIndex", void 0);
    __decorate$1([
        parametersBundle_css.i("@ui5/webcomponents")
    ], Link, "i18nBundle", void 0);
    Link = Link_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-link",
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: LinkTemplate,
            styles: linkCss,
        })
        /**
         * Fired when the component is triggered either with a mouse/tap
         * or by using the Enter key.
         * @public
         * @param {boolean} altKey Returns whether the "ALT" key was pressed when the event was triggered.
         * @param {boolean} ctrlKey Returns whether the "CTRL" key was pressed when the event was triggered.
         * @param {boolean} metaKey Returns whether the "META" key was pressed when the event was triggered.
         * @param {boolean} shiftKey Returns whether the "SHIFT" key was pressed when the event was triggered.
         */
        ,
        parametersBundle_css.l("click", {
            bubbles: true,
            cancelable: true,
        })
    ], Link);
    Link.define();
    var Link$1 = Link;

    function ExpandableTextTemplate() {
        return (parametersBundle_css.jsxs("div", { children: [parametersBundle_css.jsx(Text$1, { class: "ui5-exp-text-text", emptyIndicatorMode: this.emptyIndicatorMode, children: this._displayedText }), this._maxCharactersExceeded && parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsx("span", { class: "ui5-exp-text-ellipsis", children: this._ellipsisText }), parametersBundle_css.jsx(Link$1, { id: "toggle", class: "ui5-exp-text-toggle", accessibleRole: "Button", accessibleName: this._accessibleNameForToggle, accessibilityAttributes: this._accessibilityAttributesForToggle, onClick: this._handleToggleClick, children: this._textForToggle }), this._usePopover &&
                            parametersBundle_css.jsxs(ResponsivePopover.ResponsivePopover, { open: this._expanded, opener: "toggle", accessibleNameRef: "popover-text", contentOnlyOnDesktop: true, _hideHeader: true, class: "ui5-exp-text-popover", onClose: this._handlePopoverClose, children: [parametersBundle_css.jsx(Text$1, { id: "popover-text", children: this.text }), parametersBundle_css.jsx("div", { slot: "footer", class: "ui5-exp-text-footer", children: parametersBundle_css.jsx(decline.Button, { design: "Transparent", onClick: this._handleCloseButtonClick, children: this._closeButtonText }) })] })] })] }));
    }

    webcomponentsBase.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    webcomponentsBase.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme$1);
    var ExpandableTextCss = `:host{display:inline-block;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);color:var(--sapTextColor)}:host([hidden]){display:none}.ui5-exp-text-text{display:inline}.ui5-exp-text-text,.ui5-exp-text-toggle{font-family:inherit;font-size:inherit}.ui5-exp-text-text,.ui5-exp-text-ellipsis{color:inherit}.ui5-exp-text-popover::part(content){padding-inline:1rem}.ui5-exp-text-footer{width:100%;display:flex;align-items:center;justify-content:flex-end}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ExpandableText_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-expandable-text` component allows displaying a large body of text in a small space. It provides an "expand/collapse" functionality, which shows/hides potentially truncated text.
     *
     * ### Usage
     *
     * #### When to use:
     * - To accommodate long texts in limited space, for example in list items, table cell texts, or forms
     *
     * #### When not to use:
     * - The content is critical for the user. In this case use short descriptions that can fit in
     * - Strive to provide short and meaningful texts to avoid excessive number of "Show More" links on the page
     *
     * ### Responsive Behavior
     *
     * On phones, if the component is configured to display the full text in a popover, the popover will appear in full screen.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/ExpandableText";`
     *
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.6.0
     */
    let ExpandableText = ExpandableText_1 = class ExpandableText extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Maximum number of characters to be displayed initially. If the text length exceeds this limit, the text will be truncated with an ellipsis, and the "More" link will be displayed.
             * @default 100
             * @public
             */
            this.maxCharacters = 100;
            /**
             * Determines how the full text will be displayed.
             * @default "InPlace"
             * @public
             */
            this.overflowMode = "InPlace";
            /**
             * Specifies if an empty indicator should be displayed when there is no text.
             * @default "Off"
             * @public
             */
            this.emptyIndicatorMode = "Off";
            this._expanded = false;
        }
        getFocusDomRef() {
            if (this._usePopover) {
                return this.shadowRoot?.querySelector("[ui5-responsive-popover]");
            }
            return this.shadowRoot?.querySelector("[ui5-link]");
        }
        get _displayedText() {
            if (this._expanded && !this._usePopover) {
                return this.text;
            }
            return this.text?.substring(0, this.maxCharacters);
        }
        get _maxCharactersExceeded() {
            return (this.text?.length || 0) > this.maxCharacters;
        }
        get _usePopover() {
            return this.overflowMode === ExpandableTextOverflowMode.Popover;
        }
        get _ellipsisText() {
            if (this._expanded && !this._usePopover) {
                return " ";
            }
            return "... ";
        }
        get _textForToggle() {
            return this._expanded ? ExpandableText_1.i18nBundle.getText(toLowercaseEnumValue.EXPANDABLE_TEXT_SHOW_LESS) : ExpandableText_1.i18nBundle.getText(toLowercaseEnumValue.EXPANDABLE_TEXT_SHOW_MORE);
        }
        get _closeButtonText() {
            return ExpandableText_1.i18nBundle.getText(toLowercaseEnumValue.EXPANDABLE_TEXT_CLOSE);
        }
        get _accessibilityAttributesForToggle() {
            if (this._usePopover) {
                return {
                    expanded: this._expanded,
                    hasPopup: "dialog",
                };
            }
            return {
                expanded: this._expanded,
            };
        }
        get _accessibleNameForToggle() {
            if (this._usePopover) {
                return this._expanded ? ExpandableText_1.i18nBundle.getText(toLowercaseEnumValue.EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL) : ExpandableText_1.i18nBundle.getText(toLowercaseEnumValue.EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL);
            }
            return undefined;
        }
        _handlePopoverClose() {
            if (!webcomponentsBase.d$2()) {
                this._expanded = false;
            }
        }
        _handleToggleClick() {
            this._expanded = !this._expanded;
        }
        _handleCloseButtonClick(e) {
            this._expanded = false;
            e.stopPropagation();
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], ExpandableText.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], ExpandableText.prototype, "maxCharacters", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ExpandableText.prototype, "overflowMode", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ExpandableText.prototype, "emptyIndicatorMode", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ExpandableText.prototype, "_expanded", void 0);
    __decorate([
        parametersBundle_css.i("@ui5/webcomponents")
    ], ExpandableText, "i18nBundle", void 0);
    ExpandableText = ExpandableText_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-expandable-text",
            renderer: parametersBundle_css.y,
            styles: ExpandableTextCss,
            template: ExpandableTextTemplate,
        })
    ], ExpandableText);
    ExpandableText.define();

    /**
     * Provides a template for rendering text with the ExpandableText component
     * when wrappingType is set to "Normal".
     *
     * @param {object} injectedProps - The configuration options for the expandable text
     * @returns {JSX.Element} The rendered ExpandableText component
     */
    function ListItemStandardExpandableTextTemplate(injectedProps) {
        const { className, text, maxCharacters, part } = injectedProps;
        return (parametersBundle_css.jsx(ExpandableText, { part: part, class: className, text: text, maxCharacters: maxCharacters }));
    }

    exports.default = ListItemStandardExpandableTextTemplate;

}));
