/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AjaxClient, AjaxClientProperties } from "../../core/AjaxClient";
import { createDefaultAjaxErrorFactory } from "../../core/defaultAjaxErrorFactory";
import { ajaxErrorFactory } from "./ajaxErrorFactory";

export function createAjaxClient(properties: AjaxClientProperties): AjaxClient {
    const defaultProperties: AjaxClientProperties = {
        csrf: true,
        csrfByPassCache: true,
        errorFactories: [ajaxErrorFactory, createDefaultAjaxErrorFactory()],
    };
    return new AjaxClient(Object.assign(defaultProperties, properties));
}
