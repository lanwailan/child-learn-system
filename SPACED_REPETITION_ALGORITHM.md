# 艾宾浩斯遗忘曲线 & 间隔重复算法详细实现

## 概述

本文档详细介绍如何在 Child Learn System 中实现**艾宾浩斯遗忘曲线**和**间隔重复(SRS)算法**，用于科学地规划儿童的复习时间。

核心目标：
- 根据遗忘规律计算最优复习时机
- 根据用户反馈动态调整复习间隔
- 推荐每天最合理的复习内容

---

## 1. 背景理论

### 1.1 艾宾浩斯遗忘曲线

艾宾浩斯通过实验发现人类对信息的遗忘规律：

```
遗忘程度
  100% ├─────────────┐
       │    初始学习   │ ← 学习时 100% 掌握
       │              │
   80% │         ┐    │
       │         │    │
   60% │         │ 遗忘│
       │         │ 曲线│
   40% │         │    │
       │         └────┤────┐
   20% │              │    │ ← 复习后，遗忘减缓
       │              │    │
    0% ├──────────────┴────┴────────── 时间
       0   6h   1d   3d   7d   30d
```

**关键观察**:
1. 第一次学习后，**6 小时内遗忘 50%**
2. **1 天后遗忘 66%** - 最关键的复习点
3. **3 天后遗忘 76%**
4. **7 天后遗忘 80%**
5. 每次适时复习都会重置遗忘曲线，遗忘速度变慢

### 1.2 最优复习时间点

根据艾宾浩斯研究，最优复习时间点是：

| 第 N 次复习 | 推荐间隔 | 理由 |
|-----------|--------|------|
| 第 1 次 | **1 天** | 学习后 6h-24h 复习，能保持最高效率 |
| 第 2 次 | **3 天** | 间隔延长，但仍在遗忘不严重前 |
| 第 3 次 | **7 天** | 一周后复习，夯实中期记忆 |
| 第 4 次 | **14 天** | 两周后，进入长期记忆阶段 |
| 第 5 次 | **30 天** | 一个月后，基本进入永久记忆 |

---

## 2. SM-2 算法 (SuperMemo-2)

### 2.1 算法原理

SM-2 是业界标准的间隔重复算法，被 Anki、Obsidian 等广泛使用。

**核心概念**:
- **Easiness Factor (EF)**: 难度因子，1.3 - 2.5 之间
  - EF 越高 = 越容易记忆 = 复习间隔越长
  - EF 越低 = 越难记忆 = 复习间隔越短
  
- **Interval**: 复习间隔（天数）
  - I(1) = 1 天
  - I(2) = 3 天
  - I(n) = I(n-1) × EF

- **Quality**: 复习质量评分 (0-5)
  - 0-1: 完全遗忘，需要重新学习
  - 2: 无法回忆，记忆模糊
  - 3: 勉强回忆，费力但可以
  - 4: 确定回忆，无压力
  - 5: 完美回忆，快速准确

### 2.2 SM-2 计算公式

```
新 EF = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))

其中：
  q = 质量评分 (0-5)
  EF = 当前难度因子

如果新 EF < 1.3，则 EF = 1.3（最小值）
```

**公式解释**:
- 当 q = 5（完美）时：新 EF = EF + 0.1（增加难度因子）
- 当 q = 4（确定）时：新 EF = EF（保持）
- 当 q = 3（勉强）时：新 EF = EF - 0.14（降低难度因子）
- 当 q < 3 时：重置为初始状态

### 2.3 复习间隔计算

```
I(1) = 1
I(2) = 3
I(n) = I(n-1) × EF   (n ≥ 3)

例如：
初始 EF = 2.5

第1次: I(1) = 1 天
第2次: I(2) = 3 天
第3次: I(3) = 3 × 2.5 = 7.5 ≈ 8 天
第4次: I(4) = 8 × 2.5 = 20 天
第5次: I(5) = 20 × 2.5 = 50 天
```

---

## 3. 针对儿童学习的算法优化

### 3.1 问题分析

标准的 SM-2 算法对儿童学习可能不够友好：

| 问题 | SM-2 默认 | 儿童优化 |
|------|----------|--------|
| **初始间隔过长** | 1 天 | 保持 1 天（好的） |
| **间隔增长过快** | 线性乘以 EF | 减缓增长（避免遗忘） |
| **难度系数太高** | EF 最高 2.5 | 降低至 2.0 |
| **重置过于严厉** | q < 3 立即重置 | q = 2 时缩短，q < 2 才重置 |
| **长期遗忘风险** | 30 天间隔可能太长 | 最长 21 天 |

