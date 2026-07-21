import {
  getLandingCycleDate,
  landingPlans,
  type LandingCycleSession,
  type LandingPlan,
  type LandingTrainingSegment
} from "./domain/landingPlans";

export function renderFieldLandingPage(activePlanIndex: number, activeWeekIndex: number): string {
  return `
    <main class="field-page">
      ${renderFieldNav()}

      <section class="fm-hero">
        <img class="fm-hero-image" src="/road-cyclists-jack-white.jpg" alt="骑行者在山地公路进行耐力训练">
        <div class="fm-hero-shade" aria-hidden="true"></div>
        <div class="fm-container fm-hero-content">
          <p class="fm-positioning">AI 多运动教练系统</p>
          <h1>让每次训练，<br>都有下一步</h1>
          <p class="fm-hero-copy">跑步、骑行、越野跑与铁三，共用一个训练周期。读取数据，每日复盘，动态调整。</p>
          <div class="fm-actions">
            <button class="fm-button fm-button-primary" data-route="login" type="button">建立我的计划<i data-lucide="arrow-right"></i></button>
            <button class="fm-button fm-button-ghost" data-scroll="minimalPlan" type="button">查看完整周期示例</button>
          </div>
        </div>

        <div class="fm-sport-ribbon">
          <div class="fm-container">
            ${renderFieldSport("footprints", "跑步", "配速、跑量与质量课")}
            ${renderFieldSport("bike", "骑行", "功率、心率与长骑")}
            ${renderFieldSport("mountain", "越野跑", "爬升、技术与补给")}
            ${renderFieldSport("workflow", "混合训练 / 铁三", "跨项目负荷与赛事优先级")}
          </div>
        </div>
      </section>

      <section id="minimalFeatures" class="fm-section fm-features-section">
        <div class="fm-container">
          <header class="fm-section-heading">
            <h2>一个周期，协调你的所有训练</h2>
            <p>系统把项目、赛事、训练历史和身体状态放在一起判断，而不是分别生成几张互不相干的课表。</p>
          </header>

          <div class="fm-feature-layout">
            <div class="fm-feature-list">
              ${renderFeatureRow("target", "围绕目标赛事建立周期", "同时处理多个赛事的日期、项目与 A/B/C 优先级，安排基础、专项、减量和赛后恢复。")}
              ${renderFeatureRow("watch", "用历史训练与生理数据判断", "读取训练量、心率区间、睡眠、HRV、静息心率和恢复状态，校准当前能力与负荷。")}
              ${renderFeatureRow("refresh-cw", "每天更新后续训练安排", "数据同步后重新判断今天和未来训练；恢复不足时主动顺延强度，而不是照抄原计划。")}
              ${renderFeatureRow("list-checks", "每次训练后都有复盘", "评价完成质量、强度和身体反馈，把结果继续用于下一周训练的确认与调整。")}
              ${renderFeatureRow("award", "专业教练与训练科学共同校准", "由多位资深耐力运动教练参与计划设计与调整，并结合最新训练理论，不依赖大模型单独生成。")}
            </div>

            <figure class="fm-feature-photo">
              <img src="/trail-runner-lucas-canino.jpg" alt="越野跑者在山地进行耐力训练">
              <figcaption>
                <span>多运动训练决策层</span>
                <h3>先决定这一阶段<br>最重要的训练是什么</h3>
                <p>跑步、骑行、越野和铁三共享同一份负荷预算。系统先处理赛事优先级，再分配每个项目的训练量与强度。</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="minimalPlan" class="fm-section fm-plan-section">
        <div class="fm-container">
          <header class="fm-section-heading fm-plan-section-heading">
            <div>
              <h2>先建立完整周期，再逐周确认训练</h2>
              <p>下面三份实例来自完整的 14–21 周计划，覆盖单项跑步、跑骑双目标和越野转全马。</p>
            </div>
          </header>
          ${renderFieldPlan(activePlanIndex, activeWeekIndex)}
        </div>
      </section>

      <section id="minimalStart" class="fm-section fm-start-section">
        <div class="fm-container">
          <header class="fm-section-heading fm-start-heading">
            <h2>四步开始，之后持续更新</h2>
          </header>
          <div class="fm-steps">
            ${renderFieldStep("01", "target", "选择方向", "主项目、混合项目与赛事优先级")}
            ${renderFieldStep("02", "watch", "连接设备", "训练、心率、睡眠与恢复数据")}
            ${renderFieldStep("03", "list-checks", "补充目标", "成绩、时间、伤病与训练偏好")}
            ${renderFieldStep("04", "refresh-cw", "滚动更新", "复盘上一练，每周确认后续训练")}
          </div>
          <div id="minimalPrice" class="fm-price">
            <div><span>完整会员</span><strong>¥19.9<small>/月</small></strong></div>
            <p>完整周期方向 · 首批 2 周训练 · 每周滚动更新 · 训练复盘与动态调整 · 多格式导出</p>
            <button class="fm-button fm-button-primary" data-route="login" type="button">开始建立计划<i data-lucide="arrow-right"></i></button>
          </div>
        </div>
      </section>

      <footer class="fm-footer">
        <div class="fm-container">
          <div>${renderFieldBrand()}<span>AI 多运动教练系统</span></div>
          <p>提供训练建议，不替代医疗诊断、康复治疗或线下教练判断。</p>
        </div>
      </footer>
    </main>
  `;
}

