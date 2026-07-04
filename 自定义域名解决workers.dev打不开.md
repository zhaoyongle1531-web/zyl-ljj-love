# workers.dev 打不开的解决方案

如果 `https://zyl-ljj-love.zyl-ljj.workers.dev` 报：

`ERR_SSL_VERSION_OR_CIPHER_MISMATCH`

通常不是网站代码坏了，而是 `workers.dev` 域名在当前网络里被 DNS 污染或拦截。解决思路是不要继续使用 `workers.dev`，改用自己的域名或 GitHub Pages。

## 方案 A：GitHub Pages 免费永久网址

我已经给项目加了 GitHub Pages 自动发布配置：

`.github/workflows/github-pages.yml`

启用后会得到类似：

`https://zhaoyongle1531-web.github.io/zyl-ljj-love/`

操作：

1. 打开 GitHub 仓库：
   `https://github.com/zhaoyongle1531-web/zyl-ljj-love`
2. 进入 `Settings`
3. 进入 `Pages`
4. Source 选择 `GitHub Actions`
5. 保存后进入 `Actions`
6. 等待 `Deploy GitHub Pages` 运行完成

## 方案 B：Cloudflare 绑定自己的域名

这是最推荐的长期方案。

1. 准备一个域名，例如：
   `zyl-ljj-love.com`
2. 在 Cloudflare 里添加这个域名。
3. 如果域名不是在 Cloudflare 买的，把域名服务商里的 Nameserver 改成 Cloudflare 给你的两个 Nameserver。
4. 等 Cloudflare 显示域名 Active。
5. 进入 `Workers & Pages`。
6. 打开项目 `zyl-ljj-love`。
7. 进入 `Settings -> Domains & Routes`。
8. 点击 `Add -> Custom Domain`。
9. 填：
   `love.你的域名.com`
10. 等证书签发完成后，访问：
    `https://love.你的域名.com`

这个方案不再使用 `workers.dev`，一般能避开当前错误。
