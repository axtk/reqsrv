import type {SchemaEntry} from './SchemaEntry';

export type RequestParams<T extends SchemaEntry> =
    Exclude<NonNullable<T['request']>, void>['params'];
