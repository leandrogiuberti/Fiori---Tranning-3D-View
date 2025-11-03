import Log from "sap/base/Log";
import { loadSupportLinksForElement } from "sap/fe/tools/SupportLinks";
import { serializeControlAsFormattedXML } from "sap/fe/tools/XMLSerializer";
import Button from "sap/m/Button";
import CheckBox from "sap/m/CheckBox";
import CustomListItem from "sap/m/CustomListItem";
import HBox from "sap/m/HBox";
import IconTabBar from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";
import Label from "sap/m/Label";
import Link from "sap/m/Link";
import List from "sap/m/List";
import type { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
import MessageBox from "sap/m/MessageBox";
import StandardListItem from "sap/m/StandardListItem";
import Text from "sap/m/Text";
import Toolbar from "sap/m/Toolbar";
import VBox from "sap/m/VBox";
import CodeEditor from "sap/ui/codeeditor/CodeEditor";
import type Control from "sap/ui/core/Control";
import type UI5Element from "sap/ui/core/Element";
import HTML from "sap/ui/core/HTML";
import ResizeHandler from "sap/ui/core/ResizeHandler";
import SimpleForm from "sap/ui/layout/form/SimpleForm";
import type JSONModel from "sap/ui/model/json/JSONModel";
import { addBBInfo, addBuildingBlockTab } from "./BuildingBlockTab";

let currentControl: UI5Element | undefined;
const codeEditor: CodeEditor = <CodeEditor syntaxHints={false} type="XML" />;
const parentButton: Button = (
	<Button
		enabled={false}
		text={"Select an item to see it's parent"}
		press={function (): void {
			showElement(currentControl?.getParent() as UI5Element);
		}}
	/>
);
// @ts-ignore
const FE = window?.opener?.$fe ?? window?.$fe;

const requestList: List = (
	<List
		items={"{/data}"}
		mode={"SingleSelectMaster"}
		class={"feRequestList"}
		selectionChange={function (this: List, oEvent: ListBase$SelectionChangeEvent): void {
			const oItem = oEvent.getParameter("listItem");
			if (oItem) {
				//console.log("Selected item is: " + oItem.getId());
				const currentRequest = oItem.getBindingContext()?.getObject();
				(this.getModel() as JSONModel).setProperty("/selectedItem", currentRequest);
				const currentCache = FE.createdCaches[currentRequest.trace];
				const odataPropsToControl: { key: string; count: number }[] = [];
				if (currentCache) {
					Object.keys(currentCache.mChangeListeners).forEach((key) => {
						odataPropsToControl.push({ key, count: currentCache.mChangeListeners[key].length });
					});
					(this.getModel() as JSONModel).setProperty("/odataPropsToControl", odataPropsToControl);
					(this.getModel() as JSONModel).setProperty("/currentCache", currentCache);
				}
			}
		}}
	>
		{{ items: <StandardListItem title="{urlBase}" description={"{request/method}"} info={"#{trace}"} /> }}
	</List>
);
const inspector: IconTabBar = (
	<IconTabBar expanded={true}>
		{{
			items: [
				<IconTabFilter key="supportLinks" text={"Service Implementation"}>
					<List items={"{/supportLinks}"} noData={"{/supportLinksStateText}"}>
						<CustomListItem>
							<Link text="{Text}" href="{Url}" target={"linkContent"} class={"sapUiTinyMargin"} />
						</CustomListItem>
					</List>
					<HTML content={'<iframe name="linkContent" width="99%" height="85%"/>'}></HTML>
				</IconTabFilter>,
				<IconTabFilter key="tree" text={"Control Tree"}>
					<VBox renderType={"Bare"}>
						{{
							items: [
								<Toolbar>
									{{
										content: [
											<CheckBox text={"Prevent interaction"} selected={"{/preventInteraction}"} />,
											<Button
												text={"Send to Console"}
												press={function (): void {
													FE["$" + FE.controlIndex] = currentControl;
													MessageBox.alert("Control sent to console as $fe.$" + FE.controlIndex);
													FE.controlIndex++;
												}}
											/>,
											parentButton
										]
									}}
								</Toolbar>,
								codeEditor
							]
						}}
					</VBox>
					;
				</IconTabFilter>,
				<IconTabFilter key="properties" text={"Control Properties"}></IconTabFilter>,
				<IconTabFilter key="state" text={"Control State"}>
					<List items={"{/state}"}>
						<StandardListItem title="{key}" description="{value}" />
					</List>
				</IconTabFilter>,
				<IconTabFilter key="requests" text="OData Requests">
					<Button
						press={function (this: Control): void {
							(this.getModel() as JSONModel).setProperty("/data", []);
						}}
						text={"Clear All"}
					/>
					<HBox height={"100%"} class={"feRequestHBox"}>
						{{
							items: [
								requestList,
								<VBox width={"100%"}>
									<Button
										text={"Highlight related controls"}
										press={function (this: Button): void {
											const traceId = this.getModel()!.getProperty("/selectedItem").trace;
											const dependentBindings = FE.createdCaches[traceId].__feBinding.getDependentBindings();
											dependentBindings.forEach((binding: any) => {
												try {
													if (binding.__feSource && binding.closestDomRef) {
														binding.closestDomRef.style.outline = "3px auto green";
													}
												} catch (e) {
													Log.info("Error while highlighting dependent bindings", e as string);
												}
											});
										}}
									/>
									<SimpleForm>
										<Label text={"Method"} />
										<Text text="{/selectedItem/request/method}" />
										<Label text={"URL"} />
										<Text text="{/selectedItem/urlBase}" />
										<Label text={"Parameters"} />
										<CodeEditor value="{/selectedItem/parameters}" type="json" editable={true} height={"200px"} />
										<Label text={"Data"} />
										<CodeEditor value="{/selectedItem/responseBody}" type="json" editable={true} height={"300px"} />
										<Label text={"Data Tree"} />
										{/*<Tree items="{/selectedItem/responseBodyObj}">*/}
										{/*	<StandardTreeItem title="{text}"/>*/}
										{/*</Tree>*/}
									</SimpleForm>
								</VBox>
							]
						}}
					</HBox>
				</IconTabFilter>,
				<IconTabFilter key="state" text={"OData Properties > Controls"}>
					<HBox>
						{{
							items: [
								<List
									items={"{/odataPropsToControl}"}
									mode={"SingleSelectMaster"}
									selectionChange={function (this: List, oEvent: ListBase$SelectionChangeEvent): void {
										const oItem = oEvent.getParameter("listItem");
										if (oItem) {
											//console.log("Selected item is: " + oItem.getId());
											const currentValue = oItem.getBindingContext()?.getObject();
											const currentCache = (this.getModel() as JSONModel).getProperty("/currentCache");
											const changeListeners = currentCache.mChangeListeners[currentValue.key];
											const selectedOdataPropControls: {
												key: string;
												prop: string;
												count: number;
												control: Control;
											}[] = [];
											const controlPerKey: Record<
												string,
												{
													key: string;
													prop: string;
													count: number;
													control: Control;
												}
											> = {};
											for (const selectedOdataPropControl of changeListeners) {
												const key =
													selectedOdataPropControl.__feSource.getMetadata().getName() +
													" #" +
													selectedOdataPropControl.__feSource.getId();
												const prop = selectedOdataPropControl.__feForProp;
												controlPerKey[key + "_" + prop] ??= {
													key: key,
													prop: prop,
													count: 0,
													control: selectedOdataPropControl.__feSource
												};
												controlPerKey[key + "_" + prop].count++;
											}
											Object.keys(controlPerKey).forEach((key) => {
												selectedOdataPropControls.push(controlPerKey[key]);
											});
											(this.getModel() as JSONModel).setProperty(
												"/selectedOdataPropControls",
												selectedOdataPropControls
											);
										}
									}}
								>
									<StandardListItem title="{key}" description="{count}" />
								</List>,
								<List
									items={"{/selectedOdataPropControls}"}
									mode={"SingleSelectMaster"}
									selectionChange={function (this: List, oEvent: ListBase$SelectionChangeEvent): void {
										const oItem = oEvent.getParameter("listItem");
										if (oItem) {
											//console.log("Selected item is: " + oItem.getId());
											const currentValue = oItem.getBindingContext()?.getObject();
											showElement(currentValue.control);
											//(this.getModel() as JSONModel).setProperty("/odataPropsToControl", odataPropsToControl);
										}
									}}
								>
									<StandardListItem title="{key}" description="Used #{count}" info="Property: {prop}" />
								</List>
							]
						}}
					</HBox>
				</IconTabFilter>
			],
			content: []
		}}
	</IconTabBar>
);

inspector.placeAt("sapUiSupportBody");
inspector.setModel(FE.supportModel);
addBuildingBlockTab(inspector);
ResizeHandler.register(document.querySelector("body")!, () => {
	codeEditor?.setHeight(window.innerHeight - 120 + "px");
});

const showElement = async function (ui5Control: UI5Element): Promise<void> {
	codeEditor.setHeight(window.innerHeight - 120 + "px");

	if (currentControl && currentControl.getDomRef()) {
		(currentControl.getDomRef() as HTMLElement).style.outline = "none";
	}

	currentControl = ui5Control;
	parentButton.setEnabled(!!currentControl?.getParent());
	parentButton.setText("Parent " + currentControl?.getParent()?.getMetadata().getName());
	if (ui5Control.getDomRef()) {
		(ui5Control.getDomRef() as HTMLElement).style.outline = "3px auto red";
	}

	const formattedXML = await serializeControlAsFormattedXML(ui5Control);
	codeEditor.setValue(formattedXML);

	addBBInfo(ui5Control);

	const stateValue = [];
	if (ui5Control.getModel("$componentState")) {
		const stateContent = (ui5Control.getModel("$componentState") as JSONModel).getData();

		for (const stateContentKey in stateContent) {
			const stateContentValue = stateContent[stateContentKey];
			if (stateContentKey !== "__boundProperties") {
				stateValue.push({ key: stateContentKey, value: stateContentValue });
			}
		}
	}

	(codeEditor.getModel() as JSONModel).setProperty("/state", stateValue);

	loadSupportLinksForElement(ui5Control);
};

FE.toggleElementInspector({ showElement });
