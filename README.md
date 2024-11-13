# reqsrv

*Utilities for typing web APIs*

## Features

- type checking of request handlers based on a custom API schema;
- a common interface to handle API requests;
- no internal dependence on a specific request utility, entrusting this opinionated part to the developer.

## Usage

```ts
import {RequestService, Schema} from 'reqsrv';

// `ServiceSchema` is a custom API schema (an example is shown below)
const service = new RequestService<ServiceSchema>(
    // a custom request handler;
    // it's not baked into the package, since it can vary in many ways
    // depending on the purpose and environment of the application
    // (it might make use of `fetch`, `node-fetch`, `axios`, `grpc-js`,
    // logging, default headers, and whatever necessary)
    fetchContent
);

let {ok, status, body} = await service.send('GET /items/:id', {
    // these options are validated as `ServiceSchema['GET /items/:id']`
    // (based on the schema type passed to the `RequestService`
    // constructor and the first parameter passed to `send()`)
    params: {
        id: 10
    },
    query: {
        mode: 'full'
    }
});

// wrapping into the `Schema` generic type is optional, but
// this helps validate the basic schema structure
type ServiceSchema = Schema<{
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

### Assigning custom method names to API targets

Schema keys can be mapped to new methods:

```ts
let api = service.assign({
    getItems: 'GET /items',
    getItem: 'GET /items/:id',
    setItem: 'POST /items/:id'
});
```

With such a mapping in place, `service.send('GET /items/:id', {...})` has another equivalent form:

```ts
let response = await api.getItem({
    params: {
        id: 10
    },
    query: {
        mode: 'full'
    }
});
```

The `.assign()` method doesn't have to take all the API schema keys at once. The API methods can be split into logical subsets and arranged in different namespaces:

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
    })
};

let userList = await api.users.getList();
let firstUser = await api.users.getInfo({params: {id: userList[0].id}});
```

### Custom request handler

As shown above, the `RequestService` constructor takes a custom request handler as a parameter. Internal independence of `RequestService` from a fixed built-in request handler allows to handle requests of all sorts and environments (the browser or node) without locking in with a certain request library.

Here's an example of a basic JSON request handler that can be passed to `RequestService`:

```ts
import {RequestHandler, RequestError, getFetchOptions} from 'reqsrv';

const endpoint = 'https://api.example.com';

let fetchJSON: RequestHandler = async (target, options) => {
    let {url, method, headers} = getFetchOptions(endpoint, target, options);

    let response = await fetch(url, {
        method,
        headers,
        body: options.body && JSON.stringify(options.body),
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
        throw new RequestError({
            status: 500,
            statusText: 'Internal Server Error',
            data: {
                message: error instanceof Error ? error.message : '',
            },
        });
    }
}
```
