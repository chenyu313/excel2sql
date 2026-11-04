import React, { useMemo, useState } from 'react';
import { parseFile, generateSql } from './api';
import UploadZone from './components/UploadZone.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';
import MappingTable from './components/MappingTable.jsx';
import DataPreview from './components/DataPreview.jsx';
import SqlPreview from './components/SqlPreview.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import { useI18n } from './i18n/index.jsx';

const TYPE_OPTIONS = [
  'INT',
  'BIGINT',
  'DECIMAL(18,4)',
  'VARCHAR(64)',
  'VARCHAR(128)',
  'VARCHAR(255)',
  'VARCHAR(512)',
  'TEXT',
  'DATE',
  'DATETIME',
  'BOOLEAN',
];

/** 表头 / 文件名 → 合法字段名 */
function toFieldName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[/.\\-]+/g, '_');
}

function buildMapping(sheet) {
  return sheet.columns.map(c => ({
    excelCol: c.name,
    field: toFieldName(c.name),
    type: c.type,
    include: true,
    isKey: false,
  }));
}

export default function App() {
  const { t } = useI18n();
  const [fileInfo, setFileInfo] = useState(null);
  const [sheetName, setSheetName] = useState('');
  const [config, setConfig] = useState({
    mode: 'insert',
    tableName: '',
    dbType: 'mysql',
    batchSize: 100,
    emptyAsNull: true,
  });
  const [mapping, setMapping] = useState([]);
  const [sql, setSql] = useState('');
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sheet = useMemo(
    () => fileInfo?.sheets.find(s => s.name === sheetName) || fileInfo?.sheets[0] || null,
    [fileInfo, sheetName]
  );

  async function onFile(file) {
    setError('');
    setBusy(true);
    setSql('');
    setStats(null);
    try {
      const info = await parseFile(file);
      if (!info.sheets.length) throw new Error(t('error.noSheet'));
      setFileInfo(info);
      setSheetName(info.sheets[0].name);
      setMapping(buildMapping(info.sheets[0]));
      const base = (info.fileName || 'my_table').replace(/\.[^.]+$/, '');
      setConfig(c => ({ ...c, tableName: toFieldName(base) || 'my_table' }));
    } catch (e) {
      setError(e.message);
      setFileInfo(null);
      setMapping([]);
    } finally {
      setBusy(false);
    }
  }

  function onSheetChange(name) {
    setSheetName(name);
    const sh = fileInfo.sheets.find(s => s.name === name);
    if (sh) setMapping(buildMapping(sh));
    setSql('');
    setStats(null);
  }

  async function onGenerate() {
    setError('');
    if (!fileInfo || !sheet) return setError(t('error.noFile'));
    if (!config.tableName.trim()) return setError(t('error.noTable'));
    if (config.mode !== 'insert' && !mapping.some(m => m.isKey && m.include !== false)) {
      return setError(t('error.noKey'));
    }
    setBusy(true);
    try {
      const result = await generateSql({
        fileId: fileInfo.fileId,
        sheet: sheet.name,
        ...config,
        mapping,
      });
      setSql(result.sql);
      setStats(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Excel2SQL</h1>
          <p>{t('app.tagline')}</p>
        </div>
        <LanguageSwitcher />
      </header>

      {error && (
        <div className="toast" role="alert">
          <span>{error}</span>
          <button className="toast-close" onClick={() => setError('')} aria-label={t('toast.close')}>
            ×
          </button>
        </div>
      )}

      <div className="layout">
        <aside className="sidebar">
          <section className="card">
            <UploadZone fileName={fileInfo?.fileName} busy={busy} onFile={onFile} />
          </section>

          <section className="card">
            <ConfigPanel
              config={config}
              onChange={setConfig}
              sheets={fileInfo?.sheets || []}
              sheetName={sheet?.name || ''}
              onSheetChange={onSheetChange}
              disabled={!fileInfo}
            />
          </section>

          <button className="btn-primary btn-generate" onClick={onGenerate} disabled={!fileInfo || busy}>
            {busy ? t('app.generating') : t('app.generate')}
          </button>
        </aside>

        <main className="content">
          <section className="card">
            <MappingTable mapping={mapping} onChange={setMapping} mode={config.mode} typeOptions={TYPE_OPTIONS} />
          </section>

          <section className="card">
            <DataPreview sheet={sheet} />
          </section>

          <section className="card card-sql">
            <SqlPreview sql={sql} stats={stats} tableName={config.tableName} mode={config.mode} />
          </section>
        </main>
      </div>
    </div>
  );
}
