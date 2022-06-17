export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';
// more specifically: '^${HTTPMethod}\s+[\w:]+$' | '^[\w:]+$'
export type Target = string;
export type Extend<T, X> = T & Omit<X, keyof T>;

type RequestCore = {
    method?: HTTPMethod;
    url?: string;
};

type RequestExtension = {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: Record<string, unknown>;
};

export type Request<T extends RequestExtension = RequestExtension> =
    RequestCore & Extend<T, Pick<RequestExtension, 'body' | 'headers'>>;

type ResponseCore = {
    ok?: boolean;
    status?: number;
    statusText?: string;
};

type ResponseExtension = {
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

export type Schema = Record<Target, SchemaEntry>;
export type Callback = (options: Request) => Promise<Response>;

export type APIMap<S extends Schema> = {
    [T in keyof S as NonNullable<S[T]['name']>]: T;
};
export type APIMapEntry<S extends Schema> = [
    NonNullable<S[keyof S]['name']>,
    keyof S,
];
export type API<S extends Schema> = {
    [T in keyof S as NonNullable<S[T]['name']>]: (options: Request<S[T]['request']>) => Promise<Response<S[T]['response']>>
};
