/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/misc/Format","sap/gantt/shape/ext/ubc/UbcPolygon"],function(t,e){"use strict";var i=e.extend("sap.gantt.shape.ext.ubc.UbcUnderCapacityZonePolygon",{});i.prototype.getFill=function(t,e){if(this.mShapeConfig.hasShapeProperty("fill")){return this._configFirst("fill",t)}return"#40d44c"};i.prototype.getPoints=function(e,i){if(this.mShapeConfig.hasShapeProperty("points")){return this._configFirst("points",e)}var a="";var r=this._getMaxY(e,i);var o=this._getMaxTotalRevised(e);var s=i.rowHeight-1;var n=e.drawData?e.drawData:e.period;var p=this.getAxisTime();for(var m=0;m<n.length;m++){var h=n[m];var f,g;f=p.timeToView(t.abapTimestampToDate(h.start_date)).toFixed(1);if(m<n.length-1){g=p.timeToView(t.abapTimestampToDate(n[m+1].start_date)).toFixed(1)}else{g=p.timeToView(t.abapTimestampToDate(n[m].start_date)).toFixed(1)}if(!Number.isFinite(Number(f))){f=p.timeToView(0).toFixed(1)}if(!Number.isFinite(Number(g))){g=p.timeToView(0).toFixed(1)}if(m===0){a+=f+","+r+" "}var u=r-h.supply/o*s;u=u.toFixed(1);a+=f+","+u+" ";a+=g+","+u+" ";if(m===n.length-1){a+=f+","+u+" ";a+=f+","+r+" "}}return a};return i},true);
//# sourceMappingURL=UbcUnderCapacityZonePolygon.js.map