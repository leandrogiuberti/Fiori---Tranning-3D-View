import type { ViewData } from "sap/fe/core/services/TemplatedViewServiceFactory";
import type Field from "sap/fe/macros/Field";
import type TableAPI from "sap/fe/macros/table/TableAPI";
import type Button from "sap/m/Button";
import type ManagedObject from "sap/ui/base/ManagedObject";
import type UI5Element from "sap/ui/core/Element";
import type View from "sap/ui/core/mvc/View";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";

// @ts-ignore
const FE = window?.opener?.$fe ?? window?.$fe;

let supportLinkTimeout: number | undefined;
let supportLinksModel: ODataModel | undefined;
let supportLinkFunction: string | undefined;
const getMetaPath = function (_element: UI5Element): string | undefined {
	let element: UI5Element | null | ManagedObject = _element;
	while (element) {
		if (element.isA<View>("sap.ui.core.mvc.View")) {
			const viewData = element.getViewData() as ViewData | undefined;
			return viewData?.contextPath || "/" + viewData?.entitySet;
		} else if (element.isA<Field>("sap.fe.macros.Field")) {
			return element.contextPath + "/" + element.mainPropertyRelativePath;
		} else if (element.isA<Button>("sap.m.Button")) {
			// That's just an ugly POC to get the action name, we need to find a better way
			const annotatedActionIdentifier = element
				.getCustomData()
				?.find((data) => data.getKey() === "annotatedActionIdentifier")
				?.getValue();
			if (annotatedActionIdentifier) {
				return annotatedActionIdentifier.split("::")[1].split(".").pop();
			}
		} else if (element.isA<TableAPI>("sap.fe.macros.table.TableAPI")) {
			return element.metaPath.split("/@")[0];
		}
		element = element.getParent();
	}
	return;
};

export const loadSupportLinks = async function (element: UI5Element): Promise<void> {
	const model = FE.supportModel;
	const odataModel = element.getModel() as ODataModel | undefined;
	if (!odataModel) {
		return;
	}
	model.setProperty("/supportLinksStateText", "Loading...");
	let serviceRoot = odataModel.getServiceUrl();

	if (!serviceRoot.startsWith("/")) {
		// in a local scenario, the service URL also contains the host and port, we need to remove it
		const url = new URL(serviceRoot);
		serviceRoot = url.pathname;
	}

	// create model to read the service
	if (!supportLinksModel) {
		const useBackendUrl = new URLSearchParams(window.location.search).get("useBackendUrl");
		let proxy = "";
		if (useBackendUrl) {
			const backendUrl = new URL(useBackendUrl);
			proxy = `/databinding/proxy/${backendUrl.protocol.replace(":", "")}/${backendUrl.hostname}:${backendUrl.port}`;
		}

		const metaModel = odataModel.getMetaModel();
		// annotations not yet finalized / merged
		type SupportLinkAnnotations = {
			FunctionImport: string;
			Url: string;
		};

		const supportLinkAnnotations = metaModel.getObject("/@com.sap.vocabularies.Support.v1.TechnicalInfoLinks") as
			| SupportLinkAnnotations
			| undefined;
		if (!supportLinkAnnotations) {
			model.setProperty("/supportLinksStateText", "Service links not implemented for this application");
			return;
		}

		const resolvedUrl = new URL(supportLinkAnnotations.Url, `http://dummy${serviceRoot}`).pathname;
		const supportLinkServiceUrl = resolvedUrl.replace(/\/\$metadata$/, "/");
		supportLinksModel = new ODataModel({ serviceUrl: `${proxy}${supportLinkServiceUrl}` });

		try {
			await supportLinksModel.getMetaModel().requestObject("/");
		} catch (error) {
			model.setProperty("/supportLinksStateText", "System/Application does not provide service implementation information");
			return;
		}

		supportLinkFunction = supportLinkAnnotations.FunctionImport;
	}

	if (!supportLinkFunction) {
		return;
	}

	const metaPath = getMetaPath(element);

	if (metaPath) {
		const functionCall = supportLinksModel.bindContext(`/${supportLinkFunction}(...)`);
		const cacheToken = metaPath.split("/").join("_");
		const cachedRequests = model.getProperty("/cachedSupportLinks/" + cacheToken);

		if (cachedRequests) {
			model.setProperty("/supportLinks", cachedRequests);
		} else {
			// finally call the service
			functionCall.setParameter("ServiceRoot", serviceRoot);
			functionCall.setParameter("EdmPath", metaPath.replace(/^\//, "")); // without leading slash
			try {
				await functionCall.execute("$auto");
				const links = functionCall.getBoundContext().getObject().value;
				for (const link of links) {
					if (link.Url?.startsWith("../")) {
						// relative URL, we need to resolve it
						link.Url = new URL(link.Url, `http://dummy${supportLinksModel.getServiceUrl()}`).pathname;
					}
				}
				model.setProperty("/supportLinks", links);
				model.setProperty("/cachedSupportLinks/" + cacheToken, links);
			} catch (error) {
				model.setProperty("/supportLinks", []);
				model.setProperty("/supportLinksStateText", "Failed to load service implementation links");
				return;
			}
		}
	}
	model.setProperty("/supportLinksStateText", "No service implementation links were found");
};

export const loadSupportLinksForElement = function (element: UI5Element): void {
	// debounce the call and only request if the user stays on a control for a while
	const debounce = (func: Function, delay: number) => {
		return function (...args: any[]) {
			if (supportLinkTimeout !== undefined) {
				clearTimeout(supportLinkTimeout);
			}
			supportLinkTimeout = window.setTimeout(() => {
				func(...args);
			}, delay);
		};
	};
	const debouncedGetSupportLinks = debounce(loadSupportLinks, 500);
	debouncedGetSupportLinks(element);
};
