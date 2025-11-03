'use strict';
sap.ui.define([
    'sap/cards/ap/common/thirdparty/path',
    'sap/base/i18n/ResourceBundle',
    'sap/cards/ap/common/helpers/ApplicationInfo',
    'sap/cards/ap/test/JestHelper',
    'sap/ui/core/UIComponent'
], function (__path, ResourceBundle, sap_cards_ap_common_helpers_ApplicationInfo, sap_cards_ap_test_JestHelper, UIComponent) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule && typeof obj.default !== 'undefined' ? obj.default : obj;
    }
    const path = _interopRequireDefault(__path);
    const ApplicationInfo = sap_cards_ap_common_helpers_ApplicationInfo['ApplicationInfo'];
    const getApplicationFloorplan = sap_cards_ap_common_helpers_ApplicationInfo['getApplicationFloorplan'];
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
    describe('fetchDetails', () => {
        let windowSpy;
        let getModelSpy;
        let resourceBundleCreateSpy;
        let metaModel;
        const sapAppId = 'testComponent';
        const Component = UIComponent.extend('rootComponent', {
            metadata: {
                manifest: {
                    'sap.app': {
                        id: sapAppId,
                        type: 'application'
                    },
                    'sap.ui5': {},
                    'sap.platform.abap': { uri: '' },
                    'sap.ui.generic.app': {}
                }
            },
            createContent() {
                return null;
            }
        });
        const rootComponent = new Component(sapAppId);
        beforeEach(() => {
            ApplicationInfo.getInstance(rootComponent)._resetInstance();
            resourceBundleCreateSpy = jest.spyOn(ResourceBundle, 'create');
        });
        afterEach(() => {
            resourceBundleCreateSpy.mockRestore();
        });
        beforeAll(function () {
            try {
                const metadataUrl = compileCDS(path.join(`${ __dirname }`, '../fixtures/Sample.cds'), { odataFormat: 'structured' });
                return Promise.resolve(getMetaModel(metadataUrl)).then(function (_getMetaModel) {
                    metaModel = _getMetaModel;
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
            } catch (e) {
                return Promise.reject(e);
            }
        });
        afterAll(() => {
            windowSpy.mockRestore();
            getModelSpy.mockRestore();
        });
        test('returns the application info, object page', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)' } }));
                resourceBundleCreateSpy.mockImplementation(() => {
                    return {
                        getText: key => {
                            return i18nMap[key] || key;
                        }
                    };
                });
                return Promise.resolve(ApplicationInfo.getInstance(rootComponent).fetchDetails()).then(function (applicationInfo) {
                    expect(applicationInfo).toMatchObject({
                        componentName: sapAppId,
                        entitySet: 'CashBank',
                        context: 'node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006'
                    });
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns the application info, other than object page', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent' } }));
                resourceBundleCreateSpy.mockImplementation(() => {
                    return {
                        getText: key => {
                            return i18nMap[key] || key;
                        }
                    };
                });
                const id = 'free.style.app';
                const freestyleAppComponent = UIComponent.extend('freestyleApp', {
                    metadata: {
                        manifest: {
                            'sap.app': {
                                id: 'free.style.app',
                                type: 'application'
                            },
                            'sap.ui5': {},
                            'sap.platform.abap': { uri: '' }
                        }
                    },
                    createContent() {
                        return null;
                    }
                });
                const freestyleComponent = new freestyleAppComponent(id);
                const getModelSpy = jest.spyOn(freestyleComponent, 'getModel').mockImplementation(() => {
                    return {
                        isA: () => true,
                        getMetaModel: () => {
                            return metaModel;
                        },
                        getServiceUrl: jest.fn().mockReturnValue('/sap/opu/odata'),
                        getResourceBundle: jest.fn().mockImplementation(() => {
                            return { oUrlInfo: { url: 'i18n.properties' } };
                        })
                    };
                });
                return Promise.resolve(ApplicationInfo.getInstance(freestyleComponent).fetchDetails({ isDesignMode: false })).then(function (applicationInfo) {
                    expect(applicationInfo).toMatchObject({
                        componentName: id,
                        appType: 'FreeStyle',
                        odataModel: 'V4',
                        context: ''
                    });
                    getModelSpy.mockRestore();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('ResourceBundle create method should be called, when isDesignMode option is true', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)' } }));
                return Promise.resolve(ApplicationInfo.getInstance(rootComponent).fetchDetails({ isDesignMode: true })).then(function () {
                    expect(resourceBundleCreateSpy).toHaveBeenCalled();
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('ResourceBundle create method should not be called, when isDesignMode option is false', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)' } }));
                return Promise.resolve(ApplicationInfo.getInstance(rootComponent).fetchDetails({ isDesignMode: false })).then(function (_ApplicationInfo$getI2) {
                    return Promise.resolve(_ApplicationInfo$getI2).then(function () {
                        expect(resourceBundleCreateSpy).not.toHaveBeenCalled();
                    });
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns the application info, object page in case of FCL Layout application or url has instance of `?` in string', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)?layout=TwoColumnsMidExpanded&sap-iapp-state=TASUI4HMOZD7OLBHKR0P0RGGG1PBWF1HGTRD33J1P' } }));
                resourceBundleCreateSpy.mockImplementation(() => {
                    return {
                        getText: key => {
                            return i18nMap[key] || key;
                        }
                    };
                });
                return Promise.resolve(ApplicationInfo.getInstance(rootComponent).fetchDetails()).then(function (applicationInfo) {
                    expect(applicationInfo).toMatchObject({
                        componentName: sapAppId,
                        entitySet: 'CashBank',
                        context: 'node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006',
                        entitySetWithObjectContext: 'CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)'
                    });
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('returns cached appInfo when path matches', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/CashBank(node_key=123,IsActiveEntity=true)' } }));
                const mockI18nModel = { getResourceBundle: jest.fn().mockResolvedValue({ getText: key => i18nMap[key] || key }) };
                rootComponent.getModel = jest.fn(name => {
                    if (name === 'i18n' || name === '@i18n') {
                        return mockI18nModel;
                    }
                    return { isA: jest.fn().mockReturnValue(false) };
                });
                return Promise.resolve(ApplicationInfo.getInstance(rootComponent).fetchDetails()).then(function (firstCall) {
                    return Promise.resolve(ApplicationInfo.getInstance(rootComponent).fetchDetails()).then(function (secondCall) {
                        expect(secondCall).toBe(firstCall);
                    });
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
        test('recomputes appInfo when path does not match', function () {
            try {
                windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/CashBank(node_key=123,IsActiveEntity=true)' } }));
                const mockI18nModel = { getResourceBundle: jest.fn().mockResolvedValue({ getText: key => i18nMap[key] || key }) };
                rootComponent.getModel = jest.fn(name => {
                    if (name === 'i18n' || name === '@i18n') {
                        return mockI18nModel;
                    }
                    return { isA: jest.fn().mockReturnValue(false) };
                });
                return Promise.resolve(ApplicationInfo.getInstance(rootComponent).fetchDetails()).then(function (firstCall) {
                    windowSpy.mockImplementation(() => ({ hasher: { getHash: () => 'test-intent&/BankAccount(node_key=456,IsActiveEntity=true)' } }));
                    return Promise.resolve(ApplicationInfo.getInstance(rootComponent).fetchDetails()).then(function (secondCall) {
                        expect(secondCall).not.toBe(firstCall);
                        expect(secondCall.entitySet).toBe('BankAccount');
                    });
                });
            } catch (e) {
                return Promise.reject(e);
            }
        });
    });
    describe('getApplicationFloorplan', () => {
        let appComponent;
        beforeEach(() => {
            appComponent = { getManifestEntry: jest.fn() };
        });
        it('should return \'ObjectPage\' if the application is a V2 Fiori Elements app', () => {
            appComponent.getManifestEntry.mockReturnValueOnce(true);
            const floorplan = getApplicationFloorplan(appComponent);
            expect(floorplan).toBe('ObjectPage');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui.generic.app');
        });
        it('should return \'ObjectPage\' if any routing target is a Fiori Elements template', () => {
            appComponent.getManifestEntry.mockImplementation(key => {
                if (key === 'sap.ui.generic.app') {
                    return false;
                }
                if (key === 'sap.ui5') {
                    return {
                        routing: {
                            targets: {
                                target1: { name: 'sap.fe.templates.ObjectPage' },
                                target2: { name: 'com.sap.template' }
                            }
                        }
                    };
                }
            });
            const floorplan = getApplicationFloorplan(appComponent);
            expect(floorplan).toBe('ObjectPage');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui.generic.app');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui5');
        });
        it('should return \'FreeStyle\' if no routing target is a Fiori Elements template', () => {
            appComponent.getManifestEntry.mockImplementation(key => {
                if (key === 'sap.ui.generic.app') {
                    return false;
                }
                if (key === 'sap.ui5') {
                    return {
                        routing: {
                            targets: {
                                target1: { name: 'com.sap.template1' },
                                target2: { name: 'com.sap.template' }
                            }
                        }
                    };
                }
            });
            const floorplan = getApplicationFloorplan(appComponent);
            expect(floorplan).toBe('FreeStyle');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui.generic.app');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui5');
        });
        it('should return \'FreeStyle\' if there are no routing targets', () => {
            appComponent.getManifestEntry.mockImplementation(key => {
                if (key === 'sap.ui.generic.app') {
                    return false;
                }
                if (key === 'sap.ui5') {
                    return { routing: {} };
                }
            });
            const floorplan = getApplicationFloorplan(appComponent);
            expect(floorplan).toBe('FreeStyle');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui.generic.app');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui5');
        });
        it('should return \'FreeStyle\' if sap.ui5 is not defined', () => {
            appComponent.getManifestEntry.mockImplementation(key => {
                if (key === 'sap.ui.generic.app') {
                    return false;
                }
                return undefined;
            });
            const floorplan = getApplicationFloorplan(appComponent);
            expect(floorplan).toBe('FreeStyle');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui.generic.app');
            expect(appComponent.getManifestEntry).toHaveBeenCalledWith('sap.ui5');
        });
    });
});