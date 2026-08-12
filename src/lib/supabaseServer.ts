import { createClient } from "@supabase/supabase-js";

export const SUPABASE_BUCKET = "hutlpmi";

export function getSupabaseServerClient() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;

export async function deleteSupabaseFiles(urls: string[]) {
  const paths = urls
    .map((url) => {
      const idx = url.indexOf(PUBLIC_URL_MARKER);
      return idx === -1 ? null : decodeURIComponent(url.slice(idx + PUBLIC_URL_MARKER.length));
    })
    .filter((p): p is string => !!p);

  if (paths.length === 0) return;

  const supabase = getSupabaseServerClient();
  await supabase.storage.from(SUPABASE_BUCKET).remove(paths);
}
