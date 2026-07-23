import type { ApiPlan, ApiUser, IntakePayload, UserSettings } from "./api/client";
import type { RaceGoal, ReviewRecord, TrainingDay } from "./domain/types";

export interface ProductPageContext {
  user?: ApiUser | null;
  profile?: IntakePayload | null;
  plan?: ApiPlan | null;
  events?: RaceGoal[];
  reviews?: ReviewRecord[];
  settings?: UserSettings;
}

export function renderPricingPage(): string {
  return `
    <main class="pricing-page">
      <nav class="standalone-nav">
        <button class="standalone-brand" data-route="landing-minimal" type="button"><img src="/xunmove-logo.svg" alt=""><span><b>XUNMOVE</b><small>训动</small></span></button>
        <div><button class="text-button" data-route="login" type="button">登录</button><button class="button button-primary button-small" data-route="login" type="button">开始建立计划</button></div>
      </nav>
      <section class="pricing-hero">
        <span class="section-kicker">价格与服务</span>
        <h1>先看清训练方向，<br>再决定是否继续。</h1>
        <p>不付费也能获得两周可执行计划。完整会员在同一周期方向下，每周根据训练与恢复数据滚动开放下一周。</p>
      </section>
      <section class="pricing-comparison">
        <article class="price-plan free-plan">
          <header><span>免费体验</span><strong>¥0</strong><p>验证计划是否适合你的目标与时间安排。</p></header>
          <ul><li>首次两周训练安排</li><li>完整周期方向与阶段说明</li><li>设备授权与基础数据读取</li><li>训练详情与强度区间</li></ul>
          <button class="button button-secondary button-block" data-route="login" type="button">先体验两周</button>
        </article>
        <article class="price-plan member-plan">
          <header><span>完整会员</span><strong>¥19.9<small>/月</small></strong><p>适合需要长期训练闭环和动态调整的用户。</p></header>
          <ul><li>完整周期方向与滚动周计划</li><li>每日读取数据、训练复盘与动态调整</li><li>每次训练后的完成质量评价</li><li>表格、图片与日历导出</li><li>计划版本与调整原因记录</li></ul>
          <button class="button button-primary button-block" data-route="login" type="button">开始建立计划</button>
        </article>
      </section>
      <section class="pricing-note"><b>训练建议服务</b><p>产品不提供医疗诊断，也不承诺比赛成绩。出现持续疼痛、发热或异常不适时，应停止训练并咨询专业人员。</p></section>
    </main>
  `;
}

