#!/usr/bin/env node
/**
 * lint-data.js — 检查章节规格文件的质量问题（不手查）：
 *   - 英文侧残留中文
 *   - 必填字段缺失 / 为空
 *   - 公式字段未用 $...$ 包裹
 *   - 题号重复、缺 official/src
 *
 * 用法: node scripts/lint-data.js <dataDir>
 */
const fs = require('fs');
const path = require('path');

const dataDir = process.argv[2] || path.join(__dirname, '..', 'data');
const CJK = /[\u4e00-\u9fff]/;

function findSpecs(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findSpecs(p));
    else if (e.name.endsWith('.spec.json')) out.push(p);
  }
  return out;
}

const issues = [];
function bad(file, where, msg) { issues.push(`${path.basename(file)} :: ${where} :: ${msg}`); }

function checkBilingual(file, where, obj) {
  if (obj === undefined || obj === null) return;
  if (typeof obj === 'string') {
    if (CJK.test(obj)) bad(file, where, '字符串里含中文（应为 {zh,en} 对象）');
    return;
  }
  if (typeof obj !== 'object') return;
  const zh = obj.zh, en = obj.en;
  if (zh === undefined || en === undefined) { bad(file, where, '缺少 zh 或 en 字段'); return; }
  if (!String(zh).trim()) bad(file, where, 'zh 为空');
  if (!String(en).trim()) bad(file, where, 'en 为空');
  if (CJK.test(String(en))) bad(file, where, `en 侧残留中文：${String(en).slice(0, 40)}`);
}

for (const file of findSpecs(dataDir).sort()) {
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const s of spec.sections || []) {
    if (!s.id) bad(file, 'sections', '缺 id');
    checkBilingual(file, `section ${s.id} title`, s.title);
    (s.points || []).forEach((p, i) => checkBilingual(file, `section ${s.id} point[${i}]`, p));
  }
  (spec.concepts || []).forEach((c, i) => {
    checkBilingual(file, `concept[${i}]`, c.title); checkBilingual(file, `concept[${i}]`, c.body);
    if (!c.body) bad(file, `concept[${i}]`, '缺 body');
  });
  (spec.pitfalls || []).forEach((c, i) => {
    checkBilingual(file, `pitfall[${i}]`, c.title); checkBilingual(file, `pitfall[${i}]`, c.body);
  });
  (spec.sheet || []).forEach((g, gi) => {
    checkBilingual(file, `sheet[${gi}] group`, g.group);
    (g.items || []).forEach((it, ii) => {
      if (!it.f || !/^\$[\s\S]+\$$/.test(String(it.f).trim())) bad(file, `sheet[${gi}].item[${ii}]`, `f 未用 $...$ 包裹：${it.f}`);
      checkBilingual(file, `sheet[${gi}].item[${ii}] note`, it.note);
    });
  });
  const seen = new Set();
  (spec.problems || []).forEach((p, i) => {
    const w = `problem[${i}] ${p.num || ''}`;
    if (!p.num) bad(file, w, '缺 num');
    if (seen.has(p.num)) bad(file, w, '题号重复');
    seen.add(p.num);
    if (!p.sec) bad(file, w, '缺 sec');
    checkBilingual(file, w, p.type);
    checkBilingual(file, w, p.q);
    checkBilingual(file, w, p.ans);
    if (!p.ans || !String(p.ans.zh || p.ans).trim()) bad(file, w, '缺答案');
    if (!p.steps || !p.steps.length) bad(file, w, '缺 steps');
    (p.steps || []).forEach((st, si) => checkBilingual(file, `${w} step[${si}]`, st));
    const off = p.official ? (p.official.zh || p.official.en || p.official) : '';
    if (!off) bad(file, w, '缺 official');
    if (p.official && !p.src) bad(file, w, '有 official 但缺 src 页码');
    checkBilingual(file, w, p.src);
  });
}

console.log(`checked ${findSpecs(dataDir).length} spec file(s)`);
if (issues.length) {
  console.log(`--- issues (${issues.length}) ---`);
  for (const i of issues.slice(0, 80)) console.log('  ' + i);
  process.exit(1);
}
console.log('--- issues (0) ---');
