/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/IconTabFilter","sap/ui/core/Element"],function(t,e){"use strict";const n=t.extend("sap.cux.home.SideBySideIconTabFilter",{metadata:{library:"sap.cux.home",associations:{panel:{type:"sap.cux.home.BasePanel",multiple:false,singularName:"panel"}}},renderer:"sap.m.IconTabFilterRenderer",constructor:function e(n,o){t.prototype.constructor.call(this,n,o)},setPanel:function t(e){this.setProperty("key",e.getProperty("key"),true);this.setProperty("text",e.getProperty("title"),true);this.setTooltip(e.getProperty("tooltip"));this.setAssociation("panel",e);return this},getContent:function t(){const n=e.getElementById(this.getPanel());return n?.getContent()||[]},addContent:function t(n){const o=e.getElementById(this.getPanel());o?.addContent(n);return this}});return n});
//# sourceMappingURL=SideBySideIconTabFilter.js.map