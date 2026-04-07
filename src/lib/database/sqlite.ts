/**
 * SQLite 数据库层 - 优化的持久化存储
 * 提供高效的查询、索引和并发支持
 */

import Database from 'better-sqlite3';
import path from 'path';
import { promises as fs } from 'fs';

let db: Database.Database | null = null;

export interface LearningItemRecord {
  id: string;
  type: 'vocabulary' | 'grammar' | 'story' | 'knowledge';
  title: string;
  date: string;
  raw_content: string;
  generated_markdown?: string;
  generated_at?: string;
  mastery_level: number;
  next_review: string;
  llm_provider?: string;
  difficulty: string;
  estimated_time: number;
  review_count: number;
  last_reviewed?: string;
  created_at: string;
  updated_at: string;
  tags?: string;
}

export interface ReviewRecord {
  id: string;
  learning_item_id: string;
  user_feedback: 'easy' | 'good' | 'hard';
  time_spent: number;
  quality_score: number;
  new_mastery_level: number;
  new_ef: number;
  new_interval: number;
  next_review_date: string;
  notes?: string;
  created_at: string;
}

// 初始化数据库连接
function getDB(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'src', 'data', 'learning.db');
  
  // 确保目录存在
  const dir = path.dirname(dbPath);
  try {
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    // 忽略错误
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // 使用 WAL 模式提高并发性能
  db.pragma('foreign_keys = ON'); // 启用外键约束

  return db;
}

// 初始化表结构
export async function initializeDatabase(): Promise<void> {
  const database = getDB();

  // 学习项表
  database.exec(`
    CREATE TABLE IF NOT EXISTS learning_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('vocabulary', 'grammar', 'story', 'knowledge')),
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      raw_content TEXT NOT NULL,
      generated_markdown TEXT,
      generated_at TEXT,
      mastery_level INTEGER DEFAULT 0 CHECK(mastery_level >= 0 AND mastery_level <= 100),
      next_review TEXT NOT NULL,
      llm_provider TEXT,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      estimated_time INTEGER,
      review_count INTEGER DEFAULT 0,
      last_reviewed TEXT,
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(id, date)
    )
  `);

  // 复习记录表
  database.exec(`
    CREATE TABLE IF NOT EXISTS review_records (
      id TEXT PRIMARY KEY,
      learning_item_id TEXT NOT NULL,
      user_feedback TEXT NOT NULL CHECK(user_feedback IN ('easy', 'good', 'hard')),
      time_spent INTEGER,
      quality_score INTEGER CHECK(quality_score >= 0 AND quality_score <= 5),
      new_mastery_level INTEGER,
      new_ef REAL,
      new_interval INTEGER,
      next_review_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (learning_item_id) REFERENCES learning_items(id) ON DELETE CASCADE
    )
  `);

  // 知识图谱边表
  database.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_edges (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      relation_type TEXT DEFAULT 'related',
      created_at TEXT NOT NULL,
      FOREIGN KEY (source_id) REFERENCES learning_items(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES learning_items(id) ON DELETE CASCADE
    )
  `);

  // 创建索引以优化查询性能
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_learning_items_date ON learning_items(date);
    CREATE INDEX IF NOT EXISTS idx_learning_items_type ON learning_items(type);
    CREATE INDEX IF NOT EXISTS idx_learning_items_next_review ON learning_items(next_review);
    CREATE INDEX IF NOT EXISTS idx_learning_items_mastery ON learning_items(mastery_level);
    CREATE INDEX IF NOT EXISTS idx_review_records_item ON review_records(learning_item_id);
    CREATE INDEX IF NOT EXISTS idx_review_records_created ON review_records(created_at);
    CREATE INDEX IF NOT EXISTS idx_knowledge_edges_source ON knowledge_edges(source_id);
  `);

  console.log('[Database] Initialized SQLite database');
}

// CRUD 操作

export function createLearningItem(item: LearningItemRecord): void {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO learning_items 
    (id, type, title, date, raw_content, mastery_level, next_review, 
     difficulty, estimated_time, review_count, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    item.id,
    item.type,
    item.title,
    item.date,
    item.raw_content,
    item.mastery_level,
    item.next_review,
    item.difficulty,
    item.estimated_time,
    item.review_count,
    item.tags ? JSON.stringify(item.tags) : null,
    item.created_at,
    item.updated_at
  );
}

export function getLearningItem(id: string): LearningItemRecord | null {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM learning_items WHERE id = ?');
  return stmt.get(id) as LearningItemRecord | undefined || null;
}

