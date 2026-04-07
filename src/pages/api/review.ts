import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  calculateNewEF, 
  calculateNextInterval, 
  mapFeedbackToQuality, 
  calculateMasteryLevel 
} from '../../lib/spaced-repetition';
import { v4 as uuidv4 } from 'uuid';
import type { ReviewRecord, APIResponse } from '../../lib/types';

interface ReviewRequest {
  learning_item_id: string;
  user_feedback: 'easy' | 'good' | 'hard';
  time_spent: number; // 秒数
  notes?: string;
}

/**
 * POST /api/review
 * 记录复习反馈并使用 SM-2 算法计算下次复习时间
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = (await request.json()) as ReviewRequest;
    
    // 验证必填字段
    if (!data.learning_item_id || !data.user_feedback || data.time_spent === undefined) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: learning_item_id, user_feedback, time_spent',
          timestamp: new Date().toISOString(),
        } as APIResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 查找学习项
    const today = new Date().toISOString().split('T')[0];
    const baseDataDir = path.join(process.cwd(), 'src', 'data');
    
    // 需要在所有日期目录中查找
    let learningItem = null;
    let itemPath = '';
    let reviewsDir = '';
    
    try {
      const dateDirs = await fs.readdir(baseDataDir);
      for (const dateDir of dateDirs) {
        const fullPath = path.join(baseDataDir, dateDir, 'learning-items', `${data.learning_item_id}.json`);
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          learningItem = JSON.parse(content);
          itemPath = fullPath;
          reviewsDir = path.join(path.dirname(fullPath), '..', 'reviews');
          break;
        } catch {
          // 继续查找
        }
      }
    } catch {
      // 目录不存在
    }
    
    if (!learningItem) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Learning item not found',
          timestamp: new Date().toISOString(),
        } as APIResponse),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 映射反馈到质量评分
    const quality = mapFeedbackToQuality(data.user_feedback);
    
    // 计算新的 SM-2 参数
    const currentEF = learningItem.mastery_level > 0 ? 
      (learningItem.mastery_level / 50) : 1.8; // 基于掌握度估计 EF
    
    const newEF = calculateNewEF(currentEF, quality);
    const nextInterval = calculateNextInterval(
      learningItem.review_count + 1,
      newEF,
      quality,
      learningItem.review_count > 0 ? 1 : 0 // 简化版，实际应从历史记录计算
    );
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
    
    // 创建复习记录
    const reviewRecord: ReviewRecord = {
      id: uuidv4(),
      learning_item_id: data.learning_item_id,
      reviewed_at: new Date().toISOString(),
      review_type: learningItem.review_count === 0 ? 'initial' : 'review',
      user_feedback: data.user_feedback,
      comprehension_level: quality * 20,
      time_spent: data.time_spent,
      algorithm_result: {
        next_interval_days: nextInterval,
        repetition_number: learningItem.review_count + 1,
        easiness_factor: newEF,
        next_review_date: nextReviewDate.toISOString().split('T')[0],
      },
      notes: data.notes,
    };
    
    // 计算新的掌握度
    const newMasteryLevel = calculateMasteryLevel(
      learningItem.review_count + 1,
      quality,
      0
    );
    
    // 更新学习项
    learningItem.review_count += 1;
    learningItem.last_reviewed = new Date().toISOString();
    learningItem.next_review = nextReviewDate.toISOString().split('T')[0];
    learningItem.mastery_level = newMasteryLevel;
    learningItem.mastery_trend = newMasteryLevel > learningItem.mastery_level ? 'improving' : 'stable';
    learningItem.review_history.push(reviewRecord);
    
    // 保存更新后的学习项
    await fs.writeFile(itemPath, JSON.stringify(learningItem, null, 2));
    
    // 保存复习记录
    await fs.mkdir(reviewsDir, { recursive: true });
    const reviewPath = path.join(reviewsDir, `${reviewRecord.id}.json`);
    await fs.writeFile(reviewPath, JSON.stringify(reviewRecord, null, 2));
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          learning_item_id: data.learning_item_id,
          new_mastery_level: newMasteryLevel,
          next_review_date: nextReviewDate.toISOString().split('T')[0],
          next_interval_days: nextInterval,
          review_record: reviewRecord,
          message: 'Review recorded successfully',
        },
        timestamp: new Date().toISOString(),
      } as APIResponse),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Review error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      } as APIResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: { message: 'Review API - POST to record review feedback' },
      timestamp: new Date().toISOString(),
    } as APIResponse),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
