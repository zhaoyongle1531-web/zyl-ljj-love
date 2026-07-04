# 赵永乐 & 刘晶晶的爱情小站

这是一个适合长期维护的静态情侣网站。推荐发布方式是：

GitHub 私有仓库 -> Cloudflare Pages -> 永久 `pages.dev` 链接。

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
- 生成 Cloudflare Pages 要发布的 `publish_site/`

## Cloudflare Pages 设置

连接 GitHub 仓库后，Pages 项目建议这样填：

- Framework preset: `None`
- Build command: 留空
- Build output directory: `publish_site`

以后每次推送 GitHub，Cloudflare Pages 会自动更新永久网址。

## 隐私

建议 GitHub 仓库设为 Private。`.gitignore` 已默认忽略原始大图，只发布压缩后的网页图。
