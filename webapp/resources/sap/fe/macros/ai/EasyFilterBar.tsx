import type { ComplexType, EntitySet, EntityType, NavigationProperty, Property, TypeDefinition } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import Localization from "sap/base/i18n/Localization";
import { isConstant } from "sap/fe/base/BindingToolkit";
import type { EnhanceWithUI5 } from "sap/fe/base/ClassSupport";
import { aggregation, association, defineUI5Class, implementInterface, property, type PropertiesOf } from "sap/fe/base/ClassSupport";
import type {
	CodeListType,
	EasyFilterBarContainer$ShowValueHelpEvent,
	EasyFilterPropertyMetadata,
	TokenDefinition,
	TokenSelectedValuesDefinition,
	TokenType,
	ValueHelpSelectedValuesDefinition
} from "sap/fe/controls/easyFilter/EasyFilterBarContainer";
import EasyFilterBarContainer from "sap/fe/controls/easyFilter/EasyFilterBarContainer";
import BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import type { ControlState, NavigationParameter } from "sap/fe/core/controllerextensions/ViewState";
import type IViewStateContributor from "sap/fe/core/controllerextensions/viewState/IViewStateContributor";
import { type FilterField } from "sap/fe/core/definition/FEDefinition";
import type MetaPath from "sap/fe/core/helpers/MetaPath";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { isComplexType, isEntityType, isNavigationProperty, isPathAnnotationExpression, isProperty } from "sap/fe/core/helpers/TypeGuards";
import { isPathFilterable } from "sap/fe/core/templating/DataModelPathHelper";
import { hasValueHelpWithFixedValues } from "sap/fe/core/templating/PropertyHelper";
import {
	generateSelectParameter,
	mapValueListToCodeList,
	resolveTokenValue,
	unresolvedResult
} from "sap/fe/macros/ai/EasyFilterDataFetcher";
import type FilterBar from "sap/fe/macros/controls/FilterBar";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import DraftEditState from "sap/fe/macros/filterBar/DraftEditState";
import type FilterBarAPI from "sap/fe/macros/filterBar/FilterBarAPI";
import ValueListHelper, { type ValueListInfo } from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import type UI5Event from "sap/ui/base/Event";
import type ManagedObject from "sap/ui/base/ManagedObject";
import type { $ControlSettings } from "sap/ui/core/Control";
import UI5Element from "sap/ui/core/Element";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import Date1 from "sap/ui/model/odata/type/Date";
import DateTimeOffset from "sap/ui/model/odata/type/DateTimeOffset";
import type ODataType from "sap/ui/model/odata/type/ODataType";
import TimeOfDay from "sap/ui/model/odata/type/TimeOfDay";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type { CodeList } from "ux/eng/fioriai/reuse/easyfilter/EasyFilter";

type EasyFilterBarState = {};
type FieldMetadata = EasyFilterPropertyMetadata & { maxLength?: number };

/**
 * Delivery for beta release for the easy filter feature.
 */
@defineUI5Class("sap.fe.macros.EasyFilterBar")
export default class EasyFilterBar extends BuildingBlock implements IViewStateContributor<EasyFilterBarState> {
	@implementInterface("sap.fe.core.controllerextensions.viewState.IViewStateContributor")
	__implements__sap_fe_core_controllerextensions_viewState_IViewStateContributor!: boolean;

	@association({ type: "sap.fe.macros.filterBar.FilterBarAPI" })
	filterBar!: string;

	@association({ type: "sap.fe.macros.contentSwitcher.ContentSwitcher" })
	contentSwitcher!: string;

	@property({ type: "string" })
	contentSwitcherKey?: string;

	@property({ type: "string" })
	contextPath?: string;

	@aggregation({ type: "sap.fe.controls.easyFilter.EasyFilterBarContainer" })
	content?: EnhanceWithUI5<EasyFilterBarContainer>;

	private filterBarMetadata!: FieldMetadata[];

