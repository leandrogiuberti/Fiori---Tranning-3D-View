sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
	"use strict";

	return new JSONModel({
		redirects: [
			{
				key: "routingExtensibility",
				target: "controllerExtensions/routing"
			},
			{
				key: "guidanceValueHelp",
				target: "buildingBlocks/field/fieldInputWithValueHelp"
			},
			{
				key: "basicExtensibility",
				target: "controllerExtensions/editFlow"
			},
			{
				key: "fieldDisplay",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "fieldDisplayStyles",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "fieldQuickView",
				target: "buildingBlocks/field/fieldLinkWithQuickView"
			},
			{
				key: "fieldEdit",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "fieldEvents",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "fieldValueHandling",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "multiValueField",
				target: "buildingBlocks/field/fieldMultiValueField"
			},
			{
				key: "fieldMessages",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "fieldNavProp",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "fieldFormatOptions",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "fieldFiscals",
				target: "buildingBlocks/field/fieldDefault"
			},
			{
				key: "formElementCustomField",
				target: "buildingBlocks/form/formCustom"
			},
			{
				key: "tableEdit",
				target: "buildingBlocks/table/tableDefault"
			},
			{
				key: "tableMassEditQuickFilters",
				target: "buildingBlocks/table/tableMassEdit"
			},
			{
				key: "tableNoData",
				target: "buildingBlocks/table/tablePublicAPIs"
			},
			{
				key: "tableCustoms",
				target: "buildingBlocks/table/customColumn"
			},
			{
				key: "tableMessages",
				target: "buildingBlocks/table/tablePublicAPIs"
			},
			{
				key: "filterBarAnnotationDefaults",
				target: "buildingBlocks/filterBar/filterBarDefaultValue"
			},
			{
				key: "filterBarSVandAnnotationDefaults",
				target: "buildingBlocks/filterBar/filterBarDefaultValue"
			},
			{
				key: "filterBarCustoms",
				target: "buildingBlocks/filterBar/filterBarCustom"
			},
			{
				key: "filterBarVMWithTable",
				target: "buildingBlocks/filterBar/filterBarDefault"
			},
			{
				key: "microChartHideOnNoData",
				target: "buildingBlocks/microchart/microChartDefault"
			},
			{
				key: "shareDefault",
				target: "buildingBlocks/share"
			},
			{
				key: "showMore",
				target: "topic/floorplanObjectPage/showHideContent"
			},
			{
				key: "tableExtensibility",
				target: "buildingBlocks/table/tablePublicAPIs"
			},
			{
				key: "customSectionContent",
				target: "topic/floorplanObjectPage/customSection"
			},
			{
				key: "customSubSectionContent",
				target: "topic/floorplanObjectPage/customSubSection"
			},
			{
				key: "customActionContent",
				target: "topic/floorplanObjectPage/customAction"
			},
			{
				key: "customDialogContent",
				target: "topic/customPage"
			},
			{
				key: "customColumnContent",
				target: "buildingBlocks/table/customColumn"
			},
			{
				key: "customHeaderFacetContent",
				target: "topic/floorplanObjectPage/customHeaderFacet"
			},
			{
				key: "customFormElementContent",
				target: "buildingBlocks/form/formCustom"
			},
			{
				key: "customFilterContent",
				target: "buildingBlocks/filterBar/filterBarCustom"
			},
			{
				key: "customListReportHeaderContent",
				target: "topic/floorplanListReport/customHeaderListReport"
			},
			{
				key: "customPageContent",
				target: "topic/customPage"
			},
			{
				key: "customViewInLRContent",
				target: "topic/floorplanListReport/customViewListReport"
			},
			{
				key: "customViewWithMacroTableContent",
				target: "topic/floorplanListReport/customViewListReport"
			},
			{
				key: "customKPIContent",
				target: "topic/floorplanListReport/customKPI"
			}
		]
	});
});
