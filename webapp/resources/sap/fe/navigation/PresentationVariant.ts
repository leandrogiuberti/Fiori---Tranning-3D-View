import Log from "sap/base/Log";
import BaseObject from "sap/ui/base/Object";
import NavError from "./NavError";
/**
 * Structure of a visualization object
 * @alias sap.fe.navigation.PresentationVariant.Visualization
 * @public
 */
export type Visualization = {
	/**
	 * Defines key.
	 */
	[key: string]: unknown;
	/**
	 * Defines type of the object.
	 * @public
	 */
	Type?: string;
	/**
	 * Defines content of the object.
	 * @public
	 */
	Content?: VisContentType[] | VisChartContent;
};
/**
 * Structure of a visualization object
 * @alias sap.fe.navigation.PresentationVariant.VisChartContent
 * @public
 */
export type VisChartContent = {
	/**
	 * Defines chart type.
	 * @public
	 */
	ChartType: string;
	/**
	 * Defines dimensions.
	 * @public
	 */
	Dimensions: string[];
	/**
	 * Defines dimension attributes.
	 * @public
	 */
	DimensionAttributes: DimensionType[];
	/**
	 * Defines measures.
	 * @public
	 */
	Measures: string[];
	/**
	 * Defines measure attributes.
	 * @public
	 */
	MeasureAttributes: MeasureType[];
};
/**
 * Structure of measure type
 * @alias sap.fe.navigation.PresentationVariant.MeasureType
 * @public
 */
export type MeasureType = {
	/**
	 * Defines measure.
	 * @public
	 */
	Measure: string;
	/**
	 * Defines role.
	 * @public
	 */
	Role: string;
};
/**
 * Structure of dimension type
 * @alias sap.fe.navigation.PresentationVariant.DimensionType
 * @public
 */
export type DimensionType = {
	/**
	 * Defines dimension.
	 * @public
	 */
	Dimension: string;
	/**
	 * Defines role.
	 * @public
	 */
	Role: string;
};
export type PvProperties = {
	Contexturl?: string;
	MaxItems?: number;
	SortOrder?: SortOrder[];
	GroupBy?: string[];
	Aggregations?: Aggregation;
	initialExpansionLevel?: number;
};

export type Aggregation = Record<string, { aggregated?: boolean }>;

export type SortOrder = {
	Property: string;
	Descending: boolean;
};
/**
 * Structure of the external plain object representation of a PresentationVariant
 * @alias sap.fe.navigation.PresentationVariant.ExternalPresentationVariant
 * @public
 */
export type ExternalPresentationVariant = {
	/**
	 * Defines the key.
	 */
	[key: string]: unknown;
	/**
	 * Defines presentation variant ID.
	 * @public
	 */
	PresentationVariantID: string;
	/**
	 * Defines version.
	 * @public
	 */
	Version?: {
		Major: string;
		Minor: string;
		Patch: string;
	};
	/**
	 * Defines text.
	 * @public
	 */
	Text?: string;
	/**
	 * Defines context URL.
	 * @public
	 */
	ContextUrl?: string;
	/**
	 * Defines visualizations.
	 * @public
	 */
	Visualizations?: Visualization[];
};
/**
 * Structure of the external plain object representation of a PresentationVariant
 * @alias sap.fe.navigation.PresentationVariant.VisContentType
 * @public
 */
export type VisContentType = {
	/**
	 * Defines value.
	 * @public
	 */
	Value: string;
};
/**
 * This is the successor of {@link sap.ui.generic.app.navigation.service.PresentationVariant}.<br> Creates a new instance of a PresentationVariant class. If no parameter is passed, an new empty instance is created whose ID has been set to <code>""</code>. Passing a JSON-serialized string complying to the Selection Variant Specification will parse it, and the newly created instance will contain the same information.
 * @public
 * @since 1.83.0
 */
export class PresentationVariant extends BaseObject {
	private id: string;

	private text?: string;

	private ctxUrl?: string;

	private properties?: object;

	private visTable?: Visualization;

	private visChart?: Visualization;

