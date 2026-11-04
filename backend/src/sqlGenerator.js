'use strict';

const { isBlank, isNumberLike, toNumber, parseBool, toDate } = require('./typeDetector');

/** 各数据库类型的标识符引用方式 */
const IDENT_QUOTE = {
  mysql: id => '`' + String(id).replace(/`/g, '``') + '`',
  postgresql: id => '"' + String(id).replace(/"/g, '""') + '"',
  sqlite: id => '"' + String(id).replace(/"/g, '""') + '"',
  oracle: id => '"' + String(id).replace(/"/g, '""') + '"',
  sqlserver: id => '[' + String(id).replace(/\]/g, ']]') + ']',
};

/** 各数据库类型的布尔字面量 */
const BOOL_LIT = {
  mysql: ['1', '0'],
  sqlite: ['1', '0'],
  sqlserver: ['1', '0'],
  oracle: ['1', '0'],
  postgresql: ['TRUE', 'FALSE'],
};

const NUMERIC_RE = /^(TINYINT|SMALLINT|MEDIUMINT|INT|INTEGER|BIGINT|DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|MONEY)/i;

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(d, withTime) {
  const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return withTime ? `${day} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` : day;
}

/** 字符串字面量转义（标准 SQL：单引号双写，各数据库通用） */
function escapeString(s) {
  return String(s).replace(/'/g, "''");
}

/**
 * 按目标类型把单元格值格式化为 SQL 字面量。
 */
function formatValue(value, type, dbType, emptyAsNull) {
  const t = String(type || 'VARCHAR(255)').toUpperCase();
  const isNumeric = NUMERIC_RE.test(t);
  const isBool = t === 'BOOLEAN' || t === 'BOOL' || t === 'BIT';
  const isDate = t.startsWith('DATE') || t.startsWith('TIMESTAMP');

  if (isBlank(value)) {
    if (isNumeric || isBool || isDate) return 'NULL';
    return emptyAsNull ? 'NULL' : "''";
  }

  if (isNumeric) {
    return isNumberLike(value) ? String(toNumber(value)) : 'NULL';
  }

  if (isBool) {
    const b = parseBool(value);
    if (b === null) return 'NULL';
    return BOOL_LIT[dbType][b ? 0 : 1];
  }

  if (isDate) {
    const d = toDate(value);
    if (!d) return 'NULL';
    return `'${formatDate(d, t !== 'DATE')}'`;
  }

  const s = value instanceof Date ? formatDate(value, true) : String(value);
  return `'${escapeString(s)}'`;
}

/** 生成 WHERE 条件片段；值为 NULL 时使用 IS NULL */
function buildCondition(quote, field, literal) {
  const col = quote(field);
  return literal === 'NULL' ? `${col} IS NULL` : `${col} = ${literal}`;
}

/**
 * 生成批量 SQL。
 *
 * @param {Object} options
 * @param {'insert'|'update'|'delete'} options.mode 转换模式
 * @param {string} options.tableName 目标表名
 * @param {string} options.dbType 数据库类型 mysql/postgresql/sqlite/sqlserver/oracle
 * @param {number} options.batchSize INSERT 模式下单条语句包含的数据行数
 * @param {string[]} options.headers Excel 表头
 * @param {Array<Array>} options.rows 数据行（与表头对齐）
 * @param {Array<{excelCol:string, field:string, type:string, include?:boolean, isKey?:boolean}>} options.mapping 字段映射
 * @param {boolean} options.emptyAsNull 空字符串是否视为 NULL
 * @returns {{sql: string, statementCount: number, rowCount: number}}
 */
function generateSQL(options) {
  const {
    mode = 'insert',
    tableName,
    dbType = 'mysql',
    batchSize = 100,
    headers,
    rows,
    mapping,
    emptyAsNull = true,
  } = options;

  if (!tableName || !String(tableName).trim()) throw new Error('表名不能为空');
  if (!Array.isArray(headers) || headers.length === 0) throw new Error('缺少表头信息');
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('没有可转换的数据行');
  if (!IDENT_QUOTE[dbType]) throw new Error(`不支持的数据库类型: ${dbType}`);

  const active = (mapping || []).filter(m => m && m.include !== false && m.field && String(m.field).trim());
  if (active.length === 0) throw new Error('请至少保留一个参与转换的字段');

  const quote = IDENT_QUOTE[dbType];
  const colIndex = active.map(m => headers.indexOf(m.excelCol));
  if (colIndex.some(i => i < 0)) throw new Error('字段映射与表头不匹配，请重新上传文件');

  const table = quote(String(tableName).trim());
  const size = Math.max(1, Math.min(Number(batchSize) || 100, 1000));
  const valueOf = (row, i) => formatValue(row[colIndex[i]], active[i].type, dbType, emptyAsNull);
  const fieldOf = i => quote(String(active[i].field).trim());

  const statements = [];

  if (mode === 'insert') {
    const cols = active.map((_, i) => fieldOf(i)).join(', ');
    for (let start = 0; start < rows.length; start += size) {
      const chunk = rows.slice(start, start + size);
      const body = chunk
        .map(row => '  (' + active.map((_, i) => valueOf(row, i)).join(', ') + ')')
        .join(',\n');
      statements.push(`INSERT INTO ${table} (${cols}) VALUES\n${body};`);
    }
  } else if (mode === 'update') {
    const keyPos = active.map((m, i) => (m.isKey ? i : -1)).filter(i => i >= 0);
    const setPos = active.map((m, i) => (m.isKey ? -1 : i)).filter(i => i >= 0);
    if (keyPos.length === 0) throw new Error('UPDATE 模式需要至少勾选一个主键字段');
    if (setPos.length === 0) throw new Error('UPDATE 模式需要至少保留一个非主键字段用于 SET');
    for (const row of rows) {
      const setSql = setPos.map(i => `${fieldOf(i)} = ${valueOf(row, i)}`).join(', ');
      const whereSql = keyPos.map(i => buildCondition(quote, String(active[i].field).trim(), valueOf(row, i))).join(' AND ');
      statements.push(`UPDATE ${table} SET ${setSql} WHERE ${whereSql};`);
    }
  } else if (mode === 'delete') {
    const keyPos = active.map((m, i) => (m.isKey ? i : -1)).filter(i => i >= 0);
    if (keyPos.length === 0) throw new Error('DELETE 模式需要至少勾选一个主键字段');
    for (const row of rows) {
      const whereSql = keyPos.map(i => buildCondition(quote, String(active[i].field).trim(), valueOf(row, i))).join(' AND ');
      statements.push(`DELETE FROM ${table} WHERE ${whereSql};`);
    }
  } else {
    throw new Error(`不支持的转换模式: ${mode}`);
  }

  const header = [
    '-- Generated by Excel2SQL',
    `-- 表: ${String(tableName).trim()} | 模式: ${mode.toUpperCase()} | 数据库类型: ${dbType} | 数据行: ${rows.length}`,
  ].join('\n');

  return {
    sql: header + '\n\n' + statements.join('\n\n') + '\n',
    statementCount: statements.length,
    rowCount: rows.length,
  };
}

module.exports = { generateSQL, formatValue, IDENT_QUOTE };
