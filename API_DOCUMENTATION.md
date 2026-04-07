# Child Learn System - API 文档

## 概览

所有 API 端点都遵循 RESTful 设计，返回统一的 JSON 格式。

```json
{
  "success": true/false,
  "data": { /* 响应数据 */ },
  "error": "错误信息（仅在失败时返回）",
  "timestamp": "ISO 8601 时间戳"
}
```

---

## 1. 上传学习资料

### 端点
```
POST /api/upload
```

### 请求体
```json
{
  "type": "vocabulary|grammar|story|knowledge",
  "title": "学习项标题",
  "description": "可选的描述",
  "raw_content": "原始学习内容（必填）",
  "tags": ["标签1", "标签2"],
  "difficulty": "easy|medium|hard",
  "estimated_time": 10
}
```

### 响应示例 (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Learning item created successfully",
    "item": { /* 完整的学习项数据 */ }
  },
  "timestamp": "2026-04-07T15:00:00Z"
}
```

### 错误响应 (400)
```json
{
  "success": false,
  "error": "Missing required fields: type, title, raw_content",
  "timestamp": "2026-04-07T15:00:00Z"
}
```

---

## 2. 记录复习反馈

### 端点
```
POST /api/review
```

### 请求体
```json
{
  "learning_item_id": "uuid",
  "user_feedback": "easy|good|hard",
  "time_spent": 300,
  "notes": "可选的笔记"
}
```

### 响应示例 (201)
```json
{
  "success": true,
  "data": {
    "learning_item_id": "uuid",
    "new_mastery_level": 45,
    "next_review_date": "2026-04-10",
    "next_interval_days": 3,
    "review_record": { /* 复习记录详情 */ }
  },
  "timestamp": "2026-04-07T15:00:00Z"
}
```

**掌握度等级**:
- 0-30: 需要加强
- 31-50: 初步了解
- 51-79: 学习中
- 80-89: 基本掌握
- 90-100: 完全掌握

---

## 3. 获取推荐复习项

### 端点
```
GET /api/recommend?limit=10
```

### 查询参数
- `limit` (可选, 默认: 10): 返回的项数量

### 响应示例 (200)
```json
{
  "success": true,
  "data": {
    "total_recommended": 8,
    "recommended_items": [
      {
        "id": "uuid",
        "title": "Animals - Dog",
        "type": "vocabulary",
        "mastery_level": 30,
        "difficulty": "easy",
        "estimated_time": 5
      }
      // ... 更多项
    ],
    "stats": {
      "critical_count": 4,
      "important_count": 3,
      "optional_count": 1
    }
  },
  "timestamp": "2026-04-07T15:00:00Z"
}
```

**推荐优先级** (按掌握度):
- **Critical** (50%): 掌握度 < 50%，需要重点复习
- **Important** (30%): 掌握度 50-80%，需要巩固
- **Optional** (20%): 掌握度 >= 80%，保持记忆

---

## 4. 生成高质量内容

### 端点
```
POST /api/generate
```

### 请求体
```json
{
  "learning_item_id": "uuid",
  "llm_provider": "deepseek|qwen|glm|openai"
}
```

### 响应示例 (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "markdown": "# 完整的 Markdown 内容...",
    "message": "Content generated successfully",
    "note": "To use real LLM: set environment variables"
  },
  "timestamp": "2026-04-07T15:00:00Z"
}
```

**支持的 LLM 提供商**:
- DeepSeek (深度求索)
- Qwen (阿里云通义千问)
- GLM (智谱 GLM)
- OpenAI (ChatGPT)

---

## 5. 获取学习统计

### 端点
```
GET /api/stats?period=all
```

### 查询参数
- `period` (可选): `all`, `week`, `month`

### 响应示例 (200)
```json
{
  "success": true,
  "data": {
    "period": "all",
    "total_items": 25,
    "total_reviews": 87,
    "items_by_type": {
      "vocabulary": 10,
      "grammar": 5,
      "story": 5,
      "knowledge": 5
    },
    "mastery_stats": {
      "avg_mastery": 65,
      "mastered": 8,
      "learning": 10,
      "struggling": 7
    },
    "difficulty_distribution": {
      "easy": 5,
      "medium": 15,
      "hard": 5
    },
    "avg_time_per_item": 8
  },
  "timestamp": "2026-04-07T15:00:00Z"
}
```

