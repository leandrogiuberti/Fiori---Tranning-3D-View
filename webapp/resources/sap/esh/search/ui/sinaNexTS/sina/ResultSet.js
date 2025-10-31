/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SinaObject","../core/Log","../core/core"],function(t,s,r){"use strict";const e=t["SinaObject"];const i=s["Log"];class o extends e{id=r.generateId();title;items=[];query;log=new i;errors=[];constructor(t){super(t);this.id=t.id??this.id;this.title=t.title??this.title;this.setItems(t.items||[]);this.query=t.query??this.query;this.log=t.log??this.log}setItems(t){if(!Array.isArray(t)||t.length<1){return this}this.items=[];for(let s=0;s<t?.length;s++){const r=t[s];r.parent=this;this.items.push(r)}return this}toString(){const t=[];for(let s=0;s<this.items.length;++s){const r=this.items[s];t.push(s+". "+r.toString())}if(this.items.length===0){t.push("No results found")}return t.join("\n")}hasErrors(){return this.errors.length>0}getErrors(){return this.errors}addError(t){this.errors.push(t)}addErrors(t){this.errors.push(...t)}}var h={__esModule:true};h.ResultSet=o;return h});
//# sourceMappingURL=ResultSet.js.map