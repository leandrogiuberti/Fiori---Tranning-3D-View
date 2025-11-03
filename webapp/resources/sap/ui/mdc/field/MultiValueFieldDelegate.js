/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/field/FieldBaseDelegate","sap/ui/mdc/enums/ConditionValidated","sap/base/util/merge"],(i,e,d)=>{"use strict";const t=Object.assign({},i);t.updateItems=function(i,e,d){};t.indexOfCondition=function(t,a,n,s){if(n.validated!==e.Validated){n=d({},n);n.validated=e.Validated}return i.indexOfCondition.call(this,t,a,n,s)};return t});
//# sourceMappingURL=MultiValueFieldDelegate.js.map