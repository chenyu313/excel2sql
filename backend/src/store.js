'use strict';

const crypto = require('crypto');

const TTL = 30 * 60 * 1000; // 上传文件保留 30 分钟
const store = new Map();

function save(data) {
  const id = crypto.randomUUID();
  store.set(id, { data, ts: Date.now() });
  return id;
}

function get(id) {
  const entry = store.get(id);
  if (!entry) return null;
  entry.ts = Date.now();
  return entry.data;
}

setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of store) {
      if (now - value.ts > TTL) store.delete(key);
    }
  },
  5 * 60 * 1000
).unref();

module.exports = { save, get };
