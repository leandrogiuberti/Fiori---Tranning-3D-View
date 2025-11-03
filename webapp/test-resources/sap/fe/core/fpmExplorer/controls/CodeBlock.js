/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/m/Button", "sap/m/IconTabFilter", "sap/m/IconTabHeader", "sap/m/VBox", "sap/ui/codeeditor/CodeEditor", "./CodeLink", "sap/fe/base/jsx-runtime/jsx", "sap/fe/base/jsx-runtime/jsxs"], function (ClassSupport, BuildingBlock, Button, IconTabFilter, IconTabHeader, VBox, CodeEditor, CodeLink, _jsx, _jsxs) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  // eslint-disable-next-line @typescript-eslint/no-restricted-imports
  let CodeBlock = (_dec = defineUI5Class("sap.fe.core.fpmExplorer.controls.CodeBlock"), _dec2 = aggregation({
    type: "sap.fe.core.fpmExplorer.controls.CodeLink",
    multiple: true,
    defaultClass: CodeLink,
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlock) {
    function CodeBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlock.call(this, ...args) || this;
      // Linking code
      _initializerDefineProperty(_this, "codeLinks", _descriptor, _this);
      // which types allow navigation
      _this.navigation = [];
      return _this;
    }
    _exports = CodeBlock;
    _inheritsLoose(CodeBlock, _BuildingBlock);
    var _proto = CodeBlock.prototype;
    // the current active tab
    // the instance of the code
    // the instance of the navigation button
    // a flag to check if the component is initialized
    /**
     * Loads the content of a file from the given file path.
     * @param filePath The path to the file to be loaded.
     * @returns A promise that resolves to the content of the file.
     * @throws If the file cannot be loaded.
     */
    _proto.loadFile = async function loadFile(filePath) {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.text();
    }

    /**
     * Reads the code and shows it in the code editor.
     */
    // @ts-ignore
    ;
    _proto.onBeforeRendering = async function onBeforeRendering() {
      if (!this.initialized) {
        for (const codeLink of this.codeLinks || []) {
          let linkedCode = "";
          let navigationEnabled = false;
          if (codeLink.start) {
            const codeContent = await this.loadFile(codeLink.file);
            const splitCode = codeContent.split("\n");
            const startIndex = splitCode.findIndex(line => line.includes(codeLink.start));
            if (startIndex !== -1) {
              if (codeLink.end === undefined) {
                if ((codeLink.codeType === "xml" || codeLink.codeType === "view") && codeLink.fullTag) {
                  const openingTagLine = splitCode.slice(0, startIndex + 1).reverse().findIndex(line => line.includes("<"));
                  const closingTagLine = splitCode.slice(startIndex).findIndex(line => line.includes("/>"));
                  linkedCode = splitCode.slice(openingTagLine !== -1 ? startIndex - openingTagLine : startIndex, closingTagLine !== -1 ? startIndex + closingTagLine + 1 : startIndex + 1).join("\n");
                  if (!linkedCode.trim().endsWith("/>")) {
                    linkedCode = linkedCode.trim() + " />";
                  }
                } else {
                  linkedCode = splitCode[startIndex];
                }
              } else if (!isNaN(Number(codeLink.end))) {
                const endIndex = startIndex + Number(codeLink.end) - 1;
                linkedCode = endIndex < splitCode.length ? splitCode.slice(startIndex, endIndex).join("\n") : splitCode.slice(startIndex).join("\n");
              } else {
                const endIndex = splitCode.findIndex((line, index) => index > startIndex && line.includes(codeLink.end));
                if (endIndex !== -1) {
                  linkedCode = splitCode.slice(startIndex, endIndex + 1).join("\n");
                }
              }
              navigationEnabled = true;

              // we need the name of the tab to be able to switch between them. If not given, we assume the name of the file
              if (!codeLink.fileName) {
                const fileName = codeLink.file.split("/").pop();
                if (fileName) {
                  codeLink.fileName = fileName;
                }
              }
            }
          } else {
            linkedCode = await this.loadFile(codeLink.file);
          }
          switch (codeLink.codeType) {
            case "cds":
              this.cdsContent = linkedCode;
              if (navigationEnabled) {
                this.navigation.push("cds");
              }
              break;
            case "xml":
              this.xmlContent = linkedCode;
              if (navigationEnabled) {
                this.navigation.push("xml");
              }
              break;
            case "view":
              this.viewContent = linkedCode;
              if (navigationEnabled) {
                this.navigation.push("view");
              }
              break;
            case "rap":
              this.rapContent = linkedCode;
              if (navigationEnabled) {
                this.navigation.push("rap");
              }
              break;
            case "manifest":
              this.manifestContent = linkedCode;
              if (navigationEnabled) {
                this.navigation.push("manifest");
              }
              break;
            case "ts":
              this.tsContent = linkedCode;
              if (navigationEnabled) {
                this.navigation.push("ts");
              }
              break;
          }
        }
        this.initialized = true;
      }
      this.content = this.createContent();
      if (this.cdsContent) {
        this.showCode("cds");
      } else if (this.manifestContent) {
        this.showCode("manifest");
      } else if (this.xmlContent) {
        this.showCode("xml");
      } else if (this.viewContent) {
        this.showCode("view");
      } else if (this.tsContent) {
        this.showCode("ts");
      }
    }

    /**
     * Formats and shows the given code in the code editor.
     * @param codeType The code type to be shown.
     */;
    _proto.showCode = function showCode(codeType) {
      let code = this[`${codeType}Content`];
      if (!code) {
        return;
      }

      // if we get the code from the file, it might have some extra spaces at the beginning
      // we'll remove them to make the code look better
      const lines = code.split("\n");
      const leadingSpaces = lines[0].match(/^\s*/)?.[0].length || 0;
      if (leadingSpaces > 0) {
        code = lines.map(line => line.slice(leadingSpaces)).join("\n");
      }
      this._codeEditor?.setValue(code);
      this._navigationButton.setVisible(this.navigation.includes(codeType));
      this.activeTab = codeType;
    }

    /**
     * Navigates to the code in the code editor.
     */;
    _proto.navigateToCode = function navigateToCode() {
      const fileName = this.codeLinks?.find(link => link.codeType === this.activeTab)?.fileName;
      const code = this[`${this.activeTab}Content`];
      window.parent.postMessage({
        type: "navigateToCode",
        code: code,
        file: fileName
      });
    }

    /**
     * Switches the tab and shows the code of the selected tab.
     * @param event The event that was triggered.
     */;
    _proto.switchTab = function switchTab(event) {
      const codeType = event.getParameter("key");
      this.showCode(codeType);
    }

    /**
     * Creates the content of the building block.
     * @returns The content of the building block.
     */;
    _proto.createContent = function createContent() {
      const uriParams = new URLSearchParams(window.parent.location.search);
      let showRAPContent = false;
      if (uriParams.has("showRAPContent")) {
        showRAPContent = true;
      }
      this._codeEditor = _jsx(CodeEditor, {
        maxLines: 20,
        class: "sapUiTinyMargin",
        type: "red",
        lineNumbers: "false",
        editable: "false",
        width: "100%"
      });
      this._navigationButton = _jsx(Button, {
        type: "Transparent",
        text: "Show Code",
        icon: "sap-icon://syntax",
        press: this.navigateToCode.bind(this)
      });
      const items = [];
      if (this.cdsContent) {
        items.push(_jsx(IconTabFilter, {
          text: "CAP"
        }, "cds"));
      }
      if (this.manifestContent) {
        items.push(_jsx(IconTabFilter, {
          text: "Manifest"
        }, "manifest"));
      }
      if (showRAPContent && this.rapContent) {
        items.push(_jsx(IconTabFilter, {
          text: "RAP"
        }, "rap"));
      }
      if (this.xmlContent) {
        items.push(_jsx(IconTabFilter, {
          text: "XML"
        }, "xml"));
      }
      if (this.viewContent) {
        items.push(_jsx(IconTabFilter, {
          text: "View"
        }, "view"));
      }
      if (this.tsContent) {
        items.push(_jsx(IconTabFilter, {
          text: "Controller"
        }, "ts"));
      }
      return _jsxs(VBox, {
        children: [_jsx(IconTabHeader, {
          select: this.switchTab.bind(this),
          children: {
            items: items
          }
        }), " ", "as IconTabHeader", this._codeEditor, this._navigationButton]
      });
    };
    return CodeBlock;
  }(BuildingBlock), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "codeLinks", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = CodeBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2RlQmxvY2siLCJfZGVjIiwiZGVmaW5lVUk1Q2xhc3MiLCJfZGVjMiIsImFnZ3JlZ2F0aW9uIiwidHlwZSIsIm11bHRpcGxlIiwiZGVmYXVsdENsYXNzIiwiQ29kZUxpbmsiLCJpc0RlZmF1bHQiLCJfY2xhc3MiLCJfY2xhc3MyIiwiX0J1aWxkaW5nQmxvY2siLCJfdGhpcyIsIl9sZW4iLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJhcmdzIiwiQXJyYXkiLCJfa2V5IiwiY2FsbCIsIl9pbml0aWFsaXplckRlZmluZVByb3BlcnR5IiwiX2Rlc2NyaXB0b3IiLCJuYXZpZ2F0aW9uIiwiX2V4cG9ydHMiLCJfaW5oZXJpdHNMb29zZSIsIl9wcm90byIsInByb3RvdHlwZSIsImxvYWRGaWxlIiwiZmlsZVBhdGgiLCJyZXNwb25zZSIsImZldGNoIiwib2siLCJFcnJvciIsInN0YXR1c1RleHQiLCJ0ZXh0Iiwib25CZWZvcmVSZW5kZXJpbmciLCJpbml0aWFsaXplZCIsImNvZGVMaW5rIiwiY29kZUxpbmtzIiwibGlua2VkQ29kZSIsIm5hdmlnYXRpb25FbmFibGVkIiwic3RhcnQiLCJjb2RlQ29udGVudCIsImZpbGUiLCJzcGxpdENvZGUiLCJzcGxpdCIsInN0YXJ0SW5kZXgiLCJmaW5kSW5kZXgiLCJsaW5lIiwiaW5jbHVkZXMiLCJlbmQiLCJ1bmRlZmluZWQiLCJjb2RlVHlwZSIsImZ1bGxUYWciLCJvcGVuaW5nVGFnTGluZSIsInNsaWNlIiwicmV2ZXJzZSIsImNsb3NpbmdUYWdMaW5lIiwiam9pbiIsInRyaW0iLCJlbmRzV2l0aCIsImlzTmFOIiwiTnVtYmVyIiwiZW5kSW5kZXgiLCJpbmRleCIsImZpbGVOYW1lIiwicG9wIiwiY2RzQ29udGVudCIsInB1c2giLCJ4bWxDb250ZW50Iiwidmlld0NvbnRlbnQiLCJyYXBDb250ZW50IiwibWFuaWZlc3RDb250ZW50IiwidHNDb250ZW50IiwiY29udGVudCIsImNyZWF0ZUNvbnRlbnQiLCJzaG93Q29kZSIsImNvZGUiLCJsaW5lcyIsImxlYWRpbmdTcGFjZXMiLCJtYXRjaCIsIm1hcCIsIl9jb2RlRWRpdG9yIiwic2V0VmFsdWUiLCJfbmF2aWdhdGlvbkJ1dHRvbiIsInNldFZpc2libGUiLCJhY3RpdmVUYWIiLCJuYXZpZ2F0ZVRvQ29kZSIsImZpbmQiLCJsaW5rIiwid2luZG93IiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJzd2l0Y2hUYWIiLCJldmVudCIsImdldFBhcmFtZXRlciIsInVyaVBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsImxvY2F0aW9uIiwic2VhcmNoIiwic2hvd1JBUENvbnRlbnQiLCJoYXMiLCJfanN4IiwiQ29kZUVkaXRvciIsIm1heExpbmVzIiwiY2xhc3MiLCJsaW5lTnVtYmVycyIsImVkaXRhYmxlIiwid2lkdGgiLCJCdXR0b24iLCJpY29uIiwicHJlc3MiLCJiaW5kIiwiaXRlbXMiLCJJY29uVGFiRmlsdGVyIiwiX2pzeHMiLCJWQm94IiwiY2hpbGRyZW4iLCJJY29uVGFiSGVhZGVyIiwic2VsZWN0IiwiQnVpbGRpbmdCbG9jayIsIl9hcHBseURlY29yYXRlZERlc2NyaXB0b3IiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwid3JpdGFibGUiLCJpbml0aWFsaXplciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29kZUJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2Jhc2UvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQnVpbGRpbmdCbG9jayBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgSWNvblRhYkZpbHRlciBmcm9tIFwic2FwL20vSWNvblRhYkZpbHRlclwiO1xuaW1wb3J0IHR5cGUgeyBJY29uVGFiSGVhZGVyJFNlbGVjdEV2ZW50IH0gZnJvbSBcInNhcC9tL0ljb25UYWJIZWFkZXJcIjtcbmltcG9ydCBJY29uVGFiSGVhZGVyIGZyb20gXCJzYXAvbS9JY29uVGFiSGVhZGVyXCI7XG5pbXBvcnQgVkJveCBmcm9tIFwic2FwL20vVkJveFwiO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXN0cmljdGVkLWltcG9ydHNcbmltcG9ydCBDb2RlRWRpdG9yIGZyb20gXCJzYXAvdWkvY29kZWVkaXRvci9Db2RlRWRpdG9yXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29kZUxpbmsgZnJvbSBcIi4vQ29kZUxpbmtcIjtcblxudHlwZSBDb2RlVHlwZSA9IFwiY2RzXCIgfCBcInhtbFwiIHwgXCJyYXBcIiB8IFwibWFuaWZlc3RcIiB8IFwidHNcIiB8IFwidmlld1wiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5mcG1FeHBsb3Jlci5jb250cm9scy5Db2RlQmxvY2tcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2s8Q29udHJvbD4ge1xuXHQvLyBMaW5raW5nIGNvZGVcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUuY29yZS5mcG1FeHBsb3Jlci5jb250cm9scy5Db2RlTGlua1wiLCBtdWx0aXBsZTogdHJ1ZSwgZGVmYXVsdENsYXNzOiBDb2RlTGluaywgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGNvZGVMaW5rcz86IENvZGVMaW5rW107XG5cblx0Ly8gd2Ugd2lsbCBzdG9yZSB0aGUgY29udGVudCBvZiB0aGUgZmlsZXMgaGVyZVxuXHRwcml2YXRlIGNkc0NvbnRlbnQ/OiBzdHJpbmc7XG5cblx0cHJpdmF0ZSB4bWxDb250ZW50Pzogc3RyaW5nO1xuXG5cdHByaXZhdGUgdmlld0NvbnRlbnQ/OiBzdHJpbmc7XG5cblx0cHJpdmF0ZSByYXBDb250ZW50Pzogc3RyaW5nO1xuXG5cdHByaXZhdGUgbWFuaWZlc3RDb250ZW50Pzogc3RyaW5nO1xuXG5cdHByaXZhdGUgdHNDb250ZW50Pzogc3RyaW5nO1xuXG5cdC8vIHdoaWNoIHR5cGVzIGFsbG93IG5hdmlnYXRpb25cblx0cHJpdmF0ZSBuYXZpZ2F0aW9uOiBDb2RlVHlwZVtdID0gW107XG5cblx0Ly8gdGhlIGN1cnJlbnQgYWN0aXZlIHRhYlxuXHRwcml2YXRlIGFjdGl2ZVRhYiE6IENvZGVUeXBlO1xuXG5cdC8vIHRoZSBpbnN0YW5jZSBvZiB0aGUgY29kZVxuXHRwcml2YXRlIF9jb2RlRWRpdG9yITogQ29kZUVkaXRvcjtcblxuXHQvLyB0aGUgaW5zdGFuY2Ugb2YgdGhlIG5hdmlnYXRpb24gYnV0dG9uXG5cdHByaXZhdGUgX25hdmlnYXRpb25CdXR0b24hOiBCdXR0b247XG5cblx0Ly8gYSBmbGFnIHRvIGNoZWNrIGlmIHRoZSBjb21wb25lbnQgaXMgaW5pdGlhbGl6ZWRcblx0cHJpdmF0ZSBpbml0aWFsaXplZD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIExvYWRzIHRoZSBjb250ZW50IG9mIGEgZmlsZSBmcm9tIHRoZSBnaXZlbiBmaWxlIHBhdGguXG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBUaGUgcGF0aCB0byB0aGUgZmlsZSB0byBiZSBsb2FkZWQuXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb250ZW50IG9mIHRoZSBmaWxlLlxuXHQgKiBAdGhyb3dzIElmIHRoZSBmaWxlIGNhbm5vdCBiZSBsb2FkZWQuXG5cdCAqL1xuXHRhc3luYyBsb2FkRmlsZShmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGZpbGVQYXRoKTtcblxuXHRcdGlmICghcmVzcG9uc2Uub2spIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIHRoZSBjb2RlIGFuZCBzaG93cyBpdCBpbiB0aGUgY29kZSBlZGl0b3IuXG5cdCAqL1xuXHQvLyBAdHMtaWdub3JlXG5cdGFzeW5jIG9uQmVmb3JlUmVuZGVyaW5nKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICghdGhpcy5pbml0aWFsaXplZCkge1xuXHRcdFx0Zm9yIChjb25zdCBjb2RlTGluayBvZiB0aGlzLmNvZGVMaW5rcyB8fCBbXSkge1xuXHRcdFx0XHRsZXQgbGlua2VkQ29kZSA9IFwiXCI7XG5cdFx0XHRcdGxldCBuYXZpZ2F0aW9uRW5hYmxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoY29kZUxpbmsuc3RhcnQpIHtcblx0XHRcdFx0XHRjb25zdCBjb2RlQ29udGVudCA9IGF3YWl0IHRoaXMubG9hZEZpbGUoY29kZUxpbmsuZmlsZSk7XG5cdFx0XHRcdFx0Y29uc3Qgc3BsaXRDb2RlID0gY29kZUNvbnRlbnQuc3BsaXQoXCJcXG5cIik7XG5cdFx0XHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IHNwbGl0Q29kZS5maW5kSW5kZXgoKGxpbmUpID0+IGxpbmUuaW5jbHVkZXMoY29kZUxpbmsuc3RhcnQhKSk7XG5cblx0XHRcdFx0XHRpZiAoc3RhcnRJbmRleCAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdGlmIChjb2RlTGluay5lbmQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoKGNvZGVMaW5rLmNvZGVUeXBlID09PSBcInhtbFwiIHx8IGNvZGVMaW5rLmNvZGVUeXBlID09PSBcInZpZXdcIikgJiYgY29kZUxpbmsuZnVsbFRhZykge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9wZW5pbmdUYWdMaW5lID0gc3BsaXRDb2RlXG5cdFx0XHRcdFx0XHRcdFx0XHQuc2xpY2UoMCwgc3RhcnRJbmRleCArIDEpXG5cdFx0XHRcdFx0XHRcdFx0XHQucmV2ZXJzZSgpXG5cdFx0XHRcdFx0XHRcdFx0XHQuZmluZEluZGV4KChsaW5lKSA9PiBsaW5lLmluY2x1ZGVzKFwiPFwiKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjbG9zaW5nVGFnTGluZSA9IHNwbGl0Q29kZS5zbGljZShzdGFydEluZGV4KS5maW5kSW5kZXgoKGxpbmUpID0+IGxpbmUuaW5jbHVkZXMoXCIvPlwiKSk7XG5cblx0XHRcdFx0XHRcdFx0XHRsaW5rZWRDb2RlID0gc3BsaXRDb2RlXG5cdFx0XHRcdFx0XHRcdFx0XHQuc2xpY2UoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9wZW5pbmdUYWdMaW5lICE9PSAtMSA/IHN0YXJ0SW5kZXggLSBvcGVuaW5nVGFnTGluZSA6IHN0YXJ0SW5kZXgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNsb3NpbmdUYWdMaW5lICE9PSAtMSA/IHN0YXJ0SW5kZXggKyBjbG9zaW5nVGFnTGluZSArIDEgOiBzdGFydEluZGV4ICsgMVxuXHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdFx0LmpvaW4oXCJcXG5cIik7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoIWxpbmtlZENvZGUudHJpbSgpLmVuZHNXaXRoKFwiLz5cIikpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGxpbmtlZENvZGUgPSBsaW5rZWRDb2RlLnRyaW0oKSArIFwiIC8+XCI7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGxpbmtlZENvZGUgPSBzcGxpdENvZGVbc3RhcnRJbmRleF07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIWlzTmFOKE51bWJlcihjb2RlTGluay5lbmQpKSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyBOdW1iZXIoY29kZUxpbmsuZW5kKSAtIDE7XG5cdFx0XHRcdFx0XHRcdGxpbmtlZENvZGUgPVxuXHRcdFx0XHRcdFx0XHRcdGVuZEluZGV4IDwgc3BsaXRDb2RlLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0PyBzcGxpdENvZGUuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmpvaW4oXCJcXG5cIilcblx0XHRcdFx0XHRcdFx0XHRcdDogc3BsaXRDb2RlLnNsaWNlKHN0YXJ0SW5kZXgpLmpvaW4oXCJcXG5cIik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBlbmRJbmRleCA9IHNwbGl0Q29kZS5maW5kSW5kZXgoXG5cdFx0XHRcdFx0XHRcdFx0KGxpbmUsIGluZGV4KSA9PiBpbmRleCA+IHN0YXJ0SW5kZXggJiYgbGluZS5pbmNsdWRlcyhjb2RlTGluay5lbmQgYXMgc3RyaW5nKVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRpZiAoZW5kSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0bGlua2VkQ29kZSA9IHNwbGl0Q29kZS5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCArIDEpLmpvaW4oXCJcXG5cIik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5hdmlnYXRpb25FbmFibGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gd2UgbmVlZCB0aGUgbmFtZSBvZiB0aGUgdGFiIHRvIGJlIGFibGUgdG8gc3dpdGNoIGJldHdlZW4gdGhlbS4gSWYgbm90IGdpdmVuLCB3ZSBhc3N1bWUgdGhlIG5hbWUgb2YgdGhlIGZpbGVcblx0XHRcdFx0XHRcdGlmICghY29kZUxpbmsuZmlsZU5hbWUpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZmlsZU5hbWUgPSBjb2RlTGluay5maWxlLnNwbGl0KFwiL1wiKS5wb3AoKTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29kZUxpbmsuZmlsZU5hbWUgPSBmaWxlTmFtZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsaW5rZWRDb2RlID0gYXdhaXQgdGhpcy5sb2FkRmlsZShjb2RlTGluay5maWxlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHN3aXRjaCAoY29kZUxpbmsuY29kZVR5cGUpIHtcblx0XHRcdFx0XHRjYXNlIFwiY2RzXCI6XG5cdFx0XHRcdFx0XHR0aGlzLmNkc0NvbnRlbnQgPSBsaW5rZWRDb2RlO1xuXHRcdFx0XHRcdFx0aWYgKG5hdmlnYXRpb25FbmFibGVkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubmF2aWdhdGlvbi5wdXNoKFwiY2RzXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcInhtbFwiOlxuXHRcdFx0XHRcdFx0dGhpcy54bWxDb250ZW50ID0gbGlua2VkQ29kZTtcblx0XHRcdFx0XHRcdGlmIChuYXZpZ2F0aW9uRW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm5hdmlnYXRpb24ucHVzaChcInhtbFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJ2aWV3XCI6XG5cdFx0XHRcdFx0XHR0aGlzLnZpZXdDb250ZW50ID0gbGlua2VkQ29kZTtcblx0XHRcdFx0XHRcdGlmIChuYXZpZ2F0aW9uRW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm5hdmlnYXRpb24ucHVzaChcInZpZXdcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwicmFwXCI6XG5cdFx0XHRcdFx0XHR0aGlzLnJhcENvbnRlbnQgPSBsaW5rZWRDb2RlO1xuXHRcdFx0XHRcdFx0aWYgKG5hdmlnYXRpb25FbmFibGVkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubmF2aWdhdGlvbi5wdXNoKFwicmFwXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIm1hbmlmZXN0XCI6XG5cdFx0XHRcdFx0XHR0aGlzLm1hbmlmZXN0Q29udGVudCA9IGxpbmtlZENvZGU7XG5cdFx0XHRcdFx0XHRpZiAobmF2aWdhdGlvbkVuYWJsZWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5uYXZpZ2F0aW9uLnB1c2goXCJtYW5pZmVzdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJ0c1wiOlxuXHRcdFx0XHRcdFx0dGhpcy50c0NvbnRlbnQgPSBsaW5rZWRDb2RlO1xuXHRcdFx0XHRcdFx0aWYgKG5hdmlnYXRpb25FbmFibGVkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubmF2aWdhdGlvbi5wdXNoKFwidHNcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb250ZW50ID0gdGhpcy5jcmVhdGVDb250ZW50KCk7XG5cblx0XHRpZiAodGhpcy5jZHNDb250ZW50KSB7XG5cdFx0XHR0aGlzLnNob3dDb2RlKFwiY2RzXCIpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5tYW5pZmVzdENvbnRlbnQpIHtcblx0XHRcdHRoaXMuc2hvd0NvZGUoXCJtYW5pZmVzdFwiKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMueG1sQ29udGVudCkge1xuXHRcdFx0dGhpcy5zaG93Q29kZShcInhtbFwiKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMudmlld0NvbnRlbnQpIHtcblx0XHRcdHRoaXMuc2hvd0NvZGUoXCJ2aWV3XCIpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy50c0NvbnRlbnQpIHtcblx0XHRcdHRoaXMuc2hvd0NvZGUoXCJ0c1wiKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRm9ybWF0cyBhbmQgc2hvd3MgdGhlIGdpdmVuIGNvZGUgaW4gdGhlIGNvZGUgZWRpdG9yLlxuXHQgKiBAcGFyYW0gY29kZVR5cGUgVGhlIGNvZGUgdHlwZSB0byBiZSBzaG93bi5cblx0ICovXG5cdHNob3dDb2RlKGNvZGVUeXBlOiBDb2RlVHlwZSk6IHZvaWQge1xuXHRcdGxldCBjb2RlID0gdGhpc1tgJHtjb2RlVHlwZX1Db250ZW50YF07XG5cdFx0aWYgKCFjb2RlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gaWYgd2UgZ2V0IHRoZSBjb2RlIGZyb20gdGhlIGZpbGUsIGl0IG1pZ2h0IGhhdmUgc29tZSBleHRyYSBzcGFjZXMgYXQgdGhlIGJlZ2lubmluZ1xuXHRcdC8vIHdlJ2xsIHJlbW92ZSB0aGVtIHRvIG1ha2UgdGhlIGNvZGUgbG9vayBiZXR0ZXJcblx0XHRjb25zdCBsaW5lcyA9IGNvZGUuc3BsaXQoXCJcXG5cIik7XG5cdFx0Y29uc3QgbGVhZGluZ1NwYWNlcyA9IGxpbmVzWzBdLm1hdGNoKC9eXFxzKi8pPy5bMF0ubGVuZ3RoIHx8IDA7XG5cblx0XHRpZiAobGVhZGluZ1NwYWNlcyA+IDApIHtcblx0XHRcdGNvZGUgPSBsaW5lcy5tYXAoKGxpbmUpID0+IGxpbmUuc2xpY2UobGVhZGluZ1NwYWNlcykpLmpvaW4oXCJcXG5cIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY29kZUVkaXRvcj8uc2V0VmFsdWUoY29kZSk7XG5cdFx0dGhpcy5fbmF2aWdhdGlvbkJ1dHRvbi5zZXRWaXNpYmxlKHRoaXMubmF2aWdhdGlvbi5pbmNsdWRlcyhjb2RlVHlwZSkpO1xuXHRcdHRoaXMuYWN0aXZlVGFiID0gY29kZVR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIHRvIHRoZSBjb2RlIGluIHRoZSBjb2RlIGVkaXRvci5cblx0ICovXG5cdG5hdmlnYXRlVG9Db2RlKCk6IHZvaWQge1xuXHRcdGNvbnN0IGZpbGVOYW1lID0gdGhpcy5jb2RlTGlua3M/LmZpbmQoKGxpbmspID0+IGxpbmsuY29kZVR5cGUgPT09IHRoaXMuYWN0aXZlVGFiKT8uZmlsZU5hbWU7XG5cdFx0Y29uc3QgY29kZSA9IHRoaXNbYCR7dGhpcy5hY3RpdmVUYWJ9Q29udGVudGBdIGFzIHN0cmluZztcblx0XHR3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKHsgdHlwZTogXCJuYXZpZ2F0ZVRvQ29kZVwiLCBjb2RlOiBjb2RlLCBmaWxlOiBmaWxlTmFtZSB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTd2l0Y2hlcyB0aGUgdGFiIGFuZCBzaG93cyB0aGUgY29kZSBvZiB0aGUgc2VsZWN0ZWQgdGFiLlxuXHQgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgd2FzIHRyaWdnZXJlZC5cblx0ICovXG5cdHN3aXRjaFRhYihldmVudDogSWNvblRhYkhlYWRlciRTZWxlY3RFdmVudCk6IHZvaWQge1xuXHRcdGNvbnN0IGNvZGVUeXBlID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwia2V5XCIpIGFzIENvZGVUeXBlO1xuXHRcdHRoaXMuc2hvd0NvZGUoY29kZVR5cGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIGNvbnRlbnQgb2YgdGhlIGJ1aWxkaW5nIGJsb2NrLlxuXHQgKiBAcmV0dXJucyBUaGUgY29udGVudCBvZiB0aGUgYnVpbGRpbmcgYmxvY2suXG5cdCAqL1xuXHRjcmVhdGVDb250ZW50KCk6IFZCb3gge1xuXHRcdGNvbnN0IHVyaVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LnBhcmVudC5sb2NhdGlvbi5zZWFyY2gpO1xuXHRcdGxldCBzaG93UkFQQ29udGVudCA9IGZhbHNlO1xuXG5cdFx0aWYgKHVyaVBhcmFtcy5oYXMoXCJzaG93UkFQQ29udGVudFwiKSkge1xuXHRcdFx0c2hvd1JBUENvbnRlbnQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvZGVFZGl0b3IgPSAoXG5cdFx0XHQ8Q29kZUVkaXRvciBtYXhMaW5lcz17MjB9IGNsYXNzPVwic2FwVWlUaW55TWFyZ2luXCIgdHlwZT1cInJlZFwiIGxpbmVOdW1iZXJzPVwiZmFsc2VcIiBlZGl0YWJsZT1cImZhbHNlXCIgd2lkdGg9XCIxMDAlXCIgLz5cblx0XHQpO1xuXHRcdHRoaXMuX25hdmlnYXRpb25CdXR0b24gPSAoXG5cdFx0XHQ8QnV0dG9uIHR5cGU9XCJUcmFuc3BhcmVudFwiIHRleHQ9XCJTaG93IENvZGVcIiBpY29uPVwic2FwLWljb246Ly9zeW50YXhcIiBwcmVzcz17dGhpcy5uYXZpZ2F0ZVRvQ29kZS5iaW5kKHRoaXMpfSAvPlxuXHRcdCk7XG5cblx0XHRjb25zdCBpdGVtcyA9IFtdO1xuXHRcdGlmICh0aGlzLmNkc0NvbnRlbnQpIHtcblx0XHRcdGl0ZW1zLnB1c2goPEljb25UYWJGaWx0ZXIgdGV4dD1cIkNBUFwiIGtleT1cImNkc1wiIC8+KTtcblx0XHR9XG5cdFx0aWYgKHRoaXMubWFuaWZlc3RDb250ZW50KSB7XG5cdFx0XHRpdGVtcy5wdXNoKDxJY29uVGFiRmlsdGVyIHRleHQ9XCJNYW5pZmVzdFwiIGtleT1cIm1hbmlmZXN0XCIgLz4pO1xuXHRcdH1cblx0XHRpZiAoc2hvd1JBUENvbnRlbnQgJiYgdGhpcy5yYXBDb250ZW50KSB7XG5cdFx0XHRpdGVtcy5wdXNoKDxJY29uVGFiRmlsdGVyIHRleHQ9XCJSQVBcIiBrZXk9XCJyYXBcIiAvPik7XG5cdFx0fVxuXHRcdGlmICh0aGlzLnhtbENvbnRlbnQpIHtcblx0XHRcdGl0ZW1zLnB1c2goPEljb25UYWJGaWx0ZXIgdGV4dD1cIlhNTFwiIGtleT1cInhtbFwiIC8+KTtcblx0XHR9XG5cdFx0aWYgKHRoaXMudmlld0NvbnRlbnQpIHtcblx0XHRcdGl0ZW1zLnB1c2goPEljb25UYWJGaWx0ZXIgdGV4dD1cIlZpZXdcIiBrZXk9XCJ2aWV3XCIgLz4pO1xuXHRcdH1cblx0XHRpZiAodGhpcy50c0NvbnRlbnQpIHtcblx0XHRcdGl0ZW1zLnB1c2goPEljb25UYWJGaWx0ZXIgdGV4dD1cIkNvbnRyb2xsZXJcIiBrZXk9XCJ0c1wiIC8+KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PFZCb3g+XG5cdFx0XHRcdDxJY29uVGFiSGVhZGVyIHNlbGVjdD17dGhpcy5zd2l0Y2hUYWIuYmluZCh0aGlzKX0+XG5cdFx0XHRcdFx0e3tcblx0XHRcdFx0XHRcdGl0ZW1zOiBpdGVtc1xuXHRcdFx0XHRcdH19XG5cdFx0XHRcdDwvSWNvblRhYkhlYWRlcj57XCIgXCJ9XG5cdFx0XHRcdGFzIEljb25UYWJIZWFkZXJcblx0XHRcdFx0e3RoaXMuX2NvZGVFZGl0b3J9XG5cdFx0XHRcdHt0aGlzLl9uYXZpZ2F0aW9uQnV0dG9ufVxuXHRcdFx0PC9WQm94PlxuXHRcdCk7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztFQU9BO0VBQUEsSUFRcUJBLFNBQVMsSUFBQUMsSUFBQSxHQUQ3QkMsY0FBYyxDQUFDLDRDQUE0QyxDQUFDLEVBQUFDLEtBQUEsR0FHM0RDLFdBQVcsQ0FBQztJQUFFQyxJQUFJLEVBQUUsMkNBQTJDO0lBQUVDLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFlBQVksRUFBRUMsUUFBUTtJQUFFQyxTQUFTLEVBQUU7RUFBSyxDQUFDLENBQUMsRUFBQVIsSUFBQSxDQUFBUyxNQUFBLElBQUFDLE9BQUEsMEJBQUFDLGNBQUE7SUFBQSxTQUFBWixVQUFBO01BQUEsSUFBQWEsS0FBQTtNQUFBLFNBQUFDLElBQUEsR0FBQUMsU0FBQSxDQUFBQyxNQUFBLEVBQUFDLElBQUEsT0FBQUMsS0FBQSxDQUFBSixJQUFBLEdBQUFLLElBQUEsTUFBQUEsSUFBQSxHQUFBTCxJQUFBLEVBQUFLLElBQUE7UUFBQUYsSUFBQSxDQUFBRSxJQUFBLElBQUFKLFNBQUEsQ0FBQUksSUFBQTtNQUFBO01BQUFOLEtBQUEsR0FBQUQsY0FBQSxDQUFBUSxJQUFBLFVBQUFILElBQUE7TUFENUg7TUFBQUksMEJBQUEsQ0FBQVIsS0FBQSxlQUFBUyxXQUFBLEVBQUFULEtBQUE7TUFpQkE7TUFBQUEsS0FBQSxDQUNRVSxVQUFVLEdBQWUsRUFBRTtNQUFBLE9BQUFWLEtBQUE7SUFBQTtJQUFBVyxRQUFBLEdBQUF4QixTQUFBO0lBQUF5QixjQUFBLENBQUF6QixTQUFBLEVBQUFZLGNBQUE7SUFBQSxJQUFBYyxNQUFBLEdB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