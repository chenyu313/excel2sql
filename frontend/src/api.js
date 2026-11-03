async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);
  return data;
}

/** 上传并解析 Excel 文件 */
export async function parseFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/parse', { method: 'POST', body: fd });
  return handle(res);
}

/** 根据配置生成 SQL */
export async function generateSql(payload) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle(res);
}
