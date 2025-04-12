const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getLastDirectory: () => ipcRenderer.invoke('get-last-directory'),
  getDirectoryTree: (dirPath, depthLimit) => ipcRenderer.invoke('get-directory-tree', dirPath, depthLimit),
  saveToFile: (content, defaultPath) => ipcRenderer.invoke('save-to-file', content, defaultPath)
}); 