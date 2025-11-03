/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Button from "sap/m/Button";
import ComboBox from "sap/m/ComboBox";
import CustomListItem from "sap/m/CustomListItem";
import HBox from "sap/m/HBox";
import Input from "sap/m/Input";
import List from "sap/m/List";
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";
import type Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import Control, { $ControlSettings } from "sap/ui/core/Control";
import type { MetadataOptions } from "sap/ui/core/Element";
import CoreElement from "sap/ui/core/Element";
import ListItem from "sap/ui/core/ListItem";
import RenderManager from "sap/ui/core/RenderManager";
import { ValueState } from "sap/ui/core/library";
import type Context from "sap/ui/model/Context";
import Filter from "sap/ui/model/Filter";
import type Model from "sap/ui/model/Model";
import Sorter from "sap/ui/model/Sorter";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ResourceModel from "sap/ui/model/resource/ResourceModel";
import { getPreviewItems } from "../../helpers/IntegrationCardHelper";
import type { NavigationParameter, Property } from "../../types/PropertyTypes";

export type CriticalityOptions = {
	name: string;
	value?: string;
	activeCalculation?: boolean;
	isNavigationForId?: boolean;
	navigationKeyForId?: string;
	propertyKeyForId?: string;
	criticality?: string;
	isNavigationForDescription?: boolean;
	navigationalPropertiesForId?: Property[];
	valueState: ValueState;
	valueStateText: string;
	navigationValueState?: ValueState;
	navigationValueStateText?: string;
};

export type PropertyInfo = {
	label?: string;
	type?: string;
	name?: string;
	value?: string | number;
	category?: string;
};

export default interface ICriticalityEditor {
	addButton: Button;
	list: List;
	getType(): string;
	getSelectionKeys(): object;
	getItems(): Array<CriticalityOptions>;
}

export interface CriticalitySettings extends $ControlSettings {
	type: string;
	selectionKeys: object;
	items: object;
	change?: (event: CriticalityEditorChangeEvent) => void;
	navigationSelectionKeys: object;
}
interface CriticalityEditorChangeEventParameters {
	value?: object;
	isCalcuationType?: boolean;
	selectedItem?: object;
}

interface SelectionKeyMap {
	name?: string;
	label?: string;
}

type CriticalityEditorChangeEvent = Event<CriticalityEditorChangeEventParameters>;

/**
 * @namespace sap.cards.ap.generator.app.controls
 */
export default class CriticalityEditor extends Control {
	list!: List;
	addButton!: Button;
	separatorColon!: Text;
	deleteButton!: Button;
	propertyComboBox!: ComboBox;
	setSelectionKeysMap!: SelectionKeyMap;
	propertyFilter!: Filter;
	itemsMap!: CriticalityOptions;
	criticalityComboBox!: ComboBox;
	criticalityCalculator!: VBox;
	criticalityComboBoxModel!: ComboBox;
	staticCriticality!: Array<PropertyInfo>;
	_idNavigationComboBox!: ComboBox;

	static readonly metadata: MetadataOptions = {
		properties: {
			type: "string",
			selectionKeys: { type: "object", defaultValue: {} },
			navigationSelectionKeys: { type: "object", defaultValue: {} },
			items: { type: "object", defaultValue: {} }
		},
		aggregations: {
			list: { type: "sap.m.List", multiple: false, visibility: "hidden" }
		},
		events: {
			change: {
				parameters: {
					value: { type: "object" },
					isCalcuationType: { type: "boolean" },
					selectedItem: { type: "object" }
				}
			},
			selectionChange: {
				parameters: {
					value: { type: "int" }
				}
			}
		}
	};

	constructor(settings: CriticalitySettings) {
		super(settings);
		this.setCriticalityModel();
	}

	static renderer = {
		apiVersion: 2,
		render: function (rm: RenderManager, control: ICriticalityEditor): void {
			if (control.getType() === "COMPACT") {
				control.addButton.setVisible(false);
			}
			rm.openStart("div", control);
			rm.openEnd();
			rm.renderControl(control.list);
			rm.renderControl(control.addButton);
			rm.close("div");
		}
	};

