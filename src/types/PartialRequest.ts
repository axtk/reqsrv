import type {SchemaEntry} from './SchemaEntry';

export type PartialRequest<
    T extends SchemaEntry,
    K extends keyof Exclude<NonNullable<T['request']>, void>
> = Pick<Exclude<NonNullable<T['request']>, void>, K>;