	/**
	 * If no parameter is passed, a new empty instance is created whose ID has been set to <code>""</code>.
	 * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it,
	 * and the newly created instance will contain the same information.
	 * @param presentationVariant If of type <code>string</code>, the selection variant is JSON-formatted;
	 * if of type <code>object</code>, the object represents a selection variant
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that the data format of the selection variant provided is inconsistent</td></tr>
	 * <tr><td>PresentationVariant.UNABLE_TO_PARSE_INPUT</td><td>Indicates that the provided string is not a JSON-formatted string</td></tr>
	 * <tr><td>PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>Indicates that the PresentationVariantID cannot be retrieved</td></tr>
	 * <tr><td>PresentationVariant.PARAMETER_WITHOUT_VALUE</td><td>Indicates that there was an attempt to specify a parameter, but without providing any value (not even an empty value)</td></tr>
	 * <tr><td>PresentationVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>Indicates that a selection option has been defined, but the Ranges definition is missing</td></tr>
	 * <tr><td>PresentationVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>Indicates that the Ranges definition is not an array</td></tr>
	 * </table>
	 * These exceptions can only be thrown if the parameter <code>vPresentationVariant</code> has been provided.
	 */
	public constructor(presentationVariant?: string | object) {
		super();
		this.id = "";
		if (presentationVariant !== undefined) {
			if (typeof presentationVariant === "string") {
				this.parseFromString(presentationVariant);
			} else if (typeof presentationVariant === "object") {
				this.parseFromObject(presentationVariant);
			} else {
				throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
			}
		}
	}

	/**
	 * Returns the identification of the selection variant.
	 * @returns The identification of the selection variant as made available during construction
	 * @public
	 */
	public getID(): string {
		return this.id;
	}

	/**
	 * Sets the identification of the selection variant.
	 * @param id The new identification of the selection variant
	 * @public
	 */
	setID(id: string): void {
		this.id = id;
	}

	/**
	 * Sets the text / description of the selection variant.
	 * @param newText The new description to be used
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * </table>
	 */
	setText(newText?: string): void {
		if (typeof newText !== "string") {
			throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
		}
		this.text = newText;
	}

	/**
	 * Returns the current text / description of this selection variant.
	 * @returns The current description of this selection variant.
	 * @public
	 */
	getText(): string | undefined {
		return this.text;
	}

	/**
	 * Sets the context URL.
	 * @param url The URL of the context
	 * @public
	 * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
	 * <table>
	 * <tr><th>NavError code</th><th>Description</th></tr>
	 * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
	 * </table>
	 */
	setContextUrl(url: string): void {
		if (typeof url !== "string") {
			throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
		}
		this.ctxUrl = url;
	}

	/**
	 * Gets the current context URL intended for the query.
	 * @returns The current context URL for the query
	 * @public
	 */
	getContextUrl(): string | undefined {
		return this.ctxUrl;
	}

	/**
	 * Returns <code>true</code> if the presentation variant does not contain any properties.
	 * nor ranges.
	 * @returns If set to <code>true</code> there are no current properties set; <code>false</code> otherwise.
	 * @public
	 */
	isEmpty(): boolean {
		return (
			Object.keys(this.getTableVisualization() ?? {}).length === 0 &&
			Object.keys(this.getChartVisualization() ?? {}).length === 0 &&
			Object.keys(this.getProperties() ?? {}).length === 0
		);
	}

	/**
	 * Sets the more trivial properties. Basically all properties with the exception of the Visualization.
	 * @param properties The properties to be used.
	 * @public
	 */
	setProperties(properties: object): void {
		this.properties = Object.assign({}, properties);
	}

	/**
	 * Gets the more trivial properties. Basically all properties with the exception of the Visualization.
	 * @returns The current properties.
	 * @public
	 */
	getProperties(): PvProperties | undefined {
		return this.properties;
	}

	/**
	 * Sets the table visualization property.
	 * @param properties An object containing the properties to be used for the table visualization.
	 * @public
	 */
	setTableVisualization(properties: Visualization): void {
		this.visTable = Object.assign({}, properties);
	}

	/**
	 * Gets the table visualization property.
	 * @returns An object containing the properties to be used for the table visualization.
	 * @public
	 */
	getTableVisualization(): Visualization | undefined {
		return this.visTable;
	}

	/**
	 * Sets the chart visualization property.
	 * @param properties An object containing the properties to be used for the chart visualization.
	 * @public
	 */
	setChartVisualization(properties: Visualization): void {
		this.visChart = Object.assign({}, properties);
	}

