/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/model/internal/SystemLandscape",[],function(){return{Systems:[{systemName:"localBW",systemType:"BW",protocol:window.location.protocol==="http:"?"HTTP":"HTTPS",port:window.location.port,host:window.location.hostname,authentication:"NONE",systemTimeout:-1},{systemName:"localHANA",systemType:"HANA",protocol:window.location.protocol==="http:"?"HTTP":"HTTPS",host:window.location.hostname,port:window.location.port,authentication:"NONE",systemTimeout:-1},{systemName:"localDWC",systemType:"DWC",protocol:window.location.protocol==="http:"?"HTTP":"HTTPS",host:window.location.hostname,port:window.location.port,path:"lcs/dwc",authentication:"NONE",systemTimeout:-1}]}});
//# sourceMappingURL=SystemLandscape.js.map