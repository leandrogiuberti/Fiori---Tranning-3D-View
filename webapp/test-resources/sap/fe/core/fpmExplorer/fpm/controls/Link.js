/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/m/Button", "sap/m/Link", "sap/m/library", "sap/fe/base/jsx-runtime/jsx"], function (ClassSupport, BuildingBlock, Button, Link, mLibrary, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  let fpmLink = (_dec = defineUI5Class("sap.fe.core.fpmExplorer.controls.Link"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlock) {
    function fpmLink() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlock.call(this, ...args) || this;
      _initializerDefineProperty(_this, "text", _descriptor, _this);
      _initializerDefineProperty(_this, "header", _descriptor2, _this);
      // ID of UI5 documentation
      _initializerDefineProperty(_this, "documentation", _descriptor3, _this);
      // key of FPM topic
      _initializerDefineProperty(_this, "topic", _descriptor4, _this);
      // any other href
      _initializerDefineProperty(_this, "href", _descriptor5, _this);
      return _this;
    }
    _exports = fpmLink;
    _inheritsLoose(fpmLink, _BuildingBlock);
    var _proto = fpmLink.prototype;
    _proto.onBeforeRendering = function onBeforeRendering() {
      if (!this.content) {
        this.content = this.createContent();
      }
    }

    /**
     * Returns the text of the link.
     */;
    _proto.getText = function getText() {
      if (this.text) {
        return this.text;
      } else if (this.documentation) {
        return "Documentation";
      }
      return "";
    };
    _proto.getLinkTarget = function getLinkTarget() {
      if (this.documentation) {
        return `../../../../../../../#/topic/${this.documentation}`;
      } else {
        return this.href ?? "";
      }
    };
    _proto.onPress = function onPress() {
      if (this.topic) {
        // fire navigation to other topic
        window.parent.postMessage({
          type: "navigateToTopic",
          topic: this.topic
        });
      } else if (this.header === true) {
        // only in case of header button we need to redirect it, otherwise the link is already handled by the browser
        mLibrary.URLHelper.redirect(this.getLinkTarget(), true);
      }
    }

    /**
     * Creates a header button.
     * @returns The header button.
     */;
    _proto.createHeaderButton = function createHeaderButton() {
      return _jsx(Button, {
        text: this.getText(),
        type: "Transparent",
        press: this.onPress.bind(this)
      });
    }

    /**
     * Creates a link.
     * @returns The link.
     */;
    _proto.createLink = function createLink() {
      return _jsx(Link, {
        text: this.getText(),
        href: this.getLinkTarget(),
        press: this.onPress.bind(this),
        target: "_blank"
      });
    }

    /**
     * Creates the content of the building block.
     * @returns The content of the building block.
     */;
    _proto.createContent = function createContent() {
      if (this.header === true) {
        return this.createHeaderButton();
      } else {
        return this.createLink();
      }
    };
    return fpmLink;
  }(BuildingBlock), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "text", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "documentation", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "topic", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "href", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = fpmLink;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcG1MaW5rIiwiX2RlYyIsImRlZmluZVVJNUNsYXNzIiwiX2RlYzIiLCJwcm9wZXJ0eSIsInR5cGUiLCJfZGVjMyIsIl9kZWM0IiwiX2RlYzUiLCJfZGVjNiIsIl9jbGFzcyIsIl9jbGFzczIiLCJfQnVpbGRpbmdCbG9jayIsIl90aGlzIiwiX2xlbiIsImFyZ3VtZW50cyIsImxlbmd0aCIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJjYWxsIiwiX2luaXRpYWxpemVyRGVmaW5lUHJvcGVydHkiLCJfZGVzY3JpcHRvciIsIl9kZXNjcmlwdG9yMiIsIl9kZXNjcmlwdG9yMyIsIl9kZXNjcmlwdG9yNCIsIl9kZXNjcmlwdG9yNSIsIl9leHBvcnRzIiwiX2luaGVyaXRzTG9vc2UiLCJfcHJvdG8iLCJwcm90b3R5cGUiLCJvbkJlZm9yZVJlbmRlcmluZyIsImNvbnRlbnQiLCJjcmVhdGVDb250ZW50IiwiZ2V0VGV4dCIsInRleHQiLCJkb2N1bWVudGF0aW9uIiwiZ2V0TGlua1RhcmdldCIsImhyZWYiLCJvblByZXNzIiwidG9waWMiLCJ3aW5kb3ciLCJwYXJlbnQiLCJwb3N0TWVzc2FnZSIsImhlYWRlciIsIm1MaWJyYXJ5IiwiVVJMSGVscGVyIiwicmVkaXJlY3QiLCJjcmVhdGVIZWFkZXJCdXR0b24iLCJfanN4IiwiQnV0dG9uIiwicHJlc3MiLCJiaW5kIiwiY3JlYXRlTGluayIsIkxpbmsiLCJ0YXJnZXQiLCJCdWlsZGluZ0Jsb2NrIiwiX2FwcGx5RGVjb3JhdGVkRGVzY3JpcHRvciIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJ3cml0YWJsZSIsImluaXRpYWxpemVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJMaW5rLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2Jhc2UvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQnVpbGRpbmdCbG9jayBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgTGluayBmcm9tIFwic2FwL20vTGlua1wiO1xuaW1wb3J0IG1MaWJyYXJ5IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmZwbUV4cGxvcmVyLmNvbnRyb2xzLkxpbmtcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGZwbUxpbmsgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrPExpbmsgfCBCdXR0b24+IHtcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR0ZXh0Pzogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGhlYWRlcj86IGJvb2xlYW47XG5cblx0Ly8gSUQgb2YgVUk1IGRvY3VtZW50YXRpb25cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRkb2N1bWVudGF0aW9uPzogc3RyaW5nO1xuXG5cdC8vIGtleSBvZiBGUE0gdG9waWNcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR0b3BpYz86IHN0cmluZztcblxuXHQvLyBhbnkgb3RoZXIgaHJlZlxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGhyZWY/OiBzdHJpbmc7XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLmNvbnRlbnQpIHtcblx0XHRcdHRoaXMuY29udGVudCA9IHRoaXMuY3JlYXRlQ29udGVudCgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB0ZXh0IG9mIHRoZSBsaW5rLlxuXHQgKi9cblx0Z2V0VGV4dCgpOiBzdHJpbmcge1xuXHRcdGlmICh0aGlzLnRleHQpIHtcblx0XHRcdHJldHVybiB0aGlzLnRleHQ7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmRvY3VtZW50YXRpb24pIHtcblx0XHRcdHJldHVybiBcIkRvY3VtZW50YXRpb25cIjtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHRnZXRMaW5rVGFyZ2V0KCk6IHN0cmluZyB7XG5cdFx0aWYgKHRoaXMuZG9jdW1lbnRhdGlvbikge1xuXHRcdFx0cmV0dXJuIGAuLi8uLi8uLi8uLi8uLi8uLi8uLi8jL3RvcGljLyR7dGhpcy5kb2N1bWVudGF0aW9ufWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmhyZWYgPz8gXCJcIjtcblx0XHR9XG5cdH1cblxuXHRvblByZXNzKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnRvcGljKSB7XG5cdFx0XHQvLyBmaXJlIG5hdmlnYXRpb24gdG8gb3RoZXIgdG9waWNcblx0XHRcdHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoeyB0eXBlOiBcIm5hdmlnYXRlVG9Ub3BpY1wiLCB0b3BpYzogdGhpcy50b3BpYyB9KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuaGVhZGVyID09PSB0cnVlKSB7XG5cdFx0XHQvLyBvbmx5IGluIGNhc2Ugb2YgaGVhZGVyIGJ1dHRvbiB3ZSBuZWVkIHRvIHJlZGlyZWN0IGl0LCBvdGhlcndpc2UgdGhlIGxpbmsgaXMgYWxyZWFkeSBoYW5kbGVkIGJ5IHRoZSBicm93c2VyXG5cdFx0XHRtTGlicmFyeS5VUkxIZWxwZXIucmVkaXJlY3QodGhpcy5nZXRMaW5rVGFyZ2V0KCksIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgaGVhZGVyIGJ1dHRvbi5cblx0ICogQHJldHVybnMgVGhlIGhlYWRlciBidXR0b24uXG5cdCAqL1xuXHRjcmVhdGVIZWFkZXJCdXR0b24oKTogQnV0dG9uIHtcblx0XHRyZXR1cm4gPEJ1dHRvbiB0ZXh0PXt0aGlzLmdldFRleHQoKX0gdHlwZT1cIlRyYW5zcGFyZW50XCIgcHJlc3M9e3RoaXMub25QcmVzcy5iaW5kKHRoaXMpfSAvPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbGluay5cblx0ICogQHJldHVybnMgVGhlIGxpbmsuXG5cdCAqL1xuXHRjcmVhdGVMaW5rKCk6IExpbmsge1xuXHRcdHJldHVybiA8TGluayB0ZXh0PXt0aGlzLmdldFRleHQoKX0gaHJlZj17dGhpcy5nZXRMaW5rVGFyZ2V0KCl9IHByZXNzPXt0aGlzLm9uUHJlc3MuYmluZCh0aGlzKX0gdGFyZ2V0PVwiX2JsYW5rXCIgLz47XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgY29udGVudCBvZiB0aGUgYnVpbGRpbmcgYmxvY2suXG5cdCAqIEByZXR1cm5zIFRoZSBjb250ZW50IG9mIHRoZSBidWlsZGluZyBibG9jay5cblx0ICovXG5cdGNyZWF0ZUNvbnRlbnQoKTogQnV0dG9uIHwgTGluayB7XG5cdFx0aWYgKHRoaXMuaGVhZGVyID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVIZWFkZXJCdXR0b24oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlTGluaygpO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O01BT3FCQSxPQUFPLElBQUFDLElBQUEsR0FEM0JDLGNBQWMsQ0FBQyx1Q0FBdUMsQ0FBQyxFQUFBQyxLQUFBLEdBRXREQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLEVBQUFDLEtBQUEsR0FHNUJGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVSxDQUFDLENBQUMsRUFBQUUsS0FBQSxHQUk3QkgsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxFQUFBRyxLQUFBLEdBSTVCSixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLEVBQUFJLEtBQUEsR0FJNUJMLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsRUFBQUosSUFBQSxDQUFBUyxNQUFB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