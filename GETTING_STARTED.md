# 🚀 Child Learn System - 快速启动指南

## 系统要求

- Node.js 18+
- npm 或 yarn
- Git (用于版本控制)

## 📦 项目结构

```
child-learn-system/
├── src/
│   ├── pages/                    # Astro 页面
│   │   ├── index.astro          # 首页
│   │   ├── dashboard.astro      # 学习仪表板
│   │   ├── upload.astro         # 上传页面
│   │   ├── review.astro         # 复习页面
│   │   └── api/                 # 7 个 API 端点
│   ├── components/              # React 组件
│   │   ├── Dashboard.tsx
│   │   ├── UploadForm.tsx
│   │   ├── ReviewCard.tsx
│   │   └── ReviewPage.tsx
│   ├── layouts/                 # Astro 布局
│   │   └── Layout.astro
│   ├── lib/                     # 核心库
│   │   ├── types.ts            # TypeScript 类型定义
│   │   ├── spaced-repetition/  # SM-2 算法实现
│   │   ├── llm/                # LLM 适配器
│   │   └── database/           # 数据库层 (SQLite)
│   └── data/                    # 学习数据目录 (自动创建)
│       └── YYYY-MM-DD/
│           ├── learning-items/  # 学习项 JSON
│           ├── reviews/        # 复习记录
│           └── generated/      # AI 生成的 Markdown
├── .github/
│   └── copilot-instructions.md
├── API_DOCUMENTATION.md          # 完整的 API 文档
├── PROJECT_PLAN.md              # 5 阶段开发计划
├── SPACED_REPETITION_ALGORITHM.md # SM-2 算法文档
└── test-api.sh                   # API 测试脚本
```

## 🎯 快速开始

### 1️⃣ 安装依赖

```bash
cd child-learn-system
npm install
```

### 2️⃣ 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

### 3️⃣ 首次访问

打开浏览器访问：
- **首页**: http://localhost:3000
- **仪表板**: http://localhost:3000/dashboard
- **上传**: http://localhost:3000/upload
- **复习**: http://localhost:3000/review

### 4️⃣ 测试 API

```bash
# 运行完整的 API 测试
./test-api.sh
```

或使用 cURL 手动测试：

```bash
# 上传学习资料
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "type": "vocabulary",
    "title": "Animals - Dog",
    "raw_content": "Dog is a domestic animal...",
    "tags": ["animals"],
    "difficulty": "easy",
    "estimated_time": 5
  }'

# 获取推荐
curl http://localhost:3000/api/recommend?limit=10

# 记录复习
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "learning_item_id": "uuid-here",
    "user_feedback": "good",
    "time_spent": 300
  }'
```

## 📚 核心功能

### 1. 上传学习资料
- **支持类型**: 词汇、语法、故事、知识
- **自动 AI 生成**: 上传后自动调用 LLM 生成高质量内容
- **标签系统**: 便于分类和搜索

### 2. 智能复习推荐
- **SM-2 算法**: 优化的间隔重复算法
- **三层优先级**: 
  - 🔴 Critical (掌握度 < 50%)
  - 🟡 Important (掌握度 50-80%)
  - 🟢 Optional (掌握度 >= 80%)

### 3. 学习统计
- 总体学习项数
- 平均掌握度
- 掌握度分布
- 难度分析

### 4. 复习日程
- 30 天复习计划
- 日预估时间
- 复习项计数

## 🔧 环境变量 (可选)

创建 `.env.local` 文件:

```bash
# LLM 提供商选择 (deepseek, qwen, glm, openai)
LLM_PROVIDER=deepseek

# API 密钥 (生产环境需要)
DEEPSEEK_API_KEY=your-api-key
QWEN_API_KEY=your-api-key
GLM_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key

# 可选配置
MAX_UPLOAD_SIZE_MB=50
```

## 📊 数据存储

### 文件系统结构

所有数据存储在 `src/data/` 目录：

```
src/data/
├── 2026-04-07/
│   ├── learning-items/
│   │   └── {uuid}.json          # 学习项元数据
│   ├── reviews/
│   │   └── {uuid}.json          # 复习记录
│   └── generated/
│       └── {uuid}.md            # AI 生成的 Markdown
├── 2026-04-08/
│   └── ...
```

### JSON 格式示例

**学习项**:
```json
{
  "id": "uuid",
  "type": "vocabulary",
  "title": "Animals - Dog",
  "date": "2026-04-07",
  "raw_content": "Dog is a domestic animal...",
  "generated_markdown": "# Animals - Dog\n...",
  "tags": ["animals"],
  "difficulty": "easy",
  "estimated_time": 5,
  "mastery_level": 50,
  "next_review": "2026-04-10",
  "review_history": [...]
}
```

## 🧪 测试端点

所有 7 个 API 端点：

| 方法 | 端点 | 功能 |
|------|------|------|
| POST | `/api/upload` | 上传学习资料 |
| POST | `/api/review` | 记录复习反馈 |
| GET | `/api/recommend` | 获取推荐项 |
| GET | `/api/stats` | 学习统计 |
| GET | `/api/schedule` | 复习日程 |
| POST | `/api/generate` | 生成内容 (AI) |
| POST | `/api/export` | 导出 Obsidian 格式 |

## 🚀 下一步

### Phase 2 完成项
- ✅ 7 个 API 端点
- ✅ SM-2 算法实现
- ✅ 优先级推荐系统

### Phase 3 完成项
- ✅ 完整前端 UI
- ✅ 响应式设计
- ✅ 仪表板、上传、复习页面

### Phase 4 计划项
- 🚧 真实 LLM 集成 (DeepSeek/Qwen/GLM/OpenAI)
- 🚧 数据库层优化 (SQLite 集成)
- 🚧 GitHub 自动备份
- 🚧 多用户支持
- 🚧 知识图谱可视化

## 📝 常见问题

**Q: 如何改变推荐的每日数量?**
A: 编辑 `src/pages/api/recommend.ts`，修改 `DAILY_QUOTA` 配置。

**Q: 数据存储在哪里?**
A: 所有数据存储在 `src/data/` 目录中的 JSON 文件里。

**Q: 支持多个孩子吗?**
A: 当前版本仅支持单个用户。多用户支持在 Phase 4 规划中。

**Q: 可以离线使用吗?**
A: 是的！所有数据存储本地，只有 AI 生成需要网络。

## 🔗 有用的链接

- [API 文档](./API_DOCUMENTATION.md)
- [项目计划](./PROJECT_PLAN.md)
- [SM-2 算法详解](./SPACED_REPETITION_ALGORITHM.md)
- [Astro 文档](https://docs.astro.build)
- [React 文档](https://react.dev)

## 📞 支持

遇到问题？
1. 检查 API 响应中的错误信息
2. 查看浏览器控制台 (F12) 中的错误
3. 运行 `test-api.sh` 进行诊断
4. 检查 `src/data/` 中的数据文件

---

**祝学习愉快！🎓** 

有问题或建议？欢迎反馈！