	private easyFilterPath?: string;

	private recommendedQueries?: string[];

	constructor(properties: $ControlSettings & PropertiesOf<EasyFilterBar>, others?: $ControlSettings) {
		super(properties, others);
		this.getAppComponent()
			?.getEnvironmentCapabilities()
			.prepareFeature("MagicFiltering")
			.then(() => {
				this.easyFilterPath = "ux/eng/fioriai/reuse/easyfilter/EasyFilter";
				this.content?.setEasyFilterLib(this.easyFilterPath);
				return;
			})
			.catch((error) => {
				Log.debug("Error while loading EasyFilter", error);
				return undefined;
			});
	}

	async applyLegacyState(
		getContrilState?: (control: ManagedObject) => ControlState,
		oNavParameters?: NavigationParameter,
		_shouldApplyDiffState?: boolean,
		_skipMerge?: boolean
	): Promise<void> {
		if (oNavParameters?.selectionVariant) {
			const selectOptionsNames = oNavParameters.selectionVariant.getSelectOptionsPropertyNames();
			this.filterBarMetadata.forEach((field) => {
				if (selectOptionsNames.includes(field.name)) {
					field.defaultValue = oNavParameters.selectionVariant!.getSelectOption(field.name)?.reduce((acc, option) => {
						if (option.Sign === "I") {
							if (option.Option === FilterOperator.BT || option.Option === FilterOperator.NB) {
								if (option.High !== null && option.High !== undefined) {
									acc.push({ operator: option.Option, selectedValues: [option.Low, option.High] });
								}
							} else {
								acc.push({
									operator: option.Option as Exclude<FilterOperator, FilterOperator.BT | FilterOperator.NB>,
									selectedValues: [option.Low]
								});
							}
						} else {
							acc.push({ operator: FilterOperator.NE, selectedValues: [option.Low] });
						}
						return acc;
					}, [] as TokenSelectedValuesDefinition[]);
				}
			});
			this.content?.resetState(false);
		}
		return Promise.resolve(undefined);
	}

	applyState(_state: EasyFilterBarState, _oNavParameters?: NavigationParameter): Promise<void> | void {
		return undefined;
	}

	retrieveState(): EasyFilterBarState | null {
		return {};
	}

	getApplicationId(): string {
		return this.getAppComponent()?.getManifestEntry("sap.app").id ?? "<unknownID>";
	}

	onMetadataAvailable(): void {
		this.filterBarMetadata = this.prepareFilterBarMetadata();
		this.recommendedQueries = this.getAppComponent()?.getManifestEntry("sap.fe")?.macros?.easyFilter?.recommendedQueries ?? [];
		this.content = this.createContent() as EnhanceWithUI5<EasyFilterBarContainer>;
		this.content.filterBarMetadata = this.filterBarMetadata;
	}

	private getUnitForProperty(prop: Property, basePath: string): string | undefined {
		const unitAnnotation = prop.annotations.Measures?.ISOCurrency ?? prop.annotations.Measures?.Unit;
		return isPathAnnotationExpression(unitAnnotation) ? `${basePath}/${unitAnnotation.path}` : undefined;
	}

	private getDefaultValueForFilterField(
		field: FilterField,
		startupParameters: Record<string, unknown>
	): TokenSelectedValuesDefinition[] | undefined {
		let defaultValue: TokenSelectedValuesDefinition[] | undefined;
		if (startupParameters.hasOwnProperty(field.name)) {
			defaultValue = [
				{
					operator: FilterOperator.EQ,
					selectedValues: startupParameters[field.name] as TokenSelectedValuesDefinition["selectedValues"]
				}
			];
		} else if (field.isParameter && startupParameters.hasOwnProperty(field.name.substring(2))) {
			defaultValue = [
				{
					operator: FilterOperator.EQ,
					selectedValues: startupParameters[field.name.substring(2)] as TokenSelectedValuesDefinition["selectedValues"]
				}
			];
		}
		return defaultValue;
	}

