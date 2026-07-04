# 赵永乐 & 刘晶晶的爱情小站

这是一个适合长期维护的静态情侣网站。推荐发布方式是：

GitHub 私有仓库 -> Cloudflare Workers Static Assets -> 永久 `workers.dev` 链接。

如果 `workers.dev` 在当前网络打不开，项目也内置了 GitHub Pages 自动发布配置，可以使用：

`https://zhaoyongle1531-web.github.io/zyl-ljj-love/`

## 日常维护

### 修改文字和清单

编辑 `content.json`：

- `site`：网站标题、首页文案、首屏图片
- `dates`：在一起日期、订婚日期
- `people`：两个人的信息
- `moments`：一起做过的事情

### 新增照片

1. 把新照片放到 `assets/original_photos/`。
2. 双击 `更新网站.bat`。
3. 本地预览：双击 `打开爱情网页.bat`。
4. 确认没问题后提交并推送到 GitHub。

`更新网站.bat` 会自动：

- 压缩照片到 `assets/web_photos/`
- 更新 `content.json` 里的相册列表
- 生成 Cloudflare 要发布的 `publish_site/`

## Cloudflare 设置

如果 Cloudflare 后台显示 `Create a Worker`，这是新版入口。选择：

- `Continue with GitHub`
- 选择仓库 `zyl-ljj-love`
- 让 Cloudflare 使用项目里的 `wrangler.jsonc`

第一次部署前，需要注册一次 `workers.dev` 子域名：

https://dash.cloudflare.com/?to=/:account/workers/onboarding

注册后，永久网址一般类似：

`https://zyl-ljj-love.你的子域.workers.dev`

以后每次推送 GitHub，Cloudflare 会自动更新永久网址。

## GitHub Pages 备用网址

仓库已包含：

`.github/workflows/github-pages.yml`

在 GitHub 仓库 `Settings -> Pages` 里把 Source 设为 `GitHub Actions`，之后每次推送都会自动发布到 GitHub Pages。

## 隐私

建议 GitHub 仓库设为 Private。`.gitignore` 已默认忽略原始大图，只发布压缩后的网页图。
