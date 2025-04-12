const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Store = require('electron-store');

let mainWindow;
const configStore = new Store({
  name: 'printtree-config',
  defaults: {
    startWithWindows: false,
    startMinimized: false,
    lastDirectory: os.homedir()
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 750,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    title: 'Directory Tree Printer'
  });

  mainWindow.loadFile('index.html');

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    configStore.set('lastDirectory', result.filePaths[0]);
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-last-directory', () => {
  return configStore.get('lastDirectory');
});

ipcMain.handle('get-directory-tree', async (event, dirPath, depthLimit) => {
  try {
    const parsedDepthLimit = parseInt(depthLimit);
    if (isNaN(parsedDepthLimit) || parsedDepthLimit < 1) {
      return { error: "Invalid depth limit. Must be a positive number." };
    }
    return getDirectoryTree(dirPath, parsedDepthLimit);
  } catch (error) {
    console.error('Error getting directory tree:', error);
    return { error: error.message };
  }
});

function getDirectoryTree(dirPath, maxDepth) {
  if (!fs.existsSync(dirPath)) {
    return { error: `Directory does not exist: ${dirPath}` };
  }

  const result = [];
  
  function processDirectory(currentPath, depth, prefix = '') {
    if (depth > maxDepth) return;
    
    try {
      const items = fs.readdirSync(currentPath);
      const dirs = [];
      const files = [];
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        try {
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            dirs.push(item);
          } else {
            files.push(item);
          }
        } catch (err) {
          console.error(`Error accessing ${fullPath}:`, err);
        }
      }
      
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        const isLast = i === dirs.length - 1 && files.length === 0;
        const line = isLast ? `${prefix}|__${dir}` : `${prefix}|--${dir}`;
        result.push(line);
        
        if (depth < maxDepth) {
          processDirectory(
            path.join(currentPath, dir),
            depth + 1,
            `${prefix}    `
          );
        }
      }
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isLast = i === files.length - 1;
        const line = isLast ? `${prefix}|__${file}` : `${prefix}|--${file}`;
        result.push(line);
      }
    } catch (err) {
      console.error(`Error reading directory ${currentPath}:`, err);
      result.push(`${prefix}|--Error: ${err.message}`);
    }
  }
  
  processDirectory(dirPath, 0);
  return result;
}

ipcMain.handle('save-to-file', async (event, content, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || path.join(os.homedir(), 'directory_tree.txt'),
    filters: [
      { name: 'Text Files', extensions: ['txt'] }
    ]
  });
  
  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, content, 'utf-8');
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, canceled: true };
});
