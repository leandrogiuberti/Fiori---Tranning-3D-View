/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/core/Element"],function(e,t){"use strict";var i=t.extend("sap.gantt.def.SvgDefs",{metadata:{library:"sap.gantt",defaultAggregation:"defs",aggregations:{defs:{type:"sap.gantt.def.DefBase",multiple:true,visibility:"public",singularName:"def",bindable:"bindable"}}}});i.prototype.getDefString=function(){var e="<defs id='"+this.getId()+"'>",t=this.getDefs();if(t&&t.length>0){t.forEach(function(t){e+=t.getDefString()})}return e+"</defs>"};i.prototype.getDefNode=function(){var e={id:this.getId(),defNodes:[]};var t=this.getDefs();for(var i=0;i<t.length;i++){e.defNodes.push(t[i].getDefNode())}return e};i.prototype._getDefString=function(){var e="<defs id='"+this.getId()+"'>",t=this.getDefs();if(t&&t.length>0){t.forEach(function(t){e+=t.getDefString()})}return e+"</defs>"};return i},true);
//# sourceMappingURL=SvgDefs.js.map