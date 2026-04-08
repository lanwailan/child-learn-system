import { promises } from 'fs';
import path from 'path';
import { v4 } from 'uuid';
export { renderers } from '../../renderers.mjs';

const SM2_CONFIG = {
  // 难度因子范围
  minEasiness: 1.2,
  maxEasiness: 2,
  initialEasiness: 1.8,
  // 间隔上限
  maxIntervalDays: 21,
  // 缩放因子
  difficultyMultiplier: 0.85
};
function calculateNewEF(currentEF, quality) {
  if (quality < 2) {
    return SM2_CONFIG.initialEasiness;
  }
  let newEF = currentEF + (0.1 - (5 - quality) * 0.05);
  return Math.max(
    SM2_CONFIG.minEasiness,
    Math.min(SM2_CONFIG.maxEasiness, newEF)
  );
}
function calculateNextInterval(repetitionNumber, easinessFactor, quality, previousInterval = 0) {
  let interval;
  if (repetitionNumber === 1) {
    interval = 1;
  } else if (repetitionNumber === 2) {
    interval = 3;
  } else {
    interval = Math.round(previousInterval * easinessFactor);
  }
  if (quality <= 2) {
    interval = Math.max(
      1,
      Math.round(interval * SM2_CONFIG.difficultyMultiplier)
    );
  }
  interval = Math.min(interval, SM2_CONFIG.maxIntervalDays);
  return interval;
}
function mapFeedbackToQuality(feedback) {
  const mapping = {
    hard: 2,
    good: 4,
    easy: 5
  };
  return mapping[feedback];
}
function calculateMasteryLevel(reviewCount, recentQualityAvg, daysSinceReview) {
  const reviewBasedScore = Math.min(reviewCount / 5 * 60, 60);
  const qualityScore = recentQualityAvg / 5 * 30;
  const decayFactor = Math.exp(-0 / 30);
  const decayScore = Math.max(0, decayFactor * 10);
  const masteryLevel = Math.min(
    100,
    reviewBasedScore + qualityScore + decayScore
  );
  return Math.round(masteryLevel);
}

const POST = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.learning_item_id || !data.user_feedback || data.time_spent === void 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: learning_item_id, user_feedback, time_spent",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const baseDataDir = path.join(process.cwd(), "src", "data");
    let learningItem = null;
    let itemPath = "";
    let reviewsDir = "";
    try {
      const dateDirs = await promises.readdir(baseDataDir);
      for (const dateDir of dateDirs) {
        const fullPath = path.join(baseDataDir, dateDir, "learning-items", `${data.learning_item_id}.json`);
        try {
          const content = await promises.readFile(fullPath, "utf-8");
          learningItem = JSON.parse(content);
          itemPath = fullPath;
          reviewsDir = path.join(path.dirname(fullPath), "..", "reviews");
          break;
        } catch {
        }
      }
    } catch {
    }
    if (!learningItem) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Learning item not found",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const quality = mapFeedbackToQuality(data.user_feedback);
    const currentEF = learningItem.mastery_level > 0 ? learningItem.mastery_level / 50 : 1.8;
    const newEF = calculateNewEF(currentEF, quality);
    const nextInterval = calculateNextInterval(
      learningItem.review_count + 1,
      newEF,
      quality,
      learningItem.review_count > 0 ? 1 : 0
      // 简化版，实际应从历史记录计算
    );
    const nextReviewDate = /* @__PURE__ */ new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
    const reviewRecord = {
      id: v4(),
      learning_item_id: data.learning_item_id,
      reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
      review_type: learningItem.review_count === 0 ? "initial" : "review",
      user_feedback: data.user_feedback,
      comprehension_level: quality * 20,
      time_spent: data.time_spent,
      algorithm_result: {
        next_interval_days: nextInterval,
        repetition_number: learningItem.review_count + 1,
        easiness_factor: newEF,
        next_review_date: nextReviewDate.toISOString().split("T")[0]
      },
      notes: data.notes
    };
    const newMasteryLevel = calculateMasteryLevel(
      learningItem.review_count + 1,
      quality,
      0
    );
    learningItem.review_count += 1;
    learningItem.last_reviewed = (/* @__PURE__ */ new Date()).toISOString();
    learningItem.next_review = nextReviewDate.toISOString().split("T")[0];
    learningItem.mastery_level = newMasteryLevel;
    learningItem.mastery_trend = newMasteryLevel > learningItem.mastery_level ? "improving" : "stable";
    learningItem.review_history.push(reviewRecord);
    await promises.writeFile(itemPath, JSON.stringify(learningItem, null, 2));
    await promises.mkdir(reviewsDir, { recursive: true });
    const reviewPath = path.join(reviewsDir, `${reviewRecord.id}.json`);
    await promises.writeFile(reviewPath, JSON.stringify(reviewRecord, null, 2));
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          learning_item_id: data.learning_item_id,
          new_mastery_level: newMasteryLevel,
          next_review_date: nextReviewDate.toISOString().split("T")[0],
          next_interval_days: nextInterval,
          review_record: reviewRecord,
          message: "Review recorded successfully"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Review error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const GET = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: { message: "Review API - POST to record review feedback" },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
