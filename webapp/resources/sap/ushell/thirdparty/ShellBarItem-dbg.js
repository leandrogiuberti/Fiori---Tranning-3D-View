sap.ui.define(['sap/ushell/thirdparty/webcomponents-base', 'sap/ushell/thirdparty/webcomponents', 'sap/ushell/thirdparty/webcomponents-fiori', 'sap/ushell/thirdparty/event-strict', 'sap/ushell/thirdparty/Icons'], (function (webcomponentsBase, webcomponents, webcomponentsFiori, eventStrict, Icons) { 'use strict';

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * Interface for components that may be slotted inside `ui5-shellbar` as items
     * @public
     */
    /**
     * @class
     * The `ui5-shellbar-item` represents a custom item, that
     * might be added to the `ui5-shellbar`.
     *
     * ### ES6 Module Import
     * `import "@ui5/webcomponents-fiori/dist/ShellBarItem.js";`
     * @constructor
     * @extends UI5Element
     * @abstract
     * @public
     */
    let ShellBarItem = class ShellBarItem extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines additional accessibility attributes on Shellbar Items.
             *
             * The accessibility attributes support the following values:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls,
             * is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`.
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element,
             * such as menu or dialog, that can be triggered by the button.
             *
             * - **controls**: Identifies the element (or elements) whose contents
             * or presence are controlled by the component.
             * Accepts a lowercase string value, referencing the ID of the element it controls.
             *
             * @default {}
             * @public
             * @since 2.9.0
             */
            this.accessibilityAttributes = {};
        }
        get stableDomRef() {
            return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
        }
        fireClickEvent(e) {
            return this.fireDecoratorEvent("click", {
                targetRef: e.target,
            });
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], ShellBarItem.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ShellBarItem.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ShellBarItem.prototype, "count", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], ShellBarItem.prototype, "accessibilityAttributes", void 0);
    ShellBarItem = __decorate([
        webcomponentsBase.m("ui5-shellbar-item")
        /**
         * Fired, when the item is pressed.
         * @param {HTMLElement} targetRef DOM ref of the clicked element
         * @public
         */
        ,
        eventStrict.l("click", {
            bubbles: true,
            cancelable: true,
        })
    ], ShellBarItem);
    ShellBarItem.define();
    var ShellBarItem$1 = ShellBarItem;

    return ShellBarItem$1;

}));
