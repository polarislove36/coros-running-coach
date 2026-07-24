import "./styles.css";
import "./taste.css";
import "./field.css";
import "./product.css";
import {
  Activity,
  ArrowRight,
  Award,
  Bike,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Footprints,
  ListChecks,
  Mountain,
  RefreshCw,
  Route,
  Target,
  Watch,
  Waves,
  Workflow,
  Zap,
  createIcons
} from "lucide";
import {
  ApiError,
  authorizeCoros,
  createEvent as createBackendEvent,
  deleteAccount,
  deleteEvent as deleteBackendEvent,
  disconnectDevice,
  downloadApiFile,
  exportAccountData,
  generatePlan,
  getCurrentPlan,
  getDashboard,
  getMe,
  getProfile,
  getSettings,
  isDemoMode,
  listDevices,
  listEvents,
  listReviews,
  login,
  logout,
  saveProfile,
  saveSettings,
  submitDailyReview,
  syncCoros,
  updateEvent as updateBackendEvent
} from "./api/client";
import type { ApiPlan, ApiUser, DashboardData, IntakePayload, UserSettings } from "./api/client";
import { createTrainingCsv, createTrainingIcs } from "./domain/exporters";
import { getLandingPlanDate, landingPlans } from "./domain/landingPlans";
import { mockCorosSnapshot } from "./domain/mockData";
import { deviceConnections, multisportWeek, raceGoals, reviewHistory } from "./domain/productData";
import { evaluateReadiness } from "./domain/readiness";
import type { DeviceConnection, RaceGoal, ReviewRecord, SportType, TrainingDay } from "./domain/types";
import { renderTasteLandingPage } from "./tasteLanding";
import { renderFieldLandingPage } from "./fieldLanding";
import { renderFieldLanding2151Page } from "./fieldLanding2151";
import {
  renderAccountPage,
  renderChangesPage,
  renderCheckInPage,
  renderExportsPage,
  renderInitialPlanPage,
  renderPricingPage,
  renderWorkoutPage
} from "./productPages";

type PageId =
  | "landing"
  | "landing-taste"
  | "landing-minimal"
  | "landing-2151"
  | "login"
  | "connect"
  | "intake"
  | "generating"
  | "pricing"
  | "initial-plan"
  | "today"
  | "plan"
  | "reviews"
  | "events"
  | "devices"
  | "workout"
  | "check-in"
  | "changes"
  | "exports"
  | "account";

type SportFilter = "all" | SportType;

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

const root = app;
const readiness = evaluateReadiness(mockCorosSnapshot);
let activeSport: SportFilter = "all";
let activeLandingPlan = 0;
let activeLandingWeek = 0;
let eventState: RaceGoal[] = [...raceGoals];
let trainingDays: TrainingDay[] = [...multisportWeek];
let reviewState: ReviewRecord[] = [...reviewHistory];
let deviceState: DeviceConnection[] = [...deviceConnections];
let dashboardState: DashboardData | null = null;
let currentPlanMeta: ApiPlan | null = null;
let currentUser: ApiUser | null = null;
let authResolved = isDemoMode;
let profileState: IntakePayload | null = null;
let settingsState: UserSettings = { daily_plan_update: true, workout_review: true, event_reminders: true };
let currentDataMode: "demo" | "cache" = "demo";
let activePlanWeek = 0;
let activeWorkoutIndex = Math.max(0, trainingDays.findIndex((day) => day.date === "2026-07-10"));

render();
void hydrateFromApi();
window.addEventListener("hashchange", render);

async function hydrateFromApi(): Promise<void> {
  if (isDemoMode) return;
  try {
    currentUser = await getMe();
  } catch (error) {
    authResolved = true;
    if (isProtectedPage(getCurrentPage())) navigate("login");
    else render();
    return;
  }
  authResolved = true;
  currentPlanMeta = null;
  trainingDays = [];
  eventState = [];
  reviewState = [];
  deviceState = [];
  dashboardState = null;
  profileState = null;
  const [planResult, eventResult, deviceResult, reviewResult, dashboardResult, profileResult, settingsResult] = await Promise.allSettled([
    getCurrentPlan(),
    listEvents(),
    listDevices(),
    listReviews(),
    getDashboard(),
    getProfile(),
    getSettings()
  ]);
  if (planResult.status === "fulfilled") {
    currentPlanMeta = planResult.value.plan;
    trainingDays = planResult.value.days;
    currentDataMode = planResult.value.plan.data_mode;
  }
  if (eventResult.status === "fulfilled") eventState = eventResult.value;
  if (deviceResult.status === "fulfilled") deviceState = deviceResult.value;
  if (reviewResult.status === "fulfilled") reviewState = reviewResult.value;
  if (dashboardResult.status === "fulfilled") dashboardState = dashboardResult.value;
  if (profileResult.status === "fulfilled" && Object.keys(profileResult.value).length) profileState = profileResult.value;
  if (settingsResult.status === "fulfilled") settingsState = settingsResult.value;
  render();
}

function render(): void {
  const page = getCurrentPage();
  document.body.dataset.page = page;
  root.innerHTML = renderPage(page);
  bindRouteActions();
  bindPageActions(page);
  createIcons({
    root,
    icons: {
      Activity,
      ArrowRight,
      Award,
      Bike,
      CalendarDays,
      ChevronLeft,
      ChevronRight,
      Footprints,
      ListChecks,
      Mountain,
      RefreshCw,
      Route,
      Target,
      Watch,
      Waves,
      Workflow,
      Zap
    },
    attrs: { "aria-hidden": "true", width: 20, height: 20, "stroke-width": 1.8 }
  });
}

function getCurrentPage(): PageId {
  const route = window.location.hash.replace("#", "") as PageId;
  const routes: PageId[] = [
    "landing",
    "landing-taste",
    "landing-minimal",
    "landing-2151",
    "login",
    "connect",
    "intake",
    "generating",
    "pricing",
    "initial-plan",
    "today",
    "plan",
    "reviews",
    "events",
    "devices",
    "workout",
    "check-in",
    "changes",
    "exports",
    "account"
  ];

  return routes.includes(route) ? route : "landing-minimal";
}

function renderPage(page: PageId): string {
  if (!isDemoMode && isProtectedPage(page) && !authResolved) return renderSessionLoadingPage();
  if (!isDemoMode && isProtectedPage(page) && !currentUser) return renderLoginPage();
  if (page === "landing") return renderLandingPage();
  if (page === "landing-taste") return renderTasteLandingPage(activeLandingPlan);
  if (page === "landing-minimal") return renderFieldLandingPage(activeLandingPlan, activeLandingWeek);
  if (page === "landing-2151") return renderFieldLanding2151Page(activeLandingPlan);
  if (page === "login") return renderLoginPage();
  if (page === "connect") return renderConnectPage();
  if (page === "intake") return renderIntakePage();
  if (page === "generating") return renderGeneratingPage();
  if (page === "pricing") return renderPricingPage();
  if (page === "initial-plan") return renderInitialPlanPage(trainingDays, productPageContext());
  if (page === "today") return renderAppShell(page, renderTodayPage());
  if (page === "plan") return renderAppShell(page, renderPlanPage());
  if (page === "reviews") return renderAppShell(page, renderReviewsPage());
  if (page === "events") return renderAppShell(page, renderEventsPage());
  if (page === "devices") return renderAppShell(page, renderDevicesPage());
  if (page === "workout") {
    const workout = trainingDays[activeWorkoutIndex] ?? trainingDays[0];
    return renderAppShell(page, workout ? renderWorkoutPage(workout) : renderMissingPlanPage("训练详情"));
  }
  if (page === "check-in") return renderAppShell(page, renderCheckInPage());
  if (page === "changes") return renderAppShell(page, renderChangesPage(productPageContext()));
  if (page === "exports") return renderAppShell(page, currentPlanMeta ? renderExportsPage(productPageContext()) : renderMissingPlanPage("导出与日历"));
  return renderAppShell(page, renderAccountPage(productPageContext()));
}

function isProtectedPage(page: PageId): boolean {
  return !["landing", "landing-taste", "landing-minimal", "landing-2151", "login", "pricing"].includes(page);
}

function renderSessionLoadingPage(): string {
  return `<main class="generation-page"><div class="generation-card"><div class="generation-logo">${renderBrandMark()}</div><span class="section-kicker">正在恢复会话</span><h1>读取你的训练档案</h1><p>正在连接计划与设备数据。</p></div></main>`;
}

function renderMissingPlanPage(title: string): string {
  return `<section class="workspace-page">${renderWorkspaceHeader(title, "先生成训练计划，再使用此功能", "尚未建立计划")}<section class="workspace-panel empty-workspace-state"><span class="section-kicker">需要训练计划</span><h2>这里还没有内容</h2><p>完成训练档案后，系统会生成首批两周训练，并开放训练详情和导出功能。</p><button class="button button-primary" data-route="intake" type="button">建立训练档案</button></section></section>`;
}

function productPageContext() {
  return { user: currentUser, profile: profileState, plan: currentPlanMeta, events: eventState, reviews: reviewState, settings: settingsState };
}

