import React from 'react';

const MODES = [
  { value: 'insert', label: '批量插入', desc: 'INSERT INTO … VALUES' },
  { value: 'update', label: '批量更新', desc: 'UPDATE … WHERE 主键' },
  { value: 'delete', label: '批量删除', desc: 'DELETE … WHERE 主键' },
];

const DB_TYPES = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'sqlite', label: 'SQLite' },
];

export default function ConfigPanel({ config, onChange, sheets, sheetName, onSheetChange, disabled }) {
  const set = patch => onChange({ ...config, ...patch });

  return (
    <div className={disabled ? 'panel-disabled' : ''}>
      <h2 className="card-title">2. 转换配置</h2>

      {sheets.length > 1 && (
        <label className="field">
          <span className="field-label">工作表</span>
          <select value={sheetName} onChange={e => onSheetChange(e.target.value)}>
            {sheets.map(s => (
              <option key={s.name} value={s.name}>
                {s.name}（{s.rowCount} 行）
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="field">
        <span className="field-label">转换模式</span>
        <div className="mode-group">
          {MODES.map(m => (
            <button
              key={m.value}
              type="button"
              className={`mode-item${config.mode === m.value ? ' active' : ''}`}
              onClick={() => set({ mode: m.value })}
            >
              <span className="mode-label">{m.label}</span>
              <span className="mode-desc">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field-label">目标表名</span>
        <input
          type="text"
          value={config.tableName}
          placeholder="例如 employees"
          onChange={e => set({ tableName: e.target.value })}
        />
      </label>

      <label className="field">
        <span className="field-label">数据库类型</span>
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
          <span className="field-label">单条 INSERT 行数（批量大小）</span>
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
        <span>空单元格转为 NULL（否则为空字符串）</span>
      </label>
    </div>
  );
}
