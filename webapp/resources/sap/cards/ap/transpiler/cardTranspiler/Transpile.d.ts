declare module "sap/cards/ap/transpiler/cardTranspiler/Transpile" {
    /**
     * Converts an integration card manifest to an adaptive card manifest.
     *
     * @param {CardManifest} integrationCardManifest - The integration card manifest to be converted.
     * @param {string} appIntent - The application intent to be included in the context.
     * @param {KeyParameter[]} [keyParameters] - Optional array of key parameters to be included in the context.
     * @param {string} navigationURI - The target view of the freestyle application.
     * @returns The converted adaptive card manifest.
     */
    const convertIntegrationCardToAdaptive: (integrationCardManifest: CardManifest, appIntent: string, keyParameters: KeyParameter[], navigationURI: string | null) => any;
}
//# sourceMappingURL=Transpile.d.ts.map