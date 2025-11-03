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
        type: "Ghost",
        press: this.onPress.bind(this),
        class: "sapUiTinyMarginBegin"
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcG1MaW5rIiwiX2RlYyIsImRlZmluZVVJNUNsYXNzIiwiX2RlYzIiLCJwcm9wZXJ0eSIsInR5cGUiLCJfZGVjMyIsIl9kZWM0IiwiX2RlYzUiLCJfZGVjNiIsIl9jbGFzcyIsIl9jbGFzczIiLCJfQnVpbGRpbmdCbG9jayIsIl90aGlzIiwiX2xlbiIsImFyZ3VtZW50cyIsImxlbmd0aCIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJjYWxsIiwiX2luaXRpYWxpemVyRGVmaW5lUHJvcGVydHkiLCJfZGVzY3JpcHRvciIsIl9kZXNjcmlwdG9yMiIsIl9kZXNjcmlwdG9yMyIsIl9kZXNjcmlwdG9yNCIsIl9kZXNjcmlwdG9yNSIsIl9leHBvcnRzIiwiX2luaGVyaXRzTG9vc2UiLCJfcHJvdG8iLCJwcm90b3R5cGUiLCJvbkJlZm9yZVJlbmRlcmluZyIsImNvbnRlbnQiLCJjcmVhdGVDb250ZW50IiwiZ2V0VGV4dCIsInRleHQiLCJkb2N1bWVudGF0aW9uIiwiZ2V0TGlua1RhcmdldCIsImhyZWYiLCJvblByZXNzIiwidG9waWMiLCJ3aW5kb3ciLCJwYXJlbnQiLCJwb3N0TWVzc2FnZSIsImhlYWRlciIsIm1MaWJyYXJ5IiwiVVJMSGVscGVyIiwicmVkaXJlY3QiLCJjcmVhdGVIZWFkZXJCdXR0b24iLCJfanN4IiwiQnV0dG9uIiwicHJlc3MiLCJiaW5kIiwiY2xhc3MiLCJjcmVhdGVMaW5rIiwiTGluayIsInRhcmdldCIsIkJ1aWxkaW5nQmxvY2siLCJfYXBwbHlEZWNvcmF0ZWREZXNjcmlwdG9yIiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiaW5pdGlhbGl6ZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkxpbmsudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvYmFzZS9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBMaW5rIGZyb20gXCJzYXAvbS9MaW5rXCI7XG5pbXBvcnQgbUxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuZnBtRXhwbG9yZXIuY29udHJvbHMuTGlua1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgZnBtTGluayBleHRlbmRzIEJ1aWxkaW5nQmxvY2s8TGluayB8IEJ1dHRvbj4ge1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHRleHQ/OiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0aGVhZGVyPzogYm9vbGVhbjtcblxuXHQvLyBJRCBvZiBVSTUgZG9jdW1lbnRhdGlvblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGRvY3VtZW50YXRpb24/OiBzdHJpbmc7XG5cblx0Ly8ga2V5IG9mIEZQTSB0b3BpY1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHRvcGljPzogc3RyaW5nO1xuXG5cdC8vIGFueSBvdGhlciBocmVmXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aHJlZj86IHN0cmluZztcblxuXHRvbkJlZm9yZVJlbmRlcmluZygpOiB2b2lkIHtcblx0XHRpZiAoIXRoaXMuY29udGVudCkge1xuXHRcdFx0dGhpcy5jb250ZW50ID0gdGhpcy5jcmVhdGVDb250ZW50KCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHRleHQgb2YgdGhlIGxpbmsuXG5cdCAqL1xuXHRnZXRUZXh0KCk6IHN0cmluZyB7XG5cdFx0aWYgKHRoaXMudGV4dCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGV4dDtcblx0XHR9IGVsc2UgaWYgKHRoaXMuZG9jdW1lbnRhdGlvbikge1xuXHRcdFx0cmV0dXJuIFwiRG9jdW1lbnRhdGlvblwiO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdGdldExpbmtUYXJnZXQoKTogc3RyaW5nIHtcblx0XHRpZiAodGhpcy5kb2N1bWVudGF0aW9uKSB7XG5cdFx0XHRyZXR1cm4gYC4uLy4uLy4uLy4uLy4uLy4uLy4uLyMvdG9waWMvJHt0aGlzLmRvY3VtZW50YXRpb259YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuaHJlZiA/PyBcIlwiO1xuXHRcdH1cblx0fVxuXG5cdG9uUHJlc3MoKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMudG9waWMpIHtcblx0XHRcdC8vIGZpcmUgbmF2aWdhdGlvbiB0byBvdGhlciB0b3BpY1xuXHRcdFx0d2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwibmF2aWdhdGVUb1RvcGljXCIsIHRvcGljOiB0aGlzLnRvcGljIH0pO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5oZWFkZXIgPT09IHRydWUpIHtcblx0XHRcdC8vIG9ubHkgaW4gY2FzZSBvZiBoZWFkZXIgYnV0dG9uIHdlIG5lZWQgdG8gcmVkaXJlY3QgaXQsIG90aGVyd2lzZSB0aGUgbGluayBpcyBhbHJlYWR5IGhhbmRsZWQgYnkgdGhlIGJyb3dzZXJcblx0XHRcdG1MaWJyYXJ5LlVSTEhlbHBlci5yZWRpcmVjdCh0aGlzLmdldExpbmtUYXJnZXQoKSwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBoZWFkZXIgYnV0dG9uLlxuXHQgKiBAcmV0dXJucyBUaGUgaGVhZGVyIGJ1dHRvbi5cblx0ICovXG5cdGNyZWF0ZUhlYWRlckJ1dHRvbigpOiBCdXR0b24ge1xuXHRcdHJldHVybiA8QnV0dG9uIHRleHQ9e3RoaXMuZ2V0VGV4dCgpfSB0eXBlPVwiR2hvc3RcIiBwcmVzcz17dGhpcy5vblByZXNzLmJpbmQodGhpcyl9IGNsYXNzPVwic2FwVWlUaW55TWFyZ2luQmVnaW5cIiAvPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbGluay5cblx0ICogQHJldHVybnMgVGhlIGxpbmsuXG5cdCAqL1xuXHRjcmVhdGVMaW5rKCk6IExpbmsge1xuXHRcdHJldHVybiA8TGluayB0ZXh0PXt0aGlzLmdldFRleHQoKX0gaHJlZj17dGhpcy5nZXRMaW5rVGFyZ2V0KCl9IHByZXNzPXt0aGlzLm9uUHJlc3MuYmluZCh0aGlzKX0gdGFyZ2V0PVwiX2JsYW5rXCIgLz47XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgY29udGVudCBvZiB0aGUgYnVpbGRpbmcgYmxvY2suXG5cdCAqIEByZXR1cm5zIFRoZSBjb250ZW50IG9mIHRoZSBidWlsZGluZyBibG9jay5cblx0ICovXG5cdGNyZWF0ZUNvbnRlbnQoKTogQnV0dG9uIHwgTGluayB7XG5cdFx0aWYgKHRoaXMuaGVhZGVyID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVIZWFkZXJCdXR0b24oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlTGluaygpO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O01BT3FCQSxPQUFPLElBQUFDLElBQUEsR0FEM0JDLGNBQWMsQ0FBQyx1Q0FBdUMsQ0FBQyxFQUFBQyxLQUFBLEdBRXREQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLEVBQUFDLEtBQUEsR0FHNUJGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVSxDQUFDLENBQUMsRUFBQUUsS0FBQSxHQUk3QkgsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxFQUFBRyxLQUFBLEdBSTVCSixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLEVBQUFJLEtBQUEsR0FJNUJMLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFB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