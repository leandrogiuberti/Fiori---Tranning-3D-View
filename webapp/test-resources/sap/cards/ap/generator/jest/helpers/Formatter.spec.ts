/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import {
	createFormatterExpression,
	getDefaultPropertyFormatterConfig,
	getDefaultPropertyFormatterConfigForNavProperties,
	processParameters,
	processProperties,
	type FormatterConfiguration,
	type FormatterOption,
	type FormatterOptions,
	type SingleFormatterParameter,
	type SingleFormatterProperty
} from "sap/cards/ap/generator/helpers/Formatter";

const mI18nMap: {
	[key: string]: string;
} = {
	FORMAT_DATETIME: "Date Time",
	RELATIVE: "Relative",
	UTC: "UTC",
	FORMAT_DATE: "Date"
};

// TODO: Set some default timezone for utc test case
describe("getDefaultPropertyFormatterConfig", () => {
	let oResourceBundle;
	beforeAll(() => {
		oResourceBundle = {
			getText: (key: string) => {
				return mI18nMap[key];
			}
		};
	});

	afterAll(() => {
		oResourceBundle = null;
	});

	test("Get default config for DateTimeOffset type", () => {
		const properties = [
			{
				label: "Created On",
				type: "Edm.DateTimeOffset",
				name: "CreatedOn"
			}
		];
		const expectedResult = [
			{
				formatterName: "format.dateTime",
				parameters: [
					{
						defaultValue: "",
						displayName: "Options",
						name: "options",
						properties: [
							{
								defaultValue: false,
								displayName: "Relative",
								name: "relative",
								type: "boolean"
							},
							{
								defaultValue: false,
								displayName: "UTC",
								name: "UTC",
								selected: true,
								type: "boolean"
							}
						],
						type: "object"
					}
				],
				property: "CreatedOn",
				type: "Date",
				visible: true
			}
		];
		const config = getDefaultPropertyFormatterConfig(oResourceBundle, properties);
		expect(config).toMatchObject(expectedResult);
	});

	test("Get default config for DateTime type", () => {
		const properties = [
			{
				label: "Created On",
				type: "Edm.DateTime",
				name: "CreatedOn"
			}
		];
		const expectedResult = [
			{
				formatterName: "format.date",
				parameters: [
					{
						defaultValue: "",
						displayName: "Options",
						name: "options",
						properties: [
							{
								defaultValue: false,
								displayName: "UTC",
								name: "UTC",
								selected: true,
								type: "boolean"
							}
						],
						type: "object"
					}
				],
				property: "CreatedOn",
				type: "Date",
				visible: true
			}
		];
		const config = getDefaultPropertyFormatterConfig(oResourceBundle, properties);
		expect(config).toMatchObject(expectedResult);
	});

	test("Get default config for multiple properties", () => {
		const properties = [
			{
				label: "Updated On",
				type: "Edm.DateTimeOffset",
				name: "UpdatedOn"
			},
			{
				label: "Created On",
				type: "Edm.DateTime",
				name: "CreatedOn"
			},
			{
				label: "Is Active",
				type: "Edm.Boolean",
				name: "IsActive"
			}
		];
		const expectedResult = [
			{
				formatterName: "format.dateTime",
				parameters: [
					{
						defaultValue: "",
						displayName: "Options",
						name: "options",
						properties: [
							{
								defaultValue: false,
								displayName: "Relative",
								name: "relative",
								type: "boolean"
							},
							{
								defaultValue: false,
								displayName: "UTC",
								name: "UTC",
								selected: true,
								type: "boolean"
							}
						],
						type: "object"
					}
				],
				property: "UpdatedOn",
				type: "Date",
				visible: true
			},
			{
				formatterName: "format.date",
				parameters: [
					{
						defaultValue: "",
						displayName: "Options",
						name: "options",
						properties: [
							{
								defaultValue: false,
								displayName: "UTC",
								name: "UTC",
								selected: true,
								type: "boolean"
							}
						],
						type: "object"
					}
				],
				property: "CreatedOn",
				type: "Date",
				visible: true
			}
		];
		const config = getDefaultPropertyFormatterConfig(oResourceBundle, properties);
		expect(config).toMatchObject(expectedResult);
	});
});

describe("createFormatterExpression", () => {
	test("Create formatter expression with properties", () => {
		let formatterDetail = {
			formatterName: "format.float",
			displayName: "Float",
			parameters: [
				{
					name: "options",
					displayName: "Options",
					type: "object",
					defaultValue: "",
					properties: [
						{
							name: "decimals",
							displayName: "Decimals",
							type: "number",
							defaultValue: 2,
							value: 2
						},
						{
							name: "style",
							displayName: "Style",
							type: "enum",
							defaultSelectedKey: "short",
							options: [
								{
									value: "short",
									name: "Short"
								},
								{
									value: "long",
									name: "Long"
								}
							],
							selectedKey: "short"
						}
					]
				}
			],
			type: "numeric",
			visible: false,
			property: "net_amount"
		} as FormatterConfiguration;
		let result = createFormatterExpression(formatterDetail);
		expect(result).toMatchSnapshot();

		formatterDetail = {
			formatterName: "format.float",
			displayName: "Float",
			parameters: [
				{
					name: "options",
					displayName: "Options",
					type: "object",
					defaultValue: "",
					properties: [
						{
							name: "decimals",
							displayName: "Decimals",
							type: "number",
							defaultValue: 2,
							value: 0
						},
						{
							name: "style",
							displayName: "Style",
							type: "enum",
							defaultSelectedKey: "short",
							options: [
								{
									value: "short",
									name: "Short"
								},
								{
									value: "long",
									name: "Long"
								}
							],
							selectedKey: "long"
						}
					]
				}
			],
			type: "numeric",
			visible: false,
			property: "net_amount"
		} as FormatterConfiguration;
		result = createFormatterExpression(formatterDetail);
		expect(result).toMatchSnapshot();
	});
});

