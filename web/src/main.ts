import "./styles.css";
import { createTrainingCsv, createTrainingIcs } from "./domain/exporters";
import { mockCorosSnapshot } from "./domain/mockData";
import { getOnboardingSteps, validateIntakeDraft } from "./domain/onboarding";
import { getNextThreeDays, samplePlan } from "./domain/plan";
import { evaluateReadiness } from "./domain/readiness";
import type { IntakeDraft, OnboardingStepId, TrainingDay } from "./domain/types";

type PageId = OnboardingStepId | "dashboard";

const readiness = evaluateReadiness(mockCorosSnapshot);
const nextThreeDays = getNextThreeDays(samplePlan, "2026-06-02");
const onboardingSteps = getOnboardingSteps();

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

const root = app;

render();
window.addEventListener("hashchange", render);

function render(): void {
  const page = getCurrentPage();
  document.body.dataset.page = page;
  root.innerHTML = renderPage(page);
  bindGlobalActions();

  if (page === "intake") {
    bindIntakeForm();
  }
}

function getCurrentPage(): PageId {
  const route = window.location.hash.replace("#", "");
  if (route === "login" || route === "coros-auth" || route === "intake" || route === "dashboard") {
    return route;
  }

  return "landing";
}

function renderPage(page: PageId): string {
  if (page === "landing") return renderLandingPage();
  if (page === "login") return renderLoginPage();
  if (page === "coros-auth") return renderCorosAuthPage();
  if (page === "intake") return renderIntakePage();
  return renderDashboardPage();
}

function renderLandingPage(): string {
  return `
    <main class="marketing-shell">
      ${renderMarketingNav()}
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">COROS RUNNING COACH</p>
          <h1>跑者的 AI 教练</h1>
          <p class="subtitle">为高驰跑者读取训练、恢复、睡眠和心率数据，每天输出昨日训练评价、今日身体状态判断和未来 3 天调整建议。</p>
          <div class="hero-actions">
            <button class="primary-button inline-button" data-route="login" type="button">开始使用</button>
            <button class="ghost-button" data-route="coros-auth" type="button">查看授权流程</button>
          </div>
          <div class="trust-row">
            <span>只做跑步</span>
            <span>只承诺训练建议</span>
            <span>19.9 元/月</span>
          </div>
        </div>
        <div class="hero-visual" role="img" aria-label="跑者训练数据预览">
          <div class="hero-photo"></div>
          <div class="floating-review">
            <span>今日判断</span>
            <strong>${readiness.decision}</strong>
            <small>${readiness.nextThreeDayPolicy}</small>
          </div>
          <div class="floating-plan">
            <span>未来 3 天</span>
            <strong>${nextThreeDays[0].title}</strong>
            <small>${nextThreeDays[0].pace}</small>
          </div>
        </div>
      </section>

      <section class="feature-band">
        ${featureCard("每日自动复盘", "每天读取一次高驰数据，整理昨日训练完成质量和关键恢复指标。")}
        ${featureCard("动态调整计划", "根据 HRV、静息心率、睡眠、恢复和训练负荷，调整未来 3 天安排。")}
        ${featureCard("计划可导出", "支持表格、图片和日历，方便保存、分享或同步到个人日程。")}
      </section>

      <section class="process-band">
        <div>
          <p class="eyebrow">使用流程</p>
          <h2>4 步完成首次计划</h2>
        </div>
        <div class="step-grid">
          ${onboardingSteps.map((step, index) => stepCard(index + 1, step.title, step.description)).join("")}
        </div>
      </section>

      <section class="notice landing-notice">
        <strong>服务边界</strong>
        <span>本产品只提供跑步训练建议，不提供医疗诊断，不承诺比赛成绩。出现胸痛、头晕、持续疼痛或明显无力时，请停止训练并咨询专业人士。</span>
      </section>
    </main>
  `;
}

