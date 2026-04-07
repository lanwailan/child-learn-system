# LLM 提示词策略设计

## 概述

本文档定义 Child Learn System 中 AI 内容生成的提示词框架。目标是通过精心设计的提示词，让 LLM 根据原始学习资料生成**适合儿童学习的高质量扩展文档**。

核心原则：
- **儿童友好**: 语言简洁、例子生动、避免复杂术语
- **结构化**: 输出格式一致，便于后续处理和展示
- **可扩展**: 支持不同内容类型（词汇、语法、故事等）
- **知识图谱友好**: 输出包含关键概念和关联，便于构建知识图谱

---

## 1. 提示词框架设计

### 1.1 提示词组成结构

```
┌─────────────────────────────────┐
│  系统提示词 (System Prompt)      │ ← 定义 AI 的角色和风格
├─────────────────────────────────┤
│  内容类型指导 (Type Guide)       │ ← 针对不同的学习内容类型
├─────────────────────────────────┤
│  格式要求 (Format Spec)         │ ← 输出的 Markdown 结构
├─────────────────────────────────┤
│  输入数据 (User Input)          │ ← 用户上传的原始资料
├─────────────────────────────────┤
│  任务指令 (Task Instruction)    │ ← 具体的生成任务
└─────────────────────────────────┘
```

### 1.2 内容类型分类

根据儿童学习特点，设计 4 种核心内容类型：

| 类型 | 场景 | 输出重点 | 关键元素 |
|------|------|--------|--------|
| **vocabulary** | 英文单词、生词 | 发音、含义、例句、图像化 | 音标、多义词、同义词、反义词 |
| **grammar** | 语法规则、句型 | 规则讲解、对比、练习 | 规则、反例、常见错误、练习题 |
| **story** | 小故事、课文 | 故事复述、词汇提取、道德教育 | 人物、情节、主题、生词表 |
| **knowledge** | 科学常识、历史等 | 概念、联系、趣味事实 | 定义、例子、有趣冷知识、关联概念 |

---

## 2. 系统提示词 (System Prompt)

### 2.1 核心系统提示

```
你是一个专业的儿童教育内容设计师，拥有以下特点：

【角色定义】
- 为 6-12 岁儿童设计学习材料
- 将复杂概念转化为简洁、有趣的内容
- 重视知识的关联性和实用性

【输出原则】
1. **语言简洁**: 使用短句、常用词汇，避免复杂术语
2. **例子丰富**: 每个概念配 3-5 个生活化的例子
3. **视觉友好**: 合理使用标题、列表、分隔线等格式
4. **交互性**: 鼓励思考和练习，包含简单的思考题
5. **知识关联**: 明确标出相关概念，便于扩展学习

【特殊要求】
- 所有 Markdown 格式必须符合 Obsidian 标准
- 关键词用 [[双括号]] 标记，用于知识图谱链接
- 包含难度评估（简单/中等/困难）
- 估计学习时间（以分钟计）
```

### 2.2 针对不同内容类型的系统提示微调

#### 词汇类 (Vocabulary)
```
补充信息：
- 优先提供正确的英文发音指导（用中文描述如何发音）
- 包含词汇的多种用法和搭配
- 提供同义词、反义词、相关词汇
- 用图像化描述帮助记忆（e.g., "想象 dog 在跑步"）
```

#### 语法类 (Grammar)
```
补充信息：
- 用简单的图解或表格说明语法规则
- 提供正确用法和常见错误的对比
- 包含 5 个简单的练习题（带答案）
- 标注这个语法点的实际应用场景
```

#### 故事类 (Story)
```
补充信息：
- 简化或改编故事情节，保留核心信息
- 提取关键人物和事件
- 提供故事中的新词汇表
- 包含故事的寓意或教育意义
- 提出 3 个思考题，启发深度思考
```

#### 知识类 (Knowledge)
```
补充信息：
- 用日常生活的类比解释科学概念
- 包含 3-5 个有趣的冷知识或补充事实
- 明确标出核心概念和衍生概念
- 包含这个知识与其他领域的联系
```

---

## 3. 输出格式规范

### 3.1 通用 Markdown 格式模板

所有生成的内容必须遵循以下结构（用 Markdown frontmatter + 结构化内容）：

