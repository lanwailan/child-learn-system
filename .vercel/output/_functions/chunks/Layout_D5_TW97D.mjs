import { e as createComponent, g as addAttribute, l as renderHead, n as renderSlot, r as renderTemplate, h as createAstro } from './astro/server_y1XpGNYX.mjs';
import 'piccolore';
import 'clsx';
/* empty css                             */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="zh-CN"> <head><meta charset="UTF-8"><meta name="description" content="Child Learn System - AI 智能学习管理系统"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body class="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"> <nav class="bg-white shadow-sm sticky top-0 z-50"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex justify-between items-center h-16"> <div class="flex items-center gap-2"> <span class="text-2xl">🎓</span> <a href="/" class="font-bold text-lg text-gray-900">Child Learn System</a> </div> <div class="flex gap-6"> <a href="/dashboard" class="text-gray-700 hover:text-blue-600 font-medium transition">📊 仪表板</a> <a href="/upload" class="text-gray-700 hover:text-blue-600 font-medium transition">📝 上传</a> <a href="/review" class="text-gray-700 hover:text-blue-600 font-medium transition">📖 复习</a> <a href="/api/health" class="text-gray-700 hover:text-blue-600 font-medium transition">⚡ 状态</a> </div> </div> </div> </nav> <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-180px)]"> ${renderSlot($$result, $$slots["default"])} </main> <footer class="bg-white border-t border-gray-200 mt-16"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex justify-between items-center"> <div> <p class="text-gray-600 text-sm">
© 2026 Child Learn System. All rights reserved.
</p> <p class="text-gray-500 text-xs mt-1">
Powered by Astro + React + Tailwind CSS
</p> </div> <div class="text-right text-sm text-gray-600"> <p>🌟 使用 AI 和间隔重复算法</p> <p>让学习更高效、更有趣</p> </div> </div> </div> </footer> </body></html>`;
}, "/Users/liangliang.sun/child-learn-system/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
