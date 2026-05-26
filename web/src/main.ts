import "./styles.css";
import { createTrainingCsv, createTrainingIcs } from "./domain/exporters";
import { mockCorosSnapshot } from "./domain/mockData";
import { getNextThreeDays, samplePlan } from "./domain/plan";
import { evaluateReadiness } from "./domain/readiness";
import type { TrainingDay } from "./domain/types";

const readiness = evaluateReadiness(mockCorosSnapshot);
const nextThreeDays = getNextThreeDays(samplePlan, "2026-06-02");

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">COROS RUNNING WEB MVP</p>
        <h1>跑者的 AI 教练</h1>
        <p class="subtitle">读取高驰训练与恢复数据，每天给出训练评价、身体状态判断和未来 3 天调整建议。</p>
      </div>
      <div class="price">
        <span>订阅方案</span>
        <strong>19.9 元/月</strong>
        <small>每日 1 次自动复盘 + 30 次手动追问</small>
      </div>
    </header>

    <section class="notice">
      <strong>服务边界</strong>
      <span>本产品只提供跑步训练建议，不提供医疗诊断，不承诺比赛成绩。出现胸痛、头晕、持续疼痛或明显无力时，请停止训练并咨询专业人士。</span>
    </section>

    <div class="layout">
      <section class="main-column">
        <section class="panel coach-panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">今日教练判断</p>
              <h2>${readiness.decision}</h2>
            </div>
            <span class="status status-${readiness.level}">${levelLabel(readiness.level)}</span>
          </div>
          <p class="coach-summary">${readiness.summary}</p>
          <div class="metrics">
            ${metricCard("恢复分", `${mockCorosSnapshot.recoveryScore}`, "满分 100")}
            ${metricCard("HRV", `${mockCorosSnapshot.hrvMs} ms`, `基线 ${mockCorosSnapshot.hrvBaselineMs} ms`)}
            ${metricCard("静息心率", `${mockCorosSnapshot.restingHr} bpm`, `基线 ${mockCorosSnapshot.restingHrBaseline} bpm`)}
            ${metricCard("睡眠", `${mockCorosSnapshot.sleepHours} h`, `评分 ${mockCorosSnapshot.sleepScore}`)}
          </div>
          <div class="risk-box">
            <strong>调整策略</strong>
            <span>${readiness.nextThreeDayPolicy}</span>
          </div>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">昨日训练评价</p>
              <h2>${mockCorosSnapshot.latestWorkout.name}</h2>
            </div>
            <span class="pill">${mockCorosSnapshot.latestWorkout.date}</span>
          </div>
          <div class="workout-grid">
            ${metricCard("距离", `${mockCorosSnapshot.latestWorkout.distanceKm} km`, "已完成")}
            ${metricCard("平均配速", mockCorosSnapshot.latestWorkout.avgPace, "轻松跑范围内")}
            ${metricCard("平均心率", `${mockCorosSnapshot.latestWorkout.avgHr} bpm`, "Z2 附近")}
          </div>
          <p class="body-copy">整体强度符合轻松跑目的，心率没有明显漂移。今天不追加额外强度，按计划进入下一次有氧训练。</p>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">未来 3 天调整</p>
              <h2>按恢复状态滚动更新</h2>
            </div>
          </div>
          ${trainingTable(nextThreeDays, "compact-table")}
        </section>

        <section class="panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">第 1 周｜有氧能力建设基础期｜周跑量34km</p>
              <h2>本周训练计划</h2>
            </div>
          </div>
          ${trainingTable(samplePlan, "plan-table")}
        </section>
      </section>

      <aside class="side-column">
        <section class="panel auth-panel">
          <p class="eyebrow">高驰授权</p>
          <h2>已连接示例数据</h2>
          <p class="body-copy">MVP 当前使用模拟高驰数据。正式版会引导用户授权，并每天自动读取一次训练、恢复、HRV、睡眠和静息心率。</p>
          <button class="primary-button" type="button">连接高驰账号</button>
        </section>

        <section class="panel">
          <p class="eyebrow">订阅额度</p>
          <h2>本月剩余</h2>
          <div class="quota">
            <span>自动复盘</span>
            <strong>每日 1 次</strong>
          </div>
          <div class="quota">
            <span>手动追问</span>
            <strong>27 / 30 次</strong>
          </div>
        </section>

        <section class="panel">
          <p class="eyebrow">导出计划</p>
          <h2>分享与同步</h2>
          <div class="export-actions">
            <button id="exportCsv" type="button">导出表格 CSV</button>
            <button id="exportIcs" type="button">同步日历 ICS</button>
            <button id="exportPng" type="button">生成图片 PNG</button>
          </div>
        </section>

        <section class="panel roadmap">
          <p class="eyebrow">版本节奏</p>
          <ol>
            <li>V1：高驰跑步网页版</li>
            <li>V2：佳明接入与 iOS 准备</li>
            <li>V3：越野跑、自行车、铁三、HYROX</li>
          </ol>
        </section>
      </aside>
    </div>
  </main>