function renderLandingPage(): string {
  return `
    <main class="marketing-page">
      ${renderMarketingNav()}
      <section class="xm-hero">
        <div class="marketing-container xm-hero-grid">
          <div class="xm-hero-copy">
            <span class="xm-eyebrow">AI 多运动教练系统</span>
            <h1>让每次训练，<br>都有下一步</h1>
            <p>面向跑步、骑行、越野跑和混合耐力训练。连接运动设备，生成周期计划，再根据每次训练和恢复状态持续调整。</p>
            <div class="xm-hero-actions">
              <button class="button button-primary" data-route="login" type="button">生成我的 30 天计划 <i data-lucide="arrow-right"></i></button>
              <button class="xm-link-button" data-scroll="plans" type="button">先看计划示例</button>
            </div>
            <div class="xm-sport-line" aria-label="支持的运动方向">
              <span><i data-lucide="footprints"></i>跑步</span>
              <span><i data-lucide="bike"></i>骑行</span>
              <span><i data-lucide="mountain"></i>越野跑</span>
              <span><i data-lucide="workflow"></i>混合训练 / 铁三</span>
            </div>
          </div>
          <div class="xm-hero-visual" aria-label="跑步、骑行和越野跑训练场景">
            <div class="xm-photo xm-photo-road"><img src="/road-cyclists-jack-white.jpg" alt="瑞士山路上的公路骑行训练"></div>
            <div class="xm-photo xm-photo-trail"><img src="/trail-runner-lucas-canino.jpg" alt="山地越野跑训练"></div>
            <div class="xm-live-card">
              <div><span>今日判断</span><b>适合低强度有氧</b></div>
              <strong>骑行 Z2 · 70 分钟</strong>
              <p>睡眠偏短，原跑步节奏课顺延 24 小时。</p>
              <div class="xm-zone-bar"><i></i><i></i><i></i><i></i><i></i></div>
            </div>
          </div>
        </div>
        <div class="marketing-container xm-proof-row">
          <span><b>30 天</b>首次生成</span>
          <span><b>1 次/日</b>自动复盘</span>
          <span><b>未来 3 天</b>动态调整</span>
          <span><b>设备数据</b>训练与恢复共同判断</span>
        </div>
      </section>

      <section id="sports" class="xm-section xm-sports-section">
        <div class="marketing-container">
          <div class="xm-section-heading">
            <span class="xm-eyebrow">一个周期，多种运动</span>
            <h2>不是几张课表拼在一起</h2>
            <p>系统先判断赛事优先级和恢复预算，再决定每个项目这周该做多少。</p>
          </div>
          <div class="xm-sports-layout">
            <div class="xm-sport-nav">
              ${renderLandingSport("footprints", "跑步", "配速、跑量、长跑与质量课", "run")}
              ${renderLandingSport("bike", "骑行", "功率、心率、踏频与长骑", "bike")}
              ${renderLandingSport("mountain", "越野跑", "爬升、下坡、技术路面与补给", "trail")}
              ${renderLandingSport("workflow", "混合训练", "跨项目负荷、赛事优先级与转换", "mixed")}
              ${renderLandingSport("activity", "铁三", "完整周期、砖块训练与三项协同", "tri")}
            </div>
            <div class="xm-decision-board">
              <header><span>本周训练决策</span><b>基础建设 · 6h 20m</b></header>
              <div class="xm-load-track">
                <span style="--size:31%;--color:#ef5b36">跑步 2h 00m</span>
                <span style="--size:43%;--color:#1f8b70">骑行 2h 45m</span>
                <span style="--size:18%;--color:#7868e6">越野 1h 10m</span>
                <span style="--size:8%;--color:#8a96a8">力量 25m</span>
              </div>
              <div class="xm-decision-list">
                <article><i data-lucide="target"></i><div><b>A 级赛事优先</b><span>全马周期保持连续性</span></div><em>已纳入</em></article>
                <article><i data-lucide="zap"></i><div><b>强度不叠加</b><span>长骑后不安排跑步阈值</span></div><em>已调整</em></article>
                <article><i data-lucide="refresh-cw"></i><div><b>恢复预算</b><span>HRV 与睡眠每天复核</span></div><em>每日更新</em></article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" class="xm-section xm-plans-section">
        <div class="marketing-container">
          <div class="xm-section-heading xm-plan-heading">
            <div><span class="xm-eyebrow">真实计划示例</span><h2>开始时，先给你完整 30 天</h2></div>
            <p>下面三份计划来自三类不同用户。左右切换，看看系统怎样处理单项、双项目和跨专项目标。</p>
          </div>
          ${renderLandingPlanCarousel()}
        </div>
      </section>

      <section id="how" class="xm-section xm-start-section">
        <div class="marketing-container">
          <div class="xm-section-heading xm-centered-heading">
            <span class="xm-eyebrow">开始使用</span>
            <h2>四步，把训练交代清楚</h2>
          </div>
          <div class="xm-start-steps">
            ${renderLandingStep("target", "01", "选择方向", "选择主项目、混合项目和赛事优先级")}
            ${renderLandingStep("watch", "02", "连接设备", "授权读取训练、心率、睡眠和恢复数据")}
            ${renderLandingStep("list-checks", "03", "补充目标", "填写成绩、时间安排、伤病和训练偏好")}
            ${renderLandingStep("refresh-cw", "04", "每天调整", "复盘上一练，更新今天与未来三天")}
          </div>
          <section class="xm-faq" aria-labelledby="faqTitle">
            <div class="xm-faq-heading">
              <span class="xm-eyebrow">常见问题</span>
              <h3 id="faqTitle">开始之前，你可能想知道</h3>
            </div>
            <div class="xm-faq-columns">
              <div>
                ${renderFaqItem("支持哪些运动项目？", "支持跑步、骑行、越野跑、混合耐力训练和完整铁三周期。系统会根据主项目和赛事优先级协调总负荷。")}
                ${renderFaqItem("目前支持哪些运动设备？", "首版直接连接 COROS。后续设备会使用同一数据模型接入，不改变你的训练计划和历史记录。")}
                ${renderFaqItem("首次为什么先生成 30 天？", "30 天足以建立第一阶段训练节奏，也保留了根据真实执行和恢复状态持续调整的空间。")}
              </div>
              <div>
                ${renderFaqItem("计划每天都会变化吗？", "不会为了变化而变化。只有训练完成情况、HRV、静息心率、睡眠或恢复状态出现有效信号时才调整。")}
                ${renderFaqItem("可以手动调整计划或追问吗？", "可以。你可以说明出差、临时无暇训练、身体不适或场地限制，教练会重新安排后续训练。")}
                ${renderFaqItem("这是医疗建议或成绩保证吗？", "不是。产品提供训练建议，不替代医疗诊断、康复治疗或线下教练判断，也不承诺比赛成绩。")}
              </div>
            </div>
          </section>
          <div id="pricing" class="xm-pricing-band">
            <div><span>完整会员</span><strong>¥19.9<small>/月</small></strong></div>
            <p>30 天起步计划 · 每日自动复盘 · 教练追问 · 表格 / 图片 / 日历导出</p>
            <button class="button button-primary" data-route="login" type="button">开始建立计划 <i data-lucide="arrow-right"></i></button>
          </div>
        </div>
      </section>

      <footer class="xm-footer">
        <div class="marketing-container">
          <div>${renderBrandMark()}<p>AI 多运动教练系统</p></div>
          <p>提供训练建议，不替代医疗诊断、康复治疗或线下教练判断。</p>
        </div>
      </footer>
    </main>
  `;
}

function renderBrandMark(): string {
  return `<img class="xm-brand-logo" src="/xunmove-logo.svg" alt=""><span class="xm-brand-name"><b>XUNMOVE</b><small>训动</small></span>`;
}

function renderLandingSport(icon: string, title: string, body: string, accent: string): string {
  return `<article class="xm-sport-item xm-sport-${accent}"><i data-lucide="${icon}"></i><div><b>${title}</b><span>${body}</span></div></article>`;
}

function renderLandingStep(icon: string, number: string, title: string, body: string): string {
  return `<article class="xm-start-step"><span>${number}</span><i data-lucide="${icon}"></i><div><b>${title}</b><p>${body}</p></div></article>`;
}

function renderFaqItem(question: string, answer: string): string {
  return `<details class="xm-faq-item"><summary>${question}</summary><p>${answer}</p></details>`;
}

function renderLandingPlanCarousel(): string {
  const plan = landingPlans[activeLandingPlan];
  return `
    <div class="xm-plan-selector" role="tablist" aria-label="训练计划示例">
      <div>${landingPlans.map((item, index) => `<button class="${index === activeLandingPlan ? "active" : ""}" data-plan-index="${index}" type="button" role="tab" aria-selected="${index === activeLandingPlan}">${item.label}</button>`).join("")}</div>
      <div class="xm-plan-arrows">
        <button data-plan-direction="prev" type="button" aria-label="上一个计划"><i data-lucide="chevron-left"></i></button>
        <span>${activeLandingPlan + 1} / ${landingPlans.length}</span>
        <button data-plan-direction="next" type="button" aria-label="下一个计划"><i data-lucide="chevron-right"></i></button>
      </div>
    </div>
    <div class="xm-plan-slide plan-${plan.id}" aria-live="polite">
      <aside class="xm-plan-summary">
        <span class="xm-plan-type">${plan.label}</span>
        <h3>${plan.title}</h3>
        <p>${plan.profile}</p>
        <dl>
          <div><dt>目标</dt><dd>${plan.goal}</dd></div>
          <div><dt>当前阶段</dt><dd>${plan.phase}</dd></div>
          <div><dt>30 天负荷</dt><dd>${plan.load}</dd></div>
        </dl>
        <blockquote>${plan.insight}</blockquote>
      </aside>
      <div class="xm-plan-calendar-wrap">
        <header><div><i data-lucide="calendar-days"></i><b>07/13 — 08/11</b></div><span>首次生成的 30 天计划</span></header>
        ${renderLandingPlanCalendar()}
        <div class="xm-plan-legend"><span class="run">跑步</span><span class="bike">骑行</span><span class="trail">越野</span><span class="strength">力量</span><span class="rest">休息</span></div>
      </div>
    </div>
  `;
}

function renderLandingPlanCalendar(): string {
  const plan = landingPlans[activeLandingPlan];
  const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
  const cells = Array.from({ length: 35 }, (_, index) => {
    const day = index + 1;
    if (day > 30) return `<div class="xm-plan-day empty" aria-hidden="true"></div>`;
    const session = plan.sessions.find((item) => item.day === day);
    const sport = session?.sport ?? "rest";
    return `<article class="xm-plan-day ${sport}" title="${session ? `${session.title}：${session.detail}` : "休息"}"><span>${getLandingPlanDate(day)}</span><b>${session?.title ?? "休息"}</b><small>${session?.detail ?? "恢复与生活安排"}</small></article>`;
  }).join("");
  return `<div class="xm-calendar-weekdays">${weekdays.map((day) => `<span>周${day}</span>`).join("")}</div><div class="xm-plan-calendar">${cells}</div>`;
}

function renderLoginPage(): string {
  return `
    <main class="auth-page">
      ${renderMarketingNav()}
      <section class="auth-grid marketing-container">
        <div class="auth-story">
          <span class="section-kicker">欢迎使用 XUNMOVE 训动</span>
          <h1>把训练计划和每天的身体状态放在一起</h1>
          <p>登录后保存周期计划、设备授权、赛事目标和每日复盘记录。</p>
          <div class="auth-photo"><img src="/road-cyclists-jack-white.jpg" alt="山路耐力骑行训练"></div>
        </div>
        <form class="form-panel" id="loginForm">
          <div class="segmented-control" aria-label="账号操作">
            <button class="active" type="button">登录</button>
            <button type="button">注册</button>
          </div>
          <div class="form-title"><h2>登录账号</h2><p>使用已分配的内测账号继续。</p></div>
          <label class="field-label">测试账号<input name="account" type="text" value="laohuang" autocomplete="username" required></label>
          <label class="field-label">密码<input name="password" type="password" value="123456" autocomplete="current-password" required></label>
          <button class="button button-primary button-block" type="submit">继续</button>
          <p class="form-error" id="loginError" role="alert"></p>
          <p class="form-note">继续代表你同意产品仅提供训练建议，不构成医疗诊断或比赛成绩承诺。</p>
        </form>
      </section>
    </main>
  `;
}

