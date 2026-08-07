import type { APIRoute } from "astro";
import clientPromise from "../../lib/mongodb";

export const prerender = false;

const DB_NAME = "lpmi_hut58";

export const GET: APIRoute = async () => {
  const client = await clientPromise;
  const items = await client
    .db(DB_NAME)
    .collection("galeri")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const src = String(body.src ?? "").trim();
  const caption = String(body.caption ?? "").trim();

  if (!src || !caption) {
    return new Response(JSON.stringify({ error: "src and caption are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const doc = { src, caption, createdAt: new Date() };
  const client = await clientPromise;
  const result = await client.db(DB_NAME).collection("galeri").insertOne(doc);

  return new Response(JSON.stringify({ ...doc, _id: result.insertedId }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
