export default {
  'app.tagline': 'Convert Excel to batch INSERT / UPDATE / DELETE statements',
  'app.generate': 'Generate SQL',
  'app.generating': 'Processing…',
  'toast.close': 'Close',

  'lang.label': 'Language',

  'upload.title': '1. Upload File',
  'upload.name': 'Click to select or drag an Excel file here',
  'upload.hint': 'Supports .xlsx / .xls / .csv, max 25MB per file',
  'upload.replace': 'Click or drag to replace the file',

  'config.title': '2. Conversion Settings',
  'config.sheet': 'Worksheet',
  'config.sheetRows': '{name} ({count} rows)',
  'config.mode': 'Mode',
  'config.tableName': 'Target Table',
  'config.tableNamePlaceholder': 'e.g. employees',
  'config.dbType': 'Database Type',
  'config.batchSize': 'Rows per INSERT (batch size)',
  'config.emptyAsNull': 'Convert empty cells to NULL (otherwise empty string)',

  'mode.insert.label': 'Batch Insert',
  'mode.insert.desc': 'INSERT INTO … VALUES',
  'mode.update.label': 'Batch Update',
  'mode.update.desc': 'UPDATE … WHERE primary key',
  'mode.delete.label': 'Batch Delete',
  'mode.delete.desc': 'DELETE … WHERE primary key',

  'mapping.title': '3. Field Mapping',
  'mapping.keyTip': '(UPDATE / DELETE requires at least one primary key for WHERE)',
  'mapping.empty': 'Upload an Excel file to edit field names, types and primary keys',
  'mapping.col.include': 'Include',
  'mapping.col.excel': 'Excel Column',
  'mapping.col.field': 'Database Field',
  'mapping.col.type': 'Field Type',
  'mapping.col.key': 'Key',

  'preview.title': 'Data Preview',
  'preview.tip': '({name} · {total} rows total, showing first {shown})',

  'sql.title': '4. SQL Preview',
  'sql.copy': 'Copy SQL',
  'sql.copied': 'Copied ✓',
  'sql.download': 'Download .sql',
  'sql.empty': 'Click "Generate SQL" on the left after configuration; results appear here',
  'sql.stats': '{rows} rows · {count} statements · {bytes} bytes',

  'error.noFile': 'Please upload an Excel file first',
  'error.noTable': 'Please enter the target table name',
  'error.noKey': 'UPDATE / DELETE mode requires at least one primary key in field mapping',
  'error.noSheet': 'No usable worksheet found in the file',
};