function renderConnectPage(): string {
  const coros = deviceState.find((device) => device.id === "coros");
  const connected = coros?.status === "connected";
  const pending = coros?.connectionStatus === "authorization_pending";
  const actionLabel = connected
    ? coros.lastSync ? "重新同步并继续" : "读取 COROS 数据并继续"
    : pending ? "重新发起授权" : "前往 COROS 官方授权";
  return `
    <main class="flow-page">
      ${renderFlowNav("连接设备", 1)}
      <section class="flow-container">
        <div class="flow-heading"><span class="section-kicker">设备数据</span><h1>连接你的运动设备</h1><p>设备数据负责描述你练了什么、恢复得怎样。首个真实数据源为 COROS，其他设备会按同一数据模型接入。</p></div>
        <div class="connect-layout">
          <section class="connect-primary">
            <div class="device-logo">COROS</div>
            <div><span class="availability">${connected ? "已完成官方授权" : "首版支持"}</span><h2>${connected ? "COROS 账号已连接" : "连接 COROS 账号"}</h2><p>${connected ? "授权令牌已加密保存。现在读取训练记录与恢复数据，建立你的真实训练基线。" : "将在 COROS 官方页面登录并确认权限。训动不会接触或保存你的 COROS 密码。"}</p>${coros?.lastSync ? `<span class="device-sync-note">最近同步：${escapeHtml(coros.lastSync)}</span>` : ""}</div>
            <button class="button button-primary" id="connectCoros" type="button">${actionLabel}</button>
            <p class="form-error" id="connectError" role="alert">${escapeHtml(coros?.connectionError ?? "")}</p>
          </section>
          <section class="scope-panel">
            <h2>授权后会读取</h2>
            <div class="scope-grid">
              ${scopeItem("训练记录", "运动类型、距离、时长、配速和功率")}
              ${scopeItem("身体状态", "恢复分、HRV、睡眠和静息心率")}
              ${scopeItem("训练负荷", "短期负荷、长期负荷和疲劳趋势")}
              ${scopeItem("能力区间", "心率区间、阈值和预测能力")}
            </div>
          </section>
        </div>
        <div class="flow-actions"><button class="button button-secondary" data-route="login" type="button">返回</button>${connected ? `<button class="text-button" data-route="intake" type="button">稍后同步，先填写训练目标</button>` : `<button class="text-button" data-route="intake" type="button">暂时跳过，使用演示数据</button>`}</div>
      </section>
    </main>
  `;
}

function renderIntakePage(): string {
  return `
    <main class="flow-page">
      ${renderFlowNav("训练档案", 2)}
      <section class="flow-container wizard-layout">
        <aside class="wizard-sidebar">
          <span class="section-kicker">首次设置</span>
          <h1>建立你的训练档案</h1>
          <p>设备数据描述当前状态，你的回答决定训练要去哪里。</p>
          <ol class="wizard-progress">
            <li class="active" data-step-indicator="1"><span>1</span>目标赛事</li>
            <li data-step-indicator="2"><span>2</span>运动组合</li>
            <li data-step-indicator="3"><span>3</span>时间安排</li>
          </ol>
        </aside>
        <form class="wizard-card" id="intakeForm">
          <section class="wizard-panel active" data-step="1">
            <div class="form-title"><span>第 1 步，共 3 步</span><h2>先确定训练要去哪里</h2><p>有目标赛事时围绕比赛建立周期；没有赛事时，从运动方向和训练目的开始。</p></div>
            <div class="goal-mode-switch" role="radiogroup" aria-label="训练目标类型">
              <label><input type="radio" name="goalMode" value="race" checked><span><b>我有目标赛事</b><small>按比赛日期建立完整周期</small></span></label>
              <label><input type="radio" name="goalMode" value="general"><span><b>暂时没有赛事</b><small>按运动目标持续训练</small></span></label>
            </div>
            <div class="conditional-block active" data-goal-panel="race">
              <div class="form-grid race-fields">
                <label class="field-label">赛事名称<input name="eventName" value="上海铁人三项赛" required></label>
                <label class="field-label">赛事日期<input name="eventDate" type="date" value="2026-11-08" required></label>
                <label class="field-label field-span-2">赛事类型
                  <select name="eventType" required>
                    <option value="">请选择赛事类型</option>
                    <optgroup label="跑步 Running">
                      <option value="road-running">公路跑 Road Running</option>
                      <option value="trail-running">越野跑 Trail Running</option>
                      <option value="track-running">场地跑 Track Running</option>
                      <option value="cross-country">越野赛跑 Cross Country</option>
                    </optgroup>
                    <optgroup label="骑行 Cycling">
                      <option value="road-bike">公路自行车 Road Bike</option>
                      <option value="mountain-bike">山地自行车 Mountain Bike</option>
                      <option value="cyclocross">公路越野 Cyclocross</option>
                      <option value="track-cycling">场地自行车 Track Cycling</option>
                    </optgroup>
                    <optgroup label="游泳 Swimming">
                      <option value="open-water">公开水域 Open Water Swim</option>
                      <option value="pool-swim">泳池游泳 Pool Swim</option>
                    </optgroup>
                    <optgroup label="多项运动 Multisport">
                      <option value="triathlon" selected>铁人三项 Triathlon</option>
                      <option value="xterra">越野铁三 Xterra</option>
                      <option value="duathlon">骑跑两项 Duathlon</option>
                      <option value="aquabike">游骑两项 Aquabike</option>
                      <option value="aquathlon">游跑两项 Aquathlon</option>
                    </optgroup>
                    <optgroup label="其他 Other">
                      <option value="hyrox">HYROX</option>
                      <option value="ocr">障碍赛 OCR</option>
                      <option value="adventure">探险赛 Adventure Race</option>
                      <option value="other">其他</option>
                    </optgroup>
                  </select>
                </label>
              </div>
            </div>
            <div class="conditional-block" data-goal-panel="general" hidden>
              <span class="subsection-label">主要运动方向</span>
              <div class="sport-choice-grid compact-sport-grid">
                ${sportChoice("run", "lucide:footprints", "跑步", true)}
                ${sportChoice("bike", "lucide:bike", "骑行", false)}
                ${sportChoice("trail", "lucide:mountain", "越野跑", false)}
                ${sportChoice("triathlon", "lucide:activity", "铁三", false)}
              </div>
              <span class="subsection-label">训练目的</span>
              <div class="training-purpose-grid">
                ${purposeChoice("health", "保持健康", "建立稳定运动习惯", true)}
                ${purposeChoice("aerobic", "增强有氧能力", "提高耐力和长时间运动能力", false)}
                ${purposeChoice("speed", "增强速度能力", "提升阈值、配速或功率", false)}
                ${purposeChoice("return", "恢复规律训练", "在中断后稳步找回状态", false)}
              </div>
            </div>
          </section>
          <section class="wizard-panel" data-step="2">
            <div class="form-title"><span>第 2 步，共 3 步</span><h2 id="secondarySportTitle">目标赛事之外，还想保留什么？</h2><p>这些运动会作为辅助训练或恢复手段，系统仍会控制总负荷。</p></div>
            <span class="subsection-label">希望继续穿插的运动，可多选</span>
            <div class="sport-choice-grid secondary-sport-grid">
              ${sportChoice("secondary-run", "lucide:footprints", "跑步", false)}
              ${sportChoice("secondary-bike", "lucide:bike", "骑行", false)}
              ${sportChoice("secondary-swim", "lucide:waves", "游泳", false)}
              ${sportChoice("secondary-trail", "lucide:mountain", "越野跑", false)}
            </div>
            <label class="field-label top-gap">近期疼痛、伤病、生病或明显无力<textarea name="issue" rows="3" placeholder="没有可填写：无">无</textarea></label>
          </section>
          <section class="wizard-panel" data-step="3">
            <div class="form-title"><span>第 3 步，共 3 步</span><h2>这一周通常怎么安排？</h2><p>直接在每天的格子里选择休息日、长课日和两练日。</p></div>
            <div class="form-grid schedule-summary-fields">
              <label class="field-label">每周训练时长<select name="weeklyHours"><option>6-8 小时</option><option selected>8-10 小时</option><option>10-12 小时</option><option>12 小时以上</option></select></label>
              <div class="schedule-summary" id="scheduleSummary"><span>当前安排</span><b>休息 1 天 · 长课 1 天 · 两练 1 天</b></div>
            </div>
            <div class="day-planner">
              ${dayPlan("周一", "monday", "rest", "60")}
              ${dayPlan("周二", "tuesday", "normal", "90")}
              ${dayPlan("周三", "wednesday", "double", "60")}
              ${dayPlan("周四", "thursday", "normal", "90")}
              ${dayPlan("周五", "friday", "normal", "60")}
              ${dayPlan("周六", "saturday", "long", "180")}
              ${dayPlan("周日", "sunday", "normal", "120")}
            </div>
          </section>
          <div class="wizard-actions"><button class="button button-secondary" id="wizardBack" type="button" disabled>返回</button><p class="form-error" id="intakeError" role="alert"></p><button class="button button-primary" id="wizardNext" type="button">继续</button></div>
        </form>
      </section>
    </main>
  `;
}

function renderGeneratingPage(): string {
  return `
    <main class="generation-page">
      <div class="generation-card">
        <div class="generation-logo">${renderBrandMark()}</div>
        <span class="section-kicker">计划生成</span>
        <h1>三个教练正在协调你的训练周期</h1>
        <p>系统先分析数据和赛事，再处理跑步、骑行、越野和铁三训练之间的负荷冲突。</p>
        <div class="generation-steps">
          ${generationStep("01", "检查设备数据", "训练历史、恢复、心率区间和负荷", "done")}
          ${generationStep("02", "建立赛事周期", "确认 A/B/C 赛事和训练阶段", "done")}
          ${generationStep("03", "教练协同", "生成候选训练并处理跨项目冲突", "active")}
          ${generationStep("04", "计划质量检查", "核对时长、区间、补给和降级规则", "pending")}
        </div>
        <button class="button button-primary" data-route="initial-plan" type="button">查看第一版计划</button>
      </div>
    </main>
  `;
}

