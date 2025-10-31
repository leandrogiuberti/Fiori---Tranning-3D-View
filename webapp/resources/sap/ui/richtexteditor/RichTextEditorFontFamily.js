/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Element","sap/base/Log","./library"],function(t,e,r){"use strict";var a=t.extend("sap.ui.richtexteditor.RichTextEditorFontFamily",{metadata:{library:"sap.ui.richtexteditor",properties:{name:{type:"string",group:"Misc",defaultValue:null},text:{type:"string",group:"Misc",defaultValue:null},value:{type:"string",group:"Misc",defaultValue:null},url:{type:"sap.ui.core.URI",group:"Data",defaultValue:null}}}});a.prototype.validateProperty=function(r,a){if(r==="url"){var i=t.prototype.validateProperty.call(this,r,a);if(i&&/[<>()'"\\]|\/\*|\*\/|javascript:|data:/i.test(i)){e.Error("RichTextEditorFontFamily: URL contains potentially dangerous characters: "+i,this);return""}return i}return t.prototype.validateProperty.call(this,r,a)};return a});
//# sourceMappingURL=RichTextEditorFontFamily.js.map