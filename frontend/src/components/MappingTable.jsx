import React from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function MappingTable({ mapping, onChange, mode, typeOptions }) {
  const { t } = useI18n();
  const showKey = mode !== 'insert';

  if (!mapping.length) {
    return (
      <div>
        <h2 className="card-title">{t('mapping.title')}</h2>
        <div className="empty">{t('mapping.empty')}</div>
      </div>
    );
  }

  const update = (i, patch) => onChange(mapping.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  return (
    <div>
      <h2 className="card-title">
        {t('mapping.title')}
        {showKey && <span className="title-tip">{t('mapping.keyTip')}</span>}
      </h2>
      <div className="table-scroll">
        <table className="mapping-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>{t('mapping.col.include')}</th>
              <th>{t('mapping.col.excel')}</th>
              <th>{t('mapping.col.field')}</th>
              <th style={{ width: 160 }}>{t('mapping.col.type')}</th>
              {showKey && <th style={{ width: 56 }}>{t('mapping.col.key')}</th>}
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
