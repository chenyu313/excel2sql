import React, { useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function UploadZone({ fileName, busy, onFile }) {
  const { t } = useI18n();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function pick(files) {
    const file = files && files[0];
    if (file) onFile(file);
  }

  return (
    <div>
      <h2 className="card-title">{t('upload.title')}</h2>
      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}${busy ? ' disabled' : ''}`}
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          if (!busy) pick(e.dataTransfer.files);
        }}
      >
        <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
          <path d="M14 3v5h5" />
          <path d="M12 12v6M9 15l3 3 3-3" />
        </svg>
        {fileName ? (
          <>
            <div className="upload-name">{fileName}</div>
            <div className="upload-hint">{t('upload.replace')}</div>
          </>
        ) : (
          <>
            <div className="upload-name">{t('upload.name')}</div>
            <div className="upload-hint">{t('upload.hint')}</div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        hidden
        onChange={e => {
          pick(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
