// 艾宾浩斯算法核心配置

export const SM2_CONFIG = {
  // 难度因子范围
  minEasiness: 1.2,
  maxEasiness: 2.0,
  initialEasiness: 1.8,
  
  // 间隔上限
  maxIntervalDays: 21,
  
  // 质量评分阈值
  difficultThreshold: 2,
  easyThreshold: 4,
  
  // 缩放因子
  difficultyMultiplier: 0.85,
};

export const RECOMMENDATION_CONFIG = {
  dailyBudget: 10,
  criticalRatio: 0.5,      // 50% 难的
  importantRatio: 0.3,     // 30% 中等
  optionalRatio: 0.2,      // 20% 容易
};

export const SPECIAL_CASES_CONFIG = {
  overdueThresholdDays: 2,
  struggleThreshold: 3,
  masteryDecayFactor: 0.7,
};

// 计算新的易度因子 (SM-2)
export function calculateNewEF(
  currentEF: number,
  quality: number
): number {
  if (quality < 2) {
    // 重置为初始值
    return SM2_CONFIG.initialEasiness;
  }
  
  // 保守的 EF 更新
  let newEF = currentEF + (0.1 - (5 - quality) * 0.05);
  
  // 限制在范围内
  return Math.max(
    SM2_CONFIG.minEasiness,
    Math.min(SM2_CONFIG.maxEasiness, newEF)
  );
}

// 计算下次复习间隔
export function calculateNextInterval(
  repetitionNumber: number,
  easinessFactor: number,
  quality: number,
  previousInterval: number = 0
): number {
  let interval: number;
  
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
    interval = Math.max(
      1,
      Math.round(interval * SM2_CONFIG.difficultyMultiplier)
    );
  }
  
  // 上限限制
  interval = Math.min(interval, SM2_CONFIG.maxIntervalDays);
  
  return interval;
}

// 映射用户反馈到质量评分
export function mapFeedbackToQuality(feedback: 'easy' | 'good' | 'hard'): number {
  const mapping = {
    hard: 2,
    good: 4,
    easy: 5,
  };
  return mapping[feedback];
}

// 计算掌握度
export function calculateMasteryLevel(
  reviewCount: number,
  recentQualityAvg: number,
  daysSinceReview: number
): number {
  // 基础掌握度：复习次数
  const reviewBasedScore = Math.min(reviewCount / 5 * 60, 60);
  
  // 复习质量
  const qualityScore = (recentQualityAvg / 5) * 30;
  
  // 时间衰减
  const decayFactor = Math.exp(-daysSinceReview / 30);
  const decayScore = Math.max(0, decayFactor * 10);
  
  const masteryLevel = Math.min(
    100,
    reviewBasedScore + qualityScore + decayScore
  );
  
  return Math.round(masteryLevel);
}

// 获取掌握度标签
export function getMasteryLabel(masteryLevel: number): string {
  if (masteryLevel >= 90) return '完全掌握 ✓';
  if (masteryLevel >= 70) return '基本掌握 ◐';
  if (masteryLevel >= 50) return '学习中 ◑';
  if (masteryLevel >= 30) return '初步了解 ◑';
  return '需要加强 ✗';
}
