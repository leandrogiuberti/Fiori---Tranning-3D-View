declare module "sap/esh/search/ui/sinaNexTS/sina/Configuration" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    interface ConfigurationOptions extends SinaObjectProperties {
        personalizedSearch: boolean;
        isPersonalizedSearchEditable: boolean;
    }
    class Configuration extends SinaObject {
        personalizedSearch: boolean;
        isPersonalizedSearchEditable: boolean;
        setPersonalizedSearch(personalizedSearch: boolean): void;
        constructor(properties: ConfigurationOptions);
        resetPersonalizedSearchDataAsync(): Promise<unknown>;
        saveAsync(): Promise<unknown>;
    }
}
//# sourceMappingURL=Configuration.d.ts.map