import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';

interface LearningItem {
  id: string;
  title: string;
  type: string;
  generated_markdown: string;
  mastery_level: number;
  estimated_time: number;
}

interface RecommendResponse {
  success: boolean;
  data: {
    total_recommended: number;
    recommended_items: LearningItem[];
    stats: {
      critical_count: number;
      important_count: number;
      optional_count: number;
    };
  };
}

export default function ReviewPage() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/recommend?limit=20');
      const data: RecommendResponse = await response.json();
      
      if (data.success) {
        setItems(data.data.recommended_items);
        if (data.data.recommended_items.length === 0) {
          setError('🎉 没有需要复习的项！');
        }
      } else {
        setError('加载失败');
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (itemId: string, feedback: string) => {
    setReviewLoading(true);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learning_item_id: itemId,
          user_feedback: feedback,
          time_spent: 300,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // 移动到下一项
        const newItems = items.filter(item => item.id !== itemId);
        setItems(newItems);
        if (newItems.length === 0) {
          setError('🎉 今天的复习完成了！做得棒极了！');
        } else {
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      console.error('Review failed:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const currentItem = items[currentIndex];

  if (loading) {
    return <div className="text-center py-16">加载中...</div>;
  }

  if (error && items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-2xl font-bold mb-4">{error}</div>
        <button
          onClick={fetchRecommendations}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          ↻ 刷新
        </button>
      </div>
    );
  }

  if (!currentItem) {
    return <div className="text-center py-16">未找到学习项</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">📖 复习学习项</h1>
        <div className="text-lg font-semibold text-gray-600">
          第 <span className="text-blue-600">{currentIndex + 1}</span> / <span>{items.length}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* 复习卡片 */}
      <ReviewCard
        item={currentItem}
        onReview={handleReview}
        loading={reviewLoading}
      />

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          ← 上一个
        </button>
        <button
          onClick={fetchRecommendations}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          🔄 刷新列表
        </button>
        <button
          onClick={() => setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))}
          disabled={currentIndex === items.length - 1}
          className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          下一个 →
        </button>
      </div>
    </div>
  );
}
