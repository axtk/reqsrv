import type {
    AliasMap,
    APITarget,
    Request,
    RequestHandler,
    Response,
    Schema,
} from './types';

export class RequestService<S extends Schema> {
    handler: RequestHandler | undefined;

    constructor(handler?: RequestHandler) {
        this.handler = handler;
    }

    send<T extends keyof S>(
        target: T,
        options: Request<NonNullable<S[T]['request']>>,
    ) {
        if (!this.handler)
            throw new Error('Missing request handler');

        return this.handler(
            target as APITarget,
            options as Request,
        ) as Promise<Response<NonNullable<S[T]['response']>>>;
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
            api[methodName] = this.send.bind(this, target);

        return api as {
            [K in keyof T]: (
                options: Request<NonNullable<S[T[K]]['request']>>,
            ) => Promise<Response<NonNullable<S[T[K]]['response']>>>;
        };
    }
}