export function renderInitialPlanPage(days: TrainingDay[], context: ProductPageContext = {}): string {
  const firstWeek = [...new Set(days.map((day) => day.date))].slice(0, 7).map((date) => days.filter((day) => day.date === date));
  const primaryEvent = context.events?.find((event) => event.priority === "A") ?? context.events?.[0];
  const schedule = context.profile?.weekly_schedule ?? {};
  const trainingDays = Object.values(schedule).filter((day) => day.role !== "rest").length || 5;
  const longDays = Object.entries(schedule).filter(([, value]) => value.role === "long").map(([day]) => weekdayName(day));
  const cycle = cycleWeeks(primaryEvent, context.plan);

  return `
    <main class="initial-plan-page">
      <nav class="standalone-nav">
        <button class="standalone-brand" data-route="landing-minimal" type="button"><img src="/xunmove-logo.svg" alt=""><span><b>XUNMOVE</b><small>训动</small></span></button>
        <span class="plan-draft-state">第一版计划 · 等待确认</span>
      </nav>
      <section class="initial-plan-shell">
        <header class="initial-plan-header"><div><span class="section-kicker">计划已生成</span><h1>先确认周期方向，<br>再开始第一周。</h1></div><p>系统已把${context.events?.length ? `${context.events.length} 场赛事、` : "训练目标、"}每周可训练时间和设备数据放在同一条时间线上。你现在需要确认方向是否符合实际。</p></header>
        <div class="initial-plan-summary">
          <article><span>主目标</span><b>${primaryEvent?.name ?? trainingPurposeLabel(context.profile?.training_purpose)}</b><small>${primaryEvent ? `${primaryEvent.date} · ${primaryEvent.priority}级` : "持续训练目标"}</small></article>
          <article><span>当前阶段</span><b>${context.plan?.phase ?? "有氧能力建设"}</b><small>第 1 周</small></article>
          <article><span>每周训练</span><b>${trainingDays} 天</b><small>约 ${context.profile?.weekly_hours ?? "8-10 小时"}</small></article>
          <article><span>长课安排</span><b>${longDays.join(" / ") || "按周末安排"}</b><small>与强度课错开</small></article>
        </div>
        <section class="cycle-roadmap">
          <div class="cycle-stage active"><span>01</span><b>基础建设</b><small>${cycle.base}周</small></div>
          <div class="cycle-stage"><span>02</span><b>专项提升</b><small>${cycle.specific}周</small></div>
          <div class="cycle-stage"><span>03</span><b>比赛准备</b><small>${cycle.preparation}周</small></div>
          <div class="cycle-stage"><span>04</span><b>减量比赛</b><small>${cycle.taper}周</small></div>
        </section>
        <section class="initial-week-preview">
          <div class="panel-header"><div><span class="section-kicker">首批训练 · 第一周</span><h2>已开放未来两周，先核对这一周</h2></div><button class="text-button" data-route="plan" type="button">查看完整日历</button></div>
          <div class="initial-days">${firstWeek.map(renderPlanPreviewDay).join("")}</div>
        </section>
        <div class="plan-confirmation">
          <div><b>确认前请检查</b><span>赛事日期、每周可训练天数、周末长课时间和近期疼痛情况。</span></div>
          <button class="button button-secondary" data-route="intake" type="button">返回修改信息</button>
          <button class="button button-primary" data-route="today" type="button">确认并开始计划</button>
        </div>
      </section>
    </main>
  `;
}

export function renderWorkoutPage(day: TrainingDay): string {
  const isBike = day.sport === "bike";
  const targetLabel = isBike ? "参考功率 / 踏频" : "参考配速";
  return `
    <section class="workspace-page workout-page">
      <header class="workspace-header workout-header"><div><button class="back-link" data-route="plan" type="button">← 返回周期计划</button><h1>${day.title}</h1><p>${day.date} ${day.weekday} · ${day.durationMinutes || "恢复"}${day.durationMinutes ? "分钟" : ""}</p></div><span class="status-tag ${day.status === "adjusted" ? "adjusted" : ""}">${day.status === "adjusted" ? "已根据恢复调整" : "计划中"}</span></header>
      <div class="workout-layout">
        <div class="workout-main">
          <section class="workout-brief">
            <span class="sport-label sport-${day.sport}">${sportName(day)}</span>
            <h2>今天只需要完成这一件事</h2>
            <p>${day.purpose}</p>
            <div class="workout-targets"><article><span>${targetLabel}</span><b>${day.pace}</b></article><article><span>参考心率</span><b>${day.heartRate}</b></article></div>
          </section>
          <section class="workspace-panel workout-structure">
            <div class="panel-header"><div><span class="section-kicker">训练结构</span><h2>按顺序完成</h2></div></div>
            ${renderWorkoutStages(day)}
          </section>
          <section class="workspace-panel workout-instructions"><h2>执行提示</h2><div><b>开始前</b><p>确认主观疲劳和疼痛情况；如果感到明显肌肉酸痛、无力或不适，先提交身体状态。</p></div><div><b>训练中</b><p>优先遵守心率或功率区间。短时波动不需要追赶平均值，保持动作稳定。</p></div><div><b>结束后</b><p>同步训练记录并填写主观感受，系统会据此复盘并更新后续安排。</p></div></section>
        </div>
        <aside class="workout-side">
          <section class="workspace-panel workout-decision"><span class="section-kicker">安排原因</span><h2>保留低压力有氧</h2><p>昨天已完成跑步质量课，今天用低冲击有氧延续训练刺激，避免连续下肢冲击。</p><div><span>恢复分</span><b>82</b></div><div><span>睡眠</span><b>6.3h</b></div><div><span>HRV</span><b>56ms</b></div></section>
          <section class="workspace-panel workout-actions"><button class="button button-primary button-block" id="markWorkoutComplete" type="button">训练完成，开始复盘</button><button class="button button-secondary button-block" data-route="check-in" type="button">今天无法按计划完成</button><small>系统不会因为“感觉很好”自动增加负荷。</small></section>
        </aside>
      </div>
    </section>
  `;
}

