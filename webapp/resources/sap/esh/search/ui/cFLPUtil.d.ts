declare module "sap/esh/search/ui/cFLPUtil" {
    import { AvailableProviders, SinaConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/SinaConfiguration";
    function createContentProviderSinaConfiguration(contentProviderId: string): Promise<SinaConfiguration | void>;
    function readCFlpConfiguration(sinaConfigurations: Array<SinaConfiguration | AvailableProviders>): Promise<Array<SinaConfiguration | AvailableProviders>>;
}
//# sourceMappingURL=cFLPUtil.d.ts.map