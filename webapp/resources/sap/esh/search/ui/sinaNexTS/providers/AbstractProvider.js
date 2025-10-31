/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../sina/SinaObject"],function(e){"use strict";const r=e["SinaObject"];class s extends r{label;serverInfo;searchEngine;logUserEvent(e){}getDebugInfo(){return"ESH Search API Provider: "+this.id}isQueryPropertySupported(e){return false}async resetPersonalizedSearchDataAsync(e){return Promise.resolve()}}var t={__esModule:true};t.AbstractProvider=s;return t});
//# sourceMappingURL=AbstractProvider.js.map