/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import path from "path";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import { ApplicationInfo, getApplicationFloorplan } from "sap/cards/ap/common/helpers/ApplicationInfo";
import { compileCDS, getMetaModel } from "sap/cards/ap/test/JestHelper";
import UIComponent from "sap/ui/core/UIComponent";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

const i18nMap: {
	[key: string]: string;
} = {
	appTitle: "Sales Order",
	appDescription: "A Fiori application.",
	CardGeneratorHeaderTitle: "Sales Order",
	CardGeneratorHeaderSubTitle: "A Fiori application.",
	CardGeneratorGroupPropertyLabel_Groups_0_Items_0: "Net Amount",
	CardGeneratorGroupPropertyLabel_Groups_0_Items_1: "Gross Amount",
	CardGeneratorGroupPropertyLabel_Groups_0_Items_2: "Tax Amount",
	CardGeneratorGroupHeader_Groups_0: "Amount",
	CardGeneratorGroupPropertyLabel_Groups_1_Items_0: "Business Partner ID",
	CardGeneratorGroupPropertyLabel_Groups_1_Items_1: "Created At",
	CardGeneratorGroupPropertyLabel_Groups_1_Items_2: "Sales Order ID",
	CardGeneratorGroupHeader_Groups_1: "Additional Info"
};

describe("fetchDetails", () => {
	let windowSpy: jest.SpyInstance;
	let getModelSpy: jest.SpyInstance;
	let resourceBundleCreateSpy: jest.SpyInstance;
	let metaModel: ODataMetaModel;
	const sapAppId = "testComponent";
	const Component = UIComponent.extend("rootComponent", {
		metadata: {
			manifest: {
				"sap.app": {
					id: sapAppId,
					type: "application"
				},
				"sap.ui5": {},
				"sap.platform.abap": {
					uri: ""
				},
				"sap.ui.generic.app": {}
			}
		},
		createContent() {
			return null;
		}
	});
	const rootComponent = new Component(sapAppId);

	beforeEach(() => {
		ApplicationInfo.getInstance(rootComponent)._resetInstance();
		resourceBundleCreateSpy = jest.spyOn(ResourceBundle, "create");
	});

	afterEach(() => {
		resourceBundleCreateSpy.mockRestore();
	});

	beforeAll(async () => {
		const metadataUrl = compileCDS(path.join(`${__dirname}`, "../fixtures/Sample.cds"), { odataFormat: "structured" });
		metaModel = await getMetaModel(metadataUrl);
		windowSpy = jest.spyOn(window, "window", "get");
		getModelSpy = jest.spyOn(rootComponent, "getModel").mockImplementation(() => {
			return {
				isA: () => true,
				getMetaModel: () => {
					return metaModel;
				},
				getResourceBundle: jest.fn().mockImplementation(() => {
					return {
						oUrlInfo: {
							url: "i18n.properties"
						}
					};
				})
			};
		});
	});

	afterAll(() => {
		windowSpy.mockRestore();
		getModelSpy.mockRestore();
	});

	test("returns the application info, object page", async () => {
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () =>
					"test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)"
			}
		}));
		resourceBundleCreateSpy.mockImplementation(() => {
			return {
				getText: (key: string) => {
					return i18nMap[key] || key;
				}
			};
		});

		const applicationInfo = await ApplicationInfo.getInstance(rootComponent).fetchDetails();
		expect(applicationInfo).toMatchObject({
			componentName: sapAppId,
			entitySet: "CashBank",
			context: "node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006"
		});
	});

	test("returns the application info, other than object page", async () => {
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent"
			}
		}));

		resourceBundleCreateSpy.mockImplementation(() => {
			return {
				getText: (key: string) => {
					return i18nMap[key] || key;
				}
			};
		});
		const id = "free.style.app";
		const freestyleAppComponent = UIComponent.extend("freestyleApp", {
			metadata: {
				manifest: {
					"sap.app": {
						id: "free.style.app",
						type: "application"
					},
					"sap.ui5": {},
					"sap.platform.abap": {
						uri: ""
					}
				}
			},
			createContent() {
				return null;
			}
		});
		const freestyleComponent = new freestyleAppComponent(id);
		const getModelSpy = jest.spyOn(freestyleComponent, "getModel").mockImplementation(() => {
			return {
				isA: () => true,
				getMetaModel: () => {
					return metaModel;
				},
				getServiceUrl: jest.fn().mockReturnValue("/sap/opu/odata"),
				getResourceBundle: jest.fn().mockImplementation(() => {
					return {
						oUrlInfo: {
							url: "i18n.properties"
						}
					};
				})
			};
		});

		const applicationInfo = await ApplicationInfo.getInstance(freestyleComponent).fetchDetails({
			isDesignMode: false
		});
		expect(applicationInfo).toMatchObject({
			componentName: id,
			appType: "FreeStyle",
			odataModel: "V4",
			context: ""
		});
		getModelSpy.mockRestore();
	});

	test("ResourceBundle create method should be called, when isDesignMode option is true", async () => {
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () =>
					"test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)"
			}
		}));

		await ApplicationInfo.getInstance(rootComponent).fetchDetails({ isDesignMode: true });
		expect(resourceBundleCreateSpy).toHaveBeenCalled();
	});

	test("ResourceBundle create method should not be called, when isDesignMode option is false", async () => {
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () =>
					"test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)"
			}
		}));

		await await ApplicationInfo.getInstance(rootComponent).fetchDetails({ isDesignMode: false });
		expect(resourceBundleCreateSpy).not.toHaveBeenCalled();
	});

	test("returns the application info, object page in case of FCL Layout application or url has instance of `?` in string", async () => {
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () =>
					"test-intent&/CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)?layout=TwoColumnsMidExpanded&sap-iapp-state=TASUI4HMOZD7OLBHKR0P0RGGG1PBWF1HGTRD33J1P"
			}
		}));
		resourceBundleCreateSpy.mockImplementation(() => {
			return {
				getText: (key: string) => {
					return i18nMap[key] || key;
				}
			};
		});

		const applicationInfo = await ApplicationInfo.getInstance(rootComponent).fetchDetails();
		expect(applicationInfo).toMatchObject({
			componentName: sapAppId,
			entitySet: "CashBank",
			context: "node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006",
			entitySetWithObjectContext: "CashBank(node_key=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true,BankCountry=0000000006)"
		});
	});
	test("returns cached appInfo when path matches", async () => {
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent&/CashBank(node_key=123,IsActiveEntity=true)"
			}
		}));
		const mockI18nModel = {
			getResourceBundle: jest.fn().mockResolvedValue({
				getText: (key: string) => i18nMap[key] || key
			})
		};
		(rootComponent as any).getModel = jest.fn((name?: string) => {
			if (name === "i18n" || name === "@i18n") {
				return mockI18nModel;
			}
			return { isA: jest.fn().mockReturnValue(false) };
		});
		const firstCall = await ApplicationInfo.getInstance(rootComponent).fetchDetails();
		const secondCall = await ApplicationInfo.getInstance(rootComponent).fetchDetails();
		expect(secondCall).toBe(firstCall); // same reference proves cache reuse
	});

	test("recomputes appInfo when path does not match", async () => {
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent&/CashBank(node_key=123,IsActiveEntity=true)"
			}
		}));
		const mockI18nModel = {
			getResourceBundle: jest.fn().mockResolvedValue({
				getText: (key: string) => i18nMap[key] || key
			})
		};
		(rootComponent as any).getModel = jest.fn((name?: string) => {
			if (name === "i18n" || name === "@i18n") {
				return mockI18nModel;
			}
			return { isA: jest.fn().mockReturnValue(false) };
		});
		const firstCall = await ApplicationInfo.getInstance(rootComponent).fetchDetails();
		// Now change hash → different path
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent&/BankAccount(node_key=456,IsActiveEntity=true)"
			}
		}));
		const secondCall = await ApplicationInfo.getInstance(rootComponent).fetchDetails();
		expect(secondCall).not.toBe(firstCall); // new object proves recomputation
		expect(secondCall.entitySet).toBe("BankAccount");
	});
});

