declare module "sap/cux/home/utils/extension/CardExtension" {
    import Extension from "sap/ui/integration/Extension";
    const ValueState: any;
    const ValueColor: any;
    const formatCriticality: (sCriticality: string, sType: string) => string | undefined;
    export default class CardExtension extends Extension {
        init(): void;
    }
}
//# sourceMappingURL=CardExtension.d.ts.map