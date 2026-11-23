# 随机账号信息生成器 · Random Account Details Generator

面向开发、表单测试和演示的浏览器工具。一键生成随机用户名、密码、邮箱占位地址、显示昵称、UUID 和六位 PIN。无需后端、构建步骤或安装依赖。

[GitHub 开源仓库](https://github.com/shellsec/gen)

## 访问

以下线上地址以部署完成为准。

| 用途 | 部署地址 |
| --- | --- |
| 首页，自动匹配语言 | [shellsec.com/gen/](https://shellsec.com/gen/) |
| 直接生成 12 位密码 | [shellsec.com/gen/?12](https://shellsec.com/gen/?12) |
| 直达英文版 | [shellsec.com/gen/en/](https://shellsec.com/gen/en/) |

本地直接用浏览器打开 [中文首页](index.html) 或 [英文页面](en/index.html)。网址末尾可加 `?12` 或 `?length=12`。长度支持 4–64 位，省略参数或传入无效值时使用 16 位。

## 功能

- 用户名支持五种格式。同一页面连续生成时会避开当前的用户名。
- 密码可勾选大写字母、小写字母、数字和符号。全部取消时使用小写字母。
- 昵称和邮箱占位地址随用户名更新。`@example.com` 地址仅用于占位。页面提供 TempoMail 收件箱入口。
- UUID v4 和六位测试 PIN 可以单独刷新。PIN 保留前导零，所有字段都可以单独复制。
- 首页按浏览器语言偏好选择简体中文或英语，匹配不到时显示简体中文。页面顶部可以手动切换并保留长度参数。浏览器允许本地存储时会记住语言选择。
- 用户名、密码、UUID 和 PIN 使用浏览器的 Web Crypto 随机源。

## 部署到 ShellSec

将 `index.html`、`en/`、`generator.js`、`styles.css` 和 `sitemap.xml` 部署到站点的 `/gen/`。静态服务器应将 `/gen/` 和 `/gen/en/` 分别解析到对应的 `index.html`。

两个页面的 canonical 和 hreflang 指向 ShellSec 正式路径。将本仓库 `robots.txt` 中的 Sitemap 声明合并到站点根目录的 `/robots.txt`。如果站点已有 sitemap 索引，也可以把 `/gen/sitemap.xml` 纳入索引。

## License

[MIT](LICENSE)
