

// id: a unique identifier for this particular occurrence of the problem.
//     links: a links object containing the following members:
//          about: a link that leads to further details about this particular
//              occurrence of the problem.
//     status: the HTTP status code applicable to this problem, expressed as a string value.
//     code: an application-specific error code, expressed as a string value.
//     title: a short, human-readable summary of the problem that SHOULD NOT change
//          from occurrence to occurrence of the problem, except for purposes of localization.
//     detail: a human-readable explanation specific to this occurrence of the problem.
//          Like title, this field’s value can be localized.
//     source: an object containing references to the source of the error,
//          optionally including any of the following members:
//     pointer: a JSON Pointer [RFC6901] to the associated entity in the request
//          document [e.g. "/data" for a primary data object, or "/data/attributes/title"
//          for a specific attribute].
// parameter: a string indicating which URI query parameter caused the error.
//     meta

// toto si zjednodusujem
export interface JSONApiErrorObject {
    title: string;
    id?: string;
    status?: string;
    code?: string;
    detail?: string;
    meta?: object;
}

export interface JSONApiEnvelope {
    // MUST at least one of
    data?: JSONApiData | JSONApiData[] | null; // "primary data"
    errors?: JSONApiErrorObject[] | null;
    meta?: { [key: string]: any; }; // must be object
    // MAY
    jsonapi?: object;
    links?: object[];
    included?: JSONApiData[];
    //
    self?: any;
    related?: any;
    pagination?: any;
}

export interface JSONApiData {
    type: string;
    id: any;
    attributes: { [key: string]: any; };
    relationships?: {
        // Resource linkage MUST be represented as one of the following:
        // - null for empty to-one relationships.
        // - an empty array ([]) for empty to-many relationships.
        // - a single resource identifier object for non-empty to-one relationships.
        // - an array of resource identifier objects for non-empty to-many relationships.
        [key: string]: any;
    };
    meta?: { [key: string]: any; };
}

export const createJSONApiEnvelope = () => ({
    data: null, included: [], meta: {}
});