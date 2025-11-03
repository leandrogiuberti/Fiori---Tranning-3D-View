/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ResultSet"],function(t){"use strict";const e=t["ResultSet"];class s extends e{type;facetTotalCount;constructor(t){super(t);this.facetTotalCount=t.facetTotalCount??this.facetTotalCount}toString(){const t=[];t.push("### Facet "+this.title);for(let e=0;e<this.items.length;++e){const s=this.items[e];t.push("  - [ ] "+s.toString())}if(this.items.length===0){t.push("No attribute filters found")}return t.join("\n")}}var n={__esModule:true};n.FacetResultSet=s;return n});
//# sourceMappingURL=FacetResultSet.js.map