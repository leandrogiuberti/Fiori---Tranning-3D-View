import type { SelectionVariantType } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import CommonHelper from "sap/fe/macros/CommonHelper";
import VisualFilterUtils from "sap/fe/macros/controls/filterbar/utils/VisualFilterUtils";
import type { IFilterControl } from "sap/fe/macros/filter/FilterUtils";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import { getFiltersConditionsFromSelectionVariant } from "sap/fe/macros/filterBar/FilterHelper";
import type { PropertyInfo } from "sap/fe/macros/internal/PropertyInfo";
import type VisualFilterBlock from "sap/fe/macros/visualfilters/VisualFilter";
import type { InteractiveBarChart$SelectionChangedEvent } from "sap/suite/ui/microchart/InteractiveBarChart";
import type { InteractiveDonutChart$SelectionChangedEvent } from "sap/suite/ui/microchart/InteractiveDonutChart";
import type { InteractiveLineChart$SelectionChangedEvent } from "sap/suite/ui/microchart/InteractiveLineChart";
import type UI5Event from "sap/ui/base/Event";
import type ManagedObject from "sap/ui/base/ManagedObject";
import type Control from "sap/ui/core/Control";
import Library from "sap/ui/core/Lib";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import Condition from "sap/ui/mdc/condition/Condition";
import TypeMap from "sap/ui/mdc/odata/v4/TypeMap";
import MdcFilterUtil from "sap/ui/mdc/util/FilterUtil";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type { MetaModelType } from "../../../../../../../types/metamodel_types";

/**
 * Static class used by Visual Filter during runtime
 * @private
 */
