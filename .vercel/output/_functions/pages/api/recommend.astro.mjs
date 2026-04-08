import { promises } from 'fs';
import path from 'path';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const baseDataDir = path.join(process.cwd(), "src", "data");
    const dueItems = [];
    try {
      const dateDirs = await promises.readdir(baseDataDir);
      for (const dateDir of dateDirs) {
        const itemsDir = path.join(baseDataDir, dateDir, "learning-items");
        try {
          const files = await promises.readdir(itemsDir);
          for (const file of files) {
            if (!file.endsWith(".json")) continue;
            const filePath = path.join(itemsDir, file);
            const content = await promises.readFile(filePath, "utf-8");
            const item = JSON.parse(content);
            if (!item.next_review || item.next_review <= today) {
              let priority = "optional";
              if (item.mastery_level < 50) {
                priority = "critical";
              } else if (item.mastery_level < 80) {
                priority = "important";
              }
              dueItems.push({ ...item, priority });
            }
          }
        } catch {
        }
      }
    } catch {
    }
    const priorityOrder = { critical: 0, important: 1, optional: 2 };
    dueItems.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return (a.mastery_level || 0) - (b.mastery_level || 0);
    });
    const dailyBudget = limit;
    const criticalRatio = 0.5;
    const importantRatio = 0.3;
    const optionalRatio = 0.2;
    const critical = dueItems.filter((i) => i.priority === "critical");
    const important = dueItems.filter((i) => i.priority === "important");
    const optional = dueItems.filter((i) => i.priority === "optional");
    const recommended = [
      ...critical.slice(0, Math.ceil(dailyBudget * criticalRatio)),
      ...important.slice(0, Math.ceil(dailyBudget * importantRatio)),
      ...optional.slice(0, Math.ceil(dailyBudget * optionalRatio))
    ].slice(0, dailyBudget);
    const cleanRecommended = recommended.map(({ priority, ...item }) => item);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_recommended: cleanRecommended.length,
          recommended_items: cleanRecommended,
          stats: {
            critical_count: critical.length,
            important_count: important.length,
            optional_count: optional.length
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Recommend error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
