import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import type { LearningItem, APIResponse } from '../../lib/types';

interface UploadRequest {
  type: 'vocabulary' | 'grammar' | 'story' | 'knowledge';
  title: string;
  description?: string;
  raw_content: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  estimated_time?: number;
}

/**
 * POST /api/upload
 * 上传原始学习资料并创建学习项
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = (await request.json()) as UploadRequest;
    
    // 验证必填字段
    if (!data.type || !data.title || !data.raw_content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: type, title, raw_content',
          timestamp: new Date().toISOString(),
        } as APIResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 创建学习项
    const learningItemId = uuidv4();
    const today = new Date().toISOString().split('T')[0];
    const dataDir = path.join(process.cwd(), 'src', 'data', today);
    
    // 确保数据目录存在
    await fs.mkdir(path.join(dataDir, 'raw'), { recursive: true });
    await fs.mkdir(path.join(dataDir, 'generated'), { recursive: true });
    
    // 保存原始内容
    const item: LearningItem = {
      id: learningItemId,
      date: today,
      type: data.type,
      title: data.title,
      description: data.description || '',
      raw_content: data.raw_content,
      raw_files: [],
      generated_markdown: '',
      generated_at: new Date().toISOString(),
      llm_provider: 'deepseek',
      tags: data.tags || [],
      difficulty: data.difficulty || 'medium',
      estimated_time: data.estimated_time || 10,
      related_concepts: [],
      created_at: new Date().toISOString(),
      last_reviewed: undefined,
      next_review: undefined,
      review_count: 0,
      difficulty_self_assessment: data.difficulty || 'medium',
      review_history: [],
      mastery_level: 0,
      mastery_trend: undefined,
    };
    
    // 保存学习项到文件系统
    const itemPath = path.join(dataDir, 'learning-items', `${learningItemId}.json`);
    await fs.mkdir(path.dirname(itemPath), { recursive: true });
    await fs.writeFile(itemPath, JSON.stringify(item, null, 2));
    
    // 也保存原始内容文本文件
    const rawPath = path.join(dataDir, 'raw', `${learningItemId}.txt`);
    await fs.writeFile(rawPath, data.raw_content);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: learningItemId,
          message: 'Learning item created successfully',
          item,
        },
        timestamp: new Date().toISOString(),
      } as APIResponse),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Upload error:', error);
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
      data: { message: 'Upload API documentation' },
      timestamp: new Date().toISOString(),
    } as APIResponse),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
