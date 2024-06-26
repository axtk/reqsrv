export type Extend<T, X> = T & Omit<X, keyof T>;

/**
 * An API target is any string that identifies the request. This target
 * is passed to the custom request handler that matches the target to
 * the request.
 *
 * An HTTP API target can be represented by the following template:
 * '${HTTPMethod} ${path}'. The path can contain colon-prefixed parameters
 * that will be filled in from the request's `params`.
 *
 * @example (HTTP API) 'GET /', 'POST /item', 'GET /item/:id', etc.
 */
export type APITarget = string;

export type RequestCore = {
    target?: APITarget;
    method?: string;
    service?: string;
    url?: string;
    path?: string;
};

export type RequestShape = {
    /**
     * URL path parameters
     * @example
     * `service.send('GET /item/:id', {params: {id: 10}});`
     * sends `GET /item/10`
     */
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    body?: unknown;
};

export type Request<T extends RequestShape = RequestShape> =
    Extend<RequestCore, Extend<T, Pick<RequestShape, 'body' | 'headers'>>>;

export type ResponseCore = {
    ok?: boolean;
    status?: number;
    statusText?: string;
};

export type ResponseShape = {
    headers?: Record<string, unknown>;
    body?: unknown;
};

export type Response<T extends ResponseShape = ResponseShape> =
    Extend<ResponseCore, Extend<T, ResponseShape>>;

export type RequestHandler = (target: APITarget, options: Request) => Promise<Response>;

export type SchemaEntry = {
    request?: Request;
    response?: Response;
};

export type Schema<T extends Record<APITarget, SchemaEntry> = Record<APITarget, SchemaEntry>> = T;

export type AliasMap<S extends Schema> = Record<string, keyof S>;

export type RequestErrorOptions<T = unknown> = {
    status?: number;
    statusText?: string;
    data?: T;
};

export type HTTPMethod =
    | 'GET'
    | 'POST'
    | 'PATCH'
    | 'PUT'
    | 'DELETE'
    | 'OPTIONS'
    | 'HEAD'
    | 'TRACE'
    | 'CONNECT';

export type FetchOptions = {
    method?: string;
    url: string;
    headers?: Record<string, string>;
};
