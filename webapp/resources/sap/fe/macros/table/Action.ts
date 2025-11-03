import { defineUI5Class, event, property, type PropertiesOf } from "sap/fe/base/ClassSupport";
import BuildingBlockObjectProperty from "sap/fe/macros/controls/BuildingBlockObjectProperty";
import type { OverflowToolbarPriority } from "sap/m/library";

/**
 * Definition of a custom action to be used inside the table toolbar
 * @public
 */
@defineUI5Class("sap.fe.macros.table.Action")
export default class Action extends BuildingBlockObjectProperty {
	/**
	 * Unique identifier of the action
	 * @public
	 */
	@property({ type: "string", required: true })
	key!: string;

	/**
	 * The text that will be displayed for this action
	 * @public
	 */
	@property({ type: "string", required: true })
	text!: string;

	/**
	 * Reference to the key of another action already displayed in the toolbar to properly place this one
	 * @public
	 */
	@property({ type: "string" })
	anchor?: string;

	/**
	 * Defines where this action should be placed relative to the defined anchor
	 *
	 * Allowed values are `Before` and `After`
	 * @public
	 */
	@property({ type: "string" })
	placement?: "Before" | "After";

	/**
	 * Event handler to be called when the user chooses the action
	 * @public
	 */
	@event()
	press?: Function;

	/**
	 * Defines if the action requires a selection.
	 * @public
	 */
	@property({ type: "boolean" })
	requiresSelection?: boolean;

	/**
	 * Enables or disables the action
	 * @public
	 */
	@property({ type: "boolean" })
	enabled?: boolean;

	/**
	 * Determines the shortcut combination to trigger the action
	 * @public
	 */
	@property({ type: "string" })
	command?: string;

	/**
	 * Determines whether the action requires selecting one item or multiple items.
	 * Allowed values are `single` and `multi`
	 * @public
	 */
	@property({ type: "string" })
	enableOnSelect?: "single" | "multi";

	/**
	 * Determines whether the action is visible.
	 * @public
	 */
	@property({ type: "boolean" })
	visible?: boolean;

	/**
	 * Displays the AI Icon on the action button.
	 * @public
	 */
	@property({ type: "boolean", defaultValue: false })
	isAIOperation?: boolean;

	/**
	 * Defines the priority of the action in the overflow toolbar.
	 */
	@property({ type: "string" })
	priority?: OverflowToolbarPriority;

	/**
	 * Defines the group of the action in the overflow toolbar.
	 */
	@property({ type: "int" })
	group?: number;

	constructor(settings: PropertiesOf<Action>) {
		super(settings);
	}
}
