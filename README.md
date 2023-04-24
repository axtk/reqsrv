# reqsrv

*Utilities for typing web APIs*

## Features

- type checking of request handlers based on a custom API schema;
- a common interface to handle API requests;
- no internal dependence on a specific request utility, entrusting this opinionated part to the developer.

## Usage

```ts
import {RequestService, Schema} from 'reqsrv';

// `ServiceSchema` is a custom API schema defined below
const service = new RequestService<ServiceSchema>(
    // a custom request handler;
    // it's likely (but not required) to contain `fetch`, `node-fetch`,
    // `axios`, `grpc-js`, logging, default headers, whatever necessary
    fetchContent
);

// `tsc` will make sure that the options in the second parameter match
// the API target specified in the first parameter according to
// `ServiceSchema`
let {ok, status, body} = await service.send('GET /items/:id', {
    params: {
        id: 10
    },
    query: {
        mode: 'full'
    }
});

// wrapping into the `Schema` generic type is optional, but
// this helps validate the schema structure by means of `tsc`
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
                /** @defaultValue 'compact' */
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

```ts
// mapping certain schema keys to new method names
let api = service.assign({
    getItems: 'GET /items',
    getItem: 'GET /items/:id',
    setItem: 'POST /items/:id'
});

// now, `service.send('GET /items/:id', {...})` has another
// equivalent form:
let response = await api.getItem({
    params: {
        id: 10
    },
    query: {
        mode: 'full'
    }
});
```

The `.assign()` method doesn't necessarily take all the API schema keys at once. They can be split into logical subsets and arranged in different namespaces:

```ts
let api = {
    users: service.assign({
        getUsers: 'GET /users',
        getUser: 'GET /users/:id',
    }),
    items: service.assign({
        getItems: 'GET /items',
        getItem: 'GET /items/:id',
        setItem: 'POST /items/:id'
    })
};

let firstUser = await api.users.getUser({params: {id: 1}});
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