	/**
	 * Gets the chart visualization property.
	 * @returns An object containing the properties to be used for the chart visualization.
	 * @public
	 */
	getChartVisualization(): Visualization | undefined {
		return this.visChart;
	}

	/**
	 * Returns the external representation of the selection variant as JSON object.
	 * @returns The external representation of this instance as a JSON object
	 * @public
	 */
	toJSONObject(): ExternalPresentationVariant {
		const externalPresentationVariant: ExternalPresentationVariant = {
			Version: {
				// Version attributes are not part of the official specification,
				Major: "1", // but could be helpful later for implementing a proper lifecycle/interoperability
				Minor: "0",
				Patch: "0"
			},
			PresentationVariantID: this.id
		};
		if (this.ctxUrl) {
			externalPresentationVariant.ContextUrl = this.ctxUrl;
		}
		if (this.text) {
			externalPresentationVariant.Text = this.text;
		} else {
			externalPresentationVariant.Text = "Presentation Variant with ID " + this.id;
		}
		this.serializeProperties(externalPresentationVariant);
		this.serializeVisualizations(externalPresentationVariant);
		return externalPresentationVariant;
	}

	/**
	 * Serializes this instance into a JSON-formatted string.
	 * @returns The JSON-formatted representation of this instance in stringified format
	 * @public
	 */
	toJSONString(): string {
		return JSON.stringify(this.toJSONObject());
	}

	private serializeProperties(externalPresentationVariant: ExternalPresentationVariant): void {
		if (this.properties) {
			Object.assign(externalPresentationVariant, this.properties);
		}
	}

	private serializeVisualizations(externalPresentationVariant: ExternalPresentationVariant): void {
		if (this.visTable) {
			if (!externalPresentationVariant.Visualizations) {
				externalPresentationVariant.Visualizations = [];
			}
			externalPresentationVariant.Visualizations.push(this.visTable);
		}
		if (this.visChart) {
			if (!externalPresentationVariant.Visualizations) {
				externalPresentationVariant.Visualizations = [];
			}
			externalPresentationVariant.Visualizations.push(this.visChart);
		}
	}

	private parseFromString(jsonString?: string): void {
		if (jsonString === undefined) {
			throw new NavError("PresentationVariant.UNABLE_TO_PARSE_INPUT");
		}
		if (typeof jsonString !== "string") {
			throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
		}
		this.parseFromObject(JSON.parse(jsonString));
	}

	private parseFromObject(input: Partial<ExternalPresentationVariant>): void {
		if (input.PresentationVariantID === undefined) {
			// Do not throw an error, but only write a warning into the log.
			// The PresentationVariantID is mandatory according to the specification document version 1.0,
			// but this document is not a universally valid standard.
			// It is said that the "implementation of the SmartFilterBar" may supersede the specification.
			// Thus, also allow an initial PresentationVariantID.
			//		throw new sap.fe.navigation.NavError("PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID");
			Log.warning("PresentationVariantID is not defined");
			input.PresentationVariantID = "";
		}
		const inputCopy = Object.assign({}, input);
		delete inputCopy.Version;
		this.setID(input.PresentationVariantID);
		delete inputCopy.PresentationVariantID;
		if (input.ContextUrl !== undefined && input.ContextUrl !== "") {
			this.setContextUrl(input.ContextUrl);
			delete input.ContextUrl;
		}
		if (input.Text !== undefined) {
			this.setText(input.Text);
			delete input.Text;
		}
		if (input.Visualizations) {
			this.parseVisualizations(input.Visualizations);
			delete inputCopy.Visualizations;
		}
		this.setProperties(inputCopy);
	}

	private parseVisualizations(visualizations: Visualization[]): void {
		if (!Array.isArray(visualizations)) {
			throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
		}
		for (const visualization of visualizations) {
			if (visualization?.Type && visualization.Type.includes("Chart")) {
				this.setChartVisualization(visualization);
			} else {
				this.setTableVisualization(visualization);
			}
		}
	}
}
// Exporting the class as properly typed UI5Class
const UI5Class = BaseObject.extend(
	"sap.fe.navigation.PresentationVariant",
	PresentationVariant.prototype as any
) as typeof PresentationVariant;
type UI5Class = InstanceType<typeof PresentationVariant>;
export default UI5Class;
