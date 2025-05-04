
const { spawn } = require('child_process');
const path = require('path');

// Start the backend server
function startBackend() {
  const server = spawn('node', [path.join(__dirname, 'server/index.js')], {
    stdio: 'inherit'
  });
  
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
  
  console.log('Backend server started on port 3001');
  return server;
}

// Execute when this script is run directly
if (require.main === module) {
  startBackend();
}

// Export for use in other scripts
module.exports = { startBackend };
