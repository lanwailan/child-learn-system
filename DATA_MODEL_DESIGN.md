# 数据模型设计

## 概述

本文档定义 Child Learn System 的核心数据模型，包括：
- **学习项** (Learning Item) - 核心数据单元
- **复习记录** (Review Record) - 学习进度追踪
- **用户进度** (User Progress) - 长期学习统计
- **知识图谱** (Knowledge Graph) - 概念关联

所有数据同时存储在：
1. **文件系统** (JSON 文件) - 用于版本控制和备份
2. **SQLite** (本地数据库) - 用于快速查询和分析

---

## 1. 核心数据模型

### 1.1 学习项 (LearningItem)

学习项是系统的核心数据单元，代表一条学习内容。

```typescript
interface LearningItem {
  // 标识信息
  id: string;                    // UUID，全局唯一
  date: string;                  // 创建日期 (YYYY-MM-DD)
  
  // 内容信息
  type: ContentType;             // vocabulary|grammar|story|knowledge
  title: string;                 // 学习项标题，例如 "Animals - Dog"
  description?: string;          // 简短描述
  
  // 原始资料
  raw_content: string;           // 原始输入文本
  raw_files?: string[];          // 上传的文件名列表 (图片、PDF 等)
  raw_file_paths?: string[];     // 完整文件路径
  
  // AI 生成的内容
  generated_markdown: string;    // 生成的高质量 Markdown
  generated_at: string;          // 生成时间 (ISO 8601)
  llm_provider: string;          // 使用的 LLM 提供商 (deepseek|qwen|glm|openai)
  llm_version?: string;          // 提示词版本
  
  // 元数据
  tags: string[];                // 标签，例如 ['animals', 'english', 'vocabulary']
  difficulty: Difficulty;        // easy|medium|hard
  estimated_time: number;        // 估计学习时间（分钟）
  related_concepts: string[];    // 关联概念 (用于知识图谱)
  
  // 学习进度
  created_at: string;            // 创建时间
  last_reviewed?: string;        // 上次复习时间
  next_review?: string;          // 下次复习建议时间
  review_count: number;          // 总复习次数
  difficulty_self_assessment: Difficulty;  // 用户自评难度
  
  // 复习历史
  review_history: ReviewRecord[];
  
  // 统计信息
  mastery_level: number;         // 掌握程度 0-100
  mastery_trend?: 'improving'|'stable'|'declining';
  
  // Obsidian 相关
  obsidian_slug?: string;        // Obsidian 文件名 slug
  obsidian_exported_at?: string; // 最后导出时间
}

type ContentType = 'vocabulary' | 'grammar' | 'story' | 'knowledge';
type Difficulty = 'easy' | 'medium' | 'hard';
```

**数据库对应表**:
```sql
CREATE TABLE learning_items (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  raw_content TEXT,
  generated_markdown TEXT,
  generated_at TEXT,
  llm_provider TEXT,
  tags TEXT,  -- JSON 数组序列化
  difficulty TEXT,
  estimated_time INTEGER,
  related_concepts TEXT,  -- JSON 数组序列化
  created_at TEXT NOT NULL,
  last_reviewed TEXT,
  next_review TEXT,
  review_count INTEGER DEFAULT 0,
  difficulty_self_assessment TEXT,
  mastery_level INTEGER DEFAULT 0,
  mastery_trend TEXT,
  obsidian_slug TEXT,
  obsidian_exported_at TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_date ON learning_items(date);
CREATE INDEX idx_type ON learning_items(type);
CREATE INDEX idx_difficulty ON learning_items(difficulty);
CREATE INDEX idx_next_review ON learning_items(next_review);
```

**文件系统对应路径**:
```
src/data/
├── 2026-04-07/
│   ├── learning-items/
│   │   ├── uuid1.json          # 完整的学习项数据
│   │   ├── uuid2.json
│   │   └── ...
│   ├── raw/                    # 原始上传文件
│   │   ├── uuid1/
│   │   │   ├── dog.jpg
│   │   │   └── vocab-list.txt
│   │   └── ...
│   └── generated/              # 生成的 Markdown 文件
│       ├── uuid1.md
│       └── ...
└── ...
```

---

### 1.2 复习记录 (ReviewRecord)

每次复习都会生成一条记录，用于跟踪学习进度。

