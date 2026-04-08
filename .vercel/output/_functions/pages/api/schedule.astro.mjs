import { promises } from 'fs';
import path from 'path';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const days = parseInt(url.searchParams.get("days") || "30");
    const baseDataDir = path.join(process.cwd(), "src", "data");
    const schedule = {};
    const today = /* @__PURE__ */ new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      schedule[dateStr] = [];
    }
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
            if (item.next_review) {
              if (schedule[item.next_review]) {
                schedule[item.next_review].push({
                  id: item.id,
                  title: item.title,
                  type: item.type,
                  mastery_level: item.mastery_level,
                  estimated_time: item.estimated_time,
                  difficulty: item.difficulty
                });
              }
            }
          }
        } catch {
        }
      }
    } catch {
    }
    const dailyStats = Object.entries(schedule).map(([date, items]) => ({
      date,
      item_count: items.length,
      estimated_time: items.reduce((sum, i) => sum + (i.estimated_time || 0), 0),
      avg_mastery: items.length > 0 ? Math.round(items.reduce((sum, i) => sum + (i.mastery_level || 0), 0) / items.length) : 0
    }));
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          schedule,
          daily_stats: dailyStats,
          total_days: days,
          total_items_scheduled: Object.values(schedule).reduce((sum, arr) => sum + arr.length, 0)
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Schedule error:", error);
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