---

## 6. 获取复习日程

### 端点
```
GET /api/schedule?days=30
```

### 查询参数
- `days` (可选, 默认: 30): 显示的天数

### 响应示例 (200)
```json
{
  "success": true,
  "data": {
    "schedule": {
      "2026-04-07": [
        {
          "id": "uuid",
          "title": "Animals - Dog",
          "type": "vocabulary",
          "mastery_level": 50,
          "estimated_time": 5
        }
      ],
      "2026-04-08": [],
      "2026-04-09": [...]
    },
    "daily_stats": [
      {
        "date": "2026-04-07",
        "item_count": 3,
        "estimated_time": 20,
        "avg_mastery": 45
      }
    ],
    "total_days": 30,
    "total_items_scheduled": 45
  },
  "timestamp": "2026-04-07T15:00:00Z"
}
```

---

## 7. 导出为 Obsidian 格式

### 端点
```
POST /api/export
```

### 请求体
```json
{
  "learning_item_ids": ["uuid1", "uuid2"]  // 可选，不指定则导出全部
}
```

### 响应示例 (201)
```json
{
  "success": true,
  "data": {
    "exported_count": 15,
    "export_path": "/path/to/Child Learn System",
    "format": "Obsidian Vault",
    "obsidian_features": {
      "backlinks": "✅ All items support backlinks",
      "graph_view": "✅ Knowledge graph visualization ready",
      "wikilinks": "✅ [[...]] format for cross-references",
      "tags": "✅ Tag system enabled"
    }
  },
  "timestamp": "2026-04-07T15:00:00Z"
}
```

---

## 错误处理

### 常见错误码

| 状态码 | 说明 | 示例 |
|-------|------|------|
| 200 | 请求成功 | 查询操作 |
| 201 | 创建成功 | 上传、生成、导出 |
| 400 | 请求错误 | 缺少必填字段 |
| 404 | 未找到 | 学习项不存在 |
| 500 | 服务器错误 | 内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "error": "具体的错误信息",
  "timestamp": "2026-04-07T15:00:00Z"
}
```

---

## 使用示例

### cURL 示例

**1. 上传学习资料**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "type": "vocabulary",
    "title": "Animals - Dog",
    "raw_content": "Dog is a domestic animal...",
    "tags": ["animals", "english"],
    "difficulty": "easy",
    "estimated_time": 5
  }'
```

**2. 记录复习反馈**
```bash
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "learning_item_id": "uuid",
    "user_feedback": "good",
    "time_spent": 300
  }'
```

**3. 获取推荐**
```bash
curl http://localhost:3000/api/recommend?limit=10
```

**4. 获取统计**
```bash
curl http://localhost:3000/api/stats?period=week
```

---

## 速率限制

当前版本未实现速率限制。生产环境建议添加：
- 每分钟 API 调用限制
- 每日上传数据量限制
- 认证令牌有效期限制

---

## 环境变量

```bash
# LLM 配置
DEEPSEEK_API_KEY=your-key
QWEN_API_KEY=your-key
GLM_API_KEY=your-key
OPENAI_API_KEY=your-key

# 可选
LLM_PROVIDER=deepseek
MAX_UPLOAD_SIZE_MB=50
```

---

## 集成示例 (JavaScript/Fetch)

```javascript
// 上传
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'vocabulary',
    title: 'Dog',
    raw_content: '...',
  }),
});
const uploadData = await uploadResponse.json();
const itemId = uploadData.data.id;

// 生成
await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    learning_item_id: itemId,
    llm_provider: 'deepseek',
  }),
});

// 获取推荐
const recommendResponse = await fetch('/api/recommend?limit=10');
const recommendations = await recommendResponse.json();

// 记录复习
await fetch('/api/review', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    learning_item_id: itemId,
    user_feedback: 'good',
    time_spent: 300,
  }),
});
```

---

## 最后更新

**日期**: 2026-04-07  
**版本**: 1.0.0  
**状态**: Beta (模拟 LLM，使用文件系统存储)
