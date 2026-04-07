# Child Learn System - Copilot Instructions

这是一个为儿童设计的智能学习内容管理系统，集成艾宾浩斯遗忘曲线和 AI 内容生成。

## 项目概述

**目标**: 帮助 6 岁的孩子通过科学的复习方法（艾宾浩斯遗忘曲线）定期复习英语、知识点等学习内容。

**核心流程**:
1. 用户上传原始资料（图片、单词表、语法等）
2. AI 自动扩展生成高质量 Markdown
3. 系统根据艾宾浩斯算法推荐复习内容
4. 导出为 Obsidian 文档 + 可视化知识图谱
5. GitHub 版本控制 + Vercel/Cloudflare 部署

## 技术栈

| 层级 | 技术 |
|------|------|
| 全栈框架 | Astro 6.0 + React 组件 |
| 前端 UI | Tailwind CSS + D3.js / Recharts |
| 后端 | Astro API Routes |
| 数据库 | SQLite（本地） |
| LLM | DeepSeek / Qwen / GLM / OpenAI（可切换） |
| 存储 | 文件系统 + GitHub |
| 部署 | Vercel / Cloudflare Pages |

## 项目结构关键路径

```
src/
├── pages/api/           # API 端点（上传、生成、复习计划、导出）
├── pages/               # 页面（上传、仪表板、复习、导出预览）
├── components/          # React / Astro 组件
├── lib/
│   ├── llm/            # LLM 适配层（提供商切换）
│   ├── spaced-repetition.ts  # 艾宾浩斯算法
│   ├── file-manager.ts       # 文件系统操作
│   ├── markdown-builder.ts   # MD 生成
│   └── obsidian-exporter.ts  # Obsidian 格式转换
└── data/               # 按日期组织的原始资料
```

## 关键约定

### 文件组织
- **原始资料**: `src/data/YYYY-MM-DD/raw/` （图片、文本等）
- **处理元数据**: `src/data/YYYY-MM-DD/processed.json`
- **复习记录**: `src/data/YYYY-MM-DD/review-records.json`
- **生成 MD**: `src/data/YYYY-MM-DD/generated/` （导出的高质量文档）

### 数据模型

**学习项** (Learning Item):
```json
{
  "id": "uuid",
  "date": "2026-04-07",
  "type": "vocabulary|grammar|story|custom",
  "title": "Animals",
  "raw_content": "...",
  "files": ["dog.jpg", "cat.jpg"],
  "generated_md": "...",
  "created_at": "2026-04-07T10:00:00Z",
  "last_reviewed": "2026-04-07T14:00:00Z",
  "review_count": 3,
  "difficulty": "intermediate",
  "next_review": "2026-04-14",
  "review_history": [
    { "date": "2026-04-07", "result": "good" },
    ...
  ]
}
```

### LLM 集成

**提示词路径**: `src/lib/llm/prompts.ts`

**支持的提供商**:
- `deepseek`: DeepSeek API
- `qwen`: Aliyun Qwen API
- `glm`: Zhipu GLM API
- `openai`: OpenAI API

**环境变量**: 
```
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
QWEN_API_KEY=...
GLM_API_KEY=...
OPENAI_API_KEY=...
```

### 艾宾浩斯算法

**复习间隔** (默认值):
```
第1次: 1天
第2次: 3天
第3次: 7天
第4次: 14天
第5次: 30天
```

**难度系数**:
- Easy: 1.2x （间隔延长）
- Good: 1.0x （标准间隔）
- Hard: 0.8x （间隔缩短，需要更频繁复习）

### Obsidian 导出格式

所有导出的 MD 文件应包含：
```markdown
---
tags: [category1, category2]
date: 2026-04-07
difficulty: intermediate
next_review: 2026-04-14
review_count: 3
---

# 标题

[[关联知识点1]] [[关联知识点2]]

## 定义 / 描述
...

## 示例
...

## 扩展资源
...
```

## Build & Test Commands

```bash
# 安装依赖
npm install

# 开发服务器 (http://localhost:3000)
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# TypeScript 检查
npm run astro -- check

# 格式化代码（如有）
npm run format

# 单元测试（待配置）
npm run test
```

## Agent 集成指南

本项目设计为易于被 Agent（如 OpenClaw、Hermes）使用：

1. **API 驱动**: 所有功能通过 RESTful API 暴露
2. **结构化输入/输出**: 使用 JSON 格式便于解析
3. **单一职责**: 每个 API 端点负责一项任务
4. **事件驱动**: 支持 webhook 触发的自动化流程

**典型 Agent 工作流**:
```
Agent 上传资料 → /api/upload → 系统存储
        ↓
Agent 请求生成 → /api/generate → AI 处理 → 返回 MD
        ↓
Agent 查询复习计划 → /api/schedule → 返回推荐列表
        ↓
Agent 导出 → /api/export → Obsidian 文件
```

## 关键决策点

- **本地优先**: 所有数据默认保存到本地文件系统，支持 GitHub 同步
- **多 LLM 支持**: 通过环境变量切换，支持快速迭代和成本优化
- **无服务化**: 可部署到 Vercel/Cloudflare，无需后端服务器
- **隐私友好**: 用户数据完全可控，支持本地离线模式

## 开发优先级

1. **Phase 1** (高优先级): 上传、基础 API、文件存储
2. **Phase 2** (高优先级): LLM 集成、MD 生成
3. **Phase 3** (中优先级): 艾宾浩斯算法、复习推荐
4. **Phase 4** (中优先级): Obsidian 导出、可视化
5. **Phase 5** (低优先级): 部署、Agent 集成优化
