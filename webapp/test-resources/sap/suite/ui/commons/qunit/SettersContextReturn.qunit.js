/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/ui/VersionInfo",
	"sap/ui/core/Lib"
], function (Log, oCore, VersionInfo, Lib) {
	"use strict";

	QUnit.module("Setters");

	var aExcludedLibraries;

	// Exclude libraries - we need this to exclude libraries that will not be tested at this point in time
	aExcludedLibraries = [
		"sap.apf",
		"sap.ca.scfld.md",
		"sap.ca.ui",
		"sap.chart",
		"sap.collaboration",
		"sap.diagram",
		"sap.esh.search.ui",
		"sap.f",
		"sap.fe.ariba",
		"sap.fe.base",
		"sap.fe.controls",
		"sap.fe.common",
		"sap.fe.core",
		"sap.fe.ina",
		"sap.fe.macros",
		"sap.fe.navigation",
		"sap.fe.placeholder",
		"sap.fe.plugins.managecache",
		"sap.fe.templates",
		"sap.fe.test",
		"sap.fe.tools",
		"sap.fe",
		"sap.feedback.ui",
		"sap.fileviewer",
		"sap.fiori",
		"sap.gantt.config",
		"sap.gantt",
		"sap.insights",
		"sap.landvisz",
		"sap.m",
		"sap.makit",
		"sap.me",
		"sap.ndc",
		"sap.ovp",
		"sap.portal.ui5",
		"sap.rules.ui",
		"sap.sac.df",
		"sap.service.visualization",
		"sap.suite.ui.generic.template",
		"sap.suite.ui.microchart",
		"sap.tnt",
		"sap.ui.codeeditor", // can't be loaded async
		"sap.ui.commons",
		"sap.ui.comp",
		"sap.ui.composite",
		"sap.ui.core",
		"sap.ui.dev",
		"sap.ui.dev2",
		"sap.ui.documentation",
		"sap.ui.dt",
		"sap.ui.export",
		"sap.ui.fl",
		"sap.ui.generic.app",
		"sap.ui.generic.template",
		"sap.ui.layout",
		"sap.ui.mdc",
		"sap.ui.richtexteditor",
		"sap.ui.rta",
		"sap.ui.suite",
		"sap.ui.support",
		"sap.ui.table",
		"sap.ui.testrecorder",
		"sap.ui.unified",
		"sap.ui.ux3",
		"sap.ui.vbm",
		"sap.ui.vk",
		"sap.ui.vtm",
		"sap.ui.webc.common",
		"sap.ui.webc.fiori",
		"sap.ui.webc.main",
		"sap.uiext.inbox",
		"sap.ushell_abap",
		"sap.ushell.ui",
		"sap.ushell",
		"sap.uxap",
		"sap.viz",
		"sap.webanalytics.core",
		"sap.zen.commons",
		"sap.zen.crosstab",
		"sap.zen.dsh"
	];

	var aExcludedControls = [
		'sap.suite.ui.commons.CountingNavigationItem',
		'sap.suite.ui.commons.NumericContent'
	];

	getLibraries(aExcludedLibraries, aExcludedControls);

	// Create tests for all loaded libraries
	function afterLibrariesLoaded(oLibraries, aExcludedControls, done){
		Object.keys(oLibraries).forEach(function(sLibName) {
			if (aExcludedLibraries.indexOf(sLibName) === -1) {
				var oLibrary = oLibraries[sLibName];
				// Mind here we need a concatenated copy of the original array`s!!!
				var aClasses = oLibrary.controls.concat(oLibrary.elements.slice());
				aClasses = aClasses.filter(function(sClassName){
					return aExcludedControls.indexOf(sClassName) === -1;
				});
				QUnit.test("All control and element setters should return correct context in library " + sLibName, function (fnAssert) {
					// Test all classes from list
					return Promise.all(
						aClasses.map(function(sClassName) {
							return loadClass(sClassName).then(function(FNClass) {
									assertAllSettersForClass(FNClass, fnAssert);
							});
						})
					);
				});
			}
		});
		done();
	}

	/**
	 * Asynchronously loads the module for the class with the given name and returns the export of that module
	 * @param {string} sClassName name of the class to load
	 */
	function loadClass(sClassName) {
		var sModuleName = sClassName.replace(/\./g, "/");
		return new Promise(function(resolve, reject) {
			sap.ui.require([sModuleName], function(FNClass) {
				resolve(FNClass);
			}, reject);
		});
	}

	/**
	 * Creates assertions for all setters of the given class
	 * @param {string} sClassName class to be tested
	 * @param {function} fnAssert QUnit assert
	 */
	function assertAllSettersForClass(oClass, fnAssert) {
		var oMetadata = oClass.getMetadata(),
			sClassName = oMetadata.getName(),
			oControl,
			oProperties,
			oProperty,
			sPropertyName,
			sSetterName,
			oValue,
			sName,
			bDateInName;

		// Abstract classes should not be tested on their own
		if (oMetadata.isAbstract()) {
			return;
		}


		try {
			oControl = new oClass();
		} catch (e) {
			fnAssert.ok(false, "Failed to init class " + sClassName + " without parameters with exception: " + e);
			return;
		}

		if (!oMetadata.getAllProperties) {
			return;
		}

		oProperties = oMetadata.getAllProperties();

		for (sPropertyName in oProperties) {
			if (oProperties.hasOwnProperty(sPropertyName)) {
				oProperty = oProperties[sPropertyName];

				// Get the name of the setter.
				// We access this private property only to be able to display more meaningful
				// info in the test message
				sSetterName = oProperty._sMutator;

				// Get the value of the property
				oValue = oProperty.get(oControl);

				// Assert
				try {
					fnAssert.ok(oControl === oProperty.set(oControl, oValue),
							sClassName + "." + sSetterName + "() should always return <this>");
				} catch (e) {
					// If the setter fails we have special scenarios:
					// 1. date may be required but as there is no type "date" in our metadata API we need to identify it here
					// and provide a JavaScript Date so we can test the setter
					sName = oProperty.name;
					bDateInName = sName.indexOf("Date", sName.length - 4) !== -1 || sName.substring(0, 4) === "date";
					if ((sName === "date" || bDateInName) && oProperty.type === "object") {
						fnAssert.ok(oControl === oProperty.set(oControl, new Date()),
								sClassName + "." + sSetterName + "({js date}) should always return <this>");
					// 2. icon URI may be required
					} else if ((sName === "icon") && oProperty.type === "sap.ui.core.URI") {
							fnAssert.ok(oControl === oProperty.set(oControl, "sap-icon://display"),
								sClassName + "." + sSetterName + "() should always return <this>");
					} else {
						// If the setter fails for some reason called with the value from get collected before that
						// we need to fail with a meaningful error.
						fnAssert.ok(false, "Setter " + sClassName + "." + sSetterName + "(" + oValue + ") fails when called " +
								"with value received from get with exception: " + e);
					}
				}
			}
		}

	}

	/**
	 * Returns libraries object containing all loaded libraries and their controls
	 * @param {Array} aExcludedLibraries - list of libraries to exclude
	 * @param {Array} aExcludedControls - list of controls to exclude due to deprecation
	 * @returns {object} libraries object
	 */
	function getLibraries (aExcludedLibraries, aExcludedControls) {
		var oLoadedLibraries = oCore.getLoadedLibraries(),
			sInfoLibName,
			bNewLibrary,
			i;

		QUnit.test("Bound to pass", function(assert){
			var done = assert.async();

			VersionInfo.load().then(function(oInfo){
				for (i = 0; i < oInfo.libraries.length; i++) {
					sInfoLibName = oInfo.libraries[i].name;
					if (aExcludedLibraries.indexOf(sInfoLibName) === -1 && !oLoadedLibraries[sInfoLibName]) {
						Log.info("Libary '" + sInfoLibName + "' is not loaded!");
						try {
							Lib.load(sInfoLibName);
							bNewLibrary = true;
						} catch (e) {
							// not a control lib? This happens for e.g. "themelib_sap_bluecrystal"...
						}
					}
				}
				// Renew the libraries object if new libraries are added
				if (bNewLibrary) {
					oLoadedLibraries = oCore.getLoadedLibraries();
				}
				afterLibrariesLoaded(oLoadedLibraries, aExcludedControls, done);
			});
			assert.equal(1,1,"Bound to pass");
		});
	}
});
