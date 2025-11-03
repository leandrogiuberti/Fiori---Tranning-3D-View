/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./Util","../../sina/DataSourceType"],function(s,e){"use strict";const a=s["getMatchedStringValues"];const t=s["readFile"];const r=e["DataSourceType"];class o{sina;dataSourceIds=[];constructor(s,e){this.sina=s;this.dataSourceIds=e}async loadDataSources(){if(this.sina.dataSources.some(s=>s.type===r.BusinessObject)){return}for(const s of this.dataSourceIds){const e=await t(`/resources/sap/esh/search/ui/sinaNexTS/providers/sample2/data/${s}.json`);this.sina.dataSourceFromJson(JSON.parse(e))}}getDataSourceById(s){return this.sina.dataSources.find(e=>e.id===s)}getResponse(s){const e=[];for(const t of this.sina.dataSources){if(a([t.labelPlural,t.label],s.filter.searchTerm).length>0){e.push(t)}}return{results:e,totalCount:e.length}}}var n={__esModule:true};n.DataSourceService=o;return n});
//# sourceMappingURL=DataSourceService.js.map