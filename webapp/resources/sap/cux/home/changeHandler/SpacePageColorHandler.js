/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/fl/changeHandler/condenser/Classification"],function(e){"use strict";function n(e){return e.getItems().find(e=>e.getMetadata().getName()==="sap.cux.home.NewsAndPagesContainer")}const t={applyChange:(e,t)=>{const o=n(t);o?.setColorPersonalizations(e.getContent());return true},revertChange:(e,t)=>{const o=e.getContent();o.forEach(e=>{e.BGColor=e.oldColor;e.applyColorToAllPages=e.oldApplyColorToAllPages});const a=n(t);a?.setColorPersonalizations(o)},completeChangeContent:()=>{},getCondenserInfo:n=>{const t=n.getContent();return{affectedControl:n.getSelector(),classification:e.LastOneWins,uniqueKey:t.spaceId+(t.pageId||"")+"_color"}}};return t});
//# sourceMappingURL=SpacePageColorHandler.js.map