/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";class e{constructor(e,t){this.key=e;this.personalizationStorageInstance=t;this.key=e;this.personalizationStorageInstance=t}getKey(){return this.key}setPersData(e){return jQuery.Deferred().resolve(this.personalizationStorageInstance.setItem(this.key,e))}getPersData(){return jQuery.Deferred().resolve(this.personalizationStorageInstance.getItem(this.key))}getResetPersData(){return jQuery.Deferred().resolve(this.personalizationStorageInstance.getItem(this.key+"INITIAL"))}}return e});
//# sourceMappingURL=Personalizer.js.map