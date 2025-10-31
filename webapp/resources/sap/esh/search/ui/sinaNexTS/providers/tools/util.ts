/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ServerError } from "../../core/errors";
import { Log } from "../../core/Log";
import { ResultSet } from "../../sina/ResultSet";

type Fetcher<ResponseType> = () => Promise<ResponseType>;
type Parser<ResultSetType extends ResultSet, ResponseType> = (
    response: ResponseType
) => Promise<ResultSetType>;

export async function handleError<ResultSetType extends ResultSet, ResponseDataType>(
    fetcher: Fetcher<ResponseDataType>,
    parser: Parser<ResultSetType, ResponseDataType>
): Promise<ResultSetType> {
    //
    async function doHandleError(error: Error): Promise<ResultSetType> {
        let serverError: ServerError;
        switch (error.name) {
            case "ServerError":
                serverError = error as ServerError;
                if (!serverError.response.dataJSON) {
                    throw error;
                }
                try {
                    const resultSet = await parser(serverError.response.dataJSON as ResponseDataType);
                    resultSet.addError(error);
                    return resultSet;
                } catch (parseError) {
                    const log = new Log("error handle util");
                    log.warn("Error while parsing error response: " + parseError);
                    throw error;
                }
            default:
                throw error;
        }
    }
    let response: ResponseDataType;
    try {
        response = await fetcher();
    } catch (e) {
        return await doHandleError(e);
    }
    return await parser(response);
}
