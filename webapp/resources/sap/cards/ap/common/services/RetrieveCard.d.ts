/// <reference types="openui5" />
declare module "sap/cards/ap/common/services/RetrieveCard" {
    import Component from "sap/ui/core/Component";
    import type { CardManifest } from "sap/ui/integration/widgets/Card";
    import { AppManifest, type App } from "sap/cards/ap/common/helpers/ApplicationInfo";
    import type { FreeStyleFetchOptions } from "sap/cards/ap/common/types/CommonTypes";
    type KeyParameter = {
        key: string;
        formattedValue: string;
    };
    /**
     * The card types
     *
     * @alias sap.cards.ap.common.services.RetrieveCard.CardTypes
     * @private
     * @restricted sap.fe, sap.ui.generic.app
     */
    enum CardTypes {
        /**
         * Integration card
         * @restricted sap.fe, sap.ui.generic.app
         */
        INTEGRATION = "integration",
        /**
         * Adaptive card
         * @restricted sap.fe, sap.ui.generic.app
         */
        ADAPTIVE = "adaptive"
    }
    type CardHostParam = {
        componentName: string;
        entitySet: string;
        cardType?: CardTypes;
    };
    type SelectionVariantJSON = {
        SelectionVariantID?: string;
        PresentationVariantID?: string;
        Text?: string;
        ODataFilterExpression?: string;
        Version?: string;
        FilterContextUrl?: string;
        ParameterContextUrl?: string;
    };
    /**
     * The options for fetching the card manifest
     *
     * @alias sap.cards.ap.common.services.RetrieveCard.CardManifestFetchOptions
     * @private
     * @restricted sap.fe, sap.ui.generic.app
     */
    type CardManifestFetchOptions = {
        /**
         * Defines the card type
         * @restricted sap.fe, sap.ui.generic.app
         */
        cardType?: CardTypes;
        /**
         * Defines include actions
         * @restricted sap.fe, sap.ui.generic.app
         */
        includeActions?: boolean;
        /**
         * Defines the hide Actions
         */
        hideActions?: boolean;
        /**
         * Checks whether the app is running in design mode or not will be used to invalidate resource bundle cache and for other design time specific operations
         */
        isDesignMode?: boolean;
    };
    type FreeStyleCardManifestFetchOptions = CardManifestFetchOptions & {
        /**
         * Entity Set for FreeStyle card sharing
         */
        entitySet: string;
        /**
         * Key Parameters for FreeStyle card sharing
         */
        keyParameters: Record<string, unknown>;
    };
    /**
     * Fetches the card path from the application manifest
     *
     * @param {CardType} type - The type of card
     * @param {string} entitySet - The entity set
     * @param {AppManifest} applicationManifest - The application manifest
     * @returns The card path
     */
    const getCardPath: (type: CardTypes, entitySet: string, applicationManifest: AppManifest) => string;
    /**
     * clean up the unnecessary variant information
     *
     * @param selectionVariant
     * @returns
     */
    const cleanupVariantInformation: (selectionVariant: SelectionVariantJSON) => SelectionVariantJSON;
    /**
     * Fetches the manifest from the given url
     *
     * @param {string} url - The url of the manifest
     * @returns The manifest
     */
    const fetchManifest: (url: string) => Promise<any>;
    /**
     * Constructs the card URL based on the application URL and card path.
     *
     * @param {string} applicationUrlOnAbap - The base application URL.
     * @param {string} cardsPath - The path to the card.
     * @param {boolean} isDesignMode - Whether the application is in design mode.
     * @returns {string} - The constructed card URL.
     */
    function constructCardUrl(applicationUrlOnAbap: string, cardsPath: string, isDesignMode: boolean): string;
    /**
     * Fetches the card manifest for the object page
     *
     * @param {Component} appComponent
     * @param {CardHostParam} hostOptions
     * @param {Boolean} isDesignMode
     * @returns The card manifest
     * @private
     */
    const _getObjectPageCardManifest: (appComponent: Component, hostOptions: CardHostParam, isDesignMode?: boolean) => Promise<any>;
    /**
     * Add actions to the card header
     *  - ibnTarget contains the semantic object and action
     *  - ibnParams contains the context parameters and sap-xapp-state-data - which is the stringified selection variant of the context parameters
     *
     * @param cardManifest
     * @param applicationInfo
     */
    const addActionsToCardHeader: (cardManifest: CardManifest, applicationInfo: App) => Promise<void>;
    /**
     * Checks if the leanDT card exists in the application at runtime or not
     *
     * @param appComponent
     * @param isDesignMode
     * @returns boolean
     */
    const checkIfLeanDTCardExists: (appComponent: Component, isDesignMode?: boolean) => boolean;
    /**
     * Determines whether semantic card generation should be enabled based on the URL parameter 'generateSemanticCard'
     * and the existence of a leanDT card in the application.
     *
     * - If 'generateSemanticCard' is 'always', semantic card generation is enabled.
     * - If 'generateSemanticCard' is 'lean', semantic card generation is enabled only if the leanDT card does not exist.
     * - Otherwise, semantic card generation is not enabled.
     *
     * @param {Component} appComponent - The application component instance.
     * @returns {boolean} true if semantic card generation should be enabled, false otherwise.
     */
    function isSemanticCardGeneration(appComponent: Component): boolean;
    /**
     * Fetches key parameters for the given application component.
     *
     * @param {Component} appComponent - The application component.
     * @param {FreeStyleFetchOptions} fetchOptions - The Options isDesignMode and for FreeStyle application sharing entitySet and keyParameters.
     * @returns {Promise<KeyParameter[]>} - A promise that resolves to an array of key parameters.
     */
    const getKeyParameters: (appComponent: Component, fetchOptions?: FreeStyleFetchOptions) => Promise<KeyParameter[]>;
    /**
     * Function to handle the hide actions for the card
     *
     * @param appComponent
     * @param mManifest
     */
    const handleHideActions: (appComponent: Component, mManifest: CardManifest) => void;
    /**
     * Updates the data path of the card header in the provided card manifest by reference.
     *
     * @param {CardManifest} cardManifest - The card manifest object that contains the header data.
     */
    function updateHeaderDataPath(cardManifest: CardManifest, isODataV4: boolean): void;
    /**
     * Fetches the card manifest for the preview
     *
     * @param {Component} appComponent The root component of the application
     * @param {FreeStyleCardManifestFetchOptions} fetchOptions The Fetch options for FreeStyle Cards
     * @returns {Promise<any>} The card manifest
     * @public
     * @since 1.141.0
     */
    const getCardManifestForPreview: (appComponent: Component, fetchOptions: FreeStyleCardManifestFetchOptions) => Promise<any>;
    /**
     * Fetches the card manifest for the object page
     *
     * @param {Component} appComponent The root component of the application
     * @param {CardManifestFetchOptions} fetchOptions The options
     * @returns {Promise<any>} The card manifest
     * @private
     * @since 1.124.0
     * @restricted sap.fe, sap.ui.generic.app
     */
    const getObjectPageCardManifestForPreview: (appComponent: Component, fetchOptions?: CardManifestFetchOptions) => Promise<any>;
}
//# sourceMappingURL=RetrieveCard.d.ts.map