/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AjaxClient, AjaxClientProperties } from "../../core/AjaxClient";
import { ajaxErrorFactory } from "./ajaxErrorFactory";
import { deprecatedAjaxErrorFactory } from "./ajaxErrorFactoryDeprecated";
import { createDefaultAjaxErrorFactory } from "../../core/defaultAjaxErrorFactory";

export function createAjaxClient(properties: AjaxClientProperties): AjaxClient {
    const defaultProperties: AjaxClientProperties = {
        errorFactories: [
            ajaxErrorFactory,
            deprecatedAjaxErrorFactory,
            createDefaultAjaxErrorFactory({ allowedStatusCodes: [200, 201, 204, 300] }),
        ],
        errorFormatters: [],
    };
    return new AjaxClient(Object.assign(defaultProperties, properties));
}
