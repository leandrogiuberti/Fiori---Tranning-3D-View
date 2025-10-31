sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/base/util/extend",
		"sap/suite/ui/generic/template/genericUtilities/controlHelper"
	],
	function (BaseObject, extend, controlHelper) {
		"use strict";

		/**
		 * Helper class for handling focus on controller level.
		 * Used to save and restore focus of specific control
		 *
		 * Should be accessible from controller getRestoreFocusHelper() method.
		 *
		 * Then necessary store current focus information with rememberFocus() method
		 * Restoring focus is done thorough invoking restoreFocus() method. After restoring focus, it will be reset.
		 */

		function getMethods() {
			var sControlIdWithLastFocus = null;

			/**
			 * Store control id which have focus
			 * @param {string} control is that have focus
			 */
			function rememberFocus(sFocusId) {
				sControlIdWithLastFocus = sFocusId;
			}

			/**
			 * Restores focus to previously remembered control Id
			 * @returns undefined
			 */
			function restoreFocus() {
				if (!sControlIdWithLastFocus) {
					return;
				}
				controlHelper.focusControl(sControlIdWithLastFocus);
				resetFocus();
			}

			/**
			 * Clear currently saved previously focused control id
			 */
			function resetFocus() {
				sControlIdWithLastFocus = null;
			}

			return {
				rememberFocus: rememberFocus,
				restoreFocus: restoreFocus,
				resetFocus: resetFocus
			};
		}

		return BaseObject.extend(
			"sap.suite.ui.generic.template.lib.RestoreFocusHelper",
			{
				constructor: function () {
					extend(this, getMethods());
				}
			}
		);
	}
);
