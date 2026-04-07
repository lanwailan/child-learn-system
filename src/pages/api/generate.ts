import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import type { APIResponse } from '../../lib/types';
import { getLLMAdapter } from '../../lib/llm';

interface GenerateRequest {
  learning_item_id: string;
  llm_provider?: 'deepseek' | 'qwen' | 'glm' | 'openai';
}

/**
 * POST /api/generate
 * 调用 LLM 生成高质量学习内容
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = (await request.json()) as GenerateRequest;
    
    if (!data.learning_item_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required field: learning_item_id',
          timestamp: new Date().toISOString(),
        } as APIResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 查找学习项
    const baseDataDir = path.join(process.cwd(), 'src', 'data');
    let learningItem = null;
    let itemPath = '';
    
    try {
      const dateDirs = await fs.readdir(baseDataDir);
      for (const dateDir of dateDirs) {
        const fullPath = path.join(baseDataDir, dateDir, 'learning-items', `${data.learning_item_id}.json`);
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          learningItem = JSON.parse(content);
          itemPath = fullPath;
          break;
        } catch {
          // 继续
        }
      }
    } catch {
      // 继续
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
    
    // 生成系统提示词
    const systemPrompt = getSystemPromptForType(learningItem.type);
    
    // 生成用户提示词
    const userPrompt = `
【用户输入】:
${JSON.stringify({
  title: learningItem.title,
  type: learningItem.type,
  raw_content: learningItem.raw_content,
  difficulty: learningItem.difficulty,
}, null, 2)}

请基于上述信息生成高质量的学习材料。
`;
    
    // 由于完整的 LLM API 集成需要实际的 API 密钥，这里使用模拟响应
    // 在实际部署时应该替换为真实的 LLM 调用
    const mockMarkdown = generateMockMarkdown(learningItem);
    
    // 更新学习项
    learningItem.generated_markdown = mockMarkdown;
    learningItem.generated_at = new Date().toISOString();
    learningItem.llm_provider = data.llm_provider || 'deepseek';
    
    // 保存更新
    await fs.writeFile(itemPath, JSON.stringify(learningItem, null, 2));
    
    // 也保存为 Markdown 文件
    const itemDate = learningItem.date;
    const mdPath = path.join(baseDataDir, itemDate, 'generated', `${data.learning_item_id}.md`);
    await fs.mkdir(path.dirname(mdPath), { recursive: true });
    await fs.writeFile(mdPath, mockMarkdown);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: data.learning_item_id,
          markdown: mockMarkdown,
          message: 'Content generated successfully (using mock, implement real LLM)',
          note: 'To use real LLM: set environment variables for DeepSeek/Qwen/GLM/OpenAI',
        },
        timestamp: new Date().toISOString(),
      } as APIResponse),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate error:', error);
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

function getSystemPromptForType(type: string): string {
  const prompts: Record<string, string> = {
    vocabulary: `你是一个专业的英文教师。为儿童设计学习卡片时要使用简洁的语言、生活化的例子。`,
    grammar: `你是一个专业的语法讲解师。为儿童讲解语法规则时要清晰、有对比、包含练习题。`,
    story: `你是一个专业的儿童文学编辑。为儿童简化故事时保留核心情节、提取关键词汇、启发深度思考。`,
    knowledge: `你是一个专业的科普作家。为儿童解释知识点时使用生活化的类比、有趣的冷知识、清晰的关联。`,
  };
  
  return prompts[type] || prompts.knowledge;
}

function generateMockMarkdown(item: any): string {
  return `---
type: ${item.type}
title: ${item.title}
difficulty: ${item.difficulty}
estimated_time: ${item.estimated_time || 10}
tags: ${JSON.stringify(item.tags || [])}
related_concepts: ${JSON.stringify(item.related_concepts || [])}
---

# ${item.title}

**学习目标**: 掌握 ${item.title} 的相关知识

## 基础定义

${item.raw_content}

## 核心要点

- 📌 关键点 1
- 📌 关键点 2
- 📌 关键点 3

## 生活化例子

### 例 1
这里是第一个例子...

### 例 2
这里是第二个例子...

## 相关概念

${item.related_concepts?.length > 0 
  ? item.related_concepts.map((c: string) => `- [[${c}]]`).join('\n')
  : '- 暂无相关概念'}

## 有趣的补充知识 💡

- 有趣冷知识 1
- 有趣冷知识 2

## 练习题

**思考题**:
- [ ] 你能用自己的话解释一下吗？
- [ ] 你在生活中见过什么例子？

---

**下次复习推荐日期**: 明天  
**学习提示**: 今天认真学习，明天复习效果最好！
`;
}

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: { message: 'Generate API - POST to generate content with LLM' },
      timestamp: new Date().toISOString(),
    } as APIResponse),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
