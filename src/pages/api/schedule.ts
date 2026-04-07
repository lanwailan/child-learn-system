import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import type { APIResponse } from '../../lib/types';

/**
 * GET /api/schedule
 * 获取复习日程表
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const days = parseInt(url.searchParams.get('days') || '30');
    const baseDataDir = path.join(process.cwd(), 'src', 'data');
    
    const schedule: Record<string, any[]> = {};
    
    // 初始化日期范围
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      schedule[dateStr] = [];
    }
    
    // 收集所有学习项并根据 next_review 分配到日期
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
            const item = JSON.parse(content);
            
            if (item.next_review) {
              if (schedule[item.next_review]) {
                schedule[item.next_review].push({
                  id: item.id,
                  title: item.title,
                  type: item.type,
                  mastery_level: item.mastery_level,
                  estimated_time: item.estimated_time,
                  difficulty: item.difficulty,
                });
              }
            }
          }
        } catch {
          // 继续
        }
      }
    } catch {
      // 继续
    }
    
    // 计算每日统计
    const dailyStats = Object.entries(schedule).map(([date, items]) => ({
      date,
      item_count: items.length,
      estimated_time: items.reduce((sum, i) => sum + (i.estimated_time || 0), 0),
      avg_mastery: items.length > 0 
        ? Math.round(items.reduce((sum, i) => sum + (i.mastery_level || 0), 0) / items.length)
        : 0,
    }));
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          schedule,
          daily_stats: dailyStats,
          total_days: days,
          total_items_scheduled: Object.values(schedule).reduce((sum, arr) => sum + arr.length, 0),
        },
        timestamp: new Date().toISOString(),
      } as APIResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Schedule error:', error);
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