	private getEditStateFilterMetadata(metaModel: ODataMetaModel): FieldMetadata {
		// Assemble the code list for the editing status filter values:
		const props = new JSONModel({
			isDraftCollaborative: ModelHelper.isCollaborationDraftSupported(metaModel)
		}).createBindingContext("/");

		const editingStatusCodeList = DraftEditState.getEditStatesContext(props)
			.getObject("/")
			.map((state: { id: string; display: string }) => ({ value: state.id, description: state.display }));

		return {
			name: "$editState",
			label: this.getTranslatedText("FILTERBAR_EDITING_STATUS"),
			dataType: "Edm.String",
			filterable: true,
			codeList: editingStatusCodeList,
			type: "MenuWithSingleSelect"
		};
	}

	private getTokenType(prop: Property, filterRestriction: string): TokenType {
		if (hasValueHelpWithFixedValues(prop)) {
			return filterRestriction === "SingleValue" ? "MenuWithSingleSelect" : "MenuWithCheckBox";
		}
		switch (prop.type) {
			case "Edm.Date":
				return "Calendar";
			case "Edm.TimeOfDay":
				return "Time";
			default:
				return "ValueHelp";
		}
	}

	private getLabel(element: Property | NavigationProperty | EntityType | ComplexType): string | undefined {
		const label = element.annotations.Common?.Label?.toString();
		const headerInfoTypeName = isEntityType(element) ? (element.annotations.UI?.HeaderInfo?.TypeName?.valueOf() as string) : undefined;
		const result = headerInfoTypeName || label;

		if (this.isComplexProperty(element) || isNavigationProperty(element)) {
			return result || this.getLabel(element.targetType);
		}

		return result;
	}

	private isScalarProperty(element: unknown): element is Property & { targetType?: TypeDefinition } {
		return isProperty(element) && !isComplexType(element.targetType);
	}

	private isComplexProperty(element: unknown): element is Property & { targetType: ComplexType } {
		return isProperty(element) && isComplexType(element.targetType);
	}

