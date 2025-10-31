import { defineUI5Class, mixin, property } from "sap/fe/base/ClassSupport";
import SubSectionStateHandler from "sap/fe/macros/controls/section/mixin/SubSectionStateHandler";
import type SubSectionBlock from "sap/fe/templates/ObjectPage/controls/SubSectionBlock";
import type Control from "sap/ui/core/Control";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import ObjectPageSubSection from "sap/uxap/ObjectPageSubSection";
import type Section from "../Section";

@defineUI5Class("sap.fe.macros.controls.section.SubSection", { designtime: "sap/uxap/designtime/ObjectPageSubSection.designtime" })
@mixin(SubSectionStateHandler)
class SubSection extends ObjectPageSubSection {
	/**
	 * Path to the apply-state handler to be called during state interactions.
	 */
	@property({ type: "string" })
	applyStateHandler?: string;

	/**
	 * Path to the retrieve-state handler to be called during state interactions.
	 */
	@property({ type: "string" })
	retrieveStateHandler?: string;

	constructor(sId?: string, mSettings?: object) {
		super(sId, mSettings);

		// Register delegate for lifecycle management
		const eventDelegates = {
			onBeforeRendering: (): void => {
				this.checkAndApplyFormAlignmentClass();
			}
		};

		this.addEventDelegate(eventDelegates);
	}

	/**
	 * Gets visible content from all blocks in this subsection.
	 * @returns Array of visible controls
	 */
	private getVisibleContent(): Control[] {
		const blocks = this.getBlocks() as SubSectionBlock[];
		const visibleContent: Control[] = [];

		blocks.forEach((block: SubSectionBlock) => {
			let content = block.getAggregation("content");
			if (content === null) {
				return;
			}
			if (!Array.isArray(content)) {
				content = [content];
			}
			for (const control of content as Control[]) {
				if (control.getVisible()) {
					visibleContent.push(control);
				}
			}
		});

		return visibleContent;
	}

	/**
	 * Checks if control is eligible for alignment CSS class.
	 * @param control Control to check
	 * @returns True if control is Form, Panel, Table, or List
	 */
	private isEligibleForAlignment(control: Control): boolean {
		return control.isA(["sap.ui.layout.form.Form", "sap.fe.macros.form.FormAPI", "sap.m.Panel", "sap.m.Table", "sap.m.List"]);
	}

	/**
	 * Checks subsection content and applies/removes alignment CSS class on Form elements.
	 */
	private checkAndApplyFormAlignmentClass(): void {
		const visibleContent = this.getVisibleContent();

		// Only apply if exactly one visible control of eligible type
		if (visibleContent.length === 1 && this.isEligibleForAlignment(visibleContent[0])) {
			visibleContent[0].addStyleClass("sapUxAPObjectPageSubSectionAlignContent");
		} else {
			for (const control of visibleContent) {
				control.removeStyleClass("sapUxAPObjectPageSubSectionAlignContent");
			}
		}
	}

	/**
	 * Sets the title of the subsection and adjusts the section content accordingly.
	 * @param sTitle The title to set for the subsection
	 * @returns The current instance of SubSection
	 */
	setTitle(sTitle?: string): this {
		super.setTitle(sTitle);

		// We need to run the title adjustment logic at section level after the title is set.
		const feSection = this.getParent();
		if (feSection && feSection.isA<Section>("sap.fe.macros.controls.Section") && feSection.checkAndAdjustSectionContent) {
			feSection.checkAndAdjustSectionContent();
		}

		return this;
	}
}

export default SubSection;
