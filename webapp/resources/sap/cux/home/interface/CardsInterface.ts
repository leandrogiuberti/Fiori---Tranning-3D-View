/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import { TerminologyConfiguration } from "sap/base/i18n/ResourceBundle";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import JSONModel from "sap/ui/model/json/JSONModel";
import { EntitySet, EntityType, Property } from "sap/ui/model/odata/ODataMetaModel";
import { Intent } from "sap/ushell/services/AppLifeCycle";

export interface ICardHelper {
	getServiceAsync: () => Promise<ICardHelperInstance>;
}

export interface ICardHelperInstance {
	_getUserVisibleCardModel: (preferedCardIDs: string[]) => Promise<JSONModel>;
	_getUserAllCardModel: () => Promise<JSONModel>;
	handleDndCardsRanking: (iDragItemIndex: number, iDropItemIndex: number, aCards: ICard[]) => ICard[];
	_updateMultipleCards: (aCards: ICard[], sRequestMethod: string) => Promise<void>;
	_createCards: (aManifests: ICardManifest[]) => Promise<void>;
	_createCard: (oManifest: ICardManifest) => Promise<ICardManifest>;
	getParentAppDetails: (oCard: ICard) => Promise<ICardParentAppDetails>;
	processSemanticDate: (oParameter: object, oIntegrationCardManifest: object) => unknown;
	fetchAddCardInnerContent: (onCardGeneration: (event: Event<ICardManifest>) => void) => Promise<Control[]>;
	_updateCards: (aCards: (ICard | ICardManifest)[]) => Promise<void>;
	_refreshUserCards: (deleteAllCards: boolean) => Promise<void>;
	resetAddCardInnerContent: () => void;
}

export interface ICardParentAppDetails {
	semanticObject: string;
	action: string;
	semanticURL: string;
	title: string;
}

export interface ICard {
	id?: string;
	descriptorContent: ICardManifest;
	visibility?: boolean;
	rank?: string;
}

export interface ICardAction {
	type?: string;
	parameters: ICardActionParameters | string;
}

export interface ICardActionParameters {
	ibnTarget?: {
		semanticObject: string;
		action: string;
	};
	ibnParams?: Record<string, unknown>;
	sensitiveProps?: string[];
}

export interface ISapCardConfig {
	parameters?: {
		_semanticDateRangeSetting?: {
			value: string;
		};
		_relevantODataFilters: {
			value: unknown[];
		};
		_relevantODataParameters: {
			value: unknown[];
		};
		lineItemState?: {
			value: string;
		};
		state?: {
			value: string;
		};
		headerState?: {
			value: string;
		};
		contentState?: {
			value: string;
		};
	};
	csrfTokens?: unknown;
	[key: string]: unknown;
}
export interface ISapCard {
	type?: string;
	header?: {
		title?: string;
		actions?: ICardAction[];
		subTitle?: string;
		icon?: string;
		status?: {
			text?: string;
			state?: string;
		};
		data?: Record<string, unknown>;
	};
	content?: {
		item?: {
			actions: ICardAction[];
			attributes: {
				value: string;
				visible?: boolean;
				state?: string;
				showStateIcon?: string | boolean;
			}[];
			[key: string]: unknown;
		};
		data?: Record<string, unknown>;
		row?: {
			actions: ICardAction[];
		};
		actions?: ICardAction[];
		maxItems?: number;
	};
	rec?: boolean;
	configuration?: ISapCardConfig;
	extension?: string;
	data?: unknown;
}

export interface IRequestData {
	request: {
		url: string;
		method: string;
		headers: Record<string, string>;
		batch?: unknown;
	};
}

export interface ISapApp {
	id: string;
	title: string;
	subTitle: string;
	type: string;
	dataSources?: {
		[key: string]: {
			uri?: string;
			type?: string;
			annotations?: string[];
			settings?: {
				odataVersion: string;
				localUri: string;
				annotations?: string[];
			};
		};
	};
	i18n?: {
		bundleUrl: string;
		terminologies?: Record<string, TerminologyConfiguration>;
	};
	crossNavigation?: Record<string, unknown>;
}

