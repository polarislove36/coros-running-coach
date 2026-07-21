# XUNMOVE 朋友测试部署

当前测试版由 FastAPI 同源托管前端构建结果和 `/api` 接口。浏览器只访问一个地址，不需要分别启动前端和后端。

## 本机测试

在 PowerShell 中运行：

```powershell
& "C:\Users\Jaco Wang\.codex\skills\coros-running-coach\scripts\start-test-site.ps1"
```

然后打开 `http://127.0.0.1:8000`。按 `Ctrl+C` 停止服务。

## 发给朋友测试

在 PowerShell 中运行：

```powershell
& "C:\Users\Jaco Wang\.codex\skills\coros-running-coach\scripts\share-test-site.ps1"
```

构建和健康检查完成后，终端会显示一个 `https://*.trycloudflare.com` 临时地址。将这个地址发给朋友即可。关闭脚本后地址失效。

## 当前测试边界

- 登录使用邮箱创建测试账户，尚未接入短信、验证码或正式身份认证服务。
- COROS 设备流程使用明确标识的演示设备模式；真实 COROS OAuth 需要配置官方授权地址和凭据。
- 训练档案、赛事、计划、每日复盘、计划调整、导出和账户数据已经走真实后端与 SQLite。
- 付费、每日云端定时任务和生产环境监控不在这次朋友测试范围内。
