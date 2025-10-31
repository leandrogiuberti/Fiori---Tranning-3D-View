declare module "sap/esh/search/ui/SinaConfigurator" {
    import { AvailableProviders, SinaConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/SinaConfiguration";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import ResourceBundle from "sap/base/i18n/ResourceBundle";
    interface ConfigurationOptions {
        configureGetTextFromResourceBundle?: boolean;
        configureLogging?: boolean;
        configureCommonParameters?: boolean;
        configureNavigationTrackers?: boolean;
        configureFormatLibrary?: boolean;
        configureGetText?: boolean;
        configureLanguage?: boolean;
    }
    class SinaConfigurator {
        model: SearchModel;
        loadedResourceBundles: Map<string, ResourceBundle>;
        constructor(model: any);
        configure(sinaConfigurations: Array<SinaConfiguration | AvailableProviders>): Array<SinaConfiguration>;
        configureSina(sinaConfiguration: SinaConfiguration | AvailableProviders, configurationOptions: ConfigurationOptions): SinaConfiguration;
        normalizeConfiguration(sinaConfiguration: SinaConfiguration | AvailableProviders): SinaConfiguration;
        private configureLanguage;
        configureNavigationTracking(sinaConfiguration: SinaConfiguration): void;
        configureCommonParameters(sinaConfiguration: SinaConfiguration): void;
        configureFormatLibrary(sinaConfiguration: SinaConfiguration): void;
        configureLogging(sinaConfiguration: SinaConfiguration): void;
        configureGetTextFromResourceBundle(sinaConfiguration: SinaConfiguration): void;
        configureGetText(sinaConfiguration: SinaConfiguration): void;
    }
}
//# sourceMappingURL=SinaConfigurator.d.ts.map