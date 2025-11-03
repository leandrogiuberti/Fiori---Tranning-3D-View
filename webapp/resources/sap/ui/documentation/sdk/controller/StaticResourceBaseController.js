/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/documentation/sdk/controller/BaseController","sap/ui/documentation/sdk/controller/util/ResourceDownloadUtil"],function(t,e){"use strict";return t.extend("sap.ui.documentation.sdk.controller.StaticResourceBaseController",{onInit:function(t){if(t){this.getRouter().getRoute(t).attachPatternMatched(this._onMatched,this)}},_onMatched:function(){this.hideMasterSide();this._getPathToContent().then(this._fetchContent).then(this._decorateContent).then(this._renderContent.bind(this)).catch(this.onRouteNotFound.bind(this))},_getPathToContent:function(){},_fetchContent:function(t){return e.fetch(t)},_decorateContent(t){return t},_renderContent:function(t){var e=this.getView().byId("content");e.setContent("");e.setContent(t)}})});
//# sourceMappingURL=StaticResourceBaseController.js.map