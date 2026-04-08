/* empty css                                     */
import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_y1XpGNYX.mjs';
import 'piccolore';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { $ as $$Layout } from '../chunks/Layout_D5_TW97D.mjs';
export { renderers } from '../renderers.mjs';

function UploadForm({ onSuccess }) {
  const [form, setForm] = useState({
    type: "vocabulary",
    title: "",
    raw_content: "",
    tags: "",
    difficulty: "medium",
    estimated_time: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "estimated_time" ? parseInt(value) : value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!form.title.trim() || !form.raw_content.trim()) {
        setError("请填写标题和内容");
        setLoading(false);
        return;
      }
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          raw_content: form.raw_content,
          tags: form.tags.split(",").map((t) => t.trim()).filter((t) => t),
          difficulty: form.difficulty,
          estimated_time: form.estimated_time
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("✅ 学习资料已上传！正在生成高质量内容...");
        await generateContent(data.data.item.id);
        setForm({
          type: "vocabulary",
          title: "",
          raw_content: "",
          tags: "",
          difficulty: "medium",
          estimated_time: 10
        });
        onSuccess?.();
      } else {
        setError(`❌ 上传失败: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ 错误: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };
  const generateContent = async (itemId) => {
    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learning_item_id: itemId,
          llm_provider: "deepseek"
        })
      });
      setSuccess((prev) => prev + "\n✅ 内容生成完成！");
    } catch (err) {
      console.error("Content generation failed:", err);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-6", children: "📝 上传学习资料" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "📚 学习类型" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            name: "type",
            value: form.type,
            onChange: handleChange,
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            children: [
              /* @__PURE__ */ jsx("option", { value: "vocabulary", children: "词汇学习" }),
              /* @__PURE__ */ jsx("option", { value: "grammar", children: "语法规则" }),
              /* @__PURE__ */ jsx("option", { value: "story", children: "故事阅读" }),
              /* @__PURE__ */ jsx("option", { value: "knowledge", children: "知识科普" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "📖 学习项标题" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "title",
            value: form.title,
            onChange: handleChange,
            placeholder: "例如：Animals - Dog",
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "✍️ 学习内容" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            name: "raw_content",
            value: form.raw_content,
            onChange: handleChange,
            placeholder: "粘贴或输入学习内容...",
            rows: 6,
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "🏷️ 标签（用逗号分隔）" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "tags",
            value: form.tags,
            onChange: handleChange,
            placeholder: "例如：animals, english, important",
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "⚡ 难度" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "difficulty",
              value: form.difficulty,
              onChange: handleChange,
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "easy", children: "简单" }),
                /* @__PURE__ */ jsx("option", { value: "medium", children: "中等" }),
                /* @__PURE__ */ jsx("option", { value: "hard", children: "困难" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "⏱️ 预计时间（分钟）" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              name: "estimated_time",
              value: form.estimated_time,
              onChange: handleChange,
              min: "1",
              max: "120",
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            }
          )
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border-l-4 border-red-500 p-4", children: /* @__PURE__ */ jsx("p", { className: "text-red-700", children: error }) }),
      success && /* @__PURE__ */ jsx("div", { className: "bg-green-50 border-l-4 border-green-500 p-4", children: /* @__PURE__ */ jsx("p", { className: "text-green-700 whitespace-pre-line", children: success }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors",
          children: loading ? "上传中..." : "📤 上传并生成"
        }
      )
    ] })
  ] });
}

const $$Upload = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u4E0A\u4F20 - Child Learn System" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "UploadForm", UploadForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/liangliang.sun/child-learn-system/src/components/UploadForm", "client:component-export": "default" })} ` })}`;
}, "/Users/liangliang.sun/child-learn-system/src/pages/upload.astro", void 0);

const $$file = "/Users/liangliang.sun/child-learn-system/src/pages/upload.astro";
const $$url = "/upload";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Upload,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
