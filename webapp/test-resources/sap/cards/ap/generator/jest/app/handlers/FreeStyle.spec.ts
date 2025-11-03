/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import * as freeStyleHandlers from "sap/cards/ap/generator/app/handlers/FreeStyle";
import { Application } from "sap/cards/ap/generator/pages/Application";
import { FreeStyle } from "sap/cards/ap/generator/pages/FreeStyle";
import type Event from "sap/ui/base/Event";
import CoreElement from "sap/ui/core/Element";

declare namespace sap {
	export namespace jest {
		function resolvePath(path: string): string;
	}
}

jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper")),
		createCardManifest: jest.fn(),
		renderCardPreview: jest.fn(),
		updateCardGroups: jest.fn()
	};
});
jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/CardGeneratorModel"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/helpers/CardGeneratorModel")),
		getCardGeneratorDialogModel: jest.fn().mockReturnValue({
			getProperty: jest.fn().mockReturnValue({}),
			getData: jest.fn().mockReturnValue({})
		})
	};
});

jest.mock(sap.jest.resolvePath("sap/cards/ap/common/odata/v2/MetadataAnalyzer"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/common/odata/v2/MetadataAnalyzer")),
		getPropertyReference: jest.fn().mockReturnValue([{ name: "SalesPlanUUID" }, { name: "IsActiveEntity" }])
	};
});

jest.mock(sap.jest.resolvePath("sap/cards/ap/common/odata/v4/MetadataAnalyzer"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/common/odata/v4/MetadataAnalyzer")),
		getPropertyReferenceKey: jest.fn().mockReturnValue([{ name: "SalesPlanUUID" }, { name: "IsActiveEntity" }])
	};
});

describe("onServiceChange", () => {
	let coreElementGetElementByIdSpy: jest.SpyInstance;
	let setPropertyMock: jest.Mock = jest.fn();

	beforeAll(() => {
		coreElementGetElementByIdSpy = jest.spyOn(CoreElement, "getElementById");
		coreElementGetElementByIdSpy.mockImplementation((id) => {
			if (id === "cardGeneratorDialog--cardGeneratorDialog") {
				return {
					getModel: jest.fn().mockReturnValue({
						setProperty: setPropertyMock
					})
				};
			}
		});
	});

	afterAll(() => {
		coreElementGetElementByIdSpy.mockRestore();
	});
	test("should change the service", () => {
		const event = {
			getSource: jest.fn().mockReturnValue({
				getValue: jest.fn().mockReturnValue("/sap/opu/odata/sap/SEPMRA")
			})
		};

		freeStyleHandlers.onServiceChange(event as unknown as Event);
		expect(setPropertyMock).toHaveBeenCalledTimes(4);
		expect(setPropertyMock).toHaveBeenCalledWith("/isApplyServiceDetailsEnabled", false);
		expect(setPropertyMock).toHaveBeenCalledWith("/entitySet", "");
		expect(setPropertyMock).toHaveBeenCalledWith("/entitySetWithObjectContext", "");
		expect(setPropertyMock).toHaveBeenCalledWith("/currentService", "/sap/opu/odata/sap/SEPMRA");
	});
});

