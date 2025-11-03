'use strict';
sap.ui.define([
    'sap/cards/ap/generator/thirdparty/path',
    'sap/cards/ap/generator/odata/v4/MetadataAnalyzer',
    'sap/cards/ap/test/JestHelper'
], function (__path, sap_cards_ap_generator_odata_v4_MetadataAnalyzer, sap_cards_ap_test_JestHelper) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== 'undefined' ? obj.default : obj;
    }
    const path = _interopRequireDefault(__path);
    const getEntityNames = sap_cards_ap_generator_odata_v4_MetadataAnalyzer['getEntityNames'];
    const getNavigationPropertyInfoFromEntity = sap_cards_ap_generator_odata_v4_MetadataAnalyzer['getNavigationPropertyInfoFromEntity'];
    const getPropertyInfoFromEntity = sap_cards_ap_generator_odata_v4_MetadataAnalyzer['getPropertyInfoFromEntity'];
    const getPropertyReferenceKey = sap_cards_ap_generator_odata_v4_MetadataAnalyzer['getPropertyReferenceKey'];
    const compileCDS = sap_cards_ap_test_JestHelper['compileCDS'];
    const getMetaModel = sap_cards_ap_test_JestHelper['getMetaModel'];
    describe('Card CardGenerator', () => {
        let mockMetaData;
        let metaModel;
        beforeAll(function () {
            try {
                const sMetadataUrl = compileCDS(path.join(`${ __dirname }`, '../../fixtures/Sample.cds'), { odataFormat: 'structured' });
                return Promise.resolve(getMetaModel(sMetadataUrl)).then(function (_getMetaModel) {
                    metaModel = _getMetaModel;
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        beforeEach(() => {
            mockMetaData = {
                getMetaModel: () => {
                    return metaModel;
                }
            };
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        test('validate function getPropertyReferenceKey', () => {
            const keyReferenceProperties = getPropertyReferenceKey(mockMetaData, 'CashBank');
            expect(keyReferenceProperties).toMatchSnapshot();
        });
        test('validate function getEntityNames', () => {
            const keyReferenceProperties = getEntityNames(mockMetaData);
            expect(keyReferenceProperties).toStrictEqual(['CashBank']);
        });
        test('validate function getPropertyInfoFromEntity', () => {
            const properties = getPropertyInfoFromEntity(mockMetaData, 'CashBank', false);
            expect(properties).toMatchSnapshot();
        });
        test('validate function getPropertyInfoFromEntity with navigation', () => {
            const resourceBundle = {
                getText: jest.fn().mockImplementation(key => {
                    if (key === 'GENERATOR_CARD_SELECT_NAV_PROP')
                        return 'Select a Navigational Property:';
                    if (key === 'CRITICALITY_CONTROL_SELECT_PROP')
                        return 'Select a Property:';
                })
            };
            const properties = getPropertyInfoFromEntity(mockMetaData, 'CashBank', true, resourceBundle);
            expect(properties).toMatchSnapshot();
        });
        test('validate function getNavigationPropertyInfoFromEntity', () => {
            const mockAnnotations = {
                $NavigationPropertyBinding: {
                    referencedTestEntities: 'RootElement',
                    _RootPaymentTerms: 'RootPaymentTerms',
                    DraftAdministrativeData: 'RootPaymentTerms',
                    SiblingEntity: 'RootElement'
                },
                _RootPaymentTerms: {
                    $kind: 'NavigationProperty',
                    $Type: 'com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType',
                    $ReferentialConstraint: { RootPaymentTerms: 'RootPaymentTerms' }
                }
            };
            mockMetaData.getMetaModel = jest.fn(() => ({
                getObject: jest.fn(sParam => {
                    if (sParam.includes('/')) {
                        return mockAnnotations;
                    }
                })
            }));
            const properties = getNavigationPropertyInfoFromEntity(mockMetaData, 'CashBank');
            expect(properties).toMatchSnapshot();
        });
    });
});