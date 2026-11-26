// Processo principal do Electron — abre a janela do jogo.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#1a1026',
    title: 'Sakura Query',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

ipcMain.on('game:quit', () => app.quit());
ipcMain.on('game:fullscreen', (_e, on) => win && win.setFullScreen(!!on));
ipcMain.handle('game:isFullscreen', () => (win ? win.isFullScreen() : false));

// Ponto de integração com a Steam (ver docs/STEAM.md):
// ipcMain.on('steam:achievement', (_e, id) => steamClient.achievement.activate(id));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
