/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";var e=function(e){const n=window.fc.discontinuitySkipWeeklyPattern(e);n.tickFilter=function(e){var n=e.reduce(function(e,n){var t=this.clampUp(n).getTime();var r=this.clampDown(n).getTime();if(t!==r){e.add(t)}else{e.add(n.getTime())}return e}.bind(this),new Set);var t=Array.from(n).map(function(e){return new Date(e)});return t};return n};var n=function(n){var t=e(n.pattern);if(n.localPattern){t.localInstance=e(n.localPattern)}t.tradingWeekdays=t.tradingDays.reduce(function(e,n,r){if(t.tradingDays[r].totalTradingTimeInMiliseconds>0){e.push({index:r,tradingDay:t.tradingDays[r]})}return e},[]);t.tradingWeekdaysIndex=t.tradingWeekdays.map(function(e){return e.index});t.firstTradingDayOfWeek=function(e){var n=t.tradingWeekdays;if(n.length===0){return e}var r=n[0].index;if(n.length>1&&r!==e){for(var i=0;i<n.length;i++){var a=n[i].index;if(a===e){r=e;break}else if(a>e&&a<r){r=a}}}return r};t.useDiscontinuousScale=function(e){return e==="d3.time.minute"||e==="d3.time.hour"||e==="d3.time.day"};return t};return{providers:{weeklyPattern:n}}});
//# sourceMappingURL=WeeklyDiscontinuousProvider.js.map