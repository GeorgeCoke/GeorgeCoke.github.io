# GitHub Pages 上传版

此目录用于发布静态个人主页。

上传到 GitHub 仓库根目录的文件：

- `index.html`
- `.nojekyll`

GitHub Pages 只能运行静态 HTML、CSS 和 JavaScript，因此此版本不包含 PHP、MySQL、后台登录、留言写入及 DeepSeek 实时问答。完整动态网站仍保存在相邻的 `01-网站程序` 目录中，并通过 XAMPP 运行。

发布方法：

1. 在 GitHub 新建公开仓库。个人主页建议命名为 `<你的GitHub用户名>.github.io`。
2. 将本目录中的 `index.html` 和 `.nojekyll` 上传到仓库根目录。
3. 打开仓库 `Settings` -> `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. 分支选择 `main`，目录选择 `/(root)`，然后保存。

若仓库名为 `<用户名>.github.io`，网址通常是 `https://<用户名>.github.io/`；若使用普通仓库名，则通常是 `https://<用户名>.github.io/<仓库名>/`。
