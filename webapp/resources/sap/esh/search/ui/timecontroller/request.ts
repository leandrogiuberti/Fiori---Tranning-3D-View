/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export interface Request<Response> {
    execute: () => Promise<Response>;
    equals: (other: Request<Response>) => boolean;
    clone: () => Request<Response>;
}
