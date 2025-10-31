/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./sinaNexTS/sina/HierarchyDisplayType"],function(e){"use strict";const r=e["HierarchyDisplayType"];class t{model;constructor(e){this.model=e}formatNodePaths(e){if(e){const r=this._selectNodePath(e);if(r){return r.path}}return[]}formatHierarchyAttribute(e){if(e){const r=this._selectNodePath(e);if(r){return r.name}}return""}_selectNodePath(e){const t=e.hierarchyNodePaths;if(t&&Array.isArray(t)&&t.length>0){for(let a=0;a<t.length;a++){const i=t[a];const s=i.name;if(i&&Array.isArray(i.path)&&s){const t=e.query.getDataSource()?.attributesMetadata?.find(e=>e.id===s);if(t&&t.isHierarchy===true&&(t.hierarchyDisplayType===r.HierarchyResultView||t.hierarchyDisplayType===r.StaticHierarchyFacet)){return i}}}}return null}}var a={__esModule:true};a.Formatter=t;return a});
//# sourceMappingURL=BreadcrumbsFormatter.js.map