import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import type { LearningItem, APIResponse } from '../../lib/types';

/**
 * GET /api/stats
 * 获取学习统计信息
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const period = url.searchParams.get('period') || 'all'; // all, week, month
    const baseDataDir = path.join(process.cwd(), 'src', 'data');
    
    let allItems: LearningItem[] = [];
    const today = new Date();
    const cutoffDate = new Date();
    
    if (period === 'week') {
      cutoffDate.setDate(today.getDate() - 7);
    } else if (period === 'month') {
      cutoffDate.setDate(today.getDate() - 30);
    }
    
    // 遍历所有日期目录，收集数据
    try {
      const dateDirs = await fs.readdir(baseDataDir);
      
      for (const dateDir of dateDirs) {
        const dirDate = new Date(dateDir);
        if (period !== 'all' && dirDate < cutoffDate) {
          continue;
        }
        
        const itemsDir = path.join(baseDataDir, dateDir, 'learning-items');
        try {
          const files = await fs.readdir(itemsDir);
          
          for (const file of files) {
            if (!file.endsWith('.json')) continue;
            
            const filePath = path.join(itemsDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const item: LearningItem = JSON.parse(content);
            allItems.push(item);
          }
        } catch {
          // 目录不存在，继续
        }
      }
    } catch {
      // baseDataDir 不存在
    }
    
    // 计算统计信息
    const totalItems = allItems.length;
    const totalReviews = allItems.reduce((sum, item) => sum + item.review_count, 0);
    
    // 按类型统计
    const itemsByType = {
      vocabulary: allItems.filter(i => i.type === 'vocabulary').length,
      grammar: allItems.filter(i => i.type === 'grammar').length,
      story: allItems.filter(i => i.type === 'story').length,
      knowledge: allItems.filter(i => i.type === 'knowledge').length,
    };
    
    // 掌握度统计
    const masteryStats = {
      avg_mastery: Math.round(
        allItems.length > 0 
          ? allItems.reduce((sum, i) => sum + (i.mastery_level || 0), 0) / allItems.length
          : 0
      ),
      mastered: allItems.filter(i => (i.mastery_level || 0) >= 90).length,
      learning: allItems.filter(i => (i.mastery_level || 0) >= 50 && (i.mastery_level || 0) < 90).length,
      struggling: allItems.filter(i => (i.mastery_level || 0) < 50).length,
    };
    
    // 难度分布
    const difficultyDistribution = {
      easy: allItems.filter(i => i.difficulty === 'easy').length,
      medium: allItems.filter(i => i.difficulty === 'medium').length,
      hard: allItems.filter(i => i.difficulty === 'hard').length,
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          period,
          total_items: totalItems,
          total_reviews: totalReviews,
          items_by_type: itemsByType,
          mastery_stats: masteryStats,
          difficulty_distribution: difficultyDistribution,
          avg_time_per_item: Math.round(
            allItems.length > 0
              ? allItems.reduce((sum, i) => sum + (i.estimated_time || 0), 0) / allItems.length
              : 0
          ),
        },
        timestamp: new Date().toISOString(),
      } as APIResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Stats error:', error);
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
