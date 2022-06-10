import fetch from 'node-fetch';
import {RequestService} from './src/RequestService';
import type {Response, HTTPMethod} from './src/types';

// https://en.wiktionary.org/w/?search=test&fulltext=1
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

async function fetchText({method, url}: {method: HTTPMethod, url: string}): Promise<Response> {
    console.log(`fetching '${method} ${url}'`);
    let response = await fetch(url, {method});
    let {ok, status, statusText} = response;
    try {
        return {
            ok,
            status,
            statusText,
            body: (await response.text()).substring(0, 256) + '...',
        };
    }
    catch (error) {
        return {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            body: error.message,
        };
    }
}

async function test(message: string, subject: () => Promise<void>) {
    console.log(`\n${message}`);
    await subject();
}

(async () => {

await test('RequestService(url, callback) + defineMethod()', async () => {
    const service = new RequestService<WiktionarySchema>('https://en.wiktionary.org', fetchText);
    console.log(await service.send('GET /w', {query: {search: 'example', fulltext: 1}}));

    service.defineMethod('search', 'GET /w');
    console.log(await service.api.search({query: {search: 'example', fulltext: 1}}));
});

await test('RequestService(url, callback) + defineMethods()', async () => {
    const service = new RequestService<WiktionarySchema>('https://en.wiktionary.org', fetchText);
    console.log(await service.send('GET /w', {query: {search: 'example', fulltext: 1}}));

    service.defineMethods({search: 'GET /w'});
    console.log(await service.api.search({query: {search: 'example', fulltext: 1}}));
});

await test('RequestService(url, callback, apiMap)', async () => {
    const service = new RequestService<WiktionarySchema>('https://en.wiktionary.org', fetchText, {search: 'GET /w'});
    console.log(await service.send('GET /w', {query: {search: 'example', fulltext: 1}}));
    console.log(await service.api.search({query: {search: 'example', fulltext: 1}}));
});

})();