```markdown
---
type: vocabulary  # 或 grammar/story/knowledge
title: Animals - Dog
difficulty: easy
estimated_time: 5
tags: [animals, english, vocabulary]
related_concepts: [cat, pet, animal]
---

# {{标题}}

**学习目标**: 学会用英文表达 dog 及其相关知识

## 基础定义

**Dog** /dɔːg/ (中文发音："多格")
- 中文含义：狗
- 词性：名词
- 复数形式：dogs

## 核心特征

- 🐕 是人类的宠物
- 🎾 喜欢玩耍和运动
- 👃 嗅觉很灵敏
- 🦴 喜欢吃骨头

## 生活化例子

### 例1: 早上出门
> My dog is sleeping in bed.（我的狗在床上睡觉）

### 例2: 玩耍时间
> Let's play with the dog!（我们和狗玩吧！）

### 例3: 宠物照顾
> I feed my dog every day.（我每天喂我的狗）

## 相关词汇

- [[cat]] - 猫（宠物对比）
- [[puppy]] - 小狗（幼体）
- [[pet]] - 宠物（概念扩展）
- [[animal]] - 动物（分类扩展）

## 有趣冷知识 💡

- 狗的嗅觉是人类的 1 万到 10 万倍强！
- 狗不是完全色盲，只是看不清红色和绿色
- 狗的听力可以听到人类听不到的声音

## 互动练习

**试试看**：
- [ ] 你能用 "dog" 组成 3 个英文句子吗？
- [ ] 你见过什么颜色的狗？用英文描述它

## 思考题

1. 除了 dog 和 cat，你还知道其他宠物吗？
2. 狗为什么是人类最好的朋友？

---
**学习提示**: 下次复习推荐日期：2026-04-08
```

### 3.2 关键部分详解

#### Frontmatter
```yaml
type: [vocabulary|grammar|story|knowledge]      # 内容类型
title: 标题                                      # 简洁标题
difficulty: [easy|medium|hard]                  # 难度等级
estimated_time: 数字（分钟）                    # 学习时间估计
tags: [标签1, 标签2]                            # 分类标签
related_concepts: [概念1, 概念2]               # 相关概念
```

#### 使用 [[Wikilinks]] 的规则
- **内部链接**: 所有相关的学习概念都用 `[[概念名]]` 标记
- **自动图谱生成**: 系统会自动识别这些链接，构建知识图谱
- **导出友好**: Obsidian 会自动识别这些链接

---

## 4. 针对不同内容类型的详细提示词

### 4.1 词汇类 - 完整提示词示例

```
【任务】: 基于用户提供的原始词汇信息，生成适合儿童学习的英文单词学习卡片

【输入信息】:
- 原始词汇: {{raw_word}}
- 用户提供的上下文: {{user_context}}
- 目标难度: {{difficulty}}

【生成任务】:
1. 提供清晰的发音指导（用中文描述英文发音方式）
2. 列举 3-5 个生活化的例句
3. 提供同义词、反义词、相关词汇（3-5 个）
4. 用视觉化描述或故事帮助记忆
5. 包含 2-3 个有趣的语言事实
6. 提供练习建议（如何在日常生活中使用这个词）

【格式要求】:
- 遵循前面的 Markdown 模板
- 使用 [[]] 标记所有相关概念
- 包含 Frontmatter 信息
- 估计学习时间：3-10 分钟

【输出语言】: 中文（解释）+ 英文（例句和词汇）
```

### 4.2 语法类 - 完整提示词示例

```
【任务】: 基于语法规则，生成适合儿童学习的语法讲解卡片

【输入信息】:
- 语法规则: {{grammar_rule}}
- 难度级别: {{difficulty}}
- 用户提供的例子: {{user_examples}}

【生成任务】:
1. 用简单的文字解释语法规则（不超过 50 字）
2. 用表格对比正确用法 vs 常见错误（3-5 组）
3. 提供 5-8 个简单例句，分别展示不同的用法
4. 包含这个语法的实际应用场景（日常会话）
5. 设计 5 个练习题（带标准答案）
6. 提供记忆技巧或口诀

【格式要求】:
- 遵循前面的 Markdown 模板
- 使用表格展示对比
- 使用代码块或引用块展示正确/错误示例
- 估计学习时间：5-15 分钟

【输出语言】: 中文（解释）+ 英文（例句和练习）
```

### 4.3 故事类 - 完整提示词示例

```
【任务】: 基于故事，生成适合儿童学习和阅读的故事学习卡片

【输入信息】:
- 原始故事或故事描述: {{story_content}}
- 目标年龄段: {{age_range}}
- 学习目标: {{learning_goals}}

【生成任务】:
1. 简化或改编故事，保持核心情节（300-500 字）
2. 提取故事中的关键新词汇（5-10 个）并给出翻译和音标
3. 提取关键人物和事件，用简洁的方式描述
4. 解释故事的寓意或教育意义
5. 提出 3-5 个思考题，引导深度理解
6. 提供声音表演建议（如何有表情地读这个故事）

【格式要求】:
- 遵循前面的 Markdown 模板
- 词汇表用列表呈现
- 思考题用 > 引用块呈现
- 估计学习时间：10-20 分钟

【输出语言】: 中文（解释）+ 英文（故事和词汇）
```

### 4.4 知识类 - 完整提示词示例

