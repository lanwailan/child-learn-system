# 🤖 LLM 集成配置指南

本指南介绍如何配置各个 LLM 提供商，使系统能够生成高质量的学习内容。

## 快速开始

### 1. 复制环境变量模板
```bash
cp .env.example .env.local
```

### 2. 配置 LLM 提供商

选择以下任意一个提供商（或多个），填入 API 密钥。

---

## 📝 提供商配置指南

### 1️⃣ DeepSeek (推荐 - 中国用户友好)

**优势**:
- 中文支持优秀
- 价格低廉
- 响应速度快
- 对儿童内容生成友好

**获取 API 密钥**:
1. 访问 https://platform.deepseek.com/
2. 注册账户
3. 创建 API 密钥
4. 充值获得配额

**配置**:
```bash
# .env.local
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_MODEL=deepseek-chat
```

**测试**:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "learning_item_id": "your-item-id",
    "llm_provider": "deepseek"
  }'
```

---

### 2️⃣ Qwen/阿里云通义千问 (阿里云用户推荐)

**优势**:
- 阿里云生态集成
- 多种模型选择
- 企业级支持
- 免费配额

**获取 API 密钥**:
1. 访问 https://dashscope.aliyuncs.com/
2. 用阿里云账户登录
3. 创建 API 密钥
4. 选择模型 (qwen-max 推荐)

**配置**:
```bash
# .env.local
LLM_PROVIDER=qwen
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxx
QWEN_MODEL=qwen-max
```

**模型选项**:
- `qwen-max` - 最强大的模型
- `qwen-pro` - 平衡模型
- `qwen-plus` - 更快速
- `qwen-turbo` - 快速便宜

---

### 3️⃣ GLM/智谱大模型

**优势**:
- 国内顶级大模型
- 中文理解能力强
- 创意写作能力好
- 学术界广泛使用

**获取 API 密钥**:
1. 访问 https://open.bigmodel.cn/
2. 使用微信/GitHub 登录
3. 创建 API 密钥
4. 开通服务（有免费额度）

**配置**:
```bash
# .env.local
LLM_PROVIDER=glm
GLM_API_KEY=xxxxxxxxxxxxxxxx
GLM_MODEL=glm-4
```

**模型选项**:
- `glm-4` - 最新最强
- `glm-3-turbo` - 平衡
- `glm-3-turbo-lite` - 轻量级

---

### 4️⃣ OpenAI (国际用户推荐)

**优势**:
- 业界标准
- 模型最新
- 全球可用
- 官方支持

**获取 API 密钥**:
1. 访问 https://platform.openai.com/
2. 创建账户
3. 生成 API 密钥
4. 添加支付方式

**配置**:
```bash
# .env.local
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo
```

**模型选项**:
- `gpt-4-turbo` - 最强大
- `gpt-4` - 稳定版
- `gpt-3.5-turbo` - 快速便宜

---

## 🔧 完整配置示例

### 配置 DeepSeek (默认推荐)
```env
# LLM 提供商配置
LLM_PROVIDER=deepseek

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
DEEPSEEK_MODEL=deepseek-chat

# 可选: 配置备用提供商
QWEN_API_KEY=
GLM_API_KEY=
OPENAI_API_KEY=

# 其他配置
MAX_UPLOAD_SIZE_MB=50
DEFAULT_TIMEOUT_MS=30000
```

### 多提供商配置 (故障转移)

如果需要在一个提供商不可用时自动切换到另一个:

```env
# 主提供商
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx

# 备用提供商
QWEN_API_KEY=sk-xxxxxxxxxxxxx
GLM_API_KEY=xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

当前实现会尝试使用主提供商，失败时使用模拟内容。
（Future：支持自动故障转移）

---

## 📊 提供商对比

| 特性 | DeepSeek | Qwen | GLM | OpenAI |
|------|----------|------|-----|--------|
| 中文支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 价格 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 速度 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 创意 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 易用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| API 稳定性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🧪 测试 LLM 连接

### 命令行测试

