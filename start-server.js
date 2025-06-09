
const { spawn } = require('child_process');
const path = require('path');

console.log('Iniciando servidor SQL Server...');

const serverProcess = spawn('node', [path.join(__dirname, 'src/server/index.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

serverProcess.on('error', (error) => {
  console.error('Erro ao iniciar servidor:', error);
});

serverProcess.on('close', (code) => {
  console.log(`Servidor finalizado com código: ${code}`);
});

process.on('SIGINT', () => {
  console.log('Finalizando servidor...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});
