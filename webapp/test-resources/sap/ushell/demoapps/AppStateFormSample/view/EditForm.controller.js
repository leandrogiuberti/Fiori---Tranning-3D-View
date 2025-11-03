// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/Input",
    "sap/ui/core/Element",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (Log, Input, Element, Controller, UIComponent) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppStateFormSample.view.EditForm", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberof view.Detail
         */
        onInit: function () {
            const that = this;
            this.cnt = 0;
            const oModel = this.getMyComponent().getModel("AppState");
            oModel.bindTree("/").attachChange(() => {
                if (oModel.getProperty("/appState/chatList").length !== that.getView().byId("chatList2").getItems().length) {
                    that.alignControls();
                }
            });

            this.getView().setModel(this.getMyComponent().getModel("AppState"), "AppState");
            this.getMyComponent().getEventBus().subscribe("sap.ushell.demoapps", "restoreUIState", this.restoreUIState.bind(this));
            this.getMyComponent().getEventBus().subscribe("sap.ushell.demoapps", "serializeUIState", this.serializeUIState.bind(this));
            this.alignControls();
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberof view.Detail
         */
        onBeforeRendering: function () {
            this.alignControls();
        },

        alignControls: function () {
            let ctl;
            let oControl;
            const that = this;
            Log.error("align controls");
            this.getMyComponent().inEvent = true;
            this.alignListLength();
            this.getMyComponent().inEvent = false;
            const oModel = this.getView() && this.getView().getModel("AppState");
            this.getView().byId("chatList2").getItems();
            if (!oModel) {
                return;
            }
            const aArr = oModel.getProperty("/appState/chatList");
            aArr.forEach((oText, iIndex) => {
                oControl = that.getControlByIndex(iIndex);
                if (!oControl) {
                    // ! create a new Control
                    ctl = new Input({
                        // "data-change" : that.onInputChange.bind(that)
                        value: `{AppState>/appState/chatList/${iIndex}/text}`
                    });
                    ctl.attachLiveChange(that.onInputChange.bind(that));
                    ctl.setModel(that.getView().getModel("AppState"));
                    that.getView().byId("chatList2").addItem(ctl);
                    setTimeout(() => {
                        const oDomRef = ctl.getFocusDomRef();
                        if (oDomRef) {
                            oDomRef.addEventListener("focus", that.onFocus.bind(that));
                        }
                    }, 100);
                }
            });
            const host = this.getView().byId("chatList2");
            while (host.getItems().length > aArr.length) {
                host.removeItem(host.getItems()[host.getItems().length - 1]);
            }
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getFocusControlIndex: function () {
            let oControl;
            let iIndexFocus = -1;
            const that = this;
            const oModel = this.getView() && this.getView().getModel("AppState");
            const aParentChain = [];
            const sFocusControlId = Element.getActiveElement()?.getId();
            oControl = Element.getElementById(sFocusControlId);
            while (oControl && oControl.getParent()) {
                aParentChain.push(oControl.getId());
                oControl = oControl.getParent();
            }
            const aArr = oModel.getProperty("/appState/chatList");
            aArr.forEach((oState, iIndex) => {
                oControl = that.getControlByIndex(iIndex);
                if (oControl) {
                    oControl.getFocusInfo();
                    if (aParentChain.indexOf(oControl.getId()) >= 0) {
                        Log.error(`current focus control index ${iIndex}`);
                        iIndexFocus = iIndex;
                    }
                }
            });
            return iIndexFocus;
        },

        onFocus: function (ev) {
            let idx = -1;
            const oModel = this.getView() && this.getView().getModel("AppState");
            let oFs;
            Log.error("focus");
            // setTimeout(this.serializeUIState.bind(this) , 100);
            // find out the current control natively as even delayed detection does not work
            this.getView().byId("chatList2").getItems().forEach((ctl, iIndex) => {
                if (ctl.getFocusDomRef() === ev.currentTarget) {
                    idx = iIndex;
                    oFs = ctl.getFocusInfo();
                }
            });
            this.currentFocusIndex = idx;
            this.currentFocusInfo = oFs;
            Log.error(`focus index = ${idx}`);
            this.currentFocusIndex = idx;
            this.currentFocusInfo = oFs;
            this.setDataIfDifferent(oModel, "/appState/uiState/editForm/focusIndex", this.currentFocusIndex);
            this.setDataIfDifferent(oModel, "/appState/uiState/editForm/focusInfo", this.currentFocusInfo);
            Log.error(`in event current focus control index ${idx} info ${JSON.stringify(oFs)}`);
        },

        onInputChange: function (ev) {
            // this.getView().byId("search").attachLiveChange(this.handleChange.bind(this));
            // if the change is not in the last control and the focus is not in
            // the last control and the last and next to last
            const idx = ev.getSource().getParent().getItems().indexOf(ev.getSource());
            const oModel = this.getView() && this.getView().getModel("AppState");
            const that = this;
            const oFs = ev.getSource().getFocusInfo();
            oModel.getProperty("/appState/chatList");
            Log.error("now change");
            that.currentFocusIndex = idx;
            that.currentFocusInfo = oFs;
            this.setDataIfDifferent(oModel, "/appState/uiState/editForm/focusIndex", this.currentFocusIndex);
            this.setDataIfDifferent(oModel, "/appState/uiState/editForm/focusInfo", this.currentFocusInfo);
            Log.error(`in event current focus control index ${idx} info ${JSON.stringify(oFs)}`);
            ev.getSource();
            setTimeout(() => {
                that.getView().byId("chatList2").getItems().forEach((ctl) => {
                    const oDomRef = ctl.getFocusDomRef();
                    if (oDomRef) {
                        oDomRef.addEventListener("focus", that.onFocus.bind(that));
                    }
                });
            }, 100);
            this.alignControls();
            // setTimeout(this.serializeUIState.bind(this),100);
        },

        setDataIfDifferent: function (oModel, sPath, newData) {
            const oldData = oModel.getProperty(sPath);
            if (oldData === newData) {
                return;
            }
            if (!oldData || !newData && !(!oldData && !newData)) {
                oModel.setProperty(sPath, newData);
                return;
            }
            if (typeof oldData === "object" && JSON.stringify(oldData) === JSON.stringify(newData)) {
                return;
            }
            oModel.setProperty(sPath, newData);
        },

        alignListLength: function () {
            const oModel = this.getView() && this.getView().getModel("AppState");
            const idx = this.getFocusControlIndex();
            if (!oModel) {
                return;
            }
            const aArr = oModel.getProperty("/appState/chatList");
            Log.error(`align list length${idx}`);
            while ((aArr.length > 3 && aArr.length > idx) && (aArr[aArr.length - 1].text === "") && (aArr[aArr.length - 2].text === "")) {
                aArr.splice(-1, 1);
            }
            if ((aArr.length < 2) || ((aArr.length - 1) === idx) || (aArr[aArr.length - 1].text !== "")) {
                aArr.push({ text: "" });
            }
        },
        handleBtn1Press: function () {
            this.getMyComponent().navTo("toView2");
        },

        getMyComponent: function () {
            return this.getOwnerComponent();
        },

        getControlByIndex: function (iIndex) {
            if (iIndex < 0) {
                return this.getView().byId("chatList2").getItems()[this.getView().byId("chatList2").getItems().length - 2];
            }
            const li = this.getView().byId("chatList2").getItems()[iIndex];

            if (li === undefined) {
                return undefined;
            }
            return li;
        },
        serializeUIState: function () {
            Log.error("serializeUIState");
        },

        restoreUIState: function () {
            let oControl;
            const oModel = this.getView() && this.getView().getModel("AppState");
            Log.error("restoreUIState");
            const iFocus = oModel.getProperty("/appState/uiState/editForm/focusIndex");
            const iFI = oModel.getProperty("/appState/uiState/editForm/focusInfo");
            if (iFocus !== undefined && iFocus >= 0) {
                oControl = this.getControlByIndex(iFocus);
                if (!oControl) {
                    return;
                }
                const oCurrentFI = oControl.getFocusInfo();
                Log.error(`current uistate ${JSON.stringify(oCurrentFI)}`);
                Log.error(` setting focus info on ${iFocus} to ${JSON.stringify(iFI)}`);
                if (iFI) {
                    oCurrentFI.cursorPos = iFI.cursorPos;
                    oCurrentFI.selectionEnd = iFI.selectionEnd;
                    oCurrentFI.selectionStart = iFI.selectionStart;
                    oControl.applyFocusInfo(oCurrentFI);
                    setTimeout(() => {
                        Log.error(` setting focus info on ${iFocus} to ${JSON.stringify(oCurrentFI)}`);
                        oControl.applyFocusInfo(oCurrentFI);
                        oControl.focus();
                    }, 100);
                }
                oControl.focus();
            }
        },

        findIndex: function (sId, aArray) {
            return aArray.reduce((prevValue, currentElement, index) => {
                if (currentElement.Key === sId) {
                    return index;
                }
                return prevValue;
            }, aArray.length);
        },

        onBtnBackPressed: function () {
            this.getMyComponent().navTo("displayFavorites");
        },

        onUndoPress: function () {
            let sLastKey;
            const oModel = this.getView().getModel("AppState");
            this.getMyComponent().inEvent = true;
            // add the current model to the favorites (or update the values therein).
            const aUndoStack = oModel.getProperty("/appState/uiState/editForm/undoStack");
            aUndoStack.pop();
            this.getMyComponent().inEvent = false;
            if (aUndoStack.length > 0) {
                sLastKey = aUndoStack[aUndoStack.length - 1];
                this.getRouter().navTo("editForm", { iAppState: sLastKey });
            } else {
                this.getMyComponent().inEvent = true;
                oModel.setProperty("/appState/uiState/editForm/undoStackPresent", aUndoStack.length > 0);
                this.getMyComponent().inEvent = false;
            }
        },

        onFillPress: function () {
            // register a focus change event via jQuery
            this.getView().getModel("AppState").setProperty("/appState/chatList", [
                { text: "What do we do?" },
                { text: "Save the state before it's to late!" },
                { text: "When do we save?" },
                { text: "Always, always, on every state change!" },
                { text: "" },
                { text: "If it's worth asking the user, it's worth remembering." },
                { text: "  Alan Cooper" }
            ]);
            this.getView().byId("chatList2").getItems()[0].focus();
            this.alignControls();
        },

        onDeletePress: function () {
            // register a focus change event via jQuery
            this.getView().getModel("AppState").setProperty("/appState/chatList", [{ text: "" }]);
            this.getView().byId("chatList2").getItems()[0].focus();
            this.alignControls();
            return;
        }
    });
});
