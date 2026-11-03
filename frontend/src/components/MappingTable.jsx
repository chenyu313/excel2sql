import React from 'react';

export default function MappingTable({ mapping, onChange, mode, typeOptions }) {
  const showKey = mode !== 'insert';

  if (!mapping.length) {
    return (
      <div>
        <h2 className="card-title">3. 字段映射</h2>
        <div className="empty">上传 Excel 文件后，可在此调整字段名、类型与主键</div>
      </div>
    );
  }

  const update = (i, patch) => onChange(mapping.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  return (
    <div>
      <h2 className="card-title">
        3. 字段映射
        {showKey && <span className="title-tip">（UPDATE / DELETE 需勾选主键作为 WHERE 条件）</span>}
      </h2>
      <div className="table-scroll">
        <table className="mapping-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>包含</th>
              <th>Excel 列名</th>
              <th>数据库字段名</th>
              <th style={{ width: 160 }}>字段类型</th>
              {showKey && <th style={{ width: 56 }}>主键</th>}
            </tr>
          </thead>
          <tbody>
            {mapping.map((m, i) => (
              <tr key={m.excelCol} className={m.include === false ? 'row-excluded' : ''}>
                <td>
                  <input type="checkbox" checked={m.include !== false} onChange={e => update(i, { include: e.target.checked })} />
                </td>
                <td className="cell-excel-col">{m.excelCol}</td>
                <td>
                  <input type="text" value={m.field} onChange={e => update(i, { field: e.target.value })} />
                </td>
                <td>
                  <input type="text" list="type-options" value={m.type} onChange={e => update(i, { type: e.target.value })} />
                </td>
                {showKey && (
                  <td>
                    <input type="checkbox" checked={!!m.isKey} onChange={e => update(i, { isKey: e.target.checked })} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <datalist id="type-options">
        {typeOptions.map(t => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  );
}
