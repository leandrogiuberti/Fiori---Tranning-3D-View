import { IssueCategory } from "sap/fe/core/converters/helpers/IssueManager";
import type { CoreFacade, DiagnosticRule, IssueManagerFacade } from "sap/fe/core/support/CommonHelper";
import { Audiences, Categories, getIssueByCategory } from "sap/fe/core/support/CommonHelper";
const oCollectionFacetUnsupportedLevelIssue: DiagnosticRule = {
	id: "collectionFacetUnsupportedLevel",
	title: "CollectionFacet: Unsupported Levels",
	minversion: "1.80",
	audiences: [Audiences.Application],
	categories: [Categories.Usage],
	description: "Collection facets at level 3 or lower (level 4, 5…) are not supported and will not be visible on the UI.",
	resolution: "At level 3 you can only use reference facets, but not collection facets.",
	resolutionurls: [{ text: "CollectionFacets", href: "https://ui5.sap.com/#/topic/facfea09018d4376acaceddb7e3f03b6" }],
	check: function (oIssueManager: IssueManagerFacade, oCoreFacade: CoreFacade /*oScope: any*/): void {
		getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Facets, "UnsupportedLevel");
	}
};
export function getRules(): DiagnosticRule[] {
	return [oCollectionFacetUnsupportedLevelIssue];
}
