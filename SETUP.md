# Child Learn System - Development Setup

项目已初始化！

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

服务器将运行在 http://0.0.0.0:3000

### 3. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── pages/                  # 页面和 API 端点
│   ├── index.astro        # 主页
│   └── api/               # API 路由
│       └── health.ts      # 健康检查端点
├── components/            # React 组件
├── lib/
│   ├── types.ts           # 类型定义
│   ├── spaced-repetition/ # 艾宾浩斯算法
│   └── llm/               # LLM 集成
├── styles/                # CSS 样式
└── data/                  # 按日期组织的数据
```

## 下一步

1. 实现数据库初始化脚本
2. 实现 LLM 适配器（DeepSeek, Qwen, GLM, OpenAI）
3. 实现 API 端点
4. 实现前端页面
5. 配置 GitHub 备份和部署

参考文档：
- `PROJECT_PLAN.md` - 整体规划
- `DATA_MODEL_DESIGN.md` - 数据模型
- `LLM_PROMPTS_STRATEGY.md` - LLM 提示词
- `SPACED_REPETITION_ALGORITHM.md` - 算法实现
- `.github/copilot-instructions.md` - 项目指导
