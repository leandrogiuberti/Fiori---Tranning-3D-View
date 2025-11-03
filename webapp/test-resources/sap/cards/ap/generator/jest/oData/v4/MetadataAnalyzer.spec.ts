/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import path from "path";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import {
	getEntityNames,
	getNavigationPropertyInfoFromEntity,
	getPropertyInfoFromEntity,
	getPropertyReferenceKey
} from "sap/cards/ap/generator/odata/v4/MetadataAnalyzer";
import { compileCDS, getMetaModel } from "sap/cards/ap/test/JestHelper";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

describe("Card CardGenerator", () => {
	let mockMetaData: any;
	let metaModel: ODataMetaModel;
	beforeAll(async () => {
		const sMetadataUrl = compileCDS(path.join(`${__dirname}`, "../../fixtures/Sample.cds"), { odataFormat: "structured" });
		metaModel = await getMetaModel(sMetadataUrl);
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

	test("validate function getPropertyReferenceKey", () => {
		const keyReferenceProperties = getPropertyReferenceKey(mockMetaData, "CashBank");
		expect(keyReferenceProperties).toMatchSnapshot();
	});

	test("validate function getEntityNames", () => {
		const keyReferenceProperties = getEntityNames(mockMetaData);
		expect(keyReferenceProperties).toStrictEqual(["CashBank"]);
	});

	test("validate function getPropertyInfoFromEntity", () => {
		const properties = getPropertyInfoFromEntity(mockMetaData, "CashBank", false);
		expect(properties).toMatchSnapshot();
	});

	test("validate function getPropertyInfoFromEntity with navigation", () => {
		const resourceBundle = {
			getText: jest.fn().mockImplementation((key) => {
				if (key === "GENERATOR_CARD_SELECT_NAV_PROP") return "Select a Navigational Property:";
				if (key === "CRITICALITY_CONTROL_SELECT_PROP") return "Select a Property:";
			})
		} as unknown as ResourceBundle;
		const properties = getPropertyInfoFromEntity(mockMetaData, "CashBank", true, resourceBundle);
		expect(properties).toMatchSnapshot();
	});

	test("validate function getNavigationPropertyInfoFromEntity", () => {
		const mockAnnotations: Record<string, any> = {
			$NavigationPropertyBinding: {
				referencedTestEntities: "RootElement",
				_RootPaymentTerms: "RootPaymentTerms",
				DraftAdministrativeData: "RootPaymentTerms",
				SiblingEntity: "RootElement"
			},
			_RootPaymentTerms: {
				$kind: "NavigationProperty",
				$Type: "com.sap.gateway.srvd.ui_cashbank_manage.v0001.CashBankType",
				$ReferentialConstraint: {
					RootPaymentTerms: "RootPaymentTerms"
				}
			}
		};

		mockMetaData.getMetaModel = jest.fn(() => ({
			getObject: jest.fn((sParam: string) => {
				if (sParam.includes("/")) {
					return mockAnnotations;
				}
			})
		}));

		const properties = getNavigationPropertyInfoFromEntity(mockMetaData, "CashBank");
		expect(properties).toMatchSnapshot();
	});
});
