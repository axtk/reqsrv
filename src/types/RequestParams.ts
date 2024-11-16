import type {SchemaEntry} from './SchemaEntry';
import type {PartialRequest} from './PartialRequest';

export type RequestParams<T extends SchemaEntry> = PartialRequest<T, 'params'>;
