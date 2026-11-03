import React from 'react';

export default function DataPreview({ sheet }) {
  if (!sheet) return null;

  const cols = sheet.columns.map(c => c.name);

  return (
    <div>
      <h2 className="card-title">
        数据预览
        <span className="title-tip">
          （{sheet.name} · 共 {sheet.rowCount} 行，显示前 {sheet.sample.length} 行）
        </span>
      </h2>
      <div className="table-scroll">
        <table className="preview-table">
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.sample.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td key={j}>{v === null || v === undefined ? <span className="cell-null">NULL</span> : String(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
