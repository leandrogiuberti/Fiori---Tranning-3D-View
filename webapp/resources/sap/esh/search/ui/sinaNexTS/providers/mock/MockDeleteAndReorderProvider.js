/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../sample2/Provider"],function(e){"use strict";const r=e["Provider"];class t extends r{id="mock_deleteandreorder";static searchCount=0;async executeSearchQuery(e){t.searchCount++;const r=await super.executeSearchQuery(e);if(!r)return r;const s=2+t.searchCount-2;const c=r.items.slice();if(t.searchCount>1&&s>=2&&s<c.length){c.splice(s,1)}if(c.length>1&&t.searchCount%2===0){[c[0],c[1]]=[c[1],c[0]]}return this.sina._createSearchResultSet({...r,items:c})}}var s={__esModule:true};s.MockDeleteAndReorderProvider=t;return s});
//# sourceMappingURL=MockDeleteAndReorderProvider.js.map