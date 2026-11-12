# MAT101 Chapter 1–4 复习自测站 · MAT101 Ch1–4 Revision & Self-Test

一个纯静态、**中英双语**的 [MAT101 Algebra and Analytic Geometry](https://l.xmu.edu.my/) 复习备考网站，
覆盖 **Chapter 1–4**：章节知识点、易错点、公式速查，以及带官方详解转写的自测题库。

A fully static, **bilingual (中文 / English)** revision site for **MAT101 Algebra and Analytic Geometry,
Chapters 1–4**: section-by-section key points, pitfalls, a formula sheet, and a self-test bank with
transcribed official solutions.

在线访问 / Live: <https://xinlingli026-code.github.io/mat101-ch1-ch4-review/>

---

## 功能一览 / Features

| 模块 | 说明 |
| --- | --- |
| **章节概览** | 每章的小节划分与考点提要，附本章练习进度条 |
| **知识点** | 41 张概念卡，覆盖定义、定理与推导要点 |
| **易错点** | 31 条高频错误提醒，每条都写清「为什么会错 + 正确做法」 |
| **公式速查** | 14 组共 90 条必背公式，KaTeX 排版 |
| **自测题库** | 104 道小题（来自 78 道大题），按题型筛选；点「显示答案与解法」展开答案 + 分步解法 + 官方详解转写 + 出处页码 |
| **错题本** | 标记「我做错了」的题自动进本地错题本，随时重练 |
| **完全双语** | 中文站 `index.html` / 英文站 `index-en.html` 一键切换，内容严格对等 |
| **零依赖** | 无框架、无构建步骤；除 KaTeX（CDN + SRI）外无外部请求 |

---

## 内容覆盖 / Coverage

数字由 `scripts/stats.js` 从内容层规格文件统计得出，不手算。

| 章节 | 小节 | 考点提要 | 知识点 | 易错点 | 公式条目 | 自测小题 | 官方详解转写 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ch 1 数系 Number Systems | 3 | 21 | 11 | 7 | 16 | 22 | 22 |
| Ch 2 参数方程与极坐标 Parametric & Polar | 3 | 20 | 10 | 8 | 24 | 17 | 17 |
| Ch 3 复数 Complex Numbers | 4 | 27 | 10 | 8 | 26 | 38 | 38 |
| Ch 4 数列与二项展开 Sequences & Binomial | 4 | 25 | 10 | 8 | 24 | 27 | 27 |
| **合计 Total** | **14** | **93** | **41** | **31** | **90** | **104** | **104** |

对应课程习题集里的大题数：**78 道大题**（Ch1 14 道、Ch2 17 道、Ch3 26 道、Ch4 21 道），
每个子问 (a)(b)(c) 在题库里单独成条，共 104 条。

### 各章覆盖范围 / Scope per chapter

- **Chapter 1 数系** —— 1.1 整数（自然数、加法/乘法性质、带余除法、进制表示）、1.2 有理数/无理数/实数（最简分数、√2 无理证明、幂律、有限与循环小数）、1.3 代数数与超越数（Definition 1.1、Theorem 1.3/1.4、π 的超越性）
- **Chapter 2 参数方程与极坐标** —— 2.1 参数曲线（消参、闭曲线/简单曲线）、2.2 极坐标（r、θ、x=r cosθ、y=r sinθ）、2.3 极坐标曲线（r=1、θ=π/4、r=8 sinθ、r=8 cosθ 转直角方程）
- **Chapter 3 复数** —— 3.1 复数（i、共轭、倒数）、3.2 阿甘图（模、辐角、主辐角、轨迹与区域）、3.3 三角形式与指数形式（Euler、De Moivre、模与辐角运算）、3.4 n 次根
- **Chapter 4 数列与二项展开** —— 4.1 数列与级数（Σ/∏ 记号、阶乘、收敛）、4.2 等差与等比数列（通项、前 n 项和、无穷和）、4.3 二项展开（组合数、Pascal 恒等式、广义二项级数）、4.4 幂和公式

---

## 来源与校对 / Sources & Verification

| 材料 | 用途 |
| --- | --- |
| `MAT101 Chapter N.pdf`（讲义） | 小节结构、定义、定理、公式、例题 |
| `MAT101 Chapter N Problems.pdf`（习题） | 自测题题干 |
| `MAT101 Chapter N Solutions.pdf`（官方详解） | 官方解答转写 + 出处页码 |

**可靠性做法**：PDF 文字层的数学符号不可信（上下标丢失、分数被拆行），因此每页都渲染成图像，
用视觉模型逐题转写，再用 Python / sympy **独立重算每一条数值答案**；官方详解与教材题干冲突时，
以教材为准并在题目下标注「核对」提示。

**已知的官方详解笔误（站内已逐题标注）**：

- Ch2 2.14：手册末行形似 `√38`，但其自身推导为 `√(25+3)`，正确值 **√28 = 2√7**
- Ch2 2.17：手册把 `r=3cosθ` 写成「圆心 (3/2,0)、半径 3」，半径应为 **3/2**
- Ch1 1.9(b)：手册中间行 `314207−314 / 99900` 与末值 `34877/11100` 不自洽（正确分子 `313893`），末值已独立验证
- Ch1 1.7(b)：手册写作 `0.1̇8̇8`，按循环节规律应为 `0.\overline{1188}`
- Ch3 3.7(a)：官方给的是多值 `arg = 7π/6`（主辐角为 `−5π/6`）
- Ch3 讲义 Theorem 3.2：印作 `e^{i(θ₁+iθ₂)}`（应为 `e^{i(θ₁+θ₂)}`）、`e^{iθ}=e^{−iθ}` 上方漏印共轭横线
- Ch4 4.9：手册同页出现顶点 `35/3` 与 `37/3` 两种写法，正确值为 **35/3**，末值 `S₁₂ = 102/5`

---

## 本地运行 / Run locally

无需安装任何东西，直接用浏览器打开 `index.html` 即可。

```bash
# 方式一：直接打开
start index.html           # Windows
open  index.html           # macOS

# 方式二：起个本地服务器（可选）
python -m http.server 8000
```

---

## 项目结构 / Project structure

```
mat101-ch1-ch4-review/
├── index.html          # 中文入口
├── index-en.html       # 英文入口
├── assets/
│   ├── app.js          # 交互层：章节切换、渲染、错题本、进度
│   ├── style.css       # 全部样式
│   ├── ch1.js ~ ch4.js # 中文内容层（由脚本生成）
│   └── en/
│       └── ch1.js ~ ch4.js  # 英文内容层（文件名与中文侧一一对应）
├── data/
│   └── chN/chN.spec.json   # 内容层源文件（双语 JSON 规格）
├── scripts/
│   ├── build-chapter.js # JSON 规格 → 中英数据文件
│   ├── lint-data.js     # 数据体检：英文侧中文残留、字段缺失、题号重复
│   ├── stats.js         # README 数字统计
│   └── verify-dom.js    # 无头浏览器渲染校验（中英对等 + KaTeX 降级数）
├── LICENSE / DISCLAIMER.md / SECURITY.md / CONTRIBUTING.md
```

**内容层与交互层分离**：改内容只需编辑 `data/` 下的 JSON 规格再重新生成，不碰 `app.js`。

```bash
node scripts/build-chapter.js data/ch1/ch1.spec.json --out-dir .
node scripts/lint-data.js data
node scripts/stats.js data
node scripts/verify-dom.js http://127.0.0.1:8000
```

`verify-dom.js` 用 Edge headless 导出渲染后的 DOM，逐个「语言 × 视图 × 章节」核对：
题卡/知识点/易错点/公式条目数量中英一一相等，KaTeX 降级数（`.math-raw`）与「中文被误当公式」次数都为 0。

---

## 安全 / Security

- **输出转义**：所有注入页面的课程内容文本都经 `esc()` 转义，防 DOM XSS
- **CSP**：`default-src 'self'`，仅放行同源与 `cdn.jsdelivr.net`，禁止 `connect-src`（站点不发网络请求）
- **KaTeX SRI**：CSS/JS 均带 `integrity` + `crossorigin` 校验
- **数据本地化**：学习进度与错题本只写入浏览器 `localStorage`，不上传服务器
- 详见 [SECURITY.md](SECURITY.md)

---

## 版权 / Copyright

课程内容（讲义、习题、官方详解转写）版权归原课程、授课教师与 XMUM 所有；
**MIT 许可证仅适用于本仓库的源代码**，不覆盖课程内容。收录官方详解的每条题目都标注了手册页码。
详见 [DISCLAIMER.md](DISCLAIMER.md)。
