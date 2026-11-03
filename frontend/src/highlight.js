// 轻量 SQL 语法高亮：字符串 / 数字 / 关键字 / 注释
const TOKEN_RE =
  /('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|(\b(?:INSERT|INTO|VALUES|UPDATE|SET|DELETE|FROM|WHERE|AND|IS|NULL|TRUE|FALSE)\b)|(--[^\n]*)/g;

export function tokenizeSql(sql) {
  const tokens = [];
  let last = 0;
  let m;
  while ((m = TOKEN_RE.exec(sql)) !== null) {
    if (m.index > last) tokens.push({ t: 'plain', v: sql.slice(last, m.index) });
    const [full, str, num, kw, comment] = m;
    if (comment) tokens.push({ t: 'comment', v: comment });
    else if (str) tokens.push({ t: 'string', v: str });
    else if (kw) tokens.push({ t: 'kw', v: kw });
    else if (num) tokens.push({ t: 'num', v: num });
    last = m.index + full.length;
  }
  if (last < sql.length) tokens.push({ t: 'plain', v: sql.slice(last) });
  return tokens;
}
