import { aggregation, defineUI5Class } from "sap/fe/base/ClassSupport";
import BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import Button from "sap/m/Button";
import IconTabFilter from "sap/m/IconTabFilter";
import type { IconTabHeader$SelectEvent } from "sap/m/IconTabHeader";
import IconTabHeader from "sap/m/IconTabHeader";
import VBox from "sap/m/VBox";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import CodeEditor from "sap/ui/codeeditor/CodeEditor";
import type Control from "sap/ui/core/Control";
import CodeLink from "./CodeLink";

type CodeType = "cds" | "xml" | "rap" | "manifest" | "ts" | "view";

@defineUI5Class("sap.fe.core.fpmExplorer.controls.CodeBlock")
export default class CodeBlock extends BuildingBlock<Control> {
	// Linking code
	@aggregation({ type: "sap.fe.core.fpmExplorer.controls.CodeLink", multiple: true, defaultClass: CodeLink, isDefault: true })
	codeLinks?: CodeLink[];

	// we will store the content of the files here
	private cdsContent?: string;

	private xmlContent?: string;

	private viewContent?: string;

	private rapContent?: string;

	private manifestContent?: string;

	private tsContent?: string;

	// which types allow navigation
	private navigation: CodeType[] = [];

	// the current active tab
	private activeTab!: CodeType;

	// the instance of the code
	private _codeEditor!: CodeEditor;

	// the instance of the navigation button
	private _navigationButton!: Button;

	// a flag to check if the component is initialized
	private initialized?: boolean;

	/**
	 * Loads the content of a file from the given file path.
	 * @param filePath The path to the file to be loaded.
	 * @returns A promise that resolves to the content of the file.
	 * @throws If the file cannot be loaded.
	 */
	async loadFile(filePath: string): Promise<string> {
		const response = await fetch(filePath);

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		return response.text();
	}

	/**
	 * Reads the code and shows it in the code editor.
	 */
	// @ts-ignore
	async onBeforeRendering(): Promise<void> {
		if (!this.initialized) {
			for (const codeLink of this.codeLinks || []) {
				let linkedCode = "";
				let navigationEnabled = false;
				if (codeLink.start) {
					const codeContent = await this.loadFile(codeLink.file);
					const splitCode = codeContent.split("\n");
					const startIndex = splitCode.findIndex((line) => line.includes(codeLink.start!));

					if (startIndex !== -1) {
						if (codeLink.end === undefined) {
							if ((codeLink.codeType === "xml" || codeLink.codeType === "view") && codeLink.fullTag) {
								const openingTagLine = splitCode
									.slice(0, startIndex + 1)
									.reverse()
									.findIndex((line) => line.includes("<"));

								const closingTagLine = splitCode.slice(startIndex).findIndex((line) => line.includes("/>"));

								linkedCode = splitCode
									.slice(
										openingTagLine !== -1 ? startIndex - openingTagLine : startIndex,
										closingTagLine !== -1 ? startIndex + closingTagLine + 1 : startIndex + 1
									)
									.join("\n");

								if (!linkedCode.trim().endsWith("/>")) {
									linkedCode = linkedCode.trim() + " />";
								}
							} else {
								linkedCode = splitCode[startIndex];
							}
						} else if (!isNaN(Number(codeLink.end))) {
							const endIndex = startIndex + Number(codeLink.end) - 1;
							linkedCode =
								endIndex < splitCode.length
									? splitCode.slice(startIndex, endIndex).join("\n")
									: splitCode.slice(startIndex).join("\n");
						} else {
							const endIndex = splitCode.findIndex(
								(line, index) => index > startIndex && line.includes(codeLink.end as string)
							);
							if (endIndex !== -1) {
								linkedCode = splitCode.slice(startIndex, endIndex + 1).join("\n");
							}
						}
						navigationEnabled = true;

						// we need the name of the tab to be able to switch between them. If not given, we assume the name of the file
						if (!codeLink.fileName) {
							const fileName = codeLink.file.split("/").pop();
							if (fileName) {
								codeLink.fileName = fileName;
							}
						}
					}
				} else {
					linkedCode = await this.loadFile(codeLink.file);
				}

				switch (codeLink.codeType) {
					case "cds":
						this.cdsContent = linkedCode;
						if (navigationEnabled) {
							this.navigation.push("cds");
						}
						break;
					case "xml":
						this.xmlContent = linkedCode;
						if (navigationEnabled) {
							this.navigation.push("xml");
						}
						break;
					case "view":
						this.viewContent = linkedCode;
						if (navigationEnabled) {
							this.navigation.push("view");
						}
						break;
					case "rap":
						this.rapContent = linkedCode;
						if (navigationEnabled) {
							this.navigation.push("rap");
						}
						break;
					case "manifest":
						this.manifestContent = linkedCode;
						if (navigationEnabled) {
							this.navigation.push("manifest");
						}
						break;
					case "ts":
						this.tsContent = linkedCode;
						if (navigationEnabled) {
							this.navigation.push("ts");
						}
						break;
				}
			}
			this.initialized = true;
		}

		this.content = this.createContent();

		if (this.cdsContent) {
			this.showCode("cds");
		} else if (this.manifestContent) {
			this.showCode("manifest");
		} else if (this.xmlContent) {
			this.showCode("xml");
		} else if (this.viewContent) {
			this.showCode("view");
		} else if (this.tsContent) {
			this.showCode("ts");
		}
	}

