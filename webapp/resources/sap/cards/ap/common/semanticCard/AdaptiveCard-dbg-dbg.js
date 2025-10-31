'use strict';
sap.ui.define([
    'sap/cards/ap/common/thirdparty/sap-ux/semantic-card-generator',
    '../helpers/ApplicationInfo',
    './BaseCard'
], function (___sap_ux_semantic_card_generator, ___helpers_ApplicationInfo, ___BaseCard) {
    'use strict';
    function _catch(body, recover) {
        try {
            var result = body();
        } catch (e) {
            return recover(e);
        }
        if (result && result.then) {
            return result.then(void 0, recover);
        }
        return result;
    }
    const CardType = ___sap_ux_semantic_card_generator['CardType'];
    const TargetCardType = ___sap_ux_semantic_card_generator['TargetCardType'];
    const generateAppCard = ___sap_ux_semantic_card_generator['generateAppCard'];
    const ApplicationInfo = ___helpers_ApplicationInfo['ApplicationInfo'];
    const BaseCard = ___BaseCard['BaseCard'];
    class AdaptiveCard extends BaseCard {
        getUpdatedMetadataContextPath(metadataContextPath) {
            try {
                const _this = this;
                return Promise.resolve(ApplicationInfo.getInstance(_this.appComponent).fetchDetails()).then(function ({contextParametersKeyValue}) {
                    contextParametersKeyValue.forEach(({key, value}) => {
                        const parameterPlaceholder = `{{${ key }}}`;
                        if (metadataContextPath.includes(parameterPlaceholder)) {
                            metadataContextPath = metadataContextPath.replace(parameterPlaceholder, value);
                        }
                    });
                    return metadataContextPath;
                });
            } catch (e) {
                return Promise.reject(e);
            }
        }
        getWebUrl(contextPath) {
            const url = new URL(window.location?.href);
            return `${ url.origin }${ contextPath }`;
        }
        generateObjectCard() {
            try {
                const _this2 = this;
                return Promise.resolve(_catch(function () {
                    const applicationManifest = _this2.getApplicationManifest();
                    return Promise.resolve(_this2.getMetadata()).then(function (metadata) {
                        return Promise.resolve(_this2.getAnnotations()).then(function (annotations) {
                            const semanticCard = generateAppCard(applicationManifest, metadata, annotations, {
                                target: TargetCardType.AdaptiveCard,
                                cardType: CardType.Object
                            });
                            return Promise.resolve(_this2.getUpdatedMetadataContextPath(semanticCard.metadata.context.path)).then(function (updatedContextPath) {
                                semanticCard.metadata.context.path = updatedContextPath;
                                semanticCard.metadata.webUrl = _this2.getWebUrl(updatedContextPath);
                                return semanticCard;
                            });
                        });
                    });
                }, function (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    throw new Error(`Failed to generate Adaptive semantic card: ${ errorMessage }`);
                }));
            } catch (e) {
                return Promise.reject(e);
            }
        }
    }
    var __exports = { __esModule: true };
    __exports.AdaptiveCard = AdaptiveCard;
    return __exports;
});