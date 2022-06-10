export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT';

// more specifically: '^${HTTPMethod}\s+[\w:]+$' | '^[\w:]+$'
export type Target = string;

export type Request = {
    method?: HTTPMethod;
    url?: string;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: Record<string, unknown>;
    [key: string]: unknown;
};

export type Response = {
    ok?: boolean;
    status?: number;
    statusText?: string;
    body?: unknown;
    headers?: Record<string, unknown>;
    [key: string]: unknown;
};

export type SchemaEntry = {
    name?: string;
    request?: Request;
    response?: Response;
};

export type Schema = Record<Target, SchemaEntry>;
export type Callback = (options: Request) => Promise<Response>;

export type APIMap<S extends Schema, T extends keyof S = keyof S> = Record<S[T]['name'], T>;
export type API<S extends Schema, T extends keyof S = keyof S> =
    Record<S[T]['name'], (options: S[T]['request']) => Promise<S[T]['response']>>;
