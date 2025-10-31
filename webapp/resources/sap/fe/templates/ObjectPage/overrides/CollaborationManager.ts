import Log from "sap/base/Log";
import { type RetrieveCardType } from "sap/cards/ap/common/services/RetrieveCard";
import CommonUtils from "sap/fe/core/CommonUtils";
import type CollaborationManager from "sap/fe/core/controllerextensions/cards/CollaborationManager";
import { type WrappedCard } from "sap/fe/core/services/CollaborationManagerServiceFactory";
import { showGenericErrorMessage } from "sap/fe/macros/insights/CommonInsightsHelper";
import { type CardManifest } from "sap/insights/CardHelper";
export const RetrieveCardTypes: Record<string, RetrieveCardType> = {
	INTEGRATION: "integration"
};

const CollaborationManagerOverride = {
	async collectAvailableCards(this: CollaborationManager, cards: WrappedCard[]): Promise<void> {
		const view = this.base.getView();
		const controller = view.getController();
		const appComponent = controller.getOwnerComponent().getAppComponent();
		const isEditable = CommonUtils.getIsEditable(view);
		const card = !isEditable
			? await appComponent.getCollaborationManagerService().getDesignTimeCard(RetrieveCardTypes.INTEGRATION)
			: undefined;
		if (card) {
			const onAddCardToCollaborationManagerCallback = (): void => {
				try {
					if (card) {
						appComponent.getCollaborationManagerService().publishCard(card as CardManifest);
						return;
					}
				} catch (e) {
					showGenericErrorMessage(view);
					Log.error(e as string);
				}
			};
			const pageTitleInformation = await controller._getPageTitleInformation();
			cards.push({
				card: card,
				title: pageTitleInformation.subtitle || "",
				callback: onAddCardToCollaborationManagerCallback
			});
		}
	}
};
export default CollaborationManagerOverride;
