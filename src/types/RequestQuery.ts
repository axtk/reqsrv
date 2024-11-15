import type {SchemaEntry} from './SchemaEntry';

export type RequestQuery<T extends SchemaEntry> =
    Exclude<NonNullable<T['request']>, void>['query'];
