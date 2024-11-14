# reqsrv

*Utilities for typing web APIs*

## Features

- type-safe request handlers based on a custom API schema;
- common environment-agnostic interface for handling API requests;
- no internal dependence on a specific request utility.

## Usage

The `RequestService` class helps create a type-safe entrypoint to an API:

```ts
import {RequestService} from 'reqsrv';

let service = new RequestService<CustomSchema>(fetchContent);
```

The constructor accepts a custom request handler `fetchContent`. It's not predefined by the package, since it can vary in many ways depending on the purpose and environment of the application (it might make use of `fetch`, `node-fetch`, `axios`, `grpc-js`, logging, default headers, or whatever necessary).

The `CustomSchema` type used with the constructor is a custom schema outlining the types of requests and responses within an API, see the example below of what such a schema may look like.

```ts
import type {Schema} from 'reqsrv';

// wrapping into the `Schema` generic type is optional, but
// this helps validate the basic schema structure
export type CustomSchema = Schema<{
    // a schema key can be any unique string, for an HTTP API
    // a pair of a method and a path can serve this purpose
    'GET /items/:id': {
        request: {
            // `params` can be omitted if the URL path is fixed and
            // has no parameter placeholders
            params: {
                id: number;
            };
            query?: {
                mode?: 'compact' | 'full';
            };
        };
        response: {
            body: {
                id: number;
                name?: string;
            };
        };
    };
    'POST /items/:id': {
        // ...
    };
    'GET /items': {
        // ...
    };
    // ... and so forth
}>;
```

With such a schema assigned to `service`, calls to its `send()` method will be prevalidated against this schema (which means that a type-aware IDE will warn of type mismatches or typos in the parameters):

```ts
let {ok, status, body} = await service.send('GET /items/:id', {
    params: {
        id: 10,
    },
    query: {
        mode: 'full',
    },
});
```

The options passed as the second parameter to `send()` are validated as `CustomSchema['GET /items/:id']` (based on the schema type passed to the `RequestService` constructor and the first parameter passed to `send()`).

### Assigning custom method names to API targets

Schema keys can be mapped to new methods:

```ts
let api = service.assign({
    getItems: 'GET /items',
    getItem: 'GET /items/:id',
    setItem: 'POST /items/:id',
});
```

With such a mapping in place, `service.send('GET /items/:id', {...})` has another equivalent form:

```ts
let response = await api.getItem({
    params: {
        id: 10,
    },
    query: {
        mode: 'full',
    },
});
```

The `assign()` method doesn't have to take all the API schema keys at once. The API methods can be split into logical subsets and arranged in different namespaces:

```ts
let api = {
    users: service.assign({
        getList: 'GET /users',
        getInfo: 'GET /users/:id',
    }),
    items: service.assign({
        getList: 'GET /items',
        getInfo: 'GET /items/:id',
        setInfo: 'POST /items/:id',
    }),
};

let userList = await api.users.getList();
let firstUser = await api.users.getInfo({params: {id: userList[0].id}});
```

For API methods controlled only with query parameters, there is also a shorthand option: the `assignQuery()` method, returning aliases accepting only query parameters, without the need to nest them into the `query` key.

### Custom request handler

As shown above, the `RequestService` constructor takes a custom request handler as a parameter. Internal independence of `RequestService` from a fixed built-in request handler allows to handle requests of all sorts and environments (the browser or node) without locking in with a certain request library.

Here's an example of a basic JSON request handler that can be passed to `RequestService`:

```ts
import {RequestHandler, RequestError, getFetchOptions} from 'reqsrv';

const endpoint = 'https://api.example.com';

let fetchJSON: RequestHandler = async (target, options) => {
    let {url, method, headers} = getFetchOptions(endpoint, target, options);
    let body = options?.body;

    let response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    let {ok, status, statusText} = response;

    if (!ok) {
        throw new RequestError({
            status,
            statusText,
        });
    }

    try {
        return {
            ok,
            status,
            statusText,
            body: await response.json(),
        };
    }
    catch (error) {
        throw new RequestError(error);
    }
}
```

To meet the needs of a specific use case, the request handler's code can certainly depart from the example above (which is again the reason why it's not hardwired into the package).
