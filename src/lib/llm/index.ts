/**
 * LLM 适配器框架 - 支持多个 LLM 提供商
 * 支持: DeepSeek, Qwen, GLM, OpenAI
 */

interface LLMConfig {
  provider: 'deepseek' | 'qwen' | 'glm' | 'openai';
  apiKey: string;
  model: string;
  baseUrl?: string;
  timeout?: number;
}

interface GenerateRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 从环境变量读取配置
function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || 'deepseek') as any;
  
  const configs: Record<string, LLMConfig> = {
    deepseek: {
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com/v1',
    },
    qwen: {
      provider: 'qwen',
      apiKey: process.env.QWEN_API_KEY || '',
      model: process.env.QWEN_MODEL || 'qwen-max',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible/openai/v1',
    },
    glm: {
      provider: 'glm',
      apiKey: process.env.GLM_API_KEY || '',
      model: process.env.GLM_MODEL || 'glm-4',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    },
    openai: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      baseUrl: 'https://api.openai.com/v1',
    },
  };
  
  return configs[provider] || configs.deepseek;
}

// DeepSeek 适配器
async function generateWithDeepSeek(config: LLMConfig, request: GenerateRequest): Promise<GenerateResponse> {
  if (!config.apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    }),
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
      totalTokens: data.usage.total_tokens,
    },
  };
}

// Qwen 适配器 (兼容 OpenAI API)
async function generateWithQwen(config: LLMConfig, request: GenerateRequest): Promise<GenerateResponse> {
  if (!config.apiKey) {
    throw new Error('QWEN_API_KEY not configured');
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    }),
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
      totalTokens: data.usage.total_tokens,
    },
  };
}

// GLM 适配器
async function generateWithGLM(config: LLMConfig, request: GenerateRequest): Promise<GenerateResponse> {
  if (!config.apiKey) {
    throw new Error('GLM_API_KEY not configured');
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    }),
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
      totalTokens: data.usage.total_tokens,
    },
  };
}

// OpenAI 适配器
async function generateWithOpenAI(config: LLMConfig, request: GenerateRequest): Promise<GenerateResponse> {
  if (!config.apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    }),
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
      totalTokens: data.usage.total_tokens,
    },
  };
}

// 主入口 - 根据配置选择适配器
export async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  const config = getLLMConfig();

  console.log(`[LLM] Using provider: ${config.provider}, model: ${config.model}`);

  switch (config.provider) {
    case 'deepseek':
      return generateWithDeepSeek(config, request);
    case 'qwen':
      return generateWithQwen(config, request);
    case 'glm':
      return generateWithGLM(config, request);
    case 'openai':
      return generateWithOpenAI(config, request);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}

// 导出工具函数
export function getLLMAdapter() {
  return getLLMConfig();
}

export type { GenerateRequest, GenerateResponse, LLMConfig };
