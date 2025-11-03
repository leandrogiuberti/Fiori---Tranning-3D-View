import type MDXViewLoader from "sap/fe/base/jsx-runtime/ViewLoader";
import PageController from "sap/fe/core/PageController";
import type FilterBar from "sap/fe/macros/controls/FilterBar";
import type FilterBarAPI from "sap/fe/macros/filterBar/FilterBarAPI";
import type Page from "sap/m/Page";
import type UI5Event from "sap/ui/base/Event";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import Condition from "sap/ui/mdc/condition/Condition";
import ConditionValidated from "sap/ui/mdc/enums/ConditionValidated";
import JSONModel from "sap/ui/model/json/JSONModel";

export default PageController.extend("sap.fe.core.fpmExplorer.FilterBarParameterizedWithTable.FilterBarParameterizedWithTable", {
	onPageReady: function (this: PageController) {
		const View = this.getView();
		const FilterBarAPI = View.byId("sap.fe.core.fpmExplorer.filterBarParameterizedWithTable::Default--FilterBar") as FilterBarAPI;
		const FilterBar = FilterBarAPI.getContent() as FilterBar;
		const FilterItem = FilterBar.getFilterItems()[0];
		const conditions: ConditionObject[] = [Condition.createCondition("EQ", ["USD"], null, null, ConditionValidated.Validated)];
		FilterItem.setConditions(conditions);
		FilterBar.setLiveMode(true);
	},
	handlers: {
		onFiltersChanged: function (Event: UI5Event) {
			const ViewLoader: MDXViewLoader = this.getView() as MDXViewLoader;
			const FilterBarAPI = Event.getSource() as FilterBarAPI;
			const Page: Page = ViewLoader.getContent()[0] as Page;
			const allFilters: Record<string, any> = FilterBarAPI.getFilters();
			let FBConditions: JSONModel = FilterBarAPI.getModel("fbConditions") as JSONModel;

			if (FBConditions === undefined) {
				FBConditions = new JSONModel({
					allFilters: "",
					showMessageDialog: false,
					expanded: false,
					filtersTextInfo: FilterBarAPI.getActiveFiltersText()
				});
				Page.setModel(FBConditions, "fbConditions");
			}
			FBConditions.setProperty("/allFilters", JSON.stringify(allFilters, null, "  "));

			if (Object.keys(allFilters).length > 0) {
				FBConditions.setProperty("/expanded", true);
			}
			FBConditions.setProperty("/filtersTextInfo", FilterBarAPI.getActiveFiltersText());
		}
	}
});
