/**
 * An API target is any string that identifies the request. This target
 * is passed to the custom request handler that matches the target to
 * the request.
 *
 * For the sake of convenience (but not necessarily), a target string of
 * an HTTP API can be '${HTTPMethod} ${path}'. Here, the path can contain
 * colon-prefixed parameters corresponding to the request's `params` keys.
 *
 * @example (HTTP API) `'GET /'`, `'POST /item'`, `'GET /item/:id'`, etc.
 */
export type APITarget = string;

export type RequestSchema = void | {
    target?: APITarget;
    method?: string;
    service?: string;
    url?: string;
    path?: string;
    /**
     * URL path parameters
     * @example
     * `service.send('GET /item/:id', {params: {id: 10}});`
     * sends `GET /item/10`
     */
    params?: void | Record<string, unknown>;
    query?: void | Record<string, unknown>;
    headers?: void | Record<string, unknown>;
    body?: unknown;
};

export type ResponseSchema = {
    ok?: boolean;
    status?: number;
    statusText?: string;
    headers?: Record<string, unknown>;
    body?: unknown;
};

export type SchemaEntryShape = {
    request?: RequestSchema;
    response?: ResponseSchema;
};

export type SchemaEntry<T extends SchemaEntryShape = SchemaEntryShape> = T;
export type Schema<T extends Record<APITarget, SchemaEntry> = Record<APITarget, SchemaEntry>> = T;

export type AliasMap<S extends Schema> = Record<string, keyof S>;

export type RequestHandler = (
    target: APITarget,
    options: RequestSchema,
) => Promise<ResponseSchema>;

export type ResponseShape<T extends ResponseSchema | undefined> =
    T extends undefined
        ? Omit<ResponseSchema, 'body'>
        // adding response properties not explicitly defined by the schema
        : T & Omit<ResponseSchema, keyof T | 'body'>;

type RequestInitPolyfill = NonNullable<Parameters<typeof fetch>[1]>;

export type FetchOptions =
    Omit<RequestInitPolyfill, 'headers' | 'body'> & {
        url: string;
        headers?: Record<string, string>;
        body?: unknown;
    };

export type RequestErrorParams = {
    name?: string;
    message?: string;
    status?: number;
    statusText?: string;
    data?: unknown;
};
