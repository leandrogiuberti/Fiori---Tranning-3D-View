/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate", 'sap/ui/fl/Utils', 'sap/ui/core/util/reflection/JsControlTreeModifier'
], function (FilterBarDelegate, FlUtils, JsControlTreeModifier) {
	"use strict";

	var FilterBarBooksSampleDelegate = Object.assign({}, FilterBarDelegate);

	FilterBarBooksSampleDelegate.fetchProperties = function () {
		var oFetchPropertiesPromise = FilterBarDelegate.fetchProperties.apply(this, arguments);

		var bSearchExists = false;

		return oFetchPropertiesPromise.then(function (aProperties) {
			aProperties.forEach(function(oPropertyInfo){

				if (oPropertyInfo.name === "$search") {
					bSearchExists = true;
				}

				if (oPropertyInfo.name === "author_ID") {
					oPropertyInfo.label = "Author";
				}

				if (oPropertyInfo.name === "title") {
					oPropertyInfo.label = "Title";
				}

				if (oPropertyInfo.name === "published") {
					oPropertyInfo.label = "Published";
				}

				if (oPropertyInfo.name === "language") {
					oPropertyInfo.label = "Language";
				}

				if (oPropertyInfo.name === "stock") {
					oPropertyInfo.label = "Stock range";
					oPropertyInfo.maxConditions = 1;
				}

				if (oPropertyInfo.name === "classification_code") {
					oPropertyInfo.label = "Classification";
				}

				if (oPropertyInfo.name === "genre_code") {
					oPropertyInfo.label = "Genre";
				}

				if (oPropertyInfo.name === "subgenre_code") {
					oPropertyInfo.label = "Sub Genre";
				}

				if (oPropertyInfo.name === "detailgenre_code") {
					oPropertyInfo.label = "Detail Genre";
				}
			});

			return aProperties;
		});

		// { name: "author_ID",
		// groupLabel: "none",
		// label: "Author ID",
		// type: "Edm.Int32",
		// baseType:new sap.ui.model.odata.type.Int32(),
		// required: false,
		// hiddenFilter: false,
		// visible: true,
		// maxConditions : -1,
		// fieldHelp: "FHAuthor"}
	};

	FilterBarBooksSampleDelegate._createFilterField = function (oProperty, oFilterBar, mPropertyBag) {

		mPropertyBag = 	{
			modifier: JsControlTreeModifier,
			view: FlUtils.getViewForControl(oFilterBar),
			appComponent: FlUtils.getAppComponentForControl(oFilterBar)
		};

		var oModifier = mPropertyBag.modifier;
		var sName = oProperty.path || oProperty.name;
		var oFilterFieldPromise = FilterBarDelegate._createFilterField.apply(this, arguments);

		oFilterFieldPromise.then(function (oFilterField) {

			if (sName === "stock") {

				return oModifier.createControl("sap.ui.mdc.demokit.sample.Chart.MDCChartV4.controls.CustomRangeSlider", mPropertyBag.appComponent, mPropertyBag.view, "customSlider", {
					max: 9999,
					width: "100%"
				}).then(function(oCustomRangeSlider) {

					if (oCustomRangeSlider.addStyleClass) {
						oCustomRangeSlider.addStyleClass("sapUiMediumMarginBottom");
					} else {
						oModifier.setAssociation(oCustomRangeSlider, "class", "sapUiMediumMarginBottom");
					}
					return oModifier.insertAggregation(oFilterField, "contentEdit", oCustomRangeSlider, 0, mPropertyBag.view);
				}).then(function() {
					return oFilterField;
				});
			}

			if (sName === "author_ID") {
				oModifier.setProperty(oFilterField, "display","Description");
				return oFilterField;
			}

		});

		return oFilterFieldPromise;

	};


	return FilterBarBooksSampleDelegate;
});
