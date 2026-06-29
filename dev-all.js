import { spawn } from 'child_process';

console.log('==================================================');
console.log('🚀 Starting Taiwan Stock Radar Fullstack Dev Environment...');
console.log('==================================================');

// 1. 啟動 Express API 後端伺服器
const serverProcess = spawn('node', ['server.js'], { 
  stdio: 'inherit', 
  shell: true 
});

// 2. 啟動 Vite 前端開發伺服器
const clientProcess = spawn('npx', ['vite'], { 
  stdio: 'inherit', 
  shell: true 
});

// 處理結束程序訊號，確保子進程一併關閉
process.on('SIGINT', () => {
  console.log('\nStopping development servers...');
  serverProcess.kill('SIGINT');
  clientProcess.kill('SIGINT');
  process.exit(0);
});

process.on('exit', () => {
  serverProcess.kill();
  clientProcess.kill();
});
