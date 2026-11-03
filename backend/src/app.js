'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { parseWorkbook } = require('./excelParser');
const { generateSQL } = require('./sqlGenerator');
const store = require('./store');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 单文件最大 25MB
});

const ALLOWED_EXT = ['.xlsx', '.xls', '.csv'];

/**
 * 修复 multer(busboy) 将 multipart 中的 UTF-8 文件名按 Latin-1 解码导致的中文乱码
 * （如「员工信息.xlsx」变成「åå·¥ä¿¡æ¯.xlsx」）。
 * 仅在能还原为合法 UTF-8 时采用转换结果；出现替换字符（U+FFFD）说明原名并非
 * UTF-8 被误读，按原样返回，避免误伤纯 ASCII / 真实 Latin-1 名称。
 */
function decodeFileName(name) {
  if (!name) return name;
  const converted = Buffer.from(name, 'latin1').toString('utf8');
  return converted.includes('�') ? name : converted;
}

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, name: 'excel2sql' });
  });

  /**
   * 上传并解析 Excel 文件。
   * 返回 fileId（用于后续生成 SQL）、每个工作表的表头 / 推断类型 / 前 5 行样例。
   */
  app.post('/api/parse', upload.single('file'), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: '请上传 Excel 文件' });

      const fileName = decodeFileName(req.file.originalname || '');

      const ext = path.extname(fileName).toLowerCase();
      if (ext && !ALLOWED_EXT.includes(ext)) {
        return res.status(400).json({ error: `不支持的文件类型: ${ext}，仅支持 ${ALLOWED_EXT.join(' / ')}` });
      }

      const sheets = parseWorkbook(req.file.buffer);
      if (!sheets.length) return res.status(400).json({ error: '文件中没有可用的工作表' });

      const fileId = store.save({ fileName, sheets });

      res.json({
        fileId,
        fileName,
        sheets: sheets.map(s => ({
          name: s.name,
          rowCount: s.rowCount,
          columns: s.headers.map((h, i) => ({ name: h, type: s.types[i] })),
          sample: s.rows
            .slice(0, 5)
            .map(r => r.map(v => (v instanceof Date ? v.toISOString().slice(0, 19).replace('T', ' ') : v))),
        })),
      });
    } catch (e) {
      res.status(400).json({ error: '文件解析失败: ' + e.message });
    }
  });

  /**
   * 根据配置生成 SQL。
   * body: { fileId, sheet, mode, tableName, dialect, batchSize, emptyAsNull, mapping }
   */
  app.post('/api/generate', (req, res) => {
    try {
      const { fileId, sheet, mode, tableName, dialect, batchSize, emptyAsNull, mapping } = req.body || {};
      const file = store.get(fileId);
      if (!file) return res.status(400).json({ error: '文件会话已过期，请重新上传' });

      const target = file.sheets.find(s => s.name === sheet) || file.sheets[0];
      if (!target) return res.status(400).json({ error: '未找到指定工作表' });

      const result = generateSQL({
        mode,
        tableName,
        dialect,
        batchSize,
        mapping,
        emptyAsNull: emptyAsNull !== false,
        headers: target.headers,
        rows: target.rows,
      });
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // 生产模式 / 桌面模式：托管前端构建产物
  const staticDir = process.env.E2S_STATIC || path.join(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get('*', (req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }

  // 统一错误处理（含 multer 文件超限等）
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err) return res.status(400).json({ error: err.message });
    return next();
  });

  return app;
}

module.exports = { createApp };
