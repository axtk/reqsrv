export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';
// more specifically: '^${HTTPMethod}\s+[\w:]+$' | '^[\w:]+$'
export type Target = string;
export type Extend<T, X> = T & Omit<X, keyof T>;

export type Request<T extends Record<string, unknown> = Record<string, unknown>> = {
    method?: HTTPMethod;
    url?: string;
} & Extend<T, {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: Record<string, unknown>;
}>;

export type Response<T extends Record<string, unknown> = Record<string, unknown>> = {
    ok?: boolean;
    status?: number;
    statusText?: string;
} & Extend<T, {
    body?: unknown;
    headers?: Record<string, unknown>;
}>;

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