function renderFieldNav(): string {
  return `
    <nav class="fm-nav">
      <div class="fm-container fm-nav-inner">
        <button class="fm-brand" data-route="landing-minimal" type="button">${renderFieldBrand()}</button>
        <div class="fm-nav-links">
          <button data-scroll="minimalFeatures" type="button">产品特性</button>
          <button data-scroll="minimalPlan" type="button">完整周期示例</button>
          <button data-scroll="minimalStart" type="button">如何开始</button>
          <button data-scroll="minimalPrice" type="button">价格</button>
        </div>
        <div class="fm-nav-actions">
          <button class="fm-login" data-route="login" type="button">登录</button>
          <button class="fm-button fm-button-nav" data-route="login" type="button">开始体验</button>
        </div>
      </div>
    </nav>
  `;
}

function renderFieldBrand(): string {
  return `<img src="/xunmove-logo.svg" alt=""><span><b>XUNMOVE</b><small>训动</small></span>`;
}

function renderFieldSport(icon: string, title: string, detail: string): string {
  return `<article><i data-lucide="${icon}"></i><strong>${title}</strong><small>${detail}</small></article>`;
}

function renderFeatureRow(icon: string, title: string, body: string): string {
  return `<article><i data-lucide="${icon}"></i><div><h3>${title}</h3><p>${body}</p></div></article>`;
}

function renderFieldStep(number: string, icon: string, title: string, body: string): string {
  return `<article><div><span>${number}</span><i data-lucide="${icon}"></i></div><h3>${title}</h3><p>${body}</p></article>`;
}

function renderFieldPlan(activePlanIndex: number, requestedWeekIndex: number): string {
  const plan = landingPlans[activePlanIndex];
  const activeWeekIndex = Math.min(Math.max(requestedWeekIndex, 0), plan.weeks.length - 1);
  const week = plan.weeks[activeWeekIndex];
  return `
    <div class="fm-plan-controls">
      <div role="tablist" aria-label="训练计划示例">
        ${landingPlans.map((item, index) => `<button class="${index === activePlanIndex ? "active" : ""}" data-plan-index="${index}" type="button" role="tab" aria-selected="${index === activePlanIndex}">${item.label}</button>`).join("")}
      </div>
      <div class="fm-plan-arrows">
        <button data-plan-direction="prev" type="button" aria-label="上一个计划"><i data-lucide="chevron-left"></i></button>
        <span>${activePlanIndex + 1} / ${landingPlans.length}</span>
        <button data-plan-direction="next" type="button" aria-label="下一个计划"><i data-lucide="chevron-right"></i></button>
      </div>
    </div>

    <div class="fm-plan-overview">
      <div class="fm-plan-title"><span>${plan.label}</span><h3>${plan.title}</h3><p>${plan.profile}</p></div>
      <dl>
        <div><dt>目标</dt><dd>${plan.goal}</dd></div>
        <div><dt>完整周期</dt><dd>${plan.cycle}</dd></div>
        <div><dt>负荷范围</dt><dd>${plan.load}</dd></div>
      </dl>
      <blockquote>${plan.insight}</blockquote>
    </div>

    <div class="fm-cycle-shell" aria-live="polite">
      <header class="fm-cycle-header">
        <div>
          <span>当前查看</span>
          <strong>第 ${week.number} 周 · ${week.focus}</strong>
          <small>${week.dateRange.replace("至", "—")}</small>
        </div>
        <div class="fm-cycle-select">
          <button data-cycle-direction="prev" type="button" aria-label="上一周" ${activeWeekIndex === 0 ? "disabled" : ""}><i data-lucide="chevron-left"></i></button>
          <label>
            <span>选择周次</span>
            <select id="cycleWeekSelect" aria-label="选择训练周">
              ${plan.weeks.map((item, index) => `<option value="${index}" ${index === activeWeekIndex ? "selected" : ""}>W${item.number} · ${item.focus}</option>`).join("")}
            </select>
          </label>
          <button data-cycle-direction="next" type="button" aria-label="下一周" ${activeWeekIndex === plan.weeks.length - 1 ? "disabled" : ""}><i data-lucide="chevron-right"></i></button>
        </div>
      </header>

      <div class="fm-cycle-track" role="tablist" aria-label="完整训练周期周次">
        ${plan.weeks.map((item, index) => `<button class="${index === activeWeekIndex ? "active" : ""}" data-cycle-week="${index}" type="button" role="tab" aria-selected="${index === activeWeekIndex}"><span>W${item.number}</span><b>${item.focus}</b><small>${item.dateRange.slice(0, 5)}</small></button>`).join("")}
      </div>

      <div class="fm-cycle-calendar">
        ${[1, 2, 3, 4, 5, 6, 7].map((weekday) => renderCycleDay(plan, activeWeekIndex, weekday)).join("")}
      </div>
      <div class="fm-cycle-legend">
        <span class="recovery">恢复</span><span class="aerobic">有氧</span><span class="tempo">节奏</span><span class="threshold">阈值</span><span class="race">比赛</span>
        <small>鼠标悬停或键盘聚焦训练卡片，查看完整结构</small>
      </div>
    </div>
  `;
}