export function renderCheckInPage(): string {
  return `
    <section class="workspace-page checkin-page">
      <header class="workspace-header"><div><h1>身体状态与训练反馈</h1><p>设备无法判断的感受，由你补充。系统会据此决定是否调整计划。</p></div><span>约 1 分钟</span></header>
      <form class="checkin-layout" id="checkInForm">
        <div class="checkin-main">
          <section class="workspace-panel checkin-section"><span class="question-number">01</span><div><h2>今天整体感觉如何？</h2><p>选择最接近当前状态的一项。</p><div class="choice-grid three"><label><input type="radio" name="feeling" value="good"><span><b>状态良好</b><small>精神和身体都正常</small></span></label><label><input type="radio" name="feeling" value="normal" checked><span><b>一般</b><small>可以训练，但不想加量</small></span></label><label><input type="radio" name="feeling" value="poor"><span><b>明显疲劳</b><small>完成日常活动也费力</small></span></label></div></div></section>
          <section class="workspace-panel checkin-section"><span class="question-number">02</span><div><h2>是否有疼痛、肌肉酸痛或无力？</h2><p>如果不适会影响动作或改变跑姿，请明确标记。</p><div class="choice-grid two"><label><input type="radio" name="pain" value="no" checked><span><b>没有</b><small>动作不受影响</small></span></label><label><input type="radio" name="pain" value="yes"><span><b>有</b><small>需要降低或停止训练</small></span></label></div><label class="field-label compact-field">位置与描述<input name="pain_detail" placeholder="例如：右膝外侧，走路无痛，跑步时出现"></label></div></section>
          <section class="workspace-panel checkin-section"><span class="question-number">03</span><div><h2>如果无法训练，主要原因是什么？</h2><p>可不选；这会帮助系统区分恢复问题和时间安排问题。</p><div class="reason-grid">${["时间不足", "疲劳", "疼痛", "生病", "天气", "旅行", "其他"].map((reason) => `<label><input type="checkbox" name="reason" value="${reason}"><span>${reason}</span></label>`).join("")}</div></div></section>
        </div>
        <aside class="checkin-side"><section class="workspace-panel checkin-summary"><span class="section-kicker">当前设备判断</span><h2>恢复良好，但睡眠偏短</h2><div><span>恢复分</span><b>82</b></div><div><span>HRV</span><b>56ms</b></div><div><span>静息心率</span><b>49 bpm</b></div><p>提交后，系统会结合主观反馈重新判断今天和未来三天。</p><button class="button button-primary button-block" type="submit">提交并重新判断</button><button class="text-button" data-route="today" type="button">暂不填写</button></section></aside>
      </form>
    </section>
  `;
}

