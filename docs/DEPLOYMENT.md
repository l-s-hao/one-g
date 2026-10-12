# 构建与部署

[项目首页](../README.md) · [开发指南](DEVELOPMENT.md) · [架构](ARCHITECTURE.md)

## 当前配置

源码证据为 `next.config.ts` 与 `.github/workflows/deploy-pages.yml`。仓库采用 Next.js 静态导出及 GitHub Pages 工作流，未发现 Vercel/Netlify 项目部署配置。`public/vercel.svg` 是残留静态文件，不是部署依据。

| 项目 | 实际值/行为 |
| --- | --- |
| 输出 | `output: "export"`，目录 `out/` |
| 部署前缀 | `basePath: "/one-g"` |
| 构建资源前缀 | `assetPrefix: "/one-g/"` |
| 路径 | `trailingSlash: true`，生成目录式 index.html |
| 图片 | `images.unoptimized: true`，不使用动态 Next 图片优化服务 |
| CI | ubuntu-latest，Node.js 20，npm ci + npm run build |

## 构建

```bash
npm ci
npm run build
```

动态商品详情由 `generateStaticParams` 决定导出路径，新增 slug 需要重新构建。运行时查询参数用于浏览器交互，不动态生成新服务器页面。

## GitHub Actions

[当前工作流](../.github/workflows/deploy-pages.yml) 的过程：

1. `main` 分支 push 或 `workflow_dispatch` 触发。
2. checkout，setup-node@v4 配置 Node 20 与 npm 缓存。
3. `npm ci` 安装，`npm run build` 生成静态站点。
4. configure-pages@v5 配置 Pages，upload-pages-artifact@v3 上传 `out/`。
5. deploy-pages@v4 部署至 github-pages environment。

权限仅按现有文件记录：contents:read、pages:write、id-token:write；同一 pages 并发组取消旧任务。工作流目前不单独运行 lint/测试，不能把部署成功等同于全量验收。GitHub Settings → Pages 的来源需要选择 GitHub Actions；本次未修改该设置或触发部署。

这里确认的是**工作流存在及构建规则**，没有查询线上 Actions 状态或保证当前 GitHub Pages 已同步未提交的本地代码。不要因文档说明自动提交或推送。

## 本地静态预览

把 `out/` 放在服务器根目录的 `one-g/` 子目录下，才能正确模拟前缀。安装了 Python 3 时，可在仓库根目录执行：

```bash
npm run build
python3 -c "from pathlib import Path; import tempfile, shutil; target = Path(tempfile.mkdtemp(prefix='one-g-preview-')); shutil.copytree('out', target / 'one-g'); print(target)"
```

上一步会输出新建的临时目录。将实际输出代入下一条命令，不在项目中写入机器专属路径：

```bash
python3 -m http.server 5558 --directory "<上一步输出的临时目录>"
```

访问 `http://localhost:5558/one-g/`。这里的尖括号是需要替换的命令参数，不是仓库文件。临时副本不自动更新，重新构建后需重新复制；停止服务器用 Ctrl+C。

## 路由与媒体规则

- 应用链接使用现有 Next Link/路由适配器处理 basePath，不把公开图片 URL 当页面链接拼接。
- 现有 Product/Solution 图片 URL 常已带 `/one-g/`；不要再次添加前缀。
- 浏览器图片只引用公开 URL，不能使用本地绝对路径或 file://。
- 概念图、草图和演示媒体保留来源说明；没有图片服务自动优化/上传处理。
- `/configure`、`/customize`、旧 SONIC Link 入口的兼容是客户端组件实现，不依赖服务端重定向。
- 仓库改名或改部署路径需要另一个配置变更任务统一检查 basePath、资源字段和 canonical；本次只写文档，没有改配置。

## 静态托管的边界

GitHub Pages 不提供本仓库缺失的验证码、用户数据库、订单服务、支付回调或邮件发送端点。正式构建禁用 Mock，不能把开发会话搬到静态生产站启用真实业务。后续接入服务需要独立设计身份验证、服务端定价、权限和支付核验流程。

部署文档不包含密钥、密码、验证码、私有接口凭证或真实银行资料。
