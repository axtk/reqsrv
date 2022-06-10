import {rmSync} from 'fs';
import {exec} from 'child_process';

rmSync('dist', {force: true, recursive: true});
exec('npm run compile', e => e && console.error(e));
