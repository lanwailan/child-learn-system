# 🔄 备份与恢复指南

## 自动备份系统

系统已配置自动备份到 GitHub，具有以下特性:

### 备份计划

- **每日备份**: UTC 02:00 执行 (可在 GitHub Actions 中配置)
- **推送时备份**: 主分支有 `src/data/` 更改时自动备份
- **手动备份**: 可在 GitHub Actions 中手动触发

### 备份内容

```
backups/
├── 2026-04-07/
│   ├── data/
│   │   ├── 2026-04-07/
│   │   │   ├── learning-items/
│   │   │   ├── reviews/
│   │   │   ├── generated/
│   │   │   └── learning.db (SQLite)
│   │   ├── 2026-04-06/
│   │   └── ...
│   └── BACKUP_INFO.md
├── 2026-04-06/
└── ...
```

## 查看备份

### 在 GitHub 上查看

1. 打开 https://github.com/[username]/child-learn-system
2. 点击 "Actions" 标签
3. 查看 "Auto Backup Learning Data" 工作流
4. 点击具体的运行查看日志

### 本地查看

```bash
# 查看所有备份
ls -la backups/

# 查看特定日期的备份
ls -la backups/2026-04-07/data/

# 查看备份大小
du -sh backups/*/
```

## 恢复数据

### 情景 1: 恢复单个学习项

```bash
# 从备份恢复特定学习项
cp backups/2026-04-07/data/2026-04-07/learning-items/{item-id}.json \
   src/data/2026-04-07/learning-items/

# 验证恢复
ls -la src/data/2026-04-07/learning-items/{item-id}.json
```

### 情景 2: 恢复整个数据库

```bash
# 备份当前数据
cp -r src/data src/data.backup

# 从备份恢复
cp -r backups/2026-04-07/data/* src/data/

# 验证恢复
npm run dev

# 如果出错，恢复到备份
rm -rf src/data && mv src/data.backup src/data
```

### 情景 3: 恢复 SQLite 数据库

```bash
# 从备份恢复数据库文件
cp backups/2026-04-07/data/learning.db src/data/learning.db

# 验证数据库完整性
sqlite3 src/data/learning.db ".tables"
```

### 情景 4: 从 Git 历史恢复

如果备份目录不可用:

```bash
# 查看 Git 历史
git log --oneline src/data/

# 查看特定提交
git show {commit-hash}:src/data/

# 恢复特定提交的文件
git checkout {commit-hash} -- src/data/

# 或重置到特定提交
git reset --hard {commit-hash}
```

## 备份验证

### 检查备份完整性

```bash
# 计算备份文件数量
find backups/ -type f | wc -l

# 验证 JSON 文件有效性
for file in backups/*/data/*/learning-items/*.json; do
  python3 -m json.tool "$file" > /dev/null && echo "✓ $file" || echo "✗ $file"
done

# 验证数据库文件
sqlite3 backups/*/data/learning.db "SELECT COUNT(*) FROM learning_items;"
```

### 监控备份大小

```bash
# 跟踪备份增长
du -sh backups/ backups/*/ backups/*/*/*/ 2>/dev/null | sort -hr

# 计算平均备份大小
du -sb backups/ | awk '{print $1 / 1024 / 1024 " MB"}'
```

## 清理旧备份

### 手动清理

```bash
# 删除 30 天前的备份
find backups/ -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;

# 删除特定日期的备份
rm -rf backups/2026-04-01/
```

### 自动清理 (需要额外工作流)

```yaml
# .github/workflows/cleanup-old-backups.yml
name: 清理旧备份

on:
  schedule:
    - cron: '0 3 * * 0'  # 每周日 03:00

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: 删除 30 天前的备份
        run: find backups/ -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;
      - name: 提交更改
        run: |
          git config user.email "actions@github.com"
          git config user.name "Actions"
          git add -A
          git commit -m "🧹 Cleanup old backups" || true
          git push || true
```

## 跨机器恢复

### 在新机器上克隆并恢复

```bash
# 1. 克隆仓库
git clone https://github.com/[username]/child-learn-system.git
cd child-learn-system

# 2. 安装依赖
npm install

# 3. 恢复最新备份
cp -r backups/$(ls backups/ | sort -r | head -1)/* .

# 4. 验证数据
npm run dev

# 5. 迁移到 SQLite (如需要)
npx ts-node scripts/migrate-to-sqlite.ts
```

## 备份策略建议

### 对于个人用户

```
┌─ 本地存储
├─ Git/GitHub (自动备份)
└─ 云存储 (定期下载)
```

频率: 每天一次
保留期: 30 天

### 对于生产环境

```
┌─ 主数据库 (SQLite)
├─ 副本 (热备)
├─ Git/GitHub (版本控制)
├─ S3/OSS (冷备)
└─ 异地备份 (灾备)
```

频率: 每小时一次
保留期: 90 天

## 故障恢复时间目标 (RTO/RPO)

| 场景 | RTO | RPO | 说明 |
|------|-----|-----|------|
| 本地文件损坏 | <5分钟 | 1天 | 从 GitHub 恢复 |
| 完全数据丢失 | <30分钟 | 1小时 | 从备份恢复 |
| 异地灾难 | <1小时 | 1天 | 从云备份恢复 |

## 安全注意事项

### 保护敏感信息

```bash
# 1. 确保 .env.local 在 .gitignore 中
echo ".env.local" >> .gitignore

# 2. 不要备份敏感数据
# ✓ 学习内容
# ✗ API 密钥
# ✗ 密码
# ✗ 用户个人信息

# 3. 加密重要备份
gpg --symmetric backups/2026-04-07/data/learning.db
```

### 访问控制

- 仅限私有 GitHub 仓库
- 定期审计访问权限
- 使用 GitHub Secrets 管理敏感信息

## 备份恢复检查清单

- [ ] 备份文件完整 (所有日期的文件都存在)
- [ ] 备份文件有效 (JSON/SQLite 格式正确)
- [ ] 文件权限正确 (644 for files, 755 for dirs)
- [ ] Git 历史完整 (能够查看所有提交)
- [ ] 应用启动成功 (npm run dev 无错误)
- [ ] 数据显示正确 (仪表板显示预期数据)
- [ ] 所有 API 正常 (health check 通过)
- [ ] 性能可接受 (查询响应时间 <100ms)

## 常见问题

**Q: 备份有多大?**
A: 每 1000 条学习项约 2-5MB

**Q: 会占用 GitHub 的存储空间吗?**
A: GitHub 提供 1GB 存储 (不超过配额限制)

**Q: 可以恢复已删除的项目吗?**
A: 是的，使用 Git 历史: `git log --diff-filter=D --summary | grep delete`

**Q: 备份是加密的吗?**
A: 传输时使用 HTTPS 加密，存储时可选 GPG 加密

**Q: 多久执行一次完整恢复测试?**
A: 建议每月一次，确保恢复流程有效

---

**版本**: 1.0.0  
**最后更新**: 2026-04-07  
**状态**: 生产就绪
