# Excel2SQL

Excel 一键转换为标准 SQL 语句的桌面 / Web 工具，支持批量 **INSERT / UPDATE / DELETE** 三种模式，可打包为 macOS 与 Windows 可执行程序。

## 功能特性

- **三种转换模式**：批量插入（多行 VALUES 合并）、批量更新（按主键 WHERE）、批量删除（按主键 WHERE）
- **表头映射**：Excel 列名 → 数据库字段名自由编辑，可按列勾选是否参与转换
- **字段类型自动识别**：INT / BIGINT / DECIMAL / DATE / DATETIME / BOOLEAN / VARCHAR(n) / TEXT，可手动覆盖
- **自定义表名**、数据库方言（MySQL / PostgreSQL / SQL Server / Oracle / SQLite）、INSERT 批量大小
- **SQL 预览**：语法高亮、统计信息、一键复制、导出 .sql 文件
- **多工作表**：自动识别并支持切换；空单元格可配置为 NULL
- **安全可靠**：字符串单引号转义、标识符按方言引用、WHERE 空值自动使用 `IS NULL`

## 技术栈与目录结构

前端 React + Vite，后端 Express（SheetJS/xlsx 解析），Electron + electron-builder 桌面打包。

```
excel2sql/
├── package.json            # 根工程：脚本编排 + Electron 打包入口
├── electron-builder.yml    # macOS / Windows 打包配置
├── backend/                # 后端服务
│   ├── server.js           # 服务入口（startServer，可被 Electron 复用）
│   ├── src/
│   │   ├── app.js          # Express 路由：/api/parse、/api/generate
│   │   ├── excelParser.js  # 工作簿解析、表头规范化
│   │   ├── typeDetector.js # 字段类型自动识别
│   │   ├── sqlGenerator.js # INSERT / UPDATE / DELETE 生成核心
│   │   └── store.js        # 上传文件内存会话（30 分钟 TTL）
│   └── test/               # 单元测试（node:test）
├── frontend/               # 前端（React + Vite）
│   └── src/
│       ├── App.jsx         # 主页面与状态编排
│       └── components/     # UploadZone / ConfigPanel / MappingTable / DataPreview / SqlPreview
├── electron/               # 桌面壳（内嵌后端服务，随机端口加载页面）
├── scripts/
│   ├── make-sample.js      # 生成示例 Excel
│   └── smoke-test.js       # 端到端自检
└── samples/                # 示例文件（npm run sample 生成）
```

## 环境要求

- Node.js **>= 18**（建议 20+）
- 打包 Windows 安装包**不需要** Windows 机器（electron-builder 内置 NSIS，可在 macOS 直接交叉构建）

## 快速开始

```bash
# 1. 安装依赖（根目录安装时会自动安装前端依赖）
npm install

# 2. 开发模式（后端 5210 + 前端 5173，接口自动代理）
npm run dev
# 浏览器打开 http://localhost:5173
```

```bash
# 生产模式（纯浏览器使用）：构建前端后由后端统一托管
npm run build
npm start
# 浏览器打开 http://localhost:5210
```

```bash
# 桌面版运行（Electron）
npm run electron
```

## 打包分发

```bash
# macOS：生成 release/Excel2SQL-*.dmg 与 .zip
npm run dist:mac

# Windows：生成 release/Excel2SQL Setup *.exe（安装包）与 *portable.exe（绿色免安装）
npm run dist:win

# 同时构建两个平台
npm run dist
```

打包产物位于 `release/` 目录。未配置代码签名：

- macOS 首次打开如提示“无法验证开发者”，在 **系统设置 → 隐私与安全性** 中点击“仍要打开”；
- Windows 如出现 SmartScreen 提示，选择“更多信息 → 仍要运行”。

## 测试与自检

```bash
npm test        # 单元测试（类型识别 + SQL 生成，16 个用例）
npm run smoke   # 端到端自检：起服务 → 上传 Excel → 三种模式全链路校验
npm run sample  # 生成 samples/员工信息.xlsx 示例文件
```

## 使用流程

1. **上传文件**：点击或拖拽 `.xlsx / .xls / .csv`（单文件最大 25MB）；
2. **转换配置**：选择工作表、转换模式、目标表名、数据库方言、批量大小；
3. **字段映射**：编辑数据库字段名与类型，勾选参与转换的列；UPDATE / DELETE 模式需勾选主键；
4. **生成 SQL**：预览高亮 SQL，复制或下载 `.sql` 文件。

## API 说明（二次开发）

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/health` | GET | 健康检查 |
| `/api/parse` | POST | multipart 上传 `file`，返回 `fileId`、工作表、表头、推断类型、前 5 行样例 |
| `/api/generate` | POST | JSON：`{ fileId, sheet, mode, tableName, dialect, batchSize, emptyAsNull, mapping }`，返回 `{ sql, statementCount, rowCount }` |

`mapping` 项格式：`{ excelCol, field, type, include, isKey }`。

## 常见问题

- **`npm install` 卡在 Electron 下载**：Electron 二进制约 100MB，默认从 GitHub 下载较慢。使用国内镜像环境变量安装：
  ```bash
  ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npm install
  ```
  若已安装依赖但桌面版无法启动（缺少 `node_modules/electron/dist`），单独补下二进制：
  ```bash
  ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ node node_modules/electron/install.js
  ```
- **`npm run dev` 报 `vite: command not found`**：前端依赖未安装（通常是根目录安装被中断所致），执行 `npm --prefix frontend install` 后重试。
- **`npm audit` 漏洞说明**：
  - `xlsx` 高危漏洞**已修复**：已从 SheetJS 官方 CDN 获取修复版 0.20.3 并以 `file:vendor/xlsx-0.20.3.tgz` 本地依赖方式内置（npm registry 停留在有漏洞的 0.18.5，官方修复版仅发布在其 CDN）。生产依赖审计为 0。请勿删除 `vendor/` 目录。
  - 其余漏洞全部位于 `electron` / `electron-builder` 打包工具链（devDependencies）与 `vite` 开发服务器，仅在开发/打包时存在，不进入分发应用的运行时，可安全忽略。**请勿执行 `npm audit fix --force`**，会破坏依赖版本。
- **`install-scripts` 警告**：本机 npm 安全策略会拦截依赖的安装脚本。esbuild / fsevents 已通过可选依赖自带二进制，不受影响；Electron 二进制下载方式见上一条。
- **`dist:mac` 卡在 `packaging platform=darwin` 不动**：electron-builder 需从 GitHub 下载 Electron zip（约 95MB），网络慢时会假死。修复：确认完整 zip 已在缓存后重跑即可，缓存路径为 `~/Library/Caches/electron/electron-v<版本>-darwin-arm64.zip`（可先执行 `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ node node_modules/electron/install.js` 下载，再从其缓存子目录拷贝到该路径）。
- **端口被占用**：`PORT=5300 npm start` 指定其他端口。
- **大文件限制**：默认 25MB，修改 `backend/src/app.js` 中 `fileSize` 上限。
- **上传会话过期**：解析结果保留 30 分钟，超时后重新上传即可。