```typescript
interface ReviewRecord {
  id: string;                    // UUID
  learning_item_id: string;      // 关联的学习项 ID
  reviewed_at: string;           // 复习时间 (ISO 8601)
  
  // 复习信息
  review_type: 'initial'|'practice'|'review'|'test';
  
  // 用户反馈
  user_feedback: 'easy'|'good'|'hard';  // 用户标记的难度
  comprehension_level: number;   // 理解程度 0-100
  
  // 时间追踪
  time_spent: number;            // 实际花费时间（秒）
  
  // 算法输入
  algorithm_result?: {
    next_interval_days: number;  // 下次复习间隔（天）
    repetition_number: number;   // 第几次复习
    easiness_factor: number;     // SM-2 算法的易度因子 (1.3-2.5)
    next_review_date: string;    // 计算出的下次复习日期
  };
  
  // 可选的笔记
  notes?: string;
}
```

**数据库对应表**:
```sql
CREATE TABLE review_records (
  id TEXT PRIMARY KEY,
  learning_item_id TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  review_type TEXT NOT NULL,
  user_feedback TEXT,
  comprehension_level INTEGER,
  time_spent INTEGER,
  algorithm_result TEXT,  -- JSON 序列化
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (learning_item_id) REFERENCES learning_items(id)
);

CREATE INDEX idx_learning_item ON review_records(learning_item_id);
CREATE INDEX idx_reviewed_at ON review_records(reviewed_at);
```

---

### 1.3 用户进度 (UserProgress)

追踪用户的长期学习统计。

```typescript
interface UserProgress {
  // 时间范围
  date: string;                  // 统计日期 (YYYY-MM-DD)
  
  // 学习统计
  total_items: number;           // 总学习项数
  items_by_type: {
    vocabulary: number;
    grammar: number;
    story: number;
    knowledge: number;
  };
  
  // 复习统计
  total_reviews: number;         // 总复习次数
  reviews_today: number;         // 今天的复习次数
  time_spent_today: number;      // 今天花费的时间（秒）
  
  // 掌握情况
  mastery_stats: {
    avg_mastery: number;         // 平均掌握度
    items_mastered: number;      // 完全掌握的项数 (掌握度 >= 90)
    items_learning: number;      // 学习中的项数 (50 <= 掌握度 < 90)
    items_struggling: number;    // 需要加强的项数 (掌握度 < 50)
  };
  
  // 趋势
  weekly_review_count?: number[];       // 过去 7 天的复习次数
  weekly_avg_comprehension?: number[];  // 过去 7 天的平均理解度
  
  // 推荐信息
  recommended_review_count: number;    // 建议今天复习的项数
  recommended_items: string[];         // 建议复习的项 ID 列表
}
```

**数据库对应表**:
```sql
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  total_items INTEGER,
  items_by_type TEXT,  -- JSON 序列化
  total_reviews INTEGER,
  reviews_today INTEGER,
  time_spent_today INTEGER,
  mastery_stats TEXT,  -- JSON 序列化
  weekly_review_count TEXT,  -- JSON 数组序列化
  weekly_avg_comprehension TEXT,  -- JSON 数组序列化
  recommended_review_count INTEGER,
  recommended_items TEXT,  -- JSON 数组序列化
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_date ON user_progress(date);
```

---

### 1.4 知识图谱关联 (KnowledgeGraphEdge)

定义学习项之间的关联关系，用于构建知识图谱。

```typescript
interface KnowledgeGraphEdge {
  id: string;                    // UUID
  source_item_id: string;        // 源学习项 ID
  target_item_id: string;        // 目标学习项 ID
  
  // 关系类型
  relation_type: RelationType;
  
  // 权重（用于可视化）
  weight: number;                // 1-10，表示关系强度
  
  // 元数据
  created_at: string;
  is_manual: boolean;            // 是否由用户手动创建
}

type RelationType = 
  | 'synonym'           // 同义词关系
  | 'antonym'           // 反义词关系
  | 'related'           // 相关概念
  | 'prerequisite'      // 前置知识
  | 'extends'           // 扩展知识
  | 'example'           // 例子关系
  | 'category'          // 分类关系
  | 'custom';           // 自定义关系
```

