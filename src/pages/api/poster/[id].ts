import type { APIRoute } from "astro";
import { ObjectId } from "mongodb";
import { del } from "@vercel/blob";
import clientPromise from "../../../lib/mongodb";

export const prerender = false;

const DB_NAME = "lpmi_hut58";
const VALID_STATUSES = ["pending", "approved", "declined"];

function parseId(id: string | undefined): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  const status = String(body.status ?? "");
  if (!VALID_STATUSES.includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const objectId = parseId(params.id);
  if (!objectId) {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = await clientPromise;
  const result = await client
    .db(DB_NAME)
    .collection("poster")
    .updateOne({ _id: objectId }, { $set: { status } });

  if (result.matchedCount === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const objectId = parseId(params.id);
  if (!objectId) {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = await clientPromise;
  const collection = client.db(DB_NAME).collection("poster");
  const doc = await collection.findOne({ _id: objectId });

  if (!doc) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  await collection.deleteOne({ _id: objectId });

  const blobUrls = [doc.customFile, doc.buktiTransfer].filter(
    (v): v is string => typeof v === "string" && v.startsWith("http")
  );
  if (blobUrls.length > 0) {
    await del(blobUrls, { token: import.meta.env.BLOB_READ_WRITE_TOKEN }).catch(() => {});
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
