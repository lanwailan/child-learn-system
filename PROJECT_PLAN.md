# Child Learn System - 项目规划

## 项目愿景
为 6 岁的孩子打造一个**智能学习内容管理系统**，集成艾宾浩斯遗忘曲线，帮助定期复习英语、知识点等学习内容。

## 核心功能流程

```
1. 用户输入 → 原始资料（图片、单词表、语法内容）
                  ↓
2. AI 扩展   → 基于艾宾浩斯提示复习 → 生成高质量 MD
                  ↓
3. 知识管理   → Obsidian 文档 + 可视化展示（LLM-Wiki 风格）
                  ↓
4. 存储备份   → GitHub 版本控制 + 本地文件系统
                  ↓
5. 云端部署   → Vercel/Cloudflare 部署 + Agent 集成
```

## 技术栈

### 前端 + 后端
- **框架**: Astro 全栈
- **前端 UI**: React 组件（Astro 集成）
- **样式**: Tailwind CSS
- **数据可视化**: D3.js / Recharts（知识点关联图）

### 存储
- **本地**: 文件系统（按日期组织的 JSON/MD）
- **数据库**: SQLite（学习进度、复习记录）
- **版本控制**: Git + GitHub

### AI 集成
- **支持多 LLM API**: DeepSeek, Qwen, GLM, OpenAI
- **提示词管理**: 统一的 prompts 系统
- **内容生成**: MD 文档、知识点扩展、复习建议

### 部署
- **平台**: Vercel / Cloudflare Pages
- **环境**: 支持本地开发 + 云端部署
- **Agent 集成**: 兼容 OpenClaw / Hermes 等 Agent

---

## 项目结构（初步设计）

```
child-learn-system/
├── src/
│   ├── components/
│   │   ├── ContentUploader.astro      # 内容上传组件
│   │   ├── MarkdownPreview.astro      # MD 预览
│   │   ├── KnowledgeGraph.astro       # 知识图谱可视化
│   │   └── ReviewPlanner.astro        # 复习规划器
│   ├── pages/
│   │   ├── index.astro                # 主页
│   │   ├── dashboard.astro            # 学习仪表板
│   │   ├── upload.astro               # 上传页面
│   │   ├── review.astro               # 复习推荐
│   │   └── api/
│   │       ├── generate.ts            # AI 生成 API
│   │       ├── upload.ts              # 文件上传 API
│   │       ├── schedule.ts            # 复习日程 API
│   │       └── export.ts              # 导出 Obsidian API
│   ├── lib/
│   │   ├── llm/                       # LLM 适配层
│   │   │   ├── providers.ts           # DeepSeek, Qwen, GLM 等
│   │   │   ├── prompts.ts             # 提示词模板
│   │   │   └── index.ts               # 统一接口
│   │   ├── spaced-repetition.ts       # 艾宾浩斯算法
│   │   ├── file-manager.ts            # 文件系统操作
│   │   ├── markdown-builder.ts        # MD 文档生成
│   │   └── obsidian-exporter.ts       # Obsidian 导出
│   ├── data/                          # 原始资料目录
│   │   ├── 2026-04-07/               # 按日期组织
│   │   │   ├── raw/                  # 原始输入（图片、文本）
│   │   │   ├── processed.json        # 处理后的元数据
│   │   │   └── review-records.json   # 复习记录
│   │   └── ...
│   └── assets/
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
└── docs/
    ├── ARCHITECTURE.md               # 架构文档
    ├── API_SPEC.md                   # API 规范
    ├── LLM_INTEGRATION.md            # LLM 集成指南
    └── DEVELOPMENT.md                # 开发指南
```

---

## 核心模块详细设计

### 1. 内容上传模块
**功能**:
- 上传图片、文本、PDF
- 自动按日期保存
- 生成原始资料 JSON 元数据

**输入**: 图片、单词表、语法内容
**输出**: 结构化元数据 + 本地文件

