/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AttributeType } from "../../sina/AttributeType";
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { Value as RawValue } from "../../sina/types";

export async function readFile(path: string): Promise<string> {
    try {
        if (typeof window === "undefined") {
            // Node.js environment
            const fs = await import("node:fs");
            const url = await import("node:url");
            const pathLib = await import("node:path");
            const __filename = url.fileURLToPath(import.meta.url);
            const __dirname = pathLib.dirname(__filename);
            const elisaPath = pathLib.join(__dirname, "../../../../../../../..");
            //path = path.replace("/$elisa$", elisaPath);
            path = elisaPath + "/dist/" + path;
            const data = fs.readFileSync(path, { encoding: "utf-8" }).toString();
            return data;
        } else {
            // browser environment
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }
            return await response.text();
        }
    } catch (error) {
        console.error(`Error reading file at ${path}:`, error);
        throw error;
    }
}

export function isValuePairMatched(
    value1: RawValue,
    value2: RawValue,
    operator: ComparisonOperator,
    caseSensitive?: boolean
): boolean {
    if (typeof value1 !== typeof value2) {
        return false;
    }

    const type = typeof value1;

    if (type === "number" || (value1 instanceof Date && value2 instanceof Date)) {
        switch (operator) {
            case ComparisonOperator.Eq:
                return value1 === value2;
            case ComparisonOperator.Ne:
                return value1 !== value2;
            case ComparisonOperator.Ge:
                return value1 >= value2;
            case ComparisonOperator.Le:
                return value1 <= value2;
            case ComparisonOperator.Gt:
                return value1 > value2;
            case ComparisonOperator.Lt:
                return value1 < value2;
        }
    }

    if (type === "string") {
        return createRegExp(value2 as string, operator, caseSensitive).test(value1 as string);
    }
}

function createRegExp(value: string, operator: ComparisonOperator, caseSensitive?: boolean): RegExp {
    const pattern = value
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // escape everything except *
        .replace(/\*/g, ".*"); // replace * with .*
    const cs = caseSensitive !== true ? "i" : "";
    switch (operator) {
        case ComparisonOperator.Eq:
            return new RegExp(`^${pattern}$`, cs);
        case ComparisonOperator.Ne:
            return new RegExp(`^(?!${pattern}$).*`, cs);
        case ComparisonOperator.Co:
            return new RegExp(pattern, cs);
        case ComparisonOperator.Bw:
            return new RegExp(`^${pattern}`, cs);
        case ComparisonOperator.Ew:
            return new RegExp(`${pattern}$`, cs);
        default:
            return new RegExp(`^${pattern}`, cs);
    }
}

export function getMatchedStringValues(
    stringValues: string[],
    searchTerm: string,
    caseSensitive?: boolean
): string[] {
    if (isStarString(searchTerm)) {
        return stringValues;
    }

    if (isEmptyString(searchTerm)) {
        return stringValues;
    }

    return stringValues.filter((sValue) =>
        isValuePairMatched(sValue, searchTerm, ComparisonOperator.Co, caseSensitive)
    );
}

export function formatRawValue(stringValue: string, type: AttributeType): RawValue {
    switch (type) {
        case AttributeType.Double:
            return parseFloat(stringValue) || 0;
        case AttributeType.Integer:
            return parseInt(stringValue, 10) || 0;
        case AttributeType.String:
            return stringValue;
        case AttributeType.ImageUrl:
            return stringValue;
        case AttributeType.ImageBlob:
            return stringValue;
        case AttributeType.GeoJson:
            return stringValue;
        case AttributeType.Date: {
            const date = isNaN(new Date(stringValue).getTime()) ? new Date(0) : new Date(stringValue);
            return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        }
        case AttributeType.Time:
            return stringValue;
        case AttributeType.Timestamp: {
            const date = isNaN(new Date(stringValue).getTime()) ? new Date(0) : new Date(stringValue);
            return date;
        }
        case AttributeType.Group:
            return stringValue;
        default:
            return stringValue;
    }
}

export function formatHighlightedValue(stringValue: string, searchTerm: string): string {
    if (isStarString(searchTerm)) {
        return stringValue;
    }
    if (isEmptyString(searchTerm)) {
        return stringValue;
    }
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return stringValue.replace(regex, "<b>$1</b>");
}

export function format10Power(value: number, isCeil?: boolean): number {
    // isCeil NOT true: find biggest 10 power number, smaller than value
    // isCeil true: find smallest 10 power number, bigger than value
    const digits = isCeil
        ? Math.trunc(value).toString().split("").map(Number).length
        : Math.trunc(value).toString().split("").map(Number).length - 1;
    if (isCeil) {
        return Math.pow(10, digits);
    } else {
        return digits === 0 ? 0 : Math.pow(10, digits);
    }
}

export function isStarString(value: string): boolean {
    return value === "*";
}

export function isEmptyString(value: string): boolean {
    return typeof value === "string" && value === "";
}
