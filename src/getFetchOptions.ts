import {escapeRegExp} from '../lib/excapeRegExp';
import {isAbsoluteURL} from '../lib/isAbsoluteURL';
import {toStringValueMap} from './toStringValueMap';
import type {APITarget, FetchOptions, RequestSchema} from './types';

/**
 * Transforms `RequestService` handler params to `fetch()` params and
 * returns the pair `[url, fetchOptions]`.
 *
 * It's assumed that the `target` parameter matches the pattern
 * `${HTTPMethod} ${path}` and may contain colon-prefixed placeholder
 * parameters corresponding to `options.params` (e.g. 'GET /items/:id').
 */
export function getFetchOptions(
    endpoint: string,
    target: APITarget,
    options: RequestSchema,
): [string, FetchOptions] {
    // parsing `target` if it matches the pattern of `${HTTPMethod} ${path}`
    let [targetMethod, targetPath] = /^[A-Z]+\s/.test(target) ? target.split(/\s+/) : [];

    let method = options?.method ?? targetMethod;
    let url = options?.url ?? options?.path ?? targetPath;

    let params = options?.params;
    let query = options?.query;

    if (url && params) {
        for (let [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined)
                url = url.replace(
                    new RegExp(`:${escapeRegExp(key)}\\b`, 'g'),
                    String(value),
                );
        }
    }

    let urlObject: URL;

    if (isAbsoluteURL(url))
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

    if (query) {
        for (let [key, value] of Object.entries(query)) {
            if (value !== null && value !== undefined)
                urlObject.searchParams.append(key, String(value));
        }
    }

    let fetchOptions: FetchOptions = {
        method,
        headers: toStringValueMap(options?.headers),
        body: options?.body,
    };

    return [urlObject.href, fetchOptions];
}
