export default {
  'app.tagline': 'Excel 一键转换为批量 INSERT / UPDATE / DELETE 语句',
  'app.generate': '生成 SQL',
  'app.generating': '处理中…',
  'toast.close': '关闭',

  'lang.label': '语言',

  'upload.title': '1. 上传文件',
  'upload.name': '点击选择或拖拽 Excel 文件到此处',
  'upload.hint': '支持 .xlsx / .xls / .csv，单文件最大 25MB',
  'upload.replace': '点击或拖拽可更换文件',

  'config.title': '2. 转换配置',
  'config.sheet': '工作表',
  'config.sheetRows': '{name}（{count} 行）',
  'config.mode': '转换模式',
  'config.tableName': '目标表名',
  'config.tableNamePlaceholder': '例如 employees',
  'config.dbType': '数据库类型',
  'config.batchSize': '单条 INSERT 行数（批量大小）',
  'config.emptyAsNull': '空单元格转为 NULL（否则为空字符串）',

  'mode.insert.label': '批量插入',
  'mode.insert.desc': 'INSERT INTO … VALUES',
  'mode.update.label': '批量更新',
  'mode.update.desc': 'UPDATE … WHERE 主键',
  'mode.delete.label': '批量删除',
  'mode.delete.desc': 'DELETE … WHERE 主键',

  'mapping.title': '3. 字段映射',
  'mapping.keyTip': '（UPDATE / DELETE 需勾选主键作为 WHERE 条件）',
  'mapping.empty': '上传 Excel 文件后，可在此调整字段名、类型与主键',
  'mapping.col.include': '包含',
  'mapping.col.excel': 'Excel 列名',
  'mapping.col.field': '数据库字段名',
  'mapping.col.type': '字段类型',
  'mapping.col.key': '主键',

  'preview.title': '数据预览',
  'preview.tip': '（{name} · 共 {total} 行，显示前 {shown} 行）',

  'sql.title': '4. SQL 预览',
  'sql.copy': '复制 SQL',
  'sql.copied': '已复制 ✓',
  'sql.download': '下载 .sql',
  'sql.empty': '配置完成后点击左侧「生成 SQL」，结果将在此显示',
  'sql.stats': '{rows} 行数据 · {count} 条语句 · {bytes} 字节',

  'error.noFile': '请先上传 Excel 文件',
  'error.noTable': '请填写目标表名',
  'error.noKey': 'UPDATE / DELETE 模式需要在字段映射中至少勾选一个主键',
  'error.noSheet': '文件中没有可用的工作表',
};
