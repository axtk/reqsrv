export const DEFAULT_REQUEST_ERROR_NAME = 'RequestError';
export const DEFAULT_REQUEST_ERROR_MESSAGE = 'Unspecified';

function getProp<T>(x: object | void | undefined, prop: string): T | undefined {
    return x && (prop in x) ? x[prop as keyof typeof x] as T : undefined;
}

export type RequestErrorParams = {
    name?: string;
    message?: string;
    status?: number;
    statusText?: string;
    data?: unknown;
};

export class RequestError<T extends RequestErrorParams = {}> extends Error {
    data: RequestErrorParams['data'];
    status: RequestErrorParams['status'];
    statusText: RequestErrorParams['statusText'];

    constructor(params: T | Error | void) {
        let status = getProp(params, 'status');
        let statusText = getProp(params, 'statusText');
        let statusMessage = [status, statusText].filter(Boolean).join(' ');

        super(params?.message || statusMessage || DEFAULT_REQUEST_ERROR_MESSAGE);
        this.name = params?.name ?? DEFAULT_REQUEST_ERROR_NAME;

        this.status = Number(status ?? 0);
        this.statusText = String(statusText ?? '');
        this.data = getProp(params, 'data');

        // @see https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, RequestError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequestError);
        }
    }
}
