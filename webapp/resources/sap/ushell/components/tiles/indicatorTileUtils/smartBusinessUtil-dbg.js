// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/* eslint-disable valid-jsdoc */

/**
 * @fileOverview Smart Business Util
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/model/FilterOperator",
    "sap/ui/model/analytics/odata4analytics",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/model/odata/ODataModel",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/UriParameters",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/services/CrossApplicationNavigation"
    // "sap/ushell/components/tiles/utils" // do not migrate
], (
    FilterOperator,
    odata4analytics,
    NumberFormat,
    ODataModel,
    Log,
    jQuery,
    UriParameters,
    UrlParsing,
    oCrossAppNavigator
    // utils // do not migrate
) => {
    "use strict";

    // shortcut for sap.ui.model.analytics.odata4analytics.ParameterizationRequest
    const ParameterizationRequest = odata4analytics.ParameterizationRequest;

    // shortcut for sap.ui.model.analytics.odata4analytics.QueryResultRequest
    const QueryResultRequest = odata4analytics.QueryResultRequest;

    // shortcut for sap.ui.model.analytics.odata4analytics.Model.ReferenceByModel
    const ReferenceByModel = odata4analytics.Model.ReferenceByModel;

    // shortcut for sap.ui.model.analytics.odata4analytics.Model
    const Model = odata4analytics.Model;

    /* global oMeasure */

    /* eslint-disable block-scoped-var */ // TODO: remove eslint-disable

    sap = sap || {};
    sap.ushell = sap.ushell || {};
    sap.ushell.components = sap.ushell.components || {};
    sap.ushell.components.tiles.indicatorTileUtils = sap.ushell.components.tiles.indicatorTileUtils || {};
    sap.ushell.components.tiles.indicatorTileUtils.util = sap.ushell.components.tiles.indicatorTileUtils.util || {};
    sap.ushell.components.tiles.indicatorTileUtils.util = (function (global, $) {
        const cache = {};
        const timeUnitMap = {
            ANN: "years",
            WEE: "weeks",
            DAY: "days",
            HUR: "hours",
            MIN: "minutes"
        };
        const scheduledJobMap = {};
        const dataCallDualTileMap = {};

        return {
            getScheduledJob: function (key) {
                return scheduledJobMap[key];
            },

            setScheduledJob: function (key, data) {
                scheduledJobMap[key] = data;
            },

            isCallInProgress: function (key) {
                return dataCallDualTileMap[key];
            },

            setUnsetCallInProgress: function (key, value) {
                dataCallDualTileMap[key] = value;
            },

            getTimeUnitMap: function () {
                return timeUnitMap;
            },

            getHanaUser: function () {
                // eslint-disable-next-line no-undef
                return authObject.userName;
            },

            addSystemToServiceUrl: function (url, system) {
                Log.info("Hana Adapter --> Add System to Service Url");
                if (sap.ushell && sap.ushell.Container) {
                    if (system) {
                        sap.ushell.Container.getServiceAsync("URLParsing").then((oURLParsing) => {
                            sap.ui.model.odata.ODataUtils.setOrigin(url, { alias: system });
                        });
                    } else {
                        sap.ushell.Container.getServiceAsync("URLParsing").then((oURLParsing) => {
                            sap.ui.model.odata.ODataUtils.setOrigin(url);
                        });
                    }
                } return url;
            },

            getODataModelByServiceUri: function (sServiceUri) {
                sServiceUri = this.addSystemToServiceUrl(sServiceUri);
                if (!cache[sServiceUri]) {
                    const oModel = new ODataModel(sServiceUri, { loadMetadataAsync: true, json: true });
                    cache[sServiceUri] = oModel;
                }
                return cache[sServiceUri];
            },

            getEdmType: function (sUri, propertyName) {
                let oDataModel = null;
                if (sUri instanceof ODataModel) {
                    oDataModel = sUri;
                } else {
                    oDataModel = this.getODataModelByServiceUri(sUri);
                }
                if (oDataModel && oDataModel.getServiceMetadata()) {
                    const serviceMetaData = oDataModel.getServiceMetadata();
                    const entitySets = serviceMetaData.dataServices.schema[0].entityType;
                    if (entitySets) {
                        for (let i = 0; i < entitySets.length; i++) {
                            const entity = entitySets[i];
                            const properties = entity.property;
                            for (let j = 0; j < properties.length; j++) {
                                const property = properties[j];
                                if (property.name == propertyName) {
                                    return property.type;
                                }
                            }
                        }
                    }
                } return null;
            },

            getMillisecond: function (time, unit) {
                let returnTime;
                switch (unit) {
                    case "seconds":
                        returnTime = time * 1000;
                        break;
                    case "minutes":
                        returnTime = time * 60 * 1000;
                        break;
                    case "hours":
                        returnTime = time * 60 * 60 * 1000;
                        break;
                    case "days":
                        returnTime = time * 24 * 60 * 60 * 1000;
                        break;
                    case "weeks":
                        returnTime = time * 7 * 24 * 60 * 60 * 1000;
                        break;
                    case "months":
                        returnTime = time * 4 * 7 * 24 * 60 * 60 * 1000;
                        break;
                    case "years":
                        returnTime = time * 12 * 4 * 7 * 24 * 60 * 60 * 1000;
                        break;
                }
                return returnTime;
            },

            getUTCDate: function () {
                const now = new Date();
                return now;
            },

            isCacheValid: function (chipId, chipLastUpdatedOn, cacheMaxAge, cacheMaxAgeUnit, tilePressed) {
                const cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(chipId);
                if (!cachedValue) {
                    return false;
                } else if (!(cacheMaxAge && Number(cacheMaxAge))) {
                    return true;
                }
                const cacheAge = this.getMillisecond(cacheMaxAge, timeUnitMap[cacheMaxAgeUnit]);
                let cachedTime;
                if (cachedValue.CachedTime instanceof Date) {
                    cachedTime = cachedValue.CachedTime && cachedValue.CachedTime.getTime();
                } else {
                    cachedTime = cachedValue.CachedTime && parseInt(cachedValue.CachedTime.substr(6), 10); // 10 redix - http://eslint.org/docs/rules/radix
                }
                const curDate = this.getUTCDate();
                return (cachedTime >= chipLastUpdatedOn && cacheAge >= (curDate - cachedTime) && !tilePressed);
            },

            getMantissaLength: function (num) {
                const sNum = num.toString();
                let initPos = 0;
                if (num < 0) {
                    initPos = 1;
                }
                if (sNum.indexOf(".") === -1) {
                    return (num < 0 ? sNum.length - 1 : sNum.length);
                }
                return sNum.substring(initPos, sNum.indexOf(".")).length;
            },

            getLocaleFormattedValue: function (num, oScale, oDecimal, isACurrencyMeasure, currencyCode) {
                // TODO: migration not possible. jQuery.sap.require is deprecated. Use <code>sap.ui.require</code> instead.
                sap.ui.require("sap.ui.core.format.NumberFormat");
                isACurrencyMeasure = isACurrencyMeasure || false;
                currencyCode = currencyCode || null;
                if (isACurrencyMeasure) {
                    return NumberFormat.getCurrencyInstance({ style: "short", showMeasure: false }).format(num, currencyCode);
                }
                let sD = 2;
                const oFormatOptions = {
                    style: "short"
                };
                let fNum;
                if (!(oDecimal == -1 || oDecimal == null)) {
                    oFormatOptions.shortDecimals = Number(oDecimal);
                    oFormatOptions.minFractionDigits = Number(oDecimal);
                    oFormatOptions.maxFractionDigits = Number(oDecimal);
                }
                let valFormatter = NumberFormat.getInstance(oFormatOptions);
                if (oScale == -2) {
                    if (num > 9999) {
                        fNum = "????";
                    } else if ((num > -0.001 && num < 0) || (num < 0.001 && num > 0)) {
                        fNum = "0";
                    } else {
                        if (num.toString().indexOf(".") != -1) {
                            fNum = Number(num).toFixed(4 - num.toString().indexOf("."));
                        } else {
                            fNum = Number(num);
                        }
                        fNum = valFormatter.format(fNum);
                    }
                } else if (oDecimal == -1 || oDecimal == null) {
                    const mantissaLength = this.getMantissaLength(num);
                    if (!(mantissaLength % 3)) {
                        sD = 1;
                    }
                    if (mantissaLength % 3 === 1) {
                        sD = 3;
                    }
                    if (mantissaLength % 3 === 2) {
                        sD = 2;
                    }
                    if (Math.abs(num) % Math.pow(10, mantissaLength - 1) == 0) {
                        sD = 0;
                    } else if ((Math.abs(num) % Math.pow(10, mantissaLength - 1)) < 6 * Math.pow(10, mantissaLength - 4)) {
                        sD = 0;
                    }
                    valFormatter = NumberFormat.getInstance({ style: "short", shortDecimals: sD });
                    fNum = valFormatter.format(num);
                } else {
                    fNum = valFormatter.format(num);
                }
                return fNum;
            },

            getPlatform: function (sPlatform) {
                return (new UriParameters(window.location.href).get("sb_metadata") || sPlatform || "HANA").toUpperCase();
            },

            getTileTitleSubtitle: function (oChipApi) {
                const titleObj = {};
                if (oChipApi.bag && oChipApi.bag.getBagIds() && oChipApi.bag.getBagIds().length) {
                    titleObj.title = oChipApi.bag.getBag("sb_tileProperties").getText("title") ||
                        oChipApi.bag.getBag("sb_tileProperties").getProperty("title") ||
                        oChipApi.preview.getTitle();
                    titleObj.subTitle = oChipApi.bag.getBag("sb_tileProperties").getText("description") ||
                        oChipApi.bag.getBag("sb_tileProperties").getProperty("description") ||
                        oChipApi.preview.getDescription();
                } else {
                    titleObj.title = oChipApi.preview.getTitle();
                    titleObj.subTitle = oChipApi.preview.getDescription();
                }
                return titleObj;
            },

            // always invoke this function in context of individual tile
            scheduleFetchDataJob: function (isVisible) {
                let config;
                if (this.getView().getViewName().indexOf("DualTile") !== -1) {
                    config = this.oKpiTileView.oConfig;
                } else {
                    config = this.oConfig;
                }
                const key = `${config.TILE_PROPERTIES.id}data`;
                let runningJob = sap.ushell.components.tiles.indicatorTileUtils.util.getScheduledJob(key);
                if (runningJob) {
                    clearTimeout(runningJob);
                    runningJob = undefined;
                }
                const timeUnitMap = sap.ushell.components.tiles.indicatorTileUtils.util.getTimeUnitMap();
                const cachingTime = sap.ushell.components.tiles.indicatorTileUtils.util.getCachingTime(config);
                const cachingTimeUnit = sap.ushell.components.tiles.indicatorTileUtils.util.getCachingTimeUnit(config);
                const cacheMaxAge = sap.ushell.components.tiles.indicatorTileUtils.util.getMillisecond(cachingTime, timeUnitMap[cachingTimeUnit]);
                let tempCacheTime;
                if (this.cacheTime instanceof Date) {
                    tempCacheTime = this.cacheTime;
                } else {
                    tempCacheTime = new Date(parseInt(this.cacheTime.substr(6), 10));
                }
                let timeOut = cacheMaxAge - (sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate() - tempCacheTime);
                if (timeOut <= 0) {
                    timeOut = 0;
                } else if (timeOut > 2147483646) {
                    timeOut = 2147483646;
                }
                if (!isVisible) {
                    timeOut = 300000;
                }
                if (this.getView().getViewName().indexOf("DualTile") !== -1) {
                    runningJob = setTimeout(this.refreshPress.bind(this), timeOut);
                } else {
                    runningJob = setTimeout(this.refreshHandler.bind(this, false, true), timeOut);
                    sap.ushell.components.tiles.indicatorTileUtils.util.setScheduledJob(key, runningJob);
                }
                this.updateDatajobScheduled = true;
            },

            // always invoke this function in context of individual tile
            scheduleTimeStampJob: function () {
                const key = `${this.oConfig.TILE_PROPERTIES.id}time`;
                let runningJob = sap.ushell.components.tiles.indicatorTileUtils.util.getScheduledJob(key);
                let tempCacheTime;
                if (runningJob) {
                    clearTimeout(runningJob);
                    runningJob = undefined;
                }
                if (this.cacheTime instanceof Date) {
                    tempCacheTime = this.cacheTime;
                } else {
                    tempCacheTime = new Date(parseInt(this.cacheTime.substr(6), 10), 13);
                }
                const timeOut = sap.ushell.components.tiles.indicatorTileUtils.util.getTimeDifference(sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate() - tempCacheTime);
                runningJob = setTimeout(this.setTimeStamp.bind(this, this.cacheTime), timeOut.timer);
                sap.ushell.components.tiles.indicatorTileUtils.util.setScheduledJob(key, runningJob);
                this.updateTimeStampjobScheduled = true;
            },

            getBoolValue: function (bVal) {
                let bReturnVal = false;
                if (typeof bVal === "boolean" && bVal) {
                    bReturnVal = true;
                }
                return bReturnVal;
            },

            getSeconds: function (time) {
                return (time / 1000);
            },

            getMinutes: function (time) {
                return (this.getSeconds(time) / 60);
            },

            getHours: function (time) {
                return (this.getMinutes(time) / 60);
            },

            getDays: function (time) {
                return (this.getHours(time) / 24);
            },

            getWeeks: function (time) {
                return (this.getDays(time) / 7);
            },

            getMonths: function (time) {
                return (this.getWeeks(time) / 4);
            },

            getYears: function (time) {
                return (this.getMonths(time) / 12);
            },

            getTimeDifference: function (time) {
                const retObject = {};
                if (time) {
                    const minutes = this.getMinutes(time);
                    const hours = this.getHours(time);
                    const days = this.getDays(time);
                    if (minutes < 5) {
                        retObject.time = 0;
                        retObject.unit = "minutes";
                        // if time difference is between 0 to 5(excluded) Minutes
                        retObject.timer = Math.round(this.getMillisecond(5 - minutes, "minutes"));
                    } else if (minutes >= 5 && minutes < 60) {
                        if (minutes < 10) {
                            retObject.time = 5;
                        } else {
                            retObject.time = (minutes - (minutes % 10));
                        }
                        retObject.unit = "minutes";
                        // if time difference is between 5 to 60(excluded) Minutes
                        retObject.timer = Math.round(this.getMillisecond(10 - (minutes % 10), "minutes"));
                    } else if (hours >= 1 && hours < 24) {
                        retObject.unit = "hours";
                        retObject.time = (hours - (hours % 1));
                        // if time difference is between 1 to 24(excluded) Hours
                        retObject.timer = Math.round(this.getMillisecond(1 - (hours % 1), "hours"));
                    } else if (days >= 1 && days < 2) {
                        retObject.unit = "days";
                        retObject.time = (days - (days % 1));
                        // if time difference is between 1 to 2(excluded) days
                        retObject.timer = Math.round(this.getMillisecond(1 - (days % 1), "days"));
                    } else {
                        retObject.unit = "days";
                        retObject.time = (days - (days % 1));
                        // if time difference is more than 2(included) days
                        retObject.timer = this.getMillisecond(2, "days");
                    }
                } else {
                    retObject.timer = 6000;
                    retObject.unit = "days";
                    retObject.timer = 2000;
                }
                return retObject;
            },

            getCachingTime: function (oConfig) {
                return ((oConfig.CACHINGTIME &&
                    Number(oConfig.CACHINGTIME)) ||
                    (oConfig.TILE_PROPERTIES.cachingTime &&
                        Number(oConfig.TILE_PROPERTIES.cachingTime))
                );
            },

            getCachingTimeUnit: function (oConfig) {
                return (oConfig.CACHINGUNIT ||
                    oConfig.TILE_PROPERTIES.cachingTimeUnit);
            },

            getFrontendCacheQuery: function (chipId, userId, oPageChips, oTileApi) {
                let cacheODataModel;
                try {
                    let uri = oTileApi.url.addSystemToServiceUrl("/sap/opu/odata/SSB/SMART_BUSINESS_RUNTIME_SRV");
                    uri = sap.ushell.components.tiles.indicatorTileUtils.util.cacheBustingMechanism(uri);
                    cacheODataModel = this.getODataModelByServiceUri(uri);
                    uri = "/CacheParameters(P_CacheType=1)/Results";
                    return {
                        oModel: cacheODataModel,
                        uri: uri
                    };
                } catch (exp) {
                    Log.error("FrontEnd cache Metadata failed");
                    return null;
                }
            },

            isDualTile: function (oConfig) {
                const tileType = oConfig && oConfig.TILE_PROPERTIES && oConfig.TILE_PROPERTIES.tileType;
                if (tileType.indexOf("DT-") == -1) {
                    return false;
                }
                return true;
            },

            writeFrontendCacheByChipAndUserId: function (oTileApi, chipId, data, bUpdate, callback) {
                function success (data) {
                    Log.info("cache write successFully");
                    callback(data);
                }
                function error () {
                    Log.error("cache update failed");
                    callback(null);
                }
                try {
                    let uri = oTileApi.url.addSystemToServiceUrl("/sap/opu/odata/SSB/SMART_BUSINESS_RUNTIME_SRV/");
                    uri = sap.ushell.components.tiles.indicatorTileUtils.util.cacheBustingMechanism(uri);
                    const cacheODataModel = this.getODataModelByServiceUri(uri);
                    const entity = "/CacheData";
                    cacheODataModel.create(entity, data, {
                        async: true,
                        success: success,
                        error: error
                    });
                } catch (exp) {
                    Log.error(exp);
                }
            },

            getKpiChipsOnPage: function (chipId, callback) {
                const chipIdCollection = [];
                sap.ushell.Container.getServiceAsync("FlpLaunchPage").then((launchPage) => {
                    launchPage.getGroups().done((oGroups) => {
                        if (oGroups && oGroups instanceof Array && oGroups.length) {
                            Log.info("Group Chip fetch");
                        }
                        callback(chipId, chipIdCollection);
                    });
                });
            },

            getFrontendCache: function (oConfig, oTileApi) {
                const that = this;
                let oldDeferred = sap.ushell.components.tiles.indicatorTileUtils.cache.getFrontEndCacheDeferredObject(oTileApi.url.getApplicationSystem());
                let deferred;
                if (oldDeferred) {
                    deferred = oldDeferred;
                } else {
                    deferred = jQuery.Deferred();
                }
                const chipId = oConfig && oConfig.TILE_PROPERTIES && oConfig.TILE_PROPERTIES.id;
                const cachedKpiValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(chipId);
                if (cachedKpiValue) {
                    oldDeferred.resolve(true);
                } else if (oldDeferred) {
                    return oldDeferred.promise();
                } else {
                    sap.ushell.components.tiles.indicatorTileUtils.cache.setFrontEndCacheDefferedObject(oTileApi.url.getApplicationSystem(), deferred);
                    oldDeferred = deferred;
                    this.getKpiChipsOnPage(chipId, (chipId, oPageChipCollection) => {
                        if (oPageChipCollection) {
                            const frontendCacheQuery = that.getFrontendCacheQuery(oPageChipCollection,
                                sap.ushell.Container.getUser().getId(), oPageChipCollection, oTileApi);
                            if (frontendCacheQuery) {
                                // attachMetadataLoaded raja
                                const frontendModel = frontendCacheQuery.oModel;
                                const cacheQueriUri = frontendCacheQuery.uri;
                                let isCached = false;
                                frontendModel.read(cacheQueriUri, null, null, true, (data) => {
                                    if (data && data.results && data.results instanceof Array && data.results.length) {
                                        jQuery.each(data.results, (index, cachedData) => {
                                            sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(cachedData.ChipId, cachedData);
                                        });
                                    }
                                    if (sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(chipId)) {
                                        isCached = true;
                                    }
                                    oldDeferred.resolve(isCached);
                                }, (eObject) => {
                                    if (eObject && eObject.response) {
                                        Log.error(`${eObject.message} : ${eObject.request.requestUri}`);
                                    }
                                    oldDeferred.reject();
                                });
                            } else {
                                oldDeferred.reject();
                            }
                        } else {
                            oldDeferred.resolve(false);
                        }
                    });
                }
                return oldDeferred.promise();
            },

            getModelerRuntimeServiceModel: function () {
                let uri = "/sap/hba/r/sb/core/odata/runtime/SMART_BUSINESS.xsodata";
                uri = sap.ushell.components.tiles.indicatorTileUtils.util.cacheBustingMechanism(uri);
                return this.getODataModelByServiceUri(uri);
            },

            getSapFontErrorCode: function () {
                return String.fromCharCode(0xe0b1);
            },

            getSapFontBusyCode: function () {
                return String.fromCharCode(0xe1f2);
            },

            prepareFilterStructure: function (filter, addFilters) {
                const variantData = [];
                if (addFilters) {
                    filter = filter.concat(addFilters);
                }

                for (let itr = 0; itr < filter.length; itr++) {
                    const pushObj = {};
                    pushObj.comparator = filter[itr].OPERATOR;
                    pushObj.filterPropertyName = filter[itr].NAME;

                    if (filter[itr].ID) {
                        pushObj.id = filter[itr].ID;
                    }

                    pushObj.type = filter[itr].TYPE;
                    pushObj.value = filter[itr].VALUE_1;
                    pushObj.valueTo = filter[itr].VALUE_2;
                    variantData.push(pushObj);
                }

                return variantData;
            },

            getODataModelByServiceUriFromChipAPI: function (sServiceUri, oTileApi) {
                sServiceUri = oTileApi.url.addSystemToServiceUrl(sServiceUri);
                if (!cache[sServiceUri]) {
                    const oModel = new ODataModel(sServiceUri, true);
                    cache[sServiceUri] = oModel;
                }
                return cache[sServiceUri];
            },

            cacheBustingMechanism: function (sUrl) {
                if (window["sap-ushell-config"].cacheBusting.cacheBusterToken) {
                    const cacheBusting = window["sap-ushell-config"].cacheBusting && window["sap-ushell-config"].cacheBusting.cacheBusterToken;
                    sUrl = `${sUrl}?_=${cacheBusting}`;
                }
                return sUrl;
            },

            getRunTimeUri: function (sPlatform) {
                let urlWithHANA = "/sap/hba/r/sb/core/odata/runtime/SMART_BUSINESS.xsodata";
                let urlWithoutHANA = "/sap/opu/odata/SSB/SMART_BUSINESS_RUNTIME_SRV";
                if (sPlatform.toUpperCase() == "HANA") {
                    if (window["sap-ushell-config"].cacheBusting) {
                        urlWithHANA = sap.ushell.components.tiles.indicatorTileUtils.util.cacheBustingMechanism(urlWithHANA);
                    }
                    return urlWithHANA;
                }
                if (window["sap-ushell-config"].cacheBusting) {
                    urlWithoutHANA = sap.ushell.components.tiles.indicatorTileUtils.util.cacheBustingMechanism(urlWithoutHANA);
                }
                return urlWithoutHANA;
            },

            getFilterFromRunTimeService: function (oConfig, oTileApi, fnS, fnE) {
                const sPlatform = oConfig.TILE_PROPERTIES.sb_metadata;
                const KPI_RUNTIME_ODATA_MODEL = this.getODataModelByServiceUriFromChipAPI(this.getRunTimeUri(sPlatform), oTileApi);
                const filterValue = "ID eq '#EVALUATIONID'".replace("#EVALUATIONID", oConfig.EVALUATION.ID);
                const kpiEvaluationFilterODataReadRef = KPI_RUNTIME_ODATA_MODEL.read("/EVALUATION_FILTERS", null, { $filter: filterValue }, true, function (data) {
                    let filters = [];
                    if (data.results.length) {
                        filters = data.results;
                    }
                    fnS.call(this, filters);
                }, fnE);
                return kpiEvaluationFilterODataReadRef;
            },

            _getOData4AnalyticsObject: function (sUri) {
                let oModel = null;
                if (sUri instanceof ODataModel) {
                    oModel = sUri;
                } else if (typeof sUri === "string") {
                    oModel = this.getODataModelByServiceUri(sUri);
                } else {
                    throw new Error(`Invalid Input to Create ODataModel Object : ${sUri}`);
                }
                const O4A = new Model(ReferenceByModel(oModel));
                return O4A;
            },

            findTextPropertyForDimension: function (sUri, entitySet, dimension) {
                try {
                    const o4a = this._getOData4AnalyticsObject(sUri);
                    const queryResult = o4a.findQueryResultByName(entitySet);
                    const oDimension = queryResult.findDimensionByName(dimension);
                    if (oDimension.getTextProperty()) {
                        return oDimension.getTextProperty().name;
                    }
                    return dimension;
                } catch (e) {
                    Log.error(`Error Fetching Text Property for ${dimension} : ${e.toString()}`);
                }
            },

            getEvalValueMeasureName: function (oConfig, type, retType) {
                const evalValue = oConfig.EVALUATION_VALUES;
                for (let i = 0; i < evalValue.length; i++) {
                    if (evalValue[i].TYPE == type) {
                        if (retType === "FIXED") {
                            return evalValue[i].FIXED;
                        }
                        return evalValue[i].COLUMN_NAME;
                    }
                }
            },

            /**
             * get coded colorName
             * @param {object} applyColor event state
             */
            getSemanticColorName: function (applyColor) {
                let status = "";
                if (applyColor == "Error") {
                    status = "sb.error";
                }
                if (applyColor == "Neutral") {
                    status = "sb.neutral";
                }
                if (applyColor == "Critical") {
                    status = "sb.critical";
                }
                if (applyColor == "Good") {
                    status = "sb.good";
                }
                return status;
            },

            /**
             * sets tooltip for tile
             * @param {object} oControl
             * @param {string} tileType
             * @param {object} valueObj
             */
            setTooltipInTile: function (oControl, tileType, valueObj) {
                let toolTip = "";
                const oResourceBundle = sap.ushell.components.tiles.utils.getResourceBundle();
                if (tileType == "NT" || tileType == "DT") {
                    if (valueObj.status) {
                        toolTip += `${oResourceBundle.getText("sb.status")}: ${oResourceBundle.getText(valueObj.status)}\n`;
                    }
                    if (valueObj.actual) {
                        toolTip += `${oResourceBundle.getText("sb.actual")}: ${valueObj.actual}\n`;
                    }
                    if (valueObj.target) {
                        toolTip += `${oResourceBundle.getText("sb.target")}: ${valueObj.target}\n`;
                    }
                    if (valueObj.cH) {
                        toolTip += `${oResourceBundle.getText("sb.ch")}: ${valueObj.cH}\n`;
                    }
                    if (valueObj.wH) {
                        toolTip += `${oResourceBundle.getText("sb.wh")}: ${valueObj.wH}\n`;
                    }
                    if (valueObj.wL) {
                        toolTip += `${oResourceBundle.getText("sb.wl")}: ${valueObj.wL}\n`;
                    }
                    if (valueObj.cL) {
                        toolTip += `${oResourceBundle.getText("sb.cl")}: ${valueObj.cL}\n`;
                    }
                } if (tileType == "CONT" || tileType == "COMP") {
                    if (valueObj.measure && tileType == "CONT") {
                        if (valueObj && valueObj.contributionTile.contributionTile && valueObj.contributionTile.contributionTile[1] === "asc") {
                            toolTip += `${oResourceBundle.getText("sb.bottomn")}: ${valueObj.contributionTile[0]}\n`;
                        } else if (valueObj && valueObj.contributionTile.contributionTile && valueObj.contributionTile.contributionTile.length) {
                            toolTip += `${oResourceBundle.getText("sb.topn")}: ${valueObj.contributionTile[0]}\n`;
                        }
                    } if (valueObj.m1 && ((valueObj.v1 == undefined || valueObj.v1 == null) ? false : valueObj.v1.toString()) && valueObj.c1) {
                        toolTip += `${valueObj.m1}: ${valueObj.v1} ${oResourceBundle.getText(valueObj.c1)}\n`;
                    }
                    if (valueObj.m2 && ((valueObj.v2 == undefined || valueObj.v2 == null) ? false : valueObj.v2.toString()) && valueObj.c2) {
                        toolTip += `${valueObj.m2}: ${valueObj.v2} ${oResourceBundle.getText(valueObj.c2)}\n`;
                    }
                    if (valueObj.m3 && ((valueObj.v3 == undefined || valueObj.v3 == null) ? false : valueObj.v3.toString()) && valueObj.c3) {
                        toolTip += `${valueObj.m3}: ${valueObj.v3} ${oResourceBundle.getText(valueObj.c3)}\n`;
                    }
                }
                if (oControl && oControl.setTooltip) {
                    oControl.setTooltip(toolTip);
                }
            },

            /**
             * Read and initialize configuration object from given JSON string. Used by all indicator tiles.
             *
             * @param {string} sConfig Configuration string in JSON format
             * @returns {object} Returns parsed configuration object
             */
            _getFormattedTileProperties: function (tileProperties) {
                tileProperties = tileProperties || {};
                const properties = ["sb_metadata", "sb_navigation", "sb_catalog"];
                let isPlatformPresent = false;
                for (let i = 0; !isPlatformPresent && i < properties.length; i++) {
                    isPlatformPresent = isPlatformPresent || new UriParameters(window.location.href).get(properties[i]) || tileProperties[properties[i]];
                }
                tileProperties.sb_metadata = (new UriParameters(window.location.href).get("sb_metadata") || tileProperties.sb_metadata || "HANA").toLowerCase();
                tileProperties.sb_navigation = (new UriParameters(window.location.href).get("sb_navigation") || tileProperties.sb_navigation || "abap").toLowerCase();
                tileProperties.sb_catalog = (new UriParameters(window.location.href).get("sb_catalog") || tileProperties.sb_catalog || "HANA").toLowerCase();
                tileProperties.isPlatformInfoPresent = isPlatformPresent;
                return tileProperties;
            },

            /**
             * Read entity set name and evaluation id and return the appropriate call results.
             *
             * @param {string} oEntitySet Entity set name
             * @param {string} sPlatform Platform name
             * @param {string} oId Evaluation ID
             * @param {function} callback Callback function to handle the results
             */
            getEvaluationDetailsFromRunTimeService: function (oEntitySet, sPlatform, oId, callback) {
                const KPI_RUNTIME_ODATA_MODEL = this.getODataModelByServiceUri(this.getRunTimeUri(sPlatform));
                const filterValue = "ID eq '#EVALUATIONID'".replace("#EVALUATIONID", oId);
                KPI_RUNTIME_ODATA_MODEL.read(oEntitySet, null, { $filter: filterValue }, true, function (data) {
                    let filters = [];
                    if (data.results.length) {
                        filters = data.results;
                    }
                    callback.call(this, filters);
                });
            },

            getParsedChip: function (sConfig, bIsPreview, callback) {
                try {
                    const parsedChipConfig = {};
                    const chipJson = JSON.parse(sConfig);
                    const evaluationId = JSON.parse(chipJson.TILE_PROPERTIES).evaluationId || "";
                    if (chipJson.TILE_PROPERTIES) {
                        const tileProperties = JSON.parse(chipJson.TILE_PROPERTIES);
                        if (tileProperties
                            && (tileProperties.instanceId || tileProperties.catalogId)) {
                            return false;
                        }
                    }
                    const that = this;
                    if (chipJson.blankTile) {
                        parsedChipConfig.BLANKTILE = chipJson.blankTile;
                    }
                    if (chipJson.cachingTime) {
                        parsedChipConfig.CACHINGTIME = chipJson.cachingTime;
                    }
                    if (chipJson.cachingTimeUnit) {
                        parsedChipConfig.CACHINGUNIT = chipJson.cachingTimeUnit;
                    }
                    if (chipJson.TAGS) {
                        parsedChipConfig.TAGS = JSON.parse(chipJson.TAGS);
                    }
                    if (chipJson.ADDITIONAL_FILTERS) {
                        parsedChipConfig.ADDITIONAL_FILTERS = JSON.parse(chipJson.ADDITIONAL_FILTERS);
                    }
                    if (chipJson.ADDITIONAL_APP_PARAMETERS) {
                        parsedChipConfig.ADDITIONAL_APP_PARAMETERS = JSON.parse(chipJson.ADDITIONAL_APP_PARAMETERS);
                    }

                    parsedChipConfig.TILE_PROPERTIES = this._getFormattedTileProperties(JSON.parse(chipJson.TILE_PROPERTIES));

                    const sPlatform = parsedChipConfig.TILE_PROPERTIES.sb_metadata;

                    if (chipJson.EVALUATION_FILTERS) {
                        parsedChipConfig.EVALUATION_FILTERS = JSON.parse(chipJson.EVALUATION_FILTERS);
                        if (chipJson.EVALUATION_VALUES) {
                            parsedChipConfig.EVALUATION_VALUES = JSON.parse(chipJson.EVALUATION_VALUES);
                            if (chipJson.EVALUATION) {
                                parsedChipConfig.EVALUATION = JSON.parse(chipJson.EVALUATION);
                                if (callback) {
                                    callback(parsedChipConfig);
                                } else {
                                    return parsedChipConfig;
                                }
                            } else if (!bIsPreview) {
                                that.getEvaluationDetailsFromRunTimeService("/EVALUATIONS", sPlatform, evaluationId, (filters) => {
                                    parsedChipConfig.EVALUATION = filters;
                                    if (callback) {
                                        callback(parsedChipConfig);
                                    } else {
                                        return parsedChipConfig;
                                    }
                                });
                            } else if (callback) {
                                callback(parsedChipConfig);
                            } else {
                                return parsedChipConfig;
                            }
                        } else if (!bIsPreview) {
                            that.getEvaluationDetailsFromRunTimeService("/EVALUATION_VALUES", sPlatform, evaluationId, (filters) => {
                                parsedChipConfig.EVALUATION_VALUES = filters;
                                if (chipJson.EVALUATION) {
                                    parsedChipConfig.EVALUATION = JSON.parse(chipJson.EVALUATION);
                                    if (callback) {
                                        callback(parsedChipConfig);
                                    } else {
                                        return parsedChipConfig;
                                    }
                                } else {
                                    that.getEvaluationDetailsFromRunTimeService("/EVALUATIONS", sPlatform, evaluationId, (filters) => {
                                        parsedChipConfig.EVALUATION = filters;
                                        if (callback) {
                                            callback(parsedChipConfig);
                                        } else {
                                            return parsedChipConfig;
                                        }
                                    });
                                }
                            });
                        } else if (callback) {
                            callback(parsedChipConfig);
                        } else {
                            return parsedChipConfig;
                        }
                    } else if (bIsPreview) {
                        if (callback) {
                            callback(parsedChipConfig);
                        } else {
                            return parsedChipConfig;
                        }
                    } else {
                        that.getEvaluationDetailsFromRunTimeService("/EVALUATION_FILTERS", sPlatform, evaluationId, (filters) => {
                            parsedChipConfig.EVALUATION_FILTERS = filters;
                            if (chipJson.EVALUATION_VALUES) {
                                parsedChipConfig.EVALUATION_VALUES = JSON.parse(chipJson.EVALUATION_VALUES);
                                if (chipJson.EVALUATION) {
                                    parsedChipConfig.EVALUATION = JSON.parse(chipJson.EVALUATION);
                                    if (callback) {
                                        callback(parsedChipConfig);
                                    } else {
                                        return parsedChipConfig;
                                    }
                                } else {
                                    that.getEvaluationDetailsFromRunTimeService("/EVALUATIONS", sPlatform, evaluationId, (filters) => {
                                        parsedChipConfig.EVALUATION = filters;
                                        if (callback) {
                                            callback(parsedChipConfig);
                                        } else {
                                            return parsedChipConfig;
                                        }
                                    });
                                }
                            } else {
                                that.getEvaluationDetailsFromRunTimeService("/EVALUATION_VALUES", sPlatform, evaluationId, (filters) => {
                                    parsedChipConfig.EVALUATION_VALUES = filters;
                                    if (chipJson.EVALUATION) {
                                        parsedChipConfig.EVALUATION = JSON.parse(chipJson.EVALUATION);
                                        if (callback) {
                                            callback(parsedChipConfig);
                                        } else {
                                            return parsedChipConfig;
                                        }
                                    } else {
                                        that.getEvaluationDetailsFromRunTimeService("/EVALUATIONS", sPlatform, evaluationId, (filters) => {
                                            parsedChipConfig.EVALUATION = filters;
                                            if (callback) {
                                                callback(parsedChipConfig);
                                            } else {
                                                return parsedChipConfig;
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                } catch (exp) {
                    return false;
                }
            },

            /**
             * Read and create external target Nav Hash
             *
             * @param {JSON} jConfig configuration object for CHIP
             * @param {string} system system name
             * @returns {string} Returns navigation hash
             */
            getNavigationTarget: function (jConfig, system) {
                let each;
                const param = {};
                param.evaluationId = jConfig.EVALUATION.ID;
                param.chipId = jConfig.TILE_PROPERTIES.id;
                if (system) {
                    param["sap-system"] = system;
                }

                param.tileType = jConfig.TILE_PROPERTIES.tileType;

                if (jConfig.TILE_PROPERTIES.dimension) {
                    param.dimension = jConfig.TILE_PROPERTIES.dimension;
                }
                if (jConfig.TILE_PROPERTIES.storyId) {
                    param.storyId = jConfig.TILE_PROPERTIES.storyId;
                }
                if (jConfig.TILE_PROPERTIES.apfConfId) {
                    param["sap-apf-configuration-id"] = jConfig.TILE_PROPERTIES.apfConfId;
                }
                if (jConfig.TILE_PROPERTIES.isPlatformInfoPresent) {
                    param.sb_metadata = jConfig.TILE_PROPERTIES.sb_metadata;
                    param.sb_navigation = jConfig.TILE_PROPERTIES.sb_navigation;
                    param.sb_catalog = jConfig.TILE_PROPERTIES.sb_catalog;
                }
                if (jConfig.ADDITIONAL_APP_PARAMETERS) {
                    for (each in jConfig.ADDITIONAL_APP_PARAMETERS) {
                        if (jConfig.ADDITIONAL_APP_PARAMETERS.hasOwnProperty(each)) {
                            if (jConfig.ADDITIONAL_APP_PARAMETERS[each].constructor == Array) {
                                const addApp = jConfig.ADDITIONAL_APP_PARAMETERS[each];
                                for (let i = 0; i < addApp.length; i++) {
                                    param[each] = addApp[i];
                                }
                            } else {
                                param[each] = jConfig.ADDITIONAL_APP_PARAMETERS[each];
                            }
                        }
                    }
                } let toOurApp = oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: jConfig.TILE_PROPERTIES.semanticObject,
                        action: jConfig.TILE_PROPERTIES.semanticAction
                    },
                    params: param
                }) || "";
                if (jConfig.ADDITIONAL_FILTERS) {
                    const addFilter = jConfig.ADDITIONAL_FILTERS;
                    let addFilterString = "&";
                    for (let j = 0; j < addFilter.length; j++) {
                        if (addFilter[j].OPERATOR === "EQ") {
                            addFilterString = `${addFilterString}/${addFilter[j].NAME}=${addFilter[j].VALUE_1}`;
                        }
                    } toOurApp += addFilterString;
                }
                return toOurApp;
            },

            /**
             * Read chipConfig object and return appropriate title
             *
             * @param {JSON} jConfig config configuration object for CHIP
             * @returns {string} returns title for tile
             */
            getChipTitle: function (jConfig) {
                let title = "";
                if (jConfig) {
                    const chipIndicator = jConfig.EVALUATION || {};
                    title = chipIndicator.INDICATOR_TITLE || "";
                }
                return title;
            },

            getstringifyTileConfig: function (jConfig) {
                const sConfig = {};
                sConfig.EVALUATION = JSON.stringify(jConfig.EVALUATION);
                sConfig.EVALUATION_FILTERS = JSON.stringify(jConfig.EVALUATION_FILTERS);
                sConfig.EVALUATION_VALUES = JSON.stringify(jConfig.EVALUATION_VALUES);
                sConfig.TILE_PROPERTIES = JSON.stringify(jConfig.TILE_PROPERTIES);
                return JSON.stringify(sConfig);
            },

            /**
             * Read chipConfig object and return appropriate subTitle
             *
             * @param {JSON} jConfig config configuration object for CHIP
             * @returns {string} returns subtitle for tile
             */
            getChipSubTitle: function (jConfig) {
                let sTitle = "";
                if (jConfig) {
                    const chipEvaluation = jConfig.EVALUATION || {};
                    sTitle = chipEvaluation.TITLE || "";
                }
                return sTitle;
            },

            getAllMeasures: function (sUri, entitySet) {
                let measures = [];
                try {
                    const o4a = this._getOData4AnalyticsObject(sUri);
                    const queryResult = o4a.findQueryResultByName(entitySet);
                    measures = queryResult.getAllMeasureNames();
                } catch (e) {
                    Log.error(`Error Fetching All Measures : ${e.toString()}`);
                }
                return measures;
            },

            getFormattingMetadata: function (sUri, entitySet, propertyName) {
                const formattingMetadata = {};
                formattingMetadata._hasCurrency = false;
                formattingMetadata._hasSapText = false;

                let modelReferenceBy = null;
                if (sUri instanceof ODataModel) {
                    modelReferenceBy = ReferenceByModel(sUri);
                } else {
                    const tempModel = this.getODataModelByServiceUri(sUri);
                    modelReferenceBy = ReferenceByModel(tempModel);
                }
                const O4A = new Model(modelReferenceBy);
                const queryResult = O4A.findQueryResultByName(entitySet);

                const measures = queryResult.getAllMeasures();

                if (measures[propertyName]) {
                    const sapTextPropertyName = (measures[propertyName]._oTextProperty && measures[propertyName]._oTextProperty.name) ?
                        measures[propertyName]._oTextProperty.name : "";

                    if (sapTextPropertyName != "") {
                        formattingMetadata._hasSapText = true;
                        formattingMetadata._sapTextColumn = sapTextPropertyName;
                    } else if (measures[propertyName].hasOwnProperty("_oUnitProperty")) {
                        const extensions = measures[propertyName]._oUnitProperty.extensions;
                        for (let i = 0; i < measures[propertyName]._oUnitProperty.extensions.length; i++) {
                            if (extensions[i].name === "semantics" && extensions[i].value === "currency-code") {
                                formattingMetadata._hasCurrency = true;
                                formattingMetadata._currencyColumn = measures[propertyName]._oUnitProperty.name;
                            }
                        }
                    }
                } return formattingMetadata;
            },

            getAllDimensions: function (sUri, entitySet) {
                function intersectionOfArray (array1, array2) {
                    let ai = 0; let bi = 0;
                    const result = [];
                    while (ai < array1.length && bi < array2.length) {
                        if (array1[ai] < array2[bi]) {
                            ai++;
                        } else if (array1[ai] > array2[bi]) {
                            bi++;
                        } else { /* they're equal */
                            result.push(array1[ai]);
                            ai++;
                            bi++;
                        }
                    } return result;
                }
                let dimensions = [];
                let aFilterablePropertyNames = [];
                try {
                    const o4a = this._getOData4AnalyticsObject(sUri);
                    const queryResult = o4a.findQueryResultByName(entitySet);
                    const entityType = queryResult.getEntityType();
                    aFilterablePropertyNames = entityType.getFilterablePropertyNames();
                    dimensions = queryResult.getAllDimensionNames();
                    if (aFilterablePropertyNames && aFilterablePropertyNames.length) {
                        dimensions = intersectionOfArray(aFilterablePropertyNames.sort(), dimensions.sort());
                    }
                } catch (e) {
                    Log.error(`Error Fetching All Dimesions : ${e.toString()}`);
                }
                return dimensions;
            },

            /**
             * Returns fully formed oData Query URI using oData4Analytics Library
             *
             * @param {string} sUri oData entry URI
             * @param {string} entitySet entitySet in oDataURI for query
             * @param {string} measure aggregation of value on column name measure
             * @param {string} dimension aggregation of value on column name group by dimension
             * @param {JSON} variants $filter parameter in oData URI
             * @param {string} orderByElements orderBy either asc or desc
             * @param {string} top how many top values to select
             * @returns {string} Returns fully formed oData URI
             */
            prepareQueryServiceUri: function (sUri, entitySet, measure, dimension, variants, orderByElements, top) {
                function _replaceSingleQuoteWithDoubleSingleQuote (str) {
                    return str.replace(/'/g, "''");
                }
                let tmpDimension = null;
                function changeToYYYYMMDDHHMMSS (odate) {
                    let dateStr = odate.toJSON();
                    const lastChar = dateStr.charAt(dateStr.length - 1).toUpperCase();
                    if (lastChar.charCodeAt(0) >= 65 && lastChar.charCodeAt(0) <= 90) {
                        dateStr = dateStr.slice(0, -1);
                    }
                    return dateStr;
                }
                function _processODataDateTime (junkValue) {
                    if (junkValue) {
                        try {
                            if (junkValue == +junkValue) {
                                junkValue = window.parseInt(junkValue);
                            }
                            const date = new Date(junkValue);
                            const time = date.getTime();
                            if (isNaN(time)) {
                                return junkValue;
                            }
                            return changeToYYYYMMDDHHMMSS(date);
                        } catch (e) {
                            // empty
                        }
                    } return junkValue;
                }

                try {
                    let modelReferenceBy = null;
                    if (sUri instanceof ODataModel) {
                        modelReferenceBy = ReferenceByModel(sUri);
                    } else {
                        const tempModel = this.getODataModelByServiceUri(sUri);
                        modelReferenceBy = ReferenceByModel(tempModel);
                    }
                    const O4A = new Model(modelReferenceBy);
                    const oQueryResult = O4A.findQueryResultByName(entitySet);
                    const oQueryResultRequest = new QueryResultRequest(oQueryResult);
                    if (measure) {
                        oQueryResultRequest.setMeasures(measure.split(","));
                        oQueryResultRequest.includeMeasureRawFormattedValueUnit(null, true, true, true);
                    }
                    if (dimension) {
                        if (typeof dimension === "string") {
                            tmpDimension = dimension;
                            tmpDimension = tmpDimension.split(",");
                        }

                        for (let i = 0; i < tmpDimension.length; i++) {
                            oQueryResultRequest.addToAggregationLevel([tmpDimension[i]]);
                            const tmp = oQueryResult.getAllDimensions();
                            if (tmp[tmpDimension[i]].getTextProperty() != null) {
                                oQueryResultRequest.includeDimensionKeyTextAttributes([tmpDimension[i]], true, true, null);
                            }
                        }
                    }

                    if (variants && variants.length) {
                        const filterVariants = [];
                        const inputParamsVariants = [];
                        let each;
                        for (let i = 0, l = variants.length; i < l; i++) {
                            each = variants[i];
                            if (each.type === "PA") {
                                inputParamsVariants.push(each);
                            } else if (each.type === "FI") {
                                filterVariants.push(each);
                            }
                        }

                        if (filterVariants.length) {
                            const oFilterExpression = oQueryResultRequest.getFilterExpression();
                            for (let i = 0, l = filterVariants.length; i < l; i++) {
                                each = filterVariants[i];
                                if (this.getEdmType(sUri, each.filterPropertyName) == "Edm.DateTime") {
                                    each.value = _processODataDateTime(each.value);
                                    each.valueTo = _processODataDateTime(each.valueTo);
                                }
                                if (each.comparator == FilterOperator.BT) {
                                    oFilterExpression.addCondition(each.filterPropertyName, each.comparator, _replaceSingleQuoteWithDoubleSingleQuote(each.value), each.valueTo);
                                } else {
                                    const multipleFilterValueArray = each.value.split(",");
                                    for (let j = 0, k = multipleFilterValueArray.length; j < k; j++) {
                                        oFilterExpression.addCondition(each.filterPropertyName, each.comparator,
                                            _replaceSingleQuoteWithDoubleSingleQuote(multipleFilterValueArray[j].replace(/\^\|/g, ",")), null);
                                    }
                                }
                            }
                        } if (inputParamsVariants.length) {
                            if (oQueryResult.getParameterization()) {
                                const oParamRequest = new ParameterizationRequest(oQueryResult.getParameterization());
                                const paramererizationObj = oQueryResult.getParameterization();
                                let eachInputParam; let findParameter; let fromVal; let toVal; let toValParam;
                                for (let y = 0, z = inputParamsVariants.length; y < z; y++) {
                                    eachInputParam = inputParamsVariants[y];
                                    findParameter = paramererizationObj.findParameterByName(eachInputParam.filterPropertyName);
                                    if (findParameter.isIntervalBoundary() === true && findParameter.isLowerIntervalBoundary() === true) {
                                        toValParam = findParameter.getPeerIntervalBoundaryParameter();
                                        for (let i = 0, l = inputParamsVariants.length; i < l; i++) {
                                            if (inputParamsVariants[i].filterPropertyName === toValParam.getName()) {
                                                toVal = _replaceSingleQuoteWithDoubleSingleQuote(inputParamsVariants[i].value);
                                                break;
                                            }
                                        } fromVal = _replaceSingleQuoteWithDoubleSingleQuote(eachInputParam.value);
                                        if (toVal) {
                                            oParamRequest.setParameterValue(eachInputParam.filterPropertyName, fromVal, toVal);
                                        }
                                    } else if (findParameter.isIntervalBoundary() === true && findParameter.isLowerIntervalBoundary() === false) {
                                        // Do nothing for upper Boundary
                                        Log.info("Future development");
                                    } else {
                                        oParamRequest.setParameterValue(eachInputParam.filterPropertyName, _replaceSingleQuoteWithDoubleSingleQuote(eachInputParam.value));
                                    }
                                } oQueryResultRequest.setParameterizationRequest(oParamRequest);
                            }
                        }
                    }
                    let finalUri = oQueryResultRequest.getURIToQueryResultEntries();

                    if (orderByElements && orderByElements.length) {
                        finalUri = `${finalUri}&$orderby=`;
                        for (let y = 0, z = orderByElements.length; y < z; y++) {
                            const order = orderByElements[y].sortOrder || "asc";
                            if (order) {
                                finalUri += `${orderByElements[y].element} ${order},`;
                            }
                        } finalUri = finalUri.slice(0, finalUri.length - 1);
                    }

                    if (top) {
                        finalUri = `${finalUri}&$top=${top}`;
                    }

                    const oMeasureNames = oQueryResult.getAllMeasures();
                    const unit = [];
                    for (let i = 0; i < measure.split(",").length; i++) {
                        unit.push(oMeasureNames[measure.split(",")[i]].getUnitProperty());
                    }
                    return {
                        uri: finalUri,
                        model: O4A.getODataModel(),
                        unit: unit
                    };
                } catch (e) {
                    Log.error(`Error Preparing Query Service Uri using OData4Analytics Library : ${e.toString()}`);
                    if (arguments.length) {
                        Log.error("Arguments Passed to this function");
                        Log.error(`${arguments[0]},${arguments[1]},${arguments[2]},${arguments[3]}`);
                    } else {
                        Log.error("NO Arguments passed to this function");
                    }
                    return null;
                }
            },

            getAllEntitySet: function (sUri) {
                let entitySets = [];
                try {
                    const o4a = this._getOData4AnalyticsObject(sUri);
                    entitySets = o4a.getAllQueryResultNames();
                } catch (e) {
                    Log.error(`Error fetching Enity Set : ${e.toString()}`);
                }
                return entitySets;
            },

            getAllMeasuresWithLabelText: function (sUri, entitySet) {
                const measures = [];
                try {
                    const o4a = this._getOData4AnalyticsObject(sUri);
                    const queryResult = o4a.findQueryResultByName(entitySet);
                    const measureNames = queryResult.getAllMeasureNames();
                    for (let i = 0; i < measureNames.length; i++) {
                        const each = measureNames[i];
                        global.oMeasure = queryResult.findMeasureByName(each);
                        measures.push({
                            key: each,
                            value: oMeasure.getLabelText() // omeasure? global, likely a bug?
                        });
                    }
                } catch (e) {
                    Log.error(`Error Fetching All Measures : ${e.toString()}`);
                }
                return measures;
            },

            getAllDimensionsWithLabelText: function (sUri, entitySet) {
                const dimensions = [];
                try {
                    const o4a = this._getOData4AnalyticsObject(sUri);
                    const queryResult = o4a.findQueryResultByName(entitySet);
                    const dimensionNames = queryResult.getAllDimensionNames();
                    for (let i = 0; i < dimensionNames.length; i++) {
                        const each = dimensionNames[i];
                        const oDimension = queryResult.findDimensionByName(each);
                        let textProperty = null;
                        if (oDimension.getTextProperty() != null) {
                            textProperty = oDimension.getTextProperty().name;
                        }
                        dimensions.push({
                            key: each,
                            value: oDimension.getLabelText(),
                            textProperty: textProperty
                        });
                    }
                } catch (e) {
                    Log.error(`Error Fetching All Dimesions : ${e.toString()}`);
                }
                return dimensions;
            },

            getAllInputParams: function (sUri, entitySet) {
                let inputParams = [];
                try {
                    const o4a = this._getOData4AnalyticsObject(sUri);
                    const queryResult = o4a.findQueryResultByName(entitySet);
                    if (queryResult.getParameterization()) {
                        const oParams = queryResult.getParameterization();
                        inputParams = oParams.getAllParameterNames();
                    }
                } catch (e) {
                    Log.error(`Error Fetching Input Params : ${e.toString()}`);
                }
                return inputParams;
            },

            getAllInputParamsWithFlag: function (sUri, entitySet) {
                const inputParams = [];
                try {
                    const o4a = this._getOData4AnalyticsObject(sUri);
                    const queryResult = o4a.findQueryResultByName(entitySet);
                    if (queryResult.getParameterization()) {
                        const oParams = queryResult.getParameterization();
                        const inputParamsArray = oParams.getAllParameterNames();
                        for (let i = 0; i < inputParamsArray.length; i++) {
                            const each = inputParamsArray[i];
                            const paramObject = oParams.findParameterByName(each);
                            inputParams.push({
                                name: each,
                                optional: paramObject.isOptional()
                            });
                        }
                    }
                } catch (e) {
                    Log.error(`Error Fetching Input Params : ${e.toString()}`);
                }
                return inputParams;
            },

            formatOdataObjectToString: function (value) {
                if (value && value.constructor == Object) {
                    if (value.__edmType == "Edm.Time") {
                        const milliseconds = value.ms;
                        const seconds = Math.floor((milliseconds / 1000) % 60);
                        const minutes = Math.floor((milliseconds / 60000) % 60);
                        const hours = Math.floor((milliseconds / 3600000) % 24);
                        return `${hours}H${minutes}M${seconds}S`;
                    }
                } return value;
            },

            generateCombinations: function (array) {
                function getPerfectBinary (maxLength, str) {
                    while (str.length < maxLength) {
                        str = `0${str}`;
                    }
                    return str;
                }
                let max = Math.pow(2, array.length);
                const resultArray = [];
                let index = 0;

                while (max > 1) {
                    let str = (max - 1).toString(2);
                    str = getPerfectBinary(array.length, str);
                    resultArray[index] = [];
                    for (let i = 0; i < str.length; i++) {
                        if (Number(str[i])) {
                            resultArray[index].push(array[i]);
                        }
                    } max--;
                    index++;
                }
                return resultArray;
            },

            logError: function (err, oControl) {
                if (err == "no data" && oControl) {
                    const oResourceBundle = sap.ushell.components.tiles.utils.getResourceBundle();
                    oControl.setFailedText(oResourceBundle.getText("sb.noData"));
                }
                Log.error(err.toString());
            },

            numberOfLeadingZeros: function (num) {
                num = String(num);
                let count = 0;
                const decimal_index = num.indexOf(".");
                if (decimal_index == -1) {
                    return 0;
                }
                if (Number(num.split(".")[0]) != 0) {
                    return 0;
                }
                let i = decimal_index + 1;
                while (num[i++] == "0") {
                    ++count;
                }
                return count;
            },

            formatValue: function (val, scaleFactor, MAX_LEN) {
                MAX_LEN = MAX_LEN || 3;
                const unit = { 3: "K", 6: "M", 9: "B", 12: "T", 0: "" };
                unit["-3"] = "m";
                unit["-6"] = "u";
                unit["-9"] = "n";
                unit["-12"] = "t";
                unit["-2"] = "%";
                let pre; let suff;
                const temp = Number(val).toPrecision(MAX_LEN);
                const zeroes = this.numberOfLeadingZeros(temp);
                if (zeroes > 0 && scaleFactor < 0) {
                    pre = temp * Math.pow(10, zeroes + MAX_LEN);
                    suff = -(zeroes + MAX_LEN);
                } else {
                    pre = Number(temp.split("e")[0]);
                    suff = Number(temp.split("e")[1]) || 0;
                }
                if (!val && val != 0) {
                    return { value: "", unitPrefix: "" };
                }

                let x;

                if (scaleFactor >= 0) {
                    if (suff % 3 != 0) {
                        if (suff % 3 == 2) {
                            if (suff + 1 == scaleFactor) {
                                suff = suff + 1;
                                pre = pre / 10;
                            } else {
                                suff = suff - 2;
                                pre = pre * 100;
                            }
                        } else if (suff + 2 == scaleFactor) {
                            suff = suff + 2;
                            pre = pre / 100;
                        } else {
                            suff--;
                            pre = pre * 10;
                        }
                    } else if (suff == 15) {
                        pre = pre * 1000;
                        suff = 12;
                    }
                } else if (scaleFactor == "-2") { // for negative scale factor and suff
                    x = this.formatValue((val * 100), 0);
                } else if (suff >= 0 && val < 10 && scaleFactor == "-3") {
                    pre = val * Math.pow(10, 3);
                    suff = -3;
                } else if (suff >= 0) {
                    return this.formatValue(val, 0);
                } else {
                    suff = Math.abs(suff);
                    scaleFactor = Math.abs(scaleFactor);
                    if (scaleFactor > suff) {
                        pre = pre / (Math.pow(10, suff % 3));
                        suff = suff - (suff % 3);
                    } else {
                        const diff = suff - scaleFactor;
                        pre = pre / (Math.pow(10, diff));
                        suff = suff - diff;
                    }
                    suff = 0 - suff;
                }

                // ending of neg scale factor
                pre += "";
                if (scaleFactor == "-2") {
                    const valstr = (x.unitPrefix == "") ? Number(`${x.value}`).toFixed(4 - (`${x.value}`).indexOf(".")) : Number(`${x.value}`).toFixed(3 - (`${x.value}`).indexOf("."));
                    return { value: Number(valstr), unitPrefix: (x.unitPrefix) + unit[-2] };
                }
                pre = Number(pre).toFixed(4 - pre.indexOf("."));
                return { value: Number(pre), unitPrefix: unit[suff] };
            },

            isSmartbusinessChipAndCachable: function (baseChip) {
                const oConfig = this.getParsedChip(baseChip && baseChip.getConfigurationParameter("tileConfiguration"));
                return (oConfig &&
                    oConfig.TILE_PROPERTIES &&
                    oConfig.TILE_PROPERTIES.tileType &&
                    this.getCachingTime(oConfig));
            },

            getHanaClient: function () {
                let sessionClient;
                function success (d, s, x) {
                    sessionClient = d.sessionClient;
                    sap.ushell.components.tiles.indicatorTileUtils.cache.setCacheHanaClient(sessionClient);
                    sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.resolve(sessionClient);
                }

                function error (jqXHR, textStatus, errorThrown) {
                    Log.error(jqXHR.responseText);
                    Log.error("session client call failed");
                    sap.ushell.components.tiles.indicatorTileUtils.cache.setCacheHanaClient(null);
                    sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.reject();
                }

                const deferred = sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED || jQuery.Deferred();
                const cacheHanaClient = sap.ushell.components.tiles.indicatorTileUtils.cache.getCacheHanaClient();
                if (cacheHanaClient != undefined) {
                    sessionClient = cacheHanaClient;
                    sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.resolve(sessionClient);
                } else if (sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED) {
                    return sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.promise();
                } else {
                    sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED = deferred;
                    jQuery.ajax({
                        type: "GET",
                        async: false,
                        dataType: "json",
                        url: "/sap/hba/r/sb/core/logic/GetSessionClient.xsjs",
                        success: success,
                        error: error
                    });
                }
                return sap.ushell.components.tiles.indicatorTileUtils.util.HANA_CLIENT_DEFERRED.promise();
            },

            abortPendingODataCalls: function (oDataCallRef) {
                try {
                    if (oDataCallRef) {
                        oDataCallRef.abort();
                    }
                } catch (e) {
                    this.logError(e);
                }
            }
        };
    })(window, jQuery);

    sap.ushell.components.tiles.indicatorTileUtils.cache = (function () {
        const BIGMAP = {};
        const KPIVALUE = {};
        const sessionContext = "HANA_CLIENT";
        return {
            getCacheHanaClient: function () {
                return BIGMAP[sessionContext];
            },

            setCacheHanaClient: function (data) {
                BIGMAP[sessionContext] = data;
            },

            getEvaluationByChipId: function (key) {
                if (BIGMAP[key]) {
                    return BIGMAP[key];
                }
                return null;
            },

            getEvaluationById: function (key) {
                return this.getEvaluationByChipId(key);
            },

            setEvaluationById: function (key, data) {
                BIGMAP[key] = data;
            },

            getFrontEndCacheDeferredObject: function (key) {
                if (BIGMAP[key]) {
                    return BIGMAP[key];
                }
                return null;
            },

            setFrontEndCacheDefferedObject: function (key, data) {
                BIGMAP[key] = data;
            },

            getKpivalueById: function (key) {
                if (KPIVALUE[key]) {
                    return KPIVALUE[key];
                }
                return null;
            },

            setKpivalueById: function (key, data) {
                KPIVALUE[key] = data;
            }
        };
    })();
    return {};
}, /* bExport= */ true);
