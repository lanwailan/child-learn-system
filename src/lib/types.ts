// 核心类型定义

export type ContentType = 'vocabulary' | 'grammar' | 'story' | 'knowledge';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type UserFeedback = 'easy' | 'good' | 'hard';
export type ReviewType = 'initial' | 'practice' | 'review' | 'test';
export type MasteryTrend = 'improving' | 'stable' | 'declining';

// 学习项接口
export interface LearningItem {
  id: string;
  date: string;
  type: ContentType;
  title: string;
  description?: string;
  
  raw_content: string;
  raw_files?: string[];
  
  generated_markdown: string;
  generated_at: string;
  llm_provider: string;
  
  tags: string[];
  difficulty: Difficulty;
  estimated_time: number;
  related_concepts: string[];
  
  created_at: string;
  last_reviewed?: string;
  next_review?: string;
  review_count: number;
  difficulty_self_assessment: Difficulty;
  
  review_history: ReviewRecord[];
  mastery_level: number;
  mastery_trend?: MasteryTrend;
  
  obsidian_slug?: string;
  obsidian_exported_at?: string;
}

// 复习记录接口
export interface ReviewRecord {
  id: string;
  learning_item_id: string;
  reviewed_at: string;
  review_type: ReviewType;
  user_feedback?: UserFeedback;
  comprehension_level: number;
  time_spent: number;
  algorithm_result?: {
    next_interval_days: number;
    repetition_number: number;
    easiness_factor: number;
    next_review_date: string;
  };
  notes?: string;
}

// 用户进度接口
export interface UserProgress {
  date: string;
  total_items: number;
  items_by_type: {
    vocabulary: number;
    grammar: number;
    story: number;
    knowledge: number;
  };
  total_reviews: number;
  reviews_today: number;
  time_spent_today: number;
  mastery_stats: {
    avg_mastery: number;
    items_mastered: number;
    items_learning: number;
    items_struggling: number;
  };
  recommended_review_count: number;
  recommended_items: string[];
}

// 知识图谱边
export interface KnowledgeGraphEdge {
  id: string;
  source_item_id: string;
  target_item_id: string;
  relation_type: RelationType;
  weight: number;
  created_at: string;
  is_manual: boolean;
}

export type RelationType = 
  | 'synonym'
  | 'antonym'
  | 'related'
  | 'prerequisite'
  | 'extends'
  | 'example'
  | 'category'
  | 'custom';

// API 响应类型
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ReviewResult {
  success: boolean;
  learning_item_id: string;
  new_mastery_level: number;
  next_review_date: string;
  next_interval_days: number;
  review_record: ReviewRecord;
}

export interface RecommendedItems {
  total_recommended: number;
  recommended_items: LearningItem[];
  stats: {
    critical_count: number;
    important_count: number;
    optional_count: number;
  };
}
