declare module "sap/esh/search/ui/BusyIndicator" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import JSONModel from "sap/ui/model/json/JSONModel";
    interface IBusyIndicator {
        show(): any;
        hide(): any;
        setBusy(isBusy: boolean): any;
    }
    class DummyBusyIndicator implements IBusyIndicator {
        show(): void;
        hide(): void;
        setBusy(): void;
    }
    class BusyIndicator implements IBusyIndicator {
        model: JSONModel;
        constructor(model: JSONModel);
        show(): void;
        hide(): void;
        setBusy(isBusy: boolean): void;
    }
}
//# sourceMappingURL=BusyIndicator.d.ts.map