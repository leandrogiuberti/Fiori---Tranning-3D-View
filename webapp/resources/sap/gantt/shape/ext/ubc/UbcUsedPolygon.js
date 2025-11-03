/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/misc/Format","sap/gantt/shape/ext/ubc/UbcPolygon"],function(t,e){"use strict";var i=e.extend("sap.gantt.shape.ext.ubc.UbcUsedPolygon",{});i.prototype.getFill=function(t,e){if(this.mShapeConfig.hasShapeProperty("fill")){return this._configFirst("fill",t)}return"#CAC7BA"};i.prototype.getPoints=function(e,i){if(this.mShapeConfig.hasShapeProperty("points")){return this._configFirst("points",e)}var a="";var r=this._getMaxY(e,i);var o=this._getMaxTotalRevised(e);var s=i.rowHeight-1;var n=e.drawData?e.drawData:e.period;var p=this.getAxisTime();for(var m=0;m<n.length;m++){var d=n[m];var f,h;var u;f=p.timeToView(t.abapTimestampToDate(d.start_date)).toFixed(1);if(m<n.length-1){h=p.timeToView(t.abapTimestampToDate(n[m+1].start_date)).toFixed(1)}else{h=p.timeToView(t.abapTimestampToDate(n[m].start_date)).toFixed(1)}if(!Number.isFinite(Number(f))){f=p.timeToView(0).toFixed(1)}if(!Number.isFinite(Number(h))){h=p.timeToView(0).toFixed(1)}if(m===0){a+=f+","+r+" "}if(d.demand>=d.supply){u=r-d.supply/o*s}else{u=r-d.demand/o*s}u=u.toFixed(1);a+=f+","+u+" ";a+=h+","+u+" ";if(m===n.length-1){a+=f+","+u+" ";a+=f+","+r+" "}}return a};return i},true);
//# sourceMappingURL=UbcUsedPolygon.js.map