	/**
	 * Initializes the CriticalityEditor custom control
	 *
	 * This method sets up various controls and event handlers used by the methods in this control
	 *
	 * @returns {void}
	 */

	init(): void {
		this.list = new List({
			showSeparators: "Inner",
			showNoData: false
		});
		this.propertyComboBox = new ComboBox({
			valueState: "{= ${valueState} }",
			valueStateText: "{= ${valueStateText} }",
			selectionChange: (event: Event) => {
				this.handleComboBoxEvents.call(this, event, false);
			},
			width: "100%",
			change: (event) => {
				const source: ComboBox = event.getSource();
				const bindingContext = source.getBindingContext() as Context;
				const path = bindingContext?.getPath() || "";
				const model = this.getModel() as JSONModel;
				const selectedItem = model.getProperty(path);
				this.fireEvent("change", {
					value: this.getItems(),
					selectedItem,
					isCalcuationType: model.getProperty(path)?.activeCalculation || false
				});
			}
		});
		this._idNavigationComboBox = new ComboBox({
			visible: "{= !!${isNavigationForId} }",
			width: "100%",
			valueState: "{= ${navigationValueState} }",
			valueStateText: "{= ${navigationValueStateText} }",
			change: () => {
				this.fireEvent("change", {
					value: this.getItems()
				});
			},
			selectionChange: (event: Event) => {
				this.handleComboBoxEvents.call(this, event, true);
			}
		}).addStyleClass("sapUiTinyMarginBegin");

		this.separatorColon = new Text({ text: ":" }).addStyleClass("sapUiTinyMarginTop sapUiTinyMarginBeginEnd");

		this.criticalityComboBox = new ComboBox({
			width: "100%",
			change: (event) => {
				const source: ComboBox = event.getSource();
				const bindingContext = source.getBindingContext() as Context;
				const path = bindingContext?.getPath() || "";
				const model = this.getModel() as JSONModel;
				const selectedKey = event.getSource().getSelectedKey();
				if (this.getType() === "COMPACT") {
					const sourceCriticalityCalculationPath =
						"/configuration/advancedFormattingOptions/sourceCriticalityProperty/0/activeCalculation";
					model.setProperty(
						sourceCriticalityCalculationPath,
						String(bindingContext?.getObject("hostCriticality")) === "Calculation"
					);
					model.setProperty("/configuration/advancedFormattingOptions/selectedKeyCriticality", selectedKey);
				} else {
					model.getProperty(path).activeCalculation = String(bindingContext?.getObject("criticality")) === "Calculation";
					model.setProperty("/configuration/advancedFormattingOptions/sourceCriticalityProperty/0/hostCriticality", selectedKey);
				}

				const isSelectedKey = selectedKey ? true : false;
				model.setProperty("/configuration/advancedFormattingOptions/isCriticalityApplied", isSelectedKey);

				this.fireEvent("change", {
					value: this.getItems(),
					isCalcuationType: this.getModel()?.getProperty(path)?.activeCalculation || false
				});
			}
		});

		this.criticalityCalculator = new VBox({
			visible: "{= !!${activeCalculation} }",
			items: [
				new HBox({
					justifyContent: "SpaceAround",
					items: [
						new Text({ textAlign: "End", width: "150px", text: "{i18n>CRITICALITY_CONTROL_TOL_RANGE}" }).addStyleClass(
							"sapUiTinyMarginTop"
						),
						new Input({
							value: "{toleranceRangeLowValue}",
							placeholder: "{i18n>CRITICALITY_CONTROL_LOW}",
							width: "80px"
						}).addStyleClass("sapUiTinyMarginBeginEnd"),
						new Input({
							value: "{toleranceRangeHighValue}",
							placeholder: "{i18n>CRITICALITY_CONTROL_HIGH}",
							width: "80px"
						}).addStyleClass("sapUiTinyMarginBeginEnd")
					]
				}),
				new HBox({
					justifyContent: "SpaceAround",
					items: [
						new Text({ textAlign: "End", width: "150px", text: "{i18n>CRITICALITY_CONTROL_DEV_RANGE}" }).addStyleClass(
							"sapUiTinyMarginTop"
						),
						new Input({
							value: "{deviationRangeLowValue}",
							placeholder: "{i18n>CRITICALITY_CONTROL_LOW}",
							width: "80px"
						}).addStyleClass("sapUiTinyMarginBeginEnd"),
						new Input({
							value: "{deviationRangeHighValue}",
							placeholder: "{i18n>CRITICALITY_CONTROL_HIGH}",
							width: "80px"
						}).addStyleClass("sapUiTinyMarginBeginEnd")
					]
				}),
				new HBox({
					justifyContent: "SpaceAround",
					items: [
						new Text({
							textAlign: "End",
							width: "150px",
							text: "{i18n>CRITICALITY_CONTROL_IMP_DIRECTION}"
						}).addStyleClass("sapUiTinyMarginTop"),
						new ComboBox({
							value: "{improvementDirection}",
							width: "176px",
							items: [
								new ListItem({ key: "{i18n>CRITICALITY_CONTROL_MINIMIZE}", text: "Minimize" }),
								new ListItem({ key: "{i18n>CRITICALITY_CONTROL_TARGET}", text: "Target" }),
								new ListItem({ key: "{i18n>CRITICALITY_CONTROL_MAXIMIZE}", text: "Maximize" })
							]
						}).addStyleClass("sapUiTinyMarginBeginEnd")
					]
				}),
				new HBox({
					justifyContent: "End",
					items: [
						new Button({
							text: "{i18n>CRITICALITY_CONTROL_APPLY}",
							width: "176px",
							type: "Ghost",
							press: (event) => {
								const source: ComboBox = event.getSource();
								const bindingContext = source.getBindingContext() as Context;
								const path = bindingContext.getPath() || "";
								this.fireEvent("change", {
									value: this.getItems(),
									isCalcuationType: this.getModel()?.getProperty(path)?.activeCalculation || false
								});
							}
						}).addStyleClass("sapUiTinyMarginBeginEnd")
					]
				})
			]
		}).addStyleClass("sapUiTinyMarginBottom");

		this.addButton = new Button({
			icon: "sap-icon://add",
			type: "Transparent",
			press: this.onAddButtonClicked.bind(this)
		});

		this.deleteButton = new Button({
			icon: "sap-icon://delete",
			type: "Transparent",
			press: this.onDeleteButtonClicked.bind(this)
		});
	}