function renderLoginPage(): string {
  return `
    <main class="auth-shell">
      ${renderMarketingNav()}
      <section class="auth-layout">
        <div class="auth-copy">
          <p class="eyebrow">账号</p>
          <h1>保存你的训练计划和每日复盘</h1>
          <p class="subtitle">MVP 阶段先展示注册登录原型。正式版会接入手机号、微信或邮箱登录，并绑定订阅状态。</p>
          <div class="auth-benefits">
            <span>训练计划云端保存</span>
            <span>每日自动复盘记录</span>
            <span>手动追问额度管理</span>
          </div>
        </div>
        <section class="panel login-panel">
          <div class="segmented">
            <button class="active" type="button">登录</button>
            <button type="button">注册</button>
          </div>
          <label>
            手机号或邮箱
            <input type="text" value="runner@example.com" aria-label="手机号或邮箱" />
          </label>
          <label>
            验证码或密码
            <input type="password" value="123456" aria-label="验证码或密码" />
          </label>
          <button class="primary-button" data-route="coros-auth" type="button">继续</button>
          <p class="fine-print">继续代表你同意服务仅提供训练建议，不作为医疗诊断或比赛成绩承诺。</p>
        </section>
      </section>
    </main>
  `;
}

function renderCorosAuthPage(): string {
  return `
    <main class="flow-shell">
      ${renderMarketingNav()}
      <section class="flow-header">
        <p class="eyebrow">高驰授权</p>
        <h1>连接你的高驰数据</h1>
        <p class="subtitle">授权后，系统每天自动读取一次跑步、恢复、HRV、睡眠、静息心率和训练负荷，用于生成训练建议。</p>
      </section>
      <div class="auth-flow-grid">
        <section class="panel">
          <h2>会读取的数据</h2>
          <div class="data-scope">
            ${scopeItem("跑步记录", "距离、配速、时长、平均心率、最大心率")}
            ${scopeItem("恢复状态", "恢复分、训练负荷、疲劳趋势")}
            ${scopeItem("身体指标", "HRV、静息心率、睡眠时长与睡眠评分")}
            ${scopeItem("能力参考", "阈值配速、预测成绩、心率区间")}
          </div>
        </section>
        <section class="panel auth-card">
          <span class="auth-status">未授权</span>
          <h2>打开高驰授权窗口</h2>
          <p class="body-copy">正式版会跳转到高驰授权页面。用户完成登录和授权后，系统保存授权状态，并开始每日一次自动复盘。</p>
          <button class="primary-button" data-route="intake" type="button">模拟授权成功</button>
          <button class="ghost-button full-width" data-route="login" type="button">返回登录</button>
        </section>
      </div>
      <section class="notice">
        <strong>隐私说明</strong>
        <span>数据只用于训练建议、复盘和计划调整。用户应能在账号设置中随时取消授权并删除数据。</span>
      </section>
    </main>
  `;
}

function renderIntakePage(): string {
  return `
    <main class="flow-shell">
      ${renderMarketingNav()}
      <section class="flow-header">
        <p class="eyebrow">首次问卷</p>
        <h1>告诉我你的目标和训练偏好</h1>
        <p class="subtitle">高驰数据负责描述当前状态，问卷负责确认目标、时间安排和训练边界。两者结合后生成第一版训练计划。</p>
      </section>
      <form class="panel intake-form" id="intakeForm">
        <div class="form-grid">
          <label>
            目标类型
            <select name="targetRace">
              <option value="半马">半马</option>
              <option value="5K">5K</option>
              <option value="10K">10K</option>
              <option value="全马">全马</option>
              <option value="日常提升">日常提升</option>
            </select>
          </label>
          <label>
            目标赛事日期
            <input name="raceDate" type="date" value="2026-09-20" />
          </label>
          <label>
            当前 PB
            <input name="currentPb" type="text" value="1:48:30" placeholder="例如 1:48:30" />
          </label>
          <label>
            目标成绩
            <input name="goalTime" type="text" value="1:42:00" placeholder="例如 1:42:00" />
          </label>
          <label>
            每周可训练天数
            <input name="weeklyTrainingDays" type="number" min="3" max="7" value="5" />
          </label>
          <label>
            长距离跑安排
            <select name="preferredLongRunDay">
              <option value="周日">周日</option>
              <option value="周六">周六</option>
            </select>
          </label>
        </div>

        <fieldset>
          <legend>训练风格</legend>
          <label class="radio-card">
            <input name="trainingStyle" type="radio" value="conservative" />
            保守：优先稳定和低受伤风险
          </label>
          <label class="radio-card">
            <input name="trainingStyle" type="radio" value="standard" checked />
            标准：兼顾提升和恢复
          </label>
          <label class="radio-card">
            <input name="trainingStyle" type="radio" value="progressive" />
            进取：在恢复允许时提高刺激
          </label>
        </fieldset>

        <div class="switch-grid">
          <label class="switch-card">
            <input name="wantsStrength" type="checkbox" checked />
            <span>加入核心和腿部力量训练</span>
          </label>
          <label class="switch-card">
            <input name="acceptsCrossTraining" type="checkbox" checked />
            <span>接受骑行、椭圆机等交叉训练</span>
          </label>
        </div>

        <label>
          近期伤病或明显不适
          <textarea name="recentIssue" rows="4" placeholder="例如：无；或右膝外侧偶尔酸痛，最近两周没有影响跑姿">无</textarea>
        </label>

        <div id="intakeErrors" class="form-errors" aria-live="polite"></div>
        <button class="primary-button inline-button" type="submit">生成训练计划</button>
      </form>
    </main>
  `;
}

