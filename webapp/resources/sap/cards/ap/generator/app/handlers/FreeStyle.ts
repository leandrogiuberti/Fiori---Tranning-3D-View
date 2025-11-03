/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { getEntitySetWithContextURLs } from "sap/cards/ap/common/odata/ODataUtils";
import type ComboBox from "sap/m/ComboBox";
import type Event from "sap/ui/base/Event";
import type { CardManifest } from "sap/ui/integration/widgets/Card";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
import { getCardGeneratorDialogModel } from "../../helpers/CardGeneratorModel";
import { createCardManifest, getCurrentCardManifest, renderCardPreview } from "../../helpers/IntegrationCardHelper";
import { Application } from "../../pages/Application";
import { FreeStyle } from "../../pages/FreeStyle";
import { getCardGeneratorDialog, getDialogModel } from "../../utils/CommonUtils";

/**
 * Handles the service change event.
 *
 * @param {Event} event - The event object triggered by the service change.
 */
function onServiceChange(event: Event) {
	const control: ComboBox = event.getSource();
	const selectedService = control.getValue();
	const freeStyleDialogModel = getDialogModel("freeStyle") as JSONModel;
	freeStyleDialogModel.setProperty("/entitySet", "");
	freeStyleDialogModel.setProperty("/entitySetWithObjectContext", "");
	freeStyleDialogModel.setProperty("/currentService", selectedService);
	freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", false);
}

/**
 * Handles the entity set path change event.
 *
 * @param event
 */
async function onEntitySetPathChange(event: Event) {
	const applicationInstance = Application.getInstance() as FreeStyle;
	const { rootComponent } = applicationInstance.fetchDetails();
	const control: ComboBox = event.getSource();
	const selectedEntitySet = control.getValue();
	const freeStyleDialogModel = getDialogModel("freeStyle") as JSONModel;
	const serviceUrl = freeStyleDialogModel.getProperty("/currentService");
	freeStyleDialogModel.setProperty("/entitySet", selectedEntitySet);
	freeStyleDialogModel.setProperty("/entitySetWithObjectContext", "");
	freeStyleDialogModel.setProperty("/entitySetWithObjectContextList", []);
	freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", false);
	freeStyleDialogModel.setProperty("/isEntityPathChanged", true);
	const entitySetWithContextList = await getEntitySetWithContextURLs(
		serviceUrl,
		selectedEntitySet,
		rootComponent.getModel() as V2ODataModel | V4ODataModel
	);
	if (entitySetWithContextList?.length) {
		freeStyleDialogModel.setProperty("/entitySetWithObjectContextList", entitySetWithContextList);
	}
}

/**
 * Handles the context path change event.
 *
 * @param event
 */
async function onContextPathChange(event: Event) {
	const freeStyleDialogModel = getDialogModel("freeStyle") as JSONModel;
	freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", false);
	const applicationInstance = Application.getInstance() as FreeStyle;
	const control: ComboBox = event.getSource();
	const selectedContextPath = control.getValue();

	if (selectedContextPath) {
		await applicationInstance.fetchDataForObjectContext(selectedContextPath);
		freeStyleDialogModel.setProperty("/entitySetWithObjectContext", selectedContextPath);
		freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", true);
		freeStyleDialogModel.setProperty("/isContextPathChanged", true);
	}
}

/**
 * Applies the service details.
 */
async function applyServiceDetails() {
	const appComponent = Application.getInstance().getRootComponent();
	const freeStyleDialogModel = getDialogModel("freeStyle") as JSONModel;
	freeStyleDialogModel.setProperty("/isServiceDetailsView", false);

	const currentCardManifest = getCurrentCardManifest();
	const isEntityPathChanged = currentCardManifest
		? freeStyleDialogModel.getProperty("/entitySet") !==
			(currentCardManifest?.["sap.card"]?.configuration?.parameters?._entitySet as { value?: string })?.value
		: freeStyleDialogModel.getProperty("/isEntityPathChanged");
	const isContextPathChanged = freeStyleDialogModel.getProperty("/isContextPathChanged");
	const cardManifest = Object.keys(currentCardManifest).length > 0 && !isEntityPathChanged ? currentCardManifest : undefined;
	const dialog = getCardGeneratorDialog();
	const dialogModel = await getCardGeneratorDialogModel(appComponent, cardManifest);

	if (isEntityPathChanged || isContextPathChanged) {
		dialog?.setModel(dialogModel);
		freeStyleDialogModel.setProperty("/isEntityPathChanged", false);
		freeStyleDialogModel.setProperty("/isContextPathChanged", false);
	}

	const integrationCardManifest = await createCardManifest(
		appComponent,
		cardManifest as unknown as CardManifest,
		dialog?.getModel() as JSONModel
	);
	renderCardPreview(integrationCardManifest);
}

function onBackButtonPress() {
	const freeStyleDialogModel = getDialogModel("freeStyle") as JSONModel;
	freeStyleDialogModel.setProperty("/isServiceDetailsView", true);
}

export { applyServiceDetails, onBackButtonPress, onContextPathChange, onEntitySetPathChange, onServiceChange };
