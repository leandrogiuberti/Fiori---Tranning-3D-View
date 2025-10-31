import type { PrimitiveType } from "sap/fe/base/BindingToolkit";
import { pathInModel } from "sap/fe/base/BindingToolkit";
import type { PropertiesOf } from "sap/fe/base/ClassSupport";
import { defineUI5Class, property } from "sap/fe/base/ClassSupport";
import CommonUtils from "sap/fe/core/CommonUtils";
import BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import RadioButton from "sap/m/RadioButton";
import type { RadioButtonGroup$SelectEvent } from "sap/m/RadioButtonGroup";
import RadioButtonGroup from "sap/m/RadioButtonGroup";
import type Event from "sap/ui/base/Event";
import type { AggregationBindingInfo, PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import type { $ControlSettings } from "sap/ui/core/Control";
import CustomData from "sap/ui/core/CustomData";
import type PropertyBinding from "sap/ui/model/PropertyBinding";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

@defineUI5Class("sap.fe.macros.controls.RadioButtons")
export default class RadioButtons extends BuildingBlock<RadioButtonGroup, { possibleValues: { text: string; key: number }[] }> {
	@property({
		type: "string"
	})
	public id!: string;

	@property({
		type: "string[]"
	})
	public fieldGroupIds?: string[];

	@property({
		type: "string"
	})
	public requiredExpression?: string;

	// We use type 'raw' here because otherwise the binding will refuse to update the value, as it doesn't know how to convert from any to string
	// Setting it to raw make sure that no conversion is attempted which then works
	// Default value is set to null to allow having a radio button pointing to a `null` value
	@property({ type: "any", defaultValue: null })
	public value!: string | number | boolean;

	@property({
		type: "string"
	})
	public fixedValuesPath!: `{${string}}`;

	/**
	 * An array of possible, fixed value list object
	 * If this property is used, the fixedValuesPath property is ignored.
	 */
	@property({
		type: "object",
		bindToState: true
	})
	public possibleValues?: { key: PrimitiveType; text: string }[];

	@property({
		type: "any",
		isBindingInfo: true
	})
	public radioButtonTextProperty: PropertyBindingInfo;

	@property({
		type: "any",
		isBindingInfo: true
	})
	public radioButtonKeyProperty: PropertyBindingInfo;

	@property({
		type: "boolean"
	})
	public horizontalLayout = false;

	@property({
		type: "string"
	})
	public enabledExpression = "";

	@property({
		type: "string"
	})
	public width = "100%";

	constructor(properties: $ControlSettings & PropertiesOf<RadioButtons>, others?: $ControlSettings) {
		super(properties, others);
		this.content = this.createContent();
	}

	/**
	 * Event handler for the RadioButtonGroup's select event.
	 * We need to parse from the radio button group index to the model value.
	 * @param event
	 */
	onRadioButtonSelect(event: RadioButtonGroup$SelectEvent): void {
		const radioButtonGroup: RadioButtonGroup = event.getSource();
		const selectedIndex = event.getParameter("selectedIndex");
		if (selectedIndex !== undefined) {
			const selectedRadioButtonKey: string = radioButtonGroup?.getButtons()[selectedIndex].getCustomData()[0].getValue();
			// Now we have the value => write it to the model!
			this.setProperty("value", selectedRadioButtonKey);
			CommonUtils.getTargetView(radioButtonGroup)?.getController()?._sideEffects?.handleFieldChange(event, true);
		}
	}

	/**
	 * The value property type needs to be initially 'any' but has to be changed to 'raw' to avoid parsing errors.
	 * @param name
	 * @param bindingInfo
	 * @returns This
	 */
	bindProperty(name: string, bindingInfo: PropertyBindingInfo): this {
		if (name === "value" && !bindingInfo.formatter) {
			// not if a formatter is used, as this needs to be executed
			bindingInfo.targetType = "raw";
		}

		return super.bindProperty(name, bindingInfo);
	}

	/**
	 * This is being called when the model fetches the data from the backend or when we call it directly.
	 * We need to parse from the model value to the radio button group index.
	 * @param newValue
	 */
	setValue(newValue: string | number | boolean): void {
		this.value = newValue;
		if (this.content) {
			// Compute the new radio button index
			const radioButtons = this.content.getButtons();
			if (radioButtons.length != 0) {
				let radioButtonIndex = 0;
				for (const radioButton of radioButtons) {
					const keyCustomData = (radioButton.getCustomData()[0].getBinding("value") as PropertyBinding | undefined)?.getValue();
					if (keyCustomData === newValue) {
						this.content.setSelectedIndex(radioButtonIndex);
						return;
					}
					radioButtonIndex++;
				}
			}
			// If no value could be found or if the radio button aggregation was empty, which can happen due to
			// a very early call of setValue, set the selected to index to -1 which results in NO radio button to be selected.
			this.content.setSelectedIndex(-1);
		}
	}

	/**
	 * The building block render function.
	 * @returns The radio button group
	 */
	createContent(): RadioButtonGroup {
		// Setting up the binding so that we can access $count for getting the number
		// of entries in the fixed value list and set this as number of radio button columns
		// in case horizontal layout is configured
		let buttonsBindingContext: AggregationBindingInfo | undefined;
		if (this.possibleValues) {
			buttonsBindingContext = this.bindState("possibleValues");
			this.radioButtonTextProperty = pathInModel("text", "$componentState");
			this.radioButtonKeyProperty = pathInModel("key", "$componentState");
		} else {
			buttonsBindingContext = {
				path: `${this.fixedValuesPath}`,
				parameters: { $count: true },
				events: {
					dataReceived: (ev: Event): void => {
						const count: number | undefined = (ev.getSource() as unknown as ODataListBinding)?.getCount();
						if (count !== undefined && this.horizontalLayout) {
							radioButtonGroup.setColumns(count);
						}
						// Check if there is a value stored from the initialization but the radio
						// button selection has not yet been done and do this now
						if (this.value !== undefined && radioButtonGroup.getSelectedIndex() === -1) {
							this.setValue(this.value as string);
						}
					}
				}
			};
		}

		this.onRadioButtonSelect.bind(this);
		const radioButtonGroup = (
			<RadioButtonGroup
				buttons={buttonsBindingContext}
				select={this.onRadioButtonSelect.bind(this)}
				enabled={this.enabledExpression}
				fieldGroupIds={this.fieldGroupIds}
				ariaLabelledBy={this.ariaLabelledBy}
				width={this.width}
				columns={this.possibleValues?.length ?? 1}
			>
				<RadioButton
					text={this.radioButtonTextProperty}
					customData={<CustomData key={"key"} value={this.radioButtonKeyProperty} />}
					class="sapUiSmallMarginEnd"
					tooltip={this.radioButtonTextProperty}
				/>
			</RadioButtonGroup>
		) as RadioButtonGroup;

		return radioButtonGroup;
	}
}
