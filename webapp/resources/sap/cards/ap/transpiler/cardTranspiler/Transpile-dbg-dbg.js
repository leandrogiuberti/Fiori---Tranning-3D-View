'use strict';
sap.ui.define(['sap/cards/ap/transpiler/thirdparty/sap-ux/integration-card-converter'], function (___sap_ux_integration_card_converter) {
    'use strict';
    const convertToAdaptiveCard = ___sap_ux_integration_card_converter['convertToAdaptiveCard'];
    const convertIntegrationCardToAdaptive = (integrationCardManifest, appIntent, keyParameters, navigationURI) => {
        const context = {};
        keyParameters?.forEach(parameter => {
            context[parameter.key] = parameter.formattedValue;
        });
        const converterOptions = {
            context: context,
            serviceUrl: window.location.origin,
            appIntent: appIntent,
            navigationURI: navigationURI
        };
        return convertToAdaptiveCard(integrationCardManifest, converterOptions);
    };
    var __exports = { __esModule: true };
    __exports.convertIntegrationCardToAdaptive = convertIntegrationCardToAdaptive;
    return __exports;
});