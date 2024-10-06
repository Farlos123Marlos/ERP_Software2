const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
let mainWindow;
const { exec } = require('child_process');

// Start Node.js backend
const backendProcess = exec('node ./back/server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro no backend: ${error}`);
      return;
    }
    console.log(`Backend stdout: ${stdout}`);
    console.error(`Backend stderr: ${stderr}`);
  });

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // Carregar o frontend do React
  const startURL = isDev 
    ? 'http://localhost:3000'  // Durante o desenvolvimento
    : `file://${path.join(__dirname, '/meufront/build/index.html')}`;  // Após o build

  mainWindow.loadURL(startURL);
  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
