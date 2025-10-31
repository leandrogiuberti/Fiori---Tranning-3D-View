import type { Masked } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type { Contact } from "@sap-ux/vocabularies-types/vocabularies/Communication";
import { CommunicationAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Communication";
import type {
	CollectionFacet,
	CollectionFacetTypes,
	DataField,
	DataFieldAbstractTypes,
	DataPoint,
	FacetTypes,
	FieldGroup,
	FieldGroupType,
	Identification,
	InputMask,
	PartOfPreview,
	ReferenceFacet,
	ReferenceFacetTypes
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import type { CompiledBindingToolkitExpression } from "sap/fe/base/BindingToolkit";
import { compileExpression, equal, getExpressionFromAnnotation, ifElse, not, pathInModel } from "sap/fe/base/BindingToolkit";
import type { PageContextPathTarget } from "sap/fe/core/converters/TemplateConverter";
import { getSemanticObjectPath } from "sap/fe/core/converters/annotations/DataField";
import type { BaseAction } from "sap/fe/core/converters/controls/Common/Action";
import { isNavigationProperty, isSingleton } from "sap/fe/core/helpers/TypeGuards";
import { getTargetEntitySetPath, getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { createIdForAnnotation } from "../../../helpers/StableIdHelper";
import type ConverterContext from "../../ConverterContext";
import type { FormManifestConfiguration, FormatOptionsType } from "../../ManifestSettings";
import { ActionType } from "../../ManifestSettings";
import type { ConfigurableObject, CustomElement } from "../../helpers/ConfigurableObject";
import { OverrideType, Placement, insertCustomElements } from "../../helpers/ConfigurableObject";
import { isReferencePropertyStaticallyHidden } from "../../helpers/DataFieldHelper";
import { getFormID, getFormStandardActionButtonID } from "../../helpers/ID";
import { KeyHelper } from "../../helpers/Key";

export type FormDefinition = {
	id: string;
	useFormContainerLabels: boolean;
	hasFacetsNotPartOfPreview: boolean;
	formContainers: FormContainer[];
	isVisible: CompiledBindingToolkitExpression;
};

export enum FormElementType {
	Default = "Default",
	Slot = "Slot",
	Annotation = "Annotation"
}

export type BaseFormElement = ConfigurableObject & {
	id?: string;
	type: FormElementType;
	label?: string;
	visible?: CompiledBindingToolkitExpression;
	formatOptions?: FormatOptionsType;
	readOnly?: boolean;
	semanticObject?: string;
	annotationPath?: string;
};

export type AnnotationFormElement = BaseFormElement & {
	idPrefix?: string;
	annotationPath?: string;
	isValueMultilineText?: boolean;
	semanticObjectPath?: string;
	connectedFields?: {
		semanticObjectPath?: string;
		originalObject?: DataFieldAbstractTypes;
		originalTemplate?: string;
	}[];
	fieldGroupElements?: DataFieldAbstractTypes[];
	isPartOfPreview?: boolean;
	connectedFieldsTarget?: { [key: string]: unknown };
};

export type CustomFormElement = CustomElement<
	BaseFormElement & {
		type: FormElementType;
		template: string;
		propertyPath?: string;
	}
>;

export type FormElement = CustomFormElement | AnnotationFormElement;

export type AdditionalFormSettings = {
	useSingleTextAreaFieldAsNotes?: boolean;
};

export type FormContainer = {
	id?: string;
	formElements: FormElement[];
	annotationPath: string;
	isVisible: CompiledBindingToolkitExpression;
	annotationHidden: boolean;
	entitySet?: string;
	actions?: BaseAction[];
	useSingleTextAreaFieldAsNotes?: boolean;
};

/**
 * Returns default format options for text fields in a form.
 * It also adds the horizontal layout as a format option for field groups.
 * @param facetDefinition The facet definition to get the format options for
 * @param converterContext The converter context to fetch additional information
 * @param field The field for which the format options are to be returned
 * @returns The collection of format options for the FormElement
 */
function getFormatOptionsForFormElement(
	facetDefinition: ReferenceFacetTypes,
	converterContext: ConverterContext<PageContextPathTarget>,
	field?: DataFieldAbstractTypes
): FormatOptionsType {
	let manifestWrapper, horizontalLayout;
	const formatOptions: FormatOptionsType = {
		textLinesEdit: 4 // default
	};
	if (field && field.$Type === UIAnnotationTypes.DataFieldForAnnotation) {
		manifestWrapper = converterContext.getManifestWrapper();
		horizontalLayout = manifestWrapper.getHorizontalLayoutForFieldGroup(facetDefinition.Target.value, field.Target?.value);
		if (horizontalLayout === true) {
			formatOptions.fieldGroupHorizontalLayout = horizontalLayout;
		}
	}
	return formatOptions;
}

function isFieldPartOfPreview(field: DataFieldAbstractTypes, formPartOfPreview?: PartOfPreview): boolean {
	// Both each form and field can have the PartOfPreview annotation. Only if the form is not hidden (not partOfPreview) we allow toggling on field level
	return (
		formPartOfPreview?.valueOf() === false ||
		field.annotations?.UI?.PartOfPreview === undefined ||
		field.annotations?.UI?.PartOfPreview.valueOf() === true
	);
}

export function getFormElementsFromAnnotations(
	facetDefinition: ReferenceFacetTypes,
	converterContext: ConverterContext<PageContextPathTarget>
): AnnotationFormElement[] {
	const formElements: AnnotationFormElement[] = [];
	const resolvedTarget = converterContext.getEntityTypeAnnotation(facetDefinition.Target.value);
	const formAnnotation: Identification | FieldGroup | Contact | DataPoint | InputMask | Masked = resolvedTarget.annotation as
		| Identification
		| FieldGroup
		| Contact
		| DataPoint
		| InputMask
		| Masked;
	converterContext = resolvedTarget.converterContext;

	function getDataFieldsFromAnnotations(field: DataFieldAbstractTypes, formPartOfPreview: PartOfPreview | undefined): void {
		const dataFieldKey = KeyHelper.generateKeyFromDataField(field);
		const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, field);
		const manifestWrapper = converterContext.getManifestWrapper();
		const manifestFields = manifestWrapper.getFormContainer(facetDefinition.Target.value)?.fields;
		const semanticObjectManifestSettings = manifestFields?.[dataFieldKey]?.semanticObject;
		if (
			field.$Type !== UIAnnotationTypes.DataFieldForAction &&
			field.$Type !== UIAnnotationTypes.DataFieldForIntentBasedNavigation &&
			field.$Type !== UIAnnotationTypes.DataFieldForActionGroup &&
			!isReferencePropertyStaticallyHidden(field)
		) {
			const formElement = {
				key: dataFieldKey,
				type: FormElementType.Annotation,
				annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(field.fullyQualifiedName)}/`,
				semanticObjectPath: semanticObjectAnnotationPath,
				formatOptions: getFormatOptionsForFormElement(facetDefinition, converterContext, field),
				isPartOfPreview: isFieldPartOfPreview(field, formPartOfPreview),
				label: field.Label ?? (field as DataField).Value?.$target?.annotations?.Common?.Label?.toString(),
				semanticObject: semanticObjectManifestSettings
			};

			if (
				field.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" &&
				field.Target.$target?.$Type === "com.sap.vocabularies.UI.v1.ConnectedFieldsType"
			) {
				const connectedFields = Object.values(field.Target.$target.Data).filter(
					(connectedField: unknown) => (connectedField as DataFieldAbstractTypes)?.hasOwnProperty("Value")
				) as DataFieldAbstractTypes[];
				(formElement as AnnotationFormElement).connectedFields = connectedFields.map((connnectedFieldElement) => {
					const returnObject = {
						semanticObjectPath: getSemanticObjectPath(converterContext, connnectedFieldElement)
					};

					Object.defineProperty(returnObject, "originalObject", {
						get: () => connnectedFieldElement
					});

					Object.defineProperty(returnObject, "originalTemplate", {
						get: () => {
							const target = field.Target?.$target;
							return target && "Template" in target ? target.Template : undefined;
						}
					});

					return returnObject;
				});
			} else if (
				field.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" &&
				field.Target.$target?.$Type === "com.sap.vocabularies.UI.v1.FieldGroupType"
			) {
				const fieldGroupElements = Object.values(field.Target.$target.Data).filter(
					(fieldGroupElement) => fieldGroupElement?.hasOwnProperty("Value")
				);
				(formElement as AnnotationFormElement).fieldGroupElements = fieldGroupElements.map((element) => ({
					$Type: element.$Type,
					fullyQualifiedName: element.fullyQualifiedName,
					Label: element.Label
				})) as unknown as DataFieldAbstractTypes[];
			}
			formElements.push(formElement);
		}
	}

	switch (formAnnotation?.term) {
		case UIAnnotationTerms.FieldGroup:
			formAnnotation.Data.forEach((field) => getDataFieldsFromAnnotations(field, facetDefinition.annotations?.UI?.PartOfPreview));
			break;
		case UIAnnotationTerms.Identification:
			formAnnotation.forEach((field) => getDataFieldsFromAnnotations(field, facetDefinition.annotations?.UI?.PartOfPreview));
			break;
		case UIAnnotationTerms.DataPoint:
			formElements.push({
				// key: KeyHelper.generateKeyFromDataField(formAnnotation),
				key: `DataPoint::${formAnnotation.qualifier ? formAnnotation.qualifier : ""}`,
				type: FormElementType.Annotation,
				annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(formAnnotation.fullyQualifiedName)}/`
			});
			break;
		case UIAnnotationTerms.InputMask:
			formElements.push({
				key: `MaskedInput::${formAnnotation.qualifier ? formAnnotation.qualifier : ""}`,
				type: FormElementType.Annotation,
				annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(formAnnotation.fullyQualifiedName)}/`
			});
			break;
		case CommonAnnotationTerms.Masked:
			formElements.push({
				key: `Masked::${formAnnotation.qualifier ? formAnnotation.qualifier : ""}`,
				type: FormElementType.Annotation,
				annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(formAnnotation.fullyQualifiedName)}/`
			});
			break;
		case CommunicationAnnotationTerms.Contact:
			formElements.push({
				// key: KeyHelper.generateKeyFromDataField(formAnnotation),
				key: `Contact::${formAnnotation.qualifier ? formAnnotation.qualifier : ""}`,
				type: FormElementType.Annotation,
				annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(formAnnotation.fullyQualifiedName)}/`
			});
			break;
		default:
			break;
	}
	return formElements;
}

export function getFormElementsFromManifest(
	facetDefinition: ReferenceFacetTypes,
	converterContext: ConverterContext<PageContextPathTarget>
): Record<string, CustomFormElement> {
	const manifestWrapper = converterContext.getManifestWrapper();
	const manifestFormContainer: FormManifestConfiguration = manifestWrapper.getFormContainer(facetDefinition.Target.value);
	const formElements: Record<string, CustomFormElement> = {};
	if (manifestFormContainer?.fields) {
		Object.keys(manifestFormContainer?.fields).forEach((fieldId) => {
			formElements[fieldId] = {
				key: fieldId,
				id: `CustomFormElement::${fieldId}`,
				type: manifestFormContainer.fields[fieldId].type || FormElementType.Default,
				template: manifestFormContainer.fields[fieldId].template,
				propertyPath: manifestFormContainer.fields[fieldId]?.property,
				label: converterContext.fetchTextFromMetaModel(manifestFormContainer.fields[fieldId].label),
				position: manifestFormContainer.fields[fieldId].position || {
					placement: Placement.After
				},
				formatOptions: {
					...getFormatOptionsForFormElement(facetDefinition, converterContext),
					...manifestFormContainer.fields[fieldId].formatOptions
				},
				...(manifestFormContainer.fields[fieldId].readOnly !== undefined && {
					readOnly: manifestFormContainer.fields[fieldId].readOnly
				}),
				...(manifestFormContainer.fields[fieldId].semanticObject !== undefined && {
					semanticObject: manifestFormContainer.fields[fieldId].semanticObject
				})
			};
		});
	}
	return formElements;
}

export function getFormContainer(
	facetDefinition: ReferenceFacetTypes,
	converterContext: ConverterContext<PageContextPathTarget>,
	actions?: BaseAction[],
	additionalSettings?: AdditionalFormSettings
): FormContainer {
	const sFormContainerId = createIdForAnnotation(facetDefinition) as string;
	const sAnnotationPath = converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName);
	const resolvedTarget = converterContext.getEntityTypeAnnotation(facetDefinition.Target.value);
	const isVisible = compileExpression(not(equal(true, getExpressionFromAnnotation(facetDefinition.annotations?.UI?.Hidden))));
	let sEntitySetPath!: string;
	// resolvedTarget doesn't have a entitySet in case Containments and Paramterized services.
	const entitySet = resolvedTarget.converterContext.getEntitySet();
	const dataModelObjectPathTarget = resolvedTarget.converterContext.getDataModelObjectPath().targetObject;
	if (entitySet && entitySet !== converterContext.getEntitySet()) {
		sEntitySetPath = getTargetEntitySetPath(resolvedTarget.converterContext.getDataModelObjectPath());
	} else if (isNavigationProperty(dataModelObjectPathTarget) && dataModelObjectPathTarget?.containsTarget === true) {
		sEntitySetPath = getTargetObjectPath(resolvedTarget.converterContext.getDataModelObjectPath(), false);
	} else if (entitySet && !sEntitySetPath && isSingleton(entitySet)) {
		sEntitySetPath = entitySet.fullyQualifiedName;
	} else if (!entitySet && isNavigationProperty(dataModelObjectPathTarget) && dataModelObjectPathTarget?.containsTarget === false) {
		sEntitySetPath = getTargetObjectPath(resolvedTarget.converterContext.getDataModelObjectPath(), false);
	}
	const aFormElements = insertCustomElements(
		getFormElementsFromAnnotations(facetDefinition, converterContext),
		getFormElementsFromManifest(facetDefinition, converterContext),
		{ formatOptions: OverrideType.overwrite, readOnly: OverrideType.overwrite, semanticObject: OverrideType.overwrite }
	);

	actions = actions !== undefined ? actions.filter((action) => action.facetName == facetDefinition.fullyQualifiedName) : [];
	if (actions.length === 0) {
		actions = undefined;
	}

	const oActionShowDetails: BaseAction = {
		id: getFormStandardActionButtonID(sFormContainerId, "ShowHideDetails"),
		key: "StandardAction::ShowHideDetails",
		text: compileExpression(
			ifElse(
				equal(pathInModel("showDetails", "internal"), true),
				pathInModel("T_COMMON_OBJECT_PAGE_HIDE_FORM_CONTAINER_DETAILS", "sap.fe.i18n"),
				pathInModel("T_COMMON_OBJECT_PAGE_SHOW_FORM_CONTAINER_DETAILS", "sap.fe.i18n")
			)
		),
		type: ActionType.ShowFormDetails,
		press: "FormContainerRuntime.toggleDetails"
	};

	if (
		facetDefinition.annotations?.UI?.PartOfPreview?.valueOf() !== false &&
		aFormElements.some((oFormElement) => oFormElement.isPartOfPreview === false)
	) {
		if (actions !== undefined) {
			actions.push(oActionShowDetails);
		} else {
			actions = [oActionShowDetails];
		}
	}

	return {
		id: sFormContainerId,
		formElements: aFormElements,
		annotationPath: sAnnotationPath,
		isVisible: isVisible,
		entitySet: sEntitySetPath,
		actions: actions,
		useSingleTextAreaFieldAsNotes: additionalSettings?.useSingleTextAreaFieldAsNotes,
		annotationHidden: facetDefinition.annotations?.UI?.Hidden ? true : false
	};
}

function getFormContainersForCollection(
	facetDefinition: CollectionFacetTypes,
	converterContext: ConverterContext<PageContextPathTarget>,
	actions?: BaseAction[],
	additionalSettings?: AdditionalFormSettings
): FormContainer[] {
	const formContainers: FormContainer[] = [];
	const formContainerSettings = {
		useSingleTextAreaFieldAsNotes: additionalSettings?.useSingleTextAreaFieldAsNotes
	};
	facetDefinition.Facets?.forEach((facet) => {
		// Ignore level 3 collection facet
		if (facet.$Type === UIAnnotationTypes.CollectionFacet) {
			return;
		}
		try {
			formContainers.push(getFormContainer(facet as ReferenceFacetTypes, converterContext, actions, formContainerSettings));
		} catch (error: unknown) {
			Log.error(`Skipping facet ${facet.fullyQualifiedName} due to error:`, error as string);
		}
	});
	return formContainers;
}

export function isReferenceFacet(facetDefinition: FacetTypes): facetDefinition is ReferenceFacetTypes {
	return facetDefinition.$Type === UIAnnotationTypes.ReferenceFacet;
}

export function createFormDefinition(
	facetDefinition: FieldGroupType | CollectionFacet | ReferenceFacet | undefined,
	isVisible: CompiledBindingToolkitExpression,
	converterContext: ConverterContext<PageContextPathTarget>,
	actions?: BaseAction[],
	additionalSettings?: AdditionalFormSettings
): FormDefinition {
	switch (facetDefinition?.$Type) {
		case UIAnnotationTypes.CollectionFacet:
			// Keep only valid children
			return {
				id: getFormID(facetDefinition),
				useFormContainerLabels: true,
				hasFacetsNotPartOfPreview: facetDefinition.Facets.some(
					(childFacet) => childFacet.annotations?.UI?.PartOfPreview?.valueOf() === false
				),
				formContainers: getFormContainersForCollection(facetDefinition, converterContext, actions, additionalSettings),
				isVisible: isVisible
			};
		case UIAnnotationTypes.ReferenceFacet:
			return {
				id: getFormID(facetDefinition),
				useFormContainerLabels: false,
				hasFacetsNotPartOfPreview: facetDefinition.annotations?.UI?.PartOfPreview?.valueOf() === false,
				formContainers: [getFormContainer(facetDefinition, converterContext, actions, additionalSettings)],
				isVisible: isVisible
			};
		default:
			throw new Error("Cannot create form based on ReferenceURLFacet");
	}
}
