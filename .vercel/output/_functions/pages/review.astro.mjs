/* empty css                                     */
import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_y1XpGNYX.mjs';
import 'piccolore';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { $ as $$Layout } from '../chunks/Layout_D5_TW97D.mjs';
export { renderers } from '../renderers.mjs';

function ReviewCard({ item, onReview, loading = false }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(item.estimated_time);
  const getMasteryColor = (level) => {
    if (level < 30) return "text-red-600";
    if (level < 50) return "text-orange-600";
    if (level < 80) return "text-blue-600";
    return "text-green-600";
  };
  const getMasteryLabel = (level) => {
    if (level < 30) return "需要加强";
    if (level < 50) return "初步了解";
    if (level < 80) return "学习中";
    if (level < 90) return "基本掌握";
    return "完全掌握";
  };
  const getTypeEmoji = (type) => {
    const emojis = {
      vocabulary: "📚",
      grammar: "📖",
      story: "📖",
      knowledge: "🔬"
    };
    return emojis[type] || "📝";
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 mb-1", children: [
          getTypeEmoji(item.type),
          " ",
          item.type.toUpperCase()
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: item.title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxs("div", { className: `text-3xl font-bold ${getMasteryColor(item.mastery_level)}`, children: [
          item.mastery_level,
          "%"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600", children: "掌握度" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "p-6 max-h-96 overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "prose prose-sm max-w-none", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "text-gray-800 leading-relaxed",
        dangerouslySetInnerHTML: {
          __html: markdownToHtml(item.generated_markdown)
        }
      }
    ) }) }),
    !showFeedback ? /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-4 border-t border-gray-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-600", children: [
          "⏱️ 预计时间: ",
          item.estimated_time,
          " 分钟"
        ] }),
        /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold ${getMasteryColor(item.mastery_level)}`, children: getMasteryLabel(item.mastery_level) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowFeedback(true),
          className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors",
          children: "✏️ 记录学习反馈"
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-4 border-t border-gray-200 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm text-gray-700 font-semibold", children: "⏱️ 实际用时（分钟）:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: timeSpent,
            onChange: (e) => setTimeSpent(parseInt(e.target.value) || 0),
            min: "1",
            className: "w-20 px-2 py-1 border border-gray-300 rounded text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsx(
          FeedbackButton,
          {
            label: "😊 简单",
            emoji: "😊",
            onClick: () => {
              onReview(item.id, "easy");
              setShowFeedback(false);
            },
            loading,
            color: "bg-green-500 hover:bg-green-600"
          }
        ),
        /* @__PURE__ */ jsx(
          FeedbackButton,
          {
            label: "👍 不错",
            emoji: "👍",
            onClick: () => {
              onReview(item.id, "good");
              setShowFeedback(false);
            },
            loading,
            color: "bg-blue-500 hover:bg-blue-600"
          }
        ),
        /* @__PURE__ */ jsx(
          FeedbackButton,
          {
            label: "😅 困难",
            emoji: "😅",
            onClick: () => {
              onReview(item.id, "hard");
              setShowFeedback(false);
            },
            loading,
            color: "bg-red-500 hover:bg-red-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowFeedback(false),
          className: "w-full bg-gray-400 hover:bg-gray-500 text-white py-1 px-3 rounded text-sm transition-colors",
          children: "取消"
        }
      )
    ] })
  ] });
}
function FeedbackButton({
  label,
  emoji,
  onClick,
  loading,
  color
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      disabled: loading,
      className: `${color} disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm`,
      children: [
        emoji,
        /* @__PURE__ */ jsx("br", {}),
        label.split(" ")[1]
      ]
    }
  );
}
function markdownToHtml(markdown) {
  let html = markdown;
  html = html.replace(/^### (.*?)$/gm, '<h3 className="text-lg font-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 className="text-xl font-bold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 className="text-2xl font-bold mt-4 mb-2">$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/^- (.*?)$/gm, '<li className="ml-4">$1</li>');
  html = html.replace(/(<li[^>]*>.*?<\/li>)/s, '<ul className="list-disc">$1</ul>');
  html = html.replace(/```(.*?)```/s, '<pre className="bg-gray-100 p-3 rounded overflow-x-auto"><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code className="bg-gray-100 px-2 py-1 rounded">$1</code>');
  html = html.split("\n\n").map((p) => p.trim()).filter((p) => p).join('</p><p className="mb-3">');
  html = `<p className="mb-3">${html}</p>`;
  return html;
}

function ReviewPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  useEffect(() => {
    fetchRecommendations();
  }, []);
  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/recommend?limit=20");
      const data = await response.json();
      if (data.success) {
        setItems(data.data.recommended_items);
        if (data.data.recommended_items.length === 0) {
          setError("🎉 没有需要复习的项！");
        }
      } else {
        setError("加载失败");
      }
    } catch (err) {
      setError(`错误: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };
  const handleReview = async (itemId, feedback) => {
    setReviewLoading(true);
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learning_item_id: itemId,
          user_feedback: feedback,
          time_spent: 300
        })
      });
      const data = await response.json();
      if (data.success) {
        const newItems = items.filter((item) => item.id !== itemId);
        setItems(newItems);
        if (newItems.length === 0) {
          setError("🎉 今天的复习完成了！做得棒极了！");
        } else {
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      console.error("Review failed:", err);
    } finally {
      setReviewLoading(false);
    }
  };
  const currentItem = items[currentIndex];
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-16", children: "加载中..." });
  }
  if (error && items.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold mb-4", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: fetchRecommendations,
          className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg",
          children: "↻ 刷新"
        }
      )
    ] });
  }
  if (!currentItem) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-16", children: "未找到学习项" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "📖 复习学习项" }),
      /* @__PURE__ */ jsxs("div", { className: "text-lg font-semibold text-gray-600", children: [
        "第 ",
        /* @__PURE__ */ jsx("span", { className: "text-blue-600", children: currentIndex + 1 }),
        " / ",
        /* @__PURE__ */ jsx("span", { children: items.length })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "bg-blue-600 h-3 rounded-full transition-all duration-300",
        style: { width: `${(currentIndex + 1) / items.length * 100}%` }
      }
    ) }),
    /* @__PURE__ */ jsx(
      ReviewCard,
      {
        item: currentItem,
        onReview: handleReview,
        loading: reviewLoading
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCurrentIndex(Math.max(0, currentIndex - 1)),
          disabled: currentIndex === 0,
          className: "bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors",
          children: "← 上一个"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: fetchRecommendations,
          className: "bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors",
          children: "🔄 刷新列表"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCurrentIndex(Math.min(items.length - 1, currentIndex + 1)),
          disabled: currentIndex === items.length - 1,
          className: "bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors",
          children: "下一个 →"
        }
      )
    ] })
  ] });
}

const $$Review = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u590D\u4E60 - Child Learn System" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ReviewPage", ReviewPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/liangliang.sun/child-learn-system/src/components/ReviewPage", "client:component-export": "default" })} ` })}`;
}, "/Users/liangliang.sun/child-learn-system/src/pages/review.astro", void 0);

const $$file = "/Users/liangliang.sun/child-learn-system/src/pages/review.astro";
const $$url = "/review";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Review,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
