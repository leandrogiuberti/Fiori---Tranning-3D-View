import type BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import Button from "sap/m/Button";
import type IconTabBar from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";
import Label from "sap/m/Label";
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";
import type ManagedObject from "sap/ui/base/ManagedObject";
import CodeEditor from "sap/ui/codeeditor/CodeEditor";
import type Control from "sap/ui/core/Control";
import type UI5Element from "sap/ui/core/Element";
import SimpleForm from "sap/ui/layout/form/SimpleForm";
import { serializeControlAsFormattedXML } from "./XMLSerializer";

type AnnotationBuildingBlock = BuildingBlock & { metaPath: string; contextPath: string };
type DefinitionForm = { label: string; visualization: Text | Button };
let buildingBlockIconTabFilter: IconTabFilter;

export function addBuildingBlockTab(inspector: IconTabBar): void {
	buildingBlockIconTabFilter = (
		<IconTabFilter key="buildingBlock" text={"Building Block"}>
			{{
				items: [
					<IconTabFilter key="controlTree" text="Control Tree">
						<Text text="Start inspecting by hovering over items" />
					</IconTabFilter>,
					<IconTabFilter key="definition" text="Definition"></IconTabFilter>
				]
			}}
		</IconTabFilter>
	);
	inspector.insertAggregation("items", buildingBlockIconTabFilter, 1);
}

export function addBBInfo(ui5Control: UI5Element): void {
	const bb = getBuildingBlock(ui5Control);
	addBuildingBlockInfo(bb);
	addDefinition(bb);
}

export async function addBuildingBlockInfo(bb: AnnotationBuildingBlock): Promise<void> {
	let iconTabFilterContent;
	if (!bb) {
		iconTabFilterContent = <Text text="No associated Builing Block" />;
	} else {
		const formattedXML = await serializeControlAsFormattedXML(bb);
		iconTabFilterContent = <CodeEditor syntaxHints={false} type="XML" />;
		iconTabFilterContent.setHeight(window.innerHeight - 120 + "px");
		iconTabFilterContent.setValue(formattedXML);
	}
	addContentToIconTabFilter("controlTree", iconTabFilterContent);
}

const getBuildingBlock = function (ui5Control: ManagedObject | null): AnnotationBuildingBlock {
	let bbInstance;
	while (ui5Control) {
		ui5Control = ui5Control.getParent();
		if (!ui5Control) {
			break;
		}

		if (ui5Control.isA("sap.fe.core.buildingBlocks.BuildingBlock")) {
			bbInstance = ui5Control;
			break;
		}
	}
	return bbInstance as AnnotationBuildingBlock;
};

export function addDefinition(bb: AnnotationBuildingBlock): void {
	let iconTabFilterContent;
	if (bb && bb.metaPath && bb.contextPath) {
		const involvedObject = bb.getDataModelObjectForMetaPath(bb.metaPath, bb.contextPath);
		iconTabFilterContent = getDefinitionNavigator(involvedObject as Record<string, unknown>);
	} else if (!bb) {
		iconTabFilterContent = <Text text="No associated Builing Block" />;
	} else {
		iconTabFilterContent = <Text text="No Definition Found" />;
	}
	addContentToIconTabFilter("definition", iconTabFilterContent);
}

export function getDefinitionNavigator(involvedObject: Record<string, unknown>, parent?: Record<string, unknown>): Control {
	const formFields: DefinitionForm[] = [];
	involvedObject.$parent = parent;
	if (parent) {
		formFields.push({
			label: "Parent",
			visualization: (
				<Button
					text={"Go Up"}
					type="Transparent"
					press={(): void => {
						const definition = getDefinitionNavigator(parent, parent.$parent as Record<string, unknown>);
						addContentToIconTabFilter("definition", definition);
					}}
				/>
			)
		});
	}
	for (const key in involvedObject) {
		if (key === "$parent") {
			continue; // Skip the $parent property
		}
		let visualization;
		const involvedObjectElement = involvedObject[key];
		if (typeof involvedObjectElement === "object") {
			let targetType = (involvedObjectElement as { _type?: string })._type;
			if (Array.isArray(involvedObjectElement) && involvedObjectElement.length > 0) {
				targetType = (involvedObjectElement[0] as { _type?: string })._type + " Array";
			} else if (!targetType) {
				targetType = "Object";
			}
			visualization = (
				<Button
					text={"Type " + targetType + " > Drill Down"}
					type="Transparent"
					press={(): void => {
						const definition = getDefinitionNavigator(involvedObjectElement as Record<string, unknown>, involvedObject);
						addContentToIconTabFilter("definition", definition);
					}}
				/>
			);
		} else if (
			typeof involvedObjectElement === "string" ||
			typeof involvedObjectElement === "number" ||
			typeof involvedObjectElement === "boolean"
		) {
			visualization = <Text text={involvedObjectElement.toString()} />;
		} else if (involvedObjectElement === undefined || involvedObjectElement === null) {
			visualization = <Text text="undefined" />;
		} else if (typeof involvedObjectElement === "function") {
			<Button
				text={key}
				type="Transparent"
				press={(): void => {
					const value = involvedObjectElement();
					const definition = getDefinitionNavigator({ value: value });
					addContentToIconTabFilter("definition", definition);
				}}
			/>;
			// TODO: we can probably do better over here
			continue;
		}
		formFields.push({
			label: key,
			visualization
		});
	}

	const simpleForm = <SimpleForm />;
	if (formFields.length > 0) {
		for (const element of formFields) {
			simpleForm.addContent(<Label text={element.label} />);
			simpleForm.addContent(element.visualization);
		}
	}

	return <VBox>{simpleForm}</VBox>;
}

function addContentToIconTabFilter(key: string, content: Control): void {
	let index = 0;
	switch (key) {
		case "controlTree":
			index = 0;
			break;
		case "definition":
			index = 1;
			break;
		default:
			break;
	}
	const iconTabFilter = buildingBlockIconTabFilter.getItems()[index] as IconTabFilter;
	iconTabFilter.removeContent(iconTabFilter.getContent()[0]);
	iconTabFilter.addContent(content);
}
