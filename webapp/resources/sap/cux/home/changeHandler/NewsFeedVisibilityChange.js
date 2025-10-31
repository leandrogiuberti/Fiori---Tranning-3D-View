/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/fl/changeHandler/condenser/Classification"],function(e){"use strict";function n(e){return e.getItems().find(e=>e.getMetadata().getName()==="sap.cux.home.NewsAndPagesContainer")}let t=null;const i={applyChange:(e,i)=>{const s=n(i);if(t){clearTimeout(t)}t=setTimeout(()=>{s?.newsVisibilityChangeHandler(e.getContent())},0);return true},revertChange:(e,t)=>{const i=n(t);let s=e.getContent();s.isNewsFeedVisible=!s.isNewsFeedVisible;i?.newsVisibilityChangeHandler(s)},completeChangeContent:()=>{},getCondenserInfo:n=>({affectedControl:n.getSelector(),classification:e.LastOneWins,uniqueKey:"newsFeedVisibility"})};return i});
//# sourceMappingURL=NewsFeedVisibilityChange.js.map