import {RequestErrorParams} from './types';

export const DEFAULT_REQUEST_ERROR_NAME = 'RequestError';
export const DEFAULT_REQUEST_ERROR_MESSAGE = 'Unspecified';

function getProp<K extends keyof RequestErrorParams>(
    x: unknown,
    key: K,
) {
    if (!x || typeof x !== 'object' || !(key in x))
        return undefined;
    return x[key as keyof typeof x] as RequestErrorParams[K];
}

export class RequestError extends Error {
    data: RequestErrorParams['data'];
    status: RequestErrorParams['status'];
    statusText: RequestErrorParams['statusText'];

    constructor(options: unknown) {
        let props: RequestErrorParams = {
            status: getProp(options, 'status'),
            statusText: getProp(options, 'statusText'),
            message: getProp(options, 'message'),
            name: getProp(options, 'name'),
            data: getProp(options, 'data'),
        };

        let statusMessage = [props.status, props.statusText]
            .filter(Boolean)
            .join(' ');

        super(props.message || statusMessage || DEFAULT_REQUEST_ERROR_MESSAGE);
        this.name = props.name ?? DEFAULT_REQUEST_ERROR_NAME;

        this.status = Number(props.status ?? 0);
        this.statusText = String(props.statusText ?? '');
        this.data = props.data;

        // @see https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, RequestError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequestError);
        }
    }
}
