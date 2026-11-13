import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

const MENU_MAX_HEIGHT = 240;
const MENU_GAP = 4;

export default function TypeSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = String(value || '').trim().toLowerCase();
    if (!q) return options;
    const matched = options.filter(o => o.toLowerCase().includes(q));
    return matched.length ? matched : options;
  }, [value, options]);

  const place = () => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const flip = below < 160 && r.top > below;
    setPos(
      flip
        ? { bottom: window.innerHeight - r.top + MENU_GAP, left: r.left, width: r.width, maxHeight: Math.min(MENU_MAX_HEIGHT, r.top - 12) }
        : { top: r.bottom + MENU_GAP, left: r.left, width: r.width, maxHeight: Math.min(MENU_MAX_HEIGHT, below - 12) }
    );
  };

  const openMenu = () => {
    place();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  function commit(opt) {
    onChange(opt);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      setActive(i => (i < 0 ? (dir === 1 ? 0 : filtered.length - 1) : (i + dir + filtered.length) % filtered.length));
    } else if (e.key === 'Enter') {
      if (open && active >= 0 && filtered[active]) {
        e.preventDefault();
        commit(filtered[active]);
      } else {
        setOpen(false);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className={open ? 'type-select is-open' : 'type-select'} ref={rootRef}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setActive(-1);
          if (!open) openMenu();
        }}
        onFocus={openMenu}
        onMouseDown={openMenu}
        onKeyDown={onKeyDown}
      />
      <svg className="type-select-arrow" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <ul
        className={open ? 'type-select-menu open' : 'type-select-menu'}
        id={listId}
        role="listbox"
        style={pos || undefined}
        aria-hidden={!open}
      >
        {filtered.map((opt, i) => (
          <li
            key={opt}
            role="option"
            aria-selected={opt === value}
            className={['type-select-option', i === active ? 'is-active' : '', opt === value ? 'is-selected' : '']
              .join(' ')
              .trim()}
            onMouseDown={e => e.preventDefault()}
            onMouseEnter={() => setActive(i)}
            onClick={() => commit(opt)}
          >
            <span>{opt}</span>
            {opt === value && (
              <svg className="type-select-check" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
