/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/base/error/Component"
], function (
    BaseErrorComponent
) {
    "use strict";

    return BaseErrorComponent.extend("sap.ovp.cards.v4.error.Component", {
        metadata: {
            properties: {
                "controllerName": {
                    "type": "string",
                    "defaultValue": "sap.ovp.cards.v4.error.Error"
                },
                "headerExtensionFragment": {
                    "type": "string",
                    "defaultValue": "sap.ovp.cards.v4.generic.KPIHeader"
                }
            },
            version: "1.141.0",
            library: "sap.ovp"
        }
    });
});

