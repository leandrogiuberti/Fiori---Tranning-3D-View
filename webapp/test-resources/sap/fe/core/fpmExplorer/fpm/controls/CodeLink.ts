import { defineUI5Class, property } from "sap/fe/base/ClassSupport";
import UI5Element from "sap/ui/core/Element";

type CodeType = "cds" | "xml" | "rap" | "manifest" | "ts";

@defineUI5Class("sap.fe.core.fpmExplorer.controls.CodeLink")
export default class CodeLink extends UI5Element {
	// The link to the file name to be read.
	@property({ type: "string" })
	file!: string;

	// The type of the file. Default is "cds". You can also use "xml", "manifest", "ts" or "rap".
	@property({ type: "string", defaultValue: "cds" })
	codeType!: CodeType;

	// The start of the code to be read. If not given, the full code is read.
	@property({ type: "string" })
	start?: string;

	// The end of the code to be read. If no start is given, this is ignored. Can be either a code snippet or number of lines after the start.
	@property({ type: "string" })
	end?: string;

	// If xml is used and only start is given, the full tag is read.
	@property({ type: "boolean", defaultValue: true })
	fullTag?: string;

	// The name also shown in the code editor, to be able to switch tabs. If not given, determined by the file name.
	@property({ type: "string" })
	fileName!: string;
}
