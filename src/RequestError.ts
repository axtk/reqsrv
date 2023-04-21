export const DEFAULT_REQUEST_ERROR_NAME = 'RequestError';
export const DEFAULT_REQUEST_ERROR_MESSAGE = 'Unspecified';

export class RequestError<T extends object = {}> extends Error {
    data: T | undefined;
    status: number | undefined;
    statusText: string | undefined;

    constructor(data: T) {
        let name, message, status, statusText;

        if (data) {
            if ('status' in data)
                status = Number(data.status);
            if ('statusText' in data)
                statusText = String(data.statusText);
        }

        if (data) {
            if ('name' in data)
                name = String(data.name);
            if ('message' in data)
                message = String(data.message);
        }

        if (!message && (status !== undefined || statusText !== undefined))
            message = [status, statusText].filter(Boolean).join(' ');

        super(message ?? DEFAULT_REQUEST_ERROR_MESSAGE);

        this.name = name ?? DEFAULT_REQUEST_ERROR_NAME;
        this.data = data;

        this.status = status;
        this.statusText = statusText;

        // @see https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, RequestError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequestError);
        }
    }
}
