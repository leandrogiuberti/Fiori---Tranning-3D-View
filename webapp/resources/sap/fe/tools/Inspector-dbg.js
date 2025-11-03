/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/tools/XMLSerializer", "sap/m/Panel", "sap/m/Text", "sap/ui/codeeditor/CodeEditor", "sap/ui/core/Element", "sap/ui/core/Popup", "sap/fe/base/jsx-runtime/jsx"], function (XMLSerializer, Panel, Text, CodeEditor, UI5Element, Popup, _jsx) {
  "use strict";

  var _exports = {};
  var serializeControlAsXML = XMLSerializer.serializeControlAsXML;
  function onMouseOver(e) {
    const target = e.target;
    if (target) {
      const closestUI5Elt = target.closest("[data-sap-ui]");
      if (closestUI5Elt && !isLocked) {
        closestUI5Elt.style.outline = "2px auto rebeccapurple";
        inspector?.showElement(UI5Element.getElementById(closestUI5Elt.getAttribute("data-sap-ui")));
      }
    }
  }
  function onKeyDown(e) {
    if (e.ctrlKey) {
      isLocked = !isLocked;
      if (isLocked) {
        const target = e.target;
        if (target) {
          const closestUI5Elt = target.closest("[data-sap-ui]");
          if (closestUI5Elt) {
            closestUI5Elt.style.outline = "3px auto red";
            lastTarget = closestUI5Elt;
          }
        }
      } else if (lastTarget) {
        lastTarget.style.outline = "none";
      }
      // @ts-ignore
      if (window.$fe.supportModel.getProperty("/preventInteraction")) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  }
  function onMouseDown(e) {
    isLocked = !isLocked;
    if (isLocked) {
      const target = e.target;
      if (target) {
        const closestUI5Elt = target.closest("[data-sap-ui]");
        if (closestUI5Elt) {
          closestUI5Elt.style.outline = "3px auto red";
          lastTarget = closestUI5Elt;
        }
      }
    } else if (lastTarget) {
      lastTarget.style.outline = "none";
    }
    // @ts-ignore
    if (window.$fe.supportModel.getProperty("/preventInteraction")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
  function onMouseClick(e) {
    // @ts-ignore
    if (window.$fe.supportModel.getProperty("/preventInteraction")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
  function onMouseOut(e) {
    const target = e.target;
    if (target && !isLocked) {
      const closestUI5Elt = target.closest("[data-sap-ui]");
      if (closestUI5Elt) {
        closestUI5Elt.style.outline = "none";
      }
    }
  }
  let lastTarget;
  let isInspecting = false;
  let isLocked = false;
  let inspector = null;
  function toggleElementInspector(textRef) {
    if (!isInspecting) {
      isInspecting = true;
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mouseover", onMouseOver);
      document.addEventListener("click", onMouseClick);
      document.addEventListener("mouseout", onMouseOut);
      if (!textRef) {
        const localInspector = showInspector();
        inspector = {
          showElement: function (ui5Control) {
            localInspector.removeAllContent();
            localInspector.addContent(_jsx(CodeEditor, {
              type: "XML",
              height: "500px",
              value: serializeControlAsXML(ui5Control)
            }));
          }
        };
      } else {
        inspector = textRef;
      }
    } else {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("click", onMouseClick);
      document.removeEventListener("mouseout", onMouseOut);
      isInspecting = false;
    }
  }
  _exports.toggleElementInspector = toggleElementInspector;
  function showInspector() {
    const subInspector = _jsx(Panel, {
      width: "500px",
      headerText: "UI5 Element Inspector",
      expanded: true,
      children: {
        content: _jsx(Text, {
          text: "Hover over an element to inspect it"
        })
      }
    });
    const popup = new Popup(subInspector);
    popup.open(Popup.Dock.EndBottom, Popup.Dock.EndBottom);
    return subInspector;
  }
  return _exports;
}, false);
//# sourceMappingURL=Inspector-dbg.js.map
