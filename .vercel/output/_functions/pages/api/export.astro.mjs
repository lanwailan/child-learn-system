import { promises } from 'fs';
import path from 'path';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const data = await request.json();
    const baseDataDir = path.join(process.cwd(), "src", "data");
    const tempDir = path.join(baseDataDir, ".temp-export");
    const obsidianDir = path.join(tempDir, "Child Learn System");
    await promises.mkdir(obsidianDir, { recursive: true });
    let exportedCount = 0;
    if (data.learning_item_ids && data.learning_item_ids.length > 0) {
      for (const id of data.learning_item_ids) {
        const item = await findLearningItem(id, baseDataDir);
        if (item && item.generated_markdown) {
          await exportItemToObsidian(item, obsidianDir);
          exportedCount++;
        }
      }
    } else {
      try {
        const dateDirs = await promises.readdir(baseDataDir);
        for (const dateDir of dateDirs) {
          if (dateDir === ".temp-export") continue;
          const itemsDir = path.join(baseDataDir, dateDir, "learning-items");
          try {
            const files = await promises.readdir(itemsDir);
            for (const file of files) {
              if (!file.endsWith(".json")) continue;
              const filePath = path.join(itemsDir, file);
              const content = await promises.readFile(filePath, "utf-8");
              const item = JSON.parse(content);
              if (item.generated_markdown) {
                await exportItemToObsidian(item, obsidianDir);
                exportedCount++;
              }
            }
          } catch {
          }
        }
      } catch {
      }
    }
    const readmePath = path.join(obsidianDir, "00-README.md");
    await promises.writeFile(readmePath, `# 🎓 Child Learn System - Learning Materials

Generated on: ${(/* @__PURE__ */ new Date()).toISOString()}

This is an Obsidian vault created from Child Learn System.

## 目录结构

- 📚 Vocabulary - 英文单词学习
- 📖 Grammar - 语法规则
- 📖 Story - 故事和文章
- 🔬 Knowledge - 知识科普

## 使用方式

1. 在 Obsidian 中打开此目录作为 Vault
2. 点击"Graph view"查看知识关联
3. 使用"Backlinks"查看相关内容
4. 使用"Command Palette"进行搜索

## 功能

- ✅ 双向链接支持
- ✅ 知识图谱
- ✅ 全文搜索
- ✅ 标签系统

祝学习愉快！ 🚀
`);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          exported_count: exportedCount,
          export_path: obsidianDir,
          format: "Obsidian Vault",
          message: `Successfully exported ${exportedCount} learning items`,
          note: 'To create a ZIP file, implement "adm-zip" or "archiver" package',
          obsidian_features: {
            backlinks: "✅ All items support backlinks",
            graph_view: "✅ Knowledge graph visualization ready",
            wikilinks: "✅ [[...]] format for cross-references",
            tags: "✅ Tag system enabled"
          }
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Export error:", error);
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
async function findLearningItem(id, baseDataDir) {
  try {
    const dateDirs = await promises.readdir(baseDataDir);
    for (const dateDir of dateDirs) {
      const fullPath = path.join(baseDataDir, dateDir, "learning-items", `${id}.json`);
      try {
        const content = await promises.readFile(fullPath, "utf-8");
        return JSON.parse(content);
      } catch {
      }
    }
  } catch {
  }
  return null;
}
async function exportItemToObsidian(item, obsidianDir) {
  const typeDir = {
    vocabulary: "📚-Vocabulary",
    grammar: "📖-Grammar",
    story: "📖-Story",
    knowledge: "🔬-Knowledge"
  }[item.type] || "Other";
  const targetDir = path.join(obsidianDir, typeDir);
  await promises.mkdir(targetDir, { recursive: true });
  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  path.join(targetDir, `${slug}.md`);
  const finalPath = path.join(targetDir, `${item.id.slice(0, 8)}-${slug}.md`);
  await promises.writeFile(finalPath, item.generated_markdown);
}
const GET = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: { message: "Export API - POST to export items as Obsidian vault" },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
