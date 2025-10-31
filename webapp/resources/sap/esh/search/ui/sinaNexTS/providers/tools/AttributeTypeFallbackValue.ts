/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
interface AttributeTypeFallbackValueInterface {
    Double: number;
    Integer: number;
    String: string;
    ImageUrl: string;
    ImageBlob: string;
    GeoJson: object;
    Date: string;
    Time: string;
    Timestamp: Date;
    Group: object;
    INAV2_SearchTerms: string;
    INAV2_SuggestionTerms: string;
}
export const AttributeTypeFallbackValue: AttributeTypeFallbackValueInterface = {
    Double: 0.0,
    Integer: 0,
    String: "",
    ImageUrl: "",
    ImageBlob: "",
    GeoJson: {},
    Date: "1970-01-01",
    Time: "00:00:00",
    Timestamp: new Date(0), // 1970-01-01T00:00:00.000Z Ground Zero timestamp
    Group: null,
    INAV2_SearchTerms: "",
    INAV2_SuggestionTerms: "",
};
