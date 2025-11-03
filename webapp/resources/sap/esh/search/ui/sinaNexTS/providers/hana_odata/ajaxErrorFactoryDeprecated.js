/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/errors","../../sina/i18n"],function(e,r){"use strict";const s=e["ServerErrorCode"];const t=e["ServerError"];const o=r["getText"];function a(e,r){if(r.status!==500||!r.data){return}const a=r.dataJSON;if(!a){return}if(typeof a!=="object"){return}if(!a.code&&!a.message&&!a.details){return}const n=[];n.push(o("error.sina.searchServiceCallFailed"));if(a?.code){n.push(o("error.sina.errorCode",[a.code]))}if(a?.message){n.push(o("error.sina.errorMessage",[a.message]))}return new t({request:e,response:r,code:s.E001,message:n.join("\n"),details:""+a.details})}var n={__esModule:true};n.deprecatedAjaxErrorFactory=a;return n});
//# sourceMappingURL=ajaxErrorFactoryDeprecated.js.map