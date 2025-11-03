/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/base/BindingToolkit","sap/fe/core/buildingBlocks/templating/BuildingBlockSupport","sap/fe/core/buildingBlocks/templating/BuildingBlockTemplateProcessor","sap/fe/core/buildingBlocks/templating/BuildingBlockTemplatingBase","sap/fe/core/converters/MetaModelConverter","sap/fe/core/converters/controls/ListReport/FilterField","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/PropertyFormatters","sap/fe/core/templating/PropertyHelper","sap/fe/core/templating/UIFormatters","sap/fe/macros/CommonHelper","sap/fe/macros/field/FieldHelper","sap/fe/macros/filter/FilterFieldHelper","sap/fe/macros/filter/FilterFieldTemplating","sap/fe/macros/filterBar/ExtendedSemanticDateOperators"],function(e,t,r,i,a,n,o,l,s,u,p,c,d,f,m,b,y){"use strict";var g,h,v,P,F,x,$,C,O,B,I,T,D,E,w,M,z,V,R,j,S;var H={};var k=b.getFilterFieldDisplayFormat;var A=m.isRequiredInFilter;var q=m.getPlaceholder;var L=m.getDataType;var _=m.getConditionsBinding;var W=m.formatOptions;var K=m.constraints;var U=c.getDisplayMode;var N=p.getAssociatedExternalIdPropertyPath;var Q=u.getRelativePropertyPath;var X=s.getTargetObjectPath;var G=s.getContextRelativeTargetObjectPath;var J=l.generate;var Y=o.getMaxConditions;var Z=i.xml;var ee=i.SAP_UI_MODEL_CONTEXT;var te=r.defineBuildingBlock;var re=r.blockAttribute;var ie=t.formatResult;var ae=t.constant;var ne=t.compileExpression;function oe(e,t,r,i){r&&Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(i):void 0})}function le(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,se(e,t)}function se(e,t){return se=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},se(e,t)}function ue(e,t,r,i,a){var n={};return Object.keys(i).forEach(function(e){n[e]=i[e]}),n.enumerable=!!n.enumerable,n.configurable=!!n.configurable,("value"in n||n.initializer)&&(n.writable=!0),n=r.slice().reverse().reduce(function(r,i){return i(e,t,r)||r},n),a&&void 0!==n.initializer&&(n.value=n.initializer?n.initializer.call(a):void 0,n.initializer=void 0),void 0===n.initializer?(Object.defineProperty(e,t,n),null):n}function pe(e,t){throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform.")}let ce=(g=te({name:"FilterField",namespace:"sap.fe.macros.internal"}),h=re({type:"sap.ui.model.Context",required:true,isPublic:true}),v=re({type:"sap.ui.model.Context",required:true,isPublic:true}),P=re({type:"sap.ui.model.Context",isPublic:true}),F=re({type:"string",isPublic:true}),x=re({type:"string",isPublic:true}),$=re({type:"boolean",isPublic:true}),C=re({type:"string",isPublic:true}),O=re({type:"string",isPublic:false}),B=re({type:"string",isPublic:false}),g(I=(T=function(t){function r(e,r,i){var a;a=t.call(this,e,r,i)||this;oe(a,"property",D,a);oe(a,"contextPath",E,a);oe(a,"visualFilter",w,a);oe(a,"idPrefix",M,a);oe(a,"vhIdPrefix",z,a);oe(a,"useSemanticDateRange",V,a);oe(a,"settings",R,a);oe(a,"editMode",j,a);oe(a,"label",S,a);const o=n.convertMetaModelContext(a.property);const l=N(o);if(l){a.propertyExternalId=a.property.getModel().createBindingContext(a.property.getPath().replace(o.name,l),a.property)}const s=a.propertyExternalId?n.convertMetaModelContext(a.propertyExternalId):undefined;const u=n.getInvolvedDataModelObjects(a.property,a.contextPath);const p=o.name,c=o.name,m=!!s?.annotations?.Common?.ValueListWithFixedValues||!!o.annotations?.Common?.ValueListWithFixedValues;a.controlId=a.idPrefix&&J([a.idPrefix,c]);a.sourcePath=X(u);a.documentRefText=u.targetObject?.annotations.Common?.DocumentationRef?.toString();a.tooltip=o?.annotations?.Common?.QuickInfo?.toString();a.dataType=L(s||o);const b=a.label?a.label:o?.annotations?.Common?.Label;const g=b?.toString()??ae(p);a.label=ne(g)||p;a.conditionsBinding=_(u)||"";a.placeholder=q(o);a.propertyKey=G(u,false,true)||p;a.vfEnabled=!!a.visualFilter&&!(a.idPrefix&&a.idPrefix.includes("Adaptation"));a.vfId=a.vfEnabled?J([a.idPrefix,p,"VisualFilter"]):undefined;a.vfRuntimeId=a.vfEnabled?J([a.idPrefix,p,"VisualFilterContainer"]):undefined;const h=a.property,v=h.getModel(),P=f.valueHelpPropertyForFilterField(h),F=d.isPropertyFilterable(h),x=h.getObject(),$={context:h};a.display=k(u,o,$);a.isFilterable=!(F===false||F==="false");a.maxConditions=Y(u);a.dataTypeConstraints=K(x,$);a.dataTypeFormatOptions=W(x,$);a.required=A(x,$);a.operators=f.operators(h,x,a.useSemanticDateRange,a.settings||"",a.contextPath.getPath());if(a.operators){y.addExtendedFilterOperators(a.operators.split(","))}const C=v.createBindingContext(P);const O=C.getObject(),B={context:C},I=Q(O,B),T=Q(x,$);a.valueHelpProperty=f.getValueHelpPropertyForFilterField(h,x,x.$Type,a.vhIdPrefix,u.targetEntityType.name,T,I,m,a.useSemanticDateRange);return a}H=r;le(r,t);var i=r.prototype;i.getVisualFilterContent=function e(){let t=this.visualFilter,r="";if(!this.vfEnabled||!t){return r}if(t?.isA?.(ee)){t=t.getObject()}const{contextPath:i,presentationAnnotation:a,outParameter:n,inParameters:o,valuelistProperty:l,selectionVariantAnnotation:s,multipleSelectionAllowed:u,required:p,requiredProperties:c=[],showOverlayInitially:f,renderLineChart:m,isValueListWithFixedValues:b,initialChartBindingEnabled:y}=t;r=Z`
				<visualFilter:VisualFilter
				    xmlns:visualFilter= "sap.fe.macros.visualfilters"
					id="${this.vfRuntimeId}"
					_contentId="${this.vfId}"
					contextPath="${i}"
					metaPath="${a}"
					outParameter="${n}"
					inParameters="${d.stringifyCustomData(o)}"
					valuelistProperty="${l}"
					selectionVariantAnnotation="${s}"
					multipleSelectionAllowed="${u}"
					required="${p}"
					requiredProperties="${d.stringifyCustomData(c)}"
					showOverlayInitially="${f}"
					renderLineChart="${m}"
					isValueListWithFixedValues="${b}"
					filterBarEntityType="${i}"
					enableChartBinding="${y}"
				/>
			`;return r};i.getTemplate=async function t(){let r=``;if(this.isFilterable){let t;const i=this.documentRefText===undefined||null?false:true;const a=ne(ie([this.documentRefText],"._formatters.StandardFormatter#asArray"));try{const e=this.propertyExternalId&&n.getInvolvedDataModelObjects(this.propertyExternalId,this.contextPath);t=e?U(e):await this.display}catch(t){e.error(`FE : FilterField BuildingBlock : Error fetching display property for ${this.sourcePath} : ${t}`)}r=Z`
				<mdc:FilterField
					xmlns:mdc="sap.ui.mdc"
					xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
					xmlns:macro="sap.fe.macros"
					xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					xmlns:fieldhelp="sap.ui.core.fieldhelp"
					customData:sourcePath="${this.sourcePath}"
					id="${this.controlId}"
					delegate="{name: 'sap/fe/macros/field/FieldBaseDelegate', payload:{isFilterField:true}}"
					propertyKey="${this.propertyKey}"
					label="${this.label}"
					dataType="${this.dataType}"
					display="${t}"
					maxConditions="${this.maxConditions}"
					valueHelp="${this.valueHelpProperty}"
					conditions="${this.conditionsBinding}"
					dataTypeConstraints="${this.dataTypeConstraints}"
					dataTypeFormatOptions="${this.dataTypeFormatOptions}"
					required="${this.required}"
					operators="${this.operators}"
					placeholder="${this.placeholder}"
					${this.attr("tooltip",this.tooltip)}
					${this.attr("editMode",this.editMode)}
				>
					${i?Z`
						<mdc:customData>
							<fieldhelp:FieldHelpCustomData
								${this.attr("value",a)}
							/>
						</mdc:customData>
					`:""}
					${this.vfEnabled?this.getVisualFilterContent():""}
				</mdc:FilterField>
			`}return r};return r}(a),D=ue(T.prototype,"property",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),E=ue(T.prototype,"contextPath",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),w=ue(T.prototype,"visualFilter",[P],{configurable:true,enumerable:true,writable:true,initializer:null}),M=ue(T.prototype,"idPrefix",[F],{configurable:true,enumerable:true,writable:true,initializer:function(){return"FilterField"}}),z=ue(T.prototype,"vhIdPrefix",[x],{configurable:true,enumerable:true,writable:true,initializer:function(){return"FilterFieldValueHelp"}}),V=ue(T.prototype,"useSemanticDateRange",[$],{configurable:true,enumerable:true,writable:true,initializer:function(){return true}}),R=ue(T.prototype,"settings",[C],{configurable:true,enumerable:true,writable:true,initializer:function(){return""}}),j=ue(T.prototype,"editMode",[O],{configurable:true,enumerable:true,writable:true,initializer:null}),S=ue(T.prototype,"label",[B],{configurable:true,enumerable:true,writable:true,initializer:null}),T))||I);H=ce;return H},false);
//# sourceMappingURL=FilterField.block.js.map