/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";let s=function(){function s(){this._issues=[]}var e=s.prototype;e.addIssue=function s(e,t,i,r,u){const n=this.checkIfIssueExists(e,t,i,r,u);if(!n){this._issues.push({category:e,severity:t,details:i,subCategory:u})}};e.getIssues=function s(){return this._issues};e.getIssuesByCategory=function s(e,t){if(t){return this._issues.filter(s=>s.category===e&&s.subCategory===t)}else{return this._issues.filter(s=>s.category===e)}};e.checkIfIssueExists=function s(e,t,i,r,u){if(r&&r[e]&&u){return this._issues.some(s=>s.category===e&&s.severity===t&&s.details.replace(/\n/g,"")===i.replace(/\n/g,"")&&s.subCategory===u)}return this._issues.some(s=>s.category===e&&s.severity===t&&s.details.replace(/\n/g,"")===i.replace(/\n/g,""))};return s}();return s},false);
//# sourceMappingURL=Diagnostics.js.map