### 3.2 儿童版 SM-2 算法

```typescript
const CHILD_SM2_CONFIG = {
  // 难度因子范围
  min_easiness: 1.2,
  max_easiness: 2.0,  // 限制最大 EF，避免间隔过长
  
  // 初始值
  initial_easiness: 1.8,  // 比标准的 2.5 更保守
  
  // 间隔上限（避免间隔过长导致遗忘）
  max_interval_days: 21,  // 最长不超过 3 周
  
  // 质量评分阈值
  difficult_threshold: 2,  // q <= 2 时视为困难
  easy_threshold: 4,       // q >= 4 时视为容易
  
  // 缩放因子
  difficulty_multiplier: 0.85,  // 困难项的间隔缩放因子
};

// 优化后的计算公式
function calculateNewEF(currentEF, quality) {
  if (quality < 2) {
    // 重置为初始值
    return CHILD_SM2_CONFIG.initial_easiness;
  }
  
  // 保守的 EF 更新
  let newEF = currentEF + (0.1 - (5 - quality) * 0.05);
  
  // 限制在范围内
  return Math.max(
    CHILD_SM2_CONFIG.min_easiness,
    Math.min(CHILD_SM2_CONFIG.max_easiness, newEF)
  );
}

// 间隔计算，加入缓冲
function calculateNextInterval(
  repetitionNumber,
  easinessFactor,
  quality,
  previousInterval = 0
) {
  let interval;
  
  if (repetitionNumber === 1) {
    interval = 1;  // 第一次复习：1 天
  } else if (repetitionNumber === 2) {
    interval = 3;  // 第二次复习：3 天
  } else {
    // 第三次及以后
    interval = Math.round(previousInterval * easinessFactor);
  }
  
  // 如果质量差，缩短间隔
  if (quality <= 2) {
    interval = Math.max(1, Math.round(interval * CHILD_SM2_CONFIG.difficulty_multiplier));
  }
  
  // 上限限制
  interval = Math.min(interval, CHILD_SM2_CONFIG.max_interval_days);
  
  return interval;
}
```

---

## 4. 用户反馈到质量评分的映射

### 4.1 三级反馈系统

为了降低儿童的认知负担，使用简单的三级反馈而非 0-5 的复杂评分：

```
用户选择           质量评分  说明
─────────────────────────────────────────
😢 Hard / 困难      2       无法回忆或费力
😐 Good / 还好      4       可以回忆，无压力
😊 Easy / 简单      5       快速准确回忆

这个映射比标准的更简化，适合儿童：
- 减少决策复杂度
- 用 emoji 增加趣味性
- 三个选项容易快速点击
```

### 4.2 前端交互设计

```
复习完成后的反馈界面：

┌──────────────────────────────────┐
│  你对这个内容的掌握程度如何？      │
├──────────────────────────────────┤
│                                   │
│  [😢 还要多复习]                   │ ← Hard (2)
│  [😐 差不多了]                     │ ← Good (4)
│  [😊 完全掌握了]                   │ ← Easy (5)
│                                   │
└──────────────────────────────────┘

或者，对于年纪稍大的孩子，使用星级：

┌──────────────────────────────────┐
│  这个内容对你来说有多容易？        │
├──────────────────────────────────┤
│                                   │
│  ⭐☆☆ 很困难                        │ ← (2)
│  ⭐⭐☆ 还可以                       │ ← (4)
│  ⭐⭐⭐ 很简单                       │ ← (5)
│                                   │
└──────────────────────────────────┘
```

---

## 5. 复习推荐系统

### 5.1 每日推荐算法

