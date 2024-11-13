export const DEFAULT_REQUEST_ERROR_NAME = 'RequestError';
export const DEFAULT_REQUEST_ERROR_MESSAGE = 'Unspecified';

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

    constructor(params: T | void) {
        let statusMessage = [params?.status, params?.statusText]
            .filter(Boolean)
            .join(' ');

        super(params?.message || statusMessage || DEFAULT_REQUEST_ERROR_MESSAGE);
        this.name = params?.name ?? DEFAULT_REQUEST_ERROR_NAME;

        this.status = Number(params?.status ?? 0);
        this.statusText = String(params?.statusText ?? '');
        this.data = params?.data;

        // @see https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, RequestError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequestError);
        }
    }
}
