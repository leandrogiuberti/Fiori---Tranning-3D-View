/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["./BaseApp"],function(e){"use strict";function t(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const p=t(e);const r=p.extend("sap.cux.home.Group",{metadata:{library:"sap.cux.home",properties:{number:{type:"string",group:"Misc",defaultValue:""},groupId:{type:"string",group:"Misc",defaultValue:""},pageId:{type:"string",group:"Misc",defaultValue:""}},aggregations:{apps:{type:"sap.cux.home.App",multiple:true,singularName:"app"}},events:{press:{parameters:{groupId:{type:"string"},pageId:{type:"string"}}}}},constructor:function e(t,r){p.prototype.constructor.call(this,t,r)},_handlePress:function e(){this.firePress({groupId:this.getGroupId(),pageId:this.getPageId()})}});return r});
//# sourceMappingURL=Group.js.map