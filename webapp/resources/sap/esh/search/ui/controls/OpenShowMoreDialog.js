/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../SearchFacetDialogModel","./facets/SearchFacetDialog","../eventlogging/UserEvents"],function(e,t,o){"use strict";function a(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const n=a(e);const c=a(t);const s=o["UserEventType"];async function r(e){const t=new n({searchModel:e.searchModel});await t.initAsync();t.setData(e.searchModel.getData());t.config=e.searchModel.config;t.sinaNext=e.searchModel.sinaNext;t.prepareFacetList();const o={selectedAttribute:e.dimension,selectedTabBarIndex:e.selectedTabBarIndex,tabBarItems:e.tabBarItems};const a=new c(`${e.searchModel.config.id}-SearchFacetDialog`,o);a.setModel(t);a.setModel(e.searchModel,"searchModel");const r=e.searchModel.getSearchCompositeControlInstanceByChildControl(e.sourceControl);if(r){r["oFacetDialog"]=a}a.open();e.searchModel.eventLogger.logEvent({type:s.FACET_SHOW_MORE,referencedAttribute:e.dimension,dataSourceKey:e.searchModel.getDataSource().id})}var d={__esModule:true};d.openShowMoreDialog=r;return d});
//# sourceMappingURL=OpenShowMoreDialog.js.map