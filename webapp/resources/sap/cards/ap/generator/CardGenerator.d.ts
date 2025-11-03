/// <reference types="openui5" />
declare module "sap/cards/ap/generator/CardGenerator" {
    import type Dialog from "sap/m/Dialog";
    import Component from "sap/ui/core/Component";
    import type Control from "sap/ui/core/Control";
    import ResourceModel from "sap/ui/model/resource/ResourceModel";
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
    const initializeAsync: (appComponent: Component) => Promise<void>;
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
    const applyModelsToDialog: (dialog: Dialog, appComponent: Component, cardManifest?: CardManifest) => Promise<void>;
    /**
     * Initializes the card generator dialog asynchronously.
     * Loads the card generator dialog fragment, fetches the card manifest, and set the dialog model.
     * Opens the dialog and renders the card preview.
     *
     * @param {Component} appComponent - The root component of the application.
     * @returns {Promise<void>} - A promise that resolves when the dialog is initialized and opened.
     */
    const initializeCardGeneratorDialog: (appComponent: Component) => Promise<void>;
    /**
     * Retrieves the resource model for the card generator dialog.
     * Loads the i18n resource bundle and creates a new ResourceModel.
     *
     * @returns {ResourceModel} - The resource model for the card generator dialog.
     */
    function getResourceModelForDialog(): ResourceModel;
}
//# sourceMappingURL=CardGenerator.d.ts.map