/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import path from "path";
import {
	createPathWithEntityContext,
	fetchDataAsyncV4,
	getLabelForEntitySet,
	getPropertyReference
} from "sap/cards/ap/generator/odata/ODataUtils";
import { compileCDS, getMetaModel } from "sap/cards/ap/test/JestHelper";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

describe("fetchDataAsyncV4", () => {
	let originalFetch: any;
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
				json: () => Promise.resolve(expectedValue)
			})
		) as jest.Mock;
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	test("fetchDataAsyncV4 - service URL ending with /", async () => {
		const result = await fetchDataAsyncV4(sUrl, sPath, {});
		expect(global.fetch).toHaveBeenCalledWith("https://url/test/Products?format=json");
		expect(result).toBe(expectedValue);
	});

	test("fetchDataAsyncV4 service URL ending without /", async () => {
		sUrl = "https://url/test";
		const result = await fetchDataAsyncV4(sUrl, sPath, {});
		expect(global.fetch).toHaveBeenCalledWith("https://url/test/Products?format=json");
		expect(result).toBe(expectedValue);
	});
});

describe("createPathWithEntityContext", () => {
	let metaModel: ODataMetaModel;
	let windowSpy: jest.SpyInstance;
	let originalFetch: any;
	const expectedValue = {
		value: [
			{
				BankCountry: "AD",
				IsActiveEntity: true
			}
		]
	};
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
	beforeAll(async () => {
		const sMetadataUrl = compileCDS(path.join(`${__dirname}`, "../fixtures/Sample.cds"), { odataFormat: "structured" });
		metaModel = await getMetaModel(sMetadataUrl);
	});
	afterAll(() => {
		jest.restoreAllMocks();
		global.fetch = originalFetch;
	});

	test("validate method createPathWithEntityContext for V4 data - with multiple context parameters", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return metaModel;
			},
			getContext: (path: string) => {
				return {
					getObject: () => {
						return {
							BankInternalID: "0000000002",
							IsActiveEntity: true,
							BankCountry: "AD"
						};
					}
				};
			}
		};
		const path = "CashBank(BankCountry='AD',BankInternalID='0000000002')";
		const expectedPath = "CashBank(BankCountry='AD',BankInternalID='0000000002',IsActiveEntity=true)";

		const updatedPath = await createPathWithEntityContext(path, mockMetaData, true);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createPathWithEntityContext for V4 data - with single context guid parameters", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return metaModel;
			},
			getContext: (path: string) => {
				return {
					getObject: () => {
						return {
							IsActiveEntity: true,
							BankCountry: "'AD'"
						};
					}
				};
			}
		};

		const path = "CashBank(BankCountry='AD')";
		const expectedPath = "CashBank(BankCountry='AD',IsActiveEntity=true)";
		const updatedPath = await createPathWithEntityContext(path, mockMetaData, true);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method getLabelForEntitySet and getPropertyReference for for V4 data", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return metaModel;
			},
			getContext: (path: string) => {
				return {
					getObject: () => {
						return {
							IsActiveEntity: true,
							BankCountry: "'AD'"
						};
					}
				};
			},
			isA: () => {
				return false;
			}
		};

		expect(getLabelForEntitySet(mockMetaData, "CashBank")).toEqual("CashBank");
		expect(getPropertyReference(mockMetaData, "CashBank")).toMatchSnapshot();
	});

	test("validate method createPathWithEntityContext for V2 data - with multiple context parameters", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return {
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
			},
			getObject: () => {
				return {
					BankInternalID: "0000000002",
					IsActiveEntity: true,
					BankCountry: "AD"
				};
			}
		};
		const path = "CashBank(BankInternalID=guid'0000000002',BankCountry='AD',IsActiveEntity=true)";
		const expectedPath = "CashBank(BankInternalID=guid'0000000002',BankCountry='AD',IsActiveEntity=true)";

		const updatedPath = await createPathWithEntityContext(path, mockMetaData, false);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method createPathWithEntityContext for V2 data - with single context guid parameter", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return {
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
			},
			getObject: () => {
				return {
					BankInternalID: "0000000002",
					IsActiveEntity: true,
					BankCountry: "AD"
				};
			}
		};
		const path = "CashBank(BankInternalID=guid'005056a7-004e-1ed8-b2e0-081387831f0d',IsActiveEntity=true)";
		const expectedPath = "CashBank(BankInternalID=guid'005056a7-004e-1ed8-b2e0-081387831f0d',IsActiveEntity=true)";

		const updatedPath = await createPathWithEntityContext(path, mockMetaData, false);
		expect(updatedPath).toEqual(expectedPath);
	});
	test("validate method createPathWithEntityContext for V2 data - with guid as context parameter", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return {
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
			},
			getObject: () => {
				return {
					BankInternalID: "0000000002",
					IsActiveEntity: true,
					BankCountry: "AD"
				};
			}
		};
		const path = "CashBank(id='0000000002')";
		const expectedPath = "CashBank(id='0000000002')";

		const updatedPath = await createPathWithEntityContext(path, mockMetaData, false);
		expect(updatedPath).toEqual(expectedPath);
	});

	test("validate method getLabelForEntitySet and getPropertyReference for V2 data", async () => {
		const mockMetaData = {
			getMetaModel: () => {
				return {
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
			},
			getObject: () => {
				return {
					BankInternalID: "0000000002",
					IsActiveEntity: true,
					BankCountry: "AD"
				};
			},
			isA: () => {
				return true;
			}
		};
		expect(getLabelForEntitySet(mockMetaData, "CashBank")).toEqual("CashBank");
		expect(getPropertyReference(mockMetaData, "CashBank")).toMatchSnapshot();
	});
});