function renderDashboardPage(): string {
  return `
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
            <button class="primary-button" data-route="coros-auth" type="button">管理高驰授权</button>
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
}

function renderMarketingNav(): string {
  return `
    <nav class="site-nav">
      <button class="brand-button" data-route="landing" type="button">跑者的 AI 教练</button>
      <div class="nav-actions">
        <button data-route="login" type="button">登录</button>
        <button data-route="coros-auth" type="button">高驰授权</button>
        <button data-route="intake" type="button">首次问卷</button>
        <button data-route="dashboard" type="button">仪表盘</button>
      </div>
    </nav>
  `;
}

function bindGlobalActions(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      const route = button.dataset.route ?? "landing";
      window.location.hash = route === "landing" ? "" : route;
    });
  });

  document.querySelector<HTMLButtonElement>("#exportCsv")?.addEventListener("click", () => {
    downloadFile("coros-running-plan.csv", createTrainingCsv(samplePlan), "text/csv;charset=utf-8");
  });

  document.querySelector<HTMLButtonElement>("#exportIcs")?.addEventListener("click", () => {
    downloadFile("coros-running-plan.ics", createTrainingIcs(samplePlan, "跑者的 AI 教练"), "text/calendar;charset=utf-8");
  });

  document.querySelector<HTMLButtonElement>("#exportPng")?.addEventListener("click", () => {
    downloadShareCard(nextThreeDays);
  });
}

function bindIntakeForm(): void {
  const form = document.querySelector<HTMLFormElement>("#intakeForm");
  const errorBox = document.querySelector<HTMLDivElement>("#intakeErrors");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const draft = readIntakeDraft(form);
    const errors = validateIntakeDraft(draft);

    if (errors.length > 0) {
      if (errorBox) {
        errorBox.innerHTML = errors.map((error) => `<span>${error}</span>`).join("");
      }
      return;
    }

    window.location.hash = "dashboard";
  });
}

function readIntakeDraft(form: HTMLFormElement): IntakeDraft {
  const data = new FormData(form);

  return {
    targetRace: String(data.get("targetRace") ?? ""),
    raceDate: String(data.get("raceDate") ?? ""),
    currentPb: String(data.get("currentPb") ?? ""),
    goalTime: String(data.get("goalTime") ?? ""),
    weeklyTrainingDays: Number(data.get("weeklyTrainingDays") ?? 0),
    preferredLongRunDay: String(data.get("preferredLongRunDay") ?? ""),
    trainingStyle: String(data.get("trainingStyle") ?? "standard") as IntakeDraft["trainingStyle"],
    wantsStrength: data.has("wantsStrength"),
    acceptsCrossTraining: data.has("acceptsCrossTraining"),
    recentIssue: String(data.get("recentIssue") ?? "")
  };
}

function featureCard(title: string, body: string): string {
  return `
    <article class="feature-card">
      <h2>${title}</h2>
      <p>${body}</p>
    </article>
  `;
}

function stepCard(index: number, title: string, body: string): string {
  return `
    <article class="step-card">
      <span>${index}</span>
      <h3>${title}</h3>
      <p>${body}</p>
    </article>
  `;
}

function scopeItem(title: string, body: string): string {
  return `
    <div class="scope-item">
      <strong>${title}</strong>
      <span>${body}</span>
    </div>
  `;
}

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