```typescript
async function getRecommendedItemsForToday(): Promise<RecommendedItems> {
  const today = new Date().toISOString().split('T')[0];
  
  // 1. 查询所有今天或更早需要复习的项
  const dueItems = await db.query(`
    SELECT * FROM learning_items
    WHERE next_review <= '${today}'
    ORDER BY 
      mastery_level ASC,      -- 优先复习掌握程度低的
      last_reviewed ASC,      -- 其次复习距上次最久的
      created_at ASC          -- 最后按创建顺序
  `);
  
  // 2. 分层推荐（根据难度）
  const recommendations = {
    // 第 1 优先级：掌握程度 < 50% 的项（必须复习）
    critical: dueItems.filter(item => item.mastery_level < 50),
    
    // 第 2 优先级：掌握程度 50-80% 的项（建议复习）
    important: dueItems.filter(item => 50 <= item.mastery_level && item.mastery_level < 80),
    
    // 第 3 优先级：掌握程度 >= 80% 的项（可选复习）
    optional: dueItems.filter(item => item.mastery_level >= 80),
  };
  
  // 3. 计算推荐数量
  const dailyBudget = 10;  // 每天推荐 10 个
  const recommended = [
    ...recommendations.critical.slice(0, Math.ceil(dailyBudget * 0.5)),
    ...recommendations.important.slice(0, Math.ceil(dailyBudget * 0.3)),
    ...recommendations.optional.slice(0, Math.ceil(dailyBudget * 0.2)),
  ].slice(0, dailyBudget);
  
  return {
    total_recommended: recommended.length,
    recommended_items: recommended,
    stats: {
      critical_count: recommendations.critical.length,
      important_count: recommendations.important.length,
      optional_count: recommendations.optional.length,
    },
  };
}
```

### 5.2 推荐策略详解

**三级优先级系统**:
```
优先级    掌握度     推荐比例   说明
─────────────────────────────────────────
Critical  < 50%     50%       需要重点加强
Important 50-80%    30%       巩固中等知识
Optional  >= 80%    20%       保持记忆新鲜
```

**每日 10 个推荐项的分配**:
- 5 个 Critical（必须）
- 3 个 Important（应该）
- 2 个 Optional（可以）

这个分配确保：
- ✅ 学习重点集中
- ✅ 不会太枯燥（包含一些容易的）
- ✅ 有适度挑战感

---

## 6. 掌握度计算

### 6.1 掌握度公式

```typescript
function calculateMasteryLevel(learningItem): number {
  const {
    review_count,           // 复习次数
    review_history,         // 复习历史
    easiness_factor,        // 难度因子
    last_reviewed,          // 最后复习时间
    created_at,            // 创建时间
  } = learningItem;
  
  // 基础掌握度：复习次数越多越好
  const reviewBasedScore = Math.min(
    review_count / 5 * 60,  // 5 次复习达到 60% 基础分
    60
  );
  
  // 复习质量：最近复习的平均质量
  const recentReviews = review_history.slice(-5);  // 最近 5 次复习
  const qualityScore = recentReviews.length > 0
    ? (recentReviews.reduce((sum, r) => sum + r.quality, 0) / recentReviews.length / 5) * 30
    : 0;
  
  // 时间衰减：距离上次复习时间越久，掌握度越低
  const daysSinceReview = last_reviewed 
    ? (Date.now() - new Date(last_reviewed).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  
  const decayFactor = Math.exp(-daysSinceReview / 30);  // 30 天衰减到 37%
  const decayScore = Math.max(0, decayFactor * 10);
  
  // 总掌握度
  const masteryLevel = Math.min(
    100,
    (reviewBasedScore + qualityScore + decayScore)
  );
  
  return Math.round(masteryLevel);
}

// 掌握度分级
function getMasteryLabel(masteryLevel: number): string {
  if (masteryLevel >= 90) return '完全掌握 ✓';
  if (masteryLevel >= 70) return '基本掌握 ◐';
  if (masteryLevel >= 50) return '学习中 ◑';
  if (masteryLevel >= 30) return '初步了解 ◑';
  return '需要加强 ✗';
}
```

### 6.2 掌握度视觉化

```
掌握度  长条图          说明
────────────────────────────────
90%    ████████████    完全掌握 ✓
80%    ███████████     很不错
70%    ██████████      基本掌握 ◐
50%    ███████         学习中 ◑
30%    ████            初步了解 ◑
10%    ██              需要加强 ✗
```

---

## 7. 复习记录处理流程

### 7.1 完整的复习流程

