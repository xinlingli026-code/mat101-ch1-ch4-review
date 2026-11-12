#!/usr/bin/env node
/**
 * build-chapter.js — 把章节 JSON 规格编译成中英双语的 JS 数据文件。
 *
 * 用法:
 *   node scripts/build-chapter.js <spec.json> --out-dir <site-root>
 *
 * 规格文件见 references 说明；字段可以是字符串，也可以是 {zh, en} 对象（按语言取）。
 * 输出的数据文件为纯 UTF-8（无 BOM）、LF 换行，直接被 <script src> 引入，
 * 以 window.MAT101.push({...}) 形式挂载，不依赖任何第三方包。
 */
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { spec: null, outDir: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out-dir') args.outDir = argv[++i];
    else if (!args.spec) args.spec = argv[i];
  }
  return args;
}

const js = (v) => JSON.stringify(v === undefined || v === null ? '' : v);

function pick(value, lang, fallback = '') {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const v = value[lang];
    return v === undefined || v === null ? fallback : v;
  }
  return fallback;
}

function render(spec, lang) {
  const out = [];
  out.push('/* ============================================================');
  out.push(` * MAT101 复习站 · Chapter ${spec.chapter} 内容层 (${lang})`);
  out.push(` * 由 scripts/build-chapter.js 从 data/ch${spec.chapter}/ch${spec.chapter}.spec.json 生成，请勿手改。`);
  out.push(' * ============================================================ */');
  out.push('window.MAT101 = window.MAT101 || [];');
  out.push('window.MAT101.push({');
  out.push(`  chapter: ${spec.chapter},`);
  out.push(`  key: ${js(spec.key)},`);
  out.push(`  title: ${js(pick(spec.title, lang))},`);

  out.push('  sections: [');
  for (const s of spec.sections || []) {
    out.push('    {');
    out.push(`      id: ${js(s.id)},`);
    out.push(`      title: ${js(pick(s.title, lang))},`);
    out.push('      points: [');
    for (const p of s.points || []) out.push(`        ${js(pick(p, lang))},`);
    out.push('      ],');
    out.push('    },');
  }
  out.push('  ],');

  out.push('  concepts: [');
  for (const c of spec.concepts || []) {
    out.push('    {');
    out.push(`      sec: ${js(c.sec)},`);
    out.push(`      title: ${js(pick(c.title, lang))},`);
    out.push(`      body: ${js(pick(c.body, lang))},`);
    out.push('    },');
  }
  out.push('  ],');

  out.push('  pitfalls: [');
  for (const p of spec.pitfalls || []) {
    out.push('    {');
    out.push(`      sec: ${js(p.sec)},`);
    out.push(`      title: ${js(pick(p.title, lang))},`);
    out.push(`      body: ${js(pick(p.body, lang))},`);
    out.push('    },');
  }
  out.push('  ],');

  out.push('  sheet: [');
  for (const g of spec.sheet || []) {
    out.push('    {');
    out.push(`      group: ${js(pick(g.group, lang))},`);
    out.push('      items: [');
    for (const it of g.items || []) {
      out.push('        {');
      out.push(`          f: ${js(it.f)},`);
      out.push(`          note: ${js(pick(it.note, lang))},`);
      out.push('        },');
    }
    out.push('      ],');
    out.push('    },');
  }
  out.push('  ],');

  out.push('  problems: [');
  for (const p of spec.problems || []) {
    out.push('    {');
    out.push(`      num: ${js(p.num)},`);
    out.push(`      sec: ${js(p.sec)},`);
    out.push(`      type: ${js(pick(p.type, lang))},`);
    out.push(`      q: ${js(pick(p.q, lang))},`);
    out.push(`      ans: ${js(pick(p.ans, lang))},`);
    out.push('      steps: [');
    for (const st of p.steps || []) out.push(`        ${js(pick(st, lang))},`);
    out.push('      ],');
    const official = pick(p.official, lang, '');
    if (official) out.push(`      official: ${js(official)},`);
    const src = pick(p.src, lang, '');
    if (src) out.push(`      src: ${js(src)},`);
    const note = pick(p.note, lang, '');
    if (note) out.push(`      note: ${js(note)},`);
    out.push('    },');
  }
  out.push('  ],');

  out.push('});');
  return out.join('\n') + '\n';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.spec || !fs.existsSync(args.spec)) {
    console.error('usage: node scripts/build-chapter.js <spec.json> --out-dir <site-root>');
    process.exit(1);
  }
  const spec = JSON.parse(fs.readFileSync(args.spec, 'utf8'));
  const targets = [
    { lang: 'zh', rel: `assets/ch${spec.chapter}.js` },
    { lang: 'en', rel: `assets/en/ch${spec.chapter}.js` },
  ];
  for (const t of targets) {
    const dest = path.resolve(args.outDir, t.rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, render(spec, t.lang), { encoding: 'utf8' });
    console.log(`wrote ${dest} (${fs.statSync(dest).size} bytes)`);
  }
  console.log(`chapter ${spec.chapter}: sections=${(spec.sections || []).length} concepts=${(spec.concepts || []).length} pitfalls=${(spec.pitfalls || []).length} sheetGroups=${(spec.sheet || []).length} sheetItems=${(spec.sheet || []).reduce((n, g) => n + (g.items || []).length, 0)} problems=${(spec.problems || []).length}`);
}

main();
