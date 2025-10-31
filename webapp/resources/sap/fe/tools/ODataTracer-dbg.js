/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/tools/BatchParser", "sap/ui/model/odata/v4/ODataContextBinding", "sap/ui/model/odata/v4/ODataListBinding", "sap/ui/model/odata/v4/ODataPropertyBinding", "sap/ui/base/ManagedObject", "sap/ui/model/ManagedObjectBindingSupport", "sap/ui/model/odata/v4/lib/_Requestor"], function (BatchParser, ODataContextBinding, ODataListBinding, ODataPropertyBinding, ManagedObject, ManagedObjectBindingSupport, _Requestor) {
  "use strict";

  var _exports = {};
  var parseBatch = BatchParser.parseBatch;
  var BatchContent = BatchParser.BatchContent;
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  function instrumentODataModel(thisLib) {
    // @ts-ignore
    const cacheFn = ODataPropertyBinding.prototype.createAndSetCache;
    // @ts-ignore
    const cacheFn2 = ODataListBinding.prototype.createAndSetCache;
    // @ts-ignore
    const cacheFn3 = ODataContextBinding.prototype.createAndSetCache;
    // @ts-ignore
    const fnRequest = _Requestor.prototype.request;
    // @ts-ignore
    _Requestor.prototype.request = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
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
    const createdCaches = {};
    // // @ts-ignore
    // ODataListBinding.prototype.fetchCache = function() {
    // 	try { throw new Error() } catch(e) {  }
    // 	// @ts-ignore
    // 	const call = ODataListBinding.prototype.fetchCache.caller
    // 	return fetchCacheFn.apply(this, arguments)
    // }
    // @ts-ignore
    ODataListBinding.prototype.createAndSetCache = function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
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
    ODataContextBinding.prototype.applyParameters = function (mParameters) {
      // @ts-ignore
      if (!mParameters["sap-valid-feTrace"]) {
        // @ts-ignore
        mParameters["sap-valid-feTrace"] = cacheId++;
      }
      applyParametersFn.apply(this, [mParameters]);
    };
    // @ts-ignore
    ODataContextBinding.prototype.createAndSetCache = function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      const cacheResult = cacheFn3.apply(this, args);
      cacheResult.__feBinding = that;

      // @ts-ignore
      cacheResult.__feCacheId = this.mParameters["sap-valid-feTrace"];
      createdCaches[cacheResult.__feCacheId] = cacheResult;
      return cacheResult;
    };
    // @ts-ignore
    ODataPropertyBinding.prototype.createAndSetCache = function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      const cacheResult = cacheFn.apply(this, args);
      cacheResult.__feBinding = that;
      if (this.getRootBinding() === this) {
        return cacheResult;
      }
      // @ts-ignore
      if (!this.getRootBinding().mParameters?.["sap-valid-feTrace"]) {
        cacheResult.__feCacheId = cacheId++;
        this.getRootBinding().changeParameters({
          "sap-valid-feTrace": cacheResult.__feCacheId
        });
      } else {
        // @ts-ignore
        cacheResult.__feCacheId = this.getRootBinding().mParameters["sap-valid-feTrace"];
      }
      createdCaches[cacheResult.__feCacheId] = cacheResult;
      return cacheResult;
    };
    const instrumentUpdateBindings = function (updateBindingsFn) {
      return function () {
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }
        const res = updateBindingsFn.apply(this, args);
        Object.keys(this.mBindingInfos).forEach(bindingInfoName => {
          if (this.mBindingInfos[bindingInfoName].binding) {
            this.mBindingInfos[bindingInfoName].binding.__feSource = this;
            this.mBindingInfos[bindingInfoName].binding.__feForProp = bindingInfoName;
            if (!this.mBindingInfos[bindingInfoName].binding.hasOwnProperty("closestDomRef")) {
              Object.defineProperty(this.mBindingInfos[bindingInfoName].binding, "closestDomRef", {
                get: function () {
                  let visibleControl = this.__feSource;
                  while (visibleControl && visibleControl.getDomRef && !visibleControl.getDomRef()) {
                    visibleControl = visibleControl.getParent();
                  }
                  return visibleControl?.getDomRef && visibleControl.getDomRef();
                }
              });
            }
            if (this.mBindingInfos[bindingInfoName].binding.aBindings) {
              this.mBindingInfos[bindingInfoName].binding.aBindings.forEach(subBinding => {
                subBinding.__feSource = this;
                subBinding.__feInComposite = true;
                subBinding.__feForProp = bindingInfoName;
                subBinding.__feComposite = this.mBindingInfos[bindingInfoName].binding;
                if (!subBinding.hasOwnProperty("closestDomRef")) {
                  Object.defineProperty(subBinding, "closestDomRef", {
                    get: function () {
                      let visibleControl = this.__feSource;
                      while (visibleControl && visibleControl.getDomRef && !visibleControl.getDomRef()) {
                        visibleControl = visibleControl.getParent();
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
    ManagedObjectBindingSupport.updateBindings = function () {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      return instrumentUpdateBindings(managedObjectBindingSupport).apply(this, args);
    };
    // @ts-ignore
    ManagedObject.prototype.updateBindings = function () {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      return instrumentUpdateBindings(managedObjectSupport).apply(this, args);
    };
    thisLib.createdCaches = createdCaches;
  }
  function addODataTrace(thisLib) {
    instrumentODataModel(thisLib);
    const _origXML = XMLHttpRequest;
    // @ts-ignore
    window.XMLHttpRequest = function () {
      const xhr = new _origXML();
      const fnOpen = xhr.open;
      const fnSend = xhr.send;
      const fnSetRequestHeader = xhr.setRequestHeader;
      xhr.open = function () {
        this.request ??= {};
        for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
          args[_key8] = arguments[_key8];
        }
        this.request.url = args[1];
        // @ts-ignore
        fnOpen.apply(this, args);
      };
      xhr.send = function () {
        this.request ??= {};
        for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
          args[_key9] = arguments[_key9];
        }
        this.request.body = args[0];
        // @ts-ignore
        fnSend.apply(this, args);
      };
      xhr.setRequestHeader = function () {
        this.request ??= {};
        this.request.header ??= {};
        for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
          args[_key10] = arguments[_key10];
        }
        this.request.header[args[0].toLowerCase()] = args[1];
        // @ts-ignore
        fnSetRequestHeader.apply(this, args);
      };
      xhr.addEventListener("load", function (e) {
        if (e.target.responseURL.includes("$batch")) {
          const batchText = this.request.body;
          const batchBoundary = this.request.header["content-type"].split("boundary=")[1];
          const batchRequest = parseBatch(new BatchContent(batchText), batchBoundary);
          const responseBoundary = e.target.getResponseHeader("content-type").split("boundary=")[1];
          const decodedContent = e.target.responseText;
          const batchResponse = parseBatch(new BatchContent(decodedContent), responseBoundary);
          batchResponse.parts.forEach((part, partIndex) => {
            const requestPart = batchRequest.parts[partIndex];
            const data = thisLib.supportModel.getProperty("/data");
            const urlObj = new URL(`http://example.com/${requestPart.url}`);
            const urlParams = new URLSearchParams(urlObj.search);
            const feTrace = urlParams.get("sap-valid-feTrace");
            const requestParam = {};
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
      });
      return xhr;
    };
  }
  _exports.addODataTrace = addODataTrace;
  return _exports;
}, false);
//# sourceMappingURL=ODataTracer-dbg.js.map
