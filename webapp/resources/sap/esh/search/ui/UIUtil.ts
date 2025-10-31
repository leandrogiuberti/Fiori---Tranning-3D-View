/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export function registerHandler(
    key: string,
    elements: Array<Element>,
    event: string,
    handler: EventListener
): Array<Element> {
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        if (element["es_" + key]) {
            continue;
        }
        element.addEventListener(event, handler);
        element["es_" + key] = true;
    }
    return elements;
}
