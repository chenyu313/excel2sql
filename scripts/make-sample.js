'use strict';

/**
 * 生成示例 Excel 文件 samples/员工信息.xlsx，用于快速体验完整流程。
 * 用法: npm run sample
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const employees = [
  ['工号', '姓名', '部门', '入职日期', '月薪', '是否在职'],
  [1001, '张三', '研发部', new Date(2023, 2, 15), 18500.5, '是'],
  [1002, '李四', '产品部', new Date(2022, 7, 1), 22000, '是'],
  [1003, "O'Neil", '设计部', new Date(2024, 0, 20), 16800, '否'],
  [1004, '王五', '研发部', new Date(2021, 11, 11), 25000.75, '是'],
  [1005, '赵六', '运营部', new Date(2025, 3, 8), 15200, '是'],
  [1006, '钱七', '研发部', new Date(2020, 5, 30), 31000, '否'],
  [1007, '孙八', '产品部', new Date(2023, 9, 12), 19800, '是'],
  [1008, '周九', '设计部', new Date(2024, 6, 25), 17500, '是'],
];

const departments = [
  ['部门编号', '部门名称', '负责人'],
  ['D01', '研发部', '王五'],
  ['D02', '产品部', '李四'],
  ['D03', '设计部', '周九'],
  ['D04', '运营部', '赵六'],
];

const wb = XLSX.utils.book_new();
const ws1 = XLSX.utils.aoa_to_sheet(employees);
ws1['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 8 }];
XLSX.utils.book_append_sheet(wb, ws1, '员工');

const ws2 = XLSX.utils.aoa_to_sheet(departments);
ws2['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, ws2, '部门');

const dir = path.join(__dirname, '..', 'samples');
fs.mkdirSync(dir, { recursive: true });
const out = path.join(dir, '员工信息.xlsx');
XLSX.writeFile(wb, out);
console.log('示例文件已生成:', out);
