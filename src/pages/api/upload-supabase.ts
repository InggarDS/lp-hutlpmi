import type { APIRoute } from "astro";
import { getSupabaseServerClient, SUPABASE_BUCKET } from "../../lib/supabaseServer";

export const prerender = false;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const POST: APIRoute = async ({ request }) => {
  const { path, contentType } = await request.json();

  if (!path || typeof path !== "string") {
    return new Response(JSON.stringify({ error: "Missing path" }), { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(contentType)) {
    return new Response(JSON.stringify({ error: "Unsupported file type" }), { status: 400 });
  }

  const objectPath = `uploads/${path}`;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).createSignedUploadUrl(objectPath);

  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message || "Failed to create signed URL" }), { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath);

  return new Response(
    JSON.stringify({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