export function updateLearningItem(item: Partial<LearningItemRecord> & { id: string }): void {
  const db = getDB();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (item.mastery_level !== undefined) {
    updates.push('mastery_level = ?');
    values.push(item.mastery_level);
  }
  if (item.next_review !== undefined) {
    updates.push('next_review = ?');
    values.push(item.next_review);
  }
  if (item.generated_markdown !== undefined) {
    updates.push('generated_markdown = ?');
    values.push(item.generated_markdown);
  }
  if (item.generated_at !== undefined) {
    updates.push('generated_at = ?');
    values.push(item.generated_at);
  }
  if (item.review_count !== undefined) {
    updates.push('review_count = ?');
    values.push(item.review_count);
  }
  if (item.last_reviewed !== undefined) {
    updates.push('last_reviewed = ?');
    values.push(item.last_reviewed);
  }
  
  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(item.id);

  const sql = `UPDATE learning_items SET ${updates.join(', ')} WHERE id = ?`;
  const stmt = db.prepare(sql);
  stmt.run(...values);
}

export function getItemsForReview(today: string, limit: number = 10): LearningItemRecord[] {
  const db = getDB();
  const stmt = db.prepare(`
    SELECT * FROM learning_items 
    WHERE next_review <= ? 
    ORDER BY mastery_level ASC, review_count ASC 
    LIMIT ?
  `);
  return stmt.all(today, limit) as LearningItemRecord[];
}

export function getStatistics(): {
  total_items: number;
  total_reviews: number;
  avg_mastery: number;
  mastered: number;
  learning: number;
  struggling: number;
} {
  const db = getDB();
  
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM learning_items');
  const reviewStmt = db.prepare('SELECT COUNT(*) as count FROM review_records');
  const masteryStmt = db.prepare('SELECT AVG(mastery_level) as avg_mastery FROM learning_items');
  const countStmt = db.prepare(`
    SELECT 
      SUM(CASE WHEN mastery_level >= 90 THEN 1 ELSE 0 END) as mastered,
      SUM(CASE WHEN mastery_level >= 50 AND mastery_level < 90 THEN 1 ELSE 0 END) as learning,
      SUM(CASE WHEN mastery_level < 50 THEN 1 ELSE 0 END) as struggling
    FROM learning_items
  `);

  const total = totalStmt.get() as { count: number };
  const reviews = reviewStmt.get() as { count: number };
  const mastery = masteryStmt.get() as { avg_mastery: number | null };
  const counts = countStmt.get() as { mastered: number | null; learning: number | null; struggling: number | null };

  return {
    total_items: total.count,
    total_reviews: reviews.count,
    avg_mastery: Math.round(mastery.avg_mastery || 0),
    mastered: counts.mastered || 0,
    learning: counts.learning || 0,
    struggling: counts.struggling || 0,
  };
}

export function createReviewRecord(record: ReviewRecord): void {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO review_records
    (id, learning_item_id, user_feedback, time_spent, quality_score, 
     new_mastery_level, new_ef, new_interval, next_review_date, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    record.id,
    record.learning_item_id,
    record.user_feedback,
    record.time_spent,
    record.quality_score,
    record.new_mastery_level,
    record.new_ef,
    record.new_interval,
    record.next_review_date,
    record.notes,
    record.created_at
  );
}

export function getReviewHistory(learningItemId: string): ReviewRecord[] {
  const db = getDB();
  const stmt = db.prepare(`
    SELECT * FROM review_records 
    WHERE learning_item_id = ? 
    ORDER BY created_at DESC
  `);
  return stmt.all(learningItemId) as ReviewRecord[];
}

// 迁移工具 - 从文件系统迁移到 SQLite
export async function migrateFromFilesystem(): Promise<{ migrated: number; skipped: number }> {
  const baseDataDir = path.join(process.cwd(), 'src', 'data');
  let migrated = 0;
  let skipped = 0;

  try {
    const dateDirs = await fs.readdir(baseDataDir);
    
    for (const dateDir of dateDirs) {
      if (dateDir === 'learning.db' || dateDir === '.temp-export') continue;
      
      const itemsDir = path.join(baseDataDir, dateDir, 'learning-items');
      try {
        const files = await fs.readdir(itemsDir);
        
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          
          try {
            const filePath = path.join(itemsDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const item = JSON.parse(content) as LearningItemRecord;
            
            // 检查是否已存在
            const existing = getLearningItem(item.id);
            if (!existing) {
              createLearningItem(item);
              migrated++;
            } else {
              skipped++;
            }
          } catch (e) {
            console.error(`Failed to migrate ${file}:`, e);
          }
        }
      } catch (e) {
        // 目录可能不存在
      }
    }
  } catch (e) {
    console.error('Migration failed:', e);
  }

  return { migrated, skipped };
}

// 导出工具函数
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
