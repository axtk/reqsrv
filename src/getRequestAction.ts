import {escapeRegExp} from '../lib/escapeRegExp';
import {isAbsoluteURL} from '../lib/isAbsoluteURL';
import type {APITarget, RequestSchema, RequestAction} from './types';

export type GetRequestActionParams = {
    request: RequestSchema,
    target: APITarget;
    endpoint: string;
};

/**
 * Returns `{method, url}` from the given request options.
 *
 * This utility function also produces a full request URL:
 * - by parsing `target` if it matches the pattern
 *   `${HTTPMethod} ${path}`;
 * - by filling out colon-prefixed placeholders, it there are any
 *   (e.g. '/items/:id'), with values from `request.params`;
 * - by adding `request.query` params.
 */
export function getRequestAction({
    request,
    target,
    endpoint,
}: GetRequestActionParams): RequestAction {
    let method = request?.method;
    let url = request?.url ?? request?.path;

    // parsing `target` if it matches the pattern of `${HTTPMethod} ${path}`
    if (target && /^[A-Z]+\s/.test(target)) {
        let [targetMethod, targetPath] = target.split(/\s+/);

        if (!method)
            method = targetMethod;

        if (!url)
            url = targetPath;
    }

    let urlObject: URL;

    if (url && isAbsoluteURL(url))
        urlObject = new URL(url);
    else {
        urlObject = new URL(endpoint);

        if (url) {
            let path = urlObject.pathname;

            if (!path)
                urlObject.pathname = url;

            if (path.endsWith('/'))
                path = path.slice(0, -1);

            if (url.startsWith('/'))
                url = url.slice(1);

            urlObject.pathname = path + '/' + url;
        }
    }

    let query = request?.query;
    let params = request?.params;

    if (query) {
        for (let [key, value] of Object.entries(query)) {
            if (value !== null && value !== undefined)
                urlObject.searchParams.append(key, String(value));
        }
    }

    if (params) {
        for (let [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined)
                urlObject.pathname = urlObject.pathname.replace(
                    new RegExp(`:${escapeRegExp(key)}\\b`, 'g'),
                    String(value),
                );
        }
    }

    return {
        method,
        url: urlObject.href,
    };
}
