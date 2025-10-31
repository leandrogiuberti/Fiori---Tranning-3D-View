/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/util","./Formatter"],function(e,t){"use strict";const r=t["Formatter"];class s extends r{initAsync(){return Promise.resolve()}format(e){return e}async formatAsync(t){t=e.addPotentialNavTargets(t);return Promise.resolve(t)}}var a={__esModule:true};a.NavtargetsInResultSetFormatter=s;return a});
//# sourceMappingURL=NavtargetsInResultSetFormatter.js.map