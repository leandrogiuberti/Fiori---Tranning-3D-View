/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";function t(t){let e;return function(...n){if(!e){e=t.apply(this,n)}else{e=e.then(()=>t.apply(this,n),()=>t.apply(this,n))}const i=e;i.finally(()=>{if(i===e){e=null}}).catch(()=>{});return e}}var e={__esModule:true};e.sequentializedExecution=t;return e});
//# sourceMappingURL=SearchHelperSequentializeDecorator.js.map