```typescript
async function processReview(
  learningItemId: string,
  userFeedback: 'easy' | 'good' | 'hard',
  timeSpent: number  // 秒数
): Promise<ReviewResult> {
  // 1. 获取学习项
  const item = await db.getLearningItem(learningItemId);
  if (!item) throw new Error('Item not found');
  
  // 2. 映射用户反馈到质量评分
  const qualityMapping = {
    hard: 2,
    good: 4,
    easy: 5,
  };
  const quality = qualityMapping[userFeedback];
  
  // 3. 计算新的 SM2 参数
  const newEF = calculateNewEF(item.easiness_factor || 1.8, quality);
  const nextInterval = calculateNextInterval(
    item.review_count + 1,
    newEF,
    quality,
    item.algorithm_result?.interval || 0
  );
  
  // 4. 计算下次复习日期
  const today = new Date();
  const nextReviewDate = new Date(today.getTime() + nextInterval * 24 * 60 * 60 * 1000);
  
  // 5. 创建复习记录
  const reviewRecord = {
    id: generateUUID(),
    learning_item_id: learningItemId,
    reviewed_at: new Date().toISOString(),
    review_type: item.review_count === 0 ? 'initial' : 'review',
    user_feedback: userFeedback,
    comprehension_level: quality * 20,  // 转换为 0-100
    time_spent: timeSpent,
    algorithm_result: {
      next_interval_days: nextInterval,
      repetition_number: item.review_count + 1,
      easiness_factor: newEF,
      next_review_date: nextReviewDate.toISOString().split('T')[0],
    },
  };
  
  // 6. 计算新的掌握度
  const newMasteryLevel = calculateMasteryLevel({
    ...item,
    review_count: item.review_count + 1,
    easiness_factor: newEF,
    last_reviewed: new Date().toISOString(),
    review_history: [...item.review_history, reviewRecord],
  });
  
  // 7. 计算掌握度趋势
  const previousMastery = item.mastery_level || 0;
  const masteryTrend = 
    newMasteryLevel > previousMastery + 5 ? 'improving' :
    newMasteryLevel < previousMastery - 5 ? 'declining' :
    'stable';
  
  // 8. 更新学习项
  const updatedItem = {
    ...item,
    review_count: item.review_count + 1,
    last_reviewed: new Date().toISOString(),
    next_review: nextReviewDate.toISOString().split('T')[0],
    review_history: [...item.review_history, reviewRecord],
    easiness_factor: newEF,
    mastery_level: newMasteryLevel,
    mastery_trend: masteryTrend,
  };
  
  // 9. 保存到文件系统和数据库
  await saveToFileSystem(updatedItem);
  await db.updateLearningItem(updatedItem);
  await db.insertReviewRecord(reviewRecord);
  
  return {
    success: true,
    learning_item_id: learningItemId,
    new_mastery_level: newMasteryLevel,
    next_review_date: nextReviewDate.toISOString().split('T')[0],
    next_interval_days: nextInterval,
    review_record: reviewRecord,
  };
}
```

### 7.2 流程图

```
复习开始
    │
    ├─ 获取学习项数据
    │
    ├─ 用户选择反馈 (Easy/Good/Hard)
    │
    ├─ 映射到质量评分 (5/4/2)
    │
    ├─ 计算新的 EF（难度因子）
    │
    ├─ 计算下次复习间隔
    │
    ├─ 计算下次复习日期
    │
    ├─ 创建复习记录
    │
    ├─ 计算新的掌握度
    │
    ├─ 判断掌握度趋势
    │
    ├─ 更新学习项
    │
    ├─ 保存到 FS + 数据库
    │
    └─ 返回结果并更新 UI
```

---

## 8. 特殊情况处理

### 8.1 长期未复习的项

如果一个项超过 2 倍的建议间隔未被复习，应该：
1. 标记为 "overdue"（逾期）
2. 降低其掌握度估计
3. 在推荐列表中优先级提升

```typescript
function handleOverdueItems() {
  const items = db.query(`
    SELECT * FROM learning_items
    WHERE next_review < DATE('now', '-2 day')
  `);
  
  for (const item of items) {
    // 掌握度衰减
    const newMasteryLevel = Math.max(
      0,
      item.mastery_level * 0.7  // 衰减到 70%
    );
    
    // 更新
    db.update('learning_items', {
      id: item.id,
      mastery_level: newMasteryLevel,
      mastery_trend: 'declining',
    });
  }
}
```

### 8.2 连续失败的项

如果一个项连续 3 次用户反馈都是 "hard"，应该：
1. 建议用户重新学习这个内容
2. 可能需要分解成更小的学习单元
3. 标记为需要教师或家长干预

