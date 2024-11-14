import type {
    AliasMap,
    APITarget,
    RequestHandler,
    RequestSchema,
    Schema,
} from './types';

export class RequestService<S extends Schema> {
    handler: RequestHandler | undefined;

    /**
     * Accepts a request handler as a parameter, which might be
     * highly dependent on particular use-cases and the environment.
     */
    constructor(handler?: RequestHandler) {
        this.handler = handler;
    }

    /**
     * Sends a request to the `target` specified in the
     * `RequestService`'s schema.
     */
    send<T extends keyof S>(
        target: T,
        options: S[T]['request'],
    ) {
        if (!this.handler)
            throw new Error('Missing request handler');

        return this.handler(target as APITarget, options!) as Promise<S[T]['response']>;
    }

    /**
     * Sets the request handler.
     */
    use(handler: RequestHandler): void {
        this.handler = handler;
    }

    /**
     * Returns a map of aliases to the schema methods.
     *
     * @example
     * ```
     * let service = new RequestService<CustomSchema>(handler);
     * let api = service.assign({
     *     getItem: 'GET /items/:id',
     * });
     *
     * service.send('GET /items/:id', {
     *     params: {id: 1},
     * });
     * // the above call is now equivalent to:
     * api.getItem({params: {id: 1}});
     * ```
     */
    assign<T extends AliasMap<S>>(aliasMap: T) {
        let api: Record<string, unknown> = {};

        for (let [methodName, target] of Object.entries(aliasMap))
            api[methodName] = (options: RequestSchema) => {
                return this.send(target, options);
            };

        return api as {
            [K in keyof T]: (options: S[T[K]]['request']) => Promise<S[T[K]]['response']>;
        };
    }
}
