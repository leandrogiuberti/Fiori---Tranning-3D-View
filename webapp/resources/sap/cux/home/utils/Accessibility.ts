/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import InvisibleText from "sap/ui/core/InvisibleText";
import BaseContainer from "../BaseContainer";
import BaseLayout from "../BaseLayout";
import BasePanel from "../BasePanel";

/**
 * Creates an instance of `InvisibleText` with the given ID and text.
 *
 * @param {string} id - The unique id for the `InvisibleText` instance.
 * @param {string} [text=""] - The text content for the `InvisibleText` instance. Defaults to an empty string.
 * @returns {InvisibleText} A new `InvisibleText` instance.
 * @throws {Error} If the `id` is not provided.
 */
export function getInvisibleText(id: string, text: string = ""): InvisibleText {
	if (id) {
		return new InvisibleText({
			id: id,
			text: text || ""
		});
	} else {
		throw new Error("ID is required for InvisibleText.");
	}
}

/**
 * Checks whether a specific panel type exists within a given container in the layout.
 *
 * @param {BaseContainer} parentContainer - The parent container from where the from which the function is called.
 * @param {string} containerTypeName - The name of the container to look for.
 * @param {string} panelTypeName - The name of the panel to verify inside the container.
 * @returns {boolean} - Returns `true` if the specified panel exists, otherwise `false`.
 */
export function checkPanelExists(
	parentContainer: BaseContainer | BasePanel | BaseLayout,
	containerTypeName: string,
	panelTypeName: string
): boolean {
	const layout = (parentContainer as BaseContainer)?._getLayout?.() ?? parentContainer;
	const items = layout?.getAggregation("items");
	const targetContainer = items instanceof Array ? items.find((control) => control.getMetadata()?.getName() === containerTypeName) : null;
	const containerContents = targetContainer?.getAggregation("content");
	const normalizedItems = (containerContents && (containerContents instanceof Array ? containerContents : [containerContents])) || [];
	return normalizedItems.some((control) => control.getMetadata()?.getName() === panelTypeName);
}
