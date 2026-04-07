import React, { useState } from 'react';

interface LearningItem {
  id: string;
  title: string;
  type: string;
  generated_markdown: string;
  mastery_level: number;
  estimated_time: number;
}

interface ReviewCardProps {
  item: LearningItem;
  onReview: (itemId: string, feedback: string) => void;
  loading?: boolean;
}

export default function ReviewCard({ item, onReview, loading = false }: ReviewCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(item.estimated_time);

  const getMasteryColor = (level: number) => {
    if (level < 30) return 'text-red-600';
    if (level < 50) return 'text-orange-600';
    if (level < 80) return 'text-blue-600';
    return 'text-green-600';
  };

  const getMasteryLabel = (level: number) => {
    if (level < 30) return '需要加强';
    if (level < 50) return '初步了解';
    if (level < 80) return '学习中';
    if (level < 90) return '基本掌握';
    return '完全掌握';
  };

  const getTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      vocabulary: '📚',
      grammar: '📖',
      story: '📖',
      knowledge: '🔬',
    };
    return emojis[type] || '📝';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-600 mb-1">
              {getTypeEmoji(item.type)} {item.type.toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getMasteryColor(item.mastery_level)}`}>
              {item.mastery_level}%
            </div>
            <div className="text-xs text-gray-600">掌握度</div>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <div
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(item.generated_markdown),
            }}
          />
        </div>
      </div>

      {/* 底部 - 反馈选项 */}
      {!showFeedback ? (
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              ⏱️ 预计时间: {item.estimated_time} 分钟
            </span>
            <span className={`text-sm font-semibold ${getMasteryColor(item.mastery_level)}`}>
              {getMasteryLabel(item.mastery_level)}
            </span>
          </div>
          <button
            onClick={() => setShowFeedback(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            ✏️ 记录学习反馈
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm text-gray-700 font-semibold">⏱️ 实际用时（分钟）:</label>
            <input
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
              min="1"
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <FeedbackButton
              label="😊 简单"
              emoji="😊"
              onClick={() => {
                onReview(item.id, 'easy');
                setShowFeedback(false);
              }}
              loading={loading}
              color="bg-green-500 hover:bg-green-600"
            />
            <FeedbackButton
              label="👍 不错"
              emoji="👍"
              onClick={() => {
                onReview(item.id, 'good');
                setShowFeedback(false);
              }}
              loading={loading}
              color="bg-blue-500 hover:bg-blue-600"
            />
            <FeedbackButton
              label="😅 困难"
              emoji="😅"
              onClick={() => {
                onReview(item.id, 'hard');
                setShowFeedback(false);
              }}
              loading={loading}
              color="bg-red-500 hover:bg-red-600"
            />
          </div>
          <button
            onClick={() => setShowFeedback(false)}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white py-1 px-3 rounded text-sm transition-colors"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}

function FeedbackButton({
  label,
  emoji,
  onClick,
  loading,
  color,
}: {
  label: string;
  emoji: string;
  onClick: () => void;
  loading: boolean;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${color} disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm`}
    >
      {emoji}
      <br />
      {label.split(' ')[1]}
    </button>
  );
}

function markdownToHtml(markdown: string): string {
  let html = markdown;

  // 标题
  html = html.replace(/^### (.*?)$/gm, '<h3 className="text-lg font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 className="text-xl font-bold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 className="text-2xl font-bold mt-4 mb-2">$1</h1>');

  // 加粗
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 列表
  html = html.replace(/^- (.*?)$/gm, '<li className="ml-4">$1</li>');
  html = html.replace(/(<li[^>]*>.*?<\/li>)/s, '<ul className="list-disc">$1</ul>');

  // 代码块
  html = html.replace(/```(.*?)```/s, '<pre className="bg-gray-100 p-3 rounded overflow-x-auto"><code>$1</code></pre>');

  // 行内代码
  html = html.replace(/`(.*?)`/g, '<code className="bg-gray-100 px-2 py-1 rounded">$1</code>');

  // 段落
  html = html.split('\n\n').map(p => p.trim()).filter(p => p).join('</p><p className="mb-3">');
  html = `<p className="mb-3">${html}</p>`;

  return html;
}
