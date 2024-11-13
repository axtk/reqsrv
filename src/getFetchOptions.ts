import {escapeRegExp} from '../lib/excapeRegExp';
import {isAbsoluteURL} from '../lib/isAbsoluteURL';
import {toStringValueMap} from './toStringValueMap';
import type {APITarget, FetchOptions, Request} from './types';

/**
 * Transforms `RequestService` handler params to `fetch()` options.
 *
 * It's assumed that the `target` parameter matches the pattern
 * `${HTTPMethod} ${path}` and may contain colon-prefixed placeholder
 * parameters corresponding to `options.params` (e.g. 'GET /items/:id').
 */
export function getFetchOptions(
    endpoint: string,
    target: APITarget,
    options: Request = {},
): FetchOptions {
    // parsing `target` if it matches the pattern of `${HTTPMethod} ${path}`
    let [targetMethod, targetPath] = /^[A-Z]+\s/.test(target) ? target.split(/\s+/) : [];

    let method = options.method ?? targetMethod;
    let url = options.url ?? options.path ?? targetPath;

    if (url && options.params) {
        for (let [key, value] of Object.entries(options.params)) {
            if (value !== null && value !== undefined)
                url = url.replace(new RegExp(`:${escapeRegExp(key)}\\b`, 'g'), String(value));
        }
    }

    let urlObject: URL;

    if (isAbsoluteURL(url))
        urlObject = new URL(url);
    else {
        urlObject = new URL(endpoint);

        if (url) {
            let path = urlObject.pathname;

            if (path && !path.endsWith('/') && !/^[?#/]/.test(url))
                path += '/';

            urlObject.pathname = path + url;
        }
    }

    if (options.query) {
        for (let [key, value] of Object.entries(options.query)) {
            if (value !== null && value !== undefined)
                urlObject.searchParams.append(key, String(value));
        }
    }

    return {
        method,
        url: urlObject.href,
        headers: toStringValueMap(options.headers),
    };
}
