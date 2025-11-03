import { BatchContent, parseBatch } from "sap/fe/tools/BatchParser";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataPropertyBinding from "sap/ui/model/odata/v4/ODataPropertyBinding";

import ManagedObject from "sap/ui/base/ManagedObject";
import type Control from "sap/ui/core/Control";
import type JSONModel from "sap/ui/model/json/JSONModel";
// @ts-ignore
import type ODataBinding from "sap/ui/model/odata/v4/ODataBinding";
// @ts-ignore
import ManagedObjectBindingSupport from "sap/ui/model/ManagedObjectBindingSupport";
// @ts-ignore
import _Requestor from "sap/ui/model/odata/v4/lib/_Requestor";

type RequestInfo = {
	url?: string;
	body?: string;
	header?: Record<string, string>;
};
type BindingDef = {
	__feSource: ManagedObject;
	__feForProp: string;
	__feInComposite?: boolean;
	__feComposite?: BindingDef;
	closestDomRef: HTMLElement | null;
	aBindings?: BindingDef[];
};
function instrumentODataModel(thisLib: any): void {
	// @ts-ignore
	const cacheFn = ODataPropertyBinding.prototype.createAndSetCache;
	// @ts-ignore
	const cacheFn2 = ODataListBinding.prototype.createAndSetCache;
	// @ts-ignore
	const cacheFn3 = ODataContextBinding.prototype.createAndSetCache;
	// @ts-ignore
	const fnRequest = _Requestor.prototype.request;
	// @ts-ignore
	_Requestor.prototype.request = function (...args: any[]): unknown {
		if (!args[1].includes("sap-valid-feTrace")) {
			const cacheId = args[2].oOwner.oCache?.__feCacheId;
			if (cacheId) {
				if (args[1].includes("?")) {
					args[1] += `&sap-valid-feTrace=${cacheId}`;
				} else {
					args[1] += `?sap-valid-feTrace=${cacheId}`;
				}
			}
		}
		return fnRequest.apply(this, args);
	};
	//const adjustPredicateFn = ODataBinding.prototype.adjustPredicate;
	// @ts-ignore
	//const fetchCacheFn = ODataListBinding.prototype.fetchCache;
	//	const contextMakingRequest = [];
	let cacheId = 0;
	const createdCaches: Record<number, ODataBinding> = {};
	// // @ts-ignore
	// ODataListBinding.prototype.fetchCache = function() {
	// 	try { throw new Error() } catch(e) {  }
	// 	// @ts-ignore
	// 	const call = ODataListBinding.prototype.fetchCache.caller
	// 	return fetchCacheFn.apply(this, arguments)
	// }
	// @ts-ignore
	ODataListBinding.prototype.createAndSetCache = function (...args: never[]): unknown {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		const cacheResult = cacheFn2.apply(this, args);
		cacheResult.__feBinding = that;

		// @ts-ignore
		if (!this.mParameters["sap-valid-feTrace"]) {
			cacheResult.__feCacheId = cacheId++;
			// @ts-ignore
			this.mParameters["sap-valid-feTrace"] = cacheId++;
			//this.changeParameters({ "sap-valid-feTrace": cacheResult.__feCacheId });
		} else {
			// @ts-ignore
			cacheResult.__feCacheId = this.mParameters["sap-valid-feTrace"];
		}

		createdCaches[cacheResult.__feCacheId] = cacheResult;
		return cacheResult;
	};
	// @ts-ignore
	const applyParametersFn = ODataContextBinding.prototype.applyParameters;
	// @ts-ignore
	ODataContextBinding.prototype.applyParameters = function (mParameters: object): unknown {
		// @ts-ignore
		if (!mParameters["sap-valid-feTrace"]) {
			// @ts-ignore
			mParameters["sap-valid-feTrace"] = cacheId++;
		}
		applyParametersFn.apply(this, [mParameters]);
	};
	// @ts-ignore
	ODataContextBinding.prototype.createAndSetCache = function (...args: never[]): unknown {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		const cacheResult = cacheFn3.apply(this, args);
		cacheResult.__feBinding = that;

		// @ts-ignore
		cacheResult.__feCacheId = this.mParameters["sap-valid-feTrace"];
		createdCaches[cacheResult.__feCacheId] = cacheResult;
		return cacheResult;
	};
	// @ts-ignore
	ODataPropertyBinding.prototype.createAndSetCache = function (...args: never[]): unknown {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		const cacheResult = cacheFn.apply(this, args);
		cacheResult.__feBinding = that;

		if (this.getRootBinding() === this) {
			return cacheResult;
		}
		// @ts-ignore
		if (!this.getRootBinding().mParameters?.["sap-valid-feTrace"]) {
			cacheResult.__feCacheId = cacheId++;
			(this.getRootBinding() as ODataContextBinding).changeParameters({ "sap-valid-feTrace": cacheResult.__feCacheId });
		} else {
			// @ts-ignore
			cacheResult.__feCacheId = this.getRootBinding().mParameters["sap-valid-feTrace"];
		}

		createdCaches[cacheResult.__feCacheId] = cacheResult;
		return cacheResult;
	};

	const instrumentUpdateBindings = function (updateBindingsFn: Function): Function {
		return function (this: any, ...args: never[]): void {
			const res = updateBindingsFn.apply(this, args);
			Object.keys(this.mBindingInfos).forEach((bindingInfoName) => {
				if (this.mBindingInfos[bindingInfoName].binding) {
					this.mBindingInfos[bindingInfoName].binding.__feSource = this;
					this.mBindingInfos[bindingInfoName].binding.__feForProp = bindingInfoName;
					if (!this.mBindingInfos[bindingInfoName].binding.hasOwnProperty("closestDomRef")) {
						Object.defineProperty(this.mBindingInfos[bindingInfoName].binding, "closestDomRef", {
							get: function () {
								let visibleControl: Control = this.__feSource as Control;
								while (visibleControl && visibleControl.getDomRef && !visibleControl.getDomRef()) {
									visibleControl = visibleControl.getParent() as Control;
								}
								return visibleControl?.getDomRef && visibleControl.getDomRef();
							}
						});
					}
					if (this.mBindingInfos[bindingInfoName].binding.aBindings) {
						this.mBindingInfos[bindingInfoName].binding.aBindings.forEach((subBinding: BindingDef) => {
							subBinding.__feSource = this;
							subBinding.__feInComposite = true;
							subBinding.__feForProp = bindingInfoName;
							subBinding.__feComposite = this.mBindingInfos[bindingInfoName].binding;
							if (!subBinding.hasOwnProperty("closestDomRef")) {
								Object.defineProperty(subBinding, "closestDomRef", {
									get: function () {
										let visibleControl: Control | undefined = this.__feSource;
										while (visibleControl && visibleControl.getDomRef && !visibleControl.getDomRef()) {
											visibleControl = visibleControl.getParent() as Control | undefined;
										}
										return visibleControl?.getDomRef && visibleControl.getDomRef();
									}
								});
							}
						});
					}
				}
			});
			return res;
		};
	};

	const managedObjectBindingSupport = ManagedObjectBindingSupport.updateBindings;
	// @ts-ignore
	const managedObjectSupport = ManagedObject.prototype.updateBindings;
	ManagedObjectBindingSupport.updateBindings = function (...args: never[]): unknown {
		return instrumentUpdateBindings(managedObjectBindingSupport).apply(this, args);
	};
	// @ts-ignore
	ManagedObject.prototype.updateBindings = function (...args: never[]): unknown {
		return instrumentUpdateBindings(managedObjectSupport).apply(this, args);
	};
	thisLib.createdCaches = createdCaches;
}
export function addODataTrace(thisLib: { supportModel: JSONModel }): void {
	instrumentODataModel(thisLib);
	const _origXML = XMLHttpRequest;
	// @ts-ignore
	window.XMLHttpRequest = function (): XMLHttpRequest {
		const xhr = new _origXML();
		const fnOpen = xhr.open;
		const fnSend = xhr.send;
		const fnSetRequestHeader = xhr.setRequestHeader;
		xhr.open = function (this: XMLHttpRequest & { request?: RequestInfo }, ...args: never[]): void {
			this.request ??= {};
			this.request.url = args[1];
			// @ts-ignore
			fnOpen.apply(this, args);
		};
		xhr.send = function (this: XMLHttpRequest & { request?: RequestInfo }, ...args: never[]): void {
			this.request ??= {};
			this.request.body = args[0];
			// @ts-ignore
			fnSend.apply(this, args);
		};
		xhr.setRequestHeader = function (this: XMLHttpRequest & { request?: RequestInfo }, ...args: never[]): void {
			this.request ??= {};
			this.request.header ??= {};
			this.request.header[(args[0] as string).toLowerCase()] = args[1];
			// @ts-ignore
			fnSetRequestHeader.apply(this, args);
		};
		xhr.addEventListener(
			"load",
			function (this: XMLHttpRequest & { request?: RequestInfo }, e: ProgressEvent<XMLHttpRequestEventTarget>): void {
				if ((e.target as XMLHttpRequest).responseURL.includes("$batch")) {
					const batchText = this.request!.body!;
					const batchBoundary = this.request!.header!["content-type"].split("boundary=")[1];
					const batchRequest = parseBatch(new BatchContent(batchText), batchBoundary);
					const responseBoundary = (e.target as XMLHttpRequest).getResponseHeader("content-type")!.split("boundary=")[1];

					const decodedContent = (e.target as XMLHttpRequest).responseText;
					const batchResponse = parseBatch(new BatchContent(decodedContent), responseBoundary);
					batchResponse.parts.forEach((part: any, partIndex: number) => {
						const requestPart = batchRequest.parts[partIndex];
						const data = thisLib.supportModel.getProperty("/data");
						const urlObj = new URL(`http://example.com/${requestPart.url}`);
						const urlParams = new URLSearchParams(urlObj.search);
						const feTrace = urlParams.get("sap-valid-feTrace");
						const requestParam: Record<string, string> = {};
						urlObj.searchParams.forEach((value, key) => {
							requestParam[key] = value;
						});
						data.push({
							urlBase: requestPart.url.split("?")[0],
							request: requestPart,
							responseBody: JSON.stringify(part.body, null, 4),
							responseBodyObj: part.body,
							parameters: JSON.stringify(requestParam, null, 4),
							trace: feTrace
						});
						thisLib.supportModel.setProperty("/data", data);
						thisLib.supportModel.refresh();
					});
				}
			}
		);

		return xhr;
	};
}
