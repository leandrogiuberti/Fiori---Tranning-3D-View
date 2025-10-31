/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/fl/changeHandler/condenser/Classification"],function(e){"use strict";function t(e){return e.getItems().find(e=>e.getMetadata().getName()==="sap.cux.home.NewsAndPagesContainer")}let s=null;const n={applyChange:(e,n)=>{const o=t(n);if(s){clearTimeout(s)}s=setTimeout(()=>{o?.newsPersonalization(e.getContent())},0);return true},revertChange:(e,s)=>{const n=t(s);let o=e.getContent();o.newsFeedURL=o.oldNewsFeedUrl;o.showCustomNewsFeed=o.oldShowCustomNewsFeed;o.customNewsFeedKey=o.oldCustomNewsFeedKey;o.showDefaultNewsFeed=o.oldshowDefaultNewsFeed;o.showRssNewsFeed=o.oldShowRssNewsFeed;n?.newsPersonalization(o)},completeChangeContent:()=>{},getCondenserInfo:t=>({affectedControl:t.getSelector(),classification:e.LastOneWins,uniqueKey:"newsFeedUrl"})};return n});
//# sourceMappingURL=SetNewsFeedUrl.js.map