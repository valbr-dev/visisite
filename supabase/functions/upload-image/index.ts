// Supabase Edge Function: upload-image
// Required secret: GITHUB_TOKEN (fine-grained PAT restricted to valbr-dev/visisite,
// Repository permissions: Contents = Read and write).
// Required secret: ADMIN_EMAIL (email address of the one authorized admin account).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedKeys = new Set([
  "hero_image", "approach_image", "gallery_1", "gallery_2", "gallery_3",
  "case_image_1", "case_image_2", "case_image_3",
]);
const mimeToExtension: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const adminEmail = Deno.env.get("ADMIN_EMAIL")?.trim().toLowerCase();
    if (!supabaseUrl || !supabaseAnonKey || !githubToken || !adminEmail) {
      return json({ error: "Функция ещё не настроена: проверь секреты Supabase." }, 500);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return json({ error: "Требуется авторизация администратора." }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.email?.toLowerCase() !== adminEmail) {
      return json({ error: "Нет разрешения на загрузку фотографий для этой учётной записи." }, 403);
    }

    const payload = await req.json();
    const key = String(payload?.key || "");
    const contentType = String(payload?.contentType || "");
    const base64 = String(payload?.base64 || "");
    if (!allowedKeys.has(key)) return json({ error: "Неизвестное поле фотографии." }, 400);
    const extension = mimeToExtension[contentType];
    if (!extension) return json({ error: "Поддерживаются только JPG, PNG и WebP." }, 400);
    if (!base64 || base64.length > 5_600_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
      return json({ error: "Файл пустой или превышает лимит 4 МБ." }, 413);
    }

    const filename = key + "-" + Date.now() + "-" + crypto.randomUUID().slice(0, 8) + "." + extension;
    const path = "images/uploads/" + filename;
    const githubResponse = await fetch("https://api.github.com/repos/valbr-dev/visisite/contents/" + path, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + githubToken,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Upload image for " + key,
        content: base64,
      }),
    });
    const githubResult = await githubResponse.json().catch(() => ({}));
    if (!githubResponse.ok) {
      console.error("GitHub upload failed:", githubResponse.status, githubResult?.message);
      return json({ error: "GitHub не принял фотографию (HTTP " + githubResponse.status + "). Проверь GitHub-токен и право Contents: Read and write." }, 502);
    }

    return json({
      imageUrl: "https://valbr-dev.github.io/visisite/" + path + "?v=" + Date.now(),
      path,
    });
  } catch (error) {
    console.error("upload-image error:", error);
    return json({ error: "Внутренняя ошибка загрузки фотографии." }, 500);
  }
});