function renderTodayPage(): string {
  if (!isDemoMode && !dashboardState && !currentPlanMeta) {
    return `
      <section class="workspace-page">
        ${renderWorkspaceHeader("今天怎么练", "完成训练档案后生成第一版计划", "尚未建立计划")}
        <section class="workspace-panel empty-workspace-state">
          <span class="section-kicker">开始训练</span>
          <h2>先建立训练档案</h2>
          <p>填写目标赛事或运动目标、可训练时间和每周安排后，系统才能生成今天与未来两周的训练。</p>
          <button class="button button-primary" data-route="intake" type="button">建立训练档案</button>
        </section>
      </section>
    `;
  }
  const decision = dashboardState?.decision;
  const readinessData = dashboardState?.readiness;
  const decisionDate = decision?.date ?? trainingDays.find((day) => day.status !== "completed")?.date ?? trainingDays[0]?.date ?? "2026-07-10";
  const nextDays = trainingDays.filter((day) => day.date >= decisionDate).slice(0, 3);
  const latestReview = dashboardState?.latest_review;

  return `
    <section class="workspace-page">
      ${renderWorkspaceHeader("今天怎么练", `${decisionDate} · 数据已同步`, dashboardState ? "后端已连接" : "演示数据")}
      <div class="today-layout">
        <div class="today-main">
          <section class="coach-decision">
            <div class="decision-copy">
              <span>教练结论</span>
              <h2>${decision ? `${escapeHtml(decision.title)} ${decision.duration_minutes || ""}${decision.duration_minutes ? "分钟" : ""}` : "骑行 Z2 70分钟"}</h2>
              <p>${decision ? escapeHtml(decision.purpose) : "睡眠时间偏短，昨天刚完成节奏跑。今天保留低压力有氧，跑步强度顺延。"}</p>
              <div class="intensity-scale"><i></i><i></i><i></i><i></i><i></i></div>
              <div class="target-row"><span>心率 <b>${decision?.heart_rate ?? "118-132 bpm"}</b></span><span>配速 / 功率 <b>${decision?.pace ?? "130-155 W"}</b></span></div>
            </div>
            <div class="readiness-metrics">
              ${readinessMetric("恢复分", String(readinessData?.recovery_score ?? 82), "良好")}
              ${readinessMetric("HRV", `${readinessData?.hrv_ms ?? 56}ms`, readinessData?.hrv_status ?? "高于基线")}
              ${readinessMetric("静息心率", String(readinessData?.resting_hr ?? 49), "正常")}
              ${readinessMetric("睡眠", `${readinessData?.sleep_hours ?? 6.3}h`, readinessData?.sleep_status ?? "偏短")}
            </div>
          </section>

          <section class="workspace-panel session-detail">
            <div class="panel-header"><div><span class="section-kicker">今日训练</span><h2>${escapeHtml(decision?.title ?? "等待计划")}</h2></div><span class="status-tag ${decision?.status === "adjusted" ? "adjusted" : ""}">${decision?.status === "adjusted" ? "已调整" : "按计划"}</span></div>
            <div class="session-stages">
              ${stageRow("训练结构", decision?.duration_minutes ? `${decision.duration_minutes}分钟` : "恢复日", decision?.heart_rate ?? "-", decision?.session ?? "尚未生成训练结构")}
              ${stageRow("执行区间", "全程", decision?.pace ?? "-", decision?.purpose ?? "等待训练安排")}
            </div>
            <div class="session-note"><b>为什么这样安排</b><span>${latestReview?.summary ? escapeHtml(latestReview.summary) : `${readiness.summary} ${readiness.nextThreeDayPolicy}`}</span></div>
            <button class="button button-secondary" id="openTodayWorkout" type="button">查看完整训练详情</button>
          </section>

          <section class="workspace-panel yesterday-review">
            ${latestReview ? `<div class="panel-header"><div><span class="section-kicker">最近训练评价</span><h2>${escapeHtml(latestReview.decision)}</h2></div><strong class="review-score">${latestReview.score}</strong></div><p>${escapeHtml(latestReview.summary)}</p>` : `<div class="panel-header"><div><span class="section-kicker">最近训练评价</span><h2>尚无复盘记录</h2></div></div><p>完成训练并同步设备数据后，这里会显示完成质量、身体反馈和后续训练判断。</p>`}
          </section>
        </div>

        <aside class="today-side">
          <section class="workspace-panel next-days"><div class="panel-header"><div><span class="section-kicker">未来 3 天</span><h2>滚动调整</h2></div></div>${nextDays.map(renderNextDay).join("")}</section>
          <section class="workspace-panel subjective-status">
            <div class="panel-header"><div><span class="section-kicker">主观状态</span><h2>设备不知道的感受</h2></div></div>
            <p>疼痛、明显疲劳、生病或临时无法训练，都应该在开始前补充。</p>
            <button class="button button-secondary button-block" data-route="check-in" type="button">填写身体状态</button>
          </section>
          <section class="workspace-panel latest-change">
            <span class="section-kicker">最近计划变更</span><h2>${currentPlanMeta?.last_change ? escapeHtml(currentPlanMeta.last_change) : "尚无计划变更"}</h2><p>${currentPlanMeta?.last_change ? "系统已根据训练和恢复数据更新后续安排。" : "计划发生调整后，这里会显示原因和影响范围。"}</p>${currentPlanMeta?.last_change ? '<button class="text-button" data-route="changes" type="button">查看调整原因</button>' : ""}
          </section>
        </aside>
      </div>
    </section>
  `;
}

function renderPlanPage(): string {
  if (!trainingDays.length || !currentPlanMeta) {
    return `
      <section class="workspace-page">
        ${renderWorkspaceHeader("周期计划", "根据目标和时间安排生成滚动训练计划", "尚未建立计划")}
        <section class="workspace-panel empty-workspace-state"><span class="section-kicker">周期计划</span><h2>还没有可展示的训练</h2><p>先完成训练档案，系统会生成完整周期方向，并开放首批两周训练。</p><button class="button button-primary" data-route="intake" type="button">建立训练档案</button></section>
      </section>
    `;
  }
  const weeks = groupPlanDates(trainingDays);
  activePlanWeek = Math.min(activePlanWeek, Math.max(weeks.length - 1, 0));
  const dates = weeks[activePlanWeek] ?? [];
  const weekDays = trainingDays.filter((day) => dates.includes(day.date));
  const filtered = activeSport === "all" ? weekDays : weekDays.filter((day) => day.sport === activeSport);
  const startDate = dates[0] ?? currentPlanMeta?.start_date ?? "-";
  const endDate = dates[dates.length - 1] ?? currentPlanMeta?.end_date ?? "-";
  const minutesBySport = sumMinutesBySport(weekDays);
  const totalMinutes = Object.values(minutesBySport).reduce((sum, value) => sum + value, 0);

  return `
    <section class="workspace-page">
      ${renderWorkspaceHeader("周期计划", currentPlanMeta?.phase ?? "有氧能力建设基础期", `计划版本 v${currentPlanMeta?.version ?? 1}`)}
      <section class="plan-toolbar workspace-panel">
        <div class="week-switch"><button id="previousPlanWeek" type="button" aria-label="上一周" ${activePlanWeek === 0 ? "disabled" : ""}>‹</button><div><b>${startDate} - ${endDate}</b><span>第 ${activePlanWeek + 1} / ${Math.max(weeks.length, 1)} 周 · 当前已开放训练窗口</span></div><button id="nextPlanWeek" type="button" aria-label="下一周" ${activePlanWeek >= weeks.length - 1 ? "disabled" : ""}>›</button></div>
        <div class="sport-filters" aria-label="运动筛选">
          ${filterButton("all", "全部")}${filterButton("run", "跑步")}${filterButton("bike", "骑行")}${filterButton("trail", "越野跑")}${filterButton("swim", "游泳")}
        </div>
        <div class="export-menu"><button data-route="exports" type="button">导出与日历</button></div>
      </section>
      <div class="plan-layout">
        <section class="workspace-panel week-calendar">
          ${renderWeekCalendar(filtered, dates)}
        </section>
        <aside class="plan-side">
          <section class="workspace-panel phase-card"><span class="section-kicker">当前阶段</span><h2>${escapeHtml(currentPlanMeta?.phase ?? "有氧能力建设基础期")}</h2><p>${escapeHtml(currentPlanMeta?.ai_coach?.summary ?? "保持低强度训练占比，建立多运动总容量，同时避免连续两天下肢高强度。")}</p><div class="phase-progress"><i style="width:${Math.round(((activePlanWeek + 1) / Math.max(weeks.length, 1)) * 100)}%"></i></div><div class="phase-meta"><span>已开放第 ${activePlanWeek + 1} 周</span><span>共 ${Math.max(weeks.length, 1)} 周</span></div></section>
          <section class="workspace-panel volume-card"><span class="section-kicker">本周结构</span><h2>${formatDuration(totalMinutes)}</h2><div class="volume-row"><span><i class="run-dot"></i>跑步</span><b>${formatDuration(minutesBySport.run)}</b></div><div class="volume-row"><span><i class="bike-dot"></i>骑行</span><b>${formatDuration(minutesBySport.bike)}</b></div><div class="volume-row"><span><i class="trail-dot"></i>越野跑</span><b>${formatDuration(minutesBySport.trail)}</b></div><div class="volume-row"><span><i class="rest-dot"></i>游泳</span><b>${formatDuration(minutesBySport.swim)}</b></div></section>
        </aside>
      </div>
    </section>
  `;
}

function renderReviewsPage(): string {
  if (!reviewState.length) {
    return `
      <section class="workspace-page">
        ${renderWorkspaceHeader("训练复盘", "查看完成质量、训练负荷和身体状态变化", "0 条记录")}
        <section class="workspace-panel empty-workspace-state"><span class="section-kicker">训练复盘</span><h2>完成第一次训练后再回来</h2><p>设备同步训练记录后，系统会结合完成质量和身体反馈生成复盘，并用于调整后续计划。</p><button class="button button-secondary" data-route="today" type="button">返回今日训练</button></section>
      </section>
    `;
  }
  const recentReviews = reviewState.slice(0, 7);
  const averageScore = Math.round(recentReviews.reduce((sum, review) => sum + review.score, 0) / recentReviews.length);
  const averageLoad = Math.round(recentReviews.reduce((sum, review) => sum + review.load, 0) / recentReviews.length);
  const riskCount = recentReviews.filter((review) => review.score < 65).length;
  const reviewTrend = [...recentReviews].reverse().map((review) => ({ day: review.date.slice(5), recovery: review.score, load: Math.min(100, Math.max(0, review.load)) }));
  return `
    <section class="workspace-page">
      ${renderWorkspaceHeader("训练复盘", "查看完成质量、训练负荷和身体状态变化", "最近 7 天")}
      <div class="review-overview">
        <section class="workspace-panel trend-panel">
          <div class="panel-header"><div><span class="section-kicker">身体状态</span><h2>恢复与训练负荷</h2></div><div class="chart-legend"><span><i class="recovery-line"></i>恢复</span><span><i class="load-line"></i>负荷</span></div></div>
          <div class="trend-chart">${reviewTrend.map(renderTrendColumn).join("")}</div>
        </section>
        <section class="review-summary-grid">
          ${summaryMetric(String(recentReviews.length), "复盘记录", "最近 7 条")}
          ${summaryMetric(`${averageScore}%`, "平均完成质量", "基于复盘评分")}
          ${summaryMetric(String(averageLoad), "平均负荷", "设备记录")}
          ${summaryMetric(String(riskCount), "风险提醒", riskCount ? "需要关注" : "当前无异常")}
        </section>
      </div>
      <section class="workspace-panel review-history">
        <div class="panel-header"><div><span class="section-kicker">训练记录</span><h2>最近复盘</h2></div><span>${reviewState.length} 条记录</span></div>
        <div class="review-list">${reviewState.map(renderReviewRecord).join("")}</div>
      </section>
    </section>
  `;
}

