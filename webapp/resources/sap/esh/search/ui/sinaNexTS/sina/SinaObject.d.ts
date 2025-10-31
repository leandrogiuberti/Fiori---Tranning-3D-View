declare module "sap/esh/search/ui/sinaNexTS/sina/SinaObject" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    interface SinaObjectProperties {
        sina?: Sina;
        /**
         * @deprecated use native private properties instead
         */
        _private?: Record<string, unknown>;
    }
    class SinaObject {
        sina?: Sina;
        /**
         * @deprecated use native private properties instead
         */
        _private: Record<string, unknown>;
        constructor(properties?: SinaObjectProperties);
        getSina(): Sina;
    }
}
//# sourceMappingURL=SinaObject.d.ts.map