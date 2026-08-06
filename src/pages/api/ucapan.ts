import type { APIRoute } from "astro";
import clientPromise from "../../lib/mongodb";

export const prerender = false;

const DB_NAME = "lpmi_hut58";

export const GET: APIRoute = async () => {
  const client = await clientPromise;
  const ucapan = await client
    .db(DB_NAME)
    .collection("ucapan")
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return new Response(JSON.stringify(ucapan), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const nama = String(body.nama ?? "").trim();
  const asal = String(body.asal ?? "").trim();
  const teks = String(body.teks ?? "").trim();

  if (!nama || !teks) {
    return new Response(JSON.stringify({ error: "nama and teks are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const doc = { nama, asal, teks, createdAt: new Date() };
  const client = await clientPromise;
  const result = await client.db(DB_NAME).collection("ucapan").insertOne(doc);

  return new Response(JSON.stringify({ ...doc, _id: result.insertedId }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
