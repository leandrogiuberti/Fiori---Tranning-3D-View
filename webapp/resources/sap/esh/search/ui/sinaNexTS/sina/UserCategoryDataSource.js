/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./DataSource"],function(e){"use strict";const u=e["DataSource"];class s extends u{includeApps=false;subDataSources=[];undefinedSubDataSourceIds=[];constructor(e){super(e);this.includeApps=e.includeApps;this.subDataSources=e.subDataSources??this.subDataSources;this.undefinedSubDataSourceIds=e.undefinedSubDataSourceIds??this.undefinedSubDataSourceIds}isIncludeApps(){return this.includeApps}setIncludeApps(e){this.includeApps=e}addSubDataSource(e){this.subDataSources.push(e)}clearSubDataSources(){this.subDataSources=[]}getSubDataSources(){return this.subDataSources}hasSubDataSource(e){for(const u of this.subDataSources){if(u.id===e){return true}}return false}addUndefinedSubDataSourceId(e){this.undefinedSubDataSourceIds.push(e)}clearUndefinedSubDataSourceIds(){this.undefinedSubDataSourceIds=[]}getUndefinedSubDataSourceIds(){return this.undefinedSubDataSourceIds}}var a={__esModule:true};a.UserCategoryDataSource=s;return a});
//# sourceMappingURL=UserCategoryDataSource.js.map