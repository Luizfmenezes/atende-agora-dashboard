
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor SQL Server...');

// Verificar se o arquivo do servidor existe
const serverPath = path.join(__dirname, 'src', 'server', 'index.js');
console.log('Caminho do servidor:', serverPath);

const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

serverProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  console.log('Certifique-se de que o Node.js está instalado e o arquivo existe em:', serverPath);
});

serverProcess.on('close', (code) => {
  console.log(`Servidor finalizado com código: ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n🔴 Finalizando servidor...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔴 Finalizando servidor...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
