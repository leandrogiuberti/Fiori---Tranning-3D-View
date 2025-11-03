/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";class t{title;facetType;dimension;dataType;matchingStrategy;items;totalCount;visible;position;constructor(t){this.title=t.title;this.facetType=t.facetType;this.dimension=t.dimension;this.dataType=t.dataType;this.matchingStrategy=t.matchingStrategy;this.items=t.items||[];this.totalCount=t.totalCount;this.visible=t.visible||true}hasFilterCondition(t){for(let i=0,e=this.items.length;i<e;i++){const e=this.items[i].filterCondition;if(e.equals&&e.equals(t)){return true}}return false}hasFilterConditions(){for(let t=0,i=this.items.length;t<i;t++){if(this.items[t].filterCondition){return true}}return false}removeItem(t){for(let i=0,e=this.items.length;i<e;i++){const e=this.items[i].filterCondition;if(e.equals&&t.filterCondition&&e.equals(t.filterCondition)){return this.items.splice(i,1)}}}}return t});
//# sourceMappingURL=Facet.js.map