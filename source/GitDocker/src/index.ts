import { app, BrowserWindow, ipcMain } from 'electron';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 580,
    width: 950,
    resizable: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
/*
ipcMain.on('buttonClicked', (event, data) => {
  function MenuClick() {
    document.getElementById('container').style.display = 'none';
    document.getElementById('container_menu').style.display = 'block';
  }
  
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      if (document.getElementById('container_menu').style.display === 'block') {
        document.getElementById('container_menu').style.display = 'none';
        document.getElementById('container_login').style.display = 'block';
      } else {
        document.getElementById('container').style.display = 'block';
        document.getElementById('container_menu').style.display = 'none';
      }
    }
  });
  console.log('Button clicked with data:', data);
});
*/
