/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["../DefBase"],function(t){"use strict";var e=t.extend("sap.gantt.def.gradient.LinearGradient",{metadata:{library:"sap.gantt",properties:{x1:{type:"string",defaultValue:"0"},y1:{type:"string",defaultValue:"0"},x2:{type:"string",defaultValue:"100"},y2:{type:"string",defaultValue:"15"}},aggregations:{stops:{type:"sap.gantt.def.gradient.Stop",multiple:true,singularName:"stop"}}}});e.prototype.getDefString=function(){var t=this.getId();var e=this.getX1().indexOf("%")>=0?this.getX1().slice(0,-1)/100:this.getX1();var a=this.getX2().indexOf("%")>=0?this.getX2().slice(0,-1)/100:this.getX2();var i=this.getY1().indexOf("%")>=0?this.getY1().slice(0,-1)/100:this.getY1();var r=this.getY2().indexOf("%")>=0?this.getY2().slice(0,-1)/100:this.getY2();var s="<linearGradient id='"+t+"' x1='"+e+"' y1='"+i+"' x2='"+a+"' y2='"+r+"'>";var n=this.getStops();var g=0;while(g<n.length&&Number.parseFloat(n[g].getOffSet())===0){g++}for(var l=Math.max(0,g-1);l<n.length;l++){s=s.concat(n[l].getDefString())}s=s.concat("</linearGradient>");return s};return e},true);
//# sourceMappingURL=LinearGradient.js.map