const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

function copyEnv(folder) {
  const example = path.join(root, folder, '.env.example');
  const target = path.join(root, folder, '.env');
  if (!fs.existsSync(target) && fs.existsSync(example)) {
    fs.copyFileSync(example, target);
    console.log(`Created ${folder}/.env from ${folder}/.env.example`);
  }
}

console.log('Installing server dependencies...');
run(npmCommand, ['install', '--prefix', 'server']);
console.log('Installing client dependencies...');
run(npmCommand, ['install', '--prefix', 'client']);
copyEnv('server');
copyEnv('client');
console.log('\nSetup complete. Review server/.env, then run: npm run dev');