export interface IResolutionResult {
	ui5ComponentName: string;
	applicationDependencies?: {
		manifest: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export type IAppInfo = Record<string, IAppInfoData[]>;

export interface IAppInfoData {
	semanticObject?: string;
	action?: string;
	resolutionResult?: IResolutionResult;
	fioriId?: string;
}

export interface ICardManifest {
	"sap.card"?: ISapCard;
	"sap.app"?: ISapApp;
	"sap.insights"?: {
		ranking?: string;
		parentAppId?: string;
		[key: string]: unknown;
	};
	"sap.ui5"?: ISapUI5App;
	"sap.ui"?: Record<string, unknown>;
	cacheType?: string;
}

type LineItemAnnotationType =
	| "SemanticObject"
	| "Action"
	| "Criticality"
	| "CriticalityRepresentation"
	| "com.sap.vocabularies.Common.v1.FieldControl"
	| "com.sap.vocabularies.UI.v1.Hidden"
	| "Target";

type LineItemObject = {
	[key in LineItemAnnotationType]?: {
		String?: string;
		Path?: string;
		EnumMember?: string;
		AnnotationPath?: string;
		Bool?: boolean | string;
	};
};

export interface ILineItemContextValue {
	Path?: string;
	Apply?: {
		Parameters: {
			Value?: Record<string, string>;
			[key: string]: unknown;
		}[];
	};
	[key: string]: unknown;
}

export interface ILineItemContext extends LineItemObject {
	Value?: ILineItemContextValue;
	Url?: ILineItemContextValue;
	Path?: string;
	EnumMember?: string;
	[key: string]: unknown;
}

export interface ILineItem extends LineItemObject {
	Value?: ILineItemContext;
	RecordType?: string;
	[key: string]: unknown;
}
export interface IVariantSetting {
	annotationPath?: string;
	entitySet?: string;
	isSmartChart?: boolean;
	tableSettings?: ITableSettings;
	[key: string]: unknown;
}

export interface ILrSettings {
	quickVariantSelectionX?: {
		variants?: Record<string, IVariantSetting>;
	};
	requestAtLeastFields?: string[] | { String?: string; PropertyPath?: string }[];
	tableSettings?: ITableSettings;
	isResponsiveTable?: boolean;
	bSupressCardRowNavigation?: boolean;
	tableType?: string;
	gridTable?: string;
	treeTable?: string;
	[key: string]: unknown;
}

export interface ITableSettings {
	type?: string;
	headerInfo?: Record<string, unknown> | string;
	addCardtoInsightsHidden?: boolean;
}

export interface IPresentationVariant {
	RequestAtLeast?: string[];
	requestAtLeastFields?: Record<string, unknown> | { Path: string } | string[] | { String?: string; PropertyPath?: string }[];
	Visualizations?: IUIVisualizations[];
	Path?: string;
	PresentationVariant?: IPresentationVariant;
	[key: string]: unknown;
}

export interface IHeaderInfo {
	TypeNamePlural?: {
		String: string;
	};
	[key: string]: unknown;
}

export interface ILineItemDetails {
	quickVariant: Record<string, unknown>;
	lrSettings: ILrSettings;
	lineItem: ILineItem[] | string | undefined;
	entitySet: string;
	headerInfo: IHeaderInfo | string;
	[key: string]: unknown;
}

export type IUIVisualizations = {
	lineItem: ILineItem[];
	annotationPath?: string;
	AnnotationPath?: string;
	sQualifier?: string;
	[key: string]: unknown;
};

export interface IVersionInfo {
	version: string;
	buildTimestamp: string;
}
export interface IPageType {
	component?: {
		name?: string;
		settings?: Partial<Pick<ILrSettings, "tableSettings" | "quickVariantSelectionX">>;
	};
	entitySet?: string | undefined;
	pages: IPageType[] | PageRecord;
	[key: string]: unknown;
}

export type PageRecord = {
	[key: string]: IPageType | string | boolean;
};

export interface IAppManifest {
	"sap.ui.generic.app"?: {
		pages: IPageType[] | PageRecord;
		[key: string]: unknown;
	};
	"sap.app"?: ISapApp;
	"sap.ui"?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface ISapUI5App {
	_version?: string;
	componentName?: string;
	dependencies?: {
		minUI5Version?: string;
		libs: {
			[key: string]: {
				lazy?: boolean;
			};
		};
	};
	contentDensities?: {
		compact: boolean;
		cozy: boolean;
	};
	[key: string]: unknown;
}

export interface IManifestCardData {
	cardTitle?: string;
	subTitle: string;
	url: string;
	semanticObject: string;
	action: string;
	id?: string;
	columns: IColumnData[];
	entitySet: string;
}

export interface IColumnData {
	path: string;
	type: string;
	value: string;
	identifier: string | boolean;
	state: string;
	showStateIcon: string | boolean;
	[key: string]: unknown;
}

export interface IRegeneratedCard {
	id: string;
	descriptorContent: ICardManifest;
}

export interface ICardDetails {
	cardId: string;
	rank?: string;
	id: string;
	target?: Partial<Intent>;
	index?: number;
	newManifest?: IRegeneratedCard;
}

export interface IEntitySet extends EntitySet {
	"Org.OData.Capabilities.V1.FilterRestrictions"?: {
		RequiredProperties?: unknown[];
	};
}

export enum UIAnnotations {
	SapSemantics = "sap:semantics",
	UITextArrangement = "com.sap.vocabularies.UI.v1.TextArrangement",
	UIHidden = "com.sap.vocabularies.UI.v1.Hidden",
	CommonLabel = "com.sap.vocabularies.Common.v1.Label",
	UIHeaderInfo = "com.sap.vocabularies.UI.v1.HeaderInfo",
	UISelectionPresentationVariant = "com.sap.vocabularies.UI.v1.SelectionPresentationVariant",
	UILineItem = "com.sap.vocabularies.UI.v1.LineItem",
	UIPresentationVariant = "com.sap.vocabularies.UI.v1.PresentationVariant",
	UIChart = "com.sap.vocabularies.UI.v1.Chart",
	MeasuresISOCurrency = "Org.OData.Measures.V1.ISOCurrency",
	MeasuresUnit = "Org.OData.Measures.V1.Unit",
	CommonFieldControl = "com.sap.vocabularies.Common.v1.FieldControl",
	UIIsImageURL = "com.sap.vocabularies.UI.v1.IsImageURL",
	CommonText = "com.sap.vocabularies.Common.v1.Text",
	CommonSemanticKey = "com.sap.vocabularies.Common.v1.SemanticKey"
}

// UI Text annotation type for Common.Text
interface UITextAnnotation {
	[UIAnnotations.UITextArrangement]?: Record<"EnumMember", string>;
}

type UIAnnotationValueBase = {
	[K in UIAnnotations]?: K extends UIAnnotations.CommonText ? StandardUIAnnotationValue & UITextAnnotation : StandardUIAnnotationValue;
};

export interface UIAnnotationValue extends UIAnnotationValueBase {
	"sap:text"?: string;
	type?: string;
	name?: string;
	[key: string]: unknown;
}

// Define special case annotations with their specific types
interface SpecialUIAnnotationValue {
	[UIAnnotations.UILineItem]?: Array<ILineItemContext>;
	[UIAnnotations.CommonSemanticKey]?: Array<{ PropertyPath: string }>;
	[UIAnnotations.UIPresentationVariant]?: IPresentationVariant;
	[UIAnnotations.UITextArrangement]?: Record<"EnumMember", string>;
	[UIAnnotations.SapSemantics]?: string;
}

// Create a type for standard annotations (excluding special cases)
type StandardUIAnnotations = {
	[K in Exclude<
		UIAnnotations,
		| UIAnnotations.UILineItem
		| UIAnnotations.CommonSemanticKey
		| UIAnnotations.UIPresentationVariant
		| UIAnnotations.SapSemantics
		| UIAnnotations.UITextArrangement
	>]?: StandardUIAnnotationValue;
};

interface StandardUIAnnotationValue {
	Bool?: string | boolean;
	Path?: string;
	PropertyPath?: string;
	String?: string;
	EnumMember?: string;
	[key: string]: unknown;
}

export interface IEntityType extends EntityType, SpecialUIAnnotationValue, StandardUIAnnotations {
	property?: Property[];
	[key: string]: unknown;
}

export interface InsightsCacheData {
	getInstance: () => {
		clearCache: (id: string) => void;
	};
}
