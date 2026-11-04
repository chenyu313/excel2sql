export default {
  'app.tagline': 'Excel を一括 INSERT / UPDATE / DELETE 文に変換',
  'app.generate': 'SQL を生成',
  'app.generating': '処理中…',
  'toast.close': '閉じる',

  'lang.label': '言語',

  'upload.title': '1. ファイルアップロード',
  'upload.name': 'クリックまたは Excel ファイルをここにドラッグ',
  'upload.hint': '.xlsx / .xls / .csv 対応、1ファイル最大 25MB',
  'upload.replace': 'クリックまたはドラッグでファイルを変更',

  'config.title': '2. 変換設定',
  'config.sheet': 'ワークシート',
  'config.sheetRows': '{name}（{count} 行）',
  'config.mode': '変換モード',
  'config.tableName': '対象テーブル名',
  'config.tableNamePlaceholder': '例: employees',
  'config.dbType': 'データベース種別',
  'config.batchSize': '1回の INSERT 行数（バッチサイズ）',
  'config.emptyAsNull': '空セルを NULL に変換（オフの場合は空文字列）',

  'mode.insert.label': '一括挿入',
  'mode.insert.desc': 'INSERT INTO … VALUES',
  'mode.update.label': '一括更新',
  'mode.update.desc': 'UPDATE … WHERE 主キー',
  'mode.delete.label': '一括削除',
  'mode.delete.desc': 'DELETE … WHERE 主キー',

  'mapping.title': '3. フィールドマッピング',
  'mapping.keyTip': '（UPDATE / DELETE では WHERE 条件として主キーを選択）',
  'mapping.empty': 'Excel ファイルをアップロードすると、フィールド名・型・主キーを調整できます',
  'mapping.col.include': '含む',
  'mapping.col.excel': 'Excel 列名',
  'mapping.col.field': 'DB フィールド名',
  'mapping.col.type': 'フィールド型',
  'mapping.col.key': '主キー',

  'preview.title': 'データプレビュー',
  'preview.tip': '（{name} · 全 {total} 行、先頭 {shown} 行を表示）',

  'sql.title': '4. SQL プレビュー',
  'sql.copy': 'SQL をコピー',
  'sql.copied': 'コピー済 ✓',
  'sql.download': '.sql をダウンロード',
  'sql.empty': '設定後に左側の「SQL を生成」をクリックすると、結果がここに表示されます',
  'sql.stats': '{rows} 行データ · {count} ステートメント · {bytes} バイト',

  'error.noFile': '先に Excel ファイルをアップロードしてください',
  'error.noTable': '対象テーブル名を入力してください',
  'error.noKey': 'UPDATE / DELETE モードでは、フィールドマッピングで主キーを少なくとも1つ選択してください',
  'error.noSheet': 'ファイル内に利用可能なワークシートがありません',
};
