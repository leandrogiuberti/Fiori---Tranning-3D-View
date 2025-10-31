/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";class s{show(){}hide(){}setBusy(){}}class e{model;constructor(s){this.model=s;this.model.setProperty("/isBusy",false)}show(){this.model.setProperty("/isBusy",true)}hide(){this.model.setProperty("/isBusy",false)}setBusy(s){if(s){this.show()}else{this.hide()}}}var t={__esModule:true};t.DummyBusyIndicator=s;t.BusyIndicator=e;return t});
//# sourceMappingURL=BusyIndicator.js.map