	/**
	 * Performs actions after CriticalityEditor custom control has been rendered
	 *
	 * This method is called after the control has been rendered in the UI. It fetches the selection keys
	 *
	 * @returns {void}
	 */

	onAfterRendering(): void {
		const entityData = JSON.parse(JSON.stringify(this.getSelectionKeys()));
		const selectPropertyText = this.getModel("i18n")?.getObject("CRITICALITY_CONTROL_SELECT_PROP");
		const selectOthersText = this.getModel("i18n")?.getObject("CRITICALITY_CONTROL_SELECT_OTHERS");

		entityData.forEach((entity: PropertyInfo) => {
			const nameKey = this.setSelectionKeysMap.name as keyof PropertyInfo;
			const labelKey = this.setSelectionKeysMap.label as keyof PropertyInfo;

			entity.category = this.isPotentialCriticality(entity) ? selectPropertyText : selectOthersText;
			entity.name = `{${entity[nameKey]}}`;
			entity.label = String(entity[labelKey]);
		});

		const mergedEntityData = entityData.concat(this.staticCriticality);
		const criticalityComboBoxModel = this.criticalityComboBox.getModel("internal") as JSONModel;
		criticalityComboBoxModel.setData(mergedEntityData, true);
		criticalityComboBoxModel.refresh();
	}

