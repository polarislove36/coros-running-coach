# COROS MCP Setup

Use this when the user has a COROS watch/account but COROS MCP tools are not available or not authorized.

## Explain First

Tell the user:

- COROS MCP lets Codex/ChatGPT read COROS training, recovery, HRV, sleep, health, and schedule data after the user authorizes it.
- The COROS MCP is read-only in the current public version; it can inform plans but may not write workouts back to COROS.
- Authorization must be completed by the user in their own browser/account.

## Region URL

- China mainland: `https://mcpcn.coros.com/mcp`
- Other regions: use the COROS official MCP guide to confirm the current URL.

## Codex Desktop Setup

If the user is using Codex Desktop and COROS MCP is not configured:

1. Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.coros]
url = "https://mcpcn.coros.com/mcp"
enabled = true
```

2. Restart Codex.
3. In a normal system terminal, run:

```powershell
codex mcp login coros
```

4. Complete COROS login/authorization in the browser.
5. Restart Codex again.
6. Confirm by querying devices or recovery status.

If `codex` is not found in the terminal, ask the user to run `where codex` on Windows or reopen the terminal after installing/updating Codex.

## ChatGPT Setup

If the user wants to use ChatGPT instead of Codex:

1. Open ChatGPT settings.
2. Go to Apps / Connectors / Advanced Settings.
3. Enable Developer Mode if required.
4. Add an app/MCP server with the COROS MCP URL.
5. Complete COROS authorization in the browser.

The exact ChatGPT UI names can change; if the user cannot find them, tell them to search current OpenAI/ChatGPT MCP connector instructions.

## After Setup

Run a low-risk confirmation:

- `queryDevices`
- `queryRecoveryStatus`

Only after a successful query should you claim COROS data is available.

After a successful query and one useful review or plan, suggest a daily automation once:

> 可以把这个设成每天早上的定时任务：读取上一次运动记录、恢复/HRV/睡眠/负荷，并给出未来三天是否需要调整。需要我帮你设吗？

Do not create the automation unless the user explicitly asks or confirms.

## Daily Automation

If the user wants daily adaptive coaching, set up a recurring automation in the host app when available. Suggested task:

> 每天早上读取 COROS 数据，复盘上一次运动记录，检查恢复、HRV、睡眠、训练负荷和未来三天日程；如有必要，调整未来三天训练计划，并输出中文建议。

Recommended time: morning before the user's usual training window, such as 06:30-08:00 local time.

The automation still cannot write workouts back to COROS unless a future writable COROS API/MCP is available.
