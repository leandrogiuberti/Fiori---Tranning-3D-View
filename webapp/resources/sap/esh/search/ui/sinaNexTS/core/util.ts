/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/* eslint-disable no-useless-escape */

import { AttributeSemanticsType } from "../sina/AttributeSemanticsType";
import { ChartQuery } from "../sina/ChartQuery";
import { SearchResultSet } from "../sina/SearchResultSet";
import { SearchResultSetItemAttribute } from "../sina/SearchResultSetItemAttribute";
import { SearchResultSetItemAttributeBase } from "../sina/SearchResultSetItemAttributeBase";
import { SearchResultSetItemAttributeGroup } from "../sina/SearchResultSetItemAttributeGroup";
import { getText } from "../sina/i18n";
import { NoJSONDateError, TimeOutError } from "./errors";

export function hasOwnProperty<X extends object, Y extends PropertyKey>(
    obj: X,
    prop: Y
): obj is X & Record<Y, unknown> {
    return Object.prototype.hasOwnProperty.apply(obj, prop);
}

export function timeoutDecorator(originalFunction, timeout: number) {
    const decoratedFunction = function (...args) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        return new Promise(function (resolve, reject) {
            let outTimed = false;
            const timer = setTimeout(function () {
                outTimed = true;
                reject(new TimeOutError());
            }, timeout);

            return originalFunction.apply(that, args).then(
                function (response) {
                    // success
                    if (outTimed) {
                        return;
                    }
                    clearTimeout(timer);
                    resolve(response);
                },
                function (error) {
                    // error
                    if (outTimed) {
                        return;
                    }
                    clearTimeout(timer);
                    reject(error);
                }
            );
        });
    };
    return decoratedFunction;
}

export function refuseOutdatedResponsesDecorator(originalFunction) {
    let maxRequestId = 0;
    const decoratedFunction = function (...args) {
        const requestId = ++maxRequestId;
        return originalFunction.apply(this, args).then(
            function (response) {
                // success
                return new Promise(function (resolve) {
                    if (requestId !== maxRequestId) {
                        return; // --> ignore
                    }
                    resolve(response); // --> forward
                });
            },
            function (error) {
                // error
                return new Promise(function (resolve, reject) {
                    if (requestId !== maxRequestId) {
                        return; // --> ignore
                    }
                    reject(error); // --> forward
                });
            }
        );
    };
    decoratedFunction.abort = function () {
        ++maxRequestId;
    };
    return decoratedFunction;
}

export function getUrlParameter(name: string, url?: string): null | string {
    if (!url) {
        if (typeof window === "undefined") {
            return null;
        }
        url = window.location.href;
    }
    name = escapeRegExp(name);
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return "";
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function filterString(text: string, removeStrings: Array<string>): string {
    for (let i = 0; i < removeStrings.length; ++i) {
        const removeString = removeStrings[i];
        let index = 0;
        while (index >= 0) {
            index = text.indexOf(removeString);
            if (index >= 0) {
                text = text.slice(0, index) + text.slice(index + removeString.length);
            }
        }
    }
    return text;
}

export function generateTimestamp(): string {
    const pad = function (num, size) {
        const s = "000000000" + num;
        return s.substr(s.length - size);
    };
    const d = new Date();
    return (
        "" +
        d.getUTCFullYear() +
        pad(d.getUTCMonth() + 1, 2) +
        pad(d.getUTCDate(), 2) +
        pad(d.getUTCHours(), 2) +
        pad(d.getUTCMinutes(), 2) +
        pad(d.getUTCSeconds(), 2) +
        pad(d.getUTCMilliseconds(), 3)
    );
}

export class DelayedConsumer {
    timeDelay: number;
    consumer: () => void;
    consumerContext: unknown;
    objects: Array<unknown>;

    constructor(properties) {
        properties = properties || {};
        this.timeDelay = properties.timeDelay || 1000;

        this.consumer = properties.consumer || function () {};
        this.consumerContext = properties.consumerContext || null;
        this.objects = [];
    }

    add(obj): void {
        this.objects.push(obj);
        if (this.objects.length === 1) {
            setTimeout(this.consume.bind(this), this.timeDelay);
        }
    }

    consume(): void {
        this.consumer.apply(this.consumerContext, [this.objects]);
        this.objects = [];
    }
}

export function dateToJson(date: Date): {
    type: string;
    value: string;
} {
    return {
        type: "Timestamp",
        value: date.toJSON(),
    };
}

export function dateFromJson(jsonDate): Date {
    if (jsonDate.type !== "Timestamp") {
        throw new NoJSONDateError(getText("error.sina.noTimestampJsonDateError", [jsonDate]));
    }
    return new Date(jsonDate.value);
}

export function addPotentialNavTargets(resultSet: SearchResultSet): SearchResultSet {
    if (resultSet.items) {
        //not avilable with sample provider
        const items = resultSet.items;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            // process geo data
            item = addGeoDataIfAvailable(item);
            // process attributes
            const attributes = item.detailAttributes;
            for (let j = 0; j < attributes.length; j++) {
                const attribute = attributes[j];
                addPotentialNavTargetsToAttribute(attribute);
            }
        }
    }
    return resultSet;
}

