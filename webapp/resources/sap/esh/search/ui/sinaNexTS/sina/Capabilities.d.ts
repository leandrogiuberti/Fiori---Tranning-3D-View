declare module "sap/esh/search/ui/sinaNexTS/sina/Capabilities" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    interface CapabilitiesOptions extends SinaObjectProperties {
        fuzzy?: boolean;
        nlq?: boolean;
        nlqEnabledInfoOnDataSource?: boolean;
    }
    class Capabilities extends SinaObject {
        fuzzy: boolean;
        nlq: boolean;
        nlqEnabledInfoOnDataSource: boolean;
        constructor(properties?: CapabilitiesOptions);
    }
}
//# sourceMappingURL=Capabilities.d.ts.map