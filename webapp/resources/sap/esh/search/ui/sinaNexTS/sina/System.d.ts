declare module "sap/esh/search/ui/sinaNexTS/sina/System" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    interface SystemProperties {
        id: string;
        label: string;
    }
    class System {
        private readonly _id;
        private readonly _label;
        constructor(system: SystemProperties);
        get id(): string;
        get label(): string;
        equals(system: System): boolean;
    }
}
//# sourceMappingURL=System.d.ts.map