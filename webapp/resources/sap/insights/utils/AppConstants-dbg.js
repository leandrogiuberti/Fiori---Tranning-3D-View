/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([], function () {
    "use strict";
    var BASE_URL = "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/";
    var CARD_ENTITY_NAME = "INSIGHTS_CARDS";
    var AI_INSIGHTCARD_BASEURL = "/sap/opu/odata4/sap/aiu_ui_prompt/srvd/sap/aiu_ui_prompt/0001/";

    return {
        DATE_OPTIONS: {
            SINGLE_OPTIONS: [
                "DATE",
                "YESTERDAY",
                "TOMORROW",
                "TODAY",
                "FIRSTDAYWEEK",
                "LASTDAYWEEK",
                "FIRSTDAYMONTH",
                "LASTDAYMONTH",
                "FIRSTDAYQUARTER",
                "LASTDAYQUARTER",
                "FIRSTDAYYEAR",
                "LASTDAYYEAR"
            ],
            RANGE_OPTIONS: [
                "THISWEEK",
                "LASTWEEK",
                "NEXTWEEK",
                "THISMONTH",
                "LASTMONTH",
                "NEXTMONTH",
                "THISQUARTER",
                "LASTQUARTER",
                "NEXTQUARTER",
                "QUARTER1",
                "QUARTER2",
                "QUARTER3",
                "QUARTER4",
                "THISYEAR",
                "LASTYEAR",
                "NEXTYEAR",
                "YEARTODATE",
                "DATETOYEAR",
                "DATERANGE",
                "DATETIMERANGE",
                "FROM",
                "FROMDATETIME",
                "LASTDAYS",
                "LASTMONTHS",
                "LASTQUARTERS",
                "LASTWEEKS",
                "LASTYEARS",
                "NEXTDAYS",
                "NEXTMONTHS",
                "NEXTQUARTERS",
                "NEXTWEEKS",
                "NEXTYEARS",
                "SPECIFICMONTH",
                "TO",
                "TODATETIME",
                "TODAYFROMTO"
            ],
            DATE_LIST: [
                "DATE",
                "DATERANGE",
                "DATETIME",
                "DATETIMERANGE",
                "FROM",
                "TO",
                "FROMDATETIME",
                "TODATETIME",
                "SPECIFICMONTH"
            ],
            SPECIAL_RANGE: [
                "LASTDAYS",
                "LASTMONTHS",
                "LASTQUARTERS",
                "LASTWEEKS",
                "LASTYEARS",
                "NEXTDAYS",
                "NEXTMONTHS",
                "NEXTQUARTERS",
                "NEXTWEEKS",
                "NEXTYEARS",
                "TODAYFROMTO"
            ]
        },
        DEVICE_TYPES : {
            Desktop: "Desktop",
            Tablet: "Tablet",
            Mobile: "Mobile"
        },
        CHART_TYPE_DETAILS: {
            "bar": {
                "icon": "sap-icon://horizontal-bar-chart",
                "title": "Bar Chart"
            },
            "column": {
                "icon": "sap-icon://vertical-bar-chart",
                "title": "Column Chart"
            },
            "dual_column": {
                "icon": "sap-icon://vertical-bar-chart",
                "title": "Dual Column Chart"
            },
            "dual_bar": {
                "icon": "sap-icon://horizontal-bar-chart",
                "title": "Dual Bar Chart"
            },
            "stacked_bar": {
                "icon": "sap-icon://full-stacked-chart",
                "title": "Stacked Bar Chart"
            },
            "stacked_column": {
                "icon": "sap-icon://vertical-stacked-chart",
                "title": "Stacked Column Chart"
            },
            "line": {
                "icon": "sap-icon://line-chart",
                "title": "Line Chart"
            },
            "dual_line": {
                "icon": "sap-icon://line-chart",
                "title": "Dual Line Chart"
            },
            "combination": {
                "icon": "sap-icon://business-objects-experience", //Combined Column Line Chart icon
                "title": "Combination Chart"
            },
            "bullet": {
                "icon": "sap-icon://horizontal-bullet-chart",
                "title": "Bullet Chart"
            },
            "time_bullet": {
                "icon": "sap-icon://horizontal-bullet-chart", //bullet icon
                "title": "Time Bullet Chart"
            },
            "bubble": {
                "icon": "sap-icon://product", //no icon
                "title": "Bubble Chart"
            },
            "time_bubble": {
                "icon": "sap-icon://product", //no icon
                "title": "Time Bubble Chart"
            },
            "pie": {
                "icon": "sap-icon://pie-chart",
                "title": "Pie Chart"
            },
            "donut": {
                "icon": "sap-icon://donut-chart",
                "title": "Donut Chart"
            },
            "timeseries_column": {
                "icon": "sap-icon://vertical-bar-chart", //column chart icon
                "title": "TimeSeries Column Chart"
            },
            "timeseries_line": {
                "icon": "sap-icon://line-chart", //line chart icon
                "title": "TimeSeries Line Chart"
            },
            "timeseries_scatter": {
                "icon": "sap-icon://scatter-chart", //scatter chart icon
                "title": "TimeSeries Scatter Chart"
            },
            "timeseries_bubble": {
                "icon": "sap-icon://product", //no icon,
                "title": "TimeSeries Bubble Chart"
            },
            "timeseries_stacked_column": {
                "icon": "sap-icon://vertical-stacked-chart", //stacked column icon
                "title": "TimeSeries Stacked Column Chart"
            },
            "timeseries_100_stacked_column": {
                "icon": "sap-icon://full-stacked-column-chart", //100 stacked column icon
                "title": "TimeSeries 100% Stacked Column Chart"
            },
            "timeseries_bullet": {
                "icon": "sap-icon://horizontal-bullet-chart", //bullet chart icon
                "title": "TimeSeries Bullet Chart"
            },
            "timeseries_waterfall": {
                "icon": "sap-icon://vertical-waterfall-chart", //waterfall chart icon
                "title": "TimeSeries Waterfall Chart"
            },
            "timeseries_stacked_combination": {
                "icon": "sap-icon://business-objects-experience", //dual stacked combination icon
                "title": "Timeseries Stacked Combination Chart"
            },
            "scatter": {
                "icon": "sap-icon://scatter-chart",
                "title": "Scatter Plot"
            },
            "vertical_bullet": {
                "icon": "sap-icon://vertical-bullet-chart",
                "title": "Vertical Bullet Chart"
            },
            "dual_stacked_bar": {
                "icon": "sap-icon://full-stacked-chart",
                "title": "Dual Stacked Bar Chart"
            },
            "100_stacked_bar": {
                "icon": "sap-icon://full-stacked-chart",
                "title": "100% Stacked Bar Chart"
            },
            "100_dual_stacked_bar": {
                "icon": "sap-icon://full-stacked-chart",
                "title": "100% Dual Stacked Bar Chart"
            },
            "dual_stacked_column": {
                "icon": "sap-icon://vertical-stacked-chart",
                "title": "Dual Stacked Column Chart"
            },
            "100_stacked_column": {
                "icon": "sap-icon://full-stacked-column-chart",
                "title": "100% Stacked Column Chart"
            },
            "100_dual_stacked_column": {
                "icon": "sap-icon://vertical-stacked-chart",
                "title": "100% Dual Stacked Column Chart"
            },
            "stacked_combination": {
                "icon":  "sap-icon://business-objects-experience", //horizontal_stacked_combination icon
                "title": "Stacked Combination Chart"
            },
            "horizontal_stacked_combination": {
                "icon": "sap-icon://business-objects-experience",
                "title": "Horizontal Stacked Combination Chart"
            },
            "dual_stacked_combination": {
                "icon": "sap-icon://business-objects-experience",
                "title": "Dual Stacked Combination Chart"
            },
            "dual_horizontal_stacked_combination": {
                "icon": "sap-icon://business-objects-experience",
                "title": "Dual Horizontal Stacked Combination Chart"
            },
            "heatmap": {
                "icon": "sap-icon://heatmap-chart",
                "title": "Heat Map"
            },
            "waterfall": {
                "icon": "sap-icon://vertical-waterfall-chart",
                "title": "Waterfall Chart"
            },
            "horizontal_waterfall": {
                "icon": "sap-icon://horizontal-waterfall-chart",
                "title": "Horizontal Waterfall Chart"
            },
            "treemap": {
                "icon": "sap-icon://product",
                "title": "Tree Map"
            },
            "area": {
                "icon": "sap-icon://product",
                "title": "Area Chart"
            },
            "radar": {
                "icon": "sap-icon://product",
                "title": "Radar Chart"
            },
            "dual_combination": {
                "icon":  "sap-icon://business-objects-experience", //combination chart icon
                "title": "Dual Combination Chart"
            },
            "dual_horizontal_combination": {
                "icon":  "sap-icon://business-objects-experience", //combination chart icon
                "title": "Dual Horizontal Combination Chart"
            },
            "default": {
                "icon": "sap-icon://product"
            }
        },
        ERROR_CODES: [
            "/IWBEP/CM_MGW_RT/003",
            "/IWBEP/CM_MGW_RT/004",
            "/IWBEP/CM_MGW_RT/005",
            "/IWBEP/CM_MGW_RT/006"
        ],
        ODATA_VERSION_2: "2.0",
        ODATA_VERSION_4: "4.0",
        BASE_URL: BASE_URL,
        REPO_BASE_URL: BASE_URL + "insights_cards_repo_srv/0001/",
        CARD_ENTITY_NAME: CARD_ENTITY_NAME,
        CARD_READ_URL: BASE_URL + "insights_cards_read_srv/0001/" + CARD_ENTITY_NAME,
        CARD_SELECT_QUERY: "&$select=descriptorContent,visibility,rank&$orderby=rank&$skip=0&$top=10",
        HEAD: "HEAD",
        GET:  "GET",
        POST:  "POST",
        PUT:  "PUT",
        DELETE: "DELETE",
        FESR_STEP_NAME: "INS:AddCard",
        AI_INSIGHTCARD_BASEURL: AI_INSIGHTCARD_BASEURL,
        ADD_AI_INSIGHTCARD_COMPLETEURL: AI_INSIGHTCARD_BASEURL + "InsightsCard/com.sap.gateway.srvd.aiu_ui_prompt.v0001.GenerateCardFromUserInput?",
        FESR_AIGENERATE_CARD: "INS:GenAICard",
        FESR_AIGENERATE_ADD_CARD: "INS:AddAICard",
        FESR_AIGENERATE_CLEARALL: "INS:ClearAICard",
        FESR_AIGENERATE_CANCEL: "INS:CancelAICard",
        FESR_AIGENERATE_THUMBSUP: "ai:cards:thumbsUp",
        FESR_AIGENERATE_THUMBSDOWN: "ai:cards:thumbsDown"
    };
});