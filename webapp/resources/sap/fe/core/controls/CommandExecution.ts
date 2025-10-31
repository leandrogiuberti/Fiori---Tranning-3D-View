import Log from "sap/base/Log";
import type { BindingToolkitExpression } from "sap/fe/base/BindingToolkit";
import { defineUI5Class } from "sap/fe/base/ClassSupport";
import CoreCommandExecution from "sap/ui/core/CommandExecution";
import Component from "sap/ui/core/Component";
import Element from "sap/ui/core/Element";
import Shortcut from "sap/ui/core/Shortcut";

type $CommandExecutionSettings = {
	visible?: boolean | BindingToolkitExpression<boolean>;
	enabled?: boolean | BindingToolkitExpression<boolean>;
	execute?: Function;
	command: string;
};
@defineUI5Class("sap.fe.core.controls.CommandExecution")
export default class CommandExecution extends CoreCommandExecution {
	constructor(sId?: string | $CommandExecutionSettings, mSettings?: $CommandExecutionSettings) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		super(sId, mSettings);
	}

	setParent(oParent: Element): void {
		super.setParent(oParent);
		const aCommands = oParent.data("sap.ui.core.Shortcut");
		if (Array.isArray(aCommands) && aCommands.length > 0) {
			const oCommand = oParent.data("sap.ui.core.Shortcut")[aCommands.length - 1],
				oShortcut = oCommand.shortcutSpec;
			if (oShortcut) {
				// Check if single key shortcut
				for (const key in oShortcut) {
					if (oShortcut[key] && key !== "key") {
						return;
					}
				}
			}
			return;
		}
	}

	destroy(bSuppressInvalidate: boolean): void {
		const oParent = this.getParent();
		if (oParent) {
			const oCommand = this._getCommandInfo();
			if (oCommand) {
				Shortcut.unregister(this.getParent(), oCommand.shortcut);
			}
			this._cleanupContext(oParent);
		}
		Element.prototype.destroy.apply(this, [bSuppressInvalidate]);
	}

	setVisible(bValue: boolean): this {
		let oCommand,
			oParentControl = this.getParent(),
			oComponent: Component | undefined;

		if (!oParentControl) {
			super.setVisible(bValue);
		}

		while (!oComponent && oParentControl) {
			oComponent = Component.getOwnerComponentFor(oParentControl);
			oParentControl = oParentControl.getParent();
		}

		if (oComponent) {
			oCommand = (oComponent as Component & { getCommand: Function }).getCommand(this.getCommand());

			if (oCommand) {
				super.setVisible(bValue);
			} else {
				Log.info("There is no shortcut definition registered in the manifest for the command : " + this.getCommand());
			}
		}
		return this;
	}
}
