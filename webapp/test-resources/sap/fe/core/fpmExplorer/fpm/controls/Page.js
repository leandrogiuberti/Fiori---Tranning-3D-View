/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/m/Button", "sap/m/OverflowToolbarLayoutData", "sap/m/Text", "sap/m/Title", "sap/m/VBox", "sap/uxap/ObjectPageDynamicHeaderTitle", "sap/uxap/ObjectPageLayout", "sap/uxap/ObjectPageSection", "sap/uxap/ObjectPageSubSection", "./ImplementationStep", "./Link", "sap/fe/base/jsx-runtime/jsx", "sap/fe/base/jsx-runtime/jsxs"], function (ClassSupport, BuildingBlock, Button, OverflowToolbarLayoutData, Text, Title, VBox, ObjectPageDynamicHeaderTitle, ObjectPageLayout, ObjectPageSection, ObjectPageSubSection, ImplementationStep, Link, _jsx, _jsxs) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  // to avoid posting messages between the frames, we use a global variable for now
  // once only the new tool is used, we'll improve this logic
  let fpmLink = (_dec = defineUI5Class("sap.fe.core.fpmExplorer.controls.Page"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = aggregation({
    type: "sap.ui.core.Control"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: false
  }), _dec7 = aggregation({
    type: "sap.ui.core.Control"
  }), _dec8 = aggregation({
    type: "sap.fe.core.fpmExplorer.controls.ImplementationStep",
    multiple: true,
    defaultClass: ImplementationStep,
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlock) {
    function fpmLink() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlock.call(this, ...args) || this;
      // The page title
      _initializerDefineProperty(_this, "title", _descriptor, _this);
      // ID of UI5 documentation
      _initializerDefineProperty(_this, "documentation", _descriptor2, _this);
      // Introduction text of the shown feature
      _initializerDefineProperty(_this, "introduction", _descriptor3, _this);
      // as an alternative to the introduction text, we can use a control. Only use this if text is not enough
      _initializerDefineProperty(_this, "introductionContent", _descriptor4, _this);
      // shall the sample be shown in edit and display mode?
      _initializerDefineProperty(_this, "editMode", _descriptor5, _this);
      // The sample of the feature. In case you want to show more samples, put them into a form or VBox
      _initializerDefineProperty(_this, "sample", _descriptor6, _this);
      // The implementation steps of the feature.
      _initializerDefineProperty(_this, "implementation", _descriptor7, _this);
      return _this;
    }
    _exports = fpmLink;
    _inheritsLoose(fpmLink, _BuildingBlock);
    var _proto = fpmLink.prototype;
    _proto.onBeforeRendering = function onBeforeRendering() {
      if (!this.content) {
        this.content = this.createContent();
        this.content.getModel("ui").setProperty("/isEditable", this.editMode);
      }
    };
    _proto.onSwitchEdit = function onSwitchEdit() {
      const uiModel = this.content?.getModel("ui");
      uiModel.setProperty("/isEditable", !uiModel.getProperty("/isEditable"));
    };
    _proto.showCodeEditor = function showCodeEditor() {
      window.parent.postMessage({
        type: "showCodeEditor"
      });
    };
    _proto.createHeaderContent = function createHeaderContent() {
      let documentationLink, showCode;
      if (this.documentation) {
        // @ts-ignore
        documentationLink = _jsx(Link, {
          documentation: this.documentation,
          header: "true"
        });
      }
      if (window.parent.sapfe_codeEditorVisible === false) {
        showCode = _jsx(Button, {
          text: "Show Code",
          type: "Emphasized",
          press: this.showCodeEditor,
          children: {
            layoutData: _jsx(OverflowToolbarLayoutData, {
              priority: "NeverOverflow"
            })
          }
        });
      }
      return _jsx(ObjectPageDynamicHeaderTitle, {
        children: {
          actions: [documentationLink, showCode],
          heading: _jsx(Title, {
            text: this.title
          }),
          snappedTitleOnMobile: _jsx(Title, {
            text: this.title
          })
        }
      });
    };
    _proto.createDocumentationSection = function createDocumentationSection() {
      const introduction = this.introductionContent || _jsx(VBox, {
        class: "sapUiTinyMarginTop",
        children: _jsx(Text, {
          text: this.introduction
        })
      });
      return _jsx(ObjectPageSection, {
        titleUppercase: "false",
        children: {
          subSections: [_jsx(ObjectPageSubSection, {
            title: "Introduction",
            mode: "Expanded",
            titleUppercase: "false",
            children: introduction
          })]
        }
      });
    };
    _proto.createSampleSection = function createSampleSection() {
      let switchButton;
      if (this.editMode === true) {
        switchButton = _jsx(Button, {
          text: "Switch to {= ${ui>/isEditable} ? 'Display Mode' : 'Edit Mode' }",
          press: this.onSwitchEdit.bind(this)
        });
      }
      return _jsx(ObjectPageSection, {
        titleUppercase: "false",
        children: {
          subSections: [_jsxs(ObjectPageSubSection, {
            title: "Sample",
            mode: "Expanded",
            titleUppercase: "false",
            children: [{
              actions: switchButton
            }, this.sample]
          })]
        }
      });
    };
    _proto.createImplementationSection = function createImplementationSection(implementationStep) {
      const text = implementationStep.textContent ?? _jsx(Text, {
        text: implementationStep.text
      });
      return _jsx(ObjectPageSubSection, {
        title: implementationStep.title,
        mode: "Expanded",
        titleUppercase: "false",
        children: _jsxs(VBox, {
          class: "sapUiTinyMarginTop",
          children: [text, implementationStep.implementation]
        })
      });
    };
    _proto.createImplementationSections = function createImplementationSections() {
      const implementationSections = [];
      if (this.implementation) {
        for (const implementationStep of this.implementation) {
          implementationSections.push(this.createImplementationSection(implementationStep));
        }
      }
      return _jsx(ObjectPageSection, {
        titleUppercase: "false",
        title: "Implementation",
        children: {
          subSections: implementationSections
        }
      });
    };
    _proto.createSections = function createSections() {
      const sections = [];
      if (this.documentation) {
        sections.push(this.createDocumentationSection());
      }
      if (this.sample) {
        sections.push(this.createSampleSection());
      }
      if (this.implementation && this.implementation.length > 0) {
        sections.push(this.createImplementationSections());
      }
      return sections;
    }

    /**
     * Creates the content of the building block.
     * @returns The content of the building block.
     */;
    _proto.createContent = function createContent() {
      return _jsx(ObjectPageLayout, {
        children: {
          headerTitle: this.createHeaderContent(),
          sections: this.createSections()
        }
      });
    };
    return fpmLink;
  }(BuildingBlock), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "documentation", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "introduction", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "introductionContent", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "editMode", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "sample", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "implementation", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = fpmLink;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcG1MaW5rIiwiX2RlYyIsImRlZmluZVVJNUNsYXNzIiwiX2RlYzIiLCJwcm9wZXJ0eSIsInR5cGUiLCJfZGVjMyIsIl9kZWM0IiwiX2RlYzUiLCJhZ2dyZWdhdGlvbiIsIl9kZWM2IiwiZGVmYXVsdFZhbHVlIiwiX2RlYzciLCJfZGVjOCIsIm11bHRpcGxlIiwiZGVmYXVsdENsYXNzIiwiSW1wbGVtZW50YXRpb25TdGVwIiwiaXNEZWZhdWx0IiwiX2NsYXNzIiwiX2NsYXNzMiIsIl9CdWlsZGluZ0Jsb2NrIiwiX3RoaXMiLCJfbGVuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiYXJncyIsIkFycmF5IiwiX2tleSIsImNhbGwiLCJfaW5pdGlhbGl6ZXJEZWZpbmVQcm9wZXJ0eSIsIl9kZXNjcmlwdG9yIiwiX2Rlc2NyaXB0b3IyIiwiX2Rlc2NyaXB0b3IzIiwiX2Rlc2NyaXB0b3I0IiwiX2Rlc2NyaXB0b3I1IiwiX2Rlc2NyaXB0b3I2IiwiX2Rlc2NyaXB0b3I3IiwiX2V4cG9ydHMiLCJfaW5oZXJpdHNMb29zZSIsIl9wcm90byIsInByb3RvdHlwZSIsIm9uQmVmb3JlUmVuZGVyaW5nIiwiY29udGVudCIsImNyZWF0ZUNvbnRlbnQiLCJnZXRNb2RlbCIsInNldFByb3BlcnR5IiwiZWRpdE1vZGUiLCJvblN3aXRjaEVkaXQiLCJ1aU1vZGVsIiwiZ2V0UHJvcGVydHkiLCJzaG93Q29kZUVkaXRvciIsIndpbmRvdyIsInBhcmVudCIsInBvc3RNZXNzYWdlIiwiY3JlYXRlSGVhZGVyQ29udGVudCIsImRvY3VtZW50YXRpb25MaW5rIiwic2hvd0NvZGUiLCJkb2N1bWVudGF0aW9uIiwiX2pzeCIsIkxpbmsiLCJoZWFkZXIiLCJzYXBmZV9jb2RlRWRpdG9yVmlzaWJsZSIsIkJ1dHRvbiIsInRleHQiLCJwcmVzcyIsImNoaWxkcmVuIiwibGF5b3V0RGF0YSIsIk92ZXJmbG93VG9vbGJhckxheW91dERhdGEiLCJwcmlvcml0eSIsIk9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGUiLCJhY3Rpb25zIiwiaGVhZGluZyIsIlRpdGxlIiwidGl0bGUiLCJzbmFwcGVkVGl0bGVPbk1vYmlsZSIsImNyZWF0ZURvY3VtZW50YXRpb25TZWN0aW9uIiwiaW50cm9kdWN0aW9uIiwiaW50cm9kdWN0aW9uQ29udGVudCIsIlZCb3giLCJjbGFzcyIsIlRleHQiLCJPYmplY3RQYWdlU2VjdGlvbiIsInRpdGxlVXBwZXJjYXNlIiwic3ViU2VjdGlvbnMiLCJPYmplY3RQYWdlU3ViU2VjdGlvbiIsIm1vZGUiLCJjcmVhdGVTYW1wbGVTZWN0aW9uIiwic3dpdGNoQnV0dG9uIiwiYmluZCIsIl9qc3hzIiwic2FtcGxlIiwiY3JlYXRlSW1wbGVtZW50YXRpb25TZWN0aW9uIiwiaW1wbGVtZW50YXRpb25TdGVwIiwidGV4dENvbnRlbnQiLCJpbXBsZW1lbnRhdGlvbiIsImNyZWF0ZUltcGxlbWVudGF0aW9uU2VjdGlvbnMiLCJpbXBsZW1lbnRhdGlvblNlY3Rpb25zIiwicHVzaCIsImNyZWF0ZVNlY3Rpb25zIiwic2VjdGlvbnMiLCJPYmplY3RQYWdlTGF5b3V0IiwiaGVhZGVyVGl0bGUiLCJCdWlsZGluZ0Jsb2NrIiwiX2FwcGx5RGVjb3JhdGVkRGVzY3JpcHRvciIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJ3cml0YWJsZSIsImluaXRpYWxpemVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQYWdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9iYXNlL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2sgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IE92ZXJmbG93VG9vbGJhckxheW91dERhdGEgZnJvbSBcInNhcC9tL092ZXJmbG93VG9vbGJhckxheW91dERhdGFcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgVGl0bGUgZnJvbSBcInNhcC9tL1RpdGxlXCI7XG5pbXBvcnQgVkJveCBmcm9tIFwic2FwL20vVkJveFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBPYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlXCI7XG5pbXBvcnQgT2JqZWN0UGFnZUxheW91dCBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZUxheW91dFwiO1xuaW1wb3J0IE9iamVjdFBhZ2VTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU2VjdGlvblwiO1xuaW1wb3J0IE9iamVjdFBhZ2VTdWJTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU3ViU2VjdGlvblwiO1xuaW1wb3J0IEltcGxlbWVudGF0aW9uU3RlcCBmcm9tIFwiLi9JbXBsZW1lbnRhdGlvblN0ZXBcIjtcbmltcG9ydCBMaW5rIGZyb20gXCIuL0xpbmtcIjtcblxuLy8gdG8gYXZvaWQgcG9zdGluZyBtZXNzYWdlcyBiZXR3ZWVuIHRoZSBmcmFtZXMsIHdlIHVzZSBhIGdsb2JhbCB2YXJpYWJsZSBmb3Igbm93XG4vLyBvbmNlIG9ubHkgdGhlIG5ldyB0b29sIGlzIHVzZWQsIHdlJ2xsIGltcHJvdmUgdGhpcyBsb2dpY1xuZGVjbGFyZSBnbG9iYWwge1xuXHRpbnRlcmZhY2UgV2luZG93IHtcblx0XHRzYXBmZV9jb2RlRWRpdG9yVmlzaWJsZT86IGJvb2xlYW47XG5cdH1cbn1cblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuZnBtRXhwbG9yZXIuY29udHJvbHMuUGFnZVwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgZnBtTGluayBleHRlbmRzIEJ1aWxkaW5nQmxvY2s8Q29udHJvbD4ge1xuXHQvLyBUaGUgcGFnZSB0aXRsZVxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHRpdGxlPzogc3RyaW5nO1xuXG5cdC8vIElEIG9mIFVJNSBkb2N1bWVudGF0aW9uXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZG9jdW1lbnRhdGlvbj86IHN0cmluZztcblxuXHQvLyBJbnRyb2R1Y3Rpb24gdGV4dCBvZiB0aGUgc2hvd24gZmVhdHVyZVxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGludHJvZHVjdGlvbj86IHN0cmluZztcblxuXHQvLyBhcyBhbiBhbHRlcm5hdGl2ZSB0byB0aGUgaW50cm9kdWN0aW9uIHRleHQsIHdlIGNhbiB1c2UgYSBjb250cm9sLiBPbmx5IHVzZSB0aGlzIGlmIHRleHQgaXMgbm90IGVub3VnaFxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiB9KVxuXHRpbnRyb2R1Y3Rpb25Db250ZW50PzogQ29udHJvbFtdO1xuXG5cdC8vIHNoYWxsIHRoZSBzYW1wbGUgYmUgc2hvd24gaW4gZWRpdCBhbmQgZGlzcGxheSBtb2RlP1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRlZGl0TW9kZT86IGJvb2xlYW47XG5cblx0Ly8gVGhlIHNhbXBsZSBvZiB0aGUgZmVhdHVyZS4gSW4gY2FzZSB5b3Ugd2FudCB0byBzaG93IG1vcmUgc2FtcGxlcywgcHV0IHRoZW0gaW50byBhIGZvcm0gb3IgVkJveFxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiB9KVxuXHRzYW1wbGU/OiBDb250cm9sW107XG5cblx0Ly8gVGhlIGltcGxlbWVudGF0aW9uIHN0ZXBzIG9mIHRoZSBmZWF0dXJlLlxuXHRAYWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLmZlLmNvcmUuZnBtRXhwbG9yZXIuY29udHJvbHMuSW1wbGVtZW50YXRpb25TdGVwXCIsXG5cdFx0bXVsdGlwbGU6IHRydWUsXG5cdFx0ZGVmYXVsdENsYXNzOiBJbXBsZW1lbnRhdGlvblN0ZXAsXG5cdFx0aXNEZWZhdWx0OiB0cnVlXG5cdH0pXG5cdGltcGxlbWVudGF0aW9uPzogSW1wbGVtZW50YXRpb25TdGVwW107XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLmNvbnRlbnQpIHtcblx0XHRcdHRoaXMuY29udGVudCA9IHRoaXMuY3JlYXRlQ29udGVudCgpO1xuXHRcdFx0KHRoaXMuY29udGVudC5nZXRNb2RlbChcInVpXCIpIGFzIEpTT05Nb2RlbCkuc2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiLCB0aGlzLmVkaXRNb2RlKTtcblx0XHR9XG5cdH1cblxuXHRvblN3aXRjaEVkaXQoKTogdm9pZCB7XG5cdFx0Y29uc3QgdWlNb2RlbCA9IHRoaXMuY29udGVudD8uZ2V0TW9kZWwoXCJ1aVwiKSBhcyBKU09OTW9kZWw7XG5cdFx0dWlNb2RlbC5zZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIsICF1aU1vZGVsLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikpO1xuXHR9XG5cblx0c2hvd0NvZGVFZGl0b3IoKTogdm9pZCB7XG5cdFx0d2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwic2hvd0NvZGVFZGl0b3JcIiB9KTtcblx0fVxuXG5cdGNyZWF0ZUhlYWRlckNvbnRlbnQoKTogT2JqZWN0UGFnZUR5bmFtaWNIZWFkZXJUaXRsZSB7XG5cdFx0bGV0IGRvY3VtZW50YXRpb25MaW5rLCBzaG93Q29kZTtcblx0XHRpZiAodGhpcy5kb2N1bWVudGF0aW9uKSB7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRkb2N1bWVudGF0aW9uTGluayA9IDxMaW5rIGRvY3VtZW50YXRpb249e3RoaXMuZG9jdW1lbnRhdGlvbn0gaGVhZGVyPVwidHJ1ZVwiIC8+O1xuXHRcdH1cblxuXHRcdGlmICh3aW5kb3cucGFyZW50LnNhcGZlX2NvZGVFZGl0b3JWaXNpYmxlID09PSBmYWxzZSkge1xuXHRcdFx0c2hvd0NvZGUgPSAoXG5cdFx0XHRcdDxCdXR0b24gdGV4dD17XCJTaG93IENvZGVcIn0gdHlwZT1cIkVtcGhhc2l6ZWRcIiBwcmVzcz17dGhpcy5zaG93Q29kZUVkaXRvcn0+XG5cdFx0XHRcdFx0e3sgbGF5b3V0RGF0YTogPE92ZXJmbG93VG9vbGJhckxheW91dERhdGEgcHJpb3JpdHk9XCJOZXZlck92ZXJmbG93XCIgLz4gfX1cblx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8T2JqZWN0UGFnZUR5bmFtaWNIZWFkZXJUaXRsZT5cblx0XHRcdFx0e3tcblx0XHRcdFx0XHRhY3Rpb25zOiBbZG9jdW1lbnRhdGlvbkxpbmssIHNob3dDb2RlXSxcblx0XHRcdFx0XHRoZWFkaW5nOiA8VGl0bGUgdGV4dD17dGhpcy50aXRsZX0gLz4sXG5cdFx0XHRcdFx0c25hcHBlZFRpdGxlT25Nb2JpbGU6IDxUaXRsZSB0ZXh0PXt0aGlzLnRpdGxlfSAvPlxuXHRcdFx0XHR9fVxuXHRcdFx0PC9PYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlPlxuXHRcdCk7XG5cdH1cblxuXHRjcmVhdGVEb2N1bWVudGF0aW9uU2VjdGlvbigpOiBPYmplY3RQYWdlU2VjdGlvbiB7XG5cdFx0Y29uc3QgaW50cm9kdWN0aW9uID0gdGhpcy5pbnRyb2R1Y3Rpb25Db250ZW50IHx8IChcblx0XHRcdDxWQm94IGNsYXNzPVwic2FwVWlUaW55TWFyZ2luVG9wXCI+XG5cdFx0XHRcdDxUZXh0IHRleHQ9e3RoaXMuaW50cm9kdWN0aW9ufSAvPlxuXHRcdFx0PC9WQm94PlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE9iamVjdFBhZ2VTZWN0aW9uIHRpdGxlVXBwZXJjYXNlPVwiZmFsc2VcIj5cblx0XHRcdFx0e3tcblx0XHRcdFx0XHRzdWJTZWN0aW9uczogW1xuXHRcdFx0XHRcdFx0PE9iamVjdFBhZ2VTdWJTZWN0aW9uIHRpdGxlPVwiSW50cm9kdWN0aW9uXCIgbW9kZT1cIkV4cGFuZGVkXCIgdGl0bGVVcHBlcmNhc2U9XCJmYWxzZVwiPlxuXHRcdFx0XHRcdFx0XHR7aW50cm9kdWN0aW9ufVxuXHRcdFx0XHRcdFx0PC9PYmplY3RQYWdlU3ViU2VjdGlvbj5cblx0XHRcdFx0XHRdXG5cdFx0XHRcdH19XG5cdFx0XHQ8L09iamVjdFBhZ2VTZWN0aW9uPlxuXHRcdCk7XG5cdH1cblxuXHRjcmVhdGVTYW1wbGVTZWN0aW9uKCk6IE9iamVjdFBhZ2VTZWN0aW9uIHtcblx0XHRsZXQgc3dpdGNoQnV0dG9uO1xuXHRcdGlmICh0aGlzLmVkaXRNb2RlID09PSB0cnVlKSB7XG5cdFx0XHRzd2l0Y2hCdXR0b24gPSAoXG5cdFx0XHRcdDxCdXR0b24gdGV4dD1cIlN3aXRjaCB0byB7PSAke3VpPi9pc0VkaXRhYmxlfSA/ICdEaXNwbGF5IE1vZGUnIDogJ0VkaXQgTW9kZScgfVwiIHByZXNzPXt0aGlzLm9uU3dpdGNoRWRpdC5iaW5kKHRoaXMpfSAvPlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxPYmplY3RQYWdlU2VjdGlvbiB0aXRsZVVwcGVyY2FzZT1cImZhbHNlXCI+XG5cdFx0XHRcdHt7XG5cdFx0XHRcdFx0c3ViU2VjdGlvbnM6IFtcblx0XHRcdFx0XHRcdDxPYmplY3RQYWdlU3ViU2VjdGlvbiB0aXRsZT1cIlNhbXBsZVwiIG1vZGU9XCJFeHBhbmRlZFwiIHRpdGxlVXBwZXJjYXNlPVwiZmFsc2VcIj5cblx0XHRcdFx0XHRcdFx0e3tcblx0XHRcdFx0XHRcdFx0XHRhY3Rpb25zOiBzd2l0Y2hCdXR0b25cblx0XHRcdFx0XHRcdFx0fX1cblxuXHRcdFx0XHRcdFx0XHR7dGhpcy5zYW1wbGV9XG5cdFx0XHRcdFx0XHQ8L09iamVjdFBhZ2VTdWJTZWN0aW9uPlxuXHRcdFx0XHRcdF1cblx0XHRcdFx0fX1cblx0XHRcdDwvT2JqZWN0UGFnZVNlY3Rpb24+XG5cdFx0KTtcblx0fVxuXG5cdGNyZWF0ZUltcGxlbWVudGF0aW9uU2VjdGlvbihpbXBsZW1lbnRhdGlvblN0ZXA6IEltcGxlbWVudGF0aW9uU3RlcCk6IE9iamVjdFBhZ2VTdWJTZWN0aW9uIHtcblx0XHRjb25zdCB0ZXh0ID0gaW1wbGVtZW50YXRpb25TdGVwLnRleHRDb250ZW50ID8/IDxUZXh0IHRleHQ9e2ltcGxlbWVudGF0aW9uU3RlcC50ZXh0fSAvPjtcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8T2JqZWN0UGFnZVN1YlNlY3Rpb24gdGl0bGU9e2ltcGxlbWVudGF0aW9uU3RlcC50aXRsZX0gbW9kZT1cIkV4cGFuZGVkXCIgdGl0bGVVcHBlcmNhc2U9XCJmYWxzZVwiPlxuXHRcdFx0XHQ8VkJveCBjbGFzcz1cInNhcFVpVGlueU1hcmdpblRvcFwiPlxuXHRcdFx0XHRcdHt0ZXh0fVxuXHRcdFx0XHRcdHtpbXBsZW1lbnRhdGlvblN0ZXAuaW1wbGVtZW50YXRpb259XG5cdFx0XHRcdDwvVkJveD5cblx0XHRcdDwvT2JqZWN0UGFnZVN1YlNlY3Rpb24+XG5cdFx0KTtcblx0fVxuXG5cdGNyZWF0ZUltcGxlbWVudGF0aW9uU2VjdGlvbnMoKTogT2JqZWN0UGFnZVNlY3Rpb24ge1xuXHRcdGNvbnN0IGltcGxlbWVudGF0aW9uU2VjdGlvbnM6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10gPSBbXTtcblxuXHRcdGlmICh0aGlzLmltcGxlbWVudGF0aW9uKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGltcGxlbWVudGF0aW9uU3RlcCBvZiB0aGlzLmltcGxlbWVudGF0aW9uKSB7XG5cdFx0XHRcdGltcGxlbWVudGF0aW9uU2VjdGlvbnMucHVzaCh0aGlzLmNyZWF0ZUltcGxlbWVudGF0aW9uU2VjdGlvbihpbXBsZW1lbnRhdGlvblN0ZXApKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE9iamVjdFBhZ2VTZWN0aW9uIHRpdGxlVXBwZXJjYXNlPVwiZmFsc2VcIiB0aXRsZT17XCJJbXBsZW1lbnRhdGlvblwifT5cblx0XHRcdFx0e3tcblx0XHRcdFx0XHRzdWJTZWN0aW9uczogaW1wbGVtZW50YXRpb25TZWN0aW9uc1xuXHRcdFx0XHR9fVxuXHRcdFx0PC9PYmplY3RQYWdlU2VjdGlvbj5cblx0XHQpO1xuXHR9XG5cblx0Y3JlYXRlU2VjdGlvbnMoKTogT2JqZWN0UGFnZVNlY3Rpb25bXSB7XG5cdFx0Y29uc3Qgc2VjdGlvbnM6IE9iamVjdFBhZ2VTZWN0aW9uW10gPSBbXTtcblx0XHRpZiAodGhpcy5kb2N1bWVudGF0aW9uKSB7XG5cdFx0XHRzZWN0aW9ucy5wdXNoKHRoaXMuY3JlYXRlRG9jdW1lbnRhdGlvblNlY3Rpb24oKSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLnNhbXBsZSkge1xuXHRcdFx0c2VjdGlvbnMucHVzaCh0aGlzLmNyZWF0ZVNhbXBsZVNlY3Rpb24oKSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmltcGxlbWVudGF0aW9uICYmIHRoaXMuaW1wbGVtZW50YXRpb24ubGVuZ3RoID4gMCkge1xuXHRcdFx0c2VjdGlvbnMucHVzaCh0aGlzLmNyZWF0ZUltcGxlbWVudGF0aW9uU2VjdGlvbnMoKSBhcyBPYmplY3RQYWdlU2VjdGlvbik7XG5cdFx0fVxuXHRcdHJldHVybiBzZWN0aW9ucztcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBjb250ZW50IG9mIHRoZSBidWlsZGluZyBibG9jay5cblx0ICogQHJldHVybnMgVGhlIGNvbnRlbnQgb2YgdGhlIGJ1aWxkaW5nIGJsb2NrLlxuXHQgKi9cblx0Y3JlYXRlQ29udGVudCgpOiBPYmplY3RQYWdlTGF5b3V0IHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PE9iamVjdFBhZ2VMYXlvdXQ+XG5cdFx0XHRcdHt7XG5cdFx0XHRcdFx0aGVhZGVyVGl0bGU6IHRoaXMuY3JlYXRlSGVhZGVyQ29udGVudCgpLFxuXHRcdFx0XHRcdHNlY3Rpb25zOiB0aGlzLmNyZWF0ZVNlY3Rpb25zKClcblx0XHRcdFx0fX1cblx0XHRcdDwvT2JqZWN0UGFnZUxheW91dD5cblx0XHQpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JBO0VBQ0E7RUFBQSxJQVFxQkEsT0FBTyxJQUFBQyxJQUFBLEdBRDNCQyxjQUFjLENBQUMsdUNBQXVDLENBQUMsRUFBQUMsS0FBQSxHQUd0REMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxFQUFBQyxLQUFBLEdBSTVCRixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLEVBQUFFLEtBQUEsR0FJNUJILFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsRUFBQUcsS0FBQSxHQUk1QkMsV0FBVyxDQUFDO0lBQUVKLElBQUksRUFBRTtFQUFzQixDQUFDLENBQUMsRUFBQUssS0FBQSxHQUk1Q04sUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVNLFlBQVksRUFBRTtFQUFNLENBQUMsQ0FBQyxFQUFBQyxLQUFBLEdBSWxESCxXQUFXLENBQUM7SUFBRUosSUFBSSxFQUFFO0VBQXNCLENBQUMsQ0FBQyxFQUFBUSxLQUFBLEdBSTVDSixXQUFXLENBQUM7SUFDWkosSUFBSSxFQUFFLHFEQUFxRDtJQUMzRFMsUUFBUSxFQUFFLElBQUk7SUFDZEMsWUFBWSxFQUFFQyxrQkFBa0I7SUFDaENDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxFQUFBaEIsSUFBQSxDQUFBaUIsTUFBQSxJQUFBQyxPQUFBLDBCQUFBQyxjQUFBO0lBQUEsU0FBQXBCLFFBQUE7TUFBQSxJQUFBcUIsS0FBQTtNQUFBLFNBQUFDLElBQUEsR0FBQUMsU0FBQSxDQUFBQyxNQUFBLEVBQUFDLElBQUEsT0FBQUMsS0FBQSxDQUFBSixJQUFBLEdBQUFLLElBQUEsTUFBQUEsSUFBQSxHQUFBTCxJQUFB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