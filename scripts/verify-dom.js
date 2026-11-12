#!/usr/bin/env node
/**
 * verify-dom.js — 用 Edge headless 导出渲染后的 DOM，统计关键指标并做中英对等校验。
 *
 * 用法:
 *   node scripts/verify-dom.js <baseUrl>
 *   例：node scripts/verify-dom.js http://127.0.0.1:8765
 *
 * 指标:
 *   - katex      : KaTeX 成功渲染的公式数（应 > 0）
 *   - math-raw   : KaTeX 降级数（必须为 0）
 *   - problems   : 自测题卡数（中英必须一致）
 *   - concepts / pitfalls / sheet-item / section-card : 内容块数量（中英必须一致）
 *   - cjkFormula : 被误判为公式的中文片段数（必须为 0）
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const EDGE = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!EDGE) {
  console.error('Edge not found; skip DOM verification.');
  process.exit(2);
}

function dumpDom(url) {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
      '--virtual-time-budget=8000', '--dump-dom',
      `--user-data-dir=${path.join(process.env.TEMP || '.', 'edge-profile')}`,
      url,
    ];
    const proc = spawn(EDGE, args, { stdio: ['ignore', 'pipe', 'ignore'] });
    let buf = '';
    proc.stdout.on('data', (d) => { buf += d.toString(); });
    proc.on('error', reject);
    proc.on('close', () => resolve(buf));
  });
}

function count(html, needle) {
  let n = 0, i = 0;
  while ((i = html.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}

function metrics(html) {
  const texBlocks = [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map((m) => m[1]);
  const cjkFormula = texBlocks.filter((t) => /[\u4e00-\u9fff]/.test(t.replace(/\\text\{[^{}]*\}/g, ''))).length;
  return {
    katex: count(html, 'class="katex'),
    mathRaw: count(html, 'math-raw'),
    problems: count(html, 'class="card problem'),
    concepts: count(html, 'card concept'),
    pitfalls: count(html, 'card pitfall'),
    sheetItems: count(html, 'sheet-item'),
    sectionCards: count(html, 'class="card-head"><span class="sec-id"'),
    cjkFormula,
  };
}

const VIEWS = ['overview', 'concepts', 'pitfalls', 'sheet', 'quiz'];
// 结构性指标必须中英相等；katex 数量允许不同（两种语言措辞里的公式个数可能本就不同），只要求 > 0
const COMPARE_KEYS = ['mathRaw', 'problems', 'concepts', 'pitfalls', 'sheetItems', 'sectionCards'];

async function page(lang, ch, view) {
  const file = lang === 'zh' ? 'index.html' : 'index-en.html';
  const url = `${BASE}/${file}?ch=${ch}&view=${view}`;
  const html = await dumpDom(url);
  return metrics(html);
}

async function run() {
  let fail = 0;
  const rows = [];

  // 全部视图在第 1 章上对比
  for (const view of VIEWS) {
    const zh = await page('zh', 0, view);
    const en = await page('en', 0, view);
    rows.push({ label: `ch1/${view}`, zh, en });
  }
  // 每章的自测题库
  for (const ch of [1, 2, 3]) {
    const zh = await page('zh', ch, 'quiz');
    const en = await page('en', ch, 'quiz');
    rows.push({ label: `ch${ch + 1}/quiz`, zh, en });
  }

  console.log('view           metric        zh      en     equal');
  for (const r of rows) {
    for (const k of COMPARE_KEYS) {
      const eq = r.zh[k] === r.en[k];
      if (!eq) fail++;
      console.log(`${r.label.padEnd(14)} ${k.padEnd(12)} ${String(r.zh[k]).padStart(6)} ${String(r.en[k]).padStart(7)}   ${eq ? 'OK' : 'MISMATCH'}`);
    }
  }

  const cjk = rows.reduce((n, r) => n + r.zh.cjkFormula + r.en.cjkFormula, 0);
  const raw = rows.reduce((n, r) => n + r.zh.mathRaw + r.en.mathRaw, 0);
  console.log(`cjkFormula total = ${cjk} (must be 0)`);
  console.log(`math-raw   total = ${raw} (must be 0)`);
  if (cjk) fail++;
  if (raw) fail++;
  for (const r of rows) {
    if (r.label.endsWith('/quiz')) {
      // 自测视图默认收起答案，公式在展开后才有；这里要求题卡数 > 0
      if (r.zh.problems === 0) { console.log(`no problem card in ${r.label}`); fail++; }
      continue;
    }
    const k = r.zh.katex + r.en.katex;
    if (k === 0) { console.log(`no formula rendered in ${r.label}`); fail++; }
  }

  console.log(fail === 0 ? 'DOM VERIFY: PASS' : `DOM VERIFY: FAIL (${fail} issues)`);
  process.exit(fail === 0 ? 0 : 1);
}

run().catch((e) => { console.error(e); process.exit(1); });
