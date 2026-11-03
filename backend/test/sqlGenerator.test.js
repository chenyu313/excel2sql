'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { detectColumnType } = require('../src/typeDetector');
const { generateSQL } = require('../src/sqlGenerator');

// ---------- 类型识别 ----------

test('detectColumnType: 整数列识别为 INT', () => {
  assert.equal(detectColumnType([1, 2, '3', 100]), 'INT');
});

test('detectColumnType: 超大整数识别为 BIGINT', () => {
  assert.equal(detectColumnType([1, 9007199254740991]), 'BIGINT');
});

test('detectColumnType: 小数列识别为 DECIMAL', () => {
  assert.equal(detectColumnType([1, 2.5, '3.14']), 'DECIMAL(18,4)');
});

test('detectColumnType: 布尔词识别为 BOOLEAN', () => {
  assert.equal(detectColumnType(['是', '否', '是']), 'BOOLEAN');
});

test('detectColumnType: 日期字符串识别为 DATE / DATETIME', () => {
  assert.equal(detectColumnType(['2024-01-01', '2024/6/30']), 'DATE');
  assert.equal(detectColumnType(['2024-01-01 08:30:00', new Date(2024, 0, 1, 9, 0, 0)]), 'DATETIME');
});

test('detectColumnType: 字符串按最大长度取 VARCHAR', () => {
  assert.equal(detectColumnType(['a', 'bc']), 'VARCHAR(32)');
  assert.equal(detectColumnType(['x'.repeat(300)]), 'VARCHAR(512)');
});

test('detectColumnType: 空列默认 VARCHAR(255)，超长文本为 TEXT', () => {
  assert.equal(detectColumnType([null, '', undefined]), 'VARCHAR(255)');
  assert.equal(detectColumnType(['x'.repeat(5000)]), 'TEXT');
});

// ---------- INSERT ----------

const headers = ['id', 'name', 'salary', 'hire_date', 'active'];
const rows = [
  [1, '张三', 18000.5, new Date(2023, 0, 10), '是'],
  [2, "O'Neil", null, new Date(2024, 5, 1), '否'],
  [3, '李四', 22000, null, '是'],
];
const baseMapping = headers.map(h => ({
  excelCol: h,
  field: h,
  type: detectColumnType(rows.map(r => r[headers.indexOf(h)])),
  include: true,
  isKey: h === 'id',
}));

test('insert: 生成多行 INSERT，单引号转义，空值为 NULL', () => {
  const { sql, statementCount, rowCount } = generateSQL({
    mode: 'insert',
    tableName: 'employees',
    dialect: 'mysql',
    batchSize: 10,
    headers,
    rows,
    mapping: baseMapping,
  });
  assert.equal(statementCount, 1);
  assert.equal(rowCount, 3);
  assert.match(sql, /INSERT INTO `employees` \(`id`, `name`, `salary`, `hire_date`, `active`\) VALUES/);
  assert.match(sql, /\(1, '张三', 18000\.5, '2023-01-10', 1\)/);
  assert.match(sql, /O''Neil/); // 单引号双写转义
  assert.match(sql, /\(2, 'O''Neil', NULL, '2024-06-01', 0\)/);
  assert.match(sql, /'2024-06-01'/); // DATE 类型不带时间
});

test('insert: batchSize 控制单条语句的行数', () => {
  const { statementCount } = generateSQL({
    mode: 'insert',
    tableName: 'employees',
    batchSize: 2,
    headers,
    rows,
    mapping: baseMapping,
  });
  assert.equal(statementCount, 2); // 3 行 / 每批 2 行
});

test('insert: include=false 的字段被跳过', () => {
  const mapping = baseMapping.map(m => (m.field === 'salary' ? { ...m, include: false } : m));
  const { sql } = generateSQL({ mode: 'insert', tableName: 't', headers, rows, mapping });
  assert.ok(!sql.includes('`salary`'));
});

// ---------- UPDATE / DELETE ----------

test('update: 非主键字段进 SET，主键进 WHERE', () => {
  const { sql, statementCount } = generateSQL({
    mode: 'update',
    tableName: 'employees',
    headers,
    rows,
    mapping: baseMapping,
  });
  assert.equal(statementCount, 3);
  assert.match(sql, /UPDATE `employees` SET `name` = '张三', `salary` = 18000\.5, `hire_date` = '2023-01-10', `active` = 1 WHERE `id` = 1;/);
  assert.ok(!/SET[^;]*`id`/.test(sql.split('\n')[2])); // 第一条语句 SET 中不含 id
});

test('update: 主键值为空时使用 IS NULL', () => {
  const h = ['id', 'name'];
  const r = [[null, '张三']];
  const mapping = [
    { excelCol: 'id', field: 'id', type: 'INT', include: true, isKey: true },
    { excelCol: 'name', field: 'name', type: 'VARCHAR(32)', include: true },
  ];
  const { sql } = generateSQL({ mode: 'update', tableName: 't', headers: h, rows: r, mapping });
  assert.match(sql, /WHERE `id` IS NULL/);
});

test('delete: 按主键生成 DELETE', () => {
  const { sql, statementCount } = generateSQL({
    mode: 'delete',
    tableName: 'employees',
    headers,
    rows,
    mapping: baseMapping,
  });
  assert.equal(statementCount, 3);
  assert.match(sql, /DELETE FROM `employees` WHERE `id` = 1;/);
  assert.match(sql, /DELETE FROM `employees` WHERE `id` = 3;/);
});

test('update/delete: 未勾选主键时报错', () => {
  const mapping = baseMapping.map(m => ({ ...m, isKey: false }));
  assert.throws(() => generateSQL({ mode: 'update', tableName: 't', headers, rows, mapping }), /主键/);
  assert.throws(() => generateSQL({ mode: 'delete', tableName: 't', headers, rows, mapping }), /主键/);
});

// ---------- 方言 ----------

test('dialect: sqlserver 使用方括号，postgresql 使用双引号和 TRUE/FALSE', () => {
  const ms = generateSQL({ mode: 'insert', tableName: 't', dialect: 'sqlserver', headers, rows, mapping: baseMapping });
  assert.match(ms.sql, /INSERT INTO \[t\] \(\[id\]/);
  const pg = generateSQL({ mode: 'insert', tableName: 't', dialect: 'postgresql', headers, rows, mapping: baseMapping });
  assert.match(pg.sql, /INSERT INTO "t" \("id"/);
  assert.match(pg.sql, /\bTRUE\b/);
  assert.match(pg.sql, /\bFALSE\b/);
});

test('参数校验: 空表名 / 空映射报错', () => {
  assert.throws(() => generateSQL({ mode: 'insert', tableName: '', headers, rows, mapping: baseMapping }), /表名/);
  assert.throws(() => generateSQL({ mode: 'insert', tableName: 't', headers, rows, mapping: [] }), /字段/);
});
