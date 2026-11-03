'use strict';

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('excel2sql', {
  platform: process.platform,
  versions: { electron: process.versions.electron, node: process.versions.node },
});
