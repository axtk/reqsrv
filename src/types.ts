export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';

export type Target = string;
// HTTP API Targets:
// template: '${HTTPMethod} ${path}'
// examples: 'GET /', 'POST /item', 'GET /item/:id', etc.

export type Extend<T, X> = T & Omit<X, keyof T>;

export type RequestCore = {
    method?: HTTPMethod;
    url?: string;
};

export type RequestExtension = {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: Record<string, unknown>;
};

export type Request<T extends RequestExtension = RequestExtension> =
    RequestCore & Extend<T, Pick<RequestExtension, 'body' | 'headers'>>;

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
    ResponseCore & Extend<T, ResponseExtension>;

export type SchemaEntry = {
    name?: string;
    request?: Request;
    response?: Response;
};

export type Schema<T extends Record<Target, SchemaEntry> = Record<Target, SchemaEntry>> = T;
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
        (options: Request<NonNullable<S[T]['request']>>) => Promise<Response<NonNullable<S[T]['response']>>>
};
