import type {SchemaEntry} from './SchemaEntry';
import type {PartialRequest} from './PartialRequest';

export type RequestQuery<T extends SchemaEntry> = PartialRequest<T, 'query'>;
