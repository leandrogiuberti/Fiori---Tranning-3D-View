import ObjectPath from "sap/base/util/ObjectPath";

const formatScaleAndUOM = function (separator: string, uom?: string, scale?: string): string {
	uom = uom === "undefined" ? "" : uom;
	scale = scale === "undefined" ? "" : scale;
	const UOMAndScale = `${separator}${scale} ${uom}`;
	const onlyUOM = uom ? `${separator}${uom}` : "";
	const onlyOneOfUOMOrScale = scale ? `${separator}${scale}` : onlyUOM;
	return uom && scale ? UOMAndScale : onlyOneOfUOMOrScale;
};
formatScaleAndUOM.__functionName = "sap.fe.macros.formatters.VisualFilterFormatter#formatScaleAndUOM";

// See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax
/**
 * Collection of VisualFilter formatters.
 * @param this The context
 * @param sName The inner function name
 * @param oArgs The inner function parameters
 * @returns The value from the inner function
 */
const visualFilterFormatter = function (this: object, sName: string, ...oArgs: unknown[]): unknown {
	if (visualFilterFormatter.hasOwnProperty(sName)) {
		return (visualFilterFormatter as unknown as Record<string, Function>)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

visualFilterFormatter.formatScaleAndUOM = formatScaleAndUOM;

ObjectPath.set("sap.fe.macros.formatters.VisualFilterFormatter", visualFilterFormatter);

export default visualFilterFormatter;
