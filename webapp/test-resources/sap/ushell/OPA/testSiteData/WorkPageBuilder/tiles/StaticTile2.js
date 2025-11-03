// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([], () => {
    "use strict";

    return {
        "sap.app": {
            ach: "MM-PUR-REQ",
            title: "Monitor Purchase Requisition Items"
        },
        "sap.flp": {
            target: {
                semanticObject: "PurchaseRequisitionItem",
                action: "monitor"
            }
        },
        "sap.fiori": {
            registrationIds: [
                "F2424"
            ]
        }
    };
});
