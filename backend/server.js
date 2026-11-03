'use strict';

const { createApp } = require('./src/app');

/**
 * 启动 HTTP 服务，返回实际监听端口。
 * 端口优先级：显式参数 > E2S_PORT 环境变量 > PORT 环境变量 > 5210。
 * 传 0 表示随机端口（Electron 桌面模式使用）。
 */
function startServer(port) {
  const resolved =
    port !== undefined
      ? Number(port)
      : process.env.E2S_PORT
        ? Number(process.env.E2S_PORT)
        : Number(process.env.PORT || 5210);

  return new Promise((resolve, reject) => {
    const app = createApp();
    const server = app.listen(resolved, () => {
      resolve({ port: server.address().port, server });
    });
    server.on('error', reject);
  });
}

if (require.main === module) {
  startServer()
    .then(({ port }) => {
      console.log(`Excel2SQL 服务已启动: http://localhost:${port}`);
    })
    .catch(err => {
      console.error('服务启动失败:', err);
      process.exit(1);
    });
}

module.exports = { startServer };
