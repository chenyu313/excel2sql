import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

/**
 * 语言切换下拉组件。
 * - 展示各语言的本地名称（简体中文 / English / 日本語）
 * - 点击外部、Escape 关闭；切换立即生效并持久化（见 i18n Provider）
 */
export default function LanguageSwitcher() {
  const { lang, languages, changeLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const current = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function pick(code) {
    // 字典为静态内置，切换同步完成；未知语言码会被 Provider 忽略
    changeLang(code);
    setOpen(false);
  }

  return (
    <div className="lang-switcher" ref={rootRef}>
      <button
        type="button"
        className="lang-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('lang.label')}
        onClick={() => setOpen(o => !o)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 4 5.7 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.7-4-9s1.5-6.4 4-9z" />
        </svg>
        <span className="lang-btn-name">{current.nativeName}</span>
        <svg className={`lang-caret${open ? ' up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="lang-menu" role="listbox" aria-label={t('lang.label')}>
          {languages.map(l => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={`lang-option${l.code === lang ? ' active' : ''}`}
                onClick={() => pick(l.code)}
              >
                <span>{l.nativeName}</span>
                {l.code === lang && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="14" height="14" aria-hidden="true">
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
