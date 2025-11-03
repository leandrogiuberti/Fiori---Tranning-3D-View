/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import * as CardGenerator from "sap/cards/ap/generator/CardGenerator";
import { Application } from "sap/cards/ap/generator/pages/Application";
import Component from "sap/ui/core/Component";
import Fragment from "sap/ui/core/Fragment";

declare namespace sap {
	export namespace jest {
		function resolvePath(path: string): string;
	}
}

jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/app/CardGeneratorDialogController"), () => {
	return {
		CardGeneratorDialogController: {
			initialize: jest.fn()
		},
		setValueStateForAdvancedPanel: jest.fn()
	};
});

jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/CardGeneratorModel"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/helpers/CardGeneratorModel")),
		getCardGeneratorDialogModel: jest.fn().mockReturnValue(
			Promise.resolve({
				getProperty: jest.fn().mockReturnValue({})
			}) as any
		)
	};
});
jest.mock(sap.jest.resolvePath("sap/cards/ap/common/services/RetrieveCard"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/common/services/RetrieveCard")),
		getObjectPageCardManifestForPreview: jest.fn().mockReturnValue(Promise.resolve({}) as any)
	};
});
jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/odata/ODataUtils"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/odata/ODataUtils")),
		createPathWithEntityContext: jest
			.fn()
			.mockReturnValue(Promise.resolve("salesOrderManage(salesOrder=1234,IsActiveEntity=true)") as any)
	};
});
jest.mock(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper"), () => {
	return {
		...jest.requireActual(sap.jest.resolvePath("sap/cards/ap/generator/helpers/IntegrationCardHelper")),
		createInitialManifest: jest.fn(),
		renderCardPreview: jest.fn(),
		addQueryParametersToManifest: jest.fn(),
		createCardManifest: jest.fn().mockReturnValue(Promise.resolve({}) as any),
		updateCardGroups: jest.fn()
	};
});

describe("cardGenerator - initializeAsync", () => {
	afterEach(() => {
		jest.clearAllMocks();
		Application.getInstance()._resetInstance();
	});

	it("should not create the cardGeneratorDialog instance if entityset and object context are missing", async () => {
		let appComponent = new Component() as jest.Mocked<Component>;
		let setModelMock: jest.Mock = jest.fn();
		let getModelMock: jest.Mock = jest.fn().mockReturnValue(false);
		appComponent.getModel = jest.fn().mockReturnValue({
			isA: jest.fn().mockReturnValue(false),
			sServiceUrl: "/sap/opu/odata"
		});
		appComponent.getManifestEntry = jest.fn().mockReturnValue({});
		const originalHasher = window.hasher;
		window.hasher = {
			getHash: jest.fn().mockReturnValue(""),
			setHash: jest.fn()
		} as any;

		Fragment.load = jest.fn().mockResolvedValue(
			Promise.resolve({
				setBindingContext: jest.fn(),
				setModel: setModelMock,
				getModel: getModelMock,
				open: jest.fn()
			})
		);
		await CardGenerator.initializeAsync(appComponent);
		expect(Fragment.load).toHaveBeenCalledTimes(0);
		expect(setModelMock).toHaveBeenCalledTimes(0);
		expect(getModelMock).toHaveBeenCalledTimes(0);
		window.hasher = originalHasher;
	});

	it("should create cardGeneratorDialog instance for ObjectPage application", async () => {
		let setModelMock: jest.Mock = jest.fn();
		let getModelMock: jest.Mock = jest.fn().mockReturnValue(false);
		let appComponent = new Component() as jest.Mocked<Component>;
		appComponent.getModel = jest.fn().mockReturnValue({
			isA: jest.fn().mockReturnValue(false),
			sServiceUrl: "/sap/opu/odata"
		});
		appComponent.getManifestEntry = jest.fn().mockReturnValue("sap.ui.generic.app");
		const originalHasher = window.hasher;
		window.hasher = {
			getHash: jest.fn().mockReturnValue("Cards-generator&/salesOrderManage(salesOrder=1234,IsActiveEntity=true)"),
			setHash: jest.fn()
		} as any;

		Fragment.load = jest.fn().mockResolvedValue(
			Promise.resolve({
				setBindingContext: jest.fn(),
				setModel: setModelMock,
				getModel: getModelMock,
				open: jest.fn()
			})
		);
		await CardGenerator.initializeAsync(appComponent);
		expect(Fragment.load).toHaveBeenCalledTimes(1);
		expect(setModelMock).toHaveBeenCalledTimes(4);
		expect(getModelMock).toHaveBeenCalledTimes(2);
		expect(getModelMock).toHaveBeenCalledWith("i18n");
		window.hasher = originalHasher;
	});
});
