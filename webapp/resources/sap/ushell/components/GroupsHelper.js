// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([],()=>{"use strict";function r(r,t){for(let e=0;e<r.length;e++){if(r[e].groupId===t){return e}}return-1}function t(t,e){const n=r(t,e);if(n<0){return null}return`/groups/${n}`}return{getIndexOfGroup:r,getModelPathOfGroup:t}});
//# sourceMappingURL=GroupsHelper.js.map