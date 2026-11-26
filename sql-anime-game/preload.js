const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  quit: () => ipcRenderer.send('game:quit'),
  setFullscreen: (on) => ipcRenderer.send('game:fullscreen', on),
  isFullscreen: () => ipcRenderer.invoke('game:isFullscreen'),
  unlockAchievement: (id) => ipcRenderer.send('steam:achievement', id),
});
