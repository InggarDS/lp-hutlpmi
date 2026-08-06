import type { APIRoute } from "astro";
import clientPromise from "../../lib/mongodb";

export const prerender = false;

const DB_NAME = "lpmi_hut58";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const nama = String(body.nama ?? "").trim();
  const pesan = String(body.pesan ?? "").trim();
  const customFile = String(body.customFile ?? "").trim();
  const paket = String(body.paket ?? "").trim();
  const metodeBayar = String(body.metodeBayar ?? "").trim();

  if (!nama || !paket) {
    return new Response(JSON.stringify({ error: "nama and paket are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const doc = {
    nama,
    pesan: pesan || null,
    customFile: customFile || null,
    paket,
    metodeBayar,
    status: "pending",
    createdAt: new Date(),
  };

  const client = await clientPromise;
  const result = await client.db(DB_NAME).collection("poster").insertOne(doc);

  return new Response(JSON.stringify({ ...doc, _id: result.insertedId }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
