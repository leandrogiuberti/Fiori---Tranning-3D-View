/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { Application, ODataModelVersion } from "sap/cards/ap/generator/pages/Application";
import { FreeStyle } from "sap/cards/ap/generator/pages/FreeStyle";
import { ObjectPage } from "sap/cards/ap/generator/pages/ObjectPage";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ODataV4Model from "sap/ui/model/odata/v4/ODataModel";

declare namespace sap {
	export namespace jest {
		function resolvePath(path: string): string;
	}
}

jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/odata/ODataUtils"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/odata/ODataUtils")),
		getEntityNames: jest.fn().mockReturnValue(["C_SalesPlanTP", "C_SalesPlanDimnSelectionTP", "C_SalesPlanItemTP"]),
		getPropertyReference: jest.fn().mockReturnValue([{ name: "SalesPlanUUID" }, { name: "IsActiveEntity" }])
	};
});

jest.mock(sap.jest.resolvePath("sap/cards/ap/common/odata/ODataUtils"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/common/odata/ODataUtils")),
		getEntitySetWithContextURLs: jest.fn().mockResolvedValue([
			{
				labelWithValue: "C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a0a1-8f912f73bf72',IsActiveEntity=false)",
				name: "C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a0a1-8f912f73bf72',IsActiveEntity=false)"
			},
			{
				labelWithValue: "C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a09f-8091d302d596',IsActiveEntity=true)",
				name: "C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a09f-8091d302d596',IsActiveEntity=true)"
			},
			{
				labelWithValue: "C_SalesPlanTP(SalesPlanUUID=guid'42f2e9af-c3df-1ee9-a0bb-0d6579917880',IsActiveEntity=true)",
				name: "C_SalesPlanTP(SalesPlanUUID=guid'42f2e9af-c3df-1ee9-a0bb-0d6579917880',IsActiveEntity=true)"
			},
			{
				labelWithValue: "C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a09f-5cd256c05529',IsActiveEntity=true)",
				name: "C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a09f-5cd256c05529',IsActiveEntity=true)"
			},
			{
				labelWithValue: "C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a09f-540e5299d527',IsActiveEntity=true)",
				name: "C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a09f-540e5299d527',IsActiveEntity=true)"
			}
		])
	};
});

jest.mock(sap.jest.resolvePath("sap/cards/ap/common/odata/v2/MetadataAnalyzer"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/common/odata/v2/MetadataAnalyzer")),
		getPropertyReference: jest.fn().mockReturnValue([
			{ name: "SalesPlanUUID", type: "Edm.Guid" },
			{ name: "IsActiveEntity", type: "Edm.Boolean" }
		])
	};
});

jest.mock(sap.jest.resolvePath("sap/cards/ap/common/odata/v4/MetadataAnalyzer"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/common/odata/v4/MetadataAnalyzer")),
		getPropertyReferenceKey: jest.fn().mockReturnValue([
			{ name: "SalesPlanUUID", type: "Edm.Guid" },
			{ name: "IsActiveEntity", type: "Edm.Boolean" }
		])
	};
});

jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper")),
		getObjectPageContext: jest
			.fn()
			.mockReturnValue("SalesPlanUUID=guid'{{parameters.SalesPlanUUID}}',IsActiveEntity={{parameters.IsActiveEntity}}")
	};
});