	/**
	 * Sets the selection keys
	 *
	 * This method forms the setSelectionKeysMap from selectionKeys binding information,
	 * and binds aggregation items for ComboBox controls, updates internal model of text criticality ComboBox
	 * @param {Array<PropertyInfo>} value - The array of selection keys
	 * @returns {void}
	 */
	setSelectionKeys(value: Array<PropertyInfo>): void {
		this.setAggregation("list", this.list);
		this.setProperty("selectionKeys", value);
		this.setProperty("navigationSelectionKeys", value);
		this.setSelectionKeysMap = this.getBindingInfo("selectionKeys").parameters as SelectionKeyMap;
		const propertyBindingPath = this.getBindingPath("navigationSelectionKeys") || "";

		this.propertyFilter = new Filter({
			path: this.setSelectionKeysMap.name
		});
		this.propertyComboBox.bindAggregation("items", {
			path: propertyBindingPath,
			sorter: [new Sorter("category", true, true), new Sorter("label", false)],
			length: 500,
			filters: this.propertyFilter,
			factory: () => {
				return new ListItem({
					key: "{" + this.setSelectionKeysMap.name + "}",
					text: "{" + this.setSelectionKeysMap.label + "}"
				});
			}
		});
		this._idNavigationComboBox.bindAggregation("items", {
			path: "navigationalPropertiesForId/",
			sorter: new Sorter("label", false),
			length: 500,
			factory: function () {
				return new ListItem({
					key: "{name}",
					text: "{labelWithValue}"
				});
			}
		});
		this.criticalityComboBox.setModel(this.getCriticalityModel(), "internal");
		this.criticalityComboBox.bindAggregation("items", {
			path: "internal>/",
			sorter: [new Sorter("category", true, true), new Sorter("label", false)],
			length: 500,
			factory: function () {
				return new ListItem({
					key: "{internal>name}",
					text: "{internal>label}"
				});
			}
		});
	}

	getCriticalityModel() {
		return new JSONModel(this.staticCriticality);
	}

	/**
	 * Sets the items property with the selectionKeys provided
	 * bind items for list control using binding path of items,
	 * creates a custom layout for each item using a HBox and arranging the content within the HBox according to the specified styles
	 *
	 * @param {Array<CriticalityOptions>} selectionKeys - The array of items to be set
	 * @returns {void}
	 */

	setItems(selectionKeys: Array<CriticalityOptions>): void {
		this.setProperty("items", selectionKeys, true);
		this.itemsMap = this.getBindingInfo("items").parameters as CriticalityOptions;
		this.criticalityComboBox.bindProperty("selectedKey", this.itemsMap.value as PropertyBindingInfo);
		this._idNavigationComboBox.bindProperty("selectedKey", { path: "navigationKeyForId" });
		if (this.getType() === "COMPACT") {
			this.criticalityComboBox.setWidth("300px");
			const length = this.criticalityCalculator.getItems().length;
			if (length > 0) {
				this.criticalityCalculator.getItems()[length - 1].setVisible(false);
			}
		}

		this.propertyComboBox.bindProperty("selectedKey", this.itemsMap.name as PropertyBindingInfo);
		const bindingPath = this.getBindingPath("items") ?? "";
		this.list.bindItems({
			path: bindingPath,
			template: new CustomListItem({
				content: [
					new HBox({
						justifyContent: "SpaceAround",
						renderType: "Bare",
						items:
							this.getType() === "COMPACT"
								? [this.criticalityComboBox]
								: [
										this.propertyComboBox,
										this._idNavigationComboBox,
										this.separatorColon,
										this.criticalityComboBox,
										this.deleteButton
									]
					}),
					new HBox({
						justifyContent: this.getType() === "COMPACT" ? "Start" : "SpaceAround",
						items: [this.criticalityCalculator]
					})
				]
			})
		});
	}

	/**
	 *
	 * @param event Event object
	 * @param editor CriticalityEditor instance
	 * @param isNavigation boolean flag to check if the event is for navigation
	 * @returns object
	 */

	handleComboBoxEvents(event: Event, isNavigation: boolean = false) {
		const controlId = (event.getParameter as (param: string) => string)("id");
		const control = CoreElement.getElementById(controlId) as ComboBox;
		let selectedKey = control.getSelectedKey();
		const source = event.getSource();
		const bindingContext = (source as ComboBox).getBindingContext() as Context;
		const path = bindingContext?.getPath() || "";
		const model = this.getModel() as JSONModel;
		const group = model.getProperty(path);

		const navigationProperties: NavigationParameter[] = model.getProperty("/configuration/navigationProperty") || [];
		const isNavigationalProperty = this.hasNavigationProperty(navigationProperties, group?.name);
		if (!isNavigation) {
			group.navigationKeyForId = "";
		}
		if (isNavigationalProperty) {
			group.propertyKeyForId = selectedKey;
			const navProperty = navigationProperties.filter((prop) => prop.name === group?.name);
			group.navigationalPropertiesForId = navProperty?.[0]?.properties || [];
			group.isNavigationForId = group.navigationalPropertiesForId.length > 0;
		} else {
			group.isNavigationForId = false;
		}
		if (isNavigation && selectedKey !== "") {
			selectedKey = `${group.name}/${selectedKey}`;
		}
		const previewItems = getPreviewItems(model);
		const isItemNotSelected = !previewItems.includes(selectedKey);
		this.setValueStateForModel(model, selectedKey, isItemNotSelected);
		model.refresh();
		return group;
	}

