'use strict';

const XLSX = require('xlsx');
const { detectColumnType } = require('./typeDetector');

/** 表头规范化：空白列自动命名，重名列追加序号 */
function normalizeHeaders(headerRow) {
  const seen = new Map();
  return headerRow.map((h, i) => {
    let name = h === null || h === undefined ? '' : String(h).trim();
    if (!name) name = `column_${i + 1}`;
    if (seen.has(name)) {
      const n = seen.get(name) + 1;
      seen.set(name, n);
      name = `${name}_${n}`;
    } else {
      seen.set(name, 1);
    }
    return name;
  });
}

/**
 * 单元格归一化：Excel 日期序列值回读时存在约 1ms 的量化偏差
 * （本地午夜会被读成前一日 23:59:59.999），按秒取整消除，
 * 保证 DATE / DATETIME 类型判定与 SQL 输出的日期正确。
 */
function normalizeCell(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return new Date(Math.round(v.getTime() / 1000) * 1000);
  }
  return v;
}

/**
 * 解析 Excel 工作簿（xlsx / xls / csv）。
 * @param {Buffer} buffer 文件内容
 * @returns {Array<{name:string, headers:string[], types:string[], rows:Array<Array>, rowCount:number}>}
 */
function parseWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

  return workbook.SheetNames.map(name => {
    const ws = workbook.Sheets[name];
    const aoa = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: null,
      blankrows: false,
    });

    const headerRow = aoa.length > 0 ? aoa[0] : [];
    const headers = normalizeHeaders(headerRow);
    const rows = aoa.slice(1).map(r => headers.map((_, i) => normalizeCell(i < r.length ? r[i] : null)));
    const types = headers.map((_, i) => detectColumnType(rows.map(r => r[i])));

    return { name, headers, types, rows, rowCount: rows.length };
  });
}

module.exports = { parseWorkbook, normalizeHeaders };
