import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import zhCN from './locales/zh-CN.js';
import en from './locales/en.js';
import ja from './locales/ja.js';

export const LANGUAGES = [
  { code: 'zh-CN', nativeName: '简体中文' },
  { code: 'en', nativeName: 'English' },
  { code: 'ja', nativeName: '日本語' },
];

const DICTS = { 'zh-CN': zhCN, en, ja };
const DEFAULT_LANG = 'zh-CN';
const STORAGE_KEY = 'excel2sql-lang';

/** 读取持久化偏好；非法/缺失时回退默认语言 */
function loadInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTS[saved]) return saved;
  } catch {
    // 隐私模式等场景 localStorage 不可用，直接使用默认语言
  }
  return DEFAULT_LANG;
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(loadInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // 持久化失败不影响界面切换
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = useCallback(code => {
    // 未知语言码直接忽略，避免页面出现空白文案
    if (DICTS[code]) setLang(code);
  }, []);

  const t = useCallback(
    (key, vars) => {
      let text = DICTS[lang]?.[key] ?? DICTS[DEFAULT_LANG][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, languages: LANGUAGES, changeLang, t }), [lang, changeLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n 必须在 <I18nProvider> 内使用');
  return ctx;
}