export function renderChangesPage(context: ProductPageContext = {}): string {
  const latestReview = context.reviews?.[0];
  const changeReason = context.plan?.last_change ?? latestReview?.decision ?? "当前计划尚无自动调整";
  const adjustedDay = context.plan?.days.find((day) => day.status === "adjusted");
  return `
    <section class="workspace-page changes-page">
      <header class="workspace-header"><div><h1>计划变更记录</h1><p>每次顺延、替换或减量都保留原因，便于你理解当前计划从哪里来。</p></div><span>当前版本 v${context.plan?.version ?? 1}</span></header>
      <div class="changes-layout">
        <section class="workspace-panel current-change">
          <div class="panel-header"><div><span class="section-kicker">最新调整</span><h2>${escapeMarkup(changeReason)}</h2></div><span class="status-tag ${adjustedDay ? "adjusted" : ""}">${adjustedDay ? "已生效" : "计划稳定"}</span></div>
          <p>${latestReview ? escapeMarkup(latestReview.summary) : "系统会在训练复盘或恢复状态变化后，把调整原因记录在这里。"}</p>
          <div class="change-compare"><article><span>调整依据</span><b>${latestReview ? `复盘评分 ${latestReview.score}` : "训练与恢复数据"}</b><small>${latestReview?.date ?? "等待首次复盘"}</small></article><i>→</i><article><span>当前安排</span><b>${escapeMarkup(adjustedDay?.title ?? "按当前计划执行")}</b><small>${escapeMarkup(adjustedDay?.heart_rate ?? "未触发降级")}</small></article></div>
          <div class="change-policy"><b>保护规则</b><span>赛事日期和优先级不会被自动修改；负荷增加仍需后续恢复数据确认。</span></div>
        </section>
        <aside class="workspace-panel version-list"><div class="panel-header"><div><span class="section-kicker">复盘依据</span><h2>最近 ${context.reviews?.length ?? 0} 次</h2></div></div>${context.reviews?.length ? context.reviews.slice(0, 4).map((review, index) => renderVersion(`v${Math.max((context.plan?.version ?? 1) - index, 1)}`, review.date, review.decision, index === 0)).join("") : renderVersion(`v${context.plan?.version ?? 1}`, "当前", "计划生成，等待首次训练复盘", true)}</aside>
      </div>
      <section class="changes-footer"><div><b>赛事日期不会被自动修改</b><span>系统只调整训练安排；目标赛事和优先级由你确认。</span></div><button class="button button-secondary" data-route="plan" type="button">查看当前计划</button></section>
    </section>
  `;
}

export function renderExportsPage(context: ProductPageContext = {}): string {
  return `
    <section class="workspace-page exports-page">
      <header class="workspace-header"><div><h1>导出与日历</h1><p>把当前有效计划带到表格、图片或日历客户端中。</p></div><span>计划版本 v${context.plan?.version ?? 1}</span></header>
      <div class="export-grid">
        ${renderExportCard("list-checks", "表格", "CSV", "适合查看训练字段、打印或继续整理。", "exportCsvPage", "导出表格")}
        ${renderExportCard("activity", "计划图片", "PNG", "适合保存到手机或发给训练伙伴。", "exportPngPage", "生成图片")}
        ${renderExportCard("calendar-days", "日历文件", "ICS", "一次导入当前已开放的训练安排。", "exportIcsPage", "下载日历文件")}
      </div>
      <div class="calendar-management">
        <section class="workspace-panel calendar-subscription"><span class="section-kicker">日历导入</span><h2>把已开放计划加入常用日历</h2><p>下载 ICS 文件后，可导入 Apple 日历、Google Calendar 或 Outlook。计划发生调整后，请重新导入最新版本。</p><div class="subscription-url"><span>${context.plan?.start_date ?? "当前"} 至 ${context.plan?.end_date ?? "未来两周"}</span><button type="button" id="exportIcsInline">下载 ICS</button></div><small>自动订阅将在后续版本开放，第一版不会展示虚假的同步状态。</small></section>
        <aside class="workspace-panel calendar-status"><span class="section-kicker">当前导出范围</span><h2>${context.plan?.days.length ?? 0} 项训练</h2><div><span>计划开始</span><b>${context.plan?.start_date ?? "-"}</b></div><div><span>计划结束</span><b>${context.plan?.end_date ?? "-"}</b></div><div><span>当前版本</span><b>v${context.plan?.version ?? 1}</b></div><button class="button button-secondary button-block" id="exportCsvInline" type="button">下载表格</button></aside>
      </div>
    </section>
  `;
}

