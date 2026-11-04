import React from 'react';
import { useI18n } from '../i18n/index.jsx';

const MODES = [
  { value: 'insert', labelKey: 'mode.insert.label', descKey: 'mode.insert.desc' },
  { value: 'update', labelKey: 'mode.update.label', descKey: 'mode.update.desc' },
  { value: 'delete', labelKey: 'mode.delete.label', descKey: 'mode.delete.desc' },
];

const DB_TYPES = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'sqlite', label: 'SQLite' },
];

export default function ConfigPanel({ config, onChange, sheets, sheetName, onSheetChange, disabled }) {
  const { t } = useI18n();
  const set = patch => onChange({ ...config, ...patch });

  return (
    <div className={disabled ? 'panel-disabled' : ''}>
      <h2 className="card-title">{t('config.title')}</h2>

      {sheets.length > 1 && (
        <label className="field">
          <span className="field-label">{t('config.sheet')}</span>
          <select value={sheetName} onChange={e => onSheetChange(e.target.value)}>
            {sheets.map(s => (
              <option key={s.name} value={s.name}>
                {t('config.sheetRows', { name: s.name, count: s.rowCount })}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="field">
        <span className="field-label">{t('config.mode')}</span>
        <div className="mode-group">
          {MODES.map(m => (
            <button
              key={m.value}
              type="button"
              className={`mode-item${config.mode === m.value ? ' active' : ''}`}
              onClick={() => set({ mode: m.value })}
            >
              <span className="mode-label">{t(m.labelKey)}</span>
              <span className="mode-desc">{t(m.descKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field-label">{t('config.tableName')}</span>
        <input
          type="text"
          value={config.tableName}
          placeholder={t('config.tableNamePlaceholder')}
          onChange={e => set({ tableName: e.target.value })}
        />
      </label>

      <label className="field">
        <span className="field-label">{t('config.dbType')}</span>
        <select value={config.dbType} onChange={e => set({ dbType: e.target.value })}>
          {DB_TYPES.map(d => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      {config.mode === 'insert' && (
        <label className="field">
          <span className="field-label">{t('config.batchSize')}</span>
          <input
            type="number"
            min="1"
            max="1000"
            value={config.batchSize}
            onChange={e => set({ batchSize: Number(e.target.value) || 100 })}
          />
        </label>
      )}

      <label className="field field-inline">
        <input
          type="checkbox"
          checked={config.emptyAsNull}
          onChange={e => set({ emptyAsNull: e.target.checked })}
        />
        <span>{t('config.emptyAsNull')}</span>
      </label>
    </div>
  );
}
