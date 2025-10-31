import { defineUI5Class, property } from "sap/fe/base/ClassSupport";
import TemplateComponent from "sap/fe/core/TemplateComponent";
import CoreLibrary from "sap/fe/core/library";
const VariantManagement = CoreLibrary.VariantManagement,
	InitialLoadMode = CoreLibrary.InitialLoadMode;

@defineUI5Class("sap.fe.ina.templates.ListComponent", {
	manifest: {
		"sap.ui": {
			technology: "UI5",
			deviceTypes: {
				desktop: true,
				tablet: true,
				phone: true
			},
			supportedThemes: ["sap_fiori_3", "sap_hcb", "sap_bluecrystal", "sap_belize", "sap_belize_plus", "sap_belize_hcw"]
		},
		"sap.ui5": {
			services: {
				templatedViewService: {
					factoryName: "sap.fe.core.services.TemplatedViewService",
					startup: "waitFor",
					settings: {
						viewName: "sap.fe.ina.templates.AnalyticalPage.AnalyticalPage",
						converterType: "AnalyticalPage",
						errorViewName: "sap.fe.core.services.view.TemplatingErrorPage"
					}
				},
				asyncComponentService: {
					factoryName: "sap.fe.core.services.AsyncComponentService",
					startup: "waitFor"
				}
			},
			commands: {
				Create: {
					name: "Create",
					shortcut: "Ctrl+Enter"
				},
				DeleteEntry: {
					name: "DeleteEntry",
					shortcut: "Ctrl+D"
				},
				Share: {
					name: "Share",
					shortcut: "Shift+Ctrl+S"
				},
				FE_FilterSearch: {
					name: "FE_FilterSearch",
					shortcut: "Ctrl+Enter"
				},
				Cut: {
					name: "Cut",
					shortcut: "Ctrl+X"
				},
				Copy: {
					name: "Copy",
					shortcut: "Ctrl+C"
				},
				Paste: {
					name: "Paste",
					shortcut: "Ctrl+V"
				},
				TableMoveElementUp: {
					name: "TableMoveElementUp",
					shortcut: "Ctrl+Alt+ArrowUp"
				},
				TableMoveElementDown: {
					name: "TableMoveElementDown",
					shortcut: "Ctrl+Alt+ArrowDown"
				}
			},
			handleValidation: true,
			dependencies: {
				minUI5Version: "${sap.ui5.core.version}",
				libs: {
					"sap.f": {},
					"sap.fe.macros": {
						lazy: true
					},
					"sap.m": {},
					"sap.suite.ui.microchart": {
						lazy: true
					},
					"sap.ui.core": {},
					"sap.ui.layout": {},
					"sap.ui.mdc": {},
					"sap.ushell": {
						lazy: true
					},
					"sap.ui.fl": {},
					"sap.sac.df": {}
				}
			},
			contentDensities: {
				compact: true,
				cozy: true
			}
		}
	},
	library: "sap.fe.templates"
})
class ListBasedComponent extends TemplateComponent {
	@property({
		type: "sap.fe.core.InitialLoadMode",
		defaultValue: InitialLoadMode.Auto
	})
	initialLoad!: typeof InitialLoadMode;

	@property({
		type: "sap.fe.core.VariantManagement",
		defaultValue: VariantManagement.Page
	})
	variantManagement!: typeof VariantManagement;

	@property({
		type: "string",
		defaultValue: undefined
	})
	defaultTemplateAnnotationPath!: string;

	@property({
		type: "boolean",
		defaultValue: false
	})
	liveMode!: boolean;
}

export default ListBasedComponent;
