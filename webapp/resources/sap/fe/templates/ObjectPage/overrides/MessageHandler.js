/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils"],function(e){"use strict";const t={getShowBoundMessagesInMessageDialog:function(){return!e.getIsEditable(this.base)||this.base.getView().getBindingContext("internal").getProperty("isOperationDialogOpen")||this.base.getView().getBindingContext("internal").getProperty("getBoundMessagesForMassEdit")},filterContextBoundMessages(e,t){const n=[];e?.forEach(e=>{if(e.getTargets().length===1&&e.getTargets()[0]===t?.getPath()&&e.getPersistent()===true){n.push(e)}});if(n.length===1){e=e?.filter(function(e){return e!==n[0]})}return e}};return t},false);
//# sourceMappingURL=MessageHandler.js.map