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
    method?: APITarget;
    service?: string;
    url?: string;
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

export type RequestHandler = (endpoint: string, target: APITarget, options: Request) => Promise<Response>;

export type SchemaEntry = {
    request?: Request;
    response?: Response;
    /**
     * An optional alias allowing to define typed API methods as an
     * alternative to API target keys.
     * @example
     * ```
     * type CustomSchema = Schema<{
     *     'GET /items': {
     *         alias: 'getItems',
     *         // request and response shapes
     *     }
     * }>;
     *
     * const service = new RequestService<CustomSchema>(url, fetchContent);
     * // defining an alias to `service.send('GET /items', options);`:
     * service.setAlias('getItems', 'GET /items');
     * service.api.getItems(options);
     */
    alias?: string;
};

export type Schema<T extends Record<APITarget, SchemaEntry> = Record<APITarget, SchemaEntry>> = T;

export type AliasMap<S extends Schema> = {
    [T in keyof S as NonNullable<S[T]['alias']>]: T;
};

export type AliasMapEntry<S extends Schema> = [
    NonNullable<S[keyof S]['alias']>,
    keyof S,
];

export type API<S extends Schema> = {
    [T in keyof S as NonNullable<S[T]['alias']>]:
        (options: Request<NonNullable<S[T]['request']>>) => Promise<Response<NonNullable<S[T]['response']>>>
};

export type RequestErrorOptions<T = unknown> = {
    status?: number;
    statusText?: string;
    data?: T;
};

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';