	/**
	 * Retrieves the internal model of the CriticalityEditor control
	 *
	 * This method checks if the internal model exists. If not, it creates a new JSON model
	 * and sets it as the internal model. It then returns the internal model
	 *
	 * @returns {sap.ui.model.Model} The internal model of the control
	 */

	protected _getInternalModel(): Model {
		let model = this.getModel("internal");
		if (!model) {
			model = new JSONModel({});
			this.setModel(model, "internal");
		}
		return model;
	}

	/**
	 * Retrieves the items from the model
	 *
	 * This method fetches the items from the model using the binding path for items
	 *
	 * @returns {Array<CriticalityOptions>} An array containing the items retrieved from the model
	 */

	getItems(): Array<CriticalityOptions> {
		const path = this.getBindingPath("items") || "";
		return (this.getModel() as JSONModel).getProperty(path);
	}
	/**
	 * Handles the click event of the add button, adds a new item to the array and refreshes the model
	 *
	 * @returns {void}
	 */

	onAddButtonClicked(): void {
		const model = this.getModel();
		const path = this.getBindingPath("items") || "";
		if (model) {
			let boundData = model.getProperty(path);
			if (!boundData) {
				boundData = [];
			}
			boundData.push({});
			model.refresh();
		}
	}

	/**
	 * Handles the click event of the delete button, removes item to be deleted, refreshes the model and fires a change event
	 *
	 * @param {Event} event - The event object representing the click event
	 * @returns {void}
	 */

	onDeleteButtonClicked(event: Event): void {
		let itemBindingPath = this.getBindingPath("items");
		const model = this.getModel() as JSONModel;
		const sourceCriticalityPropertyName =
			model.getProperty("/configuration/advancedFormattingOptions/sourceCriticalityProperty/0/name") || "";
		const criticalityData = model.getProperty("/configuration/mainIndicatorOptions/criticality") || [];
		let path;

		if (this.getType() === "COMPACT") {
			if (sourceCriticalityPropertyName) {
				const index = criticalityData.findIndex((data: CriticalityOptions) => data?.name === sourceCriticalityPropertyName);
				if (index !== -1) {
					path = `/configuration/mainIndicatorOptions/criticality/${index}`;
					model.setProperty("/configuration/advancedFormattingOptions/sourceCriticalityProperty", []);
					itemBindingPath = "/configuration/mainIndicatorOptions/criticality";
				}
			}
		} else {
			const source: ComboBox = event.getSource();
			const bindingContext = source.getBindingContext() as Context;
			path = bindingContext.getPath() || "";
			const propertyName = model.getProperty(path) && model.getProperty(path).name;
			if (propertyName === sourceCriticalityPropertyName) {
				model.setProperty("/configuration/advancedFormattingOptions/sourceCriticalityProperty", []);
			}
		}

		if (path && itemBindingPath) {
			model.getProperty(itemBindingPath).splice(path.slice(path.length - 1), 1);
			model.refresh();
			this.fireEvent("change", {
				value: this.getItems()
			});
		}
	}

	isPotentialCriticality(property: PropertyInfo): boolean {
		switch (property.type) {
			case "Edm.Date":
			case "Edm.Boolean":
			case "Edm.Guid":
			case "Edm.DateTimeOffset":
				return false;
			case "Edm.Decimal":
			case "Edm.Byte":
			case "Edm.Int32":
				if (typeof property.value === "number" && property.value > -2 && property.value < 6) {
					return true;
				}
				return false;
			case "Edm.String":
				switch (property.value) {
					case null:
					case "-1":
					case "0":
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "Positive":
					case "Negative":
					case "Neutral":
					case "Critical":
					case "VeryNegative":
					case "VeryPositive":
					case "Information":
						return true;
					default:
						return false;
				}
			default:
				return false;
		}
	}

