import { aggregation, defineUI5Class, property } from "sap/fe/base/ClassSupport";
import BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import Button from "sap/m/Button";
import OverflowToolbarLayoutData from "sap/m/OverflowToolbarLayoutData";
import Text from "sap/m/Text";
import Title from "sap/m/Title";
import VBox from "sap/m/VBox";
import type Control from "sap/ui/core/Control";
import type JSONModel from "sap/ui/model/json/JSONModel";
import ObjectPageDynamicHeaderTitle from "sap/uxap/ObjectPageDynamicHeaderTitle";
import ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import ObjectPageSection from "sap/uxap/ObjectPageSection";
import ObjectPageSubSection from "sap/uxap/ObjectPageSubSection";
import ImplementationStep from "./ImplementationStep";
import Link from "./Link";

// to avoid posting messages between the frames, we use a global variable for now
// once only the new tool is used, we'll improve this logic
declare global {
	interface Window {
		sapfe_codeEditorVisible?: boolean;
	}
}

@defineUI5Class("sap.fe.core.fpmExplorer.controls.Page")
export default class fpmLink extends BuildingBlock<Control> {
	// The page title
	@property({ type: "string" })
	title?: string;

	// ID of UI5 documentation
	@property({ type: "string" })
	documentation?: string;

	// Introduction text of the shown feature
	@property({ type: "string" })
	introduction?: string;

	// as an alternative to the introduction text, we can use a control. Only use this if text is not enough
	@aggregation({ type: "sap.ui.core.Control" })
	introductionContent?: Control[];

	// shall the sample be shown in edit and display mode?
	@property({ type: "boolean", defaultValue: false })
	editMode?: boolean;

	// The sample of the feature. In case you want to show more samples, put them into a form or VBox
	@aggregation({ type: "sap.ui.core.Control" })
	sample?: Control[];

	// The implementation steps of the feature.
	@aggregation({
		type: "sap.fe.core.fpmExplorer.controls.ImplementationStep",
		multiple: true,
		defaultClass: ImplementationStep,
		isDefault: true
	})
	implementation?: ImplementationStep[];

	onBeforeRendering(): void {
		if (!this.content) {
			this.content = this.createContent();
			(this.content.getModel("ui") as JSONModel).setProperty("/isEditable", this.editMode);
		}
	}

	onSwitchEdit(): void {
		const uiModel = this.content?.getModel("ui") as JSONModel;
		uiModel.setProperty("/isEditable", !uiModel.getProperty("/isEditable"));
	}

	showCodeEditor(): void {
		window.parent.postMessage({ type: "showCodeEditor" });
	}

	createHeaderContent(): ObjectPageDynamicHeaderTitle {
		let documentationLink, showCode;
		if (this.documentation) {
			// @ts-ignore
			documentationLink = <Link documentation={this.documentation} header="true" />;
		}

		if (window.parent.sapfe_codeEditorVisible === false) {
			showCode = (
				<Button text={"Show Code"} type="Emphasized" press={this.showCodeEditor}>
					{{ layoutData: <OverflowToolbarLayoutData priority="NeverOverflow" /> }}
				</Button>
			);
		}

		return (
			<ObjectPageDynamicHeaderTitle>
				{{
					actions: [documentationLink, showCode],
					heading: <Title text={this.title} />,
					snappedTitleOnMobile: <Title text={this.title} />
				}}
			</ObjectPageDynamicHeaderTitle>
		);
	}

	createDocumentationSection(): ObjectPageSection {
		const introduction = this.introductionContent || (
			<VBox class="sapUiTinyMarginTop">
				<Text text={this.introduction} />
			</VBox>
		);

		return (
			<ObjectPageSection titleUppercase="false">
				{{
					subSections: [
						<ObjectPageSubSection title="Introduction" mode="Expanded" titleUppercase="false">
							{introduction}
						</ObjectPageSubSection>
					]
				}}
			</ObjectPageSection>
		);
	}

	createSampleSection(): ObjectPageSection {
		let switchButton;
		if (this.editMode === true) {
			switchButton = (
				<Button text="Switch to {= ${ui>/isEditable} ? 'Display Mode' : 'Edit Mode' }" press={this.onSwitchEdit.bind(this)} />
			);
		}
		return (
			<ObjectPageSection titleUppercase="false">
				{{
					subSections: [
						<ObjectPageSubSection title="Sample" mode="Expanded" titleUppercase="false">
							{{
								actions: switchButton
							}}

							{this.sample}
						</ObjectPageSubSection>
					]
				}}
			</ObjectPageSection>
		);
	}

	createImplementationSection(implementationStep: ImplementationStep): ObjectPageSubSection {
		const text = implementationStep.textContent ?? <Text text={implementationStep.text} />;

		return (
			<ObjectPageSubSection title={implementationStep.title} mode="Expanded" titleUppercase="false">
				<VBox class="sapUiTinyMarginTop">
					{text}
					{implementationStep.implementation}
				</VBox>
			</ObjectPageSubSection>
		);
	}

	createImplementationSections(): ObjectPageSection {
		const implementationSections: ObjectPageSubSection[] = [];

		if (this.implementation) {
			for (const implementationStep of this.implementation) {
				implementationSections.push(this.createImplementationSection(implementationStep));
			}
		}

		return (
			<ObjectPageSection titleUppercase="false" title={"Implementation"}>
				{{
					subSections: implementationSections
				}}
			</ObjectPageSection>
		);
	}

	createSections(): ObjectPageSection[] {
		const sections: ObjectPageSection[] = [];
		if (this.documentation) {
			sections.push(this.createDocumentationSection());
		}
		if (this.sample) {
			sections.push(this.createSampleSection());
		}
		if (this.implementation && this.implementation.length > 0) {
			sections.push(this.createImplementationSections() as ObjectPageSection);
		}
		return sections;
	}

	/**
	 * Creates the content of the building block.
	 * @returns The content of the building block.
	 */
	createContent(): ObjectPageLayout {
		return (
			<ObjectPageLayout>
				{{
					headerTitle: this.createHeaderContent(),
					sections: this.createSections()
				}}
			</ObjectPageLayout>
		);
	}
}