describe("getApplicationFloorplan", () => {
	let appComponent: jest.Mocked<UIComponent>;

	beforeEach(() => {
		appComponent = {
			getManifestEntry: jest.fn()
		} as unknown as jest.Mocked<UIComponent>;
	});

	it("should return 'ObjectPage' if the application is a V2 Fiori Elements app", () => {
		appComponent.getManifestEntry.mockReturnValueOnce(true);

		const floorplan = getApplicationFloorplan(appComponent);

		expect(floorplan).toBe("ObjectPage");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui.generic.app");
	});

	it("should return 'ObjectPage' if any routing target is a Fiori Elements template", () => {
		appComponent.getManifestEntry.mockImplementation((key: string) => {
			if (key === "sap.ui.generic.app") {
				return false;
			}
			if (key === "sap.ui5") {
				return {
					routing: {
						targets: {
							target1: { name: "sap.fe.templates.ObjectPage" },
							target2: { name: "com.sap.template" }
						}
					}
				};
			}
		});

		const floorplan = getApplicationFloorplan(appComponent);

		expect(floorplan).toBe("ObjectPage");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui.generic.app");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui5");
	});

	it("should return 'FreeStyle' if no routing target is a Fiori Elements template", () => {
		appComponent.getManifestEntry.mockImplementation((key: string) => {
			if (key === "sap.ui.generic.app") {
				return false;
			}
			if (key === "sap.ui5") {
				return {
					routing: {
						targets: {
							target1: { name: "com.sap.template1" },
							target2: { name: "com.sap.template" }
						}
					}
				};
			}
		});

		const floorplan = getApplicationFloorplan(appComponent);

		expect(floorplan).toBe("FreeStyle");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui.generic.app");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui5");
	});

	it("should return 'FreeStyle' if there are no routing targets", () => {
		appComponent.getManifestEntry.mockImplementation((key: string) => {
			if (key === "sap.ui.generic.app") {
				return false;
			}
			if (key === "sap.ui5") {
				return {
					routing: {}
				};
			}
		});

		const floorplan = getApplicationFloorplan(appComponent);

		expect(floorplan).toBe("FreeStyle");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui.generic.app");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui5");
	});

	it("should return 'FreeStyle' if sap.ui5 is not defined", () => {
		appComponent.getManifestEntry.mockImplementation((key: string) => {
			if (key === "sap.ui.generic.app") {
				return false;
			}
			return undefined;
		});

		const floorplan = getApplicationFloorplan(appComponent);

		expect(floorplan).toBe("FreeStyle");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui.generic.app");
		expect(appComponent.getManifestEntry).toHaveBeenCalledWith("sap.ui5");
	});
});
