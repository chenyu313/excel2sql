import React, { useMemo, useState } from 'react';
import { tokenizeSql } from '../highlight';

export default function SqlPreview({ sql, stats, tableName, mode }) {
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
        <h2 className="card-title">4. SQL 预览</h2>
        <div className="actions">
          <button className="btn" onClick={copy} disabled={!sql}>
            {copied ? '已复制 ✓' : '复制 SQL'}
          </button>
          <button className="btn" onClick={download} disabled={!sql}>
            下载 .sql
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats">
          {stats.rowCount} 行数据 · {stats.statementCount} 条语句 · {new Blob([sql]).size} 字节
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
        <div className="empty">配置完成后点击左侧「生成 SQL」，结果将在此显示</div>
      )}
    </div>
  );
}
