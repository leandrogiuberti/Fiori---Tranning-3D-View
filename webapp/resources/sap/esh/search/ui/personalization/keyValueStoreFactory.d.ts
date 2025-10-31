declare module "sap/esh/search/ui/personalization/keyValueStoreFactory" {
    import { IKeyValueStore } from "sap/esh/search/ui/personalization/PersonalizationStorage";
    function create(personalizationStorage: "auto" | "browser" | "flp" | "memory" | IKeyValueStore, isUshell: boolean, prefix: string): Promise<IKeyValueStore>;
    const module: {
        create: typeof create;
    };
    export default module;
}
//# sourceMappingURL=keyValueStoreFactory.d.ts.map