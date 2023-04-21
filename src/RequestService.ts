import type {
    Schema,
    API,
    APITarget,
    AliasMap,
    AliasMapEntry,
    Request,
    Response,
    RequestHandler,
} from './types';

export class RequestService<S extends Schema> {
    endpoint: string;
    handler: RequestHandler | undefined;
    api: API<S>;

    constructor(endpoint: string, handler?: RequestHandler, apiMap?: Partial<AliasMap<S>>) {
        this.endpoint = endpoint;
        this.handler = handler;
        this.api = {} as API<S>;

        if (apiMap) this.setAliases(apiMap);
    }
    async send<T extends keyof S>(
        target: T,
        options: Request<NonNullable<S[T]['request']>>,
    ): Promise<Response<NonNullable<S[T]['response']>>> {
        if (!this.handler)
            throw new Error('Missing request handler');

        return this.handler(this.endpoint, target as APITarget, options as Request);
    }
    setAlias<T extends keyof S>(methodName: NonNullable<S[T]['alias']>, target: T): void {
        this.api[methodName] = this.send.bind(this, target) as API<S>[NonNullable<S[T]['alias']>];
    }
    setAliases(methodMap: Partial<AliasMap<S>>): void {
        for (let [methodName, target] of Object.entries(methodMap) as Array<AliasMapEntry<S>>)
            this.setAlias(methodName, target);
    }
    setHandler(handler: RequestHandler): void {
        this.handler = handler;
    }
}
