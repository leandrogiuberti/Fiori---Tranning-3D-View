import DynamicPage from "sap/f/DynamicPage";
import DynamicPageHeader from "sap/f/DynamicPageHeader";
import DynamicPageTitle from "sap/f/DynamicPageTitle";
import type { PropertiesOf } from "sap/fe/base/ClassSupport";
import { aggregation, defineUI5Class, property } from "sap/fe/base/ClassSupport";
import BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import CommandExecution from "sap/fe/core/controls/CommandExecution";
import ObjectTitle from "sap/fe/macros/ObjectTitle";
import Share from "sap/fe/macros/Share";
import ShareOptions from "sap/fe/macros/share/ShareOptions";
import Avatar from "sap/m/Avatar";
import AvatarShape from "sap/m/AvatarShape";
import AvatarSize from "sap/m/AvatarSize";
import FlexBox from "sap/m/FlexBox";
import Label from "sap/m/Label";
import Title from "sap/m/Title";
import type Control from "sap/ui/core/Control";
import type Context from "sap/ui/model/odata/v4/Context";
import MsTeamsOptions from "./share/MsTeamsOptions";

/**
 * Building block used to create a custom page with a title and the content. By default, the page includes a title.
 * @public
 */
@defineUI5Class("sap.fe.macros.Page")
export default class Page extends BuildingBlock {
	/**
	 * Content(s) of the page
	 * @public
	 */
	@aggregation({ type: "sap.ui.core.Control", multiple: true, isDefault: true })
	items!: Control[];

	/**
	 * @private
	 */
	@aggregation({ type: "sap.ui.core.Control", multiple: true })
	actions!: Control[];

	/**
	 * Title of the page. If no title is provided, the title, avatar, and description are derived from the unqualified HeaderInfo annotation associated with the entity.
	 * @public
	 */
	@property({ type: "string" })
	title?: string;

	/**
	 * @private
	 */
	@property({ type: "boolean" })
	editable = false;

	/**
	 * Provides additional details of the page. This property is considered only if the title property is defined.
	 * @public
	 */
	@property({ type: "string" })
	description?: string;

	/**
	 * Source of the avatar image. This property is considered only if the title property is defined.
	 * @public
	 */
	@property({ type: "string" })
	avatarSrc?: string;

	constructor(idOrSettings: string);

	constructor(idOrSettings: PropertiesOf<Page>);

	constructor(idOrSettings: string | PropertiesOf<Page>, settings?: PropertiesOf<Page>) {
		super(idOrSettings, settings);
	}

	onMetadataAvailable(): void {
		this.content = this.createContent();
	}

	private createAvatar(isExpanded: boolean): Avatar | undefined {
		if (this.avatarSrc) {
			return (
				<Avatar
					class="sapUiSmallMarginEnd"
					src={this.avatarSrc}
					displayShape={AvatarShape.Square}
					displaySize={isExpanded ? AvatarSize.XL : AvatarSize.S}
				/>
			);
		}
	}

	private createTitle(): Title {
		return <Title text={this.title} />;
	}

	private createDescription(): Label {
		return <Label text={this.description} />;
	}

	private getTitlePart(): FlexBox | ObjectTitle {
		if (this.title && this.description) {
			return <FlexBox direction="Column">{{ items: [this.createTitle(), this.createDescription()] }}</FlexBox>;
		} else if (this.title) {
			return <FlexBox direction="Column">{{ items: [this.createTitle()] }}</FlexBox>;
		} else {
			return <ObjectTitle />;
		}
	}

	/**
	 * Returns the Share action with share options.
	 * @returns {Control} The Share action control
	 */
	getShareAction(): Control {
		return (
			<Share id={this.createId("share")}>
				{{
					shareOptions: <ShareOptions showSendEmail="true" showCollaborationManager="true" />,
					msTeamsOptions: <MsTeamsOptions enableCard="false" />
				}}
			</Share>
		);
	}

	private createContent(): DynamicPage {
		return (
			<DynamicPage id={this.createId("page")}>
				{{
					title: (
						<DynamicPageTitle id={this.createId("title")}>
							{{
								expandedHeading: this.getTitlePart(),
								snappedHeading: (
									<FlexBox renderType="Bare">{{ items: [this.createAvatar(false), this.getTitlePart()] }}</FlexBox>
								),
								actions: this.actions.concat(this.getShareAction())
							}}
						</DynamicPageTitle>
					),
					header: <DynamicPageHeader>{this.createAvatar(true)}</DynamicPageHeader>,
					content: (
						<FlexBox id={this.createId("content")} direction="Column">
							{{
								items: this.items.map((item) => {
									item.addStyleClass("sapUiMediumMarginBottom");
									return item;
								})
							}}
						</FlexBox>
					),
					dependents: [
						<CommandExecution
							execute={(): void => {
								const oContext = this.getBindingContext() as Context;
								const oModel = this.getModel("ui")!;
								BusyLocker.lock(oModel);
								this.getPageController()
									?.editFlow?.editDocument(oContext)
									.finally(function () {
										BusyLocker.unlock(oModel);
									});
							}}
							enabled={true}
							visible={true}
							command="Edit"
						/>
					]
				}}
			</DynamicPage>
		);
	}
}
