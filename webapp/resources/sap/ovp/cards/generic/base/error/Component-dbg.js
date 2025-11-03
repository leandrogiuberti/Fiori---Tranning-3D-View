/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/Component"
], function (
    CardComponent
) {
    "use strict";

    return CardComponent.extend("sap.ovp.cards.generic.base.error.Component", {
        metadata: {
            properties: {
                "contentFragment": {
                    "type": "string",
                    "defaultValue": "sap.ovp.cards.generic.base.error.Error"
                },
                "state": {
                    "type": "string",
                    "defaultValue": "Error"
                },
                "controllerName": {
                    "type": "string",
                    "defaultValue": "sap.ovp.cards.generic.base.error.BaseError"
                }
            },
            version: "1.141.0",
            library: "sap.ovp"
        }
    });
});

