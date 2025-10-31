/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AttributeType } from "../../sina/AttributeType";
import * as sinaUtil from "../../sina/util";
import { NotImplementedError, UnknownAttributeTypeError } from "../../core/errors";

export function sina2Odata(attributeType: AttributeType, value, context = {}) {
    switch (attributeType) {
        case AttributeType.Double:
            return value.toString();
        case AttributeType.Integer:
            return value.toString();
        case AttributeType.String:
            return sina2OdataString(value, context);
        case AttributeType.ImageUrl:
            return value;
        case AttributeType.ImageBlob:
            throw new NotImplementedError();
        case AttributeType.GeoJson:
            return value;
        case AttributeType.Date:
            return sina2OdataDate(value);
        case AttributeType.Time:
            return sina2OdataTime(value);
        case AttributeType.Timestamp:
            return sina2OdataTimestamp(value);
        default:
            throw new UnknownAttributeTypeError(attributeType);
    }
}

export function odata2Sina(attributeType: AttributeType, value) {
    switch (attributeType) {
        case AttributeType.Double:
            return parseFloat(value);
        case AttributeType.Integer:
            return parseInt(value, 10);
        case AttributeType.String:
            return value;
        case AttributeType.ImageUrl:
            return value;
        case AttributeType.ImageBlob:
            throw new NotImplementedError();
        case AttributeType.GeoJson:
            return value;
        case AttributeType.Date:
            return odata2SinaDate(value);
        case AttributeType.Time:
            return odata2SinaTime(value);
        case AttributeType.Timestamp:
            return odata2SinaTimestamp(value);
        default:
            throw new UnknownAttributeTypeError(attributeType);
    }
}

// TODO: refactory parseDate, reference HANA Odata
export function odata2SinaTimestamp(value): Date | string {
    if (value.length === 0) {
        return "";
    }

    // odata:2017-12-31T23:59:59.0000000Z
    // sina: Date object
    value = value.trim();

    const year = parseInt(value.slice(0, 4), 10);
    const month = parseInt(value.slice(5, 7), 10);
    const day = parseInt(value.slice(8, 10), 10);
    const hour = parseInt(value.slice(11, 13), 10);
    const minute = parseInt(value.slice(14, 16), 10);
    const seconds = parseInt(value.slice(17, 19), 10);
    const microseconds = isNaN(parseInt(value.slice(20, 20 + 6), 10))
        ? 0
        : parseInt(value.slice(20, 20 + 6), 10);

    return new Date(Date.UTC(year, month - 1, day, hour, minute, seconds, microseconds / 1000));
}

export function sina2OdataTimestamp(value: Date | "$$now$$"): string {
    if (typeof value === "string") {
        if (value.length === 0) {
            return "";
        }
        if (value === "$$now$$") {
            value = new Date();
        }
    }

    // odata:2017-12-31T23:59:59.0000000Z
    // sina: Date object
    const year = value.getUTCFullYear();
    const month = value.getUTCMonth() + 1;
    const day = value.getUTCDate();
    const hour = value.getUTCHours();
    const minute = value.getUTCMinutes();
    const seconds = value.getUTCSeconds();
    const microseconds = value.getUTCMilliseconds() * 1000;

    const result =
        addLeadingZeros(year.toString(), 4) +
        "-" +
        addLeadingZeros(month.toString(), 2) +
        "-" +
        addLeadingZeros(day.toString(), 2) +
        "T" +
        addLeadingZeros(hour.toString(), 2) +
        ":" +
        addLeadingZeros(minute.toString(), 2) +
        ":" +
        addLeadingZeros(seconds.toString(), 2) +
        "." +
        addLeadingZeros(microseconds.toString(), 7) +
        "Z";

    return result;
}

export function odata2SinaTime(value) {
    if (value.length === 0) {
        return "";
    }
    // odata: hh:mm:ss
    // sina: hh:mm:ss
    value = value.trim();
    return value;
}

export function sina2OdataTime(value) {
    if (value.length === 0) {
        return "";
    }
    // odata: hh:mm:ss
    // sina: hh:mm:ss
    return value;
}

export function odata2SinaDate(value) {
    if (value.length === 0) {
        return "";
    }

    // odata: YYYY-MM-DD
    // sina: YYYY/MM/DD
    value = value.trim();
    return value.slice(0, 4) + "/" + value.slice(5, 7) + "/" + value.slice(8, 10);
}

export function sina2OdataDate(value) {
    if (value.length === 0) {
        return "";
    }

    // odata: YYYY-MM-DD
    // sina: YYYY/MM/DD
    return value.slice(0, 4) + "-" + value.slice(5, 7) + "-" + value.slice(8, 10);
}

export function sina2OdataString(value, context) {
    return sinaUtil.convertOperator2Wildcards(value, context.operator);
}

export function addLeadingZeros(value, length) {
    return "00000000000000".slice(0, length - value.length) + value;
}
