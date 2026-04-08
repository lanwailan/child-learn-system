import { v4 } from 'uuid';
import { promises } from 'fs';
import path from 'path';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.type || !data.title || !data.raw_content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: type, title, raw_content",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const learningItemId = v4();
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const dataDir = path.join(process.cwd(), "src", "data", today);
    await promises.mkdir(path.join(dataDir, "raw"), { recursive: true });
    await promises.mkdir(path.join(dataDir, "generated"), { recursive: true });
    const item = {
      id: learningItemId,
      date: today,
      type: data.type,
      title: data.title,
      description: data.description || "",
      raw_content: data.raw_content,
      raw_files: [],
      generated_markdown: "",
      generated_at: (/* @__PURE__ */ new Date()).toISOString(),
      llm_provider: "deepseek",
      tags: data.tags || [],
      difficulty: data.difficulty || "medium",
      estimated_time: data.estimated_time || 10,
      related_concepts: [],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      last_reviewed: void 0,
      next_review: void 0,
      review_count: 0,
      difficulty_self_assessment: data.difficulty || "medium",
      review_history: [],
      mastery_level: 0,
      mastery_trend: void 0
    };
    const itemPath = path.join(dataDir, "learning-items", `${learningItemId}.json`);
    await promises.mkdir(path.dirname(itemPath), { recursive: true });
    await promises.writeFile(itemPath, JSON.stringify(item, null, 2));
    const rawPath = path.join(dataDir, "raw", `${learningItemId}.txt`);
    await promises.writeFile(rawPath, data.raw_content);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: learningItemId,
          message: "Learning item created successfully",
          item
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upload error:", error);
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
const GET = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: { message: "Upload API documentation" },
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
