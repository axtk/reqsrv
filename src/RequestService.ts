import type {
    AliasMap,
    APITarget,
    RequestHandler,
    RequestSchema,
    Schema,
} from './types';

export class RequestService<S extends Schema> {
    handler: RequestHandler | undefined;

    constructor(handler?: RequestHandler) {
        this.handler = handler;
    }

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