```bash
# 1. 启动服务器
npm run dev

# 2. 在另一个终端测试
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "type": "vocabulary",
    "title": "Test Word",
    "raw_content": "This is a test",
    "difficulty": "easy"
  }'

# 3. 获取返回的 ID，然后生成
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "learning_item_id": "returned-uuid",
    "llm_provider": "deepseek"
  }'
```

### 浏览器测试

1. 打开 http://localhost:3000/upload
2. 填写学习资料表单
3. 点击"上传并生成"
4. 查看生成的内容

---

## 🐛 常见问题

### Q: 如何验证 API 密钥是否正确？
```bash
# 检查环境变量是否加载
echo $DEEPSEEK_API_KEY

# 查看服务器日志中的错误
# 在生成时会打印使用的提供商信息
```

### Q: 如果 LLM API 失败会发生什么？
- 系统会自动使用 fallback 模板生成 Markdown
- 返回信息中会显示 "using fallback"
- 仍然可以正常使用系统

### Q: 如何切换 LLM 提供商？
修改 `.env.local` 中的 `LLM_PROVIDER`:
```bash
# 从
LLM_PROVIDER=deepseek
# 改为
LLM_PROVIDER=qwen
```

### Q: 如何监控 API 使用量？
- 在生成响应中会返回 `tokenUsage`
- 访问各提供商的控制面板查看详细使用情况
- DeepSeek: https://platform.deepseek.com/usage
- Qwen: https://dashscope.aliyuncs.com/console
- GLM: https://open.bigmodel.cn/statistics
- OpenAI: https://platform.openai.com/account/billing/overview

### Q: API 价格如何？
- **DeepSeek**: 最便宜，约 ¥0.14/1M tokens (输入)
- **Qwen**: 便宜，约 ¥0.008/1K tokens (输入)
- **GLM**: 中等，约 ¥0.01/1K tokens (输入)
- **OpenAI**: 最贵，约 $0.01/1K tokens (输入)

---

## 🔒 安全建议

1. **保护 API 密钥**
   - 永远不要提交 `.env.local` 到 Git
   - 使用 `.gitignore` 排除敏感文件
   - 定期轮换密钥

2. **环境隔离**
   - 开发环境使用测试密钥
   - 生产环境使用专用密钥
   - 使用不同的服务账户

3. **限制配额**
   - 设置 API 使用上限
   - 监控成本
   - 定期检查使用情况

---

## 📱 在生产环境部署

### Vercel 部署
1. 在 Vercel 项目设置中添加环境变量
2. 设置 `LLM_PROVIDER` 和 API 密钥
3. 重新部署

### Docker 部署
```dockerfile
ENV LLM_PROVIDER=deepseek
ENV DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
```

### 其他平台
参考平台文档设置环境变量

---

## 📚 完整系统流程

```
用户上传资料
    ↓
系统保存到文件系统
    ↓
调用 /api/generate
    ↓
读取 LLM_PROVIDER 配置
    ↓
初始化对应的 LLM 适配器
    ↓
发送请求到 LLM API
    ↓
获取生成的 Markdown
    ↓
保存到 src/data/{date}/generated/
    ↓
更新学习项元数据
    ↓
返回成功响应
    ↓
前端显示生成的内容
```

---

## 🚀 下一步优化

- [ ] 自动故障转移 (一个 API 失败时切换另一个)
- [ ] 缓存机制 (避免重复调用)
- [ ] 成本优化 (选择最便宜的提供商)
- [ ] 批量生成 (支持并行请求)
- [ ] 细粒度配置 (按内容类型选择提供商)

---

## 💬 获取帮助

- 检查服务器日志: `npm run dev` 输出
- 查看 API 文档: `API_DOCUMENTATION.md`
- 查看项目规划: `PROJECT_PLAN.md`
- 提供商官方文档:
  - DeepSeek: https://docs.deepseek.com/
  - Qwen: https://help.aliyun.com/zh_CN/dashscope/
  - GLM: https://open.bigmodel.cn/document/
  - OpenAI: https://platform.openai.com/docs/

---

**版本**: 1.0.0  
**最后更新**: 2026-04-07
