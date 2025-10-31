import Log from "sap/base/Log";
import type {
	IVisitorCallback,
	TransformedBuildingBlockMetadata
} from "sap/fe/core/buildingBlocks/templating/BuildingBlockTemplateProcessor";
import BindingInfo from "sap/ui/base/BindingInfo";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import type Context from "sap/ui/model/Context";
//Trace information
const aTraceInfo: TraceMetadataContext[] = [
	/* Structure for a macro
			{
				macro: '', //name of macro
				metaDataContexts: [ //Properties of type sap.ui.model.Context
					{
						name: '', //context property name / key
						path: '', //from oContext.getPath()
					}
				],
				properties: { // Other properties which become part of {this>}
					property1: value,
					property2: value
				}
				viewInfo: {
					viewInfo: {} // As specified in view or fragment creation
				},
				traceID: this.index, //ID for this trace information,
				macroInfo: {
					macroID: index, // traceID of this macro (redundant for macros)
					parentMacroID, index // traceID of the parent macro (if it has a parent)
				}
			}
			// Structure for a control
			{
				control: '', //control class
				properties: { // Other properties which become part of {this>}
					property1: {
						originalValue: '', //Value before templating
						resolvedValue: '' //Value after templating
					}
				}
				contexts: { //Models and Contexts used during templating
					// Model or context name used for this control
					modelName1: { // For ODataMetaModel
						path1: {
							path: '', //absolut path within metamodel
							data: '', //data of path unless type Object
						}
					modelName2: {
						// for other model types
						{
							property1: value,
							property2: value
						}
						// In case binding cannot be resolved -> mark as runtime binding
						// This is not always true, e.g. in case the path is metamodelpath
						{
							"bindingFor": "Runtime"
						}
					}
				},
				viewInfo: {
					viewInfo: {} // As specified in view or fragment creation
				},
				macroInfo: {
					macroID: index, // traceID of the macro that created this control
					parentMacroID, index // traceID of the macro's parent macro
				},
				traceID: this.index //ID for this trace information
			}
			*/
];
const traceNamespace = "http://schemas.sap.com/sapui5/extension/sap.fe.info/1",
	xmlns = "http://www.w3.org/2000/xmlns/",
	/**
	 * Switch is currently based on url parameter
	 */
	traceIsOn = location.search.includes("sap-ui-xx-feTraceInfo=true"),
	/**
	 * Specify all namespaces that shall be traced during templating
	 */
	aNamespaces = [
		"sap.m",
		"sap.uxap",
		"sap.ui.unified",
		"sap.f",
		"sap.ui.table",
		"sap.suite.ui.microchart",
		"sap.ui.layout.form",
		"sap.ui.mdc",
		"sap.ui.mdc.link",
		"sap.ui.mdc.field",
		"sap.fe.fpm"
	],
	oCallbacks: Record<string, unknown> = {};

