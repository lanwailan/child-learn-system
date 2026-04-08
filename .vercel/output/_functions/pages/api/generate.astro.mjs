import { promises } from 'fs';
import path from 'path';
export { renderers } from '../../renderers.mjs';

function getLLMConfig() {
  const provider = process.env.LLM_PROVIDER || "deepseek";
  const configs = {
    deepseek: {
      provider: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      baseUrl: "https://api.deepseek.com/v1"
    },
    qwen: {
      provider: "qwen",
      apiKey: process.env.QWEN_API_KEY || "",
      model: process.env.QWEN_MODEL || "qwen-max",
      baseUrl: "https://dashscope.aliyuncs.com/compatible/openai/v1"
    },
    glm: {
      provider: "glm",
      apiKey: process.env.GLM_API_KEY || "",
      model: process.env.GLM_MODEL || "glm-4",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4"
    },
    openai: {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_MODEL || "gpt-4-turbo",
      baseUrl: "https://api.openai.com/v1"
    }
  };
  return configs[provider] || configs.deepseek;
}
async function generateWithDeepSeek(config, request) {
  if (!config.apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2e3
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    }
  };
}
async function generateWithQwen(config, request) {
  if (!config.apiKey) {
    throw new Error("QWEN_API_KEY not configured");
  }
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2e3
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Qwen API error: ${error.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    }
  };
}
async function generateWithGLM(config, request) {
  if (!config.apiKey) {
    throw new Error("GLM_API_KEY not configured");
  }
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2e3
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GLM API error: ${error.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    }
  };
}
async function generateWithOpenAI(config, request) {
  if (!config.apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2e3
    })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    }
  };
}
async function generateContent(request) {
  const config = getLLMConfig();
  console.log(`[LLM] Using provider: ${config.provider}, model: ${config.model}`);
  switch (config.provider) {
    case "deepseek":
      return generateWithDeepSeek(config, request);
    case "qwen":
      return generateWithQwen(config, request);
    case "glm":
      return generateWithGLM(config, request);
    case "openai":
      return generateWithOpenAI(config, request);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}

const POST = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.learning_item_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required field: learning_item_id",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const baseDataDir = path.join(process.cwd(), "src", "data");
    let learningItem = null;
    let itemPath = "";
    try {
      const dateDirs = await promises.readdir(baseDataDir);
      for (const dateDir of dateDirs) {
        const fullPath = path.join(baseDataDir, dateDir, "learning-items", `${data.learning_item_id}.json`);
        try {
          const content = await promises.readFile(fullPath, "utf-8");
          learningItem = JSON.parse(content);
          itemPath = fullPath;
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
    const systemPrompt = getSystemPromptForType(learningItem.type);
    const userPrompt = `
【学习项目信息】:
- 标题: ${learningItem.title}
- 类型: ${learningItem.type}
- 难度: ${learningItem.difficulty}
- 预计时间: ${learningItem.estimated_time} 分钟
- 标签: ${learningItem.tags?.join(", ") || "无"}

【原始内容】:
${learningItem.raw_content}

【要求】:
1. 请根据上述信息生成高质量的学习材料
2. 输出格式必须是 Markdown
3. 包含标题、定义、关键点、例子等部分
4. 对于儿童学习，使用简单易懂的语言
5. 在相关概念前加上 [[]] 创建知识关联
6. 最后添加思考题和有趣知识

请生成 Markdown 格式的学习材料:
`;
    let markdown = "";
    let tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    try {
      const result = await generateContent({
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        maxTokens: 2e3
      });
      markdown = result.content;
      tokenUsage = result.usage;
      console.log(`[${data.learning_item_id}] Generated with LLM - Tokens: ${tokenUsage.totalTokens}`);
    } catch (llmError) {
      console.warn(`[Generate] LLM failed, using fallback:`, llmError instanceof Error ? llmError.message : "");
      markdown = generateMockMarkdown(learningItem);
      tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    }
    learningItem.generated_markdown = markdown;
    learningItem.generated_at = (/* @__PURE__ */ new Date()).toISOString();
    learningItem.llm_provider = data.llm_provider || process.env.LLM_PROVIDER || "deepseek";
    await promises.writeFile(itemPath, JSON.stringify(learningItem, null, 2));
    const itemDate = learningItem.date;
    const mdPath = path.join(baseDataDir, itemDate, "generated", `${data.learning_item_id}.md`);
    await promises.mkdir(path.dirname(mdPath), { recursive: true });
    await promises.writeFile(mdPath, markdown);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: data.learning_item_id,
          markdown,
          provider: learningItem.llm_provider,
          tokenUsage,
          message: tokenUsage.totalTokens > 0 ? `Content generated successfully with real LLM (${tokenUsage.totalTokens} tokens)` : "Content generated with fallback (LLM API not configured)",
          note: tokenUsage.totalTokens === 0 ? "To enable real LLM: Configure DEEPSEEK_API_KEY, QWEN_API_KEY, GLM_API_KEY, or OPENAI_API_KEY" : void 0
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate error:", error);
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
function getSystemPromptForType(type) {
  const prompts = {
    vocabulary: `你是一个专业的英文教师。为儿童设计学习卡片时要：
1. 使用简洁的语言、生活化的例子
2. 解释词义时包含音标
3. 提供3-5个实用例句
4. 添加近义词或反义词
5. 用有趣的记忆技巧帮助记忆`,
    grammar: `你是一个专业的语法讲解师。为儿童讲解语法规则时要：
1. 用简单直白的语言解释规则
2. 提供清晰的规则对比
3. 包含5个实际应用的例子
4. 列举常见的错误用法
5. 提供练习题检验理解`,
    story: `你是一个专业的儿童文学编辑。为儿童简化故事时要：
1. 保留核心情节和主要人物
2. 删除复杂的细节描写
3. 提取关键词汇和表达
4. 用儿童能理解的语言重写
5. 启发思考与讨论`,
    knowledge: `你是一个专业的科普作家。为儿童解释知识点时要：
1. 使用生活化的类比和比喻
2. 分享有趣的冷知识和事实
3. 解释因果关系和联系
4. 提供现实应用的例子
5. 激发好奇心和想象力`
  };
  return prompts[type] || prompts.knowledge;
}
function generateMockMarkdown(item) {
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

- 📌 关键点 1: 第一个要点内容
- 📌 关键点 2: 第二个要点内容
- 📌 关键点 3: 第三个要点内容

## 生活化例子

### 例 1: 实际应用示例
这是第一个生活中的例子...

### 例 2: 另一个应用
这是第二个常见的例子...

## 相关概念

${item.related_concepts?.length > 0 ? item.related_concepts.map((c) => `- [[${c}]]`).join("\n") : "- 暂无相关概念"}

## 有趣的补充知识 💡

- 🌟 有趣冷知识 1: 相关的有趣事实
- 🌟 有趣冷知识 2: 另一个有趣发现

## 练习题

**理解检测**:
- 你能用自己的话解释这个概念吗？
- 在生活中你见过什么类似的例子？
- 为什么这个知识点很重要？

---

**下次复习推荐**: 明天  
**学习提示**: 坚持学习，每天进步一点点！ 🚀
`;
}
const GET = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        message: "Generate API - POST to generate content with LLM",
        providers: ["deepseek", "qwen", "glm", "openai"],
        fallback: "Mock content when LLM API not configured"
      },
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
