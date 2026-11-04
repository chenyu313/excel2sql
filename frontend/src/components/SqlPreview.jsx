import React, { useMemo, useState } from 'react';
import { tokenizeSql } from '../highlight';
import { useI18n } from '../i18n/index.jsx';

export default function SqlPreview({ sql, stats, tableName, mode }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const tokens = useMemo(() => tokenizeSql(sql), [sql]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(sql);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = sql;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([sql], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName || 'output'}_${mode}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="sql-preview">
      <div className="card-title-row">
        <h2 className="card-title">{t('sql.title')}</h2>
        <div className="actions">
          <button className="btn" onClick={copy} disabled={!sql}>
            {copied ? t('sql.copied') : t('sql.copy')}
          </button>
          <button className="btn" onClick={download} disabled={!sql}>
            {t('sql.download')}
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats">
          {t('sql.stats', { rows: stats.rowCount, count: stats.statementCount, bytes: new Blob([sql]).size })}
        </div>
      )}

      {sql ? (
        <pre className="sql-box">
          {tokens.map((t, i) => (
            <span key={i} className={`tk-${t.t}`}>
              {t.v}
            </span>
          ))}
        </pre>
      ) : (
        <div className="empty">{t('sql.empty')}</div>
      )}
    </div>
  );
}