describe("onEntitySetPathChange, onContextPathChange and applyServiceDetails functions of the controller", () => {
	let coreElementGetElementByIdSpy: jest.SpyInstance;
	const setPropertyMock: jest.Mock = jest.fn();
	const setModelMock: jest.Mock = jest.fn();
	let windowSpy: jest.SpyInstance;

	const rootComponent = {
		getModel: jest.fn().mockReturnValue({
			getProperty: jest.fn().mockReturnValue("/sap/opu/odata/sap/SEPMRA"),
			isA: jest.fn().mockReturnValue(true),
			getServiceUrl: jest.fn().mockReturnValue("/sap/opu/odata/sap/SEPMRA"),
			getMetaModel: jest.fn().mockReturnValue({
				getODataEntityContainer: jest.fn().mockReturnValue({
					entitySet: [{ name: "C_SalesPlanTP" }, { name: "C_SalesPlanDimnSelectionTP" }]
				}),
				getODataEntitySet: jest.fn().mockReturnValue({
					entityType: "C_SalesPlanTPType"
				}),
				getODataEntityType: jest.fn().mockReturnValue({
					property: [{ name: "SalesPlanUUID" }, { name: "IsActiveEntity" }],
					key: {
						propertyRef: [{ name: "SalesPlanUUID" }, { name: "IsActiveEntity" }]
					}
				}),
				getODataAssociationEnd: jest.fn()
			})
		}),
		getManifestEntry: jest.fn().mockImplementation((path) => {
			if (path === "/sap.ui5/models") {
				return {
					"": {
						preload: true,
						dataSource: "mainService",
						settings: {
							metadataUrlParams: {
								"sap-documentation": "heading"
							}
						}
					}
				};
			}
			if (path === "/sap.app/dataSources") {
				return {
					mainService: {
						uri: "/sap/opu/odata/sap/SD_SALESPLAN/",
						type: "OData"
					}
				};
			}
			if (path === "sap.app") {
				return {
					id: "testApp"
				};
			}
		})
	};
	beforeAll(() => {
		coreElementGetElementByIdSpy = jest.spyOn(CoreElement, "getElementById");
		coreElementGetElementByIdSpy.mockImplementation((id) => {
			if (id === "cardGeneratorDialog--cardGeneratorDialog") {
				return {
					getModel: jest.fn().mockImplementation((modelName) => {
						if (modelName === "freeStyle") {
							return (Application.getInstance() as FreeStyle).getFreeStyleModelForDialog();
						}
						return {
							setProperty: setPropertyMock,
							setData: jest.fn(),
							getProperty: jest.fn()
						};
					}),
					setModel: setModelMock
				};
			}
		});
		windowSpy = jest.spyOn(window, "window", "get");
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent&/testEntity(12345)"
			}
		}));
	});

	afterAll(() => {
		coreElementGetElementByIdSpy.mockRestore();
		windowSpy.mockRestore();
	});

	afterEach(() => {
		Application.getInstance()._resetInstance();
	});
	test("should change the entity set path", async () => {
		const event = {
			getSource: jest.fn().mockReturnValue({
				getValue: jest.fn().mockReturnValue("C_SalesOrder")
			})
		};
		FreeStyle.createInstance(rootComponent);

		const freeStyleDialogModel = (Application.getInstance() as FreeStyle).getFreeStyleModelForDialog();
		expect(freeStyleDialogModel.getData()).toMatchSnapshot();
		await freeStyleHandlers.onEntitySetPathChange(event as unknown as Event);
		expect(freeStyleDialogModel.getData()).toMatchSnapshot();
	});

	test("Save and Reopen Scenario and should open the existing entity related data", async () => {
		rootComponent.getManifestEntry = jest.fn().mockImplementation((path) => {
			if (path === "/sap.ui5/models") {
				return {
					"": {
						preload: true,
						dataSource: "mainService",
						settings: {
							metadataUrlParams: {
								"sap-documentation": "heading"
							}
						}
					}
				};
			}
			if (path === "/sap.app/dataSources") {
				return {
					mainService: {
						uri: "/sap/opu/odata/sap/SD_SALESPLAN/",
						type: "OData"
					}
				};
			}
			if (path === "/sap.cards.ap/embeds/ObjectPage/default") {
				return "C_SalesPlanTP";
			}
			if (path === "sap.app") {
				return {
					id: "testApp"
				};
			}
		});

		FreeStyle.createInstance(rootComponent);
		const freeStyleDialogModel = (Application.getInstance() as FreeStyle).getFreeStyleModelForDialog();
		expect(freeStyleDialogModel.getData()).toMatchSnapshot();
	});

	test("should change the context path", async () => {
		const event = {
			getSource: jest.fn().mockReturnValue({
				getValue: jest
					.fn()
					.mockReturnValue("C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a0a1-8f912f73bf72',IsActiveEntity=false)")
			})
		};
		FreeStyle.createInstance(rootComponent);

		const freeStyleDialogModel = (Application.getInstance() as FreeStyle).getFreeStyleModelForDialog();
		await freeStyleHandlers.onContextPathChange(event as unknown as Event);
		expect(freeStyleDialogModel.getData()).toMatchSnapshot();
	});

	test("should apply all the changes", async () => {
		FreeStyle.createInstance(rootComponent);
		const freeStyleDialogModel = (Application.getInstance() as FreeStyle).getFreeStyleModelForDialog();
		freeStyleDialogModel.setProperty("/isEntityPathChanged", true);
		await freeStyleHandlers.applyServiceDetails();
		expect(freeStyleDialogModel.getData()).toMatchSnapshot();
		expect(freeStyleDialogModel.getProperty("/isServiceDetailsView")).toBeFalsy();
		expect(freeStyleDialogModel.getProperty("/isEntityPathChanged")).toBeFalsy();
		expect(setModelMock).toHaveBeenCalledTimes(1);
	});
});
