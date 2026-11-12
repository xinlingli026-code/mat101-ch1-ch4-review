#!/usr/bin/env node
/**
 * stats.js — 从章节 JSON 规格文件统计 README 需要的数字（不手算）。
 *
 * 用法: node scripts/stats.js <dataDir>
 * 例:   node scripts/stats.js ../data
 */
const fs = require('fs');
const path = require('path');

const dataDir = process.argv[2] || path.join(__dirname, '..', 'data');

function findSpecs(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findSpecs(p));
    else if (entry.name.endsWith('.spec.json')) out.push(p);
  }
  return out;
}

const files = findSpecs(dataDir).sort();

const out = {
  chapters: [],
  totals: { sections: 0, concepts: 0, pitfalls: 0, sheetGroups: 0, sheetItems: 0, problems: 0, official: 0, selfDerived: 0 },
};

for (const f of files) {
  const spec = JSON.parse(fs.readFileSync(f, 'utf8'));
  const sheetItems = (spec.sheet || []).reduce((n, g) => n + (g.items || []).length, 0);
  const official = (spec.problems || []).filter((p) => {
    const o = p.official && (p.official.zh || p.official.en || p.official);
    return typeof o === 'string' && o && !/未收录|not in the official/i.test(o);
  }).length;
  const problems = (spec.problems || []).length;
  const row = {
    chapter: spec.chapter,
    titleZh: spec.title && spec.title.zh,
    titleEn: spec.title && spec.title.en,
    sections: (spec.sections || []).length,
    concepts: (spec.concepts || []).length,
    pitfalls: (spec.pitfalls || []).length,
    sheetGroups: (spec.sheet || []).length,
    sheetItems,
    problems,
    official,
    selfDerived: problems - official,
    points: (spec.sections || []).reduce((n, s) => n + (s.points || []).length, 0),
  };
  out.chapters.push(row);
  for (const k of Object.keys(out.totals)) {
    if (k === 'official' || k === 'selfDerived') out.totals[k] += row[k];
    else out.totals[k] += row[k];
  }
}

console.log(JSON.stringify(out, null, 2));
