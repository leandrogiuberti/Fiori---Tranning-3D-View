'use strict';
sap.ui.define([
    'sap/cards/ap/generator/thirdparty/path',
    'sap/cards/ap/generator/odata/ODataUtils',
    'sap/cards/ap/test/JestHelper'
], function (__path, sap_cards_ap_generator_odata_ODataUtils, sap_cards_ap_test_JestHelper) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== 'undefined' ? obj.default : obj;
    }
    const path = _interopRequireDefault(__path);
    const createPathWithEntityContext = sap_cards_ap_generator_odata_ODataUtils['createPathWithEntityContext'];
    const fetchDataAsyncV4 = sap_cards_ap_generator_odata_ODataUtils['fetchDataAsyncV4'];
    const getLabelForEntitySet = sap_cards_ap_generator_odata_ODataUtils['getLabelForEntitySet'];
    const getPropertyReference = sap_cards_ap_generator_odata_ODataUtils['getPropertyReference'];
    const compileCDS = sap_cards_ap_test_JestHelper['compileCDS'];
    const getMetaModel = sap_cards_ap_test_JestHelper['getMetaModel'];
    describe('fetchDataAsyncV4', () => {
        let originalFetch;
        let sUrl = 'https://url/test/';
        const sPath = 'Products';
        const expectedValue = {
            value: 'Testing!',
            Response: 'Success',
            Status: 200,
            StatusText: 'OK',
            Headers: 'Content-Type: application/json'
        };
        beforeEach(() => {
            originalFetch = global.fetch;
            global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve(expectedValue) }));
        });
        afterEach(() => {
            global.fetch = originalFetch;
        });
        test('fetchDataAsyncV4 - service URL ending with /', function () {
            try {
                return Promise.resolve(fetchDataAsyncV4(sUrl, sPath, {})).then(function (result) {
                    expect(global.fetch).toHaveBeenCalledWith('https://url/test/Products?format=json');
                    expect(result).toBe(expectedValue);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('fetchDataAsyncV4 service URL ending without /', function () {
            try {
                sUrl = 'https://url/test';
                return Promise.resolve(fetchDataAsyncV4(sUrl, sPath, {})).then(function (result) {
                    expect(global.fetch).toHaveBeenCalledWith('https://url/test/Products?format=json');
                    expect(result).toBe(expectedValue);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
    });
    describe('createPathWithEntityContext', () => {
        let metaModel;
        let windowSpy;
        let originalFetch;
        const expectedValue = {
            value: [{
                    BankCountry: 'AD',
                    IsActiveEntity: true
                }]
        };
        beforeAll(() => {
            windowSpy = jest.spyOn(window, 'window', 'get');
            windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/I_BillingBlockReason(12345)' } }));
            originalFetch = global.fetch;
            global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve(expectedValue) }));
        });
        beforeAll(function () {
            try {
                const sMetadataUrl = compileCDS(path.join(`${ __dirname }`, '../fixtures/Sample.cds'), { odataFormat: 'structured' });
                return Promise.resolve(getMetaModel(sMetadataUrl)).then(function (_getMetaModel) {
                    metaModel = _getMetaModel;
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        afterAll(() => {
            jest.restoreAllMocks();
            global.fetch = originalFetch;
        });
        test('validate method createPathWithEntityContext for V4 data - with multiple context parameters', function () {
            try {
                const mockMetaData = {
                    getMetaModel: () => {
                        return metaModel;
                    },
                    getContext: path => {
                        return {
                            getObject: () => {
                                return {
                                    BankInternalID: '0000000002',
                                    IsActiveEntity: true,
                                    BankCountry: 'AD'
                                };
                            }
                        };
                    }
                };
                const path = 'CashBank(BankCountry=\'AD\',BankInternalID=\'0000000002\')';
                const expectedPath = 'CashBank(BankCountry=\'AD\',BankInternalID=\'0000000002\',IsActiveEntity=true)';
                return Promise.resolve(createPathWithEntityContext(path, mockMetaData, true)).then(function (updatedPath) {
                    expect(updatedPath).toEqual(expectedPath);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('validate method createPathWithEntityContext for V4 data - with single context guid parameters', function () {
            try {
                const mockMetaData = {
                    getMetaModel: () => {
                        return metaModel;
                    },
                    getContext: path => {
                        return {
                            getObject: () => {
                                return {
                                    IsActiveEntity: true,
                                    BankCountry: '\'AD\''
                                };
                            }
                        };
                    }
                };
                const path = 'CashBank(BankCountry=\'AD\')';
                const expectedPath = 'CashBank(BankCountry=\'AD\',IsActiveEntity=true)';
                return Promise.resolve(createPathWithEntityContext(path, mockMetaData, true)).then(function (updatedPath) {
                    expect(updatedPath).toEqual(expectedPath);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('validate method getLabelForEntitySet and getPropertyReference for for V4 data', function () {
            try {
                const mockMetaData = {
                    getMetaModel: () => {
                        return metaModel;
                    },
                    getContext: path => {
                        return {
                            getObject: () => {
                                return {
                                    IsActiveEntity: true,
                                    BankCountry: '\'AD\''
                                };
                            }
                        };
                    },
                    isA: () => {
                        return false;
                    }
                };
                expect(getLabelForEntitySet(mockMetaData, 'CashBank')).toEqual('CashBank');
                expect(getPropertyReference(mockMetaData, 'CashBank')).toMatchSnapshot();
                return Promise.resolve();
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('validate method createPathWithEntityContext for V2 data - with multiple context parameters', function () {
            try {
                const mockMetaData = {
                    getMetaModel: () => {
                        return {
                            getODataEntityType: path => {
                                return {
                                    key: {
                                        propertyRef: [
                                            { name: 'BankCountry' },
                                            { name: 'BankInternalID' },
                                            { name: 'IsActiveEntity' }
                                        ]
                                    },
                                    property: [
                                        {
                                            name: 'BankCountry',
                                            type: 'Edm.String',
                                            nullable: 'false',
                                            'sap:label': 'Bank Country',
                                            kind: 'Property'
                                        },
                                        {
                                            name: 'BankInternalID',
                                            type: 'Edm.Guid',
                                            nullable: 'false',
                                            'sap:label': 'Bank Internal ID',
                                            kind: 'Property'
                                        },
                                        {
                                            name: 'IsActiveEntity',
                                            type: 'Edm.Boolean',
                                            nullable: 'false',
                                            'sap:label': 'Is Active Entity',
                                            kind: 'Property'
                                        }
                                    ]
                                };
                            },
                            getODataAssociationEnd: () => {
                            },
                            getODataEntitySet: path => {
                                return {
                                    name: 'CashBank',
                                    entityType: 'com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType'
                                };
                            }
                        };
                    },
                    getObject: () => {
                        return {
                            BankInternalID: '0000000002',
                            IsActiveEntity: true,
                            BankCountry: 'AD'
                        };
                    }
                };
                const path = 'CashBank(BankInternalID=guid\'0000000002\',BankCountry=\'AD\',IsActiveEntity=true)';
                const expectedPath = 'CashBank(BankInternalID=guid\'0000000002\',BankCountry=\'AD\',IsActiveEntity=true)';
                return Promise.resolve(createPathWithEntityContext(path, mockMetaData, false)).then(function (updatedPath) {
                    expect(updatedPath).toEqual(expectedPath);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('validate method createPathWithEntityContext for V2 data - with single context guid parameter', function () {
            try {
                const mockMetaData = {
                    getMetaModel: () => {
                        return {
                            getODataEntityContainer: () => {
                                return {
                                    entitySet: [{
                                            name: 'CashBank',
                                            entityType: 'com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType'
                                        }]
                                };
                            },
                            getODataEntityType: path => {
                                return {
                                    key: {
                                        propertyRef: [
                                            { name: 'BankCountry' },
                                            { name: 'BankInternalID' },
                                            { name: 'IsActiveEntity' }
                                        ]
                                    },
                                    property: [
                                        {
                                            name: 'BankCountry',
                                            type: 'Edm.String',
                                            nullable: 'false',
                                            'sap:label': 'Bank Country',
                                            kind: 'Property'
                                        },
                                        {
                                            name: 'BankInternalID',
                                            type: 'Edm.Guid',
                                            nullable: 'false',
                                            'sap:label': 'Bank Internal ID',
                                            kind: 'Property'
                                        },
                                        {
                                            name: 'IsActiveEntity',
                                            type: 'Edm.Boolean',
                                            nullable: 'false',
                                            'sap:label': 'Is Active Entity',
                                            kind: 'Property'
                                        }
                                    ]
                                };
                            },
                            getODataAssociationEnd: () => {
                            },
                            getODataEntitySet: path => {
                                return {
                                    name: 'CashBank',
                                    entityType: 'com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType'
                                };
                            }
                        };
                    },
                    getObject: () => {
                        return {
                            BankInternalID: '0000000002',
                            IsActiveEntity: true,
                            BankCountry: 'AD'
                        };
                    }
                };
                const path = 'CashBank(BankInternalID=guid\'005056a7-004e-1ed8-b2e0-081387831f0d\',IsActiveEntity=true)';
                const expectedPath = 'CashBank(BankInternalID=guid\'005056a7-004e-1ed8-b2e0-081387831f0d\',IsActiveEntity=true)';
                return Promise.resolve(createPathWithEntityContext(path, mockMetaData, false)).then(function (updatedPath) {
                    expect(updatedPath).toEqual(expectedPath);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('validate method createPathWithEntityContext for V2 data - with guid as context parameter', function () {
            try {
                const mockMetaData = {
                    getMetaModel: () => {
                        return {
                            getODataEntityContainer: () => {
                                return {
                                    entitySet: [{
                                            name: 'CashBank',
                                            entityType: 'com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType'
                                        }]
                                };
                            },
                            getODataEntityType: path => {
                                return {
                                    key: {
                                        propertyRef: [
                                            { name: 'BankCountry' },
                                            { name: 'BankInternalID' },
                                            { name: 'IsActiveEntity' }
                                        ]
                                    },
                                    property: [
                                        {
                                            name: 'BankCountry',
                                            type: 'Edm.String',
                                            nullable: 'false',
                                            'sap:label': 'Bank Country',
                                            kind: 'Property'
                                        },
                                        {
                                            name: 'BankInternalID',
                                            type: 'Edm.Guid',
                                            nullable: 'false',
                                            'sap:label': 'Bank Internal ID',
                                            kind: 'Property'
                                        },
                                        {
                                            name: 'IsActiveEntity',
                                            type: 'Edm.Boolean',
                                            nullable: 'false',
                                            'sap:label': 'Is Active Entity',
                                            kind: 'Property'
                                        }
                                    ]
                                };
                            },
                            getODataAssociationEnd: () => {
                            },
                            getODataEntitySet: path => {
                                return {
                                    name: 'CashBank',
                                    entityType: 'com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType'
                                };
                            }
                        };
                    },
                    getObject: () => {
                        return {
                            BankInternalID: '0000000002',
                            IsActiveEntity: true,
                            BankCountry: 'AD'
                        };
                    }
                };
                const path = 'CashBank(id=\'0000000002\')';
                const expectedPath = 'CashBank(id=\'0000000002\')';
                return Promise.resolve(createPathWithEntityContext(path, mockMetaData, false)).then(function (updatedPath) {
                    expect(updatedPath).toEqual(expectedPath);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('validate method getLabelForEntitySet and getPropertyReference for V2 data', function () {
            try {
                const mockMetaData = {
                    getMetaModel: () => {
                        return {
                            getODataEntityType: path => {
                                return {
                                    key: {
                                        propertyRef: [
                                            { name: 'BankCountry' },
                                            { name: 'BankInternalID' },
                                            { name: 'IsActiveEntity' }
                                        ]
                                    },
                                    property: [
                                        {
                                            name: 'BankCountry',
                                            type: 'Edm.String',
                                            nullable: 'false',
                                            'sap:label': 'Bank Country',
                                            kind: 'Property'
                                        },
                                        {
                                            name: 'BankInternalID',
                                            type: 'Edm.Guid',
                                            nullable: 'false',
                                            'sap:label': 'Bank Internal ID',
                                            kind: 'Property'
                                        },
                                        {
                                            name: 'IsActiveEntity',
                                            type: 'Edm.Boolean',
                                            nullable: 'false',
                                            'sap:label': 'Is Active Entity',
                                            kind: 'Property'
                                        }
                                    ]
                                };
                            },
                            getODataAssociationEnd: () => {
                            },
                            getODataEntitySet: path => {
                                return {
                                    name: 'CashBank',
                                    entityType: 'com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType'
                                };
                            }
                        };
                    },
                    getObject: () => {
                        return {
                            BankInternalID: '0000000002',
                            IsActiveEntity: true,
                            BankCountry: 'AD'
                        };
                    },
                    isA: () => {
                        return true;
                    }
                };
                expect(getLabelForEntitySet(mockMetaData, 'CashBank')).toEqual('CashBank');
                expect(getPropertyReference(mockMetaData, 'CashBank')).toMatchSnapshot();
                return Promise.resolve();
            } catch (e) {
                return Promise.reject(e);
            }
        });
    });
});