/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import { AppType, getApplicationFloorplan } from "sap/cards/ap/common/helpers/ApplicationInfo";
import { getObjectPageCardManifestForPreview } from "sap/cards/ap/common/services/RetrieveCard";
import type Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import Component from "sap/ui/core/Component";
import type Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import CoreLib from "sap/ui/core/Lib";
import { CardManifest } from "sap/ui/integration/widgets/Card";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { CardGeneratorDialogController, setValueStateForAdvancedPanel } from "./app/CardGeneratorDialogController";
import { PREVIEW_OPTIONS } from "./config/PreviewOptions";
import { getCardGeneratorDialogModel } from "./helpers/CardGeneratorModel";
import { createCardManifest, renderCardPreview, updateCardGroups } from "./helpers/IntegrationCardHelper";
import { Application } from "./pages/Application";
import { FreeStyle } from "./pages/FreeStyle";
import { ObjectPage } from "./pages/ObjectPage";

enum CardTypes {
	INTEGRATION = "integration",
	ADAPTIVE = "adaptive"
}

let cardGeneratorDialog: Promise<Control | Control[]> | undefined;

/**
 * Initializes the card generator asynchronously.
 * Determines the application floorplan and validates card generation.
 * If card generation is not valid, displays a warning message.
 * Otherwise, initializes the card generator dialog.
 *
 * @param {Component} appComponent - The root component of the application.
 * @returns {Promise<void>} - A promise that resolves when the initialization is complete.
 */
export const initializeAsync = async function (appComponent: Component): Promise<void> {
	const applicationFloorplan = getApplicationFloorplan(appComponent);
	let applicationInstance;

	if (applicationFloorplan === AppType.ObjectPage) {
		applicationInstance = ObjectPage.createInstance(appComponent);
	} else {
		applicationInstance = FreeStyle.createInstance(appComponent);
		await (applicationInstance as FreeStyle).updateObjectContextFreeStyleModel();
	}

	const isValidConfiguration = applicationInstance.validateCardGeneration();

	if (!isValidConfiguration) {
		const resourceModel = getResourceModelForDialog();
		const warningMsg: string = resourceModel.getObject("GENERATE_CARD_NOT_SUPPORTED");
		MessageBox.warning(warningMsg, {
			actions: MessageBox.Action.OK,
			emphasizedAction: MessageBox.Action.OK
		});
		return;
	}
	return await initializeCardGeneratorDialog(appComponent);
};

/**
 * Applies models to the card generator dialog.
 *
 * This function sets up various models for the dialog, including the i18n model, preview options model,
 * and the freeStyle model. It also fetches and sets the card generator dialog model.
 *
 * @param {Dialog} dialog - The dialog to which the models will be applied.
 * @param {Component} appComponent - The root component of the application.
 * @param {CardManifest} [cardManifest] - The card manifest to be used for creating the card.
 * @returns {Promise<void>} - A promise that resolves when the models have been applied to the dialog.
 */
const applyModelsToDialog = async function (dialog: Dialog, appComponent: Component, cardManifest?: CardManifest): Promise<void> {
	const applicationInstance = Application.getInstance();
	const entityRelatedInfo = applicationInstance.getEntityRelatedInfo();

	if (!dialog.getModel("i18n")) {
		const resourceModel = getResourceModelForDialog();
		dialog.setModel(resourceModel, "i18n");
	}

	if (!dialog.getModel("previewOptions")) {
		const previewOptionsModel = new JSONModel(PREVIEW_OPTIONS);
		dialog.setModel(previewOptionsModel, "previewOptions");
	}

	const freeStyleModel =
		applicationInstance instanceof FreeStyle
			? applicationInstance.getFreeStyleModelForDialog()
			: new JSONModel({
					isServiceDetailsView: false,
					isApplyServiceDetailsEnabled: false
				});
	dialog.setModel(freeStyleModel, "freeStyle");

	if (entityRelatedInfo.entitySetWithObjectContext) {
		const dialogModel = await getCardGeneratorDialogModel(appComponent, cardManifest);
		dialog.setModel(dialogModel);
		const integrationCardManifest = await createCardManifest(appComponent, cardManifest as CardManifest, dialogModel);
		renderCardPreview(integrationCardManifest);
		updateCardGroups(dialogModel);
		setValueStateForAdvancedPanel();
		freeStyleModel.setProperty("/isServiceDetailsView", false);
	}
};

/**
 * Initializes the card generator dialog asynchronously.
 * Loads the card generator dialog fragment, fetches the card manifest, and set the dialog model.
 * Opens the dialog and renders the card preview.
 *
 * @param {Component} appComponent - The root component of the application.
 * @returns {Promise<void>} - A promise that resolves when the dialog is initialized and opened.
 */
export const initializeCardGeneratorDialog = async function (appComponent: Component): Promise<void> {
	if (!cardGeneratorDialog) {
		cardGeneratorDialog = Fragment.load({
			id: "cardGeneratorDialog",
			name: "sap.cards.ap.generator.app.CardGeneratorDialog",
			controller: CardGeneratorDialogController
		});
	}

	let cardManifest: CardManifest | undefined;

	try {
		cardManifest = (await getObjectPageCardManifestForPreview(appComponent, {
			cardType: CardTypes.INTEGRATION,
			includeActions: false,
			hideActions: false,
			isDesignMode: true
		})) as CardManifest;
	} catch (oError: unknown) {
		Log.error("Error while fetching the card manifest.");
	}

	cardGeneratorDialog
		.then(async function (oDialog: Control | Control[]) {
			applyModelsToDialog(oDialog as Dialog, appComponent, cardManifest);
			CardGeneratorDialogController.initialize();
			(oDialog as Dialog).open();
			const element = document.getElementById("cardGeneratorDialog--contentSplitter");
			if (element) {
				element.style.backgroundColor = "#f8f8f8";
			}
			return oDialog;
		})
		.catch(function (oError: Error) {
			Log.error("Error while loading or initializing the dialog:", oError);
		});
};

/**
 * Retrieves the resource model for the card generator dialog.
 * Loads the i18n resource bundle and creates a new ResourceModel.
 *
 * @returns {ResourceModel} - The resource model for the card generator dialog.
 */
export function getResourceModelForDialog(): ResourceModel {
	const oResourceBundle = CoreLib.getResourceBundleFor("sap.cards.ap.generator.i18n");
	return new ResourceModel({
		bundleUrl: oResourceBundle.oUrlInfo.url,
		bundle: oResourceBundle //Reuse created bundle to stop extra network calls
	});
}
