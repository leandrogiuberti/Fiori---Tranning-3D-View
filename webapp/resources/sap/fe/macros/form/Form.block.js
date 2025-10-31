/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/BindingToolkit","sap/fe/core/buildingBlocks/templating/BuildingBlockSupport","sap/fe/core/buildingBlocks/templating/BuildingBlockTemplateProcessor","sap/fe/core/buildingBlocks/templating/BuildingBlockTemplatingBase","sap/fe/core/converters/MetaModelConverter","sap/fe/core/converters/annotations/DataField","sap/fe/core/converters/controls/Common/Form","sap/fe/core/converters/helpers/ID","sap/fe/core/helpers/BindingHelper","sap/fe/core/templating/DataModelPathHelper","sap/fe/macros/form/FormHelper","sap/ui/core/library","sap/ui/model/odata/v4/AnnotationHelper"],function(e,t,a,i,r,n,o,l,s,u,c,p,m){"use strict";var f,b,h,d,g,y,v,$,C,P,L,F,T,x,I,S,w,M,k,z,A,B,E,O,D,j,U,_,N,X,V;var R={};var G=p.TitleLevel;var H=u.getContextRelativeTargetObjectPath;var q=s.UI;var Q=l.getFormContainerID;var W=o.createFormDefinition;var J=n.hasIdentificationTarget;var K=n.hasFieldGroupTarget;var Y=r.getInvolvedDataModelObjects;var Z=a.xml;var ee=t.defineBuildingBlock;var te=t.blockEvent;var ae=t.blockAttribute;var ie=t.blockAggregation;var re=e.resolveBindingString;var ne=e.ifElse;var oe=e.getExpressionFromAnnotation;var le=e.equal;var se=e.compileExpression;function ue(e,t,a,i){a&&Object.defineProperty(e,t,{enumerable:a.enumerable,configurable:a.configurable,writable:a.writable,value:a.initializer?a.initializer.call(i):void 0})}function ce(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,pe(e,t)}function pe(e,t){return pe=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},pe(e,t)}function me(e,t,a,i,r){var n={};return Object.keys(i).forEach(function(e){n[e]=i[e]}),n.enumerable=!!n.enumerable,n.configurable=!!n.configurable,("value"in n||n.initializer)&&(n.writable=!0),n=a.slice().reverse().reduce(function(a,i){return i(e,t,a)||a},n),r&&void 0!==n.initializer&&(n.value=n.initializer?n.initializer.call(r):void 0,n.initializer=void 0),void 0===n.initializer?(Object.defineProperty(e,t,n),null):n}function fe(e,t){throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform.")}let be=(f=ee({name:"Form",namespace:"sap.fe.macros.internal",publicNamespace:"sap.fe.macros",returnTypes:["sap.fe.macros.form.FormAPI"]}),b=ae({type:"string",isPublic:true,required:true}),h=ae({type:"sap.ui.model.Context",required:true,isPublic:true,expectedTypes:["EntitySet","NavigationProperty","Singleton","EntityType"]}),d=ae({type:"sap.ui.model.Context",isPublic:true,required:true,expectedAnnotationTypes:["com.sap.vocabularies.UI.v1.FieldGroupType","com.sap.vocabularies.UI.v1.CollectionFacet","com.sap.vocabularies.UI.v1.ReferenceFacet"],expectedTypes:["EntitySet","EntityType","Singleton","NavigationProperty"]}),g=ae({type:"array"}),y=ae({type:"boolean"}),v=ae({type:"boolean"}),$=ae({type:"string",isPublic:true}),C=ae({type:"sap.ui.core.TitleLevel",isPublic:true}),P=ae({type:"string"}),L=ae({type:"string"}),F=ae({type:"string"}),T=te(),x=ie({type:"sap.fe.macros.form.FormElement",isPublic:true,slot:"formElements",isDefault:true}),I=ae({type:"object",isPublic:true}),f(S=(w=function(e){function t(t,a,i){var r;r=e.call(this,t,a,i)||this;ue(r,"id",M,r);ue(r,"contextPath",k,r);ue(r,"metaPath",z,r);ue(r,"formContainers",A,r);ue(r,"useFormContainerLabels",B,r);ue(r,"partOfPreview",E,r);ue(r,"title",O,r);ue(r,"titleLevel",D,r);ue(r,"ariaLabelledBy",j,r);ue(r,"displayMode",U,r);ue(r,"isVisible",_,r);ue(r,"onChange",N,r);ue(r,"formElements",X,r);ue(r,"layout",V,r);if(r.metaPath&&r.contextPath&&(r.formContainers===undefined||r.formContainers===null)){const e=Y(r.metaPath,r.contextPath);const t={};let a=e.targetObject;let n=false;if(a&&a.$Type==="com.sap.vocabularies.UI.v1.FieldGroupType"){n=true;a={$Type:"com.sap.vocabularies.UI.v1.ReferenceFacet",Label:a.Label,Target:{$target:a,fullyQualifiedName:a.fullyQualifiedName,path:"",term:"",type:"AnnotationPath",value:H(e)},annotations:{},fullyQualifiedName:a.fullyQualifiedName};if(r.formElements){t[a.Target.value]={fields:r.formElements}}}const o=r.getConverterContext(e,undefined,i,t);const l=W(a,r.isVisible,o);if(n){l.formContainers[0].annotationPath=r.metaPath.getPath()}r.formContainers=l.formContainers;r.useFormContainerLabels=l.useFormContainerLabels;r.facetType=a&&a.$Type}else{r.facetType=r.metaPath.getObject()?.$Type}if(!r.isPublic){r._apiId=r.createId("Form");r._contentId=r.id}else{r._apiId=r.id;r._contentId=`${r.id}-content`}if(r.displayMode!==undefined){r._editable=se(ne(le(re(r.displayMode,"boolean"),false),true,false))}else{r._editable=se(q.IsEditable)}return r}R=t;ce(t,e);var a=t.prototype;a.getDataFieldCollection=function e(t,a){const i=Y(a).targetObject;let r;let n;if(i.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet"){r=m.getNavigationPath(i.Target.value);n=i}else{const e=this.contextPath.getPath();let t=a.getPath();if(t.startsWith(e)){t=t.substring(e.length);if(t.charAt(0)==="/"){t=t.slice(1)}}r=m.getNavigationPath(t);n=t}const o=c.getFormContainerTitleLevel(this.title,this.titleLevel);const l=this.useFormContainerLabels&&i.Label?oe(i.Label):"";const s=this.id?Q(n):undefined;return Z`
					<macro:FormContainer
					xmlns:macro="sap.fe.macros"
					${this.attr("id",s)}
					title="${l}"
					titleLevel="${o}"
					contextPath="${r?t.entitySet:this.contextPath}"
					metaPath="${a}"
					dataFieldCollection="${t.formElements}"
					navigationPath="${r}"
					visible="${t.isVisible}"
					displayMode="${this.displayMode}"
					onChange="${this.onChange}"
					actions="${t.actions}"
					useSingleTextAreaFieldAsNotes="${t.useSingleTextAreaFieldAsNotes}"
					hasUiHiddenAnnotation="${t.annotationHidden}"
				>
				<macro:formElements>
					<slot name="formElements" />
				</macro:formElements>
			</macro:FormContainer>`};a.getFormContainers=function e(){if(this.formContainers.length===0){return""}if(this.facetType?.includes("com.sap.vocabularies.UI.v1.CollectionFacet")){return this.formContainers.map((e,t)=>{if(e.isVisible){const a=this.contextPath.getModel().createBindingContext(e.annotationPath,this.contextPath);const i=a.getObject();if(i.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet"&&c.isReferenceFacetPartOfPreview(i,this.partOfPreview)){if(i.Target.$AnnotationPath.$Type==="com.sap.vocabularies.Communication.v1.AddressType"){return Z`<template:with path="formContainers>${t}" var="formContainer">
											<template:with path="formContainers>${t}/annotationPath" var="facet">
												<core:Fragment fragmentName="sap.fe.macros.form.AddressSection" type="XML" />
											</template:with>
										</template:with>`}return this.getDataFieldCollection(e,a)}}return""})}else if(this.facetType==="com.sap.vocabularies.UI.v1.ReferenceFacet"){return this.formContainers.map(e=>{if(e.isVisible){const t=this.contextPath.getModel().createBindingContext(e.annotationPath,this.contextPath);return this.getDataFieldCollection(e,t)}else{return""}})}return""};a.checkIfTextAreaIsAlone=function e(){if(this.formContainers.length===1){if(this.formContainers[0].formElements.length===1){const e=Y(this.contextPath.getModel().createBindingContext(this.formContainers[0].annotationPath,this.contextPath)).targetObject;let t;let a;if(e.$Type==="com.sap.vocabularies.UI.v1.FieldGroupType"){t=e}else if(K(e)){t=e?.Target?.$target}else if(J(e)){a=e?.Target?.$target}if(t?.Data.length===1){return t.Data[0]?.Value?.$target?.annotations?.UI?.MultiLineText?.valueOf()===true}if(a?.length===1){return a[0]?.Value?.$target?.annotations?.UI?.MultiLineText?.valueOf()===true}}}return false};a.getLayoutInformation=function e(t){switch(this.layout.type){case"ResponsiveGridLayout":return Z`<f:ResponsiveGridLayout adjustLabelSpan="${this.layout.adjustLabelSpan}"
													breakpointL="${this.layout.breakpointL}"
													breakpointM="${this.layout.breakpointM}"
													breakpointXL="${this.layout.breakpointXL}"
													columnsL="${t?1:this.layout.columnsL}"
													columnsM="${t?1:this.layout.columnsM}"
													columnsXL="${t?1:this.layout.columnsXL}"
													emptySpanL="${this.layout.emptySpanL}"
													emptySpanM="${this.layout.emptySpanM}"
													emptySpanS="${this.layout.emptySpanS}"
													emptySpanXL="${this.layout.emptySpanXL}"
													labelSpanL="${this.layout.labelSpanL}"
													labelSpanM="${this.layout.labelSpanM}"
													labelSpanS="${this.layout.labelSpanS}"
													labelSpanXL="${this.layout.labelSpanXL}"
													singleContainerFullSize="${this.layout.singleContainerFullSize}"
													backgroundDesign="${this.layout.backgroundDesign}" />`;case"ColumnLayout":default:return Z`<f:ColumnLayout
								columnsM="${t?1:this.layout.columnsM}"
								columnsL="${t?1:this.layout.columnsL}"
								columnsXL="${t?1:this.layout.columnsXL}"
								labelCellsLarge="${this.layout.labelCellsLarge}"
								emptyCellsLarge="${this.layout.emptyCellsLarge}"
								backgroundDesign="${this.layout.backgroundDesign}" />`}};a.getTemplate=function e(){const t=this.onChange&&this.onChange.replace("{","\\{").replace("}","\\}")||"";const a=this.metaPath.getPath();const i=this.contextPath.getPath();const r=this.checkIfTextAreaIsAlone();if(!this.isVisible){return""}else{return Z`<macro:FormAPI xmlns:macro="sap.fe.macros.form"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					xmlns:f="sap.ui.layout.form"
					xmlns:fl="sap.ui.fl"
					xmlns:dt="sap.ui.dt"
					xmlns:coreControls="sap.fe.core.controls"
					id="${this._apiId}"
					metaPath="${a}"
					contextPath="${i}">
				<f:Form
					fl:delegate='{
						"name": "sap/fe/macros/form/FormDelegate",
						"delegateType": "complete"
					}'
					dt:designtime="sap/fe/macros/form/Form.designtime"
					id="${this._contentId}"
					editable="${this._editable}"
					visible="${this.isVisible}"
					macrodata:navigationPath="${i}"
					macrodata:metaPath="${a}"
					macrodata:onChange="${t}"
					ariaLabelledBy="${this.ariaLabelledBy}"
				>
					${this.addConditionally(this.title!==undefined,Z`<f:title>
							<core:Title level="${this.titleLevel}" text="${this.title}" />
						</f:title>`)}
					<f:layout>
					${this.getLayoutInformation(r)}

					</f:layout>
					<f:formContainers>
						${this.getFormContainers()}
					</f:formContainers>
					<f:dependents>
						<coreControls:HideFormGroupAutomatically />
					</f:dependents>
				</f:Form>
			</macro:FormAPI>`}};return t}(i),M=me(w.prototype,"id",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),k=me(w.prototype,"contextPath",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),z=me(w.prototype,"metaPath",[d],{configurable:true,enumerable:true,writable:true,initializer:null}),A=me(w.prototype,"formContainers",[g],{configurable:true,enumerable:true,writable:true,initializer:null}),B=me(w.prototype,"useFormContainerLabels",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),E=me(w.prototype,"partOfPreview",[v],{configurable:true,enumerable:true,writable:true,initializer:function(){return true}}),O=me(w.prototype,"title",[$],{configurable:true,enumerable:true,writable:true,initializer:null}),D=me(w.prototype,"titleLevel",[C],{configurable:true,enumerable:true,writable:true,initializer:function(){return G.Auto}}),j=me(w.prototype,"ariaLabelledBy",[P],{configurable:true,enumerable:true,writable:true,initializer:null}),U=me(w.prototype,"displayMode",[L],{configurable:true,enumerable:true,writable:true,initializer:null}),_=me(w.prototype,"isVisible",[F],{configurable:true,enumerable:true,writable:true,initializer:function(){return"true"}}),N=me(w.prototype,"onChange",[T],{configurable:true,enumerable:true,writable:true,initializer:null}),X=me(w.prototype,"formElements",[x],{configurable:true,enumerable:true,writable:true,initializer:null}),V=me(w.prototype,"layout",[I],{configurable:true,enumerable:true,writable:true,initializer:function(){return{type:"ColumnLayout",columnsM:3,columnsXL:6,columnsL:4,labelCellsLarge:12}}}),w))||S);R=be;return R},false);
//# sourceMappingURL=Form.block.js.map