/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/macros/insights/CommonInsightsHelper"],function(e,t,a){"use strict";var n={};var o=a.showGenericErrorMessage;const s={INTEGRATION:"integration"};n.RetrieveCardTypes=s;const r={async collectAvailableCards(a){const n=this.base.getView();const r=n.getController();const i=r.getOwnerComponent().getAppComponent();const c=t.getIsEditable(n);const l=!c?await i.getCollaborationManagerService().getDesignTimeCard(s.INTEGRATION):undefined;if(l){const t=()=>{try{if(l){i.getCollaborationManagerService().publishCard(l);return}}catch(t){o(n);e.error(t)}};const s=await r._getPageTitleInformation();a.push({card:l,title:s.subtitle||"",callback:t})}}};return r},false);
//# sourceMappingURL=CollaborationManager.js.map