	prepareFilterBarMetadata(): FieldMetadata[] {
		/*
		 * 1. INITIALIZATION:
		 *    - Queue all root entity properties and navigation properties for traversal
		 *    - Initialize result array and elimination set for Common.Text targets
		 *
		 * 2. BREADTH-FIRST TRAVERSAL:
		 *    For each path in queue:
		 *    - Skip UI.Hidden properties
		 *    - Scalar properties: Generate metadata, track Common.Text targets for elimination
		 *    - Complex properties: Add child properties to queue
		 *    - Navigation properties: Add target EntityType properties to queue
		 *      (Collections only if explicit filter fields exist, respect depth limits)
		 *
		 * 3. POST-PROCESSING:
		 *    - Add $editState filter for draft-enabled entities
		 *    - Remove properties marked for elimination (except explicit filter fields)
		 */
		const owner = this._getOwner()!;
		const definitionForPage = owner.preprocessorContext?.getDefinitionForPage();

		if (!definitionForPage) {
			return [];
		}

		const filterBarDef = definitionForPage.getFilterBarDefinition({});
		const metaPath = definitionForPage.getMetaPath();
		const entitySet = metaPath.getClosestEntitySet() as EntitySet;

		let filterExpressionRestrictions = entitySet.annotations.Capabilities?.FilterRestrictions?.FilterExpressionRestrictions ?? [];

		// TODO: Maybe we can simplify this by using restrictions on the main entity set only
		for (const navigationProperty in entitySet.navigationPropertyBinding) {
			if (entitySet.navigationPropertyBinding[navigationProperty]?._type === "EntitySet") {
				// FIXME: optional chaining should not be needed here -> root cause fix pending
				const navigationPropertyEntitySet = entitySet.navigationPropertyBinding[navigationProperty] as EntitySet;
				const navPropertyFilterExpressionRestrictions =
					navigationPropertyEntitySet.annotations.Capabilities?.FilterRestrictions?.FilterExpressionRestrictions ?? [];

				const currentFilterRestrictions = [...filterExpressionRestrictions];
				filterExpressionRestrictions = [
					...filterExpressionRestrictions,
					...navPropertyFilterExpressionRestrictions.filter((restriction) => !currentFilterRestrictions.includes(restriction))
				];
			}
		}

		const metaModel = owner.preprocessorContext?.models.metaModel as ODataMetaModel;

		const getCodeList = (lastPathSegment: Property, propertyPath: string): CodeList | (() => Promise<CodeList>) | undefined =>
			hasValueHelpWithFixedValues(lastPathSegment)
				? async (): Promise<CodeList> => this.getCodeListForProperty(propertyPath)
				: undefined;

		const filterFields = filterBarDef
			.getFilterFields()
			.filter((field: FilterField) => !field.getTarget()?.annotations?.UI?.HiddenFilter?.valueOf());

		const startupParameters = owner.getAppComponent().getComponentData()?.startupParameters ?? {};

		const maxDepth = 1; // Maximum depth for navigation properties

		// Initialize traversal queue with all entity properties and navigation properties.
		// Each path to traverse is a list of segments (e.g. [navProp1, complexProp1, complexProp2, scalarProp])
		const pathsToExplore: (Property | NavigationProperty)[][] = [
			...entitySet.entityType.entityProperties,
			...entitySet.entityType.navigationProperties
		].map((element) => [element]);

		// Resulting metadata array
		const result: EasyFilterPropertyMetadata[] = [];

		// Set of property paths to be eliminated from the filter bar metadata
		const pathsToEliminate = new Set<string>();

		const getPathLabel = (path: (Property | NavigationProperty)[]): string => {
			const pathLabels = path.map((e) => this.getLabel(e) || `[${e.name}]`);
			return Localization.getRTL() ? pathLabels.slice().reverse().join(" - ") : pathLabels.join(" - ");
		};

		while (pathsToExplore.length > 0) {
			const currentPath = pathsToExplore.shift()!;

			const navigationDepth = currentPath.filter(isNavigationProperty).length;

			const lastPathSegment = currentPath[currentPath.length - 1];

			if (lastPathSegment.annotations.UI?.Hidden?.valueOf() === true) {
				continue;
			}

			const pathString = [`/${entitySet.name}`, ...currentPath.slice(0, -1).map((e) => e.name)].reduce(
				(acc, curr) => `${acc}/${curr}`
			);
			const propertyPath = `${pathString}/${lastPathSegment.name}`;

			if (this.isScalarProperty(lastPathSegment)) {
				// Check for Common.Text annotation and record the annotation target path for elimination
				const textAnnotation = lastPathSegment.annotations.Common?.Text;
				if (isPathAnnotationExpression(textAnnotation)) {
					// Construct the full path to the target property
					pathsToEliminate.add(`${pathString}/${textAnnotation.path}`);
				}

				// Scalar property: create metadata for the property
				const filterField = filterFields.find((field) => field.getTarget() === lastPathSegment);
				const filterRestriction = filterExpressionRestrictions.find(
					(expression) => expression.Property?.$target === lastPathSegment
				);
				const filterable = isPathFilterable(this.getDataModelObjectPath(propertyPath));
				const filterableExpression = isConstant(filterable) ? filterable.value : true;
				const filterRestrictionExpression = filterRestriction?.AllowedExpressions as
					| EasyFilterPropertyMetadata["filterRestriction"]
					| undefined;
				const codeList = getCodeList(lastPathSegment, propertyPath);
				const metadata: EasyFilterPropertyMetadata = {
					name: propertyPath,
					label: getPathLabel(currentPath),
					dataType: lastPathSegment.type,
					required: filterField?.required,
					defaultValue: filterField ? this.getDefaultValueForFilterField(filterField, startupParameters) : undefined,
					filterable: filterField ? filterableExpression : undefined,
					hiddenFilter: !filterField,
					filterRestriction: filterField ? filterRestrictionExpression : undefined,
					codeList,
					type: this.getTokenType(
						lastPathSegment,
						filterRestriction?.AllowedExpressions?.toString() || "MultiRangeOrSearchExpression"
					) as Exclude<TokenType, "ValueHelp">,
					unit: this.getUnitForProperty(lastPathSegment, pathString)
				};
				result.push(metadata);
			} else if (this.isComplexProperty(lastPathSegment)) {
				// Complex property: add all properties and navigation properties of the complex type
				lastPathSegment.targetType.properties.forEach((child) => {
					pathsToExplore.push([...currentPath, child]);
				});

				// only traverse navigation properties if we are not at the maximum depth
				if (navigationDepth < maxDepth) {
					lastPathSegment.targetType.navigationProperties.forEach((child) => {
						pathsToExplore.push([...currentPath, child]);
					});
				}
			} else if (isNavigationProperty(lastPathSegment)) {
				// add 1:n navigation properties only if there are filter fields for at least one of the target properties
				if (lastPathSegment.isCollection && !filterFields.some((field) => field.annotationPath?.startsWith(propertyPath))) {
					continue;
				}

				lastPathSegment.targetType.entityProperties.forEach((child) => {
					pathsToExplore.push([...currentPath, child]);
				});

				// only traverse navigation properties if we are not at the maximum depth
				if (navigationDepth < maxDepth) {
					lastPathSegment.targetType.navigationProperties.forEach((child) => {
						pathsToExplore.push([...currentPath, child]);
					});
				}
			}
		}

		// [Editing Status]
		if (ModelHelper.isMetaPathDraftSupported(definitionForPage.getMetaPath() as unknown as MetaPath<unknown>)) {
			result.push(this.getEditStateFilterMetadata(metaModel));
		}

		// Remove properties marked for elimination (unless they are filter fields)
		return result.filter((metadata) => {
			return (
				!metadata.hiddenFilter || // Keep if explicit filter field
				!pathsToEliminate.has(metadata.name) // Keep if path not marked for elimination
			);
		});
	}

