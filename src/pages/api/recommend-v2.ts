import type { APIRoute } from 'astro';
import { initializeDatabase, getItemsForReview } from '../../lib/database/sqlite';
import type { APIResponse } from '../../lib/types';

const DAILY_QUOTA = 10;
const PRIORITY_RATIOS = {
  critical: 0.5,
  important: 0.3,
  optional: 0.2,
};

/**
 * GET /api/recommend-v2
 * 使用 SQLite 数据库的高效推荐系统
 * 推荐优先级: Critical (掌握度<50%) > Important (50-80%) > Optional (>=80%)
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    // 初始化数据库
    await initializeDatabase();

    const limit = parseInt(url.searchParams.get('limit') || DAILY_QUOTA.toString());
    const today = new Date().toISOString().split('T')[0];

    // 从数据库查询所有需要复习的项
    const items = getItemsForReview(today, limit * 2); // 获取更多以便分层

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            total_recommended: 0,
            recommended_items: [],
            stats: {
              critical_count: 0,
              important_count: 0,
              optional_count: 0,
            },
          },
          timestamp: new Date().toISOString(),
        } as APIResponse),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 按优先级分层
    const critical = items.filter(item => (item.mastery_level as number) < 50);
    const important = items.filter(item => (item.mastery_level as number) >= 50 && (item.mastery_level as number) < 80);
    const optional = items.filter(item => (item.mastery_level as number) >= 80);

    // 计算配额分配
    const criticalLimit = Math.ceil(limit * PRIORITY_RATIOS.critical);
    const importantLimit = Math.ceil(limit * PRIORITY_RATIOS.important);
    const optionalLimit = Math.ceil(limit * PRIORITY_RATIOS.optional);

    // 按优先级组合
    const recommended = [
      ...critical.slice(0, criticalLimit),
      ...important.slice(0, importantLimit),
      ...optional.slice(0, optionalLimit),
    ].slice(0, limit);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_recommended: recommended.length,
          recommended_items: recommended.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            mastery_level: item.mastery_level,
            difficulty: item.difficulty,
            estimated_time: item.estimated_time,
            tags: item.tags ? JSON.parse(item.tags) : [],
          })),
          stats: {
            critical_count: Math.min(critical.length, criticalLimit),
            important_count: Math.min(important.length, importantLimit),
            optional_count: Math.min(optional.length, optionalLimit),
          },
          source: 'sqlite',
          performanceMs: 0, // 可添加性能计时
        },
        timestamp: new Date().toISOString(),
      } as APIResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Recommend error:', error);
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
