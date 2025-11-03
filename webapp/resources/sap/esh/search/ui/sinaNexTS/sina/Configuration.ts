/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { Provider as ABAPODataProvider } from "../providers/abap_odata/Provider";
import { Provider as INAV2Provider } from "../providers/inav2/Provider";

export interface ConfigurationOptions extends SinaObjectProperties {
    personalizedSearch: boolean;
    isPersonalizedSearchEditable: boolean;
}
export class Configuration extends SinaObject {
    // _meta: {
    //     properties: {
    //         personalizedSearch: {
    //             required: true,
    //             setter: true
    //         },
    //         isPersonalizedSearchEditable: {
    //             required: true
    //         }
    //     }
    // }

    personalizedSearch: boolean;
    isPersonalizedSearchEditable: boolean;

    setPersonalizedSearch(personalizedSearch: boolean): void {
        this.personalizedSearch = personalizedSearch;
    }

    constructor(properties: ConfigurationOptions) {
        super(properties);
        this.personalizedSearch = properties.personalizedSearch ?? this.personalizedSearch;
        this.isPersonalizedSearchEditable =
            properties.isPersonalizedSearchEditable ?? this.isPersonalizedSearchEditable;
    }

    async resetPersonalizedSearchDataAsync(): Promise<unknown> {
        if (this.sina.provider instanceof INAV2Provider || this.sina.provider instanceof ABAPODataProvider) {
            return this.sina.provider.resetPersonalizedSearchDataAsync();
        }
    }

    async saveAsync(): Promise<unknown> {
        if (this.sina.provider instanceof INAV2Provider || this.sina.provider instanceof ABAPODataProvider) {
            return this.sina.provider.saveConfigurationAsync(this);
        }
    }
}
