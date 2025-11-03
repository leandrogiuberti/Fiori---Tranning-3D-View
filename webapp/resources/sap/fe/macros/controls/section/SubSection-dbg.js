/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/fe/macros/controls/section/mixin/SubSectionStateHandler", "sap/uxap/ObjectPageSubSection"], function (ClassSupport, SubSectionStateHandler, ObjectPageSubSection) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var mixin = ClassSupport.mixin;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  // eslint-disable-next-line @typescript-eslint/no-restricted-imports
  let SubSection = (_dec = defineUI5Class("sap.fe.macros.controls.section.SubSection", {
    designtime: "sap/uxap/designtime/ObjectPageSubSection.designtime"
  }), _dec2 = mixin(SubSectionStateHandler), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec(_class = _dec2(_class = (_class2 = /*#__PURE__*/function (_ObjectPageSubSection) {
    function SubSection(sId, mSettings) {
      var _this;
      _this = _ObjectPageSubSection.call(this, sId, mSettings) || this;

      // Register delegate for lifecycle management
      /**
       * Path to the apply-state handler to be called during state interactions.
       */
      _initializerDefineProperty(_this, "applyStateHandler", _descriptor, _this);
      /**
       * Path to the retrieve-state handler to be called during state interactions.
       */
      _initializerDefineProperty(_this, "retrieveStateHandler", _descriptor2, _this);
      const eventDelegates = {
        onBeforeRendering: () => {
          _this.checkAndApplyFormAlignmentClass();
        }
      };
      _this.addEventDelegate(eventDelegates);
      return _this;
    }

    /**
     * Gets visible content from all blocks in this subsection.
     * @returns Array of visible controls
     */
    _inheritsLoose(SubSection, _ObjectPageSubSection);
    var _proto = SubSection.prototype;
    _proto.getVisibleContent = function getVisibleContent() {
      const blocks = this.getBlocks();
      const visibleContent = [];
      blocks.forEach(block => {
        let content = block.getAggregation("content");
        if (content === null) {
          return;
        }
        if (!Array.isArray(content)) {
          content = [content];
        }
        for (const control of content) {
          if (control.getVisible()) {
            visibleContent.push(control);
          }
        }
      });
      return visibleContent;
    }

    /**
     * Checks if control is eligible for alignment CSS class.
     * @param control Control to check
     * @returns True if control is Form, Panel, Table, or List
     */;
    _proto.isEligibleForAlignment = function isEligibleForAlignment(control) {
      return control.isA(["sap.ui.layout.form.Form", "sap.fe.macros.form.FormAPI", "sap.m.Panel", "sap.m.Table", "sap.m.List"]);
    }

    /**
     * Checks subsection content and applies/removes alignment CSS class on Form elements.
     */;
    _proto.checkAndApplyFormAlignmentClass = function checkAndApplyFormAlignmentClass() {
      const visibleContent = this.getVisibleContent();

      // Only apply if exactly one visible control of eligible type
      if (visibleContent.length === 1 && this.isEligibleForAlignment(visibleContent[0])) {
        visibleContent[0].addStyleClass("sapUxAPObjectPageSubSectionAlignContent");
      } else {
        for (const control of visibleContent) {
          control.removeStyleClass("sapUxAPObjectPageSubSectionAlignContent");
        }
      }
    }

    /**
     * Sets the title of the subsection and adjusts the section content accordingly.
     * @param sTitle The title to set for the subsection
     * @returns The current instance of SubSection
     */;
    _proto.setTitle = function setTitle(sTitle) {
      _ObjectPageSubSection.prototype.setTitle.call(this, sTitle);

      // We need to run the title adjustment logic at section level after the title is set.
      const feSection = this.getParent();
      if (feSection && feSection.isA("sap.fe.macros.controls.Section") && feSection.checkAndAdjustSectionContent) {
        feSection.checkAndAdjustSectionContent();
      }
      return this;
    };
    return SubSection;
  }(ObjectPageSubSection), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "applyStateHandler", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "retrieveStateHandler", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class) || _class);
  return SubSection;
}, false);
//# sourceMappingURL=SubSection-dbg.js.map
