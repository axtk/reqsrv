import type {
    Schema,
    APITarget,
    AliasMap,
    Request,
    Response,
    RequestHandler,
} from './types';

export class RequestService<S extends Schema> {
    endpoint: string;
    handler: RequestHandler | undefined;

    constructor(endpoint: string, handler?: RequestHandler) {
        this.endpoint = endpoint;
        this.handler = handler;
    }
    async send<T extends keyof S>(
        target: T,
        options: Request<NonNullable<S[T]['request']>>,
    ): Promise<Response<NonNullable<S[T]['response']>>> {
        if (!this.handler)
            throw new Error('Missing request handler');

        return this.handler(this.endpoint, target as APITarget, options as Request);
    }
    setHandler(handler: RequestHandler): void {
        this.handler = handler;
    }
    assign<T extends AliasMap<S>>(aliasMap: T) {
        let api: Record<string, unknown> = {};

        for (let [methodName, target] of Object.entries(aliasMap))
            api[methodName] = this.send.bind(this, target);

        return api as {
            [K in keyof T]: (options: Request<NonNullable<S[T[K]]['request']>>) => Promise<Response<NonNullable<S[T[K]]['response']>>>;
        };
    }
}
