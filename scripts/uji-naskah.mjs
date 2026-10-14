#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, '..', 'frontend', 'scripts', 'uji-naskah.mjs');

const child = spawn(process.execPath, [target, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: join(__dirname, '..', 'frontend'),
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
