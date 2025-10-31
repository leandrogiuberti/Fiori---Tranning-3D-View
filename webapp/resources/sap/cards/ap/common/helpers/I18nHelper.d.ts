declare module "sap/cards/ap/common/helpers/I18nHelper" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import ResourceBundle from "sap/base/i18n/ResourceBundle";
    import type { Group } from "sap/ui/integration/widgets/Card";
    /**
     *  Resolves i18n text for a given key.
     *
     *  @param {string} i18nKey  having unresolved i18n keys
     *  @param {ResourceBundle} resourceBundle - The resource bundle containing i18n values.
     *  @return {string} - The resolved i18n text.
     */
    const resolvei18nText: (i18nKey: string, resourceBundle: ResourceBundle) => string;
    /**
     * Updates groups with resolved i18n texts.
     *
     * @param {Array<Group>} groups - The groups to update.
     * @param {ResourceBundle} resourceBundle - The resource bundle containing i18n values.
     */
    const updateGroups: (groups: Array<Group>, resourceBundle: ResourceBundle) => void;
    /**
     * Resolves i18n texts for card actions in a sap.card object using the provided resource bundle.
     *
     * @param {CardManifest["sap.card"]} sapCard - The sap.card object containing the card configuration.
     * @param {ResourceBundle} resourceBundle - The resource bundle used to resolve i18n texts.
     */
    const resolvei18nTextsForCardAction: (sapCard: CardManifest, resourceBundle: ResourceBundle) => void;
    /**
     * Resolves i18n texts for an integration card manifest.
     *
     * @param {CardManifest} cardManifest - The manifest with unresolved i18n keys.
     * @param {ResourceBundle} resourceBundle - The resource bundle containing i18n values.
     * @return {CardManifest} - The updated manifest with resolved i18n keys.
     */
    const resolvei18nTextsForIntegrationCard: (cardManifest: CardManifest, resourceBundle: ResourceBundle) => CardManifest;
    /**
     * Resolves internationalized (i18n) text values for the specified parameters.
     *
     * @param {CardConfigParameters} - An object containing configuration parameters where each parameter
     * may have a `value` property that could be an i18n key.
     * @param {string[]} - An array of keys corresponding to the properties of the `parameters` object
     * that need their `value` properties resolved.
     * @param {ResourceBundle} - The resource bundle used to resolve i18n text values.
     */
    const resolvei18nTextsForParameters: (parameters: CardConfigParameters, keys: string[], resourceBundle: ResourceBundle) => void;
}
//# sourceMappingURL=I18nHelper.d.ts.map