```
【任务】: 基于知识点，生成适合儿童学习的科普卡片

【输入信息】:
- 知识主题: {{topic}}
- 原始资料/信息: {{raw_content}}
- 难度等级: {{difficulty}}

【生成任务】:
1. 用 2-3 个日常类比解释核心概念
2. 分点讲解知识要点（5-8 个关键点）
3. 包含 5-10 个有趣的补充事实或冷知识
4. 绘制概念关系图（用 ASCII 或 Markdown 表格）
5. 提供 3-4 个小实验或观察建议
6. 标注相关的历史背景或文化背景

【格式要求】:
- 遵循前面的 Markdown 模板
- 使用 [[]] 标记所有关联的其他概念
- 包含视觉化元素（如表格、列表、ASCII 图）
- 估计学习时间：10-20 分钟

【输出语言】: 中文（解释和例子）
```

---

## 5. LLM API 调用流程

### 5.1 调用伪代码

```typescript
async function generateContent(
  rawInput: RawLearningMaterial,
  contentType: ContentType,
  difficulty: Difficulty,
  llmProvider: LLMProvider
): Promise<GeneratedMarkdown> {
  
  // 1. 构建完整的提示词
  const systemPrompt = getSystemPrompt(contentType);
  const typeGuide = getTypeGuide(contentType);
  const formatSpec = getFormatSpec();
  
  const fullPrompt = `
${systemPrompt}

${typeGuide}

${formatSpec}

【用户输入】:
${JSON.stringify(rawInput, null, 2)}

【生成任务】:
基于上述信息，生成高质量的学习卡片...
  `;
  
  // 2. 调用 LLM
  const response = await callLLM(llmProvider, {
    system: systemPrompt,
    user: fullPrompt,
    temperature: 0.7,  // 创意和准确的平衡
    max_tokens: 2000,
  });
  
  // 3. 解析和验证输出
  const markdown = response.content;
  validateMarkdownFormat(markdown);
  
  // 4. 保存到文件系统
  await saveToFile(markdown, rawInput.date, rawInput.id);
  
  return markdown;
}
```

### 5.2 错误处理和重试逻辑

```typescript
// 如果生成的 Markdown 格式不符合要求，自动重试
async function generateContentWithRetry(
  rawInput: RawLearningMaterial,
  contentType: ContentType,
  maxRetries: number = 3
): Promise<GeneratedMarkdown> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateContent(rawInput, contentType);
      
      // 验证 Markdown 格式
      if (validateMarkdownFormat(result)) {
        return result;
      }
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Attempt ${attempt} failed, retrying...`);
    }
  }
}
```

---

## 6. 提示词优化策略

### 6.1 测试和改进流程

1. **收集样本**: 收集 10 个真实的学习输入
2. **批量生成**: 用初版提示词生成内容
3. **人工评估**: 根据以下维度评分
   - 内容准确性 (Accuracy)
   - 儿童友好度 (Child-friendliness)
   - 结构清晰度 (Clarity)
   - 关联完整性 (Relatedness)
4. **迭代改进**: 根据反馈调整提示词
5. **A/B 对比**: 用不同提示词生成，对比质量

### 6.2 提示词版本管理

```
prompts/
├── vocabulary/
│   ├── v1.0.txt  # 初版
│   ├── v1.1.txt  # 优化版
│   └── v2.0.txt  # 大改进
├── grammar/
├── story/
└── knowledge/
```

在代码中支持版本切换：
```typescript
const systemPrompt = getSystemPrompt(contentType, version: "v2.0");
```

---

## 7. 成本和性能考量

### 7.1 Token 使用优化

| 内容类型 | 平均输入 Tokens | 平均输出 Tokens | 总计 |
|--------|--------------|--------------|------|
| vocabulary | 300 | 800 | 1100 |
| grammar | 400 | 1200 | 1600 |
| story | 800 | 1500 | 2300 |
| knowledge | 600 | 1400 | 2000 |

**成本示例**（按 DeepSeek 价格计算）:
- 每个词汇: ~¥0.003
- 每个语法: ~¥0.005
- 每个故事: ~¥0.008
- 每个知识点: ~¥0.007

### 7.2 缓存策略

- 对于重复的输入，使用缓存避免重复调用
- 建立常见词汇库和语法库，减少 LLM 调用

---

## 8. 提示词文件结构

```
src/lib/llm/prompts/
├── system/
│   ├── base.ts           # 基础系统提示
│   ├── vocabulary.ts     # 词汇类微调
│   ├── grammar.ts        # 语法类微调
│   ├── story.ts          # 故事类微调
│   └── knowledge.ts      # 知识类微调
├── formats/
│   ├── markdown.ts       # Markdown 格式规范
│   └── obsidian.ts       # Obsidian 特定格式
├── examples/
│   ├── vocabulary-example.md
│   ├── grammar-example.md
│   ├── story-example.md
│   └── knowledge-example.md
└── index.ts              # 提示词导出和版本管理
```

---

## 总结

这个提示词框架的关键特点：
✅ **儿童友好**: 语言简洁、例子生动
✅ **结构化**: 一致的输出格式，易于处理
✅ **知识图谱就绪**: 使用 [[]] 标记便于自动链接
✅ **可扩展**: 支持多种内容类型和难度等级
✅ **成本优化**: Token 使用预估和缓存策略
✅ **版本管理**: 支持提示词迭代和改进
