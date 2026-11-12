# 安全说明 / Security Policy

本项目是一个纯静态站点，无后端、无账号、无数据上传。

## 设计要点

- **零第三方依赖**：除 KaTeX（CDN，带 SRI 完整性校验）外不加载任何外部脚本、字体或图片，
  不发起任何第三方数据请求。
- **CSP**：`default-src 'self'`，脚本与样式仅允许同源与 `cdn.jsdelivr.net`，
  禁止 `connect-src`（站点不会发起网络请求）、`form-action` 与 `object-src`。
- **输出转义**：所有注入页面的课程内容文本都经过 `esc()` 转义后再插入 DOM，防止 DOM XSS。
- **学习数据本地化**：学习进度与错题本只写入浏览器 `localStorage`，不上传任何服务器；
  读取失败时降级为空数据，不会因为脏数据崩溃。
- **引用完整性**：KaTeX 的 CSS/JS 使用 `integrity` + `crossorigin="anonymous"` 校验。

## 报告问题

如果你发现安全问题，请开一个 GitHub issue 描述复现步骤，或私下联系仓库作者。
欢迎给出复现脚本或 payload。
