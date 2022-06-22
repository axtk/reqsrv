import fetch from 'node-fetch';
import {RequestService} from './src/RequestService';
import {RequestError} from './src/RequestError';
import type {Request, Response, Schema, HTTPMethod} from './src/types';

// https://en.wiktionary.org/w?search=test&fulltext=1
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
    'GET /:section': {
        name: 'search2',
        request: {
            params: {
                section: 'w' | 'none';
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

async function fetchText({method, url}: Request): Promise<Response> {
    let response = await fetch(url, {method});
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
            body: (await response.text()).substring(0, 256) + '...',
        };
    }
    catch (error) {
        throw new RequestError({
            status: 500,
            statusText: 'Internal Server Error',
            data: {
                message: error.message,
            },
        });
    }
}

async function test(message: string, subject: () => Promise<void>) {
    console.log(message);
    await subject();
}

function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function equal(x: unknown, y: unknown) {
    return JSON.stringify(x) === JSON.stringify(y);
}

function toHTMLTitle(title: string) {
    return `<title>Search results for "${title}" - Wiktionary</title>`;
}

(async () => {

await test('RequestService(url, callback) + defineMethod()', async () => {
    const service = new RequestService<WiktionarySchema>(
        'https://en.wiktionary.org',
        fetchText,
    );

    let res1 = await service.send('GET /w', {
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res1.ok, res1.status, res1.statusText], [true, 200, 'OK']), 'send');
    assert(res1.body.includes(toHTMLTitle('example')), 'send title');

    service.defineMethod('search', 'GET /w');

    let res2 = await service.api.search({
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res2.ok, res2.status, res2.statusText], [true, 200, 'OK']), 'api');
    assert(res2.body.includes(toHTMLTitle('example')), 'api title');
});

await test('RequestService(url, callback) + defineMethods()', async () => {
    const service = new RequestService<WiktionarySchema>(
        'https://en.wiktionary.org',
        fetchText,
    );

    let res1 = await service.send('GET /w', {
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res1.ok, res1.status, res1.statusText], [true, 200, 'OK']), 'send');
    assert(res1.body.includes(toHTMLTitle('example')), 'send title');

    service.defineMethods({search: 'GET /w'});

    let res2 = await service.api.search({
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res2.ok, res2.status, res2.statusText], [true, 200, 'OK']), 'api');
    assert(res2.body.includes(toHTMLTitle('example')), 'api title');
});

await test('RequestService(url, callback, apiMap)', async () => {
    const service = new RequestService<WiktionarySchema>(
        'https://en.wiktionary.org',
        fetchText,
        {search: 'GET /w'},
    );

    let res1 = await service.send('GET /w', {
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res1.ok, res1.status, res1.statusText], [true, 200, 'OK']), 'send');
    assert(res1.body.includes(toHTMLTitle('example')), 'send title');

    let res2 = await service.api.search({
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res2.ok, res2.status, res2.statusText], [true, 200, 'OK']), 'api');
    assert(res2.body.includes(toHTMLTitle('example')), 'api title');
});

await test('url path params', async () => {
    const service = new RequestService<WiktionarySchema>(
        'https://en.wiktionary.org',
        fetchText,
    );

    let res1 = await service.send('GET /:section', {
        params: {section: 'w'},
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res1.ok, res1.status, res1.statusText], [true, 200, 'OK']), 'send');
    assert(res1.body.includes(toHTMLTitle('example')), 'send title');

    service.defineMethod('search2', 'GET /:section');

    let res2 = await service.api.search2({
        params: {section: 'w'},
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res2.ok, res2.status, res2.statusText], [true, 200, 'OK']), 'api');
    assert(res2.body.includes(toHTMLTitle('example')), 'api title');
});

await test('code 404', async () => {
    const service = new RequestService<WiktionarySchema>(
        'https://en.wiktionary.org',
        fetchText,
    );

    try {
        let res1 = await service.send('GET /:section', {
            params: {section: 'none'},
            query: {search: 'nonsense'},
        });
    }
    catch (error) {
        assert(error instanceof RequestError, 'send instanceof');
        assert(equal([error.status, error.statusText], [404, 'Not Found']), 'send error');
        assert(error.message === '404 Not Found', 'send error message');
    }

    service.defineMethod('search2', 'GET /:section');

    try {
        let res2 = await service.api.search2({
            params: {section: 'none'},
            query: {search: 'nonsense'},
        });
    }
    catch (error) {
        assert(error instanceof RequestError, 'api instanceof');
        assert(equal([error.status, error.statusText], [404, 'Not Found']), 'api error');
        assert(error.message === '404 Not Found', 'api error message');
    }
});

})();
