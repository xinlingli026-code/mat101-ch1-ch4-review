# 贡献指南 / Contributing

感谢参与 MAT101 Chapter 1–4 复习自测站。

## 内容层的改动方式

站点把**内容层**与**交互层**分开：

- 内容层：`data/chN/chN.spec.json`（源文件）→ 由 `scripts/build-chapter.js` 生成
  `assets/chN.js` 与 `assets/en/chN.js`；
- 交互层：`assets/app.js`（渲染、错题本、进度）。

**请只改 `data/` 下的 JSON 规格文件**，然后重新生成数据文件：

```bash
node scripts/build-chapter.js data/ch1/ch1.spec.json --out-dir .
```

不要手改 `assets/chN.js`（会被下次生成覆盖），也不要把新章节的数据写进 `app.js`。

## 双语要求

所有面向用户的字段都要写成 `{"zh": ..., "en": ...}` 对象：

- 公式两语言完全一致，只把散文翻成另一种语言；
- 英文侧不得残留中文；
- 中文侧若含中文措辞（如「即」「共线」），英文侧要写对应的英文措辞，不能共用一个字符串。

改完后请跑一次中英对等检查：

```bash
node scripts/verify-dom.js http://127.0.0.1:8765
```

要求中英两版的 `problems / concepts / pitfalls / sheet-item` 数量一一相等，
且 `math-raw`（KaTeX 降级数）与 `cjkFormula`（中文被误当公式的次数）都为 0。

## 公式书写

- 用 `$...$` 包裹 LaTeX，多行公式用 `$$...$$`；
- 金额里的 `$` 要写成 `$\text{\$1000}$`，避免与数学定界符配对；
- 统一使用 `\dfrac`、`\sqrt`、`\le`、`\neq`、`\in` 等标准写法。

## 版权

**不要**提交任何未在课程讲义、习题集或官方详解手册中出现的内容。
手册里没有的题目，请标「官方详解未收录此题（自行推导）」并保留自己的推导。
详见 [DISCLAIMER.md](DISCLAIMER.md)。