function renderEventsPage(): string {
  const primaryEvent = eventState.find((event) => event.priority === "A") ?? eventState[0];
  const countdown = primaryEvent ? Math.max(0, Math.ceil((new Date(`${primaryEvent.date}T00:00:00`).getTime() - Date.now()) / 86_400_000)) : null;
  return `
    <section class="workspace-page">
      ${renderWorkspaceHeader("目标赛事", "用 A/B/C 优先级协调多个目标", `${eventState.length} 场赛事`)}
      <div class="event-layout">
        <section class="workspace-panel event-list-panel">
          <div class="panel-header"><div><span class="section-kicker">赛事日历</span><h2>本赛季目标</h2></div><button class="button button-primary button-small" id="addEvent" type="button">新增赛事</button></div>
          <div class="event-list">${eventState.map(renderEventCard).join("")}</div>
        </section>
        <aside class="event-side">
          <section class="workspace-panel countdown-card"><span class="priority-badge priority-a">${primaryEvent?.priority ?? "-"}</span><span class="section-kicker">主目标倒计时</span><strong>${countdown ?? "-"}<small>天</small></strong><h2>${escapeHtml(primaryEvent?.name ?? "尚未添加目标赛事")}</h2><p>${primaryEvent ? `当前处于${escapeHtml(currentPlanMeta?.phase ?? "基础期")}，系统会围绕赛事日期滚动安排训练。` : "添加赛事后，系统会据此建立周期并协调其他运动。"}</p></section>
          <section class="workspace-panel priority-guide"><h2>优先级如何工作</h2><div><b>A</b><span>赛季主目标，决定周期峰值和减量安排。</span></div><div><b>B</b><span>重要检验，可保留表现但不做完整峰值。</span></div><div><b>C</b><span>训练赛事，服从 A 级赛事总计划。</span></div></section>
        </aside>
      </div>
    </section>
  `;
}

function renderDevicesPage(): string {
  const coros = deviceState.find((device) => device.id === "coros");
  const connected = coros?.status === "connected";
  return `
    <section class="workspace-page">
      ${renderWorkspaceHeader("设备与数据", "管理授权、同步和数据使用范围", connected ? "COROS 已连接" : "等待设备连接")}
      <div class="device-layout">
        <section class="workspace-panel device-panel">
          <div class="panel-header"><div><span class="section-kicker">设备连接</span><h2>数据来源</h2></div></div>
          <div class="device-list">${deviceState.map(renderDevice).join("")}</div>
        </section>
        <aside class="device-side">
          <section class="workspace-panel sync-card"><span class="section-kicker">自动同步</span><h2>每天 07:00</h2><p>读取上一次训练、恢复、HRV、睡眠和负荷，生成当天建议和未来 3 天调整。</p><button class="button button-secondary button-block" id="syncNow" type="button">立即同步</button></section>
          <section class="workspace-panel data-freshness"><span class="section-kicker">数据状态</span><h2>${connected ? "最近同步正常" : "尚未同步"}</h2><div class="quota-row"><span>最近同步</span><b>${escapeHtml(coros?.lastSync ?? "-")}</b></div><div class="quota-row"><span>数据范围</span><b>${coros?.dataScopes.length ?? 0} 项</b></div><div class="quota-row"><span>计划版本</span><b>v${currentPlanMeta?.version ?? 1}</b></div></section>
          <section class="workspace-panel privacy-card"><h2>权限与隐私</h2><p>设备授权、个人数据导出和账号删除统一在账号设置中管理。</p><button class="text-button" data-route="account" type="button">前往账号设置</button></section>
        </aside>
      </div>
    </section>
  `;
}

function renderMarketingNav(): string {
  return `
    <nav class="marketing-nav">
      <div class="marketing-container nav-inner">
        <button class="brand-button" data-route="landing-minimal" type="button">${renderBrandMark()}</button>
        <div class="auth-nav-note">AI 多运动教练系统</div>
        <div class="nav-cta"><button class="login-link" data-route="login" type="button">登录</button><button class="button button-primary button-small" data-route="login" type="button">开始体验</button></div>
      </div>
    </nav>
  `;
}

function renderFlowNav(label: string, step: number): string {
  return `
    <nav class="flow-nav">
      <button class="brand-button" data-route="landing-minimal" type="button">${renderBrandMark()}</button>
      <div class="flow-nav-center"><span>${label}</span><i style="--flow-progress:${step * 25}%"></i><b>${step}/4</b></div>
      <button class="text-button" data-route="landing-minimal" type="button">退出设置</button>
    </nav>
  `;
}

function renderAppShell(page: PageId, content: string): string {
  const sportSummary = profileState?.primary_sports.map((sport) => ({ running: "跑步", cycling: "骑行", trail_running: "越野", swimming: "游泳" }[sport] ?? sport)).join(" / ") || "尚未建立档案";
  return `
    <main class="app-shell">
      <aside class="app-sidebar">
        <button class="app-brand" data-route="today" type="button"><img src="/xunmove-logo.svg" alt=""><span><strong>XUNMOVE</strong><small>训动</small></span></button>
        <nav class="app-nav">
          ${appNavItem("today", "今日训练", page)}
          ${appNavItem("plan", "周期计划", page)}
          ${appNavItem("reviews", "训练复盘", page)}
          ${appNavItem("events", "目标赛事", page)}
          ${appNavItem("devices", "设备与数据", page)}
        </nav>
        <button class="sidebar-profile" data-route="account" type="button"><span class="profile-avatar">${escapeHtml(currentUser?.name.slice(0, 1) ?? "训")}</span><span><b>${escapeHtml(currentUser?.name ?? "训练用户")}</b><small>${escapeHtml(sportSummary)} · ${escapeHtml(currentPlanMeta?.phase ?? "待建计划")}</small></span></button>
      </aside>
      <div class="app-content">
        <header class="app-topbar"><div class="mobile-brand"><img src="/xunmove-logo.svg" alt=""><span><b>XUNMOVE</b><small>训动</small></span></div><div class="topbar-actions"><span class="demo-badge">${currentDataMode === "demo" ? "演示设备数据" : "实时设备数据"}</span><button class="notification-button" data-route="changes" type="button" aria-label="查看计划变更"><span></span></button><button class="top-avatar" data-route="account" type="button" aria-label="账号设置">${escapeHtml(currentUser?.name.slice(0, 1) ?? "王")}</button></div></header>
        ${content}
      </div>
      <nav class="mobile-nav">${appNavItem("today", "今日", page)}${appNavItem("plan", "计划", page)}${appNavItem("reviews", "复盘", page)}${appNavItem("events", "赛事", page)}${appNavItem("devices", "设备", page)}</nav>
    </main>
  `;
}

function renderWorkspaceHeader(title: string, subtitle: string, meta: string): string {
  return `<header class="workspace-header"><div><h1>${title}</h1><p>${subtitle}</p></div><span>${meta}</span></header>`;
}

function renderWeekCalendar(days: TrainingDay[], dates: string[]): string {
  return `<div class="calendar-grid">${dates.map((date, index) => {
    const sessions = days.map((session) => ({ session, sessionIndex: trainingDays.indexOf(session) })).filter(({session}) => session.date === date);
    const sourceDay = trainingDays.find((day) => day.date === date);
    return `<div class="calendar-day ${index === 0 && activePlanWeek === 0 ? "today" : ""}"><header><span>${sourceDay?.weekday ?? weekdayForDate(date)}</span><b>${Number(date.slice(-2))}</b></header><div class="calendar-sessions">${sessions.length ? sessions.map(({session,sessionIndex})=>renderCalendarSession(session,sessionIndex)).join("") : `<span class="empty-day">${activeSport === "all" ? "无训练" : "该项目无训练"}</span>`}</div></div>`;
  }).join("")}</div>`;
}

function renderCalendarSession(day: TrainingDay, index: number): string {
  return `<button class="calendar-session sport-${day.sport ?? "rest"}" data-session-index="${index}" type="button"><span>${sportLabel(day.sport)}</span><b>${day.title}</b><small>${day.durationMinutes ? `${day.durationMinutes}分钟` : "恢复"}</small>${day.status === "adjusted" ? "<em>已调整</em>" : ""}</button>`;
}

function groupPlanDates(days: TrainingDay[]): string[][] {
  const dates = [...new Set(days.map((day) => day.date))].sort();
  return Array.from({ length: Math.ceil(dates.length / 7) }, (_, index) => dates.slice(index * 7, index * 7 + 7));
}

function sumMinutesBySport(days: TrainingDay[]): Record<"run" | "bike" | "trail" | "swim", number> {
  const totals = { run: 0, bike: 0, trail: 0, swim: 0 };
  for (const day of days) {
    if (day.sport && day.sport !== "rest") totals[day.sport] += day.durationMinutes ?? 0;
  }
  return totals;
}