const VisualFilterRuntime = {
	selectionChanged(
		oEvent:
			| UI5Event
			| InteractiveBarChart$SelectionChangedEvent
			| InteractiveLineChart$SelectionChangedEvent
			| InteractiveDonutChart$SelectionChangedEvent
	): void {
		const oInteractiveChart: Control = (oEvent as UI5Event).getSource();
		const sOutParameter = oInteractiveChart.data("outParameter");
		const sValueListProperty = oInteractiveChart.data("valuelistProperty");
		const sDimension = oInteractiveChart.data("dimension");
		const sDimensionText = oInteractiveChart.data("dimensionText");
		const bMultipleSelectionAllowed = oInteractiveChart.data("multipleSelectionAllowed");
		const sDimensionType = oInteractiveChart.data("dimensionType");
		const oSelectedAggregation =
			(oEvent as InteractiveBarChart$SelectionChangedEvent).getParameter("bar") ||
			(oEvent as InteractiveLineChart$SelectionChangedEvent).getParameter("point") ||
			(oEvent as InteractiveDonutChart$SelectionChangedEvent).getParameter("segment");
		const bIsAggregationSelected = (oEvent as InteractiveBarChart$SelectionChangedEvent).getParameter("selected");
		const oConditionModel = oInteractiveChart.getModel("$field") as JSONModel;
		let aConditions = oConditionModel.getProperty("/conditions");

		if (!sOutParameter || sValueListProperty !== sDimension) {
			Log.error("VisualFilter: Cannot sync values with regular filter as out parameter is not configured properly!");
		} else {
			let sSelectionChangedValue = oSelectedAggregation?.getBindingContext()?.getObject(sValueListProperty);
			if (sSelectionChangedValue) {
				let sSelectionChangedValueText = oSelectedAggregation?.getBindingContext()?.getObject(sDimensionText);
				if (typeof sSelectionChangedValueText !== "string" && !(sSelectionChangedValueText instanceof String)) {
					sSelectionChangedValueText = undefined;
				}
				// if selection has been done on the aggregation then add to conditions
				if (bIsAggregationSelected) {
					if (bMultipleSelectionAllowed === false) {
						aConditions = [];
					}
					if (sDimensionType === "Edm.DateTimeOffset") {
						sSelectionChangedValue = VisualFilterUtils._parseDateTime(sSelectionChangedValue);
					}
					const oCondition = Condition.createItemCondition(
						sSelectionChangedValue,
						sSelectionChangedValueText || undefined,
						{},
						{}
					);
					aConditions.push(oCondition);
				} else {
					// because selection was removed on the aggregation hence remove this from conditions
					aConditions = aConditions.filter(function (oCondition: ConditionObject) {
						if (sDimensionType === "Edm.DateTimeOffset") {
							return oCondition.operator !== "EQ" || Date.parse(oCondition.values[0]) !== Date.parse(sSelectionChangedValue);
						}
						return oCondition.operator !== "EQ" || oCondition.values[0] !== sSelectionChangedValue;
					});
				}
				oConditionModel.setProperty("/conditions", aConditions);
			} else {
				Log.error("VisualFilter: No vaue found for the outParameter");
			}
		}
	},
	// THIS IS A FORMATTER
	getAggregationSelected(this: ManagedObject, aConditions: ConditionObject[]): boolean | undefined {
		let aSelectableValues = [];
		if (!this.getBindingContext()) {
			return;
		}
		for (let i = 0; i <= aConditions.length - 1; i++) {
			const oCondition = aConditions[i];
			// 1. get conditions with EQ operator (since visual filter can only deal with EQ operators) and get their values
			if (oCondition.operator === "EQ") {
				aSelectableValues.push(oCondition.values[0]);
			}
		}

		// access the interactive chart from the control.
		const oInteractiveChart = this.getParent() as Control;
		const sDimension = oInteractiveChart.data("dimension");
		const sDimensionType = oInteractiveChart.data("dimensionType");
		let sDimensionValue = this.getBindingContext()?.getObject(sDimension);
		if (sDimensionType === "Edm.DateTimeOffset") {
			sDimensionValue = VisualFilterUtils._parseDateTime(sDimensionValue) as unknown;
		}
		if (oInteractiveChart.data("multipleSelectionAllowed") === false && aSelectableValues.length > 1) {
			aSelectableValues = [aSelectableValues[0]];
		}
		return aSelectableValues.includes(sDimensionValue);
	},

	/**
	 * Get Visual Filter control for the given child control.
	 * @param potentialVisualFilter Expected instance of Visual Filter child control.
	 * @returns The parent Visual Filter Buildingblock control instance if found, otherwise null.
	 */
	getParentVisualFilterControlBB(potentialVisualFilter: ManagedObject | null): VisualFilterBlock | null {
		while (potentialVisualFilter && !potentialVisualFilter.isA<VisualFilterBlock>("sap.fe.macros.visualfilters.VisualFilter")) {
			potentialVisualFilter = potentialVisualFilter.getParent();
		}
		return potentialVisualFilter;
	},

	// THIS IS A FORMATTER
	getFiltersFromConditions(this: ManagedObject, ...aArguments: ConditionObject[][]): Filter[] | undefined {
		const oInteractiveChart = this.getParent() as Control;
		const oFilterBar = oInteractiveChart.getParent()?.getParent()?.getParent()?.getParent()?.getParent() as IFilterControl;
		const aInParameters = oInteractiveChart.data("inParameters").customData;
		const bIsDraftSupported = oInteractiveChart.data("draftSupported") === true;
		const aPropertyInfoSet = FilterUtils.getFilterPropertyInfo(oFilterBar) as PropertyInfo[];
		const mConditions: Record<string, ConditionObject[]> = {};
		const aValueListPropertyInfoSet: unknown[] = [];
		let oFilters;
		let aFilters: Filter[] = [];
		const aParameters = oInteractiveChart.data("parameters") as string[];
		const oSelectionVariantAnnotation = oInteractiveChart.data("selectionVariantAnnotation") as
			| MetaModelType<SelectionVariantType>
			| SelectionVariantType;
		const oInteractiveChartListBinding =
			oInteractiveChart.getBinding("bars") || oInteractiveChart.getBinding("points") || oInteractiveChart.getBinding("segments");
		const sPath = oInteractiveChartListBinding!.getPath();
		const oMetaModel = (oInteractiveChart.getModel() as ODataModel).getMetaModel();
		const sEntitySetPath = oInteractiveChartListBinding!.getPath();
		const filterConditions = getFiltersConditionsFromSelectionVariant(
			sEntitySetPath,
			oMetaModel,
			oSelectionVariantAnnotation,
			VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils)
		);
		for (const i in aPropertyInfoSet) {
			aPropertyInfoSet[i].typeConfig = TypeMap.getTypeConfig(aPropertyInfoSet[i].dataType, {}, {});
		}
		const oSelectionVariantConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
		// aInParameters and the bindings to in parameters are in the same order so we can rely on it to create our conditions
		Object.keys(oSelectionVariantConditions).forEach(function (sKey: string) {
			mConditions[sKey] = oSelectionVariantConditions[sKey];
			//fetch localDataProperty if selection variant key is based on vaue list property
			const inParameterForKey = aInParameters.find(function (inParameter: { valueListProperty: string }) {
				return inParameter.valueListProperty === sKey;
			});
			const localDataProperty = inParameterForKey ? inParameterForKey.localDataProperty : sKey;
			if (!aParameters || (aParameters && !aParameters.includes(sKey))) {
				for (const i in aPropertyInfoSet) {
					const propertyInfoSet = aPropertyInfoSet[i];
					if (localDataProperty === propertyInfoSet.name) {
						if (propertyInfoSet?.typeConfig?.baseType === "DateTime") {
							if (mConditions[sKey]) {
								mConditions[sKey].forEach(function (condition) {
									condition.values[0] = VisualFilterUtils._formatDateTime(condition.values[0]);
								});
							}
						}
						aValueListPropertyInfoSet.push({
							name: sKey,
							typeConfig: propertyInfoSet.typeConfig
						});
					}
				}
			}
		});
		aInParameters.forEach(function (oInParameter: { valueListProperty: string; localDataProperty: string }, index: number) {
			if (aArguments[index].length > 0) {
				// store conditions with value list property since we are filtering on the value list collection path
				mConditions[oInParameter.valueListProperty] = aArguments[index];
				if (!aParameters || (aParameters && !aParameters.includes(oInParameter.valueListProperty))) {
					// aPropertyInfoSet is list of properties from the filter bar but we need to create conditions for the value list
					// which could have a different collectionPath.
					// Only typeConfig from aPropertyInfoSet is required for getting the converted filters from conditions
					// so we update aPropertyInfoSet to have the valueListProperties only
					// This way conditions will be converted to sap.ui.model.Filter for the value list
					// This works because for in parameter mapping the property from the main entity type should be of the same type as the value list entity type
					// TODO: Follow up with MDC to check if they can provide a clean api to convert conditions into filters
					for (const i in aPropertyInfoSet) {
						// store conditions with value list property since we are filtering on the value list collection path
						const propertyInfoSet = aPropertyInfoSet[i];
						if (propertyInfoSet.name === oInParameter.localDataProperty) {
							if (propertyInfoSet?.typeConfig?.baseType === "DateTime") {
								if (mConditions[oInParameter.valueListProperty]) {
									mConditions[oInParameter.valueListProperty].forEach(function (condition) {
										condition.values[0] = VisualFilterUtils._formatDateTime(condition.values[0]);
									});
								}
							}
							aValueListPropertyInfoSet.push({
								name: oInParameter.valueListProperty,
								typeConfig: propertyInfoSet.typeConfig
							});
						}
					}
				}
			}
		});

		const oInternalModelContext = oInteractiveChart.getBindingContext("internal") as InternalModelContext;
		const sInfoPath = oInteractiveChart.data("infoPath");
		let bEnableBinding;
		const oResourceBundle = Library.getResourceBundleFor("sap.fe.macros")!;
		const aRequiredProperties = CommonHelper.parseCustomData(oInteractiveChart.data("requiredProperties")) as string[];
		if (aRequiredProperties.length) {
			const aConditions = Object.keys(mConditions) || [];
			const aNotMatchedConditions: string[] = [];
			aRequiredProperties.forEach(function (requiredPropertyPath: string) {
				if (!aConditions.includes(requiredPropertyPath)) {
					aNotMatchedConditions.push(requiredPropertyPath);
				}
			});
			if (!aNotMatchedConditions.length) {
				bEnableBinding = oInternalModelContext.getProperty(`${sInfoPath}/showError`);
				oInternalModelContext.setProperty(sInfoPath, {
					errorMessageTitle: "",
					errorMessage: "",
					showError: false
				});
			} else if (aNotMatchedConditions.length > 1) {
				oInternalModelContext.setProperty(sInfoPath, {
					errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
					errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF"),
					showError: true
				});
				return;
			} else {
				const sLabel =
					oMetaModel.getObject(`${sEntitySetPath}/${aNotMatchedConditions[0]}@com.sap.vocabularies.Common.v1.Label`) ||
					aNotMatchedConditions[0];
				oInternalModelContext.setProperty(sInfoPath, {
					errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
					errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", [sLabel]),
					showError: true
				});
				return;
			}
		} else {
			bEnableBinding = oInternalModelContext.getProperty(`${sInfoPath}/showError`);
			oInternalModelContext.setProperty(sInfoPath, { errorMessageTitle: "", errorMessage: "", showError: false });
		}

		const sFilterEntityName = oFilterBar.data("entityType").split("/")[1];
		const sChartEntityName = sPath.split("/")[1].split("(")[0];
		if (aParameters && aParameters.length && sFilterEntityName === sChartEntityName) {
			const sBindingPath = bEnableBinding
				? FilterUtils.getBindingPathForParameters(oFilterBar, mConditions, aPropertyInfoSet, aParameters)
				: undefined;

			if (sBindingPath) {
				(oInteractiveChartListBinding as { sPath?: string }).sPath = sBindingPath;
			}
		}

		if (aParameters && aParameters.length) {
			//Remove parameters from mConditions since it should not be a part of $filter
			aParameters.forEach(function (parameter: string) {
				if (mConditions[parameter]) {
					delete mConditions[parameter];
				}
			});
		}

		// On InitialLoad when initiallayout is visual, aPropertyInfoSet is always empty and we cannot get filters from MDCFilterUtil.
		// Also when SVQualifier is there then we should not change the listbinding filters to empty as we are not getting filters from MDCFilterUtil but
		// instead we need to not call listbinding.filter and use the template time binding itself.
		if (Object.keys(mConditions).length > 0 && aValueListPropertyInfoSet.length) {
			try {
				oFilters = (MdcFilterUtil.getFilterInfo(oFilterBar, mConditions, aValueListPropertyInfoSet, []) as { filters: Filter })
					.filters;
			} catch (e) {
				Log.debug("VisualFilter: Error while getting filters from MDCFilterUtil");
			}
			if (oFilters) {
				if (!oFilters.getFilters()) {
					aFilters.push(oFilters);
				} else if (oFilters.getFilters()) {
					aFilters = oFilters.getFilters()!;
				}
			}
		}
		if (bIsDraftSupported) {
			aFilters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
		}
		if (aFilters && aFilters.length > 0) {
			(oInteractiveChartListBinding as ODataListBinding)?.filter(aFilters);
		} else if (!Object.keys(mConditions).length) {
			(oInteractiveChartListBinding as ODataListBinding)?.filter();
		}
		// update the interactive chart binding
		if (bEnableBinding) {
			const visualFilterBB = VisualFilterRuntime.getParentVisualFilterControlBB(oInteractiveChart);
			visualFilterBB?._setInternalUpdatePending(false);
		}
		return aFilters;
	},
	getFilterCounts(this: Control, oConditions: ConditionObject[]): string | undefined {
		if (this.data("multipleSelectionAllowed") === false && oConditions.length > 0) {
			return `(1)`;
		}
		if (oConditions.length > 0) {
			return `(${oConditions.length})`;
		} else {
			return undefined;
		}
	},

	scaleVisualFilterValue(
		oValue: string,
		scaleFactor: number,
		numberOfFractionalDigits: number,
		currency: string,
		oRawValue: string | number
	): string {
		// ScaleFactor if defined is priority for formatting
		if (scaleFactor) {
			return VisualFilterUtils.getFormattedNumber(oRawValue, scaleFactor, numberOfFractionalDigits);
			// If Scale Factor is not defined, use currency formatting
		} else if (currency) {
			return VisualFilterUtils.getFormattedNumber(oRawValue, undefined, undefined, currency);
			// No ScaleFactor and no Currency, use numberOfFractionalDigits defined in DataPoint
		} else if (numberOfFractionalDigits > 0) {
			// Number of fractional digits shall not exceed 2, unless required by currency
			numberOfFractionalDigits = numberOfFractionalDigits > 2 ? 2 : numberOfFractionalDigits;
			return VisualFilterUtils.getFormattedNumber(oRawValue, undefined, numberOfFractionalDigits);
		} else {
			return oValue;
		}
	},
	fireValueHelp(oEvent: UI5Event<{}, Control>): void {
		oEvent.getSource().getParent()?.getParent()?.getParent()?.getParent()?.fireEvent("valueHelpRequest");
	}
};

ObjectPath.set("sap.fe.macros.visualfilters.VisualFilterRuntime", VisualFilterRuntime);

export default VisualFilterRuntime;
