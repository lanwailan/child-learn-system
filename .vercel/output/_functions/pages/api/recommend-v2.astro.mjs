import Database from 'better-sqlite3';
import path from 'path';
export { renderers } from '../../renderers.mjs';

let db = null;
function getDB() {
  if (db) {
    return db;
  }
  const dbPath = path.join(process.cwd(), "src", "data", "learning.db");
  const dir = path.dirname(dbPath);
  try {
    if (!require("fs").existsSync(dir)) {
      require("fs").mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
  }
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}
async function initializeDatabase() {
  const database = getDB();
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
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_learning_items_date ON learning_items(date);
    CREATE INDEX IF NOT EXISTS idx_learning_items_type ON learning_items(type);
    CREATE INDEX IF NOT EXISTS idx_learning_items_next_review ON learning_items(next_review);
    CREATE INDEX IF NOT EXISTS idx_learning_items_mastery ON learning_items(mastery_level);
    CREATE INDEX IF NOT EXISTS idx_review_records_item ON review_records(learning_item_id);
    CREATE INDEX IF NOT EXISTS idx_review_records_created ON review_records(created_at);
    CREATE INDEX IF NOT EXISTS idx_knowledge_edges_source ON knowledge_edges(source_id);
  `);
  console.log("[Database] Initialized SQLite database");
}
function getItemsForReview(today, limit = 10) {
  const db2 = getDB();
  const stmt = db2.prepare(`
    SELECT * FROM learning_items 
    WHERE next_review <= ? 
    ORDER BY mastery_level ASC, review_count ASC 
    LIMIT ?
  `);
  return stmt.all(today, limit);
}

const DAILY_QUOTA = 10;
const PRIORITY_RATIOS = {
  critical: 0.5,
  important: 0.3,
  optional: 0.2
};
const GET = async ({ url }) => {
  try {
    await initializeDatabase();
    const limit = parseInt(url.searchParams.get("limit") || DAILY_QUOTA.toString());
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const items = getItemsForReview(today, limit * 2);
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            total_recommended: 0,
            recommended_items: [],
            stats: {
              critical_count: 0,
              important_count: 0,
              optional_count: 0
            }
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    const critical = items.filter((item) => item.mastery_level < 50);
    const important = items.filter((item) => item.mastery_level >= 50 && item.mastery_level < 80);
    const optional = items.filter((item) => item.mastery_level >= 80);
    const criticalLimit = Math.ceil(limit * PRIORITY_RATIOS.critical);
    const importantLimit = Math.ceil(limit * PRIORITY_RATIOS.important);
    const optionalLimit = Math.ceil(limit * PRIORITY_RATIOS.optional);
    const recommended = [
      ...critical.slice(0, criticalLimit),
      ...important.slice(0, importantLimit),
      ...optional.slice(0, optionalLimit)
    ].slice(0, limit);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_recommended: recommended.length,
          recommended_items: recommended.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            mastery_level: item.mastery_level,
            difficulty: item.difficulty,
            estimated_time: item.estimated_time,
            tags: item.tags ? JSON.parse(item.tags) : []
          })),
          stats: {
            critical_count: Math.min(critical.length, criticalLimit),
            important_count: Math.min(important.length, importantLimit),
            optional_count: Math.min(optional.length, optionalLimit)
          },
          source: "sqlite",
          performanceMs: 0
          // 可添加性能计时
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Recommend error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