export function renderAccountPage(context: ProductPageContext = {}): string {
  const user = context.user;
  const settings = context.settings ?? { daily_plan_update: true, workout_review: true, event_reminders: true };
  const sportSummary = [...new Set([...(context.profile?.primary_sports ?? []), ...(context.profile?.secondary_sports ?? [])])].map(sportProfileLabel).join(" / ") || "尚未建立训练档案";
  return `
    <section class="workspace-page account-page">
      <header class="workspace-header"><div><h1>账号与订阅</h1><p>管理个人资料、会员、通知和数据权限。</p></div><span>内测体验</span></header>
      <div class="account-layout">
        <div class="account-main">
          <section class="workspace-panel account-profile"><div class="account-avatar">${escapeMarkup(user?.name.slice(0, 1) ?? "训")}</div><div><h2>${escapeMarkup(user?.name ?? "训练用户")}</h2><p>${escapeMarkup(user?.account ?? "尚未登录")}</p><span>${escapeMarkup(sportSummary)}</span></div><button data-route="intake" type="button">修改训练档案</button></section>
          <section class="workspace-panel setting-section"><div class="panel-header"><div><span class="section-kicker">通知</span><h2>训练提醒</h2></div></div>${renderSettingToggle("每日计划更新", "每天同步后提醒查看训练结论和计划变更", settings.daily_plan_update, "daily_plan_update")}${renderSettingToggle("训练完成复盘", "设备同步完成后提醒查看复盘", settings.workout_review, "workout_review")}${renderSettingToggle("赛事与减量提醒", "关键阶段开始前发送提醒", settings.event_reminders, "event_reminders")}</section>
          <section class="workspace-panel setting-section"><div class="panel-header"><div><span class="section-kicker">数据与隐私</span><h2>你的数据由你控制</h2></div></div><div class="privacy-action"><div><b>下载个人数据</b><span>导出账号、赛事、训练计划和复盘记录。</span></div><button type="button" id="exportAccountData">下载 JSON</button></div><div class="privacy-action"><div><b>删除账号与全部数据</b><span>删除后无法恢复，并会停止设备同步。</span></div><button class="danger-button" id="deleteAccount" type="button">删除账号</button></div><p class="form-error" id="accountError" role="alert"></p></section>
        </div>
        <aside class="account-side">
          <section class="workspace-panel membership-card"><span class="section-kicker">当前方案</span><h2>内测体验</h2><strong>试用中</strong><p>完整周期方向、每周滚动计划、每日复盘、动态调整与多格式导出。</p><div><span>正式版价格</span><b>¥19.9 / 月</b></div><button class="button button-secondary button-block" data-route="pricing" type="button">查看方案详情</button></section>
          <section class="workspace-panel account-session"><h2>登录与安全</h2><div><span>当前账号</span><b>${escapeMarkup(user?.account ?? "-")}</b></div><button class="danger-button" id="logoutAccount" type="button">退出登录</button></section>
        </aside>
      </div>
    </section>
  `;
}

function renderPlanPreviewDay(dayGroup: TrainingDay[]): string {
  const day = dayGroup[0];
  const titles = dayGroup.map((session) => session.title).join(" + ");
  const details = dayGroup.map((session) => session.durationMinutes ? `${session.durationMinutes}分钟` : session.purpose).join(" · ");
  const primarySport = dayGroup.find((session) => session.sport !== "rest")?.sport ?? day.sport;
  return `<article class="initial-day sport-${primarySport}"><span>${day.weekday}<small>${day.date.slice(5).replace("-", "/")}</small></span><b>${titles}</b><p>${details}</p></article>`;
}

