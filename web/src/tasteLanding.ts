import { getLandingPlanDate, landingPlans } from "./domain/landingPlans";

export function renderTasteLandingPage(activePlanIndex: number): string {
  return `
    <main class="taste-page">
      ${renderTasteNav()}

      <section class="dt-hero">
        <div class="dt-container dt-hero-layout">
          <div class="dt-hero-copy">
            <p class="dt-role">AI 多运动教练系统</p>
            <h1>让每次训练，<br>都有下一步</h1>
            <p class="dt-hero-intro">把跑步、骑行、越野跑与铁三放进同一个周期。设备数据每天回来，计划跟着身体状态调整。</p>
            <div class="dt-actions">
              <button class="dt-button dt-button-primary" data-route="login" type="button">开始建立计划<i data-lucide="arrow-right"></i></button>
              <button class="dt-text-link" data-scroll="tastePlans" type="button">查看 30 天示例</button>
            </div>
          </div>

          <figure class="dt-hero-photo">
            <img src="/road-cyclists-jack-white.jpg" alt="两名骑行者在山路进行耐力训练">
            <figcaption>公路骑行训练 · 山地耐力路线</figcaption>
            <aside class="dt-daily-note">
              <span>今天的安排</span>
              <strong>骑行 Z2 · 70 分钟</strong>
              <p>睡眠不足，跑步节奏课顺延一天。</p>
            </aside>
          </figure>
        </div>

        <div class="dt-container dt-sport-index" aria-label="支持的训练方向">
          ${renderSportIndex("footprints", "跑步", "配速、跑量与质量课")}
          ${renderSportIndex("bike", "骑行", "功率、心率与长骑")}
          ${renderSportIndex("mountain", "越野跑", "爬升、技术与补给")}
          ${renderSportIndex("workflow", "混合训练 / 铁三", "跨项目负荷与赛事优先级")}
        </div>
      </section>

      <section id="tasteSystem" class="dt-section dt-system">
        <div class="dt-container">
          <header class="dt-section-heading">
            <h2>一份周期，安排所有训练</h2>
            <p>不同项目不再各练各的。系统先看目标、训练负荷和恢复预算，再决定这一周该做什么。</p>
          </header>

          <div class="dt-system-layout">
            <figure class="dt-system-photo">
              <img src="/trail-runner-lucas-canino.jpg" alt="越野跑者在山地进行长距离训练">
              <figcaption>越野跑训练 · 爬升与下坡技术</figcaption>
            </figure>

            <div class="dt-week-decision">
              <div class="dt-decision-title">
                <span>本周训练判断</span>
                <h3>先保住有氧容量，再安排强度</h3>
                <p>连续两天恢复一般。长骑保留，跑步阈值课后移，避免两项强度叠加。</p>
              </div>

              <dl class="dt-decision-metrics">
                <div><dt>总训练</dt><dd>6 小时 20 分</dd></div>
                <div><dt>主要项目</dt><dd>跑步</dd></div>
                <div><dt>恢复窗口</dt><dd>2 天</dd></div>
              </dl>

              <div class="dt-decision-rules">
                <div><span>赛事优先级</span><strong>A 级半马周期保持连续</strong></div>
                <div><span>强度安排</span><strong>长骑后不叠加跑步阈值</strong></div>
                <div><span>每日复盘</span><strong>训练、睡眠与 HRV 一起判断</strong></div>
                <div><span>未来三天</span><strong>轻松跑 → 恢复 → 阈值课待确认</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tastePlans" class="dt-section dt-plans">
        <div class="dt-container">
          <header class="dt-section-heading">
            <h2>先给你一个完整的 30 天</h2>
            <p>从完整周期开始，再根据真实执行和恢复状态逐日修正。下面是三类用户的计划示例。</p>
          </header>
          ${renderTastePlan(activePlanIndex)}
        </div>
      </section>

      <section id="tasteHow" class="dt-section dt-start">
        <div class="dt-container">
          <header class="dt-section-heading">
            <h2>开始训练，只需要四步</h2>
            <p>告诉系统你要练什么，连接设备，补充目标。之后每天的复盘和调整由教练完成。</p>
          </header>

          <div class="dt-steps">
            ${renderTasteStep("01", "target", "选择方向", "确定主项目、混合项目和赛事优先级。")}
            ${renderTasteStep("02", "watch", "连接设备", "读取训练、心率、睡眠和恢复数据。")}
            ${renderTasteStep("03", "list-checks", "补充目标", "填写成绩、时间安排、伤病与偏好。")}
            ${renderTasteStep("04", "refresh-cw", "每日调整", "复盘上一练，更新今天与未来三天。")}
          </div>

          <section class="dt-faq" aria-labelledby="tasteFaqTitle">
            <h3 id="tasteFaqTitle">常见问题</h3>
            <div class="dt-faq-columns">
              <div>
                ${renderTasteFaq("支持哪些运动项目？", "支持跑步、骑行、越野跑、混合耐力训练和完整铁三周期。系统会根据主项目和赛事优先级协调总负荷。")}
                ${renderTasteFaq("目前支持哪些运动设备？", "首个版本直接连接 COROS。后续设备会沿用同一数据模型接入，不改变你的训练计划和历史记录。")}
                ${renderTasteFaq("为什么首次生成 30 天？", "30 天足以建立第一个训练阶段，也保留了根据执行情况和恢复状态持续调整的空间。")}
              </div>
              <div>
                ${renderTasteFaq("计划每天都会变化吗？", "不会为了变化而变化。只有训练完成情况、睡眠、HRV、静息心率或恢复状态出现有效信号时才会调整。")}
                ${renderTasteFaq("可以临时改变训练安排吗？", "可以。出差、时间不足、身体不适或场地受限时，教练会重新安排后续训练。")}
                ${renderTasteFaq("这是医疗建议或成绩保证吗？", "不是。产品提供训练建议，不替代医疗诊断、康复治疗或线下教练判断，也不承诺比赛成绩。")}
              </div>
            </div>
          </section>

          <div id="tastePricing" class="dt-offer">
            <div class="dt-offer-price"><span>完整会员</span><strong>¥19.9<small>/月</small></strong></div>
            <p>30 天起步计划 · 每日自动复盘 · 教练追问 · 表格 / 图片 / 日历导出</p>
            <button class="dt-button dt-button-primary" data-route="login" type="button">开始建立计划<i data-lucide="arrow-right"></i></button>
          </div>
        </div>
      </section>

      <footer class="dt-footer">
        <div class="dt-container">
          <div class="dt-footer-brand">${renderTasteBrand()}<span>AI 多运动教练系统</span></div>
          <p>提供训练建议，不替代医疗诊断、康复治疗或线下教练判断。</p>
        </div>
      </footer>
    </main>
  `;
}

