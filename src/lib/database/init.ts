// 数据库初始化脚本

import Database from 'better-sqlite3';

export function initializeDatabase(dbPath: string = 'learning-system.db'): Database.Database {
  const db = new Database(dbPath);
  
  // 启用外键约束
  db.pragma('foreign_keys = ON');
  
  // 创建所有必要的表
  createTables(db);
  
  console.log(`✓ Database initialized at: ${dbPath}`);
  return db;
}

function createTables(db: Database.Database): void {
  // 1. 学习项表
  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_items (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('vocabulary', 'grammar', 'story', 'knowledge')),
      title TEXT NOT NULL,
      description TEXT,
      raw_content TEXT,
      generated_markdown TEXT,
      generated_at TEXT,
      llm_provider TEXT,
      tags TEXT,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
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
    
    CREATE INDEX IF NOT EXISTS idx_li_date ON learning_items(date);
    CREATE INDEX IF NOT EXISTS idx_li_type ON learning_items(type);
    CREATE INDEX IF NOT EXISTS idx_li_difficulty ON learning_items(difficulty);
    CREATE INDEX IF NOT EXISTS idx_li_next_review ON learning_items(next_review);
    CREATE INDEX IF NOT EXISTS idx_li_mastery ON learning_items(mastery_level);
  `);
  
  // 2. 复习记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS review_records (
      id TEXT PRIMARY KEY,
      learning_item_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL,
      review_type TEXT NOT NULL CHECK(review_type IN ('initial', 'practice', 'review', 'test')),
      user_feedback TEXT CHECK(user_feedback IN ('easy', 'good', 'hard')),
      comprehension_level INTEGER,
      time_spent INTEGER,
      algorithm_result TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (learning_item_id) REFERENCES learning_items(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_rr_learning_item ON review_records(learning_item_id);
    CREATE INDEX IF NOT EXISTS idx_rr_reviewed_at ON review_records(reviewed_at);
  `);
  
  // 3. 用户进度表
  db.exec(`
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
    
    CREATE INDEX IF NOT EXISTS idx_up_date ON user_progress(date);
  `);
  
  // 4. 知识图谱边表
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
      id TEXT PRIMARY KEY,
      source_item_id TEXT NOT NULL,
      target_item_id TEXT NOT NULL,
      relation_type TEXT NOT NULL CHECK(relation_type IN ('synonym', 'antonym', 'related', 'prerequisite', 'extends', 'example', 'category', 'custom')),
      weight INTEGER DEFAULT 5,
      created_at TEXT NOT NULL,
      is_manual BOOLEAN DEFAULT 0,
      FOREIGN KEY (source_item_id) REFERENCES learning_items(id) ON DELETE CASCADE,
      FOREIGN KEY (target_item_id) REFERENCES learning_items(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_kg_source ON knowledge_graph_edges(source_item_id);
    CREATE INDEX IF NOT EXISTS idx_kg_target ON knowledge_graph_edges(target_item_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_kg_unique ON knowledge_graph_edges(source_item_id, target_item_id, relation_type);
  `);
  
  // 5. 配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✓ All tables created successfully');
}

export function insertDefaultConfig(db: Database.Database): void {
  const configInsert = db.prepare(`
    INSERT OR REPLACE INTO system_config (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);
  
  const configs = [
    ['llm_provider', 'deepseek'],
    ['daily_review_budget', '10'],
    ['max_interval_days', '21'],
    ['initial_easiness', '1.8'],
  ];
  
  for (const [key, value] of configs) {
    configInsert.run(key, value);
  }
  
  console.log('✓ Default configurations inserted');
}

export function closeDatabase(db: Database.Database): void {
  db.close();
  console.log('✓ Database connection closed');
}
