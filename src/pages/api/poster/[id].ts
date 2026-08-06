import type { APIRoute } from "astro";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";

export const prerender = false;

const DB_NAME = "lpmi_hut58";
const VALID_STATUSES = ["pending", "approved"];

export const PATCH: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  const status = String(body.status ?? "");
  if (!VALID_STATUSES.includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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
