import type { PropertiesOfBuildingBlock } from "sap/fe/base/ClassSupport";
import { defineUI5Class, xmlEventHandler } from "sap/fe/base/ClassSupport";
import type PageController from "sap/fe/core/PageController";
import { convertBuildingBlockMetadata } from "sap/fe/core/buildingBlocks/templating/BuildingBlockSupport";
import BuildingBlockWithTemplating from "sap/fe/macros/controls/BuildingBlockWithTemplating";
import FormBlock from "sap/fe/macros/form/Form.block";
import type UI5Event from "sap/ui/base/Event";
import type { $ControlSettings } from "sap/ui/mdc/Control";

/**
 * This class represents a form building block that can be used in SAP Fiori Elements applications through dynamic instantiatiom.
 * It's not intended to be used directly in applications, but rather as a part of the FE framework.
 */
@defineUI5Class("sap.fe.macros.form.Form", convertBuildingBlockMetadata(FormBlock))
export default class Form extends BuildingBlockWithTemplating {
	constructor(props?: PropertiesOfBuildingBlock<FormBlock> & $ControlSettings, others?: $ControlSettings) {
		super(props, others);
	}

	@xmlEventHandler()
	_fireEvent(ui5Event: UI5Event, _controller: PageController, eventId: string): void {
		this.fireEvent(eventId, ui5Event.getParameters());
	}

	/**
	 * Sets the path to the metadata that should be used to generate the table.
	 * @param metaPath The path to the metadata
	 * @returns Reference to this in order to allow method chaining
	 */
	setMetaPath(metaPath: string): this {
		return this.setProperty("metaPath", metaPath);
	}

	/**
	 * Gets the path to the metadata that should be used to generate the table.
	 * @returns The path to the metadata
	 */
	getMetaPath(): string {
		return this.getProperty("metaPath");
	}
}
