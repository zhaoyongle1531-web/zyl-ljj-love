# GitHub Pages 准确发布步骤

如果你找不到 `Source -> GitHub Actions`，按这个方案来，不用 GitHub Actions。

## 重要前提

GitHub 免费账号如果仓库是 Private，通常不会显示 Pages 发布源。

解决办法二选一：

1. 把仓库改成 Public。
2. 升级 GitHub Pro 后继续使用 Private Pages。

这个网站本身就是公开视频链接，所以推荐直接把仓库改成 Public。原始大图已经被 `.gitignore` 忽略，仓库里只会有网页压缩图。

## 第一步：把仓库改成 Public

打开仓库：

`https://github.com/zhaoyongle1531-web/zyl-ljj-love`

进入：

`Settings -> General`

拉到最下面：

`Danger Zone -> Change repository visibility`

选择：

`Make public`

按 GitHub 提示输入仓库名确认。

## 第二步：开启 GitHub Pages

打开这个页面：

`https://github.com/zhaoyongle1531-web/zyl-ljj-love/settings/pages`

找到：

`Build and deployment`

设置：

- Source: `Deploy from a branch`
- Branch: `gh-pages`
- Folder: `/(root)`

点击：

`Save`

## 第三步：等待生成网址

保存后等 1 到 3 分钟，再刷新 `Settings -> Pages`。

成功后会显示：

`Your site is live at ...`

你的永久网址通常是：

`https://zhaoyongle1531-web.github.io/zyl-ljj-love/`

## 以后怎么更新

1. 修改 `content.json`，或把新照片放进 `assets/original_photos`。
2. 双击 `更新网站.bat`。
3. 本地预览没问题后运行：

```powershell
git add .
git commit -m "Update love website"
git push
```

GitHub Pages 会自动更新，网址不变。
