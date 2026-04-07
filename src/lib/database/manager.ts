// 数据库管理层 - 核心 CRUD 操作

import Database from 'better-sqlite3';
import type { LearningItem, ReviewRecord, UserProgress } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseManager {
  private db: Database.Database;
  
  constructor(db: Database.Database) {
    this.db = db;
  }
  
  // ==================== 学习项操作 ====================
  
  createLearningItem(item: Partial<LearningItem>): LearningItem {
    const id = item.id || uuidv4();
    const now = new Date().toISOString();
    
    const insertStmt = this.db.prepare(`
      INSERT INTO learning_items (
        id, date, type, title, description, raw_content,
        generated_markdown, generated_at, llm_provider, tags, difficulty,
        estimated_time, related_concepts, created_at, review_count,
        difficulty_self_assessment, mastery_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      id,
      item.date || new Date().toISOString().split('T')[0],
      item.type || 'knowledge',
      item.title || 'Untitled',
      item.description || '',
      item.raw_content || '',
      item.generated_markdown || '',
      item.generated_at || now,
      item.llm_provider || 'deepseek',
      JSON.stringify(item.tags || []),
      item.difficulty || 'medium',
      item.estimated_time || 0,
      JSON.stringify(item.related_concepts || []),
      now,
      0,
      item.difficulty_self_assessment || 'medium',
      0
    );
    
    return this.getLearningItem(id)!;
  }
  
  getLearningItem(id: string): LearningItem | null {
    const stmt = this.db.prepare('SELECT * FROM learning_items WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.rowToLearningItem(row) : null;
  }
  
  updateLearningItem(item: Partial<LearningItem> & { id: string }): void {
    const updates: string[] = [];
    const values: any[] = [];
    
    const fieldMapping: Record<string, string> = {
      title: 'title',
      raw_content: 'raw_content',
      generated_markdown: 'generated_markdown',
      generated_at: 'generated_at',
      tags: 'tags',
      difficulty: 'difficulty',
      mastery_level: 'mastery_level',
      next_review: 'next_review',
      last_reviewed: 'last_reviewed',
      review_count: 'review_count',
    };
    
    for (const [key, column] of Object.entries(fieldMapping)) {
      if (key in item && item[key as keyof LearningItem] !== undefined) {
        let value = (item as any)[key];
        if (Array.isArray(value)) value = JSON.stringify(value);
        updates.push(`${column} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(item.id);
      const stmt = this.db.prepare(`
        UPDATE learning_items SET ${updates.join(', ')} WHERE id = ?
      `);
      stmt.run(...values);
    }
  }
  
  getDueItems(limit: number = 50): LearningItem[] {
    const today = new Date().toISOString().split('T')[0];
    const stmt = this.db.prepare(`
      SELECT * FROM learning_items
      WHERE next_review IS NULL OR next_review <= ?
      ORDER BY mastery_level ASC, last_reviewed ASC
      LIMIT ?
    `);
    
    const rows = stmt.all(today, limit) as any[];
    return rows.map(row => this.rowToLearningItem(row));
  }
  
  // ==================== 复习记录操作 ====================
  
  createReviewRecord(record: Partial<ReviewRecord>): ReviewRecord {
    const id = record.id || uuidv4();
    
    const insertStmt = this.db.prepare(`
      INSERT INTO review_records (
        id, learning_item_id, reviewed_at, review_type, user_feedback,
        comprehension_level, time_spent, algorithm_result, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      id,
      record.learning_item_id || '',
      record.reviewed_at || new Date().toISOString(),
      record.review_type || 'review',
      record.user_feedback || null,
      record.comprehension_level || 0,
      record.time_spent || 0,
      record.algorithm_result ? JSON.stringify(record.algorithm_result) : null,
      record.notes || null
    );
    
    return this.getReviewRecord(id)!;
  }
  
  getReviewRecord(id: string): ReviewRecord | null {
    const stmt = this.db.prepare('SELECT * FROM review_records WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.rowToReviewRecord(row) : null;
  }
  
  getReviewRecordsByItemId(itemId: string): ReviewRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM review_records
      WHERE learning_item_id = ?
      ORDER BY reviewed_at DESC
    `);
    
    const rows = stmt.all(itemId) as any[];
    return rows.map(row => this.rowToReviewRecord(row));
  }
  
  // ==================== 统计 ====================
  
  getStatistics(): any {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM learning_items');
    const totalItems = (countStmt.get() as any).count;
    
    const reviewStmt = this.db.prepare('SELECT COUNT(*) as count FROM review_records');
    const totalReviews = (reviewStmt.get() as any).count;
    
    const typeStmt = this.db.prepare(`
      SELECT type, COUNT(*) as count FROM learning_items GROUP BY type
    `);
    const itemsByType = typeStmt.all() as any[];
    
    const masteryStmt = this.db.prepare(`
      SELECT 
        AVG(mastery_level) as avg_mastery,
        COUNT(CASE WHEN mastery_level >= 90 THEN 1 END) as mastered,
        COUNT(CASE WHEN mastery_level >= 50 AND mastery_level < 90 THEN 1 END) as learning,
        COUNT(CASE WHEN mastery_level < 50 THEN 1 END) as struggling
      FROM learning_items
    `);
    const masteryStats = masteryStmt.get() as any;
    
    return {
      total_items: totalItems,
      total_reviews: totalReviews,
      items_by_type: Object.fromEntries(
        itemsByType.map(row => [row.type, row.count])
      ),
      mastery_stats: {
        avg_mastery: Math.round(masteryStats.avg_mastery || 0),
        mastered: masteryStats.mastered || 0,
        learning: masteryStats.learning || 0,
        struggling: masteryStats.struggling || 0,
      },
    };
  }
  
  // ==================== 辅助方法 ====================
  
  private rowToLearningItem(row: any): LearningItem {
    return {
      id: row.id,
      date: row.date,
      type: row.type,
      title: row.title,
      description: row.description,
      raw_content: row.raw_content,
      generated_markdown: row.generated_markdown,
      generated_at: row.generated_at,
      llm_provider: row.llm_provider,
      tags: JSON.parse(row.tags || '[]'),
      difficulty: row.difficulty,
      estimated_time: row.estimated_time,
      related_concepts: JSON.parse(row.related_concepts || '[]'),
      created_at: row.created_at,
      last_reviewed: row.last_reviewed,
      next_review: row.next_review,
      review_count: row.review_count,
      difficulty_self_assessment: row.difficulty_self_assessment,
      review_history: [],
      mastery_level: row.mastery_level,
      mastery_trend: row.mastery_trend,
    };
  }
  
  private rowToReviewRecord(row: any): ReviewRecord {
    return {
      id: row.id,
      learning_item_id: row.learning_item_id,
      reviewed_at: row.reviewed_at,
      review_type: row.review_type,
      user_feedback: row.user_feedback,
      comprehension_level: row.comprehension_level,
      time_spent: row.time_spent,
      algorithm_result: row.algorithm_result ? JSON.parse(row.algorithm_result) : undefined,
      notes: row.notes,
    };
  }
}

let dbManager: DatabaseManager | null = null;

export function getDatabaseManager(): DatabaseManager {
  if (!dbManager) throw new Error('Database manager not initialized');
  return dbManager;
}

export function setDatabaseManager(manager: DatabaseManager): void {
  dbManager = manager;
}
