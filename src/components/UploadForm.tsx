import React, { useState } from 'react';

interface FormData {
  type: string;
  title: string;
  raw_content: string;
  tags: string;
  difficulty: string;
  estimated_time: number;
}

export default function UploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<FormData>({
    type: 'vocabulary',
    title: '',
    raw_content: '',
    tags: '',
    difficulty: 'medium',
    estimated_time: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'estimated_time' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 验证
      if (!form.title.trim() || !form.raw_content.trim()) {
        setError('请填写标题和内容');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          raw_content: form.raw_content,
          tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
          difficulty: form.difficulty,
          estimated_time: form.estimated_time,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ 学习资料已上传！正在生成高质量内容...');
        // 自动生成内容
        await generateContent(data.data.item.id);
        setForm({
          type: 'vocabulary',
          title: '',
          raw_content: '',
          tags: '',
          difficulty: 'medium',
          estimated_time: 10,
        });
        onSuccess?.();
      } else {
        setError(`❌ 上传失败: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ 错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (itemId: string) => {
    try {
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learning_item_id: itemId,
          llm_provider: 'deepseek',
        }),
      });
      setSuccess(prev => prev + '\n✅ 内容生成完成！');
    } catch (err) {
      console.error('Content generation failed:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📝 上传学习资料</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 类型选择 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📚 学习类型
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="vocabulary">词汇学习</option>
            <option value="grammar">语法规则</option>
            <option value="story">故事阅读</option>
            <option value="knowledge">知识科普</option>
          </select>
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📖 学习项标题
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="例如：Animals - Dog"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ✍️ 学习内容
          </label>
          <textarea
            name="raw_content"
            value={form.raw_content}
            onChange={handleChange}
            placeholder="粘贴或输入学习内容..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            required
          />
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🏷️ 标签（用逗号分隔）
          </label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="例如：animals, english, important"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 难度和时间 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⚡ 难度
            </label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ⏱️ 预计时间（分钟）
            </label>
            <input
              type="number"
              name="estimated_time"
              value={form.estimated_time}
              onChange={handleChange}
              min="1"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 错误消息 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 成功消息 */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-700 whitespace-pre-line">{success}</p>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? '上传中...' : '📤 上传并生成'}
        </button>
      </form>
    </div>
  );
}
