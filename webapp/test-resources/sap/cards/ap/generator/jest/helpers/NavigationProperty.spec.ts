/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { getNavigationPropertiesWithLabel, updateNavigationPropertiesWithLabel } from "sap/cards/ap/generator/helpers/NavigationProperty";
import { Application } from "sap/cards/ap/generator/pages/Application";
import { ObjectPage } from "sap/cards/ap/generator/pages/ObjectPage";
import UIComponent from "sap/ui/core/UIComponent";

declare namespace sap {
	export namespace jest {
		function resolvePath(path: string): string;
	}
}

jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/odata/ODataUtils"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/odata/ODataUtils")),
		fetchDataAsync: jest.fn().mockResolvedValue({
			someNavigationProperty: {
				Status: "O",
				Status_Text: "Open"
			}
		}),
		getNavigationPropertyInfoFromEntity: jest.fn().mockReturnValue([
			{
				name: "someNavigationProperty",
				properties: [
					{
						label: "Lower Value",
						type: "Edm.String",
						name: "Status"
					},
					{
						label: "Confirmation",
						type: "Edm.String",
						name: "Status_Text"
					}
				]
			}
		])
	};
});

const sId = "testComponent";
const oManifest = {
	"sap.app": {
		id: sId,
		type: "application"
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
jest.spyOn(rootComponent, "getModel").mockImplementation(() => {
	return {
		sServiceUrl: "/sap/opu/odata",
		isA: () => false
	};
});

describe("getNavigationPropertiesWithLabel", () => {
	let windowSpy: jest.SpyInstance;

	beforeAll(() => {
		windowSpy = jest.spyOn(window, "window", "get");
		ObjectPage.createInstance(rootComponent);
	});

	afterAll(() => {
		windowSpy.mockRestore();
		Application.getInstance()._resetInstance();
	});

	test("should return properties with label and navigation property data", async () => {
		windowSpy.mockImplementation(() => ({
			hasher: {
				getHash: () => "test-intent&/testEntity(12345)"
			}
		}));

		const navigationProperty = "someNavigationProperty";
		const path = "/sap/opu/odata4/sap/c_salesordermanage_srv/srvd/sap/c_salesordermanage_sd/0001/";
		const result = await getNavigationPropertiesWithLabel(rootComponent, navigationProperty, path);
		expect(result).toMatchSnapshot();
	});
});

describe("updateNavigationPropertiesWithLabel", () => {
	test("should update navigation properties with label", () => {
		const navigationProperties = [
			{ name: "SalesOrderManage", properties: [] },
			{ name: "SalesOrderItem", properties: [] }
		];
		const propertiesWithLabel = [
			{ name: "created_at", label: "created at" },
			{ name: "netamount", label: "Net Amount" }
		];

		expect(navigationProperties[0].properties).toEqual([]);
		updateNavigationPropertiesWithLabel(navigationProperties, "SalesOrderManage", propertiesWithLabel);
		expect(navigationProperties[0].properties).toEqual(propertiesWithLabel);
		expect(navigationProperties[1].properties).toEqual([]);
		updateNavigationPropertiesWithLabel(navigationProperties, "SalesOrderItem", propertiesWithLabel);
		expect(navigationProperties[1].properties).toEqual(propertiesWithLabel);
	});

	test("should not update navigation properties if entity name does not match", () => {
		const navigationProperties = [
			{ name: "SalesOrderManage", properties: [] },
			{ name: "SalesOrderItem", properties: [] }
		];
		const propertiesWithLabel = [
			{ name: "created_at", label: "created at" },
			{ name: "netamount", label: "Net Amount" }
		];
		updateNavigationPropertiesWithLabel(navigationProperties, "entity3", propertiesWithLabel);
		expect(navigationProperties[0].properties).toEqual([]);
		expect(navigationProperties[1].properties).toEqual([]);
	});

	test("should not update navigation properties if propertiesWithLabel is empty", () => {
		const navigationProperties = [
			{ name: "SalesOrderManage", properties: [] },
			{ name: "SalesOrderItem", properties: [] }
		];

		updateNavigationPropertiesWithLabel(navigationProperties, "SalesOrderManage", []);
		expect(navigationProperties[0].properties).toEqual([]);
		expect(navigationProperties[1].properties).toEqual([]);
	});

	test("should not update navigation properties if navigationProperties is empty", () => {
		const navigationProperties = [];
		const propertiesWithLabel = [
			{ name: "created_at", label: "created at" },
			{ name: "netamount", label: "Net Amount" }
		];
		updateNavigationPropertiesWithLabel(navigationProperties, "SalesOrderManage", propertiesWithLabel);
		expect(navigationProperties).toEqual([]);
	});
});
