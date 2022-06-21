export type OneOf<T, I = unknown> = T extends Array<I> ? T[number] : T;
export type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type Extend<T, X> = T & Omit<X, keyof T>;

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';

export type RequestCore = {
    method?: HTTPMethod;
    url?: string;
};

export type RequestExtension = {
    /**
     * URL path parameters
     * @example
     * `service.send('GET /item/:id', {params: {id: 10}});`
     * sends `GET /item/10`
     */
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: Record<string, unknown>;
};

export type Request<T extends RequestExtension = RequestExtension> =
    Extend<RequestCore, Extend<T, Pick<RequestExtension, 'body' | 'headers'>>>;

export type ResponseCore = {
    ok?: boolean;
    status?: number;
    statusText?: string;
};

export type ResponseExtension = {
    body?: unknown;
    headers?: Record<string, unknown>;
};

export type Response<T extends ResponseExtension = ResponseExtension> =
    Extend<ResponseCore, Extend<T, ResponseExtension>>;

export type SchemaEntry = {
    request?: Request;
    /**
     * Either a single common response shape for any request with the status
     * unrequired to be specified, or an array of response shapes corresponding
     * to different statuses with the status property required for each
     * response shape in the array.
     */
    response?: Response | Array<WithRequired<Response, 'status'>>;
    /**
     * An optional name allowing to define alias API methods as an
     * alternative to API target keys.
     * @example
     * ```
     * type CustomSchema = Schema<{
     *     'GET /items': {
     *         name: 'getItems',
     *         // request and response shapes
     *     }
     * }>;
     *
     * const service = new RequestService<CustomSchema>(url, fetchContent);
     * // defining an alias to `service.send('GET /items', options);`:
     * service.defineMethod('getItems', 'GET /items');
     * service.api.getItems(options);
     */
    name?: string;
};

/**
 * API Target
 *
 * An HTTP API target can be represented by the following template:
 * '${HTTPMethod} ${path}'. The path can contain colon-prefixed parameters
 * that will be filled in from the request's `params`.
 *
 * @example (HTTP API) 'GET /', 'POST /item', 'GET /item/:id', etc.
 */
export type APITarget = string;

export type Schema<T extends Record<APITarget, SchemaEntry> = Record<APITarget, SchemaEntry>> = T;

export type Callback = (options: Request) => Promise<Response>;

export type APIMap<S extends Schema> = {
    [T in keyof S as NonNullable<S[T]['name']>]: T;
};

export type APIMapEntry<S extends Schema> = [
    NonNullable<S[keyof S]['name']>,
    keyof S,
];

export type API<S extends Schema> = {
    [T in keyof S as NonNullable<S[T]['name']>]:
        (options: Request<NonNullable<S[T]['request']>>) => Promise<Response<OneOf<NonNullable<S[T]['response']>>>>
};
