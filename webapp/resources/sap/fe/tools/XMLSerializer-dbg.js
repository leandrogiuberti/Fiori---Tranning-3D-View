/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/util/serializer/Serializer"], function (Serializer) {
  "use strict";

  var _exports = {};
  // @ts-ignore
  const nameSpaceMap = {
    macro: "sap.fe.macros",
    macros: "sap.fe.macros",
    feBB: "sap.fe.core.buildingBlocks.templating",
    macroField: "sap.fe.macros.field",
    macrodata: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    log: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    customData: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    control: "sap.fe.core.controls",
    controls: "sap.fe.macros.controls",
    core: "sap.ui.core",
    dt: "sap.ui.dt",
    m: "sap.m",
    f: "sap.ui.layout.form",
    fl: "sap.ui.fl",
    internalMacro: "sap.fe.macros.internal",
    mdc: "sap.ui.mdc",
    actiontoolbar: "sap.ui.mdc.actiontoolbar",
    mdcField: "sap.ui.mdc.field",
    mdcTable: "sap.ui.mdc.table",
    u: "sap.ui.unified",
    uxap: "sap.uxap",
    macroMicroChart: "sap.fe.macros.microchart",
    microChart: "sap.suite.ui.microchart",
    macroTable: "sap.fe.macros.table",
    mdcvc: "sap.ui.mdc.valuehelp.content",
    mdcv: "sap.ui.mdc.valuehelp",
    valueHelp: "sap.fe.macros.valueHelp",
    contentSwitcher: "sap.fe.macros.contentSwitcher",
    filterBar: "sap.fe.macros.filterBar",
    draftIndicator: "sap.fe.macros.draftIndicator",
    visualFilter: "sap.fe.macros.visualFilters"
  };
  const reveseNamespaceMap = Object.keys(nameSpaceMap).reduce((reverseMap, currentName) => {
    reverseMap[nameSpaceMap[currentName]] = currentName;
    return reverseMap;
  }, {});
  function escapeXMLAttributeValue(value) {
    return value?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  _exports.escapeXMLAttributeValue = escapeXMLAttributeValue;
  function serializeObject(objectType) {
    let maxDepth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
    if (maxDepth == 0) return undefined;
    if (!objectType) {
      return undefined;
    }
    const keys = Object.keys(objectType);
    const out = keys.map(key => {
      const value = objectType[key];
      if (typeof value === "function") {
        return "";
      } else if (typeof value === "object") {
        return `${key}: ${serializeObject(value, maxDepth - 1)}`;
      } else {
        return `${key}: ${value}`;
      }
    });
    return out.filter(val => val.length).join(", ");
  }
  function serializeControlAsXML(controlToSerialize) {
    let showCustomStyleClasses = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let asString = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let tabCount = 0;
    const UID = /uid--id-\d{13}-\d{1,3}/;
    const CONTROLID = /id-\d{13}-\d{1,3}/;
    const definedNamespaces = {};
    function getNamespaceAlias(className) {
      const namesSplit = className.split(".");
      const namespace = namesSplit.slice(0, -1);
      let namespaceAlias = namespace[namespace.length - 1];
      if (reveseNamespaceMap[namespace.join(".")]) {
        namespaceAlias = reveseNamespaceMap[namespace.join(".")];
      }
      if (namespaceAlias === undefined) {
        namespaceAlias = "test";
      }
      return namespaceAlias.toLowerCase();
    }
    function getTab() {
      let toAdd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let tab = "";
      for (let i = 0; i < tabCount + toAdd; i++) {
        tab += "\t";
      }
      return tab;
    }
    const serializeDelegate = {
      start: function (control, sAggregationName) {
        let controlDetail = "";
        if (sAggregationName) {
          if (control.getParent()) {
            const indexInParent = control.getParent().getAggregation(sAggregationName)?.indexOf?.(control);
            if (indexInParent > 0) {
              controlDetail += `\n${getTab()}`;
            }
          }
        }
        const nameFull = control.getMetadata().getName();
        const namesSplit = nameFull.split(".");
        const name = namesSplit[namesSplit.length - 1];
        const namespaceAlias = getNamespaceAlias(nameFull);
        controlDetail += `<${namespaceAlias}:${name}\n`;
        //if (!definedNamespaces[namespaceAlias]) {
        definedNamespaces[namespaceAlias] = true;
        controlDetail += `${getTab()}xmlns:${namespaceAlias}="${nameSpaceMap[namespaceAlias]}"`;
        //}
        return controlDetail;
      },
      end: function (control) {
        const nameFull = control.getMetadata().getName();
        const namesSplit = nameFull.split(".");
        const name = namesSplit[namesSplit.length - 1];
        const namespaceAlias = getNamespaceAlias(nameFull);
        let hasAggregation = false;
        const mAggregations = control.getMetadata().getAllAggregations();
        for (const mAggregationsKey in mAggregations) {
          const controlAggregation = control[mAggregations[mAggregationsKey]._sGetter]();
          if (!Array.isArray(controlAggregation) && controlAggregation !== null && controlAggregation !== undefined || Array.isArray(controlAggregation) && controlAggregation.length > 0) {
            hasAggregation = true;
          }
          if (control.getBindingPath(mAggregationsKey) && control.getBindingInfo(mAggregationsKey).template) {
            hasAggregation = true;
          }
        }
        if (hasAggregation) {
          return `</${namespaceAlias}:${name}>`;
        } else {
          return `/>`;
        }
      },
      middle: function (control) {
        let id = control.getId();
        id = typeof id === "string" ? id?.replace?.(CONTROLID, "id") : id;
        let data = "";
        //if (!ManagedObjectMetadata.isGeneratedId(id)) {
        data = ` id="${id}"`;
        //}
        let keys = Object.keys(control.mProperties).concat(Object.keys(control.mBindingInfos)).concat(Object.keys(control.mAssociations)).concat(Object.keys(control.mEventRegistry));
        keys = keys.sort((a, b) => a.localeCompare(b));
        const uniqueKeys = new Set(keys);
        keys = Array.from(uniqueKeys);
        for (const oControlKey of keys) {
          if (oControlKey !== "id") {
            if (control.mBindingInfos.hasOwnProperty(oControlKey)) {
              const bindingDetail = {
                ...control.mBindingInfos[oControlKey]
              };
              if (bindingDetail.bindingString) {
                data += `\n${getTab()}${oControlKey}="${escapeXMLAttributeValue(bindingDetail.bindingString)}"`;
              } else {
                if (bindingDetail.type?.oOutputFormat) {
                  delete bindingDetail.type.oOutputFormat;
                }
                if (bindingDetail.binding) {
                  delete bindingDetail.binding;
                }
                if (bindingDetail.template) {
                  delete bindingDetail.template;
                }
                data += `\n${getTab()}${oControlKey}='${escapeXMLAttributeValue(serializeObject(bindingDetail))}'`;
              }
            } else if (control.mProperties.hasOwnProperty(oControlKey) && control.mProperties[oControlKey] !== undefined) {
              let propertyValue = control.mProperties[oControlKey];
              propertyValue = typeof propertyValue === "string" ? propertyValue?.replace?.(UID, "uid--id") : propertyValue;
              propertyValue = typeof propertyValue === "string" ? propertyValue?.replace?.(CONTROLID, "id") : propertyValue;
              try {
                propertyValue = typeof propertyValue === "object" ? escapeXMLAttributeValue(serializeObject(propertyValue)) : escapeXMLAttributeValue(propertyValue);
              } catch (e) {
                // Stringify may fail for circular references but it's not the end of the world
              }
              data += `\n${getTab()} ${oControlKey}="${propertyValue}"`;
            } else if (control.mAssociations.hasOwnProperty(oControlKey)) {
              let associationValue = control.mAssociations[oControlKey];
              if (!Array.isArray(associationValue)) {
                associationValue = [associationValue];
              }
              associationValue = associationValue.map(associationValueElement => {
                return typeof associationValueElement === "string" ? associationValueElement?.replace?.(CONTROLID, "id") : associationValueElement;
              });
              data += `\n${getTab()} ${oControlKey}="${(associationValue?.join?.(",") ?? associationValue) || undefined}"`;
            } else if (control.mEventRegistry.hasOwnProperty(oControlKey)) {
              if (control.mEventRegistry[oControlKey][0]?.fFunction?.name) {
                data += `\n${getTab()} ${oControlKey}="${control.mEventRegistry[oControlKey][0]?.fFunction?.name}"`;
              } else {
                data += `\n${getTab()} ${oControlKey}="someEventHandler"`;
              }
            }
          }
        }
        if (showCustomStyleClasses && control.aCustomStyleClasses?.length > 0) {
          data += `\n${getTab()} customStyleClasses : ${control.aCustomStyleClasses.join(", ")}`;
        }
        data += `\n`;
        let hasAggregation = false;
        const mAggregations = control.getMetadata().getAllAggregations();
        for (const mAggregationsKey in mAggregations) {
          const controlAggregation = control[mAggregations[mAggregationsKey]._sGetter]();
          if (!Array.isArray(controlAggregation) && controlAggregation !== null && controlAggregation !== undefined || Array.isArray(controlAggregation) && controlAggregation.length > 0) {
            hasAggregation = true;
          }
          if (control.getBindingPath(mAggregationsKey) && control.getBindingInfo(mAggregationsKey).template) {
            hasAggregation = true;
          }
        }
        if (hasAggregation) {
          data += ">";
        }
        return data;
      },
      startAggregation: function (control, sName) {
        const namespaceAlias = getNamespaceAlias(control.getMetadata().getName());
        if (sName.startsWith("$")) {
          sName = sName.substring(1);
        }
        let out = `\n${getTab()}<${namespaceAlias}:${sName}>`;
        tabCount++;
        out += `\n${getTab()}`;
        return out;
      },
      endAggregation: function (control, sName) {
        tabCount--;
        if (sName.startsWith("$")) {
          sName = sName.substring(1);
        }
        const namespaceAlias = getNamespaceAlias(control.getMetadata().getName());
        if (control.mBindingInfos[sName]) {
          return `\n${getTab()}</${namespaceAlias}:${sName}>\n`;
        } else {
          return `\n${getTab()}</${namespaceAlias}:${sName}>\n`;
        }
      }
    };
    let outXML;
    if (Array.isArray(controlToSerialize)) {
      outXML = controlToSerialize.map(controlToRender => {
        return new Serializer(controlToRender, serializeDelegate).serialize();
      });
    } else {
      outXML = new Serializer(controlToSerialize, serializeDelegate).serialize();
    }
    if (asString) {
      return Array.isArray(outXML) ? outXML.join("\n") : outXML;
    }
    const xmlString = `<root>${outXML}</root>`;
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, "text/xml").firstElementChild?.firstElementChild?.outerHTML ?? "No Content";
  }
  _exports.serializeControlAsXML = serializeControlAsXML;
  async function serializeControlAsFormattedXML(ui5ControlOrBB) {
    const serialized = serializeControlAsXML(ui5ControlOrBB);
    return serialized;
  }
  _exports.serializeControlAsFormattedXML = serializeControlAsFormattedXML;
  return _exports;
}, false);
//# sourceMappingURL=XMLSerializer-dbg.js.map
