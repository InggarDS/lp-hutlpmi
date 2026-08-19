import type { APIRoute } from "astro";
import { ObjectId } from "mongodb";
import { del } from "@vercel/blob";
import clientPromise from "../../../lib/mongodb";
import { deleteSupabaseFiles } from "../../../lib/supabaseServer";

export const prerender = false;

const DB_NAME = "lpmi_hut58";
const VALID_STATUSES = ["pending", "approved", "declined"];
const VALID_PAKET = ["silver", "gold", "platinum", "diamond"];

function parseId(id: string | undefined): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  const update: Record<string, string> = {};

  if (body.status !== undefined) {
    const status = String(body.status);
    if (!VALID_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    update.status = status;
  }

  if (body.paket !== undefined) {
    const paket = String(body.paket);
    if (!VALID_PAKET.includes(paket)) {
      return new Response(JSON.stringify({ error: "Invalid paket" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    update.paket = paket;
  }

  if (Object.keys(update).length === 0) {
    return new Response(JSON.stringify({ error: "Nothing to update" }), {
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
    .updateOne({ _id: objectId }, { $set: update });

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

  const fileUrls = [doc.customFile, doc.buktiTransfer].filter(
    (v): v is string => typeof v === "string" && v.startsWith("http")
  );
  const blobUrls = fileUrls.filter((v) => v.includes("blob.vercel-storage.com"));
  const supabaseUrls = fileUrls.filter((v) => v.includes("/storage/v1/object/public/"));

  if (blobUrls.length > 0) {
    await del(blobUrls, { token: import.meta.env.BLOB_READ_WRITE_TOKEN }).catch(() => {});
  }
  if (supabaseUrls.length > 0) {
    await deleteSupabaseFiles(supabaseUrls).catch(() => {});
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
