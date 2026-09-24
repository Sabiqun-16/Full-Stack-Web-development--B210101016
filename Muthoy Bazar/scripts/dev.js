const { spawn } = require('child_process');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [
  spawn(npmCommand, ['run', 'dev', '--prefix', 'server'], { stdio: 'inherit' }),
  spawn(npmCommand, ['start', '--prefix', 'client'], { stdio: 'inherit' }),
];

function stopProcesses() {
  processes.forEach((child) => {
    if (!child.killed) child.kill();
  });
}

process.on('SIGINT', () => {
  stopProcesses();
  process.exit(0);
});
process.on('SIGTERM', () => {
  stopProcesses();
  process.exit(0);
});

processes.forEach((child) => {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stopProcesses();
      process.exit(code);
    }
  });
});
