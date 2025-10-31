import type { DataFieldDefault } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type AppComponent from "sap/fe/core/AppComponent";
import type { FEView } from "sap/fe/core/BaseController";
import type { BaseTreeModifier } from "sap/fe/core/CommonUtils";
import type { MetaModelPropertyAnnotations } from "sap/fe/core/converters/MetaModelConverter";
import Common from "sap/fe/macros/CommonHelper";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import type Control from "sap/ui/core/Control";
import type UI5Element from "sap/ui/core/Element";
import type XMLView from "sap/ui/core/mvc/XMLView";
import ListBinding from "sap/ui/model/ListBinding";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type { MetaModelEntityType, MetaModelProperty, MetaModelType } from "../../../../../../../types/metamodel_types";

type DelegateProperty = {
	name: string;
	bindingPath: string;
	entityType: string;
	label?: string;
	hideFromReveal?: boolean;
	unsupported?: boolean;
};

const Delegate = {
	/**
	 * @param mPropertyBag Object with parameters as properties
	 * @param mPropertyBag.modifier Modifier to harmonize access, creation and manipulation to controls in XML Views and JS Controls
	 * @param [mPropertyBag.appComponent] Needed to calculate the correct ID in case you provide a selector
	 * @param [mPropertyBag.view] XML node of the view, required for XML case to create nodes and to find elements
	 * @param [mPropertyBag.fieldSelector] Selector to calculate the ID for the control that is created
	 * @param [mPropertyBag.fieldSelector.id]
	 * @param [mPropertyBag.fieldSelector.isLocalId]
	 * @param mPropertyBag.bindingPath Runtime binding path the control should be bound to
	 * @param mPropertyBag.payload Payload parameter attached to the delegate, undefined if no payload was assigned
	 * @param mPropertyBag.controlType Control type of the element the delegate is attached to
	 * @param mPropertyBag.aggregationName Name of the aggregation the delegate should provide additional elements
	 * @param mPropertyBag.element
	 * @param mPropertyBag.parentSelector
	 * @returns Map containing the controls to add
	 */
	createLayout: async function (mPropertyBag: {
		modifier: BaseTreeModifier;
		appComponent?: AppComponent;
		view?: Element;
		fieldSelector?: { id?: string; isLocalId?: boolean };
		bindingPath: string;
		payload: object;
		controlType: string;
		aggregationName: string;
		element: UI5Element | Element;
		parentSelector?: object;
	}): Promise<{
		control: Element | UI5Element | Element[] | UI5Element[];
	}> {
		const oModifier = mPropertyBag.modifier,
			oMetaModel = mPropertyBag.appComponent?.getMetaModel(),
			oForm = mPropertyBag.element;

		// Check for existing fields with the same _flexId
		if (oModifier.targets === "xmlTree") {
			// at preprocessing time
			const fieldsInView = mPropertyBag.view?.getElementsByTagNameNS("sap.fe.macros", "Field");
			if (fieldsInView) {
				for (const field of Array.from(fieldsInView)) {
					if (field.getAttribute("_flexId") === mPropertyBag.fieldSelector?.id) {
						// Field with same _flexId already exists, reject Promise to avoid duplicates
						return Promise.reject(new Error("FormDelegate.createLayout: field already exists"));
					}
				}
			}
		} else if (oModifier.targets === "jsControlTree") {
			// at runtime
			if (
				mPropertyBag.fieldSelector?.id &&
				mPropertyBag.view &&
				(mPropertyBag.view as unknown as XMLView).byId(mPropertyBag.fieldSelector?.id)
			) {
				return Promise.reject(new Error("FormDelegate.createLayout: field already exists"));
			}
		}

		const metaPath = (await DelegateUtil.getCustomDataWithModifier<string>(oForm, "metaPath", oModifier)) ?? "";
		const oFormContainer = mPropertyBag.parentSelector
			? mPropertyBag.modifier.bySelector(mPropertyBag.parentSelector, mPropertyBag.appComponent, mPropertyBag.view)
			: undefined;
		const sNavigationPath = oFormContainer
			? await DelegateUtil.getCustomDataWithModifier<string>(oFormContainer as UI5Element | Element, "navigationPath", oModifier)
			: "";
		let sBindingPath = metaPath.substring(0, metaPath.indexOf("@"));
		sBindingPath = sNavigationPath ? `${sBindingPath}${sNavigationPath}/` : sBindingPath;
		const oMetaModelContext = oMetaModel?.getMetaContext(sBindingPath.substring(0, sBindingPath.length - 1));
		const oPropertyContext = oMetaModel?.createBindingContext(`${sBindingPath}${mPropertyBag.bindingPath}`);

		async function fnTemplateFormElement(
			sFragmentName: string,
			oView: FEView | undefined,
			navigationPath: string
		): Promise<Element | UI5Element | Element[] | UI5Element[]> {
			const sOnChangeCustomData = await DelegateUtil.getCustomDataWithModifier<string>(oForm, "onChange", oModifier);
			const sDisplayModeCustomData = await DelegateUtil.getCustomDataWithModifier<string>(oForm, "displayMode", oModifier);
			const oThis = new JSONModel({
				// properties and events of Field macro
				_flexId: mPropertyBag.fieldSelector?.id,
				onChange: Common.removeEscapeCharacters(sOnChangeCustomData),
				displayMode: Common.removeEscapeCharacters(sDisplayModeCustomData),
				navigationPath: navigationPath
			});
			const oPreprocessorSettings = {
				bindingContexts: {
					entitySet: oMetaModelContext,
					dataField: oPropertyContext,
					this: oThis.createBindingContext("/")
				},
				models: {
					this: oThis,
					entitySet: oMetaModel,
					metaModel: oMetaModel,
					dataField: oMetaModel
				},
				appComponent: mPropertyBag.appComponent
			};

			return DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, { view: oView }, oModifier);
		}

		const oField = await fnTemplateFormElement(
			"sap.fe.macros.form.FormElementFlexibility",
			mPropertyBag.view as unknown as FEView,
			sNavigationPath!
		);
		return {
			control: oField
		};
	},
	// getPropertyInfo is a patched version of ODataV4ReadDelegates to dela with navigationPath
	getPropertyInfo: async function (mPropertyBag: {
		element: Control;
		aggregationName: string;
		payload: {
			modelName?: string;
			path?: string;
		};
	}): Promise<DelegateProperty[]> {
		function _isComplexType(mProperty: MetaModelProperty): boolean {
			if (mProperty && mProperty.$Type) {
				if (mProperty.$Type.toLowerCase().indexOf("edm") !== 0) {
					return true;
				}
			}
			return false;
		}

		//Check if a given property path starts with a navigation property.
		function _startsWithNavigationProperty(sPropertyPath: string, aNavigationProperties: string[]): boolean {
			return aNavigationProperties.some(function (sNavProp) {
				return sPropertyPath.startsWith(sNavProp);
			});
		}

		function _enrichProperty(
			sPropertyPath: string,
			mElement: MetaModelProperty,
			mPropertyAnnotations: MetaModelPropertyAnnotations,
			sEntityType: string,
			oElement: Control,
			sAggregationName: string,
			aNavigationProperties: string[]
		): DelegateProperty {
			const mProp: DelegateProperty = {
				name: sPropertyPath,
				bindingPath: sPropertyPath,
				entityType: sEntityType
			};
			// get label information, either via DataFieldDefault annotation (if exists) or Label annotation
			const mDataFieldDefaultAnnotation = mPropertyAnnotations[
				"@com.sap.vocabularies.UI.v1.DataFieldDefault"
			] as MetaModelType<DataFieldDefault>;
			const sLabel =
				(mDataFieldDefaultAnnotation && mDataFieldDefaultAnnotation.Label) ||
				mPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"];
			mProp.label = (sLabel as string) || "[LABEL_MISSING: " + sPropertyPath + "]";
			// evaluate Hidden annotation
			const mHiddenAnnotation = mPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
			mProp.hideFromReveal = mHiddenAnnotation as boolean;
			if (mHiddenAnnotation && (mHiddenAnnotation as { $Path?: string }).$Path) {
				mProp.hideFromReveal = oElement.getBindingContext()?.getProperty((mHiddenAnnotation as { $Path?: string }).$Path!);
			}
			// evaluate AdaptationHidden annotation
			if (!mProp.hideFromReveal) {
				mProp.hideFromReveal = mPropertyAnnotations["@com.sap.vocabularies.UI.v1.AdaptationHidden"] as boolean;
			}
			// evaluate FieldControl annotation
			let mFieldControlAnnotation;
			if (!mProp.hideFromReveal) {
				mFieldControlAnnotation = mPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
				if (mFieldControlAnnotation) {
					mProp.hideFromReveal =
						(mFieldControlAnnotation as { $EnumMember?: string }).$EnumMember ===
						"com.sap.vocabularies.Common.v1.FieldControlType/Hidden";
				}
			}
			// @runtime hidden by field control value = 0
			mFieldControlAnnotation = mPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
			const sFieldControlPath = mFieldControlAnnotation && (mFieldControlAnnotation as { $Path?: string }).$Path;
			if (sFieldControlPath && !mProp.hideFromReveal) {
				// if the binding is a list binding, skip the check for field control
				const bListBinding = oElement.getBinding(sAggregationName) instanceof ListBinding;
				if (!bListBinding) {
					const iFieldControlValue = oElement.getBindingContext()?.getProperty(sFieldControlPath);
					mProp.hideFromReveal = iFieldControlValue === 0;
				}
			}
			// no support for DataFieldFor/WithAction and DataFieldFor/WithIntentBasedNavigation within DataFieldDefault annotation
			if (
				mDataFieldDefaultAnnotation &&
				(mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
					mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
					mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction" ||
					mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation")
			) {
				mProp.unsupported = true;
			}
			// no support for navigation properties and complex properties
			if (_startsWithNavigationProperty(sPropertyPath, aNavigationProperties) || _isComplexType(mElement)) {
				mProp.unsupported = true;
			}
			return mProp;
		}

		// Convert metadata format to delegate format.
		function _convertMetadataToDelegateFormat(
			mODataEntityType: MetaModelEntityType,
			sEntityType: string,
			oMetaModel: ODataMetaModel,
			oElement: Control,
			sAggregationName: string
		): DelegateProperty[] {
			const aProperties = [];
			let sElementName = "";
			const aNavigationProperties = [];
			let mElement;
			for (sElementName in mODataEntityType) {
				mElement = mODataEntityType[sElementName];
				if (mElement.$kind === "NavigationProperty") {
					aNavigationProperties.push(sElementName);
				}
			}
			for (sElementName in mODataEntityType) {
				mElement = mODataEntityType[sElementName];
				if (mElement.$kind === "Property") {
					const mPropAnnotations = oMetaModel.getObject("/" + sEntityType + "/" + sElementName + "@");
					const mProp = _enrichProperty(
						sElementName,
						mElement as MetaModelProperty,
						mPropAnnotations,
						sEntityType,
						oElement,
						sAggregationName,
						aNavigationProperties
					);
					aProperties.push(mProp);
				}
			}
			return aProperties;
		}

		//Get binding path either from payload (if available) or the element's binding context.
		function _getBindingPath(
			oElement: Control,
			mPayload: {
				path?: string;
			}
		): string | undefined {
			if (mPayload.path) {
				return mPayload.path;
			}
			const vBinding = oElement.getBindingContext();
			if (vBinding) {
				if (oElement.data("navigationPath")) {
					return vBinding.getPath() + "/" + oElement.data("navigationPath");
				}
				return vBinding.getPath();
			}
		}

		//Get all properties of the element's model.
		async function _getODataPropertiesOfModel(
			oElement: Control,
			sAggregationName: string,
			mPayload: {
				modelName?: string;
				path?: string;
			}
		): Promise<DelegateProperty[]> {
			const oModel = oElement.getModel(mPayload.modelName);
			if (oModel) {
				if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
					const oMetaModel = oModel.getMetaModel() as ODataMetaModel;
					const sBindingContextPath = _getBindingPath(oElement, mPayload);
					if (sBindingContextPath) {
						const oMetaModelContext = oMetaModel.getMetaContext(sBindingContextPath);
						const oMetaModelContextObject = oMetaModelContext.getObject();
						const mODataEntityType = oMetaModelContext.getObject(oMetaModelContextObject.$Type);
						return _convertMetadataToDelegateFormat(
							mODataEntityType,
							oMetaModelContextObject.$Type,
							oMetaModel,
							oElement,
							sAggregationName
						);
					}
				}
			}
			return Promise.resolve([]);
		}

		return Promise.resolve().then(async function () {
			return _getODataPropertiesOfModel(mPropertyBag.element, mPropertyBag.aggregationName, mPropertyBag.payload);
		});
	}
};

export default Delegate;
