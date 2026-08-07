import type { APIRoute } from "astro";
import { ObjectId } from "mongodb";
import { del } from "@vercel/blob";
import clientPromise from "../../../lib/mongodb";

export const prerender = false;

const DB_NAME = "lpmi_hut58";

export const DELETE: APIRoute = async ({ params }) => {
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(params.id);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = await clientPromise;
  const collection = client.db(DB_NAME).collection("galeri");
  const doc = await collection.findOne({ _id: objectId });

  if (!doc) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  await collection.deleteOne({ _id: objectId });

  if (typeof doc.src === "string" && doc.src.startsWith("http")) {
    await del(doc.src, { token: import.meta.env.BLOB_READ_WRITE_TOKEN }).catch(() => {});
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
