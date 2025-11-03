/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import JSONModel from "sap/ui/model/json/JSONModel";

export interface IBusyIndicator {
    show();
    hide();
    setBusy(isBusy: boolean);
}

export class DummyBusyIndicator implements IBusyIndicator {
    show() {
        //
    }
    hide() {
        //
    }
    setBusy() {
        //
    }
}
export class BusyIndicator implements IBusyIndicator {
    model: JSONModel;

    constructor(model: JSONModel) {
        this.model = model;
        this.model.setProperty("/isBusy", false);
    }

    show() {
        this.model.setProperty("/isBusy", true);
    }

    hide() {
        this.model.setProperty("/isBusy", false);
    }

    setBusy(isBusy: boolean) {
        if (isBusy) {
            this.show();
        } else {
            this.hide();
        }
    }
}