function renderTasteNav(): string {
  return `
    <nav class="dt-nav">
      <div class="dt-container dt-nav-inner">
        <button class="dt-brand-button" data-route="landing-taste" type="button">${renderTasteBrand()}</button>
        <div class="dt-nav-links">
          <button data-scroll="tasteSystem" type="button">训练方式</button>
          <button data-scroll="tastePlans" type="button">计划示例</button>
          <button data-scroll="tasteHow" type="button">如何使用</button>
          <button data-scroll="tastePricing" type="button">价格</button>
        </div>
        <div class="dt-nav-actions">
          <button class="dt-login" data-route="login" type="button">登录</button>
          <button class="dt-button dt-button-primary dt-button-small" data-route="login" type="button">开始体验</button>
        </div>
      </div>
    </nav>
  `;
}

function renderTasteBrand(): string {
  return `<img src="/xunmove-logo.svg" alt=""><span><b>XUNMOVE</b><small>训动</small></span>`;
}

function renderSportIndex(icon: string, title: string, body: string): string {
  return `<div><i data-lucide="${icon}"></i><span><b>${title}</b><small>${body}</small></span></div>`;
}

function renderTasteStep(number: string, icon: string, title: string, body: string): string {
  return `<article><div><span>${number}</span><i data-lucide="${icon}"></i></div><h3>${title}</h3><p>${body}</p></article>`;
}

function renderTasteFaq(question: string, answer: string): string {
  return `<details><summary>${question}</summary><p>${answer}</p></details>`;
}

function renderTastePlan(activePlanIndex: number): string {
  const plan = landingPlans[activePlanIndex];
  return `
    <div class="dt-plan-controls">
      <div role="tablist" aria-label="训练计划示例">
        ${landingPlans.map((item, index) => `<button class="${index === activePlanIndex ? "active" : ""}" data-plan-index="${index}" type="button" role="tab" aria-selected="${index === activePlanIndex}">${item.label}</button>`).join("")}
      </div>
      <div class="dt-plan-arrows">
        <button data-plan-direction="prev" type="button" aria-label="上一个计划"><i data-lucide="chevron-left"></i></button>
        <span>${activePlanIndex + 1} / ${landingPlans.length}</span>
        <button data-plan-direction="next" type="button" aria-label="下一个计划"><i data-lucide="chevron-right"></i></button>
      </div>
    </div>

    <div class="dt-plan-frame" aria-live="polite">
      <aside class="dt-plan-summary">
        <span>${plan.label}</span>
        <h3>${plan.title}</h3>
        <p>${plan.profile}</p>
        <dl>
          <div><dt>目标</dt><dd>${plan.goal}</dd></div>
          <div><dt>阶段</dt><dd>${plan.phase}</dd></div>
          <div><dt>30 天负荷</dt><dd>${plan.load}</dd></div>
        </dl>
        <blockquote>${plan.insight}</blockquote>
      </aside>

      <div class="dt-calendar-wrap">
        <header><div><i data-lucide="calendar-days"></i><strong>07/13 — 08/11</strong></div><span>首次生成的 30 天计划</span></header>
        ${renderTasteCalendar(activePlanIndex)}
        <div class="dt-calendar-legend"><span>训练</span><span>力量</span><span>休息</span></div>
      </div>
    </div>
  `;
}

function renderTasteCalendar(activePlanIndex: number): string {
  const plan = landingPlans[activePlanIndex];
  const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
  const cells = Array.from({ length: 35 }, (_, index) => {
    const day = index + 1;
    if (day > 30) return `<div class="dt-plan-day empty" aria-hidden="true"></div>`;
    const session = plan.sessions.find((item) => item.day === day);
    const kind = session?.sport ?? "rest";
    return `<article class="dt-plan-day ${kind}" title="${session ? `${session.title}：${session.detail}` : "休息"}"><span>${getLandingPlanDate(day)}</span><b>${session?.title ?? "休息"}</b><small>${session?.detail ?? "恢复与生活安排"}</small></article>`;
  }).join("");
  return `<div class="dt-calendar-weekdays">${weekdays.map((day) => `<span>周${day}</span>`).join("")}</div><div class="dt-calendar">${cells}</div>`;
}