**数据库对应表**:
```sql
CREATE TABLE knowledge_graph_edges (
  id TEXT PRIMARY KEY,
  source_item_id TEXT NOT NULL,
  target_item_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  weight INTEGER DEFAULT 5,
  created_at TEXT NOT NULL,
  is_manual BOOLEAN DEFAULT 0,
  FOREIGN KEY (source_item_id) REFERENCES learning_items(id),
  FOREIGN KEY (target_item_id) REFERENCES learning_items(id)
);

CREATE INDEX idx_source ON knowledge_graph_edges(source_item_id);
CREATE INDEX idx_target ON knowledge_graph_edges(target_item_id);
```

**自动生成规则**:
- 当 LLM 生成的 Markdown 中包含 `[[概念名]]` 时，自动创建 `related` 关系
- 当用户标记 `related_concepts` 时，自动创建相应的边

---

## 2. 数据流和同步策略

### 2.1 数据流图

```
┌─────────────────────────────────────────────┐
│  用户上传 (图片、文本、PDF)                   │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  1. 保存原始文件到 src/data/YYYY-MM-DD/raw/  │
│  2. 创建学习项元数据 JSON                     │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  调用 LLM API 生成高质量 Markdown             │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  1. 保存 Markdown 文件                       │
│  2. 更新学习项的 generated_markdown 字段      │
│  3. 解析 [[]] 链接，创建知识图谱边            │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  同步到 SQLite 数据库                        │
│  （用于快速查询和推荐）                      │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  用户复习 → 记录复习数据                      │
│  艾宾浩斯算法计算下次复习时间                 │
│  更新掌握度和推荐列表                        │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  定期导出 Obsidian 文档                      │
│  推送到 GitHub                              │
└─────────────────────────────────────────────┘
```

### 2.2 文件系统和数据库的同步

**同步策略**:
1. **文件系统为主**: 所有数据优先写入 JSON 文件（便于版本控制）
2. **数据库为索引**: SQLite 保存标准化数据，用于快速查询
3. **定期同步**: 每 5 分钟进行一次 FS → DB 的单向同步
4. **冲突处理**: 以文件系统为准，如果发现不一致，重新同步

```typescript
// 同步函数伪代码
async function syncFileSystemToDatabase() {
  // 1. 读取所有 JSON 文件
  const files = await readAllJsonFiles('src/data');
  
  // 2. 逐个同步到数据库
  for (const file of files) {
    const learningItem = JSON.parse(file.content);
    
    // 检查数据库中是否存在
    const existing = await db.getLearningItem(learningItem.id);
    
    if (!existing) {
      // 插入新记录
      await db.insertLearningItem(learningItem);
    } else if (file.mtime > existing.updated_at) {
      // 更新旧记录
      await db.updateLearningItem(learningItem);
    }
  }
}
```

---

## 3. 艾宾浩斯算法的数据结构

### 3.1 SM-2 算法状态

```typescript
interface SM2State {
  repetition_number: number;     // 第几次复习
  easiness_factor: number;       // 易度因子 EF (1.3 - 2.5)
  interval: number;              // 复习间隔（天数）
  last_review: string;           // 最后复习日期
  next_review: string;           // 下次复习日期
  quality: number;               // 前次复习的质量评分 (0-5)
}

// 初始状态
const initialSM2State: SM2State = {
  repetition_number: 0,
  easiness_factor: 2.5,
  interval: 0,
  last_review: new Date().toISOString(),
  next_review: new Date().toISOString(),
  quality: 0,
};
```

### 3.2 质量评分到用户反馈的映射

```
用户反馈     →  质量评分  →  算法结果
─────────────────────────────────────
easy (完全掌握)  →  5      →  延长间隔 × 1.2
good (掌握)      →  4      →  标准间隔
hard (需努力)    →  2      →  缩短间隔 × 0.8
```

---

## 4. 数据导出和备份

### 4.1 Obsidian 导出

```typescript
interface ObsidianExport {
  exported_at: string;
  export_format: 'zip' | 'folder';
  items_count: number;
  
  // 导出结构
  structure: {
    base_folder: string;        // 例如 "Children Learning Materials"
    folders: {
      [type: string]: string;   // 例如 { "vocabulary": "01-Vocabulary" }
    };
    create_index: boolean;       // 是否创建索引文件
    create_graph: boolean;       // 是否生成知识图谱视图
  };
  
  // 文件列表
  files: {
    path: string;               // 相对路径
    content: string;            // 文件内容（已转换为 Obsidian 格式）
  }[];
}
```

### 4.2 GitHub 备份

