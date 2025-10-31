declare module "sap/esh/search/ui/sinaNexTS/core/defaultAjaxErrorFactory" {
    import { AjaxErrorFactory } from "sap/esh/search/ui/sinaNexTS/core/ajax";
    interface DefaultAjaxErrorFactoryProperties {
        allowedStatusCodes?: Array<number>;
    }
    function createDefaultAjaxErrorFactory(props?: DefaultAjaxErrorFactoryProperties): AjaxErrorFactory;
}
//# sourceMappingURL=defaultAjaxErrorFactory.d.ts.map