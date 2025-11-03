/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import path from "path";
import { createContextParameter, fetchDataAsync, getEntitySetWithObjectContext } from "sap/cards/ap/common/odata/ODataUtils";
import { compileCDS, getMetaModel } from "sap/cards/ap/test/JestHelper";
import UIComponent from "sap/ui/core/UIComponent";
import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

describe("fetchDataAsync", () => {
	const ModelReadMock: jest.Mock = jest.fn((path, options) => {
		options.success({
			results: [{ key: "value" }]
		});
	});
	const originalRead = V2ODataModel.prototype.read;
	let originalFetch: typeof global.fetch;
	let sUrl = "https://url/test/";
	const sPath = "Products";
	const expectedValue = {
		value: "Testing!",
		Response: "Success",
		Status: 200,
		StatusText: "OK",
		Headers: "Content-Type: application/json"
	};
	beforeEach(() => {
		originalFetch = global.fetch;
		global.fetch = jest.fn(() =>
			Promise.resolve({
				json: () => Promise.resolve(expectedValue),
				ok: true
			})
		) as jest.Mock;
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	test("fetchDataAsync - service URL ending with /", async () => {
		const result = await fetchDataAsync(sUrl, sPath, {}, true);
		expect(global.fetch).toHaveBeenCalledWith("https://url/test/Products?format=json");
		expect(result).toBe(expectedValue);
	});

	test("fetchDataAsync service URL ending without /", async () => {
		sUrl = "https://url/test";
		const result = await fetchDataAsync(sUrl, sPath, {}, true);
		expect(global.fetch).toHaveBeenCalledWith("https://url/test/Products?format=json");
		expect(result).toBe(expectedValue);
	});

	test("fetchDataAsync service URL ending without / OData v2", async () => {
		sUrl = "https://url/test";
		V2ODataModel.prototype.read = ModelReadMock;
		await fetchDataAsync(sUrl, sPath, {}, false);
		expect(ModelReadMock).toHaveBeenCalledTimes(1);
		V2ODataModel.prototype.read = originalRead;
	});
});

describe("createContextParameter", () => {
	let metaModel: ODataMetaModel;
	let windowSpy: jest.SpyInstance;
	let originalFetch: typeof global.fetch;
	const expectedValue = {
		value: [
			{
				BankCountry: "AD",
				IsActiveEntity: true,
				MDChgProcessSrceObject: "UfjoXSWiGYCHlYwZZpzEGYVyqqCIMKqU",
				MDChgProcessSrceSystem: "iaQPTAshURuFpMIpjcOqnqpKvbvDpynL",
				MasterDataChangeProcess: "111111111111",
				DraftUUID: "005056a7-004e-1ed8-b2e0-081387831f0d"
			}
		]
	};
	beforeAll(async () => {
		const metadataUrl = compileCDS(path.join(`${__dirname}`, "../fixtures/Sample.cds"), { odataFormat: "structured" });
		metaModel = await getMetaModel(metadataUrl);
	});
	beforeAll(() => {
		windowSpy = jest.spyOn(window, "window", "get");
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent&/I_BillingBlockReason(12345)"
			}
		}));
		originalFetch = global.fetch;
		global.fetch = jest.fn(() =>
			Promise.resolve({
				json: () => Promise.resolve(expectedValue)
			})
		) as jest.Mock;
	});
	afterAll(() => {
		jest.restoreAllMocks();
		global.fetch = originalFetch;
	});

	test("validate method createContextParameter for V4 data - with multiple context parameters", async () => {
		const mockMetaData = {
			getServiceUrl: () => "/sap/opu/odata",
			isA: () => true,
			getMetaModel: () => {
				return metaModel;
			},
			getObject: () => {
				return {
					BankInternalID: "0000000002",
					IsActiveEntity: true,
					BankCountry: "AD"
				};
			}
		};
		const path = "CashBank(BankCountry='AD',BankInternalID='0000000002')";
		const expectedPath = "BankCountry='AD',BankInternalID='0000000002',IsActiveEntity=true";

		const updatedPath = await createContextParameter(path, mockMetaData, true);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createContextParameter for V4 data - with single context guid parameters", async () => {
		const mockMetaData = {
			getServiceUrl: () => "/sap/opu/odata",
			isA: () => true,
			getMetaModel: () => {
				return metaModel;
			},
			getObject: () => {
				return {
					BankInternalID: "0000000002",
					IsActiveEntity: true,
					BankCountry: "AD"
				};
			}
		};
		const path = "CashBank(BankCountry='AD',BankInternalID='0000000002')";
		const expectedPath = "BankCountry='AD',BankInternalID='0000000002',IsActiveEntity=true";

		const updatedPath = await createContextParameter(path, mockMetaData, true);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createContextParameter for V4 data - with semantic key annotation", async () => {
		const mockMetaData = {
			getServiceUrl: () => "/sap/opu/odata",
			isA: () => true,
			getMetaModel: () => {
				return metaModel;
			},
			bindList: jest.fn().mockReturnValue({
				requestContexts: jest.fn().mockResolvedValue([
					{
						getPath: jest.fn().mockReturnValue("/CashBank(BankCountry='AD',BankInternalID='AD',IsActiveEntity=true)"),
						getProperty: jest.fn().mockImplementation((property) => {
							if (property === "BankInternalID") {
								return "0000000002";
							}
							if (property === "IsActiveEntity") {
								return true;
							}
							if (property === "BankCountry") {
								return "AD";
							}
						})
					}
				])
			})
		};

		const path = "CashBank('AD')";
		const expectedPath = "BankCountry='AD',BankInternalID='0000000002',IsActiveEntity=true";
		const updatedPath = await createContextParameter(path, mockMetaData, true);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createContextParameter for V4 data - having multiple semantic key annotation", async () => {
		const mockMetaData = {
			getServiceUrl: () => "/sap/opu/odata",
			isA: () => true,
			getMetaModel: () => {
				return metaModel;
			},
			bindList: jest.fn().mockReturnValue({
				requestContexts: jest.fn().mockResolvedValue([
					{
						getPath: jest
							.fn()
							.mockReturnValue(
								"/Product(MasterDataChangeProcess='111111111111',MDChgProcessSrceSystem='iaQPTAshURuFpMIpjcOqnqpKvbvDpynL',MDChgProcessSrceObject='UfjoXSWiGYCHlYwZZpzEGYVyqqCIMKqU',DraftUUID=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true)"
							),
						getProperty: jest.fn().mockImplementation((propertyName) => {
							if (propertyName === "MasterDataChangeProcess") {
								return "111111111111";
							}
							if (propertyName === "MDChgProcessSrceSystem") {
								return "iaQPTAshURuFpMIpjcOqnqpKvbvDpynL";
							}
							if (propertyName === "MDChgProcessSrceObject") {
								return "UfjoXSWiGYCHlYwZZpzEGYVyqqCIMKqU";
							}
							if (propertyName === "DraftUUID") {
								return "005056a7-004e-1ed8-b2e0-081387831f0d";
							}
							if (propertyName === "IsActiveEntity") {
								return true;
							}
						})
					}
				])
			})
		};

		const path =
			"Product(MDChgProcessSrceObject='UfjoXSWiGYCHlYwZZpzEGYVyqqCIMKqU',MDChgProcessSrceSystem='iaQPTAshURuFpMIpjcOqnqpKvbvDpynL',MasterDataChangeProcess='111111111111')";
		const expectedPath =
			"MasterDataChangeProcess='111111111111',MDChgProcessSrceSystem='iaQPTAshURuFpMIpjcOqnqpKvbvDpynL',MDChgProcessSrceObject='UfjoXSWiGYCHlYwZZpzEGYVyqqCIMKqU',DraftUUID=005056a7-004e-1ed8-b2e0-081387831f0d,IsActiveEntity=true";
		const updatedPath = await createContextParameter(path, mockMetaData, true);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createContextParameter for V4 data - having same semantic key as of context parameters", async () => {
		const mockMetaData = {
			getServiceUrl: () => "/sap/opu/odata",
			isA: () => true,
			getMetaModel: () => {
				return metaModel;
			},
			bindList: jest.fn().mockReturnValue({
				requestContexts: jest.fn().mockResolvedValue([
					{
						getPath: jest.fn().mockReturnValue("/SalesOrderManage('SalesOrd72')"),
						getProperty: jest.fn().mockImplementation((propertyName) => {
							if (propertyName === "SalesOrder") {
								return "SalesOrd72";
							}
						})
					}
				])
			})
		};

		const path = "SalesOrderManage('SalesOrd72')";
		const expectedPath = "SalesOrder='SalesOrd72'";
		const updatedPath = await createContextParameter(path, mockMetaData, true);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createContextParameter for V4 data - having same semantic key different than context parameter and annotation is applied on data field level", async () => {
		const mockMetaData = {
			getServiceUrl: () => "/sap/opu/odata",
			isA: () => true,
			getMetaModel: () => {
				return metaModel;
			},
			getObject: () => {
				return {
					ProcessUUID: "a3ac840f-5d6d-1fe0-8096-2e30afc00ec2"
				};
			},
			bindList: jest.fn().mockReturnValue({
				requestContexts: jest.fn().mockResolvedValue([])
			})
		};

		const path = "Process(a3ac840f-5d6d-1fe0-8096-2e30afc00ec2)";
		const expectedPath = "ProcessUUID=a3ac840f-5d6d-1fe0-8096-2e30afc00ec2";
		const updatedPath = await createContextParameter(path, mockMetaData, true);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createContextParameter for V2 data - with multiple context parameters", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return {
					sServiceUrl: "/sap/opu/odata",
					isA: () => false,
					getODataEntityType: (path: string) => {
						return {
							key: {
								propertyRef: [
									{
										name: "BankCountry"
									},
									{
										name: "BankInternalID"
									},
									{
										name: "IsActiveEntity"
									}
								]
							},
							property: [
								{
									name: "BankCountry",
									type: "Edm.String",
									nullable: "false",
									"sap:label": "Bank Country",
									kind: "Property"
								},
								{
									name: "BankInternalID",
									type: "Edm.Guid",
									nullable: "false",
									"sap:label": "Bank Internal ID",
									kind: "Property"
								},
								{
									name: "IsActiveEntity",
									type: "Edm.Boolean",
									nullable: "false",
									"sap:label": "Is Active Entity",
									kind: "Property"
								}
							]
						};
					},
					getODataAssociationEnd: () => {},
					getODataEntitySet: (path: string) => {
						return {
							name: "CashBank",
							entityType: "com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType"
						};
					}
				};
			}
		};
		const path = "CashBank(BankInternalID=guid'0000000002',BankCountry='AD',IsActiveEntity=true)";
		const expectedPath = "BankInternalID=guid'0000000002',BankCountry='AD',IsActiveEntity=true";

		const updatedPath = await createContextParameter(path, mockMetaData, false);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createContextParameter for V2 data - with single context guid parameter", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return {
					sServiceUrl: "/sap/opu/odata",
					isA: () => false,
					getODataEntityContainer: () => {
						return {
							entitySet: [{ name: "CashBank", entityType: "com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType" }]
						};
					},
					getODataEntityType: (path: string) => {
						return {
							key: {
								propertyRef: [
									{
										name: "BankCountry"
									},
									{
										name: "BankInternalID"
									},
									{
										name: "IsActiveEntity"
									}
								]
							},
							property: [
								{
									name: "BankCountry",
									type: "Edm.String",
									nullable: "false",
									"sap:label": "Bank Country",
									kind: "Property"
								},
								{
									name: "BankInternalID",
									type: "Edm.Guid",
									nullable: "false",
									"sap:label": "Bank Internal ID",
									kind: "Property"
								},
								{
									name: "IsActiveEntity",
									type: "Edm.Boolean",
									nullable: "false",
									"sap:label": "Is Active Entity",
									kind: "Property"
								}
							]
						};
					},
					getODataAssociationEnd: () => {},
					getODataEntitySet: (path: string) => {
						return {
							name: "CashBank",
							entityType: "com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType"
						};
					}
				};
			}
		};
		const path = "CashBank(BankInternalID=guid'005056a7-004e-1ed8-b2e0-081387831f0d',IsActiveEntity=true)";
		const expectedPath = "BankInternalID=guid'005056a7-004e-1ed8-b2e0-081387831f0d',IsActiveEntity=true";

		const updatedPath = await createContextParameter(path, mockMetaData, false);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createContextParameter for V2 data - with guid as context parameter", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return {
					sServiceUrl: "/sap/opu/odata",
					isA: () => false,
					getODataEntityContainer: () => {
						return {
							entitySet: [{ name: "CashBank", entityType: "com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType" }]
						};
					},
					getODataEntityType: (path: string) => {
						return {
							key: {
								propertyRef: [
									{
										name: "BankCountry"
									},
									{
										name: "BankInternalID"
									},
									{
										name: "IsActiveEntity"
									}
								]
							},
							property: [
								{
									name: "BankCountry",
									type: "Edm.String",
									nullable: "false",
									"sap:label": "Bank Country",
									kind: "Property"
								},
								{
									name: "BankInternalID",
									type: "Edm.Guid",
									nullable: "false",
									"sap:label": "Bank Internal ID",
									kind: "Property"
								},
								{
									name: "IsActiveEntity",
									type: "Edm.Boolean",
									nullable: "false",
									"sap:label": "Is Active Entity",
									kind: "Property"
								}
							]
						};
					},
					getODataAssociationEnd: () => {},
					getODataEntitySet: (path: string) => {
						return {
							name: "CashBank",
							entityType: "com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType"
						};
					}
				};
			}
		};

		expect(await createContextParameter("CashBank(BankInternalID=guid'0000000002')", mockMetaData, false)).toEqual(
			"BankInternalID=guid'0000000002'"
		);
		expect(await createContextParameter("CashBank(guid'0000000002')", mockMetaData, false)).toEqual("BankInternalID=guid'0000000002'");
	});
});
describe("getEntitySetWithObjectContext", () => {
	const ModelReadMock: jest.Mock = jest.fn((path, options) => {
		options.success({
			results: [
				{
					SalesPlanUUID: "fa163e3c-f83d-1ee9-a0a1-8f912f73bf72",
					IsActiveEntity: false
				},
				{
					SalesPlanUUID: "fa163e3c-f83d-1ee9-a0a1-8f912f73bf82",
					IsActiveEntity: true
				}
			]
		});
	});
	let originalFetch: typeof global.fetch;
	const fetchMock = jest.fn().mockResolvedValueOnce({
		ok: true,
		json: jest.fn().mockResolvedValueOnce({
			"sap.cards.ap": {
				embeds: {
					ObjectPage: {
						default: "C_SalesPlanTP"
					}
				}
			}
		})
	}) as jest.Mock;
	const sId = "testComponent2";
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
	rootComponent.getModel = jest.fn().mockReturnValue({
		getMetaModel: jest.fn().mockReturnValue({
			getODataEntitySet: jest.fn().mockReturnValue({
				entityType: "C_SalesPlanTP"
			}),
			getODataEntityType: jest.fn().mockReturnValue({
				key: {
					propertyRef: [
						{
							name: "SalesPlanUUID"
						},
						{
							name: "IsActiveEntity"
						}
					]
				},
				property: [
					{
						name: "SalesPlanUUID",
						type: "Edm.Guid"
					},
					{
						name: "IsActiveEntity",
						type: "Edm.Boolean"
					}
				]
			})
		}),
		isA: jest.fn().mockReturnValue(false),
		sServiceUrl: "/sap/opu/odata"
	});

	beforeAll(() => {
		originalFetch = global.fetch;
		global.fetch = fetchMock;
	});

	afterAll(() => {
		global.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	test("should return the entity set with object context for OData V2 Model", async () => {
		const originalRead = V2ODataModel.prototype.read;
		V2ODataModel.prototype.read = ModelReadMock;
		const entitySetWithObjectContext = await getEntitySetWithObjectContext(rootComponent, {
			isDesignMode: false,
			entitySet: "C_SalesPlanTP",
			keyParameters: {
				SalesPlanUUID: "fa163e3c-f83d-1ee9-a0a1-8f912f73bf72",
				IsActiveEntity: false
			}
		});
		expect(entitySetWithObjectContext).toEqual(
			"C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a0a1-8f912f73bf72',IsActiveEntity=false)"
		);
		expect(fetchMock).toHaveBeenCalledTimes(0);
		const entitySetWithObjectContextDesignMode = await getEntitySetWithObjectContext(rootComponent, {
			isDesignMode: true,
			entitySet: "C_SalesPlanTP",
			keyParameters: {
				SalesPlanUUID: "fa163e3c-f83d-1ee9-a0a1-8f912f73bf72",
				IsActiveEntity: false
			}
		});
		expect(entitySetWithObjectContextDesignMode).toEqual(
			"C_SalesPlanTP(SalesPlanUUID=guid'fa163e3c-f83d-1ee9-a0a1-8f912f73bf72',IsActiveEntity=false)"
		);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		V2ODataModel.prototype.read = originalRead;
	});

	test("should return the entity set with object context for OData V4 Model", async () => {
		const expectedValue = {
			value: [
				{
					SalesPlanUUID: "fa163e3c-f83d-1ee9-a09f-8091d302d596",
					IsActiveEntity: true
				},
				{
					SalesPlanUUID: "fa163e3c-f83d-1ee9-a0a1-8f912f73bf82",
					IsActiveEntity: false
				}
			]
		};
		let originalFetch = global.fetch;
		global.fetch = jest.fn(() =>
			Promise.resolve({
				json: () => Promise.resolve(expectedValue),
				ok: true
			})
		) as jest.Mock;

		rootComponent.getModel = jest.fn().mockReturnValue({
			getMetaModel: jest.fn().mockReturnValue({
				getObject: jest.fn().mockImplementation((path) => {
					if (path === "/C_SalesPlanTP") {
						return {
							$Type: "C_SalesPlanTPType"
						};
					}
					if (path === "/C_SalesPlanTPType") {
						return {
							SalesPlanUUID: {
								$Type: "Edm.Guid",
								$kind: "Property"
							},
							IsActiveEntity: {
								$Type: "Edm.Boolean",
								$kind: "Property"
							},
							$Key: ["SalesPlanUUID", "IsActiveEntity"]
						};
					}
				})
			}),
			isA: jest.fn().mockReturnValue(true),
			getServiceUrl: jest.fn().mockReturnValue("/sap/opu/odata")
		});
		const entitySetWithObjectContext = await getEntitySetWithObjectContext(rootComponent, {
			isDesignMode: false,
			entitySet: "C_SalesPlanTP",
			keyParameters: {
				SalesPlanUUID: "fa163e3c-f83d-1ee9-a09f-8091d302d596",
				IsActiveEntity: true
			}
		});
		expect(entitySetWithObjectContext).toEqual("C_SalesPlanTP(SalesPlanUUID=fa163e3c-f83d-1ee9-a09f-8091d302d596,IsActiveEntity=true)");
		global.fetch = originalFetch;
	});
});