function renderCycleDay(plan: LandingPlan, weekIndex: number, weekday: number): string {
  const week = plan.weeks[weekIndex];
  const session = week.sessions.find((item) => item.weekday === weekday);
  const labels = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const date = getLandingCycleDate(plan, weekIndex, weekday);
  if (!session) {
    return `<article class="fm-cycle-day rest" tabindex="0"><header><span>${labels[weekday]}</span><small>${date}</small></header><div class="fm-session-title"><i data-lucide="refresh-cw"></i><div><b>休息</b><small>恢复与生活安排</small></div></div>${renderSegments([{ label: "恢复", intensity: "rest", width: 100 }])}</article>`;
  }

  return `
    <article class="fm-cycle-day ${session.sport}" tabindex="0" aria-label="${labels[weekday]} ${session.title}，悬停查看详情">
      <header><span>${labels[weekday]}</span><small>${date}</small></header>
      <div class="fm-session-title"><i data-lucide="${sportIcon(session)}"></i><div><b>${session.title}</b><small>${intensityLabel(session)}</small></div></div>
      ${renderSegments(session.segments)}
      <div class="fm-session-popover" role="tooltip">
        <header><i data-lucide="${sportIcon(session)}"></i><div><small>${labels[weekday]} · ${date}</small><strong>${session.title}</strong></div></header>
        <dl><div><dt>项目</dt><dd>${sportLabel(session)}</dd></div><div><dt>强度</dt><dd>${intensityLabel(session)}</dd></div></dl>
        <p>${session.detail}</p>
        <span>训练结构</span>
        ${renderSegments(session.segments, true)}
      </div>
    </article>
  `;
}

function renderSegments(segments: LandingTrainingSegment[], expanded = false): string {
  return `<div class="fm-session-structure ${expanded ? "expanded" : ""}" aria-label="训练强度结构">${segments.map((segment) => `<i class="${segment.intensity}" style="--segment-width:${segment.width};--segment-height:${segmentHeight(segment.intensity)}"><span>${segment.label}</span></i>`).join("")}</div>`;
}

function segmentHeight(intensity: LandingTrainingSegment["intensity"]): number {
  return { rest: 34, recovery: 42, aerobic: 58, tempo: 76, threshold: 90, race: 100, strength: 72 }[intensity];
}

function sportIcon(session: LandingCycleSession): string {
  return { run: "footprints", bike: "bike", trail: "mountain", swim: "activity", strength: "zap", rest: "refresh-cw" }[session.sport];
}

function sportLabel(session: LandingCycleSession): string {
  return { run: "跑步", bike: "骑行", trail: "越野跑", swim: "游泳", strength: "力量", rest: "恢复" }[session.sport];
}

function intensityLabel(session: LandingCycleSession): string {
  return { rest: "休息", recovery: "恢复强度", aerobic: "低强度有氧", tempo: "节奏 / 稳态", threshold: "阈值", race: "目标赛事", strength: "力量训练" }[session.intensity];
}
