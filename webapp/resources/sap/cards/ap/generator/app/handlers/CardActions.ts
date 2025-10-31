/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import type Button from "sap/m/Button";
import type ComboBox from "sap/m/ComboBox";
import type Event from "sap/ui/base/Event";
import { ValueState } from "sap/ui/core/library";
import Filter from "sap/ui/model/Filter";
import type ListBinding from "sap/ui/model/ListBinding";
import type JSONModel from "sap/ui/model/json/JSONModel";
import { addActionToCardManifest, removeActionFromManifest, resetCardActions, updateCardManifestAction } from "../../helpers/FooterActions";
import { getCurrentCardManifest, renderCardPreview } from "../../helpers/IntegrationCardHelper";
import { transpileIntegrationCardToAdaptive } from "../../helpers/Transpiler";
import type { AnnotationAction, ControlProperties } from "../../types/ActionTypes";
import { getDialogModel } from "../../utils/CommonUtils";

/**
 *
 * Handles the click event for adding a new action to the card.
 *
 */
function onActionAddClick() {
	const model = getDialogModel() as JSONModel;
	const addedActions = model.getProperty("/configuration/actions/addedActions");

	if (addedActions.length < 2) {
		addedActions.push({
			title: "",
			titleKey: "",
			style: "Default",
			enablePathKey: "",
			isStyleControlEnabled: false,
			isConfirmationRequired: false
		});
		model.setProperty("/configuration/actions/addedActions", addedActions);
		model.setProperty("/configuration/isEdited", true);
	}
	model.setProperty("/configuration/actions/isAddActionEnabled", addedActions.length < 2);
}

/**
 * Handles the delete event for removing an added action from the card.
 *
 * @param {Event} oEvent - The event object triggered by the delete action.
 */
function onAddedActionDelete(oEvent: Event) {
	const model = getDialogModel() as JSONModel;
	const control: Button = oEvent?.getSource();
	const path = control?.getBindingContext()?.getPath();
	const inputListControl = control.getParent()?.getParent();
	const innerControls = inputListControl?.findAggregatedObjects(true);
	const comboBox = innerControls?.find((control) => control.getMetadata().getName() === "sap.m.ComboBox") as ComboBox | undefined;
	comboBox?.setValueState(ValueState.None);
	if (comboBox) {
		const errorControls = model.getProperty("/configuration/errorControls") ?? [];
		const updatedErrorControls = errorControls.filter((control: ComboBox) => control !== comboBox);
		model.setProperty("/configuration/errorControls", updatedErrorControls);
	}
	const actionIndex = Number(path?.split("/configuration/actions/addedActions/")[1]);
	const addedActions = model.getProperty("/configuration/actions/addedActions") as Array<ControlProperties>;
	const deletedAction = actionIndex !== undefined ? addedActions.splice(actionIndex, 1) : [];
	model.setProperty("/configuration/actions/addedActions", addedActions);
	model.setProperty("/configuration/actions/isAddActionEnabled", addedActions.length < 2);
	model.setProperty("/configuration/isEdited", true);
	const manifest = getCurrentCardManifest();
	removeActionFromManifest(manifest, deletedAction[0]);
	renderCardPreview(manifest, model);
	transpileIntegrationCardToAdaptive(model);
}

/**
 * Validates the selected action in the ComboBox control.
 *
 * @param {ComboBox} control - The ComboBox control containing the selected action.
 * @returns {boolean} true if the selected action is valid, false otherwise.
 */
function validateSelectedAction(control: ComboBox): boolean {
	const model = getDialogModel() as JSONModel;
	const annotationActions = model.getProperty("/configuration/actions/annotationActions") as Array<AnnotationAction>;
	return annotationActions.some((annotationAction) => {
		return annotationAction.label === control.getValue() && annotationAction.action === control.getSelectedKey();
	});
}

/**
 * Updates the relative properties of an added action based on the annotation actions.
 *
 *
 * @param {ControlProperties} addedAction - The added action to be updated.
 * @param {string} path - The path in the model where the added action is stored.
 */
function updateRelativeproperties(addedAction: ControlProperties, path: string) {
	const model = getDialogModel() as JSONModel;
	const annotationActions = model.getProperty("/configuration/actions/annotationActions") as Array<AnnotationAction>;
	const relatedAnnotationAction = annotationActions.filter((annotationAction) => {
		return annotationAction.label === addedAction.title && annotationAction.action === addedAction.titleKey;
	});

	if (relatedAnnotationAction.length) {
		let enabledPath = relatedAnnotationAction[0].enablePath;
		enabledPath = enabledPath?.indexOf("_it/") > -1 ? enabledPath?.replace("_it/", "") : enabledPath; // Remove instance of _it/ from the path
		const isConfirmationRequired = relatedAnnotationAction[0].isConfirmationRequired;
		if (enabledPath) {
			addedAction.enablePathKey = enabledPath;
		}

		if (isConfirmationRequired) {
			addedAction.isConfirmationRequired = isConfirmationRequired;
		}
	}
	if (path) {
		model.setProperty(path, addedAction);
	}
}

