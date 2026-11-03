'use strict';

/** 判断单元格是否为空白 */
function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

/** 判断值是否可视为数字 */
function isNumberLike(v) {
  if (typeof v === 'number') return Number.isFinite(v);
  if (typeof v === 'string') {
    const s = v.trim();
    return s !== '' && !Number.isNaN(Number(s));
  }
  return false;
}

function toNumber(v) {
  return typeof v === 'number' ? v : Number(String(v).trim());
}

const BOOL_TRUE_WORDS = ['true', 'yes', 'y', '是'];
const BOOL_FALSE_WORDS = ['false', 'no', 'n', '否'];

function isBoolLike(v) {
  if (typeof v === 'boolean') return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return BOOL_TRUE_WORDS.includes(s) || BOOL_FALSE_WORDS.includes(s);
  }
  return false;
}

/** 解析布尔值；无法识别时返回 null */
function parseBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).trim().toLowerCase();
  if (BOOL_TRUE_WORDS.includes(s) || s === '1') return true;
  if (BOOL_FALSE_WORDS.includes(s) || s === '0') return false;
  return null;
}

const DATE_PATTERN = /^(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})日?(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;

/** 将 Date 对象或日期字符串解析为 Date；无法解析返回 null */
function toDate(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v !== 'string') return null;
  const m = v.trim().match(DATE_PATTERN);
  if (!m) return null;
  const [, y, mo, d, h = '0', mi = '0', s = '0'] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
}

function isDateLike(v) {
  return toDate(v) !== null;
}

function hasTimePart(v) {
  if (v instanceof Date) {
    return v.getHours() !== 0 || v.getMinutes() !== 0 || v.getSeconds() !== 0;
  }
  return typeof v === 'string' && v.includes(':');
}

function displayLength(v) {
  if (v instanceof Date) return 19; // YYYY-MM-DD HH:mm:ss
  return String(v).length;
}

/**
 * 根据一列的采样值推断字段类型。
 * 判定顺序：数字 > 布尔 > 日期 > 字符串。
 */
function detectColumnType(values) {
  const present = values.filter(v => !isBlank(v));
  if (present.length === 0) return 'VARCHAR(255)';

  if (present.every(isNumberLike)) {
    const nums = present.map(toNumber);
    if (nums.every(n => Number.isInteger(n))) {
      const maxAbs = Math.max(...nums.map(n => Math.abs(n)));
      return maxAbs > 2147483647 ? 'BIGINT' : 'INT';
    }
    return 'DECIMAL(18,4)';
  }

  if (present.every(isBoolLike)) return 'BOOLEAN';

  if (present.every(isDateLike)) {
    return present.some(hasTimePart) ? 'DATETIME' : 'DATE';
  }

  const maxLen = Math.max(...present.map(displayLength));
  const steps = [32, 64, 128, 255, 512, 1024, 2000, 4000];
  for (const s of steps) {
    if (maxLen <= s) return `VARCHAR(${s})`;
  }
  return 'TEXT';
}

module.exports = {
  isBlank,
  isNumberLike,
  toNumber,
  isBoolLike,
  parseBool,
  toDate,
  isDateLike,
  detectColumnType,
};