	async getCodeListForProperty(propertyPath: string): Promise<CodeList> {
		const defaultValueList = await this.getValueList(propertyPath);

		if (!defaultValueList) {
			return [];
		}

		const valueListInfo = defaultValueList.valueListInfo;

		const listBinding = valueListInfo.$model.bindList(`/${valueListInfo.CollectionPath}`, undefined, undefined, undefined, {
			$select: generateSelectParameter(defaultValueList)
		});
		const data = await listBinding.requestContexts();

		const filterGroupValues = data.map(mapValueListToCodeList(defaultValueList));
		const codeListProperty = this.filterBarMetadata.find((field) => field.name === propertyPath);
		if (codeListProperty) {
			codeListProperty.codeList = filterGroupValues;
		}
		return filterGroupValues;
	}

	async resolveTokenValuesForField(
		fieldName: string,
		values: TokenSelectedValuesDefinition[]
	): Promise<ValueHelpSelectedValuesDefinition[]> {
		const field = this.filterBarMetadata.find(({ name }) => name === fieldName);
		let result: ValueHelpSelectedValuesDefinition[];

		if (!field) {
			// return original values converted to the expected format if no field is defined
			return unresolvedResult(values);
		}
		const valueList = await this.getValueList(field.name);

		if (valueList && ValueListHelper.isValueListSearchable(field.name, valueList)) {
			const resolvedTokenValues = await Promise.all(values.map(async (value) => resolveTokenValue(valueList, value)));
			result = resolvedTokenValues.flat();
		} else {
			result = unresolvedResult(values);
		}

		// Apply maxLength filtering if defined
		if (field.maxLength !== undefined) {
			const filteredTokens = result
				.map((token) => {
					if (token.operator === FilterOperator.BT || token.operator === FilterOperator.NB) {
						// Handle between operators - selectedValues is ValueHelpBetweenSelectedValues
						const [a, b] = token.selectedValues;

						// Check if both values exceed maxLength
						if (String(a.value).length <= field.maxLength! && String(b.value).length <= field.maxLength!) {
							return token; // Keep the token if both values are within limit
						} else {
							return null; // Remove the token if either value exceeds limit
						}
					} else {
						// Handle other operators - selectedValues is CodeListType[]
						const filtered: CodeListType[] = token.selectedValues.filter(
							(selectedValue) => String(selectedValue.value).length <= field.maxLength!
						);

						// Only return the token if there are remaining values after filtering
						if (filtered.length > 0) {
							return { ...token, selectedValues: filtered };
						} else {
							return null; // Remove the token if no values remain
						}
					}
				})
				.filter((token): token is ValueHelpSelectedValuesDefinition => token !== null);

			return filteredTokens;
		}

		// if no maxLength is defined, return unfiltered result
		return result;
	}

