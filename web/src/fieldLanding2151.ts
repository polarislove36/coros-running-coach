import { getLandingPlanDate2151, landingPlans2151 } from "./domain/landingPlans2151";

export function renderFieldLanding2151Page(activePlanIndex: number): string {
  return `
    <main class="field-page">
      ${renderFieldNav()}

      <section class="fm-hero">
        <img class="fm-hero-image" src="/road-cyclists-jack-white.jpg" alt="骑行者在山地公路进行耐力训练">
        <div class="fm-hero-shade" aria-hidden="true"></div>
        <div class="fm-container fm-hero-content">
          <p class="fm-positioning">AI 多运动教练系统</p>
          <h1>让每次训练，<br>都有下一步</h1>
          <p class="fm-hero-copy">跑步、骑行、越野跑与铁三，共用一个训练周期。设备数据每天回来，后续安排随之更新。</p>
          <div class="fm-actions">
            <button class="fm-button fm-button-primary" data-route="login" type="button">建立我的计划<i data-lucide="arrow-right"></i></button>
            <button class="fm-button fm-button-ghost" data-scroll="minimalPlan2151" type="button">查看实例课表</button>
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

      <section id="minimalDecision2151" class="fm-section fm-decision-section">
        <div class="fm-container">
          <header class="fm-section-heading">
            <h2>计划不是生成一次就结束</h2>
            <p>每次训练之后，教练重新判断接下来三天。</p>
          </header>
          <div class="fm-decision-layout">
            <div class="fm-decision-copy">
              <span>本周训练判断</span>
              <h3>先保住有氧容量，再安排强度</h3>
              <p>连续两天恢复一般。长骑保留，跑步阈值课后移，避免两项强度叠加。</p>
              <dl class="fm-decision-metrics">
                <div><dt>总训练</dt><dd>6 小时 20 分</dd></div>
                <div><dt>主要项目</dt><dd>跑步</dd></div>
                <div><dt>恢复窗口</dt><dd>2 天</dd></div>
              </dl>
              <dl class="fm-decision-rules">
                <div><dt>赛事优先级</dt><dd>A 级半马周期保持连续</dd></div>
                <div><dt>强度安排</dt><dd>长骑后不叠加跑步阈值</dd></div>
                <div><dt>每日复盘</dt><dd>训练、睡眠与 HRV 一起判断</dd></div>
                <div><dt>未来三天</dt><dd>轻松跑 → 恢复 → 阈值课待确认</dd></div>
              </dl>
            </div>
            <figure class="fm-decision-photo">
              <img src="/trail-runner-lucas-canino.jpg" alt="越野跑者在山地进行低强度耐力训练">
              <figcaption>恢复日也可以来自另一项运动</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="minimalPlan2151" class="fm-section fm-plan-section">
        <div class="fm-container">
          <header class="fm-section-heading">
            <h2>先给你完整的 30 天</h2>
            <p>下面三份实例分别处理单项跑步、跑骑混合和越野混合目标。</p>
          </header>
          ${renderFieldPlan(activePlanIndex)}
        </div>
      </section>

      <section id="minimalStart2151" class="fm-section fm-start-section">
        <div class="fm-container">
          <header class="fm-section-heading fm-start-heading"><h2>四步开始，之后每天调整</h2></header>
          <div class="fm-steps">
            ${renderFieldStep("01", "target", "选择方向", "主项目、混合项目与赛事优先级")}
            ${renderFieldStep("02", "watch", "连接设备", "训练、心率、睡眠与恢复数据")}
            ${renderFieldStep("03", "list-checks", "补充目标", "成绩、时间、伤病与训练偏好")}
            ${renderFieldStep("04", "refresh-cw", "开始调整", "复盘上一练，更新未来三天")}
          </div>
          <div id="minimalPrice2151" class="fm-price">
            <div><span>完整会员</span><strong>¥19.9<small>/月</small></strong></div>
            <p>30 天周期计划、每日自动复盘、教练追问与计划导出</p>
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
        <button class="fm-brand" data-route="landing-2151" type="button">${renderFieldBrand()}</button>
        <div class="fm-nav-links">
          <button data-scroll="minimalDecision2151" type="button">每日调整</button>
          <button data-scroll="minimalPlan2151" type="button">实例课表</button>
          <button data-scroll="minimalStart2151" type="button">如何开始</button>
          <button data-scroll="minimalPrice2151" type="button">价格</button>
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

function renderFieldStep(number: string, icon: string, title: string, body: string): string {
  return `<article><div><span>${number}</span><i data-lucide="${icon}"></i></div><h3>${title}</h3><p>${body}</p></article>`;
}

function renderFieldPlan(activePlanIndex: number): string {
  const plan = landingPlans2151[activePlanIndex];
  return `
    <div class="fm-plan-controls">
      <div role="tablist" aria-label="训练计划示例">
        ${landingPlans2151.map((item, index) => `<button class="${index === activePlanIndex ? "active" : ""}" data-plan-index="${index}" type="button" role="tab" aria-selected="${index === activePlanIndex}">${item.label}</button>`).join("")}
      </div>
      <div class="fm-plan-arrows">
        <button data-plan-direction="prev" type="button" aria-label="上一个计划"><i data-lucide="chevron-left"></i></button>
        <span>${activePlanIndex + 1} / ${landingPlans2151.length}</span>
        <button data-plan-direction="next" type="button" aria-label="下一个计划"><i data-lucide="chevron-right"></i></button>
      </div>
    </div>
    <div class="fm-plan-overview">
      <div class="fm-plan-title"><span>${plan.label}</span><h3>${plan.title}</h3><p>${plan.profile}</p></div>
      <dl>
        <div><dt>目标</dt><dd>${plan.goal}</dd></div>
        <div><dt>阶段</dt><dd>${plan.phase}</dd></div>
        <div><dt>30 天负荷</dt><dd>${plan.load}</dd></div>
      </dl>
      <blockquote>${plan.insight}</blockquote>
    </div>
    <div class="fm-calendar-shell" aria-live="polite">
      <header><div><i data-lucide="calendar-days"></i><strong>07/13 — 08/11</strong></div><span>首次生成的 30 天计划</span></header>
      ${renderFieldCalendar(activePlanIndex)}
      <div class="fm-calendar-legend"><span>训练</span><span>休息</span></div>
    </div>
  `;
}

function renderFieldCalendar(activePlanIndex: number): string {
  const plan = landingPlans2151[activePlanIndex];
  const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
  const cells = Array.from({ length: 35 }, (_, index) => {
    const day = index + 1;
    if (day > 30) return `<div class="fm-plan-day empty" aria-hidden="true"></div>`;
    const session = plan.sessions.find((item) => item.day === day);
    const kind = session?.sport ?? "rest";
    return `<article class="fm-plan-day ${kind}" title="${session ? `${session.title}：${session.detail}` : "休息"}"><span>${getLandingPlanDate2151(day)}</span><b>${session?.title ?? "休息"}</b><small>${session?.detail ?? "恢复与生活安排"}</small></article>`;
  }).join("");
  return `<div class="fm-weekdays">${weekdays.map((day) => `<span>周${day}</span>`).join("")}</div><div class="fm-calendar">${cells}</div>`;
}
