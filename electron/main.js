'use strict';

const path = require('path');
const { app, BrowserWindow, shell } = require('electron');

// 桌面模式：随机端口 + 托管前端构建产物
process.env.E2S_PORT = process.env.E2S_PORT || '0';
process.env.E2S_STATIC = path.join(__dirname, '..', 'frontend', 'dist');

const { startServer } = require('../backend/server');

let mainWindow = null;

async function createWindow() {
  const { port } = await startServer();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'Excel2SQL',
    icon: path.join(__dirname, '../resources/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 外部链接交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
