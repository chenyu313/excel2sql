# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/) 规范。

## [1.0.0] - 2026-11-04

首个正式版本。

### 新增（Features）

- Excel（.xlsx / .xls / .csv）上传解析，自动识别工作表、表头与数据
- 三种 SQL 生成模式：批量 INSERT、批量 UPDATE、批量 DELETE
- 字段类型自动推断：INT / BIGINT / DECIMAL(18,4) / VARCHAR(N) / TEXT / DATE / DATETIME / BOOLEAN
- 表头与目标列映射配置，支持自定义目标表名、WHERE 条件列（UPDATE/DELETE）
- SQL 实时预览（语法高亮、行数统计）、一键复制、导出 .sql 文件、直接下载数据库执行
- 响应式图形界面（React + Vite），适配不同分辨率
- Electron 桌面端，支持 macOS（DMG / ZIP）与 Windows（NSIS 安装包 / 绿色版）打包

### 修复（Bug Fixes）

- 修复 multer(busboy) 按 Latin-1 解码导致的中文文件名乱码（如「员工信息.xlsx」显示为 `åå·¥ä¿¡æ¯.xlsx`），含非 UTF-8 名称的回退保护
- 修复 xlsx 库日期回读存在 ±1ms 量化偏差导致日期列被误判为时间戳的问题（归一化到秒级）

### 安全（Security）

- xlsx 升级至官方修复版 0.20.3（修复原型污染 / ReDoS 高危漏洞），以 `vendor/` 本地依赖方式内置，生产依赖漏洞审计为 0

### 已知问题（Known Issues）

- 应用未进行 Apple 开发者签名 / Windows 代码签名，首次启动需在系统安全设置中手动允许
- Windows 安装包需在 Windows 环境（或 CI）构建；macOS 本机交叉构建受 wine 依赖限制
- `npm audit` 中 electron-builder / vite 相关的 devDependencies 漏洞为开发期工具链问题，不影响分发产物运行时