function renderWorkoutStages(day: TrainingDay): string {
  if (day.stages?.length) {
    return day.stages.map((stage, index) => {
      const zone = stage.powerZone ?? stage.heartRateZone ?? stage.paceZone ?? "按体感执行";
      const instructions = stage.instructions.length ? stage.instructions.join("；") : `${zone}，保持动作稳定。`;
      return `<div class="workout-stage"><span>${String(index + 1).padStart(2, "0")}</span><div><b>${escapeMarkup(stage.name)} · ${stage.durationMinutes}分钟</b><p>${escapeMarkup(zone)}；${escapeMarkup(instructions)}</p></div><em style="--stage-load:${stageLoad(zone, stage.name)}"></em></div>`;
    }).join("");
  }
  if (day.sport === "bike") {
    return `<div class="workout-stage"><span>01</span><div><b>热身 · 10分钟</b><p>Z1 轻松转动，逐步把踏频提高到 85 rpm。</p></div><em style="--stage-load:.35"></em></div><div class="workout-stage"><span>02</span><div><b>主训练 · ${Math.max((day.durationMinutes ?? 70) - 15, 20)}分钟</b><p>${day.pace}；${day.heartRate}。</p></div><em style="--stage-load:.68"></em></div><div class="workout-stage"><span>03</span><div><b>放松 · 5分钟</b><p>逐步降低阻力，让心率自然回落到 Z1。</p></div><em style="--stage-load:.24"></em></div>`;
  }
  return `<div class="workout-stage"><span>01</span><div><b>准备 · 10分钟</b><p>低强度进入状态，检查动作和身体反馈。</p></div><em style="--stage-load:.30"></em></div><div class="workout-stage"><span>02</span><div><b>主训练</b><p>${day.session}</p></div><em style="--stage-load:.72"></em></div><div class="workout-stage"><span>03</span><div><b>结束</b><p>逐步降低强度，完成后记录主观感受。</p></div><em style="--stage-load:.22"></em></div>`;
}

function stageLoad(zone: string, name: string): number {
  const value = `${zone} ${name}`.toUpperCase();
  if (/Z5|VO2|冲刺|SPRINT/.test(value)) return 1;
  if (/Z4|阈值|THRESHOLD/.test(value)) return 0.84;
  if (/Z3|节奏|TEMPO/.test(value)) return 0.68;
  if (/Z2|有氧|AEROBIC/.test(value)) return 0.46;
  return 0.24;
}

function renderVersion(version: string, time: string, text: string, active: boolean): string {
  return `<article class="version-item ${active ? "active" : ""}"><span>${version}</span><div><b>${text}</b><small>${time}</small></div></article>`;
}

function renderExportCard(icon: string, title: string, format: string, body: string, id: string, action: string): string {
  return `<article class="workspace-panel export-card"><i data-lucide="${icon}"></i><span>${format}</span><h2>${title}</h2><p>${body}</p><button class="button button-secondary button-block" id="${id}" type="button">${action}</button></article>`;
}

function renderSettingToggle(title: string, body: string, checked: boolean, key: keyof UserSettings): string {
  return `<label class="setting-toggle"><div><b>${title}</b><span>${body}</span></div><input type="checkbox" data-setting-key="${key}" ${checked ? "checked" : ""}></label>`;
}

function weekdayName(day: string): string {
  return ({ monday: "周一", tuesday: "周二", wednesday: "周三", thursday: "周四", friday: "周五", saturday: "周六", sunday: "周日" } as Record<string, string>)[day] ?? day;
}

function trainingPurposeLabel(value?: string): string {
  return ({ health: "保持健康", aerobic: "增强有氧能力", speed: "增强速度能力", return: "恢复规律训练" } as Record<string, string>)[value ?? ""] ?? "持续训练";
}

function sportProfileLabel(value: string): string {
  return ({ running: "跑步", cycling: "骑行", trail_running: "越野跑", swimming: "游泳" } as Record<string, string>)[value] ?? value;
}

function escapeMarkup(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function cycleWeeks(event?: RaceGoal, plan?: ApiPlan | null): { base: number; specific: number; preparation: number; taper: number } {
  const start = plan?.start_date ? new Date(`${plan.start_date}T00:00:00`) : new Date();
  const end = event?.date ? new Date(`${event.date}T00:00:00`) : new Date(start.getTime() + 12 * 7 * 86_400_000);
  const total = Math.max(6, Math.ceil((end.getTime() - start.getTime()) / (7 * 86_400_000)));
  const taper = total >= 10 ? 2 : 1;
  const preparation = Math.max(1, Math.round(total * 0.2));
  const specific = Math.max(2, Math.round(total * 0.3));
  const base = Math.max(1, total - taper - preparation - specific);
  return { base, specific, preparation, taper };
}

function sportName(day: TrainingDay): string {
  if (day.sport === "run") return "跑步";
  if (day.sport === "bike") return "骑行";
  if (day.sport === "trail") return "越野跑";
  return "恢复";
}
