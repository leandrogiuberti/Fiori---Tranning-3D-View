/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";class e{model;constructor(e){this.model=e}calculate(e,t,l){if(!this.model.config.folderMode||!this.model.config.autoAdjustResultViewTypeInFolderMode){return t}let o;if(l.isFolderMode()){o="searchResultTable"}else{o="searchResultList"}if(e.indexOf(o)<0){return t}return o}}var t={__esModule:true};t.FolderModeResultViewTypeCalculator=e;return t});
//# sourceMappingURL=FolderModeUtils.js.map