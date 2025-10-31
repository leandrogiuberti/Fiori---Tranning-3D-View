/**
 * Utility functions for action processing and overflow protection
 */

import { OverflowToolbarPriority } from "sap/m/library";
import { ActionType } from "../converters/ManifestSettings";
import type { BaseAction } from "../converters/controls/Common/Action";

const ActionUtilities = {
	/**
	 * Ensures primary actions never overflow by setting priority to NeverOverflow.
	 * @param actions Array of actions to process
	 * @returns Processed actions with primary action overflow protection
	 */
	ensurePrimaryActionNeverOverflows(actions: BaseAction[]): BaseAction[] {
		return actions.map((action) =>
			!this.isPrimaryAction(action) ? action : { ...action, priority: OverflowToolbarPriority.NeverOverflow }
		);
	},

	/**
	 * Determines if an action is a primary action.
	 * @param action Action to check
	 * @returns True if action is primary
	 */
	isPrimaryAction(action: BaseAction): boolean {
		// Check if action is primary
		return action.type === ActionType.Primary;
	}
};

export default ActionUtilities;
