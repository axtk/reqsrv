import {escapeRegExp} from '../lib/escapeRegExp';
import {isAbsoluteURL} from '../lib/isAbsoluteURL';
import type {APITarget, RequestSchema} from './types';

export type ExtendOptionsParams = {
    endpoint: string;
    target?: APITarget;
};

/** Non-voidable `RequestSchema` with a non-optional `url`. */
export type ExtendedRequestSchema = Omit<Exclude<RequestSchema, void>, 'url'> & {
    url: string;
};

/**
 * Transforms `RequestService` handler params to `fetch()` params and
 * returns the pair `[url, fetchOptions]`.
 *
 * It's assumed that the `target` parameter matches the pattern
 * `${HTTPMethod} ${path}` and may contain colon-prefixed placeholder
 * parameters corresponding to `options.params` (e.g. 'GET /items/:id').
 */
export function extendOptions(options: RequestSchema, {
    target,
    endpoint,
}: ExtendOptionsParams): ExtendedRequestSchema {
    let method = options?.method;
    let url = options?.url ?? options?.path;

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

    let query = options?.query;
    let params = options?.params;

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
        ...options,
        method,
        url: urlObject.href,
    };
}