function addPotentialNavTargetsToAttribute(attribute: SearchResultSetItemAttributeBase) {
    if (attribute instanceof SearchResultSetItemAttribute) {
        addPotentialNavTargetsToAttributeSimple(attribute);
    } else if (attribute instanceof SearchResultSetItemAttributeGroup) {
        addPotentialNavTargetsToAttributeGroup(attribute);
    }
}

function addPotentialNavTargetsToAttributeGroup(attribute: SearchResultSetItemAttributeGroup) {
    // simplified not recursive algorithm:
    // - groups are expanded only one level
    // - for group children attributes we just add navtargets for @semantics.url annotation
    for (const attributeMembership of attribute.attributes) {
        const attribute = attributeMembership.attribute;
        if (!(attribute instanceof SearchResultSetItemAttribute)) {
            continue;
        }
        const metadata = attribute.metadata;
        const sina = attribute.sina;
        const value = attribute.value;
        if (metadata.semantics == AttributeSemanticsType.HTTPURL) {
            attribute.setDefaultNavigationTarget(
                sina.createNavigationTarget({
                    text: value,
                    targetUrl: value,
                    target: "_blank",
                })
            );
        }
    }
}

function addPotentialNavTargetsToAttributeSimple(attribute: SearchResultSetItemAttribute) {
    const sina = attribute.sina;
    const value = attribute.value;
    const metadata = attribute.metadata;
    if (typeof value === "string" && attribute.metadata.type !== "ImageUrl") {
        const emails = value.match(
            /^[^\0-\x20,:;<>@\[\\\]^_`]+@[^\0-,.-@\[\\\]^_`\{\|\}~]+\.[^\0-,.-@\[\\\]^_`\{\|\}~]+$/g
        );
        const url = value.match(/^https?:\/\/(?=[^\/])\S+$/gi);
        if (metadata.semantics == AttributeSemanticsType.EmailAddress) {
            attribute.setDefaultNavigationTarget(
                sina.createNavigationTarget({
                    text: value,
                    targetUrl: "mailto:" + value,
                })
            );
        } else if (metadata.semantics == AttributeSemanticsType.PhoneNr) {
            attribute.setDefaultNavigationTarget(
                sina.createNavigationTarget({
                    text: value,
                    targetUrl: "tel:" + value,
                })
            );
        } else if (metadata.semantics == AttributeSemanticsType.HTTPURL) {
            attribute.setDefaultNavigationTarget(
                sina.createNavigationTarget({
                    text: value,
                    targetUrl: value,
                    target: "_blank",
                })
            );
        } else if (emails !== null && emails.length === 1) {
            attribute.setDefaultNavigationTarget(
                sina.createNavigationTarget({
                    text: emails[0],
                    targetUrl: "mailto:" + emails[0],
                })
            );
        } else if (url !== null && url[0].match(/\w\w\w/) !== null) {
            attribute.setDefaultNavigationTarget(
                sina.createNavigationTarget({
                    text: url[0],
                    targetUrl: url[0],
                    target: "_blank",
                })
            );
        }
    }
}

export function removePureAdvancedSearchFacets(resultSet: SearchResultSet): SearchResultSet {
    const dataSource = resultSet.sina.getDataSource(resultSet.query.filter.dataSource.id);

    for (let i = 0; i < resultSet.facets.length; i++) {
        const attributeId = (resultSet.facets[i].query as ChartQuery).dimension;
        const attributeMetaData = dataSource.attributeMetadataMap[attributeId];
        if (
            attributeMetaData &&
            attributeMetaData.usage.AdvancedSearch &&
            attributeMetaData.usage.Facet === undefined
        ) {
            resultSet.facets.splice(i, 1);
            i = i - 1;
        }
    }
    return resultSet;
}

export function isMapsAttribute(attribute, returnOnlyBool: boolean, i: number): boolean | unknown {
    let res = false;
    let lat, lon, latIndex, lonIndex, latAttribName, lonAttribName;
    const name = attribute.id;
    const val = attribute.value;
    if (name.match(/latitude/i) !== null) {
        if (!isNaN(val)) {
            latAttribName = name;
            lat = val;
            latIndex = i;
        }
        res = true;
    } else if (name.match(/longitude/i) !== null) {
        if (!isNaN(val)) {
            lonAttribName = name;
            lon = val;
            lonIndex = i;
        }
        res = true;
    } else if (name.match(/LOC_4326/)) {
        lonIndex = i;
        latIndex = i;
        const oLoc4326 = JSON.parse(val);
        const aCoordinates = oLoc4326.coordinates;
        if (aCoordinates && aCoordinates.length > 1) {
            lon = aCoordinates[0];
            lat = aCoordinates[1];
        }
        res = true;
    }

    if (returnOnlyBool === undefined || returnOnlyBool === true) {
        return res;
    }
    return {
        lat: lat,
        lon: lon,
        latAttribName: latAttribName,
        lonAttribName: lonAttribName,
        latIndex: latIndex,
        lonIndex: lonIndex,
    };
}

export function addGeoDataIfAvailable(itemData) {
    //augment with new geodata attribute
    let res, lat, lon, dataSource, latIndex, lonIndex;
    const attributes = itemData.detailAttributes;
    for (let i = 0; i < attributes.length; i++) {
        res = isMapsAttribute(attributes[i], false, i);
        lat = res.lat ? res.lat : lat;
        lon = res.lon ? res.lon : lon;
        latIndex = res.latIndex ? res.latIndex : latIndex;
        lonIndex = res.lonIndex ? res.lonIndex : lonIndex;

        if (lat && lon) {
            break;
        }
    }
    if (lat && lon) {
        //remove lat and long from searchRsultITems

        if (latIndex === lonIndex) {
            attributes.splice(latIndex, 1);
        } else if (latIndex > lonIndex) {
            attributes.splice(latIndex, 1);
            attributes.splice(lonIndex, 1);
        } else {
            attributes.splice(lonIndex, 1);
            attributes.splice(latIndex, 1);
        }

        const newMetadata = {
            sina: itemData.sina,
            type: "GeoJson",
            id: "LOC_4326",
            label: "LOC_4326",
            isCurrency: false,
            IsBoolean: false,
            IsKey: false,
            IsSortable: true,
            isUnitOfMeasure: false,
            semanticObjectType: [],
            usage: {
                Map: "coordinates",
            },
        };
        //creaate new attribute and check whtether geojson metadata exists
        const valStr = '{ "type": "Point", "coordinates": [' + lon + ", " + lat + ", 0] }";
        const newAttribute = {
            id: "LOC_4326",
            label: "LOC_4326",
            isHighlighted: false,
            value: valStr,
            valueFormatted: valStr,
            valueHighlighted: itemData.sina,
            metadata: newMetadata,
            sina: itemData.sina,
        };
        attributes.push(newAttribute);

        dataSource = itemData.sina.getDataSource(itemData.dataSource.id);
        if (!dataSource.attributeMetadataMap.LOC_4326) {
            dataSource.attributesMetadata.push(newMetadata);
            dataSource.attributeMetadataMap.LOC_4326 = newMetadata;
        } else {
            dataSource.attributeMetadataMap.LOC_4326.type = "GeoJson";
            dataSource.attributeMetadataMap.LOC_4326.usage = {
                Map: "coordinates",
            };
        }
    }
    return itemData;
}

export function cacheDecorator(originalFunction) {
    const map = {};
    return function (id) {
        if (Object.prototype.hasOwnProperty.call(map, id)) {
            return map[id];
        }
        const value = originalFunction.apply(this, [id]);
        map[id] = value;
        return value;
    };
}

export function escapeRegExp(str: string): string {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function evaluateTemplate(template: string, obj: Record<string, string>): string {
    const placeholderRegExp = new RegExp("{{([^{}]*)}}");
    const getProperty = function (template: string): string | null {
        const match = placeholderRegExp.exec(template);
        if (!match) {
            return null;
        }
        return match[1];
    };

    const replaceProperty = function (template: string, property: string, value: string): string {
        const propertyRegExp = new RegExp("{{" + escapeRegExp(property) + "}}", "g");
        template = template.replace(propertyRegExp, value);
        return template;
    };

    const execute = function (template: string): string {
        const property = getProperty(template);
        if (!property) {
            return template;
        }
        template = replaceProperty(template, property, obj[property]);
        return execute(template);
    };

    return execute(template);
}

export const extractRegExp = new RegExp("<b>(.*?)<\\/b>", "g");

export function extractHighlightedTerms(text: string): Array<string> {
    let match;
    const result = [];
    do {
        match = extractRegExp.exec(text);
        if (match) {
            result.push(match[1]);
        }
    } while (match);
    return result;
}

export function appendRemovingDuplicates(list1, list2): void {
    for (let i = 0; i < list2.length; ++i) {
        const element = list2[i];
        if (list1.indexOf(element) < 0) {
            list1.push(element);
        }
    }
}

const reservedCharacters: string[] = ["\\", "-", "(", ")", "~", "^", "?", '"', ":", "'", "[", "]"];
const reservedWords: string[] = ["AND", "OR", "NOT"];
const reservedCharacters4FilterCondition: string[] = ["\\", '"', "*", "?", "'"];

function replaceAll(original: string, search: string, replacement: string): string {
    return original.split(search).join(replacement);
}

export function escapeQuery(query: string): string {
    let escapedQuery: string = query.trim();

    for (const specialCharacter of reservedCharacters) {
        if (specialCharacter === "'") {
            escapedQuery = replaceAll(escapedQuery, specialCharacter, "''");
        } else {
            escapedQuery = replaceAll(escapedQuery, specialCharacter, "\\" + specialCharacter);
        }
    }
    for (const specialWord of reservedWords) {
        if (escapedQuery === specialWord) {
            escapedQuery = '"' + specialWord + '"';
        }
        if (escapedQuery.startsWith(specialWord + " ")) {
            escapedQuery = '"' + specialWord + '" ' + escapedQuery.substring(specialWord.length + 1);
        }
        if (escapedQuery.endsWith(" " + specialWord)) {
            escapedQuery =
                escapedQuery.substring(0, escapedQuery.length - (specialWord.length + 1)) +
                ' "' +
                specialWord +
                '"';
        }
        escapedQuery = replaceAll(escapedQuery, " " + specialWord + " ", ' "' + specialWord + '" ');
    }

    if (escapedQuery === "") {
        escapedQuery = "*";
    }
    return escapedQuery;
}

export function escapeFilterCondition(query: string): string {
    let escapedQuery: string = query.trim();

    for (const specialCharacter of reservedCharacters4FilterCondition) {
        if (specialCharacter === "'") {
            escapedQuery = replaceAll(escapedQuery, specialCharacter, "''");
        } else {
            escapedQuery = replaceAll(escapedQuery, specialCharacter, "\\" + specialCharacter);
        }
    }

    if (escapedQuery === "") {
        escapedQuery = "*";
    }
    return escapedQuery;
}