	/**
	 * Sets the static criticality data
	 * This method fetches the criticality category and assigns it to the static criticality items.
	 */
	setCriticalityModel(): void {
		const criticalityCategory = this.getModel("i18n")?.getObject("CRITICALITY_CONTROL_SELECT_CRITICALITY");

		this.staticCriticality = [
			{
				name: "Neutral",
				label: "Neutral",
				category: criticalityCategory
			},
			{
				name: "Good",
				label: "Positive",
				category: criticalityCategory
			},
			{
				name: "Critical",
				label: "Critical",
				category: criticalityCategory
			},
			{
				name: "Error",
				label: "Negative",
				category: criticalityCategory
			},
			{
				name: "Calculation",
				label: "Create Calculation",
				category: "Calculation:"
			}
		];
	}
	/**
	 * Checks if a specific property exists within the given navigation properties.
	 *
	 * @param {NavigationParameter[]} navigationProperties - An array of navigation parameters to search through.
	 * @param {string} propertyToCheck - The name of the property to check for.
	 * @returns {boolean} True if the property exists in the navigation properties, otherwise false.
	 */
	hasNavigationProperty(navigationProperties: NavigationParameter[], propertyToCheck: string): boolean {
		return navigationProperties.length > 0 && navigationProperties.some((prop) => prop.name === propertyToCheck);
	}

	/**
	 * The function sets the ValueState of properties present in advanced formatting panel,
	 * to ValueState.Information or ValueState.None on the basis of properties present in card preview.
	 * @param {JSONModel} model - The JSON model containing the card configuration.
	 * @param {string} selectedKey - The selected key from the ComboBox.
	 * @param {boolean} isItemNotSelected - Flag indicating if the item is not present in the card preview.
	 * @returns {void}
	 */
	setValueStateForModel(model: JSONModel, selectedKey: string, isItemNotSelected: boolean): void {
		const criticalityData = model.getProperty("/configuration/mainIndicatorOptions/criticality") || [];
		const i18nModel = this.getModel("i18n") as ResourceModel;
		const informativeMessage = i18nModel.getObject("UNSELECTED_ITEM");
		criticalityData.forEach((item: CriticalityOptions, index: number) => {
			const itemName = item.navigationKeyForId ? `${item.name}/${item.navigationKeyForId}` : item.name;
			let isNavigationalProperty: boolean = false;
			if (item.isNavigationForId && item.navigationKeyForId) {
				isNavigationalProperty = true;
			}
			if (isItemNotSelected && selectedKey === itemName) {
				if (item.valueState === ValueState.None || item.valueState === undefined) {
					model.setProperty(`/configuration/mainIndicatorOptions/criticality/${index}/valueState`, ValueState.Information);
					model.setProperty(`/configuration/mainIndicatorOptions/criticality/${index}/valueStateText`, informativeMessage);
				}
				if (isNavigationalProperty) {
					model.setProperty(
						`/configuration/mainIndicatorOptions/criticality/${index}/navigationValueState`,
						ValueState.Information
					);
					model.setProperty(
						`/configuration/mainIndicatorOptions/criticality/${index}/navigationValueStateText`,
						informativeMessage
					);
				}
			} else if (!isItemNotSelected && selectedKey === itemName) {
				if (item.valueState === ValueState.Information) {
					model.setProperty(`/configuration/mainIndicatorOptions/criticality/${index}/valueState`, ValueState.None);
					model.setProperty(`/configuration/mainIndicatorOptions/criticality/${index}/valueStateText`, "");
				}
				if (isNavigationalProperty) {
					model.setProperty(`/configuration/mainIndicatorOptions/criticality/${index}/navigationValueState`, ValueState.None);
					model.setProperty(`/configuration/mainIndicatorOptions/criticality/${index}/navigationValueStateText`, "");
				}
			}
		});
	}
}
