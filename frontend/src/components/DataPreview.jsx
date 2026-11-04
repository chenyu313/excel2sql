import React from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function DataPreview({ sheet }) {
  const { t } = useI18n();
  if (!sheet) return null;

  const cols = sheet.columns.map(c => c.name);

  return (
    <div>
      <h2 className="card-title">
        {t('preview.title')}
        <span className="title-tip">
          {t('preview.tip', { name: sheet.name, total: sheet.rowCount, shown: sheet.sample.length })}
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
