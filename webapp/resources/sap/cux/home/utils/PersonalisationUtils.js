/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/core/Component"],function(n,t){"use strict";const e="sap.cux";const r=n.extend("sap.cux.home.utils.PersonalisationUtils",{constructor:function t(){n.prototype.constructor.call(this)},getPersContainerId:function n(r,o=false){if(this.persContainerId&&!o){return this.persContainerId}return`${t.getOwnerIdFor(r)}--${e}`},setPersContainerId:function n(t){this.persContainerId=t},getOwnerComponent:function n(e){return t.getOwnerComponentFor(e)}});var o=new r;return o});
//# sourceMappingURL=PersonalisationUtils.js.map