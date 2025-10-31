// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/ObjectPath"],e=>{"use strict";function t(t){let i=e.get("bootstrap.extensionModule",t);if(!i||typeof i!=="string"){return}i=i.replace(/\./g,"/");sap.ui.require([i],e=>{if(e&&typeof e==="function"){e()}})}return t});
//# sourceMappingURL=common.load.bootstrapExtension.js.map