/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
    "sap/ui/core/Lib"
], function (CoreLib) {
    "use strict";
    return {
        getResourceBundle:  function () {
            if (!this.i18nBundle) {
                this.i18nBundle = CoreLib.getResourceBundleFor("sap.insights");
            }
            return this.i18nBundle;
        },
        /**
         * Function to take multipart body as input and return array of values called in batch request
         *
         * @param {string} sValue multipart body response
         * @returns {Array} Array of values in the multipart request
        */
        getDataFromRawValue: function(sValue) {
            var aFinalData = [];
            var aValue = [];
            var newArr = [];
            try {
                aValue = sValue.split("\r\n");
            } catch (error) {
                throw new Error();
            }
            // removing empty lines
            aValue.forEach(function(data) {
                if (data !== "") {
                    newArr.push(data);
                }
            });
            var contentTypeValue = '';
            for (var index = 1; index < newArr.length - 1; index++) {
                contentTypeValue = newArr[index].includes("Content-Type: ") ? newArr[index].split("Content-Type: ")[1] : contentTypeValue;
                if (newArr[index + 1].includes(newArr[0])) {
                    if (contentTypeValue === 'application/json') {
                        newArr[index] = JSON.parse(newArr[index]);
                        aFinalData.push(newArr[index]);
                    } else {
                        aFinalData.push(newArr[index]);
                    }
                }
            }
            return aFinalData;
        }
    };
});