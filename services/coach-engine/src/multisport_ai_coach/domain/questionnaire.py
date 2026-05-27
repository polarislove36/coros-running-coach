from __future__ import annotations


PROFILE_INTAKE_QUESTIONS = (
    {
        "id": "body_metrics",
        "category": "basic_profile",
        "question": "你的身高、体重、性别、年龄或出生年份是多少？目前是否有减重、维持体重或增肌目标？",
        "why_it_matters": "Body metrics are needed for nutrition guidance, energy availability, hydration estimates, and body-weight-sensitive training risk.",
    },
    {
        "id": "weekly_training_time",
        "category": "availability",
        "question": "你每周大约可以安排多少小时训练？可以回答区间，例如 8-10 小时；如果每天不同，请写出各天可训练时长。",
        "why_it_matters": "This sets the weekly volume ceiling and helps place long sessions on realistic days.",
    },
    {
        "id": "two_a_day_acceptance",
        "category": "availability",
        "question": "你是否能够接受每天两次训练？如果可以，每周最多几天、通常哪些天可以双练？",
        "why_it_matters": "This controls whether the coordinator may split sessions across morning/evening or must avoid double-session days.",
    },
    {
        "id": "training_environment",
        "category": "environment",
        "question": "你是否能接触山路、爬坡路线、跑步机、楼梯或健身房？哪些是稳定可用的？",
        "why_it_matters": "Trail and climbing plans need realistic terrain substitutes when outdoor elevation is unavailable.",
    },
    {
        "id": "heart_rate_profile",
        "category": "sport_background",
        "question": "你是否知道最大心率、静息心率、阈值心率，或者手表/App 中的心率区间？如果知道，请提供具体 bpm 区间。",
        "why_it_matters": "Heart-rate zones let the plan output concrete bpm targets instead of generic Z1/Z2 labels.",
    },
    {
        "id": "trail_experience",
        "category": "sport_background",
        "question": "你历史最长越野距离、最大爬升、最长训练/比赛时间分别是多少？小比赛是否会作为训练赛？",
        "why_it_matters": "This sets the ceiling for long-run, elevation, and time-on-feet progression.",
    },
    {
        "id": "fueling_tolerance",
        "category": "nutrition",
        "question": "你计划使用哪些补给？每小时大约能承受多少克碳水？是否能吃固体食物？",
        "why_it_matters": "Ultra and long cycling plans must match carbohydrate tolerance and gut-training status.",
    },
)
