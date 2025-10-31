/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../sina/HierarchyQuery"],function(e){"use strict";const t=e["HierarchyQuery"];class n{parseHierarchyFacet(e,n,r){const a=e instanceof t?e.nodeId:"$$ROOT$$";const o=e.sina.createHierarchyQuery({filter:e.filter.clone(),attributeId:n.id,nodeId:a,nlq:e.nlq});const i=e.sina._createHierarchyResultSet({query:o,node:null,items:[],title:r["@com.sap.vocabularies.Common.v1.Label"]||"",facetTotalCount:undefined});const s={};const c=[];const d=r.Items||[];for(const t of d){const r=t[n.id];let a=s[r];if(!a){a=e.sina.createHierarchyNode({id:r,label:t[n.id+"@com.sap.vocabularies.Common.v1.Text"],count:t._Count,hasChildren:t._HasChildren});c.push(a);s[r]=a}else{a.label=t[n.id+"@com.sap.vocabularies.Common.v1.Text"];a.count=t._Count}const o=JSON.parse(t._Parent)[n.id];let i=s[o];if(!i){i=e.sina.createHierarchyNode({id:o});c.push(i);s[o]=i}i.addChildNode(a)}const l=c.find(e=>e.id===a);i.node=l;return i}}var r={__esModule:true};r.HierarchyParser=n;return r});
//# sourceMappingURL=HierarchyParser.js.map