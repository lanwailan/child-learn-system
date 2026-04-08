/* empty css                                     */
import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_y1XpGNYX.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { $ as $$Layout } from '../chunks/Layout_D5_TW97D.mjs';
export { renderers } from '../renderers.mjs';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStats();
  }, []);
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: "加载中..." });
  }
  if (!stats) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-red-500", children: "加载失败" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "📊 学习仪表板" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "学习项总数",
          value: stats.total_items,
          icon: "📚",
          color: "bg-blue-50"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "完成复习",
          value: stats.total_reviews,
          icon: "✅",
          color: "bg-green-50"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "平均掌握度",
          value: `${stats.avg_mastery}%`,
          icon: "🎯",
          color: "bg-purple-50"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "完全掌握",
          value: stats.mastered,
          icon: "🏆",
          color: "bg-yellow-50"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-4", children: "掌握度分布" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(
          ProgressBar,
          {
            label: "完全掌握 (90-100%)",
            value: stats.mastered,
            max: stats.total_items,
            color: "bg-green-500"
          }
        ),
        /* @__PURE__ */ jsx(
          ProgressBar,
          {
            label: "学习中 (50-89%)",
            value: stats.learning,
            max: stats.total_items,
            color: "bg-blue-500"
          }
        ),
        /* @__PURE__ */ jsx(
          ProgressBar,
          {
            label: "需要加强 (0-49%)",
            value: stats.struggling,
            max: stats.total_items,
            color: "bg-red-500"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-500", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-purple-900 mb-2", children: "💡 学习建议" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-sm text-purple-800 space-y-1", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "✓ 今天有 ",
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: Math.ceil(stats.total_items * 0.3) }),
          " 项需要复习"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "✓ 重点关注 ",
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: stats.struggling }),
          " 项困难内容"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "✓ 继续巩固 ",
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: stats.learning }),
          " 项学习中的内容"
        ] })
      ] })
    ] })
  ] });
}
function StatCard({ title, value, icon, color }) {
  return /* @__PURE__ */ jsxs("div", { className: `${color} rounded-lg p-4 shadow-sm`, children: [
    /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: icon }),
    /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: title }),
    /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-gray-900", children: value })
  ] });
}
function ProgressBar({ label, value, max, color }) {
  const percentage = max > 0 ? value / max * 100 : 0;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
      /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: label }),
      /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
        value,
        "/",
        max
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `${color} h-2 rounded-full transition-all duration-300`,
        style: { width: `${percentage}%` }
      }
    ) })
  ] });
}

const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u4EEA\u8868\u677F - Child Learn System" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Dashboard", Dashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/liangliang.sun/child-learn-system/src/components/Dashboard", "client:component-export": "default" })} ` })}`;
}, "/Users/liangliang.sun/child-learn-system/src/pages/dashboard.astro", void 0);

const $$file = "/Users/liangliang.sun/child-learn-system/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
