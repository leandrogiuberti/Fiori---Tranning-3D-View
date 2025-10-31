/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/ushell/Container"],function(e){"use strict";class t{static async create(){const s=await e.getServiceAsync("PersonalizationV2");const a=await s.getContainer("ushellSearchPersoServiceContainer",{validity:Infinity},null);return new t(a)}eshIsStorageOfPersonalDataAllowedKey="ESH-IsStorageOfPersonalDataAllowed";constructor(e){this.container=e}async deletePersonalData(){}setIsStorageOfPersonalDataAllowed(e){this.setItem(this.eshIsStorageOfPersonalDataAllowedKey,e)}isStorageOfPersonalDataAllowed(){const e=this.getItem(this.eshIsStorageOfPersonalDataAllowedKey);if(typeof e==="boolean"){return e}return true}save(){return this.container.save(0)}getItem(e){e=this.limitLength(e);return this.container.getItemValue(e)}setItem(e,t){e=this.limitLength(e);const s=this.getItem(e);if(JSON.stringify(s)===JSON.stringify(t)){return true}this.container.setItemValue(e,t);this.save();return true}deleteItem(e){this.container.deleteItem(e)}limitLength(e){return e.slice(-40)}}return t});
//# sourceMappingURL=FLPPersonalizationStorage.js.map