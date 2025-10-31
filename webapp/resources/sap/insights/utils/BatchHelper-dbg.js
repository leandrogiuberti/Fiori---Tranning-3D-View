/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log",
    "./AppConstants",
    "./InsightsUtils"
], function (BaseObject, Log, AppConstants, InsightsUtils) {
    "use strict";

    var batchHelper = BaseObject.extend("sap.insights.utils.BatchHelper", {});
    var oLogger = Log.getLogger("sap.insights.utils.BatchHelper");
    var csrfToken;

    /**
     * Functiion to create the multipart request object
     *
     * @param {object} oPayload url for multipart request
     * @param {string} sRequestMethod HTTP method type
     * @returns {object} of type MultiPartRequest
     */
    function MultiPartRequest(oPayload, sRequestMethod) {
        var url = "INSIGHTS_CARDS";
        this.url = sRequestMethod === "POST" ? url : url + "('" + oPayload.id + "')";
        this.mOptions = {};
        this.batchRequests = [];
        this.payload = oPayload;
        this.boundary = "batch_id_" + Date.now() + "_01";
        this.mOptions.headers = {};
        this.mOptions.method = sRequestMethod || AppConstants.PUT;
        this.mOptions.headers["content-type"] = "multipart/mixed;boundary=" + this.boundary;
        this.mOptions.headers["X-CSRF-Token"] = csrfToken;
        return this;
    }

    function fetchCSRFToken() {
        return fetch(AppConstants.REPO_BASE_URL, {
            method: "HEAD",
            headers: {
                "X-CSRF-Token": "Fetch"
            }
        }).then(function (resposne) {
            var token = resposne.headers.get("X-CSRF-Token");
            if (resposne.ok && token) {
                return token;
            }
            var sErrMsg = InsightsUtils.getResourceBundle().getText('tokenFetchError');
            oLogger.error(sErrMsg);
            throw new Error(sErrMsg);
        });
    }

    MultiPartRequest.prototype.addRequest = function (oRequest) {
        this.batchRequests.push(oRequest);
    };

    MultiPartRequest.prototype._constructBody = function () {
        var BOUNDARY = "--" + this.boundary;
        var NEW_LINE = "\r\n";
        var REQUEST_HEADERS = "Content-Type:application/http" + NEW_LINE
            + "Content-Transfer-Encoding:binary" + NEW_LINE;
        var changeSet = "changeset_001";
        var CHANGESET_BOUNDAY = "--" + changeSet;
        var CHANGESET_HEADER = "Content-Type: multipart/mixed; boundary=" + changeSet + NEW_LINE;

        var body = BOUNDARY + NEW_LINE + CHANGESET_HEADER;
            body += NEW_LINE + CHANGESET_BOUNDAY;

        for (var iIndex = 0; iIndex < this.batchRequests.length; iIndex++) {
            var request = this.batchRequests[iIndex];
            body += NEW_LINE + REQUEST_HEADERS;
            body += "Content-ID: " + (iIndex + 1) + NEW_LINE + NEW_LINE;
            body += request.mOptions.method + " " + request.url + " HTTP/1.1 " + NEW_LINE;
            body += "sap-context-accept: header" + NEW_LINE + "Content-Type:application/json" + NEW_LINE + NEW_LINE;
            body += JSON.stringify(this.batchRequests[iIndex].payload) + NEW_LINE + NEW_LINE;
            body += CHANGESET_BOUNDAY;
            if (iIndex === (this.batchRequests.length - 1)) {
                body += "--" + NEW_LINE;
                body += BOUNDARY + "--";
            }
        }

        return body;
    };

    batchHelper.createMultipartRequest = function (aPayloads, sRequestMethod) {
        return fetchCSRFToken().then(function(sCSRFToken){
            this.url = "/sap/opu/odata4/ui2/insights_srv/srvd/ui2/insights_cards_repo_srv/0001/$batch";
            this.batchRequests = [];
            var oRequest;
            csrfToken = sCSRFToken;
            for (var iPayloadIndex = 0; iPayloadIndex < aPayloads.length; iPayloadIndex++) {
                var oPayload = aPayloads[iPayloadIndex];
                var oMultRequest = new MultiPartRequest(oPayload, sRequestMethod);
                if (!oRequest) {
                    oRequest = oMultRequest;
                }
                oRequest.addRequest(oMultRequest);
            }
            return this.fetchData(oRequest);
        }.bind(this));
    };

    batchHelper.fetchData = function (oMultiPartRequest) {
        oMultiPartRequest.mOptions.body = oMultiPartRequest._constructBody();
        oMultiPartRequest.mOptions.method = "POST";
        return fetch(this.url, oMultiPartRequest.mOptions).then(function(response) {
            if (response.ok === false) {
                throw new Error();
            }
            return response.text();
        }).then(function(text) {
            return InsightsUtils.getDataFromRawValue(text);
        });
    };

    return batchHelper;

});