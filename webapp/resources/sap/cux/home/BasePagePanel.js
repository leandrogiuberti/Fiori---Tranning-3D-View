/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["./BasePanel"],function(e){"use strict";function t(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const n=t(e);const a=n.extend("sap.cux.home.BasePagePanel",{metadata:{library:"sap.cux.home",properties:{title:{type:"string",group:"Misc"},key:{type:"string",group:"Misc"}},aggregations:{content:{multiple:true,singularName:"content",visibility:"hidden"},pages:{type:"sap.cux.home.Page",singularName:"page",multiple:true}}},constructor:function e(t,a){n.prototype.constructor.call(this,t,a)}});return a});
//# sourceMappingURL=BasePagePanel.js.map