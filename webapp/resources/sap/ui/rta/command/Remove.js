/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/rta/command/FlexCommand"],function(e){"use strict";const t=e.extend("sap.ui.rta.command.Remove",{metadata:{library:"sap.ui.rta",properties:{removedElement:{type:"any",group:"content"}},associations:{},events:{}}});t.prototype._getChangeSpecificData=function(){const e=this.getRemovedElement()||this.getElement();const t={changeType:this.getChangeType(),removedElement:{id:e.getId()}};return t};return t});
//# sourceMappingURL=Remove.js.map