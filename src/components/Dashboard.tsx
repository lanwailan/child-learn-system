import React, { useState, useEffect } from 'react';

interface Stats {
  total_items: number;
  total_reviews: number;
  avg_mastery: number;
  mastered: number;
  learning: number;
  struggling: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-500">加载失败</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📊 学习仪表板</h1>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="学习项总数"
          value={stats.total_items}
          icon="📚"
          color="bg-blue-50"
        />
        <StatCard
          title="完成复习"
          value={stats.total_reviews}
          icon="✅"
          color="bg-green-50"
        />
        <StatCard
          title="平均掌握度"
          value={`${stats.avg_mastery}%`}
          icon="🎯"
          color="bg-purple-50"
        />
        <StatCard
          title="完全掌握"
          value={stats.mastered}
          icon="🏆"
          color="bg-yellow-50"
        />
      </div>

      {/* 掌握度分布 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">掌握度分布</h2>
        <div className="space-y-3">
          <ProgressBar
            label="完全掌握 (90-100%)"
            value={stats.mastered}
            max={stats.total_items}
            color="bg-green-500"
          />
          <ProgressBar
            label="学习中 (50-89%)"
            value={stats.learning}
            max={stats.total_items}
            color="bg-blue-500"
          />
          <ProgressBar
            label="需要加强 (0-49%)"
            value={stats.struggling}
            max={stats.total_items}
            color="bg-red-500"
          />
        </div>
      </div>

      {/* 学习建议 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-500">
        <h3 className="text-lg font-bold text-purple-900 mb-2">💡 学习建议</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>✓ 今天有 <span className="font-bold">{Math.ceil(stats.total_items * 0.3)}</span> 项需要复习</li>
          <li>✓ 重点关注 <span className="font-bold">{stats.struggling}</span> 项困难内容</li>
          <li>✓ 继续巩固 <span className="font-bold">{stats.learning}</span> 项学习中的内容</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-4 shadow-sm`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-600">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