```typescript
interface GitHubBackup {
  repository: string;           // 例如 "user/child-learn-system-data"
  branch: string;               // 例如 "main"
  last_pushed_at: string;
  
  // 提交信息
  commit: {
    message: string;            // 自动生成的提交信息
    author: string;             // 例如 "Child Learn System Bot"
    timestamp: string;
  };
  
  // 同步策略
  auto_sync: {
    enabled: boolean;
    interval_minutes: number;   // 例如 60 分钟
    on_new_item: boolean;       // 新项创建时立即同步
  };
}
```

---

## 5. 数据库初始化脚本

```sql
-- learning_items 表
CREATE TABLE IF NOT EXISTS learning_items (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  raw_content TEXT,
  generated_markdown TEXT,
  generated_at TEXT,
  llm_provider TEXT,
  tags TEXT,
  difficulty TEXT,
  estimated_time INTEGER,
  related_concepts TEXT,
  created_at TEXT NOT NULL,
  last_reviewed TEXT,
  next_review TEXT,
  review_count INTEGER DEFAULT 0,
  difficulty_self_assessment TEXT,
  mastery_level INTEGER DEFAULT 0,
  mastery_trend TEXT,
  obsidian_slug TEXT,
  obsidian_exported_at TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- review_records 表
CREATE TABLE IF NOT EXISTS review_records (
  id TEXT PRIMARY KEY,
  learning_item_id TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  review_type TEXT NOT NULL,
  user_feedback TEXT,
  comprehension_level INTEGER,
  time_spent INTEGER,
  algorithm_result TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (learning_item_id) REFERENCES learning_items(id)
);

-- user_progress 表
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  total_items INTEGER,
  items_by_type TEXT,
  total_reviews INTEGER,
  reviews_today INTEGER,
  time_spent_today INTEGER,
  mastery_stats TEXT,
  weekly_review_count TEXT,
  weekly_avg_comprehension TEXT,
  recommended_review_count INTEGER,
  recommended_items TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- knowledge_graph_edges 表
CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
  id TEXT PRIMARY KEY,
  source_item_id TEXT NOT NULL,
  target_item_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  weight INTEGER DEFAULT 5,
  created_at TEXT NOT NULL,
  is_manual BOOLEAN DEFAULT 0,
  FOREIGN KEY (source_item_id) REFERENCES learning_items(id),
  FOREIGN KEY (target_item_id) REFERENCES learning_items(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_li_date ON learning_items(date);
CREATE INDEX IF NOT EXISTS idx_li_type ON learning_items(type);
CREATE INDEX IF NOT EXISTS idx_li_difficulty ON learning_items(difficulty);
CREATE INDEX IF NOT EXISTS idx_li_next_review ON learning_items(next_review);
CREATE INDEX IF NOT EXISTS idx_rr_learning_item ON review_records(learning_item_id);
CREATE INDEX IF NOT EXISTS idx_rr_reviewed_at ON review_records(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_up_date ON user_progress(date);
CREATE INDEX IF NOT EXISTS idx_kg_source ON knowledge_graph_edges(source_item_id);
CREATE INDEX IF NOT EXISTS idx_kg_target ON knowledge_graph_edges(target_item_id);
```

---

## 6. 关键查询示例

```sql
-- 查询今天应该复习的项
SELECT * FROM learning_items 
WHERE next_review <= DATE('now')
ORDER BY mastery_level ASC
LIMIT 10;

-- 查询用户的学习进度统计
SELECT 
  type,
  COUNT(*) as total,
  AVG(mastery_level) as avg_mastery,
  SUM(CASE WHEN mastery_level >= 90 THEN 1 ELSE 0 END) as mastered
FROM learning_items
GROUP BY type;

-- 查询知识图谱中与某个项相关的所有项
SELECT t.* FROM learning_items t
JOIN knowledge_graph_edges e ON (
  (e.source_item_id = ? AND e.target_item_id = t.id) OR
  (e.target_item_id = ? AND e.source_item_id = t.id)
)
WHERE e.relation_type IN ('related', 'extends', 'prerequisite');
```

---

## 总结

这个数据模型设计的关键特点：
✅ **双重存储**: 文件系统 + 数据库，兼顾版本控制和查询性能
✅ **灵活扩展**: 支持多种内容类型和复习策略
✅ **知识图谱友好**: 内置关系追踪，易于生成可视化
✅ **AI 友好**: 结构化数据便于 Agent 使用
✅ **可离线使用**: SQLite 支持完整离线功能