	async getValueList(fieldName: string): Promise<ValueListInfo | undefined> {
		const metaModel = this.getMetaModel()!;
		const valueLists = await ValueListHelper.getValueListInfo(undefined, fieldName, undefined, metaModel);
		return valueLists[0];
	}

	async onTokensChanged(e: UI5Event<{ tokens: TokenDefinition[] }, EasyFilterBarContainer>): Promise<void> {
		const filterBar = UI5Element.getElementById(this.filterBar) as FilterBar;
		const filterBarAPI = filterBar.getParent() as FilterBarAPI;
		const tokens = e.getParameter("tokens");
		const clearEditFilter = tokens.some((tokenDefinition) => tokenDefinition.key === "$editState");
		await filterBarAPI._clearFilterValuesWithOptions(filterBar, { clearEditFilter });
		this.formateDataTypes(tokens);

		for (const token of tokens) {
			if (token.key === "$editState") {
				// convert the $editState filter condition
				for (const tokenKeySpecification of token.keySpecificSelectedValues) {
					await FilterUtils.addFilterValues(
						filterBarAPI.content,
						token.key,
						"DRAFT_EDIT_STATE",
						tokenKeySpecification.selectedValues
					);
				}
			} else {
				const field = this.filterBarMetadata.find((f) => f.name === token.key)!;
				for (const tokenKeySpecification of token.keySpecificSelectedValues) {
					const { operator, selectedValues } = tokenKeySpecification;
					await FilterUtils.addFilterValues(filterBarAPI.content, field.name, operator, selectedValues);
				}
			}
		}
		await filterBarAPI.triggerSearch();
	}

	//We need the below function so that the date objects and dateTimeOffsets would be converted to string type as the date object is not a valid type in V4 world
	formateDataTypes(tokens: TokenDefinition[]): void {
		const dateType = new Date1(),
			dateTimeOffsetType = new DateTimeOffset(undefined, { V4: true }),
			timeOfDayType = new TimeOfDay();
		tokens.forEach((token) => {
			const edmType = this.filterBarMetadata.find((data) => data.name === token.key)?.dataType;
			token.keySpecificSelectedValues.forEach((keySpecificSelectedValue) => {
				let requiredConverter: ODataType;
				switch (edmType) {
					case "Edm.Date":
						requiredConverter = dateType;
						break;
					case "Edm.TimeOfDay":
						requiredConverter = timeOfDayType;
						break;
					case "Edm.DateTimeOffset":
						requiredConverter = dateTimeOffsetType;
						break;
					default:
						return;
				}
				keySpecificSelectedValue.selectedValues.forEach((value, idx) => {
					keySpecificSelectedValue.selectedValues[idx] = requiredConverter.parseValue(value, "object");
				});
			});
		});
	}

