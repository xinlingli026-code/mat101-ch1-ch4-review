/* MAT101 复习自测站 · 交互层
 * 双语数据由 assets/ch1..ch4.js 与 assets/en/ch1..ch4.js 提供（内容层），
 * 本文件只负责：章节切换、视图渲染、KaTeX 公式渲染、错题本、学习进度。
 */
(function () {
  'use strict';

  var LANG = document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'zh';
  var STORE_PROGRESS = 'mat101_progress_v1';
  var STORE_WRONG = 'mat101_wrong_v1';

  var T = {
    zh: {
      siteTitle: 'MAT101 复习自测站',
      siteSub: '第 1–4 章 · 数系 / 参数方程与极坐标 / 复数 / 数列与二项展开',
      chapters: '章节',
      views: { overview: '章节概览', concepts: '知识点', pitfalls: '易错点', sheet: '公式速查', quiz: '自测题库', wrong: '错题本' },
      points: '考点',
      conceptsCount: '知识点',
      pitfallsCount: '易错点',
      sheetCount: '公式',
      problemsCount: '自测题',
      sections: '小节',
      showAnswer: '显示答案与解法',
      hideAnswer: '收起答案',
      myAnswer: '我的作答',
      right: '我做对了',
      wrong: '我做错了',
      answer: '答案',
      steps: '分步解法',
      official: '官方详解转写',
      source: '出处',
      note: '核对',
      emptyWrong: '还没有错题。做错的题会自动收进这里，随时回来重练。',
      clearWrong: '清空错题本',
      reQuiz: '重做这题',
      progress: '本章进度',
      solved: '已练',
      total: '总题数',
      accuracy: '正确率',
      langLink: 'English',
      langHref: 'index-en.html',
      chapterPrefix: '第',
      chapterSuffix: '章',
      filterAll: '全部题型',
      typeLabel: '题型',
      numLabel: '题号',
      offTopic: '本章没有这一题。',
      katexFallback: '公式降级显示（KaTeX 未加载）'
    },
    en: {
      siteTitle: 'MAT101 Revision & Self-Test',
      siteSub: 'Chapters 1–4 · Number Systems / Parametric & Polar / Complex Numbers / Sequences & Binomial',
      chapters: 'Chapters',
      views: { overview: 'Overview', concepts: 'Concepts', pitfalls: 'Pitfalls', sheet: 'Formula Sheet', quiz: 'Self-Test', wrong: 'Wrong Answers' },
      points: 'Key points',
      conceptsCount: 'Concepts',
      pitfallsCount: 'Pitfalls',
      sheetCount: 'Formulas',
      problemsCount: 'Questions',
      sections: 'Sections',
      showAnswer: 'Show answer & solution',
      hideAnswer: 'Hide answer',
      myAnswer: 'My answer',
      right: 'I got it right',
      wrong: 'I got it wrong',
      answer: 'Answer',
      steps: 'Step-by-step',
      official: 'Official solutions (transcribed)',
      source: 'Source',
      note: 'Check',
      emptyWrong: 'No wrong answers yet. Questions you miss are collected here for a second run.',
      clearWrong: 'Clear wrong-answer book',
      reQuiz: 'Retry this question',
      progress: 'Chapter progress',
      solved: 'Attempted',
      total: 'Total',
      accuracy: 'Accuracy',
      langLink: '中文',
      langHref: 'index.html',
      chapterPrefix: 'Chapter ',
      chapterSuffix: '',
      filterAll: 'All types',
      typeLabel: 'Type',
      numLabel: 'No.',
      offTopic: 'This question does not belong to the chapter.',
      katexFallback: 'Formula fallback (KaTeX not loaded)'
    }
  };

  var t = T[LANG];
  var DATA = window.MAT101 || [];
  var state = {
    chapter: 0,
    view: 'overview',
    typeFilter: '',
    revealed: {}
  };

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function katexOrRaw(tex, display) {
    if (window.katex && window.katex.renderToString) {
      try {
        return window.katex.renderToString(tex, { displayMode: !!display, throwOnError: false, strict: false, trust: false });
      } catch (e) { /* fall through */ }
    }
    return '<span class="math-raw">' + esc((display ? '$$' : '$') + tex + (display ? '$$' : '$')) + '</span>';
  }

  /* 公式渲染：先按 $...$ 切分，非公式部分转义，公式部分交给 KaTeX */
  function mathify(raw) {
    var text = String(raw === undefined || raw === null ? '' : raw);
    var out = [];
    var re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push(esc(text.slice(last, m.index)));
      if (m[1] !== undefined) out.push(katexOrRaw(m[1], true));
      else out.push(katexOrRaw(m[2], false));
      last = re.lastIndex;
    }
    if (last < text.length) out.push(esc(text.slice(last)));
    return out.join('');
  }

  function load(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function save(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  function el(id) { return document.getElementById(id); }

  function current() { return DATA[state.chapter]; }

  /* ---------- 渲染：概览 ---------- */
  function renderOverview() {
    var ch = current();
    var prog = load(STORE_PROGRESS, {});
    var solved = (prog.solved || {})[ch.key] || {};
    var done = Object.keys(solved).length;
    var total = ch.problems.length;
    var right = Object.keys(solved).filter(function (k) { return solved[k] === 'ok'; }).length;
    var acc = done ? Math.round((right / done) * 100) : 0;
    var sheetItems = ch.sheet.reduce(function (n, g) { return n + g.items.length; }, 0);

    var html = '';
    html += '<div class="hero">';
    html += '<h2>' + mathify(ch.title) + '</h2>';
    html += '<p class="muted">' + esc(t.siteSub) + '</p>';
    html += '<div class="stat-row">';
    html += stat(t.sections, ch.sections.length);
    html += stat(t.conceptsCount, ch.concepts.length);
    html += stat(t.pitfallsCount, ch.pitfalls.length);
    html += stat(t.sheetCount, sheetItems);
    html += stat(t.problemsCount, total);
    html += '</div>';
    html += '<div class="progress-box">';
    html += '<div class="progress-label">' + esc(t.progress) + ' <b>' + done + ' / ' + total + '</b> · ' + esc(t.accuracy) + ' ' + acc + '%</div>';
    html += '<div class="bar"><span style="width:' + (total ? Math.round((done / total) * 100) : 0) + '%"></span></div>';
    html += '</div>';
    html += '</div>';

    html += '<h3 class="block-title">' + esc(t.points) + '</h3>';
    html += '<div class="grid grid-2">';
    for (var i = 0; i < ch.sections.length; i++) {
      var s = ch.sections[i];
      html += '<section class="card">';
      html += '<div class="card-head"><span class="sec-id">' + esc(s.id) + '</span><h4>' + mathify(s.title) + '</h4></div>';
      html += '<ul class="bullets">';
      for (var j = 0; j < s.points.length; j++) html += '<li>' + mathify(s.points[j]) + '</li>';
      html += '</ul></section>';
    }
    html += '</div>';
    return html;
  }

  function stat(label, value) {
    return '<div class="stat"><b>' + value + '</b><span>' + esc(label) + '</span></div>';
  }

  /* ---------- 渲染：知识点 / 易错点 ---------- */
  function renderConceptList(items, cls) {
    if (!items.length) return '<p class="muted">—</p>';
    var html = '<div class="grid grid-2">';
    for (var i = 0; i < items.length; i++) {
      var c = items[i];
      html += '<section class="card ' + cls + '">';
      html += '<div class="card-head"><span class="sec-id">' + esc(c.sec || '') + '</span><h4>' + mathify(c.title) + '</h4></div>';
      html += '<div class="card-body">' + mathify(c.body) + '</div>';
      html += '</section>';
    }
    html += '</div>';
    return html;
  }

  /* ---------- 渲染：公式速查 ---------- */
  function renderSheet() {
    var ch = current();
    if (!ch.sheet.length) return '<p class="muted">—</p>';
    var html = '';
    for (var i = 0; i < ch.sheet.length; i++) {
      var g = ch.sheet[i];
      html += '<h3 class="block-title">' + mathify(g.group) + '</h3>';
      html += '<div class="sheet-grid">';
      for (var j = 0; j < g.items.length; j++) {
        var it = g.items[j];
        html += '<div class="sheet-item"><div class="sheet-f">' + mathify(it.f) + '</div>';
        if (it.note) html += '<div class="sheet-note">' + mathify(it.note) + '</div>';
        html += '</div>';
      }
      html += '</div>';
    }
    return html;
  }

  /* ---------- 渲染：自测题库 ---------- */
  function renderQuiz() {
    var ch = current();
    var types = [];
    for (var i = 0; i < ch.problems.length; i++) {
      if (types.indexOf(ch.problems[i].type) === -1) types.push(ch.problems[i].type);
    }
    var html = '';
    html += '<div class="filter-row">';
    html += '<button class="chip' + (state.typeFilter === '' ? ' active' : '') + '" data-type="">' + esc(t.filterAll) + '</button>';
    for (var k = 0; k < types.length; k++) {
      html += '<button class="chip' + (state.typeFilter === types[k] ? ' active' : '') + '" data-type="' + esc(types[k]) + '">' + esc(types[k]) + '</button>';
    }
    html += '</div>';

    for (var i = 0; i < ch.problems.length; i++) {
      var p = ch.problems[i];
      if (state.typeFilter && p.type !== state.typeFilter) continue;
      var key = ch.key + '::' + p.num;
      var revealed = !!state.revealed[key];
      html += '<section class="card problem' + (revealed ? ' revealed' : '') + '" data-problem="' + esc(key) + '">';
      html += '<div class="card-head"><span class="sec-id">' + esc(t.numLabel) + ' ' + esc(p.num) + '</span>';
      if (p.type) html += '<span class="tag">' + esc(p.type) + '</span>';
      html += '<span class="sec-id">' + esc(p.sec || '') + '</span></div>';
      html += '<div class="q">' + mathify(p.q) + '</div>';
      html += '<button class="btn toggle-answer" data-toggle="' + esc(key) + '">' + esc(revealed ? t.hideAnswer : t.showAnswer) + '</button>';
      if (revealed) {
        html += '<div class="solution">';
        html += '<div class="sol-block"><span class="lbl">' + esc(t.answer) + '</span><div class="sol-body">' + mathify(p.ans) + '</div></div>';
        if (p.steps && p.steps.length) {
          html += '<div class="sol-block"><span class="lbl">' + esc(t.steps) + '</span><ol class="steps">';
          for (var s = 0; s < p.steps.length; s++) html += '<li>' + mathify(p.steps[s]) + '</li>';
          html += '</ol></div>';
        }
        if (p.official) {
          html += '<div class="p-official"><span class="lbl">' + esc(t.official) + '</span><div class="sol-body">' + mathify(p.official) + '</div>';
          if (p.src) html += '<div class="src">' + esc(t.source) + '：' + esc(p.src) + '</div>';
          html += '</div>';
        }
        if (p.note) html += '<div class="note"><span class="lbl">' + esc(t.note) + '</span> ' + mathify(p.note) + '</div>';
        html += '<div class="mark-row">';
        html += '<button class="btn ok" data-mark="ok" data-key="' + esc(key) + '">' + esc(t.right) + '</button>';
        html += '<button class="btn bad" data-mark="bad" data-key="' + esc(key) + '">' + esc(t.wrong) + '</button>';
        html += '</div>';
        html += '</div>';
      }
      html += '</section>';
    }
    return html;
  }

  /* ---------- 渲染：错题本 ---------- */
  function renderWrong() {
    var wrong = load(STORE_WRONG, {}) || {};
    var keys = Object.keys(wrong);
    if (!keys.length) return '<p class="muted">' + esc(t.emptyWrong) + '</p>';
    var html = '<div class="wrong-head"><button class="btn clear-wrong" data-clear="1">' + esc(t.clearWrong) + '</button></div>';
    for (var i = 0; i < keys.length; i++) {
      var parts = keys[i].split('::');
      var chKey = parts[0], num = parts.slice(1).join('::');
      var ch = null;
      for (var c = 0; c < DATA.length; c++) if (DATA[c].key === chKey) ch = DATA[c];
      if (!ch) continue;
      var p = null;
      for (var j = 0; j < ch.problems.length; j++) if (ch.problems[j].num === num) p = ch.problems[j];
      if (!p) continue;
      html += '<section class="card problem wrong-item">';
      html += '<div class="card-head"><span class="sec-id">' + esc(t.numLabel) + ' ' + esc(p.num) + '</span><span class="tag">' + esc(p.type) + '</span></div>';
      html += '<div class="q">' + mathify(p.q) + '</div>';
      html += '<div class="solution">';
      html += '<div class="sol-block"><span class="lbl">' + esc(t.answer) + '</span><div class="sol-body">' + mathify(p.ans) + '</div></div>';
      if (p.official) html += '<div class="p-official"><span class="lbl">' + esc(t.official) + '</span><div class="sol-body">' + mathify(p.official) + '</div>';
      if (p.src) html += '<div class="src">' + esc(t.source) + '：' + esc(p.src) + '</div></div>';
      html += '</div>';
      html += '<div class="mark-row"><button class="btn ok" data-mark="ok" data-key="' + esc(chKey + '::' + p.num) + '">' + esc(t.reQuiz) + '</button></div>';
      html += '</section>';
    }
    return html;
  }

  /* ---------- 主渲染 ---------- */
  function render() {
    var body = el('view-body');
    if (!body) return;
    var html = '';
    if (state.view === 'overview') html = renderOverview();
    else if (state.view === 'concepts') html = renderConceptList(current().concepts, 'concept');
    else if (state.view === 'pitfalls') html = renderConceptList(current().pitfalls, 'pitfall');
    else if (state.view === 'sheet') html = renderSheet();
    else if (state.view === 'quiz') html = renderQuiz();
    else if (state.view === 'wrong') html = renderWrong();
    body.innerHTML = html;
    renderChrome();
  }

  function renderChrome() {
    var tabs = el('chapter-tabs');
    var html = '';
    for (var i = 0; i < DATA.length; i++) {
      html += '<button class="chip' + (i === state.chapter ? ' active' : '') + '" data-ch="' + i + '">' +
        esc(t.chapterPrefix) + ' ' + DATA[i].chapter + ' ' + esc(t.chapterSuffix) + '</button>';
    }
    tabs.innerHTML = html;
    var views = el('view-tabs');
    var vh = '';
    var order = ['overview', 'concepts', 'pitfalls', 'sheet', 'quiz', 'wrong'];
    for (var k = 0; k < order.length; k++) {
      vh += '<button class="tab' + (state.view === order[k] ? ' active' : '') + '" data-view="' + order[k] + '">' + esc(t.views[order[k]]) + '</button>';
    }
    views.innerHTML = vh;
    var lang = el('lang-link');
    if (lang) { lang.textContent = t.langLink; lang.setAttribute('href', t.langHref); }
    var title = el('site-title');
    if (title) title.textContent = t.siteTitle;
    var sub = el('site-sub');
    if (sub) sub.textContent = t.siteSub;
    var crumb = el('chapter-crumb');
    if (crumb && current()) crumb.textContent = current().title;
  }

  function mark(key, result) {
    var prog = load(STORE_PROGRESS, {}) || {};
    if (!prog.solved) prog.solved = {};
    var chKey = key.split('::')[0];
    var num = key.split('::').slice(1).join('::');
    if (!prog.solved[chKey]) prog.solved[chKey] = {};
    prog.solved[chKey][num] = result;
    save(STORE_PROGRESS, prog);

    var wrong = load(STORE_WRONG, {}) || {};
    if (result === 'bad') wrong[key] = Date.now();
    else delete wrong[key];
    save(STORE_WRONG, wrong);
    render();
  }

  /* ---------- 事件 ---------- */
  function bind() {
    document.addEventListener('click', function (ev) {
      var target = ev.target;
      if (!target || !target.getAttribute) return;

      var ch = target.getAttribute('data-ch');
      if (ch !== null) { state.chapter = parseInt(ch, 10) || 0; state.revealed = {}; render(); return; }

      var view = target.getAttribute('data-view');
      if (view) { state.view = view; render(); return; }

      var type = target.getAttribute('data-type');
      if (type !== null) { state.typeFilter = type; render(); return; }

      var toggle = target.getAttribute('data-toggle');
      if (toggle) {
        if (state.revealed[toggle]) delete state.revealed[toggle];
        else state.revealed[toggle] = true;
        render();
        return;
      }

      var markKey = target.getAttribute('data-key');
      var markRes = target.getAttribute('data-mark');
      if (markKey && markRes) { mark(markKey, markRes); return; }

      if (target.getAttribute('data-clear')) {
        save(STORE_WRONG, {});
        render();
        return;
      }
    });
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    // ?ch=N 使用 1-based 章节号（?ch=1 即第 1 章），并夹在有效范围内
    var ch = parseInt(params.get('ch') || '1', 10);
    if (!isNaN(ch) && ch >= 1 && ch <= DATA.length) state.chapter = ch - 1;
    var view = params.get('view');
    if (view && T.zh.views[view]) state.view = view;
    bind();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
