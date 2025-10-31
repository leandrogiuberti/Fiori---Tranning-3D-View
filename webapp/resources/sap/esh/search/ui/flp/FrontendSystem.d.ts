declare module "sap/esh/search/ui/flp/FrontendSystem" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Container from "sap/ushell/Container";
    import { System } from "sap/esh/search/ui/sinaNexTS/sina/System";
    interface ExtendedContainer extends Container {
        getLogonSystem(): {
            getName(): string;
            getClient(): string;
        };
    }
    export default class FrontendSystem {
        private static fioriFrontendSystemInfo;
        static getSystem(): System;
    }
}
//# sourceMappingURL=FrontendSystem.d.ts.map