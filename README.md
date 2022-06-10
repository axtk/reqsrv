# reqsrv

*A lightweight zero-dependency container for typed web APIs*

## Examples

```ts
// https://en.wiktionary.org/w/?search=example&fulltext=1
type WiktionarySchema = {
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
};

const service = new RequestService<WiktionarySchema>(
    'https://en.wiktionary.org',
    // a custom request handler;
    // it's likely (but not required) to contain `fetch`, `node-fetch`,
    // `axios`, `grpc-js`, logging, default headers, whatever necessary
    fetchText
);

// `tsc` will make sure there is no typo or type mismatch
await service.send('GET /w', {
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

service.api.search({
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
const service = new RequestService<APISchema>(
    baseURL,
    customRequestHandler, // optional
    customAPIMap // optional
);
```

### Cross-platform setup

```ts
// importable by the node and browser code
const service = new RequestService<APISchema>(
    baseURL,
    customIsomorphicRequestHandler,
    customAPIMap
);
```

or

```ts
// shared
const service = new RequestService<APISchema>(baseURL);
service.defineMethods(customAPIMap);

// node
service.setCallback(nodeRequestHandler);

// browser
service.setCallback(browserRequestHandler);
```

### URL path parameters

```ts
// https://en.wiktionary.org/w/?search=test&fulltext=1
type WiktionarySchema = {
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
};

await service.send('GET /:section', {
    params: {
        section: 'w'
    },
    query: {
        search: 'example',
        fulltext: 1
    }
});
```
