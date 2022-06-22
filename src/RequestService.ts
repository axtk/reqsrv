import type {
    HTTPMethod,
    Schema,
    Callback,
    API,
    APIMap,
    APIMapEntry,
    Request,
    Response,
} from './types';

/** @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class RequestService<S extends Schema> {
    url: string;
    callback: Callback;
    api: API<S>;

    constructor(url: string, callback?: Callback, apiMap?: Partial<APIMap<S>>) {
        this.url = url;
        this.callback = callback?.bind(this);
        this.api = {} as API<S>;

        if (apiMap) this.defineMethods(apiMap);
    }
    async send<T extends keyof S>(
        target: T,
        options: Request<NonNullable<S[T]['request']>>,
    ): Promise<Response<NonNullable<S[T]['response']>>> {
        let {method, url, params = {}, query = {}} = options;

        if (/^[A-Z]+\s/.test(String(target)))
            [method, url] = String(target).split(/\s+/) as [HTTPMethod, ...string[]];
        else url = String(target);

        for (let [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined)
                url = url.replace(new RegExp(`:${escapeRegExp(key)}\\b`, 'g'), String(value));
        }

        let urlObject = new URL(url, this.url);
        for (let [key, value] of Object.entries(query)) {
            if (value !== null && value !== undefined)
                urlObject.searchParams.append(key, String(value));
        }

        return await this.callback({
            ...options,
            method,
            url: urlObject.href,
        }) as Response<NonNullable<S[T]['response']>>;
    }
    setCallback(callback: Callback): void {
        this.callback = callback;
    }
    defineMethod<T extends keyof S>(methodName: NonNullable<S[T]['name']>, target: T): void {
        this.api[methodName] = this.send.bind(this, target);
    }
    defineMethods(methodMap: Partial<APIMap<S>>): void {
        for (let [methodName, target] of Object.entries(methodMap) as Array<APIMapEntry<S>>)
            this.defineMethod(methodName, target);
    }
}
