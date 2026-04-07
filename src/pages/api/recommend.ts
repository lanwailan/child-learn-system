import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import type { LearningItem, APIResponse } from '../../lib/types';

/**
 * GET /api/recommend
 * 获取推荐复习项（基于艾宾浩斯算法）
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const today = new Date().toISOString().split('T')[0];
    const baseDataDir = path.join(process.cwd(), 'src', 'data');
    
    const dueItems: (LearningItem & { priority: string })[] = [];
    
    // 遍历所有日期目录，查找需要复习的项
    try {
      const dateDirs = await fs.readdir(baseDataDir);
      
      for (const dateDir of dateDirs) {
        const itemsDir = path.join(baseDataDir, dateDir, 'learning-items');
        try {
          const files = await fs.readdir(itemsDir);
          
          for (const file of files) {
            if (!file.endsWith('.json')) continue;
            
            const filePath = path.join(itemsDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const item: LearningItem = JSON.parse(content);
            
            // 检查是否应该复习
            if (!item.next_review || item.next_review <= today) {
              // 确定优先级
              let priority = 'optional';
              if (item.mastery_level < 50) {
                priority = 'critical';
              } else if (item.mastery_level < 80) {
                priority = 'important';
              }
              
              dueItems.push({ ...item, priority });
            }
          }
        } catch {
          // 目录不存在或出错，继续
        }
      }
    } catch {
      // baseDataDir 不存在
    }
    
    // 按优先级排序
    const priorityOrder = { critical: 0, important: 1, optional: 2 };
    dueItems.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                           priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      
      // 同优先级下，按掌握度从低到高
      return (a.mastery_level || 0) - (b.mastery_level || 0);
    });
    
    // 分配配额（按比例）
    const dailyBudget = limit;
    const criticalRatio = 0.5;
    const importantRatio = 0.3;
    const optionalRatio = 0.2;
    
    const critical = dueItems.filter(i => i.priority === 'critical');
    const important = dueItems.filter(i => i.priority === 'important');
    const optional = dueItems.filter(i => i.priority === 'optional');
    
    const recommended = [
      ...critical.slice(0, Math.ceil(dailyBudget * criticalRatio)),
      ...important.slice(0, Math.ceil(dailyBudget * importantRatio)),
      ...optional.slice(0, Math.ceil(dailyBudget * optionalRatio)),
    ].slice(0, dailyBudget);
    
    // 移除 priority 字段
    const cleanRecommended = recommended.map(({ priority, ...item }) => item);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_recommended: cleanRecommended.length,
          recommended_items: cleanRecommended,
          stats: {
            critical_count: critical.length,
            important_count: important.length,
            optional_count: optional.length,
          },
          timestamp: new Date().toISOString(),
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
