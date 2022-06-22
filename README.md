# reqsrv

*A lightweight zero-dependency container for typed web APIs*

The common request handling utilities like `fetch`, `node-fetch`, `axios` are not easily typed out-of-the-box. Also, `fetch` and `node-fetch` have a somewhat verbose twofold response handling (`await fetch()`, `await response.json()`). These issues can be easily solved with a thin container utility, and this package is one of the approaches. Its core features are:

- it doesn't depend on a specific request handling utility, entrusting this opinionated part to the developer;
- provides a common interface to handle API requests;
- adds type checks to request handling based on a custom API schema.

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
    // a URL path of an API target can contain colon-prefixed
    // parameters specified in `request.params`
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
        name: 'getItem'; // optional
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

### API alias methods

```ts
// the names specified in the schema are expected to be used here
// (and `tsc` will make sure there is no mismatch)
service.defineMethod('getItem', 'GET /items/:id');

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
// for multiple definitions
service.defineMethods({
    getItem: 'GET /items/:id'
});
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

### Basic JSON request handler

An example of a custom request handler passed to the `RequestService` constructor:

```ts
import type {Request, Response, RequestError} from 'reqsrv';

async function fetchJSON({method, url}: Request): Promise<Response> {
    // fits both the browser's `window.fetch` and the one imported
    // from `node-fetch` in a Node environment
    let response = await fetch(url, {method});
    let {ok, status, statusText} = response;

    if (!ok) {
        throw new RequestError({
            status,
            statusText
        });
    }

    try {
        return {
            ok,
            status,
            statusText,
            body: await response.json()
        };
    }
    catch (error) {
        throw new RequestError({
            status: 500,
            statusText: 'Internal Server Error',
            data: {
                message: error.message
            }
        });
    }
}
```