/**
 * Filters the available card actions in the ComboBox control based on the added actions.
 *
 * @param {ComboBox} comboBox - The ComboBox control containing the available actions.
 */
function filterCardActions(comboBox: ComboBox) {
	const dialogModel = getDialogModel() as JSONModel;
	const addedActions = dialogModel.getProperty("/configuration/actions/addedActions") as ControlProperties[];
	const itemsBinding = comboBox.getBinding("items");
	const titleKey = comboBox.getSelectedKey();
	const actionToFilter = addedActions.filter((addedAction) => addedAction.titleKey !== titleKey);
	const filter = actionToFilter.length ? new Filter("action", "NE", actionToFilter[0].titleKey) : [];
	(itemsBinding as ListBinding).filter(filter);
}

/**
 * Loads the available actions into the ComboBox control and sets up filtering.
 *
 * @param {Event} controlEvent - The event object triggered by the control action.
 */
function loadActions(controlEvent: Event) {
	const comboBox: ComboBox = controlEvent.getSource();
	const itemsBinding = comboBox.getBinding("items");

	if (itemsBinding?.isSuspended()) {
		itemsBinding.refresh(true);
		itemsBinding.resume();
	}

	comboBox.addEventDelegate({
		onBeforeRendering: filterCardActions.bind(null, comboBox)
	});
}

/**
 * Handles the change event for the title of an added action in the ComboBox control.
 *
 * @param {Event} oEvent - The event object triggered by the title change action.
 */
async function onAddedActionTitleChange(oEvent: Event) {
	const model = getDialogModel() as JSONModel;
	const control: ComboBox = oEvent.getSource();
	const path = control?.getBindingContext()?.getPath() as string;
	const manifest = getCurrentCardManifest();

	if (validateSelectedAction(control)) {
		const addedAction = model.getProperty(path) as ControlProperties;
		addedAction.titleKey = control.getSelectedKey();
		addedAction.title = control.getValue();
		addedAction.isStyleControlEnabled = true;
		updateRelativeproperties(addedAction, path || "");
		control.setValueState(ValueState.None);
	} else {
		if (control.getValue() === "" && control.getSelectedKey() === "") {
			control.setValueState(ValueState.None);
		} else {
			control.setValueState(ValueState.Error);
			control.setValueStateText(getTranslatedText("GENERATOR_ACTION_ERROR_TEXT"));
			const errorControls = model.getProperty("/configuration/errorControls");
			if (errorControls && !errorControls.includes(control)) {
				errorControls.push(control);
			}
		}
		control.focus();
	}
	resetCardActions(manifest);
	const addedActions = model.getProperty("/configuration/actions/addedActions") as ControlProperties[];
	for (const action of addedActions) {
		if (action.titleKey) {
			await addActionToCardManifest(manifest, action);
		}
	}
	renderCardPreview(manifest, model);
	transpileIntegrationCardToAdaptive(model);
}

/**
 * Handles the change event for the style of an added action in the ComboBox control.
 *
 * @param {Event} oEvent - The event object triggered by the style change action.
 */
function onAddedActionStyleChange(oEvent: Event) {
	const model = getDialogModel() as JSONModel;
	const control: ComboBox = oEvent.getSource();
	const path = control?.getBindingContext()?.getPath() as string;
	const addedAction = model.getProperty(path) as ControlProperties;
	addedAction.style = control.getSelectedKey();
	model.setProperty(path, addedAction);
	const manifest = getCurrentCardManifest();
	updateCardManifestAction(manifest, addedAction);
	renderCardPreview(manifest, model);
	transpileIntegrationCardToAdaptive(model);
}

/**
 * Retrieves the translated text for the given key from the i18n model.
 *
 * @param {string} key - The key for which the translated text is to be retrieved.
 * @returns {string} The translated text corresponding to the provided key.
 */
function getTranslatedText(key: string): string {
	return getDialogModel("i18n").getObject(key);
}

export { filterCardActions, loadActions, onActionAddClick, onAddedActionDelete, onAddedActionStyleChange, onAddedActionTitleChange };
