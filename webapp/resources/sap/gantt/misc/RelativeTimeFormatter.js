/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/simple/GanttUtils"],function(t){"use strict";var i=function(i,e,s){this.oBaseTime=i;this.sUnit=e;this.sPrefix=s;this.iIntervalMillisecond=t.getObjectFromPath(e).offset(i,1).getTime()-i.getTime()};i.prototype.format=function(t){var i;var e=Math.floor((t.getTime()-this.oBaseTime.getTime())/this.iIntervalMillisecond)+1;i=this.sPrefix+" "+e;return i};return i},true);
//# sourceMappingURL=RelativeTimeFormatter.js.map