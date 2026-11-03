'use strict';

/**
 * 端到端自检：启动服务 → 上传 Excel → 三种模式生成 SQL → 校验结果。
 * 用法: npm run smoke
 */
const assert = require('node:assert/strict');
const XLSX = require('xlsx');
const { startServer } = require('../backend/server');

async function main() {
  const { port, server } = await startServer(0);
  const base = `http://127.0.0.1:${port}`;

  try {
    // 1. 健康检查
    const health = await (await fetch(`${base}/api/health`)).json();
    assert.equal(health.ok, true);

    // 2. 构造内存 Excel 并上传解析
    const rows = [
      ['id', 'name', 'salary', 'hire_date', 'active'],
      [1, '张三', 18000.5, new Date(2023, 0, 10), '是'],
      [2, "O'Neil", null, new Date(2024, 5, 1), '否'],
      [3, '李四', 22000, null, '是'],
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), '员工');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const fd = new FormData();
    fd.append('file', new Blob([buf]), 'demo.xlsx');
    const parseRes = await fetch(`${base}/api/parse`, { method: 'POST', body: fd });
    const parsed = await parseRes.json();
    assert.equal(parseRes.ok, true, `parse: ${parsed.error || ''}`);
    assert.equal(parsed.sheets[0].rowCount, 3);
    assert.deepEqual(
      parsed.sheets[0].columns.map(c => c.type),
      ['INT', 'VARCHAR(32)', 'DECIMAL(18,4)', 'DATE', 'BOOLEAN']
    );

    const mapping = parsed.sheets[0].columns.map(c => ({
      excelCol: c.name,
      field: c.name,
      type: c.type,
      include: true,
      isKey: c.name === 'id',
    }));

    const gen = async mode => {
      const res = await fetch(`${base}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: parsed.fileId,
          sheet: '员工',
          mode,
          tableName: 'employees',
          dialect: 'mysql',
          batchSize: 2,
          mapping,
        }),
      });
      const json = await res.json();
      assert.equal(res.ok, true, `${mode}: ${json.error || ''}`);
      return json;
    };

    // 3. INSERT（批量 2 行/条 → 2 条语句）
    const ins = await gen('insert');
    assert.match(ins.sql, /INSERT INTO `employees` \(`id`, `name`, `salary`, `hire_date`, `active`\) VALUES/);
    assert.match(ins.sql, /O''Neil/);
    assert.equal(ins.statementCount, 2);

    // 4. UPDATE
    const upd = await gen('update');
    assert.match(upd.sql, /UPDATE `employees` SET `name` = '张三'.*WHERE `id` = 1;/);

    // 5. DELETE
    const del = await gen('delete');
    assert.match(del.sql, /DELETE FROM `employees` WHERE `id` = 3;/);

    console.log('SMOKE TEST PASSED: 解析 + INSERT/UPDATE/DELETE 全链路正常');
  } finally {
    server.close();
  }
}

main().catch(err => {
  console.error('SMOKE TEST FAILED:', err);
  process.exit(1);
});
