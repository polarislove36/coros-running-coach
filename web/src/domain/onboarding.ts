import type { IntakeDraft, OnboardingStep } from "./types";

export function getOnboardingSteps(): OnboardingStep[] {
  return [
    {
      id: "landing",
      title: "了解服务",
      description: "说明产品能做什么、不能承诺什么，以及 19.9 元/月的服务边界。"
    },
    {
      id: "login",
      title: "注册登录",
      description: "创建账号，用于保存训练计划、订阅状态和每日复盘记录。"
    },
    {
      id: "coros-auth",
      title: "授权高驰",
      description: "引导用户连接高驰账号，并说明会读取的训练与恢复数据。"
    },
    {
      id: "intake",
      title: "填写目标",
      description: "收集目标赛事、当前 PB、训练时间、力量训练和交叉训练偏好。"
    }
  ];
}

export function validateIntakeDraft(draft: IntakeDraft): string[] {
  const errors: string[] = [];

  if (!draft.targetRace) {
    errors.push("请选择目标类型");
  }

  if (!draft.raceDate) {
    errors.push("请填写目标赛事日期");
  }

  if (draft.weeklyTrainingDays < 3) {
    errors.push("每周可训练天数至少为 3 天");
  }

  if (!draft.preferredLongRunDay) {
    errors.push("请选择长距离跑通常安排在周六还是周日");
  }

  return errors;
}
