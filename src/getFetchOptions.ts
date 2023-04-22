import type {APITarget, Request, FetchOptions} from './types';
import {escapeRegExp} from '../lib/excapeRegExp';
import {toStringValueMap} from '../lib/toStringValueMap';

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
    options: Request,
): FetchOptions {
    let [method, path] = target.split(/\s+/);

    if (options.params) {
        for (let [key, value] of Object.entries(options.params)) {
            if (value !== null && value !== undefined)
                path = path.replace(new RegExp(`:${escapeRegExp(key)}\\b`, 'g'), String(value));
        }
    }

    let url = new URL(path, endpoint);

    if (options.query) {
        for (let [key, value] of Object.entries(options.query)) {
            if (value !== null && value !== undefined)
                url.searchParams.append(key, String(value));
        }
    }

    return {
        method,
        url: url.href,
        headers: toStringValueMap(options.headers),
    };
}
