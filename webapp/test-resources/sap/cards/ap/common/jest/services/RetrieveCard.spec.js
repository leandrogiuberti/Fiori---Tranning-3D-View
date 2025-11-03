'use strict';
sap.ui.define([
    'fs',
    'sap/cards/ap/common/thirdparty/path',
    'sap/base/i18n/ResourceBundle',
    'sap/cards/ap/common/helpers/ApplicationInfo',
    'sap/cards/ap/common/services/RetrieveCard',
    'sap/cards/ap/test/JestHelper',
    'sap/ui/core/UIComponent',
    'sap/ui/core/routing/HashChanger',
    '../testData/AdaptiveCardSampleManifest',
    '../testData/IntegrationCardManifestWithDateTimeOffsetAsKeyParameter',
    '../testData/IntegrationCardManifestWithoutSelectParam',
    '../testData/IntegrationCardSampleManifest'
], function (__fs, __path, ResourceBundle, sap_cards_ap_common_helpers_ApplicationInfo, sap_cards_ap_common_services_RetrieveCard, sap_cards_ap_test_JestHelper, UIComponent, HashChanger, AdaptiveCardSampleManifest, IntegrationCardManifestWithDateTimeOffsetAsKeyParameter, IntegrationCardManifestWithoutSelectParam, IntegrationCardSampleManifest) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== 'undefined' ? obj.default : obj;
    }
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
    const readFileSync = __fs['readFileSync'];
    const path = _interopRequireDefault(__path);
    const ApplicationInfo = sap_cards_ap_common_helpers_ApplicationInfo['ApplicationInfo'];
    const CardTypes = sap_cards_ap_common_services_RetrieveCard['CardTypes'];
    const _getObjectPageCardManifest = sap_cards_ap_common_services_RetrieveCard['_getObjectPageCardManifest'];
    const addActionsToCardHeader = sap_cards_ap_common_services_RetrieveCard['addActionsToCardHeader'];
    const getCardManifestForPreview = sap_cards_ap_common_services_RetrieveCard['getCardManifestForPreview'];
    const getCardPath = sap_cards_ap_common_services_RetrieveCard['getCardPath'];
    const getObjectPageCardManifestForPreview = sap_cards_ap_common_services_RetrieveCard['getObjectPageCardManifestForPreview'];
    const isSemanticCardGeneration = sap_cards_ap_common_services_RetrieveCard['isSemanticCardGeneration'];
    const updateHeaderDataPath = sap_cards_ap_common_services_RetrieveCard['updateHeaderDataPath'];
    const compileCDS = sap_cards_ap_test_JestHelper['compileCDS'];
    const getMetaModel = sap_cards_ap_test_JestHelper['getMetaModel'];
    const i18nMap = {
        appTitle: 'Sales Order',
        appDescription: 'A Fiori application.',
        CardGeneratorHeaderTitle: 'Sales Order',
        CardGeneratorHeaderSubTitle: 'A Fiori application.',
        CardGeneratorGroupPropertyLabel_Groups_0_Items_0: 'Net Amount',
        CardGeneratorGroupPropertyLabel_Groups_0_Items_1: 'Gross Amount',
        CardGeneratorGroupPropertyLabel_Groups_0_Items_2: 'Tax Amount',
        CardGeneratorGroupHeader_Groups_0: 'Amount',
        CardGeneratorGroupPropertyLabel_Groups_1_Items_0: 'Business Partner ID',
        CardGeneratorGroupPropertyLabel_Groups_1_Items_1: 'Created At',
        CardGeneratorGroupPropertyLabel_Groups_1_Items_2: 'Sales Order ID',
        CardGeneratorGroupHeader_Groups_1: 'Additional Info'
    };
    describe('getCardPath', () => {
        const appManifest = {
            'sap.app': {
                id: 'testComponent',
                type: 'application'
            },
            'sap.ui5': {},
            'sap.platform.abap': { uri: '/sap/bc/ui5_ui5/sap/salesOrderManage/webapp' },
            'sap.cards.ap': {
                embeds: {
                    ObjectPage: {
                        default: 'testEntity',
                        manifests: {
                            testEntity: [{ localUri: 'cards/op/testEntity/' }],
                            testEntity1: [{ localUri: 'cards/op/testEntity1/' }]
                        }
                    }
                }
            },
            'sap.ui.generic.app': {}
        };
        test('returns the card path for integration card', () => {
            const sType = CardTypes.INTEGRATION;
            const entitySet = 'testEntity';
            const cardPath = getCardPath(sType, entitySet, appManifest);
            expect(cardPath).toBe('/cards/op/testEntity/manifest.json');
        });
        test('returns the card path for integration card when localUri is without training slash', () => {
            const appManifest = {
                'sap.app': { id: 'testComponent' },
                'sap.ui5': {},
                'sap.ui': {},
                'sap.cards.ap': {
                    embeds: {
                        ObjectPage: {
                            default: 'testEntity',
                            manifests: { testEntity: [{ localUri: 'cards/op/testEntity' }] }
                        }
                    }
                }
            };
            const sType = CardTypes.INTEGRATION;
            const entitySet = 'testEntity';
            const cardPath = getCardPath(sType, entitySet, appManifest);
            expect(cardPath).toBe('/cards/op/testEntity/manifest.json');
        });
        test('returns the card path for adaptive card', () => {
            const sType = CardTypes.ADAPTIVE;
            const entitySet = 'testEntity';
            const cardPath = getCardPath(sType, entitySet, appManifest);
            expect(cardPath).toBe('/cards/op/testEntity/adaptive-manifest.json');
        });
        test('returns empty path when sap.cards.ap\'s embeds object page configuration is empty', () => {
            appManifest['sap.cards.ap'].embeds.ObjectPage.manifests = {};
            const sType = CardTypes.ADAPTIVE;
            const entitySet = 'testEntity';
            const cardPath = getCardPath(sType, entitySet, appManifest);
            expect(cardPath).toBe('');
        });
        test('returns empty path when sap.cards.ap configuration is not there in appManifest', () => {
            appManifest['sap.cards.ap'] = {};
            const sType = CardTypes.ADAPTIVE;
            const entitySet = 'testEntity';
            const cardPath = getCardPath(sType, entitySet, appManifest);
            expect(cardPath).toBe('');
        });
    });
    describe('addActionsToCardHeader', () => {
        it('should add navigation action with correct parameters to card header', function () {
            try {
                const cardManifest = { 'sap.card': { header: {} } };
                const applicationInfo = {
                    semanticObject: 'SalesOrder',
                    action: 'display',
                    contextParameters: 'OrderID=123,CustomerID=456',
                    variantParameter: 'abc',
                    contextParametersKeyValue: [
                        {
                            key: 'OrderID',
                            value: '123'
                        },
                        {
                            key: 'CustomerID',
                            value: '456'
                        }
                    ]
                };
                return Promise.resolve(addActionsToCardHeader(cardManifest, applicationInfo)).then(function () {
                    expect(cardManifest['sap.card']['header'].actions).toBeDefined();
                    expect(cardManifest['sap.card']['header'].actions[0].type).toBe('Navigation');
                    expect(cardManifest['sap.card']['header'].actions[0].parameters.ibnTarget).toEqual({
                        semanticObject: 'SalesOrder',
                        action: 'display'
                    });
                    expect(cardManifest['sap.card']['header'].actions[0].parameters.ibnParams['OrderID']).toBe('123');
                    expect(cardManifest['sap.card']['header'].actions[0].parameters.ibnParams['CustomerID']).toBe('456');
                    expect(cardManifest['sap.card']['header'].actions[0].parameters.ibnParams['sap-appvar-id']).toBe('abc');
                    const stateData = JSON.parse(cardManifest['sap.card']['header'].actions[0].parameters.ibnParams['sap-xapp-state-data']);
                    expect(stateData).toHaveProperty('selectionVariant');
                    expect(stateData.selectionVariant).toHaveProperty('SelectOptions');
                    expect(stateData.selectionVariant.SelectOptions.length).toBe(2);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        it('should handle empty variantParameter', function () {
            try {
                const cardManifest = { 'sap.card': { header: {} } };
                const applicationInfo = {
                    semanticObject: 'Product',
                    action: 'edit',
                    contextParameters: 'ProductID=789',
                    variantParameter: null,
                    contextParametersKeyValue: [{
                            key: 'ProductID',
                            value: '789'
                        }]
                };
                return Promise.resolve(addActionsToCardHeader(cardManifest, applicationInfo)).then(function () {
                    expect(cardManifest['sap.card']['header'].actions[0].parameters.ibnTarget).toEqual({
                        semanticObject: 'Product',
                        action: 'edit'
                    });
                    expect(cardManifest['sap.card']['header'].actions[0].parameters.ibnParams['ProductID']).toBe('789');
                    const stateData = JSON.parse(cardManifest['sap.card']['header'].actions[0].parameters.ibnParams['sap-xapp-state-data']);
                    expect(stateData).toHaveProperty('selectionVariant');
                    expect(stateData.selectionVariant).toHaveProperty('SelectOptions');
                    expect(stateData.selectionVariant.SelectOptions.length).toBe(1);
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
    });
    describe('_getObjectPageCardManifest', () => {
        let globalFetchMock;
        const sapAppId = 'testComponent1';
        const appManifest = {
            'sap.app': {
                id: sapAppId,
                type: 'application'
            },
            'sap.ui5': {},
            'sap.platform.abap': { uri: '' },
            'sap.cards.ap': {
                embeds: {
                    ObjectPage: {
                        default: 'testEntity',
                        manifests: { testEntity: [{ localUri: 'cards/op/testEntity/' }] }
                    }
                }
            },
            'sap.ui.generic.app': {}
        };
        const Component = UIComponent.extend('rootComponent', {
            metadata: { manifest: appManifest },
            createContent() {
                return null;
            }
        });
        const rootComponent = new Component(sapAppId);
        beforeAll(() => {
            globalFetchMock = jest.spyOn(window, 'fetch').mockImplementation(url => {
                if (url === '/manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return appManifest;
                        }
                    });
                }
                if (url === '/cards/op/testEntity/manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return IntegrationCardSampleManifest;
                        }
                    });
                }
                if (url === '/cards/op/testEntity/adaptive-manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return AdaptiveCardSampleManifest;
                        }
                    });
                }
            });
        });
        afterAll(() => {
            globalFetchMock.mockRestore();
        });
        test('returns the integration card manifest for object page card', function () {
            try {
                const fetchedParams = {
                    componentName: 'testComponent1',
                    entitySet: 'testEntity',
                    cardType: CardTypes.INTEGRATION
                };
                return Promise.resolve(_getObjectPageCardManifest(rootComponent, fetchedParams)).then(function (cardManifest) {
                    expect(cardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns the adaptive card manifest for object page card', function () {
            try {
                const fetchedParams = {
                    componentName: 'testComponent1',
                    entitySet: 'testEntity',
                    cardType: CardTypes.ADAPTIVE
                };
                return Promise.resolve(_getObjectPageCardManifest(rootComponent, fetchedParams)).then(function (cardManifest) {
                    expect(cardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('rejects the promise when entity set name is empty', function () {
            try {
                const fetchedParams = {
                    componentName: 'testComponent1',
                    entitySet: '',
                    cardType: ''
                };
                const rootComponent1 = { getManifest: jest.fn().mockReturnValue({}) };
                const _temp = _catch(function () {
                    return Promise.resolve(_getObjectPageCardManifest(rootComponent1, fetchedParams)).then(function () {
                    });
                }, function (error) {
                    expect(error).toBeDefined();
                    expect(error).toBe('No cards available for this application');
                });
                return Promise.resolve(_temp && _temp.then ? _temp.then(function () {
                }) : void 0);
            } catch (e) {
                return Promise.reject(e);
            }
        });
    });
    describe('getObjectPageCardManifestForPreview - V2', () => {
        let globalFetchMock;
        let resourceBundleCreateSpy;
        const sapAppId = 'testComponent2';
        const appManifest = {
            'sap.app': {
                id: sapAppId,
                type: 'application'
            },
            'sap.ui5': {},
            'sap.platform.abap': { uri: '' },
            'sap.cards.ap': {
                embeds: {
                    ObjectPage: {
                        default: 'testEntity',
                        manifests: {
                            testEntity: [{ localUri: 'cards/op/testEntity/' }],
                            testEntity1: [{ localUri: 'cards/op/testEntity1/' }],
                            testEntity2: [{ localUri: 'cards/op/testEntity2/' }]
                        }
                    }
                }
            },
            'sap.ui.generic.app': {}
        };
        const Component = UIComponent.extend('rootComponent', {
            metadata: { manifest: appManifest },
            createContent() {
                return null;
            }
        });
        const rootComponent = new Component(sapAppId);
        beforeAll(() => {
            resourceBundleCreateSpy = jest.spyOn(ResourceBundle, 'create').mockImplementation(() => {
                return {
                    getText: key => {
                        return i18nMap[key] || key;
                    }
                };
            });
            globalFetchMock = jest.spyOn(window, 'fetch').mockImplementation(url => {
                if (url === '/manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return appManifest;
                        }
                    });
                }
                if (url === '/cards/op/testEntity1/manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return IntegrationCardManifestWithoutSelectParam;
                        }
                    });
                }
                if (url === '/cards/op/testEntity/manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return IntegrationCardSampleManifest;
                        }
                    });
                }
                if (url === '/cards/op/testEntity/adaptive-manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return AdaptiveCardSampleManifest;
                        }
                    });
                }
                if (url === '/cards/op/testEntity2/manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return IntegrationCardManifestWithDateTimeOffsetAsKeyParameter;
                        }
                    });
                }
            });
        });
        afterAll(() => {
            resourceBundleCreateSpy.mockRestore();
            globalFetchMock.mockRestore();
        });
        let windowSpy;
        let getModelSpy;
        beforeEach(() => {
            ApplicationInfo.getInstance(rootComponent)._resetInstance();
            windowSpy = jest.spyOn(window, 'window', 'get');
            getModelSpy = jest.spyOn(rootComponent, 'getModel').mockImplementation(() => {
                return {
                    isA: () => false,
                    getMetaModel: function () {
                        return {
                            getODataEntitySet: function () {
                                return { entityType: 'container.testEntityType' };
                            },
                            getODataEntityType: function () {
                                return {
                                    property: [
                                        {
                                            name: 'node_key',
                                            type: 'Edm.Guid'
                                        },
                                        {
                                            name: 'IsActiveEntity',
                                            type: 'Edm.Boolean'
                                        }
                                    ],
                                    key: {
                                        propertyRef: [
                                            { name: 'node_key' },
                                            { name: 'IsActiveEntity' }
                                        ]
                                    }
                                };
                            }
                        };
                    },
                    getObject: () => {
                        return {
                            node_key: '12345',
                            IsActiveEntity: true
                        };
                    },
                    getResourceBundle: jest.fn().mockImplementation(() => {
                        return { oUrlInfo: { url: 'i18n.properties' } };
                    })
                };
            });
        });
        afterEach(() => {
            windowSpy.mockRestore();
            getModelSpy.mockRestore();
        });
        test('returns integration card manifest', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/testEntity(node_key=\'12345\')' } }));
                return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                    cardType: CardTypes.INTEGRATION,
                    isDesignMode: true
                })).then(function (mIntegrationCardManifest) {
                    expect(mIntegrationCardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns integration card manifest, with key-value format as context parameters', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/testEntity(id=\'12345\')' } }));
                return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                    cardType: CardTypes.INTEGRATION,
                    isDesignMode: true
                })).then(function (mIntegrationCardManifest) {
                    expect(mIntegrationCardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns adaptive card manifest ready for preview when there exists select query parameters', function () {
            try {
                windowSpy.mockImplementation(() => ({
                    hasher: { getHash: () => 'test-intent&/testEntity(id=\'12345\')' },
                    location: {
                        href: 'http://localhost:8080/test#test-intent&/testEntity(id=\'12345\')',
                        origin: 'http://localhost:8080',
                        pathname: '/test',
                        search: '?query=1',
                        hash: '#hash'
                    }
                }));
                const hashChangerMock = {
                    getHash: jest.fn().mockReturnValue('myHash'),
                    hrefForAppSpecificHash: jest.fn().mockReturnValue('basePath/')
                };
                const mockRouter = { hashChangerMock };
                jest.spyOn(HashChanger, 'getInstance').mockReturnValue(mockRouter.hashChangerMock);
                return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                    cardType: CardTypes.ADAPTIVE,
                    isDesignMode: true
                })).then(function (mAdaptiveCardManifest) {
                    expect(mAdaptiveCardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns adaptive card manifest ready for preview when no select query parameter exists for card', function () {
            try {
                windowSpy.mockImplementation(() => ({
                    hasher: { getHash: () => 'test-intent&/testEntity1(id=\'12345\')' },
                    location: {
                        href: 'http://localhost:8080/test#test-intent&/testEntity(id=\'12345\')',
                        origin: 'http://localhost:8080',
                        pathname: '/test',
                        search: '?query=1',
                        hash: '#hash'
                    }
                }));
                const hashChangerMock = {
                    getHash: jest.fn().mockReturnValue('myHash'),
                    hrefForAppSpecificHash: jest.fn().mockReturnValue('basePath/')
                };
                const mockRouter = { hashChangerMock };
                jest.spyOn(HashChanger, 'getInstance').mockReturnValue(mockRouter.hashChangerMock);
                return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                    cardType: CardTypes.ADAPTIVE,
                    isDesignMode: true
                })).then(function (mIntegrationCardManifest) {
                    expect(mIntegrationCardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        it('should update path to "/header/d/" when isODataV4 is false', () => {
            const cardManifest = { 'sap.card': { header: { data: { path: '/old/path' } } } };
            updateHeaderDataPath(cardManifest, false);
            expect(cardManifest['sap.card'].header.data.path).toBe('/header/d/');
        });
        describe('getObjectPageCardManifestForPreview - V2', () => {
            beforeEach(() => {
                windowSpy = jest.spyOn(window, 'window', 'get');
                getModelSpy = jest.spyOn(rootComponent, 'getModel').mockImplementation(() => {
                    return {
                        isA: () => false,
                        getMetaModel: function () {
                            return {
                                getODataEntitySet: function () {
                                    return { entityType: 'container.testEntityType' };
                                },
                                getODataEntityType: function () {
                                    return {
                                        property: [
                                            {
                                                name: 'CreatedByUser',
                                                type: 'Edm.String',
                                                maxLength: '20',
                                                'sap:label': 'Created By User',
                                                kind: 'Property'
                                            },
                                            {
                                                name: 'CreationDateTime',
                                                type: 'Edm.DateTimeOffset',
                                                nullable: 'false',
                                                'sap:label': 'Creation Date Time',
                                                kind: 'Property'
                                            },
                                            {
                                                name: 'node_key',
                                                type: 'Edm.Guid',
                                                nullable: 'false',
                                                'sap:label': 'Node Key',
                                                kind: 'Property'
                                            },
                                            {
                                                name: 'EndDate',
                                                type: 'Edm.DateTime',
                                                nullable: 'false',
                                                'sap:label': 'End Date',
                                                kind: 'Property'
                                            }
                                        ],
                                        key: {
                                            propertyRef: [
                                                { name: 'CreatedByUser' },
                                                { name: 'CreationDateTime' },
                                                { name: 'node_key' },
                                                { name: 'EndDate' }
                                            ]
                                        }
                                    };
                                }
                            };
                        },
                        getObject: () => {
                            return {
                                CreatedByUser: 'C1234',
                                CreationDateTime: 'Wed Feb 26 2025 08:57:17 GMT+0530 (India Standard Time)',
                                node_key: 'guid\'17beb005-2229-1edf-bcfe-327784b3026b\'',
                                EndDate: 'Fri Dec 31 9999 05:30:00 GMT+0530 (India Standard Time)'
                            };
                        },
                        getResourceBundle: jest.fn().mockImplementation(() => {
                            return { oUrlInfo: { url: 'i18n.properties' } };
                        })
                    };
                });
            });
            afterEach(() => {
                windowSpy.mockRestore();
                getModelSpy.mockRestore();
            });
            test('returns integration card manifest when dateTimeOffset and datetime are present as key parameters', function () {
                try {
                    windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/testEntity2(CreatedByUser=\'C1234\',CreationDateTime=datetimeoffset\'2025-02-26T03%3A27%3A17.4713650Z\',node_key=guid\'17beb005-2229-1edf-bcfe-327784b3026b\',EndDate=datetime\'9999-12-31T00%3A00%3A00\')' } }));
                    return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                        cardType: CardTypes.INTEGRATION,
                        isDesignMode: true
                    })).then(function (mIntegrationCardManifest) {
                        expect(mIntegrationCardManifest).toMatchSnapshot();
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
        });
    });
    describe('getObjectPageCardManifestForPreview - V4', () => {
        let metaModel;
        let globalFetchMock;
        let resourceBundleCreateSpy;
        const sapAppId = 'testComponent3';
        const appManifest = {
            'sap.app': {
                id: sapAppId,
                type: 'application'
            },
            'sap.ui5': { routing: { targets: { SalesOrderManageObjectPage: { name: 'sap.fe.templates.ObjectPage' } } } },
            'sap.platform.abap': { uri: '' },
            'sap.cards.ap': {
                embeds: {
                    ObjectPage: {
                        default: 'CashBank',
                        manifests: {
                            CashBank: [{
                                    localUri: 'cards/op/CashBank/',
                                    hideActions: true
                                }]
                        }
                    }
                }
            }
        };
        const Component = UIComponent.extend('rootComponent', {
            metadata: { manifest: appManifest },
            createContent() {
                return null;
            }
        });
        const rootComponent = new Component(sapAppId);
        beforeAll(function () {
            try {
                const metadataUrl = compileCDS(path.join(`${ __dirname }`, '../fixtures/Sample.cds'), { odataFormat: 'structured' });
                return Promise.resolve(getMetaModel(metadataUrl)).then(function (_getMetaModel) {
                    metaModel = _getMetaModel;
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        beforeAll(() => {
            resourceBundleCreateSpy = jest.spyOn(ResourceBundle, 'create').mockImplementation(() => {
                return {
                    getText: key => {
                        return i18nMap[key] || key;
                    }
                };
            });
            globalFetchMock = jest.spyOn(window, 'fetch').mockImplementation(url => {
                if (url === '/manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return appManifest;
                        }
                    });
                }
                if (url === '/cards/op/CashBank/manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return IntegrationCardSampleManifest;
                        }
                    });
                }
                if (url === '/cards/op/CashBank/adaptive-manifest.json') {
                    return Promise.resolve({
                        ok: true,
                        json: () => {
                            return AdaptiveCardSampleManifest;
                        }
                    });
                }
            });
        });
        afterAll(() => {
            resourceBundleCreateSpy.mockRestore();
            globalFetchMock.mockRestore();
        });
        let windowSpy;
        let getModelSpy;
        beforeEach(() => {
            ApplicationInfo.getInstance(rootComponent)._resetInstance();
            windowSpy = jest.spyOn(window, 'window', 'get');
            getModelSpy = jest.spyOn(rootComponent, 'getModel').mockImplementation(() => {
                return {
                    isA: () => true,
                    getMetaModel: () => {
                        return metaModel;
                    },
                    getResourceBundle: jest.fn().mockImplementation(() => {
                        return { oUrlInfo: { url: 'i18n.properties' } };
                    })
                };
            });
        });
        afterEach(() => {
            windowSpy.mockRestore();
            getModelSpy.mockRestore();
        });
        test('returns adaptive card manifest ready for preview when there exists select query parameters- when hideAction is false', function () {
            try {
                windowSpy.mockImplementation(() => ({
                    hasher: { getHash: () => 'test-intent&/CashBank(node_key=\'005056a7-004e-1ed8-b2e0-081387831f0d\',IsActiveEntity=true,BankCountry=0000000006)' },
                    location: {
                        href: 'http://localhost:8080/test#test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)',
                        origin: 'http://localhost:8080',
                        pathname: '/test',
                        search: '?query=1',
                        hash: '#hash'
                    }
                }));
                const hashChangerMock = {
                    getHash: jest.fn().mockReturnValue('myHash'),
                    hrefForAppSpecificHash: jest.fn().mockReturnValue('basePath/')
                };
                const mockRouter = { hashChangerMock };
                jest.spyOn(HashChanger, 'getInstance').mockReturnValue(mockRouter.hashChangerMock);
                return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                    cardType: CardTypes.ADAPTIVE,
                    includeActions: false,
                    hideActions: false,
                    isDesignMode: true
                })).then(function (mAdaptiveCardManifest) {
                    expect(mAdaptiveCardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns integration card manifest', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/CashBank(node_key=\'005056a7-004e-1ed8-b2e0-081387831f0d\',IsActiveEntity=true,BankCountry=0000000006)' } }));
                const hashChangerMock = {
                    getHash: jest.fn().mockReturnValue('myHash'),
                    hrefForAppSpecificHash: jest.fn().mockReturnValue('basePath/')
                };
                const mockRouter = { hashChangerMock };
                jest.spyOn(HashChanger, 'getInstance').mockReturnValue(mockRouter.hashChangerMock);
                return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                    cardType: CardTypes.INTEGRATION,
                    isDesignMode: true
                })).then(function (mIntegrationCardManifest) {
                    expect(mIntegrationCardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns adaptive card manifest ready for preview when there exists select query parameters - when hideAction is true', function () {
            try {
                windowSpy.mockImplementation(() => ({
                    hasher: { getHash: () => 'test-intent?&/CashBank(node_key=\'005056a7-004e-1ed8-b2e0-081387831f0d\',IsActiveEntity=true,BankCountry=0000000006)' },
                    location: {
                        href: 'http://localhost:8080/test#test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)',
                        origin: 'http://localhost:8080',
                        pathname: '/test',
                        search: '?query=1',
                        hash: '#hash'
                    }
                }));
                const hashChangerMock = {
                    getHash: jest.fn().mockReturnValue('myHash'),
                    hrefForAppSpecificHash: jest.fn().mockReturnValue('basePath/')
                };
                const mockRouter = { hashChangerMock };
                jest.spyOn(HashChanger, 'getInstance').mockReturnValue(mockRouter.hashChangerMock);
                return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                    cardType: CardTypes.ADAPTIVE,
                    includeActions: false,
                    hideActions: true,
                    isDesignMode: true
                })).then(function (mAdaptiveCardManifest) {
                    expect(mAdaptiveCardManifest).toMatchSnapshot();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('No card exists for application at run time', function () {
            try {
                windowSpy.mockImplementation(() => ({
                    hasher: { getHash: () => 'test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)' },
                    location: { href: 'http://localhost:8080/test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)' }
                }));
                delete rootComponent?.getManifest()?.['sap.cards.ap'];
                const _temp2 = _catch(function () {
                    return Promise.resolve(getObjectPageCardManifestForPreview(rootComponent, {
                        cardType: CardTypes.ADAPTIVE,
                        includeActions: false,
                        hideActions: true,
                        isDesignMode: false
                    })).then(function () {
                    });
                }, function (error) {
                    expect(error).toBeDefined();
                    expect(error).toBe('No cards available for this application');
                });
                return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {
                }) : void 0);
            } catch (e) {
                return Promise.reject(e);
            }
        });
        it('should update path to "/header/" when isODataV4 is true', () => {
            const cardManifest = { 'sap.card': { header: { data: { path: '/old/path' } } } };
            updateHeaderDataPath(cardManifest, true);
            expect(cardManifest['sap.card'].header.data.path).toBe('/header/');
        });
    });
    describe('isSemanticCardGeneration', () => {
        let appComponent;
        let originalLocation;
        beforeAll(() => {
            originalLocation = window.location;
        });
        afterAll(() => {
            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true
            });
        });
        beforeEach(() => {
            appComponent = { getManifest: jest.fn().mockReturnValue({ 'sap.cards.ap': { embeds: { ObjectPage: { manifests: { default: [{}] } } } } }) };
        });
        it('should enable semantic card generation when generateSemanticCard=always', () => {
            Object.defineProperty(window, 'location', {
                value: { search: '?generateSemanticCard=always' },
                writable: true
            });
            expect(isSemanticCardGeneration(appComponent)).toBe(true);
        });
        it('should enable semantic card generation when generateSemanticCard=lean and leanDT card does not exist', () => {
            const appComponentWithoutCards = { getManifest: jest.fn().mockReturnValue({}) };
            Object.defineProperty(window, 'location', {
                value: { search: '?generateSemanticCard=lean' },
                writable: true
            });
            expect(isSemanticCardGeneration(appComponentWithoutCards)).toBe(true);
        });
        it('should not enable semantic card generation when generateSemanticCard=lean and leanDT card exists', () => {
            Object.defineProperty(window, 'location', {
                value: { search: '?generateSemanticCard=lean' },
                writable: true
            });
            expect(isSemanticCardGeneration(appComponent)).toBe(false);
        });
        it('should not enable semantic card generation when generateSemanticCard is not set', () => {
            Object.defineProperty(window, 'location', {
                value: { search: '' },
                writable: true
            });
            expect(isSemanticCardGeneration(appComponent)).toBe(false);
        });
        it('should not enable semantic card generation when generateSemanticCard has invalid value', () => {
            Object.defineProperty(window, 'location', {
                value: { search: '?generateSemanticCard=invalid' },
                writable: true
            });
            expect(isSemanticCardGeneration(appComponent)).toBe(false);
        });
        it('should not enable semantic card generation when window.location.search is undefined', () => {
            Object.defineProperty(window, 'location', {
                value: { search: undefined },
                writable: true
            });
            expect(isSemanticCardGeneration(appComponent)).toBe(false);
        });
    });
    describe('getObjectPageCardManifestForPreview - Semantic Card Generation', () => {
        let globalFetchMock;
        let appComponent;
        let appComponentV4;
        let manifestContent;
        let manifestContentV4;
        let originalLocation;
        const getTestsuiteFilePath = relativePath => {
            return path.join(__dirname, '../../../../../../../../../testsuite', relativePath);
        };
        const setLocationSearchAndOrigin = search => {
            Object.defineProperty(window, 'location', {
                value: {
                    search,
                    href: `https://my313815.s4hana.ondemand.com`
                },
                writable: true
            });
        };
        const createMockApplicationInfoV2 = () => ({
            appInfo: {},
            _rootComponent: appComponent,
            getContextParametersKeyValue: jest.fn(),
            _resetInstance: jest.fn(),
            fetchDetails: jest.fn().mockResolvedValue({
                componentName: 'sales.order.wd20',
                entitySet: 'C_STTA_SalesOrder_WD_20',
                context: 'node_key=guid\'fa163ee4-7bdd-1ee8-b1ff-d3c5a4e5236a\',IsActiveEntity=true',
                contextParameters: 'node_key=guid\'fa163ee4-7bdd-1ee8-b1ff-d3c5a4e5236a\',IsActiveEntity=true',
                contextParametersKeyValue: [
                    {
                        key: 'node_key',
                        value: 'guid\'fa163ee4-7bdd-1ee8-b1ff-d3c5a4e5236a\''
                    },
                    {
                        key: 'IsActiveEntity',
                        value: 'true'
                    }
                ],
                resourceBundle: {},
                semanticObject: 'SalesOrder',
                action: 'display',
                odataModel: 'V2',
                variantParameter: null,
                navigationURI: '/sap/bc/ui5_ui5/sap/salesOrderManage/webapp'
            })
        });
        const createMockApplicationInfoV4 = () => ({
            appInfo: {},
            _rootComponent: appComponentV4,
            getContextParametersKeyValue: jest.fn(),
            _resetInstance: jest.fn(),
            fetchDetails: jest.fn().mockResolvedValue({
                componentName: 'cus.sd.salesorderv2.manage',
                entitySet: 'SalesOrderManage',
                context: '\'SalesOrd29\'',
                contextParameters: 'SalesOrder=\'SalesOrd29\'',
                contextParametersKeyValue: [{
                        key: 'SalesOrder',
                        value: 'SalesOrd29'
                    }],
                resourceBundle: {},
                semanticObject: 'SalesOrder',
                action: 'display',
                odataModel: 'V4',
                variantParameter: null,
                navigationURI: null
            })
        });
        beforeAll(() => {
            originalLocation = window.location;
            try {
                const metadataPath = getTestsuiteFilePath('mockserver/sap/opu/odata/sap/salesorder/metadata.xml');
                const annotationsPath = getTestsuiteFilePath('mockserver/sap/opu/odata/sap/salesorder/annotations.xml');
                const manifestPath = getTestsuiteFilePath('apps/sales.order.wd20/webapp/manifest.json');
                const metadataContent = readFileSync(metadataPath, 'utf8');
                const annotationsContent = readFileSync(annotationsPath, 'utf8');
                manifestContent = readFileSync(manifestPath, 'utf8');
                const metadataPathV4 = getTestsuiteFilePath('mockserver/sap/opu/odata4/sap/c_salesordermanage_srv/srvd/sap/c_salesordermanage_sd/0001/metadata.xml');
                const annotationsPathV4 = getTestsuiteFilePath('apps/cus.sd.salesorderv2.manage/webapp/annotations/annotation.xml');
                const manifestPathV4 = getTestsuiteFilePath('apps/cus.sd.salesorderv2.manage/webapp/manifest.json');
                const metadataContentV4 = readFileSync(metadataPathV4, 'utf8');
                const annotationsContentV4 = readFileSync(annotationsPathV4, 'utf8');
                manifestContentV4 = readFileSync(manifestPathV4, 'utf8');
                globalFetchMock = jest.spyOn(window, 'fetch').mockImplementation(url => {
                    if (url.includes('/sap/opu/odata/sap/salesorder/$metadata')) {
                        return Promise.resolve({
                            ok: true,
                            status: 200,
                            text: () => Promise.resolve(metadataContent),
                            headers: new Headers({ 'Content-Type': 'application/xml' })
                        });
                    }
                    if (url.includes('/sap/opu/odata/sap/salesorder;v=2/Annotations-LR')) {
                        return Promise.resolve({
                            ok: true,
                            status: 200,
                            text: () => Promise.resolve(annotationsContent),
                            headers: new Headers({ 'Content-Type': 'application/xml' })
                        });
                    }
                    if (url.includes('/sap/opu/odata4/sap/c_salesordermanage_srv/srvd/sap/c_salesordermanage_sd/0001/$metadata')) {
                        return Promise.resolve({
                            ok: true,
                            status: 200,
                            text: () => Promise.resolve(metadataContentV4),
                            headers: new Headers({ 'Content-Type': 'application/xml' })
                        });
                    }
                    if (url.includes('/cus.sd.salesorderv2.manage/webapp/annotations/annotation.xml')) {
                        return Promise.resolve({
                            ok: true,
                            status: 200,
                            text: () => Promise.resolve(annotationsContentV4),
                            headers: new Headers({ 'Content-Type': 'application/xml' })
                        });
                    }
                    return Promise.reject(new Error(`Unhandled request: ${ url }`));
                });
            } catch (error) {
                manifestContent = '{"sap.app":{"id":"sales.order.wd20"}}';
                manifestContentV4 = '{"sap.app":{"id":"cus.sd.salesorderv2.manage"}}';
            }
        });
        afterAll(() => {
            globalFetchMock.mockRestore();
            Object.defineProperty(window, 'location', {
                value: originalLocation,
                writable: true
            });
        });
        beforeEach(() => {
            appComponent = {
                getManifest: jest.fn().mockReturnValue(manifestContent ? JSON.parse(manifestContent) : {}),
                getModel: jest.fn().mockReturnValue({
                    isA: () => false,
                    sServiceUrl: '/sap/opu/odata/sap/salesorder',
                    aAnnotationURIs: ['/sap/opu/odata/sap/salesorder;v=2/Annotations-LR*?sap-language=EN']
                })
            };
            appComponentV4 = {
                getManifest: jest.fn().mockReturnValue(manifestContentV4 ? JSON.parse(manifestContentV4) : {}),
                getModel: jest.fn().mockReturnValue({
                    isA: () => true,
                    getServiceUrl: jest.fn().mockReturnValue('/sap/opu/odata4/sap/c_salesordermanage_srv/srvd/sap/c_salesordermanage_sd/0001/'),
                    getMetaModel: function () {
                        return { aAnnotationUris: ['/cus.sd.salesorderv2.manage/webapp/annotations/annotation.xml'] };
                    }
                })
            };
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        describe('OData V2 Semantic Card Generation', () => {
            beforeEach(() => {
                const mockApplicationInfoV2 = createMockApplicationInfoV2();
                jest.spyOn(ApplicationInfo, 'getInstance').mockImplementation(() => mockApplicationInfoV2);
            });
            describe('generateSemanticCard=always scenarios', () => {
                beforeEach(() => {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                });
                it('should generate semantic UI5 Integration Card when generateSemanticCard=always for OData V2 application', function () {
                    try {
                        return Promise.resolve(getObjectPageCardManifestForPreview(appComponent, { cardType: CardTypes.INTEGRATION })).then(function (result) {
                            expect(result['sap.card'].type).toBe('Object');
                            expect(result).toMatchSnapshot('semantic-ui5-integration-card-v2-always');
                        });
                    } catch (e) {
                        return Promise.reject(e);
                    }
                });
                it('should generate semantic MS Teams Adaptive Card when generateSemanticCard=always for OData V2 application', function () {
                    try {
                        return Promise.resolve(getObjectPageCardManifestForPreview(appComponent, { cardType: CardTypes.ADAPTIVE })).then(function (result) {
                            expect(result.type).toBe('AdaptiveCard');
                            expect(result.metadata.context.path).toBe('/sap/opu/odata/sap/salesorder/C_STTA_SalesOrder_WD_20(node_key=guid\'fa163ee4-7bdd-1ee8-b1ff-d3c5a4e5236a\',IsActiveEntity=true)?$format=json&$select=so_id,Product,currency_code,gross_amount,net_amount,tax_amount,op_id,LastChangedUserName,overall_status&$expand=to_Currency,to_ChangedBy');
                            expect(result).toMatchSnapshot('semantic-adaptive-card-v2-always');
                        });
                    } catch (e) {
                        return Promise.reject(e);
                    }
                });
            });
        });
        describe('OData V4 Semantic Card Generation', () => {
            beforeEach(() => {
                const mockApplicationInfoV4 = createMockApplicationInfoV4();
                jest.spyOn(ApplicationInfo, 'getInstance').mockImplementation(() => mockApplicationInfoV4);
            });
            describe('generateSemanticCard=always scenarios', () => {
                beforeEach(() => {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                });
                it('should generate semantic UI5 Integration Card when generateSemanticCard=always for OData V4 application', function () {
                    try {
                        return Promise.resolve(getObjectPageCardManifestForPreview(appComponentV4, { cardType: CardTypes.INTEGRATION })).then(function (result) {
                            expect(result['sap.card'].type).toBe('Object');
                            expect(result).toMatchSnapshot('semantic-ui5-integration-card-v4-always');
                        });
                    } catch (e) {
                        return Promise.reject(e);
                    }
                });
                it('should generate semantic MS Teams Adaptive Card when generateSemanticCard=always for OData V4 application', function () {
                    try {
                        return Promise.resolve(getObjectPageCardManifestForPreview(appComponentV4, { cardType: CardTypes.ADAPTIVE })).then(function (result) {
                            expect(result.metadata.context.path).toBe('/sap/opu/odata4/sap/c_salesordermanage_srv/srvd/sap/c_salesordermanage_sd/0001/SalesOrderManage(\'SalesOrd29\')?$format=json&$select=SalesOrder,SalesOrderType,CustomerName,SoldToParty,PurchaseOrderByCustomer,RequestedDeliveryDate,TotalNetAmount,TransactionCurrency,SalesOrderDate&$expand=_SalesOrderType($select=SalesOrderType_Text),_OverallSDProcessStatus($select=OverallSDProcessStatus_Text),_ShipToParty($select=FullName,Partner)');
                            expect(result).toMatchSnapshot('semantic-adaptive-card-v4-always');
                        });
                    } catch (e) {
                        return Promise.reject(e);
                    }
                });
            });
        });
        describe('Error Handling and Edge Cases', () => {
            it('should handle semantic card generation errors gracefully for OData V2', function () {
                try {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                    const mockApplicationInfoV2 = createMockApplicationInfoV2();
                    mockApplicationInfoV2.fetchDetails = jest.fn().mockRejectedValue(new Error('OData V2 service unavailable'));
                    jest.spyOn(ApplicationInfo, 'getInstance').mockImplementation(() => mockApplicationInfoV2);
                    return Promise.resolve(expect(getObjectPageCardManifestForPreview(appComponent, { cardType: CardTypes.INTEGRATION })).rejects.toThrow('OData V2 service unavailable')).then(function () {
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
            it('should handle semantic card generation errors gracefully for OData V4', function () {
                try {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                    const mockApplicationInfoV4 = createMockApplicationInfoV4();
                    mockApplicationInfoV4.fetchDetails = jest.fn().mockRejectedValue(new Error('OData V4 service unavailable'));
                    jest.spyOn(ApplicationInfo, 'getInstance').mockImplementation(() => mockApplicationInfoV4);
                    return Promise.resolve(expect(getObjectPageCardManifestForPreview(appComponentV4, { cardType: CardTypes.INTEGRATION })).rejects.toThrow('OData V4 service unavailable')).then(function () {
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
            it('should handle concurrent card generation requests for mixed OData versions', function () {
                try {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                    const mockApplicationInfoV2 = createMockApplicationInfoV2();
                    const mockApplicationInfoV4 = createMockApplicationInfoV4();
                    jest.spyOn(ApplicationInfo, 'getInstance').mockImplementationOnce(() => mockApplicationInfoV2).mockImplementationOnce(() => mockApplicationInfoV4);
                    const promises = [
                        getObjectPageCardManifestForPreview(appComponent, { cardType: CardTypes.INTEGRATION }),
                        getObjectPageCardManifestForPreview(appComponentV4, { cardType: CardTypes.ADAPTIVE })
                    ];
                    return Promise.resolve(Promise.all(promises)).then(function (results) {
                        expect(results[0]['sap.card'].type).toBe('Object');
                        expect(results[1].type).toBe('AdaptiveCard');
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
            it('should throw an error when trying to generate card which is not supported', function () {
                try {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                    const mockApplicationInfoV2 = createMockApplicationInfoV2();
                    jest.spyOn(ApplicationInfo, 'getInstance').mockImplementationOnce(() => mockApplicationInfoV2);
                    return Promise.resolve(expect(getObjectPageCardManifestForPreview(appComponent, { cardType: 'Object' })).rejects.toThrow('Unsupported card type: Object. Supported types: "integration", "adaptive"')).then(function () {
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
            it('show generate UI5 Integration Card when card Type is not provided', function () {
                try {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                    const mockApplicationInfoV2 = createMockApplicationInfoV2();
                    jest.spyOn(ApplicationInfo, 'getInstance').mockImplementationOnce(() => mockApplicationInfoV2);
                    return Promise.resolve(getObjectPageCardManifestForPreview(appComponent, {})).then(function (result) {
                        expect(result['sap.card'].type).toBe('Object');
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
            it('should throw error if component.getModel function is not defined or returns null / undefined', function () {
                try {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                    const mockApplicationInfoV2 = createMockApplicationInfoV2();
                    appComponent.getModel = jest.fn().mockReturnValue(null);
                    jest.spyOn(ApplicationInfo, 'getInstance').mockImplementationOnce(() => mockApplicationInfoV2);
                    return Promise.resolve(expect(getObjectPageCardManifestForPreview(appComponent, {})).rejects.toThrow('OData model is not available.')).then(function () {
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
            it('should throw error if service Url is not defined', function () {
                try {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                    const mockApplicationInfoV2 = createMockApplicationInfoV2();
                    appComponent.getModel = jest.fn().mockReturnValue({ isA: () => false });
                    jest.spyOn(ApplicationInfo, 'getInstance').mockImplementationOnce(() => mockApplicationInfoV2);
                    return Promise.resolve(expect(getObjectPageCardManifestForPreview(appComponent, {})).rejects.toThrow('Service URL is not available from the model.')).then(function () {
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
            it('should throw error if model is empty object', function () {
                try {
                    setLocationSearchAndOrigin('?generateSemanticCard=always');
                    const mockApplicationInfoV2 = createMockApplicationInfoV2();
                    appComponent.getModel = jest.fn().mockReturnValue({});
                    jest.spyOn(ApplicationInfo, 'getInstance').mockImplementationOnce(() => mockApplicationInfoV2);
                    return Promise.resolve(expect(getObjectPageCardManifestForPreview(appComponent, {})).rejects.toThrow('Failed to generate UI5 semantic card: oModel.isA is not a function')).then(function () {
                    });
                } catch (e) {
                    return Promise.reject(e);
                }
            });
        });
    });
    describe('getCardManifestForPreview', () => {
        test('rejects the promise when both entity set and key parameters are not provided', function () {
            try {
                const rootComponent = { getManifest: jest.fn().mockReturnValue({}) };
                const _temp3 = _catch(function () {
                    return Promise.resolve(getCardManifestForPreview(rootComponent, { isDesignMode: false })).then(function () {
                    });
                }, function (error) {
                    expect(error).toBeDefined();
                    expect(error).toBe('Failed to share the card : Missing required parameters either entitySet or keyParameters');
                });
                return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {
                }) : void 0);
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('rejects the promise when key parameters are not provided', function () {
            try {
                const fetchOptions = {
                    isDesignMode: false,
                    entitySet: 'test'
                };
                const rootComponent = { getManifest: jest.fn().mockReturnValue({}) };
                const _temp4 = _catch(function () {
                    return Promise.resolve(getCardManifestForPreview(rootComponent, fetchOptions)).then(function () {
                    });
                }, function (error) {
                    expect(error).toBeDefined();
                    expect(error).toBe('Failed to share the card : Missing required parameters either entitySet or keyParameters');
                });
                return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {
                }) : void 0);
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('rejects the promise when key parameters are empty', function () {
            try {
                const fetchOptions = {
                    isDesignMode: false,
                    entitySet: 'test',
                    keyParameters: {}
                };
                const rootComponent = { getManifest: jest.fn().mockReturnValue({}) };
                const _temp5 = _catch(function () {
                    return Promise.resolve(getCardManifestForPreview(rootComponent, fetchOptions)).then(function () {
                    });
                }, function (error) {
                    expect(error).toBeDefined();
                    expect(error).toBe('Failed to share the card : Missing required parameters either entitySet or keyParameters');
                });
                return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {
                }) : void 0);
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('rejects the promise when entity set is empty', function () {
            try {
                const fetchOptions = {
                    isDesignMode: false,
                    entitySet: '',
                    keyParameters: { salesOrder: '423' }
                };
                const rootComponent = { getManifest: jest.fn().mockReturnValue({}) };
                const _temp6 = _catch(function () {
                    return Promise.resolve(getCardManifestForPreview(rootComponent, fetchOptions)).then(function () {
                    });
                }, function (error) {
                    expect(error).toBeDefined();
                    expect(error).toBe('Failed to share the card : Missing required parameters either entitySet or keyParameters');
                });
                return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {
                }) : void 0);
            } catch (e) {
                return Promise.reject(e);
            }
        });
    });
});