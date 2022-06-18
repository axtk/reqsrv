# reqsrv

*A lightweight zero-dependency container for typed web APIs*

## Examples

```ts
import {RequestService, Schema} from 'reqsrv';

// https://en.wiktionary.org/w?search=example&fulltext=1
// wrapping into the `Schema` generic type is optional, but
// this helps validate the schema structure by means of `tsc`
type WiktionarySchema = Schema<{
    'GET /w': {
        name: 'search',
        request: {
            query: {
                search: string;
                fulltext?: 0 | 1;
            };
        };
        response: {
            body: string;
        };
    };
}>;

const service = new RequestService<WiktionarySchema>(
    'https://en.wiktionary.org',
    // a custom request handler;
    // it's likely (but not required) to contain `fetch`, `node-fetch`,
    // `axios`, `grpc-js`, logging, default headers, whatever necessary
    fetchContent
);

// `tsc` will make sure there is no typo or type mismatch
let {ok, status, body} = await service.send('GET /w', {
    query: {
        search: 'example',
        fulltext: 1
    }
});
```

### API alias methods

```ts
// `tsc` will make sure only the names from the original schema type
// definition are used
service.defineMethod('search', 'GET /w');

let response = await service.api.search({
    query: {
        search: 'example',
        fulltext: 1
    }
});
```

```ts
// for multiple definitions
service.defineMethods({
    search: 'GET /w'
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

### URL path parameters

```ts
// https://en.wiktionary.org/w/?search=test&fulltext=1
type WiktionarySchema = Schema<{
    'GET /:section': {
        name: 'search',
        request: {
            params: {
                section: 'w';
            };
            query: {
                search: string;
                fulltext?: 0 | 1;
            };
        };
        response: {
            body: string;
        };
    };
}>;

let response = await service.send('GET /:section', {
    params: {
        section: 'w'
    },
    query: {
        search: 'example',
        fulltext: 1
    }
});
```

### Basic JSON request handler

```ts
import type {Request, Response} from 'reqsrv';

async function fetchJSON({method, url}: Request): Promise<Response> {
    let response = await fetch(url, {method});
    let {ok, status, statusText} = response;

    if (!ok) {
        return {
            ok,
            status,
            statusText
        };
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
        return {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            body: {
                message: error.message
            }
        };
    }
}
```

### Cross-platform setup

```ts
// importable by the node and browser code
const service = new RequestService<APISchema>(
    baseURL,
    customIsomorphicRequestHandler,
    customAPIMap // optional
);
```

or

```ts
// shared
const service = new RequestService<APISchema>(baseURL);
service.defineMethods(customAPIMap); // optional

// node
service.setCallback(nodeRequestHandler);

// browser
service.setCallback(browserRequestHandler);
```
