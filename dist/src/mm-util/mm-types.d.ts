export interface JSONApiErrorObject {
    title: string;
    id?: string;
    status?: string;
    code?: string;
    detail?: string;
    meta?: object;
}
export interface JSONApiEnvelope {
    data?: JSONApiData | JSONApiData[] | null;
    errors?: JSONApiErrorObject[] | null;
    meta?: {
        [key: string]: any;
    };
    jsonapi?: object;
    links?: object[];
    included?: JSONApiData[];
    self?: any;
    related?: any;
    pagination?: any;
}
export interface JSONApiData {
    type: string;
    id: any;
    attributes: {
        [key: string]: any;
    };
    relationships?: {
        [key: string]: any;
    };
    meta?: {
        [key: string]: any;
    };
}
export declare const createJSONApiEnvelope: () => {
    data: any;
    included: any[];
    meta: {};
};
