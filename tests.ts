import fetch from 'node-fetch';
import {RequestService} from './src/RequestService';
import {RequestError} from './src/RequestError';
import type {RequestHandler, Schema} from './src/types';

// https://en.wiktionary.org/w?search=test&fulltext=1
type WiktionarySchema = Schema<{
    'GET /w': {
        alias: 'search',
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
        alias: 'fetchSection',
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
            body: string | null;
        };
    };
}>;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const fetchText: RequestHandler = async (endpoint, target, options) => {
    let [method, path] = target.split(' ');

    if (options.params) {
        for (let [key, value] of Object.entries(options.params)) {
            if (value !== null && value !== undefined)
                path = path.replace(new RegExp(`:${escapeRegExp(key)}\\b`, 'g'), String(value));
        }
    }

    let url = new URL(path, endpoint);

    if (options.query) {
        for (let [key, value] of Object.entries(options.query)) {
            if (value !== null && value !== undefined)
                url.searchParams.append(key, String(value));
        }
    }

    let response = await fetch(url.href, {method});
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
                message: error instanceof Error ? error.message : '',
            },
        });
    }
}

async function test(message: string, subject: () => Promise<void>) {
    console.log(message);
    await subject();
}

function assert(condition: boolean | undefined, message: string) {
    if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function equal(x: unknown, y: unknown) {
    return JSON.stringify(x) === JSON.stringify(y);
}

function toHTMLTitle(title: string) {
    return `<title>Search results for "${title}" - Wiktionary</title>`;
}

(async () => {

await test('RequestService(url, handler) + setAlias()', async () => {
    const service = new RequestService<WiktionarySchema>(
        'https://en.wiktionary.org',
        fetchText,
    );

    let res1 = await service.send('GET /w', {
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res1.ok, res1.status, res1.statusText], [true, 200, 'OK']), 'send');
    assert(res1.body.includes(toHTMLTitle('example')), 'send title');

    service.setAlias('search', 'GET /w');

    let res2 = await service.api.search({
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res2.ok, res2.status, res2.statusText], [true, 200, 'OK']), 'api');
    assert(res2.body.includes(toHTMLTitle('example')), 'api title');
});

await test('RequestService(url, handler) + setAliases()', async () => {
    const service = new RequestService<WiktionarySchema>(
        'https://en.wiktionary.org',
        fetchText,
    );

    let res1 = await service.send('GET /w', {
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res1.ok, res1.status, res1.statusText], [true, 200, 'OK']), 'send');
    assert(res1.body.includes(toHTMLTitle('example')), 'send title');

    service.setAliases({search: 'GET /w'});

    let res2 = await service.api.search({
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res2.ok, res2.status, res2.statusText], [true, 200, 'OK']), 'api');
    assert(res2.body.includes(toHTMLTitle('example')), 'api title');
});

await test('RequestService(url, handler, apiMap)', async () => {
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
    assert(res1.body?.includes(toHTMLTitle('example')), 'send title');

    service.setAlias('fetchSection', 'GET /:section');

    let res2 = await service.api.fetchSection({
        params: {section: 'w'},
        query: {search: 'example', fulltext: 1},
    });
    assert(equal([res2.ok, res2.status, res2.statusText], [true, 200, 'OK']), 'api');
    assert(res2.body?.includes(toHTMLTitle('example')), 'api title');
});

await test('code 404', async () => {
    const service = new RequestService<WiktionarySchema>(
        'https://en.wiktionary.org',
        fetchText,
    );

    try {
        await service.send('GET /:section', {
            params: {section: 'none'},
            query: {search: 'nonsense'},
        });
    }
    catch (error) {
        assert(error instanceof RequestError, 'send instanceof');
        if (error instanceof RequestError) {
            assert(equal([error.status, error.statusText], [404, 'Not Found']), 'send error');
            assert(error.message === '404 Not Found', 'send error message');
        }
    }

    service.setAlias('fetchSection', 'GET /:section');

    try {
        await service.api.fetchSection({
            params: {section: 'none'},
            query: {search: 'nonsense'},
        });
    }
    catch (error) {
        assert(error instanceof RequestError, 'api instanceof');
        if (error instanceof RequestError) {
            assert(equal([error.status, error.statusText], [404, 'Not Found']), 'api error');
            assert(error.message === '404 Not Found', 'api error message');
        }
    }
});

})();
