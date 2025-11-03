/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../error/ErrorHandler","sap/ushell_abap/components/TCodeNavigation","../i18n"],function(e,r,t){"use strict";function o(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const s=o(e);const n=o(t);class a{errorHandler=s.getInstance();constructor(e){this.searchModel=e}handleTCodeError(e){let r=n.getText("error.TCodeUnknownError.message");if(e.messagecode&&e.messagecode==="NO_INBOUND_FOUND"){r=n.getText("error.TCodeNotFound.message")}this.searchModel.setProperty("/suggestions",[{label:r}])}handleSearchTerm(e){let t=false;if(window.sap.cf){return t}let o;if(e.toLowerCase().indexOf("/n")===0){o=false}if(e.toLowerCase().indexOf("/o")===0){o=true}if(typeof o!=="undefined"){this.searchModel.setProperty("/suggestions",[]);t=true;const s=e.slice(2);r.navigateByTCode(s,o).then(()=>{this.searchModel.setSearchBoxTerm("",false)}).catch(e=>{this.handleTCodeError(e)})}return t}}return a});
//# sourceMappingURL=TransactionsHandler.js.map