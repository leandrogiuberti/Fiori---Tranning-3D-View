import { type Property } from "@sap-ux/vocabularies-types";
import { compileExpression } from "sap/fe/base/BindingToolkit";
import { defineUI5Class, event, property, type PropertiesOf } from "sap/fe/base/ClassSupport";
import EventDelegateHook from "sap/fe/base/EventDelegateHook";
import BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import { type UserActivity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import * as CollaborationFormatters from "sap/fe/core/formatters/CollaborationFormatter";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import ResourceModelHelper from "sap/fe/core/helpers/ResourceModelHelper";
import { isProperty } from "sap/fe/core/helpers/TypeGuards";
import { type DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";
import Avatar, { type Avatar$PressEvent } from "sap/m/Avatar";
import Label from "sap/m/Label";
import ResponsivePopover from "sap/m/ResponsivePopover";
import type UI5Event from "sap/ui/base/Event";
import UI5Element from "sap/ui/core/Element";
import type { EventHandler } from "types/extension_types";

/**
 * A BuildingBlock to watch the lock status of a property and to react on changes.
 * @public
 * @ui5-experimental-since 1.141.0
 * @since 1.141.0
 */
@defineUI5Class("sap.fe.macros.CollaborativeDraftHandler")
export default class CollaborativeDraftHandler extends BuildingBlock<Avatar> {
	/**
	 * Defines the path of the context used in the current page or block.
	 * This setting is defined by the framework, and can be overwritten.
	 * @public
	 * @ui5-experimental-since 1.141.0
	 * @since 1.141.0
	 */
	@property({ type: "string" })
	contextPath!: string;

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 * @public
	 * @ui5-experimental-since 1.141.0
	 * @since 1.141.0
	 */
	@property({ type: "string" })
	metaPath!: string;

	/**
	 * Event fired when the lock status changes.
	 *
	 * Parameters:<BR>
	 * - isLocked : true if the property is locked, false otherwise<BR>
	 * - lockingUserID: the ID of the user locking the property (undefined if not locked)<BR>
	 * - lockingUserName: the name of the user locking the property (undefined if not locked)<BR>
	 * - lockingUserInitials: the initials of the user locking the property (undefined if not locked)<BR>
	 * - lockingUserColor: the color associated to the user locking the property (undefined if not locked)<BR>
	 * @public
	 * @ui5-experimental-since 1.141.0
	 * @since 1.141.0
	 */
	@event()
	lockChange?: EventHandler<
		UI5Event<
			{
				isLocked: boolean;
				lockingUserID?: string;
				lockingUserName?: string;
				lockingUserInitials?: string;
				lockingUserColor?: string;
			},
			CollaborativeDraftHandler
		>
	>;

	/**
	 * If set to true, the standard Avatar control is displayed to indicate the lock status.
	 * If set to false, nothing is displayed.
	 * @public
	 * @ui5-experimental-since 1.141.0
	 * @since 1.141.0
	 */
	@property({ type: "boolean", defaultValue: false })
	showAvatar = false;

	/**
	 * Internal property to receive the lock data
	 */
	@property({ type: "object" })
	lockInfo?: UserActivity;

	constructor(idOrSettings: string | PropertiesOf<CollaborativeDraftHandler>, settings?: PropertiesOf<CollaborativeDraftHandler>) {
		super(idOrSettings, settings);
	}

	private getFullMetaPath(): string {
		if (this.metaPath.startsWith("/")) {
			return this.metaPath;
		} else if (this.contextPath.endsWith("/")) {
			return `${this.contextPath}${this.metaPath}`;
		} else {
			return `${this.contextPath}/${this.metaPath}`;
		}
	}

	onMetadataAvailable(): void {
		const owner = this._getOwner();
		if (!owner) {
			return;
		}
		if (!ModelHelper.isCollaborationDraftSupported(owner.getAppComponent().getModel().getMetaModel())) {
			return;
		}

		this.contextPath ??= this.getOwnerContextPath() as string;
		const fullMetaPath = this.getFullMetaPath();
		const objectPath = this.getDataModelObjectPath<Property>(fullMetaPath);
		if (!objectPath || !isProperty(objectPath.targetObject)) {
			throw new Error(`CollaborativeDraftHandler: the provided metaPath '${fullMetaPath}' does not point to a valid property`);
		}

		// Bind the lockInfo property to the corresponding lockInfo in the internal model
		const keysBindingParts = objectPath.targetEntityType.keys.map((key) => {
			return { path: key.name, targetType: "any" };
		});
		const bindingInfo = {
			parts: [{ path: `internal>/collaboration/activities${fullMetaPath}`, targetType: "any" }, ...keysBindingParts],
			formatter: CollaborationFormatters.getCollaborationInfo
		};

		this.bindProperty("lockInfo", bindingInfo);

		if (!this.content && this.showAvatar) {
			this.content = this.createCollaborationAvatar(objectPath);
		}
	}

	/**
	 * Update the lockInfo property and fire the lockChange event if there is a change.
	 * @param lockInfo
	 */
	setLockInfo(lockInfo: object | undefined): void {
		if (this.lockInfo !== lockInfo) {
			this.lockInfo = lockInfo as UserActivity | undefined;
			this.fireEvent("lockChange", {
				isLocked: this.lockInfo !== undefined,
				lockingUserID: this.lockInfo?.id,
				lockingUserName: this.lockInfo?.name,
				lockingUserInitials: this.lockInfo?.initials,
				lockingUserColor: this.lockInfo?.color
			});
		}
	}

	/**
	 * Creates the content of the block (Avatar).
	 * @param objectPath
	 * @returns The Avatar control
	 */
	createCollaborationAvatar(objectPath: DataModelObjectPath<Property>): Avatar {
		const collaborationExpression = UIFormatters.getCollaborationExpression(
			objectPath,
			CollaborationFormatters.hasCollaborationActivity
		);
		const collaborationHasActivityExpression = compileExpression(collaborationExpression);
		const collaborationInitialsExpression = compileExpression(
			UIFormatters.getCollaborationExpression(objectPath, CollaborationFormatters.getCollaborationActivityInitials)
		);
		const collaborationColorExpression = compileExpression(
			UIFormatters.getCollaborationExpression(objectPath, CollaborationFormatters.getCollaborationActivityColor)
		);

		return (
			<Avatar
				visible={collaborationHasActivityExpression}
				initials={collaborationInitialsExpression}
				displaySize="Custom"
				customDisplaySize="1.5rem"
				customFontSize="0.8rem"
				backgroundColor={collaborationColorExpression}
				press={(evt: Avatar$PressEvent): void => {
					this.onAvatarPress(evt);
				}}
			>
				{{
					dependents: <EventDelegateHook stopTapPropagation={true} />
				}}
			</Avatar>
		);
	}

	/**
	 * Event handler for the press event of the Avatar.
	 * @param evt
	 */
	onAvatarPress(evt: Avatar$PressEvent): void {
		const avatar = evt.getSource();
		const block = avatar.getParent() as CollaborativeDraftHandler;
		const view = this.getPageController().getView();
		const resourceModel = ResourceModelHelper.getResourceModel(view);
		let popover = UI5Element.getElementById(`manageCollaborationDraft--editUser`) as ResponsivePopover | undefined;

		if (!popover) {
			popover = new ResponsivePopover("manageCollaborationDraft--editUser", {
				showHeader: false,
				placement: "Bottom"
			});
			popover.addStyleClass("sapUiContentPadding");
			view.addDependent(popover);
		}

		popover.destroyContent();
		popover.addContent(
			new Label({
				text: resourceModel.getText("C_COLLABORATIONAVATAR_USER_EDIT_FIELD", [`${block.lockInfo?.name}`])
			})
		);
		popover.openBy(avatar);
	}
}
