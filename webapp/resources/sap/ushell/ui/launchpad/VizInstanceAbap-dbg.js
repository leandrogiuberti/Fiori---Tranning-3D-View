// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/Deferred",
    "sap/ushell/ui/launchpad/VizInstance",
    "sap/m/library",
    "sap/base/Log",
    "sap/ushell/library",
    "sap/ushell/utils/chipsUtils",
    "sap/ushell/ui/launchpad/VizInstanceRenderer",
    "sap/ushell/Container"
], (
    Deferred,
    VizInstance,
    mobileLibrary,
    Log,
    ushellLibrary,
    chipsUtils,
    VizInstanceRenderer,
    Container
) => {
    "use strict";

    // shortcut for sap.m.LoadState
    const LoadState = mobileLibrary.LoadState;

    // shortcut for sap.ushell.DisplayFormat
    const DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * @alias sap.ushell.ui.launchpad.VizInstanceAbap
     * @class
     * @classdesc for a VizInstance for ABAP data
     *
     * @extends sap.ushell.ui.launchpad.VizInstance
     *
     * @since 1.77
     */
    const VizInstanceAbap = VizInstance.extend("sap.ushell.ui.launchpad.VizInstanceAbap", /** @lends sap.ushell.ui.launchpad.VizInstanceAbap.prototype */ {
        metadata: {
            library: "sap.ushell"
        },
        renderer: VizInstanceRenderer
    });

    VizInstanceAbap.prototype.init = function () {
        VizInstance.prototype.init.apply(this, arguments);

        this._oLoadDeferred = new Deferred();

        this._oChipInstancePromise = Container.getServiceAsync("PageBuilding")
            .then((oPageBuildingService) => {
                const oFactory = oPageBuildingService.getFactory();

                const oInstantiationData = this.getInstantiationData();
                let oRawChipInstanceData;
                let oBags;

                if (!oInstantiationData.simplifiedChipFormat) {
                    oRawChipInstanceData = {
                        chipId: oInstantiationData.chip.id,
                        chip: oInstantiationData.chip
                    };
                } else {
                    const oSimplifiedChip = oInstantiationData.chip || {};
                    oBags = oSimplifiedChip.bags;
                    oRawChipInstanceData = {
                        chipId: oSimplifiedChip.chipId,
                        // string is expected
                        configuration: oSimplifiedChip.configuration ? JSON.stringify(oSimplifiedChip.configuration) : "{}"
                    };
                }

                const oChipInstance = oFactory.createChipInstance(oRawChipInstanceData);

                chipsUtils.addBagDataToChipInstance(oChipInstance, oBags);
                return oChipInstance;
            });
    };

    /**
     * A function which sets the content of the VizInstance to a UI5 view.
     * @param {boolean} [isCustom] Whether this VizInstance is a standard tile or custom.
     * @returns {Promise<undefined>} Resolves when the chip instance is loaded.
     * @override
     * @since 1.77
     */
    VizInstanceAbap.prototype.load = function (isCustom) {
        this._oChipInstancePromise
            .then((oResolvedChipInstance) => {
                this._oChipInstance = oResolvedChipInstance;

                return new Promise(this._oChipInstance.load);
            })
            .then(() => {
                if (this.getPreview()) {
                    const oPreviewContract = this._oChipInstance.getContract("preview");
                    // the preview contract doesn't have to be implemented as it might just not be needed
                    // e.g. for tiles that don't display any dynamic data anyway
                    if (oPreviewContract) {
                        oPreviewContract.setEnabled(true);
                    }
                }
                // apply current visibility, default for chips is visible
                // this might lead to instant requests when tileView is fetched
                this._setVisible(this.getActive());

                return this._oChipInstance.getImplementationAsSapui5Async();
            })
            .then((oView) => {
                this._setChipInstanceType();
                this.setContent(oView);
                // Fix parent relation for the component instance to make GridContainer DnD work
                // BCP: 2170186464
                if (oView.getComponentInstance && oView.getComponentInstance()) {
                    oView.getComponentInstance().setParent(this);
                }

                this._oLoadDeferred.resolve();
            })
            .catch((oError) => {
                this.setState(LoadState.Failed);

                this._oLoadDeferred.reject(oError);
            });

        return this._oLoadDeferred.promise;
    };

    VizInstanceAbap.prototype.loaded = function () {
        return this._oLoadDeferred.promise;
    };

    /**
     * Sets the display format of the CHIP instance via the instance's types contract
     *
     * @since 1.88
     */
    VizInstanceAbap.prototype._setChipInstanceType = function () {
        const oTypesContract = this._oChipInstance.getContract("types");
        if (oTypesContract) {
            oTypesContract.setType(this._mapDisplayFormatToChip(this.getDisplayFormat()));
        }
    };

    /**
     * Maps the display format to the CHIP type
     *
     * @param {DisplayFormat} sDisplayFormat The display format to be mapped
     * @returns {string} The appropriate type
     * @since 1.88
     */
    VizInstanceAbap.prototype._mapDisplayFormatToChip = function (sDisplayFormat) {
        const oDisplayFormatMapping = {};

        oDisplayFormatMapping[DisplayFormat.Standard] = "tile";
        oDisplayFormatMapping[DisplayFormat.StandardWide] = "tile";
        oDisplayFormatMapping[DisplayFormat.Compact] = "link";
        oDisplayFormatMapping[DisplayFormat.Flat] = "flat";
        oDisplayFormatMapping[DisplayFormat.FlatWide] = "flatwide";

        return oDisplayFormatMapping[sDisplayFormat];
    };

    /**
     * Updates the chip instance's visibility if the contract is active.
     *
     * @param {boolean} visible The visibility state to be set
     * @since 1.78
     */
    VizInstanceAbap.prototype._setVisible = function (visible) {
        const oVisibleContract = this._oChipInstance && !this._oChipInstance.isStub() && this._oChipInstance.getContract("visible");

        if (oVisibleContract) {
            oVisibleContract.setVisible(visible);
        }
    };

    /**
     * Refreshes the chip instance's data
     *
     * @since 1.78
     */
    VizInstanceAbap.prototype.refresh = function () {
        // The CHIP instance is only available after the VizInstance was loaded
        if (this._oChipInstance) {
            // The refresh handler is provided directly on the CHIP instance and not as contract
            this._oChipInstance.refresh();
        }
    };

    /**
     * Updates the visualization's active state.
     * E.g. inactive dynamic tiles do not send requests
     *
     * @param {boolean} active The visualization's active state
     * @param {boolean} refresh Refresh the visualization immediately
     * @returns {object} The VizInstance
     * @since 1.78
     */
    VizInstanceAbap.prototype.setActive = function (active, refresh) {
        this._setVisible(active);

        if (refresh) {
            this.refresh();
        }

        return this.setProperty("active", active, false);
    };

    return VizInstanceAbap;
});
