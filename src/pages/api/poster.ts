import type { APIRoute } from "astro";
import clientPromise from "../../lib/mongodb";

export const prerender = false;

const DB_NAME = "lpmi_hut58";
const VALID_WARNA = ["#E5C158", "#5B7FA6", "#4C9A76", "#C77D8F", "#8E7CC3"];

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
  const warna = String(body.warna ?? "").trim();

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
    warna: VALID_WARNA.includes(warna) ? warna : VALID_WARNA[0],
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
