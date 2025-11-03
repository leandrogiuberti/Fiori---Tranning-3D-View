import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type { Button$PressEvent } from "sap/m/Button";
import Button from "sap/m/Button";
import type { Link$PressEvent } from "sap/m/Link";
import Link from "sap/m/Link";
import OverflowToolbar from "sap/m/OverflowToolbar";
import Popover from "sap/m/Popover";
import Text from "sap/m/Text";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import VBox from "sap/m/VBox";
import { ButtonType, PlacementType } from "sap/m/library";
import Lib from "sap/ui/core/Lib";

const resourceBundle = Lib.getResourceBundleFor("sap.fe.controls")!;

/**
 * @param titleText The title of the AI notice popover
 * @returns A Popover component containing the AI notice text and a close button
 */

function AIPopoverContent(): Popover {
	const $aiNoticePopover: Popover = (
		<Popover
			contentWidth={"22.8125rem"}
			showArrow={true}
			showHeader={true}
			placement={PlacementType.Auto}
			title={resourceBundle.getText("M_EASY_FILTER_POPOVER_AI_TITLE")}
		>
			{{
				content: (
					<VBox>
						<Text class="sapFeControlsAiPopoverText1" text={resourceBundle.getText("M_EASY_FILTER_POPOVER_AI_TEXT_1")} />
						<Text class="sapFeControlsAiPopoverText2" text={resourceBundle.getText("M_EASY_FILTER_POPOVER_AI_TEXT_2")} />
					</VBox>
				),
				footer: (
					<OverflowToolbar>
						{{
							content: (
								<>
									<ToolbarSpacer />
									<Button
										text={resourceBundle.getText("M_EASY_FILTER_POPOVER_CLOSE")}
										press={(): void => {
											$aiNoticePopover?.close();
										}}
									/>
								</>
							)
						}}
					</OverflowToolbar>
				)
			}}
		</Popover>
	);

	return $aiNoticePopover;
}

/**
 * Tiny component to display a link that opens a popover with the AI notice.
 * @param props
 * @param props.resourceBundle
 * @returns The AI Notice component
 */

function AINotice(props: { resourceBundle: ResourceBundle }): Link {
	return (
		<Button
			text={props.resourceBundle.getText("M_EASY_FILTER_FILTER_SET_AI")}
			icon="sap-icon://ai"
			type={ButtonType.Transparent}
			press={(e: Button$PressEvent): void => {
				const $disclaimerPopover: Popover = AIPopoverContent();
				$disclaimerPopover.openBy(e.getSource());
			}}
		/>
	);
}

/**
 * @param title The title of the AI notice popover
 * @param description The description text of the AI notice popover
 * @param text The text of the button in the AI notice popover
 * @returns The AI Notice link component that opens a popover with the AI notice
 */

function AILinkNotice(): Link {
	return (
		<Link
			text={`${resourceBundle.getText("M_EASY_FILTER_POPOVER_AI_TITLE")}.`}
			press={(e: Link$PressEvent): void => {
				const $aiNoticePopover = AIPopoverContent();
				$aiNoticePopover.openBy(e.getSource());
			}}
		/>
	);
}

export { AILinkNotice, AINotice, AIPopoverContent };
