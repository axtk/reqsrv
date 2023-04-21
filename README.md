# reqsrv

*Lightweight zero-dependency utilities for typing web APIs*

- enables type checking of request handlers based on a custom API schema;
- provides a common interface to handle API requests;
- doesn't internally depend on a specific request utility, entrusting this opinionated part to the developer.

## Example

```ts
import {RequestService, Schema} from 'reqsrv';

const service = new RequestService<ServiceSchema>(
    'https://api.example-service.com',
    // a custom request handler;
    // it's likely (but not required) to contain `fetch`, `node-fetch`,
    // `axios`, `grpc-js`, logging, default headers, whatever necessary
    fetchContent
);

// `tsc` will make sure that the parameters match the API target
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
        alias: 'getItem'; // optional
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

### Aliases to API methods

```ts
// the aliases specified in the schema are expected to be used here
// (and `tsc` will make sure there is no mismatch)
service.setAlias('getItem', 'GET /items/:id');

// now, `service.send('GET /items/:id', options)` has another
// equivalent form:
let response = await service.api.getItem({
    params: {
        id: 10
    },
    query: {
        mode: 'full'
    }
});
```

```ts
// for multiple aliases
service.setAliases({
    getItems: 'GET /items',
    getItem: 'GET /items/:id',
    setItem: 'POST /items/:id'
});
// all of these aliases should be defined in the schema,
// like `'getItem'` in the schema definition above
```

### Initialization

```ts
// see `src/RequestService.ts` for more specific types
const service = new RequestService<APISchema>(
    baseURL,
    customRequestHandler, // optional
    customAPIMap // optional
);
```
