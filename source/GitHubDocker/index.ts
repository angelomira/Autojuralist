import { app } from 'electron';
import { BrowserWindow } from 'electron';

app.on('ready', () => {
  console.log('App is ready');
});

const win = new BrowserWindow({
    width: 600,
    height: 400
});
const path = require('path');
const indexHTML = path.join(__dirname + '/index.html');
    win.loadFile(indexHTML).then(() => {
    // IMPLEMENT FANCY STUFF HERE
    });