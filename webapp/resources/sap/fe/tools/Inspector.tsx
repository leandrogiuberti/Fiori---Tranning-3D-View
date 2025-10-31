import { serializeControlAsXML } from "sap/fe/tools/XMLSerializer";
import Panel from "sap/m/Panel";
import Text from "sap/m/Text";
import CodeEditor from "sap/ui/codeeditor/CodeEditor";
import UI5Element from "sap/ui/core/Element";
import Popup from "sap/ui/core/Popup";

function onMouseOver(e: MouseEvent): void {
	const target = e.target as HTMLElement | null;
	if (target) {
		const closestUI5Elt = target.closest("[data-sap-ui]");
		if (closestUI5Elt && !isLocked) {
			(closestUI5Elt as HTMLElement).style.outline = "2px auto rebeccapurple";
			inspector?.showElement(UI5Element.getElementById(closestUI5Elt.getAttribute("data-sap-ui"))!);
		}
	}
}
function onKeyDown(e: KeyboardEvent): void {
	if (e.ctrlKey) {
		isLocked = !isLocked;
		if (isLocked) {
			const target = e.target as HTMLElement | null;
			if (target) {
				const closestUI5Elt = target.closest("[data-sap-ui]");
				if (closestUI5Elt) {
					(closestUI5Elt as HTMLElement).style.outline = "3px auto red";
					lastTarget = closestUI5Elt as HTMLElement;
				}
			}
		} else if (lastTarget) {
			lastTarget.style.outline = "none";
		}
		// @ts-ignore
		if (window.$fe.supportModel.getProperty("/preventInteraction")) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
	}
}
function onMouseDown(e: MouseEvent): void {
	isLocked = !isLocked;
	if (isLocked) {
		const target = e.target as HTMLElement | null;
		if (target) {
			const closestUI5Elt = target.closest("[data-sap-ui]");
			if (closestUI5Elt) {
				(closestUI5Elt as HTMLElement).style.outline = "3px auto red";
				lastTarget = closestUI5Elt as HTMLElement;
			}
		}
	} else if (lastTarget) {
		lastTarget.style.outline = "none";
	}
	// @ts-ignore
	if (window.$fe.supportModel.getProperty("/preventInteraction")) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	}
}
function onMouseClick(e: MouseEvent): void {
	// @ts-ignore
	if (window.$fe.supportModel.getProperty("/preventInteraction")) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	}
}
function onMouseOut(e: MouseEvent): void {
	const target = e.target as HTMLElement | null;
	if (target && !isLocked) {
		const closestUI5Elt = target.closest("[data-sap-ui]");
		if (closestUI5Elt) {
			(closestUI5Elt as HTMLElement).style.outline = "none";
		}
	}
}
let lastTarget: HTMLElement | null;
let isInspecting = false;
let isLocked = false;
let inspector: { showElement: (ui5Control: UI5Element) => void } | null = null;
export function toggleElementInspector(textRef: { showElement: (ui5Control: UI5Element) => void } | null): void {
	if (!isInspecting) {
		isInspecting = true;
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("mousedown", onMouseDown);
		document.addEventListener("mouseover", onMouseOver);
		document.addEventListener("click", onMouseClick);
		document.addEventListener("mouseout", onMouseOut);
		if (!textRef) {
			const localInspector = showInspector();
			inspector = {
				showElement: function (ui5Control: UI5Element): void {
					localInspector.removeAllContent();
					localInspector.addContent(<CodeEditor type="XML" height={"500px"} value={serializeControlAsXML(ui5Control)} />);
				}
			};
		} else {
			inspector = textRef;
		}
	} else {
		document.removeEventListener("keydown", onKeyDown);
		document.removeEventListener("mousedown", onMouseDown);
		document.removeEventListener("mouseover", onMouseOver);
		document.removeEventListener("click", onMouseClick);
		document.removeEventListener("mouseout", onMouseOut);
		isInspecting = false;
	}
}

function showInspector(): Panel {
	const subInspector: Panel = (
		<Panel width="500px" headerText="UI5 Element Inspector" expanded={true}>
			{{
				content: <Text text="Hover over an element to inspect it" />
			}}
		</Panel>
	);
	const popup = new Popup(subInspector);
	popup.open(Popup.Dock.EndBottom, Popup.Dock.EndBottom);
	return subInspector;
}