function fnClone(oObject: object): unknown {
	return JSON.parse(JSON.stringify(oObject));
}
type TraceContext = {
	path: string;
	model: string;
	parts: TraceContext[];
};
async function collectContextInfo(
	sValue: string | null,
	oContexts: Record<string, TraceContext>,
	oVisitor: IVisitorCallback,
	oNode: Element
): Promise<unknown[]> {
	let aContexts: TraceContext[];
	const aPromises: Promise<unknown>[] = [];
	try {
		aContexts = BindingInfo.parse(sValue) || [];
	} catch (e) {
		aContexts = [];
	}
	aContexts = Array.isArray(aContexts) ? aContexts : [aContexts];
	aContexts
		.filter(function (oContext) {
			return oContext.path || oContext.parts;
		})
		.forEach(function (oContext: TraceContext) {
			const aParts = oContext.parts || [oContext];
			aParts
				.filter(function (oPartContext: TraceContext) {
					return oPartContext.path;
				})
				.forEach(function (oPartContext: TraceContext) {
					const oModel: Record<string, unknown> = (oContexts[oPartContext.model] = oContexts[oPartContext.model] || {});
					const sSimplePath = !oPartContext.path.includes(">")
						? (oPartContext.model && `${oPartContext.model}>`) + oPartContext.path
						: oPartContext.path;
					let oRealContext: Context | undefined;
					let aInnerParts;

					if (typeof oPartContext.model === "undefined" && sSimplePath.includes(">")) {
						aInnerParts = sSimplePath.split(">");
						oPartContext.model = aInnerParts[0];
						oPartContext.path = aInnerParts[1];
					}
					try {
						oRealContext = oVisitor.getContext(sSimplePath);

						const visitorResult = oVisitor.getResult(`{${sSimplePath}}`, oNode)!;
						aPromises.push(
							visitorResult
								.then(function (oResult: Context) {
									if (oRealContext?.getModel().getMetadata().getName() === "sap.ui.model.json.JSONModel") {
										if (!oResult.getModel()) {
											oModel[oPartContext.path] = oResult;
										} else {
											oModel[oPartContext.path] = `Context from ${oResult.getPath()}`;
										}
									} else {
										oModel[oPartContext.path] = {
											path: oRealContext!.getPath(),
											data: typeof oResult === "object" ? "[ctrl/cmd-click] on path to see data" : oResult
										};
									}
									return;
								})
								.catch(function () {
									oModel[oPartContext.path] = {
										bindingFor: "Runtime"
									};
								})
						);
					} catch (exc) {
						oModel[oPartContext.path] = {
							bindingFor: "Runtime"
						};
					}
				});
		});
	return Promise.all(aPromises);
}
async function fillAttributes(
	oResults: Promise<unknown>,
	oAttributes: Record<string, unknown>,
	sName: string,
	sValue: unknown
): Promise<void> {
	return oResults
		.then(function (result: unknown) {
			oAttributes[sName] =
				sValue !== result
					? {
							originalValue: sValue,
							resolvedValue: result
					  }
					: sValue;
			return;
		})
		.catch(function (e: unknown) {
			const error = e as Error;
			oAttributes[sName] = {
				originalValue: sValue,
				error: (error.stack && error.stack.toString()) || e
			};
		});
}
async function collectInfo(oNode: Element, oVisitor: IVisitorCallback): Promise<{ properties: {}; contexts: {} }> {
	const oAttributes = {};
	const aPromises = [];
	const oContexts = {};
	let oResults;
	for (let i = oNode.attributes.length >>> 0; i--; ) {
		const oAttribute = oNode.attributes[i],
			sName = oAttribute.nodeName,
			sValue = oNode.getAttribute(sName)!;
		if (!["core:require"].includes(sName)) {
			aPromises.push(collectContextInfo(sValue, oContexts, oVisitor, oNode));
			oResults = oVisitor.getResult(sValue, oNode);
			if (oResults) {
				aPromises.push(fillAttributes(oResults, oAttributes, sName, sValue));
			} else {
				//What
			}
		}
	}
	return Promise.all(aPromises).then(function () {
		return { properties: oAttributes, contexts: oContexts };
	});
}
export type TraceMetadataContext = {
	isError: boolean;
	macro?: string;
	control?: string;
	name?: string;
	contextPath?: string;
	viewInfo?: unknown;
	macroInfo?: MacroInfo;
	traceID?: number;
	error?: {
		exception: Error;
		node: string;
	};
	metaDataContexts: { name: string; path: string }[];
	properties: Record<string, unknown>;
};
async function resolve(oNode: Element, oVisitor: IVisitorCallback): Promise<void> {
	try {
		const sControlName = oNode.nodeName.split(":")[1] || oNode.nodeName,
			bIsControl = /^[A-Z]/.test(sControlName),
			oTraceMetadataContext: TraceMetadataContext = {
				isError: false,
				control: `${oNode.namespaceURI}.${oNode.nodeName.split(":")[1] || oNode.nodeName}`,
				metaDataContexts: [],
				properties: {}
			};

		if (bIsControl) {
			const firstChild = [...(oNode.ownerDocument.children as unknown as Element[])].find((node) => !node.nodeName.startsWith("#"));
			if (firstChild && !firstChild.getAttribute("xmlns:trace")) {
				firstChild.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
				firstChild.setAttributeNS(traceNamespace, "trace:is", "on");
			}
			return await collectInfo(oNode, oVisitor)
				.then(async function (result: { properties: {}; contexts: {} }): Promise<void> {
					const bRelevant = Object.keys(result.contexts).length > 0; //If no context was used it is not relevant so we ignore Object.keys(result.properties).length
					if (bRelevant) {
						Object.assign(oTraceMetadataContext, result);
						oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
						oTraceMetadataContext.macroInfo = oVisitor.getSettings()["_macroInfo"];
						oTraceMetadataContext.traceID = aTraceInfo.length;
						oNode.setAttributeNS(traceNamespace, "trace:traceID", oTraceMetadataContext.traceID.toString());
						aTraceInfo.push(oTraceMetadataContext);
					}
					return oVisitor.visitAttributes(oNode);
				})
				.then(async function () {
					return oVisitor.visitChildNodes(oNode);
				})
				.catch(function (exc: unknown) {
					oTraceMetadataContext.error = {
						exception: exc as Error,
						node: new XMLSerializer().serializeToString(oNode)
					};
				});
		} else {
			await oVisitor.visitAttributes(oNode);
			await oVisitor.visitChildNodes(oNode);
		}
	} catch (exc: unknown) {
		Log.error(`Error while tracing '${oNode?.nodeName}': ${(exc as Error).message}`, "TraceInfo");
		return oVisitor.visitAttributes(oNode).then(async function () {
			return oVisitor.visitChildNodes(oNode);
		});
	}
}
/**
 * Register path-through XMLPreprocessor plugin for all namespaces
 * given above in aNamespaces
 */
