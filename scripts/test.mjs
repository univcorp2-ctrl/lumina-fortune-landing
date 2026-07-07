import { spawnSync } from 'node:child_process';
import process from 'node:process';

const result = spawnSync(process.execPath, ['--test'], {
  stdio: 'inherit',
  env: process.env
});
process.exit(result.status ?? 1);