describe("getDefaultPropertyFormatterConfigForNavProperties", () => {
	let oResourceBundle;
	beforeAll(() => {
		oResourceBundle = {
			getText: (key: string) => {
				return mI18nMap[key];
			}
		};
	});

	afterAll(() => {
		oResourceBundle = null;
	});

	test("Validate if the date FormatterConfigurations are getting updated correctly for the navProperties provided", () => {
		const navProperties = [
			{
				name: "DraftAdministrativeData",
				properties: [
					{
						label: "Created At",
						type: "Edm.TimeOfDay",
						name: "CreatedAt"
					},
					{
						label: "Draft Created On",
						type: "Edm.DateTimeOffset",
						name: "CreationDateTime"
					}
				]
			},
			{
				name: "to_BPAContact",
				properties: [
					{
						label: "Lng",
						type: "Edm.String",
						name: "Language"
					},
					{
						label: "Date of Birth",
						type: "Edm.DateTime",
						name: "DateOfBirth"
					},
					{
						label: "Change At",
						type: "Edm.Date",
						name: "ChangeAt"
					}
				]
			},
			{
				name: "to_DeliveryStatus",
				properties: [
					{
						label: "Lower Value",
						type: "Edm.String",
						name: "Status"
					},
					{
						label: "Delivery Status",
						type: "Edm.String",
						name: "Status_Text"
					}
				]
			}
		];
		const result = getDefaultPropertyFormatterConfigForNavProperties(oResourceBundle, navProperties);
		expect(result).toMatchSnapshot();
	});
});

describe("processParameters", () => {
	let formatterArguments: FormatterOption[];

	beforeEach(() => {
		formatterArguments = [];
	});

	test("should process boolean type parameter", () => {
		const parameters = { type: "boolean", selected: true } as SingleFormatterParameter;
		processParameters(parameters, formatterArguments);
		expect(formatterArguments).toEqual([true]);
	});

	test("should process boolean type parameter with default value when selected value is not defined", () => {
		const parameters = { type: "boolean", selected: undefined } as SingleFormatterParameter;
		processParameters(parameters, formatterArguments);
		expect(formatterArguments).toEqual([false]);
	});

	test("should process number type parameter", () => {
		const parameters = { type: "number", value: "123.45" } as SingleFormatterParameter;
		processParameters(parameters, formatterArguments);
		expect(formatterArguments).toEqual([123.45]);
	});

	test("should not process number type parameter with empty or undefined value", () => {
		const parameters = { type: "number", value: "" } as SingleFormatterParameter;
		processParameters(parameters, formatterArguments);
		expect(formatterArguments).toEqual([]);
		const parameters1 = { type: "number", value: undefined } as SingleFormatterParameter;
		processParameters(parameters1, formatterArguments);
		expect(formatterArguments).toEqual([]);
	});

	test("should process enum parameter", () => {
		const parameters = { type: "enum", selectedKey: "short" } as SingleFormatterParameter;
		processParameters(parameters, formatterArguments);
		expect(formatterArguments).toEqual(["short"]);
	});

	test("should process default parameter", () => {
		const parameters = { type: "string", value: "value1" } as SingleFormatterParameter;
		processParameters(parameters, formatterArguments);
		expect(formatterArguments).toEqual(["value1"]);
	});
});

describe("processProperties", () => {
	let formatterOptions: FormatterOptions;

	beforeEach(() => {
		formatterOptions = {};
	});

	test("should process boolean type property", () => {
		const properties = [{ type: "boolean", name: "isEnabled", selected: true }] as SingleFormatterProperty[];
		processProperties(properties, formatterOptions);
		expect(formatterOptions).toEqual({ isEnabled: true });
	});

	test("should process boolean type property with default value when selected value is not defined", () => {
		const properties = [{ type: "boolean", name: "isEnabled", selected: undefined }] as SingleFormatterProperty[];
		processProperties(properties, formatterOptions);
		expect(formatterOptions).toEqual({ isEnabled: false });
	});

	test("should process number type property", () => {
		const properties = [{ type: "number", name: "threshold", value: 123.45 }] as unknown as SingleFormatterProperty[];
		processProperties(properties, formatterOptions);
		expect(formatterOptions).toEqual({ threshold: 123.45 });
	});

	test("should not process number type property with non-number value", () => {
		const properties = [{ type: "number", name: "threshold", value: "invalid" }] as SingleFormatterProperty[];
		processProperties(properties, formatterOptions);
		expect(formatterOptions).toEqual({});
	});

	test("should process enum type property", () => {
		const properties = [{ type: "enum", name: "status", selectedKey: "Rejected" }] as SingleFormatterProperty[];
		processProperties(properties, formatterOptions);
		expect(formatterOptions).toEqual({ status: "Rejected" });
	});

	test("should process default type property", () => {
		const properties = [{ type: "string", name: "defaultValue", value: "1234" }] as SingleFormatterProperty[];
		processProperties(properties, formatterOptions);
		expect(formatterOptions).toEqual({ defaultValue: "1234" });
	});

	test("should process default type property with undefined value", () => {
		const properties = [{ type: "string", name: "label", value: undefined }] as SingleFormatterProperty[];
		processProperties(properties, formatterOptions);
		expect(formatterOptions).toEqual({ label: "" });
	});
});
