// LLM 提供商类型定义和工厂函数

export type LLMProvider = 'deepseek' | 'qwen' | 'glm' | 'openai';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export interface LLMRequest {
  system: string;
  user: string;
  temperature?: number;
  max_tokens?: number;
}

export interface LLMResponse {
  content: string;
  tokens_used: number;
  model: string;
}

// LLM 接口
export interface LLMAdapter {
  generate(request: LLMRequest): Promise<LLMResponse>;
  getProvider(): LLMProvider;
}

// 获取 LLM 适配器的工厂函数
export function getLLMAdapter(config: LLMConfig): LLMAdapter {
  switch (config.provider) {
    case 'deepseek':
      return new DeepSeekAdapter(config);
    case 'qwen':
      return new QwenAdapter(config);
    case 'glm':
      return new GLMAdapter(config);
    case 'openai':
      return new OpenAIAdapter(config);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}

// DeepSeek 适配器
class DeepSeekAdapter implements LLMAdapter {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = {
      ...config,
      baseURL: config.baseURL || 'https://api.deepseek.com/v1',
      model: config.model || 'deepseek-chat',
    };
  }
  
  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 实现 DeepSeek API 调用
    throw new Error('DeepSeek adapter not yet implemented');
  }
  
  getProvider(): LLMProvider {
    return 'deepseek';
  }
}

// Qwen 适配器
class QwenAdapter implements LLMAdapter {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = {
      ...config,
      baseURL: config.baseURL || 'https://dashscope.aliyuncs.com/api/v1',
      model: config.model || 'qwen-turbo',
    };
  }
  
  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 实现 Qwen API 调用
    throw new Error('Qwen adapter not yet implemented');
  }
  
  getProvider(): LLMProvider {
    return 'qwen';
  }
}

// GLM 适配器
class GLMAdapter implements LLMAdapter {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = {
      ...config,
      baseURL: config.baseURL || 'https://open.bigmodel.cn/api/paas/v4',
      model: config.model || 'glm-4-plus',
    };
  }
  
  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 实现 GLM API 调用
    throw new Error('GLM adapter not yet implemented');
  }
  
  getProvider(): LLMProvider {
    return 'glm';
  }
}

// OpenAI 适配器
class OpenAIAdapter implements LLMAdapter {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = {
      ...config,
      baseURL: config.baseURL || 'https://api.openai.com/v1',
      model: config.model || 'gpt-4',
    };
  }
  
  async generate(request: LLMRequest): Promise<LLMResponse> {
    // TODO: 实现 OpenAI API 调用
    throw new Error('OpenAI adapter not yet implemented');
  }
  
  getProvider(): LLMProvider {
    return 'openai';
  }
}