if (traceIsOn) {
	aNamespaces.forEach(function (namespace: string) {
		oCallbacks[namespace] = XMLPreprocessor.plugIn(resolve.bind(namespace), namespace);
	});
}

/**
 * Adds information about the processing of one macro to the collection.
 * @param sName Macro class name
 * @param oMetadata Definition from macro
 * @param mContexts Available named contexts
 * @param oNode
 * @param oVisitor
 * @returns The traced metadata context
 */
export type MacroInfo = {
	parentMacroID: string;
	macroID: string;
};
function traceMacroCalls(
	sName: string,
	oMetadata: TransformedBuildingBlockMetadata,
	mContexts: Record<string, Context>,
	oNode: Element,
	oVisitor: IVisitorCallback
): TraceMetadataContext {
	try {
		let aMetadataContextKeys = (oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts)) || [];
		const aProperties = (oMetadata.properties && Object.keys(oMetadata.properties)) || [];
		const macroInfo: MacroInfo = fnClone(oVisitor.getSettings()["_macroInfo"] || {}) as MacroInfo;
		const oTraceMetadataContext: TraceMetadataContext = {
			isError: false,
			macro: sName,
			metaDataContexts: [],
			properties: {}
		};

		if (aMetadataContextKeys.length === 0) {
			//In case the macro has no metadata.js we take all metadataContexts except this
			aMetadataContextKeys = Object.keys(mContexts).filter(function (name: string) {
				return name !== "this";
			});
		}

		if (!oNode.getAttribute("xmlns:trace")) {
			oNode.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
		}

		if (aMetadataContextKeys.length > 0) {
			aMetadataContextKeys.forEach(function (sKey: string) {
				const oContext = mContexts[sKey],
					oMetaDataContext = oContext && {
						name: sKey,
						path: oContext.getPath()
						//data: JSON.stringify(oContext.getObject(),null,2)
					};

				if (oMetaDataContext) {
					oTraceMetadataContext.metaDataContexts.push(oMetaDataContext);
				}
			});

			aProperties.forEach(function (sKey: string) {
				const oProperty = mContexts.this.getObject(sKey);

				if (oProperty) {
					oTraceMetadataContext.properties[sKey] = oProperty;
				}
			});
			oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
			oTraceMetadataContext.traceID = aTraceInfo.length;
			macroInfo.parentMacroID = macroInfo.macroID;
			macroInfo.macroID = oTraceMetadataContext.traceID.toString();
			oTraceMetadataContext.macroInfo = macroInfo;
			oNode.setAttributeNS(traceNamespace, "trace:macroID", oTraceMetadataContext.traceID.toString());
			aTraceInfo.push(oTraceMetadataContext);
		}
		return oTraceMetadataContext;
	} catch (exc) {
		return {
			isError: true,
			error: {
				exception: exc as Error,
				node: new XMLSerializer().serializeToString(oNode)
			},
			name: sName,
			contextPath: oVisitor?.getContext()?.getPath(),
			metaDataContexts: [],
			properties: {}
		};
	}
}
/**
 * Returns the globally stored trace information for the macro or
 * control marked with the given id.
 *
 * Returns all trace information if no id is specified
 *
 *
 * <pre>Structure for a macro
 * {
 * macro: '', //name of macro
 * metaDataContexts: [ //Properties of type sap.ui.model.Context
 * {
 * name: '', //context property name / key
 * path: '', //from oContext.getPath()
 * }
 * ],
 * properties: { // Other properties which become part of {this>}
 * property1: value,
 * property2: value
 * }
 * viewInfo: {
 * viewInfo: {} // As specified in view or fragment creation
 * },
 * traceID: this.index, //ID for this trace information,
 * macroInfo: {
 * macroID: index, // traceID of this macro (redundant for macros)
 * parentMacroID, index // traceID of the parent macro (if it has a parent)
 * }
 * }
 * Structure for a control
 * {
 * control: '', //control class
 * properties: { // Other properties which become part of {this>}
 * property1: {
 * originalValue: '', //Value before templating
 * resolvedValue: '' //Value after templating
 * }
 * }
 * contexts: { //Models and Contexts used during templating
 * // Model or context name used for this control
 * modelName1: { // For ODataMetaModel
 * path1: {
 * path: '', //absolut path within metamodel
 * data: '', //data of path unless type Object
 * }
 * modelName2: {
 * // for other model types
 * {
 * property1: value,
 * property2: value
 * }
 * // In case binding cannot be resolved -> mark as runtime binding
 * // This is not always true, e.g. in case the path is metamodelpath
 * {
 * "bindingFor": "Runtime"
 * }
 * }
 * },
 * viewInfo: {
 * viewInfo: {} // As specified in view or fragment creation
 * },
 * macroInfo: {
 * macroID: index, // traceID of the macro that created this control
 * parentMacroID, index // traceID of the macro's parent macro
 * },
 * traceID: this.index //ID for this trace information
 * }</pre>.
 * @param id TraceInfo id
 * @returns Object / Array for TraceInfo
 */
function getTraceInfo(id: number): TraceMetadataContext | TraceMetadataContext[] {
	if (id) {
		return aTraceInfo[id];
	}
	const aErrors = aTraceInfo.filter(function (traceInfo: TraceMetadataContext) {
		return traceInfo.error;
	});
	return (aErrors.length > 0 && aErrors) || aTraceInfo;
}
/**
 * Returns true if TraceInfo is active.
 * @returns `true` when active
 */
function isTraceInfoActive(): boolean {
	return traceIsOn;
}
/**
 * @typedef sap.fe.macros.TraceInfo
 * TraceInfo for SAP Fiori elements
 *
 * Once traces is switched, information about macros and controls
 * that are processed during xml preprocessing ( @see {@link sap.ui.core.util.XMLPreprocessor})
 * will be collected within this singleton
 * @namespace
 * @global
 * @since 1.74.0
 */
export default {
	isTraceInfoActive: isTraceInfoActive,
	traceMacroCalls: traceMacroCalls,
	getTraceInfo: getTraceInfo
};
