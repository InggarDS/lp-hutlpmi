import { createClient } from "@supabase/supabase-js";
import { MAX_UPLOAD_SIZE } from "./image";

const SUPABASE_BUCKET = "hutlpmi";

let supabaseClient: ReturnType<typeof createClient> | null = null;
function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return supabaseClient;
}

export async function uploadToSupabase(path: string, file: File): Promise<{ url: string }> {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Ukuran file maksimal 3MB");
  }

  const res = await fetch("/api/upload-supabase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, contentType: file.type }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Gagal membuat URL unggah");
  }
  const { token, path: resolvedPath, publicUrl } = await res.json();

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .uploadToSignedUrl(resolvedPath, token, file);

  if (error) {
    throw new Error(error.message || "Gagal mengunggah file");
  }

  return { url: publicUrl };
}
