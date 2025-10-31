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
    class UI5Card extends BaseCard {
        formContextParameters(semanticCard) {
            try {
                const _this = this;
                return Promise.resolve(ApplicationInfo.getInstance(_this.appComponent).fetchDetails()).then(function ({contextParametersKeyValue}) {
                    const cardParameters = semanticCard['sap.card']?.configuration?.parameters;
                    contextParametersKeyValue.forEach(({key, value}) => {
                        if (cardParameters?.[key] !== undefined) {
                            cardParameters[key].value = value;
                        }
                    });
                });
            } catch (e) {
                return Promise.reject(e);
            }
        }
        generateObjectCard() {
            try {
                const _this2 = this;
                return Promise.resolve(_catch(function () {
                    const applicationManifest = _this2.getApplicationManifest();
                    return Promise.resolve(_this2.getMetadata()).then(function (metadata) {
                        return Promise.resolve(_this2.getAnnotations()).then(function (annotations) {
                            const semanticCard = generateAppCard(applicationManifest, metadata, annotations, {
                                target: TargetCardType.UI5IntegrationCard,
                                cardType: CardType.Object,
                                enableFooterActions: false
                            });
                            return Promise.resolve(_this2.formContextParameters(semanticCard)).then(function () {
                                return semanticCard;
                            });
                        });
                    });
                }, function (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    throw new Error(`Failed to generate UI5 semantic card: ${ errorMessage }`);
                }));
            } catch (e) {
                return Promise.reject(e);
            }
        }
    }
    var __exports = { __esModule: true };
    __exports.UI5Card = UI5Card;
    return __exports;
});