	/**
	 * Formats and shows the given code in the code editor.
	 * @param codeType The code type to be shown.
	 */
	showCode(codeType: CodeType): void {
		let code = this[`${codeType}Content`];
		if (!code) {
			return;
		}

		// if we get the code from the file, it might have some extra spaces at the beginning
		// we'll remove them to make the code look better
		const lines = code.split("\n");
		const leadingSpaces = lines[0].match(/^\s*/)?.[0].length || 0;

		if (leadingSpaces > 0) {
			code = lines.map((line) => line.slice(leadingSpaces)).join("\n");
		}

		this._codeEditor?.setValue(code);
		this._navigationButton.setVisible(this.navigation.includes(codeType));
		this.activeTab = codeType;
	}

	/**
	 * Navigates to the code in the code editor.
	 */
	navigateToCode(): void {
		const fileName = this.codeLinks?.find((link) => link.codeType === this.activeTab)?.fileName;
		const code = this[`${this.activeTab}Content`] as string;
		window.parent.postMessage({ type: "navigateToCode", code: code, file: fileName });
	}

	/**
	 * Switches the tab and shows the code of the selected tab.
	 * @param event The event that was triggered.
	 */
	switchTab(event: IconTabHeader$SelectEvent): void {
		const codeType = event.getParameter("key") as CodeType;
		this.showCode(codeType);
	}

	/**
	 * Creates the content of the building block.
	 * @returns The content of the building block.
	 */
	createContent(): VBox {
		const uriParams = new URLSearchParams(window.parent.location.search);
		let showRAPContent = false;

		if (uriParams.has("showRAPContent")) {
			showRAPContent = true;
		}

		this._codeEditor = (
			<CodeEditor maxLines={20} class="sapUiTinyMargin" type="red" lineNumbers="false" editable="false" width="100%" />
		);
		this._navigationButton = (
			<Button type="Transparent" text="Show Code" icon="sap-icon://syntax" press={this.navigateToCode.bind(this)} />
		);

		const items = [];
		if (this.cdsContent) {
			items.push(<IconTabFilter text="CAP" key="cds" />);
		}
		if (this.manifestContent) {
			items.push(<IconTabFilter text="Manifest" key="manifest" />);
		}
		if (showRAPContent && this.rapContent) {
			items.push(<IconTabFilter text="RAP" key="rap" />);
		}
		if (this.xmlContent) {
			items.push(<IconTabFilter text="XML" key="xml" />);
		}
		if (this.viewContent) {
			items.push(<IconTabFilter text="View" key="view" />);
		}
		if (this.tsContent) {
			items.push(<IconTabFilter text="Controller" key="ts" />);
		}

		return (
			<VBox>
				<IconTabHeader select={this.switchTab.bind(this)}>
					{{
						items: items
					}}
				</IconTabHeader>{" "}
				as IconTabHeader
				{this._codeEditor}
				{this._navigationButton}
			</VBox>
		);
	}
}