describe("Application", () => {
	let windowSpy: jest.SpyInstance;
	const requestObjectMock: jest.Mock = jest.fn();

	const sId = "testComponent";
	const oManifest = {
		"sap.app": {
			id: sId,
			type: "application",
			dataSources: {
				mainService: {
					uri: "/sap/opu/odata/sap/SD_SALESPLAN/",
					type: "OData"
				}
			}
		},
		"sap.ui5": {
			models: {
				"": {
					dataSource: "mainService"
				}
			}
		},
		"sap.cards.ap": {
			embeds: {
				ObjectPage: {
					default: "C_SalesPlanTP"
				}
			}
		}
	};
	const Component = UIComponent.extend("component", {
		metadata: {
			manifest: oManifest
		},
		createContent() {
			return null;
		}
	});

	const rootComponent = new Component(sId);
	rootComponent.getModel = jest.fn().mockReturnValue(new ODataModel("sap/opu/odata"));

	beforeEach(() => {
		windowSpy = jest.spyOn(window, "window", "get");
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent?salesOrder='1234'&/testEntity(12345)"
			}
		}));
	});

	afterEach(() => {
		Application.getInstance()._resetInstance();
		windowSpy.mockRestore();
	});

	it("should create a new instance of ObjectPage card one does not exist", () => {
		const instance = ObjectPage.createInstance(rootComponent);
		expect(instance).toBeInstanceOf(Application);
	});

	it("should return the same instance if one already exists", () => {
		const firstInstance = ObjectPage.createInstance(rootComponent);
		const secondInstance = ObjectPage.createInstance(rootComponent);
		expect(firstInstance).toBe(secondInstance);
	});

	it("should return the root component", () => {
		const instance = ObjectPage.createInstance(rootComponent);
		expect(instance.getRootComponent()).toBe(rootComponent);
	});

	it("should set the correct ODataModelVersion", () => {
		const instance = ObjectPage.createInstance(rootComponent);
		expect(instance._oDataModelVersion).toBe(ODataModelVersion.V2);
	});

	it("should fetch the correct details", () => {
		const instance = ObjectPage.createInstance(rootComponent);
		const details = instance.fetchDetails();
		expect(details.rootComponent).toBe(rootComponent);
		expect(details.odataModel).toBe(ODataModelVersion.V2);
		expect(details.entitySet).toBe("testEntity");
		expect(details.serviceUrl).toBe("sap/opu/odata");
		expect(details.entitySetWithObjectContext).toBe("testEntity(12345)");
		expect(details.componentName).toBe(sId);
		expect(details.semanticObject).toBe("test");
		expect(details.action).toBe("intent");
	});

	it("should validate card generation", async () => {
		const instance = ObjectPage.createInstance(rootComponent);
		expect(instance.validateCardGeneration()).toBe(true);
	});

	it("should return the same instance if one already exists and create a new once if does not exists", () => {
		const firstInstance = FreeStyle.createInstance(rootComponent) as FreeStyle;
		expect(firstInstance).toBeInstanceOf(Application);
		const secondInstance = FreeStyle.createInstance(rootComponent);
		expect(firstInstance).toBe(secondInstance);
	});

	it("should validate card generation for freestyle application", async () => {
		const instance = FreeStyle.createInstance(rootComponent);
		expect(instance.validateCardGeneration()).toBe(true);
	});

	it("should initialize and update the freeStyle Model for dialog", async () => {
		const model = rootComponent.getModel();
		model.read = jest.fn((url, options) => {
			options.success({});
		});
		const freeStyleInstance = FreeStyle.createInstance(rootComponent) as FreeStyle;
		expect(freeStyleInstance.validateCardGeneration()).toBe(true);
		expect(freeStyleInstance.getFreeStyleModelForDialog().getData()).toMatchSnapshot();
		await freeStyleInstance.updateObjectContextFreeStyleModel();
		expect(freeStyleInstance.getFreeStyleModelForDialog().getData()).toMatchSnapshot();
	});

	it("test for OData V4 based freestyle application", async () => {
		const originalFetch = global.fetch;
		global.fetch = jest.fn(() =>
			Promise.resolve({
				json: () => Promise.resolve({})
			})
		) as jest.Mock;
		rootComponent.getModel = jest.fn().mockReturnValue(
			new ODataV4Model({
				serviceUrl: "/sap/opu/odata/sap/SD_SALESPLAN/"
			})
		);
		rootComponent.getModel().isA = jest.fn().mockReturnValue(true);
		rootComponent.getModel().bindContext = jest.fn().mockReturnValue({
			requestObject: requestObjectMock
		});
		const firstInstance = FreeStyle.createInstance(rootComponent) as FreeStyle;
		await firstInstance.updateObjectContextFreeStyleModel();
		expect(firstInstance).toBeInstanceOf(Application);
		expect(firstInstance.getFreeStyleModelForDialog().getData()).toMatchSnapshot();
		expect(requestObjectMock).toHaveBeenCalledTimes(1);
		global.fetch = originalFetch;
	});
});

describe("Invalidate Card Generation", () => {
	let windowSpy: jest.SpyInstance;
	const sId = "testComponent1";
	const oManifest = {
		"sap.app": {
			id: sId,
			type: "application",
			dataSources: {
				mainService: {
					uri: "/sap/opu/odata/sap/SD_SALESPLAN/",
					type: "OData"
				}
			}
		},
		"sap.ui5": {
			models: {
				"": {
					dataSource: "mainService"
				}
			}
		}
	};
	const Component = UIComponent.extend("component", {
		metadata: {
			manifest: oManifest
		},
		createContent() {
			return null;
		}
	});

	const rootComponent = new Component(sId);
	rootComponent.setModel(new ODataModel("sap/opu/odata"));

	afterEach(() => {
		Application.getInstance()._resetInstance();
		windowSpy.mockRestore();
	});

	it("should invalidate the card generation for non-object page", async () => {
		windowSpy = jest.spyOn(window, "window", "get");
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent&/testEntity"
			}
		}));

		const instance = ObjectPage.createInstance(rootComponent);
		expect(instance.validateCardGeneration()).toBe(false);
	});

	it("should invalidate the card generation for unavailable object context", async () => {
		windowSpy = jest.spyOn(window, "window", "get");
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent&/testEntity()"
			}
		}));

		const instance = ObjectPage.createInstance(rootComponent);
		expect(instance.validateCardGeneration()).toBe(false);
	});

	it("should invalidate the card generation when no entitySet is provided", async () => {
		windowSpy = jest.spyOn(window, "window", "get");
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent"
			}
		}));

		const instance = ObjectPage.createInstance(rootComponent);
		expect(instance.validateCardGeneration()).toBe(false);
	});

	it("should fetch the correct details in case of FCL Layout app or url has instance of `?` in string", () => {
		windowSpy = jest.spyOn(window, "window", "get");
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () =>
					"test-intent&/testEntity('1234')?layout=TwoColumnsMidExpanded&sap-iapp-state=TASUI4HMOZD7OLBHKR0P0RGGG1PBWF1HGTRD33J1P"
			}
		}));

		const instance = ObjectPage.createInstance(rootComponent);
		const details = instance.fetchDetails();
		expect(details.entitySetWithObjectContext).toBe("testEntity('1234')");
		expect(details.entitySet).toBe("testEntity");
	});
});
