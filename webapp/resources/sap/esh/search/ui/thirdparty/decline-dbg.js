sap.ui.define(['exports', 'sap/esh/search/ui/thirdparty/webcomponents-fiori', 'sap/esh/search/ui/thirdparty/parameters-bundle.css', 'sap/esh/search/ui/thirdparty/toLowercaseEnumValue'], (function (exports, webcomponentsBase, parametersBundle_css, toLowercaseEnumValue) { 'use strict';

    function IconTemplate() {
        return (parametersBundle_css.jsxs("svg", { class: "ui5-icon-root", part: "root", tabindex: this._tabIndex, dir: this._dir, viewBox: this.viewBox, role: this.effectiveAccessibleRole, focusable: "false", preserveAspectRatio: "xMidYMid meet", "aria-label": this.effectiveAccessibleName, "aria-hidden": this.effectiveAriaHidden, xmlns: "http://www.w3.org/2000/svg", onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, children: [this.hasIconTooltip &&
                    parametersBundle_css.jsxs("title", { id: `${this._id}-tooltip`, children: [" ", this.effectiveAccessibleName, " "] }), parametersBundle_css.jsx("g", { role: "presentation", children: content.call(this) })] }));
    }
    function content() {
        if (this.customTemplate) {
            return this.customTemplate;
        }
        if (this.customTemplateAsString) {
            return parametersBundle_css.jsx("g", { dangerouslySetInnerHTML: { __html: this.customTemplateAsString } });
        }
        return this.pathData.map(path => (parametersBundle_css.jsx("path", { d: path })));
    }

    /**
     * Different Icon modes.
     * @public
     * @since 2.0.0
     */
    var IconMode;
    (function (IconMode) {
        /**
         * Image mode (by default).
         * Configures the component to internally render role="img".
         * @public
         */
        IconMode["Image"] = "Image";
        /**
         * Decorative mode.
         * Configures the component to internally render role="presentation" and aria-hidden="true",
         * making it purely decorative without semantic content or interactivity.
         * @public
         */
        IconMode["Decorative"] = "Decorative";
        /**
         * Interactive mode.
         * Configures the component to internally render role="button".
         * This mode also supports focus and press handling to enhance interactivity.
         * @public
        */
        IconMode["Interactive"] = "Interactive";
    })(IconMode || (IconMode = {}));
    var IconMode$1 = IconMode;

    webcomponentsBase.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    webcomponentsBase.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme$1);
    var iconCss = `:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host([hidden]){display:none}:host([invalid]){display:none}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{display:inline-block;width:1rem;height:1rem;color:var(--sapContent_IconColor);fill:currentColor;outline:none}:host([design="Contrast"]){color:var(--sapContent_ContrastIconColor)}:host([design="Critical"]){color:var(--sapCriticalElementColor)}:host([design="Information"]){color:var(--sapInformativeElementColor)}:host([design="Negative"]){color:var(--sapNegativeElementColor)}:host([design="Neutral"]){color:var(--sapNeutralElementColor)}:host([design="NonInteractive"]){color:var(--sapContent_NonInteractiveIconColor)}:host([design="Positive"]){color:var(--sapPositiveElementColor)}:host([mode="Interactive"][desktop]) .ui5-icon-root:focus,:host([mode="Interactive"]) .ui5-icon-root:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--ui5-v2-14-0-rc-7-icon-focus-border-radius)}.ui5-icon-root{display:flex;height:100%;width:100%;outline:none;vertical-align:top}:host([mode="Interactive"]){cursor:pointer}.ui5-icon-root:not([dir=ltr])>g{transform:var(--_ui5-v2-14-0-rc-7_icon_transform_scale);transform-origin:center}
`;

    var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    const ICON_NOT_FOUND = "ICON_NOT_FOUND";
    /**
     * @class
     * ### Overview
     *
     * The `ui5-icon` component represents an SVG icon.
     * There are two main scenarios how the `ui5-icon` component is used:
     * as a purely decorative element,
     * or as an interactive element that can be focused and clicked.
     *
     * ### Usage
     *
     * 1. **Get familiar with the icons collections.**
     *
     * Before displaying an icon, you need to explore the icons collections to find and import the desired icon.
     *
     * Currently there are 3 icons collection, available as 3 npm packages:
     *
     * - [@ui5/webcomponents-icons](https://www.npmjs.com/package/@ui5/webcomponents-icons) represents the "SAP-icons" collection and includes the following
     * [icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons).
     * - [@ui5/webcomponents-icons-tnt](https://www.npmjs.com/package/@ui5/webcomponents-icons-tnt) represents the "tnt" collection and includes the following
     * [icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT).
     * - [@ui5/webcomponents-icons-business-suite](https://www.npmjs.com/package/@ui5/webcomponents-icons-business-suite) represents the "business-suite" collection and includes the following
     * [icons](https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/BusinessSuiteInAppSymbols).
     *
     * 2. **After exploring the icons collections, add one or more of the packages as dependencies to your project.**
     *
     * `npm i @ui5/webcomponents-icons`
     * `npm i @ui5/webcomponents-icons-tnt`
     * `npm i @ui5/webcomponents-icons-business-suite`
     *
     * 3. **Then, import the desired icon**.
     *
     * `import "@ui5/\{package_name\}/dist/\{icon_name\}.js";`
     *
     * **For Example**:
     *
     * For the standard "SAP-icons" icon collection, import an icon from the `@ui5/webcomponents-icons` package:
     *
     * `import "sap/esh/search/ui/gen/ui5/webcomponents-icons/dist/employee.js";`
     *
     * For the "tnt" (SAP Fiori Tools) icon collection, import an icon from the `@ui5/webcomponents-icons-tnt` package:
     *
     * `import "sap/esh/search/ui/gen/ui5/webcomponents-icons-tnt/dist/antenna.js";`
     *
     * For the "business-suite" (SAP Business Suite) icon collection, import an icon from the `@ui5/webcomponents-icons-business-suite` package:
     *
     * `import "sap/esh/search/ui/gen/ui5/webcomponents-icons-business-suite/dist/ab-testing.js";`
     *
     * 4. **Display the icon using the `ui5-icon` web component.**
     * Set the icon collection ("SAP-icons", "tnt" or "business-suite" - "SAP-icons" is the default icon collection and can be skipped)
     * and the icon name to the `name` property.
     *
     * `<ui5-icon name="employee"></ui5-icon>`
     * `<ui5-icon name="tnt/antenna"></ui5-icon>`
     * `<ui5-icon name="business-suite/ab-testing"></ui5-icon>`
     *
     * ### Keyboard Handling
     *
     * - [Space] / [Enter] or [Return] - Fires the `click` event if the `mode` property is set to `Interactive`.
     * - [Shift] - If [Space] / [Enter] or [Return] is pressed, pressing [Shift] releases the ui5-icon without triggering the click event.
     *
     * ### ES6 Module Import
     *
     * `import "sap/esh/search/ui/gen/ui5/webcomponents/dist/Icon.js";`
     * @csspart root - Used to style the outermost wrapper of the `ui5-icon`.
     * @constructor
     * @extends UI5Element
     * @implements {IIcon}
     * @public
     */
    let Icon = class Icon extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines the component semantic design.
             * @default "Default"
             * @public
             * @since 1.9.2
             */
            this.design = "Default";
            /**
             * Defines whether the component should have a tooltip.
             *
             * **Note:** The tooltip text should be provided via the `accessible-name` property.
             * @default false
             * @public
             */
            this.showTooltip = false;
            /**
             * Defines the mode of the component.
             * @default "Decorative"
             * @public
             * @since 2.0.0
             */
            this.mode = "Decorative";
            /**
             * @private
             */
            this.pathData = [];
            /**
            * @private
            */
            this.invalid = false;
        }
        _onkeydown(e) {
            if (this.mode !== IconMode$1.Interactive) {
                return;
            }
            if (webcomponentsBase.b$1(e)) {
                this.fireDecoratorEvent("click");
            }
            if (webcomponentsBase.A(e)) {
                e.preventDefault(); // prevent scrolling
            }
        }
        _onkeyup(e) {
            if (this.mode === IconMode$1.Interactive && webcomponentsBase.A(e)) {
                this.fireDecoratorEvent("click");
            }
        }
        /**
        * Enforce "ltr" direction, based on the icons collection metadata.
        */
        get _dir() {
            return this.ltr ? "ltr" : undefined;
        }
        get effectiveAriaHidden() {
            return this.mode === IconMode$1.Decorative ? "true" : undefined;
        }
        get _tabIndex() {
            return this.mode === IconMode$1.Interactive ? 0 : undefined;
        }
        get effectiveAccessibleRole() {
            switch (this.mode) {
                case IconMode$1.Interactive:
                    return "button";
                case IconMode$1.Decorative:
                    return "presentation";
                default:
                    return "img";
            }
        }
        onEnterDOM() {
            if (webcomponentsBase.f()) {
                this.setAttribute("desktop", "");
            }
        }
        async onBeforeRendering() {
            const name = this.name;
            if (!name) {
                return;
            }
            let iconData = webcomponentsBase.D$1(name);
            if (!iconData) {
                iconData = await webcomponentsBase.n(name);
            }
            if (!iconData) {
                this.invalid = true;
                /* eslint-disable-next-line */
                return console.warn(`Required icon is not registered. Invalid icon name: ${this.name}`);
            }
            if (iconData === ICON_NOT_FOUND) {
                this.invalid = true;
                /* eslint-disable-next-line */
                return console.warn(`Required icon is not registered. You can either import the icon as a module in order to use it e.g. "sap/esh/search/ui/gen/ui5/webcomponents-icons/dist/${name.replace("sap-icon://", "")}.js", or setup a JSON build step and import "sap/esh/search/ui/gen/ui5/webcomponents-icons/dist/AllIcons.js".`);
            }
            this.viewBox = iconData.viewBox || "0 0 512 512";
            if ("customTemplate" in iconData && iconData.customTemplate) {
                this.customTemplate = webcomponentsBase.n$1(iconData.customTemplate, this);
            }
            if ("customTemplateAsString" in iconData) {
                this.customTemplateAsString = iconData.customTemplateAsString;
            }
            // in case a new valid name is set, show the icon
            this.invalid = false;
            if ("pathData" in iconData && iconData.pathData) {
                this.pathData = Array.isArray(iconData.pathData) ? iconData.pathData : [iconData.pathData];
            }
            this.accData = iconData.accData;
            this.ltr = iconData.ltr;
            this.packageName = iconData.packageName;
            if (this.accessibleName) {
                this.effectiveAccessibleName = this.accessibleName;
            }
            else if (this.accData) {
                if (this.packageName) {
                    const i18nBundle = await webcomponentsBase.f$1(this.packageName);
                    this.effectiveAccessibleName = i18nBundle.getText(this.accData) || undefined;
                }
                else {
                    this.effectiveAccessibleName = this.accData?.defaultText || undefined;
                }
            }
            else {
                this.effectiveAccessibleName = undefined;
            }
        }
        get hasIconTooltip() {
            return this.showTooltip && this.effectiveAccessibleName;
        }
    };
    __decorate$3([
        webcomponentsBase.s()
    ], Icon.prototype, "design", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Icon.prototype, "name", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Icon.prototype, "accessibleName", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], Icon.prototype, "showTooltip", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], Icon.prototype, "mode", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Array })
    ], Icon.prototype, "pathData", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Object, noAttribute: true })
    ], Icon.prototype, "accData", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Boolean })
    ], Icon.prototype, "invalid", void 0);
    __decorate$3([
        webcomponentsBase.s({ noAttribute: true })
    ], Icon.prototype, "effectiveAccessibleName", void 0);
    Icon = __decorate$3([
        webcomponentsBase.m({
            tag: "ui5-icon",
            languageAware: true,
            themeAware: true,
            renderer: parametersBundle_css.y,
            template: IconTemplate,
            styles: iconCss,
        })
        /**
         * Fired on mouseup, `SPACE` and `ENTER`.
         * - on mouse click, the icon fires native `click` event
         * - on `SPACE` and `ENTER`, the icon fires custom `click` event
         * @public
         * @since 2.11.0
         */
        ,
        parametersBundle_css.l("click", {
            bubbles: true,
        })
    ], Icon);
    Icon.define();
    var Icon$1 = Icon;

    const t=r=>Array.from(r).filter(e=>e.nodeType!==Node.COMMENT_NODE&&(e.nodeType!==Node.TEXT_NODE||(e.nodeValue||"").trim().length!==0)).length>0;

    const name$9 = "sys-enter-2";
    const pathData$9 = "M512 256q0 54-20 100.5t-54.5 81T356 492t-100 20q-54 0-100.5-20t-81-55T20 355.5 0 256t20.5-100 55-81.5T157 20t99-20q53 0 100 20t81.5 54.5T492 156t20 100zm-118-87q4-8-1-13l-36-36q-3-4-8-4t-8 5L237 294q-3 1-4 0l-70-52q-4-3-7-3t-4.5 2-2.5 3l-29 41q-6 8 2 14l113 95q2 2 7 2t8-4z";
    const ltr$9 = true;
    const collection$9 = "SAP-icons-v4";
    const packageName$9 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$9, { pathData: pathData$9, ltr: ltr$9, collection: collection$9, packageName: packageName$9 });

    const name$8 = "sys-enter-2";
    const pathData$8 = "M256 0q53 0 100 20t81.5 54.5T492 156t20 100-20 100-54.5 81.5T356 492t-100 20-100-20-81.5-54.5T20 356 0 256t20-100 54.5-81.5T156 20 256 0zm150 183q10-9 10-23 0-13-9.5-22.5T384 128t-22 9L186 308l-68-63q-9-9-22-9t-22.5 9.5T64 268q0 15 10 24l91 83q9 9 21 9 13 0 23-9z";
    const ltr$8 = true;
    const collection$8 = "SAP-icons-v5";
    const packageName$8 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$8, { pathData: pathData$8, ltr: ltr$8, collection: collection$8, packageName: packageName$8 });

    const ICON_DECLINE = { key: "ICON_DECLINE", defaultText: "Decline" };
    const ICON_ERROR = { key: "ICON_ERROR", defaultText: "Error" };
    const ICON_SEARCH = { key: "ICON_SEARCH", defaultText: "Search" };

    const name$7 = "error";
    const pathData$7 = "M512 256q0 53-20.5 100t-55 81.5-81 54.5-99.5 20-100-20.5-81.5-55T20 355 0 256q0-54 20-100.5t55-81T156.5 20 256 0t99.5 20T437 75t55 81.5 20 99.5zM399 364q6-6 0-12l-86-86q-6-6 0-12l81-81q6-6 0-12l-37-37q-2-2-6-2t-6 2l-83 82q-1 3-6 3-3 0-6-3l-84-83q-1-2-6-2-4 0-6 2l-37 37q-6 6 0 12l83 82q6 6 0 12l-83 82q-2 2-2.5 6t2.5 6l36 37q4 2 6 2 4 0 6-2l85-84q2-2 6-2t6 2l88 88q4 2 6 2t6-2z";
    const ltr$7 = false;
    const accData$3 = ICON_ERROR;
    const collection$7 = "SAP-icons-v4";
    const packageName$7 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$7, { pathData: pathData$7, ltr: ltr$7, accData: accData$3, collection: collection$7, packageName: packageName$7 });

    const name$6 = "error";
    const pathData$6 = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm45 256l74-73q9-11 9-23 0-13-9.5-22.5T352 128q-12 0-23 9l-73 74-73-74q-10-9-23-9t-22.5 9.5T128 160q0 12 9 23l74 73-74 73q-9 10-9 23t9.5 22.5T160 384t23-9l73-74 73 74q11 9 23 9 13 0 22.5-9.5T384 352t-9-23z";
    const ltr$6 = false;
    const accData$2 = ICON_ERROR;
    const collection$6 = "SAP-icons-v5";
    const packageName$6 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$6, { pathData: pathData$6, ltr: ltr$6, accData: accData$2, collection: collection$6, packageName: packageName$6 });

    const name$5 = "alert";
    const pathData$5 = "M501 374q5 10 7.5 19.5T512 412v5q0 31-23 47t-50 16H74q-13 0-26-4t-23.5-12-17-20T0 417q0-13 4-22.5t9-20.5L198 38q21-38 61-38 38 0 59 38zM257 127q-13 0-23.5 8T223 161q1 7 2 12 3 25 4.5 48t3.5 61q0 11 7.5 16t16.5 5q22 0 23-21l2-36 9-85q0-18-10.5-26t-23.5-8zm0 299q20 0 31.5-12t11.5-32q0-19-11.5-31T257 339t-31.5 12-11.5 31q0 20 11.5 32t31.5 12z";
    const ltr$5 = false;
    const collection$5 = "SAP-icons-v4";
    const packageName$5 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$5, { pathData: pathData$5, ltr: ltr$5, collection: collection$5, packageName: packageName$5 });

    const name$4 = "alert";
    const pathData$4 = "M505 399q7 13 7 27 0 21-15.5 37.5T456 480H56q-25 0-40.5-16.5T0 426q0-14 7-27L208 59q17-27 48-27 14 0 27 6.5T304 59zM288 176q0-14-9-23t-23-9-23 9-9 23v96q0 14 9 23t23 9 23-9 9-23v-96zm-32 240q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9z";
    const ltr$4 = false;
    const collection$4 = "SAP-icons-v5";
    const packageName$4 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$4, { pathData: pathData$4, ltr: ltr$4, collection: collection$4, packageName: packageName$4 });

    const name$3 = "information";
    const pathData$3 = "M0 256q0-53 20.5-100t55-81.5T157 20t99-20q54 0 100.5 20t81 55 54.5 81.5 20 99.5q0 54-20 100.5t-54.5 81T356 492t-100 20q-54 0-100.5-20t-81-55T20 355.5 0 256zm192 112v33h128v-33h-32V215q0-6-7-6h-88v31h32v128h-33zm34-201q14 11 30 11 17 0 29.5-11.5T298 138q0-19-13-31-12-12-29-12-19 0-30.5 12.5T214 138q0 17 12 29z";
    const ltr$3 = false;
    const collection$3 = "SAP-icons-v4";
    const packageName$3 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$3, { pathData: pathData$3, ltr: ltr$3, collection: collection$3, packageName: packageName$3 });

    const name$2 = "information";
    const pathData$2 = "M256 0q53 0 99.5 20T437 75t55 81.5 20 99.5-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-99.5T75 75t81.5-55T256 0zm0 160q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9zm32 64q0-14-9-23t-23-9-23 9-9 23v160q0 14 9 23t23 9 23-9 9-23V224z";
    const ltr$2 = false;
    const collection$2 = "SAP-icons-v5";
    const packageName$2 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$2, { pathData: pathData$2, ltr: ltr$2, collection: collection$2, packageName: packageName$2 });

    const b=new WeakMap,o=new WeakMap,v={attributes:true,childList:true,characterData:true,subtree:true},A=e=>{const t=e;return t.accessibleNameRef?E(e):t.accessibleName?t.accessibleName:void 0},E=e=>{const t=e.accessibleNameRef?.split(" ")??[];let s="";return t.forEach((n,c)=>{const l=m(e,n),a=`${l&&l.textContent?l.textContent:""}`;a&&(s+=a,c<t.length-1&&(s+=" "));}),s},f=e=>{const t=new Set;u(e).forEach(r=>{t.add(r);});const n=e.accessibleNameRef,c=e.accessibleDescriptionRef,l=[n,c].filter(Boolean).join(" ");return (l?l.split(" "):[]).forEach(r=>{const i=m(e,r);i&&t.add(i);}),Array.from(t)},u=e=>{const t=e.getRootNode().querySelectorAll(`[for="${e.id}"]`);return Array.from(t)},m=(e,t)=>e.getRootNode().querySelector(`[id='${t}']`)||document.getElementById(t),M=e=>{const t=[];if(u(e).forEach(n=>{const c=n.textContent;c&&t.push(c);}),t.length)return t.join(" ")},k=e=>s=>{const n=s&&s.type==="property"&&s.name==="accessibleNameRef",c=s&&s.type==="property"&&s.name==="accessibleDescriptionRef";if(!n&&!c)return;const l=o.get(e);if(!l)return;const a=l.observedElements,r=f(e);a.forEach(i=>{r.includes(i)||d(l,i);}),r.forEach(i=>{a.includes(i)||(g(l,i),l.observedElements.push(i));}),l?.callback();},y=(e,t)=>{if(o.has(e))return;const s=f(e),n=k(e),c={host:e,observedElements:s,callback:t,invalidationCallback:n};o.set(e,c),e.attachInvalidate(n),s.forEach(l=>{g(c,l);}),t();},g=(e,t)=>{let s=b.get(t);if(!s){s={observer:null,callbacks:[]};const n=new MutationObserver(()=>{s.callbacks.forEach(a=>{a();});const l=document.getElementById(t.id);e.host.id===t.getAttribute("for")||l||d(e,t);});s.observer=n,n.observe(t,v),b.set(t,s);}s.callbacks.includes(e.callback)||s.callbacks.push(e.callback);},d=(e,t)=>{const s=b.get(t);s&&(s.callbacks=s.callbacks.filter(n=>n!==e.callback),s.callbacks.length||(s.observer?.disconnect(),b.delete(t))),e.observedElements=e.observedElements.filter(n=>n!==t);},T=e=>{const t=o.get(e);if(!t)return;[...t.observedElements].forEach(n=>{d(t,n);}),e.detachInvalidate(t.invalidationCallback),o.delete(e);},L=e=>{const t=e;return t.accessibleDescriptionRef?p(e):t.accessibleDescription?t.accessibleDescription:void 0},p=e=>{const t=e.accessibleDescriptionRef?.split(" ")??[];let s="";return t.forEach((n,c)=>{const l=m(e,n),a=`${l&&l.textContent?l.textContent:""}`;a&&(s+=a,c<t.length-1&&(s+=" "));}),s};

    let e;const l=()=>(e===void 0&&(e=webcomponentsBase.b$2()),e);

    /**
     * Different Button designs.
     * @public
     */
    var ButtonDesign;
    (function (ButtonDesign) {
        /**
         * default type (no special styling)
         * @public
         */
        ButtonDesign["Default"] = "Default";
        /**
         * accept type (green button)
         * @public
         */
        ButtonDesign["Positive"] = "Positive";
        /**
         * reject style (red button)
         * @public
         */
        ButtonDesign["Negative"] = "Negative";
        /**
         * transparent type
         * @public
         */
        ButtonDesign["Transparent"] = "Transparent";
        /**
         * emphasized type
         * @public
         */
        ButtonDesign["Emphasized"] = "Emphasized";
        /**
         * attention type
         * @public
         */
        ButtonDesign["Attention"] = "Attention";
    })(ButtonDesign || (ButtonDesign = {}));
    var ButtonDesign$1 = ButtonDesign;

    /**
     * Determines if the button has special form-related functionality.
     * @public
     */
    var ButtonType;
    (function (ButtonType) {
        /**
         * The button does not do anything special when inside a form
         * @public
         */
        ButtonType["Button"] = "Button";
        /**
         * The button acts as a submit button (submits a form)
         * @public
         */
        ButtonType["Submit"] = "Submit";
        /**
         * The button acts as a reset button (resets a form)
         * @public
         */
        ButtonType["Reset"] = "Reset";
    })(ButtonType || (ButtonType = {}));
    var ButtonType$1 = ButtonType;

    /**
     * Determines where the badge will be placed and how it will be styled.
     * @since 2.7.0
     * @public
     */
    var ButtonBadgeDesign;
    (function (ButtonBadgeDesign) {
        /**
         * The badge is displayed after the text, inside the button.
         * @public
         */
        ButtonBadgeDesign["InlineText"] = "InlineText";
        /**
         * The badge is displayed at the top-end corner of the button.
         *
         * **Note:** According to design guidance, the OverlayText design mode is best used in cozy density to avoid potential visual issues in compact.
         * @public
         */
        ButtonBadgeDesign["OverlayText"] = "OverlayText";
        /**
         * The badge is displayed as an attention dot.
         * @public
         */
        ButtonBadgeDesign["AttentionDot"] = "AttentionDot";
    })(ButtonBadgeDesign || (ButtonBadgeDesign = {}));
    var ButtonBadgeDesign$1 = ButtonBadgeDesign;

    /**
     * Different BusyIndicator text placements.
     *
     * @public
     */
    var BusyIndicatorTextPlacement;
    (function (BusyIndicatorTextPlacement) {
        /**
         * The text will be displayed on top of the busy indicator.
         * @public
         */
        BusyIndicatorTextPlacement["Top"] = "Top";
        /**
         * The text will be displayed at the bottom of the busy indicator.
         * @public
         */
        BusyIndicatorTextPlacement["Bottom"] = "Bottom";
    })(BusyIndicatorTextPlacement || (BusyIndicatorTextPlacement = {}));
    var BusyIndicatorTextPlacement$1 = BusyIndicatorTextPlacement;

    function LabelTemplate() {
        return (parametersBundle_css.jsxs("label", { class: "ui5-label-root", onClick: this._onclick, children: [parametersBundle_css.jsx("span", { class: "ui5-label-text-wrapper", children: parametersBundle_css.jsx("slot", {}) }), parametersBundle_css.jsx("span", { "aria-hidden": "true", class: "ui5-label-required-colon", "data-ui5-colon": this._colonSymbol })] }));
    }

    webcomponentsBase.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    webcomponentsBase.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme$1);
    var labelCss = `:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapContent_LabelColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;cursor:text}.ui5-label-root{width:100%;cursor:inherit}:host{white-space:normal}:host([wrapping-type="None"]){white-space:nowrap}:host([wrapping-type="None"]) .ui5-label-root{display:inline-flex}:host([wrapping-type="None"]) .ui5-label-text-wrapper{text-overflow:ellipsis;overflow:hidden;display:inline-block;vertical-align:top;flex:0 1 auto;min-width:0}:host([show-colon]) .ui5-label-required-colon:before{content:attr(data-ui5-colon)}:host([required]) .ui5-label-required-colon:after{content:"*";color:var(--sapField_RequiredColor);font-size:var(--sapFontLargeSize);font-weight:700;position:relative;font-style:normal;vertical-align:middle;line-height:0}.ui5-label-text-wrapper{padding-inline-end:.075rem}:host([required][show-colon]) .ui5-label-required-colon:after{margin-inline-start:.125rem}:host([show-colon]) .ui5-label-required-colon{margin-inline-start:-.05rem;white-space:pre}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Label_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-label` is a component used to represent a label for elements like input, textarea, select.
     * The `for` property of the `ui5-label` must be the same as the id attribute of the related input element.
     * Screen readers read out the label, when the user focuses the labelled control.
     *
     * The `ui5-label` appearance can be influenced by properties,
     * such as `required` and `wrappingType`.
     * The appearance of the Label can be configured in a limited way by using the design property.
     * For a broader choice of designs, you can use custom styles.
     *
     * ### ES6 Module Import
     *
     * `import "sap/esh/search/ui/gen/ui5/webcomponents/dist/Label";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Defines the text of the component.
     *
     * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     */
    let Label = Label_1 = class Label extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines whether colon is added to the component text.
             *
             * **Note:** Usually used in forms.
             * @default false
             * @public
             */
            this.showColon = false;
            /**
             * Defines whether an asterisk character is added to the component text.
             *
             * **Note:** Usually indicates that user input (bound with the `for` property) is required.
             * In that case the `required` property of
             * the corresponding input should also be set.
             * @default false
             * @public
             */
            this.required = false;
            /**
             * Defines how the text of a component will be displayed when there is not enough space.
             *
             * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
             * @default "Normal"
             * @public
             */
            this.wrappingType = "Normal";
        }
        _onclick() {
            if (!this.for) {
                return;
            }
            const elementToFocus = this.getRootNode().querySelector(`[id="${this.for}"]`);
            if (elementToFocus) {
                elementToFocus.focus();
            }
        }
        get _colonSymbol() {
            return Label_1.i18nBundle.getText(toLowercaseEnumValue.LABEL_COLON);
        }
    };
    __decorate$2([
        webcomponentsBase.s()
    ], Label.prototype, "for", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Label.prototype, "showColon", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Label.prototype, "required", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Label.prototype, "wrappingType", void 0);
    __decorate$2([
        parametersBundle_css.i("sap/esh/search/ui/gen/ui5/webcomponents")
    ], Label, "i18nBundle", void 0);
    Label = Label_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-label",
            renderer: parametersBundle_css.y,
            template: LabelTemplate,
            styles: labelCss,
            languageAware: true,
        })
    ], Label);
    Label.define();
    var Label$1 = Label;

    function BusyIndicatorTemplate() {
        return (parametersBundle_css.jsxs("div", { class: "ui5-busy-indicator-root", children: [this._isBusy && (parametersBundle_css.jsxs("div", { class: {
                        "ui5-busy-indicator-busy-area": true,
                        "ui5-busy-indicator-busy-area-over-content": this.hasContent,
                    }, title: this.ariaTitle, tabindex: 0, role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuetext": "Busy", "aria-labelledby": this.labelId, "data-sap-focus-ref": true, children: [this.textPosition.top && BusyIndicatorBusyText.call(this), parametersBundle_css.jsxs("div", { class: "ui5-busy-indicator-circles-wrapper", children: [parametersBundle_css.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-0" }), parametersBundle_css.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-1" }), parametersBundle_css.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-2" })] }), this.textPosition.bottom && BusyIndicatorBusyText.call(this)] })), parametersBundle_css.jsx("slot", {}), this._isBusy && (parametersBundle_css.jsx("span", { "data-ui5-focus-redirect": true, tabindex: 0, role: "none", onFocusIn: this._redirectFocus }))] }));
    }
    function BusyIndicatorBusyText() {
        return (parametersBundle_css.jsx(parametersBundle_css.Fragment, { children: this.text && (parametersBundle_css.jsx(Label$1, { id: `${this._id}-label`, class: "ui5-busy-indicator-text", children: this.text })) }));
    }

    webcomponentsBase.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    webcomponentsBase.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme$1);
    var busyIndicatorCss = `:host(:not([hidden])){display:inline-block}:host([_is-busy]){color:var(--_ui5-v2-14-0-rc-7_busy_indicator_color)}:host([size="S"]) .ui5-busy-indicator-root{min-width:1.625rem;min-height:.5rem}:host([size="S"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:1.75rem}:host([size="S"]) .ui5-busy-indicator-circle{width:.5rem;height:.5rem}:host([size="S"]) .ui5-busy-indicator-circle:first-child,:host([size="S"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.0625rem}:host(:not([size])) .ui5-busy-indicator-root,:host([size="M"]) .ui5-busy-indicator-root{min-width:3.375rem;min-height:1rem}:host([size="M"]) .ui5-busy-indicator-circle:first-child,:host([size="M"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.1875rem}:host(:not([size])[text]:not([text=""])) .ui5-busy-indicator-root,:host([size="M"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:2.25rem}:host(:not([size])) .ui5-busy-indicator-circle,:host([size="M"]) .ui5-busy-indicator-circle{width:1rem;height:1rem}:host([size="L"]) .ui5-busy-indicator-root{min-width:6.5rem;min-height:2rem}:host([size="L"]) .ui5-busy-indicator-circle:first-child,:host([size="L"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.25rem}:host([size="L"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:3.25rem}:host([size="L"]) .ui5-busy-indicator-circle{width:2rem;height:2rem}.ui5-busy-indicator-root{display:flex;justify-content:center;align-items:center;position:relative;background-color:inherit;height:inherit;border-radius:inherit}.ui5-busy-indicator-busy-area.ui5-busy-indicator-busy-area-over-content{position:absolute;inset:0;z-index:99}.ui5-busy-indicator-busy-area{display:flex;justify-content:center;align-items:center;background-color:inherit;flex-direction:column;border-radius:inherit}:host([active]) ::slotted(*){opacity:var(--sapContent_DisabledOpacity)}:host([desktop]) .ui5-busy-indicator-busy-area:focus,.ui5-busy-indicator-busy-area:focus-visible{outline:var(--_ui5-v2-14-0-rc-7_busy_indicator_focus_outline);outline-offset:-2px}.ui5-busy-indicator-circles-wrapper{line-height:0}.ui5-busy-indicator-circle{display:inline-block;background-color:currentColor;border-radius:50%}.ui5-busy-indicator-circle:before{content:"";width:100%;height:100%;border-radius:100%}.circle-animation-0{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11)}.circle-animation-1{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.2s}.circle-animation-2{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.4s}.ui5-busy-indicator-text{width:100%;text-align:center}:host([text-placement="Top"]) .ui5-busy-indicator-text{margin-bottom:.5rem}:host(:not([text-placement])) .ui5-busy-indicator-text,:host([text-placement="Bottom"]) .ui5-busy-indicator-text{margin-top:.5rem}@keyframes grow{0%,50%,to{-webkit-transform:scale(.5);-moz-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var BusyIndicator_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-busy-indicator` signals that some operation is going on and that the
     * user must wait. It does not block the current UI screen so other operations could be triggered in parallel.
     * It displays 3 dots and each dot expands and shrinks at a different rate, resulting in a cascading flow of animation.
     *
     * ### Usage
     * For the `ui5-busy-indicator` you can define the size, the text and whether it is shown or hidden.
     * In order to hide it, use the "active" property.
     *
     * In order to show busy state over an HTML element, simply nest the HTML element in a `ui5-busy-indicator` instance.
     *
     * **Note:** Since `ui5-busy-indicator` has `display: inline-block;` by default and no width of its own,
     * whenever you need to wrap a block-level element, you should set `display: block` to the busy indicator as well.
     *
     * #### When to use:
     *
     * - The user needs to be able to cancel the operation.
     * - Only part of the application or a particular component is affected.
     *
     * #### When not to use:
     *
     * - The operation takes less than one second.
     * - You need to block the screen and prevent the user from starting another activity.
     * - Do not show multiple busy indicators at once.
     *
     * ### ES6 Module Import
     *
     * `import "sap/esh/search/ui/gen/ui5/webcomponents/dist/BusyIndicator.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Determines the content over which the component will appear.
     * @since 0.12.0
     */
    let BusyIndicator = BusyIndicator_1 = class BusyIndicator extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines the size of the component.
             * @default "M"
             * @public
             */
            this.size = "M";
            /**
             * Defines if the busy indicator is visible on the screen. By default it is not.
             * @default false
             * @public
             */
            this.active = false;
            /**
             * Defines the delay in milliseconds, after which the busy indicator will be visible on the screen.
             * @default 1000
             * @public
             */
            this.delay = 1000;
            /**
             * Defines the placement of the text.
             *
             * @default "Bottom"
             * @public
             */
            this.textPlacement = "Bottom";
            /**
             * Defines if the component is currently in busy state.
             * @private
             */
            this._isBusy = false;
            this._keydownHandler = this._handleKeydown.bind(this);
            this._preventEventHandler = this._preventEvent.bind(this);
        }
        onEnterDOM() {
            this.addEventListener("keydown", this._keydownHandler, {
                capture: true,
            });
            this.addEventListener("keyup", this._preventEventHandler, {
                capture: true,
            });
            if (webcomponentsBase.f()) {
                this.setAttribute("desktop", "");
            }
        }
        onExitDOM() {
            if (this._busyTimeoutId) {
                clearTimeout(this._busyTimeoutId);
                delete this._busyTimeoutId;
            }
            this.removeEventListener("keydown", this._keydownHandler, true);
            this.removeEventListener("keyup", this._preventEventHandler, true);
        }
        get ariaTitle() {
            return BusyIndicator_1.i18nBundle.getText(toLowercaseEnumValue.BUSY_INDICATOR_TITLE);
        }
        get labelId() {
            return this.text ? `${this._id}-label` : undefined;
        }
        get textPosition() {
            return {
                top: this.text && this.textPlacement === BusyIndicatorTextPlacement$1.Top,
                bottom: this.text && this.textPlacement === BusyIndicatorTextPlacement$1.Bottom,
            };
        }
        get hasContent() {
            return t(Array.from(this.children));
        }
        onBeforeRendering() {
            if (this.active) {
                if (!this._isBusy && !this._busyTimeoutId) {
                    this._busyTimeoutId = setTimeout(() => {
                        delete this._busyTimeoutId;
                        this._isBusy = true;
                    }, Math.max(0, this.delay));
                }
            }
            else {
                if (this._busyTimeoutId) {
                    clearTimeout(this._busyTimeoutId);
                    delete this._busyTimeoutId;
                }
                this._isBusy = false;
            }
        }
        _handleKeydown(e) {
            if (!this._isBusy) {
                return;
            }
            e.stopImmediatePropagation();
            // move the focus to the last element in this DOM and let TAB continue to the next focusable element
            if (webcomponentsBase.x(e)) {
                this.focusForward = true;
                this.shadowRoot.querySelector("[data-ui5-focus-redirect]").focus();
                this.focusForward = false;
            }
        }
        _preventEvent(e) {
            if (this._isBusy) {
                e.stopImmediatePropagation();
            }
        }
        /**
         * Moves the focus to busy area when coming with SHIFT + TAB
         */
        _redirectFocus(e) {
            if (this.focusForward) {
                return;
            }
            e.preventDefault();
            this.shadowRoot.querySelector(".ui5-busy-indicator-busy-area").focus();
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "text", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "size", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], BusyIndicator.prototype, "active", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number })
    ], BusyIndicator.prototype, "delay", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "textPlacement", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], BusyIndicator.prototype, "_isBusy", void 0);
    __decorate$1([
        parametersBundle_css.i("sap/esh/search/ui/gen/ui5/webcomponents")
    ], BusyIndicator, "i18nBundle", void 0);
    BusyIndicator = BusyIndicator_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-busy-indicator",
            languageAware: true,
            styles: busyIndicatorCss,
            renderer: parametersBundle_css.y,
            template: BusyIndicatorTemplate,
        })
    ], BusyIndicator);
    BusyIndicator.define();
    var BusyIndicator$1 = BusyIndicator;

    /**
     * Different BusyIndicator sizes.
     * @public
     */
    var BusyIndicatorSize;
    (function (BusyIndicatorSize) {
        /**
         * small size
         * @public
         */
        BusyIndicatorSize["S"] = "S";
        /**
         * medium size
         * @public
         */
        BusyIndicatorSize["M"] = "M";
        /**
         * large size
         * @public
         */
        BusyIndicatorSize["L"] = "L";
    })(BusyIndicatorSize || (BusyIndicatorSize = {}));
    var BusyIndicatorSize$1 = BusyIndicatorSize;

    function ButtonTemplate(injectedProps) {
        return (parametersBundle_css.jsxs(parametersBundle_css.Fragment, { children: [parametersBundle_css.jsxs("button", { type: "button", class: {
                        "ui5-button-root": true,
                        "ui5-button-badge-placement-end": this.badge[0]?.design === "InlineText",
                        "ui5-button-badge-placement-end-top": this.badge[0]?.design === "OverlayText",
                        "ui5-button-badge-dot": this.badge[0]?.design === "AttentionDot"
                    }, disabled: this.disabled, "data-sap-focus-ref": true, "aria-pressed": injectedProps?.ariaPressed, "aria-valuemin": injectedProps?.ariaValueMin, "aria-valuemax": injectedProps?.ariaValueMax, "aria-valuenow": injectedProps?.ariaValueNow, "aria-valuetext": injectedProps?.ariaValueText, onFocusOut: this._onfocusout, onClick: this._onclick, onMouseDown: this._onmousedown, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onTouchStart: this._ontouchstart, onTouchEnd: this._ontouchend, tabindex: this.tabIndexValue, "aria-expanded": this.accessibilityAttributes.expanded, "aria-controls": this.accessibilityAttributes.controls, "aria-haspopup": this._hasPopup, "aria-label": this.ariaLabelText, "aria-description": this.ariaDescriptionText, "aria-busy": this.loading ? "true" : undefined, title: this.buttonTitle, part: "button", role: this.effectiveAccRole, children: [this.icon &&
                            parametersBundle_css.jsx(Icon$1, { class: "ui5-button-icon", name: this.icon, mode: "Decorative", part: "icon" }), parametersBundle_css.jsx("span", { id: `${this._id}-content`, class: "ui5-button-text", children: parametersBundle_css.jsx("bdi", { children: parametersBundle_css.jsx("slot", {}) }) }), this.endIcon &&
                            parametersBundle_css.jsx(Icon$1, { class: "ui5-button-end-icon", name: this.endIcon, mode: "Decorative", part: "endIcon" }), this.shouldRenderBadge &&
                            parametersBundle_css.jsx("slot", { name: "badge" })] }), this.loading &&
                    parametersBundle_css.jsx(BusyIndicator$1, { id: `${this._id}-button-busy-indicator`, class: "ui5-button-busy-indicator", size: this.iconOnly ? BusyIndicatorSize$1.S : BusyIndicatorSize$1.M, active: true, delay: this.loadingDelay, inert: this.loading })] }));
    }

    webcomponentsBase.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
    webcomponentsBase.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css.defaultTheme$1);
    var buttonCss = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5-v2-14-0-rc-7_button_base_min_width);height:var(--_ui5-v2-14-0-rc-7_button_base_height);line-height:normal;font-family:var(--_ui5-v2-14-0-rc-7_button_fontFamily);font-size:var(--sapFontSize);text-shadow:var(--_ui5-v2-14-0-rc-7_button_text_shadow);border-radius:var(--_ui5-v2-14-0-rc-7_button_border_radius);cursor:pointer;background-color:var(--sapButton_Background);border:var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);color:var(--sapButton_TextColor);box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;-webkit-tap-highlight-color:transparent}.ui5-button-root{min-width:inherit;cursor:inherit;height:100%;width:100%;box-sizing:border-box;display:flex;justify-content:center;align-items:center;outline:none;padding:0 var(--_ui5-v2-14-0-rc-7_button_base_padding);position:relative;background:transparent;border:none;color:inherit;text-shadow:inherit;font:inherit;white-space:inherit;overflow:inherit;text-overflow:inherit;letter-spacing:inherit;word-spacing:inherit;line-height:inherit;-webkit-user-select:none;-moz-user-select:none;user-select:none}:host(:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host(:not([hidden]):not([disabled]).ui5_hovered){background:var(--sapButton_Hover_Background);border:1px solid var(--sapButton_Hover_BorderColor);color:var(--sapButton_Hover_TextColor)}.ui5-button-icon,.ui5-button-end-icon{color:inherit;flex-shrink:0}.ui5-button-end-icon{margin-inline-start:var(--_ui5-v2-14-0-rc-7_button_base_icon_margin)}:host([icon-only]:not([has-end-icon])) .ui5-button-root{min-width:auto;padding:0}:host([icon-only]) .ui5-button-text{display:none}.ui5-button-text{outline:none;position:relative;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([has-icon]:not(:empty)) .ui5-button-text{margin-inline-start:var(--_ui5-v2-14-0-rc-7_button_base_icon_margin)}:host([has-end-icon]:not([has-icon]):empty) .ui5-button-end-icon{margin-inline-start:0}:host([disabled]){opacity:var(--sapContent_DisabledOpacity);pointer-events:unset;cursor:default}:host([has-icon]:not([icon-only]):not([has-end-icon])) .ui5-button-text{min-width:calc(var(--_ui5-v2-14-0-rc-7_button_base_min_width) - var(--_ui5-v2-14-0-rc-7_button_base_icon_margin) - 1rem)}:host([disabled]:active){pointer-events:none}:host([desktop]:not([loading])) .ui5-button-root:focus-within:after,:host(:not([active])) .ui5-button-root:focus-visible:after,:host([desktop][active][design="Emphasized"]) .ui5-button-root:focus-within:after,:host([active][design="Emphasized"]) .ui5-button-root:focus-visible:after,:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-14-0-rc-7_button_focused_border);border-radius:var(--_ui5-v2-14-0-rc-7_button_focused_border_radius)}:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{border-color:var(--_ui5-v2-14-0-rc-7_button_pressed_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-14-0-rc-7_button_emphasized_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:before,:host([design="Emphasized"]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-14-0-rc-7_button_emphasized_focused_border_before);border-radius:var(--_ui5-v2-14-0-rc-7_button_focused_border_radius)}.ui5-button-root::-moz-focus-inner{border:0}bdi{display:block;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([ui5-button][active]:not([disabled]):not([non-interactive])){background-image:none;background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([design="Positive"]){background-color:var(--sapButton_Accept_Background);border-color:var(--sapButton_Accept_BorderColor);color:var(--sapButton_Accept_TextColor)}:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Accept_Hover_Background);border-color:var(--sapButton_Accept_Hover_BorderColor);color:var(--sapButton_Accept_Hover_TextColor)}:host([ui5-button][design="Positive"][active]:not([non-interactive])){background-color:var(--sapButton_Accept_Active_Background);border-color:var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Accept_Active_TextColor)}:host([design="Negative"]){background-color:var(--sapButton_Reject_Background);border-color:var(--sapButton_Reject_BorderColor);color:var(--sapButton_Reject_TextColor)}:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Reject_Hover_Background);border-color:var(--sapButton_Reject_Hover_BorderColor);color:var(--sapButton_Reject_Hover_TextColor)}:host([ui5-button][design="Negative"][active]:not([non-interactive])){background-color:var(--sapButton_Reject_Active_Background);border-color:var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Reject_Active_TextColor)}:host([design="Attention"]){background-color:var(--sapButton_Attention_Background);border-color:var(--sapButton_Attention_BorderColor);color:var(--sapButton_Attention_TextColor)}:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Attention_Hover_Background);border-color:var(--sapButton_Attention_Hover_BorderColor);color:var(--sapButton_Attention_Hover_TextColor)}:host([ui5-button][design="Attention"][active]:not([non-interactive])){background-color:var(--sapButton_Attention_Active_Background);border-color:var(--sapButton_Attention_Active_BorderColor);color:var(--sapButton_Attention_Active_TextColor)}:host([design="Emphasized"]){background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);border-width:var(--_ui5-v2-14-0-rc-7_button_emphasized_border_width);color:var(--sapButton_Emphasized_TextColor);font-family:var(--sapButton_Emphasized_FontFamily)}:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Emphasized_Hover_Background);border-color:var(--sapButton_Emphasized_Hover_BorderColor);border-width:var(--_ui5-v2-14-0-rc-7_button_emphasized_border_width);color:var(--sapButton_Emphasized_Hover_TextColor)}:host([ui5-button][design="Empasized"][active]:not([non-interactive])){background-color:var(--sapButton_Emphasized_Active_Background);border-color:var(--sapButton_Emphasized_Active_BorderColor);color:var(--sapButton_Emphasized_Active_TextColor)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-14-0-rc-7_button_emphasized_focused_border_color);outline:none}:host([design="Emphasized"][desktop][active]:not([non-interactive])) .ui5-button-root:focus-within:after,:host([design="Emphasized"][active]:not([non-interactive])) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-14-0-rc-7_button_emphasized_focused_active_border_color)}:host([design="Transparent"]){background-color:var(--sapButton_Lite_Background);color:var(--sapButton_Lite_TextColor);border-color:var(--sapButton_Lite_BorderColor)}:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Lite_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapButton_Lite_Hover_TextColor)}:host([ui5-button][design="Transparent"][active]:not([non-interactive])){background-color:var(--sapButton_Lite_Active_Background);border-color:var(--sapButton_Lite_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([ui5-segmented-button-item][active][desktop]) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item][active]) .ui5-button-root:focus-visible:after,:host([pressed][desktop]) .ui5-button-root:focus-within:after,:host([pressed]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-14-0-rc-7_button_pressed_focused_border_color);outline:none}:host([ui5-segmented-button-item][desktop]:not(:last-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:last-child)) .ui5-button-root:focus-visible:after{border-top-right-radius:var(--_ui5-v2-14-0-rc-7_button_focused_inner_border_radius);border-bottom-right-radius:var(--_ui5-v2-14-0-rc-7_button_focused_inner_border_radius)}:host([ui5-segmented-button-item][desktop]:not(:first-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:first-child)) .ui5-button-root:focus-visible:after{border-top-left-radius:var(--_ui5-v2-14-0-rc-7_button_focused_inner_border_radius);border-bottom-left-radius:var(--_ui5-v2-14-0-rc-7_button_focused_inner_border_radius)}::slotted([slot="badge"][design="InlineText"]){pointer-events:initial;font-family:var(--sapButton_FontFamily);font-size:var(--sapFontSmallSize);padding-inline-start:.25rem;--_ui5-v2-14-0-rc-7-tag-height: .625rem}::slotted([slot="badge"][design="OverlayText"]){pointer-events:initial;position:absolute;top:0;inset-inline-end:0;margin:-.5rem;z-index:1;font-family:var(--sapButton_FontFamily);font-size:var(--sapFontSmallSize);--_ui5-v2-14-0-rc-7-tag-height: .625rem}::slotted([slot="badge"][design="AttentionDot"]){pointer-events:initial;content:"";position:absolute;top:0;inset-inline-end:0;margin:-.25rem;z-index:1}:host(:state(has-overlay-badge)){overflow:visible;margin-inline-end:.3125rem}:host([loading]){position:relative;pointer-events:unset}:host([loading]) .ui5-button-root{opacity:var(--sapContent_DisabledOpacity)}:host([loading][design="Emphasized"]){background-color:inherit;border:inherit}:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:inherit;border:inherit}:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover) .ui5-button-root,:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered) .ui5-button-root{background-color:var(--sapButton_Emphasized_Hover_Background)}:host([loading][design="Emphasized"]) .ui5-button-root{background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor)}.ui5-button-busy-indicator{position:absolute;height:100%;width:100%;top:0}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Button_1;
    let isGlobalHandlerAttached = false;
    let activeButton = null;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-button` component represents a simple push button.
     * It enables users to trigger actions by clicking or tapping the `ui5-button`, or by pressing
     * certain keyboard keys, such as Enter.
     *
     * ### Usage
     *
     * For the `ui5-button` UI, you can define text, icon, or both. You can also specify
     * whether the text or the icon is displayed first.
     *
     * You can choose from a set of predefined types that offer different
     * styling to correspond to the triggered action.
     *
     * You can set the `ui5-button` as enabled or disabled. An enabled
     * `ui5-button` can be pressed by clicking or tapping it. The button changes
     * its style to provide visual feedback to the user that it is pressed or hovered over with
     * the mouse cursor. A disabled `ui5-button` appears inactive and cannot be pressed.
     *
     * ### ES6 Module Import
     *
     * `import "sap/esh/search/ui/gen/ui5/webcomponents/dist/Button.js";`
     * @csspart button - Used to style the native button element
     * @csspart icon - Used to style the icon in the native button element
     * @csspart endIcon - Used to style the end icon in the native button element
     * @constructor
     * @extends UI5Element
     * @implements { IButton }
     * @public
     */
    let Button = Button_1 = class Button extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines the component design.
             * @default "Default"
             * @public
             */
            this.design = "Default";
            /**
             * Defines whether the component is disabled.
             * A disabled component can't be pressed or
             * focused, and it is not in the tab chain.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * When set to `true`, the component will
             * automatically submit the nearest HTML form element on `press`.
             *
             * **Note:** This property is only applicable within the context of an HTML Form element.`
             * @default false
             * @public
             * @deprecated Set the "type" property to "Submit" to achieve the same result. The "submits" property is ignored if "type" is set to any value other than "Button".
             */
            this.submits = false;
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following fields are supported:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
             * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
             *
             * - **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.
             * Accepts a lowercase string value.
             *
             * @public
             * @since 1.2.0
             * @default {}
             */
            this.accessibilityAttributes = {};
            /**
             * Defines whether the button has special form-related functionality.
             *
             * **Note:** This property is only applicable within the context of an HTML Form element.
             * @default "Button"
             * @public
             * @since 1.15.0
             */
            this.type = "Button";
            /**
             * Describes the accessibility role of the button.
             *
             * **Note:** Use <code>ButtonAccessibleRole.Link</code> role only with a press handler, which performs a navigation. In all other scenarios the default button semantics are recommended.
             *
             * @default "Button"
             * @public
             * @since 1.23
             */
            this.accessibleRole = "Button";
            /**
             * Used to switch the active state (pressed or not) of the component.
             * @private
             */
            this.active = false;
            /**
             * Defines if a content has been added to the default slot
             * @private
             */
            this.iconOnly = false;
            /**
             * Indicates if the elements has a slotted icon
             * @private
             */
            this.hasIcon = false;
            /**
             * Indicates if the elements has a slotted end icon
             * @private
             */
            this.hasEndIcon = false;
            /**
             * Indicates if the element is focusable
             * @private
             */
            this.nonInteractive = false;
            /**
             * Defines whether the button shows a loading indicator.
             *
             * **Note:** If set to `true`, a busy indicator component will be displayed on the related button.
             * @default false
             * @public
             * @since 2.13.0
             */
            this.loading = false;
            /**
             * Specifies the delay in milliseconds before the loading indicator appears within the associated button.
             * @default 1000
             * @public
             * @since 2.13.0
             */
            this.loadingDelay = 1000;
            /**
             * @private
             */
            this._iconSettings = {};
            /**
             * Defines the tabIndex of the component.
             * @private
             */
            this.forcedTabIndex = "0";
            /**
             * @since 1.0.0-rc.13
             * @private
             */
            this._isTouch = false;
            this._cancelAction = false;
            this._clickHandlerAttached = false;
            this._deactivate = () => {
                if (activeButton) {
                    activeButton._setActiveState(false);
                }
            };
            this._onclickBound = e => {
                if (e instanceof CustomEvent) {
                    return;
                }
                this._onclick(e);
            };
            if (!this._clickHandlerAttached) {
                this.addEventListener("click", this._onclickBound);
                this._clickHandlerAttached = true;
            }
            if (!isGlobalHandlerAttached) {
                document.addEventListener("mouseup", this._deactivate);
                isGlobalHandlerAttached = true;
            }
        }
        _ontouchstart() {
            if (this.nonInteractive) {
                return;
            }
            this._setActiveState(true);
        }
        onEnterDOM() {
            if (webcomponentsBase.f()) {
                this.setAttribute("desktop", "");
            }
            if (!this._clickHandlerAttached) {
                this.addEventListener("click", this._onclickBound);
                this._clickHandlerAttached = true;
            }
        }
        onExitDOM() {
            if (this._clickHandlerAttached) {
                this.removeEventListener("click", this._onclickBound);
                this._clickHandlerAttached = false;
            }
        }
        async onBeforeRendering() {
            this._setBadgeOverlayStyle();
            this.hasIcon = !!this.icon;
            this.hasEndIcon = !!this.endIcon;
            this.iconOnly = this.isIconOnly;
            const defaultTooltip = await this.getDefaultTooltip();
            this.buttonTitle = this.iconOnly ? this.tooltip ?? defaultTooltip : this.tooltip;
        }
        _setBadgeOverlayStyle() {
            const needsOverflowVisible = this.badge.length && (this.badge[0].design === ButtonBadgeDesign$1.AttentionDot || this.badge[0].design === ButtonBadgeDesign$1.OverlayText);
            if (needsOverflowVisible) {
                this._internals.states.add("has-overlay-badge");
            }
            else {
                this._internals.states.delete("has-overlay-badge");
            }
        }
        _onclick(e) {
            e.stopImmediatePropagation();
            if (this.nonInteractive) {
                return;
            }
            if (this.loading) {
                e.preventDefault();
                return;
            }
            const { altKey, ctrlKey, metaKey, shiftKey, } = e;
            const prevented = !this.fireDecoratorEvent("click", {
                originalEvent: e,
                altKey,
                ctrlKey,
                metaKey,
                shiftKey,
            });
            if (prevented) {
                e.preventDefault();
                return;
            }
            if (this._isSubmit) {
                webcomponentsBase.i$1(this);
            }
            if (this._isReset) {
                webcomponentsBase.m$1(this);
            }
            if (webcomponentsBase.h()) {
                this.getDomRef()?.focus();
            }
        }
        _onmousedown() {
            if (this.nonInteractive) {
                return;
            }
            this._setActiveState(true);
            activeButton = this; // eslint-disable-line
        }
        _ontouchend(e) {
            if (this.disabled || this.loading) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (this.active) {
                this._setActiveState(false);
            }
            if (activeButton) {
                activeButton._setActiveState(false);
            }
        }
        _onkeydown(e) {
            this._cancelAction = webcomponentsBase.Ko(e) || webcomponentsBase.m$2(e);
            if (webcomponentsBase.A(e) || webcomponentsBase.b$1(e)) {
                this._setActiveState(true);
            }
            else if (this._cancelAction) {
                this._setActiveState(false);
            }
        }
        _onkeyup(e) {
            if (this._cancelAction) {
                e.preventDefault();
            }
            if (webcomponentsBase.A(e) || webcomponentsBase.b$1(e)) {
                if (this.active) {
                    this._setActiveState(false);
                }
            }
        }
        _onfocusout() {
            if (this.nonInteractive) {
                return;
            }
            if (this.active) {
                this._setActiveState(false);
            }
        }
        _setActiveState(active) {
            const eventPrevented = !this.fireDecoratorEvent("active-state-change");
            if (eventPrevented || this.loading) {
                return;
            }
            this.active = active;
        }
        get _hasPopup() {
            return this.accessibilityAttributes.hasPopup;
        }
        get hasButtonType() {
            return this.design !== ButtonDesign$1.Default && this.design !== ButtonDesign$1.Transparent;
        }
        get isIconOnly() {
            return !t(this.text);
        }
        static typeTextMappings() {
            return {
                "Positive": toLowercaseEnumValue.BUTTON_ARIA_TYPE_ACCEPT,
                "Negative": toLowercaseEnumValue.BUTTON_ARIA_TYPE_REJECT,
                "Emphasized": toLowercaseEnumValue.BUTTON_ARIA_TYPE_EMPHASIZED,
                "Attention": toLowercaseEnumValue.BUTTON_ARIA_TYPE_ATTENTION,
            };
        }
        getDefaultTooltip() {
            if (!l()) {
                return;
            }
            return webcomponentsBase.A$1(this.icon);
        }
        get buttonTypeText() {
            return Button_1.i18nBundle.getText(Button_1.typeTextMappings()[this.design]);
        }
        get effectiveAccRole() {
            return toLowercaseEnumValue.n(this.accessibleRole);
        }
        get tabIndexValue() {
            if (this.disabled) {
                return;
            }
            const tabindex = this.getAttribute("tabindex");
            if (tabindex) {
                return Number.parseInt(tabindex);
            }
            return this.nonInteractive ? -1 : Number.parseInt(this.forcedTabIndex);
        }
        get ariaLabelText() {
            const textContent = this.textContent || "";
            const ariaLabelText = A(this) || "";
            const typeLabelText = this.hasButtonType ? this.buttonTypeText : "";
            const internalLabelText = this.effectiveBadgeDescriptionText || "";
            const labelParts = [textContent, ariaLabelText, typeLabelText, internalLabelText].filter(part => part);
            return labelParts.join(" ");
        }
        get ariaDescriptionText() {
            return this.accessibleDescription === "" ? undefined : this.accessibleDescription;
        }
        get effectiveBadgeDescriptionText() {
            if (!this.shouldRenderBadge) {
                return "";
            }
            const badgeEffectiveText = this.badge[0].effectiveText;
            // Use distinct i18n keys for singular and plural badge values to ensure proper localization.
            // Some languages have different grammatical rules for singular and plural forms,
            // so separate keys (BUTTON_BADGE_ONE_ITEM and BUTTON_BADGE_MANY_ITEMS) are necessary.
            switch (badgeEffectiveText) {
                case "":
                    return badgeEffectiveText;
                case "1":
                    return Button_1.i18nBundle.getText(toLowercaseEnumValue.BUTTON_BADGE_ONE_ITEM, badgeEffectiveText);
                default:
                    return Button_1.i18nBundle.getText(toLowercaseEnumValue.BUTTON_BADGE_MANY_ITEMS, badgeEffectiveText);
            }
        }
        get _isSubmit() {
            return this.type === ButtonType$1.Submit || this.submits;
        }
        get _isReset() {
            return this.type === ButtonType$1.Reset;
        }
        get shouldRenderBadge() {
            return !!this.badge.length && (!!this.badge[0].text.length || this.badge[0].design === ButtonBadgeDesign$1.AttentionDot);
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "design", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "disabled", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "endIcon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "submits", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "tooltip", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "accessibleNameRef", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], Button.prototype, "accessibilityAttributes", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "accessibleDescription", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "type", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "accessibleRole", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "active", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "iconOnly", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "hasIcon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "hasEndIcon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "nonInteractive", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "loading", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], Button.prototype, "loadingDelay", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Button.prototype, "buttonTitle", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], Button.prototype, "_iconSettings", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Button.prototype, "forcedTabIndex", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "_isTouch", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Button.prototype, "_cancelAction", void 0);
    __decorate([
        webcomponentsBase.d({ type: Node, "default": true })
    ], Button.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, invalidateOnChildChange: true })
    ], Button.prototype, "badge", void 0);
    __decorate([
        parametersBundle_css.i("sap/esh/search/ui/gen/ui5/webcomponents")
    ], Button, "i18nBundle", void 0);
    Button = Button_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-button",
            formAssociated: true,
            languageAware: true,
            renderer: parametersBundle_css.y,
            template: ButtonTemplate,
            styles: buttonCss,
            shadowRootOptions: { delegatesFocus: true },
        })
        /**
         * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.
         *
         * **Note:** The event will not be fired if the `disabled` property is set to `true`.
         *
         * @since 2.10.0
         * @public
         * @param {Event} originalEvent Returns original event that comes from user's **click** interaction
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
        /**
         * Fired whenever the active state of the component changes.
         * @private
         */
        ,
        parametersBundle_css.l("active-state-change", {
            bubbles: true,
            cancelable: true,
        })
    ], Button);
    Button.define();
    var Button$1 = Button;

    const name$1 = "decline";
    const pathData$1 = "M86 109l22-23q5-5 12-5 6 0 11 5l124 125L380 86q5-5 11-5 7 0 12 5l22 23q12 11 0 23L301 256l124 125q11 11 0 22l-22 23q-8 5-12 5-3 0-11-5L255 301 131 426q-5 5-11 5-4 0-12-5l-22-23q-11-11 0-22l124-125L86 132q-12-12 0-23z";
    const ltr$1 = false;
    const accData$1 = ICON_DECLINE;
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name$1, { pathData: pathData$1, ltr: ltr$1, accData: accData$1, collection: collection$1, packageName: packageName$1 });

    const name = "decline";
    const pathData = "M292 256l117 116q7 7 7 18 0 12-7.5 19t-18.5 7q-10 0-18-8L256 292 140 408q-8 8-18 8-11 0-18.5-7.5T96 390q0-10 8-18l116-116-116-116q-8-8-8-18 0-11 7.5-18.5T122 96t18 7l116 117 116-117q7-7 18-7t18.5 7.5T416 122t-7 18z";
    const ltr = false;
    const accData = ICON_DECLINE;
    const collection = "SAP-icons-v5";
    const packageName = "sap/esh/search/ui/gen/ui5/webcomponents-icons";

    webcomponentsBase.y(name, { pathData, ltr, accData, collection, packageName });

    var decline = "decline";

    exports.A = A;
    exports.BusyIndicator = BusyIndicator$1;
    exports.Button = Button$1;
    exports.ButtonDesign = ButtonDesign$1;
    exports.E = E;
    exports.ICON_SEARCH = ICON_SEARCH;
    exports.Icon = Icon$1;
    exports.L = L;
    exports.Label = Label$1;
    exports.M = M;
    exports.T = T;
    exports.decline = decline;
    exports.p = p;
    exports.t = t;
    exports.y = y;

}));
