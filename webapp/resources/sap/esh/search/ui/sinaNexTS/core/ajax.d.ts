declare module "sap/esh/search/ui/sinaNexTS/core/ajax" {
    import { SinaError } from "sap/esh/search/ui/sinaNexTS/core/errors";
    interface RequestProperties {
        data?: string;
        headers?: Record<string, string>;
        url: string;
        parameters?: Record<string, unknown>;
        method: string;
        cookies?: string;
    }
    type RequestFormatter = (request: RequestProperties) => RequestProperties;
    interface ResponseProperties {
        data: string;
        dataJSON?: JSONValue;
        headers: Record<string, string | string[]>;
        status: number;
        statusText: string;
    }
    interface JSONResponseProperties {
        data: JSONValue;
        headers: Record<string, string | string[]>;
        status: number;
        statusText: string;
    }
    type JSONValue = string | number | boolean | {
        [x: string]: JSONValue;
    } | Array<JSONValue>;
    type ResponseFormatter = (request: RequestProperties, response: ResponseProperties) => ResponseProperties;
    type AjaxErrorFormatter = (request: RequestProperties, response: ResponseProperties, error: SinaError) => SinaError;
    function request(properties: RequestProperties): Promise<ResponseProperties>;
    type AjaxErrorFactory = (request: RequestProperties, response: ResponseProperties) => SinaError;
    function applyResponseFormattersAndUpdateJSON(request: RequestProperties, response: ResponseProperties, formatters: Array<ResponseFormatter>): ResponseProperties;
}
//# sourceMappingURL=ajax.d.ts.map