/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/controls/library", "sap/ui/core/Lib", "sap/ui/core/XMLTemplateProcessor", "sap/ui/core/library", "sap/ui/thirdparty/jquery"], function (_library, Lib, _XMLTemplateProcessor, _library2, _jquery) {
  "use strict";

  var _exports = {};
  /**
   * Library containing the building blocks for SAP Fiori elements.
   * @namespace
   * @public
   */
  const managecache = "sap.fe.plugins.managecache";

  // library dependencies
  _exports.managecache = managecache;
  const thisLib = Lib.init({
    apiVersion: 2,
    name: "sap.fe.plugins.managecache",
    dependencies: ["sap.ui.core", "sap.m", "sap.fe.controls"],
    types: [],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.141.0",
    noLibraryCSS: true
  });
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtYW5hZ2VjYWNoZSIsIl9leHBvcnRzIiwidGhpc0xpYiIsIkxpYiIsImluaXQiLCJhcGlWZXJzaW9uIiwibmFtZSIsImRlcGVuZGVuY2llcyIsInR5cGVzIiwiaW50ZXJmYWNlcyIsImNvbnRyb2xzIiwiZWxlbWVudHMiLCJ2ZXJzaW9uIiwibm9MaWJyYXJ5Q1NTIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJsaWJyYXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcInNhcC9mZS9jb250cm9scy9saWJyYXJ5XCI7XG5pbXBvcnQgTGliIGZyb20gXCJzYXAvdWkvY29yZS9MaWJcIjtcbmltcG9ydCBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgXCJzYXAvdWkvdGhpcmRwYXJ0eS9qcXVlcnlcIjtcblxuLyoqXG4gKiBMaWJyYXJ5IGNvbnRhaW5pbmcgdGhlIGJ1aWxkaW5nIGJsb2NrcyBmb3IgU0FQIEZpb3JpIGVsZW1lbnRzLlxuICogQG5hbWVzcGFjZVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgbWFuYWdlY2FjaGUgPSBcInNhcC5mZS5wbHVnaW5zLm1hbmFnZWNhY2hlXCI7XG5cbi8vIGxpYnJhcnkgZGVwZW5kZW5jaWVzXG5jb25zdCB0aGlzTGliID0gTGliLmluaXQoe1xuXHRhcGlWZXJzaW9uOiAyLFxuXHRuYW1lOiBcInNhcC5mZS5wbHVnaW5zLm1hbmFnZWNhY2hlXCIsXG5cdGRlcGVuZGVuY2llczogW1wic2FwLnVpLmNvcmVcIiwgXCJzYXAubVwiLCBcInNhcC5mZS5jb250cm9sc1wiXSxcblx0dHlwZXM6IFtdLFxuXHRpbnRlcmZhY2VzOiBbXSxcblx0Y29udHJvbHM6IFtdLFxuXHRlbGVtZW50czogW10sXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10ZW1wbGF0ZS1jdXJseS1pbi1zdHJpbmdcblx0dmVyc2lvbjogXCIke3ZlcnNpb259XCIsXG5cdG5vTGlicmFyeUNTUzogdHJ1ZVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHRoaXNMaWI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0VBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU1BLFdBQVcsR0FBRyw0QkFBNEI7O0VBRXZEO0VBQUFDLFFBQUEsQ0FBQUQsV0FBQSxHQUFBQSxXQUFBO0VBQ0EsTUFBTUUsT0FBTyxHQUFHQyxHQUFHLENBQUNDLElBQUksQ0FBQztJQUN4QkMsVUFBVSxFQUFFLENBQUM7SUFDYkMsSUFBSSxFQUFFLDRCQUE0QjtJQUNsQ0MsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQztJQUN6REMsS0FBSyxFQUFFLEVBQUU7SUFDVEMsVUFBVSxFQUFFLEVBQUU7SUFDZEMsUUFBUSxFQUFFLEVBQUU7SUFDWkMsUUFBUSxFQUFFLEVBQUU7SUFDWjtJQUNBQyxPQUFPLEVBQUUsWUFBWTtJQUNyQkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDO0VBQUMsT0FFWVgsT0FBTztBQUFBIiwiaWdub3JlTGlzdCI6W119