/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([], function () {
    "use strict";
    return  {
        "_version": "1.20.0",
        "sap.app": {
            "id": "card.explorer.integration.hostContext",
            "type": "card",
            "title": "Sample of an Object Card",
            "subTitle": "Sample of an Object Card",
            "applicationVersion": {
                "version": "1.0.0"
            },
            "shortTitle": "A short title for this card",
            "info": "Additional information about this card",
            "description": "A long description for this card",
            "tags": {
                "keywords": [
                    "host",
                    "Context",
                    "Card",
                    "Sample"
                ]
            }
        },
        "sap.card": {
            "type": "Object",

            "header": {
                "type": "Numeric",
                "title": "{data}",
                "subTitle": "{data}",
                "icon": {
                    "src": "{data}",
                    "size": "XS"
                 },

                "dataTimestamp": "",
                "unitOfMeasurement": "{data}",
                "mainIndicator": {
                        "number": "{data}",
                        "unit": "{data}",
                        "trend": "{data}"
                },
                "details": "{data}"

            },
            "content": {
                "maxItems": "15",
                "item": {
                    "title": "{data}",
                    "description": "{data}"
                }
            }
        }
    };
  });