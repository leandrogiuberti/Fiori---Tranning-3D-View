declare module "sap/esh/search/ui/sinaNexTS/sina/sinaFactory" {
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { AvailableProviders, SinaConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/SinaConfiguration";
    function createAsync(configuration: SinaConfiguration | string): Promise<Sina>;
    function createByTrialAsync(inputConfigurations: Array<SinaConfiguration | string | AvailableProviders>, checkSuccessCallback?: (sina: Sina) => boolean): Promise<Sina>;
    function _readConfigurationFromUrl(): Promise<SinaConfiguration | void>;
    function _createSinaRecursively(configurations: SinaConfiguration[], checkSuccessCallback?: (sina: Sina) => boolean): Promise<Sina>;
    function _mixinUrlConfiguration(configurations: SinaConfiguration[]): Promise<void>;
    function _mergeConfiguration(configuration1: any, configuration2: any): void;
}
//# sourceMappingURL=sinaFactory.d.ts.map