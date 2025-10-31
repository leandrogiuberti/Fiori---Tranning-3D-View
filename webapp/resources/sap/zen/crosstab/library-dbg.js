/*!
 * (c) Copyright 2010-2019 SAP SE or an SAP affiliate company.
 */
/*global sap*/
/**
 * Initialization Code and shared classes of library sap.zen.crosstab.
 */
sap.ui.define(
  [
    "sap/ui/core/Core",
    "sap/ui/core/library",
    "sap/m/library",
    "sap/ui/commons/library"
  ],
  function() {
    /**
     * Design Studio Crosstab library.  NOT INTENDED FOR STANDALONE USAGE.
     *
     * @namespace
     * @alias sap.zen.crosstab
     * @public
     * @experimental
     * @deprecated since 1.89.0
     */
    var thisLib = sap.ui.getCore().initLibrary({
      name : "sap.zen.crosstab",
      dependencies : ["sap.ui.core","sap.m", "sap.ui.commons"],
      types: [],
      interfaces: [],
      controls: [
        "sap.zen.crosstab.Crosstab",
        "sap.zen.crosstab.DataCell",
        "sap.zen.crosstab.HeaderCell"
      ],
      elements: [],
      version: "1.141.0"
    });
    return thisLib;
  }
);