function formatDuration(minutes: number): string {
  if (!minutes) return "0分钟";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours ? `${hours}小时` : ""}${remainder ? `${remainder}分` : ""}`;
}

function weekdayForDate(value: string): string {
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(`${value}T00:00:00`).getDay()];
}

function renderEventModal(event?: RaceGoal): string {
  const editing = Boolean(event);
  const selectedType = event?.eventType ?? eventTypeForDiscipline(event?.discipline ?? "") ?? "road-running";
  return `
    <div class="modal-backdrop" id="eventModal">
      <form class="session-modal event-modal" id="eventForm" role="dialog" aria-modal="true" aria-labelledby="eventTitle">
        <button class="modal-close" data-close-modal type="button" aria-label="关闭">×</button>
        <span class="section-kicker">${editing ? "管理赛事" : "新增赛事"}</span><h2 id="eventTitle">${editing ? "修改训练目标" : "添加训练目标"}</h2>
        <div class="form-grid top-gap"><label class="field-label">赛事名称<input name="name" required placeholder="例如：杭州半程马拉松" value="${escapeHtml(event?.name ?? "")}"></label><label class="field-label">赛事日期<input name="date" type="date" required value="${escapeHtml(event?.date ?? "2026-12-06")}"></label><label class="field-label">赛事类型<select name="eventType" required>${eventTypeOptions(selectedType)}</select></label><label class="field-label">优先级<select name="priority">${["A", "B", "C"].map((priority) => `<option ${priority === (event?.priority ?? "B") ? "selected" : ""}>${priority}</option>`).join("")}</select></label></div>
        <label class="field-label top-gap">目标<input name="goal" value="${escapeHtml(event?.goal ?? "作为阶段能力检验")}"></label>
        <p class="form-error" id="eventFormError" role="alert"></p>
        <div class="modal-actions">${editing ? '<button class="danger-button modal-danger" id="deleteEvent" type="button">删除赛事</button>' : ""}<button class="button button-secondary" data-close-modal type="button">取消</button><button class="button button-primary" type="submit">保存赛事</button></div>
      </form>
    </div>
  `;
}

function renderDeviceModal(device: DeviceConnection): string {
  return `
    <div class="modal-backdrop" id="deviceModal">
      <section class="session-modal device-modal" role="dialog" aria-modal="true" aria-labelledby="deviceModalTitle">
        <button class="modal-close" data-close-modal type="button" aria-label="关闭">×</button>
        <span class="section-kicker">设备管理</span><h2 id="deviceModalTitle">${escapeHtml(device.name)}</h2>
        <p>当前连接用于读取训练记录、恢复和生理数据。解除连接不会删除已经生成的计划。</p>
        <div class="modal-grid top-gap"><div><span>连接状态</span><b>已连接</b></div><div><span>最近同步</span><b>${escapeHtml(device.lastSync ?? "尚未同步")}</b></div></div>
        <div class="modal-section"><b>授权数据范围</b><p>${device.dataScopes.map(escapeHtml).join("、")}</p></div>
        <p class="form-error" id="deviceModalError" role="alert"></p>
        <div class="modal-actions"><button class="danger-button modal-danger" id="disconnectDevice" type="button">解除连接</button><button class="button button-secondary" data-close-modal type="button">关闭</button><button class="button button-primary" id="syncDeviceFromModal" type="button">立即同步</button></div>
      </section>
    </div>
  `;
}

function eventTypeOptions(selected = "road-running"): string {
  const options = `<optgroup label="跑步 Running"><option value="road-running">公路跑</option><option value="trail-running">越野跑</option><option value="track-running">场地跑</option><option value="cross-country">越野赛跑</option></optgroup><optgroup label="骑行 Cycling"><option value="road-bike">公路自行车</option><option value="mountain-bike">山地自行车</option><option value="cyclocross">公路越野</option></optgroup><optgroup label="游泳 Swimming"><option value="open-water">公开水域</option><option value="pool-swim">泳池游泳</option></optgroup><optgroup label="多项运动 Multisport"><option value="triathlon">铁人三项</option><option value="xterra">越野铁三</option><option value="duathlon">骑跑两项</option><option value="aquabike">游骑两项</option><option value="aquathlon">游跑两项</option></optgroup><optgroup label="其他 Other"><option value="hyrox">HYROX</option><option value="ocr">障碍赛 OCR</option><option value="other">其他</option></optgroup>`;
  return options.replace(`value="${selected}"`, `value="${selected}" selected`);
}

function eventTypeForDiscipline(discipline: string): string | undefined {
  return ({ "公路跑": "road-running", "越野跑": "trail-running", "公路骑行": "road-bike", "铁人三项": "triathlon", "越野铁三": "xterra", "骑跑两项": "duathlon", "游骑两项": "aquabike", "游跑两项": "aquathlon" } as Record<string, string>)[discipline];
}

function bindRouteActions(): void {
  document.querySelectorAll<HTMLElement>("[data-route]").forEach((element) => {
    element.addEventListener("click", () => navigate((element.dataset.route ?? "landing") as PageId));
  });

  document.querySelectorAll<HTMLElement>("[data-scroll]").forEach((element) => {
    element.addEventListener("click", () => document.getElementById(element.dataset.scroll ?? "")?.scrollIntoView({ behavior: "smooth" }));
  });
}

function bindPageActions(page: PageId): void {
  if (page === "landing" || page === "landing-taste" || page === "landing-minimal" || page === "landing-2151") bindLandingActions();
  if (page === "login") bindLogin();
  if (page === "connect") bindConnect();
  if (page === "intake") bindWizard();
  if (page === "today") bindTodayActions();
  if (page === "plan") bindPlanActions();
  if (page === "events") bindEventActions();
  if (page === "devices") bindDeviceActions();
  if (page === "workout") bindWorkoutActions();
  if (page === "check-in") bindCheckInActions();
  if (page === "exports") bindExportActions();
  if (page === "account") bindAccountActions();
}

function bindLandingActions(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-plan-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const scrollPosition = window.scrollY;
      activeLandingPlan = Number(button.dataset.planIndex ?? 0);
      activeLandingWeek = 0;
      render();
      window.scrollTo(0, scrollPosition);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-plan-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const scrollPosition = window.scrollY;
      const direction = button.dataset.planDirection === "next" ? 1 : -1;
      activeLandingPlan = (activeLandingPlan + direction + landingPlans.length) % landingPlans.length;
      activeLandingWeek = 0;
      render();
      window.scrollTo(0, scrollPosition);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-cycle-week]").forEach((button) => {
    button.addEventListener("click", () => {
      updateLandingWeek(Number(button.dataset.cycleWeek ?? 0));
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-cycle-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.cycleDirection === "next" ? 1 : -1;
      updateLandingWeek(activeLandingWeek + direction);
    });
  });

  document.querySelector<HTMLSelectElement>("#cycleWeekSelect")?.addEventListener("change", (event) => {
    updateLandingWeek(Number((event.currentTarget as HTMLSelectElement).value));
  });
}

function updateLandingWeek(nextWeek: number): void {
  const scrollPosition = window.scrollY;
  activeLandingWeek = Math.min(Math.max(nextWeek, 0), landingPlans[activeLandingPlan].weeks.length - 1);
  render();
  window.scrollTo(0, scrollPosition);
  window.requestAnimationFrame(() => document.querySelector(".fm-cycle-track button.active")?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }));
}

function bindLogin(): void {
  document.querySelector<HTMLFormElement>("#loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const submit = form.querySelector<HTMLButtonElement>("button[type='submit']");
    const data = new FormData(form);
    const account = String(data.get("account") ?? "");
    const password = String(data.get("password") ?? "");
    setActionError("loginError", "");
    if (submit) {
      submit.disabled = true;
      submit.textContent = "正在登录";
    }
    try {
      currentUser = await login(account, password);
      authResolved = true;
      await hydrateFromApi();
      navigate("connect");
    } catch (error) {
      setActionError("loginError", errorMessage(error));
      if (submit) {
        submit.disabled = false;
        submit.textContent = "继续";
      }
    }
  });
}

function bindConnect(): void {
  const button = document.querySelector<HTMLButtonElement>("#connectCoros");
  button?.addEventListener("click", async () => {
    setActionError("connectError", "");
    const connected = deviceState.find((device) => device.id === "coros")?.status === "connected";
    button.textContent = connected ? "正在读取 COROS 数据" : "正在打开 COROS";
    button.disabled = true;
    try {
      if (connected) {
        await syncCoros();
        deviceState = await listDevices();
        currentDataMode = "cache";
        button.textContent = "数据同步完成";
        window.setTimeout(() => navigate("intake"), 350);
        return;
      }
      const result = await authorizeCoros();
      if (result.mode === "oauth" && result.authorization_url) {
        window.location.href = result.authorization_url;
        return;
      }
      throw new Error("COROS 没有返回授权地址");
    } catch (error) {
      setActionError("connectError", errorMessage(error));
      button.textContent = "重新连接";
      button.disabled = false;
    }
  });
}

function bindWizard(): void {
  let currentStep = 1;
  const back = document.querySelector<HTMLButtonElement>("#wizardBack");
  const next = document.querySelector<HTMLButtonElement>("#wizardNext");
  const goalModeInputs = document.querySelectorAll<HTMLInputElement>("input[name='goalMode']");

  const setGoalMode = (mode: string): void => {
    document.querySelectorAll<HTMLElement>("[data-goal-panel]").forEach((panel) => {
      const active = panel.dataset.goalPanel === mode;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
      panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea").forEach((field) => {
        field.disabled = !active;
      });
    });
    const title = document.querySelector<HTMLElement>("#secondarySportTitle");
    if (title) title.textContent = mode === "race" ? "目标赛事之外，还想保留什么？" : "主要运动之外，还想加入什么？";
  };

  const updateSchedule = (): void => {
    const roles = Array.from(document.querySelectorAll<HTMLSelectElement>(".day-role-select")).map((select) => select.value);
    const restDays = roles.filter((role) => role === "rest").length;
    const longDays = roles.filter((role) => role === "long").length;
    const doubleDays = roles.filter((role) => role === "double").length;
    const summary = document.querySelector<HTMLElement>("#scheduleSummary b");
    if (summary) summary.textContent = `休息 ${restDays} 天 · 长课 ${longDays} 天 · 两练 ${doubleDays} 天`;
  };

  const validateCurrentStep = (): boolean => {
    const panel = document.querySelector<HTMLElement>(`[data-step='${currentStep}']`);
    if (!panel) return true;
    const invalid = Array.from(panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]:not(:disabled)"))
      .find((field) => !field.checkValidity());
    if (!invalid) return true;
    invalid.reportValidity();
    return false;
  };

  const update = (): void => {
    document.querySelectorAll<HTMLElement>("[data-step]").forEach((panel) => panel.classList.toggle("active", Number(panel.dataset.step) === currentStep));
    document.querySelectorAll<HTMLElement>("[data-step-indicator]").forEach((item) => {
      const step = Number(item.dataset.stepIndicator);
      item.classList.toggle("active", step === currentStep);
      item.classList.toggle("done", step < currentStep);
    });
    if (back) back.disabled = currentStep === 1;
    if (next) next.textContent = currentStep === 3 ? "生成计划" : "继续";
  };

  goalModeInputs.forEach((input) => input.addEventListener("change", () => setGoalMode(input.value)));
  setGoalMode(document.querySelector<HTMLInputElement>("input[name='goalMode']:checked")?.value ?? "race");

  document.querySelectorAll<HTMLSelectElement>(".day-role-select").forEach((select) => {
    const applyRole = (): void => {
      const day = select.closest<HTMLElement>("[data-day-plan]");
      const duration = day?.querySelector<HTMLSelectElement>(".day-duration-select");
      if (day) day.dataset.role = select.value;
      if (duration) duration.disabled = select.value === "rest";
      updateSchedule();
    };
    select.addEventListener("change", applyRole);
    applyRole();
  });

  back?.addEventListener("click", () => {
    currentStep = Math.max(1, currentStep - 1);
    update();
  });

  next?.addEventListener("click", async () => {
    if (!validateCurrentStep()) return;
    if (currentStep === 3) {
      const form = document.querySelector<HTMLFormElement>("#intakeForm");
      if (!form || !next) return;
      setActionError("intakeError", "");
      next.disabled = true;
      next.textContent = "正在生成计划";
      try {
        await persistIntake(form);
        const generated = await generatePlan(currentDataMode);
        currentPlanMeta = generated.plan;
        trainingDays = generated.days;
        activePlanWeek = 0;
        currentDataMode = generated.plan.data_mode;
        activeWorkoutIndex = 0;
        dashboardState = await getDashboard();
        navigate("initial-plan");
      } catch (error) {
        setActionError("intakeError", errorMessage(error));
        next.disabled = false;
        next.textContent = "生成计划";
      }
      return;
    }
    currentStep += 1;
    update();
  });
}

async function persistIntake(form: HTMLFormElement): Promise<void> {
  const data = new FormData(form);
  const goalMode = String(data.get("goalMode") ?? "race") as "race" | "general";
  const eventType = String(data.get("eventType") ?? "");
  const selectedSports = data.getAll("sports").map(String);
  const secondarySports = selectedSports.filter((sport) => sport.startsWith("secondary-")).map((sport) => sport.replace("secondary-", ""));
  const primarySports = goalMode === "race"
    ? sportsForEventType(eventType)
    : selectedSports.filter((sport) => !sport.startsWith("secondary-")).flatMap(expandSportChoice);
  const weeklySchedule: IntakePayload["weekly_schedule"] = {};
  for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
    weeklySchedule[day] = {
      role: String(data.get(`${day}Role`) ?? "normal"),
      duration: Number(data.get(`${day}Duration`) ?? 60)
    };
  }
  profileState = await saveProfile({
    goal_mode: goalMode,
    training_purpose: String(data.get("trainingPurpose") ?? "health"),
    primary_sports: [...new Set(primarySports)],
    secondary_sports: [...new Set(secondarySports.flatMap(expandSportChoice))],
    weekly_hours: String(data.get("weeklyHours") ?? "8-10 小时"),
    weekly_schedule: weeklySchedule,
    current_constraints: String(data.get("issue") ?? "无"),
    timezone: "Asia/Shanghai"
  });
  if (goalMode === "race") {
    const payload = {
      name: String(data.get("eventName") ?? "目标赛事"),
      date: String(data.get("eventDate") ?? ""),
      event_type: eventType,
      priority: "A" as const,
      target: "完成赛事并按当前能力稳定发挥"
    };
    const duplicate = eventState.some((event) => event.name === payload.name && event.date === payload.date);
    if (!duplicate) eventState.unshift(await createBackendEvent(payload));
  }
}

function bindTodayActions(): void {
  document.querySelector<HTMLButtonElement>("#openTodayWorkout")?.addEventListener("click", () => {
    const todayDate = dashboardState?.decision.date;
    activeWorkoutIndex = Math.max(0, trainingDays.findIndex((day) => day.date === todayDate));
    navigate("workout");
  });
}

function bindPlanActions(): void {
  document.querySelector<HTMLButtonElement>("#previousPlanWeek")?.addEventListener("click", () => {
    activePlanWeek = Math.max(0, activePlanWeek - 1);
    render();
  });
  document.querySelector<HTMLButtonElement>("#nextPlanWeek")?.addEventListener("click", () => {
    activePlanWeek = Math.min(groupPlanDates(trainingDays).length - 1, activePlanWeek + 1);
    render();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-sport-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSport = (button.dataset.sportFilter ?? "all") as SportFilter;
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-session-index]").forEach((button) => {
    button.addEventListener("click", () => {
      activeWorkoutIndex = Number(button.dataset.sessionIndex);
      navigate("workout");
    });
  });
}

function bindEventActions(): void {
  const openEditor = (existing?: RaceGoal): void => {
    openModal(renderEventModal(existing));
    const form = document.querySelector<HTMLFormElement>("#eventForm");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector<HTMLButtonElement>("button[type='submit']");
      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") ?? "新赛事"),
        date: String(data.get("date") ?? ""),
        event_type: String(data.get("eventType") ?? "road-running"),
        priority: String(data.get("priority") ?? "B") as RaceGoal["priority"],
        target: String(data.get("goal") ?? "")
      };
      if (submit) {
        submit.disabled = true;
        submit.textContent = existing ? "正在保存" : "正在添加";
      }
      try {
        const saved = existing
          ? await updateBackendEvent(existing.id, payload)
          : await createBackendEvent(payload);
        eventState = existing
          ? eventState.map((item) => item.id === existing.id ? saved : item)
          : [saved, ...eventState];
        await refreshPlanAfterEventChange();
        closeModal();
        render();
      } catch (error) {
        setActionError("eventFormError", errorMessage(error));
        if (submit) {
          submit.disabled = false;
          submit.textContent = "保存赛事";
        }
      }
    });

    document.querySelector<HTMLButtonElement>("#deleteEvent")?.addEventListener("click", async () => {
      if (!existing || !window.confirm(`确定删除“${existing.name}”吗？计划会按剩余目标重新生成。`)) return;
      try {
        await deleteBackendEvent(existing.id);
        eventState = eventState.filter((item) => item.id !== existing.id);
        await refreshPlanAfterEventChange();
        closeModal();
        render();
      } catch (error) {
        setActionError("eventFormError", errorMessage(error));
      }
    });
  };

  document.querySelector<HTMLButtonElement>("#addEvent")?.addEventListener("click", () => openEditor());
  document.querySelectorAll<HTMLButtonElement>("[data-manage-event]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = eventState.find((event) => event.id === button.dataset.manageEvent);
      if (selected) openEditor(selected);
    });
  });
}

function bindDeviceActions(): void {
  const syncButton = document.querySelector<HTMLButtonElement>("#syncNow");
  syncButton?.addEventListener("click", () => void performDeviceSync(syncButton));

  document.querySelectorAll<HTMLButtonElement>("[data-device-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const device = deviceState.find((item) => item.id === button.dataset.deviceId);
      if (!device) return;
      if (button.dataset.deviceAction === "connect") {
        button.disabled = true;
        button.textContent = "正在连接";
        try {
          const result = await authorizeCoros();
          if (result.mode === "oauth" && result.authorization_url) {
            window.location.href = result.authorization_url;
            return;
          }
          deviceState = await listDevices();
          render();
        } catch (error) {
          button.disabled = false;
          button.textContent = errorMessage(error);
        }
        return;
      }

      openModal(renderDeviceModal(device));
      document.querySelector<HTMLButtonElement>("#syncDeviceFromModal")?.addEventListener("click", (event) => {
        void performDeviceSync(event.currentTarget as HTMLButtonElement, true);
      });
      document.querySelector<HTMLButtonElement>("#disconnectDevice")?.addEventListener("click", async () => {
        if (!window.confirm("确定解除 COROS 连接吗？已保存的训练计划不会被删除。")) return;
        try {
          await disconnectDevice(device.id);
          deviceState = await listDevices();
          closeModal();
          render();
        } catch (error) {
          setActionError("deviceModalError", errorMessage(error));
        }
      });
    });
  });
}

async function refreshPlanAfterEventChange(): Promise<void> {
  const generated = await generatePlan(currentDataMode);
  currentPlanMeta = generated.plan;
  trainingDays = generated.days;
  activePlanWeek = 0;
  dashboardState = await getDashboard();
}

async function performDeviceSync(button: HTMLButtonElement, closeAfter = false): Promise<void> {
  button.textContent = "正在同步";
  button.disabled = true;
  try {
    await syncCoros();
    deviceState = await listDevices();
    if (closeAfter) {
      closeModal();
      render();
    } else {
      button.textContent = "同步完成 · 刚刚";
    }
  } catch (error) {
    button.textContent = errorMessage(error);
    button.disabled = false;
  }
}

function bindWorkoutActions(): void {
  document.querySelector<HTMLButtonElement>("#markWorkoutComplete")?.addEventListener("click", () => navigate("check-in"));
}

function bindCheckInActions(): void {
  document.querySelector<HTMLFormElement>("#checkInForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const submit = form.querySelector<HTMLButtonElement>("button[type='submit']");
    if (!submit) return;
    submit.textContent = "已提交，正在更新计划";
    submit.disabled = true;
    const data = new FormData(form);
    try {
      const result = await submitDailyReview({
        feeling: String(data.get("feeling") ?? "normal"),
        pain: data.get("pain") === "yes",
        pain_detail: String(data.get("pain_detail") ?? ""),
        reasons: data.getAll("reason").map(String)
      });
      dashboardState = result.dashboard;
      if (result.plan_changed) {
        const current = await getCurrentPlan();
        currentPlanMeta = current.plan;
        trainingDays = current.days;
      }
      reviewState = await listReviews();
      navigate("today");
    } catch (error) {
      submit.textContent = errorMessage(error);
      submit.disabled = false;
    }
  });
}

function bindExportActions(): void {
  const exportCsv = async (): Promise<void> => {
    if (isDemoMode) return downloadFile("xunmove-plan.csv", createTrainingCsv(trainingDays), "text/csv;charset=utf-8");
    downloadBlob("xunmove-plan.csv", await downloadApiFile("/api/v1/exports/plan.csv"));
  };
  const exportIcs = async (): Promise<void> => {
    if (isDemoMode) return downloadFile("xunmove-plan.ics", createTrainingIcs(trainingDays, "XUNMOVE 训动"), "text/calendar;charset=utf-8");
    downloadBlob("xunmove-plan.ics", await downloadApiFile("/api/v1/calendar.ics"));
  };
  document.querySelector<HTMLButtonElement>("#exportCsvPage")?.addEventListener("click", () => void exportCsv());
  document.querySelector<HTMLButtonElement>("#exportCsvInline")?.addEventListener("click", () => void exportCsv());
  document.querySelector<HTMLButtonElement>("#exportIcsPage")?.addEventListener("click", () => void exportIcs());
  document.querySelector<HTMLButtonElement>("#exportIcsInline")?.addEventListener("click", () => void exportIcs());
  document.querySelector<HTMLButtonElement>("#exportPngPage")?.addEventListener("click", () => downloadPlanImage(trainingDays));
}

function bindAccountActions(): void {
  document.querySelectorAll<HTMLInputElement>("[data-setting-key]").forEach((input) => {
    input.addEventListener("change", async () => {
      const key = input.dataset.settingKey as keyof UserSettings;
      const previous = settingsState[key];
      settingsState = { ...settingsState, [key]: input.checked };
      try {
        settingsState = await saveSettings(settingsState);
      } catch (error) {
        settingsState = { ...settingsState, [key]: previous };
        input.checked = previous;
        setActionError("accountError", errorMessage(error));
      }
    });
  });
  document.querySelector<HTMLButtonElement>("#exportAccountData")?.addEventListener("click", async () => {
    try {
      const data = await exportAccountData();
      downloadFile("xunmove-account-data.json", JSON.stringify(data, null, 2), "application/json;charset=utf-8");
    } catch (error) {
      setActionError("accountError", errorMessage(error));
    }
  });
  document.querySelector<HTMLButtonElement>("#logoutAccount")?.addEventListener("click", async () => {
    try {
      await logout();
    } finally {
      currentUser = null;
      navigate("login");
    }
  });
  document.querySelector<HTMLButtonElement>("#deleteAccount")?.addEventListener("click", async () => {
    if (!window.confirm("确定删除账号及全部训练数据吗？此操作无法撤销。")) return;
    try {
      await deleteAccount();
      currentUser = null;
      profileState = null;
      currentPlanMeta = null;
      navigate("landing-minimal");
    } catch (error) {
      setActionError("accountError", errorMessage(error));
    }
  });
}

function openModal(markup: string): void {
  document.body.insertAdjacentHTML("beforeend", markup);
  document.querySelectorAll<HTMLElement>("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
  document.querySelector<HTMLElement>(".modal-backdrop")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeModal();
  });
}

function closeModal(): void {
  document.querySelector(".modal-backdrop")?.remove();
}

function setActionError(id: string, message: string): void {
  const element = document.getElementById(id);
  if (element) element.textContent = message;
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "操作失败，请稍后重试";
}

function expandSportChoice(value: string): string[] {
  if (value === "triathlon") return ["running", "cycling", "swimming"];
  return [{ run: "running", bike: "cycling", trail: "trail_running", swim: "swimming" }[value] ?? value];
}

function sportsForEventType(eventType: string): string[] {
  if (["triathlon", "xterra"].includes(eventType)) return ["running", "cycling", "swimming"];
  if (eventType === "duathlon") return ["running", "cycling"];
  if (eventType === "aquabike") return ["swimming", "cycling"];
  if (eventType === "aquathlon") return ["swimming", "running"];
  if (["road-bike", "mountain-bike", "cyclocross", "track-cycling"].includes(eventType)) return ["cycling"];
  if (["open-water", "pool-swim"].includes(eventType)) return ["swimming"];
  if (["trail-running", "cross-country"].includes(eventType)) return ["trail_running"];
  return ["running"];
}

function navigate(page: PageId): void {
  window.location.hash = page === "landing-minimal" ? "" : page;
  if (page === "landing-minimal" && window.location.hash === "") render();
}

function downloadFile(filename: string, content: string, type: string): void {
  downloadBlob(filename, new Blob([content], { type }));
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadPlanImage(days: TrainingDay[]): void {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 220 + days.length * 108;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#f5f8fc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#071326";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText("XUNMOVE 训动 · 本周训练计划", 64, 76);
  ctx.fillStyle = "#5f6d83";
  ctx.font = "24px sans-serif";
  ctx.fillText("有氧能力建设基础期 · 多运动协调计划", 64, 118);
  days.forEach((day, index) => {
    const y = 164 + index * 108;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 52, y, 1096, 88, 14);
    ctx.fill();
    ctx.fillStyle = sportColor(day.sport);
    roundRect(ctx, 68, y + 18, 84, 52, 10);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(day.weekday, 86, y + 51);
    ctx.fillStyle = "#071326";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(day.title, 180, y + 36);
    ctx.fillStyle = "#65738a";
    ctx.font = "18px sans-serif";
    ctx.fillText(day.durationMinutes ? `${day.durationMinutes}分钟 · ${day.heartRate}` : day.purpose, 180, y + 65);
  });
  const anchor = document.createElement("a");
  anchor.download = "xunmove-plan.png";
  anchor.href = canvas.toDataURL("image/png");
  anchor.click();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function scopeItem(title: string, body: string): string { return `<article><b>${title}</b><span>${body}</span></article>`; }
function sportChoice(value: string, icon: string, label: string, checked: boolean): string { const visual = icon.startsWith("lucide:") ? `<i data-lucide="${icon.slice(7)}"></i>` : `<img src="${icon}" alt="">`; return `<label class="sport-choice"><input type="checkbox" name="sports" value="${value}" ${checked ? "checked" : ""}><span>${visual}<strong>${label}</strong></span></label>`; }
function purposeChoice(value: string, title: string, body: string, checked: boolean): string { return `<label class="purpose-choice"><input type="radio" name="trainingPurpose" value="${value}" ${checked ? "checked" : ""} required><span><b>${title}</b><small>${body}</small></span></label>`; }
function dayPlan(day: string, name: string, role: string, duration: string): string {
  const roleOptions = [["normal", "正常训练"], ["rest", "休息日"], ["long", "长课日"], ["double", "两练日"]]
    .map(([value, label]) => `<option value="${value}" ${value === role ? "selected" : ""}>${label}</option>`).join("");
  const durationOptions = [["45", "45分钟"], ["60", "60分钟"], ["90", "90分钟"], ["120", "2小时"], ["180", "3小时"], ["240", "4小时以上"]]
    .map(([value, label]) => `<option value="${value}" ${value === duration ? "selected" : ""}>${label}</option>`).join("");
  return `<article class="availability-day" data-day-plan data-role="${role}"><header><b>${day}</b><i></i></header><label><span>安排</span><select class="day-role-select" name="${name}Role">${roleOptions}</select></label><label><span>可用时长</span><select class="day-duration-select" name="${name}Duration">${durationOptions}</select></label></article>`;
}
function generationStep(number: string, title: string, body: string, status: string): string { return `<div class="generation-step ${status}"><span>${number}</span><div><b>${title}</b><small>${body}</small></div><i></i></div>`; }
function appNavItem(route: PageId, label: string, active: PageId): string {
  const iconByRoute: Record<string, string> = { today: "activity", plan: "calendar-days", reviews: "refresh-cw", events: "target", devices: "watch" };
  return `<button class="${route === active ? "active" : ""}" data-route="${route}" type="button"><i data-lucide="${iconByRoute[route] ?? "activity"}"></i><span>${label}</span></button>`;
}
function readinessMetric(label: string, value: string, state: string): string { return `<article><span>${label}</span><b>${value}</b><small>${state}</small></article>`; }
function stageRow(name: string, duration: string, target: string, instruction: string): string { return `<div><span class="stage-duration">${duration}</span><b>${name}</b><span>${target}</span><p>${instruction}</p></div>`; }
function renderNextDay(day: TrainingDay): string { return `<article class="next-day"><div><span>${day.weekday}</span><small>${day.date.slice(5).replace("-", "/")}</small></div><i class="sport-icon sport-${day.sport}">${sportLabel(day.sport).slice(0, 1)}</i><div><b>${day.title}</b><span>${day.durationMinutes ? `${day.durationMinutes}分钟` : day.purpose}</span></div></article>`; }
function filterButton(filter: SportFilter, label: string): string { return `<button class="${activeSport === filter ? "active" : ""}" data-sport-filter="${filter}" type="button">${label}</button>`; }
function renderTrendColumn(point: { day: string; recovery: number; load: number }): string { return `<div class="trend-column"><div class="trend-bars"><i class="recovery-bar" style="height:${point.recovery}%"></i><i class="load-bar" style="height:${point.load}%"></i></div><span>${point.day}</span></div>`; }
function summaryMetric(value: string, label: string, hint: string): string { return `<article><strong>${value}</strong><b>${label}</b><span>${hint}</span></article>`; }
function renderReviewRecord(record: ReviewRecord): string { return `<article class="review-record"><div class="review-date"><span>${record.date}</span><i class="sport-${record.sport}">${sportLabel(record.sport).slice(0,1)}</i></div><div class="review-copy"><h3>${record.title}</h3><p>${record.summary}</p><span>${record.decision}</span></div><div class="review-record-metrics"><span><b>${record.score}</b>完成分</span><span><b>${record.load}</b>负荷</span><span><b>${record.duration}</b>时长</span></div></article>`; }
function renderEventCard(event: RaceGoal): string { return `<article class="event-card"><span class="priority-badge priority-${event.priority.toLowerCase()}">${event.priority}</span><div class="event-date"><b>${event.date.slice(5).replace("-", "/")}</b><span>${event.date.slice(0,4)}</span></div><div class="event-copy"><h3>${escapeHtml(event.name)}</h3><p>${escapeHtml(event.discipline)} · ${escapeHtml(event.goal)}</p></div><span class="event-status">${event.status === "active" ? "主目标" : "支持赛事"}</span><button data-manage-event="${escapeHtml(event.id)}" type="button">管理</button></article>`; }
function renderDevice(device: DeviceConnection): string {
  const connected = device.status === "connected";
  const action = connected
    ? `<button data-device-action="manage" data-device-id="${escapeHtml(device.id)}" type="button">管理</button>`
    : device.status === "planned"
      ? `<button type="button" disabled>暂未开放</button>`
      : `<button data-device-action="connect" data-device-id="${escapeHtml(device.id)}" type="button">连接</button>`;
  return `<article class="device-row"><div class="device-mark device-${device.id}">${device.name.slice(0,1)}</div><div class="device-copy"><h3>${device.name}</h3><p>${device.dataScopes.join("、")}</p>${device.lastSync ? `<span>最近同步：${device.lastSync}</span>` : ""}</div><span class="device-status ${device.status}">${connected ? "已连接" : device.status === "planned" ? "后续接入" : "可连接"}</span>${action}</article>`;
}
function sportLabel(sport?: SportType): string { return sport === "run" ? "跑步" : sport === "bike" ? "骑行" : sport === "trail" ? "越野跑" : sport === "swim" ? "游泳" : "恢复"; }
function sportColor(sport?: SportType): string { return sport === "run" ? "#cf4b2d" : sport === "bike" ? "#25876b" : sport === "trail" ? "#7163d8" : sport === "swim" ? "#167bb8" : "#7b8797"; }
function escapeHtml(value: string): string { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] ?? character)); }