	async showValueHelpForKey(key: string): Promise<ConditionObject[]> {
		const field = this.filterBarMetadata.find((f) => f.name === key)!;
		const filterBar = UI5Element.getElementById(this.filterBar) as FilterBar;
		const filterBarAPI = filterBar.getParent() as FilterBarAPI;
		await filterBarAPI.showFilterField(field.name);
		return filterBarAPI.openValueHelpForFilterField(field.name);
	}

	onBeforeQueryProcessing(): void {
		const uiModel = this.getModel("ui") as JSONModel;
		BusyLocker.lock(uiModel);
	}

	onAfterQueryProcessing(): void {
		const uiModel = this.getModel("ui") as JSONModel;
		BusyLocker.unlock(uiModel);
	}

	async onClearFilters(): Promise<void> {
		// Empty input: clear the filters and refresh the list
		const filterBar = UI5Element.getElementById(this.filterBar) as FilterBar;
		const filterBarAPI = filterBar.getParent() as FilterBarAPI;
		await filterBarAPI._clearFilterValuesWithOptions(filterBar);
		await filterBarAPI.triggerSearch();
	}

	onQueryChanged(): void {
		const filterBar = UI5Element.getElementById(this.filterBar) as FilterBar;
		filterBar.fireFiltersChanged({ conditionsBased: true });
	}

	private async handleShowValueHelp(event: EasyFilterBarContainer$ShowValueHelpEvent): Promise<void> {
		const key = event.getParameter("key");
		const resolve = event.getParameter("resolve");
		const reject = event.getParameter("reject");

		try {
			const conditions = await this.showValueHelpForKey(key);

			const selectedValues = conditions.map(async (condition) => {
				const operator = condition.operator as FilterOperator;

				if (condition.validated === "NotValidated") {
					// not validated: the condition only has values without description - try to get the description using the data fetcher mechanism.
					// `condition.values` is a single value `[value]` (or `[lower bound, upper bound]` for BT/NB operators).
					const conditionToResolve: TokenSelectedValuesDefinition =
						operator === FilterOperator.BT || operator === FilterOperator.NB
							? { operator, selectedValues: [condition.values[0], condition.values[1]] }
							: { operator, selectedValues: [condition.values[0]] };

					return this.resolveTokenValuesForField(key, [conditionToResolve]);
				} else if (operator !== FilterOperator.BT && operator !== FilterOperator.NB) {
					// validated: both value and description are available - directly map them to the result
					// `condition.values` is a tuple of `[value, description?]`
					const [value, description] = condition.values as [string | number | boolean, string | undefined];
					return Promise.resolve([{ operator, selectedValues: [{ value, description: description ?? value }] }]);
				} else {
					// should not occur: BT/NB are expected to be "NotValidated" conditions
					Log.warning(`Unexpected condition for field ${key}: operator ${operator} with values ${condition.values}.`);
					return Promise.resolve([]);
				}
			});

			const resolvedValues = await Promise.all(selectedValues);
			resolve(resolvedValues.flat());
		} catch (error) {
			reject(error instanceof Error ? error : new Error(String(error)));
		}
	}

	createContent(): EasyFilterBarContainer {
		return (
			<EasyFilterBarContainer
				contextPath={this.getOwnerContextPath()}
				appId={this.getApplicationId()}
				filterBarMetadata={this.filterBarMetadata}
				easyFilterLib={this.easyFilterPath}
				showValueHelp={this.handleShowValueHelp.bind(this)}
				dataFetcher={this.resolveTokenValuesForField.bind(this)}
				recommendedValues={this.recommendedQueries}
				queryChanged={this.onQueryChanged.bind(this)}
				tokensChanged={this.onTokensChanged.bind(this)}
				beforeQueryProcessing={this.onBeforeQueryProcessing.bind(this)}
				afterQueryProcessing={this.onAfterQueryProcessing.bind(this)}
				clearFilters={this.onClearFilters.bind(this)}
			/>
		);
	}
}
