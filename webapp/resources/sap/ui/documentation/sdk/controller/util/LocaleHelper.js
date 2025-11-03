/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";const r={ar:"SA",bg:"BG",ca:"ES",cnr:"ME",cs:"CZ",cy:"GB",da:"DK",de:"DE",el:"GR",en:["US","GB"],es:["ES","MX"],et:"EE",fi:"FI",fr:["FR","CA"],hi:"IN",hr:"HR",hu:"HU",id:"ID",it:"IT",iw:"IL",ja:"JP",kk:"KZ",ko:"KR",lt:"LT",lv:"LV",mk:"MK",ms:"MY",nl:"NL",no:"NO",pl:"PL",pt:["BR","PT"],ro:"RO",ru:"RU",sh:"RS",sk:"SK",sl:"SI",sr:"RS",sv:"SE",th:"TH",tr:"TR",uk:"UA",vi:"VN",zh:"CN"};return{hasRegion:function(r){return r.indexOf("_")>-1},appendDefaultRegion:function(n){if(this.hasRegion(n)){return n}var i=r[n];if(Array.isArray(i)){i=i[0]}return n+"_"+i}}});
//# sourceMappingURL=LocaleHelper.js.map