window.initMock = async function (serviceWorker, pagePath, useXML) {
	const manifestData = await (await fetch(`${pagePath}/manifest.json`)).json();
	const useDefaultService = manifestData["sap.app"].dataSources.mainService.uri === "/sap/fe/core/mock/service/";
	const mockDataPath = useDefaultService ? "/test-resources/sap/fe/core/fpmExplorer/service" : `${pagePath}/localService`;
	serviceWorker.postMessage({
		type: "INIT_MOCK",
		configuration: {
			services: [
				{
					generateMockData: false,
					urlPath: manifestData["sap.app"].dataSources.mainService.uri,
					metadataPath:
						useXML === true
							? new URL(`${mockDataPath}/metadata.xml`, window.location.href).pathname
							: new URL(`${mockDataPath}/service.cds`, window.location.href).pathname,
					mockdataPath: new URL(`${mockDataPath}`, window.location.href).pathname
				}
			]
		}
	});
	window.lastSW = serviceWorker;
	window.lastPath = pagePath;
	window.isXML = useXML;
};
window.reloadMock = function () {
	window.initMock(window.lastSW, window.lastPath, window.isXML);
};
window.initPage = function (pagePath, useXML, initFn) {
	if ("serviceWorker" in navigator) {
		const broadcast = new BroadcastChannel("status-channel");
		broadcast.onmessage = (event) => {
			if (event.data.type === "ACTIVATED") {
				if (useXML === true) {
					window.initMock(navigator.serviceWorker.controller, pagePath, true);
				} else {
					window.initMock(navigator.serviceWorker.controller, pagePath, false);
				}
			}
		};
		navigator.serviceWorker.addEventListener("message", (event) => {
			// event is a MessageEvent object
			if (event.data && event.data.type === "INIT_MOCK_DONE") {
				if (initFn) {
					window[initFn]();
				} else if (!window.mainComponent) {
					sap.ui.require(["sap/ui/core/ComponentSupport"]);
				} else {
					const shellContainer = sap.ui.require("sap/ushell/Container");
					if (shellContainer) {
						shellContainer.getServiceAsync("AppLifeCycle").then((AppLifeCycle) => {
							AppLifeCycle.reloadCurrentApp();
						});
					} else {
						window.mainComponent.oContainer.destroy();
						const componentSupport = sap.ui.require("sap/ui/core/ComponentSupport");
						document.querySelector('[data-id="container"]').setAttribute("data-sap-ui-component", "");
						componentSupport.run();
					}
				}
			}
		});
		const serviceWorkerUrl = "../../service-worker.js";
		navigator.serviceWorker
			.register(serviceWorkerUrl, { scope: "../../" })
			.then(({ installing, waiting, active }) => {
				let serviceWorker;
				let wasInstalling = false;
				if (installing) {
					serviceWorker = installing;
					wasInstalling = true;
				} else if (waiting) {
					serviceWorker = waiting;
				} else if (active) {
					serviceWorker = active;
				}
				if (serviceWorker) {
					if (serviceWorker.state === "activated") {
						window.initMock(serviceWorker, pagePath, useXML);
					}
					if (!wasInstalling) {
						serviceWorker.addEventListener("statechange", (e) => {
							if (e.target.state === "activated") {
								window.initMock(e.target, pagePath, useXML);
							}
						});
					}
				}
			})
			.catch(function (error) {
				document.querySelector("body").textContent = error;
			});
	}
};