**数据结构示例**:
```json
{
  "id": "uuid",
  "date": "2026-04-07",
  "type": "vocabulary",
  "title": "Animals",
  "raw_content": "Dog, Cat, Bird...",
  "files": ["dog.jpg", "cat.jpg"],
  "created_at": "2026-04-07T10:00:00Z",
  "last_reviewed": null,
  "review_count": 0,
  "review_history": []
}
```

### 2. AI 内容生成模块
**功能**:
- 接收原始资料
- 调用多 LLM API
- 生成高质量 MD 文档（包含扩展知识、例句、发音等）

**提示词策略**:
- 针对不同内容类型（词汇、语法、故事）的不同提示
- 参考 LLM-Wiki 的结构化方式
- 输出格式规范化（标题、定义、例子、关联等）

**输出**: 高质量 MD 文件 + 知识点元数据

### 3. 艾宾浩斯遗忘曲线模块
**功能**:
- 追踪每个学习项的复习历史
- 根据遗忘曲线计算下次复习时间
- 推荐今天应该复习什么

**核心算法**:
```
复习间隔 = 基础间隔 × 难度系数 × 用户记忆力因子
下次复习时间 = 上次复习 + 复习间隔

初始间隔: [1, 3, 7, 14, 30] 天
用户可标记难度: Easy(1.2x), Good(1.0x), Hard(0.8x)
```

**输出**: 
- 今日推荐复习列表
- 复习日程表
- 学习进度统计

### 4. Obsidian 导出模块
**功能**:
- 将生成的 MD 转换为 Obsidian 格式
- 支持双向链接 (Wikilinks)
- 包含前置事项 (Frontmatter)
- 导出为 .zip 文件

**Obsidian 格式特性**:
```markdown
---
tags: [vocabulary, english, animals]
date: 2026-04-07
difficulty: intermediate
next_review: 2026-04-14
---

# Animals

[[related_topic_1]] [[related_topic_2]]

## Definition
...

## Examples
...
```

### 5. 可视化知识图谱模块
**功能**:
- 展示所有学习项的关联关系
- 标记复习状态（已掌握、复习中、需要重点复习）
- 交互式探索

**参考**: Karpathy 的 LLM-Wiki 知识图结构

---

## 开发阶段

### Phase 1: 核心基础（2-3 周）
- [ ] 项目初始化 + Astro 配置
- [ ] 文件系统 + SQLite 集成
- [ ] 上传页面 UI
- [ ] 基础 API 端点

### Phase 2: AI 集成（2 周）
- [ ] LLM 适配层（支持多个提供商）
- [ ] 提示词优化
- [ ] MD 生成逻辑
- [ ] 生成预览页面

### Phase 3: 核心算法（1-2 周）
- [ ] 艾宾浩斯算法实现
- [ ] 复习推荐系统
- [ ] 学习进度仪表板

### Phase 4: 导出 & 可视化（1-2 周）
- [ ] Obsidian 导出功能
- [ ] 知识图谱可视化
- [ ] 复习日程展示

### Phase 5: 部署 & Agent 集成（1 周）
- [ ] Vercel/Cloudflare 部署
- [ ] GitHub 自动同步
- [ ] Agent 接口设计
- [ ] 环境配置优化

---

## 关键技术决策

| 方面 | 选择 | 原因 |
|------|------|------|
| 全栈框架 | Astro | 已有经验，支持静态 + 服务端 |
| 前端组件 | React in Astro | 交互丰富，生态成熟 |
| 样式 | Tailwind CSS | 快速开发，与 Astro 配合好 |
| 数据库 | SQLite | 轻量、无服务依赖、易于迁移 |
| LLM | 多厂商支持 | 灵活性高、成本可控 |
| 部署 | Vercel + GitHub | 开箱即用、自动部署 |

---

## 下一步行动
- [ ] 确认技术栈细节
- [ ] 创建项目初始化脚本
- [ ] 设计数据模型
- [ ] 创建核心 API 规范
- [ ] 准备 LLM 提示词库
