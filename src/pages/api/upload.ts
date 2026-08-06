import type { APIRoute } from "astro";
import { put } from "@vercel/blob";

export const prerender = false;

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "file is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({ error: "Only JPG, PNG, or WEBP images are allowed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: "File must be under 5MB" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const blob = await put(`poster/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
    token: import.meta.env.BLOB_READ_WRITE_TOKEN,
  });

  return new Response(JSON.stringify({ url: blob.url }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
