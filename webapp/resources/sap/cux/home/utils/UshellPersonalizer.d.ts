declare module "sap/cux/home/utils/UshellPersonalizer" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import BaseObject from "sap/ui/base/Object";
    import { IAppPersonalization } from "sap/cux/home/interface/AppsInterface";
    import { IPage } from "sap/cux/home/interface/PageSpaceInterface";
    interface IPersonalizer {
        getPersData: () => Promise<IPersonalizationData>;
        setPersData: (oData: object) => Promise<void>;
    }
    interface IPersonalizationData {
        favNewsFeed?: {
            items: string[];
            showAllPreparationRequired?: boolean;
        };
        defaultNewsFeed?: {
            items: string[];
        };
        favouritePages?: IPage[] | [];
        favoriteApps?: IAppPersonalization[];
        showRecommendation?: boolean;
    }
    /**
     *
     * Provides the UshellPersonalizer Class used for fetch and update end user (Ushell) personalisation.
     *
     * @extends sap.ui.BaseObject
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121.0
     * @private
     *
     * @alias sap.cux.home.utils.UshellPersonalizer
     */
    export default class UShellPersonalizer extends BaseObject {
        private persContainerId;
        private oOwnerComponent;
        private oPersonalizer;
        static oCacheInstances: {
            [key: string]: UShellPersonalizer;
        };
        private constructor();
        static getInstance(persContainerId: string, oOwnerComponent: object): Promise<UShellPersonalizer>;
        init(): Promise<void>;
        write(oData: IPersonalizationData): Promise<string>;
        read(): Promise<IPersonalizationData>;
    }
}
//# sourceMappingURL=UshellPersonalizer.d.ts.map