/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/documentation/sdk/controller/StaticResourceBaseController"],function(t){"use strict";return t.extend("sap.ui.documentation.sdk.controller.BPSupport",{onInit:function(){var n="BPSupport";t.prototype.onInit.call(this,n)},_getPathToContent:function(){return this.getOwnerComponent().getConfigUtil().getPathToBPSupportStatement()},_decorateContent(t){return'<div id="d4h5-main-container" class="bpsupport">'+t+"</div>"}})});
//# sourceMappingURL=BPSupport.controller.js.map