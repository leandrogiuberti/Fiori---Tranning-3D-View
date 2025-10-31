declare module "sap/esh/search/ui/PublicSearchModel" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Context from "sap/ui/model/Context";
    import JSONModel from "sap/ui/model/json/JSONModel";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    interface $PublicSearchModelSettings {
        modelName: string;
        internalSearchModel: SearchModel;
    }
    /**
     * @namespace sap.esh.search.ui
     */
    export default class PublicSearchModel extends JSONModel {
        private internalSearchModel;
        static defaultModelName: string;
        static publicSearchModelPropertyPath: Array<{
            sourcePath: string | RegExp;
            targetPath?: string | ((sPath: string) => string);
        }>;
        modelName: string;
        constructor(settings: Partial<$PublicSearchModelSettings>);
        setPropertyFromInternalModel(internalModel: SearchModel, sPath: string, oValue: unknown, oContext?: Context, bAsyncUpdate?: boolean): void;
        setPropertyInternal(sPath: string, oValue: unknown, oContext?: Context, bAsyncUpdate?: boolean): boolean;
        setProperty(sPath: string, oValue: unknown, oContext?: Context, bAsyncUpdate?: boolean): boolean;
        isPublicProperty(sPath: any): Array<{
            sourcePath: string | RegExp;
            targetPath?: string | ((sPath: string) => string);
        }>;
    }
}
//# sourceMappingURL=PublicSearchModel.d.ts.map