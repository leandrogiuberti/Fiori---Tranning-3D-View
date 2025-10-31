/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/m/Button","../../UIEvents","sap/ui/core/EventBus"],function(t,e,s){"use strict";function i(t){return t&&t.__esModule&&typeof t.default!=="undefined"?t.default:t}const n=i(e);const o=t.extend("sap.esh.search.ui.controls.SearchShowDetailButton",{metadata:{properties:{visualisation:{type:"string",defaultValue:"arrow"}},aggregations:{_text:{type:"sap.m.Text",multiple:false},icon:{type:"sap.ui.core.Icon",multiple:false}}},constructor:function e(s,i){t.prototype.constructor.call(this,s,i)},setVisualisation:function t(e){this.setProperty("visualisation",e);return this},press:function t(e){const i=this.getModel();i.notifySubscribers(n.ESHShowResultDetail);s.getInstance().publish(n.ESHShowResultDetail,this)}});return o});
//# sourceMappingURL=SearchShowDetailButton.js.map