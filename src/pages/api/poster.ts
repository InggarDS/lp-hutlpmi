import type { APIRoute } from "astro";
import clientPromise from "../../lib/mongodb";

export const prerender = false;

const DB_NAME = "lpmi_hut58";

export const GET: APIRoute = async ({ url }) => {
  const status = url.searchParams.get("status");
  const filter = status ? { status } : {};

  const client = await clientPromise;
  const posters = await client
    .db(DB_NAME)
    .collection("poster")
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return new Response(JSON.stringify(posters), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const nama = String(body.nama ?? "").trim();
  const pesan = String(body.pesan ?? "").trim();
  const customFile = String(body.customFile ?? "").trim();
  const paket = String(body.paket ?? "").trim();
  const metodeBayar = String(body.metodeBayar ?? "").trim();
  const buktiTransfer = String(body.buktiTransfer ?? "").trim();

  if (!nama || !paket || !buktiTransfer) {
    return new Response(JSON.stringify({ error: "nama, paket, and buktiTransfer are required" }), {
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
    buktiTransfer,
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
