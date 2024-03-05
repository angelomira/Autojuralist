"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("electron");
electron_1.app.on('ready', () => {
    console.log('App is ready');
});
const win = new electron_2.BrowserWindow({
    width: 600,
    height: 400
});
const path = require('path');
const indexHTML = path.join(__dirname + '/index.html');
win.loadFile(indexHTML).then(() => {
    // IMPLEMENT FANCY STUFF HERE
});
