/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";function e(e){if(e.id==="All"&&e.type===e.sina.DataSourceType.Category){return{ObjectName:"$$ALL$$",PackageName:"ABAP",SchemaName:"",Type:"Category"}}let a;switch(e.type){case e.sina.DataSourceType.Category:a="Category";break;case e.sina.DataSourceType.BusinessObject:a="Connector";break}return{ObjectName:e.id,PackageName:"ABAP",SchemaName:"",Type:a}}var a={__esModule:true};a.serialize=e;return a});
//# sourceMappingURL=dataSourceSerializer.js.map