```typescript
function detectStruggleItems() {
  const items = db.query(`
    SELECT * FROM learning_items
    WHERE review_count >= 3
  `);
  
  for (const item of items) {
    const lastThreeReviews = item.review_history.slice(-3);
    const hardCount = lastThreeReviews.filter(r => r.user_feedback === 'hard').length;
    
    if (hardCount === 3) {
      // 标记为需要干预
      db.update('learning_items', {
        id: item.id,
        status: 'needs_intervention',  // 新增字段
      });
      
      // 发送通知给家长
      notifyParent({
        message: `${item.title} 需要额外帮助`,
        item_id: item.id,
      });
    }
  }
}
```

---

## 9. 实现代码框架

### 9.1 文件结构

```
src/lib/spaced-repetition/
├── types.ts                 # TypeScript 类型定义
├── sm2-algorithm.ts         # SM-2 算法核心
├── child-sm2-algorithm.ts   # 儿童版 SM-2 优化
├── mastery-calculator.ts    # 掌握度计算
├── recommendation.ts        # 推荐系统
├── review-processor.ts      # 复习处理
├── utils.ts                 # 工具函数
└── index.ts                 # 导出接口
```

### 9.2 核心接口

```typescript
// src/lib/spaced-repetition/index.ts

export interface SpacedRepetitionEngine {
  // 复习处理
  processReview(itemId: string, feedback: UserFeedback, timeSpent: number): Promise<ReviewResult>;
  
  // 推荐
  getRecommendedItems(limit?: number): Promise<RecommendedItems>;
  getRecommendedItemsForToday(): Promise<RecommendedItems>;
  
  // 掌握度
  calculateMasteryLevel(item: LearningItem): number;
  getMasteryTrend(item: LearningItem): MasteryTrend;
  
  // 特殊情况
  handleOverdueItems(): Promise<void>;
  detectStruggleItems(): Promise<void>;
  
  // 统计
  getProgressStats(period?: 'day' | 'week' | 'month'): Promise<ProgressStats>;
}

export function createSpacedRepetitionEngine(db: Database): SpacedRepetitionEngine {
  // 实现...
}
```

---

## 10. 配置示例

### 10.1 .env 配置

```bash
# 艾宾浩斯算法配置
SR_MIN_EASINESS=1.2
SR_MAX_EASINESS=2.0
SR_INITIAL_EASINESS=1.8
SR_MAX_INTERVAL_DAYS=21

# 推荐配置
SR_DAILY_BUDGET=10
SR_CRITICAL_RATIO=0.5
SR_IMPORTANT_RATIO=0.3
SR_OPTIONAL_RATIO=0.2

# 特殊情况处理
SR_OVERDUE_THRESHOLD_DAYS=2
SR_STRUGGLE_THRESHOLD=3
SR_MASTERY_DECAY_FACTOR=0.7
```

### 10.2 TypeScript 配置

```typescript
// src/config/spaced-repetition.ts

export const SR_CONFIG = {
  // 难度因子
  minEasiness: parseFloat(process.env.SR_MIN_EASINESS || '1.2'),
  maxEasiness: parseFloat(process.env.SR_MAX_EASINESS || '2.0'),
  initialEasiness: parseFloat(process.env.SR_INITIAL_EASINESS || '1.8'),
  maxIntervalDays: parseInt(process.env.SR_MAX_INTERVAL_DAYS || '21'),
  
  // 推荐
  dailyBudget: parseInt(process.env.SR_DAILY_BUDGET || '10'),
  criticalRatio: parseFloat(process.env.SR_CRITICAL_RATIO || '0.5'),
  importantRatio: parseFloat(process.env.SR_IMPORTANT_RATIO || '0.3'),
  optionalRatio: parseFloat(process.env.SR_OPTIONAL_RATIO || '0.2'),
  
  // 特殊情况
  overdueThresholdDays: parseInt(process.env.SR_OVERDUE_THRESHOLD_DAYS || '2'),
  struggleThreshold: parseInt(process.env.SR_STRUGGLE_THRESHOLD || '3'),
  masteryDecayFactor: parseFloat(process.env.SR_MASTERY_DECAY_FACTOR || '0.7'),
};
```

---

## 总结

这个艾宾浩斯算法实现的特点：
✅ **基于科学**: 遵循艾宾浩斯遗忘曲线原理
✅ **儿童友好**: 优化参数降低复习压力
✅ **智能推荐**: 三级优先级系统，每日定量
✅ **动态调整**: 根据用户反馈实时调整难度
✅ **可靠稳健**: 处理长期未复习、连续失败等边界情况
✅ **易于集成**: 清晰的接口和配置系统
