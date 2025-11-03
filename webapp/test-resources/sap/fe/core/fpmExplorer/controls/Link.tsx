import { defineUI5Class, property } from "sap/fe/base/ClassSupport";
import BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import Button from "sap/m/Button";
import Link from "sap/m/Link";
import mLibrary from "sap/m/library";

@defineUI5Class("sap.fe.core.fpmExplorer.controls.Link")
export default class fpmLink extends BuildingBlock<Link | Button> {
	@property({ type: "string" })
	text?: string;

	@property({ type: "boolean" })
	header?: boolean;

	// ID of UI5 documentation
	@property({ type: "string" })
	documentation?: string;

	// key of FPM topic
	@property({ type: "string" })
	topic?: string;

	// any other href
	@property({ type: "string" })
	href?: string;

	onBeforeRendering(): void {
		if (!this.content) {
			this.content = this.createContent();
		}
	}

	/**
	 * Returns the text of the link.
	 */
	getText(): string {
		if (this.text) {
			return this.text;
		} else if (this.documentation) {
			return "Documentation";
		}
		return "";
	}

	getLinkTarget(): string {
		if (this.documentation) {
			return `../../../../../../../#/topic/${this.documentation}`;
		} else {
			return this.href ?? "";
		}
	}

	onPress(): void {
		if (this.topic) {
			// fire navigation to other topic
			window.parent.postMessage({ type: "navigateToTopic", topic: this.topic });
		} else if (this.header === true) {
			// only in case of header button we need to redirect it, otherwise the link is already handled by the browser
			mLibrary.URLHelper.redirect(this.getLinkTarget(), true);
		}
	}

	/**
	 * Creates a header button.
	 * @returns The header button.
	 */
	createHeaderButton(): Button {
		return <Button text={this.getText()} type="Ghost" press={this.onPress.bind(this)} class="sapUiTinyMarginBegin" />;
	}

	/**
	 * Creates a link.
	 * @returns The link.
	 */
	createLink(): Link {
		return <Link text={this.getText()} href={this.getLinkTarget()} press={this.onPress.bind(this)} target="_blank" />;
	}

	/**
	 * Creates the content of the building block.
	 * @returns The content of the building block.
	 */
	createContent(): Button | Link {
		if (this.header === true) {
			return this.createHeaderButton();
		} else {
			return this.createLink();
		}
	}
}