`;

document.querySelector<HTMLButtonElement>("#exportCsv")?.addEventListener("click", () => {
  downloadFile("coros-running-plan.csv", createTrainingCsv(samplePlan), "text/csv;charset=utf-8");
});

document.querySelector<HTMLButtonElement>("#exportIcs")?.addEventListener("click", () => {
  downloadFile("coros-running-plan.ics", createTrainingIcs(samplePlan, "跑者的 AI 教练"), "text/calendar;charset=utf-8");
});

document.querySelector<HTMLButtonElement>("#exportPng")?.addEventListener("click", () => {
  downloadShareCard(nextThreeDays);
});

function metricCard(label: string, value: string, hint: string): string {
  return `
    <div class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </div>
  `;
}

function trainingTable(days: TrainingDay[], className: string): string {
  const rows = days
    .map(
      (day) => `
        <tr>
          <td><strong>${day.date}</strong><span>${day.weekday}</span></td>
          <td>${day.session}</td>
          <td>${day.pace}</td>
          <td>${day.heartRate}</td>
          <td>${day.purpose}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div class="table-wrap ${className}">
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>训练项目</th>
            <th>参考配速</th>
            <th>参考心率</th>
            <th>目的</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function levelLabel(level: string): string {
  if (level === "ready") return "状态可训练";
  if (level === "caution") return "建议降强度";
  return "建议休息";
}

function downloadFile(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadShareCard(days: TrainingDay[]): void {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 1500;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#f8fbfd";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#07151f";
  ctx.font = "700 78px Arial, sans-serif";
  ctx.fillText("跑者的 AI 教练", 80, 130);
  ctx.fillStyle = "#0f9ec4";
  ctx.fillRect(80, 165, 240, 10);
  ctx.fillStyle = "#22313b";
  ctx.font = "32px Arial, sans-serif";
  ctx.fillText("未来 3 天训练调整建议", 80, 240);

  days.forEach((day, index) => {
    const y = 330 + index * 330;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 80, y, 1040, 260, 28);
    ctx.fill();
    ctx.fillStyle = index === 0 ? "#0f9ec4" : index === 1 ? "#2e7d5b" : "#d46b08";
    ctx.fillRect(80, y, 12, 260);
    ctx.fillStyle = "#07151f";
    ctx.font = "700 38px Arial, sans-serif";
    ctx.fillText(`${day.date} ${day.weekday}｜${day.title}`, 130, y + 72);
    ctx.font = "30px Arial, sans-serif";
    wrapCanvasText(ctx, day.session, 130, y + 128, 900, 42);
    ctx.fillStyle = "#52626d";
    ctx.font = "26px Arial, sans-serif";
    wrapCanvasText(ctx, `${day.pace}｜${day.heartRate}`, 130, y + 210, 900, 36);
  });

  ctx.fillStyle = "#52626d";
  ctx.font = "26px Arial, sans-serif";
  ctx.fillText("仅提供训练建议，不提供医疗诊断或成绩承诺", 80, 1430);

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = "coros-running-plan.png";
  link.click();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  let line = "";
  let lineY = y;

  for (const char of text) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      ctx.fillText(line, x, lineY);
      line = char;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, lineY);
  }
}
