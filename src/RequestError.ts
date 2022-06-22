import {RequestErrorOptions} from './types';

export const REQUEST_ERROR_NAME = 'RequestError';

export class RequestError<T = unknown> extends Error {
    status: number | undefined;
    statusText: string | undefined;
    data: T | undefined;

    constructor({status, statusText, data}: RequestErrorOptions<T> = {}) {
        super(statusText ?? `code ${status ?? 'unspecified'}`);

        this.name = REQUEST_ERROR_NAME;
        this.status = status;
        this.statusText = statusText;
        this.data = data;

        // @see https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, RequestError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequestError);
        }
    }
}
