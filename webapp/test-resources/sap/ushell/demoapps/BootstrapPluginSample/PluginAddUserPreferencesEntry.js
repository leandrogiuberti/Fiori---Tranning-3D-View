// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview an example for a custom bootstrap plug-in which FOR USE in Selenium test
 */
sap.ui.define("sap.ushell.demo.PluginAddUserPreferencesEntry", [
    "sap/base/Log",
    "sap/m/Switch",
    "sap/m/Button",
    "sap/ui/core/EventBus",
    "sap/ushell/Container"
], function (
    Log,
    Switch,
    Button,
    EventBus,
    Container
) {
    "use strict";

    Log.debug("PluginAddUserPreferencesEntry - module loaded");

    function PluginSaveEntryConstructor (id) {
        this.init(id);
    }

    PluginSaveEntryConstructor.prototype = {
        init: function (id) {
            this.value = false;
            this.prevValue = false;
            this.id = `switchButton${id}`;
        },
        getValue: function () {
            return Promise.resolve(this.value);
        },
        onCancel: function () {
            this.value = this.prevValue;
            return this.value;
        },
        onSave: function () {
            return Promise.resolve(this.value);
        },
        getContent: function () {
            const that = this;
            return Promise.resolve(new Switch({
                id: this.id,
                state: this.value,
                change: function () {
                    that.value = this.getState();
                    that.prevValue = !this.getState();
                }
            }));
        }
    };

    function addUserPreferencesEntries () {
        Log.debug("PluginAddUserPreferencesEntry - inserting user preferences entry after renderer was loaded");
        const oRenderer = Container.getRendererInternal("fiori2");

        if (oRenderer) {
            const PluginSaveEntry4 = new PluginSaveEntryConstructor("4");
            const PluginSaveEntry5 = new PluginSaveEntryConstructor("5");

            oRenderer.addUserPreferencesEntry({
                title: "entry1HappyScenario",
                value: function () {
                    return new Promise((resolve) => {
                        window.setTimeout(() => {
                            resolve("entry1HappyScenario");
                        }, 2000);
                    });
                },
                content: function () {
                    return new Promise((resolve) => {
                        window.setTimeout(() => {
                            resolve(new Button("userPrefEntryButton1", {
                                text: "Button"
                            }));
                        }, 2000);
                    });
                },
                onSave: function () {
                    return new Promise((resolve) => {
                        window.setTimeout(() => {
                            resolve();
                        }, 2000);
                    });
                }
            });

            oRenderer.addUserPreferencesEntry({
                title: "entry2SavingKey",
                value: function () {
                    return new Promise((resolve) => {
                        window.setTimeout(() => {
                            resolve("entry2SavingValue");
                        }, 500);
                    });
                },
                onSave: function () {
                    return new Promise((resolve, reject) => {
                        window.setTimeout(() => {
                            reject(new Error("entry2FailureScenario"));
                        }, 500);
                    });
                }
            });

            oRenderer.addUserPreferencesEntry({
                title: "entry3ValueFailure",
                value: function () {
                    return new Promise((resolve, reject) => {
                        window.setTimeout(() => {
                            reject(new Error("entry3ValueFailure"));
                        }, 2000);
                    });
                },
                content: function () {
                    return new Promise((resolve) => {
                        window.setTimeout(() => {
                            resolve("entry3ValueFailure");
                        }, 2000);
                    });
                },
                onSave: function () {
                    return new Promise((resolve, reject) => {
                        window.setTimeout(() => {
                            reject(new Error("entry3ValueFailure"));
                        }, 2000);
                    });
                }
            });

            oRenderer.addUserPreferencesEntry({
                title: "entry4SaveScenario",
                value: PluginSaveEntry4.getValue.bind(PluginSaveEntry4),
                content: PluginSaveEntry4.getContent.bind(PluginSaveEntry4),
                onSave: PluginSaveEntry4.onSave.bind(PluginSaveEntry4),
                onCancel: PluginSaveEntry4.onCancel.bind(PluginSaveEntry4)
            });

            oRenderer.addUserPreferencesEntry({
                title: "entry5SaveScenario",
                value: PluginSaveEntry5.getValue.bind(PluginSaveEntry5),
                content: PluginSaveEntry5.getContent.bind(PluginSaveEntry5),
                onSave: PluginSaveEntry5.onSave.bind(PluginSaveEntry5),
                onCancel: PluginSaveEntry5.onCancel.bind(PluginSaveEntry5)
            });

            Log.debug("PluginAddUserPreferencesEntry - Added a user preferences entry into the Shell Model");
        } else {
            Log.error("BootstrapPluginSample - failed to apply renderer extensions, because the Renderer is not available");
        }
    }

    // the module could be loaded asynchronously, the shell does not guarantee a loading order;
    // therefore, we have to consider both cases, i.e. renderer is loaded before or after this module
    if (Container.getRendererInternal("fiori2")) {
        // fiori renderer already loaded, apply extensions directly
        addUserPreferencesEntries();
    } else {
        // fiori renderer not yet loaded, register handler for the loaded event
        EventBus.getInstance().subscribe("sap.ushell", "rendererLoaded", addUserPreferencesEntries, this);
    }
});
