# reqsrv

*Lightweight zero-dependency utilities for typing web APIs*

- enables type checking of request handlers based on a custom API schema;
- provides a common interface to handle API requests;
- doesn't internally depend on a specific request utility, entrusting this opinionated part to the developer.

## Usage

```ts
import {RequestService, Schema} from 'reqsrv';

// `ServiceSchema` is a custom API schema defined below
const service = new RequestService<ServiceSchema>(
    'https://api.example-service.com',
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
